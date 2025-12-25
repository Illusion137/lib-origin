import { Innertube, Platform,type Types } from 'youtubei.js';
import type { CookieJar } from '@common/utils/cookie_util';
import _ from 'dotenv/config';
import { fs } from '@native/fs/fs';
import path from 'path';
import { generror } from '@common/utils/error_util';

Platform.shim.eval = async (data: Types.BuildScriptResult, env: Record<string, Types.VMPrimative>) => {
  const properties: string[] = [];

  if(env.n) {
    properties.push(`n: exportedVars.nFunction("${env.n}")`)
  }

  if (env.sig) {
    properties.push(`sig: exportedVars.sigFunction("${env.sig}")`)
  }

  const code = `${data.output}\nreturn { ${properties.join(', ')} }`;

  // eslint-disable-next-line @typescript-eslint/no-implied-eval
  return new Function(code)();
}

export namespace RozeYouTubeUploader {
    let youtube_client_instance: Innertube;
    async function get_youtube_client(cookie_jar?: CookieJar){
        if(youtube_client_instance) return youtube_client_instance;
        youtube_client_instance = await Innertube.create({cookie: cookie_jar?.toString() ?? process.env.YOUTUBE_COOKIE_JAR});
        return youtube_client_instance;
    }

    export async function upload_audiobook_headless(opts: {
        cookie_jar?: CookieJar;
        media_path: string;
        thumbnail_path: string;
        str_transcription?: string;
        chapter_timestamps?: string;
    }){
        const youtube_client = await get_youtube_client();
        
        const media_buffer = await fs().read_as_string(opts.media_path, {encoding: "base64"});
        if(typeof media_buffer === "object") return media_buffer;
        const upload_response = await youtube_client.studio.upload(media_buffer, {
            title: path.basename(opts.media_path),
            description: opts.chapter_timestamps,
            privacy: "UNLISTED",
        });
        if(!upload_response.success) return generror("Uploading audiobook not successful", opts);
        return {"status": "GOOD"} as const;
        // await youtube_client.studio.updateVideoMetadata("", {
            // "thumbnail": ""
        // })
    }
};