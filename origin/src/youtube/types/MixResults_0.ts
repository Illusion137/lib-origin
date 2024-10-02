export interface MixResults_0 {
    responseContext: ResponseContext
    contents: Contents
    currentVideoEndpoint: CurrentVideoEndpoint
    trackingParams: string
    playerOverlays: PlayerOverlays
    onResponseReceivedEndpoints: OnResponseReceivedEndpoint[]
    engagementPanels: EngagementPanel[]
    topbar: Topbar
    pageVisualEffects: PageVisualEffect[]
    frameworkUpdates: FrameworkUpdates
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
    loggedOut: boolean
    trackingParam: string
}

export interface WebResponseContextExtensionData {
    ytConfigData: YtConfigData
    webPrefetchData: WebPrefetchData
    hasDecorated: boolean
}

export interface YtConfigData {
    visitorData: string
    rootVisualElementType: number
}

export interface WebPrefetchData {
    navigationEndpoints: NavigationEndpoint[]
}

export interface NavigationEndpoint {
    clickTrackingParams: string
    commandMetadata: CommandMetadata
    watchEndpoint: WatchEndpoint
}

export interface CommandMetadata {
    webCommandMetadata: WebCommandMetadata
}

export interface WebCommandMetadata {
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
    watchEndpointSupportedPrefetchConfig: WatchEndpointSupportedPrefetchConfig
}

export interface LoggingContext {
    vssLoggingContext: VssLoggingContext
}

export interface VssLoggingContext {
    serializedContextData: string
}

export interface WatchEndpointSupportedPrefetchConfig {
    prefetchHintConfig: PrefetchHintConfig
}

export interface PrefetchHintConfig {
    prefetchPriority: number
    playbackRelativeSecondsPrefetchCondition: number
}

export interface Contents {
    twoColumnWatchNextResults: TwoColumnWatchNextResults
}

export interface TwoColumnWatchNextResults {
    results: Results
    secondaryResults: SecondaryResults
    playlist: Playlist
    autoplay: Autoplay
}

export interface Results {
    results: Results2
}

export interface Results2 {
    contents: Content[]
    trackingParams: string
}

export interface Content {
    videoPrimaryInfoRenderer?: VideoPrimaryInfoRenderer
    videoSecondaryInfoRenderer?: VideoSecondaryInfoRenderer
    itemSectionRenderer?: ItemSectionRenderer
}

export interface VideoPrimaryInfoRenderer {
    title: Title
    viewCount: ViewCount
    videoActions: VideoActions
    trackingParams: string
    dateText: DateText
    relativeDateText: RelativeDateText
}

export interface Title {
    runs: Run[]
}

export interface Run {
    text: string
}

export interface ViewCount {
    videoViewCountRenderer: VideoViewCountRenderer
}

export interface VideoViewCountRenderer {
    viewCount: ViewCount2
    shortViewCount: ShortViewCount
    originalViewCount: string
}

export interface ViewCount2 {
    simpleText: string
}

export interface ShortViewCount {
    simpleText: string
}

export interface VideoActions {
    menuRenderer: MenuRenderer
}

export interface MenuRenderer {
    items: Item[]
    trackingParams: string
    topLevelButtons: TopLevelButton[]
    accessibility: Accessibility
    flexibleItems: FlexibleItem[]
}

export interface Item {
    menuNavigationItemRenderer: MenuNavigationItemRenderer
}

export interface MenuNavigationItemRenderer {
    text: Text
    icon: Icon
    navigationEndpoint: NavigationEndpoint2
    trackingParams: string
}

export interface Text {
    runs: Run2[]
}

export interface Run2 {
    text: string
}

export interface Icon {
    iconType: string
}

export interface NavigationEndpoint2 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata2
    modalEndpoint: ModalEndpoint
}

export interface CommandMetadata2 {
    webCommandMetadata: WebCommandMetadata2
}

export interface WebCommandMetadata2 {
    ignoreNavigation: boolean
}

export interface ModalEndpoint {
    modal: Modal
}

export interface Modal {
    modalWithTitleAndButtonRenderer: ModalWithTitleAndButtonRenderer
}

export interface ModalWithTitleAndButtonRenderer {
    title: Title2
    content: Content2
    button: Button
}

export interface Title2 {
    runs: Run3[]
}

export interface Run3 {
    text: string
}

export interface Content2 {
    runs: Run4[]
}

export interface Run4 {
    text: string
}

export interface Button {
    buttonRenderer: ButtonRenderer
}

export interface ButtonRenderer {
    style: string
    size: string
    isDisabled: boolean
    text: Text2
    navigationEndpoint: NavigationEndpoint3
    trackingParams: string
}

export interface Text2 {
    simpleText: string
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

export interface TopLevelButton {
    segmentedLikeDislikeButtonViewModel?: SegmentedLikeDislikeButtonViewModel
    buttonViewModel?: ButtonViewModel5
}

export interface SegmentedLikeDislikeButtonViewModel {
    likeButtonViewModel: LikeButtonViewModel
    dislikeButtonViewModel: DislikeButtonViewModel
    iconType: string
    likeCountEntity: LikeCountEntity
    dynamicLikeCountUpdateData: DynamicLikeCountUpdateData
}

export interface LikeButtonViewModel {
    likeButtonViewModel: LikeButtonViewModel2
}

export interface LikeButtonViewModel2 {
    toggleButtonViewModel: ToggleButtonViewModel
    likeStatusEntityKey: string
    likeStatusEntity: LikeStatusEntity
}

export interface ToggleButtonViewModel {
    toggleButtonViewModel: ToggleButtonViewModel2
}

export interface ToggleButtonViewModel2 {
    defaultButtonViewModel: DefaultButtonViewModel
    toggledButtonViewModel: ToggledButtonViewModel
    identifier: string
    trackingParams: string
    isTogglingDisabled: boolean
}

export interface DefaultButtonViewModel {
    buttonViewModel: ButtonViewModel
}

export interface ButtonViewModel {
    iconName: string
    title: string
    onTap: OnTap
    accessibilityText: string
    style: string
    trackingParams: string
    isFullWidth: boolean
    type: string
    buttonSize: string
    accessibilityId: string
    tooltip: string
}

export interface OnTap {
    serialCommand: SerialCommand
}

export interface SerialCommand {
    commands: Command[]
}

export interface Command {
    logGestureCommand?: LogGestureCommand
    innertubeCommand?: InnertubeCommand
}

export interface LogGestureCommand {
    gestureType: string
    trackingParams: string
}

export interface InnertubeCommand {
    clickTrackingParams: string
    commandMetadata: CommandMetadata4
    modalEndpoint: ModalEndpoint2
}

export interface CommandMetadata4 {
    webCommandMetadata: WebCommandMetadata4
}

export interface WebCommandMetadata4 {
    ignoreNavigation: boolean
}

export interface ModalEndpoint2 {
    modal: Modal2
}

export interface Modal2 {
    modalWithTitleAndButtonRenderer: ModalWithTitleAndButtonRenderer2
}

export interface ModalWithTitleAndButtonRenderer2 {
    title: Title3
    content: Content3
    button: Button2
}

export interface Title3 {
    simpleText: string
}

export interface Content3 {
    simpleText: string
}

export interface Button2 {
    buttonRenderer: ButtonRenderer2
}

export interface ButtonRenderer2 {
    style: string
    size: string
    isDisabled: boolean
    text: Text3
    navigationEndpoint: NavigationEndpoint4
    trackingParams: string
}

export interface Text3 {
    simpleText: string
}

export interface NavigationEndpoint4 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata5
    signInEndpoint: SignInEndpoint2
}

export interface CommandMetadata5 {
    webCommandMetadata: WebCommandMetadata5
}

export interface WebCommandMetadata5 {
    url: string
    webPageType: string
    rootVe: number
}

export interface SignInEndpoint2 {
    nextEndpoint: NextEndpoint
    idamTag: string
}

export interface NextEndpoint {
    clickTrackingParams: string
    commandMetadata: CommandMetadata6
    likeEndpoint: LikeEndpoint
}

export interface CommandMetadata6 {
    webCommandMetadata: WebCommandMetadata6
}

export interface WebCommandMetadata6 {
    sendPost: boolean
    apiUrl: string
}

export interface LikeEndpoint {
    status: string
    target: Target
    likeParams: string
}

export interface Target {
    videoId: string
}

export interface ToggledButtonViewModel {
    buttonViewModel: ButtonViewModel2
}

export interface ButtonViewModel2 {
    iconName: string
    title: string
    onTap: OnTap2
    accessibilityText: string
    style: string
    trackingParams: string
    isFullWidth: boolean
    type: string
    buttonSize: string
    accessibilityId: string
    tooltip: string
}

export interface OnTap2 {
    serialCommand: SerialCommand2
}

export interface SerialCommand2 {
    commands: Command2[]
}

export interface Command2 {
    logGestureCommand?: LogGestureCommand2
    innertubeCommand?: InnertubeCommand2
}

export interface LogGestureCommand2 {
    gestureType: string
    trackingParams: string
}

export interface InnertubeCommand2 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata7
    likeEndpoint: LikeEndpoint2
}

export interface CommandMetadata7 {
    webCommandMetadata: WebCommandMetadata7
}

export interface WebCommandMetadata7 {
    sendPost: boolean
    apiUrl: string
}

export interface LikeEndpoint2 {
    status: string
    target: Target2
    removeLikeParams: string
}

export interface Target2 {
    videoId: string
}

export interface LikeStatusEntity {
    key: string
    likeStatus: string
}

export interface DislikeButtonViewModel {
    dislikeButtonViewModel: DislikeButtonViewModel2
}

export interface DislikeButtonViewModel2 {
    toggleButtonViewModel: ToggleButtonViewModel3
    dislikeEntityKey: string
}

export interface ToggleButtonViewModel3 {
    toggleButtonViewModel: ToggleButtonViewModel4
}

export interface ToggleButtonViewModel4 {
    defaultButtonViewModel: DefaultButtonViewModel2
    toggledButtonViewModel: ToggledButtonViewModel2
    trackingParams: string
    isTogglingDisabled: boolean
}

export interface DefaultButtonViewModel2 {
    buttonViewModel: ButtonViewModel3
}

export interface ButtonViewModel3 {
    iconName: string
    title: string
    onTap: OnTap3
    accessibilityText: string
    style: string
    trackingParams: string
    isFullWidth: boolean
    type: string
    buttonSize: string
    accessibilityId: string
    tooltip: string
}

export interface OnTap3 {
    serialCommand: SerialCommand3
}

export interface SerialCommand3 {
    commands: Command3[]
}

export interface Command3 {
    logGestureCommand?: LogGestureCommand3
    innertubeCommand?: InnertubeCommand3
}

export interface LogGestureCommand3 {
    gestureType: string
    trackingParams: string
}

export interface InnertubeCommand3 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata8
    modalEndpoint: ModalEndpoint3
}

export interface CommandMetadata8 {
    webCommandMetadata: WebCommandMetadata8
}

export interface WebCommandMetadata8 {
    ignoreNavigation: boolean
}

export interface ModalEndpoint3 {
    modal: Modal3
}

export interface Modal3 {
    modalWithTitleAndButtonRenderer: ModalWithTitleAndButtonRenderer3
}

export interface ModalWithTitleAndButtonRenderer3 {
    title: Title4
    content: Content4
    button: Button3
}

export interface Title4 {
    simpleText: string
}

export interface Content4 {
    simpleText: string
}

export interface Button3 {
    buttonRenderer: ButtonRenderer3
}

export interface ButtonRenderer3 {
    style: string
    size: string
    isDisabled: boolean
    text: Text4
    navigationEndpoint: NavigationEndpoint5
    trackingParams: string
}

export interface Text4 {
    simpleText: string
}

export interface NavigationEndpoint5 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata9
    signInEndpoint: SignInEndpoint3
}

export interface CommandMetadata9 {
    webCommandMetadata: WebCommandMetadata9
}

export interface WebCommandMetadata9 {
    url: string
    webPageType: string
    rootVe: number
}

export interface SignInEndpoint3 {
    nextEndpoint: NextEndpoint2
    idamTag: string
}

export interface NextEndpoint2 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata10
    likeEndpoint: LikeEndpoint3
}

export interface CommandMetadata10 {
    webCommandMetadata: WebCommandMetadata10
}

export interface WebCommandMetadata10 {
    sendPost: boolean
    apiUrl: string
}

export interface LikeEndpoint3 {
    status: string
    target: Target3
    dislikeParams: string
}

export interface Target3 {
    videoId: string
}

export interface ToggledButtonViewModel2 {
    buttonViewModel: ButtonViewModel4
}

export interface ButtonViewModel4 {
    iconName: string
    title: string
    onTap: OnTap4
    accessibilityText: string
    style: string
    trackingParams: string
    isFullWidth: boolean
    type: string
    buttonSize: string
    accessibilityId: string
    tooltip: string
}

export interface OnTap4 {
    serialCommand: SerialCommand4
}

export interface SerialCommand4 {
    commands: Command4[]
}

