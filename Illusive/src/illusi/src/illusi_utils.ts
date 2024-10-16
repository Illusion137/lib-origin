import * as Haptics from 'expo-haptics';
import * as Sharing from 'expo-sharing';
import { Alert, GestureResponderEvent } from "react-native";
import { AlphabetScroll } from '../../types';
import BigList from 'react-native-big-list';
import { alert_error } from './alert';

export async function if_confirm(title: string, msg: string, on_press: () => Promise<void>|void){
    Alert.alert(title, msg, [
        {"text": "Cancel", "onPress": () => {}},
        {"text": "OK", "onPress": on_press }
    ])
}

export function catch_function_sync(func: () => any){
    try { return func(); } 
    catch (error) { alert_error({"error": String(error)}); return {"error": String(error)}; }
}
export async function catch_function_async(func: () => Promise<any>){
    try { return await func(); } 
    catch (error) { alert_error({"error": String(error)}); return {"error": String(error)}; }
}

export function closest_to(target: number, array: number[]){
    return array.reduce(function(prev, curr) {
        return (Math.abs(curr - target) < Math.abs(prev - target) ? curr : prev);
    });
}

function populate_alphabet_scroll(alphabet_scroll: AlphabetScroll, char_data: string[]){
    alphabet_scroll.all_alphabet_fast_scroll_locations = [];
    for(let i = 0; i < char_data.length; i++) {
        alphabet_scroll.all_alphabet_fast_scroll_locations.push((17*i) + alphabet_scroll.top_scroll);
    }
}

export function on_alphabet_scroll_update(alphabet_scroll: AlphabetScroll, char_data: string[], biglist_ref: React.MutableRefObject<BigList<any>|undefined>, event: GestureResponderEvent, offset?: number) {
    if(char_data.length === 0) return;
    if(!(char_data.length === alphabet_scroll.all_alphabet_fast_scroll_locations.length))
        populate_alphabet_scroll(alphabet_scroll, char_data);
    const target = Math.floor(event.nativeEvent.pageY);
    const closest = closest_to(target + (offset ?? 0), alphabet_scroll.all_alphabet_fast_scroll_locations);
    if(alphabet_scroll.current_position == closest) return;
    alphabet_scroll.current_position = closest;
    (biglist_ref?.current?.scrollToLocation as any)({ animated: false, itemIndex: 0, sectionIndex: alphabet_scroll.all_alphabet_fast_scroll_locations.indexOf(closest) }); 
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

export async function share_item(item: {link: string}|{uri: string}){
    const UTI = 'public.item';
    if("link" in item)
        await Sharing.shareAsync(item.link);
    else await Sharing.shareAsync(item.uri, { UTI });
}