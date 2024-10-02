import { Continuation } from "./Continuation"

export interface PlaylistResults_1 {
    responseContext: ResponseContext
    continuationContents: ContinuationContents
    trackingParams: string
}

export interface ResponseContext {
    serviceTrackingParams: ServiceTrackingParam[]
}

export interface ServiceTrackingParam {
    service: string
    params: Param[]
}

export interface Param {
    key: string
    value: string
}

export interface ContinuationContents {
    musicPlaylistShelfContinuation: MusicPlaylistShelfContinuation
}

export interface MusicPlaylistShelfContinuation {
    contents: Content[]
    continuations: Continuation
    trackingParams: string
}

export interface Content {
    musicResponsiveListItemRenderer: MusicResponsiveListItemRenderer
}

export interface MusicResponsiveListItemRenderer {
    trackingParams: string
    thumbnail: Thumbnail
    overlay: Overlay
    flexColumns: FlexColumn[]
    fixedColumns: FixedColumn[]
    menu: Menu
    playlistItemData: PlaylistItemData
    multiSelectCheckbox: MultiSelectCheckbox
    badges?: Badge[]
}

export interface Thumbnail {
    musicThumbnailRenderer: MusicThumbnailRenderer
}

export interface MusicThumbnailRenderer {
    thumbnail: Thumbnail2
    thumbnailCrop: string
    thumbnailScale: string
    trackingParams: string
}

export interface Thumbnail2 {
    thumbnails: Thumbnail3[]
}

export interface Thumbnail3 {
    url: string
    width: number
    height: number
}

export interface Overlay {
    musicItemThumbnailOverlayRenderer: MusicItemThumbnailOverlayRenderer
}

export interface MusicItemThumbnailOverlayRenderer {
    background: Background
    content: Content2
    contentPosition: string
    displayStyle: string
}

export interface Background {
    verticalGradient: VerticalGradient
}

export interface VerticalGradient {
    gradientLayerColors: string[]
}

export interface Content2 {
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
    watchEndpoint: WatchEndpoint
}

export interface WatchEndpoint {
    videoId: string
    playlistId: string
    playerParams: string
    playlistSetVideoId: string
    loggingContext: LoggingContext
    watchEndpointMusicSupportedConfigs: WatchEndpointMusicSupportedConfigs
    params?: string
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
    accessibilityData: AccessibilityData
}

export interface AccessibilityData {
    label: string
}

export interface AccessibilityPauseData {
    accessibilityData: AccessibilityData2
}

export interface AccessibilityData2 {
    label: string
}

export interface FlexColumn {
    musicResponsiveListItemFlexColumnRenderer: MusicResponsiveListItemFlexColumnRenderer
}

export interface MusicResponsiveListItemFlexColumnRenderer {
    text: Text
    displayPriority: string
}

export interface Text {
    runs: Run[]
}

export interface Run {
    text: string
    navigationEndpoint?: NavigationEndpoint
}

export interface NavigationEndpoint {
    clickTrackingParams: string
    browseEndpoint?: BrowseEndpoint
    watchEndpoint?: WatchEndpoint2
}

export interface BrowseEndpoint {
    browseId: string
    browseEndpointContextSupportedConfigs: BrowseEndpointContextSupportedConfigs
}

export interface BrowseEndpointContextSupportedConfigs {
    browseEndpointContextMusicConfig: BrowseEndpointContextMusicConfig
}

export interface BrowseEndpointContextMusicConfig {
    pageType: string
}

