import { Alert } from "react-native";
import { ResponseError } from "../../../../origin/src/utils/types";
import { Prefs } from "../../prefs";

export function alert_info(info: string) {
    Alert.alert("INFO", info);
}
export function alert_errors(errors: ResponseError[]) {
    if(!Prefs.get_pref("hide_errors"))
        Alert.alert("Errors", errors.map(err => err.error).join("\n"));
}
export function alert_error(error: ResponseError[]|ResponseError|string, force?: boolean) {
    if(!Prefs.get_pref("hide_errors") || force)
        Alert.alert("Error", typeof error === "string" ? error : Array.isArray(error) ? 
        error.map(err => `${Prefs.get_pref('simple_errors') ? err.error.message : err.error.stack}`).join(', ') 
        : `${Prefs.get_pref('simple_errors') ? error.error.message : error.error.stack}`);
}
export function alert_trackplayer_error(error: ResponseError){
    if(!Prefs.get_pref("hide_trackplayer_errors"))
        Alert.alert("Error", typeof error === "string" ? error : Array.isArray(error) ? error.map(err => `${err.error.stack}`).join(', ') : `${error.error.stack}`);
}