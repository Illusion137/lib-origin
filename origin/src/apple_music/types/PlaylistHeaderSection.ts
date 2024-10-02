export interface PlaylistHeaderSection {
    id: `playlist-detail-header-section - ${string}`
    itemKind: "containerDetailHeaderLockup"
    presentation: Presentation
    items: Item[]
}

export interface Presentation {
    kind: string
}

export interface Item {
    id: string
    artwork: Artwork
    title: string
    subtitleLinks: SubtitleLink[]
    tertiaryTitleLinks: any[]
    collaborators: any[]
    quaternaryTitle: any
    canEdit: boolean
    modalPresentationDescriptor: ModalPresentationDescriptor
    showExplicitBadge: boolean
    contentDescriptor: ContentDescriptor
    playButton: PlayButton
    shuffleButton: any
    videoArtwork: any
    trackCount: number
    siriBannerConfiguration: any
    isPreviewMode: boolean
}

export interface Artwork {
    dictionary: Dictionary
}

export interface Dictionary {
    width: number
    height: number
    url: string
    hasP3: boolean
}

export interface SubtitleLink {
    title: string
    segue: Segue
}

export interface Segue {
    $kind: string
    destination: Destination
    actionMetrics: ActionMetrics
}

export interface Destination {
    kind: string
    intent: Intent
    contentDescriptor: {identifiers: {storeAdamID: string}}
}

export interface Intent {
    handle: string
    storefront: string
    language: any
    $kind: string
}

export interface ActionMetrics {
    data: any[]
    custom: Custom
}

export interface Custom { }

export interface ModalPresentationDescriptor {
    headerTitle: string
    headerSubtitle: string
    paragraphText: any
}

export interface ContentDescriptor {
    kind: string
    identifiers: Identifiers
    url: string
}

export interface Identifiers {
    storeAdamID: string
}

export interface PlayButton {
    id: string
    segue: Segue2
    title: string
}

export interface Segue2 {
    $kind: string
    actionMetrics: ActionMetrics2
    items: Item2[]
    containerContentDescriptor: ContainerContentDescriptor
    groupingIdentifier: any
}

export interface ActionMetrics2 {
    data: Daum[]
    custom: Custom2
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

export interface Custom2 { }

export interface Item2 {
    contentDescriptor: ContentDescriptor2
}

export interface ContentDescriptor2 {
    kind: string
    identifiers: Identifiers2
    url: string
}

export interface Identifiers2 {
    storeAdamID: string
}

export interface ContainerContentDescriptor {
    kind: string
    identifiers: Identifiers3
    url: string
}

export interface Identifiers3 {
    storeAdamID: string
}
