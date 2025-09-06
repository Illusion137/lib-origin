import type { Artwork, ImageArtwork } from "./types";
import { IllusiIcons } from "./illusi_icons";
import { reinterpret_cast } from "@common/cast";
import { get_native_platform } from "@native/native_mode";

export function resolved_artwork(artwork?: Artwork): ImageArtwork{
    switch(get_native_platform()){
        case "REACT_NATIVE": {
            if(artwork === undefined) return reinterpret_cast<ImageArtwork>(IllusiIcons.illusi_dark_icon);
            else if(typeof artwork === "number") return reinterpret_cast<ImageArtwork>(IllusiIcons.icon_map[artwork]);
            else if(typeof artwork === "string") return {uri: artwork, cache: 'force-cache'};
            else return artwork;
        }
        case "WEB":
        case "NODE":
        case "ELECTRON_RENDERER": {
            if(artwork === undefined) return reinterpret_cast<ImageArtwork>(IllusiIcons.illusi_dark_icon);
            else if(typeof artwork === "number") return reinterpret_cast<ImageArtwork>(IllusiIcons.icon_map[artwork]);
            else if(typeof artwork === "string") return reinterpret_cast<ImageArtwork>(artwork);
            else return reinterpret_cast<ImageArtwork>(artwork.uri);
        }
    }

}