export interface Command4 {
    logGestureCommand?: LogGestureCommand4
    innertubeCommand?: InnertubeCommand4
}

export interface LogGestureCommand4 {
    gestureType: string
    trackingParams: string
}

export interface InnertubeCommand4 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata11
    likeEndpoint: LikeEndpoint4
}

export interface CommandMetadata11 {
    webCommandMetadata: WebCommandMetadata11
}

export interface WebCommandMetadata11 {
    sendPost: boolean
    apiUrl: string
}

export interface LikeEndpoint4 {
    status: string
    target: Target4
    removeLikeParams: string
}

export interface Target4 {
    videoId: string
}

export interface LikeCountEntity {
    key: string
}

export interface DynamicLikeCountUpdateData {
    updateStatusKey: string
    placeholderLikeCountValuesKey: string
    updateDelayLoopId: string
    updateDelaySec: number
}

export interface ButtonViewModel5 {
    iconName: string
    title: string
    onTap: OnTap5
    accessibilityText: string
    style: string
    trackingParams: string
    isFullWidth: boolean
    type: string
    buttonSize: string
    state: string
    accessibilityId: string
    tooltip: string
}

export interface OnTap5 {
    serialCommand: SerialCommand5
}

export interface SerialCommand5 {
    commands: Command5[]
}

export interface Command5 {
    logGestureCommand?: LogGestureCommand5
    innertubeCommand?: InnertubeCommand5
}

export interface LogGestureCommand5 {
    gestureType: string
    trackingParams: string
}

export interface InnertubeCommand5 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata12
    shareEntityServiceEndpoint: ShareEntityServiceEndpoint
}

export interface CommandMetadata12 {
    webCommandMetadata: WebCommandMetadata12
}

export interface WebCommandMetadata12 {
    sendPost: boolean
    apiUrl: string
}

export interface ShareEntityServiceEndpoint {
    serializedShareEntity: string
    commands: Command6[]
}

export interface Command6 {
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

export interface Accessibility {
    accessibilityData: AccessibilityData
}

export interface AccessibilityData {
    label: string
}

export interface FlexibleItem {
    menuFlexibleItemRenderer: MenuFlexibleItemRenderer
}

export interface MenuFlexibleItemRenderer {
    menuItem: MenuItem
    topLevelButton: TopLevelButton2
}

export interface MenuItem {
    menuServiceItemDownloadRenderer?: MenuServiceItemDownloadRenderer
    menuServiceItemRenderer?: MenuServiceItemRenderer
}

export interface MenuServiceItemDownloadRenderer {
    serviceEndpoint: ServiceEndpoint
    trackingParams: string
}

export interface ServiceEndpoint {
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
    offlineabilityEntityKey: string
}

export interface MenuServiceItemRenderer {
    text: Text5
    icon: Icon2
    serviceEndpoint: ServiceEndpoint2
    trackingParams: string
}

export interface Text5 {
    runs: Run5[]
}

export interface Run5 {
    text: string
}

export interface Icon2 {
    iconType: string
}

export interface ServiceEndpoint2 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata13
    modalEndpoint: ModalEndpoint4
}

export interface CommandMetadata13 {
    webCommandMetadata: WebCommandMetadata13
}

export interface WebCommandMetadata13 {
    ignoreNavigation: boolean
}

export interface ModalEndpoint4 {
    modal: Modal4
}

export interface Modal4 {
    modalWithTitleAndButtonRenderer: ModalWithTitleAndButtonRenderer4
}

export interface ModalWithTitleAndButtonRenderer4 {
    title: Title5
    content: Content5
    button: Button4
}

export interface Title5 {
    runs: Run6[]
}

export interface Run6 {
    text: string
}

export interface Content5 {
    runs: Run7[]
}

export interface Run7 {
    text: string
}

export interface Button4 {
    buttonRenderer: ButtonRenderer4
}

export interface ButtonRenderer4 {
    style: string
    size: string
    isDisabled: boolean
    text: Text6
    navigationEndpoint: NavigationEndpoint6
    trackingParams: string
}

export interface Text6 {
    simpleText: string
}

export interface NavigationEndpoint6 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata14
    signInEndpoint: SignInEndpoint4
}

export interface CommandMetadata14 {
    webCommandMetadata: WebCommandMetadata14
}

export interface WebCommandMetadata14 {
    url: string
    webPageType: string
    rootVe: number
}

export interface SignInEndpoint4 {
    nextEndpoint: NextEndpoint3
    idamTag: string
}

export interface NextEndpoint3 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata15
    watchEndpoint: WatchEndpoint2
}

export interface CommandMetadata15 {
    webCommandMetadata: WebCommandMetadata15
}

export interface WebCommandMetadata15 {
    url: string
    webPageType: string
    rootVe: number
}

export interface WatchEndpoint2 {
    videoId: string
    playlistId: string
    loggingContext: LoggingContext2
    watchEndpointSupportedOnesieConfig: WatchEndpointSupportedOnesieConfig
}

export interface LoggingContext2 {
    vssLoggingContext: VssLoggingContext2
}

export interface VssLoggingContext2 {
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

export interface TopLevelButton2 {
    downloadButtonRenderer?: DownloadButtonRenderer
    buttonViewModel?: ButtonViewModel6
}

export interface DownloadButtonRenderer {
    trackingParams: string
    style: string
    size: string
    targetId: string
    command: Command7
}

export interface Command7 {
    clickTrackingParams: string
    offlineVideoEndpoint: OfflineVideoEndpoint2
}

export interface OfflineVideoEndpoint2 {
    videoId: string
    onAddCommand: OnAddCommand2
}

export interface OnAddCommand2 {
    clickTrackingParams: string
    getDownloadActionCommand: GetDownloadActionCommand2
}

export interface GetDownloadActionCommand2 {
    videoId: string
    params: string
    offlineabilityEntityKey: string
}

export interface ButtonViewModel6 {
    iconName: string
    title: string
    onTap: OnTap6
    accessibilityText: string
    style: string
    trackingParams: string
    isFullWidth: boolean
    type: string
    buttonSize: string
    tooltip: string
}

export interface OnTap6 {
    serialCommand: SerialCommand6
}

export interface SerialCommand6 {
    commands: Command8[]
}

export interface Command8 {
    logGestureCommand?: LogGestureCommand6
    innertubeCommand?: InnertubeCommand6
}

export interface LogGestureCommand6 {
    gestureType: string
    trackingParams: string
}

export interface InnertubeCommand6 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata16
    modalEndpoint: ModalEndpoint5
}

export interface CommandMetadata16 {
    webCommandMetadata: WebCommandMetadata16
}

export interface WebCommandMetadata16 {
    ignoreNavigation: boolean
}

export interface ModalEndpoint5 {
    modal: Modal5
}

export interface Modal5 {
    modalWithTitleAndButtonRenderer: ModalWithTitleAndButtonRenderer5
}

export interface ModalWithTitleAndButtonRenderer5 {
    title: Title6
    content: Content6
    button: Button5
}

export interface Title6 {
    runs: Run8[]
}

export interface Run8 {
    text: string
}

export interface Content6 {
    runs: Run9[]
}

export interface Run9 {
    text: string
}

export interface Button5 {
    buttonRenderer: ButtonRenderer5
}

export interface ButtonRenderer5 {
    style: string
    size: string
    isDisabled: boolean
    text: Text7
    navigationEndpoint: NavigationEndpoint7
    trackingParams: string
}

export interface Text7 {
    simpleText: string
}

export interface NavigationEndpoint7 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata17
    signInEndpoint: SignInEndpoint5
}

export interface CommandMetadata17 {
    webCommandMetadata: WebCommandMetadata17
}

export interface WebCommandMetadata17 {
    url: string
    webPageType: string
    rootVe: number
}

export interface SignInEndpoint5 {
    nextEndpoint: NextEndpoint4
    idamTag: string
}

export interface NextEndpoint4 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata18
    watchEndpoint: WatchEndpoint3
}

export interface CommandMetadata18 {
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
    loggingContext: LoggingContext3
    watchEndpointSupportedOnesieConfig: WatchEndpointSupportedOnesieConfig2
}

export interface LoggingContext3 {
    vssLoggingContext: VssLoggingContext3
}

export interface VssLoggingContext3 {
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

export interface DateText {
    simpleText: string
}

export interface RelativeDateText {
    accessibility: Accessibility2
    simpleText: string
}

export interface Accessibility2 {
    accessibilityData: AccessibilityData2
}

export interface AccessibilityData2 {
    label: string
}

export interface VideoSecondaryInfoRenderer {
    owner: Owner
    subscribeButton: SubscribeButton
    metadataRowContainer: MetadataRowContainer
    showMoreText: ShowMoreText
    showLessText: ShowLessText
    trackingParams: string
    defaultExpanded: boolean
    descriptionCollapsedLines: number
    showMoreCommand: ShowMoreCommand
    showLessCommand: ShowLessCommand
    attributedDescription: AttributedDescription
    headerRuns: HeaderRun[]
}

export interface Owner {
    videoOwnerRenderer: VideoOwnerRenderer
}

export interface VideoOwnerRenderer {
    thumbnail: Thumbnail
    title: Title7
    subscriptionButton: SubscriptionButton
    navigationEndpoint: NavigationEndpoint9
    subscriberCountText: SubscriberCountText
    trackingParams: string
    badges: Badge[]
}

export interface Thumbnail {
    thumbnails: Thumbnail2[]
}

export interface Thumbnail2 {
    url: string
    width: number
    height: number
}

export interface Title7 {
    runs: Run10[]
}

export interface Run10 {
    text: string
    navigationEndpoint: NavigationEndpoint8
}

export interface NavigationEndpoint8 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata19
    browseEndpoint: BrowseEndpoint
}

export interface CommandMetadata19 {
    webCommandMetadata: WebCommandMetadata19
}

export interface WebCommandMetadata19 {
    url: string
    webPageType: string
    rootVe: number
    apiUrl: string
}

export interface BrowseEndpoint {
    browseId: string
    canonicalBaseUrl: string
}

export interface SubscriptionButton {
    type: string
}

export interface NavigationEndpoint9 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata20
    browseEndpoint: BrowseEndpoint2
}

export interface CommandMetadata20 {
    webCommandMetadata: WebCommandMetadata20
}

export interface WebCommandMetadata20 {
    url: string
    webPageType: string
    rootVe: number
    apiUrl: string
}

export interface BrowseEndpoint2 {
    browseId: string
    canonicalBaseUrl: string
}

export interface SubscriberCountText {
    accessibility: Accessibility3
    simpleText: string
}

export interface Accessibility3 {
    accessibilityData: AccessibilityData3
}

export interface AccessibilityData3 {
    label: string
}

export interface Badge {
    metadataBadgeRenderer: MetadataBadgeRenderer
}

export interface MetadataBadgeRenderer {
    icon: Icon3
    style: string
    tooltip: string
    trackingParams: string
    accessibilityData: AccessibilityData4
}

export interface Icon3 {
    iconType: string
}

export interface AccessibilityData4 {
    label: string
}

export interface SubscribeButton {
    subscribeButtonRenderer: SubscribeButtonRenderer
}

export interface SubscribeButtonRenderer {
    buttonText: ButtonText
    subscribed: boolean
    enabled: boolean
    type: string
    channelId: string
    showPreferences: boolean
    subscribedButtonText: SubscribedButtonText
    unsubscribedButtonText: UnsubscribedButtonText
    trackingParams: string
    unsubscribeButtonText: UnsubscribeButtonText
    subscribeAccessibility: SubscribeAccessibility
    unsubscribeAccessibility: UnsubscribeAccessibility
    notificationPreferenceButton: NotificationPreferenceButton
    targetId: string
    signInEndpoint: SignInEndpoint6
    subscribedEntityKey: string
    onSubscribeEndpoints: OnSubscribeEndpoint[]
    onUnsubscribeEndpoints: OnUnsubscribeEndpoint[]
}

export interface ButtonText {
    runs: Run11[]
}

export interface Run11 {
    text: string
}

export interface SubscribedButtonText {
    runs: Run12[]
}

export interface Run12 {
    text: string
}

export interface UnsubscribedButtonText {
    runs: Run13[]
}

export interface Run13 {
    text: string
}

export interface UnsubscribeButtonText {
    runs: Run14[]
}

export interface Run14 {
    text: string
}

export interface SubscribeAccessibility {
    accessibilityData: AccessibilityData5
}

export interface AccessibilityData5 {
    label: string
}

export interface UnsubscribeAccessibility {
    accessibilityData: AccessibilityData6
}

export interface AccessibilityData6 {
    label: string
}

export interface NotificationPreferenceButton {
    subscriptionNotificationToggleButtonRenderer: SubscriptionNotificationToggleButtonRenderer
}

export interface SubscriptionNotificationToggleButtonRenderer {
    states: State[]
    currentStateId: number
    trackingParams: string
    command: Command9
    targetId: string
    secondaryIcon: SecondaryIcon
}

export interface State {
    stateId: number
    nextStateId: number
    state: State2
}

export interface State2 {
    buttonRenderer: ButtonRenderer6
}

