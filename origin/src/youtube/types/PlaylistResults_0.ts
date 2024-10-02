export interface PlaylistResults_0 {
    responseContext: ResponseContext
    contents: Contents
    header: Header
    trackingParams: string
    topbar: Topbar
    microformat: Microformat
}

export interface ResponseContext {
    serviceTrackingParams: ServiceTrackingParam[]
    webResponseContextExtensionData: WebResponseContextExtensionData
}

export interface ServiceTrackingParam {
    service: string
    params: Param[]
}

export interface Param {
    key: string
    value: string
}

export interface WebResponseContextExtensionData {
    webResponseContextPreloadData: WebResponseContextPreloadData
    ytConfigData: YtConfigData
    hasDecorated: boolean
}

export interface WebResponseContextPreloadData {
    preloadMessageNames: string[]
}

export interface YtConfigData {
    visitorData: string
    rootVisualElementType: number
}

export interface Contents {
    singleColumnBrowseResultsRenderer: SingleColumnBrowseResultsRenderer
}

export interface SingleColumnBrowseResultsRenderer {
    tabs: Tab[]
}

export interface Tab {
    tabRenderer: TabRenderer
}

export interface TabRenderer {
    selected: boolean
    content: Content
    trackingParams: string
}

export interface Content {
    sectionListRenderer: SectionListRenderer
}

export interface SectionListRenderer {
    contents: Content2[]
    trackingParams: string
}

export interface Content2 {
    itemSectionRenderer: ItemSectionRenderer
}

export interface ItemSectionRenderer {
    contents: Content3[]
    trackingParams: string
}

export interface Content3 {
    playlistVideoListRenderer: PlaylistVideoListRenderer
}

export interface PlaylistVideoListRenderer {
    contents: PlaylistContent[]
    playlistId: string
    isEditable: boolean
    trackingParams: string
    targetId: string
}

export interface PlaylistContent {
    playlistVideoRenderer: YouTubeTrack
    continuationItemRenderer?: ContinuationItemRenderer
}

export interface YouTubeTrack {
    videoId: string
    thumbnail: Thumbnail
    title: Title
    index: Index
    shortBylineText: ShortBylineText
    lengthText: LengthText
    navigationEndpoint: NavigationEndpoint2
    lengthSeconds: string
    trackingParams: string
    isPlayable: boolean
    menu: Menu
    thumbnailOverlays: ThumbnailOverlay[]
    videoInfo: VideoInfo
}

export interface Thumbnail {
    thumbnails: Thumbnail2[]
}

export interface Thumbnail2 {
    url: string
    width: number
    height: number
}

export interface Title {
    runs: Run[]
    accessibility: Accessibility
}

export interface Run {
    text: string
}

export interface Accessibility {
    accessibilityData: AccessibilityData
}

export interface AccessibilityData {
    label: string
}

export interface Index {
    runs: Run2[]
}

export interface Run2 {
    text: string
}

export interface ShortBylineText {
    runs: Run3[]
}

export interface Run3 {
    text: string
    navigationEndpoint: NavigationEndpoint
}

export interface NavigationEndpoint {
    clickTrackingParams: string
    commandMetadata: CommandMetadata
    browseEndpoint: BrowseEndpoint
}

export interface CommandMetadata {
    webCommandMetadata: WebCommandMetadata
}

export interface WebCommandMetadata {
    url: string
    webPageType: string
    rootVe: number
    apiUrl: string
}

export interface BrowseEndpoint {
    browseId: string
    canonicalBaseUrl: string
}

export interface LengthText {
    runs: Run4[]
    accessibility: Accessibility2
}

export interface Run4 {
    text: string
}

export interface Accessibility2 {
    accessibilityData: AccessibilityData2
}

export interface AccessibilityData2 {
    label: string
}

export interface NavigationEndpoint2 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata2
    watchEndpoint: WatchEndpoint
}

export interface CommandMetadata2 {
    webCommandMetadata: WebCommandMetadata2
}

export interface WebCommandMetadata2 {
    url: string
    webPageType: string
    rootVe: number
}

export interface WatchEndpoint {
    videoId: string
    playlistId: string
    index: number
    params: string
    playerParams: string
    loggingContext: LoggingContext
}

