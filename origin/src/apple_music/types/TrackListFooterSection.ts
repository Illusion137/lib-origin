export interface TrackListFooterSection {
    id: `track-list-footer-section - ${string}`
    itemKind: "containerDetailTracklistFooterLockup"
    presentation: Presentation
    items: Item[]
}

export interface Presentation {
    kind: string
}

export interface Item {
    id: string
    contentDescriptor: ContentDescriptor
    numberOfSocialBadges: number
    hidden: boolean
    description: string
}

export interface ContentDescriptor {
    kind: string
    identifiers: Identifiers
    url: string
}

export interface Identifiers {
    storeAdamID: string
}
