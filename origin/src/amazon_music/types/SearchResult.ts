export interface SearchResult {
    methods: Method[]
}

interface Method {
    interface: string
    template: Template
    queue: Queue62
    forced: boolean
}

interface Template {
    interface: string
    widgets: Widget[]
    templateData: TemplateData5
    searchHeader: SearchHeader
    refinementHeader: RefinementHeader
    onEndOfWidgetsReached: any[]
    onCreated: OnCreated6[]
    onBound: any[]
    onViewed: OnViewed7[]
    onInteraction: any[]
    onLeave: any[]
    launchMode: string
    cacheSeconds: number
}

interface Widget {
    interface: string
    items: AmazonSearchTrack[]
    header: string
    onEndOfWidget: any[]
    allowEmptyHeader?: boolean
    uuid: string
    onViewed: OnViewed4[]
    seeMoreItem?: SeeMoreItem
    visualShovelerElementSize?: string
    isCompact?: boolean
}

export interface AmazonSearchTrack {
    interface: string
    primaryText: PrimaryText
    primaryLink: PrimaryLink
    image: string
    imageAltText: string
    actionIconName: string
    actionIconLink: ActionIconLink
    iconButton: IconButton
    contextMenu?: ContextMenu2
    tags: string[]
    alwaysDisplayIcon?: boolean
    isDisabled: boolean
    label?: string
    secondaryText?: string
    showNavigationIcon?: boolean
    isFeatured?: boolean
    isCompressed?: boolean
    isLocked?: boolean
    isActive?: boolean
    button?: Button
    secondaryLink?: SecondaryLink
    hintIconName?: string
    leftButton?: LeftButton
    tertiaryText?: string
    tertiaryLink?: TertiaryLink
}

interface PrimaryText {
    interface: string
    text: string
    disabled: boolean
    observer?: Observer
}

interface Observer {
    interface: string
    storageGroup: string
    storageKey: string
    states: States
    defaultValue: DefaultValue
}

interface States { }

interface DefaultValue {
    interface: string
    text: string
    disabled: boolean
}

interface PrimaryLink {
    interface: string
    deeplink: string
    onItemSelected: OnItemSelected[]
}

interface OnItemSelected {
    interface: string
    url?: string
    clientInformation?: string[]
    before?: any[]
    after?: any[]
    onSuccess?: any[]
    onError?: any[]
    queue: Queue
    forced: boolean
    target?: string
    preset?: string
    template?: Template2
    screenMode?: string
}

interface Queue {
    interface: string
    id: string
}

interface Template2 {
    interface: string
    headerText?: HeaderText
    widgets: any[]
    templateData: TemplateData
    backgroundImage?: string
    headerLabel?: string
    headerButtons?: HeaderButton[]
    contextMenu?: ContextMenu
    headerPrimaryText?: string
    headerTertiaryText?: string
    headerBadges?: any[]
    headerImage?: string
    headerImageKind?: string
    headerImageAltText?: string
    upsellButtonElement?: UpsellButtonElement
    entityDetails?: EntityDetails
    onHeaderIconSelected?: any[]
    shouldHideContent?: boolean
    templateType?: string
    onCreated: OnCreated[]
    onBound: any[]
    onViewed: OnViewed[]
    onInteraction: any[]
    onLeave: any[]
    launchMode: string
    cacheSeconds: number
    isSmallHeaderCentered?: boolean
    isBackgroundImageBlurred?: boolean
    isLargeFormat?: boolean
    headeris_emptyTemplate?: boolean
    headerEmptyTemplatePrimaryText?: string
    onEndOfWidgetsReached?: any[]
    isEnumerated?: boolean
}

interface HeaderText {
    interface: string
    text: string
    disabled: boolean
    observer?: Observer2
}

interface Observer2 {
    interface: string
    storageGroup: string
    storageKey: string
    states: States2
    defaultValue: DefaultValue2
}

interface States2 { }

interface DefaultValue2 {
    interface: string
    text: string
    disabled: boolean
}

interface TemplateData {
    interface: string
    deeplink: string
    seoHead?: SeoHead
    title: string
    description: string
    keywords: string
}

interface SeoHead {
    interface: string
    title: string
    meta: Meum[]
    link: Link[]
    script: any[]
}

interface Meum {
    interface: string
    name: string
    content: string
}

