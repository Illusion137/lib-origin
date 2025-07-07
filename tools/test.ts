import __tracks from '../sample/illusi/lafou.json';
import type { Promises, Track } from '../Illusive/src/types';
import { convert_playlist } from '../Illusive/src/illusi/src/playlist_converter';
import { create_uri } from '../Illusive/src/illusive_utilts';
import load_cookies_env from '../Illusive/src/load_cookies_env';
import { Illusive } from '../Illusive/src/illusive';
import { is_empty } from '../origin/src/utils/util';
const tracks: Track[] = __tracks as any;
const bad = [
    'mIZBrt_j3iA',
    'I6rjyvtWIOc',
    'ZGWnALOzQ6s',
    'qPJM1wsqty4',
    'aRDcSvJhZcU',
    '9oH1ptW0PTc',
]
const filtered_tracks = tracks.filter(t => !bad.includes(t.youtube_id!));


load_cookies_env();

export async function speed_sample_unavailable_tracks(tracks__: Track[]){
    const promises: Promises = [];
    for(const track of tracks__){
        if(is_empty(track.youtube_id)) continue;
        const thumbnail_uri = Illusive.get_youtube_lowest_quality_thumbnail_uri(track.youtube_id!);
        const response = await fetch(thumbnail_uri);
        if(!response.ok){
            console.log(`'${track.youtube_id}',`);

        }
    }
    await Promise.all(promises);
}

async function main___(){
    // await speed_sample_unavailable_tracks(tracks);

    const base = 2;
    for(let i = 0; i < Math.floor(filtered_tracks.length / base); i++){
        const plus = i * base;
        const foo = await convert_playlist(filtered_tracks.slice(0 + plus, base + plus), "YouTube", {divide_and_conquer: false, full_sample: false, to: {uuid_uri: create_uri("youtube", "PLnIB0XeUqT-jBrQrit646I76NUttUsxfr")}});
        console.log(foo);
        console.log(base + plus);
    }
}
main___().catch(e => { console.error(e); });