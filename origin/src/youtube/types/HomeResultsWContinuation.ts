export interface HomeResultsWContinuation {
    responseContext: ResponseContext
    trackingParams: string
    onResponseReceivedActions: OnResponseReceivedAction[]
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
    hasDecorated: boolean
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
    richItemRenderer?: RichItemRenderer
    richSectionRenderer?: RichSectionRenderer
    continuationItemRenderer?: ContinuationItemRenderer
}

export interface RichItemRenderer {
    content: Content
    trackingParams: string
}

export interface Content {
    videoRenderer?: VideoRenderer
    radioRenderer?: RadioRenderer
}

export interface VideoRenderer {
    videoId: string
    thumbnail: Thumbnail
    title: Title
    descriptionSnippet: DescriptionSnippet
    longBylineText: LongBylineText
    publishedTimeText: PublishedTimeText
    lengthText: LengthText
    viewCountText: ViewCountText
    navigationEndpoint: NavigationEndpoint2
    ownerText: OwnerText
    shortBylineText: ShortBylineText
    trackingParams: string
    showActionMenu: boolean
    shortViewCountText: ShortViewCountText
    menu: Menu
    channelThumbnailSupportedRenderers: ChannelThumbnailSupportedRenderers
    thumbnailOverlays: ThumbnailOverlay[]
    richThumbnail?: RichThumbnail
    inlinePlaybackEndpoint: InlinePlaybackEndpoint
    avatar: Avatar
    isWatched?: boolean
    ownerBadges?: OwnerBadge[]
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

export interface DescriptionSnippet {
    runs: Run2[]
}

export interface Run2 {
    text: string
}

export interface LongBylineText {
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

export interface PublishedTimeText {
    simpleText: string
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

export interface ViewCountText {
    simpleText: string
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

export interface OwnerText {
    runs: Run4[]
}

export interface Run4 {
    text: string
    navigationEndpoint: NavigationEndpoint3
}

export interface NavigationEndpoint3 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata3
    browseEndpoint: BrowseEndpoint2
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

export interface BrowseEndpoint2 {
    browseId: string
    canonicalBaseUrl: string
}

export interface ShortBylineText {
    runs: Run5[]
}

export interface Run5 {
    text: string
    navigationEndpoint: NavigationEndpoint4
}

export interface NavigationEndpoint4 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata4
    browseEndpoint: BrowseEndpoint3
}

export interface CommandMetadata4 {
    webCommandMetadata: WebCommandMetadata4
}

export interface WebCommandMetadata4 {
    url: string
    webPageType: string
    rootVe: number
    apiUrl: string
}

export interface BrowseEndpoint3 {
    browseId: string
    canonicalBaseUrl: string
}

export interface ShortViewCountText {
    accessibility: Accessibility3
    simpleText: string
}

export interface Accessibility3 {
    accessibilityData: AccessibilityData3
}

export interface AccessibilityData3 {
    label: string
}

export interface Menu {
    menuRenderer: MenuRenderer
}

export interface MenuRenderer {
    items: Item[]
    trackingParams: string
    accessibility: Accessibility5
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
    runs: Run6[]
}

export interface Run6 {
    text: string
}

export interface Icon {
    iconType: string
}

export interface ServiceEndpoint {
    clickTrackingParams: string
    commandMetadata: CommandMetadata5
    getReportFormEndpoint?: GetReportFormEndpoint
    feedbackEndpoint?: FeedbackEndpoint
    shareEntityServiceEndpoint?: ShareEntityServiceEndpoint
    signalServiceEndpoint?: SignalServiceEndpoint2
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

export interface GetReportFormEndpoint {
    params: string
}

export interface FeedbackEndpoint {
    feedbackToken: string
    uiActions: UiActions
    actions: Action[]
    contentId: string
}

export interface UiActions {
    hideEnclosingContainer: boolean
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
    buttons: Button[]
    trackingParams: string
    dismissalViewStyle: string
}

export interface ResponseText {
    runs?: Run7[]
    accessibility: Accessibility4
    simpleText?: string
}

export interface Run7 {
    text: string
}

export interface Accessibility4 {
    accessibilityData: AccessibilityData4
}

export interface AccessibilityData4 {
    label: string
}

export interface Button {
    buttonRenderer: ButtonRenderer
}

export interface ButtonRenderer {
    style: string
    text: Text2
    serviceEndpoint?: ServiceEndpoint2
    trackingParams: string
    command?: Command
}

export interface Text2 {
    simpleText?: string
    runs?: Run8[]
}

export interface Run8 {
    text: string
}

export interface ServiceEndpoint2 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata6
    undoFeedbackEndpoint?: UndoFeedbackEndpoint
    signalServiceEndpoint?: SignalServiceEndpoint
}

export interface CommandMetadata6 {
    webCommandMetadata: WebCommandMetadata6
}

export interface WebCommandMetadata6 {
    sendPost: boolean
    apiUrl?: string
}

export interface UndoFeedbackEndpoint {
    undoToken: string
    actions: Action2[]
    contentId: string
}

export interface Action2 {
    clickTrackingParams: string
    undoFeedbackAction: UndoFeedbackAction
}

export interface UndoFeedbackAction {
    hack: boolean
}

export interface SignalServiceEndpoint {
    signal: string
    actions: Action3[]
}

export interface Action3 {
    clickTrackingParams: string
    signalAction: SignalAction
}

export interface SignalAction {
    signal: string
    targetId: string
}

export interface Command {
    clickTrackingParams: string
    commandMetadata: CommandMetadata7
    urlEndpoint: UrlEndpoint
}

export interface CommandMetadata7 {
    webCommandMetadata: WebCommandMetadata7
}

export interface WebCommandMetadata7 {
    url: string
    webPageType: string
    rootVe: number
}

export interface UrlEndpoint {
    url: string
    target: string
}

export interface ShareEntityServiceEndpoint {
    serializedShareEntity: string
    commands: Command2[]
}

export interface Command2 {
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

export interface SignalServiceEndpoint2 {
    signal: string
    actions: Action4[]
}

export interface Action4 {
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
    commandMetadata: CommandMetadata8
    createPlaylistServiceEndpoint: CreatePlaylistServiceEndpoint
}

export interface CommandMetadata8 {
    webCommandMetadata: WebCommandMetadata8
}

export interface WebCommandMetadata8 {
    sendPost: boolean
    apiUrl: string
}

export interface CreatePlaylistServiceEndpoint {
    videoIds: string[]
    params: string
}

export interface PlaylistEditEndpoint {
    playlistId: string
    actions: Action5[]
}

export interface Action5 {
    addedVideoId: string
    action: string
}

export interface AddToPlaylistServiceEndpoint {
    videoId: string
}

export interface MenuServiceItemDownloadRenderer {
    serviceEndpoint: ServiceEndpoint3
    trackingParams: string
}

export interface ServiceEndpoint3 {
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

export interface Accessibility5 {
    accessibilityData: AccessibilityData5
}

export interface AccessibilityData5 {
    label: string
}

export interface ChannelThumbnailSupportedRenderers {
    channelThumbnailWithLinkRenderer: ChannelThumbnailWithLinkRenderer
}

export interface ChannelThumbnailWithLinkRenderer {
    thumbnail: Thumbnail3
    navigationEndpoint: NavigationEndpoint5
    accessibility: Accessibility6
}

export interface Thumbnail3 {
    thumbnails: Thumbnail4[]
}

export interface Thumbnail4 {
    url: string
    width: number
    height: number
}

export interface NavigationEndpoint5 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata9
    browseEndpoint: BrowseEndpoint4
}

export interface CommandMetadata9 {
    webCommandMetadata: WebCommandMetadata9
}

export interface WebCommandMetadata9 {
    url: string
    webPageType: string
    rootVe: number
    apiUrl: string
}

export interface BrowseEndpoint4 {
    browseId: string
    canonicalBaseUrl?: string
}

export interface Accessibility6 {
    accessibilityData: AccessibilityData6
}

export interface AccessibilityData6 {
    label: string
}

export interface ThumbnailOverlay {
    thumbnailOverlayTimeStatusRenderer?: ThumbnailOverlayTimeStatusRenderer
    thumbnailOverlayToggleButtonRenderer?: ThumbnailOverlayToggleButtonRenderer
    thumbnailOverlayNowPlayingRenderer?: ThumbnailOverlayNowPlayingRenderer
    thumbnailOverlayLoadingPreviewRenderer?: ThumbnailOverlayLoadingPreviewRenderer
    thumbnailOverlayEndorsementRenderer?: ThumbnailOverlayEndorsementRenderer
    thumbnailOverlayResumePlaybackRenderer?: ThumbnailOverlayResumePlaybackRenderer
}

export interface ThumbnailOverlayTimeStatusRenderer {
    text: Text3
    style: string
}

export interface Text3 {
    accessibility: Accessibility7
    simpleText: string
}

export interface Accessibility7 {
    accessibilityData: AccessibilityData7
}

export interface AccessibilityData7 {
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
    commandMetadata: CommandMetadata10
    signalServiceEndpoint?: SignalServiceEndpoint3
    playlistEditEndpoint?: PlaylistEditEndpoint2
}

export interface CommandMetadata10 {
    webCommandMetadata: WebCommandMetadata10
}

export interface WebCommandMetadata10 {
    sendPost: boolean
    apiUrl?: string
}

export interface SignalServiceEndpoint3 {
    signal: string
    actions: Action6[]
}

export interface Action6 {
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
    commandMetadata: CommandMetadata11
    createPlaylistServiceEndpoint: CreatePlaylistServiceEndpoint2
}

export interface CommandMetadata11 {
    webCommandMetadata: WebCommandMetadata11
}

export interface WebCommandMetadata11 {
    sendPost: boolean
    apiUrl: string
}

export interface CreatePlaylistServiceEndpoint2 {
    videoIds: string[]
    params: string
}

export interface PlaylistEditEndpoint2 {
    playlistId: string
    actions: Action7[]
}

export interface Action7 {
    addedVideoId: string
    action: string
}

export interface UntoggledAccessibility {
    accessibilityData: AccessibilityData8
}

export interface AccessibilityData8 {
    label: string
}

export interface ToggledAccessibility {
    accessibilityData: AccessibilityData9
}

export interface AccessibilityData9 {
    label: string
}

export interface ToggledServiceEndpoint {
    clickTrackingParams: string
    commandMetadata: CommandMetadata12
    playlistEditEndpoint: PlaylistEditEndpoint3
}

export interface CommandMetadata12 {
    webCommandMetadata: WebCommandMetadata12
}

export interface WebCommandMetadata12 {
    sendPost: boolean
    apiUrl: string
}

export interface PlaylistEditEndpoint3 {
    playlistId: string
    actions: Action8[]
}

export interface Action8 {
    action: string
    removedVideoId: string
}

export interface ThumbnailOverlayNowPlayingRenderer {
    text: Text4
}

export interface Text4 {
    runs: Run9[]
}

export interface Run9 {
    text: string
}

export interface ThumbnailOverlayLoadingPreviewRenderer {
    text: Text5
}

export interface Text5 {
    runs: Run10[]
}

export interface Run10 {
    text: string
}

export interface ThumbnailOverlayEndorsementRenderer {
    text: Text6
    trackingParams: string
}

export interface Text6 {
    runs: Run11[]
}

export interface Run11 {
    text: string
}

export interface ThumbnailOverlayResumePlaybackRenderer {
    percentDurationWatched: number
}

export interface RichThumbnail {
    movingThumbnailRenderer: MovingThumbnailRenderer
}

export interface MovingThumbnailRenderer {
    movingThumbnailDetails: MovingThumbnailDetails
    enableHoveredLogging: boolean
    enableOverlay: boolean
}

export interface MovingThumbnailDetails {
    thumbnails: Thumbnail5[]
    logAsMovingThumbnail: boolean
}

export interface Thumbnail5 {
    url: string
    width: number
    height: number
}

export interface InlinePlaybackEndpoint {
    clickTrackingParams: string
    commandMetadata: CommandMetadata13
    watchEndpoint: WatchEndpoint2
}

export interface CommandMetadata13 {
    webCommandMetadata: WebCommandMetadata13
}

export interface WebCommandMetadata13 {
    url: string
    webPageType: string
    rootVe: number
}

export interface WatchEndpoint2 {
    videoId: string
    playerParams: string
    playerExtraUrlParams: PlayerExtraUrlParam[]
    watchEndpointSupportedOnesieConfig: WatchEndpointSupportedOnesieConfig2
}

export interface PlayerExtraUrlParam {
    key: string
    value: string
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

export interface Avatar {
    decoratedAvatarViewModel: DecoratedAvatarViewModel
}

export interface DecoratedAvatarViewModel {
    avatar: Avatar2
    a11yLabel: string
    rendererContext: RendererContext
}

export interface Avatar2 {
    avatarViewModel: AvatarViewModel
}

export interface AvatarViewModel {
    image: Image
    avatarImageSize: string
}

export interface Image {
    sources: Source[]
}

export interface Source {
    url: string
    width: number
    height: number
}

export interface RendererContext {
    commandContext: CommandContext
}

export interface CommandContext {
    onTap: OnTap
}

export interface OnTap {
    innertubeCommand: InnertubeCommand
}

export interface InnertubeCommand {
    clickTrackingParams: string
    commandMetadata: CommandMetadata14
    browseEndpoint: BrowseEndpoint5
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

export interface BrowseEndpoint5 {
    browseId: string
    canonicalBaseUrl?: string
}

export interface OwnerBadge {
    metadataBadgeRenderer: MetadataBadgeRenderer
}

export interface MetadataBadgeRenderer {
    icon: Icon2
    style: string
    tooltip: string
    trackingParams: string
    accessibilityData: AccessibilityData10
}

export interface Icon2 {
    iconType: string
}

export interface AccessibilityData10 {
    label: string
}

export interface RadioRenderer {
    playlistId: string
    title: Title2
    thumbnail: Thumbnail6
    videoCountText: VideoCountText
    navigationEndpoint: NavigationEndpoint6
    trackingParams: string
    videos: Video[]
    thumbnailText: ThumbnailText
    longBylineText: LongBylineText2
    menu: Menu2
    thumbnailOverlays: ThumbnailOverlay2[]
    videoCountShortText: VideoCountShortText
    thumbnailRenderer: ThumbnailRenderer
}

export interface Title2 {
    simpleText: string
}

export interface Thumbnail6 {
    thumbnails: Thumbnail7[]
    sampledThumbnailColor: SampledThumbnailColor
    darkColorPalette: DarkColorPalette
    vibrantColorPalette: VibrantColorPalette
}

export interface Thumbnail7 {
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

export interface VideoCountText {
    runs: Run12[]
}

export interface Run12 {
    text: string
}

export interface NavigationEndpoint6 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata15
    watchEndpoint: WatchEndpoint3
}

export interface CommandMetadata15 {
    webCommandMetadata: WebCommandMetadata15
}

export interface WebCommandMetadata15 {
    url: string
    webPageType: string
    rootVe: number
}

export interface WatchEndpoint3 {
    videoId: string
    playlistId: string
    params: string
    continuePlayback: boolean
    loggingContext: LoggingContext
    watchEndpointSupportedOnesieConfig: WatchEndpointSupportedOnesieConfig3
}

export interface LoggingContext {
    vssLoggingContext: VssLoggingContext
}

export interface VssLoggingContext {
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

export interface Video {
    childVideoRenderer: ChildVideoRenderer
}

export interface ChildVideoRenderer {
    title: Title3
    navigationEndpoint: NavigationEndpoint7
    lengthText: LengthText2
    videoId: string
}

export interface Title3 {
    simpleText: string
}

export interface NavigationEndpoint7 {
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
    params: string
    loggingContext: LoggingContext2
    watchEndpointSupportedOnesieConfig: WatchEndpointSupportedOnesieConfig4
}

export interface LoggingContext2 {
    vssLoggingContext: VssLoggingContext2
}

export interface VssLoggingContext2 {
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

export interface LengthText2 {
    accessibility: Accessibility8
    simpleText: string
}

export interface Accessibility8 {
    accessibilityData: AccessibilityData11
}

export interface AccessibilityData11 {
    label: string
}

export interface ThumbnailText {
    runs: Run13[]
}

export interface Run13 {
    text: string
    bold?: boolean
}

export interface LongBylineText2 {
    simpleText: string
}

export interface Menu2 {
    menuRenderer: MenuRenderer2
}

export interface MenuRenderer2 {
    items: Item3[]
    trackingParams: string
    accessibility: Accessibility9
}

export interface Item3 {
    menuServiceItemRenderer: MenuServiceItemRenderer2
}

export interface MenuServiceItemRenderer2 {
    text: Text7
    icon: Icon3
    serviceEndpoint: ServiceEndpoint4
    trackingParams: string
}

export interface Text7 {
    runs: Run14[]
}

export interface Run14 {
    text: string
}

export interface Icon3 {
    iconType: string
}

export interface ServiceEndpoint4 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata17
    feedbackEndpoint: FeedbackEndpoint2
}

export interface CommandMetadata17 {
    webCommandMetadata: WebCommandMetadata17
}

export interface WebCommandMetadata17 {
    sendPost: boolean
    apiUrl: string
}

export interface FeedbackEndpoint2 {
    feedbackToken: string
    uiActions: UiActions2
    actions: Action9[]
    contentId: string
}

export interface UiActions2 {
    hideEnclosingContainer: boolean
}

export interface Action9 {
    clickTrackingParams: string
    replaceEnclosingAction: ReplaceEnclosingAction2
}

export interface ReplaceEnclosingAction2 {
    item: Item4
}

export interface Item4 {
    notificationTextRenderer: NotificationTextRenderer
}

export interface NotificationTextRenderer {
    successResponseText: SuccessResponseText
    trackingParams: string
}

export interface SuccessResponseText {
    runs: Run15[]
}

export interface Run15 {
    text: string
}

export interface Accessibility9 {
    accessibilityData: AccessibilityData12
}

export interface AccessibilityData12 {
    label: string
}

export interface ThumbnailOverlay2 {
    thumbnailOverlayBottomPanelRenderer?: ThumbnailOverlayBottomPanelRenderer
    thumbnailOverlayHoverTextRenderer?: ThumbnailOverlayHoverTextRenderer
    thumbnailOverlayNowPlayingRenderer?: ThumbnailOverlayNowPlayingRenderer2
}

export interface ThumbnailOverlayBottomPanelRenderer {
    text: Text8
    icon: Icon4
}

export interface Text8 {
    simpleText: string
}

export interface Icon4 {
    iconType: string
}

export interface ThumbnailOverlayHoverTextRenderer {
    text: Text9
    icon: Icon5
}

export interface Text9 {
    runs: Run16[]
}

export interface Run16 {
    text: string
}

export interface Icon5 {
    iconType: string
}

export interface ThumbnailOverlayNowPlayingRenderer2 {
    text: Text10
}

export interface Text10 {
    runs: Run17[]
}

export interface Run17 {
    text: string
}

export interface VideoCountShortText {
    runs: Run18[]
}

export interface Run18 {
    text: string
}

export interface ThumbnailRenderer {
    playlistVideoThumbnailRenderer: PlaylistVideoThumbnailRenderer
}

export interface PlaylistVideoThumbnailRenderer {
    thumbnail: Thumbnail8
    trackingParams: string
}

export interface Thumbnail8 {
    thumbnails: Thumbnail9[]
    sampledThumbnailColor: SampledThumbnailColor2
    darkColorPalette: DarkColorPalette2
    vibrantColorPalette: VibrantColorPalette2
}

export interface Thumbnail9 {
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

export interface RichSectionRenderer {
    content: Content2
    trackingParams: string
}

export interface Content2 {
    richShelfRenderer: RichShelfRenderer
}

export interface RichShelfRenderer {
    title: Title4
    contents: Content3[]
    trackingParams: string
    menu: Menu3
    showMoreButton: ShowMoreButton
    isExpanded: boolean
    icon: Icon8
    isTopDividerHidden: boolean
    isBottomDividerHidden: boolean
    showLessButton: ShowLessButton
    responsiveContainerConfiguration: ResponsiveContainerConfiguration
}

export interface Title4 {
    runs: Run19[]
}

export interface Run19 {
    text: string
}

export interface Content3 {
    richItemRenderer: RichItemRenderer2
}

export interface RichItemRenderer2 {
    content: Content4
    trackingParams: string
}

export interface Content4 {
    shortsLockupViewModel: ShortsLockupViewModel
}

export interface ShortsLockupViewModel {
    entityId: string
    accessibilityText: string
    thumbnail: Thumbnail10
    onTap: OnTap2
    inlinePlayerData: InlinePlayerData
    menuOnTap: MenuOnTap
    indexInCollection: number
    menuOnTapA11yLabel: string
    overlayMetadata: OverlayMetadata
    loggingDirectives: LoggingDirectives2
}

export interface Thumbnail10 {
    sources: Source2[]
}

export interface Source2 {
    url: string
    width: number
    height: number
}

export interface OnTap2 {
    innertubeCommand: InnertubeCommand2
}

export interface InnertubeCommand2 {
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
    loggingContext: LoggingContext3
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

export interface LoggingContext3 {
    vssLoggingContext: VssLoggingContext3
    qoeLoggingContext: QoeLoggingContext
}

export interface VssLoggingContext3 {
    serializedContextData: string
}

export interface QoeLoggingContext {
    serializedContextData: string
}

export interface InlinePlayerData {
    onVisible: OnVisible
}

export interface OnVisible {
    innertubeCommand: InnertubeCommand3
}

export interface InnertubeCommand3 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata19
    watchEndpoint: WatchEndpoint5
}

export interface CommandMetadata19 {
    webCommandMetadata: WebCommandMetadata19
}

export interface WebCommandMetadata19 {
    url: string
    webPageType: string
    rootVe: number
}

export interface WatchEndpoint5 {
    videoId: string
    playerParams: string
    playerExtraUrlParams: PlayerExtraUrlParam2[]
    watchEndpointSupportedOnesieConfig: WatchEndpointSupportedOnesieConfig5
}

export interface PlayerExtraUrlParam2 {
    key: string
    value: string
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

export interface MenuOnTap {
    innertubeCommand: InnertubeCommand4
}

export interface InnertubeCommand4 {
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
    rendererContext: RendererContext2
}

export interface Title5 {
    content: string
}

export interface LeadingImage {
    sources: Source3[]
}

export interface Source3 {
    clientResource: ClientResource
}

export interface ClientResource {
    imageName: string
}

export interface RendererContext2 {
    loggingContext?: LoggingContext4
    commandContext: CommandContext2
}

export interface LoggingContext4 {
    loggingDirectives: LoggingDirectives
}

export interface LoggingDirectives {
    trackingParams: string
    enableDisplayloggerExperiment: boolean
}

export interface CommandContext2 {
    onTap: OnTap3
}

export interface OnTap3 {
    innertubeCommand: InnertubeCommand5
}

export interface InnertubeCommand5 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata20
    signalServiceEndpoint?: SignalServiceEndpoint4
    getReportFormEndpoint?: GetReportFormEndpoint2
    feedbackEndpoint?: FeedbackEndpoint3
    userFeedbackEndpoint?: UserFeedbackEndpoint
}

export interface CommandMetadata20 {
    webCommandMetadata: WebCommandMetadata20
}

export interface WebCommandMetadata20 {
    sendPost?: boolean
    apiUrl?: string
    ignoreNavigation?: boolean
}

export interface SignalServiceEndpoint4 {
    signal: string
    actions: Action10[]
}

export interface Action10 {
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
    commandMetadata: CommandMetadata21
    createPlaylistServiceEndpoint: CreatePlaylistServiceEndpoint3
}

export interface CommandMetadata21 {
    webCommandMetadata: WebCommandMetadata21
}

export interface WebCommandMetadata21 {
    sendPost: boolean
    apiUrl: string
}

export interface CreatePlaylistServiceEndpoint3 {
    videoIds: string[]
    params: string
}

export interface GetReportFormEndpoint2 {
    params: string
}

export interface FeedbackEndpoint3 {
    feedbackToken: string
    actions: Action11[]
    contentId: string
}

export interface Action11 {
    clickTrackingParams: string
    replaceEnclosingAction: ReplaceEnclosingAction3
}

export interface ReplaceEnclosingAction3 {
    item: Item5
}

export interface Item5 {
    notificationMultiActionRenderer: NotificationMultiActionRenderer2
}

export interface NotificationMultiActionRenderer2 {
    responseText: ResponseText2
    buttons: Button2[]
    trackingParams: string
}

export interface ResponseText2 {
    runs: Run20[]
}

export interface Run20 {
    text: string
}

export interface Button2 {
    buttonRenderer: ButtonRenderer2
}

export interface ButtonRenderer2 {
    style: string
    text: Text11
    serviceEndpoint: ServiceEndpoint5
    trackingParams: string
}

export interface Text11 {
    runs: Run21[]
}

export interface Run21 {
    text: string
}

export interface ServiceEndpoint5 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata22
    undoFeedbackEndpoint: UndoFeedbackEndpoint2
}

export interface CommandMetadata22 {
    webCommandMetadata: WebCommandMetadata22
}

export interface WebCommandMetadata22 {
    sendPost: boolean
    apiUrl: string
}

export interface UndoFeedbackEndpoint2 {
    undoToken: string
    actions: Action12[]
    contentId: string
}

export interface Action12 {
    clickTrackingParams: string
    undoFeedbackAction: UndoFeedbackAction2
}

export interface UndoFeedbackAction2 {
    hack: boolean
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

export interface Menu3 {
    menuRenderer: MenuRenderer3
}

export interface MenuRenderer3 {
    trackingParams: string
    topLevelButtons: TopLevelButton[]
}

export interface TopLevelButton {
    buttonRenderer: ButtonRenderer3
}

export interface ButtonRenderer3 {
    style: string
    size: string
    isDisabled: boolean
    serviceEndpoint: ServiceEndpoint6
    icon: Icon6
    tooltip: string
    trackingParams: string
    accessibilityData: AccessibilityData13
}

export interface ServiceEndpoint6 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata23
    feedbackEndpoint: FeedbackEndpoint4
}

export interface CommandMetadata23 {
    webCommandMetadata: WebCommandMetadata23
}

export interface WebCommandMetadata23 {
    sendPost: boolean
    apiUrl: string
}

export interface FeedbackEndpoint4 {
    feedbackToken: string
    uiActions: UiActions3
    actions: Action13[]
}

export interface UiActions3 {
    hideEnclosingContainer: boolean
}

export interface Action13 {
    clickTrackingParams: string
    replaceEnclosingAction: ReplaceEnclosingAction4
}

export interface ReplaceEnclosingAction4 {
    item: Item6
}

export interface Item6 {
    notificationMultiActionRenderer: NotificationMultiActionRenderer3
}

export interface NotificationMultiActionRenderer3 {
    responseText: ResponseText3
    buttons: Button3[]
    trackingParams: string
}

export interface ResponseText3 {
    runs: Run22[]
}

export interface Run22 {
    text: string
}

export interface Button3 {
    buttonRenderer: ButtonRenderer4
}

export interface ButtonRenderer4 {
    style: string
    text: Text12
    serviceEndpoint: ServiceEndpoint7
    trackingParams: string
}

export interface Text12 {
    simpleText: string
}

export interface ServiceEndpoint7 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata24
    undoFeedbackEndpoint: UndoFeedbackEndpoint3
}

export interface CommandMetadata24 {
    webCommandMetadata: WebCommandMetadata24
}

export interface WebCommandMetadata24 {
    sendPost: boolean
    apiUrl: string
}

export interface UndoFeedbackEndpoint3 {
    undoToken: string
    actions: Action14[]
}

export interface Action14 {
    clickTrackingParams: string
    undoFeedbackAction: UndoFeedbackAction3
}

export interface UndoFeedbackAction3 {
    hack: boolean
}

export interface Icon6 {
    iconType: string
}

export interface AccessibilityData13 {
    accessibilityData: AccessibilityData14
}

export interface AccessibilityData14 {
    label: string
}

export interface ShowMoreButton {
    buttonRenderer: ButtonRenderer5
}

export interface ButtonRenderer5 {
    style: string
    size: string
    text: Text13
    icon: Icon7
    accessibility: Accessibility10
    trackingParams: string
}

export interface Text13 {
    runs: Run23[]
}

export interface Run23 {
    text: string
}

export interface Icon7 {
    iconType: string
}

export interface Accessibility10 {
    label: string
}

export interface Icon8 {
    iconType: string
}

export interface ShowLessButton {
    buttonRenderer: ButtonRenderer6
}

export interface ButtonRenderer6 {
    style: string
    size: string
    text: Text14
    icon: Icon9
    accessibility: Accessibility11
    trackingParams: string
}

export interface Text14 {
    runs: Run24[]
}

export interface Run24 {
    text: string
}

export interface Icon9 {
    iconType: string
}

export interface Accessibility11 {
    label: string
}

export interface ResponsiveContainerConfiguration {
    enableContentSpecificAspectRatio: boolean
}

export interface ContinuationItemRenderer {
    trigger: string
    continuationEndpoint: ContinuationEndpoint
    ghostCards: GhostCards
}

export interface ContinuationEndpoint {
    clickTrackingParams: string
    commandMetadata: CommandMetadata25
    continuationCommand: ContinuationCommand
}

export interface CommandMetadata25 {
    webCommandMetadata: WebCommandMetadata25
}

export interface WebCommandMetadata25 {
    sendPost: boolean
    apiUrl: string
}

export interface ContinuationCommand {
    token: string
    request: string
}

export interface GhostCards {
    ghostGridRenderer: GhostGridRenderer
}

export interface GhostGridRenderer {
    rows: number
}
