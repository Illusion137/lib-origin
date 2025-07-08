import { green } from 'colors';
import fs from 'fs';
import path from 'path';
import getAudioDurationInSeconds from "get-audio-duration";
import { extract_file_extension } from '../../illusive_utilts';

async function __illusicord_build__(){
    const build_ts_path = process.argv[1];
    const media_folder_path = path.join(build_ts_path, "../../media/");
    const all_media_files = fs.readdirSync(media_folder_path, {withFileTypes: true});

    const tracks_data: {title: string; media_uri: string; duration: number;}[] = [];
    for(const media_file of all_media_files){
        if(!([".wav", ".mp3", ".m4a"].includes(extract_file_extension(media_file.name))) ) continue;
        const formated_path = path.join(media_file.parentPath, media_file.name);
        tracks_data.push({
            title: media_file.name,
            media_uri: formated_path,
            duration: Math.round(await getAudioDurationInSeconds(formated_path)),
        });
    }

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

__illusicord_build__().then(() => console.log(green("FINSIHED BUILDING MEDIA"))).catch(e => console.error(e));