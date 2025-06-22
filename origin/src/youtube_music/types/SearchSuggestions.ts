export interface SearchSuggestions {
    responseContext: ResponseContext
    contents: Content[]
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

export interface Content {
    searchSuggestionsSectionRenderer: SearchSuggestionsSectionRenderer
}

export interface SearchSuggestionsSectionRenderer {
    contents: ({historySuggestionRenderer: HistorySuggestionRenderer}|
            {searchSuggestionRenderer: SearchSuggestionRenderer}|
            {musicResponsiveListItemRenderer: SuggestionMusicResponsiveListItemRenderer})[]
}

export interface Content2 {
    historySuggestionRenderer?: HistorySuggestionRenderer
    searchSuggestionRenderer?: SearchSuggestionRenderer
    musicResponsiveListItemRenderer?: SuggestionMusicResponsiveListItemRenderer
}

export interface HistorySuggestionRenderer {
    icon: Icon
    suggestion: Suggestion
    navigationEndpoint: NavigationEndpoint
    trackingParams: string
    serviceEndpoint: ServiceEndpoint
}

export interface Icon {
    iconType: string
}

export interface Suggestion {
    runs: Run[]
}

export interface Run {
    text: string
    bold?: boolean
}

export interface NavigationEndpoint {
    clickTrackingParams: string
    searchEndpoint: SearchEndpoint
}

export interface SearchEndpoint {
    query: string
}

export interface ServiceEndpoint {
    clickTrackingParams: string
    feedbackEndpoint: FeedbackEndpoint
}

export interface FeedbackEndpoint {
    feedbackToken: string
    uiActions: UiActions
    actions: Action[]
}

export interface UiActions {
    hideEnclosingContainer: boolean
}

export interface Action {
    clickTrackingParams: string
    hideEnclosingAction?: HideEnclosingAction
    addToToastAction?: AddToToastAction
}

export interface HideEnclosingAction {
    hack: boolean
}

export interface AddToToastAction {
    item: Item
}

export interface Item {
    notificationTextRenderer: NotificationTextRenderer
}

export interface NotificationTextRenderer {
    successResponseText: SuccessResponseText
    trackingParams: string
}

export interface SuccessResponseText {
    runs: Run2[]
}

export interface Run2 {
    text: string
}

export interface SearchSuggestionRenderer {
    suggestion: Suggestion2
    navigationEndpoint: NavigationEndpoint2
    trackingParams: string
    icon: Icon2
}

export interface Suggestion2 {
    runs: Run3[]
}

export interface Run3 {
    text: string
    bold?: boolean
}

export interface NavigationEndpoint2 {
    clickTrackingParams: string
    searchEndpoint: SearchEndpoint2
}

export interface SearchEndpoint2 {
    query: string
}

export interface Icon2 {
    iconType: string
}

export interface SuggestionMusicResponsiveListItemRenderer {
    trackingParams: string
    thumbnail: Thumbnail
    overlay: Overlay
    flexColumns: FlexColumn[]
    menu: Menu
    badges: Badge[]
    playlistItemData: PlaylistItemData
    flexColumnDisplayStyle: string
    navigationEndpoint: NavigationEndpoint5
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
    content: Content3
    contentPosition: string
    displayStyle: string
}

export interface Background {
    verticalGradient: VerticalGradient
}

export interface VerticalGradient {
    gradientLayerColors: string[]
}

export interface Content3 {
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
    watchEndpointMusicSupportedConfigs: WatchEndpointMusicSupportedConfigs
    playerParams?: string
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
    runs: Run4[]
    accessibility?: Accessibility
}

export interface Run4 {
    text: string
    navigationEndpoint?: NavigationEndpoint3
}

export interface NavigationEndpoint3 {
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
    watchEndpointMusicSupportedConfigs: WatchEndpointMusicSupportedConfigs2
}

export interface WatchEndpointMusicSupportedConfigs2 {
    watchEndpointMusicConfig: WatchEndpointMusicConfig2
}

export interface WatchEndpointMusicConfig2 {
    musicVideoType: string
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
    items: Item2[]
    trackingParams: string
    accessibility: Accessibility2
}

export interface Item2 {
    menuNavigationItemRenderer?: MenuNavigationItemRenderer
    menuServiceItemRenderer?: MenuServiceItemRenderer
    toggleMenuServiceItemRenderer?: ToggleMenuServiceItemRenderer
}

export interface MenuNavigationItemRenderer {
    text: Text2
    icon: Icon3
    navigationEndpoint: NavigationEndpoint4
    trackingParams: string
}

export interface Text2 {
    runs: Run5[]
}

export interface Run5 {
    text: string
}

export interface Icon3 {
    iconType: string
}

export interface NavigationEndpoint4 {
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
    playerParams?: string
    loggingContext: LoggingContext
    watchEndpointMusicSupportedConfigs: WatchEndpointMusicSupportedConfigs3
}

export interface LoggingContext {
    vssLoggingContext: VssLoggingContext
}

export interface VssLoggingContext {
    serializedContextData: string
}

export interface WatchEndpointMusicSupportedConfigs3 {
    watchEndpointMusicConfig: WatchEndpointMusicConfig3
}

export interface WatchEndpointMusicConfig3 {
    musicVideoType: string
}

export interface MenuServiceItemRenderer {
    text: Text3
    icon: Icon4
    serviceEndpoint: ServiceEndpoint2
    trackingParams: string
}

export interface Text3 {
    runs: Run6[]
}

export interface Run6 {
    text: string
}

export interface Icon4 {
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
    addToToastAction: AddToToastAction2
}

export interface AddToToastAction2 {
    item: Item3
}

export interface Item3 {
    notificationTextRenderer: NotificationTextRenderer2
}

export interface NotificationTextRenderer2 {
    successResponseText: SuccessResponseText2
    trackingParams: string
}

export interface SuccessResponseText2 {
    runs: Run7[]
}

export interface Run7 {
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
    runs: Run8[]
}

export interface Run8 {
    text: string
}

export interface DefaultIcon {
    iconType: string
}

export interface DefaultServiceEndpoint {
    clickTrackingParams: string
    feedbackEndpoint: FeedbackEndpoint2
}

export interface FeedbackEndpoint2 {
    feedbackToken: string
}

export interface ToggledText {
    runs: Run9[]
}

export interface Run9 {
    text: string
}

export interface ToggledIcon {
    iconType: string
}

export interface ToggledServiceEndpoint {
    clickTrackingParams: string
    feedbackEndpoint: FeedbackEndpoint3
}

export interface FeedbackEndpoint3 {
    feedbackToken: string
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
    icon: Icon5
    accessibilityData: AccessibilityData5
}

export interface Icon5 {
    iconType: string
}

export interface AccessibilityData5 {
    accessibilityData: AccessibilityData6
}

export interface AccessibilityData6 {
    label: string
}

export interface PlaylistItemData {
    videoId: string
}

export interface NavigationEndpoint5 {
    clickTrackingParams: string
    watchEndpoint: WatchEndpoint5
}

export interface WatchEndpoint5 {
    videoId: string
    watchEndpointMusicSupportedConfigs: WatchEndpointMusicSupportedConfigs4
    playerParams?: string
}

export interface WatchEndpointMusicSupportedConfigs4 {
    watchEndpointMusicConfig: WatchEndpointMusicConfig4
}

export interface WatchEndpointMusicConfig4 {
    musicVideoType: string
}
