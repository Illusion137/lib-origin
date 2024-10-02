export interface TrackListSection {
    id: `track-list - ${string}`
    itemKind: "trackLockup"
    presentation: Presentation
    items: AppleTrack[]
    header: Header
    containerContentDescriptor: ContainerContentDescriptor2
    containerArtwork: ContainerArtwork
}

export interface Presentation {
    kind: string
    layout: string
}

export interface AppleTrack {
    id: string
    title: string
    trackNumber: any
    tertiaryLinks: TertiaryLink[]
    duration: number
    contentDescriptor: ContentDescriptor2
    artwork: Artwork
    subtitleLinks: SubtitleLink[]
    playAction: PlayAction
    layoutStyle: LayoutStyle
    showExplicitBadge: boolean
    isProminent: boolean
    pauseAction: PauseAction
    resumeAction: ResumeAction
    isDisabled: boolean
    isPreviewMode: boolean
    showPopularityIndicator: boolean
    artistName: string
    socialProfileContentDescriptor: any
    composer?: string
}

export interface TertiaryLink {
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
    contentDescriptor: ContentDescriptor
    prominentItemIdentifier: any
}

export interface ContentDescriptor {
    kind: string
    identifiers: Identifiers
    url: string
    locale: Locale
}

export interface Identifiers {
    storeAdamID: string
}

export interface Locale {
    storefront: string
    language: any
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
    actionUrl: string
    actionType: string
    eventType: string
    targetType: string
    targetId: string
    eventVersion: number
    actionDetails: ActionDetails
}

export interface ActionDetails {
    kind: string
}

export interface Custom { }

export interface ContentDescriptor2 {
    kind: string
    identifiers: Identifiers2
    url: string
}

export interface Identifiers2 {
    storeAdamID: string
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

export interface SubtitleLink {
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
    contentDescriptor: ContentDescriptor3
    prominentItemIdentifier: any
}

export interface ContentDescriptor3 {
    kind: string
    identifiers: Identifiers3
    url: string
}

export interface Identifiers3 {
    storeAdamID: string
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
    actionDetails: ActionDetails2
    actionUrl: string
    actionType: string
    eventType: string
    targetType: string
    targetId: string
    eventVersion: number
}

export interface ActionDetails2 {
    kind: string
}

export interface Custom2 { }

export interface PlayAction {
    $kind: string
    actionMetrics: ActionMetrics3
    items: Item2[]
    containerContentDescriptor: ContainerContentDescriptor
    groupingIdentifier: string
}

export interface ActionMetrics3 {
    data: Daum3[]
    custom: Custom3
}

export interface Daum3 {
    fields: Fields3
    includingFields: string[]
    excludingFields: any[]
    topic: string
    shouldFlush: boolean
}

export interface Fields3 {
    actionDetails: ActionDetails3
    actionUrl: string
    actionType: string
    eventType: string
    targetType: string
    targetId: string
    eventVersion: number
}

export interface ActionDetails3 {
    kind: string
}

export interface Custom3 { }

export interface Item2 {
    contentDescriptor: ContentDescriptor4
}

export interface ContentDescriptor4 {
    kind: string
    identifiers: Identifiers4
    url: string
}

export interface Identifiers4 {
    storeAdamID: string
}

export interface ContainerContentDescriptor {
    kind: string
    identifiers: Identifiers5
    url: string
}

export interface Identifiers5 {
    storeAdamID: string
}

export interface LayoutStyle {
    kind: string
    hasVideo: boolean
    hasBadging: boolean
}

export interface PauseAction {
    $kind: string
    actionMetrics: ActionMetrics4
}

export interface ActionMetrics4 {
    data: any[]
    custom: Custom4
}

export interface Custom4 { }

export interface ResumeAction {
    $kind: string
    actionMetrics: ActionMetrics5
}

export interface ActionMetrics5 {
    data: any[]
    custom: Custom5
}

export interface Custom5 { }

export interface Header {
    item: Item3
    kind: string
}

export interface Item3 {
    firstColumnText: string
    secondColumnText: string
    thirdColumnText: string
}

export interface ContainerContentDescriptor2 {
    kind: string
    identifiers: Identifiers6
    url: string
}

export interface Identifiers6 {
    storeAdamID: string
}

export interface ContainerArtwork {
    dictionary: Dictionary2
}

export interface Dictionary2 {
    width: number
    height: number
    url: string
    hasP3: boolean
}