export interface WatchEndpoint2 {
    videoId: string
    playlistId: string
    playerParams: string
    loggingContext: LoggingContext2
    watchEndpointMusicSupportedConfigs: WatchEndpointMusicSupportedConfigs2
    params?: string
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

export interface FixedColumn {
    musicResponsiveListItemFixedColumnRenderer: MusicResponsiveListItemFixedColumnRenderer
}

export interface MusicResponsiveListItemFixedColumnRenderer {
    text: Text2
    displayPriority: string
    size: string
}

export interface Text2 {
    runs: Run2[]
}

export interface Run2 {
    text: string
}

export interface Menu {
    menuRenderer: MenuRenderer
}

export interface MenuRenderer {
    items: Item[]
    trackingParams: string
    topLevelButtons: TopLevelButton[]
    accessibility: Accessibility
}

export interface Item {
    menuNavigationItemRenderer?: MenuNavigationItemRenderer
    menuServiceItemRenderer?: MenuServiceItemRenderer
    toggleMenuServiceItemRenderer?: ToggleMenuServiceItemRenderer
    menuServiceItemDownloadRenderer?: MenuServiceItemDownloadRenderer
}

export interface MenuNavigationItemRenderer {
    text: Text3
    icon: Icon
    navigationEndpoint: NavigationEndpoint2
    trackingParams: string
}

export interface Text3 {
    runs: Run3[]
}

export interface Run3 {
    text: string
}

export interface Icon {
    iconType: string
}

export interface NavigationEndpoint2 {
    clickTrackingParams: string
    shareEntityEndpoint?: ShareEntityEndpoint
    browseEndpoint?: BrowseEndpoint2
    addToPlaylistEndpoint?: AddToPlaylistEndpoint
    watchEndpoint?: WatchEndpoint3
}

export interface ShareEntityEndpoint {
    serializedShareEntity: string
    sharePanelType: string
}

export interface BrowseEndpoint2 {
    browseId: string
    browseEndpointContextSupportedConfigs: BrowseEndpointContextSupportedConfigs2
}

export interface BrowseEndpointContextSupportedConfigs2 {
    browseEndpointContextMusicConfig: BrowseEndpointContextMusicConfig2
}

export interface BrowseEndpointContextMusicConfig2 {
    pageType: string
}

export interface AddToPlaylistEndpoint {
    videoId: string
}

export interface WatchEndpoint3 {
    videoId: string
    playlistId: string
    params: string
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

export interface MenuServiceItemRenderer {
    text: Text4
    icon: Icon2
    serviceEndpoint: ServiceEndpoint
    trackingParams: string
}

export interface Text4 {
    runs: Run4[]
}

export interface Run4 {
    text: string
}

export interface Icon2 {
    iconType: string
}

export interface ServiceEndpoint {
    clickTrackingParams: string
    playlistEditEndpoint?: PlaylistEditEndpoint
    queueAddEndpoint?: QueueAddEndpoint
}

export interface PlaylistEditEndpoint {
    playlistId: string
    actions: Action[]
}

export interface Action {
    setVideoId: string
    action: string
    removedVideoId: string
}

export interface QueueAddEndpoint {
    queueTarget: QueueTarget
    queueInsertPosition: string
    commands: Command[]
}

export interface QueueTarget {
    videoId: string
    onEmptyQueue: OnEmptyQueue
}

export interface OnEmptyQueue {
    clickTrackingParams: string
    watchEndpoint: WatchEndpoint4
}

export interface WatchEndpoint4 {
    videoId: string
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
    runs: Run5[]
}

export interface Run5 {
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
    runs: Run6[]
}

export interface Run6 {
    text: string
}

export interface DefaultIcon {
    iconType: string
}

export interface DefaultServiceEndpoint {
    clickTrackingParams: string
    feedbackEndpoint: FeedbackEndpoint
}

export interface FeedbackEndpoint {
    feedbackToken: string
}

export interface ToggledText {
    runs: Run7[]
}

export interface Run7 {
    text: string
}

export interface ToggledIcon {
    iconType: string
}

export interface ToggledServiceEndpoint {
    clickTrackingParams: string
    feedbackEndpoint: FeedbackEndpoint2
}

export interface FeedbackEndpoint2 {
    feedbackToken: string
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

export interface TopLevelButton {
    likeButtonRenderer: LikeButtonRenderer
}

export interface LikeButtonRenderer {
    target: Target
    likeStatus: string
    trackingParams: string
    likesAllowed: boolean
    serviceEndpoints: ServiceEndpoint3[]
}

export interface Target {
    videoId: string
}

export interface ServiceEndpoint3 {
    clickTrackingParams: string
    likeEndpoint: LikeEndpoint
}

export interface LikeEndpoint {
    status: string
    target: Target2
    actions?: Action2[]
}

export interface Target2 {
    videoId: string
}

export interface Action2 {
    clickTrackingParams: string
    musicLibraryStatusUpdateCommand: MusicLibraryStatusUpdateCommand
}

export interface MusicLibraryStatusUpdateCommand {
    libraryStatus: string
    addToLibraryFeedbackToken: string
}

export interface Accessibility {
    accessibilityData: AccessibilityData3
}

export interface AccessibilityData3 {
    label: string
}

export interface PlaylistItemData {
    playlistSetVideoId: string
    videoId: string
    voteSortValue: number
}

export interface MultiSelectCheckbox {
    checkboxRenderer: CheckboxRenderer
}

export interface CheckboxRenderer {
    onSelectionChangeCommand: OnSelectionChangeCommand
    checkedState: string
    trackingParams: string
}

export interface OnSelectionChangeCommand {
    clickTrackingParams: string
    updateMultiSelectStateCommand: UpdateMultiSelectStateCommand
}

export interface UpdateMultiSelectStateCommand {
    multiSelectParams: string
    multiSelectItem: string
}

export interface Badge {
    musicInlineBadgeRenderer: MusicInlineBadgeRenderer
}

export interface MusicInlineBadgeRenderer {
    trackingParams: string
    icon: Icon3
    accessibilityData: AccessibilityData4
}

export interface Icon3 {
    iconType: string
}

export interface AccessibilityData4 {
    accessibilityData: AccessibilityData5
}

export interface AccessibilityData5 {
    label: string
}
