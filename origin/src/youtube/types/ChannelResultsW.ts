export interface ChannelResultsW {
    responseContext: ResponseContext
    contents: Contents
    header: Header
    metadata: Metadata2
    trackingParams: string
    topbar: Topbar
    microformat: Microformat
}

export interface ResponseContext {
    serviceTrackingParams: ServiceTrackingParam[]
    maxAgeSeconds: number
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
    tabRenderer?: TabRenderer
    expandableTabRenderer?: ExpandableTabRenderer
}

export interface TabRenderer {
    endpoint: Endpoint
    title: string
    selected?: boolean
    content?: Content
    trackingParams: string
}

export interface Endpoint {
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
    params: string
    canonicalBaseUrl: string
}

export interface Content {
    sectionListRenderer: SectionListRenderer
}

export interface SectionListRenderer {
    contents: Content2[]
    trackingParams: string
    targetId: string
    disablePullToRefresh: boolean
}

export interface Content2 {
    itemSectionRenderer: ItemSectionRenderer
}

export interface ItemSectionRenderer {
    contents: Content3[]
    trackingParams: string
}

export interface Content3 {
    shelfRenderer?: ShelfRenderer
    reelShelfRenderer?: ReelShelfRenderer
}

export interface ShelfRenderer {
    title: Title
    thumbnail?: Thumbnail
    endpoint: Endpoint2
    content: Content4
    trackingParams: string
    playAllButton?: PlayAllButton
}

export interface Title {
    runs: Run[]
}

export interface Run {
    text: string
    navigationEndpoint: NavigationEndpoint
}

export interface NavigationEndpoint {
    clickTrackingParams: string
    commandMetadata: CommandMetadata2
    browseEndpoint: BrowseEndpoint2
}

export interface CommandMetadata2 {
    webCommandMetadata: WebCommandMetadata2
}

export interface WebCommandMetadata2 {
    url: string
    webPageType: string
    rootVe: number
    apiUrl: string
}

export interface BrowseEndpoint2 {
    browseId: string
    params?: string
    canonicalBaseUrl?: string
}

export interface Thumbnail {
    thumbnails: Thumbnail2[]
}

export interface Thumbnail2 {
    url: string
    width: number
    height: number
}

export interface Endpoint2 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata3
    browseEndpoint: BrowseEndpoint3
}

export interface CommandMetadata3 {
    webCommandMetadata: WebCommandMetadata3
}

export interface WebCommandMetadata3 {
    url: string
    webPageType: string
    rootVe: number
    apiUrl: string
}

export interface BrowseEndpoint3 {
    browseId: string
    params?: string
    canonicalBaseUrl?: string
}

export interface Content4 {
    horizontalListRenderer: HorizontalListRenderer
}

export interface HorizontalListRenderer {
    items: Item[]
    trackingParams: string
    visibleItemCount: number
    nextButton: NextButton
    previousButton: PreviousButton
}

export interface Item {
    gridVideoRenderer?: GridVideoRenderer
    gridPlaylistRenderer?: GridPlaylistRenderer
}

export interface GridVideoRenderer {
    videoId: string
    thumbnail: Thumbnail3
    title: Title2
    publishedTimeText: PublishedTimeText
    viewCountText: ViewCountText
    navigationEndpoint: NavigationEndpoint2
    ownerBadges: OwnerBadge[]
    trackingParams: string
    offlineability: Offlineability
    shortViewCountText: ShortViewCountText
    menu: Menu
    thumbnailOverlays: ThumbnailOverlay[]
    shortBylineText?: ShortBylineText
}

export interface Thumbnail3 {
    thumbnails: Thumbnail4[]
}

export interface Thumbnail4 {
    url: string
    width: number
    height: number
}

export interface Title2 {
    accessibility: Accessibility
    simpleText: string
}

export interface Accessibility {
    accessibilityData: AccessibilityData
}

export interface AccessibilityData {
    label: string
}

export interface PublishedTimeText {
    simpleText: string
}

export interface ViewCountText {
    simpleText: string
}

export interface NavigationEndpoint2 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata4
    watchEndpoint: WatchEndpoint
}

export interface CommandMetadata4 {
    webCommandMetadata: WebCommandMetadata4
}

export interface WebCommandMetadata4 {
    url: string
    webPageType: string
    rootVe: number
}

