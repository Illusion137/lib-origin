export interface ContinuedResults_0 {
    responseContext: ResponseContext
    contents: Contents
    trackingParams: string
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
    icon: Icon6
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
    musicCarouselShelfRenderer?: MusicCarouselShelfRenderer
    musicTastebuilderShelfRenderer?: MusicTastebuilderShelfRenderer
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
    strapline: Strapline
    accessibilityData: AccessibilityData
    headerStyle: string
    moreContentButton?: MoreContentButton
    trackingParams: string
}

export interface Title {
    runs: Run[]
}

export interface Run {
    text: string
}

export interface Strapline {
    runs: Run2[]
}

export interface Run2 {
    text: string
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
    navigationEndpoint: NavigationEndpoint
    trackingParams: string
    accessibilityData: AccessibilityData3
}

export interface Text {
    runs: Run3[]
}

export interface Run3 {
    text: string
}

export interface NavigationEndpoint {
    clickTrackingParams: string
    watchPlaylistEndpoint: WatchPlaylistEndpoint
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

export interface Content3 {
    musicResponsiveListItemRenderer?: MusicResponsiveListItemRenderer
    musicTwoRowItemRenderer?: MusicTwoRowItemRenderer
}

export interface MusicResponsiveListItemRenderer {
    trackingParams: string
    thumbnail: Thumbnail
    flexColumns: FlexColumn[]
    menu: Menu
    playlistItemData: PlaylistItemData
    flexColumnDisplayStyle: string
    navigationEndpoint: NavigationEndpoint6
    itemHeight: string
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

export interface FlexColumn {
    musicResponsiveListItemFlexColumnRenderer: MusicResponsiveListItemFlexColumnRenderer
}

export interface MusicResponsiveListItemFlexColumnRenderer {
    text: Text2
    displayPriority: string
}

export interface Text2 {
    runs: Run4[]
}

export interface Run4 {
    text: string
    navigationEndpoint?: NavigationEndpoint2
}

export interface NavigationEndpoint2 {
    clickTrackingParams: string
    watchEndpoint: WatchEndpoint
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
    text: Text3
    icon: Icon
    navigationEndpoint: NavigationEndpoint3
    trackingParams: string
}

export interface Text3 {
    runs: Run5[]
}

export interface Run5 {
    text: string
}

export interface Icon {
    iconType: string
}

export interface NavigationEndpoint3 {
    clickTrackingParams: string
    shareEntityEndpoint?: ShareEntityEndpoint
    browseEndpoint?: BrowseEndpoint2
    modalEndpoint?: ModalEndpoint
    watchEndpoint?: WatchEndpoint2
}

export interface ShareEntityEndpoint {
    serializedShareEntity: string
    sharePanelType: string
}

export interface BrowseEndpoint2 {
    browseId: string
    browseEndpointContextSupportedConfigs: BrowseEndpointContextSupportedConfigs
}

export interface BrowseEndpointContextSupportedConfigs {
    browseEndpointContextMusicConfig: BrowseEndpointContextMusicConfig
}

export interface BrowseEndpointContextMusicConfig {
    pageType: string
}

export interface ModalEndpoint {
    modal: Modal
}

export interface Modal {
    modalWithTitleAndButtonRenderer: ModalWithTitleAndButtonRenderer
}

export interface ModalWithTitleAndButtonRenderer {
    title: Title2
    content: Content4
    button: Button
}

export interface Title2 {
    runs: Run6[]
}

export interface Run6 {
    text: string
}

export interface Content4 {
    runs: Run7[]
}

export interface Run7 {
    text: string
}

export interface Button {
    buttonRenderer: ButtonRenderer2
}

export interface ButtonRenderer2 {
    style: string
    isDisabled: boolean
    text: Text4
    navigationEndpoint: NavigationEndpoint4
    trackingParams: string
}

export interface Text4 {
    runs: Run8[]
}

export interface Run8 {
    text: string
}

export interface NavigationEndpoint4 {
    clickTrackingParams: string
    signInEndpoint: SignInEndpoint
}

export interface SignInEndpoint {
    hack: boolean
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

export interface MenuServiceItemRenderer {
    text: Text5
    icon: Icon2
    serviceEndpoint: ServiceEndpoint
    trackingParams: string
}

export interface Text5 {
    runs: Run9[]
}

export interface Run9 {
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
    watchEndpoint: WatchEndpoint3
}

export interface WatchEndpoint3 {
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
    runs: Run10[]
}

export interface Run10 {
    text: string
}

export interface ToggleMenuServiceItemRenderer {
    defaultText: DefaultText
    defaultIcon: DefaultIcon
    defaultServiceEndpoint: DefaultServiceEndpoint
    toggledText: ToggledText
    toggledIcon: ToggledIcon
    trackingParams: string
    toggledServiceEndpoint?: ToggledServiceEndpoint
}

export interface DefaultText {
    runs: Run11[]
}

export interface Run11 {
    text: string
}

export interface DefaultIcon {
    iconType: string
}

export interface DefaultServiceEndpoint {
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
    title: Title3
    content: Content5
    button: Button2
}

export interface Title3 {
    runs: Run12[]
}

export interface Run12 {
    text: string
}

export interface Content5 {
    runs: Run13[]
}

export interface Run13 {
    text: string
}

export interface Button2 {
    buttonRenderer: ButtonRenderer3
}

export interface ButtonRenderer3 {
    style: string
    isDisabled: boolean
    text: Text6
    navigationEndpoint: NavigationEndpoint5
    trackingParams: string
}

export interface Text6 {
    runs: Run14[]
}

export interface Run14 {
    text: string
}

export interface NavigationEndpoint5 {
    clickTrackingParams: string
    signInEndpoint: SignInEndpoint2
}

export interface SignInEndpoint2 {
    hack: boolean
}

export interface ToggledText {
    runs: Run15[]
}

export interface Run15 {
    text: string
}

export interface ToggledIcon {
    iconType: string
}

export interface ToggledServiceEndpoint {
    clickTrackingParams: string
    feedbackEndpoint: FeedbackEndpoint
}

export interface FeedbackEndpoint {
    feedbackToken: string
}

export interface Accessibility {
    accessibilityData: AccessibilityData5
}

export interface AccessibilityData5 {
    label: string
}

export interface PlaylistItemData {
    videoId: string
}

export interface NavigationEndpoint6 {
    clickTrackingParams: string
    watchEndpoint: WatchEndpoint4
}

export interface WatchEndpoint4 {
    videoId: string
    watchEndpointMusicSupportedConfigs: WatchEndpointMusicSupportedConfigs3
}

export interface WatchEndpointMusicSupportedConfigs3 {
    watchEndpointMusicConfig: WatchEndpointMusicConfig3
}

export interface WatchEndpointMusicConfig3 {
    musicVideoType: string
}

export interface Badge {
    musicInlineBadgeRenderer: MusicInlineBadgeRenderer
}

export interface MusicInlineBadgeRenderer {
    trackingParams: string
    icon: Icon3
    accessibilityData: AccessibilityData6
}

export interface Icon3 {
    iconType: string
}

export interface AccessibilityData6 {
    accessibilityData: AccessibilityData7
}

export interface AccessibilityData7 {
    label: string
}

export interface MusicTwoRowItemRenderer {
    thumbnailRenderer: ThumbnailRenderer
    aspectRatio: string
    title: Title4
    subtitle: Subtitle
    navigationEndpoint: NavigationEndpoint8
    trackingParams: string
    menu: Menu2
    thumbnailOverlay: ThumbnailOverlay
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

export interface Title4 {
    runs: Run16[]
}

export interface Run16 {
    text: string
    navigationEndpoint: NavigationEndpoint7
}

export interface NavigationEndpoint7 {
    clickTrackingParams: string
    browseEndpoint: BrowseEndpoint3
}

export interface BrowseEndpoint3 {
    browseId: string
    browseEndpointContextSupportedConfigs: BrowseEndpointContextSupportedConfigs2
}

export interface BrowseEndpointContextSupportedConfigs2 {
    browseEndpointContextMusicConfig: BrowseEndpointContextMusicConfig2
}

export interface BrowseEndpointContextMusicConfig2 {
    pageType: string
}

export interface Subtitle {
    runs: Run17[]
}

export interface Run17 {
    text: string
}

export interface NavigationEndpoint8 {
    clickTrackingParams: string
    browseEndpoint: BrowseEndpoint4
}

export interface BrowseEndpoint4 {
    browseId: string
    browseEndpointContextSupportedConfigs: BrowseEndpointContextSupportedConfigs3
}

export interface BrowseEndpointContextSupportedConfigs3 {
    browseEndpointContextMusicConfig: BrowseEndpointContextMusicConfig3
}

export interface BrowseEndpointContextMusicConfig3 {
    pageType: string
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
    navigationEndpoint: NavigationEndpoint9
    trackingParams: string
}

export interface Text7 {
    runs: Run18[]
}

export interface Run18 {
    text: string
}

export interface Icon4 {
    iconType: string
}

export interface NavigationEndpoint9 {
    clickTrackingParams: string
    shareEntityEndpoint?: ShareEntityEndpoint2
    modalEndpoint?: ModalEndpoint3
    watchPlaylistEndpoint?: WatchPlaylistEndpoint2
}

export interface ShareEntityEndpoint2 {
    serializedShareEntity: string
    sharePanelType: string
}

export interface ModalEndpoint3 {
    modal: Modal3
}

export interface Modal3 {
    modalWithTitleAndButtonRenderer: ModalWithTitleAndButtonRenderer3
}

export interface ModalWithTitleAndButtonRenderer3 {
    title: Title5
    content: Content6
    button: Button3
}

export interface Title5 {
    runs: Run19[]
}

export interface Run19 {
    text: string
}

export interface Content6 {
    runs: Run20[]
}

export interface Run20 {
    text: string
}

export interface Button3 {
    buttonRenderer: ButtonRenderer4
}

export interface ButtonRenderer4 {
    style: string
    isDisabled: boolean
    text: Text8
    navigationEndpoint: NavigationEndpoint10
    trackingParams: string
}

export interface Text8 {
    runs: Run21[]
}

export interface Run21 {
    text: string
}

export interface NavigationEndpoint10 {
    clickTrackingParams: string
    signInEndpoint: SignInEndpoint3
}

export interface SignInEndpoint3 {
    hack: boolean
}

export interface WatchPlaylistEndpoint2 {
    playlistId: string
    params: string
}

export interface MenuServiceItemRenderer2 {
    text: Text9
    icon: Icon5
    serviceEndpoint: ServiceEndpoint2
    trackingParams: string
}

export interface Text9 {
    runs: Run22[]
}

export interface Run22 {
    text: string
}

export interface Icon5 {
    iconType: string
}

export interface ServiceEndpoint2 {
    clickTrackingParams: string
    queueAddEndpoint: QueueAddEndpoint2
}

export interface QueueAddEndpoint2 {
    queueTarget: QueueTarget2
    queueInsertPosition: string
    commands: Command2[]
}

export interface QueueTarget2 {
    playlistId: string
    onEmptyQueue: OnEmptyQueue2
}

export interface OnEmptyQueue2 {
    clickTrackingParams: string
    watchEndpoint: WatchEndpoint5
}

export interface WatchEndpoint5 {
    playlistId: string
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
    runs: Run23[]
}

export interface Run23 {
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
    runs: Run24[]
}

export interface Run24 {
    text: string
}

export interface DefaultIcon2 {
    iconType: string
}

export interface DefaultServiceEndpoint2 {
    clickTrackingParams: string
    modalEndpoint: ModalEndpoint4
}

export interface ModalEndpoint4 {
    modal: Modal4
}

export interface Modal4 {
    modalWithTitleAndButtonRenderer: ModalWithTitleAndButtonRenderer4
}

export interface ModalWithTitleAndButtonRenderer4 {
    title: Title6
    content: Content7
    button: Button4
}

export interface Title6 {
    runs: Run25[]
}

export interface Run25 {
    text: string
}

export interface Content7 {
    runs: Run26[]
}

export interface Run26 {
    text: string
}

export interface Button4 {
    buttonRenderer: ButtonRenderer5
}

export interface ButtonRenderer5 {
    style: string
    isDisabled: boolean
    text: Text10
    navigationEndpoint: NavigationEndpoint11
    trackingParams: string
}

export interface Text10 {
    runs: Run27[]
}

export interface Run27 {
    text: string
}

export interface NavigationEndpoint11 {
    clickTrackingParams: string
    signInEndpoint: SignInEndpoint4
}

export interface SignInEndpoint4 {
    hack: boolean
}

export interface ToggledText2 {
    runs: Run28[]
}

export interface Run28 {
    text: string
}

export interface ToggledIcon2 {
    iconType: string
}

export interface ToggledServiceEndpoint2 {
    clickTrackingParams: string
    likeEndpoint: LikeEndpoint
}

export interface LikeEndpoint {
    status: string
    target: Target
}

export interface Target {
    playlistId: string
}

export interface Accessibility2 {
    accessibilityData: AccessibilityData8
}

export interface AccessibilityData8 {
    label: string
}

export interface ThumbnailOverlay {
    musicItemThumbnailOverlayRenderer: MusicItemThumbnailOverlayRenderer
}

export interface MusicItemThumbnailOverlayRenderer {
    background: Background
    content: Content8
    contentPosition: string
    displayStyle: string
}

export interface Background {
    verticalGradient: VerticalGradient
}

export interface VerticalGradient {
    gradientLayerColors: string[]
}

export interface Content8 {
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
    watchPlaylistEndpoint: WatchPlaylistEndpoint3
}

export interface WatchPlaylistEndpoint3 {
    playlistId: string
    params: string
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
    accessibilityData: AccessibilityData9
}

export interface AccessibilityData9 {
    label: string
}

export interface AccessibilityPauseData {
    accessibilityData: AccessibilityData10
}

export interface AccessibilityData10 {
    label: string
}

export interface MusicTastebuilderShelfRenderer {
    thumbnail: Thumbnail6
    primaryText: PrimaryText
    secondaryText: SecondaryText
    actionButton: ActionButton
    isVisible: boolean
    trackingParams: string
}

export interface Thumbnail6 {
    musicTastebuilderShelfThumbnailRenderer: MusicTastebuilderShelfThumbnailRenderer
}

export interface MusicTastebuilderShelfThumbnailRenderer {
    thumbnail: Thumbnail7
}

export interface Thumbnail7 {
    thumbnails: Thumbnail8[]
}

export interface Thumbnail8 {
    url: string
    width: number
    height: number
}

export interface PrimaryText {
    runs: Run29[]
}

export interface Run29 {
    text: string
}

export interface SecondaryText {
    runs: Run30[]
}

export interface Run30 {
    text: string
}

export interface ActionButton {
    buttonRenderer: ButtonRenderer6
}

export interface ButtonRenderer6 {
    style: string
    text: Text11
    navigationEndpoint: NavigationEndpoint12
    trackingParams: string
}

export interface Text11 {
    runs: Run31[]
}

export interface Run31 {
    text: string
}

export interface NavigationEndpoint12 {
    clickTrackingParams: string
    modalEndpoint: ModalEndpoint5
}

export interface ModalEndpoint5 {
    modal: Modal5
}

export interface Modal5 {
    modalWithTitleAndButtonRenderer: ModalWithTitleAndButtonRenderer5
}

export interface ModalWithTitleAndButtonRenderer5 {
    title: Title7
    content: Content9
    button: Button5
}

export interface Title7 {
    runs: Run32[]
}

export interface Run32 {
    text: string
}

export interface Content9 {
    runs: Run33[]
}

export interface Run33 {
    text: string
}

export interface Button5 {
    buttonRenderer: ButtonRenderer7
}

export interface ButtonRenderer7 {
    style: string
    isDisabled: boolean
    text: Text12
    navigationEndpoint: NavigationEndpoint13
    trackingParams: string
}

export interface Text12 {
    runs: Run34[]
}

export interface Run34 {
    text: string
}

export interface NavigationEndpoint13 {
    clickTrackingParams: string
    signInEndpoint: SignInEndpoint5
}

export interface SignInEndpoint5 {
    hack: boolean
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
    text: Text13
    navigationEndpoint: NavigationEndpoint14
    trackingParams: string
    isSelected: boolean
    onDeselectedCommand: OnDeselectedCommand
}

export interface Style {
    styleType: string
}

export interface Text13 {
    runs: Run35[]
}

export interface Run35 {
    text: string
}

export interface NavigationEndpoint14 {
    clickTrackingParams: string
    browseEndpoint: BrowseEndpoint5
}

export interface BrowseEndpoint5 {
    browseId: string
    params: string
}

export interface OnDeselectedCommand {
    clickTrackingParams: string
    browseEndpoint: BrowseEndpoint6
}

export interface BrowseEndpoint6 {
    browseId: string
    params: string
}

export interface Icon6 {
    iconType: string
}

export interface Background2 {
    musicThumbnailRenderer: MusicThumbnailRenderer3
}

export interface MusicThumbnailRenderer3 {
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