export interface ButtonRenderer6 {
    style: string
    size: string
    isDisabled: boolean
    icon: Icon4
    accessibility: Accessibility4
    trackingParams: string
    accessibilityData: AccessibilityData7
}

export interface Icon4 {
    iconType: string
}

export interface Accessibility4 {
    label: string
}

export interface AccessibilityData7 {
    accessibilityData: AccessibilityData8
}

export interface AccessibilityData8 {
    label: string
}

export interface Command9 {
    clickTrackingParams: string
    commandExecutorCommand: CommandExecutorCommand
}

export interface CommandExecutorCommand {
    commands: Command10[]
}

export interface Command10 {
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
    items: Item2[]
}

export interface Item2 {
    menuServiceItemRenderer: MenuServiceItemRenderer2
}

export interface MenuServiceItemRenderer2 {
    text: Text8
    icon: Icon5
    serviceEndpoint: ServiceEndpoint3
    trackingParams: string
    isSelected?: boolean
}

export interface Text8 {
    simpleText?: string
    runs?: Run15[]
}

export interface Run15 {
    text: string
}

export interface Icon5 {
    iconType: string
}

export interface ServiceEndpoint3 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata21
    modifyChannelNotificationPreferenceEndpoint?: ModifyChannelNotificationPreferenceEndpoint
    signalServiceEndpoint?: SignalServiceEndpoint
}

export interface CommandMetadata21 {
    webCommandMetadata: WebCommandMetadata21
}

export interface WebCommandMetadata21 {
    sendPost: boolean
    apiUrl?: string
}

export interface ModifyChannelNotificationPreferenceEndpoint {
    params: string
}

export interface SignalServiceEndpoint {
    signal: string
    actions: Action[]
}

export interface Action {
    clickTrackingParams: string
    openPopupAction: OpenPopupAction3
}

export interface OpenPopupAction3 {
    popup: Popup3
    popupType: string
}

export interface Popup3 {
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
    runs: Run16[]
}

export interface Run16 {
    text: string
}

export interface ConfirmButton {
    buttonRenderer: ButtonRenderer7
}

export interface ButtonRenderer7 {
    style: string
    size: string
    isDisabled: boolean
    text: Text9
    serviceEndpoint: ServiceEndpoint4
    accessibility: Accessibility5
    trackingParams: string
}

export interface Text9 {
    runs: Run17[]
}

export interface Run17 {
    text: string
}

export interface ServiceEndpoint4 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata22
    unsubscribeEndpoint: UnsubscribeEndpoint
}

export interface CommandMetadata22 {
    webCommandMetadata: WebCommandMetadata22
}

export interface WebCommandMetadata22 {
    sendPost: boolean
    apiUrl: string
}

export interface UnsubscribeEndpoint {
    channelIds: string[]
    params: string
}

export interface Accessibility5 {
    label: string
}

export interface CancelButton {
    buttonRenderer: ButtonRenderer8
}

export interface ButtonRenderer8 {
    style: string
    size: string
    isDisabled: boolean
    text: Text10
    accessibility: Accessibility6
    trackingParams: string
}

export interface Text10 {
    runs: Run18[]
}

export interface Run18 {
    text: string
}

export interface Accessibility6 {
    label: string
}

export interface SecondaryIcon {
    iconType: string
}

export interface SignInEndpoint6 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata23
    modalEndpoint: ModalEndpoint6
}

export interface CommandMetadata23 {
    webCommandMetadata: WebCommandMetadata23
}

export interface WebCommandMetadata23 {
    ignoreNavigation: boolean
}

export interface ModalEndpoint6 {
    modal: Modal6
}

export interface Modal6 {
    modalWithTitleAndButtonRenderer: ModalWithTitleAndButtonRenderer6
}

export interface ModalWithTitleAndButtonRenderer6 {
    title: Title8
    content: Content7
    button: Button6
}

export interface Title8 {
    simpleText: string
}

export interface Content7 {
    simpleText: string
}

export interface Button6 {
    buttonRenderer: ButtonRenderer9
}

export interface ButtonRenderer9 {
    style: string
    size: string
    isDisabled: boolean
    text: Text11
    navigationEndpoint: NavigationEndpoint10
    trackingParams: string
}

export interface Text11 {
    simpleText: string
}

export interface NavigationEndpoint10 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata24
    signInEndpoint: SignInEndpoint7
}

export interface CommandMetadata24 {
    webCommandMetadata: WebCommandMetadata24
}

export interface WebCommandMetadata24 {
    url: string
    webPageType: string
    rootVe: number
}

export interface SignInEndpoint7 {
    nextEndpoint: NextEndpoint5
    continueAction: string
    idamTag: string
}

export interface NextEndpoint5 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata25
    watchEndpoint: WatchEndpoint4
}

export interface CommandMetadata25 {
    webCommandMetadata: WebCommandMetadata25
}

export interface WebCommandMetadata25 {
    url: string
    webPageType: string
    rootVe: number
}

export interface WatchEndpoint4 {
    videoId: string
    playlistId: string
    loggingContext: LoggingContext4
    watchEndpointSupportedOnesieConfig: WatchEndpointSupportedOnesieConfig3
}

export interface LoggingContext4 {
    vssLoggingContext: VssLoggingContext4
}

export interface VssLoggingContext4 {
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

export interface OnSubscribeEndpoint {
    clickTrackingParams: string
    commandMetadata: CommandMetadata26
    subscribeEndpoint: SubscribeEndpoint
}

export interface CommandMetadata26 {
    webCommandMetadata: WebCommandMetadata26
}

export interface WebCommandMetadata26 {
    sendPost: boolean
    apiUrl: string
}

export interface SubscribeEndpoint {
    channelIds: string[]
    params: string
}

export interface OnUnsubscribeEndpoint {
    clickTrackingParams: string
    commandMetadata: CommandMetadata27
    signalServiceEndpoint: SignalServiceEndpoint2
}

export interface CommandMetadata27 {
    webCommandMetadata: WebCommandMetadata27
}

export interface WebCommandMetadata27 {
    sendPost: boolean
}

export interface SignalServiceEndpoint2 {
    signal: string
    actions: Action2[]
}

export interface Action2 {
    clickTrackingParams: string
    openPopupAction: OpenPopupAction4
}

export interface OpenPopupAction4 {
    popup: Popup4
    popupType: string
}

export interface Popup4 {
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
    runs: Run19[]
}

export interface Run19 {
    text: string
}

export interface ConfirmButton2 {
    buttonRenderer: ButtonRenderer10
}

export interface ButtonRenderer10 {
    style: string
    size: string
    isDisabled: boolean
    text: Text12
    serviceEndpoint: ServiceEndpoint5
    accessibility: Accessibility7
    trackingParams: string
}

export interface Text12 {
    runs: Run20[]
}

export interface Run20 {
    text: string
}

export interface ServiceEndpoint5 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata28
    unsubscribeEndpoint: UnsubscribeEndpoint2
}

export interface CommandMetadata28 {
    webCommandMetadata: WebCommandMetadata28
}

export interface WebCommandMetadata28 {
    sendPost: boolean
    apiUrl: string
}

export interface UnsubscribeEndpoint2 {
    channelIds: string[]
    params: string
}

export interface Accessibility7 {
    label: string
}

export interface CancelButton2 {
    buttonRenderer: ButtonRenderer11
}

export interface ButtonRenderer11 {
    style: string
    size: string
    isDisabled: boolean
    text: Text13
    accessibility: Accessibility8
    trackingParams: string
}

export interface Text13 {
    runs: Run21[]
}

export interface Run21 {
    text: string
}

export interface Accessibility8 {
    label: string
}

export interface MetadataRowContainer {
    metadataRowContainerRenderer: MetadataRowContainerRenderer
}

export interface MetadataRowContainerRenderer {
    collapsedItemCount: number
    trackingParams: string
}

export interface ShowMoreText {
    simpleText: string
}

export interface ShowLessText {
    simpleText: string
}

export interface ShowMoreCommand {
    clickTrackingParams: string
    commandExecutorCommand: CommandExecutorCommand2
}

export interface CommandExecutorCommand2 {
    commands: Command11[]
}

export interface Command11 {
    clickTrackingParams: string
    changeEngagementPanelVisibilityAction?: ChangeEngagementPanelVisibilityAction
    scrollToEngagementPanelCommand?: ScrollToEngagementPanelCommand
}

export interface ChangeEngagementPanelVisibilityAction {
    targetId: string
    visibility: string
}

export interface ScrollToEngagementPanelCommand {
    targetId: string
}

export interface ShowLessCommand {
    clickTrackingParams: string
    changeEngagementPanelVisibilityAction: ChangeEngagementPanelVisibilityAction2
}

export interface ChangeEngagementPanelVisibilityAction2 {
    targetId: string
    visibility: string
}

export interface AttributedDescription {
    content: string
    styleRuns: StyleRun[]
}

export interface StyleRun {
    startIndex: number
    length: number
    styleRunExtensions: StyleRunExtensions
    fontFamilyName: string
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

export interface HeaderRun {
    startIndex: number
    length: number
    headerMapping: string
}

export interface ItemSectionRenderer {
    contents: Content8[]
    trackingParams: string
    sectionIdentifier: string
    targetId?: string
}

export interface Content8 {
    continuationItemRenderer?: ContinuationItemRenderer
    commentsEntryPointHeaderRenderer?: CommentsEntryPointHeaderRenderer
}

export interface ContinuationItemRenderer {
    trigger: string
    continuationEndpoint: ContinuationEndpoint
}

export interface ContinuationEndpoint {
    clickTrackingParams: string
    commandMetadata: CommandMetadata29
    continuationCommand: ContinuationCommand
}

export interface CommandMetadata29 {
    webCommandMetadata: WebCommandMetadata29
}

export interface WebCommandMetadata29 {
    sendPost: boolean
    apiUrl: string
}

export interface ContinuationCommand {
    token: string
    request: string
}

export interface CommentsEntryPointHeaderRenderer {
    headerText: HeaderText
    onTap: OnTap7
    trackingParams: string
    commentCount: CommentCount
    contentRenderer: ContentRenderer
    targetId: string
}

export interface HeaderText {
    runs: Run22[]
}

export interface Run22 {
    text: string
}

export interface OnTap7 {
    clickTrackingParams: string
    commandExecutorCommand: CommandExecutorCommand3
}

export interface CommandExecutorCommand3 {
    commands: Command12[]
}

export interface Command12 {
    clickTrackingParams: string
    changeEngagementPanelVisibilityAction?: ChangeEngagementPanelVisibilityAction3
    scrollToEngagementPanelCommand?: ScrollToEngagementPanelCommand2
}

export interface ChangeEngagementPanelVisibilityAction3 {
    targetId: string
    visibility: string
}

export interface ScrollToEngagementPanelCommand2 {
    targetId: string
}

export interface CommentCount {
    simpleText: string
}

export interface ContentRenderer {
    commentsEntryPointTeaserRenderer: CommentsEntryPointTeaserRenderer
}

export interface CommentsEntryPointTeaserRenderer {
    teaserAvatar: TeaserAvatar
    teaserContent: TeaserContent
    trackingParams: string
}

export interface TeaserAvatar {
    thumbnails: Thumbnail3[]
    accessibility: Accessibility9
}

export interface Thumbnail3 {
    url: string
    width: number
    height: number
}

export interface Accessibility9 {
    accessibilityData: AccessibilityData9
}

export interface AccessibilityData9 {
    label: string
}

export interface TeaserContent {
    simpleText: string
}

export interface SecondaryResults {
    secondaryResults: SecondaryResults2
}

export interface SecondaryResults2 {
    results: Result[]
    trackingParams: string
    targetId: string
}

export interface Result {
    compactVideoRenderer?: CompactVideoRenderer
    continuationItemRenderer?: ContinuationItemRenderer2
}

export interface CompactVideoRenderer {
    videoId: string
    thumbnail: Thumbnail4
    title: Title9
    longBylineText: LongBylineText
    publishedTimeText: PublishedTimeText
    viewCountText: ViewCountText
    lengthText: LengthText
    navigationEndpoint: NavigationEndpoint12
    shortBylineText: ShortBylineText
    channelThumbnail: ChannelThumbnail
    ownerBadges?: OwnerBadge[]
    trackingParams: string
    shortViewCountText: ShortViewCountText
    menu: Menu
    thumbnailOverlays: ThumbnailOverlay[]
    accessibility: Accessibility15
    badges?: Badge2[]
    richThumbnail?: RichThumbnail
}

export interface Thumbnail4 {
    thumbnails: Thumbnail5[]
}

export interface Thumbnail5 {
    url: string
    width: number
    height: number
}

export interface Title9 {
    accessibility: Accessibility10
    simpleText: string
}

export interface Accessibility10 {
    accessibilityData: AccessibilityData10
}

export interface AccessibilityData10 {
    label: string
}

export interface LongBylineText {
    runs: Run23[]
}

export interface Run23 {
    text: string
    navigationEndpoint: NavigationEndpoint11
}

export interface NavigationEndpoint11 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata30
    browseEndpoint: BrowseEndpoint3
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

export interface BrowseEndpoint3 {
    browseId: string
    canonicalBaseUrl: string
}

export interface PublishedTimeText {
    simpleText: string
}

export interface ViewCountText {
    simpleText: string
}

export interface LengthText {
    accessibility: Accessibility11
    simpleText: string
}

export interface Accessibility11 {
    accessibilityData: AccessibilityData11
}

export interface AccessibilityData11 {
    label: string
}

export interface NavigationEndpoint12 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata31
    watchEndpoint: WatchEndpoint5
}