export interface WatchEndpoint {
    videoId: string
    watchEndpointSupportedOnesieConfig: WatchEndpointSupportedOnesieConfig
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

export interface OwnerBadge {
    metadataBadgeRenderer: MetadataBadgeRenderer
}

export interface MetadataBadgeRenderer {
    icon: Icon
    style: string
    tooltip: string
    trackingParams: string
    accessibilityData: AccessibilityData2
}

export interface Icon {
    iconType: string
}

export interface AccessibilityData2 {
    label: string
}

export interface Offlineability {
    offlineabilityRenderer: OfflineabilityRenderer
}

export interface OfflineabilityRenderer {
    offlineable: boolean
    formats: Format[]
    clickTrackingParams: string
}

export interface Format {
    name: Name
    formatType: string
}

export interface Name {
    runs: Run2[]
}

export interface Run2 {
    text: string
}

export interface ShortViewCountText {
    accessibility: Accessibility2
    simpleText: string
}

export interface Accessibility2 {
    accessibilityData: AccessibilityData3
}

export interface AccessibilityData3 {
    label: string
}

export interface Menu {
    menuRenderer: MenuRenderer
}

export interface MenuRenderer {
    items: Item2[]
    trackingParams: string
    accessibility: Accessibility3
}

export interface Item2 {
    menuServiceItemRenderer?: MenuServiceItemRenderer
    menuServiceItemDownloadRenderer?: MenuServiceItemDownloadRenderer
}

export interface MenuServiceItemRenderer {
    text: Text
    icon: Icon2
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

export interface Icon2 {
    iconType: string
}

export interface ServiceEndpoint {
    clickTrackingParams: string
    commandMetadata: CommandMetadata5
    shareEntityServiceEndpoint?: ShareEntityServiceEndpoint
    signalServiceEndpoint?: SignalServiceEndpoint
    playlistEditEndpoint?: PlaylistEditEndpoint
    addToPlaylistServiceEndpoint?: AddToPlaylistServiceEndpoint
}

export interface CommandMetadata5 {
    webCommandMetadata: WebCommandMetadata5
}

export interface WebCommandMetadata5 {
    sendPost: boolean
    apiUrl?: string
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
    actions: Action[]
}

export interface Action {
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
    commandMetadata: CommandMetadata6
    createPlaylistServiceEndpoint: CreatePlaylistServiceEndpoint
}

export interface CommandMetadata6 {
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

export interface PlaylistEditEndpoint {
    playlistId: string
    actions: Action2[]
}

export interface Action2 {
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

export interface Accessibility3 {
    accessibilityData: AccessibilityData4
}

export interface AccessibilityData4 {
    label: string
}

export interface ThumbnailOverlay {
    thumbnailOverlayTimeStatusRenderer?: ThumbnailOverlayTimeStatusRenderer
    thumbnailOverlayToggleButtonRenderer?: ThumbnailOverlayToggleButtonRenderer
    thumbnailOverlayNowPlayingRenderer?: ThumbnailOverlayNowPlayingRenderer
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
    accessibilityData: AccessibilityData5
}

export interface AccessibilityData5 {
    label: string
}

export interface ThumbnailOverlayToggleButtonRenderer {
    untoggledIcon: UntoggledIcon
    toggledIcon: ToggledIcon
    untoggledTooltip: string
    toggledTooltip: string
    untoggledServiceEndpoint: UntoggledServiceEndpoint
    untoggledAccessibility: UntoggledAccessibility
    toggledAccessibility: ToggledAccessibility
    trackingParams: string
    isToggled?: boolean
    toggledServiceEndpoint?: ToggledServiceEndpoint
}

export interface UntoggledIcon {
    iconType: string
}

export interface ToggledIcon {
    iconType: string
}

export interface UntoggledServiceEndpoint {
    clickTrackingParams: string
    commandMetadata: CommandMetadata7
    signalServiceEndpoint?: SignalServiceEndpoint2
    playlistEditEndpoint?: PlaylistEditEndpoint2
}

export interface CommandMetadata7 {
    webCommandMetadata: WebCommandMetadata7
}

export interface WebCommandMetadata7 {
    sendPost: boolean
    apiUrl?: string
}

export interface SignalServiceEndpoint2 {
    signal: string
    actions: Action3[]
}

export interface Action3 {
    clickTrackingParams: string
    addToPlaylistCommand: AddToPlaylistCommand2
}

export interface AddToPlaylistCommand2 {
    openMiniplayer: boolean
    videoId: string
    listType: string
    onCreateListCommand: OnCreateListCommand2
    videoIds: string[]
}

export interface OnCreateListCommand2 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata8
    createPlaylistServiceEndpoint: CreatePlaylistServiceEndpoint2
}

export interface CommandMetadata8 {
    webCommandMetadata: WebCommandMetadata8
}

export interface WebCommandMetadata8 {
    sendPost: boolean
    apiUrl: string
}

export interface CreatePlaylistServiceEndpoint2 {
    videoIds: string[]
    params: string
}

export interface PlaylistEditEndpoint2 {
    playlistId: string
    actions: Action4[]
}

export interface Action4 {
    addedVideoId: string
    action: string
}

export interface UntoggledAccessibility {
    accessibilityData: AccessibilityData6
}

export interface AccessibilityData6 {
    label: string
}

export interface ToggledAccessibility {
    accessibilityData: AccessibilityData7
}

export interface AccessibilityData7 {
    label: string
}

export interface ToggledServiceEndpoint {
    clickTrackingParams: string
    commandMetadata: CommandMetadata9
    playlistEditEndpoint: PlaylistEditEndpoint3
}

export interface CommandMetadata9 {
    webCommandMetadata: WebCommandMetadata9
}

export interface WebCommandMetadata9 {
    sendPost: boolean
    apiUrl: string
}

export interface PlaylistEditEndpoint3 {
    playlistId: string
    actions: Action5[]
}

export interface Action5 {
    action: string
    removedVideoId: string
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

export interface ThumbnailOverlayResumePlaybackRenderer {
    percentDurationWatched: number
}

export interface ShortBylineText {
    runs: Run5[]
}

export interface Run5 {
    text: string
    navigationEndpoint: NavigationEndpoint3
}

export interface NavigationEndpoint3 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata10
    browseEndpoint: BrowseEndpoint4
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

export interface BrowseEndpoint4 {
    browseId: string
    canonicalBaseUrl: string
}

export interface GridPlaylistRenderer {
    playlistId: string
    thumbnail: Thumbnail5
    title: Title3
    shortBylineText: ShortBylineText2
    videoCountText: VideoCountText
    navigationEndpoint: NavigationEndpoint6
    publishedTimeText: PublishedTimeText2
    videoCountShortText: VideoCountShortText
    trackingParams: string
    thumbnailText: ThumbnailText
    thumbnailRenderer: ThumbnailRenderer
    longBylineText: LongBylineText
    thumbnailOverlays: ThumbnailOverlay2[]
    viewPlaylistText: ViewPlaylistText
    sidebarThumbnails?: SidebarThumbnail[]
}

export interface Thumbnail5 {
    thumbnails: Thumbnail6[]
    sampledThumbnailColor: SampledThumbnailColor
    darkColorPalette: DarkColorPalette
    vibrantColorPalette: VibrantColorPalette
}

export interface Thumbnail6 {
    url: string
    width: number
    height: number
}

export interface SampledThumbnailColor {
    red: number
    green: number
    blue: number
}

export interface DarkColorPalette {
    section2Color: number
    iconInactiveColor: number
    iconDisabledColor: number
}

export interface VibrantColorPalette {
    iconInactiveColor: number
}

export interface Title3 {
    runs: Run6[]
}

export interface Run6 {
    text: string
    navigationEndpoint: NavigationEndpoint4
}

export interface NavigationEndpoint4 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata11
    watchEndpoint: WatchEndpoint2
}

export interface CommandMetadata11 {
    webCommandMetadata: WebCommandMetadata11
}

export interface WebCommandMetadata11 {
    url: string
    webPageType: string
    rootVe: number
}

export interface WatchEndpoint2 {
    videoId: string
    playlistId: string
    params: string
    loggingContext: LoggingContext
    watchEndpointSupportedOnesieConfig: WatchEndpointSupportedOnesieConfig2
}

export interface LoggingContext {
    vssLoggingContext: VssLoggingContext
}

export interface VssLoggingContext {
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

export interface ShortBylineText2 {
    runs: Run7[]
}

export interface Run7 {
    text: string
    navigationEndpoint?: NavigationEndpoint5
}

export interface NavigationEndpoint5 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata12
    browseEndpoint: BrowseEndpoint5
}

export interface CommandMetadata12 {
    webCommandMetadata: WebCommandMetadata12
}

export interface WebCommandMetadata12 {
    url: string
    webPageType: string
    rootVe: number
    apiUrl: string
}

export interface BrowseEndpoint5 {
    browseId: string
    canonicalBaseUrl: string
}

export interface VideoCountText {
    runs: Run8[]
}

export interface Run8 {
    text: string
}

export interface NavigationEndpoint6 {
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
    params: string
    loggingContext: LoggingContext2
    watchEndpointSupportedOnesieConfig: WatchEndpointSupportedOnesieConfig3
}

export interface LoggingContext2 {
    vssLoggingContext: VssLoggingContext2
}

export interface VssLoggingContext2 {
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

export interface PublishedTimeText2 {
    simpleText: string
}

export interface VideoCountShortText {
    simpleText: string
}

export interface ThumbnailText {
    runs: Run9[]
}

export interface Run9 {
    text: string
    bold?: boolean
}

export interface ThumbnailRenderer {
    playlistCustomThumbnailRenderer: PlaylistCustomThumbnailRenderer
}

export interface PlaylistCustomThumbnailRenderer {
    thumbnail: Thumbnail7
}

export interface Thumbnail7 {
    thumbnails: Thumbnail8[]
    sampledThumbnailColor: SampledThumbnailColor2
    darkColorPalette: DarkColorPalette2
    vibrantColorPalette: VibrantColorPalette2
}

export interface Thumbnail8 {
    url: string
    width: number
    height: number
}

export interface SampledThumbnailColor2 {
    red: number
    green: number
    blue: number
}

export interface DarkColorPalette2 {
    section2Color: number
    iconInactiveColor: number
    iconDisabledColor: number
}

export interface VibrantColorPalette2 {
    iconInactiveColor: number
}

export interface LongBylineText {
    runs: Run10[]
}

export interface Run10 {
    text: string
    navigationEndpoint?: NavigationEndpoint7
}

export interface NavigationEndpoint7 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata14
    browseEndpoint: BrowseEndpoint6
}

export interface CommandMetadata14 {
    webCommandMetadata: WebCommandMetadata14
}

export interface WebCommandMetadata14 {
    url: string
    webPageType: string
    rootVe: number
    apiUrl: string
}

export interface BrowseEndpoint6 {
    browseId: string
    canonicalBaseUrl: string
}

export interface ThumbnailOverlay2 {
    thumbnailOverlayBottomPanelRenderer?: ThumbnailOverlayBottomPanelRenderer
    thumbnailOverlayHoverTextRenderer?: ThumbnailOverlayHoverTextRenderer
    thumbnailOverlayNowPlayingRenderer?: ThumbnailOverlayNowPlayingRenderer2
}

export interface ThumbnailOverlayBottomPanelRenderer {
    text: Text4
    icon: Icon3
}

export interface Text4 {
    simpleText: string
}

export interface Icon3 {
    iconType: string
}

export interface ThumbnailOverlayHoverTextRenderer {
    text: Text5
    icon: Icon4
}

export interface Text5 {
    runs: Run11[]
}

export interface Run11 {
    text: string
}

export interface Icon4 {
    iconType: string
}

export interface ThumbnailOverlayNowPlayingRenderer2 {
    text: Text6
}

export interface Text6 {
    runs: Run12[]
}

export interface Run12 {
    text: string
}

export interface ViewPlaylistText {
    runs: Run13[]
}

export interface Run13 {
    text: string
    navigationEndpoint: NavigationEndpoint8
}

export interface NavigationEndpoint8 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata15
    browseEndpoint: BrowseEndpoint7
}

export interface CommandMetadata15 {
    webCommandMetadata: WebCommandMetadata15
}

export interface WebCommandMetadata15 {
    url: string
    webPageType: string
    rootVe: number
    apiUrl: string
}

export interface BrowseEndpoint7 {
    browseId: string
}

export interface SidebarThumbnail {
    thumbnails: Thumbnail9[]
}

export interface Thumbnail9 {
    url: string
    width: number
    height: number
}

export interface NextButton {
    buttonRenderer: ButtonRenderer
}

export interface ButtonRenderer {
    style: string
    size: string
    isDisabled: boolean
    icon: Icon5
    accessibility: Accessibility5
    trackingParams: string
}

export interface Icon5 {
    iconType: string
}

export interface Accessibility5 {
    label: string
}

export interface PreviousButton {
    buttonRenderer: ButtonRenderer2
}

export interface ButtonRenderer2 {
    style: string
    size: string
    isDisabled: boolean
    icon: Icon6
    accessibility: Accessibility6
    trackingParams: string
}

export interface Icon6 {
    iconType: string
}

export interface Accessibility6 {
    label: string
}

export interface PlayAllButton {
    buttonRenderer: ButtonRenderer3
}

export interface ButtonRenderer3 {
    style: string
    size: string
    isDisabled: boolean
    text: Text7
    icon: Icon7
    navigationEndpoint: NavigationEndpoint9
    trackingParams: string
}

export interface Text7 {
    runs: Run14[]
}

export interface Run14 {
    text: string
}

export interface Icon7 {
    iconType: string
}

export interface NavigationEndpoint9 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata16
    watchEndpoint: WatchEndpoint4
}

export interface CommandMetadata16 {
    webCommandMetadata: WebCommandMetadata16
}

export interface WebCommandMetadata16 {
    url: string
    webPageType: string
    rootVe: number
}

export interface WatchEndpoint4 {
    videoId: string
    playlistId: string
    loggingContext: LoggingContext3
    watchEndpointSupportedOnesieConfig: WatchEndpointSupportedOnesieConfig4
}

export interface LoggingContext3 {
    vssLoggingContext: VssLoggingContext3
}

export interface VssLoggingContext3 {
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

export interface ReelShelfRenderer {
    title: Title4
    button: Button
    items: Item4[]
    trackingParams: string
    icon: Icon9
    nextButton: NextButton2
    previousButton: PreviousButton2
}

export interface Title4 {
    runs: Run15[]
}

export interface Run15 {
    text: string
}

export interface Button {
    menuRenderer: MenuRenderer2
}

export interface MenuRenderer2 {
    items: Item3[]
    trackingParams: string
    accessibility: Accessibility8
}

export interface Item3 {
    menuNavigationItemRenderer: MenuNavigationItemRenderer
}

export interface MenuNavigationItemRenderer {
    text: Text8
    icon: Icon8
    navigationEndpoint: NavigationEndpoint10
    trackingParams: string
    accessibility: Accessibility7
}

export interface Text8 {
    runs: Run16[]
}

export interface Run16 {
    text: string
}

export interface Icon8 {
    iconType: string
}

export interface NavigationEndpoint10 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata17
    userFeedbackEndpoint: UserFeedbackEndpoint
}

export interface CommandMetadata17 {
    webCommandMetadata: WebCommandMetadata17
}

export interface WebCommandMetadata17 {
    ignoreNavigation: boolean
}

export interface UserFeedbackEndpoint {
    additionalDatas: AdditionalData[]
}

export interface AdditionalData {
    userFeedbackEndpointProductSpecificValueData: UserFeedbackEndpointProductSpecificValueData
}

export interface UserFeedbackEndpointProductSpecificValueData {
    key: string
    value: string
}

export interface Accessibility7 {
    accessibilityData: AccessibilityData8
}

export interface AccessibilityData8 {
    label: string
}

export interface Accessibility8 {
    accessibilityData: AccessibilityData9
}

export interface AccessibilityData9 {
    label: string
}

export interface Item4 {
    shortsLockupViewModel: ShortsLockupViewModel
}

export interface ShortsLockupViewModel {
    entityId: string
    accessibilityText: string
    thumbnail: Thumbnail10
    onTap: OnTap
    menuOnTap: MenuOnTap
    indexInCollection: number
    menuOnTapA11yLabel: string
    overlayMetadata: OverlayMetadata
    loggingDirectives: LoggingDirectives2
}

export interface Thumbnail10 {
    sources: Source[]
    contentMode?: string
}

export interface Source {
    url: string
    width: number
    height: number
}

export interface OnTap {
    innertubeCommand: InnertubeCommand
}

export interface InnertubeCommand {
    clickTrackingParams: string
    commandMetadata: CommandMetadata18
    reelWatchEndpoint: ReelWatchEndpoint
}

export interface CommandMetadata18 {
    webCommandMetadata: WebCommandMetadata18
}

export interface WebCommandMetadata18 {
    url: string
    webPageType: string
    rootVe: number
}

export interface ReelWatchEndpoint {
    videoId: string
    playerParams: string
    thumbnail: Thumbnail11
    overlay: Overlay
    params: string
    sequenceProvider: string
    sequenceParams: string
    loggingContext: LoggingContext4
    ustreamerConfig: string
}

export interface Thumbnail11 {
    thumbnails: Thumbnail12[]
    isOriginalAspectRatio: boolean
}

export interface Thumbnail12 {
    url: string
    width: number
    height: number
}

export interface Overlay {
    reelPlayerOverlayRenderer: ReelPlayerOverlayRenderer
}

export interface ReelPlayerOverlayRenderer {
    style: string
    trackingParams: string
    reelPlayerNavigationModel: string
}

export interface LoggingContext4 {
    vssLoggingContext: VssLoggingContext4
    qoeLoggingContext: QoeLoggingContext
}

export interface VssLoggingContext4 {
    serializedContextData: string
}

export interface QoeLoggingContext {
    serializedContextData: string
}

export interface MenuOnTap {
    innertubeCommand: InnertubeCommand2
}

export interface InnertubeCommand2 {
    clickTrackingParams: string
    showSheetCommand: ShowSheetCommand
}

export interface ShowSheetCommand {
    panelLoadingStrategy: PanelLoadingStrategy
}

export interface PanelLoadingStrategy {
    inlineContent: InlineContent
}

export interface InlineContent {
    sheetViewModel: SheetViewModel
}

export interface SheetViewModel {
    content: Content5
}

export interface Content5 {
    listViewModel: ListViewModel
}

export interface ListViewModel {
    listItems: ListItem[]
}

export interface ListItem {
    listItemViewModel: ListItemViewModel
}

export interface ListItemViewModel {
    title: Title5
    leadingImage: LeadingImage
    rendererContext: RendererContext
}

export interface Title5 {
    content: string
}

export interface LeadingImage {
    sources: Source2[]
}

export interface Source2 {
    clientResource: ClientResource
}

export interface ClientResource {
    imageName: string
}

export interface RendererContext {
    loggingContext?: LoggingContext5
    commandContext: CommandContext
}

export interface LoggingContext5 {
    loggingDirectives: LoggingDirectives
}

export interface LoggingDirectives {
    trackingParams: string
    enableDisplayloggerExperiment: boolean
}

export interface CommandContext {
    onTap: OnTap2
}

export interface OnTap2 {
    innertubeCommand: InnertubeCommand3
}

export interface InnertubeCommand3 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata19
    signalServiceEndpoint?: SignalServiceEndpoint3
    userFeedbackEndpoint?: UserFeedbackEndpoint2
}

