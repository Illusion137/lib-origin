import { FeaturedArtistSection } from "./FeaturedArtistSection"
import { PlaylistHeaderSection } from "./PlaylistHeaderSection"
import { SpacerSection } from "./SpacerSection"
import { TrackListFooterSection } from "./TrackListFooterSection"
import { TrackListSection } from "./TrackListSection"
import { Section } from "./type"

export type Playlist = Root2[]

export interface Root2 {
    intent: Intent
    data: Data
}

export interface Intent {
    $kind: "PlaylistDetailPageIntent"
    contentDescriptor: ContentDescriptor
    prominentItemIdentifier: any
}

export interface ContentDescriptor {
    kind: "playlist"
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

export interface Data {
    pageMetrics: PageMetrics
    sections: [PlaylistHeaderSection, TrackListSection, TrackListFooterSection, SpacerSection, FeaturedArtistSection]
    invalidationRules: InvalidationRules
    canonicalURL: string
    seoData: SeoData
}

export interface PageMetrics {
    instructions: Instruction[]
    pageFields: PageFields
    custom: Custom
}

export interface Instruction {
    data: Data2
    invocationPoints: string[]
}

export interface Data2 {
    topic: string
    shouldFlush: boolean
    fields: Fields
    includingFields: string[]
    excludingFields: any[]
}

export interface Fields {
    eventType: string
}

export interface PageFields {
    pageUrl: string
    pageType: "Playlist"
    pageFeatureName: "playlist_detail"
    pageId: string
    page: string
}

export interface Custom { }

export interface Dictionary2 {
    width: number
    height: number
    url: string
    hasP3: boolean
}

export interface InvalidationRules {
    eventTriggers: EventTrigger[]
}

export interface EventTrigger {
    events: Event[]
    intent: Intent4
}

export interface Event {
    name: string
}

export interface Intent4 {
    $kind: string
    intent: Intent5
    reason: string
}

export interface Intent5 {
    $kind: string
    contentDescriptor: ContentDescriptor8
    prominentItemIdentifier: any
}

export interface ContentDescriptor8 {
    kind: string
    identifiers: Identifiers11
    locale: Locale3
}

export interface Identifiers11 {
    storeAdamID: string
}

export interface Locale3 {
    storefront: string
    language: any
}

export interface SeoData {
    url: string
    noIndex: boolean
    noFollow: boolean
    keywords: string
    siteName: string
    pageTitle: string
    description: string
    fileType: string
    artworkUrl: string
    crop: string
    height: number
    width: number
    appleStoreId: string
    appleStoreName: string
    appleContentId: string
    appleTitle: string
    appleDescription: string
    socialDescription: string
    socialTitle: string
    ogType: string
    twitterSite: string
    twitterCardType: string
    twitterWidth: number
    twitterHeight: number
    twitterCropCode: string
    showOrgData: boolean
    oembedData: OembedData
    ogSongs: OgSong[]
    songsCount: number
    quality: number
    schemaName: string
}

export interface OembedData {
    url: string
    title: string
}

export interface OgSong {
    id: string
    type: string
    href: string
    attributes: Attributes
    relationships: Relationships
    meta: Meta
}

export interface Attributes {
    albumName: string
    durationInMillis: number
    audioTraits: string[]
    name: string
    contentRating?: string
    artistName: string
    artwork: Artwork2
    url: string
    playParams: PlayParams
    extendedAssetUrls: ExtendedAssetUrls
    composerName?: string
}

export interface Artwork2 {
    width: number
    url: string
    height: number
    textColor3: string
    textColor2: string
    textColor4: string
    textColor1: string
    bgColor: string
    hasP3: boolean
}

export interface PlayParams {
    id: string
    kind: string
}

export interface ExtendedAssetUrls {
    plus: string
    lightweight: string
    superLightweight: string
    lightweightPlus: string
    enhancedHls: string
}

export interface Relationships {
    artists: Artists
}

export interface Artists {
    href: string
    data: Daum7[]
}

export interface Daum7 {
    id: string
    type: string
    href: string
}

export interface Meta {
    contentVersion: ContentVersion
    formerIds?: string[]
}

export interface ContentVersion {
    MZ_INDEXER: number
    RTCI: number
}
