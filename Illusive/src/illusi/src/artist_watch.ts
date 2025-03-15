import { Illusive } from "../../illusive";
import { CompactPlaylist, NamedUUID } from "../../types";
import { is_empty } from '../../../../origin/src/utils/util';
import { music_service_uri_to_music_service, split_uri } from "../../illusive_utilts";

export async function artist_watch(artists: NamedUUID[]): Promise<CompactPlaylist[]>{
    const releases: (CompactPlaylist|undefined)[] = [];
    artists = artists.filter(artist => !is_empty(artist.uri));
    for(const artist of artists){
        const [service, id] = split_uri(artist.uri!);
        const music_service = Illusive.music_service.get(music_service_uri_to_music_service(service))!;
        if(music_service?.get_latest_release === undefined){
            releases.push(await music_service.get_latest_release!(id));
        }
    }
    return releases.filter(release => release !== undefined);
}