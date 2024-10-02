import { PageHeaderViewModel } from "./PageHeaderViewModel"

export interface PlaylistResults_1 {
    responseContext: ResponseContext
    contents: Contents
    header: Header2
    alerts: Alert[]
    metadata: Metadata
    trackingParams: string
    topbar: Topbar
    microformat: Microformat
    sidebar: Sidebar
}

export interface ResponseContext {
    serviceTrackingParams: ServiceTrackingParam[]
    mainAppWebResponseContext: MainAppWebResponseContext
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

export interface MainAppWebResponseContext {
    datasyncId: string
    loggedOut: boolean
    trackingParam: string
}

export interface WebResponseContextExtensionData {
    ytConfigData: YtConfigData
    hasDecorated: boolean
}

export interface YtConfigData {
    visitorData: string
    sessionIndex: number
    rootVisualElementType: number
}

export interface Contents {
    twoColumnBrowseResultsRenderer: TwoColumnBrowseResultsRenderer
}

export interface TwoColumnBrowseResultsRenderer {
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
    header: Header
}

export interface Content3 {
    playlistVideoListRenderer: PlaylistVideoListRenderer
}

export interface PlaylistVideoListRenderer {
    contents: Content4[]
    playlistId: string
    isEditable: boolean
    canReorder: boolean
    trackingParams: string
    onReorderEndpoint: OnReorderEndpoint
    sortFilterMenu: SortFilterMenu
    targetId: string
}

export interface Content4 {
    playlistVideoRenderer?: YouTubeTrack
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
    setVideoId: string
    lengthSeconds: string
    trackingParams: string
    isPlayable: boolean
    menu: Menu
    thumbnailOverlays: ThumbnailOverlay[]
    videoInfo: VideoInfo
    badges?: Badge[]
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
    simpleText: string
}

export interface ShortBylineText {
    runs: Run2[]
}

export interface Run2 {
    text: string
    navigationEndpoint?: NavigationEndpoint
}

export interface NavigationEndpoint {
    clickTrackingParams: string
    commandMetadata?: CommandMetadata
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

export interface CommandMMetadata {
    webCommandMetadata: WebCommandMetadata2
}

export interface WebCommandMetadata2 {
    url: string
    webPageType: string
    rootVe: number
    apiUrl: string
}

export interface NavigationNEndpoint {
    clickTrackingParams: string
    commandMetadata: CommandMetadata2
    browseEndpoint: BrowseEndpoint2
}

export interface CommandMetadata2 {
    webCommandMetadata: WebCommandMetadata3
}

export interface WebCommandMetadata3 {
    url: string
    webPageType: string
    rootVe: number
    apiUrl: string
}

export interface BrowseEndpoint2 {
    browseId: string
    canonicalBaseUrl: string
}

export interface LengthText {
    accessibility: Accessibility2
    simpleText: string
}

export interface Accessibility2 {
    accessibilityData: AccessibilityData2
}

export interface AccessibilityData2 {
    label: string
}

export interface NavigationEndpoint2 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata3
    watchEndpoint: WatchEndpoint
}

export interface CommandMetadata3 {
    webCommandMetadata: WebCommandMetadata4
}

export interface WebCommandMetadata4 {
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
    watchEndpointSupportedOnesieConfig: WatchEndpointSupportedOnesieConfig
    startTimeSeconds?: number
}

export interface LoggingContext {
    vssLoggingContext: VssLoggingContext
}

export interface VssLoggingContext {
    serializedContextData: string
}

export interface WatchEndpointSupportedOnesieConfig {
    html5PlaybackOnesieConfig: Html5PlaybackOnesieConfig
}

export interface Html5PlaybackOnesieConfig {
    commonConfig: CommonConfig
}

export interface CommonConfig {
    url: string
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
    menuServiceItemRenderer?: MenuServiceItemRenderer
    menuServiceItemDownloadRenderer?: MenuServiceItemDownloadRenderer
}

export interface MenuServiceItemRenderer {
    text: Text
    icon: Icon
    serviceEndpoint: ServiceEndpoint
    trackingParams: string
    hasSeparator?: boolean
}

export interface Text {
    runs: Run3[]
}

export interface Run3 {
    text: string
}

export interface Icon {
    iconType: string
}

export interface ServiceEndpoint {
    clickTrackingParams: string
    commandMetadata: CommandMetadata4
    playlistEditEndpoint?: PlaylistEditEndpoint
    shareEntityServiceEndpoint?: ShareEntityServiceEndpoint
    signalServiceEndpoint?: SignalServiceEndpoint
    addToPlaylistServiceEndpoint?: AddToPlaylistServiceEndpoint
}

export interface CommandMetadata4 {
    webCommandMetadata: WebCommandMetadata5
}

export interface WebCommandMetadata5 {
    sendPost: boolean
    apiUrl?: string
}

export interface PlaylistEditEndpoint {
    playlistId: string
    actions: Action[]
    params: string
    clientActions?: ClientAction[]
}

export interface Action {
    setVideoId: string
    action: string
}

export interface ClientAction {
    clickTrackingParams: string
    playlistRemoveVideosAction: PlaylistRemoveVideosAction
}

export interface PlaylistRemoveVideosAction {
    setVideoIds: string[]
}

export interface ShareEntityServiceEndpoint {
    serializedShareEntity: string
    commands: Command[]
}

export interface Command {
    clickTrackingParams: string
    openPopupAction: OpenPopupAction
}

export interface OpenPopupAction {
    popup: Popup
    popupType: string
    beReused: boolean
}

export interface Popup {
    unifiedSharePanelRenderer: UnifiedSharePanelRenderer
}

export interface UnifiedSharePanelRenderer {
    trackingParams: string
    showLoadingSpinner: boolean
}

export interface SignalServiceEndpoint {
    signal: string
    actions: Action2[]
}

export interface Action2 {
    clickTrackingParams: string
    addToPlaylistCommand: AddToPlaylistCommand
}

export interface AddToPlaylistCommand {
    openMiniplayer: boolean
    videoId: string
    listType: string
    onCreateListCommand: OnCreateListCommand
    videoIds: string[]
}

export interface OnCreateListCommand {
    clickTrackingParams: string
    commandMetadata: CommandMetadata5
    createPlaylistServiceEndpoint: CreatePlaylistServiceEndpoint
}

export interface CommandMetadata5 {
    webCommandMetadata: WebCommandMetadata6
}

export interface WebCommandMetadata6 {
    sendPost: boolean
    apiUrl: string
}

export interface CreatePlaylistServiceEndpoint {
    videoIds: string[]
    params: string
}

export interface AddToPlaylistServiceEndpoint {
    videoId: string
}

export interface MenuServiceItemDownloadRenderer {
    serviceEndpoint: ServiceEndpoint2
    trackingParams: string
}

export interface ServiceEndpoint2 {
    clickTrackingParams: string
    offlineVideoEndpoint: OfflineVideoEndpoint
}

export interface OfflineVideoEndpoint {
    videoId: string
    onAddCommand: OnAddCommand
}

export interface OnAddCommand {
    clickTrackingParams: string
    getDownloadActionCommand: GetDownloadActionCommand
}

export interface GetDownloadActionCommand {
    videoId: string
    params: string
}

export interface Accessibility3 {
    accessibilityData: AccessibilityData3
}

export interface AccessibilityData3 {
    label: string
}

export interface ThumbnailOverlay {
    thumbnailOverlayTimeStatusRenderer?: ThumbnailOverlayTimeStatusRenderer
    thumbnailOverlayNowPlayingRenderer?: ThumbnailOverlayNowPlayingRenderer
    thumbnailOverlayPlaybackStatusRenderer?: ThumbnailOverlayPlaybackStatusRenderer
    thumbnailOverlayResumePlaybackRenderer?: ThumbnailOverlayResumePlaybackRenderer
}

export interface ThumbnailOverlayTimeStatusRenderer {
    text: Text2
    style: string
}

export interface Text2 {
    accessibility: Accessibility4
    simpleText: string
}

export interface Accessibility4 {
    accessibilityData: AccessibilityData4
}

export interface AccessibilityData4 {
    label: string
}

export interface ThumbnailOverlayNowPlayingRenderer {
    text: Text3
}

export interface Text3 {
    runs: Run4[]
}

export interface Run4 {
    text: string
}

export interface ThumbnailOverlayPlaybackStatusRenderer {
    texts: Text4[]
}

export interface Text4 {
    runs: Run5[]
}

export interface Run5 {
    text: string
}

export interface ThumbnailOverlayResumePlaybackRenderer {
    percentDurationWatched: number
}

export interface VideoInfo {
    runs: Run6[]
}

export interface Run6 {
    text: string
}

export interface Badge {
    metadataBadgeRenderer: MetadataBadgeRenderer
}

export interface MetadataBadgeRenderer {
    style: string
    label: string
    trackingParams: string
}

export interface ContinuationItemRenderer {
    trigger: string
    continuationEndpoint: ContinuationEndpoint
}

export interface ContinuationEndpoint {
    clickTrackingParams: string
    commandMetadata: CommandMetadata6
    continuationCommand: ContinuationCommand
}

export interface CommandMetadata6 {
    webCommandMetadata: WebCommandMetadata7
}

export interface WebCommandMetadata7 {
    sendPost: boolean
    apiUrl: string
}

export interface ContinuationCommand {
    token: string
    request: string
}

export interface OnReorderEndpoint {
    clickTrackingParams: string
    commandMetadata: CommandMetadata7
    playlistEditEndpoint: PlaylistEditEndpoint2
}

export interface CommandMetadata7 {
    webCommandMetadata: WebCommandMetadata8
}

export interface WebCommandMetadata8 {
    sendPost: boolean
    apiUrl: string
}

export interface PlaylistEditEndpoint2 {
    playlistId: string
    actions: Action3[]
    params: string
}

export interface Action3 {
    action: string
}

export interface SortFilterMenu {
    sortFilterSubMenuRenderer: SortFilterSubMenuRenderer
}

export interface SortFilterSubMenuRenderer {
    subMenuItems: SubMenuItem[]
    title: string
    icon: Icon2
    accessibility: Accessibility6
    trackingParams: string
}

export interface SubMenuItem {
    title: string
    selected: boolean
    serviceEndpoint: ServiceEndpoint3
    accessibility: Accessibility5
    trackingParams: string
}

export interface ServiceEndpoint3 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata8
    playlistEditEndpoint: PlaylistEditEndpoint3
}