interface Link {
    interface: string
    rel: string
    href: string
}

interface HeaderButton {
    interface: string
    text: string
    icon: string
    iconOnly: boolean
    outline: boolean
    keepInSyncWithNavigationUrl: boolean
    disabled: boolean
    onItemSelected: any[]
    observer: Observer3
}

interface Observer3 {
    interface: string
    storageGroup: string
    storageKey: string
    states: States3
    defaultState: string
}

interface States3 {
    PAUSED: Paused
    STOPPED: Stopped
    PLAYING: Playing
}

interface Paused {
    interface: string
    text: string
    icon: string
    iconOnly: boolean
    outline: boolean
    keepInSyncWithNavigationUrl: boolean
    disabled: boolean
    onItemSelected: OnItemSelected2[]
}

interface OnItemSelected2 {
    interface: string
    queue: Queue2
    forced: boolean
}

interface Queue2 {
    interface: string
    id: string
}

interface Stopped {
    interface: string
    text: string
    icon: string
    iconOnly: boolean
    outline: boolean
    keepInSyncWithNavigationUrl: boolean
    disabled: boolean
    onItemSelected: OnItemSelected3[]
}

interface OnItemSelected3 {
    interface: string
    url: string
    clientInformation: string[]
    before: any[]
    after: any[]
    onSuccess: any[]
    onError: any[]
    queue: Queue3
    forced: boolean
}

interface Queue3 {
    interface: string
    id: string
}

interface Playing {
    interface: string
    text: string
    icon: string
    iconOnly: boolean
    outline: boolean
    keepInSyncWithNavigationUrl: boolean
    disabled: boolean
    onItemSelected: OnItemSelected4[]
}

interface OnItemSelected4 {
    interface: string
    queue: Queue4
    forced: boolean
}

interface Queue4 {
    interface: string
    id: string
}

interface ContextMenu {
    interface: string
    options: Option[]
    onItemSelected: OnItemSelected6[]
    disabled: boolean
}

interface Option {
    interface: string
    text: string
    icon: string
    disabled: boolean
    hidden: boolean
    onItemSelected: OnItemSelected5[]
}

interface OnItemSelected5 {
    interface: string
    url: string
    clientInformation: any[]
    before: any[]
    after: any[]
    onSuccess: any[]
    onError: OnError[]
    queue: Queue6
    forced: boolean
}

interface OnError {
    interface: string
    key: string
    after: any[]
    onNoMethodsStored: any[]
    queue: Queue5
    forced: boolean
}

interface Queue5 {
    interface: string
    id: string
}

interface Queue6 {
    interface: string
    id: string
}

interface OnItemSelected6 {
    interface: string
    url: string
    clientInformation: any[]
    before: any[]
    after: any[]
    onSuccess: any[]
    onError: any[]
    queue: Queue7
    forced: boolean
}

interface Queue7 {
    interface: string
    id: string
}

interface UpsellButtonElement {
    interface: string
    text: string
    iconOnly: boolean
    outline: boolean
    keepInSyncWithNavigationUrl: boolean
    disabled: boolean
    onItemSelected: OnItemSelected7[]
}

interface OnItemSelected7 {
    interface: string
    url: string
    clientInformation: any[]
    before: any[]
    after: any[]
    onSuccess: any[]
    onError: any[]
    queue: Queue8
    forced: boolean
}

interface Queue8 {
    interface: string
    id: string
}

interface EntityDetails {
    interface: string
    languageOfPerformanceHeading: string
    languageOfPerformances: any[]
    awardsHeading: any
    awards: any
    biographyHeading: any
    biographies: any
}

interface OnCreated {
    interface: string
    url?: string
    clientInformation?: any[]
    before?: any[]
    after?: any[]
    onSuccess?: any[]
    onError?: OnError2[]
    queue: Queue10
    forced: boolean
    group?: string
}

interface OnError2 {
    interface: string
    key: string
    after: any[]
    onNoMethodsStored: any[]
    queue: Queue9
    forced: boolean
}

interface Queue9 {
    interface: string
    id: string
}

interface Queue10 {
    interface: string
    id: string
}

interface OnViewed {
    interface: string
    url: string
    clientInformation: string[]
    before: any[]
    after: any[]
    onSuccess: any[]
    onError: any[]
    queue: Queue11
    forced: boolean
}

