export interface SearchResults_1 {
    responseContext: ResponseContext
    estimatedResults: string
    contents: Contents
    trackingParams: string
    topbar: Topbar
    frameworkUpdates: FrameworkUpdates
}

export interface ResponseContext {
    serviceTrackingParams: ServiceTrackingParam[]
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

export interface WebResponseContextExtensionData {
    webResponseContextPreloadData: WebResponseContextPreloadData
    ytConfigData: YtConfigData
    hasDecorated: boolean
}

export interface WebResponseContextPreloadData {
    preloadMessageNames: string[]
}

export interface YtConfigData {
    visitorData: string
    rootVisualElementType: number
}

export interface Contents {
    sectionListRenderer: SectionListRenderer
}

export interface SectionListRenderer {
    contents: Content[]
    continuations: Continuation[]
    trackingParams: string
    subMenu: SubMenu
    hideBottomSeparator: boolean
    targetId: string
}

export interface Content {
    itemSectionRenderer: ItemSectionRenderer
    continuationItemRenderer: ContinuationItemRenderer
}

export interface ItemSectionRenderer {
    contents: Content2[]
    trackingParams: string
}

export interface Content2 {
    didYouMeanRenderer: DidYouMeanRenderer
    videoWithContextRenderer: VideoWithContextRenderer
    compactPlaylistRenderer: CompactPlaylistRenderer
    compactChannelRenderer: CompactChannelRenderer
}

export interface DidYouMeanRenderer {
    didYouMean: DidYouMean
    correctedQuery: CorrectedQuery
    correctedQueryEndpoint: CorrectedQueryEndpoint
    trackingParams: string
}

export interface DidYouMean {
    runs: Run[]
}

export interface Run {
    text: string
}

export interface CorrectedQuery {
    runs: Run2[]
}

export interface Run2 {
    text: string
    italics?: boolean
}

export interface CorrectedQueryEndpoint {
    clickTrackingParams: string
    commandMetadata: CommandMetadata
    searchEndpoint: SearchEndpoint
}

export interface CommandMetadata {
    webCommandMetadata: WebCommandMetadata
}

export interface WebCommandMetadata {
    url: string
    webPageType: string
    rootVe: number
}

export interface SearchEndpoint {
    query: string
}

export interface VideoWithContextRenderer {
    headline: Headline
    thumbnail: Thumbnail
    shortBylineText: ShortBylineText
    lengthText: LengthText
    shortViewCountText: ShortViewCountText
    navigationEndpoint: NavigationEndpoint2
    menu: Menu
    isWatched: boolean
    trackingParams: string
    videoId: string
    thumbnailOverlays: ThumbnailOverlay[]
    channelThumbnail: ChannelThumbnail
    accessibility: Accessibility7
    inlinePlaybackEndpoint: InlinePlaybackEndpoint
    publishedTimeText?: PublishedTimeText
    richThumbnail?: RichThumbnail
    bottomStandaloneBadge?: BottomStandaloneBadge
    badges?: Badge[]
}

export interface Headline {
    runs: Run3[]
    accessibility: Accessibility
}

export interface Run3 {
    text: string
}

export interface Accessibility {
    accessibilityData: AccessibilityData
}

export interface AccessibilityData {
    label: string
}

export interface Thumbnail {
    thumbnails: Thumbnail2[]
}

export interface Thumbnail2 {
    url: string
    width: number
    height: number
}

export interface ShortBylineText {
    runs: Run4[]
}

export interface Run4 {
    text: string
    navigationEndpoint: NavigationEndpoint
}

export interface NavigationEndpoint {
    clickTrackingParams: string
    commandMetadata: CommandMetadata2
    browseEndpoint: BrowseEndpoint
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

export interface BrowseEndpoint {
    browseId: string
    canonicalBaseUrl: string
}

export interface LengthText {
    runs: Run5[]
    accessibility: Accessibility2
}

export interface Run5 {
    text: string
}

export interface Accessibility2 {
    accessibilityData: AccessibilityData2
}

export interface AccessibilityData2 {
    label: string
}

export interface ShortViewCountText {
    runs: Run6[]
    accessibility: Accessibility3
}

export interface Run6 {
    text: string
}

export interface Accessibility3 {
    accessibilityData: AccessibilityData3
}

export interface AccessibilityData3 {
    label: string
}

export interface NavigationEndpoint2 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata3
    watchEndpoint: WatchEndpoint
}

export interface CommandMetadata3 {
    webCommandMetadata: WebCommandMetadata3
}

export interface WebCommandMetadata3 {
    url: string
    webPageType: string
    rootVe: number
}

export interface WatchEndpoint {
    videoId: string
    playerParams: string
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
    menuNavigationItemRenderer: MenuNavigationItemRenderer
}

export interface MenuNavigationItemRenderer {
    text: Text
    navigationEndpoint: NavigationEndpoint3
    trackingParams: string
}

export interface Text {
    runs: Run7[]
}

export interface Run7 {
    text: string
}

export interface NavigationEndpoint3 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata4
    signInEndpoint: SignInEndpoint
}