export interface CommandMetadata31 {
    webCommandMetadata: WebCommandMetadata31
}

export interface WebCommandMetadata31 {
    url: string
    webPageType: string
    rootVe: number
}

export interface WatchEndpoint5 {
    videoId: string
    nofollow: boolean
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

export interface ShortBylineText {
    runs: Run24[]
}

export interface Run24 {
    text: string
    navigationEndpoint: NavigationEndpoint13
}

export interface NavigationEndpoint13 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata32
    browseEndpoint: BrowseEndpoint4
}

export interface CommandMetadata32 {
    webCommandMetadata: WebCommandMetadata32
}

export interface WebCommandMetadata32 {
    url: string
    webPageType: string
    rootVe: number
    apiUrl: string
}

export interface BrowseEndpoint4 {
    browseId: string
    canonicalBaseUrl: string
}

export interface ChannelThumbnail {
    thumbnails: Thumbnail6[]
}

export interface Thumbnail6 {
    url: string
    width: number
    height: number
}

export interface OwnerBadge {
    metadataBadgeRenderer: MetadataBadgeRenderer2
}

export interface MetadataBadgeRenderer2 {
    icon: Icon6
    style: string
    tooltip: string
    trackingParams: string
    accessibilityData: AccessibilityData12
}

export interface Icon6 {
    iconType: string
}

export interface AccessibilityData12 {
    label: string
}

export interface ShortViewCountText {
    accessibility: Accessibility12
    simpleText: string
}

export interface Accessibility12 {
    accessibilityData: AccessibilityData13
}

export interface AccessibilityData13 {
    label: string
}

export interface Menu {
    menuRenderer: MenuRenderer2
}

export interface MenuRenderer2 {
    items: Item3[]
    trackingParams: string
    accessibility: Accessibility13
    targetId?: string
}

export interface Item3 {
    menuServiceItemRenderer?: MenuServiceItemRenderer3
    menuServiceItemDownloadRenderer?: MenuServiceItemDownloadRenderer2
}

export interface MenuServiceItemRenderer3 {
    text: Text14
    icon: Icon7
    serviceEndpoint: ServiceEndpoint6
    trackingParams: string
    hasSeparator?: boolean
}

export interface Text14 {
    runs: Run25[]
}

export interface Run25 {
    text: string
}

export interface Icon7 {
    iconType: string
}

export interface ServiceEndpoint6 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata33
    shareEntityServiceEndpoint?: ShareEntityServiceEndpoint2
    signalServiceEndpoint?: SignalServiceEndpoint3
}

export interface CommandMetadata33 {
    webCommandMetadata: WebCommandMetadata33
}

export interface WebCommandMetadata33 {
    sendPost: boolean
    apiUrl?: string
}

export interface ShareEntityServiceEndpoint2 {
    serializedShareEntity: string
    commands: Command13[]
}

export interface Command13 {
    clickTrackingParams: string
    openPopupAction: OpenPopupAction5
}

export interface OpenPopupAction5 {
    popup: Popup5
    popupType: string
    beReused: boolean
}

export interface Popup5 {
    unifiedSharePanelRenderer: UnifiedSharePanelRenderer2
}

export interface UnifiedSharePanelRenderer2 {
    trackingParams: string
    showLoadingSpinner: boolean
}

export interface SignalServiceEndpoint3 {
    signal: string
    actions: Action3[]
}

export interface Action3 {
    clickTrackingParams: string
    addToPlaylistCommand?: AddToPlaylistCommand
    openPopupAction?: OpenPopupAction6
}

export interface AddToPlaylistCommand {
    openMiniplayer: boolean
    openListPanel: boolean
    videoId: string
    listType: string
    onCreateListCommand: OnCreateListCommand
    videoIds: string[]
}

export interface OnCreateListCommand {
    clickTrackingParams: string
    commandMetadata: CommandMetadata34
    create_playlistServiceEndpoint: create_playlistServiceEndpoint
}

export interface CommandMetadata34 {
    webCommandMetadata: WebCommandMetadata34
}

export interface WebCommandMetadata34 {
    sendPost: boolean
    apiUrl: string
}

export interface create_playlistServiceEndpoint {
    videoIds: string[]
    params: string
}

export interface OpenPopupAction6 {
    popup: Popup6
    popupType: string
}

export interface Popup6 {
    notificationActionRenderer: NotificationActionRenderer
}

export interface NotificationActionRenderer {
    responseText: ResponseText
    trackingParams: string
}

export interface ResponseText {
    simpleText: string
}

export interface MenuServiceItemDownloadRenderer2 {
    serviceEndpoint: ServiceEndpoint7
    trackingParams: string
}

export interface ServiceEndpoint7 {
    clickTrackingParams: string
    offlineVideoEndpoint: OfflineVideoEndpoint3
}

export interface OfflineVideoEndpoint3 {
    videoId: string
    onAddCommand: OnAddCommand3
}

export interface OnAddCommand3 {
    clickTrackingParams: string
    getDownloadActionCommand: GetDownloadActionCommand3
}

export interface GetDownloadActionCommand3 {
    videoId: string
    params: string
}

export interface Accessibility13 {
    accessibilityData: AccessibilityData14
}

export interface AccessibilityData14 {
    label: string
}

export interface ThumbnailOverlay {
    thumbnailOverlayTimeStatusRenderer?: ThumbnailOverlayTimeStatusRenderer
    thumbnailOverlayToggleButtonRenderer?: ThumbnailOverlayToggleButtonRenderer
    thumbnailOverlayNowPlayingRenderer?: ThumbnailOverlayNowPlayingRenderer
}

export interface ThumbnailOverlayTimeStatusRenderer {
    text: Text15
    style: string
}

export interface Text15 {
    accessibility: Accessibility14
    simpleText: string
}

export interface Accessibility14 {
    accessibilityData: AccessibilityData15
}

export interface AccessibilityData15 {
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
    commandMetadata: CommandMetadata35
    signalServiceEndpoint?: SignalServiceEndpoint4
    playlistEditEndpoint?: PlaylistEditEndpoint
}

export interface CommandMetadata35 {
    webCommandMetadata: WebCommandMetadata35
}

export interface WebCommandMetadata35 {
    sendPost: boolean
    apiUrl?: string
}

export interface SignalServiceEndpoint4 {
    signal: string
    actions: Action4[]
}

export interface Action4 {
    clickTrackingParams: string
    addToPlaylistCommand: AddToPlaylistCommand2
}

export interface AddToPlaylistCommand2 {
    openMiniplayer: boolean
    openListPanel: boolean
    videoId: string
    listType: string
    onCreateListCommand: OnCreateListCommand2
    videoIds: string[]
}

export interface OnCreateListCommand2 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata36
    create_playlistServiceEndpoint: create_playlistServiceEndpoint2
}

export interface CommandMetadata36 {
    webCommandMetadata: WebCommandMetadata36
}

export interface WebCommandMetadata36 {
    sendPost: boolean
    apiUrl: string
}

export interface create_playlistServiceEndpoint2 {
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

export interface UntoggledAccessibility {
    accessibilityData: AccessibilityData16
}

export interface AccessibilityData16 {
    label: string
}

export interface ToggledAccessibility {
    accessibilityData: AccessibilityData17
}

export interface AccessibilityData17 {
    label: string
}

export interface ToggledServiceEndpoint {
    clickTrackingParams: string
    commandMetadata: CommandMetadata37
    playlistEditEndpoint: PlaylistEditEndpoint2
}

export interface CommandMetadata37 {
    webCommandMetadata: WebCommandMetadata37
}

export interface WebCommandMetadata37 {
    sendPost: boolean
    apiUrl: string
}

export interface PlaylistEditEndpoint2 {
    playlistId: string
    actions: Action6[]
}

export interface Action6 {
    action: string
    removedVideoId: string
}

export interface ThumbnailOverlayNowPlayingRenderer {
    text: Text16
}

export interface Text16 {
    runs: Run26[]
}

export interface Run26 {
    text: string
}

export interface Accessibility15 {
    accessibilityData: AccessibilityData18
}

export interface AccessibilityData18 {
    label: string
}

export interface Badge2 {
    metadataBadgeRenderer: MetadataBadgeRenderer3
}

export interface MetadataBadgeRenderer3 {
    style: string
    label: string
    trackingParams: string
}

export interface RichThumbnail {
    movingThumbnailRenderer: MovingThumbnailRenderer
}

export interface MovingThumbnailRenderer {
    enableHoveredLogging: boolean
    enableOverlay: boolean
}

export interface ContinuationItemRenderer2 {
    trigger: string
    continuationEndpoint: ContinuationEndpoint2
    button: Button7
}

export interface ContinuationEndpoint2 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata38
    continuationCommand: ContinuationCommand2
}

export interface CommandMetadata38 {
    webCommandMetadata: WebCommandMetadata38
}

export interface WebCommandMetadata38 {
    sendPost: boolean
    apiUrl: string
}

export interface ContinuationCommand2 {
    token: string
    request: string
}

export interface Button7 {
    buttonRenderer: ButtonRenderer12
}

export interface ButtonRenderer12 {
    style: string
    size: string
    isDisabled: boolean
    text: Text17
    trackingParams: string
    command: Command14
}

export interface Text17 {
    runs: Run27[]
}

export interface Run27 {
    text: string
}

export interface Command14 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata39
    continuationCommand: ContinuationCommand3
}

export interface CommandMetadata39 {
    webCommandMetadata: WebCommandMetadata39
}

export interface WebCommandMetadata39 {
    sendPost: boolean
    apiUrl: string
}

export interface ContinuationCommand3 {
    token: string
    request: string
}

export interface Playlist {
    playlist: Playlist2
}

export interface Playlist2 {
    title: string
    contents: Content9[]
    currentIndex: number
    playlistId: string
    ownerName: OwnerName
    isInfinite: boolean
    playlistShareUrl: string
    shortBylineText: ShortBylineText3
    longBylineText: LongBylineText3
    trackingParams: string
    titleText: TitleText
    menu: Menu3
    localCurrentIndex: number
    playlistButtons: PlaylistButtons
    isCourse: boolean
    nextVideoLabel: NextVideoLabel
}

export interface Content9 {
    playlistPanelVideoRenderer: PlaylistPanelVideoRenderer
}

export interface PlaylistPanelVideoRenderer {
    title: Title10
    longBylineText: LongBylineText2
    thumbnail: Thumbnail7
    lengthText: LengthText2
    indexText?: IndexText
    selected: boolean
    navigationEndpoint: NavigationEndpoint15
    videoId: string
    shortBylineText: ShortBylineText2
    trackingParams: string
    menu: Menu2
    thumbnailOverlays: ThumbnailOverlay2[]
    playlistSetVideoId: string
    actionButtons?: ActionButton[]
    lightColorPalette: LightColorPalette
    darkColorPalette: DarkColorPalette
}

export interface Title10 {
    accessibility: Accessibility16
    simpleText: string
}

export interface Accessibility16 {
    accessibilityData: AccessibilityData19
}

export interface AccessibilityData19 {
    label: string
}

export interface LongBylineText2 {
    runs: Run28[]
}

export interface Run28 {
    text: string
    navigationEndpoint?: NavigationEndpoint14
    "navi igationEndpoint"?: NaviIgationEndpoint
}

export interface NavigationEndpoint14 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata40
    browseEndpoint: BrowseEndpoint5
}

export interface CommandMetadata40 {
    webCommandMetadata: WebCommandMetadata40
}

export interface WebCommandMetadata40 {
    url: string
    webPageType: string
    rootVe: number
    apiUrl: string
}

export interface BrowseEndpoint5 {
    browseId: string
    canonicalBaseUrl: string
}

export interface NaviIgationEndpoint {
    clickTrackingParams: string
    commandMetadata: CommandMetadata41
    browseEndpoint: BrowseEndpoint6
}

export interface CommandMetadata41 {
    webCommandMetadata: WebCommandMetadata41
}

export interface WebCommandMetadata41 {
    url: string
    webPageType: string
    rootVe: number
    apiUrl: string
}

export interface BrowseEndpoint6 {
    browseId: string
    canonicalBaseUrl: string
}

export interface Thumbnail7 {
    thumbnails: Thumbnail8[]
}

export interface Thumbnail8 {
    url: string
    width: number
    height: number
}

export interface LengthText2 {
    accessibility: Accessibility17
    simpleText: string
}

export interface Accessibility17 {
    accessibilityData: AccessibilityData20
}

export interface AccessibilityData20 {
    label: string
}

