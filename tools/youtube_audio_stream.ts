import { YouTubeDL } from "@origin/youtube_dl";
import { SabrStream } from "googlevideo/sabr-stream";
import { EnabledTrackTypes } from 'googlevideo/utils';
import { Readable } from "stream";
import express from "express";

const app = express();
app.use(express.json());
const port = 3001;

// wf4kRfGzflo
app.get('/stream/:id', async (req, res) => {
    const video_id = req.params.id;
    // IMPORTANT: tryna use MUSIC client here will break PoToken generation
    await YouTubeDL.get_innertube_client();
    const sabr_info = await YouTubeDL.resolve_sabr_info(video_id);
    if ("error" in sabr_info) {
        res.status(500).json({error: sabr_info.error.message});
        return;
    }

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
    res.setHeader('Content-Type', audio_format?.mimeType?.split(';')[0] ?? 'audio/webm');
    if (audio_format?.contentLength) res.setHeader('Content-Length', audio_format.contentLength);

    const node_stream = Readable.fromWeb(audio_stream as any);
    node_stream.pipe(res);
    req.on('close', () => node_stream.destroy());
});

app.listen(port, () => {
    console.log(`YouTube music stream server listening on port ${port}`);
});
