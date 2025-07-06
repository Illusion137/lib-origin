import * as fs from 'fs';
import { duration_to_string } from "../Illusive/src/illusive_utilts";
import { Track } from "../Illusive/src/types";
import playlist from '../sample/illusi/zayboy.json';
import { remove_topic } from '../origin/src/utils/util';
import { Prefs } from '../Illusive/src/prefs';
import { Illusive } from '../Illusive/src/illusive';

Prefs.prefs.use_cookies_on_search.current_value = false;

function small_track(track: Track){
    return {
        title: track.title, 
        alt_title: track.alt_title,
        artist: track.artists.map(item => remove_topic(item.name).trim()).join(', '),
        duration: duration_to_string(track.duration).duration,
        id: track.youtube_id,
        explicit: track.explicit
    }
}
function log_conversion(track: Track, converted_track: Track, score: number){
    console.log("CONVERTED: ", JSON.stringify(small_track(track)), " | ", JSON.stringify(small_track(converted_track)), " === ", score);
}
async function test_convert_track(track: Track, callback?: (track: Track, converted_track: Track) => void){
    const converted_track = await Illusive.convert_track(track, {to_music_service: "YouTube Music"});
    if("error" in converted_track){
        console.error(small_track(track), converted_track);
        return;
    }
    if(callback !== undefined) callback(track, converted_track.track!);
    log_conversion(track, converted_track.track!, converted_track.score);
    return Illusive.convert_track;
}
async function test_convert_tracks(){
    const converted_pairs: [ReturnType<typeof small_track>, ReturnType<typeof small_track>][] = [];
    for(const playlist_track of playlist){
        const track = playlist_track as Track;
        await test_convert_track(track, (t, ct) => converted_pairs.push([small_track(t), small_track(ct)]))
    }
    fs.writeFileSync(`sample/illusi/converted.json`, JSON.stringify(converted_pairs));
} test_convert_tracks;
// test_convert_tracks().catch(e => e); 
test_convert_track({title: "Swang", artists: [{name: "Rae Sremmurd"}], duration: 208, explicit: "EXPLICIT"} as any).catch(e => console.log(e));