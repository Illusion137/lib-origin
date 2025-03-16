export interface GetArtistData {
    pageMetrics: PageMetrics
    sections: Section[]
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
    pageDetails: PageDetails
    pageUrl: string
    pageType: string
    pageFeatureName: string
    pageId: string
    page: string
}

export interface PageDetails {
    content: string
}

export interface Custom { }

export interface Section {
    id: string
    itemKind: string
    presentation: Presentation
    items: ArtistSectionItem[]
    header?: Header
    invalidationRules: any
    backgroundTreatment?: string
    pinnedLeadingItem?: PinnedLeadingItem
    displaySeparator?: boolean
}

export interface Presentation {
    kind: string
    layout?: Layout
}

export interface Layout {
    kind: string
    numberOfRows: number
}

export interface ArtistSectionItem {
    id: string
    artwork?: Artwork
    title?: string
    contentDescriptor?: ContentDescriptor
    playAction?: PlayAction
    uberArtwork: any
    videoArtwork: any
    trackNumber: any
    tertiaryLinks: any
    duration?: number
    subtitleLinks?: SubtitleLink[]
    layoutStyle?: string
    showExplicitBadge?: boolean
    isProminent?: boolean
    pauseAction?: PauseAction
    resumeAction?: ResumeAction
    isDisabled?: boolean
    isPreviewMode?: boolean
    composer?: string
    showPopularityIndicator?: boolean
    discNumber?: number
    artistName?: string
    previewUrl?: string
    segue?: Segue
    openContextualMenuAction?: OpenContextualMenuAction
    titleLinks?: TitleLink[]
    numberOfSocialBadges?: number
    accessibilityLabel?: string
    trackCount?: number
    isAOD?: boolean
    modalPresentationDescriptor?: ModalPresentationDescriptor
    subsections?: Subsection[]
    name?: string
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

export interface ContentDescriptor {
    kind: string
    identifiers: Identifiers
    url: string
}

export interface Identifiers {
    storeAdamID: string
}

export interface PlayAction {
    $kind: string
    actionMetrics: ActionMetrics
    items: Item2[]
    groupingIdentifier?: string
    containerContentDescriptor?: ContainerContentDescriptor
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

export interface SubtitleLink {
    title: string
}

export interface PauseAction {
    $kind: string
    actionMetrics: ActionMetrics2
}

export interface ActionMetrics2 {
    data: any[]
    custom: Custom3
}

export interface Custom3 { }

export interface ResumeAction {
    $kind: string
    actionMetrics: ActionMetrics3
}

export interface ActionMetrics3 {
    data: any[]
    custom: Custom4
}

export interface Custom4 { }

export interface Segue {
    $kind: string
    destination: Destination
    actionMetrics: ActionMetrics4
}

export interface Destination {
    kind: string
    contentDescriptor: ContentDescriptor3
    prominentItemIdentifier?: string
}

export interface ContentDescriptor3 {
    kind: string
    identifiers: Identifiers4
    url: string
}

export interface Identifiers4 {
    storeAdamID: string
}

export interface ActionMetrics4 {
    data: Daum2[]
    custom: Custom5
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

export interface Custom5 { }

export interface OpenContextualMenuAction {
    $kind: string
    actionMetrics: ActionMetrics5
}

export interface ActionMetrics5 {
    data: Daum3[]
    custom: Custom6
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

export interface Custom6 { }

export interface TitleLink {
    title: string
}

export interface ModalPresentationDescriptor {
    headerTitle: string
    headerSubtitle: any
    paragraphText: string
}

export interface Subsection {
    title: string
    content: string
}

export interface Header {
    kind: string
    item: Item3
}

export interface Item3 {
    titleLink: TitleLink2
    accessoryButtons: any
}

export interface TitleLink2 {
    title: string
    segue?: Segue2
}

export interface Segue2 {
    $kind: string
    destination: Destination2
    actionMetrics: ActionMetrics6
}

export interface Destination2 {
    kind: string
    intent: Intent
}

export interface Intent {
    artistId: string
    sectionId: string
    storefront: string
    language: any
    $kind: string
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
    actionUrl: string
    actionType: string
    eventType: string
    targetType: string
    targetId: string
    eventVersion: number
}

export interface Custom7 { }

export interface PinnedLeadingItem {
    item: PinnedLeadingItemItem
    kind: string
    title: string
}

export interface PinnedLeadingItemItem {
    id: string
    headline: string
    title: string
    subtitle: string
    contentDescriptor: ContentDescriptor4
    artwork: Artwork2
    playAction: PlayAction2
    segue: Segue3
    showExplicitBadge: boolean
    artworkStyling: string
    trackCount: number
}

export interface ContentDescriptor4 {
    kind: string
    identifiers: Identifiers5
    url: string
}

export interface Identifiers5 {
    storeAdamID: string
}

export interface Artwork2 {
    dictionary: Dictionary2
    cropStyle: string
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

export interface PlayAction2 {
    $kind: string
    actionMetrics: ActionMetrics7
    items: Item5[]
    groupingIdentifier: any
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

export interface Custom8 { }

export interface Item5 {
    contentDescriptor: ContentDescriptor5
}

export interface ContentDescriptor5 {
    kind: string
    identifiers: Identifiers6
    url: string
}

export interface Identifiers6 {
    storeAdamID: string
}

export interface Segue3 {
    $kind: string
    destination: Destination3
    actionMetrics: ActionMetrics8
}

export interface Destination3 {
    kind: string
    contentDescriptor: ContentDescriptor6
    prominentItemIdentifier: any
}

export interface ContentDescriptor6 {
    kind: string
    identifiers: Identifiers7
    url: string
}

export interface Identifiers7 {
    storeAdamID: string
}

export interface ActionMetrics8 {
    data: Daum6[]
    custom: Custom9
}

export interface Daum6 {
    fields: Fields7
    includingFields: string[]
    excludingFields: any[]
    topic: string
    shouldFlush: boolean
}

export interface Fields7 {
    actionDetails: ActionDetails5
    actionUrl: string
    actionType: string
    eventType: string
    targetType: string
    targetId: string
    eventVersion: number
}

export interface ActionDetails5 {
    kind: string
}

export interface Custom9 { }

export interface SeoData {
    pageTitle: string
}
