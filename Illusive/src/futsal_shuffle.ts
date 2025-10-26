import { Prefs } from "./prefs";
import type { Track } from "./types";

export namespace FutsalShuffle {

    function build_cache(){
        return ;
    }
    export async function get_track_weight(track: Track): Promise<number>{
        const bias = Prefs.get_pref('track_shuffle_bias')
        return 0;
    }

    export async function shuffle_weighted<T>(data: {weight: number, value: T}[]): Promise<T[]>{
        const shuffled_data: T[] = [];
      
        const total_weight = data.reduce((sum, item) => sum + item.weight, 0);
        while (data.length > 0) {
            let rand_number = Math.random() * total_weight;
        
            let selected_i = -1;
            for (let i = 0; i < data.length; i++) {
                rand_number -= data[i].weight;
                if (rand_number <= 0) {
                selected_i = i;
                break;
                }
            }
        
            if (selected_i !== -1) {
                shuffled_data.push(data[selected_i].value);
                data.splice(selected_i, 1); // Remove the selected item
            }
        }
      
        return shuffled_data;
    }
}