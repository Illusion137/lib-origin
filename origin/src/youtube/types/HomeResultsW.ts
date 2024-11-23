export interface HomeResultsW {
    responseContext: ResponseContext
    contents: Contents
    header: Header2
    trackingParams: string
    topbar: Topbar
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
    tabIdentifier: string
    trackingParams: string
}

export interface Content {
    richGridRenderer: RichGridRenderer
}

export interface RichGridRenderer {
    contents: Content2[]
    trackingParams: string
    header: Header
    targetId: string
    reflowOptions: ReflowOptions
}

export interface Content2 {
    richItemRenderer?: RichItemRenderer
    richSectionRenderer?: RichSectionRenderer
    continuationItemRenderer?: ContinuationItemRenderer
}

export interface RichItemRenderer {
    content: Content3
    trackingParams: string
    rowIndex: number
    colIndex: number
}

export interface Content3 {
    videoRenderer: VideoRenderer
}

export interface VideoRenderer {
    videoId: string
    thumbnail: Thumbnail
    title: Title
    descriptionSnippet?: DescriptionSnippet
    longBylineText: LongBylineText
    publishedTimeText: PublishedTimeText
    lengthText: LengthText
    viewCountText: ViewCountText
    navigationEndpoint: NavigationEndpoint2
    ownerBadges?: OwnerBadge[]
    ownerText: OwnerText
    shortBylineText: ShortBylineText
    trackingParams: string
    showActionMenu: boolean
    shortViewCountText: ShortViewCountText
    menu: Menu
    channelThumbnailSupportedRenderers: ChannelThumbnailSupportedRenderers
    thumbnailOverlays: ThumbnailOverlay[]
    richThumbnail?: RichThumbnail
    inlinePlaybackEndpoint?: InlinePlaybackEndpoint
    avatar: Avatar
    owner: Owner
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

export interface OwnerBadge {
    metadataBadgeRenderer: MetadataBadgeRenderer
}

export interface MetadataBadgeRenderer {
    icon: Icon
    style: string
    tooltip: string
    trackingParams: string
    accessibilityData: AccessibilityData3
}

export interface Icon {
    iconType: string
}

export interface AccessibilityData3 {
    label: string
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
    accessibilityData: AccessibilityData4
}

export interface AccessibilityData4 {
    label: string
}

export interface Menu {
    menuRenderer: MenuRenderer
}

export interface MenuRenderer {
    items: Item[]
    trackingParams: string
    accessibility: Accessibility5
    targetId?: string
}

export interface Item {
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
    runs: Run6[]
}

export interface Run6 {
    text: string
}

export interface Icon2 {
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
    accessibilityData: AccessibilityData5
}

export interface AccessibilityData5 {
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
    accessibilityData: AccessibilityData6
}

export interface AccessibilityData6 {
    label: string
}

export interface ChannelThumbnailSupportedRenderers {
    channelThumbnailWithLinkRenderer: ChannelThumbnailWithLinkRenderer
}

export interface ChannelThumbnailWithLinkRenderer {
    thumbnail: Thumbnail3
    navigationEndpoint: NavigationEndpoint5
    accessibility: Accessibility6
    title: string
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
    accessibilityData: AccessibilityData7
}

export interface AccessibilityData7 {
    label: string
}

export interface ThumbnailOverlay {
    thumbnailOverlayTimeStatusRenderer?: ThumbnailOverlayTimeStatusRenderer
    thumbnailOverlayToggleButtonRenderer?: ThumbnailOverlayToggleButtonRenderer
    thumbnailOverlayNowPlayingRenderer?: ThumbnailOverlayNowPlayingRenderer
    thumbnailOverlayLoadingPreviewRenderer?: ThumbnailOverlayLoadingPreviewRenderer
    thumbnailOverlayEndorsementRenderer?: ThumbnailOverlayEndorsementRenderer
    thumbnailOverlayInlineUnplayableRenderer?: ThumbnailOverlayInlineUnplayableRenderer
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
    accessibilityData: AccessibilityData8
}

export interface AccessibilityData8 {
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
    accessibilityData: AccessibilityData9
}

export interface AccessibilityData9 {
    label: string
}

export interface ToggledAccessibility {
    accessibilityData: AccessibilityData10
}

export interface AccessibilityData10 {
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

export interface ThumbnailOverlayInlineUnplayableRenderer {
    text: Text7
    icon: Icon3
}

export interface Text7 {
    runs: Run12[]
}

export interface Run12 {
    text: string
}

export interface Icon3 {
    iconType: string
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

export interface Owner {
    thumbnail: Thumbnail6
    navigationEndpoint: NavigationEndpoint6
    accessibility: Accessibility8
    title: string
}

export interface Thumbnail6 {
    thumbnails: Thumbnail7[]
}

export interface Thumbnail7 {
    url: string
    width: number
    height: number
}

export interface NavigationEndpoint6 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata15
    browseEndpoint: BrowseEndpoint6
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

export interface BrowseEndpoint6 {
    browseId: string
    canonicalBaseUrl?: string
}

export interface Accessibility8 {
    accessibilityData: AccessibilityData11
}

export interface AccessibilityData11 {
    label: string
}

export interface RichSectionRenderer {
    content: Content4
    trackingParams: string
}

export interface Content4 {
    richShelfRenderer: RichShelfRenderer
}

export interface RichShelfRenderer {
    title: Title2
    contents: Content5[]
    trackingParams: string
    subtitle?: Subtitle
    thumbnail?: Thumbnail11
    endpoint?: Endpoint
    menu: Menu2
    showMoreButton: ShowMoreButton
    isExpanded: boolean
    isTopDividerHidden: boolean
    isBottomDividerHidden: boolean
    showLessButton: ShowLessButton
    responsiveContainerConfiguration: ResponsiveContainerConfiguration
    rowIndex: number
    icon?: Icon8
}

export interface Title2 {
    runs: Run13[]
}

export interface Run13 {
    text: string
}

export interface Content5 {
    richItemRenderer: RichItemRenderer2
}

export interface RichItemRenderer2 {
    content: Content6
    trackingParams: string
    colIndex: number
    rowIndex: number
}

export interface Content6 {
    miniGameCardViewModel?: MiniGameCardViewModel
    shortsLockupViewModel?: ShortsLockupViewModel
}

export interface MiniGameCardViewModel {
    image: Image2
    title: string
    genre: string
    onTap: OnTap2
    accessibilityText: string
    overflowButton: OverflowButton
    layout: string
    colorPalette: ColorPalette
    actionButton: ActionButton2
    style: string
    trackingParams: string
    inlinePlaybackExperiments: InlinePlaybackExperiments
    indexInShelf: number
    entityRedesignExperiments: EntityRedesignExperiments
    responsiveNumVisibleItems: number
    loggingDirectives: LoggingDirectives4
}

export interface Image2 {
    sources: Source2[]
    contentMode: string
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
    commandMetadata: CommandMetadata16
    browseEndpoint: BrowseEndpoint7
}

export interface CommandMetadata16 {
    webCommandMetadata: WebCommandMetadata16
}

export interface WebCommandMetadata16 {
    url: string
    webPageType: string
    rootVe: number
    apiUrl: string
}

export interface BrowseEndpoint7 {
    browseId: string
    params: string
}

export interface OverflowButton {
    buttonViewModel: ButtonViewModel
}

export interface ButtonViewModel {
    iconName: string
    onTap: OnTap3
    accessibilityText: string
    style: string
    trackingParams: string
    buttonSize: string
    state: string
    customFontColor: number
}

export interface OnTap3 {
    innertubeCommand: InnertubeCommand3
}

export interface InnertubeCommand3 {
    clickTrackingParams: string
    openPopupAction: OpenPopupAction2
}

export interface OpenPopupAction2 {
    popup: Popup2
    popupType: string
}

export interface Popup2 {
    menuPopupRenderer: MenuPopupRenderer
}

export interface MenuPopupRenderer {
    items: Item3[]
}

export interface Item3 {
    menuServiceItemRenderer: MenuServiceItemRenderer2
}

export interface MenuServiceItemRenderer2 {
    text: Text8
    icon: Icon4
    serviceEndpoint?: ServiceEndpoint4
    trackingParams: string
    loggingDirectives: LoggingDirectives
    command?: Command5
}

export interface Text8 {
    runs: Run14[]
}

export interface Run14 {
    text: string
}

export interface Icon4 {
    iconType: string
}

export interface ServiceEndpoint4 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata17
    feedbackEndpoint?: FeedbackEndpoint2
    shareEntityServiceEndpoint?: ShareEntityServiceEndpoint2
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
    actions: Action9[]
}

export interface Action9 {
    clickTrackingParams: string
    openPopupAction: OpenPopupAction3
}

export interface OpenPopupAction3 {
    popup: Popup3
    popupType: string
    durationHintMs: number
}

export interface Popup3 {
    notificationActionRenderer: NotificationActionRenderer
}

export interface NotificationActionRenderer {
    responseText: ResponseText2
    actionButton: ActionButton
    trackingParams: string
}

export interface ResponseText2 {
    runs: Run15[]
}

export interface Run15 {
    text: string
}

export interface ActionButton {
    buttonRenderer: ButtonRenderer2
}

export interface ButtonRenderer2 {
    style: string
    size: string
    isDisabled: boolean
    text: Text9
    trackingParams: string
    command: Command3
}

export interface Text9 {
    runs: Run16[]
}

export interface Run16 {
    text: string
}

export interface Command3 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata18
    browseEndpoint: BrowseEndpoint8
}

export interface CommandMetadata18 {
    webCommandMetadata: WebCommandMetadata18
}

export interface WebCommandMetadata18 {
    url: string
    webPageType: string
    rootVe: number
    apiUrl: string
}

export interface BrowseEndpoint8 {
    browseId: string
}

export interface ShareEntityServiceEndpoint2 {
    serializedShareEntity: string
    commands: Command4[]
}

export interface Command4 {
    clickTrackingParams: string
    openPopupAction: OpenPopupAction4
}

export interface OpenPopupAction4 {
    popup: Popup4
    popupType: string
    beReused: boolean
}

export interface Popup4 {
    unifiedSharePanelRenderer: UnifiedSharePanelRenderer2
}

export interface UnifiedSharePanelRenderer2 {
    trackingParams: string
    showLoadingSpinner: boolean
}

export interface LoggingDirectives {
    trackingParams: string
    enableDisplayloggerExperiment: boolean
}

export interface Command5 {
    clickTrackingParams: string
    commandMetadata?: CommandMetadata19
    userFeedbackEndpoint?: UserFeedbackEndpoint
    feedbackEndpoint?: FeedbackEndpoint3
    openPopupAction?: OpenPopupAction5
}

export interface CommandMetadata19 {
    webCommandMetadata: WebCommandMetadata19
}

export interface WebCommandMetadata19 {
    ignoreNavigation?: boolean
    sendPost?: boolean
    apiUrl?: string
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

export interface FeedbackEndpoint3 {
    feedbackToken: string
    actions: Action10[]
}

export interface Action10 {
    clickTrackingParams: string
    replaceEnclosingAction: ReplaceEnclosingAction2
}

export interface ReplaceEnclosingAction2 {
    item: Item4
}

export interface Item4 {
    notificationMultiActionRenderer: NotificationMultiActionRenderer2
}

export interface NotificationMultiActionRenderer2 {
    responseText: ResponseText3
    buttons: Button2[]
    trackingParams: string
}

export interface ResponseText3 {
    runs: Run17[]
    accessibility: Accessibility9
}

export interface Run17 {
    text: string
}

export interface Accessibility9 {
    accessibilityData: AccessibilityData12
}

export interface AccessibilityData12 {
    label: string
}

export interface Button2 {
    buttonRenderer: ButtonRenderer3
}

export interface ButtonRenderer3 {
    style: string
    text: Text10
    serviceEndpoint: ServiceEndpoint5
    trackingParams: string
}

export interface Text10 {
    simpleText: string
}

export interface ServiceEndpoint5 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata20
    undoFeedbackEndpoint: UndoFeedbackEndpoint2
}

export interface CommandMetadata20 {
    webCommandMetadata: WebCommandMetadata20
}

export interface WebCommandMetadata20 {
    sendPost: boolean
    apiUrl: string
}

export interface UndoFeedbackEndpoint2 {
    undoToken: string
    actions: Action11[]
}

export interface Action11 {
    clickTrackingParams: string
    undoFeedbackAction: UndoFeedbackAction2
}

export interface UndoFeedbackAction2 {
    hack: boolean
}

export interface OpenPopupAction5 {
    popup: Popup5
    popupType: string
}

export interface Popup5 {
    miniAppGameInfoDialogViewModel: MiniAppGameInfoDialogViewModel
}

export interface MiniAppGameInfoDialogViewModel {
    dialogTitle: string
    closeButton: CloseButton
    image: Image3
    title: string
    primaryGenre: string
    description: string
    infoRow: InfoRow[]
    loggingDirectives: LoggingDirectives2
}

export interface CloseButton {
    buttonViewModel: ButtonViewModel2
}

export interface ButtonViewModel2 {
    title: string
    onTap: OnTap4
    accessibilityText: string
    trackingParams: string
    type: string
}

export interface OnTap4 {
    innertubeCommand: InnertubeCommand4
}

export interface InnertubeCommand4 {
    clickTrackingParams: string
    signalAction: SignalAction2
}

export interface SignalAction2 {
    signal: string
}

export interface Image3 {
    sources: Source3[]
}

export interface Source3 {
    url: string
    width: number
    height: number
}

export interface InfoRow {
    label: string
    value: string
}

export interface LoggingDirectives2 {
    trackingParams: string
    visibility: Visibility
    enableDisplayloggerExperiment: boolean
}

export interface Visibility {
    types: string
}

export interface ColorPalette {
    textPrimaryColor: number
    sectionTwoColor: number
    sectionFourColor: number
}

export interface ActionButton2 {
    buttonViewModel: ButtonViewModel3
}

export interface ButtonViewModel3 {
    title: string
    onTap: OnTap5
    style: string
    trackingParams: string
    state: string
    customBackgroundColor: number
    customFontColor: number
    loggingDirectives: LoggingDirectives3
}

export interface OnTap5 {
    innertubeCommand: InnertubeCommand5
}

export interface InnertubeCommand5 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata21
    browseEndpoint: BrowseEndpoint9
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

export interface BrowseEndpoint9 {
    browseId: string
    params: string
}

export interface LoggingDirectives3 {
    trackingParams: string
    visibility: Visibility2
    enableDisplayloggerExperiment: boolean
}

export interface Visibility2 {
    types: string
}

export interface InlinePlaybackExperiments {
    enableSimplifiedAndroidUi: boolean
    disableCinematicContainer: boolean
    enableSquaredThumbnails: boolean
    enableLoggingDirectivesForAndroidInlinePlayback: boolean
}

export interface EntityRedesignExperiments {
    changePlayablesLayoutWithCta: boolean
    changePlayablesLayoutWithContentTypeBadge: boolean
    enable11ThumbnailOnHomeShelves: boolean
    enable169ThumbnailOnHomeShelves: boolean
    changePlayablesLayoutWithCtaBelowMetadata: boolean
    enableResponsiveWidth: boolean
    enableGameConsoleWithCinematicContainer: boolean
    enableGameConsoleWithSubtleColor: boolean
}

export interface LoggingDirectives4 {
    trackingParams: string
    visibility: Visibility3
    gestures: Gestures
    enableDisplayloggerExperiment: boolean
}

export interface Visibility3 {
    types: string
}

export interface Gestures {
    types: string
}

export interface ShortsLockupViewModel {
    entityId: string
    accessibilityText: string
    thumbnail: Thumbnail8
    onTap: OnTap6
    inlinePlayerData: InlinePlayerData
    menuOnTap: MenuOnTap
    indexInCollection: number
    menuOnTapA11yLabel: string
    overlayMetadata: OverlayMetadata
    loggingDirectives: LoggingDirectives6
}

export interface Thumbnail8 {
    sources: Source4[]
    contentMode: string
}

export interface Source4 {
    url: string
    width: number
    height: number
}

export interface OnTap6 {
    innertubeCommand: InnertubeCommand6
}

export interface InnertubeCommand6 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata22
    reelWatchEndpoint: ReelWatchEndpoint
}

