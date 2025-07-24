import { Alert } from "react-native";
import type { ResponseError } from "../../../../common/types";
import { clean_error_stack } from "../../../../common/utils/util";

export function alert_info(info: string) {
    Alert.alert("INFO", info);
}
export function alert_errors(errors: ResponseError[]) {
    Alert.alert("Errors", errors.map(err => err.error).join("\n"));
}
export function alert_error(error: ResponseError[]|ResponseError|string) {
    if(typeof error === "string") Alert.alert("Error", error);
    else if(Array.isArray(error)){
        Alert.alert("Error", error.map(err => clean_error_stack(err.error)).join(', '));
    }
    else if(Array.isArray(error?.error)){
        Alert.alert("Error", (error as unknown as ResponseError[]).map(err => clean_error_stack(err.error)).join(', '));
    }
    else {
        Alert.alert("Error", clean_error_stack(error.error));
    }
}
export function alert_trackplayer_error(error: ResponseError){
    Alert.alert("Error", typeof error === "string" ? error : Array.isArray(error) ? error.map(err => clean_error_stack(err.error)).join(', ') : clean_error_stack(error.error));
}