interface Queue11 {
    interface: string
    id: string
}

interface ActionIconLink {
    interface: string
    onItemSelected: OnItemSelected8[]
}

interface OnItemSelected8 {
    interface: string
    url: string
    clientInformation: string[]
    before: any[]
    after: any[]
    onSuccess: any[]
    onError: any[]
    queue: Queue12
    forced: boolean
    target?: string
    preset?: string
}

interface Queue12 {
    interface: string
    id: string
}

interface IconButton {
    interface: string
    icon: string
    disabled: boolean
    onItemSelected: any[]
    observer: Observer4
}

interface Observer4 {
    interface: string
    storageGroup: string
    storageKey: string
    states: States4
    defaultState: string
}

interface States4 {
    LOADING: Loading
    PAUSED: Paused2
    STOPPED: Stopped2
    PLAYING: Playing2
}

interface Loading {
    interface: string
    icon: string
    disabled: boolean
    onItemSelected: any[]
}

interface Paused2 {
    interface: string
    icon: string
    disabled: boolean
    onItemSelected: OnItemSelected9[]
}

interface OnItemSelected9 {
    interface: string
    url?: string
    clientInformation?: any[]
    before?: any[]
    after?: any[]
    onSuccess?: any[]
    onError?: any[]
    queue: Queue13
    forced: boolean
}

interface Queue13 {
    interface: string
    id: string
}

interface Stopped2 {
    interface: string
    icon: string
    disabled: boolean
    onItemSelected: OnItemSelected10[]
}

interface OnItemSelected10 {
    interface: string
    url: string
    clientInformation: string[]
    before: any[]
    after: any[]
    onSuccess: any[]
    onError: any[]
    queue: Queue14
    forced: boolean
    target?: string
    preset?: string
}

interface Queue14 {
    interface: string
    id: string
}

interface Playing2 {
    interface: string
    icon: string
    disabled: boolean
    onItemSelected: OnItemSelected11[]
}

interface OnItemSelected11 {
    interface: string
    url?: string
    clientInformation?: any[]
    before?: any[]
    after?: any[]
    onSuccess?: any[]
    onError?: any[]
    queue: Queue15
    forced: boolean
}

interface Queue15 {
    interface: string
    id: string
}

interface ContextMenu2 {
    interface: string
    options: Option2[]
    onItemSelected: OnItemSelected22[]
    disabled: boolean
}

interface Option2 {
    interface: string
    text: string
    icon?: string
    disabled: boolean
    hidden: boolean
    onItemSelected: OnItemSelected12[]
    observer?: Observer6
}

interface OnItemSelected12 {
    interface: string
    url?: string
    clientInformation?: any[]
    before?: any[]
    after?: any[]
    onSuccess?: any[]
    onError?: OnError3[]
    queue: Queue17
    forced: boolean
    template?: Template3
    screenMode?: string
}

interface OnError3 {
    interface: string
    key: string
    after: any[]
    onNoMethodsStored: any[]
    queue: Queue16
    forced: boolean
}

interface Queue16 {
    interface: string
    id: string
}

interface Queue17 {
    interface: string
    id: string
}

interface Template3 {
    interface: string
    headerText?: HeaderText2
    widgets: any[]
    templateData: TemplateData2
    backgroundImage?: string
    headerLabel?: string
    headerButtons?: HeaderButton2[]
    contextMenu?: ContextMenu3
    headerImageKind?: string
    onHeaderIconSelected?: any[]
    shouldHideContent?: boolean
    templateType?: string
    onCreated: OnCreated2[]
    onBound: any[]
    onViewed: OnViewed2[]
    onInteraction: any[]
    onLeave: any[]
    launchMode: string
    cacheSeconds: number
    isSmallHeaderCentered?: boolean
    isBackgroundImageBlurred?: boolean
    isLargeFormat?: boolean
    headerPrimaryText?: string
    headerTertiaryText?: string
    headerBadges?: any[]
    headerImage?: string
    headerImageAltText?: string
    upsellButtonElement?: UpsellButtonElement2
    entityDetails?: EntityDetails2
    onEndOfWidgetsReached?: any[]
    isEnumerated?: boolean
}

interface HeaderText2 {
    interface: string
    text: string
    disabled: boolean
}

