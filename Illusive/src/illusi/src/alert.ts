import { Alert } from "react-native";
import { ResponseError } from "../../../../origin/src/utils/types";
import { clean_error_stack } from "../../../../origin/src/utils/util";

export function alert_info(info: string) {
    Alert.alert("INFO", info);
}
export function alert_errors(errors: ResponseError[]) {
    Alert.alert("Errors", errors.map(err => err.error).join("\n"));
}
export function alert_error(error: ResponseError[]|ResponseError|string) {
    Alert.alert("Error", typeof error === "string" ? error : Array.isArray(error) ? 
        error.map(err => clean_error_stack(err.error)).join(', ') 
            : clean_error_stack(error.error));
}
export function alert_trackplayer_error(error: ResponseError){
    Alert.alert("Error", typeof error === "string" ? error : Array.isArray(error) ? error.map(err => `${clean_error_stack(err.error)}`).join(', ') : `${clean_error_stack(error.error)}`);
}