import { Alert } from "react-native";
import type { ResponseError } from "@common/types";
import { reinterpret_cast } from "@common/cast";

export function alert_info(info: string) {
    Alert.alert("INFO", info);
}
export function alert_errors(errors: ResponseError[]) {
    Alert.alert("Errors", errors.map(err => err.error).join("\n"));
}
export function alert_error(error: {error: ResponseError}|ResponseError|string) {
    if(typeof error === "string") Alert.alert("Error", error);
    else if ("error" in error && !("error" in error.error)) {
        Alert.alert("Error", error.error.stack);
    }
    else Alert.alert("Error", reinterpret_cast<{error: ResponseError}>(error).error.error.stack);
}
export function alert_trackplayer_error(error: ResponseError[]|ResponseError|string){
    Alert.alert("Error", typeof error === "string" ? error : Array.isArray(error) ? error.map(e => e.error.stack).join(', ') : error.error.stack);
}