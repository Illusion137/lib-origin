import type { CookieJar } from '@common/utils/cookie_util';
import type { BaseOpts } from '@common/types';
import { Innertube, Platform, UniversalCache, type Types } from 'youtubei.js';
import { generror } from '@common/utils/error_util';
import { fs } from '@native/fs/fs';
import path from 'path';
import 'dotenv/config';
import rozfetch from '@common/rozfetch';

Platform.shim.eval = async (data: Types.BuildScriptResult, env: Record<string, Types.VMPrimative>) => {
    const properties: string[] = [];

    if (env.n) {
        properties.push(`n: exportedVars.nFunction("${env.n}")`)
    }

    if (env.sig) {
        properties.push(`sig: exportedVars.sigFunction("${env.sig}")`)
    }

    const code = `${data.output}\nreturn { ${properties.join(', ')} }`;

    // eslint-disable-next-line @typescript-eslint/no-implied-eval, @typescript-eslint/no-unsafe-return
    return new Function(code)() as typeof Platform.shim.eval;
}

export namespace RozeYouTube {
    export interface TranscriptInfo {
        url: string;
        language_code: string;
        name: string;
        kind: "asr" | "frc" | undefined;
    };

    let youtube_client_instance: Innertube;
    async function get_youtube_client(cookie_jar?: CookieJar) {
        if (youtube_client_instance) return youtube_client_instance;
        youtube_client_instance = await Innertube.create({ cookie: cookie_jar?.toString() ?? process.env.YOUTUBE_COOKIE_JAR, cache: new UniversalCache(true) });
        return youtube_client_instance;
    }

    export async function upload_audiobook_headless(opts: {
        cookie_jar?: CookieJar;
        media_path: string;
        thumbnail_path?: string;
        str_transcription?: string;
        chapter_timestamps?: string;
    }) {
        const youtube_client = await get_youtube_client();

        const media_buffer = await fs().read_as_string(opts.media_path, { encoding: "base64" });
        if (typeof media_buffer === "object") return media_buffer;
        const upload_response = await youtube_client.studio.upload(media_buffer, {
            title: path.basename(opts.media_path),
            description: opts.chapter_timestamps,
            privacy: "UNLISTED",
        });
        if (!upload_response.success) return generror("Uploading audiobook not successful", "CRITICAL", opts);
        return { "status": "GOOD" } as const;
        // await youtube_client.studio.updateVideoMetadata("", {
        //     "thumbnail": ""
        // });
    }

    export async function get_user_channel_id(index?: number) {
        const youtube_client = await get_youtube_client();
        const account_info = await youtube_client.account.getInfo(true);
        const account = account_info[index ?? 0];
        if (account === undefined) return generror("No accounts found", "LOW");
        const resolved = await youtube_client.resolveURL(`https://www.youtube.com/${account.channel_handle.text}`);
        const channel_id = resolved.payload.browseId as string;
        return channel_id;
    }

    export async function upload_transcript() {
        return;
    }

    export async function get_all_transcript_infos(video_id: string) {
        const youtube_client = await get_youtube_client();
        const info = await youtube_client.getInfo(video_id);
        if (info.captions?.caption_tracks === undefined) return generror("Couldn't retrieve transcripts for video", "MEDIUM", { video_id });
        const transcript_infos = info.captions?.caption_tracks.map<TranscriptInfo>(caption_track => ({ kind: caption_track.kind, language_code: caption_track.language_code, name: caption_track.name.text ?? "", url: caption_track.base_url }))
        return transcript_infos;
    }

    export async function get_transcript(transcript_info: TranscriptInfo, opts: BaseOpts) {
        const transcript_response = await rozfetch(transcript_info.url + "&fmt=vtt", {
            ...opts.fetch_opts, headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
                "Accept": "text/xml"
            }
        });
        if ("error" in transcript_response) return transcript_response;
        const xml = await transcript_response.text();
        console.log("XML", xml);
        return [...xml.matchAll(/<text[^>]*>(.*?)<\/text>/g)]
            .map(m => m[1].replace(/&#39;/g, "'")
                .replace(/&quot;/g, '"')
                .replace(/&amp;/g, '&')
            ).join(" ");
    };
};