interface TemplateData2 {
    interface: string
    deeplink: string
    seoHead?: SeoHead2
    title: string
    description: string
    keywords: string
}

interface SeoHead2 {
    interface: string
    title: string
    meta: Meum2[]
    link: Link2[]
    script: any[]
}

interface Meum2 {
    interface: string
    name: string
    content: string
}

interface Link2 {
    interface: string
    rel: string
    href: string
}

interface HeaderButton2 {
    interface: string
    text: string
    icon: string
    iconOnly: boolean
    outline: boolean
    keepInSyncWithNavigationUrl: boolean
    disabled: boolean
    onItemSelected: OnItemSelected13[]
    observer?: Observer5
}

interface OnItemSelected13 {
    interface: string
    url: string
    clientInformation: any[]
    before: any[]
    after: any[]
    onSuccess: any[]
    onError: any[]
    queue: Queue18
    forced: boolean
}

interface Queue18 {
    interface: string
    id: string
}

interface Observer5 {
    interface: string
    storageGroup: string
    storageKey: string
    states: States5
    defaultState: string
}

interface States5 {
    PAUSED: Paused3
    STOPPED: Stopped3
    PLAYING: Playing3
}

interface Paused3 {
    interface: string
    text: string
    icon: string
    iconOnly: boolean
    outline: boolean
    keepInSyncWithNavigationUrl: boolean
    disabled: boolean
    onItemSelected: OnItemSelected14[]
}

interface OnItemSelected14 {
    interface: string
    queue: Queue19
    forced: boolean
}

interface Queue19 {
    interface: string
    id: string
}

interface Stopped3 {
    interface: string
    text: string
    icon: string
    iconOnly: boolean
    outline: boolean
    keepInSyncWithNavigationUrl: boolean
    disabled: boolean
    onItemSelected: OnItemSelected15[]
}

interface OnItemSelected15 {
    interface: string
    url: string
    clientInformation: any[]
    before: any[]
    after: any[]
    onSuccess: any[]
    onError: any[]
    queue: Queue20
    forced: boolean
}

interface Queue20 {
    interface: string
    id: string
}

interface Playing3 {
    interface: string
    text: string
    icon: string
    iconOnly: boolean
    outline: boolean
    keepInSyncWithNavigationUrl: boolean
    disabled: boolean
    onItemSelected: OnItemSelected16[]
}

interface OnItemSelected16 {
    interface: string
    queue: Queue21
    forced: boolean
}

interface Queue21 {
    interface: string
    id: string
}

interface ContextMenu3 {
    interface: string
    options: Option3[]
    onItemSelected: OnItemSelected18[]
    disabled: boolean
}

interface Option3 {
    interface: string
    text: string
    icon: string
    disabled: boolean
    hidden: boolean
    onItemSelected: OnItemSelected17[]
}

interface OnItemSelected17 {
    interface: string
    url: string
    clientInformation: any[]
    before: any[]
    after: any[]
    onSuccess: any[]
    onError: OnError4[]
    queue: Queue23
    forced: boolean
}

interface OnError4 {
    interface: string
    key: string
    after: any[]
    onNoMethodsStored: any[]
    queue: Queue22
    forced: boolean
}

interface Queue22 {
    interface: string
    id: string
}

interface Queue23 {
    interface: string
    id: string
}

interface OnItemSelected18 {
    interface: string
    url?: string
    clientInformation?: any[]
    before?: any[]
    after?: any[]
    onSuccess?: any[]
    onError?: any[]
    queue: Queue24
    forced: boolean
    id?: string
}

interface Queue24 {
    interface: string
    id: string
}

interface OnCreated2 {
    interface: string
    url?: string
    clientInformation?: any[]
    before?: any[]
    after?: any[]
    onSuccess?: any[]
    onError?: OnError5[]
    queue: Queue26
    forced: boolean
    group?: string
}

interface OnError5 {
    interface: string
    key: string
    after: any[]
    onNoMethodsStored: any[]
    queue: Queue25
    forced: boolean
}

interface Queue25 {
    interface: string
    id: string
}

interface Queue26 {
    interface: string
    id: string
}

interface OnViewed2 {
    interface: string
    url: string
    clientInformation: string[]
    before: any[]
    after: any[]
    onSuccess: any[]
    onError: any[]
    queue: Queue27
    forced: boolean
}