export interface CommandMetadata8 {
    webCommandMetadata: WebCommandMetadata9
}

export interface WebCommandMetadata9 {
    sendPost: boolean
    apiUrl: string
}

export interface PlaylistEditEndpoint3 {
    playlistId: string
    actions: Action4[]
    params: string
}

export interface Action4 {
    action: string
    playlistVideoOrder: number
}

export interface Accessibility5 {
    accessibilityData: AccessibilityData5
}

export interface AccessibilityData5 {
    label: string
}

export interface Icon2 {
    iconType: string
}

export interface Accessibility6 {
    accessibilityData: AccessibilityData6
}

export interface AccessibilityData6 {
    label: string
}

export interface Header {
    sortFilterHeaderRenderer: SortFilterHeaderRenderer
}

export interface SortFilterHeaderRenderer {
    filterMenu: FilterMenu
    trackingParams: string
}

export interface FilterMenu {
    sortFilterSubMenuRenderer: SortFilterSubMenuRenderer2
}

export interface SortFilterSubMenuRenderer2 {
    subMenuItems: SubMenuItem2[]
    title: string
    icon: Icon3
    accessibility: Accessibility8
    trackingParams: string
}

export interface SubMenuItem2 {
    title: string
    selected: boolean
    serviceEndpoint: ServiceEndpoint4
    accessibility: Accessibility7
    trackingParams: string
}

export interface ServiceEndpoint4 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata9
    playlistEditEndpoint: PlaylistEditEndpoint4
}

export interface CommandMetadata9 {
    webCommandMetadata: WebCommandMetadata10
}

export interface WebCommandMetadata10 {
    sendPost: boolean
    apiUrl: string
}

export interface PlaylistEditEndpoint4 {
    playlistId: string
    actions: Action5[]
    params: string
}

export interface Action5 {
    action: string
    playlistVideoOrder: number
}

export interface Accessibility7 {
    accessibilityData: AccessibilityData7
}

export interface AccessibilityData7 {
    label: string
}

export interface Icon3 {
    iconType: string
}

export interface Accessibility8 {
    accessibilityData: AccessibilityData8
}

export interface AccessibilityData8 {
    label: string
}

export interface Header2 {
    playlistHeaderRenderer: PlaylistHeaderRenderer
    pageHeaderRenderer: {
        content: {
            pageHeaderViewModel: PageHeaderViewModel
        }
    }
}