export interface CommandMetadata19 {
    webCommandMetadata: WebCommandMetadata19
}

export interface WebCommandMetadata19 {
    sendPost?: boolean
    ignoreNavigation?: boolean
}

export interface SignalServiceEndpoint3 {
    signal: string
    actions: Action6[]
}

export interface Action6 {
    clickTrackingParams: string
    addToPlaylistCommand: AddToPlaylistCommand3
}

export interface AddToPlaylistCommand3 {
    openMiniplayer: boolean
    videoId: string
    listType: string
    onCreateListCommand: OnCreateListCommand3
    videoIds: string[]
}

export interface OnCreateListCommand3 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata20
    createPlaylistServiceEndpoint: CreatePlaylistServiceEndpoint3
}

export interface CommandMetadata20 {
    webCommandMetadata: WebCommandMetadata20
}

export interface WebCommandMetadata20 {
    sendPost: boolean
    apiUrl: string
}

export interface CreatePlaylistServiceEndpoint3 {
    videoIds: string[]
    params: string
}

export interface UserFeedbackEndpoint2 {
    additionalDatas: AdditionalData2[]
}

export interface AdditionalData2 {
    userFeedbackEndpointProductSpecificValueData: UserFeedbackEndpointProductSpecificValueData2
}

export interface UserFeedbackEndpointProductSpecificValueData2 {
    key: string
    value: string
}