interface Queue27 {
    interface: string
    id: string
}

interface UpsellButtonElement2 {
    interface: string
    text: string
    iconOnly: boolean
    outline: boolean
    keepInSyncWithNavigationUrl: boolean
    disabled: boolean
    onItemSelected: OnItemSelected19[]
}

interface OnItemSelected19 {
    interface: string
    url: string
    clientInformation: any[]
    before: any[]
    after: any[]
    onSuccess: any[]
    onError: any[]
    queue: Queue28
    forced: boolean
}

interface Queue28 {
    interface: string
    id: string
}

interface EntityDetails2 {
    interface: string
    languageOfPerformanceHeading?: string
    languageOfPerformances?: any[]
    awardsHeading: any
    awards: any
    biographyHeading: any
    biographies: any
}

interface Observer6 {
    interface: string
    storageGroup: string
    storageKey: string
    states: States6
    defaultState: string
}

interface States6 {
    NOT_IN_LIBRARY: NotInLibrary
    IN_LIBRARY: InLibrary
    PENDING?: Pending
}

interface NotInLibrary {
    interface: string
    text: string
    icon?: string
    disabled: boolean
    hidden: boolean
    onItemSelected: OnItemSelected20[]
}

interface OnItemSelected20 {
    interface: string
    url?: string
    clientInformation?: any[]
    before?: any[]
    after?: any[]
    onSuccess?: any[]
    onError?: OnError6[]
    queue: Queue30
    forced: boolean
    group?: string
    key?: string
    value?: string
}

interface OnError6 {
    interface: string
    key: string
    after: any[]
    onNoMethodsStored: any[]
    queue: Queue29
    forced: boolean
}

interface Queue29 {
    interface: string
    id: string
}

interface Queue30 {
    interface: string
    id: string
}

interface InLibrary {
    interface: string
    text: string
    icon?: string
    disabled: boolean
    hidden: boolean
    onItemSelected: OnItemSelected21[]
}

interface OnItemSelected21 {
    interface: string
    url?: string
    clientInformation?: any[]
    before?: any[]
    after?: any[]
    onSuccess?: any[]
    onError?: OnError7[]
    queue: Queue32
    forced: boolean
    group?: string
    key?: string
    value?: string
}

interface OnError7 {
    interface: string
    key: string
    after: any[]
    onNoMethodsStored: any[]
    queue: Queue31
    forced: boolean
}

interface Queue31 {
    interface: string
    id: string
}

interface Queue32 {
    interface: string
    id: string
}

interface Pending {
    interface: string
    text: string
    disabled: boolean
    hidden: boolean
    onItemSelected: any[]
}

interface OnItemSelected22 {
    interface: string
    url?: string
    clientInformation?: any[]
    before?: any[]
    after?: any[]
    onSuccess?: any[]
    onError?: any[]
    queue: Queue33
    forced: boolean
    id?: string
}

interface Queue33 {
    interface: string
    id: string
}

interface Button {
    interface: string
    text: string
    icon: string
    iconOnly: boolean
    outline: boolean
    keepInSyncWithNavigationUrl: boolean
    disabled: boolean
    onItemSelected: any[]
    observer: Observer7
}

interface Observer7 {
    interface: string
    storageGroup: string
    storageKey: string
    states: States7
    defaultState: string
}

interface States7 {
    NOT_IN_LIBRARY: NotInLibrary2
    PENDING: Pending2
    IN_LIBRARY: InLibrary2
}

interface NotInLibrary2 {
    interface: string
    text: string
    icon: string
    iconOnly: boolean
    outline: boolean
    keepInSyncWithNavigationUrl: boolean
    disabled: boolean
    onItemSelected: OnItemSelected23[]
}

interface OnItemSelected23 {
    interface: string
    group?: string
    key?: string
    value?: string
    queue: Queue34
    forced: boolean
    url?: string
    clientInformation?: any[]
    before?: any[]
    after?: any[]
    onSuccess?: any[]
    onError?: OnError8[]
}

interface Queue34 {
    interface: string
    id: string
}

interface OnError8 {
    interface: string
    key: string
    after: any[]
    onNoMethodsStored: any[]
    queue: Queue35
    forced: boolean
}

interface Queue35 {
    interface: string
    id: string
}