export interface CommandMetadata22 {
    webCommandMetadata: WebCommandMetadata22
}

export interface WebCommandMetadata22 {
    url: string
    webPageType: string
    rootVe: number
}

export interface ReelWatchEndpoint {
    videoId: string
    playerParams: string
    thumbnail: Thumbnail9
    overlay: Overlay
    params: string
    sequenceProvider: string
    sequenceParams: string
    loggingContext: LoggingContext
    ustreamerConfig: string
}

export interface Thumbnail9 {
    thumbnails: Thumbnail10[]
    isOriginalAspectRatio: boolean
}

export interface Thumbnail10 {
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

export interface LoggingContext {
    vssLoggingContext: VssLoggingContext
    qoeLoggingContext: QoeLoggingContext
}

export interface VssLoggingContext {
    serializedContextData: string
}

export interface QoeLoggingContext {
    serializedContextData: string
}

export interface InlinePlayerData {
    onVisible: OnVisible
}

export interface OnVisible {
    innertubeCommand: InnertubeCommand7
}

export interface InnertubeCommand7 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata23
    watchEndpoint: WatchEndpoint3
}

export interface CommandMetadata23 {
    webCommandMetadata: WebCommandMetadata23
}

export interface WebCommandMetadata23 {
    url: string
    webPageType: string
    rootVe: number
}

