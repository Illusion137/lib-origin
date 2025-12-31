import type { Artwork, ImageArtwork } from "./types";
import { reinterpret_cast } from "@common/cast";
import { get_native_platform } from "@native/native_mode";
import { illusi_icons_icon_map } from "./illusi_icons";
import { Illusive } from "./illusive";

export function resolved_artwork(artwork?: Artwork|null): ImageArtwork{
    switch(get_native_platform()){
        case "WEB":
        case "NODE":
        case "REACT_NATIVE": {
            if(artwork === undefined || artwork === null) return reinterpret_cast<ImageArtwork>(illusi_icons_icon_map[Illusive.illusi_dark_icon_index]);
            else if(typeof artwork === "number") return reinterpret_cast<ImageArtwork>(illusi_icons_icon_map[artwork]);
            else if(typeof artwork === "string") return {uri: artwork, cache: 'force-cache'};
            else return artwork;
        }
    }

}