export interface LoggingContext {
    vssLoggingContext: VssLoggingContext
}

export interface VssLoggingContext {
    serializedContextData: string
}

export interface Menu {
    menuRenderer: MenuRenderer
}

export interface MenuRenderer {
    items: Item[]
    trackingParams: string
    accessibility: Accessibility3
}

export interface Item {
    menuNavigationItemRenderer: MenuNavigationItemRenderer
}

export interface MenuNavigationItemRenderer {
    text: Text
    navigationEndpoint: NavigationEndpoint3
    trackingParams: string
}

export interface Text {
    runs: Run5[]
}

export interface Run5 {
    text: string
}

export interface NavigationEndpoint3 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata3
    signInEndpoint: SignInEndpoint
}

export interface CommandMetadata3 {
    webCommandMetadata: WebCommandMetadata3
}

export interface WebCommandMetadata3 {
    url: string
    webPageType: string
    rootVe: number
}

export interface SignInEndpoint {
    hack: boolean
}

export interface Accessibility3 {
    accessibilityData: AccessibilityData3
}

export interface AccessibilityData3 {
    label: string
}

export interface ThumbnailOverlay {
    thumbnailOverlayTimeStatusRenderer: ThumbnailOverlayTimeStatusRenderer
}

export interface ThumbnailOverlayTimeStatusRenderer {
    text: Text2
    style: string
}

export interface Text2 {
    runs: Run6[]
    accessibility: Accessibility4
}

export interface Run6 {
    text: string
}

export interface Accessibility4 {
    accessibilityData: AccessibilityData4
}

export interface AccessibilityData4 {
    label: string
}

export interface VideoInfo {
    runs: Run7[]
}

export interface Run7 {
    text: string
}

export interface ContinuationItemRenderer {
    trigger: string
    continuationEndpoint: ContinuationEndpoint
}

export interface ContinuationEndpoint {
    clickTrackingParams: string
    commandMetadata: CommandMetadata4
    continuationCommand: ContinuationCommand
}

export interface CommandMetadata4 {
    webCommandMetadata: WebCommandMetadata4
}

export interface WebCommandMetadata4 {
    sendPost: boolean
    apiUrl: string
}

export interface ContinuationCommand {
    token: string
    request: string
}

export interface Header {
    playlistHeaderRenderer: PlaylistHeaderRenderer
}

export interface PlaylistHeaderRenderer {
    playlistId: string
    title: Title2
    numVideosText: NumVideosText
    descriptionText: DescriptionText
    ownerText: OwnerText
    viewCountText: ViewCountText
    shareData: ShareData
    isEditable: boolean
    privacy: string
    ownerEndpoint: OwnerEndpoint
    editableDetails: EditableDetails
    trackingParams: string
    serviceEndpoints: ServiceEndpoint[]
    stats: Stat[]
    briefStats: BriefStat[]
    playlistHeaderBanner: PlaylistHeaderBanner
    saveButton: SaveButton
    shareButton: ShareButton
    playButton: PlayButton
    shufflePlayButton: ShufflePlayButton
    onDescriptionTap: OnDescriptionTap
    cinematicContainer: CinematicContainer
    byline: Byline[]
    descriptionTapText: DescriptionTapText
}

export interface Title2 {
    runs: Run8[]
}

export interface Run8 {
    text: string
}

export interface NumVideosText {
    runs: Run9[]
}

export interface Run9 {
    text: string
}

export interface DescriptionText {
    runs: Run10[]
}

export interface OwnerText {
    runs: Run10[]
}

export interface Run10 {
    text: string
    navigationEndpoint: NavigationEndpoint4
}

export interface NavigationEndpoint4 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata5
    browseEndpoint: BrowseEndpoint2
}

export interface CommandMetadata5 {
    webCommandMetadata: WebCommandMetadata5
}

export interface WebCommandMetadata5 {
    url: string
    webPageType: string
    rootVe: number
    apiUrl: string
}

export interface BrowseEndpoint2 {
    browseId: string
    canonicalBaseUrl: string
}

export interface ViewCountText {
    runs: Run11[]
}

export interface Run11 {
    text: string
}

