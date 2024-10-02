export interface HomeResults_0 {
    responseContext: ResponseContext
    contents: Contents
    trackingParams: string
    maxAgeStoreSeconds: number
    background: Background2
}

export interface ResponseContext {
    serviceTrackingParams: ServiceTrackingParam[]
    maxAgeSeconds: number
}

export interface ServiceTrackingParam {
    service: string
    params: Param[]
}

export interface Param {
    key: string
    value: string
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
    endpoint: Endpoint
    title: string
    selected: boolean
    content: Content
    icon: Icon7
    tabIdentifier: string
    trackingParams: string
}

export interface Endpoint {
    clickTrackingParams: string
    browseEndpoint: BrowseEndpoint
}

export interface BrowseEndpoint {
    browseId: string
}

export interface Content {
    sectionListRenderer: SectionListRenderer
}

export interface SectionListRenderer {
    contents: Content2[]
    continuations: Continuation[]
    trackingParams: string
    header: Header2
}

export interface Content2 {
    musicCarouselShelfRenderer: MusicCarouselShelfRenderer
}

export interface MusicCarouselShelfRenderer {
    header: Header
    contents: Content3[]
    trackingParams: string
    itemSize: string
    numItemsPerColumn?: string
}

export interface Header {
    musicCarouselShelfBasicHeaderRenderer: MusicCarouselShelfBasicHeaderRenderer
}

export interface MusicCarouselShelfBasicHeaderRenderer {
    title: Title
    accessibilityData: AccessibilityData
    headerStyle: string
    moreContentButton: MoreContentButton
    trackingParams: string
    strapline?: Strapline
    thumbnail?: Thumbnail
}

export interface Title {
    runs: Run[]
}

export interface Run {
    text: string
    navigationEndpoint?: NavigationEndpoint
}

export interface NavigationEndpoint {
    clickTrackingParams: string
    browseEndpoint: BrowseEndpoint2
}

export interface BrowseEndpoint2 {
    browseId: string
}

export interface AccessibilityData {
    accessibilityData: AccessibilityData2
}

export interface AccessibilityData2 {
    label: string
}

export interface MoreContentButton {
    buttonRenderer: ButtonRenderer
}

export interface ButtonRenderer {
    style: string
    text: Text
    navigationEndpoint: NavigationEndpoint2
    trackingParams: string
    accessibilityData: AccessibilityData3
}

export interface Text {
    runs: Run2[]
}

export interface Run2 {
    text: string
}

export interface NavigationEndpoint2 {
    clickTrackingParams: string
    browseEndpoint?: BrowseEndpoint3
    watchPlaylistEndpoint?: WatchPlaylistEndpoint
}

export interface BrowseEndpoint3 {
    browseId: string
}

export interface WatchPlaylistEndpoint {
    playlistId: string
    params: string
}

export interface AccessibilityData3 {
    accessibilityData: AccessibilityData4
}

export interface AccessibilityData4 {
    label: string
}

export interface Strapline {
    runs: Run3[]
}

export interface Run3 {
    text: string
}

export interface Thumbnail {
    musicThumbnailRenderer: MusicThumbnailRenderer
}

export interface MusicThumbnailRenderer {
    thumbnail: Thumbnail2
    thumbnailCrop: string
    thumbnailScale: string
    trackingParams: string
    accessibilityData: AccessibilityData5
    onTap: OnTap
    targetId: string
}

export interface Thumbnail2 {
    thumbnails: Thumbnail3[]
}

export interface Thumbnail3 {
    url: string
    width: number
    height: number
}

export interface AccessibilityData5 {
    accessibilityData: AccessibilityData6
}

export interface AccessibilityData6 {
    label: string
}

export interface OnTap {
    clickTrackingParams: string
    browseEndpoint: BrowseEndpoint4
}

export interface BrowseEndpoint4 {
    browseId: string
    browseEndpointContextSupportedConfigs: BrowseEndpointContextSupportedConfigs
}

