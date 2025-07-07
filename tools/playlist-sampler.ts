import * as fs from 'fs';
import { Illusive } from "../Illusive/src/illusive";
import type { MusicServiceType } from "../Illusive/src/types";
import load_cookies_env from '../Illusive/src/load_cookies_env';

load_cookies_env();

async function sample_playlist(name: string, service: MusicServiceType, url: string) {
    const playlist = await Illusive.music_service.get(service)!.get_full_playlist(url);
    if("error" in playlist) {
        console.error(playlist.error);
        return;
    }
    fs.writeFileSync(`sample/illusi/${name}.json`, JSON.stringify(playlist.tracks));
}
sample_playlist("zayboy", "Apple Music", "https://music.apple.com/library/playlist/p.B0A8O2Jie4KpRZA").catch(e => e);