export interface ShareData {
    canShare: boolean
}

export interface OwnerEndpoint {
    clickTrackingParams: string
    commandMetadata: CommandMetadata6
    browseEndpoint: BrowseEndpoint3
}

export interface CommandMetadata6 {
    webCommandMetadata: WebCommandMetadata6
}

export interface WebCommandMetadata6 {
    url: string
    webPageType: string
    rootVe: number
    apiUrl: string
}

export interface BrowseEndpoint3 {
    browseId: string
    canonicalBaseUrl: string
}

export interface EditableDetails {
    canDelete: boolean
}

export interface ServiceEndpoint {
    clickTrackingParams: string
    commandMetadata: CommandMetadata7
    playlistEditEndpoint: PlaylistEditEndpoint
}

export interface CommandMetadata7 {
    webCommandMetadata: WebCommandMetadata7
}

export interface WebCommandMetadata7 {
    sendPost: boolean
    apiUrl: string
}

export interface PlaylistEditEndpoint {
    actions: Action[]
}

export interface Action {
    action: string
    sourcePlaylistId: string
}

export interface Stat {
    runs: Run12[]
}

export interface Run12 {
    text: string
}

export interface BriefStat {
    runs: Run13[]
}

export interface Run13 {
    text: string
}

export interface PlaylistHeaderBanner {
    heroPlaylistThumbnailRenderer: HeroPlaylistThumbnailRenderer
}

export interface HeroPlaylistThumbnailRenderer {
    thumbnail: Thumbnail3
    maxRatio: number
    trackingParams: string
    onTap: OnTap
}

export interface Thumbnail3 {
    thumbnails: Thumbnail4[]
}

export interface Thumbnail4 {
    url: string
    width: number
    height: number
}

export interface OnTap {
    clickTrackingParams: string
    commandMetadata: CommandMetadata8
    watchEndpoint: WatchEndpoint2
}

export interface CommandMetadata8 {
    webCommandMetadata: WebCommandMetadata8
}

export interface WebCommandMetadata8 {
    url: string
    webPageType: string
    rootVe: number
}

export interface WatchEndpoint2 {
    videoId: string
    playlistId: string
    playerParams: string
    loggingContext: LoggingContext2
}

export interface LoggingContext2 {
    vssLoggingContext: VssLoggingContext2
}

export interface VssLoggingContext2 {
    serializedContextData: string
}

export interface SaveButton {
    toggleButtonRenderer: ToggleButtonRenderer
}

export interface ToggleButtonRenderer {
    style: Style
    size: Size
    isToggled: boolean
    isDisabled: boolean
    defaultIcon: DefaultIcon
    toggledIcon: ToggledIcon
    trackingParams: string
    defaultTooltip: string
    toggledTooltip: string
    toggledStyle: ToggledStyle
    defaultNavigationEndpoint: DefaultNavigationEndpoint
    accessibilityData: AccessibilityData5
    toggledAccessibilityData: ToggledAccessibilityData
}

export interface Style {
    styleType: string
}

export interface Size {
    sizeType: string
}

export interface DefaultIcon {
    iconType: string
}

export interface ToggledIcon {
    iconType: string
}

export interface ToggledStyle {
    styleType: string
}

export interface DefaultNavigationEndpoint {
    clickTrackingParams: string
    commandMetadata: CommandMetadata9
    modalEndpoint: ModalEndpoint
}

export interface CommandMetadata9 {
    webCommandMetadata: WebCommandMetadata9
}

export interface WebCommandMetadata9 {
    ignoreNavigation: boolean
}

export interface ModalEndpoint {
    modal: Modal
}

export interface Modal {
    modalWithTitleAndButtonRenderer: ModalWithTitleAndButtonRenderer
}

export interface ModalWithTitleAndButtonRenderer {
    title: Title3
    content: Content5
    button: Button
}

export interface Title3 {
    runs: Run14[]
}

export interface Run14 {
    text: string
}

export interface Content5 {
    runs: Run15[]
}

export interface Run15 {
    text: string
}

export interface Button {
    buttonRenderer: ButtonRenderer
}

export interface ButtonRenderer {
    style: string
    size: string
    isDisabled: boolean
    text: Text3
    navigationEndpoint: NavigationEndpoint5
    trackingParams: string
}