export interface BrowseEndpointContextSupportedConfigs {
    browseEndpointContextMusicConfig: BrowseEndpointContextMusicConfig
}

export interface BrowseEndpointContextMusicConfig {
    pageType: string
}

export interface Content3 {
    musicTwoRowItemRenderer?: MusicTwoRowItemRenderer
    musicResponsiveListItemRenderer?: MusicResponsiveListItemRenderer
}

export interface MusicTwoRowItemRenderer {
    thumbnailRenderer: ThumbnailRenderer
    aspectRatio: string
    title: Title2
    subtitle: Subtitle
    navigationEndpoint: NavigationEndpoint4
    trackingParams: string
    menu: Menu
    thumbnailOverlay?: ThumbnailOverlay
    subtitleBadges?: SubtitleBadge[]
}

export interface ThumbnailRenderer {
    musicThumbnailRenderer: MusicThumbnailRenderer2
}

export interface MusicThumbnailRenderer2 {
    thumbnail: Thumbnail4
    thumbnailCrop: string
    thumbnailScale: string
    trackingParams: string
}

export interface Thumbnail4 {
    thumbnails: Thumbnail5[]
}

export interface Thumbnail5 {
    url: string
    width: number
    height: number
}

export interface Title2 {
    runs: Run4[]
}

export interface Run4 {
    text: string
    navigationEndpoint?: NavigationEndpoint3
}

export interface NavigationEndpoint3 {
    clickTrackingParams: string
    browseEndpoint: BrowseEndpoint5
}

export interface BrowseEndpoint5 {
    browseId: string
    browseEndpointContextSupportedConfigs: BrowseEndpointContextSupportedConfigs2
    params?: string
}

export interface BrowseEndpointContextSupportedConfigs2 {
    browseEndpointContextMusicConfig: BrowseEndpointContextMusicConfig2
}

export interface BrowseEndpointContextMusicConfig2 {
    pageType: string
}

export interface Subtitle {
    runs: Run5[]
}

export interface Run5 {
    text: string
}

export interface NavigationEndpoint4 {
    clickTrackingParams: string
    browseEndpoint?: BrowseEndpoint6
    watchEndpoint?: WatchEndpoint
}

export interface BrowseEndpoint6 {
    browseId: string
    browseEndpointContextSupportedConfigs: BrowseEndpointContextSupportedConfigs3
    params?: string
}

export interface BrowseEndpointContextSupportedConfigs3 {
    browseEndpointContextMusicConfig: BrowseEndpointContextMusicConfig3
}

export interface BrowseEndpointContextMusicConfig3 {
    pageType: string
}

export interface WatchEndpoint {
    videoId: string
    playlistId: string
    params: string
    loggingContext: LoggingContext
    watchEndpointMusicSupportedConfigs: WatchEndpointMusicSupportedConfigs
}

export interface LoggingContext {
    vssLoggingContext: VssLoggingContext
}

export interface VssLoggingContext {
    serializedContextData: string
}

export interface WatchEndpointMusicSupportedConfigs {
    watchEndpointMusicConfig: WatchEndpointMusicConfig
}

export interface WatchEndpointMusicConfig {
    musicVideoType: string
}

export interface Menu {
    menuRenderer: MenuRenderer
}

export interface MenuRenderer {
    items: Item[]
    trackingParams: string
    accessibility: Accessibility
}

export interface Item {
    menuNavigationItemRenderer?: MenuNavigationItemRenderer
    menuServiceItemRenderer?: MenuServiceItemRenderer
    toggleMenuServiceItemRenderer?: ToggleMenuServiceItemRenderer
}

export interface MenuNavigationItemRenderer {
    text: Text2
    icon: Icon
    navigationEndpoint: NavigationEndpoint5
    trackingParams: string
}

export interface Text2 {
    runs: Run6[]
}

export interface Run6 {
    text: string
}

export interface Icon {
    iconType: string
}

