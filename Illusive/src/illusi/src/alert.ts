import { Alert } from "react-native";
import type { ResponseError } from "@common/types";

export function alert_info(info: string) {
    Alert.alert("INFO", info);
}
export function alert_errors(errors: ResponseError[]) {
    Alert.alert("Errors", errors.map(err => err.error).join("\n"));
}
export function alert_error(error: ResponseError[]|ResponseError|string) {
    if(typeof error === "string") Alert.alert("Error", error);
    else if(Array.isArray(error)){
        Alert.alert("Error", error.map(err => err.error.stack).join(', '));
    }
    else if(Array.isArray(error?.error)){
        Alert.alert("Error", (error as unknown as ResponseError[]).map(err => err.error.stack).join(', '));
    }
    else {
        Alert.alert("Error", error.error.stack);
    }
}
export function alert_trackplayer_error(error: ResponseError[]|ResponseError|string){
    Alert.alert("Error", typeof error === "string" ? error : Array.isArray(error) ? error.map(e => e.error.stack).join(', ') : error.error.stack);
}