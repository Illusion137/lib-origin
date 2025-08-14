import { green } from 'colors';
import fs from 'fs';
import path from 'path';
import getAudioDurationInSeconds from "get-audio-duration";
import { extract_file_extension } from '@common/utils/util';
import { TimeLog } from '@common/time_log';

async function __illusicord_build__(){
    const build_ts_path = process.argv[1];
    const media_folder_path = path.join(build_ts_path, "../../media/");
    const all_media_files = fs.readdirSync(media_folder_path, {withFileTypes: true});

    const promised_tracks_data: (() => Promise<{title: string; media_uri: string; duration: number;}>)[] = [];
    for(const media_file of all_media_files){
        if(!([".wav", ".mp3", ".m4a"].includes(extract_file_extension(media_file.name))) ) continue;
        const formated_path = path.join(media_file.parentPath, media_file.name);
        promised_tracks_data.push(async() => ({
            title: media_file.name,
            media_uri: formated_path,
            duration: Math.round(await getAudioDurationInSeconds(formated_path)),
        }));
    }
    const tracks_data = await Promise.all(promised_tracks_data.map(async(t) => t()));

    const media_ts_path = path.join(build_ts_path, "../../src/media.ts");
    const gen_data =
`import { Utils } from './player/utils'
import type { DiscordTrack } from './types'
function make_media(data: {title: string; media_uri: string; duration: number;}): DiscordTrack{
    return Utils.track_to_discord_track({
        uid: data.title,
        title: data.title,
        artists: [{name: "Sudo", uri: null}],
        duration: data.duration ?? 0,
        media_uri: data.media_uri,
        imported_id: "discord-imported-media"
    });
}

export const MEDIA = [
${tracks_data.map(track => `\tmake_media(${JSON.stringify(track)})`).join(',\n')}
];`;
    fs.writeFileSync(media_ts_path, gen_data);
}

TimeLog.log_fn_async(
    green("FINSIHED BUILDING MEDIA"), 
    async() => await __illusicord_build__().catch(console.error))
.catch(e => console.error(e));