export interface IndexText {
    simpleText: string
}

export interface NavigationEndpoint15 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata42
    watchEndpoint: WatchEndpoint6
}

export interface CommandMetadata42 {
    webCommandMetadata: WebCommandMetadata42
}

export interface WebCommandMetadata42 {
    url: string
    webPageType: string
    rootVe: number
}

export interface WatchEndpoint6 {
    videoId: string
    playlistId: string
    index: number
    params: string
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

export interface ShortBylineText2 {
    runs: Run29[]
}

export interface Run29 {
    text: string
    navigationEndpoint: NavigationEndpoint16
}

export interface NavigationEndpoint16 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata43
    browseEndpoint: BrowseEndpoint7
}

export interface CommandMetadata43 {
    webCommandMetadata: WebCommandMetadata43
}

export interface WebCommandMetadata43 {
    url: string
    webPageType: string
    rootVe: number
    apiUrl: string
}

export interface BrowseEndpoint7 {
    browseId: string
    canonicalBaseUrl: string
}

export interface Menu2 {
    menuRenderer: MenuRenderer3
}

export interface MenuRenderer3 {
    items: Item4[]
    trackingParams: string
    accessibility: Accessibility18
}

export interface Item4 {
    menuServiceItemDownloadRenderer?: MenuServiceItemDownloadRenderer3
    menuServiceItemRenderer?: MenuServiceItemRenderer4
}

export interface MenuServiceItemDownloadRenderer3 {
    serviceEndpoint: ServiceEndpoint8
    trackingParams: string
}

export interface ServiceEndpoint8 {
    clickTrackingParams: string
    offlineVideoEndpoint: OfflineVideoEndpoint4
}

export interface OfflineVideoEndpoint4 {
    videoId: string
    onAddCommand: OnAddCommand4
}

export interface OnAddCommand4 {
    clickTrackingParams: string
    getDownloadActionCommand: GetDownloadActionCommand4
}

export interface GetDownloadActionCommand4 {
    videoId: string
    params: string
}

export interface MenuServiceItemRenderer4 {
    text: Text18
    icon: Icon8
    serviceEndpoint: ServiceEndpoint9
    trackingParams: string
    hasSeparator: boolean
}

export interface Text18 {
    runs: Run30[]
}

export interface Run30 {
    text: string
}

export interface Icon8 {
    iconType: string
}

export interface ServiceEndpoint9 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata44
    shareEntityServiceEndpoint: ShareEntityServiceEndpoint3
}

export interface CommandMetadata44 {
    webCommandMetadata: WebCommandMetadata44
}

export interface WebCommandMetadata44 {
    sendPost: boolean
    apiUrl: string
}

export interface ShareEntityServiceEndpoint3 {
    serializedShareEntity: string
    commands: Command15[]
}

export interface Command15 {
    clickTrackingParams: string
    openPopupAction: OpenPopupAction7
}

export interface OpenPopupAction7 {
    popup: Popup7
    popupType: string
    beReused: boolean
}

export interface Popup7 {
    unifiedSharePanelRenderer: UnifiedSharePanelRenderer3
}

export interface UnifiedSharePanelRenderer3 {
    trackingParams: string
    showLoadingSpinner: boolean
}

export interface Accessibility18 {
    accessibilityData: AccessibilityData21
}

export interface AccessibilityData21 {
    label: string
}

export interface ThumbnailOverlay2 {
    thumbnailOverlayTimeStatusRenderer?: ThumbnailOverlayTimeStatusRenderer2
    thumbnailOverlayNowPlayingRenderer?: ThumbnailOverlayNowPlayingRenderer2
}

export interface ThumbnailOverlayTimeStatusRenderer2 {
    text: Text19
    style: string
}

export interface Text19 {
    accessibility: Accessibility19
    simpleText: string
}

export interface Accessibility19 {
    accessibilityData: AccessibilityData22
}

export interface AccessibilityData22 {
    label: string
}

export interface ThumbnailOverlayNowPlayingRenderer2 {
    text: Text20
}

export interface Text20 {
    runs: Run31[]
}

export interface Run31 {
    text: string
}

export interface ActionButton {
    slimMetadataToggleButtonRenderer: SlimMetadataToggleButtonRenderer
}

export interface SlimMetadataToggleButtonRenderer {
    likeStatus: string
    isLike?: boolean
    button: Button8
    likeStatusEntityKey: string
    isDislike?: boolean
}

export interface Button8 {
    toggleButtonRenderer: ToggleButtonRenderer
}

export interface ToggleButtonRenderer {
    isToggled: boolean
    isDisabled: boolean
    defaultIcon: DefaultIcon
    defaultServiceEndpoint: DefaultServiceEndpoint
    toggledIcon: ToggledIcon2
    toggledServiceEndpoint: ToggledServiceEndpoint2
    trackingParams: string
    accessibilityData: AccessibilityData23
    toggledAccessibilityData: ToggledAccessibilityData
    toggleButtonSupportedData: ToggleButtonSupportedData
}

export interface DefaultIcon {
    iconType: string
}

export interface DefaultServiceEndpoint {
    clickTrackingParams: string
    commandExecutorCommand: CommandExecutorCommand4
}

export interface CommandExecutorCommand4 {
    commands: Command16[]
}

export interface Command16 {
    clickTrackingParams: string
    commandMetadata?: CommandMetadata45
    likeEndpoint?: LikeEndpoint5
    entityUpdateCommand?: EntityUpdateCommand
}

export interface CommandMetadata45 {
    webCommandMetadata: WebCommandMetadata45
}

export interface WebCommandMetadata45 {
    sendPost: boolean
    apiUrl: string
}

export interface LikeEndpoint5 {
    status: string
    target: Target5
    likeParams?: string
    dislikeParams?: string
}

export interface Target5 {
    videoId: string
}

export interface EntityUpdateCommand {
    entityBatchUpdate: EntityBatchUpdate
}

export interface EntityBatchUpdate {
    mutations: Mutation[]
}

export interface Mutation {
    entityKey: string
    type: string
    payload: Payload
}

export interface Payload {
    likeStatusEntity: LikeStatusEntity2
}

export interface LikeStatusEntity2 {
    key: string
    likeStatus: string
}

export interface ToggledIcon2 {
    iconType: string
}

export interface ToggledServiceEndpoint2 {
    clickTrackingParams: string
    commandExecutorCommand: CommandExecutorCommand5
}

export interface CommandExecutorCommand5 {
    commands: Command17[]
}

export interface Command17 {
    clickTrackingParams: string
    commandMetadata?: CommandMetadata46
    likeEndpoint?: LikeEndpoint6
    entityUpdateCommand?: EntityUpdateCommand2
}

export interface CommandMetadata46 {
    webCommandMetadata: WebCommandMetadata46
}

export interface WebCommandMetadata46 {
    sendPost: boolean
    apiUrl: string
}

export interface LikeEndpoint6 {
    status: string
    target: Target6
    removeLikeParams: string
}

export interface Target6 {
    videoId: string
}

export interface EntityUpdateCommand2 {
    entityBatchUpdate: EntityBatchUpdate2
}

export interface EntityBatchUpdate2 {
    mutations: Mutation2[]
}

export interface Mutation2 {
    entityKey: string
    type: string
    payload: Payload2
}

export interface Payload2 {
    likeStatusEntity: LikeStatusEntity3
}

export interface LikeStatusEntity3 {
    key: string
    likeStatus: string
}

export interface AccessibilityData23 {
    accessibilityData: AccessibilityData24
}

export interface AccessibilityData24 {
    label: string
}

export interface ToggledAccessibilityData {
    accessibilityData: AccessibilityData25
}

export interface AccessibilityData25 {
    label: string
}

export interface ToggleButtonSupportedData {
    toggleButtonIdData: ToggleButtonIdData
}

export interface ToggleButtonIdData {
    id: string
}

export interface LightColorPalette {
    section2Color: number
    primaryTitleColor: number
    secondaryTitleColor: number
    section4Color: number
}

export interface DarkColorPalette {
    section2Color: number
    primaryTitleColor: number
    secondaryTitleColor: number
    section4Color: number
}

export interface OwnerName {
    simpleText: string
}

export interface ShortBylineText3 {
    simpleText: string
}

export interface LongBylineText3 {
    simpleText: string
}

export interface TitleText {
    simpleText: string
}

export interface Menu3 {
    menuRenderer: MenuRenderer4
}

export interface MenuRenderer4 {
    items: Item5[]
    trackingParams: string
    accessibility: Accessibility20
}

export interface Item5 {
    toggleMenuServiceItemRenderer: ToggleMenuServiceItemRenderer
}

export interface ToggleMenuServiceItemRenderer {
    defaultText: DefaultText
    defaultIcon: DefaultIcon2
    defaultServiceEndpoint: DefaultServiceEndpoint2
    toggledText: ToggledText
    toggledIcon: ToggledIcon3
    toggledServiceEndpoint: ToggledServiceEndpoint3
    trackingParams: string
    isToggled: boolean
}

export interface DefaultText {
    runs: Run32[]
}

export interface Run32 {
    text: string
}

export interface DefaultIcon2 {
    iconType: string
}

export interface DefaultServiceEndpoint2 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata47
    likeEndpoint: LikeEndpoint7
}

export interface CommandMetadata47 {
    webCommandMetadata: WebCommandMetadata47
}

export interface WebCommandMetadata47 {
    sendPost: boolean
    apiUrl: string
}

export interface LikeEndpoint7 {
    status: string
    target: Target7
}

export interface Target7 {
    playlistId: string
}

export interface ToggledText {
    runs: Run33[]
}

export interface Run33 {
    text: string
}

export interface ToggledIcon3 {
    iconType: string
}

export interface ToggledServiceEndpoint3 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata48
    likeEndpoint: LikeEndpoint8
}

export interface CommandMetadata48 {
    webCommandMetadata: WebCommandMetadata48
}

export interface WebCommandMetadata48 {
    sendPost: boolean
    apiUrl: string
}

export interface LikeEndpoint8 {
    status: string
    target: Target8
}

export interface Target8 {
    playlistId: string
}

export interface Accessibility20 {
    accessibilityData: AccessibilityData26
}

export interface AccessibilityData26 {
    label: string
}

export interface PlaylistButtons {
    menuRenderer: MenuRenderer5
}

export interface MenuRenderer5 {
    trackingParams: string
    topLevelButtons: TopLevelButton3[]
}

export interface TopLevelButton3 {
    playlistLoopButtonRenderer?: PlaylistLoopButtonRenderer
    toggleButtonRenderer?: ToggleButtonRenderer2
}

export interface PlaylistLoopButtonRenderer {
    states: State3[]
    currentState: string
    playlistLoopStateEntityKey: string
}

export interface State3 {
    playlistLoopButtonStateRenderer: PlaylistLoopButtonStateRenderer
}

export interface PlaylistLoopButtonStateRenderer {
    state: string
    button: Button9
}

export interface Button9 {
    buttonRenderer: ButtonRenderer13
}

export interface ButtonRenderer13 {
    style: string
    size: string
    isDisabled: boolean
    icon: Icon9
    tooltip: string
    trackingParams: string
    accessibilityData: AccessibilityData27
    command: Command18
}

export interface Icon9 {
    iconType: string
}

export interface AccessibilityData27 {
    accessibilityData: AccessibilityData28
}

export interface AccessibilityData28 {
    label: string
}

export interface Command18 {
    clickTrackingParams: string
    commandExecutorCommand: CommandExecutorCommand6
}

export interface CommandExecutorCommand6 {
    commands: Command19[]
}

export interface Command19 {
    clickTrackingParams: string
    entityUpdateCommand: EntityUpdateCommand3
}

export interface EntityUpdateCommand3 {
    entityBatchUpdate: EntityBatchUpdate3
}

export interface EntityBatchUpdate3 {
    mutations: Mutation3[]
}

export interface Mutation3 {
    entityKey: string
    type: string
    payload: Payload3
}

export interface Payload3 {
    playlistLoopStateEntity: PlaylistLoopStateEntity
}

export interface PlaylistLoopStateEntity {
    key: string
    state: string
}

export interface ToggleButtonRenderer2 {
    style: Style
    size: Size
    isToggled: boolean
    isDisabled: boolean
    defaultIcon: DefaultIcon3
    defaultServiceEndpoint: DefaultServiceEndpoint3
    toggledServiceEndpoint: ToggledServiceEndpoint4
    accessibility: Accessibility21
    trackingParams: string
    defaultTooltip: string
    toggledTooltip: string
    toggledStyle: ToggledStyle
}

export interface Style {
    styleType: string
}

export interface Size {
    sizeType: string
}

export interface DefaultIcon3 {
    iconType: string
}

export interface DefaultServiceEndpoint3 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata49
    signalServiceEndpoint: SignalServiceEndpoint5
}

export interface CommandMetadata49 {
    webCommandMetadata: WebCommandMetadata49
}

export interface WebCommandMetadata49 {
    sendPost: boolean
}

export interface SignalServiceEndpoint5 {
    signal: string
    actions: Action7[]
}