export interface PlaylistHeaderRenderer {
    playlistId: string
    title: Title2
    numVideosText: NumVideosText
    ownerText: OwnerText
    viewCountText: ViewCountText
    shareData: ShareData
    isEditable: boolean
    privacy: string
    ownerEndpoint: OwnerEndpoint
    editableDetails: EditableDetails
    offlineability: Offlineability
    trackingParams: string
    serviceEndpoints: ServiceEndpoint5[]
    stats: Stat[]
    briefStats: BriefStat[]
    playlistHeaderBanner: PlaylistHeaderBanner
    moreActionsMenu: MoreActionsMenu
    playButton: PlayButton
    shufflePlayButton: ShufflePlayButton
    cinematicContainer: CinematicContainer
    byline: Byline[]
}

export interface Title2 {
    simpleText: string
}

export interface NumVideosText {
    runs: Run7[]
}

export interface Run7 {
    text: string
}

export interface OwnerText {
    runs: Run8[]
}

export interface Run8 {
    text: string
    navigationEndpoint: NavigationEndpoint3
}

export interface NavigationEndpoint3 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata10
    browseEndpoint: BrowseEndpoint3
}

export interface CommandMetadata10 {
    webCommandMetadata: WebCommandMetadata11
}

export interface WebCommandMetadata11 {
    url: string
    webPageType: string
    rootVe: number
    apiUrl: string
}

export interface BrowseEndpoint3 {
    browseId: string
    canonicalBaseUrl: string
}

export interface ViewCountText {
    simpleText: string
}

export interface ShareData {
    canShare: boolean
}

export interface OwnerEndpoint {
    clickTrackingParams: string
    commandMetadata: CommandMetadata11
    browseEndpoint: BrowseEndpoint4
}

export interface CommandMetadata11 {
    webCommandMetadata: WebCommandMetadata12
}

export interface WebCommandMetadata12 {
    url: string
    webPageType: string
    rootVe: number
    apiUrl: string
}

export interface BrowseEndpoint4 {
    browseId: string
    canonicalBaseUrl: string
}

export interface EditableDetails {
    canDelete: boolean
}

export interface Offlineability {
    downloadButtonRenderer: DownloadButtonRenderer
}

export interface DownloadButtonRenderer {
    trackingParams: string
    style: string
    size: string
    accessibilityData: AccessibilityData9
    targetId: string
    command: Command2
}

export interface AccessibilityData9 {
    accessibilityData: AccessibilityData10
}

export interface AccessibilityData10 {
    label: string
}

export interface Command2 {
    clickTrackingParams: string
    offlinePlaylistEndpoint: OfflinePlaylistEndpoint
}

export interface OfflinePlaylistEndpoint {
    playlistId: string
    onAddCommand: OnAddCommand2
}

export interface OnAddCommand2 {
    clickTrackingParams: string
    getDownloadActionCommand: GetDownloadActionCommand2
}

export interface GetDownloadActionCommand2 {
    playlistId: string
    params: string
}

export interface ServiceEndpoint5 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata12
    playlistEditEndpoint: PlaylistEditEndpoint5
}

export interface CommandMetadata12 {
    webCommandMetadata: WebCommandMetadata13
}

export interface WebCommandMetadata13 {
    sendPost: boolean
    apiUrl: string
}

export interface PlaylistEditEndpoint5 {
    playlistId?: string
    actions: Action6[]
}

export interface Action6 {
    action: string
    sourcePlaylistId?: string
}

export interface Stat {
    runs?: Run9[]
    simpleText?: string
}

export interface Run9 {
    text: string
}

export interface BriefStat {
    runs: Run10[]
}

export interface Run10 {
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
    thumbnailOverlays: ThumbnailOverlays
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
    commandMetadata: CommandMetadata13
    watchEndpoint: WatchEndpoint2
}

export interface CommandMetadata13 {
    webCommandMetadata: WebCommandMetadata14
}

export interface WebCommandMetadata14 {
    url: string
    webPageType: string
    rootVe: number
}

export interface WatchEndpoint2 {
    videoId: string
    playlistId: string
    playerParams: string
    loggingContext: LoggingContext2
    watchEndpointSupportedOnesieConfig: WatchEndpointSupportedOnesieConfig2
}

export interface LoggingContext2 {
    vssLoggingContext: VssLoggingContext2
}

export interface VssLoggingContext2 {
    serializedContextData: string
}

export interface WatchEndpointSupportedOnesieConfig2 {
    html5PlaybackOnesieConfig: Html5PlaybackOnesieConfig2
}

export interface Html5PlaybackOnesieConfig2 {
    commonConfig: CommonConfig2
}

export interface CommonConfig2 {
    url: string
}

export interface ThumbnailOverlays {
    thumbnailOverlayHoverTextRenderer: ThumbnailOverlayHoverTextRenderer
}

export interface ThumbnailOverlayHoverTextRenderer {
    text: Text5
    icon: Icon4
}

export interface Text5 {
    simpleText: string
}

export interface Icon4 {
    iconType: string
}

export interface MoreActionsMenu {
    menuRenderer: MenuRenderer2
}

export interface MenuRenderer2 {
    items: Item2[]
    trackingParams: string
    accessibility: Accessibility9
    targetId: string
}

export interface Item2 {
    menuNavigationItemRenderer: MenuNavigationItemRenderer
}

export interface MenuNavigationItemRenderer {
    text: Text6
    icon: Icon5
    navigationEndpoint: NavigationEndpoint4
    trackingParams: string
}

export interface Text6 {
    simpleText?: string
    runs?: Run11[]
}

export interface Run11 {
    text: string
}

export interface Icon5 {
    iconType: string
}

export interface NavigationEndpoint4 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata14
    browseEndpoint?: BrowseEndpoint5
    confirmDialogEndpoint?: ConfirmDialogEndpoint
}

export interface CommandMetadata14 {
    webCommandMetadata: WebCommandMetadata15
}

export interface WebCommandMetadata15 {
    url?: string
    webPageType?: string
    rootVe?: number
    apiUrl?: string
    ignoreNavigation?: boolean
}

export interface BrowseEndpoint5 {
    browseId: string
    params: string
    nofollow: boolean
    navigationType: string
}

export interface ConfirmDialogEndpoint {
    content: Content5
}

