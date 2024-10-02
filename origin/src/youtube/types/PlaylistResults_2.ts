export interface PlaylistResults_2 {
    responseContext: ResponseContext
    contents: Contents
    alerts: Alert[]
    metadata: Metadata
    trackingParams: string
    microformat: Microformat
    onResponseReceivedActions: OnResponseReceivedAction[]
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
    hasDecorated: boolean
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
    trackingParams: string
}

export interface Alert {
    alertWithButtonRenderer: AlertWithButtonRenderer
}

export interface AlertWithButtonRenderer {
    type: string
    text: Text
    dismissButton: DismissButton
}

export interface Text {
    simpleText: string
}

export interface DismissButton {
    buttonRenderer: ButtonRenderer
}

export interface ButtonRenderer {
    style: string
    size: string
    isDisabled: boolean
    icon: Icon
    trackingParams: string
    accessibilityData: AccessibilityData
}

export interface Icon {
    iconType: string
}

export interface AccessibilityData {
    accessibilityData: AccessibilityData2
}

export interface AccessibilityData2 {
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

export interface Microformat {
    microformatDataRenderer: MicroformatDataRenderer
}

export interface MicroformatDataRenderer {
    urlCanonical: string
    title: string
    description: string
    thumbnail: Thumbnail
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

export interface Thumbnail {
    thumbnails: Thumbnail2[]
}

export interface Thumbnail2 {
    url: string
    width: number
    height: number
}

export interface LinkAlternate {
    hrefUrl: string
}

export interface OnResponseReceivedAction {
    clickTrackingParams: string
    appendContinuationItemsAction: AppendContinuationItemsAction
}

export interface AppendContinuationItemsAction {
    continuationItems: ContinuationItem[]
    targetId: string
}

export interface ContinuationItem {
    playlistVideoRenderer?: PlaylistVideoRenderer
    continuationItemRenderer?: ContinuationItemRenderer
}

export interface PlaylistVideoRenderer {
    videoId: string
    thumbnail: Thumbnail3
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
}

export interface Thumbnail3 {
    thumbnails: Thumbnail4[]
}

export interface Thumbnail4 {
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
    accessibilityData: AccessibilityData3
}

export interface AccessibilityData3 {
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
    accessibility: Accessibility2
    simpleText: string
}

export interface Accessibility2 {
    accessibilityData: AccessibilityData4
}

export interface AccessibilityData4 {
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
    accessibility: Accessibility4
}

export interface Item {
    menuServiceItemRenderer?: MenuServiceItemRenderer
    menuServiceItemDownloadRenderer?: MenuServiceItemDownloadRenderer
}

export interface MenuServiceItemRenderer {
    text: Text2
    icon: Icon2
    serviceEndpoint: ServiceEndpoint
    trackingParams: string
    hasSeparator?: boolean
}

export interface Text2 {
    runs: Run3[]
}

export interface Run3 {
    text: string
}

export interface Icon2 {
    iconType: string
}

export interface ServiceEndpoint {
    clickTrackingParams: string
    commandMetadata: CommandMetadata3
    likeEndpoint?: LikeEndpoint
    shareEntityServiceEndpoint?: ShareEntityServiceEndpoint
    signalServiceEndpoint?: SignalServiceEndpoint
    playlistEditEndpoint?: PlaylistEditEndpoint
    addToPlaylistServiceEndpoint?: AddToPlaylistServiceEndpoint
}

export interface CommandMetadata3 {
    webCommandMetadata: WebCommandMetadata3
}

export interface WebCommandMetadata3 {
    sendPost: boolean
    apiUrl?: string
}

export interface LikeEndpoint {
    status: string
    target: Target
    actions: Action[]
    likeParams: string
}

export interface Target {
    videoId: string
}

export interface Action {
    clickTrackingParams: string
    replaceEnclosingAction: ReplaceEnclosingAction
}

export interface ReplaceEnclosingAction {
    item: Item2
}

export interface Item2 {
    notificationMultiActionRenderer: NotificationMultiActionRenderer
}

export interface NotificationMultiActionRenderer {
    responseText: ResponseText
    trackingParams: string
}

export interface ResponseText {
    accessibility: Accessibility3
    simpleText: string
}

export interface Accessibility3 {
    accessibilityData: AccessibilityData5
}

export interface AccessibilityData5 {
    label: string
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
    commandMetadata: CommandMetadata4
    createPlaylistServiceEndpoint: CreatePlaylistServiceEndpoint
}

export interface CommandMetadata4 {
    webCommandMetadata: WebCommandMetadata4
}

export interface WebCommandMetadata4 {
    sendPost: boolean
    apiUrl: string
}

export interface CreatePlaylistServiceEndpoint {
    videoIds: string[]
    params: string
}

export interface PlaylistEditEndpoint {
    playlistId: string
    actions: Action3[]
}

export interface Action3 {
    addedVideoId: string
    action: string
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

export interface Accessibility4 {
    accessibilityData: AccessibilityData6
}

export interface AccessibilityData6 {
    label: string
}

export interface ThumbnailOverlay {
    thumbnailOverlayPlaybackStatusRenderer?: ThumbnailOverlayPlaybackStatusRenderer
    thumbnailOverlayResumePlaybackRenderer?: ThumbnailOverlayResumePlaybackRenderer
    thumbnailOverlayTimeStatusRenderer?: ThumbnailOverlayTimeStatusRenderer
    thumbnailOverlayNowPlayingRenderer?: ThumbnailOverlayNowPlayingRenderer
}

export interface ThumbnailOverlayPlaybackStatusRenderer {
    texts: Text3[]
}

export interface Text3 {
    runs: Run4[]
}

export interface Run4 {
    text: string
}

export interface ThumbnailOverlayResumePlaybackRenderer {
    percentDurationWatched: number
}

export interface ThumbnailOverlayTimeStatusRenderer {
    text: Text4
    style: string
}

export interface Text4 {
    accessibility: Accessibility5
    simpleText: string
}

export interface Accessibility5 {
    accessibilityData: AccessibilityData7
}

export interface AccessibilityData7 {
    label: string
}

export interface ThumbnailOverlayNowPlayingRenderer {
    text: Text5
}

export interface Text5 {
    runs: Run5[]
}

export interface Run5 {
    text: string
}

export interface VideoInfo {
    runs: Run6[]
}

export interface Run6 {
    text: string
}

export interface ContinuationItemRenderer {
    trigger: string
    continuationEndpoint: ContinuationEndpoint
}

export interface ContinuationEndpoint {
    clickTrackingParams: string
    commandMetadata: CommandMetadata5
    continuationCommand: ContinuationCommand
}

export interface CommandMetadata5 {
    webCommandMetadata: WebCommandMetadata5
}

export interface WebCommandMetadata5 {
    sendPost: boolean
    apiUrl: string
}

export interface ContinuationCommand {
    token: string
    request: string
}

export interface Sidebar {
    playlistSidebarRenderer: PlaylistSidebarRenderer
}

export interface PlaylistSidebarRenderer {
    items: Item3[]
    trackingParams: string
}

export interface Item3 {
    playlistSidebarPrimaryInfoRenderer?: PlaylistSidebarPrimaryInfoRenderer
    playlistSidebarSecondaryInfoRenderer?: PlaylistSidebarSecondaryInfoRenderer
}

export interface PlaylistSidebarPrimaryInfoRenderer {
    thumbnailRenderer: ThumbnailRenderer
    title: Title2
    stats: Stat[]
    menu: Menu2
    thumbnailOverlays: ThumbnailOverlay2[]
    navigationEndpoint: NavigationEndpoint6
    badges: Badge[]
    showMoreText: ShowMoreText
}

export interface ThumbnailRenderer {
    playlistVideoThumbnailRenderer: PlaylistVideoThumbnailRenderer
}

export interface PlaylistVideoThumbnailRenderer {
    thumbnail: Thumbnail5
    trackingParams: string
}

export interface Thumbnail5 {
    thumbnails: Thumbnail6[]
}

export interface Thumbnail6 {
    url: string
    width: number
    height: number
}

export interface Title2 {
    runs: Run7[]
}

export interface Run7 {
    text: string
    navigationEndpoint: NavigationEndpoint3
}

export interface NavigationEndpoint3 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata6
    watchEndpoint: WatchEndpoint2
}

export interface CommandMetadata6 {
    webCommandMetadata: WebCommandMetadata6
}

export interface WebCommandMetadata6 {
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

export interface Stat {
    runs?: Run8[]
    simpleText?: string
}

export interface Run8 {
    text: string
}

export interface Menu2 {
    menuRenderer: MenuRenderer2
}

export interface MenuRenderer2 {
    items: Item4[]
    trackingParams: string
    topLevelButtons: TopLevelButton[]
    accessibility: Accessibility7
    targetId: string
}

export interface Item4 {
    menuNavigationItemRenderer: MenuNavigationItemRenderer
}

export interface MenuNavigationItemRenderer {
    text: Text6
    icon: Icon3
    navigationEndpoint: NavigationEndpoint4
    trackingParams: string
}

export interface Text6 {
    simpleText: string
}

export interface Icon3 {
    iconType: string
}

export interface NavigationEndpoint4 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata7
    browseEndpoint: BrowseEndpoint2
}

export interface CommandMetadata7 {
    webCommandMetadata: WebCommandMetadata7
}

export interface WebCommandMetadata7 {
    url: string
    webPageType: string
    rootVe: number
    apiUrl: string
}

export interface BrowseEndpoint2 {
    browseId: string
    params: string
    nofollow: boolean
    navigationType: string
}

export interface TopLevelButton {
    buttonRenderer: ButtonRenderer2
}

export interface ButtonRenderer2 {
    style: string
    size: string
    isDisabled: boolean
    icon: Icon4
    navigationEndpoint: NavigationEndpoint5
    accessibility: Accessibility6
    tooltip: string
    trackingParams: string
}

export interface Icon4 {
    iconType: string
}

export interface NavigationEndpoint5 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata8
    watchEndpoint: WatchEndpoint3
}

export interface CommandMetadata8 {
    webCommandMetadata: WebCommandMetadata8
}

export interface WebCommandMetadata8 {
    url: string
    webPageType: string
    rootVe: number
}

export interface WatchEndpoint3 {
    videoId: string
    playlistId: string
    params: string
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

export interface Accessibility6 {
    label: string
}

export interface Accessibility7 {
    accessibilityData: AccessibilityData8
}

export interface AccessibilityData8 {
    label: string
}

export interface ThumbnailOverlay2 {
    thumbnailOverlaySidePanelRenderer: ThumbnailOverlaySidePanelRenderer
}

export interface ThumbnailOverlaySidePanelRenderer {
    text: Text7
    icon: Icon5
}

export interface Text7 {
    simpleText: string
}

export interface Icon5 {
    iconType: string
}

export interface NavigationEndpoint6 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata9
    watchEndpoint: WatchEndpoint4
}

export interface CommandMetadata9 {
    webCommandMetadata: WebCommandMetadata9
}

export interface WebCommandMetadata9 {
    url: string
    webPageType: string
    rootVe: number
}

export interface WatchEndpoint4 {
    videoId: string
    playlistId: string
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

export interface Badge {
    metadataBadgeRenderer: MetadataBadgeRenderer
}

export interface MetadataBadgeRenderer {
    icon: Icon6
    style: string
    label: string
    trackingParams: string
}

export interface Icon6 {
    iconType: string
}

export interface ShowMoreText {
    runs: Run9[]
}

export interface Run9 {
    text: string
}

export interface PlaylistSidebarSecondaryInfoRenderer {
    videoOwner: VideoOwner
}

export interface VideoOwner {
    videoOwnerRenderer: VideoOwnerRenderer
}

export interface VideoOwnerRenderer {
    thumbnail: Thumbnail7
    title: Title3
    navigationEndpoint: NavigationEndpoint8
    trackingParams: string
}

export interface Thumbnail7 {
    thumbnails: Thumbnail8[]
}

export interface Thumbnail8 {
    url: string
    width: number
    height: number
}

export interface Title3 {
    runs: Run10[]
}

export interface Run10 {
    text: string
    navigationEndpoint: NavigationEndpoint7
}

export interface NavigationEndpoint7 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata10
    browseEndpoint: BrowseEndpoint3
}

export interface CommandMetadata10 {
    webCommandMetadata: WebCommandMetadata10
}

export interface WebCommandMetadata10 {
    url: string
    webPageType: string
    rootVe: number
    apiUrl: string
}

export interface BrowseEndpoint3 {
    browseId: string
    canonicalBaseUrl: string
}

export interface NavigationEndpoint8 {
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
    canonicalBaseUrl: string
}