export interface OverlayMetadata {
    primaryText: PrimaryText
    secondaryText: SecondaryText
}

export interface PrimaryText {
    content: string
}

export interface SecondaryText {
    content: string
}

export interface LoggingDirectives2 {
    trackingParams: string
    visibility: Visibility
    enableDisplayloggerExperiment: boolean
}

export interface Visibility {
    types: string
}

export interface Icon9 {
    iconType: string
}

export interface NextButton2 {
    buttonRenderer: ButtonRenderer4
}

export interface ButtonRenderer4 {
    style: string
    size: string
    icon: Icon10
    accessibility: Accessibility9
}

export interface Icon10 {
    iconType: string
}

export interface Accessibility9 {
    label: string
}

export interface PreviousButton2 {
    buttonRenderer: ButtonRenderer5
}

export interface ButtonRenderer5 {
    style: string
    size: string
    icon: Icon11
    accessibility: Accessibility10
}

export interface Icon11 {
    iconType: string
}

export interface Accessibility10 {
    label: string
}

export interface ExpandableTabRenderer {
    endpoint: Endpoint3
    title: string
    selected: boolean
    expandedText: string
}

export interface Endpoint3 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata21
    browseEndpoint: BrowseEndpoint8
}

export interface CommandMetadata21 {
    webCommandMetadata: WebCommandMetadata21
}

export interface WebCommandMetadata21 {
    url: string
    webPageType: string
    rootVe: number
    apiUrl: string
}

export interface BrowseEndpoint8 {
    browseId: string
    params: string
    canonicalBaseUrl: string
}

export interface Header {
    pageHeaderRenderer: PageHeaderRenderer
}

export interface PageHeaderRenderer {
    pageTitle: string
    content: Content6
}

export interface Content6 {
    pageHeaderViewModel: PageHeaderViewModel
}

export interface PageHeaderViewModel {
    title: Title6
    image: Image2
    metadata: Metadata
    actions: Actions
    description: Description
    rendererContext: RendererContext7
}

export interface Title6 {
    dynamicTextViewModel: DynamicTextViewModel
}

export interface DynamicTextViewModel {
    text: Text9
    maxLines: number
    rendererContext: RendererContext2
}

export interface Text9 {
    content: string
    styleRuns: StyleRun[]
    attachmentRuns: AttachmentRun[]
}

export interface StyleRun {
    startIndex: number
    styleRunExtensions: StyleRunExtensions
}

export interface StyleRunExtensions {
    styleRunColorMapExtension: StyleRunColorMapExtension
}

export interface StyleRunColorMapExtension {
    colorMap: ColorMap[]
}

export interface ColorMap {
    key: string
    value: number
}

export interface AttachmentRun {
    startIndex: number
    length: number
    element: Element
    alignment: string
}

export interface Element {
    type: Type
    properties: Properties
}

export interface Type {
    imageType: ImageType
}

export interface ImageType {
    image: Image
}

export interface Image {
    sources: Source3[]
}

export interface Source3 {
    clientResource: ClientResource2
    width: number
    height: number
}

export interface ClientResource2 {
    imageName: string
}

export interface Properties {
    layoutProperties: LayoutProperties
}

export interface LayoutProperties {
    height: Height
    width: Width
    margin: Margin
}

export interface Height {
    value: number
    unit: string
}

export interface Width {
    value: number
    unit: string
}

export interface Margin {
    left: Left
}

export interface Left {
    value: number
    unit: string
}

export interface RendererContext2 {
    loggingContext: LoggingContext6
    accessibilityContext: AccessibilityContext
}

export interface LoggingContext6 {
    loggingDirectives: LoggingDirectives3
}

export interface LoggingDirectives3 {
    trackingParams: string
    visibility: Visibility2
    clientVeSpec: ClientVeSpec
}

export interface Visibility2 {
    types: string
}

export interface ClientVeSpec {
    uiType: number
    veCounter: number
}

export interface AccessibilityContext {
    label: string
}

export interface Image2 {
    decoratedAvatarViewModel: DecoratedAvatarViewModel
}

export interface DecoratedAvatarViewModel {
    avatar: Avatar
}