export interface Content5 {
    confirmDialogRenderer: ConfirmDialogRenderer
}

export interface ConfirmDialogRenderer {
    title: Title3
    trackingParams: string
    dialogMessages: DialogMessage[]
    confirmButton: ConfirmButton
    cancelButton: CancelButton
    primaryIsCancel: boolean
}

export interface Title3 {
    runs: Run12[]
}

export interface Run12 {
    text: string
}

export interface DialogMessage {
    runs: Run13[]
}

export interface Run13 {
    text: string
}

export interface ConfirmButton {
    buttonRenderer: ButtonRenderer
}

export interface ButtonRenderer {
    style: string
    size: string
    isDisabled: boolean
    text: Text7
    serviceEndpoint: ServiceEndpoint6
    trackingParams: string
}

export interface Text7 {
    runs: Run14[]
}

export interface Run14 {
    text: string
}

export interface ServiceEndpoint6 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata15
    playlistEditEndpoint: PlaylistEditEndpoint6
}

export interface CommandMetadata15 {
    webCommandMetadata: WebCommandMetadata16
}

export interface WebCommandMetadata16 {
    sendPost: boolean
    apiUrl: string
}

export interface PlaylistEditEndpoint6 {
    playlistId: string
    actions: Action7[]
    params: string
}

export interface Action7 {
    action: string
}

export interface CancelButton {
    buttonRenderer: ButtonRenderer2
}

export interface ButtonRenderer2 {
    style: string
    size: string
    isDisabled: boolean
    text: Text8
    trackingParams: string
    command: Command3
}

export interface Text8 {
    runs: Run15[]
}

export interface Run15 {
    text: string
}

export interface Command3 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata16
    signalServiceEndpoint: SignalServiceEndpoint2
}

export interface CommandMetadata16 {
    webCommandMetadata: WebCommandMetadata17
}

export interface WebCommandMetadata17 {
    sendPost: boolean
}

export interface SignalServiceEndpoint2 {
    signal: string
    actions: Action8[]
}

export interface Action8 {
    clickTrackingParams: string
    signalAction: SignalAction
}

export interface SignalAction {
    signal: string
}

export interface Accessibility9 {
    accessibilityData: AccessibilityData11
}

export interface AccessibilityData11 {
    label: string
}

export interface PlayButton {
    buttonRenderer: ButtonRenderer3
}

export interface ButtonRenderer3 {
    style: string
    size: string
    isDisabled: boolean
    text: Text9
    icon: Icon6
    navigationEndpoint: NavigationEndpoint5
    trackingParams: string
}

export interface Text9 {
    simpleText: string
}

export interface Icon6 {
    iconType: string
}

export interface NavigationEndpoint5 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata17
    watchEndpoint: WatchEndpoint3
}

export interface CommandMetadata17 {
    webCommandMetadata: WebCommandMetadata18
}

export interface WebCommandMetadata18 {
    url: string
    webPageType: string
    rootVe: number
}

export interface WatchEndpoint3 {
    videoId: string
    playlistId: string
    playerParams: string
    loggingContext: LoggingContext3
    watchEndpointSupportedOnesieConfig: WatchEndpointSupportedOnesieConfig3
}

export interface LoggingContext3 {
    vssLoggingContext: VssLoggingContext3
}

export interface VssLoggingContext3 {
    serializedContextData: string
}

export interface WatchEndpointSupportedOnesieConfig3 {
    html5PlaybackOnesieConfig: Html5PlaybackOnesieConfig3
}

export interface Html5PlaybackOnesieConfig3 {
    commonConfig: CommonConfig3
}

export interface CommonConfig3 {
    url: string
}

export interface ShufflePlayButton {
    buttonRenderer: ButtonRenderer4
}

export interface ButtonRenderer4 {
    style: string
    size: string
    isDisabled: boolean
    text: Text10
    icon: Icon7
    navigationEndpoint: NavigationEndpoint6
    trackingParams: string
}

export interface Text10 {
    simpleText: string
}

export interface Icon7 {
    iconType: string
}

export interface NavigationEndpoint6 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata18
    watchEndpoint: WatchEndpoint4
}

export interface CommandMetadata18 {
    webCommandMetadata: WebCommandMetadata19
}

export interface WebCommandMetadata19 {
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
    watchEndpointSupportedOnesieConfig: WatchEndpointSupportedOnesieConfig4
}

export interface LoggingContext4 {
    vssLoggingContext: VssLoggingContext4
}

export interface VssLoggingContext4 {
    serializedContextData: string
}

export interface WatchEndpointSupportedOnesieConfig4 {
    html5PlaybackOnesieConfig: Html5PlaybackOnesieConfig4
}

export interface Html5PlaybackOnesieConfig4 {
    commonConfig: CommonConfig4
}

export interface CommonConfig4 {
    url: string
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
    text: Text11
}

export interface Text11 {
    runs?: Run16[]
    simpleText?: string
}

export interface Run16 {
    text: string
}

export interface Alert {
    alertWithButtonRenderer: AlertWithButtonRenderer
}

export interface AlertWithButtonRenderer {
    type: string
    text: Text12
    dismissButton: DismissButton
}

export interface Text12 {
    simpleText: string
}

export interface DismissButton {
    buttonRenderer: ButtonRenderer5
}

export interface ButtonRenderer5 {
    style: string
    size: string
    isDisabled: boolean
    icon: Icon8
    trackingParams: string
    accessibilityData: AccessibilityData12
}

export interface Icon8 {
    iconType: string
}

export interface AccessibilityData12 {
    accessibilityData: AccessibilityData13
}

export interface AccessibilityData13 {
    label: string
}

export interface Metadata {
    playlistMetadataRenderer: PlaylistMetadataRenderer
}

export interface PlaylistMetadataRenderer {
    title: string
    androidAppindexingLink: string
    iosAppindexingLink: string
}

export interface Topbar {
    desktopTopbarRenderer: DesktopTopbarRenderer
}

export interface DesktopTopbarRenderer {
    logo: Logo
    searchbox: Searchbox
    trackingParams: string
    topbarButtons: TopbarButton[]
    hotkeyDialog: HotkeyDialog
    backButton: BackButton
    forwardButton: ForwardButton
    a11ySkipNavigationButton: A11ySkipNavigationButton
    voiceSearchButton: VoiceSearchButton
}

export interface Logo {
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
    runs: Run17[]
}

export interface Run17 {
    text: string
}

