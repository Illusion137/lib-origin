export interface CreateAndBindMethod {
    interface: string
    template: Template
    screenMode: string
    queue: Queue136
    forced: boolean
}

interface Template {
    interface: "TemplateListInterface.v1_0.CreateAndBindTemplateMethod"
    headerText: HeaderText
    widgets: Widget[]
    templateData: TemplateData4
    backgroundImage: string
    headerLabel: string
    headerButtons: HeaderButton3[]
    contextMenu: ContextMenu5
    headeris_emptyTemplate: boolean
    headerEmptyTemplatePrimaryText: string
    headerImage: string
    headerImageKind: string
    headerImageAltText: string
    upsellButtonElement: UpsellButtonElement3
    multiSelectBar: MultiSelectBar
    onHeaderIconSelected: any[]
    shouldHideContent: boolean
    templateType: string
    onCreated: OnCreated4[]
    onBound: any[]
    onViewed: OnViewed5[]
    onInteraction: any[]
    onLeave: any[]
    launchMode: string
    cacheSeconds: number
    isBackgroundImageBlurred: boolean
    isLargeFormat: boolean
    isSmallHeaderCentered: boolean
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

interface Widget {
    interface: string
    items: AmazonTrack[]
    onEndOfWidget: any[]
    onTrackReorder: OnTrackReorder[]
    uuid: string
    onViewed: OnViewed4[]
}

export interface AmazonTrack {
    interface: string
    primaryText: string
    primaryLink: PrimaryLink
    image: string
    imageAltText: string
    buttons: any[]
    id: string
    icon: string
    iconButton: IconButton
    rowIndex: string
    secondaryText1: string
    secondaryText1Link: SecondaryText1Link
    secondaryText2: string
    secondaryText2Link: SecondaryText2Link
    secondaryText3: string
    button: Button
    contextMenu: ContextMenu3
    shouldScrollTo: boolean
    shouldFocus: boolean
    isSelected: IsSelected
    onCheckboxSelected: OnCheckboxSelected
    badges: any[]
    primaryBadges: any[]
    secondaryBadges: any[]
    componentType: string
    isIndexable: boolean
    isDisabled: boolean
}

interface PrimaryLink {
    interface: string
    deeplink: string
    onItemSelected: OnItemSelected[]
}

interface OnItemSelected {
    interface: string
    url: string
    clientInformation: string[]
    before: any[]
    after: any[]
    onSuccess: any[]
    onError: any[]
    queue: Queue
    forced: boolean
}

interface Queue {
    interface: string
    id: string
}

interface IconButton {
    interface: string
    icon: string
    disabled: boolean
    onItemSelected: any[]
    observer: Observer2
}

interface Observer2 {
    interface: string
    storageGroup: string
    storageKey: string
    states: States2
    defaultState: string
}

interface States2 {
    LOADING: Loading
    PAUSED: Paused
    STOPPED: Stopped
    PLAYING: Playing
}

interface Loading {
    interface: string
    icon: string
    disabled: boolean
    onItemSelected: any[]
}

interface Paused {
    interface: string
    icon: string
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
    icon: string
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
    icon: string
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

interface SecondaryText1Link {
    interface: string
    deeplink: string
    onItemSelected: OnItemSelected5[]
}

interface OnItemSelected5 {
    interface: string
    url?: string
    clientInformation?: any[]
    before?: any[]
    after?: any[]
    onSuccess?: any[]
    onError?: any[]
    queue: Queue5
    forced: boolean
    template?: Template2
    screenMode?: string
}

interface Queue5 {
    interface: string
    id: string
}

interface Template2 {
    interface: string
    headerText: HeaderText2
    widgets: any[]
    templateData: TemplateData
    backgroundImage: string
    headerLabel: string
    headerButtons: any[]
    contextMenu: ContextMenu
    headerImageKind: string
    onHeaderIconSelected: any[]
    shouldHideContent: boolean
    templateType: string
    onCreated: OnCreated[]
    onBound: any[]
    onViewed: OnViewed[]
    onInteraction: any[]
    onLeave: any[]
    launchMode: string
    cacheSeconds: number
    isBackgroundImageBlurred: boolean
    isLargeFormat: boolean
    isSmallHeaderCentered: boolean
}

interface HeaderText2 {
    interface: string
    text: string
    disabled: boolean
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

interface ContextMenu {
    interface: string
    options: Option[]
    onItemSelected: OnItemSelected7[]
    disabled: boolean
}

interface Option {
    interface: string
    text: string
    icon: string
    disabled: boolean
    hidden: boolean
    onItemSelected: OnItemSelected6[]
}

interface OnItemSelected6 {
    interface: string
    url: string
    clientInformation: any[]
    before: any[]
    after: any[]
    onSuccess: any[]
    onError: OnError[]
    queue: Queue7
    forced: boolean
}

interface OnError {
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

interface OnItemSelected7 {
    interface: string
    url?: string
    clientInformation?: any[]
    before?: any[]
    after?: any[]
    onSuccess?: any[]
    onError?: any[]
    queue: Queue8
    forced: boolean
    id?: string
}

interface Queue8 {
    interface: string
    id: string
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

interface SecondaryText2Link {
    interface: string
    deeplink: string
    onItemSelected: OnItemSelected8[]
}

interface OnItemSelected8 {
    interface: string
    url?: string
    clientInformation?: any[]
    before?: any[]
    after?: any[]
    onSuccess?: any[]
    onError?: any[]
    queue: Queue12
    forced: boolean
    template?: Template3
    screenMode?: string
}

interface Queue12 {
    interface: string
    id: string
}

interface Template3 {
    interface: string
    headerText: HeaderText3
    widgets: any[]
    templateData: TemplateData2
    backgroundImage: string
    headerLabel: string
    headerButtons: HeaderButton[]
    contextMenu: ContextMenu2
    headerPrimaryText: string
    headerTertiaryText: string
    headerBadges: any[]
    headerImage: string
    headerImageKind: string
    headerImageAltText: string
    upsellButtonElement: UpsellButtonElement
    entityDetails: EntityDetails
    onHeaderIconSelected: any[]
    shouldHideContent: boolean
    templateType: string
    onCreated: OnCreated2[]
    onBound: any[]
    onViewed: OnViewed2[]
    onInteraction: any[]
    onLeave: any[]
    launchMode: string
    cacheSeconds: number
    isBackgroundImageBlurred: boolean
    isLargeFormat: boolean
    isSmallHeaderCentered: boolean
}

interface HeaderText3 {
    interface: string
    text: string
    disabled: boolean
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
    PAUSED: Paused2
    STOPPED: Stopped2
    PLAYING: Playing2
}

interface Paused2 {
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
    queue: Queue13
    forced: boolean
}

interface Queue13 {
    interface: string
    id: string
}

interface Stopped2 {
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
    url: string
    clientInformation: any[]
    before: any[]
    after: any[]
    onSuccess: any[]
    onError: any[]
    queue: Queue14
    forced: boolean
}

interface Queue14 {
    interface: string
    id: string
}

interface Playing2 {
    interface: string
    text: string
    icon: string
    iconOnly: boolean
    outline: boolean
    keepInSyncWithNavigationUrl: boolean
    disabled: boolean
    onItemSelected: OnItemSelected11[]
}

interface OnItemSelected11 {
    interface: string
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
    onItemSelected: OnItemSelected13[]
    disabled: boolean
}

interface Option2 {
    interface: string
    text: string
    icon: string
    disabled: boolean
    hidden: boolean
    onItemSelected: OnItemSelected12[]
}

interface OnItemSelected12 {
    interface: string
    url: string
    clientInformation: any[]
    before: any[]
    after: any[]
    onSuccess: any[]
    onError: OnError3[]
    queue: Queue17
    forced: boolean
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
    queue: Queue19
    forced: boolean
}

interface Queue19 {
    interface: string
    id: string
}

interface EntityDetails {
    interface: string
    languageOfPerformanceHeading: any
    languageOfPerformances: any
    awardsHeading: any
    awards: any
    biographyHeading: any
    biographies: any
}

interface OnCreated2 {
    interface: string
    url?: string
    clientInformation?: any[]
    before?: any[]
    after?: any[]
    onSuccess?: any[]
    onError?: OnError4[]
    queue: Queue21
    forced: boolean
    group?: string
}

interface OnError4 {
    interface: string
    key: string
    after: any[]
    onNoMethodsStored: any[]
    queue: Queue20
    forced: boolean
}

interface Queue20 {
    interface: string
    id: string
}

interface Queue21 {
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
    queue: Queue22
    forced: boolean
}

interface Queue22 {
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
    onItemSelected: OnItemSelected15[]
}

interface OnItemSelected15 {
    interface: string
    group?: string
    key?: string
    value?: string
    queue: Queue23
    forced: boolean
    url?: string
    clientInformation?: any[]
    before?: any[]
    after?: any[]
    onSuccess?: any[]
    onError?: OnError5[]
}

interface Queue23 {
    interface: string
    id: string
}

interface OnError5 {
    interface: string
    key: string
    after: any[]
    onNoMethodsStored: any[]
    queue: Queue24
    forced: boolean
}

interface Queue24 {
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
    iconHover: string
    iconOnly: boolean
    outline: boolean
    keepInSyncWithNavigationUrl: boolean
    disabled: boolean
    onItemSelected: OnItemSelected16[]
}

interface OnItemSelected16 {
    interface: string
    group?: string
    key?: string
    value?: string
    queue: Queue25
    forced: boolean
    url?: string
    clientInformation?: any[]
    before?: any[]
    after?: any[]
    onSuccess?: any[]
    onError?: OnError6[]
}

interface Queue25 {
    interface: string
    id: string
}

interface OnError6 {
    interface: string
    key: string
    after: any[]
    onNoMethodsStored: any[]
    queue: Queue26
    forced: boolean
}

interface Queue26 {
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
    icon?: string
    disabled: boolean
    hidden: boolean
    onItemSelected: OnItemSelected17[]
    observer?: Observer6
}

interface OnItemSelected17 {
    interface: string
    url?: string
    clientInformation?: any[]
    before?: any[]
    after?: any[]
    onSuccess?: any[]
    onError?: OnError7[]
    queue: Queue28
    forced: boolean
    template?: Template4
    screenMode?: string
    group?: string
    key?: string
    value?: string
}

interface OnError7 {
    interface: string
    key: string
    after: any[]
    onNoMethodsStored: any[]
    queue: Queue27
    forced: boolean
}

interface Queue27 {
    interface: string
    id: string
}

interface Queue28 {
    interface: string
    id: string
}

interface Template4 {
    interface: string
    headerText: HeaderText4
    widgets: any[]
    templateData: TemplateData3
    backgroundImage: string
    headerLabel: string
    headerButtons: HeaderButton2[]
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
    isBackgroundImageBlurred: boolean
    isLargeFormat: boolean
    isSmallHeaderCentered: boolean
    headerPrimaryText?: string
    headerTertiaryText?: string
    headerBadges?: any[]
    headerImage?: string
    headerImageAltText?: string
    upsellButtonElement?: UpsellButtonElement2
    entityDetails?: EntityDetails2
}

interface HeaderText4 {
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

interface HeaderButton2 {
    interface: string
    text: string
    icon: string
    iconOnly: boolean
    outline: boolean
    keepInSyncWithNavigationUrl: boolean
    disabled: boolean
    onItemSelected: any[]
    observer: Observer5
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
    onItemSelected: OnItemSelected18[]
}

interface OnItemSelected18 {
    interface: string
    queue: Queue29
    forced: boolean
}

interface Queue29 {
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
    queue: Queue30
    forced: boolean
}

interface Queue30 {
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
    onItemSelected: OnItemSelected20[]
}

interface OnItemSelected20 {
    interface: string
    queue: Queue31
    forced: boolean
}

interface Queue31 {
    interface: string
    id: string
}

interface ContextMenu4 {
    interface: string
    options: Option4[]
    onItemSelected: OnItemSelected22[]
    disabled: boolean
}

interface Option4 {
    interface: string
    text: string
    icon: string
    disabled: boolean
    hidden: boolean
    onItemSelected: OnItemSelected21[]
}

interface OnItemSelected21 {
    interface: string
    url: string
    clientInformation: any[]
    before: any[]
    after: any[]
    onSuccess: any[]
    onError: OnError8[]
    queue: Queue33
    forced: boolean
}

interface OnError8 {
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

interface OnItemSelected22 {
    interface: string
    url?: string
    clientInformation?: any[]
    before?: any[]
    after?: any[]
    onSuccess?: any[]
    onError?: any[]
    queue: Queue34
    forced: boolean
    id?: string
}

interface Queue34 {
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
    onError?: OnError9[]
    queue: Queue36
    forced: boolean
    group?: string
}

interface OnError9 {
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

interface Queue36 {
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
    queue: Queue37
    forced: boolean
}

interface Queue37 {
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

interface EntityDetails2 {
    interface: string
    languageOfPerformanceHeading: any
    languageOfPerformances: any
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
    NOT_IN_LIBRARY: NotInLibrary2
    IN_LIBRARY: InLibrary2
}

interface NotInLibrary2 {
    interface: string
    text: string
    icon: string
    disabled: boolean
    hidden: boolean
    onItemSelected: OnItemSelected24[]
}

interface OnItemSelected24 {
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

interface InLibrary2 {
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
    onError: OnError11[]
    queue: Queue42
    forced: boolean
}

interface OnError11 {
    interface: string
    key: string
    after: any[]
    onNoMethodsStored: any[]
    queue: Queue41
    forced: boolean
}

interface Queue41 {
    interface: string
    id: string
}

interface Queue42 {
    interface: string
    id: string
}

interface OnItemSelected26 {
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

interface IsSelected {
    interface: string
    storageGroup: string
    storageKey: string
    states: States7
}

interface States7 {
    true: string
}

interface OnCheckboxSelected {
    interface: string
    storageGroup: string
    storageKey: string
    states: States8
    defaultValue: DefaultValue2[]
}

interface States8 {
    B0CKX9QYJ6?: B0Ckx9Qyj6[]
    B0BTGMNWC3?: B0Btgmnwc3[]
    B07TSG9MZ9?: B07Tsg9Mz9[]
    B0B6ZHJL1K?: B0B6Zhjl1K[]
    B0BFTH49KP?: B0Bfth49Kp[]
    B0BZKTHLRD?: B0Bzkthlrd[]
    B0B443JHN6?: B0B443Jhn6[]
    B0BFH1GJ7H?: B0Bfh1Gj7H[]
    B004YMUD98?: B004Ymud98[]
    B00W8G5T96?: B00W8G5T96[]
    B0C4473DPN?: B0C4473Dpn[]
    B0C2FFZ165?: B0C2Ffz165[]
    B0BLC25TY3?: B0Blc25Ty3[]
    B0CBD6SCZS?: B0Cbd6Sczs[]
    B0BKH6M5QN?: B0Bkh6M5Qn[]
    B0CCK6RT7N?: B0Cck6Rt7N[]
    B09JFCK5NC?: B09Jfck5Nc[]
    B08KTXWN9G?: B08Ktxwn9G[]
    B0C2NTB7SK?: B0C2Ntb7Sk[]
    B084P92FM4?: B084P92Fm4[]
    B0CDNZ1GT1?: B0Cdnz1Gt1[]
    B09PR4QHD4?: B09Pr4Qhd4[]
    B0BS2HCC9R?: B0Bs2Hcc9R[]
    B0CDPC9Y4Z?: B0Cdpc9Y4Z[]
    B07MMX2PGX?: B07Mmx2Pgx[]
    B09XFMMTJP?: B09Xfmmtjp[]
    B0886585Z2?: B0886585Z2[]
    B0CDG1Z7TR?: B0Cdg1Z7Tr[]
    B08KLRWJYT?: B08Klrwjyt[]
    B0CHK48V6K?: B0Chk48V6K[]
    B0CKY36G4M?: B0Cky36G4M[]
    B07L448ZD8?: B07L448Zd8[]
    B07ZT2HT1C?: B07Zt2Ht1C[]
    B07H4VZZ9B?: B07H4Vzz9B[]
    B0CKXY63NG?: B0Ckxy63Ng[]
    B0BHY2TKRH?: B0Bhy2Tkrh[]
    B07VTV51M7?: B07Vtv51M7[]
    B07K4YBRF6?: B07K4Ybrf6[]
    B001L29H4Q?: B001L29H4Q[]
    B09CKSMNYG?: B09Cksmnyg[]
    B0BY7JTG8H?: B0By7Jtg8H[]
    B096SYVMPP?: B096Syvmpp[]
    B074PC1RWF?: B074Pc1Rwf[]
    B0BFJPXGYH?: B0Bfjpxgyh[]
    B0CJQB7J86?: B0Cjqb7J86[]
    B01HJITV4Q?: B01Hjitv4Q[]
    B088CT39PV?: B088Ct39Pv[]
    B0CX32DH9F?: B0Cx32Dh9F[]
    B001NTCZDM?: B001Ntczdm[]
    B074G148PB?: B074G148Pb[]
    B06W9NRYHB?: B06W9Nryhb[]
    B07DTLC3QH?: B07Dtlc3Qh[]
    B09ZXWG361?: B09Zxwg361[]
    B00137QV7A?: B00137Qv7A[]
    B00JH226X6?: B00Jh226X6[]
    B09XG1P8D6?: B09Xg1P8D6[]
    B0CBT8HXKJ?: B0Cbt8Hxkj[]
    B0C7LYZKVV?: B0C7Lyzkvv[]
    B0BLW62GQV?: B0Blw62Gqv[]
    B07958Z692?: B07958Z692[]
    B002POQ7C4?: B002Poq7C4[]
    B006JTXIW8?: B006Jtxiw8[]
    B0B8C1JGSH?: B0B8C1Jgsh[]
    B0C21BX7W3?: B0C21Bx7W3[]
    B09BDS1DQD?: B09Bds1Dqd[]
    B095JC2MVV?: B095Jc2Mvv[]
    B001L4FWRA?: B001L4Fwra[]
    B0BDR3M3JR?: B0Bdr3M3Jr[]
    B0C6RGY5QX?: B0C6Rgy5Qx[]
    B0BCR7YJVP?: B0Bcr7Yjvp[]
    B00F2OIZLA?: B00F2Oizla[]
}

interface B0Ckx9Qyj6 {
    interface: string
    group: string
    key: string
    queue: Queue44
    forced: boolean
}

interface Queue44 {
    interface: string
    id: string
}

interface B0Btgmnwc3 {
    interface: string
    group: string
    key: string
    queue: Queue45
    forced: boolean
}

interface Queue45 {
    interface: string
    id: string
}

interface B07Tsg9Mz9 {
    interface: string
    group: string
    key: string
    queue: Queue46
    forced: boolean
}

interface Queue46 {
    interface: string
    id: string
}

interface B0B6Zhjl1K {
    interface: string
    group: string
    key: string
    queue: Queue47
    forced: boolean
}

interface Queue47 {
    interface: string
    id: string
}

interface B0Bfth49Kp {
    interface: string
    group: string
    key: string
    queue: Queue48
    forced: boolean
}

interface Queue48 {
    interface: string
    id: string
}

interface B0Bzkthlrd {
    interface: string
    group: string
    key: string
    queue: Queue49
    forced: boolean
}

interface Queue49 {
    interface: string
    id: string
}

interface B0B443Jhn6 {
    interface: string
    group: string
    key: string
    queue: Queue50
    forced: boolean
}

interface Queue50 {
    interface: string
    id: string
}

interface B0Bfh1Gj7H {
    interface: string
    group: string
    key: string
    queue: Queue51
    forced: boolean
}

interface Queue51 {
    interface: string
    id: string
}

interface B004Ymud98 {
    interface: string
    group: string
    key: string
    queue: Queue52
    forced: boolean
}

interface Queue52 {
    interface: string
    id: string
}

interface B00W8G5T96 {
    interface: string
    group: string
    key: string
    queue: Queue53
    forced: boolean
}

interface Queue53 {
    interface: string
    id: string
}

interface B0C4473Dpn {
    interface: string
    group: string
    key: string
    queue: Queue54
    forced: boolean
}

interface Queue54 {
    interface: string
    id: string
}

interface B0C2Ffz165 {
    interface: string
    group: string
    key: string
    queue: Queue55
    forced: boolean
}

interface Queue55 {
    interface: string
    id: string
}

interface B0Blc25Ty3 {
    interface: string
    group: string
    key: string
    queue: Queue56
    forced: boolean
}

interface Queue56 {
    interface: string
    id: string
}

interface B0Cbd6Sczs {
    interface: string
    group: string
    key: string
    queue: Queue57
    forced: boolean
}

interface Queue57 {
    interface: string
    id: string
}

interface B0Bkh6M5Qn {
    interface: string
    group: string
    key: string
    queue: Queue58
    forced: boolean
}

interface Queue58 {
    interface: string
    id: string
}

interface B0Cck6Rt7N {
    interface: string
    group: string
    key: string
    queue: Queue59
    forced: boolean
}

interface Queue59 {
    interface: string
    id: string
}

interface B09Jfck5Nc {
    interface: string
    group: string
    key: string
    queue: Queue60
    forced: boolean
}

interface Queue60 {
    interface: string
    id: string
}

interface B08Ktxwn9G {
    interface: string
    group: string
    key: string
    queue: Queue61
    forced: boolean
}

interface Queue61 {
    interface: string
    id: string
}

interface B0C2Ntb7Sk {
    interface: string
    group: string
    key: string
    queue: Queue62
    forced: boolean
}

interface Queue62 {
    interface: string
    id: string
}

interface B084P92Fm4 {
    interface: string
    group: string
    key: string
    queue: Queue63
    forced: boolean
}

interface Queue63 {
    interface: string
    id: string
}

interface B0Cdnz1Gt1 {
    interface: string
    group: string
    key: string
    queue: Queue64
    forced: boolean
}

interface Queue64 {
    interface: string
    id: string
}

interface B09Pr4Qhd4 {
    interface: string
    group: string
    key: string
    queue: Queue65
    forced: boolean
}

interface Queue65 {
    interface: string
    id: string
}

interface B0Bs2Hcc9R {
    interface: string
    group: string
    key: string
    queue: Queue66
    forced: boolean
}

interface Queue66 {
    interface: string
    id: string
}

interface B0Cdpc9Y4Z {
    interface: string
    group: string
    key: string
    queue: Queue67
    forced: boolean
}

interface Queue67 {
    interface: string
    id: string
}

interface B07Mmx2Pgx {
    interface: string
    group: string
    key: string
    queue: Queue68
    forced: boolean
}

interface Queue68 {
    interface: string
    id: string
}

interface B09Xfmmtjp {
    interface: string
    group: string
    key: string
    queue: Queue69
    forced: boolean
}

interface Queue69 {
    interface: string
    id: string
}

interface B0886585Z2 {
    interface: string
    group: string
    key: string
    queue: Queue70
    forced: boolean
}

interface Queue70 {
    interface: string
    id: string
}

interface B0Cdg1Z7Tr {
    interface: string
    group: string
    key: string
    queue: Queue71
    forced: boolean
}

interface Queue71 {
    interface: string
    id: string
}

interface B08Klrwjyt {
    interface: string
    group: string
    key: string
    queue: Queue72
    forced: boolean
}

interface Queue72 {
    interface: string
    id: string
}

interface B0Chk48V6K {
    interface: string
    group: string
    key: string
    queue: Queue73
    forced: boolean
}

interface Queue73 {
    interface: string
    id: string
}

interface B0Cky36G4M {
    interface: string
    group: string
    key: string
    queue: Queue74
    forced: boolean
}

interface Queue74 {
    interface: string
    id: string
}

interface B07L448Zd8 {
    interface: string
    group: string
    key: string
    queue: Queue75
    forced: boolean
}

interface Queue75 {
    interface: string
    id: string
}

interface B07Zt2Ht1C {
    interface: string
    group: string
    key: string
    queue: Queue76
    forced: boolean
}

interface Queue76 {
    interface: string
    id: string
}

interface B07H4Vzz9B {
    interface: string
    group: string
    key: string
    queue: Queue77
    forced: boolean
}

interface Queue77 {
    interface: string
    id: string
}

interface B0Ckxy63Ng {
    interface: string
    group: string
    key: string
    queue: Queue78
    forced: boolean
}

interface Queue78 {
    interface: string
    id: string
}

interface B0Bhy2Tkrh {
    interface: string
    group: string
    key: string
    queue: Queue79
    forced: boolean
}

interface Queue79 {
    interface: string
    id: string
}

interface B07Vtv51M7 {
    interface: string
    group: string
    key: string
    queue: Queue80
    forced: boolean
}

interface Queue80 {
    interface: string
    id: string
}

interface B07K4Ybrf6 {
    interface: string
    group: string
    key: string
    queue: Queue81
    forced: boolean
}

interface Queue81 {
    interface: string
    id: string
}

interface B001L29H4Q {
    interface: string
    group: string
    key: string
    queue: Queue82
    forced: boolean
}

interface Queue82 {
    interface: string
    id: string
}

interface B09Cksmnyg {
    interface: string
    group: string
    key: string
    queue: Queue83
    forced: boolean
}

interface Queue83 {
    interface: string
    id: string
}

interface B0By7Jtg8H {
    interface: string
    group: string
    key: string
    queue: Queue84
    forced: boolean
}

interface Queue84 {
    interface: string
    id: string
}

interface B096Syvmpp {
    interface: string
    group: string
    key: string
    queue: Queue85
    forced: boolean
}

interface Queue85 {
    interface: string
    id: string
}

interface B074Pc1Rwf {
    interface: string
    group: string
    key: string
    queue: Queue86
    forced: boolean
}

interface Queue86 {
    interface: string
    id: string
}

interface B0Bfjpxgyh {
    interface: string
    group: string
    key: string
    queue: Queue87
    forced: boolean
}

interface Queue87 {
    interface: string
    id: string
}

interface B0Cjqb7J86 {
    interface: string
    group: string
    key: string
    queue: Queue88
    forced: boolean
}

interface Queue88 {
    interface: string
    id: string
}

interface B01Hjitv4Q {
    interface: string
    group: string
    key: string
    queue: Queue89
    forced: boolean
}

interface Queue89 {
    interface: string
    id: string
}

interface B088Ct39Pv {
    interface: string
    group: string
    key: string
    queue: Queue90
    forced: boolean
}

interface Queue90 {
    interface: string
    id: string
}

interface B0Cx32Dh9F {
    interface: string
    group: string
    key: string
    queue: Queue91
    forced: boolean
}

interface Queue91 {
    interface: string
    id: string
}

interface B001Ntczdm {
    interface: string
    group: string
    key: string
    queue: Queue92
    forced: boolean
}

interface Queue92 {
    interface: string
    id: string
}

interface B074G148Pb {
    interface: string
    group: string
    key: string
    queue: Queue93
    forced: boolean
}

interface Queue93 {
    interface: string
    id: string
}

interface B06W9Nryhb {
    interface: string
    group: string
    key: string
    queue: Queue94
    forced: boolean
}

interface Queue94 {
    interface: string
    id: string
}

interface B07Dtlc3Qh {
    interface: string
    group: string
    key: string
    queue: Queue95
    forced: boolean
}

interface Queue95 {
    interface: string
    id: string
}

interface B09Zxwg361 {
    interface: string
    group: string
    key: string
    queue: Queue96
    forced: boolean
}

interface Queue96 {
    interface: string
    id: string
}

interface B00137Qv7A {
    interface: string
    group: string
    key: string
    queue: Queue97
    forced: boolean
}

interface Queue97 {
    interface: string
    id: string
}

interface B00Jh226X6 {
    interface: string
    group: string
    key: string
    queue: Queue98
    forced: boolean
}

interface Queue98 {
    interface: string
    id: string
}

interface B09Xg1P8D6 {
    interface: string
    group: string
    key: string
    queue: Queue99
    forced: boolean
}

interface Queue99 {
    interface: string
    id: string
}

interface B0Cbt8Hxkj {
    interface: string
    group: string
    key: string
    queue: Queue100
    forced: boolean
}

interface Queue100 {
    interface: string
    id: string
}

interface B0C7Lyzkvv {
    interface: string
    group: string
    key: string
    queue: Queue101
    forced: boolean
}

interface Queue101 {
    interface: string
    id: string
}

interface B0Blw62Gqv {
    interface: string
    group: string
    key: string
    queue: Queue102
    forced: boolean
}

interface Queue102 {
    interface: string
    id: string
}

interface B07958Z692 {
    interface: string
    group: string
    key: string
    queue: Queue103
    forced: boolean
}

interface Queue103 {
    interface: string
    id: string
}

interface B002Poq7C4 {
    interface: string
    group: string
    key: string
    queue: Queue104
    forced: boolean
}

interface Queue104 {
    interface: string
    id: string
}

interface B006Jtxiw8 {
    interface: string
    group: string
    key: string
    queue: Queue105
    forced: boolean
}

interface Queue105 {
    interface: string
    id: string
}

interface B0B8C1Jgsh {
    interface: string
    group: string
    key: string
    queue: Queue106
    forced: boolean
}

interface Queue106 {
    interface: string
    id: string
}

interface B0C21Bx7W3 {
    interface: string
    group: string
    key: string
    queue: Queue107
    forced: boolean
}

interface Queue107 {
    interface: string
    id: string
}

interface B09Bds1Dqd {
    interface: string
    group: string
    key: string
    queue: Queue108
    forced: boolean
}

interface Queue108 {
    interface: string
    id: string
}

interface B095Jc2Mvv {
    interface: string
    group: string
    key: string
    queue: Queue109
    forced: boolean
}

interface Queue109 {
    interface: string
    id: string
}

interface B001L4Fwra {
    interface: string
    group: string
    key: string
    queue: Queue110
    forced: boolean
}

interface Queue110 {
    interface: string
    id: string
}

interface B0Bdr3M3Jr {
    interface: string
    group: string
    key: string
    queue: Queue111
    forced: boolean
}

interface Queue111 {
    interface: string
    id: string
}

interface B0C6Rgy5Qx {
    interface: string
    group: string
    key: string
    queue: Queue112
    forced: boolean
}

interface Queue112 {
    interface: string
    id: string
}

interface B0Bcr7Yjvp {
    interface: string
    group: string
    key: string
    queue: Queue113
    forced: boolean
}

interface Queue113 {
    interface: string
    id: string
}

interface B00F2Oizla {
    interface: string
    group: string
    key: string
    queue: Queue114
    forced: boolean
}

interface Queue114 {
    interface: string
    id: string
}

interface DefaultValue2 {
    interface: string
    group: string
    key: string
    value: string
    queue: Queue115
    forced: boolean
}

interface Queue115 {
    interface: string
    id: string
}

interface OnTrackReorder {
    interface: string
    url: string
    clientInformation: string[]
    before: any[]
    after: any[]
    onSuccess: any[]
    onError: OnError12[]
    queue: Queue117
    forced: boolean
}

interface OnError12 {
    interface: string
    key: string
    after: any[]
    onNoMethodsStored: any[]
    queue: Queue116
    forced: boolean
}

interface Queue116 {
    interface: string
    id: string
}

interface Queue117 {
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
    queue: Queue118
    forced: boolean
}

interface Queue118 {
    interface: string
    id: string
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

interface HeaderButton3 {
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
    states: States9
    defaultState: string
}

interface States9 {
    PAUSED: Paused4
    STOPPED: Stopped4
    PLAYING: Playing4
}

interface Paused4 {
    interface: string
    text: string
    icon: string
    iconOnly: boolean
    outline: boolean
    keepInSyncWithNavigationUrl: boolean
    disabled: boolean
    onItemSelected: OnItemSelected27[]
}

interface OnItemSelected27 {
    interface: string
    queue: Queue119
    forced: boolean
}

interface Queue119 {
    interface: string
    id: string
}

interface Stopped4 {
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
    url: string
    clientInformation: string[]
    before: any[]
    after: any[]
    onSuccess: any[]
    onError: any[]
    queue: Queue120
    forced: boolean
}

interface Queue120 {
    interface: string
    id: string
}

interface Playing4 {
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
    queue: Queue121
    forced: boolean
}

interface Queue121 {
    interface: string
    id: string
}

interface ContextMenu5 {
    interface: string
    options: Option5[]
    onItemSelected: OnItemSelected32[]
    disabled: boolean
}

interface Option5 {
    interface: string
    text: string
    icon: string
    disabled: boolean
    hidden: boolean
    onItemSelected: OnItemSelected30[]
}

interface OnItemSelected30 {
    interface: string
    url?: string
    clientInformation?: any[]
    before?: any[]
    after?: any[]
    onSuccess?: any[]
    onError?: OnError13[]
    queue: Queue123
    forced: boolean
    template?: Template5
    screenMode?: string
}

interface OnError13 {
    interface: string
    key: string
    after: any[]
    onNoMethodsStored: any[]
    queue: Queue122
    forced: boolean
}

interface Queue122 {
    interface: string
    id: string
}

interface Queue123 {
    interface: string
    id: string
}

interface Template5 {
    interface: string
    header: string
    buttons: Button2[]
    body: Body
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
    primaryLink: PrimaryLink2
}

interface PrimaryLink2 {
    interface: string
    onItemSelected: OnItemSelected31[]
}

interface OnItemSelected31 {
    interface: string
    queue: Queue124
    forced: boolean
}

interface Queue124 {
    interface: string
    id: string
}

interface Body {
    interface: string
    text: string
    onItemSelected: any[]
}

interface OnItemSelected32 {
    interface: string
    url: string
    clientInformation: any[]
    before: any[]
    after: any[]
    onSuccess: any[]
    onError: any[]
    queue: Queue125
    forced: boolean
}

interface Queue125 {
    interface: string
    id: string
}

interface UpsellButtonElement3 {
    interface: string
    text: string
    iconOnly: boolean
    outline: boolean
    keepInSyncWithNavigationUrl: boolean
    disabled: boolean
    onItemSelected: OnItemSelected33[]
}

interface OnItemSelected33 {
    interface: string
    url: string
    clientInformation: any[]
    before: any[]
    after: any[]
    onSuccess: any[]
    onError: any[]
    queue: Queue126
    forced: boolean
}

interface Queue126 {
    interface: string
    id: string
}

interface MultiSelectBar {
    interface: string
    selectedText: string
    actionButton1: ActionButton1
    actionButton2: ActionButton2
    contextMenu: ContextMenu6
    closeButton: CloseButton
    itemCount: number
}

interface ActionButton1 {
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
    states: States10
    defaultValue: DefaultValue3
}

interface States10 {
    true: True
}

interface True {
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
    group: string
    queue: Queue127
    forced: boolean
}

interface Queue127 {
    interface: string
    id: string
}

interface DefaultValue3 {
    interface: string
    text: string
    icon: string
    iconOnly: boolean
    outline: boolean
    keepInSyncWithNavigationUrl: boolean
    disabled: boolean
    onItemSelected: OnItemSelected35[]
}

interface OnItemSelected35 {
    interface: string
    url: string
    clientInformation: any[]
    before: any[]
    after: any[]
    onSuccess: any[]
    onError: any[]
    queue: Queue128
    forced: boolean
}

interface Queue128 {
    interface: string
    id: string
}

interface ActionButton2 {
    interface: string
    text: string
    icon: string
    iconOnly: boolean
    outline: boolean
    keepInSyncWithNavigationUrl: boolean
    disabled: boolean
    onItemSelected: OnItemSelected36[]
}

interface OnItemSelected36 {
    interface: string
    url: string
    clientInformation: any[]
    before: any[]
    after: any[]
    onSuccess: any[]
    onError: OnError14[]
    queue: Queue130
    forced: boolean
}

interface OnError14 {
    interface: string
    key: string
    after: any[]
    onNoMethodsStored: any[]
    queue: Queue129
    forced: boolean
}

interface Queue129 {
    interface: string
    id: string
}

interface Queue130 {
    interface: string
    id: string
}

interface ContextMenu6 {
    interface: string
    options: Option6[]
    onItemSelected: any[]
    disabled: boolean
}

interface Option6 {
    interface: string
    downloadLimit: number
    text: string
    icon: string
    disabled: boolean
    hidden: boolean
    onItemSelected: OnItemSelected37[]
}

interface OnItemSelected37 {
    interface: string
    url: string
    clientInformation: string[]
    before: any[]
    after: any[]
    onSuccess: any[]
    onError: any[]
    queue: Queue131
    forced: boolean
}

interface Queue131 {
    interface: string
    id: string
}

interface CloseButton {
    interface: string
    text: string
    icon: string
    iconOnly: boolean
    outline: boolean
    keepInSyncWithNavigationUrl: boolean
    disabled: boolean
    onItemSelected: OnItemSelected38[]
}

interface OnItemSelected38 {
    interface: string
    group: string
    queue: Queue132
    forced: boolean
}

interface Queue132 {
    interface: string
    id: string
}

interface OnCreated4 {
    interface: string
    url?: string
    clientInformation?: any[]
    before?: any[]
    after?: any[]
    onSuccess?: any[]
    onError?: OnError15[]
    queue: Queue134
    forced: boolean
    group?: string
}

interface OnError15 {
    interface: string
    key: string
    after: any[]
    onNoMethodsStored: any[]
    queue: Queue133
    forced: boolean
}

interface Queue133 {
    interface: string
    id: string
}

interface Queue134 {
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
    queue: Queue135
    forced: boolean
}

interface Queue135 {
    interface: string
    id: string
}

interface Queue136 {
    interface: string
    id: string
}