interface Pending2 {
    interface: string
    text: string
    icon: string
    iconOnly: boolean
    outline: boolean
    keepInSyncWithNavigationUrl: boolean
    disabled: boolean
    onItemSelected: any[]
}

interface InLibrary2 {
    interface: string
    text: string
    icon: string
    iconHover?: string
    iconOnly: boolean
    outline: boolean
    keepInSyncWithNavigationUrl: boolean
    disabled: boolean
    onItemSelected: OnItemSelected24[]
}

interface OnItemSelected24 {
    interface: string
    group?: string
    key?: string
    value?: string
    queue: Queue36
    forced: boolean
    url?: string
    clientInformation?: any[]
    before?: any[]
    after?: any[]
    onSuccess?: any[]
    onError?: OnError9[]
}

interface Queue36 {
    interface: string
    id: string
}

interface OnError9 {
    interface: string
    key: string
    after: any[]
    onNoMethodsStored: any[]
    queue: Queue37
    forced: boolean
}

interface Queue37 {
    interface: string
    id: string
}

interface SecondaryLink {
    interface: string
    deeplink: string
    onItemSelected: OnItemSelected25[]
}

interface OnItemSelected25 {
    interface: string
    url?: string
    clientInformation?: any[]
    before?: any[]
    after?: any[]
    onSuccess?: any[]
    onError?: any[]
    queue: Queue38
    forced: boolean
    template?: Template4
    screenMode?: string
}

interface Queue38 {
    interface: string
    id: string
}

interface Template4 {
    interface: string
    headerText: HeaderText3
    widgets: any[]
    templateData: TemplateData3
    backgroundImage: string
    headerLabel: string
    headerButtons: any[]
    contextMenu: ContextMenu4
    headerImageKind: string
    onHeaderIconSelected: any[]
    shouldHideContent: boolean
    templateType: string
    onCreated: OnCreated3[]
    onBound: any[]
    onViewed: OnViewed3[]
    onInteraction: any[]
    onLeave: any[]
    launchMode: string
    cacheSeconds: number
    isSmallHeaderCentered: boolean
    isBackgroundImageBlurred: boolean
    isLargeFormat: boolean
}

interface HeaderText3 {
    interface: string
    text: string
    disabled: boolean
}

interface TemplateData3 {
    interface: string
    deeplink: string
    seoHead: SeoHead3
    title: string
    description: string
    keywords: string
}

interface SeoHead3 {
    interface: string
    title: string
    meta: Meum3[]
    link: Link3[]
    script: any[]
}

interface Meum3 {
    interface: string
    name: string
    content: string
}

interface Link3 {
    interface: string
    rel: string
    href: string
}

interface ContextMenu4 {
    interface: string
    options: Option4[]
    onItemSelected: OnItemSelected27[]
    disabled: boolean
}

interface Option4 {
    interface: string
    text: string
    icon: string
    disabled: boolean
    hidden: boolean
    onItemSelected: OnItemSelected26[]
}

interface OnItemSelected26 {
    interface: string
    url: string
    clientInformation: any[]
    before: any[]
    after: any[]
    onSuccess: any[]
    onError: OnError10[]
    queue: Queue40
    forced: boolean
}

interface OnError10 {
    interface: string
    key: string
    after: any[]
    onNoMethodsStored: any[]
    queue: Queue39
    forced: boolean
}

interface Queue39 {
    interface: string
    id: string
}

interface Queue40 {
    interface: string
    id: string
}

interface OnItemSelected27 {
    interface: string
    url?: string
    clientInformation?: any[]
    before?: any[]
    after?: any[]
    onSuccess?: any[]
    onError?: any[]
    queue: Queue41
    forced: boolean
    id?: string
}

interface Queue41 {
    interface: string
    id: string
}

interface OnCreated3 {
    interface: string
    url?: string
    clientInformation?: any[]
    before?: any[]
    after?: any[]
    onSuccess?: any[]
    onError?: OnError11[]
    queue: Queue43
    forced: boolean
    group?: string
}

interface OnError11 {
    interface: string
    key: string
    after: any[]
    onNoMethodsStored: any[]
    queue: Queue42
    forced: boolean
}

interface Queue42 {
    interface: string
    id: string
}

interface Queue43 {
    interface: string
    id: string
}