export interface Endpoint {
    clickTrackingParams: string
    commandMetadata: CommandMetadata19
    browseEndpoint: BrowseEndpoint6
}

export interface CommandMetadata19 {
    webCommandMetadata: WebCommandMetadata20
}

export interface WebCommandMetadata20 {
    url: string
    webPageType: string
    rootVe: number
    apiUrl: string
}

export interface BrowseEndpoint6 {
    browseId: string
}

export interface Searchbox {
    fusionSearchboxRenderer: FusionSearchboxRenderer
}

export interface FusionSearchboxRenderer {
    icon: Icon9
    placeholderText: PlaceholderText
    config: Config2
    trackingParams: string
    searchEndpoint: SearchEndpoint
    clearButton: ClearButton
}

export interface Icon9 {
    iconType: string
}

export interface PlaceholderText {
    runs: Run18[]
}

export interface Run18 {
    text: string
}

export interface Config2 {
    webSearchboxConfig: WebSearchboxConfig
}

export interface WebSearchboxConfig {
    requestLanguage: string
    requestDomain: string
    hasOnscreenKeyboard: boolean
    focusSearchbox: boolean
}

export interface SearchEndpoint {
    clickTrackingParams: string
    commandMetadata: CommandMetadata20
    searchEndpoint: SearchEndpoint2
}

export interface CommandMetadata20 {
    webCommandMetadata: WebCommandMetadata21
}

export interface WebCommandMetadata21 {
    url: string
    webPageType: string
    rootVe: number
}

export interface SearchEndpoint2 {
    query: string
}

export interface ClearButton {
    buttonRenderer: ButtonRenderer6
}

export interface ButtonRenderer6 {
    style: string
    size: string
    isDisabled: boolean
    icon: Icon10
    trackingParams: string
    accessibilityData: AccessibilityData14
}

export interface Icon10 {
    iconType: string
}

export interface AccessibilityData14 {
    accessibilityData: AccessibilityData15
}

export interface AccessibilityData15 {
    label: string
}

export interface TopbarButton {
    topbarMenuButtonRenderer?: TopbarMenuButtonRenderer
    notificationTopbarButtonRenderer?: NotificationTopbarButtonRenderer
}

export interface TopbarMenuButtonRenderer {
    avatar?: Avatar
    menuRequest?: MenuRequest
    trackingParams: string
    accessibility: Accessibility11
    tooltip: string
    icon?: Icon11
    menuRenderer?: MenuRenderer3
    style?: string
}

export interface Avatar {
    thumbnails: Thumbnail7[]
    accessibility: Accessibility10
}

export interface Thumbnail7 {
    url: string
    width: number
    height: number
}

export interface Accessibility10 {
    accessibilityData: AccessibilityData16
}

export interface AccessibilityData16 {
    label: string
}

export interface MenuRequest {
    clickTrackingParams: string
    commandMetadata: CommandMetadata21
    signalServiceEndpoint: SignalServiceEndpoint3
}

export interface CommandMetadata21 {
    webCommandMetadata: WebCommandMetadata22
}

export interface WebCommandMetadata22 {
    sendPost: boolean
    apiUrl: string
}

export interface SignalServiceEndpoint3 {
    signal: string
    actions: Action9[]
}

export interface Action9 {
    clickTrackingParams: string
    openPopupAction: OpenPopupAction2
}

export interface OpenPopupAction2 {
    popup: Popup2
    popupType: string
    beReused: boolean
}

export interface Popup2 {
    multiPageMenuRenderer: MultiPageMenuRenderer
}

export interface MultiPageMenuRenderer {
    trackingParams: string
    style: string
    showLoadingSpinner: boolean
}

export interface Accessibility11 {
    accessibilityData: AccessibilityData17
}

export interface AccessibilityData17 {
    label: string
}

export interface Icon11 {
    iconType: string
}

export interface MenuRenderer3 {
    multiPageMenuRenderer: MultiPageMenuRenderer2
}

export interface MultiPageMenuRenderer2 {
    sections: Section[]
    trackingParams: string
    style: string
}

export interface Section {
    multiPageMenuSectionRenderer: MultiPageMenuSectionRenderer
}

export interface MultiPageMenuSectionRenderer {
    items: Item3[]
    trackingParams: string
}

export interface Item3 {
    compactLinkRenderer: CompactLinkRenderer
}

export interface CompactLinkRenderer {
    icon: Icon12
    title: Title4
    navigationEndpoint: NavigationEndpoint7
    trackingParams: string
    style: string
}

export interface Icon12 {
    iconType: string
}

export interface Title4 {
    runs: Run19[]
}

export interface Run19 {
    text: string
}

export interface NavigationEndpoint7 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata22
    uploadEndpoint?: UploadEndpoint
    signalNavigationEndpoint?: SignalNavigationEndpoint
    browseEndpoint?: BrowseEndpoint7
}

export interface CommandMetadata22 {
    webCommandMetadata: WebCommandMetadata23
}

export interface WebCommandMetadata23 {
    url: string
    webPageType: string
    rootVe: number
    apiUrl?: string
}

export interface UploadEndpoint {
    hack: boolean
}

export interface SignalNavigationEndpoint {
    signal: string
}

export interface BrowseEndpoint7 {
    browseId: string
    params: string
}

export interface NotificationTopbarButtonRenderer {
    icon: Icon13
    menuRequest: MenuRequest2
    style: string
    trackingParams: string
    accessibility: Accessibility12
    tooltip: string
    updateUnseenCountEndpoint: UpdateUnseenCountEndpoint
    notificationCount: number
    handlerDatas: string[]
}

export interface Icon13 {
    iconType: string
}

export interface MenuRequest2 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata23
    signalServiceEndpoint: SignalServiceEndpoint4
}

export interface CommandMetadata23 {
    webCommandMetadata: WebCommandMetadata24
}

export interface WebCommandMetadata24 {
    sendPost: boolean
}

export interface SignalServiceEndpoint4 {
    signal: string
    actions: Action10[]
}

export interface Action10 {
    clickTrackingParams: string
    openPopupAction: OpenPopupAction3
}

export interface OpenPopupAction3 {
    popup: Popup3
    popupType: string
    beReused: boolean
}

export interface Popup3 {
    multiPageMenuRenderer: MultiPageMenuRenderer3
}

export interface MultiPageMenuRenderer3 {
    trackingParams: string
    style: string
    showLoadingSpinner: boolean
}

