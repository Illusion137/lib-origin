import { FeaturedArtistSection } from "./FeaturedArtistSection";
import { PlaylistHeaderSection } from "./PlaylistHeaderSection";
import { SpacerSection } from "./SpacerSection";
import { TrackListFooterSection } from "./TrackListFooterSection";
import { TrackListSection } from "./TrackListSection";

export type Section = PlaylistHeaderSection | TrackListSection | TrackListFooterSection | SpacerSection | FeaturedArtistSection;
export type SerializedServerData = SerializedServerDataObj[];

export interface SerializedServerDataObj {
    data: any
    intent: Intent
}

export interface Intent {
    $kind: string
    contentDescriptor: ContentDescriptor
    prominentItemIdentifier: any
}

export interface ContentDescriptor {
    kind: string
    identifiers: Identifiers
    locale: Locale
}

export interface Identifiers {
    storeAdamID: string
}

export interface Locale {
    storefront: string
    language: any
}