export interface NavigationEndpoint5 {
    clickTrackingParams: string
    shareEntityEndpoint?: ShareEntityEndpoint
    browseEndpoint?: BrowseEndpoint7
    addToPlaylistEndpoint?: AddToPlaylistEndpoint
    watchEndpoint?: WatchEndpoint2
    watchPlaylistEndpoint?: WatchPlaylistEndpoint2
    confirmDialogEndpoint?: ConfirmDialogEndpoint
    playlistEditorEndpoint?: PlaylistEditorEndpoint
}

export interface ShareEntityEndpoint {
    serializedShareEntity: string
    sharePanelType: string
}

export interface BrowseEndpoint7 {
    browseId: string
    browseEndpointContextSupportedConfigs: BrowseEndpointContextSupportedConfigs4
}

export interface BrowseEndpointContextSupportedConfigs4 {
    browseEndpointContextMusicConfig: BrowseEndpointContextMusicConfig4
}

export interface BrowseEndpointContextMusicConfig4 {
    pageType: string
}

export interface AddToPlaylistEndpoint {
    playlistId?: string
    videoId?: string
}

export interface WatchEndpoint2 {
    videoId: string
    playlistId: string
    params: string
    loggingContext: LoggingContext2
    watchEndpointMusicSupportedConfigs: WatchEndpointMusicSupportedConfigs2
}

export interface LoggingContext2 {
    vssLoggingContext: VssLoggingContext2
}

export interface VssLoggingContext2 {
    serializedContextData: string
}

export interface WatchEndpointMusicSupportedConfigs2 {
    watchEndpointMusicConfig: WatchEndpointMusicConfig2
}

export interface WatchEndpointMusicConfig2 {
    musicVideoType: string
}

export interface WatchPlaylistEndpoint2 {
    playlistId: string
    params: string
}

export interface ConfirmDialogEndpoint {
    content: Content4
}

export interface Content4 {
    confirmDialogRenderer: ConfirmDialogRenderer
}

export interface ConfirmDialogRenderer {
    title: Title3
    trackingParams: string
    dialogMessages: DialogMessage[]
    confirmButton: ConfirmButton
    cancelButton: CancelButton
}

export interface Title3 {
    runs: Run7[]
}

export interface Run7 {
    text: string
}

export interface DialogMessage {
    runs: Run8[]
}

export interface Run8 {
    text: string
}

export interface ConfirmButton {
    buttonRenderer: ButtonRenderer2
}

export interface ButtonRenderer2 {
    style: string
    size: string
    isDisabled: boolean
    text: Text3
    serviceEndpoint: ServiceEndpoint
    trackingParams: string
}

export interface Text3 {
    runs: Run9[]
}

export interface Run9 {
    text: string
}

export interface ServiceEndpoint {
    clickTrackingParams: string
    delete_playlistEndpoint: DeletePlaylistEndpoint
}

export interface DeletePlaylistEndpoint {
    playlistId: string
}

export interface CancelButton {
    buttonRenderer: ButtonRenderer3
}

export interface ButtonRenderer3 {
    style: string
    size: string
    isDisabled: boolean
    text: Text4
    trackingParams: string
}

export interface Text4 {
    runs: Run10[]
}

export interface Run10 {
    text: string
}

export interface PlaylistEditorEndpoint {
    playlistId: string
}

export interface MenuServiceItemRenderer {
    text: Text5
    icon: Icon2
    serviceEndpoint: ServiceEndpoint2
    trackingParams: string
}

export interface Text5 {
    runs: Run11[]
}

export interface Run11 {
    text: string
}

export interface Icon2 {
    iconType: string
}

export interface ServiceEndpoint2 {
    clickTrackingParams: string
    queueAddEndpoint: QueueAddEndpoint
}

export interface QueueAddEndpoint {
    queueTarget: QueueTarget
    queueInsertPosition: string
    commands: Command[]
}

export interface QueueTarget {
    videoId?: string
    onEmptyQueue: OnEmptyQueue
    playlistId?: string
}

export interface OnEmptyQueue {
    clickTrackingParams: string
    watchEndpoint: WatchEndpoint3
}