export interface Avatar {
    avatarViewModel: AvatarViewModel
}

export interface AvatarViewModel {
    image: Image3
    avatarImageSize: string
    loggingDirectives: LoggingDirectives4
}

export interface Image3 {
    sources: Source4[]
    processor: Processor
}

export interface Source4 {
    url: string
    width: number
    height: number
}

export interface Processor {
    borderImageProcessor: BorderImageProcessor
}

export interface BorderImageProcessor {
    circular: boolean
}

export interface LoggingDirectives4 {
    trackingParams: string
    visibility: Visibility3
    enableDisplayloggerExperiment: boolean
}

export interface Visibility3 {
    types: string
}

export interface Metadata {
    contentMetadataViewModel: ContentMetadataViewModel
}

export interface ContentMetadataViewModel {
    metadataRows: MetadataRow[]
    delimiter: string
    rendererContext: RendererContext3
}

export interface MetadataRow {
    metadataParts: MetadataPart[]
}

export interface MetadataPart {
    text: Text10
    enableTruncation?: boolean
}

export interface Text10 {
    content: string
    styleRuns?: StyleRun2[]
}

export interface StyleRun2 {
    startIndex: number
    length: number
}

export interface RendererContext3 {
    loggingContext: LoggingContext7
}

export interface LoggingContext7 {
    loggingDirectives: LoggingDirectives5
}

export interface LoggingDirectives5 {
    trackingParams: string
    visibility: Visibility4
    clientVeSpec: ClientVeSpec2
}

export interface Visibility4 {
    types: string
}

export interface ClientVeSpec2 {
    uiType: number
    veCounter: number
}

export interface Actions {
    flexibleActionsViewModel: FlexibleActionsViewModel
}

export interface FlexibleActionsViewModel {
    actionsRows: ActionsRow[]
    minimumRowHeight: number
    rendererContext: RendererContext5
}

export interface ActionsRow {
    actions: Action7[]
}

export interface Action7 {
    subscribeButtonViewModel: SubscribeButtonViewModel
}

export interface SubscribeButtonViewModel {
    subscribeButtonContent: SubscribeButtonContent
    unsubscribeButtonContent: UnsubscribeButtonContent
    stateEntityStoreKey: string
    trackingParams: string
    disableNotificationBell: boolean
    buttonStyle: ButtonStyle
    backgroundStyle: string
    disableSubscribeButton: boolean
    onShowSubscriptionOptions: OnShowSubscriptionOptions
    channelId: string
    enableSubscribeButtonPostClickAnimation: boolean
    notificationStateEntityStoreKeys: NotificationStateEntityStoreKeys
    bellAccessibilityData: BellAccessibilityData
    loggingDirectives: LoggingDirectives7
}

export interface SubscribeButtonContent {
    buttonText: string
    accessibilityText: string
    imageName: string
    subscribeState: SubscribeState
    onTapCommand: OnTapCommand
}

export interface SubscribeState {
    key: string
    subscribed: boolean
}

export interface OnTapCommand {
    innertubeCommand: InnertubeCommand4
}

export interface InnertubeCommand4 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata22
    subscribeEndpoint: SubscribeEndpoint
}

export interface CommandMetadata22 {
    webCommandMetadata: WebCommandMetadata22
}

export interface WebCommandMetadata22 {
    sendPost: boolean
    apiUrl: string
}

export interface SubscribeEndpoint {
    channelIds: string[]
    params: string
}

export interface UnsubscribeButtonContent {
    buttonText: string
    accessibilityText: string
    imageName: string
    subscribeState: SubscribeState2
    onTapCommand: OnTapCommand2
}

export interface SubscribeState2 {
    key: string
    subscribed: boolean
}

export interface OnTapCommand2 {
    innertubeCommand: InnertubeCommand5
}

export interface InnertubeCommand5 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata23
    signalServiceEndpoint: SignalServiceEndpoint4
}

export interface CommandMetadata23 {
    webCommandMetadata: WebCommandMetadata23
}

export interface WebCommandMetadata23 {
    sendPost: boolean
}

export interface SignalServiceEndpoint4 {
    signal: string
    actions: Action8[]
}

export interface Action8 {
    clickTrackingParams: string
    openPopupAction: OpenPopupAction2
}

export interface OpenPopupAction2 {
    popup: Popup2
    popupType: string
}

export interface Popup2 {
    confirmDialogRenderer: ConfirmDialogRenderer
}

export interface ConfirmDialogRenderer {
    trackingParams: string
    dialogMessages: DialogMessage[]
    confirmButton: ConfirmButton
    cancelButton: CancelButton
    primaryIsCancel: boolean
}

export interface DialogMessage {
    runs: Run17[]
}

export interface Run17 {
    text: string
}

export interface ConfirmButton {
    buttonRenderer: ButtonRenderer6
}

export interface ButtonRenderer6 {
    style: string
    size: string
    isDisabled: boolean
    text: Text11
    serviceEndpoint: ServiceEndpoint3
    accessibility: Accessibility11
    trackingParams: string
}

export interface Text11 {
    runs: Run18[]
}

export interface Run18 {
    text: string
}

export interface ServiceEndpoint3 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata24
    unsubscribeEndpoint: UnsubscribeEndpoint
}

export interface CommandMetadata24 {
    webCommandMetadata: WebCommandMetadata24
}

export interface WebCommandMetadata24 {
    sendPost: boolean
    apiUrl: string
}

export interface UnsubscribeEndpoint {
    channelIds: string[]
    params: string
}

export interface Accessibility11 {
    label: string
}

export interface CancelButton {
    buttonRenderer: ButtonRenderer7
}

export interface ButtonRenderer7 {
    style: string
    size: string
    isDisabled: boolean
    text: Text12
    accessibility: Accessibility12
    trackingParams: string
}

export interface Text12 {
    runs: Run19[]
}

export interface Run19 {
    text: string
}

export interface Accessibility12 {
    label: string
}

export interface ButtonStyle {
    unsubscribedStateStyle: string
    subscribedStateStyle: string
    buttonSize: string
}

export interface OnShowSubscriptionOptions {
    innertubeCommand: InnertubeCommand6
}

export interface InnertubeCommand6 {
    clickTrackingParams: string
    showSheetCommand: ShowSheetCommand2
}

export interface ShowSheetCommand2 {
    panelLoadingStrategy: PanelLoadingStrategy2
}

export interface PanelLoadingStrategy2 {
    inlineContent: InlineContent2
}

export interface InlineContent2 {
    sheetViewModel: SheetViewModel2
}

export interface SheetViewModel2 {
    content: Content7
}

export interface Content7 {
    listViewModel: ListViewModel2
}

export interface ListViewModel2 {
    listItems: ListItem2[]
}

export interface ListItem2 {
    listItemViewModel: ListItemViewModel2
}

export interface ListItemViewModel2 {
    title: Title7
    leadingImage: LeadingImage2
    isDisabled: boolean
    isSelected: boolean
    selectionStyle?: string
    rendererContext: RendererContext4
}

export interface Title7 {
    content: string
}

export interface LeadingImage2 {
    sources: Source5[]
}

export interface Source5 {
    clientResource: ClientResource3
}

export interface ClientResource3 {
    imageName: string
}

export interface RendererContext4 {
    loggingContext: LoggingContext8
    commandContext: CommandContext2
}

