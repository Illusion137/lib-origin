import { Alert } from "react-native";

export async function if_confirm(title: string, msg: string, on_press: () => Promise<void>|void){
    Alert.alert(title, msg, [
        {"text": "Cancel", "onPress": () => {}},
        {"text": "OK", "onPress": on_press }
    ])
}