export interface WatchEndpoint3 {
    videoId: string
    playerParams: string
    playerExtraUrlParams: PlayerExtraUrlParam2[]
    watchEndpointSupportedOnesieConfig: WatchEndpointSupportedOnesieConfig3
}

export interface PlayerExtraUrlParam2 {
    key: string
    value: string
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

export interface MenuOnTap {
    innertubeCommand: InnertubeCommand8
}

export interface InnertubeCommand8 {
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
    content: Content7
}

export interface Content7 {
    listViewModel: ListViewModel
}

export interface ListViewModel {
    listItems: ListItem[]
}

export interface ListItem {
    listItemViewModel: ListItemViewModel
}

export interface ListItemViewModel {
    title: Title3
    leadingImage: LeadingImage
    rendererContext: RendererContext2
}

export interface Title3 {
    content: string
}

export interface LeadingImage {
    sources: Source5[]
}

export interface Source5 {
    clientResource: ClientResource
}

export interface ClientResource {
    imageName: string
}

export interface RendererContext2 {
    loggingContext?: LoggingContext2
    commandContext: CommandContext2
}

export interface LoggingContext2 {
    loggingDirectives: LoggingDirectives5
}

export interface LoggingDirectives5 {
    trackingParams: string
    enableDisplayloggerExperiment: boolean
}

export interface CommandContext2 {
    onTap: OnTap7
}

export interface OnTap7 {
    innertubeCommand: InnertubeCommand9
}

export interface InnertubeCommand9 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata24
    signalServiceEndpoint?: SignalServiceEndpoint4
    getReportFormEndpoint?: GetReportFormEndpoint2
    feedbackEndpoint?: FeedbackEndpoint4
    userFeedbackEndpoint?: UserFeedbackEndpoint2
}

