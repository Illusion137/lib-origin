import * as fs from 'fs';
import { duration_to_string } from "../Illusive/src/illusive_utilts";
import { Track } from "../Illusive/src/types";
import playlist from '../sample/illusi/zayboy.json';
import { remove_topic } from '../origin/src/utils/util';
import { convert_track } from '../Illusive/src/convert_track';

function small_track(track: Track){
    return {
        title: track.title, 
        alt_title: track.alt_title,
        artist: track.artists.map(item => remove_topic(item.name).trim()).join(', '),
        duration: duration_to_string(track.duration).duration,
        id: track.youtube_id
    }
}
function log_conversion(track: Track, converted_track: Track){
    console.log(JSON.stringify(small_track(track)), " | ", JSON.stringify(small_track(converted_track)));
}
async function test_convert_track(track: Track, callback?: (track: Track, converted_track: Track) => void){
    const converted_track = await convert_track(track, {to_music_service: "YouTube"});
    if("error" in converted_track){
        console.error(small_track(track), converted_track);
        return;
    }
    if(callback !== undefined) callback(track, converted_track.track!);
    log_conversion(track, converted_track.track!);
}
async function test_convert_tracks(){
    const converted_pairs: [ReturnType<typeof small_track>, ReturnType<typeof small_track>][] = [];
    for(let i = 0; i < playlist.length; i++){
        const track = playlist[i] as Track;
        await test_convert_track(track, (t, ct) => converted_pairs.push([small_track(t), small_track(ct)]))
    }
    fs.writeFileSync(`sample/illusi/converted.json`, JSON.stringify(converted_pairs));
} test_convert_tracks;
// test_convert_tracks().catch(e => e); 
test_convert_track({title: "Swang", artists: [{name: "Rae Sremmurd"}], duration: 208} as any).catch(e => e);