export interface CommandMetadata4 {
    webCommandMetadata: WebCommandMetadata4
}

export interface WebCommandMetadata4 {
    url: string
    webPageType: string
    rootVe: number
}

export interface SignInEndpoint {
    hack: boolean
}

export interface Accessibility4 {
    accessibilityData: AccessibilityData4
}

export interface AccessibilityData4 {
    label: string
}

export interface ThumbnailOverlay {
    thumbnailOverlayTimeStatusRenderer: ThumbnailOverlayTimeStatusRenderer
}

export interface ThumbnailOverlayTimeStatusRenderer {
    text: Text2
    style: string
}

export interface Text2 {
    runs: Run8[]
    accessibility: Accessibility5
}

export interface Run8 {
    text: string
}

export interface Accessibility5 {
    accessibilityData: AccessibilityData5
}

export interface AccessibilityData5 {
    label: string
}

export interface ChannelThumbnail {
    channelThumbnailWithLinkRenderer: ChannelThumbnailWithLinkRenderer
}

export interface ChannelThumbnailWithLinkRenderer {
    thumbnail: Thumbnail3
    navigationEndpoint: NavigationEndpoint4
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

export interface NavigationEndpoint4 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata5
    browseEndpoint: BrowseEndpoint2
}

export interface CommandMetadata5 {
    webCommandMetadata: WebCommandMetadata5
}

export interface WebCommandMetadata5 {
    url: string
    webPageType: string
    rootVe: number
    apiUrl: string
}

export interface BrowseEndpoint2 {
    browseId: string
    canonicalBaseUrl?: string
}

export interface Accessibility6 {
    accessibilityData: AccessibilityData6
}

export interface AccessibilityData6 {
    label: string
}

export interface Accessibility7 {
    accessibilityData: AccessibilityData7
}

export interface AccessibilityData7 {
    label: string
}

export interface InlinePlaybackEndpoint {
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
    playerParams: string
}

export interface PublishedTimeText {
    runs: Run9[]
}

export interface Run9 {
    text: string
}

export interface RichThumbnail {
    movingThumbnailRenderer: MovingThumbnailRenderer
}