export interface CommandMetadata24 {
    webCommandMetadata: WebCommandMetadata24
}

export interface WebCommandMetadata24 {
    sendPost?: boolean
    apiUrl?: string
    ignoreNavigation?: boolean
}

export interface SignalServiceEndpoint4 {
    signal: string
    actions: Action12[]
}

export interface Action12 {
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
    commandMetadata: CommandMetadata25
    createPlaylistServiceEndpoint: CreatePlaylistServiceEndpoint3
}

export interface CommandMetadata25 {
    webCommandMetadata: WebCommandMetadata25
}

export interface WebCommandMetadata25 {
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

export interface FeedbackEndpoint4 {
    feedbackToken: string
    actions: Action13[]
    contentId: string
}

export interface Action13 {
    clickTrackingParams: string
    replaceEnclosingAction: ReplaceEnclosingAction3
}

export interface ReplaceEnclosingAction3 {
    item: Item5
}

export interface Item5 {
    notificationMultiActionRenderer: NotificationMultiActionRenderer3
}

export interface NotificationMultiActionRenderer3 {
    responseText: ResponseText4
    buttons: Button3[]
    trackingParams: string
}

export interface ResponseText4 {
    runs: Run18[]
}

export interface Run18 {
    text: string
}

export interface Button3 {
    buttonRenderer: ButtonRenderer4
}

export interface ButtonRenderer4 {
    style: string
    text: Text11
    serviceEndpoint: ServiceEndpoint6
    trackingParams: string
}

export interface Text11 {
    runs: Run19[]
}

export interface Run19 {
    text: string
}

export interface ServiceEndpoint6 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata26
    undoFeedbackEndpoint: UndoFeedbackEndpoint3
}