export interface LoggingContext8 {
    loggingDirectives: LoggingDirectives6
}

export interface LoggingDirectives6 {
    trackingParams: string
    visibility: Visibility5
}

export interface Visibility5 {
    types: string
}

export interface CommandContext2 {
    onTap: OnTap3
}

export interface OnTap3 {
    innertubeCommand: InnertubeCommand7
}

export interface InnertubeCommand7 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata25
    modifyChannelNotificationPreferenceEndpoint?: ModifyChannelNotificationPreferenceEndpoint
    signalServiceEndpoint?: SignalServiceEndpoint5
}

export interface CommandMetadata25 {
    webCommandMetadata: WebCommandMetadata25
}

export interface WebCommandMetadata25 {
    sendPost: boolean
    apiUrl?: string
}

export interface ModifyChannelNotificationPreferenceEndpoint {
    params: string
}

export interface SignalServiceEndpoint5 {
    signal: string
    actions: Action9[]
}

export interface Action9 {
    clickTrackingParams: string
    openPopupAction: OpenPopupAction3
}

export interface OpenPopupAction3 {
    popup: Popup3
    popupType: string
}

export interface Popup3 {
    confirmDialogRenderer: ConfirmDialogRenderer2
}

export interface ConfirmDialogRenderer2 {
    trackingParams: string
    dialogMessages: DialogMessage2[]
    confirmButton: ConfirmButton2
    cancelButton: CancelButton2
    primaryIsCancel: boolean
}

export interface DialogMessage2 {
    runs: Run20[]
}

export interface Run20 {
    text: string
}

export interface ConfirmButton2 {
    buttonRenderer: ButtonRenderer8
}

export interface ButtonRenderer8 {
    style: string
    size: string
    isDisabled: boolean
    text: Text13
    serviceEndpoint: ServiceEndpoint4
    accessibility: Accessibility13
    trackingParams: string
}

export interface Text13 {
    runs: Run21[]
}

export interface Run21 {
    text: string
}

export interface ServiceEndpoint4 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata26
    unsubscribeEndpoint: UnsubscribeEndpoint2
}

export interface CommandMetadata26 {
    webCommandMetadata: WebCommandMetadata26
}

export interface WebCommandMetadata26 {
    sendPost: boolean
    apiUrl: string
}

export interface UnsubscribeEndpoint2 {
    channelIds: string[]
    params: string
}

export interface Accessibility13 {
    label: string
}

export interface CancelButton2 {
    buttonRenderer: ButtonRenderer9
}

export interface ButtonRenderer9 {
    style: string
    size: string
    isDisabled: boolean
    text: Text14
    accessibility: Accessibility14
    trackingParams: string
}

export interface Text14 {
    runs: Run22[]
}

export interface Run22 {
    text: string
}

export interface Accessibility14 {
    label: string
}

export interface NotificationStateEntityStoreKeys {
    subsNotificationStateKey: string
}

export interface BellAccessibilityData {
    offLabel: string
    allLabel: string
    occasionalLabel: string
    disabledLabel: string
}

export interface LoggingDirectives7 {
    trackingParams: string
    visibility: Visibility6
    enableDisplayloggerExperiment: boolean
}

export interface Visibility6 {
    types: string
}

export interface RendererContext5 {
    loggingContext: LoggingContext9
}

export interface LoggingContext9 {
    loggingDirectives: LoggingDirectives8
}

export interface LoggingDirectives8 {
    trackingParams: string
    visibility: Visibility7
    clientVeSpec: ClientVeSpec3
}

export interface Visibility7 {
    types: string
}

export interface ClientVeSpec3 {
    uiType: number
    veCounter: number
}

export interface Description {
    descriptionPreviewViewModel: DescriptionPreviewViewModel
}

export interface DescriptionPreviewViewModel {
    description: Description2
    maxLines: number
    truncationText: TruncationText
    alwaysShowTruncationText: boolean
    rendererContext: RendererContext6
}

export interface Description2 {
    content: string
    styleRuns: StyleRun3[]
}

export interface StyleRun3 {
    startIndex: number
    length: number
}

export interface TruncationText {
    content: string
    styleRuns: StyleRun4[]
}

export interface StyleRun4 {
    startIndex: number
    length: number
    weight: number
}

export interface RendererContext6 {
    loggingContext: LoggingContext10
    accessibilityContext: AccessibilityContext2
    commandContext: CommandContext3
}

export interface LoggingContext10 {
    loggingDirectives: LoggingDirectives9
}

export interface LoggingDirectives9 {
    trackingParams: string
    visibility: Visibility8
    clientVeSpec: ClientVeSpec4
}

export interface Visibility8 {
    types: string
}

export interface ClientVeSpec4 {
    uiType: number
    veCounter: number
}

export interface AccessibilityContext2 {
    label: string
}

export interface CommandContext3 {
    onTap: OnTap4
}

export interface OnTap4 {
    innertubeCommand: InnertubeCommand8
}

export interface InnertubeCommand8 {
    clickTrackingParams: string
    showEngagementPanelEndpoint: ShowEngagementPanelEndpoint
}

export interface ShowEngagementPanelEndpoint {
    engagementPanel: EngagementPanel
    identifier: Identifier2
    engagementPanelPresentationConfigs: EngagementPanelPresentationConfigs
}

export interface EngagementPanel {
    engagementPanelSectionListRenderer: EngagementPanelSectionListRenderer
}

export interface EngagementPanelSectionListRenderer {
    header: Header2
    content: Content8
    targetId: string
    identifier: Identifier
}

export interface Header2 {
    engagementPanelTitleHeaderRenderer: EngagementPanelTitleHeaderRenderer
}

export interface EngagementPanelTitleHeaderRenderer {
    title: Title8
    visibilityButton: VisibilityButton
    trackingParams: string
}

export interface Title8 {
    simpleText: string
}

export interface VisibilityButton {
    buttonRenderer: ButtonRenderer10
}

export interface ButtonRenderer10 {
    style: string
    size: string
    isDisabled: boolean
    icon: Icon12
    accessibility: Accessibility15
    trackingParams: string
    accessibilityData: AccessibilityData10
    command: Command2
}

export interface Icon12 {
    iconType: string
}

export interface Accessibility15 {
    label: string
}

export interface AccessibilityData10 {
    accessibilityData: AccessibilityData11
}

export interface AccessibilityData11 {
    label: string
}

export interface Command2 {
    clickTrackingParams: string
    changeEngagementPanelVisibilityAction: ChangeEngagementPanelVisibilityAction
}

export interface ChangeEngagementPanelVisibilityAction {
    targetId: string
    visibility: string
}

export interface Content8 {
    sectionListRenderer: SectionListRenderer2
}

export interface SectionListRenderer2 {
    contents: Content9[]
    trackingParams: string
    scrollPaneStyle: ScrollPaneStyle
}

export interface Content9 {
    itemSectionRenderer: ItemSectionRenderer2
}

export interface ItemSectionRenderer2 {
    contents: Content10[]
    trackingParams: string
    sectionIdentifier: string
    targetId: string
}

export interface Content10 {
    continuationItemRenderer: ContinuationItemRenderer
}

export interface ContinuationItemRenderer {
    trigger: string
    continuationEndpoint: ContinuationEndpoint
}

export interface ContinuationEndpoint {
    clickTrackingParams: string
    commandMetadata: CommandMetadata27
    continuationCommand: ContinuationCommand
}

