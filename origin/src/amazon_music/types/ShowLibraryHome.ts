export interface ShowLibraryHome {
    methods: (TemplateListBindMethod|InterfaceInterfaceMethod)[]
}

interface TemplateListBindMethod {
    interface: "TemplateListInterface.v1_0.BindTemplateMethod"
    template: Template
    queue: Queue64
    forced: boolean
}

interface InterfaceInterfaceMethod {
    interface: "InteractionInterface.v1_0.InvokeHttpSkillMethod"
    url: string
    clientInformation: any[]
    before: any[]
    after: any[]
    onSuccess: any[]
    onError: any[]
    queue: Queue
    forced: boolean
}

interface Template {
    interface: string
    emptyTemplateTitle: string
    emptyTemplateText: string
    emptyTemplateButtonText: string
    emptyTemplateButtonPrimaryLink: EmptyTemplateButtonPrimaryLink
    shouldHideSubNav: boolean
    widgets: Widget[]
    templateData: TemplateData6
    onEndOfWidgetsReached: any[]
    onCreated: OnCreated6[]
    onBound: any[]
    onViewed: OnViewed7[]
    onInteraction: any[]
    onLeave: any[]
    launchMode: string
    cacheSeconds: number
    isExploreButtonAndEmptyPromptNeeded: boolean
}

interface EmptyTemplateButtonPrimaryLink {
    interface: string
    deeplink: string
    onItemSelected: OnItemSelected[]
}

interface OnItemSelected {
    interface: string
    template?: Template2
    screenMode?: string
    queue: Queue4
    forced: boolean
    url?: string
    clientInformation?: any[]
    before?: any[]
    after?: any[]
    onSuccess?: any[]
    onError?: any[]
}

interface Template2 {
    interface: string
    widgets: any[]
    templateData: TemplateData
    onEndOfWidgetsReached: any[]
    onCreated: OnCreated[]
    onBound: any[]
    onViewed: OnViewed[]
    onInteraction: any[]
    onLeave: any[]
    launchMode: string
    cacheSeconds: number
    isEnumerated: boolean
}