export interface WatchEndpoint3 {
    videoId?: string
    playlistId?: string
}

export interface Command {
    clickTrackingParams: string
    addToToastAction: AddToToastAction
}

export interface AddToToastAction {
    item: Item2
}

export interface Item2 {
    notificationTextRenderer: NotificationTextRenderer
}

export interface NotificationTextRenderer {
    successResponseText: SuccessResponseText
    trackingParams: string
}

export interface SuccessResponseText {
    runs: Run12[]
}

export interface Run12 {
    text: string
}

export interface ToggleMenuServiceItemRenderer {
    defaultText: DefaultText
    defaultIcon: DefaultIcon
    defaultServiceEndpoint: DefaultServiceEndpoint
    toggledText: ToggledText
    toggledIcon: ToggledIcon
    toggledServiceEndpoint: ToggledServiceEndpoint
    trackingParams: string
}

export interface DefaultText {
    runs: Run13[]
}

export interface Run13 {
    text: string
}

export interface DefaultIcon {
    iconType: string
}

export interface DefaultServiceEndpoint {
    clickTrackingParams: string
    likeEndpoint?: LikeEndpoint
    feedbackEndpoint?: FeedbackEndpoint
    subscribeEndpoint?: SubscribeEndpoint
}

export interface LikeEndpoint {
    status: string
    target: Target
    actions?: Action[]
}

export interface Target {
    playlistId?: string
    videoId?: string
}

export interface Action {
    clickTrackingParams: string
    musicLibraryStatusUpdateCommand: MusicLibraryStatusUpdateCommand
}

export interface MusicLibraryStatusUpdateCommand {
    libraryStatus: string
    addToLibraryFeedbackToken: string
}

export interface FeedbackEndpoint {
    feedbackToken: string
}

export interface SubscribeEndpoint {
    channelIds: string[]
    params: string
}

export interface ToggledText {
    runs: Run14[]
}

export interface Run14 {
    text: string
}

export interface ToggledIcon {
    iconType: string
}

export interface ToggledServiceEndpoint {
    clickTrackingParams: string
    likeEndpoint?: LikeEndpoint2
    feedbackEndpoint?: FeedbackEndpoint2
    unsubscribeEndpoint?: UnsubscribeEndpoint
}

export interface LikeEndpoint2 {
    status: string
    target: Target2
    actions?: Action2[]
}

export interface Target2 {
    playlistId?: string
    videoId?: string
}

export interface Action2 {
    clickTrackingParams: string
    musicLibraryStatusUpdateCommand: MusicLibraryStatusUpdateCommand2
}

export interface MusicLibraryStatusUpdateCommand2 {
    libraryStatus: string
    addToLibraryFeedbackToken: string
}

export interface FeedbackEndpoint2 {
    feedbackToken: string
}

export interface UnsubscribeEndpoint {
    channelIds: string[]
    params: string
}

export interface Accessibility {
    accessibilityData: AccessibilityData7
}

export interface AccessibilityData7 {
    label: string
}

export interface ThumbnailOverlay {
    musicItemThumbnailOverlayRenderer: MusicItemThumbnailOverlayRenderer
}

export interface MusicItemThumbnailOverlayRenderer {
    background: Background
    content: Content5
    contentPosition: string
    displayStyle: string
}

export interface Background {
    verticalGradient: VerticalGradient
}

export interface VerticalGradient {
    gradientLayerColors: string[]
}

export interface Content5 {
    musicPlayButtonRenderer: MusicPlayButtonRenderer
}

export interface MusicPlayButtonRenderer {
    playNavigationEndpoint: PlayNavigationEndpoint
    trackingParams: string
    playIcon: PlayIcon
    pauseIcon: PauseIcon
    iconColor: number
    backgroundColor: number
    activeBackgroundColor: number
    loadingIndicatorColor: number
    playingIcon: PlayingIcon
    iconLoadingColor: number
    activeScaleFactor: number
    buttonSize: string
    rippleTarget: string
    accessibilityPlayData: AccessibilityPlayData
    accessibilityPauseData: AccessibilityPauseData
}