export interface Action7 {
    clickTrackingParams: string
    openPopupAction: OpenPopupAction8
}

export interface OpenPopupAction8 {
    popup: Popup8
    popupType: string
}

export interface Popup8 {
    notificationActionRenderer: NotificationActionRenderer2
}

export interface NotificationActionRenderer2 {
    responseText: ResponseText2
    trackingParams: string
}

export interface ResponseText2 {
    runs: Run34[]
}

export interface Run34 {
    text: string
}

export interface ToggledServiceEndpoint4 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata50
    signalServiceEndpoint: SignalServiceEndpoint6
}

export interface CommandMetadata50 {
    webCommandMetadata: WebCommandMetadata50
}

export interface WebCommandMetadata50 {
    sendPost: boolean
}

export interface SignalServiceEndpoint6 {
    signal: string
    actions: Action8[]
}

export interface Action8 {
    clickTrackingParams: string
    openPopupAction: OpenPopupAction9
}

export interface OpenPopupAction9 {
    popup: Popup9
    popupType: string
}

export interface Popup9 {
    notificationActionRenderer: NotificationActionRenderer3
}

export interface NotificationActionRenderer3 {
    responseText: ResponseText3
    trackingParams: string
}

export interface ResponseText3 {
    runs: Run35[]
}

export interface Run35 {
    text: string
}

export interface Accessibility21 {
    label: string
}

export interface ToggledStyle {
    styleType: string
}

export interface NextVideoLabel {
    simpleText: string
}

export interface Autoplay {
    autoplay: Autoplay2
}

export interface Autoplay2 {
    sets: Set[]
    modifiedSets: ModifiedSet[]
    trackingParams: string
}

export interface Set {
    mode: string
    autoplayVideo: AutoplayVideo
    nextButtonVideo: NextButtonVideo
}

export interface AutoplayVideo {
    clickTrackingParams: string
    commandMetadata: CommandMetadata51
    watchEndpoint: WatchEndpoint7
}

export interface CommandMetadata51 {
    webCommandMetadata: WebCommandMetadata51
}

export interface WebCommandMetadata51 {
    url: string
    webPageType: string
    rootVe: number
}

export interface WatchEndpoint7 {
    videoId: string
    playlistId: string
    index: number
    params: string
    playerParams: string
    loggingContext: LoggingContext6
    watchEndpointSupportedPrefetchConfig: WatchEndpointSupportedPrefetchConfig2
}

export interface LoggingContext6 {
    vssLoggingContext: VssLoggingContext6
}

export interface VssLoggingContext6 {
    serializedContextData: string
}

export interface WatchEndpointSupportedPrefetchConfig2 {
    prefetchHintConfig: PrefetchHintConfig2
}

export interface PrefetchHintConfig2 {
    prefetchPriority: number
    playbackRelativeSecondsPrefetchCondition: number
}

export interface NextButtonVideo {
    clickTrackingParams: string
    commandMetadata: CommandMetadata52
    watchEndpoint: WatchEndpoint8
}

export interface CommandMetadata52 {
    webCommandMetadata: WebCommandMetadata52
}

export interface WebCommandMetadata52 {
    url: string
    webPageType: string
    rootVe: number
}

export interface WatchEndpoint8 {
    videoId: string
    playlistId: string
    index: number
    params: string
    loggingContext: LoggingContext7
    watchEndpointSupportedOnesieConfig: WatchEndpointSupportedOnesieConfig6
}

export interface LoggingContext7 {
    vssLoggingContext: VssLoggingContext7
}

export interface VssLoggingContext7 {
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

export interface ModifiedSet {
    autoplayVideo: AutoplayVideo2
    nextButtonVideo: NextButtonVideo2
}

export interface AutoplayVideo2 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata53
    watchPlaylistEndpoint: WatchPlaylistEndpoint
}

export interface CommandMetadata53 {
    webCommandMetadata: WebCommandMetadata53
}

export interface WebCommandMetadata53 {
    url: string
    webPageType: string
    rootVe: number
}

export interface WatchPlaylistEndpoint {
    playlistId: string
    index: number
    params: string
}

export interface NextButtonVideo2 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata54
    watchPlaylistEndpoint: WatchPlaylistEndpoint2
}

export interface CommandMetadata54 {
    webCommandMetadata: WebCommandMetadata54
}

export interface WebCommandMetadata54 {
    url: string
    webPageType: string
    rootVe: number
}

export interface WatchPlaylistEndpoint2 {
    playlistId: string
    index: number
    params: string
}

export interface CurrentVideoEndpoint {
    clickTrackingParams: string
    commandMetadata: CommandMetadata55
    watchEndpoint: WatchEndpoint9
}

export interface CommandMetadata55 {
    webCommandMetadata: WebCommandMetadata55
}

export interface WebCommandMetadata55 {
    url: string
    webPageType: string
    rootVe: number
}

export interface WatchEndpoint9 {
    videoId: string
    playlistId: string
    index: number
    playlistSetVideoId: string
    loggingContext: LoggingContext8
    watchEndpointSupportedOnesieConfig: WatchEndpointSupportedOnesieConfig7
}

export interface LoggingContext8 {
    vssLoggingContext: VssLoggingContext8
}

export interface VssLoggingContext8 {
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

export interface PlayerOverlays {
    playerOverlayRenderer: PlayerOverlayRenderer
}

export interface PlayerOverlayRenderer {
    endScreen: EndScreen
    shareButton: ShareButton
    addToMenu: AddToMenu
    videoDetails: VideoDetails
    speedmasterUserEdu: SpeedmasterUserEdu
}

export interface EndScreen {
    watchNextEndScreenRenderer: WatchNextEndScreenRenderer
}

export interface WatchNextEndScreenRenderer {
    results: Result2[]
    title: Title12
    trackingParams: string
}

export interface Result2 {
    endScreenVideoRenderer: EndScreenVideoRenderer
}

export interface EndScreenVideoRenderer {
    videoId: string
    thumbnail: Thumbnail9
    title: Title11
    shortBylineText: ShortBylineText4
    lengthText: LengthText3
    lengthInSeconds: number
    navigationEndpoint: NavigationEndpoint18
    trackingParams: string
    shortViewCountText: ShortViewCountText2
    publishedTimeText: PublishedTimeText2
    thumbnailOverlays: ThumbnailOverlay3[]
}

export interface Thumbnail9 {
    thumbnails: Thumbnail10[]
}

export interface Thumbnail10 {
    url: string
    width: number
    height: number
}

export interface Title11 {
    accessibility: Accessibility22
    simpleText: string
}

export interface Accessibility22 {
    accessibilityData: AccessibilityData29
}

export interface AccessibilityData29 {
    label: string
}

export interface ShortBylineText4 {
    runs: Run36[]
}

export interface Run36 {
    text: string
    navigationEndpoint: NavigationEndpoint17
}

export interface NavigationEndpoint17 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata56
    browseEndpoint: BrowseEndpoint8
}

export interface CommandMetadata56 {
    webCommandMetadata: WebCommandMetadata56
}

export interface WebCommandMetadata56 {
    url: string
    webPageType: string
    rootVe: number
    apiUrl: string
}

export interface BrowseEndpoint8 {
    browseId: string
    canonicalBaseUrl: string
}

export interface LengthText3 {
    accessibility: Accessibility23
    simpleText: string
}

export interface Accessibility23 {
    accessibilityData: AccessibilityData30
}

export interface AccessibilityData30 {
    label: string
}

export interface NavigationEndpoint18 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata57
    watchEndpoint: WatchEndpoint10
}

export interface CommandMetadata57 {
    webCommandMetadata: WebCommandMetadata57
}

export interface WebCommandMetadata57 {
    url: string
    webPageType: string
    rootVe: number
}

export interface WatchEndpoint10 {
    videoId: string
    watchEndpointSupportedOnesieConfig: WatchEndpointSupportedOnesieConfig8
}

export interface WatchEndpointSupportedOnesieConfig8 {
    html5PlaybackOnesieConfig: Html5PlaybackOnesieConfig8
}

export interface Html5PlaybackOnesieConfig8 {
    commonConfig: CommonConfig8
}

export interface CommonConfig8 {
    url: string
}

export interface ShortViewCountText2 {
    accessibility: Accessibility24
    simpleText: string
}

export interface Accessibility24 {
    accessibilityData: AccessibilityData31
}

export interface AccessibilityData31 {
    label: string
}

export interface PublishedTimeText2 {
    simpleText: string
}

export interface ThumbnailOverlay3 {
    thumbnailOverlayTimeStatusRenderer?: ThumbnailOverlayTimeStatusRenderer3
    thumbnailOverlayNowPlayingRenderer?: ThumbnailOverlayNowPlayingRenderer3
}

export interface ThumbnailOverlayTimeStatusRenderer3 {
    text: Text21
    style: string
}

export interface Text21 {
    accessibility: Accessibility25
    simpleText: string
}

export interface Accessibility25 {
    accessibilityData: AccessibilityData32
}

export interface AccessibilityData32 {
    label: string
}

export interface ThumbnailOverlayNowPlayingRenderer3 {
    text: Text22
}

export interface Text22 {
    runs: Run37[]
}

export interface Run37 {
    text: string
}

export interface Title12 {
    simpleText: string
}

export interface ShareButton {
    buttonRenderer: ButtonRenderer14
}

export interface ButtonRenderer14 {
    style: string
    size: string
    isDisabled: boolean
    icon: Icon10
    navigationEndpoint: NavigationEndpoint19
    tooltip: string
    trackingParams: string
}

export interface Icon10 {
    iconType: string
}

export interface NavigationEndpoint19 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata58
    shareEntityServiceEndpoint: ShareEntityServiceEndpoint4
}

export interface CommandMetadata58 {
    webCommandMetadata: WebCommandMetadata58
}

export interface WebCommandMetadata58 {
    sendPost: boolean
    apiUrl: string
}

export interface ShareEntityServiceEndpoint4 {
    serializedShareEntity: string
    commands: Command20[]
}

export interface Command20 {
    clickTrackingParams: string
    openPopupAction: OpenPopupAction10
}

export interface OpenPopupAction10 {
    popup: Popup10
    popupType: string
    beReused: boolean
}

export interface Popup10 {
    unifiedSharePanelRenderer: UnifiedSharePanelRenderer4
}

export interface UnifiedSharePanelRenderer4 {
    trackingParams: string
    showLoadingSpinner: boolean
}

export interface AddToMenu {
    menuRenderer: MenuRenderer6
}

export interface MenuRenderer6 {
    trackingParams: string
}

export interface VideoDetails {
    playerOverlayVideoDetailsRenderer: PlayerOverlayVideoDetailsRenderer
}

export interface PlayerOverlayVideoDetailsRenderer {
    title: Title13
    subtitle: Subtitle
}

export interface Title13 {
    simpleText: string
}

export interface Subtitle {
    runs: Run38[]
}

export interface Run38 {
    text: string
}

export interface SpeedmasterUserEdu {
    speedmasterEduViewModel: SpeedmasterEduViewModel
}

export interface SpeedmasterEduViewModel {
    bodyText: BodyText
}

export interface BodyText {
    content: string
}

export interface OnResponseReceivedEndpoint {
    clickTrackingParams: string
    commandMetadata: CommandMetadata59
    signalServiceEndpoint: SignalServiceEndpoint7
}

export interface CommandMetadata59 {
    webCommandMetadata: WebCommandMetadata59
}

export interface WebCommandMetadata59 {
    sendPost: boolean
}

export interface SignalServiceEndpoint7 {
    signal: string
    actions: Action9[]
}

export interface Action9 {
    clickTrackingParams: string
    signalAction: SignalAction
}

export interface SignalAction {
    signal: string
}

export interface EngagementPanel {
    engagementPanelSectionListRenderer: EngagementPanelSectionListRenderer
}

export interface EngagementPanelSectionListRenderer {
    panelIdentifier?: string
    header?: Header
    content: Content10
    veType?: number
    targetId: string
    visibility: string
    loggingDirectives: LoggingDirectives
    onShowCommands?: OnShowCommand[]
}

export interface Header {
    engagementPanelTitleHeaderRenderer: EngagementPanelTitleHeaderRenderer
}

export interface EngagementPanelTitleHeaderRenderer {
    title: Title14
    menu?: Menu4
    visibilityButton: VisibilityButton
    trackingParams: string
    contextualInfo?: ContextualInfo
}

export interface Title14 {
    runs?: Run39[]
    simpleText?: string
}

export interface Run39 {
    text: string
}

export interface Menu4 {
    menuRenderer?: MenuRenderer7
    sortFilterSubMenuRenderer?: SortFilterSubMenuRenderer
}

export interface MenuRenderer7 {
    items: Item6[]
    trackingParams: string
    accessibility: Accessibility26
}

export interface Item6 {
    menuServiceItemRenderer: MenuServiceItemRenderer5
}

export interface MenuServiceItemRenderer5 {
    text: Text23
    serviceEndpoint: ServiceEndpoint10
    trackingParams: string
}

export interface Text23 {
    runs: Run40[]
}

export interface Run40 {
    text: string
}

