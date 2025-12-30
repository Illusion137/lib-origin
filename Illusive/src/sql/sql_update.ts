import { version_greater_than } from "@common/utils/util";
import { SQLTracks } from "./sql_tracks";
import type { Promises, Track } from "@illusive/types";
import { Constants } from "@illusive/constants";
import { create_uri } from "@illusive/illusive_utils";
import { is_empty } from '../../../common/utils/util';
import { GLOBALS } from "@illusive/globals";

export namespace SQLUpdate {
    export async function fix_to_new_update(version: string){
        if (!version_greater_than(version, "17.2.0")) {
            let updated = false;
            try {
                const bad_imported_track = (track: Track): boolean => {
                    const imported_or_yt = !is_empty(track.youtube_id) && !is_empty(track.imported_id);
                    const imported_mismatch_uri = !is_empty(track.imported_id) && (track.artists[0].uri === null || !track.artists[0].uri?.includes("illusi"));
                    return imported_or_yt || imported_mismatch_uri;
                }

                const tracks = await SQLTracks.get_tracks();
                if(tracks.some(bad_imported_track)){
                    const promises: Promises = [];
                    for(const track of tracks){
                        if(track.imported_id && bad_imported_track(track)){
                            const new_track: Track = {
                                ...track,
                                youtube_id: "",
                                youtubemusic_id: "",
                                artists: [{name: Constants.import_uri_id, uri: create_uri("illusi", Constants.import_uri_id)}]
                            }
                            promises.push(SQLTracks.update_track(track.uid, new_track));
                            updated = true;
                        }
                    }
                    await Promise.allSettled(promises);
                }
            }
            catch(_) {
                GLOBALS.global_var.bottom_alert("Failed to Update to 17.2.0", "WARN");
            }
            finally {
                if(updated) GLOBALS.global_var.bottom_alert("Updated to 17.2.0", "GOOD");
            }
        }
    }
}