import * as Haptics from 'expo-haptics';
import * as Sharing from 'expo-sharing';
import type { GestureResponderEvent } from "react-native";
import { Alert, Share } from "react-native";
import type BigList from 'react-native-big-list';
import type { AlphabetScroll } from '@illusive/types';
import { closest_to } from '@common/utils/util';
import { catch_ignore } from '@common/utils/error_util';

export async function if_confirm(title: string, msg: string, on_press: () => Promise<void>|void) {
    Alert.alert(title, msg, [
        {text: "Cancel", onPress: () => {return}},
        {text: "OK", onPress: on_press, style: "destructive" }
    ])
}

function populate_alphabet_scroll(alphabet_scroll: AlphabetScroll, char_data: string[]) {
    alphabet_scroll.all_alphabet_fast_scroll_locations = [];
    for(let i = 0; i < char_data.length; i++) {
        alphabet_scroll.all_alphabet_fast_scroll_locations.push((17*i) + alphabet_scroll.top_scroll);
    }
}

export function on_alphabet_scroll_update(alphabet_scroll: AlphabetScroll, char_data: string[], biglist_ref: React.RefObject<BigList|undefined>, event: GestureResponderEvent, offset?: number) {
    if(char_data.length === 0) return;
    if(!(char_data.length === alphabet_scroll.all_alphabet_fast_scroll_locations.length))
        populate_alphabet_scroll(alphabet_scroll, char_data);
    const target = Math.floor(event.nativeEvent.pageY);
    const closest = closest_to(target + (offset ?? 0), alphabet_scroll.all_alphabet_fast_scroll_locations);
    if(alphabet_scroll.current_position == closest) return;
    alphabet_scroll.current_position = closest;
    (biglist_ref?.current?.scrollToLocation as any)({ animated: false, itemIndex: 0, sectionIndex: alphabet_scroll.all_alphabet_fast_scroll_locations.indexOf(closest) }); 
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(catch_ignore);
}

export async function share_item(item: {link: string}|{uri: string}) {
    const UTI = 'public.item';
    if("link" in item)
        await Share.share({url: item.link});
    else await Sharing.shareAsync(item.uri, { UTI });
}

