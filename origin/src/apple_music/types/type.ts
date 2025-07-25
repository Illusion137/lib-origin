import type { FeaturedArtistSection } from "@origin/apple_music/types/FeaturedArtistSection";
import type { PlaylistHeaderSection } from "@origin/apple_music/types/PlaylistHeaderSection";
import type { SpacerSection } from "@origin/apple_music/types/SpacerSection";
import type { TrackListFooterSection } from "@origin/apple_music/types/TrackListFooterSection";
import type { TrackListSection } from "@origin/apple_music/types/TrackListSection";

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