export interface PlaylistResults_3 {
    responseContext: ResponseContext
    trackingParams: string
    onResponseReceivedActions: OnResponseReceivedAction[]
}

export interface ResponseContext {
    visitorData: string
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

export interface OnResponseReceivedAction {
    clickTrackingParams: string
    appendContinuationItemsAction: AppendContinuationItemsAction
}

export interface AppendContinuationItemsAction {
    continuationItems: ContinuationItem[]
    targetId: string
}

export interface ContinuationItem {
    musicResponsiveListItemRenderer?: MusicResponsiveListItemRenderer
    continuationItemRenderer?: ContinuationItemRenderer
}

export interface MusicResponsiveListItemRenderer {
    trackingParams: string
    thumbnail: Thumbnail
    overlay: Overlay
    flexColumns: FlexColumn[]
    fixedColumns: FixedColumn[]
    menu?: Menu
    badges?: Badge[]
    playlistItemData?: PlaylistItemData
    multiSelectCheckbox?: MultiSelectCheckbox
    musicItemRendererDisplayPolicy?: string
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
    content: Content
    contentPosition: string
    displayStyle: string
}

export interface Background {
    verticalGradient: VerticalGradient
}

export interface VerticalGradient {
    gradientLayerColors: string[]
}

export interface Content {
    musicPlayButtonRenderer: MusicPlayButtonRenderer
}

export interface MusicPlayButtonRenderer {
    playNavigationEndpoint?: PlayNavigationEndpoint
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
    accessibilityPlayData?: AccessibilityPlayData
    accessibilityPauseData?: AccessibilityPauseData
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
    runs?: Run[]
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
    accessibility: Accessibility
}

export interface Run2 {
    text: string
}

export interface Accessibility {
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
    topLevelButtons: TopLevelButton[]
    accessibility: Accessibility2
}

export interface Item {
    menuNavigationItemRenderer?: MenuNavigationItemRenderer
    menuServiceItemRenderer?: MenuServiceItemRenderer
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
    modalEndpoint?: ModalEndpoint
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

export interface ModalEndpoint {
    modal: Modal
}

export interface Modal {
    modalWithTitleAndButtonRenderer: ModalWithTitleAndButtonRenderer
}

export interface ModalWithTitleAndButtonRenderer {
    title: Title
    content: Content2
    button: Button
}

export interface Title {
    runs: Run4[]
}

export interface Run4 {
    text: string
}

export interface Content2 {
    runs: Run5[]
}

export interface Run5 {
    text: string
}

export interface Button {
    buttonRenderer: ButtonRenderer
}

export interface ButtonRenderer {
    style: string
    isDisabled: boolean
    text: Text4
    navigationEndpoint: NavigationEndpoint3
    trackingParams: string
}

export interface Text4 {
    runs: Run6[]
}

export interface Run6 {
    text: string
}

export interface NavigationEndpoint3 {
    clickTrackingParams: string
    signInEndpoint: SignInEndpoint
}

export interface SignInEndpoint {
    hack: boolean
}

export interface WatchEndpoint3 {
    videoId: string
    playlistId: string
    params: string
    loggingContext: LoggingContext3
    watchEndpointMusicSupportedConfigs: WatchEndpointMusicSupportedConfigs3
    playerParams?: string
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
    text: Text5
    icon: Icon2
    serviceEndpoint: ServiceEndpoint
    trackingParams: string
}

export interface Text5 {
    runs: Run7[]
}

export interface Run7 {
    text: string
}

export interface Icon2 {
    iconType: string
}

export interface ServiceEndpoint {
    clickTrackingParams: string
    queueAddEndpoint: QueueAddEndpoint
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
    runs: Run8[]
}

export interface Run8 {
    text: string
}

export interface TopLevelButton {
    likeButtonRenderer: LikeButtonRenderer
}

export interface LikeButtonRenderer {
    target: Target
    likeStatus: string
    trackingParams: string
    likesAllowed: boolean
    dislikeNavigationEndpoint: DislikeNavigationEndpoint
    likeCommand: LikeCommand
}

export interface Target {
    videoId: string
}

export interface DislikeNavigationEndpoint {
    clickTrackingParams: string
    modalEndpoint: ModalEndpoint2
}

export interface ModalEndpoint2 {
    modal: Modal2
}

export interface Modal2 {
    modalWithTitleAndButtonRenderer: ModalWithTitleAndButtonRenderer2
}

export interface ModalWithTitleAndButtonRenderer2 {
    title: Title2
    content: Content3
    button: Button2
}

export interface Title2 {
    runs: Run9[]
}

export interface Run9 {
    text: string
}

export interface Content3 {
    runs: Run10[]
}

export interface Run10 {
    text: string
}

export interface Button2 {
    buttonRenderer: ButtonRenderer2
}

export interface ButtonRenderer2 {
    style: string
    isDisabled: boolean
    text: Text6
    navigationEndpoint: NavigationEndpoint4
    trackingParams: string
}

export interface Text6 {
    runs: Run11[]
}

export interface Run11 {
    text: string
}

export interface NavigationEndpoint4 {
    clickTrackingParams: string
    signInEndpoint: SignInEndpoint2
}

export interface SignInEndpoint2 {
    hack: boolean
}

export interface LikeCommand {
    clickTrackingParams: string
    modalEndpoint: ModalEndpoint3
}

export interface ModalEndpoint3 {
    modal: Modal3
}

export interface Modal3 {
    modalWithTitleAndButtonRenderer: ModalWithTitleAndButtonRenderer3
}

export interface ModalWithTitleAndButtonRenderer3 {
    title: Title3
    content: Content4
    button: Button3
}

export interface Title3 {
    runs: Run12[]
}

export interface Run12 {
    text: string
}

export interface Content4 {
    runs: Run13[]
}

export interface Run13 {
    text: string
}

export interface Button3 {
    buttonRenderer: ButtonRenderer3
}

export interface ButtonRenderer3 {
    style: string
    isDisabled: boolean
    text: Text7
    navigationEndpoint: NavigationEndpoint5
    trackingParams: string
}

export interface Text7 {
    runs: Run14[]
}

export interface Run14 {
    text: string
}

export interface NavigationEndpoint5 {
    clickTrackingParams: string
    signInEndpoint: SignInEndpoint3
}

export interface SignInEndpoint3 {
    hack: boolean
}

export interface Accessibility2 {
    accessibilityData: AccessibilityData4
}

export interface AccessibilityData4 {
    label: string
}

export interface Badge {
    musicInlineBadgeRenderer: MusicInlineBadgeRenderer
}

export interface MusicInlineBadgeRenderer {
    trackingParams: string
    icon: Icon3
    accessibilityData: AccessibilityData5
}

export interface Icon3 {
    iconType: string
}

export interface AccessibilityData5 {
    accessibilityData: AccessibilityData6
}

export interface AccessibilityData6 {
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

export interface ContinuationItemRenderer {
    trigger: string
    continuationEndpoint: ContinuationEndpoint
}

export interface ContinuationEndpoint {
    clickTrackingParams: string
    continuationCommand: ContinuationCommand
}

export interface ContinuationCommand {
    token: string
    request: string
}
