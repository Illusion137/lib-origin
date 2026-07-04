import { YouTubeDL } from "@origin/youtube_dl";
import { SabrStream } from "googlevideo/sabr-stream";
import { EnabledTrackTypes } from 'googlevideo/utils';
import { EventEmitter } from "events";
import express from "express";
import { catch_log } from "@common/utils/error_util";

const app = express();
app.use(express.json());
const port = 3001;

// SABR is a session-based, sequential streaming protocol - it has no concept of byte-range
// seeking. To support HTTP Range requests (and therefore seeking) from the web, each track is
// streamed once into a growing in-memory buffer shared across requests; a request for a range
// that hasn't downloaded yet just waits for the ongoing SABR download to reach it.
interface TrackBuffer {
    chunks: Buffer[];
    downloaded_length: number;
    total_size?: number;
    mime_type: string;
    ready: boolean;
    done: boolean;
    error?: Error;
    emitter: EventEmitter;
}

const tracks = new Map<string, TrackBuffer>();

function get_or_start_track(video_id: string): TrackBuffer {
    const existing = tracks.get(video_id);
    if (existing) return existing;

    const track: TrackBuffer = {
        chunks: [],
        downloaded_length: 0,
        mime_type: 'audio/webm',
        ready: false,
        done: false,
        emitter: new EventEmitter(),
    };
    tracks.set(video_id, track);

    (async () => {
        try {
            // IMPORTANT: tryna use MUSIC client here will break PoToken generation
            await YouTubeDL.get_innertube_client();
            const sabr_info = await YouTubeDL.resolve_sabr_info(video_id);
            if ("error" in sabr_info) throw new Error(sabr_info.error.message);

            const sabr_stream = new SabrStream({
                serverAbrStreamingUrl: sabr_info.sabrServerUrl,
                videoPlaybackUstreamerConfig: sabr_info.sabrUstreamerConfig,
                formats: sabr_info.sabrFormats,
                poToken: sabr_info.placeholder_po_token ?? sabr_info.poToken,
                clientInfo: sabr_info.clientInfo,
            });

            let real_token_applied = false;
            sabr_stream.on('streamProtectionStatusUpdate', async (status: any) => {
                if (status.status === 2) {
                    if (!real_token_applied) {
                        real_token_applied = true;
                        if (sabr_info.poToken) sabr_stream.setPoToken(sabr_info.poToken);
                    } else if (sabr_info.on_refresh_po_token) {
                        try {
                            const refreshed = await sabr_info.on_refresh_po_token("expired");
                            sabr_stream.setPoToken(refreshed);
                        } catch (e) { console.error('[SABR] Failed to refresh poToken:', e); }
                    }
                }
            });

            sabr_stream.on('reloadPlayerResponse', async (ctx: any) => {
                if (!sabr_info.on_reload_player_response) return;
                try {
                    const updated = await sabr_info.on_reload_player_response(ctx);
                    if (updated) {
                        sabr_stream.setStreamingURL(updated.sabrServerUrl);
                        sabr_stream.setUstreamerConfig(updated.sabrUstreamerConfig);
                    }
                } catch (e) { console.error('[SABR] Failed to reload player response:', e); }
            });

            sabr_stream.on('abort', (e: any) => console.error('[SABR] error:', e));

            const { audioStream: audio_stream, selectedFormats: selected_formats } = await sabr_stream.start({
                enabledTrackTypes: EnabledTrackTypes.AUDIO_ONLY,
                preferOpus: true,
            });

            const audio_format = selected_formats.audioFormat;
            track.mime_type = audio_format?.mimeType?.split(';')[0] ?? 'audio/webm';
            if (audio_format?.contentLength) track.total_size = audio_format.contentLength;
            track.ready = true;
            track.emitter.emit('ready');

            const reader = audio_stream.getReader();
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                track.chunks.push(Buffer.from(value));
                track.downloaded_length += value.byteLength;
                track.emitter.emit('data');
            }

            track.done = true;
            if (track.total_size === undefined) track.total_size = track.downloaded_length;
            track.emitter.emit('end');
        } catch (e) {
            track.error = e instanceof Error ? e : new Error(String(e));
            track.ready = true;
            track.done = true;
            tracks.delete(video_id);
            track.emitter.emit('error', track.error);
        }
    })().catch(catch_log);

    return track;
}

async function wait_for_track_ready(track: TrackBuffer): Promise<void> {
    if (track.ready) {
        if (track.error) return Promise.reject(track.error);
        return Promise.resolve();
    }
    return new Promise<void>((resolve, reject) => {
        const on_ready = () => { cleanup(); track.error ? reject(track.error) : resolve(); };
        const on_error = (e: Error) => { cleanup(); reject(e); };
        function cleanup() {
            track.emitter.off('ready', on_ready);
            track.emitter.off('error', on_error);
        }
        track.emitter.once('ready', on_ready);
        track.emitter.once('error', on_error);
    });
}

