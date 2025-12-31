import * as fs from 'fs';
import { Illusive } from "@illusive/illusive";
import type { MusicServiceType } from "@illusive/types";
import load_cookies_env from '@illusive/load_cookies_env';
import { catch_log } from '@common/utils/error_util';

load_cookies_env();

async function sample_playlist(name: string, service: MusicServiceType, url: string) {
    const playlist = await Illusive.music_service.get(service)!.get_full_playlist(url);
    if("error" in playlist) {
        console.error(playlist.error);
        return;
    }
    fs.writeFileSync(`sample/illusi/${name}.json`, JSON.stringify(playlist.tracks));
}
sample_playlist("zayboy", "Apple Music", "https://music.apple.com/library/playlist/p.B0A8O2Jie4KpRZA").catch(catch_log);