export interface ServiceEndpoint10 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata60
    signalServiceEndpoint: SignalServiceEndpoint8
}

export interface CommandMetadata60 {
    webCommandMetadata: WebCommandMetadata60
}

export interface WebCommandMetadata60 {
    sendPost: boolean
}

export interface SignalServiceEndpoint8 {
    signal: string
    actions: Action10[]
}

export interface Action10 {
    clickTrackingParams: string
    signalAction: SignalAction2
}

export interface SignalAction2 {
    signal: string
}

export interface Accessibility26 {
    accessibilityData: AccessibilityData33
}

export interface AccessibilityData33 {
    label: string
}

export interface SortFilterSubMenuRenderer {
    subMenuItems: SubMenuItem[]
    icon: Icon11
    accessibility: Accessibility27
    trackingParams: string
}

export interface SubMenuItem {
    title: string
    selected: boolean
    serviceEndpoint: ServiceEndpoint11
    trackingParams: string
}

export interface ServiceEndpoint11 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata61
    continuationCommand: ContinuationCommand4
}

export interface CommandMetadata61 {
    webCommandMetadata: WebCommandMetadata61
}

export interface WebCommandMetadata61 {
    sendPost: boolean
    apiUrl: string
}

export interface ContinuationCommand4 {
    token: string
    request: string
    command: Command21
}

export interface Command21 {
    clickTrackingParams: string
    showReloadUiCommand: ShowReloadUiCommand
}

export interface ShowReloadUiCommand {
    targetId: string
}

export interface Icon11 {
    iconType: string
}

export interface Accessibility27 {
    accessibilityData: AccessibilityData34
}

export interface AccessibilityData34 {
    label: string
}

export interface VisibilityButton {
    buttonRenderer: ButtonRenderer15
}

export interface ButtonRenderer15 {
    icon: Icon12
    accessibility?: Accessibility28
    trackingParams: string
    accessibilityData: AccessibilityData35
    command: Command22
    style?: string
    size?: string
}

export interface Icon12 {
    iconType: string
}

export interface Accessibility28 {
    label: string
}

export interface AccessibilityData35 {
    accessibilityData: AccessibilityData36
}

export interface AccessibilityData36 {
    label: string
}

export interface Command22 {
    clickTrackingParams: string
    changeEngagementPanelVisibilityAction?: ChangeEngagementPanelVisibilityAction4
    commandExecutorCommand?: CommandExecutorCommand7
    hideEngagementPanelEndpoint?: HideEngagementPanelEndpoint
}

export interface ChangeEngagementPanelVisibilityAction4 {
    targetId: string
    visibility: string
}

export interface CommandExecutorCommand7 {
    commands: Command23[]
}

export interface Command23 {
    clickTrackingParams: string
    changeEngagementPanelVisibilityAction?: ChangeEngagementPanelVisibilityAction5
    updateToggleButtonStateCommand?: UpdateToggleButtonStateCommand
}

export interface ChangeEngagementPanelVisibilityAction5 {
    targetId: string
    visibility: string
}

export interface UpdateToggleButtonStateCommand {
    toggled: boolean
    buttonId: string
}

export interface HideEngagementPanelEndpoint {
    panelIdentifier: string
}

export interface ContextualInfo {
    runs: Run41[]
}

export interface Run41 {
    text: string
}

export interface Content10 {
    sectionListRenderer?: SectionListRenderer
    adsEngagementPanelContentRenderer?: AdsEngagementPanelContentRenderer
    structuredDescriptionContentRenderer?: StructuredDescriptionContentRenderer
    continuationItemRenderer?: ContinuationItemRenderer4
}

export interface SectionListRenderer {
    contents: Content11[]
    trackingParams: string
}

export interface Content11 {
    itemSectionRenderer: ItemSectionRenderer2
}

export interface ItemSectionRenderer2 {
    contents: Content12[]
    trackingParams: string
    sectionIdentifier: string
    targetId: string
}

export interface Content12 {
    continuationItemRenderer: ContinuationItemRenderer3
}

export interface ContinuationItemRenderer3 {
    trigger: string
    continuationEndpoint: ContinuationEndpoint3
}

export interface ContinuationEndpoint3 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata62
    continuationCommand: ContinuationCommand5
}

export interface CommandMetadata62 {
    webCommandMetadata: WebCommandMetadata62
}

export interface WebCommandMetadata62 {
    sendPost: boolean
    apiUrl: string
}

export interface ContinuationCommand5 {
    token: string
    request: string
}

export interface AdsEngagementPanelContentRenderer {
    hack: boolean
}

export interface StructuredDescriptionContentRenderer {
    items: Item7[]
}

export interface Item7 {
    videoDescriptionHeaderRenderer?: VideoDescriptionHeaderRenderer
    expandableVideoDescriptionBodyRenderer?: ExpandableVideoDescriptionBodyRenderer
    videoDescriptionTranscriptSectionRenderer?: VideoDescriptionTranscriptSectionRenderer
    videoDescriptionInfocardsSectionRenderer?: VideoDescriptionInfocardsSectionRenderer
}

export interface VideoDescriptionHeaderRenderer {
    title: Title15
    channel: Channel
    views: Views
    publishDate: PublishDate
    factoid: Factoid[]
    channelNavigationEndpoint: ChannelNavigationEndpoint
    channelThumbnail: ChannelThumbnail2
}

export interface Title15 {
    runs: Run42[]
}

export interface Run42 {
    text: string
}

export interface Channel {
    simpleText: string
}

export interface Views {
    simpleText: string
}

export interface PublishDate {
    simpleText: string
}

export interface Factoid {
    factoidRenderer?: FactoidRenderer
    viewCountFactoidRenderer?: ViewCountFactoidRenderer
}

export interface FactoidRenderer {
    value: Value
    label: Label
    accessibilityText: string
}

export interface Value {
    simpleText: string
}

export interface Label {
    simpleText: string
}

export interface ViewCountFactoidRenderer {
    viewCountEntityKey: string
    factoid: Factoid2
    viewCountType: string
}

export interface Factoid2 {
    factoidRenderer: FactoidRenderer2
}

export interface FactoidRenderer2 {
    value: Value2
    label: Label2
    accessibilityText: string
}

export interface Value2 {
    simpleText: string
}

export interface Label2 {
    simpleText: string
}

export interface ChannelNavigationEndpoint {
    clickTrackingParams: string
    commandMetadata: CommandMetadata63
    browseEndpoint: BrowseEndpoint9
}

export interface CommandMetadata63 {
    webCommandMetadata: WebCommandMetadata63
}

export interface WebCommandMetadata63 {
    url: string
    webPageType: string
    rootVe: number
    apiUrl: string
}

export interface BrowseEndpoint9 {
    browseId: string
    canonicalBaseUrl: string
}

export interface ChannelThumbnail2 {
    thumbnails: Thumbnail11[]
}

export interface Thumbnail11 {
    url: string
}

export interface ExpandableVideoDescriptionBodyRenderer {
    showMoreText: ShowMoreText2
    showLessText: ShowLessText2
    attributedDescriptionBodyText: AttributedDescriptionBodyText
    headerRuns: HeaderRun2[]
}

export interface ShowMoreText2 {
    accessibility: Accessibility29
    simpleText: string
}

export interface Accessibility29 {
    accessibilityData: AccessibilityData37
}

export interface AccessibilityData37 {
    label: string
}

export interface ShowLessText2 {
    simpleText: string
}

export interface AttributedDescriptionBodyText {
    content: string
    styleRuns: StyleRun2[]
}

export interface StyleRun2 {
    startIndex: number
    length: number
    styleRunExtensions: StyleRunExtensions2
    fontFamilyName: string
}

export interface StyleRunExtensions2 {
    styleRunColorMapExtension: StyleRunColorMapExtension2
}

export interface StyleRunColorMapExtension2 {
    colorMap: ColorMap2[]
}

export interface ColorMap2 {
    key: string
    value: number
}

export interface HeaderRun2 {
    startIndex: number
    length: number
    headerMapping: string
}

export interface VideoDescriptionTranscriptSectionRenderer {
    sectionTitle: SectionTitle
    subHeaderText: SubHeaderText
    primaryButton: PrimaryButton
    trackingParams: string
}

export interface SectionTitle {
    runs: Run43[]
}

export interface Run43 {
    text: string
}

export interface SubHeaderText {
    runs: Run44[]
}

export interface Run44 {
    text: string
}

export interface PrimaryButton {
    buttonRenderer: ButtonRenderer16
}

export interface ButtonRenderer16 {
    style: string
    size: string
    isDisabled: boolean
    text: Text24
    trackingParams: string
    command: Command24
}

export interface Text24 {
    runs: Run45[]
}

export interface Run45 {
    text: string
}

export interface Command24 {
    clickTrackingParams: string
    commandExecutorCommand: CommandExecutorCommand8
}

export interface CommandExecutorCommand8 {
    commands: Command25[]
}

export interface Command25 {
    clickTrackingParams: string
    showEngagementPanelEndpoint?: ShowEngagementPanelEndpoint
    scrollToEngagementPanelCommand?: ScrollToEngagementPanelCommand3
}

export interface ShowEngagementPanelEndpoint {
    panelIdentifier: string
    sourcePanelIdentifier: string
}

export interface ScrollToEngagementPanelCommand3 {
    targetId: string
}

export interface VideoDescriptionInfocardsSectionRenderer {
    sectionTitle: SectionTitle2
    creatorVideosButton: CreatorVideosButton
    creatorAboutButton: CreatorAboutButton
    sectionSubtitle: SectionSubtitle
    channelAvatar: ChannelAvatar
    channelEndpoint: ChannelEndpoint
    creatorCustomUrlButtons: CreatorCustomUrlButton[]
    trackingParams: string
}

export interface SectionTitle2 {
    simpleText: string
}

export interface CreatorVideosButton {
    buttonRenderer: ButtonRenderer17
}

export interface ButtonRenderer17 {
    style: string
    size: string
    isDisabled: boolean
    text: Text25
    icon: Icon13
    trackingParams: string
    command: Command26
}

export interface Text25 {
    simpleText: string
}

export interface Icon13 {
    iconType: string
}

export interface Command26 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata64
    browseEndpoint: BrowseEndpoint10
}

export interface CommandMetadata64 {
    webCommandMetadata: WebCommandMetadata64
}

export interface WebCommandMetadata64 {
    url: string
    webPageType: string
    rootVe: number
    apiUrl: string
}

export interface BrowseEndpoint10 {
    browseId: string
    params: string
}

export interface CreatorAboutButton {
    buttonRenderer: ButtonRenderer18
}

export interface ButtonRenderer18 {
    style: string
    size: string
    isDisabled: boolean
    text: Text26
    icon: Icon14
    trackingParams: string
    command: Command27
}

export interface Text26 {
    simpleText: string
}

export interface Icon14 {
    iconType: string
}

export interface Command27 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata65
    browseEndpoint: BrowseEndpoint11
}

export interface CommandMetadata65 {
    webCommandMetadata: WebCommandMetadata65
}

export interface WebCommandMetadata65 {
    url: string
    webPageType: string
    rootVe: number
    apiUrl: string
}

export interface BrowseEndpoint11 {
    browseId: string
    params: string
}

export interface SectionSubtitle {
    accessibility: Accessibility30
    simpleText: string
}

export interface Accessibility30 {
    accessibilityData: AccessibilityData38
}

export interface AccessibilityData38 {
    label: string
}

export interface ChannelAvatar {
    thumbnails: Thumbnail12[]
}

export interface Thumbnail12 {
    url: string
}

export interface ChannelEndpoint {
    clickTrackingParams: string
    commandMetadata: CommandMetadata66
    browseEndpoint: BrowseEndpoint12
}

export interface CommandMetadata66 {
    webCommandMetadata: WebCommandMetadata66
}

export interface WebCommandMetadata66 {
    url: string
    webPageType: string
    rootVe: number
    apiUrl: string
}

export interface BrowseEndpoint12 {
    browseId: string
    canonicalBaseUrl: string
}

export interface CreatorCustomUrlButton {
    buttonViewModel: ButtonViewModel7
}

export interface ButtonViewModel7 {
    title: string
    onTap: OnTap8
    style: string
    trackingParams: string
    type: string
    buttonSize: string
    iconImage: IconImage
}

export interface OnTap8 {
    innertubeCommand: InnertubeCommand7
}

export interface InnertubeCommand7 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata67
    urlEndpoint: UrlEndpoint
}

export interface CommandMetadata67 {
    webCommandMetadata: WebCommandMetadata67
}

export interface WebCommandMetadata67 {
    url: string
    webPageType: string
    rootVe: number
}

export interface UrlEndpoint {
    url: string
    target: string
}

export interface IconImage {
    url: string
    width: number
    height: number
}

export interface ContinuationItemRenderer4 {
    trigger: string
    continuationEndpoint: ContinuationEndpoint4
}

export interface ContinuationEndpoint4 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata68
    getTranscriptEndpoint: GetTranscriptEndpoint
}

export interface CommandMetadata68 {
    webCommandMetadata: WebCommandMetadata68
}

