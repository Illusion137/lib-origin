export interface TemplateListInterfaceMethod {
    interface: "TemplateListInterface.v1_0.BindTemplateMethod"
    template: Template
    queue: Queue51
    forced: boolean
}

interface Template {
    interface: string
    logoImage: string
    logoImageSmall: string
    logoDeeplink: string
    logoAltText: string
    logoOnItemSelected: LogoOnItemSelected[]
    onViewed: any[]
    onInteraction: OnInteraction[]
    menuItems: MenuItem[]
    searchBox: SearchBox
    selectedMenuItem: number
    settingsIcon: string
    settingsAltText: string
    activityFeedIcon: string
    activityFeedAltText: string
    activityFeed: ActivityFeed
    settingsSections: SettingsSection[]
    showSignInButton: boolean
    signInButtonText: string
    subNavMenuItems: SubNavMenuItem[]
    navbarActionButton: NavbarActionButton
    onCreated: any[]
    onBound: any[]
    onLeave: any[]
    launchMode: string
    cacheSeconds: number
}

interface LogoOnItemSelected {
    interface: string
    url?: string
    clientInformation?: any[]
    before?: any[]
    after?: any[]
    onSuccess?: any[]
    onError?: any[]
    queue: Queue
    forced: boolean
    template?: Template2
    screenMode?: string
}

interface Queue {
    interface: string
    id: string
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
    queue: Queue3
    forced: boolean
    group?: string
}

interface OnError {
    interface: string
    key: string
    after: any[]
    onNoMethodsStored: any[]
    queue: Queue2
    forced: boolean
}

interface Queue2 {
    interface: string
    id: string
}

interface Queue3 {
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
    queue: Queue4
    forced: boolean
}

interface Queue4 {
    interface: string
    id: string
}

interface OnInteraction {
    interface: string
    url: string
    clientInformation: any[]
    before: any[]
    after: any[]
    onSuccess: any[]
    onError: OnError2[]
    queue: Queue6
    forced: boolean
}