export interface CommandMetadata27 {
    webCommandMetadata: WebCommandMetadata27
}

export interface WebCommandMetadata27 {
    sendPost: boolean
    apiUrl: string
}

export interface ContinuationCommand {
    token: string
    request: string
}

export interface ScrollPaneStyle {
    scrollable: boolean
}

export interface Identifier {
    surface: string
    tag: string
}

export interface Identifier2 {
    surface: string
    tag: string
}

export interface EngagementPanelPresentationConfigs {
    engagementPanelPopupPresentationConfig: EngagementPanelPopupPresentationConfig
}

export interface EngagementPanelPopupPresentationConfig {
    popupType: string
}

export interface RendererContext7 {
    loggingContext: LoggingContext11
}

export interface LoggingContext11 {
    loggingDirectives: LoggingDirectives10
}

export interface LoggingDirectives10 {
    trackingParams: string
    visibility: Visibility9
    clientVeSpec: ClientVeSpec5
}

export interface Visibility9 {
    types: string
}

export interface ClientVeSpec5 {
    uiType: number
    veCounter: number
}

export interface Metadata2 {
    channelMetadataRenderer: ChannelMetadataRenderer
}

export interface ChannelMetadataRenderer {
    title: string
    description: string
    rssUrl: string
    externalId: string
    keywords: string
    ownerUrls: string[]
    avatar: Avatar2
    channelUrl: string
    isFamilySafe: boolean
    availableCountryCodes: string[]
    androidDeepLink: string
    androidAppindexingLink: string
    iosAppindexingLink: string
    vanityChannelUrl: string
}

export interface Avatar2 {
    thumbnails: Thumbnail13[]
}

export interface Thumbnail13 {
    url: string
    width: number
    height: number
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
    endpoint: Endpoint4
    trackingParams: string
    overrideEntityKey: string
}

export interface IconImage {
    iconType: string
}

export interface TooltipText {
    runs: Run23[]
}

export interface Run23 {
    text: string
}

export interface Endpoint4 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata28
    browseEndpoint: BrowseEndpoint9
}

export interface CommandMetadata28 {
    webCommandMetadata: WebCommandMetadata28
}

export interface WebCommandMetadata28 {
    url: string
    webPageType: string
    rootVe: number
    apiUrl: string
}

export interface BrowseEndpoint9 {
    browseId: string
}

export interface Searchbox {
    fusionSearchboxRenderer: FusionSearchboxRenderer
}

export interface FusionSearchboxRenderer {
    icon: Icon13
    placeholderText: PlaceholderText
    config: Config
    trackingParams: string
    searchEndpoint: SearchEndpoint
    clearButton: ClearButton
}

export interface Icon13 {
    iconType: string
}

export interface PlaceholderText {
    runs: Run24[]
}

export interface Run24 {
    text: string
}

export interface Config {
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
    commandMetadata: CommandMetadata29
    searchEndpoint: SearchEndpoint2
}

export interface CommandMetadata29 {
    webCommandMetadata: WebCommandMetadata29
}

export interface WebCommandMetadata29 {
    url: string
    webPageType: string
    rootVe: number
}

export interface SearchEndpoint2 {
    query: string
}

export interface ClearButton {
    buttonRenderer: ButtonRenderer11
}

export interface ButtonRenderer11 {
    style: string
    size: string
    isDisabled: boolean
    icon: Icon14
    trackingParams: string
    accessibilityData: AccessibilityData12
}

export interface Icon14 {
    iconType: string
}

export interface AccessibilityData12 {
    accessibilityData: AccessibilityData13
}

export interface AccessibilityData13 {
    label: string
}

export interface TopbarButton {
    topbarMenuButtonRenderer?: TopbarMenuButtonRenderer
    notificationTopbarButtonRenderer?: NotificationTopbarButtonRenderer
}

export interface TopbarMenuButtonRenderer {
    avatar?: Avatar3
    menuRequest?: MenuRequest
    trackingParams: string
    accessibility: Accessibility17
    tooltip: string
    icon?: Icon15
    menuRenderer?: MenuRenderer3
    style?: string
}

export interface Avatar3 {
    thumbnails: Thumbnail14[]
    accessibility: Accessibility16
}

export interface Thumbnail14 {
    url: string
    width: number
    height: number
}

export interface Accessibility16 {
    accessibilityData: AccessibilityData14
}

export interface AccessibilityData14 {
    label: string
}

export interface MenuRequest {
    clickTrackingParams: string
    commandMetadata: CommandMetadata30
    signalServiceEndpoint: SignalServiceEndpoint6
}

export interface CommandMetadata30 {
    webCommandMetadata: WebCommandMetadata30
}

export interface WebCommandMetadata30 {
    sendPost: boolean
    apiUrl: string
}

export interface SignalServiceEndpoint6 {
    signal: string
    actions: Action10[]
}

export interface Action10 {
    clickTrackingParams: string
    openPopupAction: OpenPopupAction4
}

export interface OpenPopupAction4 {
    popup: Popup4
    popupType: string
    beReused: boolean
}

export interface Popup4 {
    multiPageMenuRenderer: MultiPageMenuRenderer
}

export interface MultiPageMenuRenderer {
    trackingParams: string
    style: string
    showLoadingSpinner: boolean
}

export interface Accessibility17 {
    accessibilityData: AccessibilityData15
}

export interface AccessibilityData15 {
    label: string
}

export interface Icon15 {
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
    items: Item5[]
    trackingParams: string
}

export interface Item5 {
    compactLinkRenderer: CompactLinkRenderer
}

export interface CompactLinkRenderer {
    icon: Icon16
    title: Title9
    navigationEndpoint: NavigationEndpoint11
    trackingParams: string
    style: string
}

export interface Icon16 {
    iconType: string
}

export interface Title9 {
    runs: Run25[]
}

export interface Run25 {
    text: string
}

export interface NavigationEndpoint11 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata31
    uploadEndpoint?: UploadEndpoint
    signalNavigationEndpoint?: SignalNavigationEndpoint
    browseEndpoint?: BrowseEndpoint10
}

export interface CommandMetadata31 {
    webCommandMetadata: WebCommandMetadata31
}

export interface WebCommandMetadata31 {
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

export interface BrowseEndpoint10 {
    browseId: string
    params: string
}

export interface NotificationTopbarButtonRenderer {
    icon: Icon17
    menuRequest: MenuRequest2
    style: string
    trackingParams: string
    accessibility: Accessibility18
    tooltip: string
    updateUnseenCountEndpoint: UpdateUnseenCountEndpoint
    notificationCount: number
    handlerDatas: string[]
}

export interface Icon17 {
    iconType: string
}

export interface MenuRequest2 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata32
    signalServiceEndpoint: SignalServiceEndpoint7
}

export interface CommandMetadata32 {
    webCommandMetadata: WebCommandMetadata32
}

export interface WebCommandMetadata32 {
    sendPost: boolean
}

export interface SignalServiceEndpoint7 {
    signal: string
    actions: Action11[]
}

export interface Action11 {
    clickTrackingParams: string
    openPopupAction: OpenPopupAction5
}

export interface OpenPopupAction5 {
    popup: Popup5
    popupType: string
    beReused: boolean
}

export interface Popup5 {
    multiPageMenuRenderer: MultiPageMenuRenderer3
}

export interface MultiPageMenuRenderer3 {
    trackingParams: string
    style: string
    showLoadingSpinner: boolean
}