export interface PlayNavigationEndpoint {
    clickTrackingParams: string
    watchPlaylistEndpoint?: WatchPlaylistEndpoint3
    watchEndpoint?: WatchEndpoint4
}

export interface WatchPlaylistEndpoint3 {
    playlistId: string
    params: string
}

export interface WatchEndpoint4 {
    videoId: string
    playlistId: string
    params?: string
    loggingContext: LoggingContext3
    watchEndpointMusicSupportedConfigs: WatchEndpointMusicSupportedConfigs3
}

export interface LoggingContext3 {
    vssLoggingContext: VssLoggingContext3
}

export interface VssLoggingContext3 {
    serializedContextData: string
}

export interface WatchEndpointMusicSupportedConfigs3 {
    watchEndpointMusicConfig: WatchEndpointMusicConfig3
}

export interface WatchEndpointMusicConfig3 {
    musicVideoType: string
}

export interface PlayIcon {
    iconType: string
}

export interface PauseIcon {
    iconType: string
}

export interface PlayingIcon {
    iconType: string
}

export interface AccessibilityPlayData {
    accessibilityData: AccessibilityData8
}

export interface AccessibilityData8 {
    label: string
}

export interface AccessibilityPauseData {
    accessibilityData: AccessibilityData9
}

export interface AccessibilityData9 {
    label: string
}

export interface SubtitleBadge {
    musicInlineBadgeRenderer: MusicInlineBadgeRenderer
}

export interface MusicInlineBadgeRenderer {
    trackingParams: string
    icon: Icon3
    accessibilityData: AccessibilityData10
}

export interface Icon3 {
    iconType: string
}

export interface AccessibilityData10 {
    accessibilityData: AccessibilityData11
}

export interface AccessibilityData11 {
    label: string
}

export interface MusicResponsiveListItemRenderer {
    trackingParams: string
    thumbnail: Thumbnail6
    flexColumns: FlexColumn[]
    menu: Menu2
    badges?: Badge[]
    playlistItemData: PlaylistItemData
    flexColumnDisplayStyle: string
    navigationEndpoint: NavigationEndpoint8
    itemHeight: string
}

export interface Thumbnail6 {
    musicThumbnailRenderer: MusicThumbnailRenderer3
}