export interface MovingThumbnailRenderer {
    movingThumbnailDetails: MovingThumbnailDetails
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

export interface BottomStandaloneBadge {
    standaloneCollectionBadgeRenderer: StandaloneCollectionBadgeRenderer
}

export interface StandaloneCollectionBadgeRenderer {
    iconText: string
    style: Style
    trackingParams: string
}

export interface Style {
    badgeStyle: string
}

export interface Badge {
    metadataBadgeRenderer: MetadataBadgeRenderer
}

export interface MetadataBadgeRenderer {
    style: string
    label: string
    trackingParams: string
}

export interface CompactPlaylistRenderer {
    playlistId: string
    thumbnail: Thumbnail6
    title: Title
    shortBylineText: ShortBylineText2
    videoCountText: VideoCountText
    navigationEndpoint: NavigationEndpoint6
    publishedTimeText: PublishedTimeText2
    videoCountShortText: VideoCountShortText
    trackingParams: string
    sidebarThumbnails?: SidebarThumbnail[]
    thumbnailText: ThumbnailText
    shareUrl: string
    thumbnailRenderer: ThumbnailRenderer
    longBylineText: LongBylineText
    thumbnailOverlays: ThumbnailOverlay2[]
    channelThumbnail?: ChannelThumbnail2
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

export interface Title {
    runs: Run10[]
}

export interface Run10 {
    text: string
}

export interface ShortBylineText2 {
    runs: Run11[]
}

export interface Run11 {
    text: string
    navigationEndpoint?: NavigationEndpoint5
}

export interface NavigationEndpoint5 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata7
    browseEndpoint: BrowseEndpoint3
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

export interface BrowseEndpoint3 {
    browseId: string
    canonicalBaseUrl: string
}

export interface VideoCountText {
    runs: Run12[]
}

export interface Run12 {
    text: string
}

export interface NavigationEndpoint6 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata8
    browseEndpoint: BrowseEndpoint4
}

export interface CommandMetadata8 {
    webCommandMetadata: WebCommandMetadata8
}

export interface WebCommandMetadata8 {
    url: string
    webPageType: string
    rootVe: number
    apiUrl: string
}

export interface BrowseEndpoint4 {
    browseId: string
}

export interface PublishedTimeText2 {
    runs: Run13[]
}

export interface Run13 {
    text: string
}

export interface VideoCountShortText {
    runs: Run14[]
}

export interface Run14 {
    text: string
}

export interface SidebarThumbnail {
    thumbnails: Thumbnail8[]
}

export interface Thumbnail8 {
    url: string
    width: number
    height: number
}

export interface ThumbnailText {
    runs: Run15[]
}

export interface Run15 {
    text: string
    bold?: boolean
}

export interface ThumbnailRenderer {
    playlistCustomThumbnailRenderer?: PlaylistCustomThumbnailRenderer
    playlistVideoThumbnailRenderer?: PlaylistVideoThumbnailRenderer
}

export interface PlaylistCustomThumbnailRenderer {
    thumbnail: Thumbnail9
}

export interface Thumbnail9 {
    thumbnails: Thumbnail10[]
    sampledThumbnailColor: SampledThumbnailColor2
    darkColorPalette: DarkColorPalette2
    vibrantColorPalette: VibrantColorPalette2
}

export interface Thumbnail10 {
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

export interface PlaylistVideoThumbnailRenderer {
    thumbnail: Thumbnail11
    trackingParams: string
}

export interface Thumbnail11 {
    thumbnails: Thumbnail12[]
    sampledThumbnailColor: SampledThumbnailColor3
    darkColorPalette: DarkColorPalette3
    vibrantColorPalette: VibrantColorPalette3
}

export interface Thumbnail12 {
    url: string
    width: number
    height: number
}

export interface SampledThumbnailColor3 {
    red: number
    green: number
    blue: number
}

export interface DarkColorPalette3 {
    section2Color: number
    iconInactiveColor: number
    iconDisabledColor: number
}

export interface VibrantColorPalette3 {
    iconInactiveColor: number
}

export interface LongBylineText {
    runs: Run16[]
}

export interface Run16 {
    text: string
    navigationEndpoint?: NavigationEndpoint7
}

export interface NavigationEndpoint7 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata9
    browseEndpoint: BrowseEndpoint5
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

export interface BrowseEndpoint5 {
    browseId: string
    canonicalBaseUrl: string
}

export interface ThumbnailOverlay2 {
    thumbnailOverlaySidePanelRenderer?: ThumbnailOverlaySidePanelRenderer
    thumbnailOverlayBottomPanelRenderer?: ThumbnailOverlayBottomPanelRenderer
}

export interface ThumbnailOverlaySidePanelRenderer {
    text: Text3
    icon: Icon
}

export interface Text3 {
    runs: Run17[]
}

export interface Run17 {
    text: string
}

export interface Icon {
    iconType: string
}

export interface ThumbnailOverlayBottomPanelRenderer {
    text: Text4
    icon: Icon2
}

export interface Text4 {
    runs: Run18[]
}

export interface Run18 {
    text: string
}

export interface Icon2 {
    iconType: string
}

export interface ChannelThumbnail2 {
    channelThumbnailWithLinkRenderer: ChannelThumbnailWithLinkRenderer2
}

export interface ChannelThumbnailWithLinkRenderer2 {
    thumbnail: Thumbnail13
    navigationEndpoint: NavigationEndpoint8
    accessibility: Accessibility8
}

export interface Thumbnail13 {
    thumbnails: Thumbnail14[]
}

export interface Thumbnail14 {
    url: string
    width: number
    height: number
}

export interface NavigationEndpoint8 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata10
    browseEndpoint: BrowseEndpoint6
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

export interface BrowseEndpoint6 {
    browseId: string
    canonicalBaseUrl: string
}

export interface Accessibility8 {
    accessibilityData: AccessibilityData8
}

export interface AccessibilityData8 {
    label: string
}

export interface CompactChannelRenderer {
    channelId: string
    thumbnail: Thumbnail15
    displayName: DisplayName
    videoCountText: VideoCountText2
    subscriberCountText: SubscriberCountText
    navigationEndpoint: NavigationEndpoint9
    title: Title2
    subscribeButton: SubscribeButton
    trackingParams: string
    tvBanner: TvBanner
}

export interface Thumbnail15 {
    thumbnails: Thumbnail16[]
}

export interface Thumbnail16 {
    url: string
    width: number
    height: number
}

export interface DisplayName {
    runs: Run19[]
}

export interface Run19 {
    text: string
}

export interface VideoCountText2 {
    runs: Run20[]
}

export interface Run20 {
    text: string
}

export interface SubscriberCountText {
    runs: Run21[]
    accessibility: Accessibility9
}

export interface Run21 {
    text: string
}

export interface Accessibility9 {
    accessibilityData: AccessibilityData9
}

export interface AccessibilityData9 {
    label: string
}

export interface NavigationEndpoint9 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata11
    browseEndpoint: BrowseEndpoint7
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

export interface BrowseEndpoint7 {
    browseId: string
    canonicalBaseUrl: string
}

export interface Title2 {
    runs: Run22[]
    accessibility: Accessibility10
}

export interface Run22 {
    text: string
}

export interface Accessibility10 {
    accessibilityData: AccessibilityData10
}

export interface AccessibilityData10 {
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
    subscribedEntityKey: string
    onSubscribeEndpoints: OnSubscribeEndpoint[]
    onUnsubscribeEndpoints: OnUnsubscribeEndpoint[]
}

export interface ButtonText {
    runs: Run23[]
}

export interface Run23 {
    text: string
}

export interface SubscribedButtonText {
    runs: Run24[]
}

export interface Run24 {
    text: string
}

export interface UnsubscribedButtonText {
    runs: Run25[]
}

export interface Run25 {
    text: string
}

export interface UnsubscribeButtonText {
    runs: Run26[]
}

export interface Run26 {
    text: string
}

export interface SubscribeAccessibility {
    accessibilityData: AccessibilityData11
}

export interface AccessibilityData11 {
    label: string
}

export interface UnsubscribeAccessibility {
    accessibilityData: AccessibilityData12
}

export interface AccessibilityData12 {
    label: string
}

export interface OnSubscribeEndpoint {
    clickTrackingParams: string
    commandMetadata: CommandMetadata12
    subscribeEndpoint: SubscribeEndpoint
}

export interface CommandMetadata12 {
    webCommandMetadata: WebCommandMetadata12
}

export interface WebCommandMetadata12 {
    sendPost: boolean
    apiUrl: string
}

export interface SubscribeEndpoint {
    channelIds: string[]
    params: string
}

export interface OnUnsubscribeEndpoint {
    clickTrackingParams: string
    commandMetadata: CommandMetadata13
    signalServiceEndpoint: SignalServiceEndpoint
}

export interface CommandMetadata13 {
    webCommandMetadata: WebCommandMetadata13
}

export interface WebCommandMetadata13 {
    sendPost: boolean
}

export interface SignalServiceEndpoint {
    signal: string
    actions: Action[]
}

export interface Action {
    clickTrackingParams: string
    openPopupAction: OpenPopupAction
}

export interface OpenPopupAction {
    popup: Popup
    popupType: string
}

export interface Popup {
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
    runs: Run27[]
}

export interface Run27 {
    text: string
}

export interface ConfirmButton {
    buttonRenderer: ButtonRenderer
}

export interface ButtonRenderer {
    style: string
    size: string
    isDisabled: boolean
    text: Text5
    serviceEndpoint: ServiceEndpoint
    accessibility: Accessibility11
    trackingParams: string
}

export interface Text5 {
    runs: Run28[]
}

export interface Run28 {
    text: string
}

export interface ServiceEndpoint {
    clickTrackingParams: string
    commandMetadata: CommandMetadata14
    unsubscribeEndpoint: UnsubscribeEndpoint
}

export interface CommandMetadata14 {
    webCommandMetadata: WebCommandMetadata14
}

export interface WebCommandMetadata14 {
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
    buttonRenderer: ButtonRenderer2
}

export interface ButtonRenderer2 {
    style: string
    size: string
    isDisabled: boolean
    text: Text6
    accessibility: Accessibility12
    trackingParams: string
}

export interface Text6 {
    runs: Run29[]
}

export interface Run29 {
    text: string
}

export interface Accessibility12 {
    label: string
}

export interface TvBanner {
    thumbnails: Thumbnail17[]
}

export interface Thumbnail17 {
    url: string
    width: number
    height: number
}

export interface ContinuationItemRenderer {
    trigger: string
    continuationEndpoint: ContinuationEndpoint
    loggingDirectives: LoggingDirectives
}

export interface ContinuationEndpoint {
    clickTrackingParams: string
    commandMetadata: CommandMetadata15
    continuationCommand: ContinuationCommand
}

export interface CommandMetadata15 {
    webCommandMetadata: WebCommandMetadata15
}

export interface WebCommandMetadata15 {
    sendPost: boolean
    apiUrl: string
}

export interface ContinuationCommand {
    token: string
    request: string
}

export interface LoggingDirectives {
    trackingParams: string
}

export interface Continuation {
    reloadContinuationData: ReloadContinuationData
}

export interface ReloadContinuationData {
    continuation: string
    clickTrackingParams: string
}

export interface SubMenu {
    searchSubMenuRenderer: SearchSubMenuRenderer
}

export interface SearchSubMenuRenderer {
    title: Title3
    groups: Group[]
    trackingParams: string
}

export interface Title3 {
    runs: Run30[]
}

export interface Run30 {
    text: string
}

export interface Group {
    searchFilterGroupRenderer: SearchFilterGroupRenderer
}

export interface SearchFilterGroupRenderer {
    title: Title4
    filters: Filter[]
    trackingParams: string
}

export interface Title4 {
    simpleText: string
}

export interface Filter {
    searchFilterRenderer: SearchFilterRenderer
}

export interface SearchFilterRenderer {
    label: Label
    status?: string
    navigationEndpoint: NavigationEndpoint10
    tooltip: string
    trackingParams: string
}

export interface Label {
    simpleText: string
}

export interface NavigationEndpoint10 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata16
    searchEndpoint: SearchEndpoint2
}

export interface CommandMetadata16 {
    webCommandMetadata: WebCommandMetadata16
}

export interface WebCommandMetadata16 {
    url: string
    webPageType: string
    rootVe: number
}

export interface SearchEndpoint2 {
    query: string
    params?: string
}

export interface Topbar {
    mobileTopbarRenderer: MobileTopbarRenderer
}

export interface MobileTopbarRenderer {
    trackingParams: string
    searchCommand: SearchCommand
    voiceSearchButton: VoiceSearchButton
    topbarLogo: TopbarLogo
}

export interface SearchCommand {
    clickTrackingParams: string
    commandMetadata: CommandMetadata17
    searchEndpoint: SearchEndpoint3
}

export interface CommandMetadata17 {
    webCommandMetadata: WebCommandMetadata17
}

export interface WebCommandMetadata17 {
    url: string
    webPageType: string
    rootVe: number
}

export interface SearchEndpoint3 {
    params: string
    hack: boolean
}

export interface VoiceSearchButton {
    buttonRenderer: ButtonRenderer3
}

export interface ButtonRenderer3 {
    style: string
    size: string
    isDisabled: boolean
    serviceEndpoint: ServiceEndpoint2
    icon: Icon4
    tooltip: string
    trackingParams: string
    accessibilityData: AccessibilityData15
}

export interface ServiceEndpoint2 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata18
    signalServiceEndpoint: SignalServiceEndpoint2
}