async function wait_for_total_size(track: TrackBuffer): Promise<number> {
    if (track.total_size !== undefined) return Promise.resolve(track.total_size);
    if (track.done) return Promise.resolve(track.downloaded_length);
    return new Promise<number>((resolve, reject) => {
        const on_progress = () => {
            if (track.total_size !== undefined) { cleanup(); resolve(track.total_size); }
            else if (track.done) { cleanup(); resolve(track.downloaded_length); }
        };
        const on_error = (e: Error) => { cleanup(); reject(e); };
        function cleanup() {
            track.emitter.off('ready', on_progress);
            track.emitter.off('end', on_progress);
            track.emitter.off('error', on_error);
        }
        track.emitter.on('ready', on_progress);
        track.emitter.on('end', on_progress);
        track.emitter.on('error', on_error);
    });
}

function read_buffered_slice(track: TrackBuffer, start: number, end: number): Buffer {
    const parts: Buffer[] = [];
    let pos = 0;
    for (const chunk of track.chunks) {
        const chunk_start = pos;
        const chunk_end = pos + chunk.length;
        pos = chunk_end;
        if (chunk_end <= start) continue;
        if (chunk_start > end) break;
        parts.push(chunk.subarray(Math.max(start, chunk_start) - chunk_start, Math.min(end + 1, chunk_end) - chunk_start));
    }
    return parts.length === 1 ? parts[0] : Buffer.concat(parts);
}

function serve_range(track: TrackBuffer, start: number, end: number, req: express.Request, res: express.Response) {
    let cursor = start;
    let closed = false;

    const cleanup = () => {
        track.emitter.off('data', pump);
        track.emitter.off('end', pump);
        track.emitter.off('error', on_error);
    };

    function on_error(e: Error) {
        cleanup();
        if (!closed) res.destroy(e);
    }

    function pump() {
        if (closed) return;
        while (cursor <= end) {
            if (cursor >= track.downloaded_length) {
                if (track.done) break;
                return; // wait for more 'data'
            }
            const available_end = Math.min(end, track.downloaded_length - 1);
            const slice = read_buffered_slice(track, cursor, available_end);
            cursor = available_end + 1;
            if (!res.write(slice)) return; // resume on 'drain'
        }
        cleanup();
        res.end();
    }

    req.on('close', () => { closed = true; cleanup(); });
    res.on('drain', pump);
    track.emitter.on('data', pump);
    track.emitter.on('end', pump);
    track.emitter.on('error', on_error);
    pump();
}

// wf4kRfGzflo
app.get('/stream/:id', async (req, res) => {
    const video_id = req.params.id;
    const track = get_or_start_track(video_id);

    try {
        await wait_for_track_ready(track);
    } catch (e: any) {
        res.status(500).json({ error: e?.message ?? String(e) });
        return;
    }

    res.setHeader('Content-Type', track.mime_type);
    res.setHeader('Accept-Ranges', 'bytes');

    const range = req.headers.range;
    if (!range) {
        if (track.total_size !== undefined) res.setHeader('Content-Length', track.total_size);
        const end = track.total_size !== undefined ? track.total_size - 1 : Infinity;
        serve_range(track, 0, end, req, res);
        return;
    }

    const match = /^bytes=(\d*)-(\d*)$/.exec(range);
    if (!match || (match[1] === '' && match[2] === '')) {
        res.status(416).setHeader('Content-Range', 'bytes */*').end();
        return;
    }

    let total_size: number;
    try {
        total_size = await wait_for_total_size(track);
    } catch (e: any) {
        res.status(500).json({ error: e?.message ?? String(e) });
        return;
    }

    let start: number;
    let end: number;
    if (match[1] === '') {
        // suffix range, e.g. "bytes=-500" -> last 500 bytes
        const suffix_length = parseInt(match[2], 10);
        start = Math.max(total_size - suffix_length, 0);
        end = total_size - 1;
    } else {
        start = parseInt(match[1], 10);
        end = match[2] === '' ? total_size - 1 : Math.min(parseInt(match[2], 10), total_size - 1);
    }

    if (Number.isNaN(start) || Number.isNaN(end) || start > end || start >= total_size) {
        res.status(416).setHeader('Content-Range', `bytes */${total_size}`).end();
        return;
    }

    res.status(206);
    res.setHeader('Content-Range', `bytes ${start}-${end}/${total_size}`);
    res.setHeader('Content-Length', end - start + 1);
    serve_range(track, start, end, req, res);
});

app.listen(port, () => {
    console.log(`YouTube music stream server listening on port ${port}`);
});