export interface CommandMetadata26 {
    webCommandMetadata: WebCommandMetadata26
}

export interface WebCommandMetadata26 {
    sendPost: boolean
    apiUrl: string
}

export interface UndoFeedbackEndpoint3 {
    undoToken: string
    actions: Action14[]
    contentId: string
}

export interface Action14 {
    clickTrackingParams: string
    undoFeedbackAction: UndoFeedbackAction3
}

export interface UndoFeedbackAction3 {
    hack: boolean
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

export interface LoggingDirectives6 {
    trackingParams: string
    visibility: Visibility4
    enableDisplayloggerExperiment: boolean
}

export interface Visibility4 {
    types: string
}

export interface Subtitle {
    runs: Run20[]
}

export interface Run20 {
    text: string
}

export interface Thumbnail11 {
    thumbnails: Thumbnail12[]
}

export interface Thumbnail12 {
    url: string
    width: number
    height: number
}

export interface Endpoint {
    clickTrackingParams: string
    commandMetadata: CommandMetadata27
    browseEndpoint: BrowseEndpoint10
}

export interface CommandMetadata27 {
    webCommandMetadata: WebCommandMetadata27
}

export interface WebCommandMetadata27 {
    url: string
    webPageType: string
    rootVe: number
    apiUrl: string
}

export interface BrowseEndpoint10 {
    browseId: string
}

export interface Menu2 {
    menuRenderer: MenuRenderer2
}

export interface MenuRenderer2 {
    trackingParams: string
    topLevelButtons: TopLevelButton[]
}

export interface TopLevelButton {
    buttonRenderer: ButtonRenderer5
}

export interface ButtonRenderer5 {
    style: string
    size: string
    isDisabled: boolean
    serviceEndpoint?: ServiceEndpoint7
    icon?: Icon5
    tooltip?: string
    trackingParams: string
    accessibilityData: AccessibilityData13
    text?: Text13
    navigationEndpoint?: NavigationEndpoint7
}

export interface ServiceEndpoint7 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata28
    feedbackEndpoint: FeedbackEndpoint5
}

export interface CommandMetadata28 {
    webCommandMetadata: WebCommandMetadata28
}

export interface WebCommandMetadata28 {
    sendPost: boolean
    apiUrl: string
}

export interface FeedbackEndpoint5 {
    feedbackToken: string
    uiActions: UiActions2
    actions: Action15[]
}

export interface UiActions2 {
    hideEnclosingContainer: boolean
}

export interface Action15 {
    clickTrackingParams: string
    replaceEnclosingAction: ReplaceEnclosingAction4
}

export interface ReplaceEnclosingAction4 {
    item: Item6
}

export interface Item6 {
    notificationMultiActionRenderer: NotificationMultiActionRenderer4
}

export interface NotificationMultiActionRenderer4 {
    responseText: ResponseText5
    buttons: Button4[]
    trackingParams: string
}

export interface ResponseText5 {
    runs: Run21[]
}

export interface Run21 {
    text: string
}

export interface Button4 {
    buttonRenderer: ButtonRenderer6
}

export interface ButtonRenderer6 {
    style: string
    text: Text12
    serviceEndpoint: ServiceEndpoint8
    trackingParams: string
}

export interface Text12 {
    simpleText: string
}

export interface ServiceEndpoint8 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata29
    undoFeedbackEndpoint: UndoFeedbackEndpoint4
}

export interface CommandMetadata29 {
    webCommandMetadata: WebCommandMetadata29
}

export interface WebCommandMetadata29 {
    sendPost: boolean
    apiUrl: string
}

export interface UndoFeedbackEndpoint4 {
    undoToken: string
    actions: Action16[]
}

export interface Action16 {
    clickTrackingParams: string
    undoFeedbackAction: UndoFeedbackAction4
}

export interface UndoFeedbackAction4 {
    hack: boolean
}

export interface Icon5 {
    iconType: string
}

export interface AccessibilityData13 {
    accessibilityData: AccessibilityData14
}

export interface AccessibilityData14 {
    label: string
}

export interface Text13 {
    runs: Run22[]
}

export interface Run22 {
    text: string
}

export interface NavigationEndpoint7 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata30
    browseEndpoint: BrowseEndpoint11
}

export interface CommandMetadata30 {
    webCommandMetadata: WebCommandMetadata30
}

export interface WebCommandMetadata30 {
    url: string
    webPageType: string
    rootVe: number
    apiUrl: string
}

export interface BrowseEndpoint11 {
    browseId: string
    params: string
}

export interface ShowMoreButton {
    buttonRenderer: ButtonRenderer7
}

export interface ButtonRenderer7 {
    style: string
    size: string
    text: Text14
    icon: Icon6
    accessibility: Accessibility10
    trackingParams: string
}

export interface Text14 {
    runs: Run23[]
}

export interface Run23 {
    text: string
}

export interface Icon6 {
    iconType: string
}

export interface Accessibility10 {
    label: string
}

export interface ShowLessButton {
    buttonRenderer: ButtonRenderer8
}

export interface ButtonRenderer8 {
    style: string
    size: string
    text: Text15
    icon: Icon7
    accessibility: Accessibility11
    trackingParams: string
}

export interface Text15 {
    runs: Run24[]
}

export interface Run24 {
    text: string
}

export interface Icon7 {
    iconType: string
}