export interface Text3 {
    runs: Run16[]
}

export interface Run16 {
    text: string
}

export interface NavigationEndpoint5 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata10
    signInEndpoint: SignInEndpoint2
}

export interface CommandMetadata10 {
    webCommandMetadata: WebCommandMetadata10
}

export interface WebCommandMetadata10 {
    url: string
    webPageType: string
    rootVe: number
}

export interface SignInEndpoint2 {
    nextEndpoint: NextEndpoint
}

export interface NextEndpoint {
    clickTrackingParams: string
    commandMetadata: CommandMetadata11
    browseEndpoint: BrowseEndpoint4
}

export interface CommandMetadata11 {
    webCommandMetadata: WebCommandMetadata11
}

export interface WebCommandMetadata11 {
    url: string
    webPageType: string
    rootVe: number
    apiUrl: string
}

export interface BrowseEndpoint4 {
    browseId: string
}

export interface AccessibilityData5 {
    accessibilityData: AccessibilityData6
}

export interface AccessibilityData6 {
    label: string
}

export interface ToggledAccessibilityData {
    accessibilityData: AccessibilityData7
}

export interface AccessibilityData7 {
    label: string
}

export interface ShareButton {
    buttonRenderer: ButtonRenderer2
}

export interface ButtonRenderer2 {
    style: string
    size: string
    isDisabled: boolean
    icon: Icon
    navigationEndpoint: NavigationEndpoint6
    accessibility: Accessibility5
    tooltip: string
    trackingParams: string
    accessibilityData: AccessibilityData8
}

export interface Icon {
    iconType: string
}

export interface NavigationEndpoint6 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata12
    shareEntityEndpoint: ShareEntityEndpoint
}

export interface CommandMetadata12 {
    webCommandMetadata: WebCommandMetadata12
}

export interface WebCommandMetadata12 {
    ignoreNavigation: boolean
}

export interface ShareEntityEndpoint {
    serializedShareEntity: string
    sharePanelType: string
}

export interface Accessibility5 {
    label: string
}

export interface AccessibilityData8 {
    accessibilityData: AccessibilityData9
}

export interface AccessibilityData9 {
    label: string
}

export interface PlayButton {
    buttonRenderer: ButtonRenderer3
}

export interface ButtonRenderer3 {
    style: string
    size: string
    isDisabled: boolean
    text: Text4
    icon: Icon2
    navigationEndpoint: NavigationEndpoint7
    trackingParams: string
}

export interface Text4 {
    simpleText: string
}

export interface Icon2 {
    iconType: string
}

export interface NavigationEndpoint7 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata13
    watchEndpoint: WatchEndpoint3
}

export interface CommandMetadata13 {
    webCommandMetadata: WebCommandMetadata13
}

export interface WebCommandMetadata13 {
    url: string
    webPageType: string
    rootVe: number
}

export interface WatchEndpoint3 {
    videoId: string
    playlistId: string
    playerParams: string
    loggingContext: LoggingContext3
}

export interface LoggingContext3 {
    vssLoggingContext: VssLoggingContext3
}

export interface VssLoggingContext3 {
    serializedContextData: string
}

export interface ShufflePlayButton {
    buttonRenderer: ButtonRenderer4
}

export interface ButtonRenderer4 {
    style: string
    size: string
    isDisabled: boolean
    text: Text5
    icon: Icon3
    navigationEndpoint: NavigationEndpoint8
    trackingParams: string
}

export interface Text5 {
    simpleText: string
}

export interface Icon3 {
    iconType: string
}

export interface NavigationEndpoint8 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata14
    watchEndpoint: WatchEndpoint4
}

export interface CommandMetadata14 {
    webCommandMetadata: WebCommandMetadata14
}

export interface WebCommandMetadata14 {
    url: string
    webPageType: string
    rootVe: number
}

export interface WatchEndpoint4 {
    videoId: string
    playlistId: string
    params: string
    playerParams: string
    loggingContext: LoggingContext4
}

export interface LoggingContext4 {
    vssLoggingContext: VssLoggingContext4
}

export interface VssLoggingContext4 {
    serializedContextData: string
}