export interface CommandMetadata18 {
    webCommandMetadata: WebCommandMetadata18
}

export interface WebCommandMetadata18 {
    sendPost: boolean
}

export interface SignalServiceEndpoint2 {
    signal: string
    actions: Action2[]
}

export interface Action2 {
    clickTrackingParams: string
    openPopupAction: OpenPopupAction2
}

export interface OpenPopupAction2 {
    popup: Popup2
    popupType: string
}

export interface Popup2 {
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
    buttonRenderer: ButtonRenderer4
}

export interface ButtonRenderer4 {
    style: string
    size: string
    isDisabled: boolean
    icon: Icon3
    trackingParams: string
    accessibilityData: AccessibilityData13
}

export interface Icon3 {
    iconType: string
}

export interface AccessibilityData13 {
    accessibilityData: AccessibilityData14
}

export interface AccessibilityData14 {
    label: string
}

export interface MicrophoneOffPromptHeader {
    runs: Run44[]
}

export interface Run44 {
    text: string
}

export interface Icon4 {
    iconType: string
}

export interface AccessibilityData15 {
    accessibilityData: AccessibilityData16
}

export interface AccessibilityData16 {
    label: string
}

export interface TopbarLogo {
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
    runs: Run45[]
}

export interface Run45 {
    text: string
}

export interface Endpoint {
    clickTrackingParams: string
    commandMetadata: CommandMetadata19
    browseEndpoint: BrowseEndpoint8
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

export interface BrowseEndpoint8 {
    browseId: string
}

export interface FrameworkUpdates {
    entityBatchUpdate: EntityBatchUpdate
}

export interface EntityBatchUpdate {
    mutations: Mutation[]
    timestamp: Timestamp
}

export interface Mutation {
    entityKey: string
    type: string
    payload: Payload
}

export interface Payload {
    subscriptionStateEntity: SubscriptionStateEntity
}

export interface SubscriptionStateEntity {
    key: string
    subscribed: boolean
}

export interface Timestamp {
    seconds: string
    nanos: number
}