interface OnViewed3 {
    interface: string
    url: string
    clientInformation: string[]
    before: any[]
    after: any[]
    onSuccess: any[]
    onError: any[]
    queue: Queue44
    forced: boolean
}

interface Queue44 {
    interface: string
    id: string
}

interface LeftButton {
    interface: string
    text: string
    icon: string
    iconOnly: boolean
    outline: boolean
    keepInSyncWithNavigationUrl: boolean
    disabled: boolean
    onItemSelected: any[]
    observer: Observer8
}

interface Observer8 {
    interface: string
    storageGroup: string
    storageKey: string
    states: States8
    defaultState: string
}

interface States8 {
    NOT_IN_LIBRARY: NotInLibrary3
    PENDING: Pending3
    IN_LIBRARY: InLibrary3
}

interface NotInLibrary3 {
    interface: string
    text: string
    icon: string
    iconOnly: boolean
    outline: boolean
    keepInSyncWithNavigationUrl: boolean
    disabled: boolean
    onItemSelected: OnItemSelected28[]
}

interface OnItemSelected28 {
    interface: string
    group?: string
    key?: string
    value?: string
    queue: Queue45
    forced: boolean
    url?: string
    clientInformation?: any[]
    before?: any[]
    after?: any[]
    onSuccess?: any[]
    onError?: OnError12[]
}

interface Queue45 {
    interface: string
    id: string
}

interface OnError12 {
    interface: string
    key: string
    after: any[]
    onNoMethodsStored: any[]
    queue: Queue46
    forced: boolean
}

interface Queue46 {
    interface: string
    id: string
}

interface Pending3 {
    interface: string
    text: string
    icon: string
    iconOnly: boolean
    outline: boolean
    keepInSyncWithNavigationUrl: boolean
    disabled: boolean
    onItemSelected: any[]
}

interface InLibrary3 {
    interface: string
    text: string
    icon: string
    iconHover?: string
    iconOnly: boolean
    outline: boolean
    keepInSyncWithNavigationUrl: boolean
    disabled: boolean
    onItemSelected: OnItemSelected29[]
}

interface OnItemSelected29 {
    interface: string
    group?: string
    key?: string
    value?: string
    queue: Queue47
    forced: boolean
    url?: string
    clientInformation?: any[]
    before?: any[]
    after?: any[]
    onSuccess?: any[]
    onError?: OnError13[]
}

interface Queue47 {
    interface: string
    id: string
}

interface OnError13 {
    interface: string
    key: string
    after: any[]
    onNoMethodsStored: any[]
    queue: Queue48
    forced: boolean
}

interface Queue48 {
    interface: string
    id: string
}

interface TertiaryLink {
    interface: string
    deeplink: string
    onItemSelected: OnItemSelected30[]
}

interface OnItemSelected30 {
    interface: string
    url: string
    target?: string
    preset?: string
    clientInformation: string[]
    before: any[]
    after: any[]
    onSuccess: any[]
    onError: any[]
    queue: Queue49
    forced: boolean
}

interface Queue49 {
    interface: string
    id: string
}

interface OnViewed4 {
    interface: string
    url: string
    clientInformation: string[]
    before: any[]
    after: any[]
    onSuccess: any[]
    onError: any[]
    queue: Queue50
    forced: boolean
}

interface Queue50 {
    interface: string
    id: string
}

interface SeeMoreItem {
    interface: string
    text: string
    primaryLink: PrimaryLink2
}

interface PrimaryLink2 {
    interface: string
    deeplink: string
    onItemSelected: OnItemSelected31[]
}

interface OnItemSelected31 {
    interface: string
    url?: string
    clientInformation?: any[]
    before?: any[]
    after?: any[]
    onSuccess?: any[]
    onError?: any[]
    queue: Queue51
    forced: boolean
    template?: Template5
    screenMode?: string
}

interface Queue51 {
    interface: string
    id: string
}

interface Template5 {
    interface: string
    widgets: any[]
    templateData: TemplateData4
    onEndOfWidgetsReached: any[]
    onCreated: OnCreated4[]
    onBound: any[]
    onViewed: OnViewed5[]
    onInteraction: any[]
    onLeave: any[]
    launchMode: string
    cacheSeconds: number
    isEnumerated: boolean
}

interface TemplateData4 {
    interface: string
    deeplink: string
    seoHead: SeoHead4
    title: string
    description: string
    keywords: string
}