export interface Accessibility18 {
    accessibilityData: AccessibilityData16
}

export interface AccessibilityData16 {
    label: string
}

export interface UpdateUnseenCountEndpoint {
    clickTrackingParams: string
    commandMetadata: CommandMetadata33
    signalServiceEndpoint: SignalServiceEndpoint8
}

export interface CommandMetadata33 {
    webCommandMetadata: WebCommandMetadata33
}

export interface WebCommandMetadata33 {
    sendPost: boolean
    apiUrl: string
}

export interface SignalServiceEndpoint8 {
    signal: string
}

export interface HotkeyDialog {
    hotkeyDialogRenderer: HotkeyDialogRenderer
}

export interface HotkeyDialogRenderer {
    title: Title10
    sections: Section2[]
    dismissButton: DismissButton
    trackingParams: string
}

export interface Title10 {
    runs: Run26[]
}

export interface Run26 {
    text: string
}

export interface Section2 {
    hotkeyDialogSectionRenderer: HotkeyDialogSectionRenderer
}

export interface HotkeyDialogSectionRenderer {
    title: Title11
    options: Option[]
}

export interface Title11 {
    runs: Run27[]
}

export interface Run27 {
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
    runs: Run28[]
}

export interface Run28 {
    text: string
}

export interface HotkeyAccessibilityLabel {
    accessibilityData: AccessibilityData17
}

export interface AccessibilityData17 {
    label: string
}

export interface DismissButton {
    buttonRenderer: ButtonRenderer12
}

export interface ButtonRenderer12 {
    style: string
    size: string
    isDisabled: boolean
    text: Text15
    trackingParams: string
}

export interface Text15 {
    runs: Run29[]
}

export interface Run29 {
    text: string
}

export interface BackButton {
    buttonRenderer: ButtonRenderer13
}

export interface ButtonRenderer13 {
    trackingParams: string
    command: Command3
}

export interface Command3 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata34
    signalServiceEndpoint: SignalServiceEndpoint9
}

export interface CommandMetadata34 {
    webCommandMetadata: WebCommandMetadata34
}

export interface WebCommandMetadata34 {
    sendPost: boolean
}

export interface SignalServiceEndpoint9 {
    signal: string
    actions: Action12[]
}

export interface Action12 {
    clickTrackingParams: string
    signalAction: SignalAction
}

export interface SignalAction {
    signal: string
}

export interface ForwardButton {
    buttonRenderer: ButtonRenderer14
}

export interface ButtonRenderer14 {
    trackingParams: string
    command: Command4
}

export interface Command4 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata35
    signalServiceEndpoint: SignalServiceEndpoint10
}

export interface CommandMetadata35 {
    webCommandMetadata: WebCommandMetadata35
}

export interface WebCommandMetadata35 {
    sendPost: boolean
}

export interface SignalServiceEndpoint10 {
    signal: string
    actions: Action13[]
}

export interface Action13 {
    clickTrackingParams: string
    signalAction: SignalAction2
}

export interface SignalAction2 {
    signal: string
}

export interface A11ySkipNavigationButton {
    buttonRenderer: ButtonRenderer15
}

export interface ButtonRenderer15 {
    style: string
    size: string
    isDisabled: boolean
    text: Text16
    trackingParams: string
    command: Command5
}

export interface Text16 {
    runs: Run30[]
}

export interface Run30 {
    text: string
}

export interface Command5 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata36
    signalServiceEndpoint: SignalServiceEndpoint11
}

export interface CommandMetadata36 {
    webCommandMetadata: WebCommandMetadata36
}

export interface WebCommandMetadata36 {
    sendPost: boolean
}

export interface SignalServiceEndpoint11 {
    signal: string
    actions: Action14[]
}

export interface Action14 {
    clickTrackingParams: string
    signalAction: SignalAction3
}

export interface SignalAction3 {
    signal: string
}

export interface VoiceSearchButton {
    buttonRenderer: ButtonRenderer16
}

export interface ButtonRenderer16 {
    style: string
    size: string
    isDisabled: boolean
    serviceEndpoint: ServiceEndpoint5
    icon: Icon19
    tooltip: string
    trackingParams: string
    accessibilityData: AccessibilityData20
}

export interface ServiceEndpoint5 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata37
    signalServiceEndpoint: SignalServiceEndpoint12
}

export interface CommandMetadata37 {
    webCommandMetadata: WebCommandMetadata37
}

export interface WebCommandMetadata37 {
    sendPost: boolean
}

export interface SignalServiceEndpoint12 {
    signal: string
    actions: Action15[]
}

export interface Action15 {
    clickTrackingParams: string
    openPopupAction: OpenPopupAction6
}

export interface OpenPopupAction6 {
    popup: Popup6
    popupType: string
}

export interface Popup6 {
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
    runs: Run31[]
}

export interface Run31 {
    text: string
}

export interface PromptHeader {
    runs: Run32[]
}

export interface Run32 {
    text: string
}

export interface ExampleQuery1 {
    runs: Run33[]
}

export interface Run33 {
    text: string
}

export interface ExampleQuery2 {
    runs: Run34[]
}

export interface Run34 {
    text: string
}

export interface PromptMicrophoneLabel {
    runs: Run35[]
}

export interface Run35 {
    text: string
}

export interface LoadingHeader {
    runs: Run36[]
}

export interface Run36 {
    text: string
}

export interface ConnectionErrorHeader {
    runs: Run37[]
}

export interface Run37 {
    text: string
}

export interface ConnectionErrorMicrophoneLabel {
    runs: Run38[]
}

export interface Run38 {
    text: string
}

export interface PermissionsHeader {
    runs: Run39[]
}

export interface Run39 {
    text: string
}

export interface PermissionsSubtext {
    runs: Run40[]
}

export interface Run40 {
    text: string
}

export interface DisabledHeader {
    runs: Run41[]
}

export interface Run41 {
    text: string
}

export interface DisabledSubtext {
    runs: Run42[]
}

export interface Run42 {
    text: string
}

export interface MicrophoneButtonAriaLabel {
    runs: Run43[]
}

export interface Run43 {
    text: string
}

export interface ExitButton {
    buttonRenderer: ButtonRenderer17
}

export interface ButtonRenderer17 {
    style: string
    size: string
    isDisabled: boolean
    icon: Icon18
    trackingParams: string
    accessibilityData: AccessibilityData18
}

export interface Icon18 {
    iconType: string
}

export interface AccessibilityData18 {
    accessibilityData: AccessibilityData19
}

export interface AccessibilityData19 {
    label: string
}

export interface MicrophoneOffPromptHeader {
    runs: Run44[]
}

export interface Run44 {
    text: string
}

export interface Icon19 {
    iconType: string
}

export interface AccessibilityData20 {
    accessibilityData: AccessibilityData21
}

export interface AccessibilityData21 {
    label: string
}

export interface Microformat {
    microformatDataRenderer: MicroformatDataRenderer
}

export interface MicroformatDataRenderer {
    urlCanonical: string
    title: string
    description: string
    thumbnail: Thumbnail15
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
    familySafe: boolean
    availableCountries: string[]
    linkAlternates: LinkAlternate[]
}

export interface Thumbnail15 {
    thumbnails: Thumbnail16[]
}

export interface Thumbnail16 {
    url: string
    width: number
    height: number
}

export interface LinkAlternate {
    hrefUrl: string
}