interface OnError2 {
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

interface MenuItem {
    interface: string
    icon: string
    altText?: string
    text: string
    primaryLink?: PrimaryLink
    items?: Item[]
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
    queue: Queue7
    forced: boolean
    template?: Template3
    screenMode?: string
    id?: string
    target?: string
    preset?: string
}

interface Queue7 {
    interface: string
    id: string
}

interface Template3 {
    interface: string
    widgets: any[]
    templateData: TemplateData2
    onEndOfWidgetsReached: any[]
    onCreated: OnCreated2[]
    onBound: any[]
    onViewed: OnViewed2[]
    onInteraction: any[]
    onLeave: any[]
    launchMode: string
    cacheSeconds: number
    isEnumerated: boolean
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

interface OnCreated2 {
    interface: string
    url?: string
    clientInformation?: any[]
    before?: any[]
    after?: any[]
    onSuccess?: any[]
    onError?: OnError3[]
    queue: Queue9
    forced: boolean
    group?: string
}

interface OnError3 {
    interface: string
    key: string
    after: any[]
    onNoMethodsStored: any[]
    queue: Queue8
    forced: boolean
}

interface Queue8 {
    interface: string
    id: string
}

interface Queue9 {
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
    queue: Queue10
    forced: boolean
}

interface Queue10 {
    interface: string
    id: string
}

interface Item {
    interface: string
    activePaths: string[]
    primaryLink: PrimaryLink2
    text: string
    isSelected: boolean
}

interface PrimaryLink2 {
    interface: string
    deeplink: string
    onItemSelected: OnItemSelected2[]
}

interface OnItemSelected2 {
    interface: string
    url?: string
    clientInformation?: string[]
    before?: any[]
    after?: any[]
    onSuccess?: any[]
    onError?: any[]
    queue: Queue11
    forced: boolean
    template?: Template4
    screenMode?: string
    target?: string
    preset?: string
}

interface Queue11 {
    interface: string
    id: string
}

interface Template4 {
    interface: string
    shouldHideSubNav: boolean
    widgets: any[]
    templateData: TemplateData3
    onEndOfWidgetsReached: any[]
    onCreated: OnCreated3[]
    onBound: any[]
    onViewed: OnViewed3[]
    onInteraction: any[]
    onLeave: any[]
    launchMode: string
    cacheSeconds: number
    isExploreButtonAndEmptyPromptNeeded: boolean
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
    link: any[]
    script: any[]
}

interface Meum3 {
    interface: string
    name: string
    content: string
}

interface OnCreated3 {
    interface: string
    url?: string
    clientInformation?: any[]
    before?: any[]
    after?: any[]
    onSuccess?: any[]
    onError?: OnError4[]
    queue: Queue13
    forced: boolean
    group?: string
}

interface OnError4 {
    interface: string
    key: string
    after: any[]
    onNoMethodsStored: any[]
    queue: Queue12
    forced: boolean
}

interface Queue12 {
    interface: string
    id: string
}

interface Queue13 {
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
    queue: Queue14
    forced: boolean
}

interface Queue14 {
    interface: string
    id: string
}

interface SearchBox {
    interface: string
    placeholder: string
    cancelButtonText: string
    debounceMilliSeconds: number
    onEmptyInputSelected: OnEmptyInputSelected[]
    onInputSelected: OnInputSelected[]
    onQueryChanged: OnQueryChanged[]
    onQueryEntered: OnQueryEntered[]
    onQueryCleared: OnQueryCleared[]
}

interface OnEmptyInputSelected {
    interface: string
    template: Template5
    screenMode: string
    queue: Queue18
    forced: boolean
}

interface Template5 {
    interface: string
    widgets: any[]
    templateData: TemplateData4
    onEndOfWidgetsReached: any[]
    onCreated: OnCreated4[]
    onBound: any[]
    onViewed: OnViewed4[]
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
    onError?: OnError5[]
    queue: Queue16
    forced: boolean
    group?: string
}

interface OnError5 {
    interface: string
    key: string
    after: any[]
    onNoMethodsStored: any[]
    queue: Queue15
    forced: boolean
}

interface Queue15 {
    interface: string
    id: string
}

interface Queue16 {
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

interface OnInputSelected {
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

interface OnQueryChanged {
    interface: string
    url: string
    clientInformation: string[]
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

interface OnQueryEntered {
    interface: string
    template?: Template6
    screenMode?: string
    queue: Queue24
    forced: boolean
    url?: string
    clientInformation?: any[]
    before?: any[]
    after?: any[]
    onSuccess?: any[]
    onError?: any[]
}

interface Template6 {
    interface: string
    widgets: any[]
    templateData: TemplateData5
    onEndOfWidgetsReached: any[]
    onCreated: OnCreated5[]
    onBound: any[]
    onViewed: OnViewed5[]
    onInteraction: any[]
    onLeave: any[]
    launchMode: string
    cacheSeconds: number
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
    link: Link4[]
    script: any[]
}

interface Meum5 {
    interface: string
    name: string
    content: string
}

interface Link4 {
    interface: string
    rel: string
    href: string
}

interface OnCreated5 {
    interface: string
    url: string
    clientInformation: string[]
    before: any[]
    after: any[]
    onSuccess: any[]
    onError: OnError6[]
    queue: Queue22
    forced: boolean
}

interface OnError6 {
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

interface OnViewed5 {
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

interface Queue24 {
    interface: string
    id: string
}

interface OnQueryCleared {
    interface: string
    template?: Template7
    screenMode?: string
    queue: Queue28
    forced: boolean
    url?: string
    clientInformation?: any[]
    before?: any[]
    after?: any[]
    onSuccess?: any[]
    onError?: any[]
}

interface Template7 {
    interface: string
    widgets: any[]
    templateData: TemplateData6
    onEndOfWidgetsReached: any[]
    onCreated: OnCreated6[]
    onBound: any[]
    onViewed: OnViewed6[]
    onInteraction: any[]
    onLeave: any[]
    launchMode: string
    cacheSeconds: number
    isEnumerated: boolean
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
    link: Link5[]
    script: any[]
}

interface Meum6 {
    interface: string
    name: string
    content: string
}

interface Link5 {
    interface: string
    rel: string
    href: string
}

interface OnCreated6 {
    interface: string
    url?: string
    clientInformation?: any[]
    before?: any[]
    after?: any[]
    onSuccess?: any[]
    onError?: OnError7[]
    queue: Queue26
    forced: boolean
    group?: string
}

interface OnError7 {
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

interface OnViewed6 {
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

interface Queue28 {
    interface: string
    id: string
}

interface ActivityFeed {
    interface: string
    items: Item2[]
    onEndOfWidget: OnEndOfWidget[]
    onViewed: OnViewed7[]
    uuid: string
}

interface Item2 {
    interface: string
    primaryText: PrimaryText
    image: string
    imageAltText: string
    label: string
    primaryLink: PrimaryLink3
    secondaryText: string
    uuid: string
    tags: any[]
    showNavigationIcon: boolean
    isCompressed: boolean
    isFeatured: boolean
    isLocked: boolean
    isActive: boolean
    isDisabled: boolean
}

interface PrimaryText {
    interface: string
    text: string
    disabled: boolean
}

interface PrimaryLink3 {
    interface: string
    deeplink: string
    onItemSelected: OnItemSelected3[]
}

interface OnItemSelected3 {
    interface: string
    url: string
    clientInformation: any[]
    before: any[]
    after: any[]
    onSuccess: any[]
    onError: OnError8[]
    queue: Queue30
    forced: boolean
}

interface OnError8 {
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

interface OnEndOfWidget {
    interface: string
    url: string
    clientInformation: any[]
    before: any[]
    after: any[]
    onSuccess: any[]
    onError: OnError9[]
    queue: Queue32
    forced: boolean
}

interface OnError9 {
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

interface OnViewed7 {
    interface: string
    feedItemIds?: string[]
    queue: Queue33
    forced: boolean
    url?: string
    clientInformation?: string[]
    before?: any[]
    after?: any[]
    onSuccess?: any[]
    onError?: any[]
}

interface Queue33 {
    interface: string
    id: string
}

interface SettingsSection {
    interface: string
    label: string
    items: Item3[]
}

interface Item3 {
    interface: string
    text: string
    primaryLink: PrimaryLink4
}

interface PrimaryLink4 {
    interface: string
    onItemSelected: OnItemSelected4[]
    deeplink?: string
}

interface OnItemSelected4 {
    interface: string
    uri?: string
    openInNewWindow?: boolean
    onError?: any[]
    queue: Queue34
    forced: boolean
    url?: string
    clientInformation?: any[]
    before?: any[]
    after?: any[]
    onSuccess?: any[]
    template?: Template8
    screenMode?: string
}

interface Queue34 {
    interface: string
    id: string
}

interface Template8 {
    interface: string
    header?: string
    bodyHeader1?: string
    bodyContent1?: string
    bodyHeader2?: string
    bodyContent2?: string
    faqText?: string
    customerServiceText?: string
    sendFeedbackText?: string
    textInputPlaceholder?: string
    cancelButtonText?: string
    submitButtonText?: string
    faqUrl?: string
    customerServiceUrl?: string
    browser?: string
    operatingSystem?: string
    closeDialogOnItemSelected?: CloseDialogOnItemSelected[]
    onCreated: OnCreated7[]
    onBound: any[]
    onViewed: OnViewed8[]
    onInteraction: any[]
    onLeave: any[]
    launchMode: string
    cacheSeconds: number
    buttons?: Button[]
    closeButton?: CloseButton
    body?: Body
    selectorItems?: SelectorItem[]
    selectorDefault?: string
    widgets?: any[]
    templateData?: TemplateData7
    onEndOfWidgetsReached?: any[]
    isEnumerated?: boolean
}

interface CloseDialogOnItemSelected {
    interface: string
    queue: Queue35
    forced: boolean
}

interface Queue35 {
    interface: string
    id: string
}

interface OnCreated7 {
    interface: string
    url?: string
    clientInformation?: any[]
    before?: any[]
    after?: any[]
    onSuccess?: any[]
    onError?: OnError10[]
    queue: Queue37
    forced: boolean
    group?: string
}

interface OnError10 {
    interface: string
    key: string
    after: any[]
    onNoMethodsStored: any[]
    queue: Queue36
    forced: boolean
}

interface Queue36 {
    interface: string
    id: string
}

interface Queue37 {
    interface: string
    id: string
}

interface OnViewed8 {
    interface: string
    url: string
    clientInformation: string[]
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

interface Button {
    interface: string
    text: string
    primaryLink: PrimaryLink5
}

interface PrimaryLink5 {
    interface: string
    onItemSelected: OnItemSelected5[]
}

interface OnItemSelected5 {
    interface: string
    url?: string
    clientInformation?: string[]
    before?: any[]
    after?: After[]
    onSuccess?: any[]
    onError?: any[]
    queue: Queue40
    forced: boolean
}

interface After {
    interface: string
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

interface CloseButton {
    interface: string
    altText: string
    icon: string
    primaryLink: PrimaryLink6
}

interface PrimaryLink6 {
    interface: string
    onItemSelected: OnItemSelected6[]
}

interface OnItemSelected6 {
    interface: string
    queue: Queue41
    forced: boolean
}

interface Queue41 {
    interface: string
    id: string
}

interface Body {
    interface: string
    text: string
    onItemSelected: any[]
}

interface SelectorItem {
    interface: string
    value: string
    mainText: string
    onItemSelected: any[]
    isDisabled: boolean
}

interface TemplateData7 {
    interface: string
    deeplink: string
    title: string
    description: string
    keywords: string
}

interface SubNavMenuItem {
    interface: string
    text: string
    primaryLink: PrimaryLink7
    id: string
    isItemVisibleVertical: boolean
}

interface PrimaryLink7 {
    interface: string
    deeplink: string
    onItemSelected: OnItemSelected7[]
}

interface OnItemSelected7 {
    interface: string
    template: Template9
    screenMode: string
    queue: Queue49
    forced: boolean
}

interface Template9 {
    interface: string
    shouldHideSubNav: boolean
    widgets: any[]
    templateData: TemplateData8
    onEndOfWidgetsReached: any[]
    onCreated: OnCreated8[]
    onBound: any[]
    onViewed: OnViewed9[]
    onInteraction: any[]
    onLeave: any[]
    launchMode: string
    cacheSeconds: number
    isExploreButtonAndEmptyPromptNeeded: boolean
    button?: Button2
    header?: string
    refinementHeader?: RefinementHeader
}

interface TemplateData8 {
    interface: string
    deeplink: string
    seoHead: SeoHead7
    title: string
    description: string
    keywords: string
}

interface SeoHead7 {
    interface: string
    title: string
    meta: Meum7[]
    link: any[]
    script: any[]
}

interface Meum7 {
    interface: string
    name: string
    content: string
}

interface OnCreated8 {
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

interface OnViewed9 {
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

interface Button2 {
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
    template: Template10
    screenMode: string
    queue: Queue48
    forced: boolean
}

interface Template10 {
    interface: string
    header: string
    buttons: Button3[]
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

interface Button3 {
    interface: string
    text: string
    primaryLink: PrimaryLink8
}

interface PrimaryLink8 {
    interface: string
    onItemSelected: OnItemSelected9[]
}

interface OnItemSelected9 {
    interface: string
    url: string
    clientInformation: string[]
    before: any[]
    after: any[]
    onSuccess: any[]
    onError: OnError12[]
    queue: Queue46
    forced: boolean
}

interface OnError12 {
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

interface Queue46 {
    interface: string
    id: string
}

interface CloseButton2 {
    interface: string
    altText: string
    icon: string
    primaryLink: PrimaryLink9
}

interface PrimaryLink9 {
    interface: string
    onItemSelected: OnItemSelected10[]
}

interface OnItemSelected10 {
    interface: string
    queue: Queue47
    forced: boolean
}

interface Queue47 {
    interface: string
    id: string
}

interface Queue48 {
    interface: string
    id: string
}

interface RefinementHeader {
    interface: string
    refinementOptions: any[]
    text: string
    useFilter: boolean
    uuid: string
    onViewed: any[]
    isOpened: boolean
    isActive: boolean
    isDisabled: boolean
}

interface Queue49 {
    interface: string
    id: string
}

interface NavbarActionButton {
    interface: string
    text: string
    iconOnly: boolean
    outline: boolean
    keepInSyncWithNavigationUrl: boolean
    disabled: boolean
    onItemSelected: OnItemSelected11[]
}

interface OnItemSelected11 {
    interface: string
    url: string
    clientInformation: any[]
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

interface Queue51 {
    interface: string
    id: string
}