interface SeoHead4 {
    interface: string
    title: string
    meta: Meum4[]
    link: any[]
    script: any[]
}

interface Meum4 {
    interface: string
    name: string
    content: string
}

interface OnCreated4 {
    interface: string
    url?: string
    clientInformation?: any[]
    before?: any[]
    after?: any[]
    onSuccess?: any[]
    onError?: OnError14[]
    queue: Queue53
    forced: boolean
    group?: string
}

interface OnError14 {
    interface: string
    key: string
    after: any[]
    onNoMethodsStored: any[]
    queue: Queue52
    forced: boolean
}

interface Queue52 {
    interface: string
    id: string
}

interface Queue53 {
    interface: string
    id: string
}

interface OnViewed5 {
    interface: string
    url: string
    clientInformation: string[]
    before: any[]
    after: any[]
    onSuccess: any[]
    onError: any[]
    queue: Queue54
    forced: boolean
}

interface Queue54 {
    interface: string
    id: string
}

interface TemplateData5 {
    interface: string
    deeplink: string
    seoHead: SeoHead5
    title: string
    description: string
    keywords: string
}

interface SeoHead5 {
    interface: string
    title: string
    meta: Meum5[]
    link: any[]
    script: any[]
}

interface Meum5 {
    interface: string
    name: string
    content: string
}

interface SearchHeader {
    interface: string
    actions: Action[]
}

interface Action {
    interface: string
    prefix: string
    actionLabel: string
}

interface RefinementHeader {
    interface: string
    refinementOptions: RefinementOption[]
    text: string
    useFilter: boolean
    uuid: string
    onViewed: any[]
    isOpened: boolean
    isActive: boolean
    isDisabled: boolean
}

interface RefinementOption {
    interface: string
    text: string
    href: string
    onItemSelected: OnItemSelected32[]
    isActive: boolean
}

interface OnItemSelected32 {
    interface: string
    template: Template6
    screenMode: string
    queue: Queue58
    forced: boolean
}

interface Template6 {
    interface: string
    widgets: any[]
    templateData: TemplateData6
    onEndOfWidgetsReached: any[]
    onCreated: OnCreated5[]
    onBound: any[]
    onViewed: OnViewed6[]
    onInteraction: any[]
    onLeave: any[]
    launchMode: string
    cacheSeconds: number
}

interface TemplateData6 {
    interface: string
    deeplink: string
    seoHead: SeoHead6
    title: string
    description: string
    keywords: string
}

interface SeoHead6 {
    interface: string
    title: string
    meta: Meum6[]
    link: any[]
    script: any[]
}

interface Meum6 {
    interface: string
    name: string
    content: string
}

interface OnCreated5 {
    interface: string
    url: string
    clientInformation: string[]
    before: any[]
    after: any[]
    onSuccess: any[]
    onError: OnError15[]
    queue: Queue56
    forced: boolean
}

interface OnError15 {
    interface: string
    key: string
    after: any[]
    onNoMethodsStored: any[]
    queue: Queue55
    forced: boolean
}

interface Queue55 {
    interface: string
    id: string
}

interface Queue56 {
    interface: string
    id: string
}

interface OnViewed6 {
    interface: string
    url: string
    clientInformation: string[]
    before: any[]
    after: any[]
    onSuccess: any[]
    onError: any[]
    queue: Queue57
    forced: boolean
}

interface Queue57 {
    interface: string
    id: string
}

interface Queue58 {
    interface: string
    id: string
}

interface OnCreated6 {
    interface: string
    url: string
    clientInformation: any[]
    before: any[]
    after: any[]
    onSuccess: any[]
    onError: OnError16[]
    queue: Queue60
    forced: boolean
}

interface OnError16 {
    interface: string
    key: string
    after: any[]
    onNoMethodsStored: any[]
    queue: Queue59
    forced: boolean
}

interface Queue59 {
    interface: string
    id: string
}

interface Queue60 {
    interface: string
    id: string
}

interface OnViewed7 {
    interface: string
    url: string
    clientInformation: string[]
    before: any[]
    after: any[]
    onSuccess: any[]
    onError: any[]
    queue: Queue61
    forced: boolean
}

interface Queue61 {
    interface: string
    id: string
}

interface Queue62 {
    interface: string
    id: string
}
