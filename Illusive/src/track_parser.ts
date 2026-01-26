import type { AmazonSearchTrack } from '@origin/amazon_music/types/SearchResult';
import type { AmazonTrack } from '@origin/amazon_music/types/ShowHomeCreateAndBindMethod';
import * as Origin from '@origin/index'
import { extract_string_from_pattern, generate_new_uid, is_empty } from '@common/utils/util'
import { create_uri } from '@illusive/illusive_utils';
import type { Track } from '@illusive/types';
import { parse_time } from '@common/utils/parse_util';

export function parse_amazon_music_playlist_track(track: AmazonTrack): Track {
    const album_regex = /([a-zA-Z?><{}|!@#$%^&*]+\s?[a-zA-Z?><{}|!@#$%^&*])+/;
    return {
        uid: generate_new_uid(track.primaryText),
        title: track.primaryText,
        artists: [{name: track.secondaryText1, uri: create_uri("amazonmusic", extract_string_from_pattern(track.secondaryText1Link.deeplink, /\/.+?\/(.+)\/.+/) as string)}],
        duration: parse_time(track.secondaryText3),
        album: {name: extract_string_from_pattern(track.secondaryText2, album_regex) as string, uri: create_uri("amazonmusic", extract_string_from_pattern(track.secondaryText1Link.deeplink, /\/.+?\/(.+)/) as string)},
        explicit: track.secondaryText2.includes("[Explicit]") ? "EXPLICIT" : "NONE",
        amazonmusic_id: Origin.AmazonMusic.get_track_id(track)
    }
}
export function parse_amazon_music_search_track(track: AmazonSearchTrack): Track {
    // const album_regex = /([a-zA-Z?><{}|!@#$%^&*]+\s?[a-zA-Z?><{}|!@#$%^&*])+/;
    const title = typeof track.primaryText === "object" ? track.primaryText.text : track.primaryText;
    return {
        uid: generate_new_uid(title),
        title: title,
        artists: [{name: is_empty(track.secondaryText) ? "" : track.secondaryText!, uri: track.secondaryLink?.deeplink === undefined ? null : create_uri("amazonmusic", extract_string_from_pattern(track.secondaryLink.deeplink, /\/.+?\/(.+)\/.+/) as string)}],
        duration: NaN,
        explicit: track.tags.includes("E") ? "EXPLICIT" : "NONE",
        amazonmusic_id: Origin.AmazonMusic.get_track_id(track)
    }
}