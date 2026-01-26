import { Constants } from "@illusive/constants";
import { ExploreLocalData } from "@illusive/explore_local_data";
import { create_uri } from "@illusive/illusive_utils";
import type { MusicServicePlaylist, Track } from "@illusive/types";
import { reinterpret_cast } from "@common/cast";
import christmas_tracks_v1730 from '@illusive/data/christmas_tracks_v1730.json';

export function get_local_illusi_playlist(cleaned_url: string): MusicServicePlaylist|undefined{

    if(cleaned_url === "christmas_tracks_v1730"){
        return {
            title: ExploreLocalData.illusi_recommend_playlists_map.christmas_tracks_v1730.title.name,
            creator: [{name: Constants.local_illusi_uri_id, uri: create_uri('illusi', Constants.local_illusi_uri_id)}],
            tracks: reinterpret_cast<Track[]>(christmas_tracks_v1730),
            continuation: null
        };
    }
    
    return undefined;
}