export interface MusicThumbnailRenderer3 {
    thumbnail: Thumbnail7
    thumbnailCrop: string
    thumbnailScale: string
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

export interface FlexColumn {
    musicResponsiveListItemFlexColumnRenderer: MusicResponsiveListItemFlexColumnRenderer
}

export interface MusicResponsiveListItemFlexColumnRenderer {
    text: Text6
    displayPriority: string
}

export interface Text6 {
    runs: Run15[]
}

export interface Run15 {
    text: string
    navigationEndpoint?: NavigationEndpoint6
}

export interface NavigationEndpoint6 {
    clickTrackingParams: string
    watchEndpoint: WatchEndpoint5
}

export interface WatchEndpoint5 {
    videoId: string
    playlistId: string
    params: string
    loggingContext: LoggingContext4
    watchEndpointMusicSupportedConfigs: WatchEndpointMusicSupportedConfigs4
}

export interface LoggingContext4 {
    vssLoggingContext: VssLoggingContext4
}

export interface VssLoggingContext4 {
    serializedContextData: string
}

export interface WatchEndpointMusicSupportedConfigs4 {
    watchEndpointMusicConfig: WatchEndpointMusicConfig4
}

export interface WatchEndpointMusicConfig4 {
    musicVideoType: string
}

export interface Menu2 {
    menuRenderer: MenuRenderer2
}

export interface MenuRenderer2 {
    items: Item3[]
    trackingParams: string
    accessibility: Accessibility2
}

export interface Item3 {
    menuNavigationItemRenderer?: MenuNavigationItemRenderer2
    menuServiceItemRenderer?: MenuServiceItemRenderer2
    toggleMenuServiceItemRenderer?: ToggleMenuServiceItemRenderer2
}

export interface MenuNavigationItemRenderer2 {
    text: Text7
    icon: Icon4
    navigationEndpoint: NavigationEndpoint7
    trackingParams: string
}

export interface Text7 {
    runs: Run16[]
}

export interface Run16 {
    text: string
}

export interface Icon4 {
    iconType: string
}

export interface NavigationEndpoint7 {
    clickTrackingParams: string
    shareEntityEndpoint?: ShareEntityEndpoint2
    browseEndpoint?: BrowseEndpoint8
    addToPlaylistEndpoint?: AddToPlaylistEndpoint2
    watchEndpoint?: WatchEndpoint6
}

export interface ShareEntityEndpoint2 {
    serializedShareEntity: string
    sharePanelType: string
}

export interface BrowseEndpoint8 {
    browseId: string
    browseEndpointContextSupportedConfigs: BrowseEndpointContextSupportedConfigs5
}

export interface BrowseEndpointContextSupportedConfigs5 {
    browseEndpointContextMusicConfig: BrowseEndpointContextMusicConfig5
}

export interface BrowseEndpointContextMusicConfig5 {
    pageType: string
}

export interface AddToPlaylistEndpoint2 {
    videoId: string
}

export interface WatchEndpoint6 {
    videoId: string
    playlistId: string
    params: string
    loggingContext: LoggingContext5
    watchEndpointMusicSupportedConfigs: WatchEndpointMusicSupportedConfigs5
}

export interface LoggingContext5 {
    vssLoggingContext: VssLoggingContext5
}

export interface VssLoggingContext5 {
    serializedContextData: string
}

export interface WatchEndpointMusicSupportedConfigs5 {
    watchEndpointMusicConfig: WatchEndpointMusicConfig5
}

export interface WatchEndpointMusicConfig5 {
    musicVideoType: string
}

export interface MenuServiceItemRenderer2 {
    text: Text8
    icon: Icon5
    serviceEndpoint: ServiceEndpoint3
    trackingParams: string
}

export interface Text8 {
    runs: Run17[]
}

export interface Run17 {
    text: string
}

export interface Icon5 {
    iconType: string
}

export interface ServiceEndpoint3 {
    clickTrackingParams: string
    queueAddEndpoint: QueueAddEndpoint2
}

export interface QueueAddEndpoint2 {
    queueTarget: QueueTarget2
    queueInsertPosition: string
    commands: Command2[]
}

export interface QueueTarget2 {
    videoId: string
    onEmptyQueue: OnEmptyQueue2
}

export interface OnEmptyQueue2 {
    clickTrackingParams: string
    watchEndpoint: WatchEndpoint7
}

export interface WatchEndpoint7 {
    videoId: string
}

export interface Command2 {
    clickTrackingParams: string
    addToToastAction: AddToToastAction2
}

export interface AddToToastAction2 {
    item: Item4
}

export interface Item4 {
    notificationTextRenderer: NotificationTextRenderer2
}

export interface NotificationTextRenderer2 {
    successResponseText: SuccessResponseText2
    trackingParams: string
}

export interface SuccessResponseText2 {
    runs: Run18[]
}

export interface Run18 {
    text: string
}

export interface ToggleMenuServiceItemRenderer2 {
    defaultText: DefaultText2
    defaultIcon: DefaultIcon2
    defaultServiceEndpoint: DefaultServiceEndpoint2
    toggledText: ToggledText2
    toggledIcon: ToggledIcon2
    toggledServiceEndpoint: ToggledServiceEndpoint2
    trackingParams: string
}

export interface DefaultText2 {
    runs: Run19[]
}

export interface Run19 {
    text: string
}

export interface DefaultIcon2 {
    iconType: string
}

export interface DefaultServiceEndpoint2 {
    clickTrackingParams: string
    likeEndpoint?: LikeEndpoint3
    feedbackEndpoint?: FeedbackEndpoint3
}

export interface LikeEndpoint3 {
    status: string
    target: Target3
    actions?: Action3[]
}

export interface Target3 {
    videoId: string
}

export interface Action3 {
    clickTrackingParams: string
    musicLibraryStatusUpdateCommand: MusicLibraryStatusUpdateCommand3
}

export interface MusicLibraryStatusUpdateCommand3 {
    libraryStatus: string
    addToLibraryFeedbackToken: string
}

export interface FeedbackEndpoint3 {
    feedbackToken: string
}

export interface ToggledText2 {
    runs: Run20[]
}

export interface Run20 {
    text: string
}

export interface ToggledIcon2 {
    iconType: string
}

export interface ToggledServiceEndpoint2 {
    clickTrackingParams: string
    likeEndpoint?: LikeEndpoint4
    feedbackEndpoint?: FeedbackEndpoint4
}

export interface LikeEndpoint4 {
    status: string
    target: Target4
    actions?: Action4[]
}

export interface Target4 {
    videoId: string
}

export interface Action4 {
    clickTrackingParams: string
    musicLibraryStatusUpdateCommand: MusicLibraryStatusUpdateCommand4
}

export interface MusicLibraryStatusUpdateCommand4 {
    libraryStatus: string
    addToLibraryFeedbackToken: string
}

export interface FeedbackEndpoint4 {
    feedbackToken: string
}

export interface Accessibility2 {
    accessibilityData: AccessibilityData12
}

export interface AccessibilityData12 {
    label: string
}

export interface Badge {
    musicInlineBadgeRenderer: MusicInlineBadgeRenderer2
}

export interface MusicInlineBadgeRenderer2 {
    trackingParams: string
    icon: Icon6
    accessibilityData: AccessibilityData13
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

export interface PlaylistItemData {
    videoId: string
}

export interface NavigationEndpoint8 {
    clickTrackingParams: string
    watchEndpoint: WatchEndpoint8
}

export interface WatchEndpoint8 {
    videoId: string
    watchEndpointMusicSupportedConfigs: WatchEndpointMusicSupportedConfigs6
}

export interface WatchEndpointMusicSupportedConfigs6 {
    watchEndpointMusicConfig: WatchEndpointMusicConfig6
}

export interface WatchEndpointMusicConfig6 {
    musicVideoType: string
}

export interface Continuation {
    nextContinuationData: NextContinuationData
}

export interface NextContinuationData {
    continuation: string
    clickTrackingParams: string
}

export interface Header2 {
    chipCloudRenderer: ChipCloudRenderer
}

export interface ChipCloudRenderer {
    chips: Chip[]
    trackingParams: string
    horizontalScrollable: boolean
}

export interface Chip {
    chipCloudChipRenderer: ChipCloudChipRenderer
}

export interface ChipCloudChipRenderer {
    style: Style
    text: Text9
    navigationEndpoint: NavigationEndpoint9
    trackingParams: string
    isSelected: boolean
    onDeselectedCommand: OnDeselectedCommand
}

export interface Style {
    styleType: string
}

export interface Text9 {
    runs: Run21[]
}

export interface Run21 {
    text: string
}

export interface NavigationEndpoint9 {
    clickTrackingParams: string
    browseEndpoint: BrowseEndpoint9
}

export interface BrowseEndpoint9 {
    browseId: string
    params: string
}

export interface OnDeselectedCommand {
    clickTrackingParams: string
    browseEndpoint: BrowseEndpoint10
}

export interface BrowseEndpoint10 {
    browseId: string
    params: string
}

export interface Icon7 {
    iconType: string
}

export interface Background2 {
    musicThumbnailRenderer: MusicThumbnailRenderer4
}

export interface MusicThumbnailRenderer4 {
    thumbnail: Thumbnail9
    thumbnailCrop: string
    thumbnailScale: string
    trackingParams: string
}

export interface Thumbnail9 {
    thumbnails: Thumbnail10[]
}

export interface Thumbnail10 {
    url: string
    width: number
    height: number
}
