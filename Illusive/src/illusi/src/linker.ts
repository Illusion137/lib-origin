import { Illusive } from "../../illusive";
import { Prefs } from "../../prefs";
import { LinkerLink } from "../../types";

export async function fetch_linked_playlists(links: LinkerLink[]){
    if(Prefs.get_pref("disable_linker")) return;
    for(const link of links){
        if(link.to_service === "Illusi"){
            
        }
        else if(link.from_service === "Illusi"){
            
        }
    }
}