export interface Accessibility11 {
    label: string
}

export interface ResponsiveContainerConfiguration {
    enableContentSpecificAspectRatio: boolean
}

export interface Icon8 {
    iconType: string
}

export interface ContinuationItemRenderer {
    trigger: string
    continuationEndpoint: ContinuationEndpoint
    ghostCards: GhostCards
}

export interface ContinuationEndpoint {
    clickTrackingParams: string
    commandMetadata: CommandMetadata31
    continuationCommand: ContinuationCommand
}

export interface CommandMetadata31 {
    webCommandMetadata: WebCommandMetadata31
}

export interface WebCommandMetadata31 {
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

export interface Header {
    feedFilterChipBarRenderer: FeedFilterChipBarRenderer
}

export interface FeedFilterChipBarRenderer {
    contents: Content8[]
    trackingParams: string
    nextButton: NextButton
    previousButton: PreviousButton
    styleType: string
}

export interface Content8 {
    chipCloudChipRenderer: ChipCloudChipRenderer
}

export interface ChipCloudChipRenderer {
    style: Style
    text: Text16
    trackingParams: string
    isSelected?: boolean
    navigationEndpoint?: NavigationEndpoint8
    targetId?: string
    uniqueId?: string
}

export interface Style {
    styleType: string
}

export interface Text16 {
    runs: Run25[]
}

export interface Run25 {
    text: string
}

export interface NavigationEndpoint8 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata32
    continuationCommand: ContinuationCommand2
}

export interface CommandMetadata32 {
    webCommandMetadata: WebCommandMetadata32
}

export interface WebCommandMetadata32 {
    sendPost: boolean
    apiUrl: string
}

export interface ContinuationCommand2 {
    token: string
    request: string
    command: Command6
}

export interface Command6 {
    clickTrackingParams: string
    showReloadUiCommand: ShowReloadUiCommand
}

export interface ShowReloadUiCommand {
    targetId: string
}

export interface NextButton {
    buttonRenderer: ButtonRenderer9
}

export interface ButtonRenderer9 {
    style: string
    size: string
    isDisabled: boolean
    icon: Icon9
    tooltip: string
    trackingParams: string
    accessibilityData: AccessibilityData15
}

export interface Icon9 {
    iconType: string
}

export interface AccessibilityData15 {
    accessibilityData: AccessibilityData16
}

export interface AccessibilityData16 {
    label: string
}

export interface PreviousButton {
    buttonRenderer: ButtonRenderer10
}

export interface ButtonRenderer10 {
    style: string
    size: string
    isDisabled: boolean
    icon: Icon10
    tooltip: string
    trackingParams: string
    accessibilityData: AccessibilityData17
}

export interface Icon10 {
    iconType: string
}

export interface AccessibilityData17 {
    accessibilityData: AccessibilityData18
}

export interface AccessibilityData18 {
    label: string
}

export interface ReflowOptions {
    minimumRowsOfVideosAtStart: number
    minimumRowsOfVideosBetweenSections: number
}

export interface Header2 {
    feedTabbedHeaderRenderer: FeedTabbedHeaderRenderer
}

export interface FeedTabbedHeaderRenderer {
    title: Title4
}

export interface Title4 {
    runs: Run26[]
}

export interface Run26 {
    text: string
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
    endpoint: Endpoint2
    trackingParams: string
    overrideEntityKey: string
}

export interface IconImage {
    iconType: string
}

export interface TooltipText {
    runs: Run27[]
}

export interface Run27 {
    text: string
}

export interface Endpoint2 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata33
    browseEndpoint: BrowseEndpoint12
}

export interface CommandMetadata33 {
    webCommandMetadata: WebCommandMetadata33
}

export interface WebCommandMetadata33 {
    url: string
    webPageType: string
    rootVe: number
    apiUrl: string
}

export interface BrowseEndpoint12 {
    browseId: string
}

export interface Searchbox {
    fusionSearchboxRenderer: FusionSearchboxRenderer
}

export interface FusionSearchboxRenderer {
    icon: Icon11
    placeholderText: PlaceholderText
    config: Config
    trackingParams: string
    searchEndpoint: SearchEndpoint
    clearButton: ClearButton
}

export interface Icon11 {
    iconType: string
}

export interface PlaceholderText {
    runs: Run28[]
}

export interface Run28 {
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
    commandMetadata: CommandMetadata34
    searchEndpoint: SearchEndpoint2
}

export interface CommandMetadata34 {
    webCommandMetadata: WebCommandMetadata34
}

export interface WebCommandMetadata34 {
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
    icon: Icon12
    trackingParams: string
    accessibilityData: AccessibilityData19
}

export interface Icon12 {
    iconType: string
}

export interface AccessibilityData19 {
    accessibilityData: AccessibilityData20
}

export interface AccessibilityData20 {
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
    accessibility: Accessibility13
    tooltip: string
    icon?: Icon13
    menuRenderer?: MenuRenderer3
    style?: string
}

export interface Avatar3 {
    thumbnails: Thumbnail13[]
    accessibility: Accessibility12
}

export interface Thumbnail13 {
    url: string
    width: number
    height: number
}

export interface Accessibility12 {
    accessibilityData: AccessibilityData21
}

export interface AccessibilityData21 {
    label: string
}