export interface WebCommandMetadata68 {
    sendPost: boolean
    apiUrl: string
}

export interface GetTranscriptEndpoint {
    params: string
}

export interface LoggingDirectives {
    trackingParams: string
    visibility: Visibility
    enableDisplayloggerExperiment: boolean
}

export interface Visibility {
    types: string
}

export interface OnShowCommand {
    clickTrackingParams: string
    scrollToEngagementPanelCommand: ScrollToEngagementPanelCommand4
}

export interface ScrollToEngagementPanelCommand4 {
    targetId: string
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
    iconImage: IconImage2
    tooltipText: TooltipText
    endpoint: Endpoint
    trackingParams: string
    overrideEntityKey: string
}

export interface IconImage2 {
    iconType: string
}

export interface TooltipText {
    runs: Run46[]
}

export interface Run46 {
    text: string
}

export interface Endpoint {
    clickTrackingParams: string
    commandMetadata: CommandMetadata69
    browseEndpoint: BrowseEndpoint13
}

export interface CommandMetadata69 {
    webCommandMetadata: WebCommandMetadata69
}

export interface WebCommandMetadata69 {
    url: string
    webPageType: string
    rootVe: number
    apiUrl: string
}

export interface BrowseEndpoint13 {
    browseId: string
}

export interface Searchbox {
    fusionSearchboxRenderer: FusionSearchboxRenderer
}

export interface FusionSearchboxRenderer {
    icon: Icon15
    placeholderText: PlaceholderText
    config: Config
    trackingParams: string
    searchEndpoint: SearchEndpoint
    clearButton: ClearButton
}

export interface Icon15 {
    iconType: string
}

export interface PlaceholderText {
    runs: Run47[]
}

export interface Run47 {
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
    commandMetadata: CommandMetadata70
    searchEndpoint: SearchEndpoint2
}

export interface CommandMetadata70 {
    webCommandMetadata: WebCommandMetadata70
}

export interface WebCommandMetadata70 {
    url: string
    webPageType: string
    rootVe: number
}

export interface SearchEndpoint2 {
    query: string
}

export interface ClearButton {
    buttonRenderer: ButtonRenderer19
}

export interface ButtonRenderer19 {
    style: string
    size: string
    isDisabled: boolean
    icon: Icon16
    trackingParams: string
    accessibilityData: AccessibilityData39
}

export interface Icon16 {
    iconType: string
}

export interface AccessibilityData39 {
    accessibilityData: AccessibilityData40
}

export interface AccessibilityData40 {
    label: string
}

export interface TopbarButton {
    topbarMenuButtonRenderer?: TopbarMenuButtonRenderer
    buttonRenderer?: ButtonRenderer20
}

export interface TopbarMenuButtonRenderer {
    icon: Icon17
    menuRequest: MenuRequest
    trackingParams: string
    accessibility: Accessibility31
    tooltip: string
    style: string
}

export interface Icon17 {
    iconType: string
}

export interface MenuRequest {
    clickTrackingParams: string
    commandMetadata: CommandMetadata71
    signalServiceEndpoint: SignalServiceEndpoint9
}

export interface CommandMetadata71 {
    webCommandMetadata: WebCommandMetadata71
}

export interface WebCommandMetadata71 {
    sendPost: boolean
    apiUrl: string
}

export interface SignalServiceEndpoint9 {
    signal: string
    actions: Action11[]
}

export interface Action11 {
    clickTrackingParams: string
    openPopupAction: OpenPopupAction11
}

export interface OpenPopupAction11 {
    popup: Popup11
    popupType: string
    beReused: boolean
}

export interface Popup11 {
    multiPageMenuRenderer: MultiPageMenuRenderer
}

export interface MultiPageMenuRenderer {
    trackingParams: string
    style: string
    showLoadingSpinner: boolean
}

export interface Accessibility31 {
    accessibilityData: AccessibilityData41
}

export interface AccessibilityData41 {
    label: string
}

export interface ButtonRenderer20 {
    style: string
    size: string
    text: Text27
    icon: Icon18
    navigationEndpoint: NavigationEndpoint20
    trackingParams: string
    targetId: string
}

export interface Text27 {
    runs: Run48[]
}

export interface Run48 {
    text: string
}

export interface Icon18 {
    iconType: string
}

export interface NavigationEndpoint20 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata72
    signInEndpoint: SignInEndpoint8
}

export interface CommandMetadata72 {
    webCommandMetadata: WebCommandMetadata72
}

export interface WebCommandMetadata72 {
    url: string
    webPageType: string
    rootVe: number
}

export interface SignInEndpoint8 {
    idamTag: string
}

export interface HotkeyDialog {
    hotkeyDialogRenderer: HotkeyDialogRenderer
}

export interface HotkeyDialogRenderer {
    title: Title16
    sections: Section[]
    dismissButton: DismissButton
    trackingParams: string
}

export interface Title16 {
    runs: Run49[]
}

export interface Run49 {
    text: string
}

export interface Section {
    hotkeyDialogSectionRenderer: HotkeyDialogSectionRenderer
}

export interface HotkeyDialogSectionRenderer {
    title: Title17
    options: Option[]
}

export interface Title17 {
    runs: Run50[]
}

export interface Run50 {
    text: string
}

export interface Option {
    hotkeyDialogSectionOptionRenderer: HotkeyDialogSectionOptionRenderer
}

export interface HotkeyDialogSectionOptionRenderer {
    label: Label3
    hotkey: string
    hotkeyAccessibilityLabel?: HotkeyAccessibilityLabel
}

export interface Label3 {
    runs: Run51[]
}

export interface Run51 {
    text: string
}

export interface HotkeyAccessibilityLabel {
    accessibilityData: AccessibilityData42
}

export interface AccessibilityData42 {
    label: string
}

export interface DismissButton {
    buttonRenderer: ButtonRenderer21
}

export interface ButtonRenderer21 {
    style: string
    size: string
    isDisabled: boolean
    text: Text28
    trackingParams: string
}

export interface Text28 {
    runs: Run52[]
}

export interface Run52 {
    text: string
}

export interface BackButton {
    buttonRenderer: ButtonRenderer22
}

export interface ButtonRenderer22 {
    trackingParams: string
    command: Command28
}

export interface Command28 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata73
    signalServiceEndpoint: SignalServiceEndpoint10
}

export interface CommandMetadata73 {
    webCommandMetadata: WebCommandMetadata73
}

export interface WebCommandMetadata73 {
    sendPost: boolean
}

export interface SignalServiceEndpoint10 {
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

export interface ForwardButton {
    buttonRenderer: ButtonRenderer23
}

export interface ButtonRenderer23 {
    trackingParams: string
    command: Command29
}

export interface Command29 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata74
    signalServiceEndpoint: SignalServiceEndpoint11
}

export interface CommandMetadata74 {
    webCommandMetadata: WebCommandMetadata74
}

export interface WebCommandMetadata74 {
    sendPost: boolean
}

export interface SignalServiceEndpoint11 {
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

export interface A11ySkipNavigationButton {
    buttonRenderer: ButtonRenderer24
}

export interface ButtonRenderer24 {
    style: string
    size: string
    isDisabled: boolean
    text: Text29
    trackingParams: string
    command: Command30
}

export interface Text29 {
    runs: Run53[]
}

export interface Run53 {
    text: string
}

export interface Command30 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata75
    signalServiceEndpoint: SignalServiceEndpoint12
}

export interface CommandMetadata75 {
    webCommandMetadata: WebCommandMetadata75
}

export interface WebCommandMetadata75 {
    sendPost: boolean
}

export interface SignalServiceEndpoint12 {
    signal: string
    actions: Action14[]
}

export interface Action14 {
    clickTrackingParams: string
    signalAction: SignalAction5
}

export interface SignalAction5 {
    signal: string
}

export interface VoiceSearchButton {
    buttonRenderer: ButtonRenderer25
}

export interface ButtonRenderer25 {
    style: string
    size: string
    isDisabled: boolean
    serviceEndpoint: ServiceEndpoint12
    icon: Icon20
    tooltip: string
    trackingParams: string
    accessibilityData: AccessibilityData45
}

export interface ServiceEndpoint12 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata76
    signalServiceEndpoint: SignalServiceEndpoint13
}

export interface CommandMetadata76 {
    webCommandMetadata: WebCommandMetadata76
}

export interface WebCommandMetadata76 {
    sendPost: boolean
}

export interface SignalServiceEndpoint13 {
    signal: string
    actions: Action15[]
}

export interface Action15 {
    clickTrackingParams: string
    openPopupAction: OpenPopupAction12
}

export interface OpenPopupAction12 {
    popup: Popup12
    popupType: string
}

export interface Popup12 {
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
    runs: Run54[]
}

export interface Run54 {
    text: string
}

export interface PromptHeader {
    runs: Run55[]
}

export interface Run55 {
    text: string
}

export interface ExampleQuery1 {
    runs: Run56[]
}

export interface Run56 {
    text: string
}

export interface ExampleQuery2 {
    runs: Run57[]
}

export interface Run57 {
    text: string
}

export interface PromptMicrophoneLabel {
    runs: Run58[]
}

export interface Run58 {
    text: string
}

export interface LoadingHeader {
    runs: Run59[]
}

export interface Run59 {
    text: string
}

export interface ConnectionErrorHeader {
    runs: Run60[]
}

export interface Run60 {
    text: string
}

export interface ConnectionErrorMicrophoneLabel {
    runs: Run61[]
}

export interface Run61 {
    text: string
}

export interface PermissionsHeader {
    runs: Run62[]
}

export interface Run62 {
    text: string
}

export interface PermissionsSubtext {
    runs: Run63[]
}

export interface Run63 {
    text: string
}

export interface DisabledHeader {
    runs: Run64[]
}

export interface Run64 {
    text: string
}

export interface DisabledSubtext {
    runs: Run65[]
}

export interface Run65 {
    text: string
}

export interface MicrophoneButtonAriaLabel {
    runs: Run66[]
}

export interface Run66 {
    text: string
}

export interface ExitButton {
    buttonRenderer: ButtonRenderer26
}

export interface ButtonRenderer26 {
    style: string
    size: string
    isDisabled: boolean
    icon: Icon19
    trackingParams: string
    accessibilityData: AccessibilityData43
}

export interface Icon19 {
    iconType: string
}

export interface AccessibilityData43 {
    accessibilityData: AccessibilityData44
}

export interface AccessibilityData44 {
    label: string
}

export interface MicrophoneOffPromptHeader {
    runs: Run67[]
}

export interface Run67 {
    text: string
}

export interface Icon20 {
    iconType: string
}

export interface AccessibilityData45 {
    accessibilityData: AccessibilityData46
}

export interface AccessibilityData46 {
    label: string
}

export interface PageVisualEffect {
    cinematicContainerRenderer: CinematicContainerRenderer
}

export interface CinematicContainerRenderer {
    presentationStyle: string
    config: Config2
    colorStore: ColorStore
}

export interface Config2 {
    lightThemeBackgroundColor: number
    darkThemeBackgroundColor: number
    animationConfig: AnimationConfig
    colorSourceSizeMultiplier: number
    applyClientImageBlur: boolean
    bottomColorSourceHeightMultiplier: number
    maxBottomColorSourceHeight: number
    colorSourceWidthMultiplier: number
    colorSourceHeightMultiplier: number
    blurStrength: number
    watchFullscreenConfig: WatchFullscreenConfig
    enableInLightTheme: boolean
}

export interface AnimationConfig {
    minImageUpdateIntervalMs: number
    crossfadeDurationMs: number
    crossfadeStartOffset: number
    maxFrameRate: number
}

export interface WatchFullscreenConfig {
    colorSourceWidthMultiplier: number
    colorSourceHeightMultiplier: number
    scrimWidthMultiplier: number
    scrimHeightMultiplier: number
    scrimGradientConfig: ScrimGradientConfig
}

export interface ScrimGradientConfig {
    gradientType: string
    gradientStartPointX: number
    gradientStartPointY: number
    gradientEndPointX: number
    gradientEndPointY: number
}

export interface ColorStore {
    sampledColors: SampledColor[]
}

export interface SampledColor {
    key: string
    value: number
}

export interface FrameworkUpdates {
    entityBatchUpdate: EntityBatchUpdate4
}

export interface EntityBatchUpdate4 {
    mutations: Mutation4[]
    timestamp: Timestamp
}

export interface Mutation4 {
    entityKey: string
    type: string
    payload?: Payload4
    options?: Options
}

export interface Payload4 {
    subscriptionStateEntity?: SubscriptionStateEntity
    playlistLoopStateEntity?: PlaylistLoopStateEntity2
    likeStatusEntity?: LikeStatusEntity4
}

export interface SubscriptionStateEntity {
    key: string
    subscribed: boolean
}

export interface PlaylistLoopStateEntity2 {
    key: string
    state: string
}

export interface LikeStatusEntity4 {
    key: string
    likeStatus: string
}

export interface Options {
    persistenceOption: string
}

export interface Timestamp {
    seconds: string
    nanos: number
}
