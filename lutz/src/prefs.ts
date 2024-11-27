namespace Prefs {
    export interface ReadingSession {
        artwork_url: string;
        manga_id: string;
        no: number;
        id: string;
    }
    export type ReadingMode = "ver"|"hoz";
    export type Quality = "low"|"medium"|"high";
    export const prefs = {
        previous_session: {},

        reading_mode: {},
        quality: {},
    };
    export function get_pref(){
        return prefs;
    }
    export function save_pref(){

    }
    export function load_prefs(){

    }
}