export interface OnDescriptionTap {
    clickTrackingParams: string
    openPopupAction: OpenPopupAction
}

export interface OpenPopupAction {
    popup: Popup
    popupType: string
}

export interface Popup {
    fancyDismissibleDialogRenderer: FancyDismissibleDialogRenderer
}

export interface FancyDismissibleDialogRenderer {
    dialogMessage: DialogMessage
    title: Title4
    confirmLabel: ConfirmLabel
    trackingParams: string
}

export interface DialogMessage { }

export interface Title4 {
    runs: Run17[]
}

export interface Run17 {
    text: string
}

export interface ConfirmLabel {
    runs: Run18[]
}

export interface Run18 {
    text: string
}

export interface CinematicContainer {
    cinematicContainerRenderer: CinematicContainerRenderer
}

export interface CinematicContainerRenderer {
    backgroundImageConfig: BackgroundImageConfig
    gradientColorConfig: GradientColorConfig[]
    config: Config
}

export interface BackgroundImageConfig {
    thumbnail: Thumbnail5
}

export interface Thumbnail5 {
    thumbnails: Thumbnail6[]
}

export interface Thumbnail6 {
    url: string
    width: number
    height: number
}

export interface GradientColorConfig {
    lightThemeColor: number
    darkThemeColor: number
    startLocation: number
}

export interface Config {
    lightThemeBackgroundColor: number
    darkThemeBackgroundColor: number
    colorSourceSizeMultiplier: number
    applyClientImageBlur: boolean
}

export interface Byline {
    playlistBylineRenderer: PlaylistBylineRenderer
}

export interface PlaylistBylineRenderer {
    text: Text6
}

export interface Text6 {
    runs: Run19[]
}

export interface Run19 {
    text: string
}

export interface DescriptionTapText {
    runs: Run20[]
}

export interface Run20 {
    text: string
}

export interface Topbar {
    mobileTopbarRenderer: MobileTopbarRenderer
}

export interface MobileTopbarRenderer {
    trackingParams: string
    searchCommand: SearchCommand
    voiceSearchButton: VoiceSearchButton
    topbarLogo: TopbarLogo
}

export interface SearchCommand {
    clickTrackingParams: string
    commandMetadata: CommandMetadata15
    searchEndpoint: SearchEndpoint
}

export interface CommandMetadata15 {
    webCommandMetadata: WebCommandMetadata15
}

export interface WebCommandMetadata15 {
    url: string
    webPageType: string
    rootVe: number
}

export interface SearchEndpoint {
    params: string
    hack: boolean
}

export interface VoiceSearchButton {
    buttonRenderer: ButtonRenderer5
}

export interface ButtonRenderer5 {
    style: string
    size: string
    isDisabled: boolean
    serviceEndpoint: ServiceEndpoint2
    icon: Icon5
    tooltip: string
    trackingParams: string
    accessibilityData: AccessibilityData12
}

export interface ServiceEndpoint2 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata16
    signalServiceEndpoint: SignalServiceEndpoint
}

export interface CommandMetadata16 {
    webCommandMetadata: WebCommandMetadata16
}

export interface WebCommandMetadata16 {
    sendPost: boolean
}

export interface SignalServiceEndpoint {
    signal: string
    actions: Action2[]
}

export interface Action2 {
    clickTrackingParams: string
    openPopupAction: OpenPopupAction2
}

export interface OpenPopupAction2 {
    popup: Popup2
    popupType: string
}

export interface Popup2 {
    voiceSearchDialogRenderer: VoiceSearchDialogRenderer
}

export interface VoiceSearchDialogRenderer {
    placeholderHeader: PlaceholderHeader
    promptHeader: PromptHeader
    exampleQuery1: ExampleQuery1
    exampleQuery2: ExampleQuery2
    promptMicrophoneLabel: PromptMicrophoneLabel
    loadingHeader: LoadingHeader
    connectionErrorHeader: ConnectionErrorHeader
    connectionErrorMicrophoneLabel: ConnectionErrorMicrophoneLabel
    permissionsHeader: PermissionsHeader
    permissionsSubtext: PermissionsSubtext
    disabledHeader: DisabledHeader
    disabledSubtext: DisabledSubtext
    microphoneButtonAriaLabel: MicrophoneButtonAriaLabel
    exitButton: ExitButton
    trackingParams: string
    microphoneOffPromptHeader: MicrophoneOffPromptHeader
}