export interface Accessibility12 {
    accessibilityData: AccessibilityData18
}

export interface AccessibilityData18 {
    label: string
}

export interface UpdateUnseenCountEndpoint {
    clickTrackingParams: string
    commandMetadata: CommandMetadata24
    signalServiceEndpoint: SignalServiceEndpoint5
}

export interface CommandMetadata24 {
    webCommandMetadata: WebCommandMetadata25
}

export interface WebCommandMetadata25 {
    sendPost: boolean
    apiUrl: string
}

export interface SignalServiceEndpoint5 {
    signal: string
}

export interface HotkeyDialog {
    hotkeyDialogRenderer: HotkeyDialogRenderer
}

export interface HotkeyDialogRenderer {
    title: Title5
    sections: Section2[]
    dismissButton: DismissButton2
    trackingParams: string
}

export interface Title5 {
    runs: Run20[]
}

export interface Run20 {
    text: string
}

export interface Section2 {
    hotkeyDialogSectionRenderer: HotkeyDialogSectionRenderer
}

export interface HotkeyDialogSectionRenderer {
    title: Title6
    options: Option[]
}

export interface Title6 {
    runs: Run21[]
}

export interface Run21 {
    text: string
}

export interface Option {
    hotkeyDialogSectionOptionRenderer: HotkeyDialogSectionOptionRenderer
}

export interface HotkeyDialogSectionOptionRenderer {
    label: Label
    hotkey: string
    hotkeyAccessibilityLabel?: HotkeyAccessibilityLabel
}

export interface Label {
    runs: Run22[]
}

export interface Run22 {
    text: string
}

export interface HotkeyAccessibilityLabel {
    accessibilityData: AccessibilityData19
}

export interface AccessibilityData19 {
    label: string
}

export interface DismissButton2 {
    buttonRenderer: ButtonRenderer7
}

export interface ButtonRenderer7 {
    style: string
    size: string
    isDisabled: boolean
    text: Text13
    trackingParams: string
}

export interface Text13 {
    runs: Run23[]
}

export interface Run23 {
    text: string
}

export interface BackButton {
    buttonRenderer: ButtonRenderer8
}

export interface ButtonRenderer8 {
    trackingParams: string
    command: Command4
}

export interface Command4 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata25
    signalServiceEndpoint: SignalServiceEndpoint6
}

export interface CommandMetadata25 {
    webCommandMetadata: WebCommandMetadata26
}

export interface WebCommandMetadata26 {
    sendPost: boolean
}

export interface SignalServiceEndpoint6 {
    signal: string
    actions: Action11[]
}

export interface Action11 {
    clickTrackingParams: string
    signalAction: SignalAction2
}

export interface SignalAction2 {
    signal: string
}

export interface ForwardButton {
    buttonRenderer: ButtonRenderer9
}

export interface ButtonRenderer9 {
    trackingParams: string
    command: Command5
}

export interface Command5 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata26
    signalServiceEndpoint: SignalServiceEndpoint7
}

export interface CommandMetadata26 {
    webCommandMetadata: WebCommandMetadata27
}

export interface WebCommandMetadata27 {
    sendPost: boolean
}

export interface SignalServiceEndpoint7 {
    signal: string
    actions: Action12[]
}

export interface Action12 {
    clickTrackingParams: string
    signalAction: SignalAction3
}

export interface SignalAction3 {
    signal: string
}

export interface A11ySkipNavigationButton {
    buttonRenderer: ButtonRenderer10
}

export interface ButtonRenderer10 {
    style: string
    size: string
    isDisabled: boolean
    text: Text14
    trackingParams: string
    command: Command6
}

export interface Text14 {
    runs: Run24[]
}

export interface Run24 {
    text: string
}

export interface Command6 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata27
    signalServiceEndpoint: SignalServiceEndpoint8
}

export interface CommandMetadata27 {
    webCommandMetadata: WebCommandMetadata28
}

export interface WebCommandMetadata28 {
    sendPost: boolean
}

export interface SignalServiceEndpoint8 {
    signal: string
    actions: Action13[]
}

export interface Action13 {
    clickTrackingParams: string
    signalAction: SignalAction4
}

export interface SignalAction4 {
    signal: string
}

export interface VoiceSearchButton {
    buttonRenderer: ButtonRenderer11
}

export interface ButtonRenderer11 {
    style: string
    size: string
    isDisabled: boolean
    serviceEndpoint: ServiceEndpoint7
    icon: Icon15
    tooltip: string
    trackingParams: string
    accessibilityData: AccessibilityData22
}

export interface ServiceEndpoint7 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata28
    signalServiceEndpoint: SignalServiceEndpoint9
}

export interface CommandMetadata28 {
    webCommandMetadata: WebCommandMetadata29
}

export interface WebCommandMetadata29 {
    sendPost: boolean
}

export interface SignalServiceEndpoint9 {
    signal: string
    actions: Action14[]
}

export interface Action14 {
    clickTrackingParams: string
    openPopupAction: OpenPopupAction4
}

export interface OpenPopupAction4 {
    popup: Popup4
    popupType: string
}

export interface Popup4 {
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
    runs: Run25[]
}

export interface Run25 {
    text: string
}

export interface PromptHeader {
    runs: Run26[]
}

export interface Run26 {
    text: string
}

export interface ExampleQuery1 {
    runs: Run27[]
}

export interface Run27 {
    text: string
}

export interface ExampleQuery2 {
    runs: Run28[]
}

export interface Run28 {
    text: string
}

export interface PromptMicrophoneLabel {
    runs: Run29[]
}

export interface Run29 {
    text: string
}

export interface LoadingHeader {
    runs: Run30[]
}

export interface Run30 {
    text: string
}

export interface ConnectionErrorHeader {
    runs: Run31[]
}

export interface Run31 {
    text: string
}

export interface ConnectionErrorMicrophoneLabel {
    runs: Run32[]
}

export interface Run32 {
    text: string
}

export interface PermissionsHeader {
    runs: Run33[]
}

export interface Run33 {
    text: string
}

export interface PermissionsSubtext {
    runs: Run34[]
}

export interface Run34 {
    text: string
}

export interface DisabledHeader {
    runs: Run35[]
}

export interface Run35 {
    text: string
}

export interface DisabledSubtext {
    runs: Run36[]
}

export interface Run36 {
    text: string
}

export interface MicrophoneButtonAriaLabel {
    runs: Run37[]
}