interface TemplateData {
    interface: string
    deeplink: string
    seoHead: SeoHead
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

interface OnCreated {
    interface: string
    url?: string
    clientInformation?: any[]
    before?: any[]
    after?: any[]
    onSuccess?: any[]
    onError?: OnError[]
    queue: Queue2
    forced: boolean
    group?: string
}

interface OnError {
    interface: string
    key: string
    after: any[]
    onNoMethodsStored: any[]
    queue: Queue
    forced: boolean
}

interface Queue {
    interface: string
    id: string
}

interface Queue2 {
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
    queue: Queue3
    forced: boolean
}

interface Queue3 {
    interface: string
    id: string
}

interface Queue4 {
    interface: string
    id: string
}

interface Widget {
    interface: string
    items: Item[]
    header: string
    uuid: string
    onViewed: OnViewed5[]
    isHorizontalScrollable?: boolean
    seeMoreItem?: SeeMoreItem
    additionalActionButtons?: AdditionalActionButton[]
    onEndOfWidget?: any[]
    visualShovelerElementSize?: string
    isCompact?: boolean
}

interface Item {
    interface: string
    text?: string
    onItemSelected?: OnItemSelected2[]
    primaryLink: PrimaryLink3
    primaryText?: PrimaryText
    image?: string
    imageAltText?: string
    actionIconName?: string
    actionIconLink?: ActionIconLink
    iconButton?: IconButton
    contextMenu?: ContextMenu2
    tags?: any[]
    alwaysDisplayIcon?: boolean
    isDisabled?: boolean
    label?: string
    badgeLabel?: string
    leftButton?: LeftButton
    hintIconName?: string
}

interface OnItemSelected2 {
    interface: string
    url?: string
    clientInformation?: string[]
    before?: any[]
    after?: any[]
    onSuccess?: any[]
    onError?: any[]
    queue: Queue5
    forced: boolean
    template?: Template3
    screenMode?: string
    target?: string
    preset?: string
}

interface Queue5 {
    interface: string
    id: string
}

interface Template3 {
    interface: string
    shouldHideSubNav: boolean
    widgets: any[]
    templateData: TemplateData2
    header: string
    refinementHeader: RefinementHeader
    onEndOfWidgetsReached: any[]
    onCreated: OnCreated2[]
    onBound: any[]
    onViewed: OnViewed2[]
    onInteraction: any[]
    onLeave: any[]
    launchMode: string
    cacheSeconds: number
    isExploreButtonAndEmptyPromptNeeded: boolean
    button?: Button
}

interface TemplateData2 {
    interface: string
    deeplink: string
    seoHead: SeoHead2
    title: string
    description: string
    keywords: string
}

interface SeoHead2 {
    interface: string
    title: string
    meta: Meum2[]
    link: any[]
    script: any[]
}

interface Meum2 {
    interface: string
    name: string
    content: string
}

interface RefinementHeader {
    interface: string
    refinementOptions: any[]
    text: string
    useFilter: boolean
    uuid: string
    onViewed: any[]
    isActive: boolean
    isOpened: boolean
    isDisabled: boolean
}

interface OnCreated2 {
    interface: string
    url?: string
    clientInformation?: any[]
    before?: any[]
    after?: any[]
    onSuccess?: any[]
    onError?: OnError2[]
    queue: Queue7
    forced: boolean
    group?: string
}

interface OnError2 {
    interface: string
    key: string
    after: any[]
    onNoMethodsStored: any[]
    queue: Queue6
    forced: boolean
}

interface Queue6 {
    interface: string
    id: string
}

interface Queue7 {
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
    queue: Queue8
    forced: boolean
}

interface Queue8 {
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
    onItemSelected: OnItemSelected3[]
}

interface OnItemSelected3 {
    interface: string
    template: Template4
    screenMode: string
    queue: Queue12
    forced: boolean
}

interface Template4 {
    interface: string
    header: string
    buttons: Button2[]
    closeButton: CloseButton
    textInputHeader: string
    textInputPlaceholder: string
    textInputMaxLength: number
    textInputMaxLengthErrorMessage: string
    onCreated: any[]
    onBound: any[]
    onViewed: any[]
    onInteraction: any[]
    onLeave: any[]
    launchMode: string
    cacheSeconds: number
}

interface Button2 {
    interface: string
    text: string
    primaryLink: PrimaryLink
}

interface PrimaryLink {
    interface: string
    onItemSelected: OnItemSelected4[]
}

interface OnItemSelected4 {
    interface: string
    url: string
    clientInformation: string[]
    before: any[]
    after: any[]
    onSuccess: any[]
    onError: OnError3[]
    queue: Queue10
    forced: boolean
}

interface OnError3 {
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

interface CloseButton {
    interface: string
    altText: string
    icon: string
    primaryLink: PrimaryLink2
}

interface PrimaryLink2 {
    interface: string
    onItemSelected: OnItemSelected5[]
}

interface OnItemSelected5 {
    interface: string
    queue: Queue11
    forced: boolean
}

interface Queue11 {
    interface: string
    id: string
}

interface Queue12 {
    interface: string
    id: string
}

interface PrimaryLink3 {
    interface: string
    deeplink: string
    onItemSelected: OnItemSelected6[]
}

interface OnItemSelected6 {
    interface: string
    template?: Template5
    screenMode?: string
    queue: Queue25
    forced: boolean
    url?: string
    clientInformation?: any[]
    before?: any[]
    after?: any[]
    onSuccess?: any[]
    onError?: any[]
}

interface Template5 {
    interface: string
    headerText?: HeaderText
    widgets: any[]
    templateData: TemplateData3
    backgroundImage?: string
    headerBadgeLabel?: string
    headerLabel?: string
    headerButtons?: HeaderButton[]
    contextMenu?: ContextMenu
    headerSecondaryText?: string
    headerTertiaryText?: string
    headerImage?: string
    headerImageKind?: string
    headerImageAltText?: string
    headerImageDimension?: string
    onHeaderIconSelected?: any[]
    shouldHideContent?: boolean
    templateType?: string
    onCreated: OnCreated3[]
    onBound: any[]
    onViewed: OnViewed3[]
    onInteraction: any[]
    onLeave: any[]
    launchMode: string
    cacheSeconds: number
    isBackgroundImageBlurred?: boolean
    isLargeFormat?: boolean
    isSmallHeaderCentered?: boolean
    shouldHideSubNav?: boolean
    header?: string
    refinementHeader?: RefinementHeader2
    onEndOfWidgetsReached?: any[]
    isExploreButtonAndEmptyPromptNeeded?: boolean
    headeris_emptyTemplate?: boolean
    headerEmptyTemplatePrimaryText?: string
    upsellButtonElement?: UpsellButtonElement
}

interface HeaderText {
    interface: string
    text: string
    disabled: boolean
    observer: Observer
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
    link: Link2[]
    script: any[]
}

interface Meum3 {
    interface: string
    name: string
    content: string
}

interface Link2 {
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
    onItemSelected: OnItemSelected7[]
    observer?: Observer2
}

interface OnItemSelected7 {
    interface: string
    url: string
    clientInformation: any[]
    before: any[]
    after: any[]
    onSuccess: any[]
    onError: any[]
    queue: Queue13
    forced: boolean
}

interface Queue13 {
    interface: string
    id: string
}

interface Observer2 {
    interface: string
    storageGroup: string
    storageKey: string
    states: States2
    defaultState: string
}

interface States2 {
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
    onItemSelected: OnItemSelected8[]
}

interface OnItemSelected8 {
    interface: string
    queue: Queue14
    forced: boolean
}

interface Queue14 {
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
    onItemSelected: OnItemSelected9[]
}

interface OnItemSelected9 {
    interface: string
    url: string
    clientInformation: string[]
    before: any[]
    after: any[]
    onSuccess: any[]
    onError: any[]
    queue: Queue15
    forced: boolean
}

interface Queue15 {
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
    onItemSelected: OnItemSelected10[]
}

interface OnItemSelected10 {
    interface: string
    queue: Queue16
    forced: boolean
}

interface Queue16 {
    interface: string
    id: string
}

interface ContextMenu {
    interface: string
    options: Option[]
    onItemSelected: OnItemSelected13[]
    disabled: boolean
}

interface Option {
    interface: string
    text: string
    icon: string
    disabled: boolean
    hidden: boolean
    onItemSelected: OnItemSelected11[]
}

interface OnItemSelected11 {
    interface: string
    url?: string
    clientInformation?: any[]
    before?: any[]
    after?: any[]
    onSuccess?: any[]
    onError?: OnError4[]
    queue: Queue18
    forced: boolean
    template?: Template6
    screenMode?: string
}

interface OnError4 {
    interface: string
    key: string
    after: any[]
    onNoMethodsStored: any[]
    queue: Queue17
    forced: boolean
}

interface Queue17 {
    interface: string
    id: string
}

interface Queue18 {
    interface: string
    id: string
}

interface Template6 {
    interface: string
    header: string
    buttons: Button3[]
    body: Body
    onCreated: any[]
    onBound: any[]
    onViewed: any[]
    onInteraction: any[]
    onLeave: any[]
    launchMode: string
    cacheSeconds: number
}

interface Button3 {
    interface: string
    text: string
    primaryLink: PrimaryLink4
}

interface PrimaryLink4 {
    interface: string
    onItemSelected: OnItemSelected12[]
}

interface OnItemSelected12 {
    interface: string
    queue: Queue19
    forced: boolean
}

interface Queue19 {
    interface: string
    id: string
}

interface Body {
    interface: string
    text: string
    onItemSelected: any[]
}

interface OnItemSelected13 {
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

interface OnCreated3 {
    interface: string
    url?: string
    clientInformation?: any[]
    before?: any[]
    after?: any[]
    onSuccess?: any[]
    onError?: OnError5[]
    queue: Queue22
    forced: boolean
    group?: string
}

interface OnError5 {
    interface: string
    key: string
    after: any[]
    onNoMethodsStored: any[]
    queue: Queue21
    forced: boolean
}

interface Queue21 {
    interface: string
    id: string
}

interface Queue22 {
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
    queue: Queue23
    forced: boolean
}

interface Queue23 {
    interface: string
    id: string
}

interface RefinementHeader2 {
    interface: string
    refinementOptions: any[]
    text: string
    useFilter: boolean
    uuid: string
    onViewed: any[]
    isActive: boolean
    isOpened: boolean
    isDisabled: boolean
}

interface UpsellButtonElement {
    interface: string
    text: string
    iconOnly: boolean
    outline: boolean
    keepInSyncWithNavigationUrl: boolean
    disabled: boolean
    onItemSelected: OnItemSelected14[]
}

interface OnItemSelected14 {
    interface: string
    url: string
    clientInformation: any[]
    before: any[]
    after: any[]
    onSuccess: any[]
    onError: any[]
    queue: Queue24
    forced: boolean
}

interface Queue24 {
    interface: string
    id: string
}

interface Queue25 {
    interface: string
    id: string
}

interface PrimaryText {
    interface: string
    text: string
    disabled: boolean
    observer?: Observer3
}

interface Observer3 {
    interface: string
    storageGroup: string
    storageKey: string
    states: States3
    defaultValue: DefaultValue2
}

interface States3 { }

interface DefaultValue2 {
    interface: string
    text: string
    disabled: boolean
}

interface ActionIconLink {
    interface: string
    onItemSelected: OnItemSelected15[]
    deeplink?: string
}

interface OnItemSelected15 {
    interface: string
    url: string
    clientInformation: string[]
    before: any[]
    after: any[]
    onSuccess: any[]
    onError: any[]
    queue: Queue26
    forced: boolean
}

interface Queue26 {
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
    onItemSelected: OnItemSelected16[]
}

interface OnItemSelected16 {
    interface: string
    url?: string
    clientInformation?: any[]
    before?: any[]
    after?: any[]
    onSuccess?: any[]
    onError?: any[]
    queue: Queue27
    forced: boolean
}

interface Queue27 {
    interface: string
    id: string
}

interface Stopped2 {
    interface: string
    icon: string
    disabled: boolean
    onItemSelected: OnItemSelected17[]
}

interface OnItemSelected17 {
    interface: string
    url: string
    clientInformation: string[]
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

interface Playing2 {
    interface: string
    icon: string
    disabled: boolean
    onItemSelected: OnItemSelected18[]
}

interface OnItemSelected18 {
    interface: string
    url?: string
    clientInformation?: any[]
    before?: any[]
    after?: any[]
    onSuccess?: any[]
    onError?: any[]
    queue: Queue29
    forced: boolean
}

interface Queue29 {
    interface: string
    id: string
}

interface ContextMenu2 {
    interface: string
    options: Option2[]
    onItemSelected: OnItemSelected27[]
    disabled: boolean
}

interface Option2 {
    interface: string
    text: string
    icon?: string
    disabled: boolean
    hidden: boolean
    onItemSelected: OnItemSelected19[]
}

interface OnItemSelected19 {
    interface: string
    url?: string
    clientInformation?: any[]
    before?: any[]
    after?: any[]
    onSuccess?: any[]
    onError?: OnError6[]
    queue: Queue31
    forced: boolean
    template?: Template7
    screenMode?: string
}

interface OnError6 {
    interface: string
    key: string
    after: any[]
    onNoMethodsStored: any[]
    queue: Queue30
    forced: boolean
}

interface Queue30 {
    interface: string
    id: string
}

interface Queue31 {
    interface: string
    id: string
}

interface Template7 {
    interface: string
    widgets?: any[]
    templateData?: TemplateData4
    onEndOfWidgetsReached?: any[]
    onCreated: OnCreated4[]
    onBound: any[]
    onViewed: OnViewed4[]
    onInteraction: any[]
    onLeave: any[]
    launchMode: string
    cacheSeconds: number
    isEnumerated?: boolean
    header?: string
    buttons?: Button4[]
    body?: Body2
    headerText?: HeaderText2
    backgroundImage?: string
    headerBadgeLabel?: string
    headerLabel?: string
    headerButtons?: HeaderButton2[]
    contextMenu?: ContextMenu3
    headerSecondaryText?: string
    headerTertiaryText?: string
    headerImage?: string
    headerImageKind?: string
    headerImageAltText?: string
    headerImageDimension?: string
    onHeaderIconSelected?: any[]
    shouldHideContent?: boolean
    templateType?: string
    isBackgroundImageBlurred?: boolean
    isLargeFormat?: boolean
    isSmallHeaderCentered?: boolean
}

interface TemplateData4 {
    interface: string
    deeplink: string
    seoHead?: SeoHead4
    title: string
    description: string
    keywords: string
}

interface SeoHead4 {
    interface: string
    title: string
    meta: Meum4[]
    link: Link3[]
    script: any[]
}

interface Meum4 {
    interface: string
    name: string
    content: string
}

interface Link3 {
    interface: string
    rel: string
    href: string
}

interface OnCreated4 {
    interface: string
    url?: string
    clientInformation?: any[]
    before?: any[]
    after?: any[]
    onSuccess?: any[]
    onError?: OnError7[]
    queue: Queue33
    forced: boolean
    group?: string
}

interface OnError7 {
    interface: string
    key: string
    after: any[]
    onNoMethodsStored: any[]
    queue: Queue32
    forced: boolean
}

interface Queue32 {
    interface: string
    id: string
}

interface Queue33 {
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
    queue: Queue34
    forced: boolean
}

interface Queue34 {
    interface: string
    id: string
}

interface Button4 {
    interface: string
    text: string
    primaryLink: PrimaryLink5
}

interface PrimaryLink5 {
    interface: string
    onItemSelected: OnItemSelected20[]
}

interface OnItemSelected20 {
    interface: string
    queue: Queue35
    forced: boolean
}

interface Queue35 {
    interface: string
    id: string
}

interface Body2 {
    interface: string
    text: string
    onItemSelected: any[]
}

interface HeaderText2 {
    interface: string
    text: string
    disabled: boolean
    observer: Observer5
}

interface Observer5 {
    interface: string
    storageGroup: string
    storageKey: string
    states: States5
    defaultValue: DefaultValue3
}

interface States5 { }

interface DefaultValue3 {
    interface: string
    text: string
    disabled: boolean
}

interface HeaderButton2 {
    interface: string
    text: string
    icon: string
    iconOnly: boolean
    outline: boolean
    keepInSyncWithNavigationUrl: boolean
    disabled: boolean
    onItemSelected: OnItemSelected21[]
    observer?: Observer6
}

interface OnItemSelected21 {
    interface: string
    url: string
    clientInformation: any[]
    before: any[]
    after: any[]
    onSuccess: any[]
    onError: any[]
    queue: Queue36
    forced: boolean
}

interface Queue36 {
    interface: string
    id: string
}

interface Observer6 {
    interface: string
    storageGroup: string
    storageKey: string
    states: States6
    defaultState: string
}

interface States6 {
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
    onItemSelected: OnItemSelected22[]
}

interface OnItemSelected22 {
    interface: string
    queue: Queue37
    forced: boolean
}

interface Queue37 {
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
    onItemSelected: OnItemSelected23[]
}

interface OnItemSelected23 {
    interface: string
    url: string
    clientInformation: any[]
    before: any[]
    after: any[]
    onSuccess: any[]
    onError: any[]
    queue: Queue38
    forced: boolean
}

interface Queue38 {
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
    onItemSelected: OnItemSelected24[]
}

interface OnItemSelected24 {
    interface: string
    queue: Queue39
    forced: boolean
}

interface Queue39 {
    interface: string
    id: string
}

interface ContextMenu3 {
    interface: string
    options: Option3[]
    onItemSelected: OnItemSelected26[]
    disabled: boolean
}

interface Option3 {
    interface: string
    text: string
    icon: string
    disabled: boolean
    hidden: boolean
    onItemSelected: OnItemSelected25[]
}

interface OnItemSelected25 {
    interface: string
    url: string
    clientInformation: any[]
    before: any[]
    after: any[]
    onSuccess: any[]
    onError: OnError8[]
    queue: Queue41
    forced: boolean
}

interface OnError8 {
    interface: string
    key: string
    after: any[]
    onNoMethodsStored: any[]
    queue: Queue40
    forced: boolean
}

interface Queue40 {
    interface: string
    id: string
}

interface Queue41 {
    interface: string
    id: string
}

interface OnItemSelected26 {
    interface: string
    url: string
    clientInformation: any[]
    before: any[]
    after: any[]
    onSuccess: any[]
    onError: any[]
    queue: Queue42
    forced: boolean
}

interface Queue42 {
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
    queue: Queue43
    forced: boolean
    id?: string
}

interface Queue43 {
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
    NOT_IN_LIBRARY: NotInLibrary
    PENDING: Pending
    IN_LIBRARY: InLibrary
}

interface NotInLibrary {
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
    queue: Queue44
    forced: boolean
    url?: string
    clientInformation?: any[]
    before?: any[]
    after?: any[]
    onSuccess?: any[]
    onError?: OnError9[]
}

interface Queue44 {
    interface: string
    id: string
}

interface OnError9 {
    interface: string
    key: string
    after: any[]
    onNoMethodsStored: any[]
    queue: Queue45
    forced: boolean
}

interface Queue45 {
    interface: string
    id: string
}

interface Pending {
    interface: string
    text: string
    icon: string
    iconOnly: boolean
    outline: boolean
    keepInSyncWithNavigationUrl: boolean
    disabled: boolean
    onItemSelected: any[]
}

interface InLibrary {
    interface: string
    text: string
    icon: string
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
    queue: Queue46
    forced: boolean
    url?: string
    clientInformation?: any[]
    before?: any[]
    after?: any[]
    onSuccess?: any[]
    onError?: OnError10[]
}

interface Queue46 {
    interface: string
    id: string
}

interface OnError10 {
    interface: string
    key: string
    after: any[]
    onNoMethodsStored: any[]
    queue: Queue47
    forced: boolean
}

interface Queue47 {
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
    queue: Queue48
    forced: boolean
}

interface Queue48 {
    interface: string
    id: string
}

interface SeeMoreItem {
    interface: string
    text: string
    primaryLink: PrimaryLink6
}

interface PrimaryLink6 {
    interface: string
    deeplink: string
    onItemSelected: OnItemSelected30[]
}

interface OnItemSelected30 {
    interface: string
    template: Template8
    screenMode: string
    queue: Queue56
    forced: boolean
}

interface Template8 {
    interface: string
    button: Button5
    shouldHideSubNav: boolean
    widgets: any[]
    templateData: TemplateData5
    header: string
    refinementHeader: RefinementHeader3
    onEndOfWidgetsReached: any[]
    onCreated: OnCreated5[]
    onBound: any[]
    onViewed: OnViewed6[]
    onInteraction: any[]
    onLeave: any[]
    launchMode: string
    cacheSeconds: number
    isExploreButtonAndEmptyPromptNeeded: boolean
}

interface Button5 {
    interface: string
    text: string
    icon: string
    iconOnly: boolean
    outline: boolean
    keepInSyncWithNavigationUrl: boolean
    disabled: boolean
    onItemSelected: OnItemSelected31[]
}

interface OnItemSelected31 {
    interface: string
    template: Template9
    screenMode: string
    queue: Queue52
    forced: boolean
}

interface Template9 {
    interface: string
    header: string
    buttons: Button6[]
    closeButton: CloseButton2
    textInputHeader: string
    textInputPlaceholder: string
    textInputMaxLength: number
    textInputMaxLengthErrorMessage: string
    onCreated: any[]
    onBound: any[]
    onViewed: any[]
    onInteraction: any[]
    onLeave: any[]
    launchMode: string
    cacheSeconds: number
}

interface Button6 {
    interface: string
    text: string
    primaryLink: PrimaryLink7
}

interface PrimaryLink7 {
    interface: string
    onItemSelected: OnItemSelected32[]
}

interface OnItemSelected32 {
    interface: string
    url: string
    clientInformation: string[]
    before: any[]
    after: any[]
    onSuccess: any[]
    onError: OnError11[]
    queue: Queue50
    forced: boolean
}

interface OnError11 {
    interface: string
    key: string
    after: any[]
    onNoMethodsStored: any[]
    queue: Queue49
    forced: boolean
}

interface Queue49 {
    interface: string
    id: string
}

interface Queue50 {
    interface: string
    id: string
}

interface CloseButton2 {
    interface: string
    altText: string
    icon: string
    primaryLink: PrimaryLink8
}

interface PrimaryLink8 {
    interface: string
    onItemSelected: OnItemSelected33[]
}

interface OnItemSelected33 {
    interface: string
    queue: Queue51
    forced: boolean
}

interface Queue51 {
    interface: string
    id: string
}

interface Queue52 {
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

interface RefinementHeader3 {
    interface: string
    refinementOptions: any[]
    text: string
    useFilter: boolean
    uuid: string
    onViewed: any[]
    isActive: boolean
    isOpened: boolean
    isDisabled: boolean
}

interface OnCreated5 {
    interface: string
    url?: string
    clientInformation?: any[]
    before?: any[]
    after?: any[]
    onSuccess?: any[]
    onError?: OnError12[]
    queue: Queue54
    forced: boolean
    group?: string
}

interface OnError12 {
    interface: string
    key: string
    after: any[]
    onNoMethodsStored: any[]
    queue: Queue53
    forced: boolean
}

interface Queue53 {
    interface: string
    id: string
}

interface Queue54 {
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

interface AdditionalActionButton {
    interface: string
    text: string
    icon: string
    iconOnly: boolean
    outline: boolean
    keepInSyncWithNavigationUrl: boolean
    disabled: boolean
    onItemSelected: OnItemSelected34[]
}

interface OnItemSelected34 {
    interface: string
    template?: Template10
    screenMode?: string
    queue: Queue60
    forced: boolean
    url?: string
    clientInformation?: any[]
    before?: any[]
    after?: any[]
    onSuccess?: any[]
    onError?: any[]
}

interface Template10 {
    interface: string
    header: string
    buttons: Button7[]
    closeButton: CloseButton3
    textInputHeader: string
    textInputPlaceholder: string
    textInputMaxLength: number
    textInputMaxLengthErrorMessage: string
    onCreated: any[]
    onBound: any[]
    onViewed: any[]
    onInteraction: any[]
    onLeave: any[]
    launchMode: string
    cacheSeconds: number
}

interface Button7 {
    interface: string
    text: string
    primaryLink: PrimaryLink9
}

interface PrimaryLink9 {
    interface: string
    onItemSelected: OnItemSelected35[]
}

interface OnItemSelected35 {
    interface: string
    url: string
    clientInformation: string[]
    before: any[]
    after: any[]
    onSuccess: any[]
    onError: OnError13[]
    queue: Queue58
    forced: boolean
}

interface OnError13 {
    interface: string
    key: string
    after: any[]
    onNoMethodsStored: any[]
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

interface CloseButton3 {
    interface: string
    altText: string
    icon: string
    primaryLink: PrimaryLink10
}

interface PrimaryLink10 {
    interface: string
    onItemSelected: OnItemSelected36[]
}

interface OnItemSelected36 {
    interface: string
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

interface OnCreated6 {
    interface: string
    url?: string
    clientInformation?: any[]
    before?: any[]
    after?: any[]
    onSuccess?: any[]
    onError?: OnError14[]
    queue: Queue62
    forced: boolean
    group?: string
}

interface OnError14 {
    interface: string
    key: string
    after: any[]
    onNoMethodsStored: any[]
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

interface OnViewed7 {
    interface: string
    url: string
    clientInformation: string[]
    before: any[]
    after: any[]
    onSuccess: any[]
    onError: any[]
    queue: Queue63
    forced: boolean
}

interface Queue63 {
    interface: string
    id: string
}

interface Queue64 {
    interface: string
    id: string
}
