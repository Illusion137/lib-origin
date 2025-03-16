export interface Album {
    pageMetrics: PageMetrics
    sections: Section[]
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
    data: Data
    invocationPoints: string[]
}

export interface Data {
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
    pageType: string
    pageFeatureName: string
    pageId: string
    page: string
}

export interface Custom { }

export interface Section {
    id: string
    itemKind: string
    presentation: Presentation
    items: AlbumItem[]
    containerContentDescriptor?: ContainerContentDescriptor3
    containerArtwork?: ContainerArtwork
    backgroundTreatment?: string
    header?: Header
    displaySeparator?: boolean
}

export interface Presentation {
    kind: string
    layout: any
}

export interface AlbumItem {
    id: string
    artwork?: Artwork
    title?: string
    subtitleLinks?: SubtitleLink[]
    tertiaryTitleLinks: any
    quaternaryTitle?: string
    modalPresentationDescriptor?: ModalPresentationDescriptor
    showExplicitBadge?: boolean
    audioBadges?: AudioBadges
    contentDescriptor?: ContentDescriptor2
    playButton?: PlayButton
    shuffleButton: any
    videoArtwork: any
    trackCount?: number
    siriBannerConfiguration: any
    isPreviewMode?: boolean
    offers?: Offer[]
    trackNumber?: number
    tertiaryLinks: any
    duration?: number
    playAction?: PlayAction
    layoutStyle?: LayoutStyle
    isProminent?: boolean
    pauseAction?: PauseAction
    resumeAction?: ResumeAction
    isDisabled?: boolean
    composer?: string
    showPopularityIndicator?: boolean
    discNumber?: number
    artistName?: string
    previewUrl?: string
    socialProfileContentDescriptor: any
    numberOfSocialBadges?: number
    description?: string
    linkSection: any
    titleLinks?: TitleLink[]
    segue?: Segue3
    accessibilityLabel?: string
    isAOD?: boolean
}

export interface Artwork {
    dictionary: Dictionary
    cropStyle?: string
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
    segue?: Segue
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
}

export interface Identifiers {
    storeAdamID: string
}

export interface ActionMetrics {
    data: Daum[]
    custom: Custom2
}

export interface Daum {
    fields: Fields2
    includingFields: string[]
    excludingFields: any[]
    topic: string
    shouldFlush: boolean
}

export interface Fields2 {
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

export interface ModalPresentationDescriptor {
    headerTitle: string
    headerSubtitle: string
}

export interface AudioBadges {
    dolbyAtmos: boolean
    dolbyAudio: boolean
    lossless: boolean
    hiResLossless: boolean
    digitalMaster: boolean
}

export interface ContentDescriptor2 {
    kind: string
    identifiers: Identifiers2
    url: string
}

export interface Identifiers2 {
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
    data: Daum2[]
    custom: Custom3
}

export interface Daum2 {
    fields: Fields3
    includingFields: string[]
    excludingFields: any[]
    topic: string
    shouldFlush: boolean
}

export interface Fields3 {
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

export interface Custom3 { }

export interface Item2 {
    contentDescriptor: ContentDescriptor3
}

export interface ContentDescriptor3 {
    kind: string
    identifiers: Identifiers3
    url: string
}

export interface Identifiers3 {
    storeAdamID: string
}

export interface ContainerContentDescriptor {
    kind: string
    identifiers: Identifiers4
    url: string
}

export interface Identifiers4 {
    storeAdamID: string
}

export interface Offer {
    buyParams: string
    type: string
    priceFormatted: string
    price: number
}

export interface PlayAction {
    $kind: string
    actionMetrics: ActionMetrics3
    items: Item3[]
    groupingIdentifier?: string
    containerContentDescriptor?: ContainerContentDescriptor2
}

export interface ActionMetrics3 {
    data: Daum3[]
    custom: Custom4
}

export interface Daum3 {
    fields: Fields4
    includingFields: string[]
    excludingFields: any[]
    topic: string
    shouldFlush: boolean
}

export interface Fields4 {
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

export interface Custom4 { }

export interface Item3 {
    contentDescriptor: ContentDescriptor4
}

export interface ContentDescriptor4 {
    kind: string
    identifiers: Identifiers5
    url: string
}

export interface Identifiers5 {
    storeAdamID: string
}

export interface ContainerContentDescriptor2 {
    kind: string
    identifiers: Identifiers6
    url: string
}

export interface Identifiers6 {
    storeAdamID: string
}

export interface LayoutStyle {
    kind: string
    hasVideo: boolean
}

export interface PauseAction {
    $kind: string
    actionMetrics: ActionMetrics4
}

export interface ActionMetrics4 {
    data: any[]
    custom: Custom5
}

export interface Custom5 { }

export interface ResumeAction {
    $kind: string
    actionMetrics: ActionMetrics5
}

export interface ActionMetrics5 {
    data: any[]
    custom: Custom6
}

export interface Custom6 { }

export interface TitleLink {
    title: string
}

export interface Segue3 {
    $kind: string
    destination: Destination2
    actionMetrics: ActionMetrics6
}

export interface Destination2 {
    kind: string
    contentDescriptor: ContentDescriptor5
    prominentItemIdentifier: any
}

export interface ContentDescriptor5 {
    kind: string
    identifiers: Identifiers7
    url: string
}

export interface Identifiers7 {
    storeAdamID: string
}

export interface ActionMetrics6 {
    data: Daum4[]
    custom: Custom7
}

export interface Daum4 {
    fields: Fields5
    includingFields: string[]
    excludingFields: any[]
    topic: string
    shouldFlush: boolean
}

export interface Fields5 {
    actionDetails: ActionDetails4
    actionUrl: string
    actionType: string
    eventType: string
    targetType: string
    targetId: string
    eventVersion: number
}

export interface ActionDetails4 {
    kind: string
}

export interface Custom7 { }

export interface ContainerContentDescriptor3 {
    kind: string
    identifiers: Identifiers8
    url: string
}

export interface Identifiers8 {
    storeAdamID: string
}

export interface ContainerArtwork {
    dictionary: Dictionary2
}

export interface Dictionary2 {
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

export interface Header {
    kind: string
    item: Item4
}

export interface Item4 {
    titleLink: TitleLink2
}

export interface TitleLink2 {
    title: string
    segue?: Segue4
}

export interface Segue4 {
    $kind: string
    destination: Destination3
    actionMetrics: ActionMetrics7
}

export interface Destination3 {
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

export interface ActionMetrics7 {
    data: Daum5[]
    custom: Custom8
}

export interface Daum5 {
    fields: Fields6
    includingFields: string[]
    excludingFields: any[]
    topic: string
    shouldFlush: boolean
}

export interface Fields6 {
    actionUrl: string
    actionType: string
    eventType: string
    targetType: string
    targetId: string
    eventVersion: number
}

export interface Custom8 { }

export interface InvalidationRules {
    eventTriggers: EventTrigger[]
}

export interface EventTrigger {
    events: Event[]
    intent: Intent2
}

export interface Event {
    name: string
}

export interface Intent2 {
    $kind: string
    intent: Intent3
    reason: string
}

export interface Intent3 {
    $kind: string
    contentDescriptor: ContentDescriptor6
    prominentItemIdentifier: any
}

export interface ContentDescriptor6 {
    kind: string
    identifiers: Identifiers9
    url: string
    locale: Locale
}

export interface Identifiers9 {
    storeAdamID: string
}

export interface Locale {
    storefront: string
    language: any
}

export interface SeoData {
    pageTitle: string
}