export interface PlaceholderHeader {
    runs: Run21[]
}

export interface Run21 {
    text: string
}

export interface PromptHeader {
    runs: Run22[]
}

export interface Run22 {
    text: string
}

export interface ExampleQuery1 {
    runs: Run23[]
}

export interface Run23 {
    text: string
}

export interface ExampleQuery2 {
    runs: Run24[]
}

export interface Run24 {
    text: string
}

export interface PromptMicrophoneLabel {
    runs: Run25[]
}

export interface Run25 {
    text: string
}

export interface LoadingHeader {
    runs: Run26[]
}

export interface Run26 {
    text: string
}

export interface ConnectionErrorHeader {
    runs: Run27[]
}

export interface Run27 {
    text: string
}

export interface ConnectionErrorMicrophoneLabel {
    runs: Run28[]
}

export interface Run28 {
    text: string
}

export interface PermissionsHeader {
    runs: Run29[]
}

export interface Run29 {
    text: string
}

export interface PermissionsSubtext {
    runs: Run30[]
}

export interface Run30 {
    text: string
}

export interface DisabledHeader {
    runs: Run31[]
}

export interface Run31 {
    text: string
}

export interface DisabledSubtext {
    runs: Run32[]
}

export interface Run32 {
    text: string
}

export interface MicrophoneButtonAriaLabel {
    runs: Run33[]
}

export interface Run33 {
    text: string
}

export interface ExitButton {
    buttonRenderer: ButtonRenderer6
}

export interface ButtonRenderer6 {
    style: string
    size: string
    isDisabled: boolean
    icon: Icon4
    trackingParams: string
    accessibilityData: AccessibilityData10
}

export interface Icon4 {
    iconType: string
}

export interface AccessibilityData10 {
    accessibilityData: AccessibilityData11
}

export interface AccessibilityData11 {
    label: string
}

export interface MicrophoneOffPromptHeader {
    runs: Run34[]
}

export interface Run34 {
    text: string
}

export interface Icon5 {
    iconType: string
}

export interface AccessibilityData12 {
    accessibilityData: AccessibilityData13
}

export interface AccessibilityData13 {
    label: string
}

export interface TopbarLogo {
    topbarLogoRenderer: TopbarLogoRenderer
}

export interface TopbarLogoRenderer {
    iconImage: IconImage
    tooltipText: TooltipText
    endpoint: Endpoint
    trackingParams: string
    overrideEntityKey: string
}

export interface IconImage {
    iconType: string
}

export interface TooltipText {
    runs: Run35[]
}

export interface Run35 {
    text: string
}

export interface Endpoint {
    clickTrackingParams: string
    commandMetadata: CommandMetadata17
    browseEndpoint: BrowseEndpoint5
}

export interface CommandMetadata17 {
    webCommandMetadata: WebCommandMetadata17
}

export interface WebCommandMetadata17 {
    url: string
    webPageType: string
    rootVe: number
    apiUrl: string
}

export interface BrowseEndpoint5 {
    browseId: string
}

export interface Microformat {
    microformatDataRenderer: MicroformatDataRenderer
}

export interface MicroformatDataRenderer {
    urlCanonical: string
    title: string
    description: string
    thumbnail: Thumbnail7
    siteName: string
    appName: string
    androidPackage: string
    iosAppStoreId: string
    iosAppArguments: string
    ogType: string
    urlApplinksWeb: string
    urlApplinksIos: string
    urlApplinksAndroid: string
    urlTwitterIos: string
    urlTwitterAndroid: string
    twitterCardType: string
    twitterSiteHandle: string
    schemaDotOrgType: string
    noindex: boolean
    unlisted: boolean
    linkAlternates: LinkAlternate[]
}

export interface Thumbnail7 {
    thumbnails: Thumbnail8[]
}

export interface Thumbnail8 {
    url: string
    width: number
    height: number
}

export interface LinkAlternate {
    hrefUrl: string
}