export interface Run37 {
    text: string
}

export interface ExitButton {
    buttonRenderer: ButtonRenderer12
}

export interface ButtonRenderer12 {
    style: string
    size: string
    isDisabled: boolean
    icon: Icon14
    trackingParams: string
    accessibilityData: AccessibilityData20
}

export interface Icon14 {
    iconType: string
}

export interface AccessibilityData20 {
    accessibilityData: AccessibilityData21
}

export interface AccessibilityData21 {
    label: string
}

export interface MicrophoneOffPromptHeader {
    runs: Run38[]
}

export interface Run38 {
    text: string
}

export interface Icon15 {
    iconType: string
}

export interface AccessibilityData22 {
    accessibilityData: AccessibilityData23
}

export interface AccessibilityData23 {
    label: string
}

export interface Microformat {
    microformatDataRenderer: MicroformatDataRenderer
}

export interface MicroformatDataRenderer {
    urlCanonical: string
    title: string
    description: string
    thumbnail: Thumbnail8
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

export interface Thumbnail8 {
    thumbnails: Thumbnail9[]
}

export interface Thumbnail9 {
    url: string
    width: number
    height: number
}

export interface LinkAlternate {
    hrefUrl: string
}

export interface Sidebar {
    playlistSidebarRenderer: PlaylistSidebarRenderer
}

export interface PlaylistSidebarRenderer {
    items: Item4[]
    trackingParams: string
}

export interface Item4 {
    playlistSidebarPrimaryInfoRenderer?: PlaylistSidebarPrimaryInfoRenderer
    playlistSidebarSecondaryInfoRenderer?: PlaylistSidebarSecondaryInfoRenderer
}

export interface PlaylistSidebarPrimaryInfoRenderer {
    thumbnailRenderer: ThumbnailRenderer
    title: Title7
    stats: Stat2[]
    menu: Menu2
    thumbnailOverlays: ThumbnailOverlay2[]
    navigationEndpoint: NavigationEndpoint11
    badges: Badge2[]
    showMoreText: ShowMoreText
}

export interface ThumbnailRenderer {
    playlistVideoThumbnailRenderer: PlaylistVideoThumbnailRenderer
}

export interface PlaylistVideoThumbnailRenderer {
    thumbnail: Thumbnail10
    trackingParams: string
}

export interface Thumbnail10 {
    thumbnails: Thumbnail11[]
}

export interface Thumbnail11 {
    url: string
    width: number
    height: number
}

export interface Title7 {
    runs: Run39[]
}

export interface Run39 {
    text: string
    navigationEndpoint: NavigationEndpoint8
}

export interface NavigationEndpoint8 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata29
    watchEndpoint: WatchEndpoint5
}

export interface CommandMetadata29 {
    webCommandMetadata: WebCommandMetadata30
}

export interface WebCommandMetadata30 {
    url: string
    webPageType: string
    rootVe: number
}

export interface WatchEndpoint5 {
    videoId: string
    playlistId: string
    playerParams: string
    loggingContext: LoggingContext5
    watchEndpointSupportedOnesieConfig: WatchEndpointSupportedOnesieConfig5
}

export interface LoggingContext5 {
    vssLoggingContext: VssLoggingContext5
}

export interface VssLoggingContext5 {
    serializedContextData: string
}

export interface WatchEndpointSupportedOnesieConfig5 {
    html5PlaybackOnesieConfig: Html5PlaybackOnesieConfig5
}

export interface Html5PlaybackOnesieConfig5 {
    commonConfig: CommonConfig5
}

export interface CommonConfig5 {
    url: string
}

export interface Stat2 {
    runs?: Run40[]
    simpleText?: string
}

export interface Run40 {
    text: string
}

export interface Menu2 {
    menuRenderer: MenuRenderer4
}

export interface MenuRenderer4 {
    items: Item5[]
    trackingParams: string
    topLevelButtons: TopLevelButton[]
    accessibility: Accessibility14
    targetId: string
}

export interface Item5 {
    menuServiceItemRenderer?: MenuServiceItemRenderer2
    menuNavigationItemRenderer?: MenuNavigationItemRenderer2
}

export interface MenuServiceItemRenderer2 {
    text: Text15
    icon: Icon16
    serviceEndpoint: ServiceEndpoint8
    trackingParams: string
}

export interface Text15 {
    runs: Run41[]
}

export interface Run41 {
    text: string
}

export interface Icon16 {
    iconType: string
}

export interface ServiceEndpoint8 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata30
    signalServiceEndpoint: SignalServiceEndpoint10
}

export interface CommandMetadata30 {
    webCommandMetadata: WebCommandMetadata31
}

export interface WebCommandMetadata31 {
    sendPost: boolean
}

export interface SignalServiceEndpoint10 {
    signal: string
    actions: Action15[]
}

export interface Action15 {
    clickTrackingParams: string
    openPopupAction?: OpenPopupAction5
    openOnePickAddVideoModalCommand?: OpenOnePickAddVideoModalCommand
}

export interface OpenPopupAction5 {
    popup: Popup5
    popupType: string
}

export interface Popup5 {
    confirmDialogRenderer: ConfirmDialogRenderer2
}

export interface ConfirmDialogRenderer2 {
    title: Title8
    trackingParams: string
    dialogMessages: DialogMessage2[]
    confirmButton: ConfirmButton2
    cancelButton: CancelButton2
    primaryIsCancel: boolean
}

export interface Title8 {
    runs: Run42[]
}

export interface Run42 {
    text: string
}

export interface DialogMessage2 {
    runs: Run43[]
}

export interface Run43 {
    text: string
}

export interface ConfirmButton2 {
    buttonRenderer: ButtonRenderer13
}

export interface ButtonRenderer13 {
    style: string
    size: string
    isDisabled: boolean
    text: Text16
    serviceEndpoint: ServiceEndpoint9
    trackingParams: string
}

export interface Text16 {
    runs: Run44[]
}

export interface Run44 {
    text: string
}

export interface ServiceEndpoint9 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata31
    playlistEditEndpoint: PlaylistEditEndpoint7
}

export interface CommandMetadata31 {
    webCommandMetadata: WebCommandMetadata32
}

export interface WebCommandMetadata32 {
    sendPost: boolean
    apiUrl: string
}

export interface PlaylistEditEndpoint7 {
    playlistId: string
    actions: Action16[]
    params: string
}

