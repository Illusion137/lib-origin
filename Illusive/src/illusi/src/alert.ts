import { Alert } from "react-native";
import { ResponseError } from "../../../../origin/src/utils/types";
import { Prefs } from "../../prefs";

export function alert_errors(errors: ResponseError[]){
    if(!Prefs.get_pref("hide_errors"))
        Alert.alert("Errors", errors.map(err => err.error).join("\n"));
}
export function alert_error(error: ResponseError|string, force?: boolean){
    if(!Prefs.get_pref("hide_errors") || force)
        Alert.alert("Error", typeof error === "string" ? error : error.error);
}