export interface MenuRequest {
    clickTrackingParams: string
    commandMetadata: CommandMetadata35
    signalServiceEndpoint: SignalServiceEndpoint5
}

export interface CommandMetadata35 {
    webCommandMetadata: WebCommandMetadata35
}

export interface WebCommandMetadata35 {
    sendPost: boolean
    apiUrl: string
}

export interface SignalServiceEndpoint5 {
    signal: string
    actions: Action17[]
}

export interface Action17 {
    clickTrackingParams: string
    openPopupAction: OpenPopupAction6
}

export interface OpenPopupAction6 {
    popup: Popup6
    popupType: string
    beReused: boolean
}

export interface Popup6 {
    multiPageMenuRenderer: MultiPageMenuRenderer
}

export interface MultiPageMenuRenderer {
    trackingParams: string
    style: string
    showLoadingSpinner: boolean
}

export interface Accessibility13 {
    accessibilityData: AccessibilityData22
}

export interface AccessibilityData22 {
    label: string
}

export interface Icon13 {
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
    items: Item7[]
    trackingParams: string
}

export interface Item7 {
    compactLinkRenderer: CompactLinkRenderer
}

export interface CompactLinkRenderer {
    icon: Icon14
    title: Title5
    navigationEndpoint: NavigationEndpoint9
    trackingParams: string
    style: string
}

export interface Icon14 {
    iconType: string
}

export interface Title5 {
    runs: Run29[]
}

export interface Run29 {
    text: string
}

export interface NavigationEndpoint9 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata36
    uploadEndpoint?: UploadEndpoint
    signalNavigationEndpoint?: SignalNavigationEndpoint
    browseEndpoint?: BrowseEndpoint13
}

export interface CommandMetadata36 {
    webCommandMetadata: WebCommandMetadata36
}

export interface WebCommandMetadata36 {
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

export interface BrowseEndpoint13 {
    browseId: string
    params: string
}

export interface NotificationTopbarButtonRenderer {
    icon: Icon15
    menuRequest: MenuRequest2
    style: string
    trackingParams: string
    accessibility: Accessibility14
    tooltip: string
    updateUnseenCountEndpoint: UpdateUnseenCountEndpoint
    notificationCount: number
    handlerDatas: string[]
}

export interface Icon15 {
    iconType: string
}

export interface MenuRequest2 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata37
    signalServiceEndpoint: SignalServiceEndpoint6
}

export interface CommandMetadata37 {
    webCommandMetadata: WebCommandMetadata37
}

export interface WebCommandMetadata37 {
    sendPost: boolean
}

export interface SignalServiceEndpoint6 {
    signal: string
    actions: Action18[]
}

export interface Action18 {
    clickTrackingParams: string
    openPopupAction: OpenPopupAction7
}

export interface OpenPopupAction7 {
    popup: Popup7
    popupType: string
    beReused: boolean
}

export interface Popup7 {
    multiPageMenuRenderer: MultiPageMenuRenderer3
}

export interface MultiPageMenuRenderer3 {
    trackingParams: string
    style: string
    showLoadingSpinner: boolean
}

export interface Accessibility14 {
    accessibilityData: AccessibilityData23
}

export interface AccessibilityData23 {
    label: string
}

export interface UpdateUnseenCountEndpoint {
    clickTrackingParams: string
    commandMetadata: CommandMetadata38
    signalServiceEndpoint: SignalServiceEndpoint7
}

export interface CommandMetadata38 {
    webCommandMetadata: WebCommandMetadata38
}

export interface WebCommandMetadata38 {
    sendPost: boolean
    apiUrl: string
}

export interface SignalServiceEndpoint7 {
    signal: string
}

export interface HotkeyDialog {
    hotkeyDialogRenderer: HotkeyDialogRenderer
}

export interface HotkeyDialogRenderer {
    title: Title6
    sections: Section2[]
    dismissButton: DismissButton
    trackingParams: string
}

export interface Title6 {
    runs: Run30[]
}

export interface Run30 {
    text: string
}

export interface Section2 {
    hotkeyDialogSectionRenderer: HotkeyDialogSectionRenderer
}

export interface HotkeyDialogSectionRenderer {
    title: Title7
    options: Option[]
}

export interface Title7 {
    runs: Run31[]
}

export interface Run31 {
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
    runs: Run32[]
}

export interface Run32 {
    text: string
}

export interface HotkeyAccessibilityLabel {
    accessibilityData: AccessibilityData24
}

export interface AccessibilityData24 {
    label: string
}

export interface DismissButton {
    buttonRenderer: ButtonRenderer12
}

export interface ButtonRenderer12 {
    style: string
    size: string
    isDisabled: boolean
    text: Text17
    trackingParams: string
}

export interface Text17 {
    runs: Run33[]
}

export interface Run33 {
    text: string
}

export interface BackButton {
    buttonRenderer: ButtonRenderer13
}

export interface ButtonRenderer13 {
    trackingParams: string
    command: Command7
}

export interface Command7 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata39
    signalServiceEndpoint: SignalServiceEndpoint8
}

export interface CommandMetadata39 {
    webCommandMetadata: WebCommandMetadata39
}

export interface WebCommandMetadata39 {
    sendPost: boolean
}

export interface SignalServiceEndpoint8 {
    signal: string
    actions: Action19[]
}

export interface Action19 {
    clickTrackingParams: string
    signalAction: SignalAction3
}

export interface SignalAction3 {
    signal: string
}

