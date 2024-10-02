export interface FeaturedArtistSection {
    id: "artist - featured-artists"
    itemKind: "bubbleLockup"
    presentation: Presentation
    items: Item[]
    header: Header
    displaySeparator: boolean
    backgroundTreatment: string
}

export interface Presentation {
    kind: string
    layout: Layout
}

export interface Layout {
    kind: string
    numberOfRows: number
}

export interface Item {
    id: string
    artwork: Artwork
    title: string
    contentDescriptor: ContentDescriptor
    segue: Segue
    name: string
    accessibilityLabel: string
}

export interface Artwork {
    dictionary: Dictionary
}

export interface Dictionary {
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

export interface ContentDescriptor {
    kind: string
    identifiers: Identifiers
    url: string
}

export interface Identifiers {
    storeAdamID: string
}

export interface Segue {
    $kind: string
    destination: Destination
    actionMetrics: ActionMetrics
}

export interface Destination {
    kind: string
    contentDescriptor: ContentDescriptor2
    prominentItemIdentifier: any
}

export interface ContentDescriptor2 {
    kind: string
    identifiers: Identifiers2
    url: string
}

export interface Identifiers2 {
    storeAdamID: string
}

export interface ActionMetrics {
    data: Daum[]
    custom: Custom
}

export interface Daum {
    fields: Fields
    includingFields: string[]
    excludingFields: any[]
    topic: string
    shouldFlush: boolean
}

export interface Fields {
    actionDetails: ActionDetails
    actionUrl: string
    actionType: string
    eventType: string
    targetType: string
    targetId: string
    eventVersion: number
}

export interface ActionDetails {
    kind: string
}

export interface Custom { }

export interface Header {
    kind: string
    item: Item2
}

export interface Item2 {
    titleLink: TitleLink
}

export interface TitleLink {
    title: string
    segue: Segue2
}

export interface Segue2 {
    $kind: string
    destination: Destination2
    actionMetrics: ActionMetrics2
}

export interface Destination2 {
    kind: string
    intent: Intent
}

export interface Intent {
    $kind: string
    url: string
    viewKind: string
    id: string
    title: string
    containerType: string
}

export interface ActionMetrics2 {
    data: Daum2[]
    custom: Custom2
}

export interface Daum2 {
    fields: Fields2
    includingFields: string[]
    excludingFields: any[]
    topic: string
    shouldFlush: boolean
}

export interface Fields2 {
    actionUrl: string
    actionType: string
    eventType: string
    targetType: string
    targetId: string
    eventVersion: number
}

export interface Custom2 { }