export interface Action16 {
    action: string
}

export interface CancelButton2 {
    buttonRenderer: ButtonRenderer14
}

export interface ButtonRenderer14 {
    style: string
    size: string
    isDisabled: boolean
    text: Text17
    trackingParams: string
    command: Command7
}

export interface Text17 {
    runs: Run45[]
}

export interface Run45 {
    text: string
}

export interface Command7 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata32
    signalServiceEndpoint: SignalServiceEndpoint11
}

export interface CommandMetadata32 {
    webCommandMetadata: WebCommandMetadata33
}

export interface WebCommandMetadata33 {
    sendPost: boolean
}

export interface SignalServiceEndpoint11 {
    signal: string
    actions: Action17[]
}

export interface Action17 {
    clickTrackingParams: string
    signalAction: SignalAction5
}

export interface SignalAction5 {
    signal: string
}

export interface OpenOnePickAddVideoModalCommand {
    listId: string
    modalTitle: string
    selectButtonLabel: string
}

export interface MenuNavigationItemRenderer2 {
    text: Text18
    icon: Icon17
    navigationEndpoint: NavigationEndpoint9
    trackingParams: string
}

export interface Text18 {
    simpleText: string
}

export interface Icon17 {
    iconType: string
}

export interface NavigationEndpoint9 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata33
    browseEndpoint: BrowseEndpoint8
}

export interface CommandMetadata33 {
    webCommandMetadata: WebCommandMetadata34
}

export interface WebCommandMetadata34 {
    url: string
    webPageType: string
    rootVe: number
    apiUrl: string
}

export interface BrowseEndpoint8 {
    browseId: string
    params: string
    nofollow: boolean
    navigationType: string
}

export interface TopLevelButton {
    buttonRenderer: ButtonRenderer15
}

export interface ButtonRenderer15 {
    style: string
    size: string
    isDisabled: boolean
    icon: Icon18
    navigationEndpoint: NavigationEndpoint10
    accessibility: Accessibility13
    tooltip: string
    trackingParams: string
}

export interface Icon18 {
    iconType: string
}

export interface NavigationEndpoint10 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata34
    watchEndpoint: WatchEndpoint6
}

export interface CommandMetadata34 {
    webCommandMetadata: WebCommandMetadata35
}

export interface WebCommandMetadata35 {
    url: string
    webPageType: string
    rootVe: number
}

export interface WatchEndpoint6 {
    videoId: string
    playlistId: string
    params: string
    playerParams: string
    loggingContext: LoggingContext6
    watchEndpointSupportedOnesieConfig: WatchEndpointSupportedOnesieConfig6
}

export interface LoggingContext6 {
    vssLoggingContext: VssLoggingContext6
}

export interface VssLoggingContext6 {
    serializedContextData: string
}

export interface WatchEndpointSupportedOnesieConfig6 {
    html5PlaybackOnesieConfig: Html5PlaybackOnesieConfig6
}

export interface Html5PlaybackOnesieConfig6 {
    commonConfig: CommonConfig6
}

export interface CommonConfig6 {
    url: string
}

export interface Accessibility13 {
    label: string
}

export interface Accessibility14 {
    accessibilityData: AccessibilityData24
}

export interface AccessibilityData24 {
    label: string
}

export interface ThumbnailOverlay2 {
    thumbnailOverlaySidePanelRenderer: ThumbnailOverlaySidePanelRenderer
}

export interface ThumbnailOverlaySidePanelRenderer {
    text: Text19
    icon: Icon19
}

export interface Text19 {
    simpleText: string
}

export interface Icon19 {
    iconType: string
}

export interface NavigationEndpoint11 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata35
    watchEndpoint: WatchEndpoint7
}

export interface CommandMetadata35 {
    webCommandMetadata: WebCommandMetadata36
}

export interface WebCommandMetadata36 {
    url: string
    webPageType: string
    rootVe: number
}

export interface WatchEndpoint7 {
    videoId: string
    playlistId: string
    playerParams: string
    loggingContext: LoggingContext7
    watchEndpointSupportedOnesieConfig: WatchEndpointSupportedOnesieConfig7
}

export interface LoggingContext7 {
    vssLoggingContext: VssLoggingContext7
}

export interface VssLoggingContext7 {
    serializedContextData: string
}

export interface WatchEndpointSupportedOnesieConfig7 {
    html5PlaybackOnesieConfig: Html5PlaybackOnesieConfig7
}

export interface Html5PlaybackOnesieConfig7 {
    commonConfig: CommonConfig7
}

export interface CommonConfig7 {
    url: string
}

export interface Badge2 {
    metadataBadgeRenderer: MetadataBadgeRenderer2
}

export interface MetadataBadgeRenderer2 {
    icon: Icon20
    style: string
    label: string
    trackingParams: string
}

export interface Icon20 {
    iconType: string
}

export interface ShowMoreText {
    runs: Run46[]
}

export interface Run46 {
    text: string
}

export interface PlaylistSidebarSecondaryInfoRenderer {
    videoOwner: VideoOwner
}

export interface VideoOwner {
    videoOwnerRenderer: VideoOwnerRenderer
}

export interface VideoOwnerRenderer {
    thumbnail: Thumbnail12
    title: Title9
    navigationEndpoint: NavigationEndpoint13
    trackingParams: string
}

export interface Thumbnail12 {
    thumbnails: Thumbnail13[]
}

export interface Thumbnail13 {
    url: string
    width: number
    height: number
}

export interface Title9 {
    runs: Run47[]
}

export interface Run47 {
    text: string
    navigationEndpoint: NavigationEndpoint12
}

export interface NavigationEndpoint12 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata36
    browseEndpoint: BrowseEndpoint9
}

export interface CommandMetadata36 {
    webCommandMetadata: WebCommandMetadata37
}

export interface WebCommandMetadata37 {
    url: string
    webPageType: string
    rootVe: number
    apiUrl: string
}

export interface BrowseEndpoint9 {
    browseId: string
    canonicalBaseUrl: string
}

export interface NavigationEndpoint13 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata37
    browseEndpoint: BrowseEndpoint10
}

export interface CommandMetadata37 {
    webCommandMetadata: WebCommandMetadata38
}

export interface WebCommandMetadata38 {
    url: string
    webPageType: string
    rootVe: number
    apiUrl: string
}

export interface BrowseEndpoint10 {
    browseId: string
    canonicalBaseUrl: string
}