export interface ForwardButton {
    buttonRenderer: ButtonRenderer14
}

export interface ButtonRenderer14 {
    trackingParams: string
    command: Command8
}

export interface Command8 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata40
    signalServiceEndpoint: SignalServiceEndpoint9
}

export interface CommandMetadata40 {
    webCommandMetadata: WebCommandMetadata40
}

export interface WebCommandMetadata40 {
    sendPost: boolean
}

export interface SignalServiceEndpoint9 {
    signal: string
    actions: Action20[]
}

export interface Action20 {
    clickTrackingParams: string
    signalAction: SignalAction4
}

export interface SignalAction4 {
    signal: string
}

export interface A11ySkipNavigationButton {
    buttonRenderer: ButtonRenderer15
}

export interface ButtonRenderer15 {
    style: string
    size: string
    isDisabled: boolean
    text: Text18
    trackingParams: string
    command: Command9
}

export interface Text18 {
    runs: Run34[]
}

export interface Run34 {
    text: string
}

export interface Command9 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata41
    signalServiceEndpoint: SignalServiceEndpoint10
}

export interface CommandMetadata41 {
    webCommandMetadata: WebCommandMetadata41
}

export interface WebCommandMetadata41 {
    sendPost: boolean
}

export interface SignalServiceEndpoint10 {
    signal: string
    actions: Action21[]
}

export interface Action21 {
    clickTrackingParams: string
    signalAction: SignalAction5
}

export interface SignalAction5 {
    signal: string
}

export interface VoiceSearchButton {
    buttonRenderer: ButtonRenderer16
}

export interface ButtonRenderer16 {
    style: string
    size: string
    isDisabled: boolean
    serviceEndpoint: ServiceEndpoint9
    icon: Icon17
    tooltip: string
    trackingParams: string
    accessibilityData: AccessibilityData27
}

export interface ServiceEndpoint9 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata42
    signalServiceEndpoint: SignalServiceEndpoint11
}

export interface CommandMetadata42 {
    webCommandMetadata: WebCommandMetadata42
}

export interface WebCommandMetadata42 {
    sendPost: boolean
}

export interface SignalServiceEndpoint11 {
    signal: string
    actions: Action22[]
}

export interface Action22 {
    clickTrackingParams: string
    openPopupAction: OpenPopupAction8
}

export interface OpenPopupAction8 {
    popup: Popup8
    popupType: string
}

export interface Popup8 {
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
    runs: Run35[]
}

export interface Run35 {
    text: string
}

export interface PromptHeader {
    runs: Run36[]
}

export interface Run36 {
    text: string
}

export interface ExampleQuery1 {
    runs: Run37[]
}

export interface Run37 {
    text: string
}

export interface ExampleQuery2 {
    runs: Run38[]
}

export interface Run38 {
    text: string
}

export interface PromptMicrophoneLabel {
    runs: Run39[]
}

export interface Run39 {
    text: string
}

export interface LoadingHeader {
    runs: Run40[]
}

export interface Run40 {
    text: string
}

export interface ConnectionErrorHeader {
    runs: Run41[]
}

export interface Run41 {
    text: string
}

export interface ConnectionErrorMicrophoneLabel {
    runs: Run42[]
}

export interface Run42 {
    text: string
}

export interface PermissionsHeader {
    runs: Run43[]
}

export interface Run43 {
    text: string
}

export interface PermissionsSubtext {
    runs: Run44[]
}

export interface Run44 {
    text: string
}

export interface DisabledHeader {
    runs: Run45[]
}

export interface Run45 {
    text: string
}

export interface DisabledSubtext {
    runs: Run46[]
}

export interface Run46 {
    text: string
}

export interface MicrophoneButtonAriaLabel {
    runs: Run47[]
}

export interface Run47 {
    text: string
}

export interface ExitButton {
    buttonRenderer: ButtonRenderer17
}

export interface ButtonRenderer17 {
    style: string
    size: string
    isDisabled: boolean
    icon: Icon16
    trackingParams: string
    accessibilityData: AccessibilityData25
}

export interface Icon16 {
    iconType: string
}

export interface AccessibilityData25 {
    accessibilityData: AccessibilityData26
}

export interface AccessibilityData26 {
    label: string
}

export interface MicrophoneOffPromptHeader {
    runs: Run48[]
}

export interface Run48 {
    text: string
}

export interface Icon17 {
    iconType: string
}

export interface AccessibilityData27 {
    accessibilityData: AccessibilityData28
}

export interface AccessibilityData28 {
    label: string
}

export interface OnResponseReceivedAction {
    clickTrackingParams: string
    showMiniplayerCommand: ShowMiniplayerCommand
}

export interface ShowMiniplayerCommand {
    miniplayerCommand: MiniplayerCommand
    showPremiumBranding: boolean
}

export interface MiniplayerCommand {
    clickTrackingParams: string
    commandMetadata: CommandMetadata43
    watchEndpoint: WatchEndpoint4
}

export interface CommandMetadata43 {
    webCommandMetadata: WebCommandMetadata43
}

export interface WebCommandMetadata43 {
    url: string
    webPageType: string
    rootVe: number
}

export interface WatchEndpoint4 {
    videoId: string
    startTimeSeconds: number
    watchEndpointSupportedOnesieConfig: WatchEndpointSupportedOnesieConfig4
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