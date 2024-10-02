export type ArtistResults_0 = Root2[]

export interface Root2 {
    responseContext: ResponseContext
    items?: Item[]
    trackingParams: string
    contents: Contents
    header?: Header3
}

export interface ResponseContext {
    serviceTrackingParams: ServiceTrackingParam[]
    maxAgeSeconds?: number
}

export interface ServiceTrackingParam {
    service: string
    params: Param[]
}

export interface Param {
    key: string
    value: string
}

export interface Item {
    guideSectionRenderer: GuideSectionRenderer
}

export interface GuideSectionRenderer {
    items: Item2[]
    trackingParams: string
    handlerDatas?: string[]
    header?: Header
}

export interface Item2 {
    guideEntryRenderer: GuideEntryRenderer
}

export interface GuideEntryRenderer {
    navigationEndpoint: NavigationEndpoint
    trackingParams: string
    formattedTitle: FormattedTitle
    formattedSubtitle?: FormattedSubtitle
    accessibility: Accessibility
    entryData?: EntryData
    subtitleBadges?: SubtitleBadge[]
    mouseOverButton?: MouseOverButton
    icon?: Icon2
    isPrimary?: boolean
    targetId?: string
}

export interface NavigationEndpoint {
    clickTrackingParams: string
    browseEndpoint: BrowseEndpoint
}

export interface BrowseEndpoint {
    browseId: string
    browseEndpointContextSupportedConfigs?: BrowseEndpointContextSupportedConfigs
}

export interface BrowseEndpointContextSupportedConfigs {
    browseEndpointContextMusicConfig: BrowseEndpointContextMusicConfig
}

export interface BrowseEndpointContextMusicConfig {
    pageType: string
}

export interface FormattedTitle {
    runs: Run[]
}

export interface Run {
    text: string
}

export interface FormattedSubtitle {
    runs: Run2[]
}

export interface Run2 {
    text: string
}

export interface Accessibility {
    accessibilityData: AccessibilityData
}

export interface AccessibilityData {
    label: string
}

export interface EntryData {
    guideEntryData: GuideEntryData
}

export interface GuideEntryData {
    guideEntryId: string
}

export interface SubtitleBadge {
    musicInlineBadgeRenderer: MusicInlineBadgeRenderer
}

export interface MusicInlineBadgeRenderer {
    trackingParams: string
    icon: Icon
    accessibilityData: AccessibilityData2
}

export interface Icon {
    iconType: string
}

export interface AccessibilityData2 {
    accessibilityData: AccessibilityData3
}

export interface AccessibilityData3 {
    label: string
}

export interface MouseOverButton {
    musicPlayButtonRenderer: MusicPlayButtonRenderer
}

export interface MusicPlayButtonRenderer {
    trackingParams: string
}

export interface Icon2 {
    iconType: string
}

export interface Header {
    guideSectionButtonListHeaderRenderer: GuideSectionButtonListHeaderRenderer
}

export interface GuideSectionButtonListHeaderRenderer {
    buttons: Button[]
}

export interface Button {
    buttonRenderer: ButtonRenderer
}

export interface ButtonRenderer {
    style: string
    isDisabled: boolean
    text: Text
    icon: Icon3
    navigationEndpoint: NavigationEndpoint2
    trackingParams: string
}

export interface Text {
    simpleText: string
}

export interface Icon3 {
    iconType: string
}

export interface NavigationEndpoint2 {
    clickTrackingParams: string
    create_playlistEndpoint: create_playlistEndpoint
}

export interface create_playlistEndpoint {
    params: string
    create_playlistDialog: create_playlistDialog
}

export interface create_playlistDialog {
    create_playlistDialogRenderer: create_playlistDialogRenderer
}

export interface create_playlistDialogRenderer {
    dialogTitle: DialogTitle
    titlePlaceholder: string
    privacyOption: PrivacyOption
    cancelButton: CancelButton
    createButton: CreateButton
}

export interface DialogTitle {
    runs: Run3[]
}

export interface Run3 {
    text: string
}

export interface PrivacyOption {
    dropdownRenderer: DropdownRenderer
}

export interface DropdownRenderer {
    entries: Entry[]
    label: string
    accessibility: Accessibility3
}

export interface Entry {
    dropdownItemRenderer: DropdownItemRenderer
}

export interface DropdownItemRenderer {
    label: Label
    isSelected: boolean
    accessibility: Accessibility2
    int32Value: number
    icon: Icon4
    descriptionText: DescriptionText
}

export interface Label {
    runs: Run4[]
}

export interface Run4 {
    text: string
}

export interface Accessibility2 {
    label: string
}

export interface Icon4 {
    iconType: string
}

export interface DescriptionText {
    runs: Run5[]
}

export interface Run5 {
    text: string
}

export interface Accessibility3 {
    label: string
}

export interface CancelButton {
    buttonRenderer: ButtonRenderer2
}

export interface ButtonRenderer2 {
    style: string
    isDisabled: boolean
    text: Text2
    trackingParams: string
}

export interface Text2 {
    runs: Run6[]
}

export interface Run6 {
    text: string
}

export interface CreateButton {
    buttonRenderer: ButtonRenderer3
}

export interface ButtonRenderer3 {
    style: string
    isDisabled: boolean
    text: Text3
    trackingParams: string
}

export interface Text3 {
    runs: Run7[]
}

export interface Run7 {
    text: string
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
    content: Content
    trackingParams: string
}

export interface Content {
    sectionListRenderer: SectionListRenderer
}

export interface SectionListRenderer {
    contents: Content2[]
    trackingParams: string
}

export interface Content2 {
    musicShelfRenderer?: MusicShelfRenderer
    musicCarouselShelfRenderer?: MusicCarouselShelfRenderer
}

export interface MusicShelfRenderer {
    title: Title
    contents: Content3[]
    trackingParams: string
    bottomText: BottomText
    bottomEndpoint: BottomEndpoint
    shelfDivider: ShelfDivider
}

export interface Title {
    runs: Run8[]
}

export interface Run8 {
    text: string
    navigationEndpoint: NavigationEndpoint3
}

export interface NavigationEndpoint3 {
    clickTrackingParams: string
    browseEndpoint: BrowseEndpoint2
}

export interface BrowseEndpoint2 {
    browseId: string
    params: string
    browseEndpointContextSupportedConfigs: BrowseEndpointContextSupportedConfigs2
}

export interface BrowseEndpointContextSupportedConfigs2 {
    browseEndpointContextMusicConfig: BrowseEndpointContextMusicConfig2
}

export interface BrowseEndpointContextMusicConfig2 {
    pageType: string
}

export interface Content3 {
    musicResponsiveListItemRenderer: MusicResponsiveListItemRenderer
}

export interface MusicResponsiveListItemRenderer {
    trackingParams: string
    thumbnail: Thumbnail
    flexColumns: FlexColumn[]
    menu: Menu
    playlistItemData: PlaylistItemData
    flexColumnDisplayStyle: string
    navigationEndpoint: NavigationEndpoint6
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
    text: Text4
    displayPriority: string
}

export interface Text4 {
    runs: Run9[]
}

export interface Run9 {
    text: string
    navigationEndpoint?: NavigationEndpoint4
}

export interface NavigationEndpoint4 {
    clickTrackingParams: string
    watchEndpoint: WatchEndpoint
}

export interface WatchEndpoint {
    videoId: string
    playlistId: string
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
    items: Item3[]
    trackingParams: string
    accessibility: Accessibility4
}

export interface Item3 {
    menuNavigationItemRenderer?: MenuNavigationItemRenderer
    menuServiceItemRenderer?: MenuServiceItemRenderer
    toggleMenuServiceItemRenderer?: ToggleMenuServiceItemRenderer
}

export interface MenuNavigationItemRenderer {
    text: Text5
    icon: Icon5
    navigationEndpoint: NavigationEndpoint5
    trackingParams: string
}

export interface Text5 {
    runs: Run10[]
}

export interface Run10 {
    text: string
}

export interface Icon5 {
    iconType: string
}

export interface NavigationEndpoint5 {
    clickTrackingParams: string
    shareEntityEndpoint?: ShareEntityEndpoint
    browseEndpoint?: BrowseEndpoint3
    addToPlaylistEndpoint?: AddToPlaylistEndpoint
    watchEndpoint?: WatchEndpoint2
}

export interface ShareEntityEndpoint {
    serializedShareEntity: string
    sharePanelType: string
}

export interface BrowseEndpoint3 {
    browseId: string
    browseEndpointContextSupportedConfigs: BrowseEndpointContextSupportedConfigs3
}

export interface BrowseEndpointContextSupportedConfigs3 {
    browseEndpointContextMusicConfig: BrowseEndpointContextMusicConfig3
}

export interface BrowseEndpointContextMusicConfig3 {
    pageType: string
}

export interface AddToPlaylistEndpoint {
    videoId: string
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
    text: Text6
    icon: Icon6
    serviceEndpoint: ServiceEndpoint
    trackingParams: string
}

export interface Text6 {
    runs: Run11[]
}

export interface Run11 {
    text: string
}

export interface Icon6 {
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
}

export interface LikeEndpoint {
    status: string
    target: Target
    actions?: Action[]
}

export interface Target {
    videoId: string
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
}

export interface LikeEndpoint2 {
    status: string
    target: Target2
    actions?: Action2[]
}

export interface Target2 {
    videoId: string
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

export interface Accessibility4 {
    accessibilityData: AccessibilityData4
}

export interface AccessibilityData4 {
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
    playlistId: string
    index: number
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

export interface BottomText {
    runs: Run15[]
}

export interface Run15 {
    text: string
}

export interface BottomEndpoint {
    clickTrackingParams: string
    browseEndpoint: BrowseEndpoint4
}

export interface BrowseEndpoint4 {
    browseId: string
    params: string
    browseEndpointContextSupportedConfigs: BrowseEndpointContextSupportedConfigs4
}

export interface BrowseEndpointContextSupportedConfigs4 {
    browseEndpointContextMusicConfig: BrowseEndpointContextMusicConfig4
}

export interface BrowseEndpointContextMusicConfig4 {
    pageType: string
}

export interface ShelfDivider {
    musicShelfDividerRenderer: MusicShelfDividerRenderer
}

export interface MusicShelfDividerRenderer {
    hidden: boolean
}

export interface MusicCarouselShelfRenderer {
    header: Header2
    contents: Content4[]
    trackingParams: string
    itemSize: string
}

export interface Header2 {
    musicCarouselShelfBasicHeaderRenderer: MusicCarouselShelfBasicHeaderRenderer
}

export interface MusicCarouselShelfBasicHeaderRenderer {
    title: Title2
    accessibilityData: AccessibilityData5
    headerStyle: string
    trackingParams: string
    moreContentButton?: MoreContentButton
}

export interface Title2 {
    runs: Run16[]
}

export interface Run16 {
    text: string
    navigationEndpoint?: NavigationEndpoint7
}

export interface NavigationEndpoint7 {
    clickTrackingParams: string
    browseEndpoint: BrowseEndpoint5
}

export interface BrowseEndpoint5 {
    browseId: string
    params: string
    browseEndpointContextSupportedConfigs?: BrowseEndpointContextSupportedConfigs5
}

export interface BrowseEndpointContextSupportedConfigs5 {
    browseEndpointContextMusicConfig: BrowseEndpointContextMusicConfig5
}

export interface BrowseEndpointContextMusicConfig5 {
    pageType: string
}

export interface AccessibilityData5 {
    accessibilityData: AccessibilityData6
}

export interface AccessibilityData6 {
    label: string
}

export interface MoreContentButton {
    buttonRenderer: ButtonRenderer4
}

export interface ButtonRenderer4 {
    style: string
    text: Text7
    navigationEndpoint: NavigationEndpoint8
    trackingParams: string
    accessibilityData: AccessibilityData7
}

export interface Text7 {
    runs: Run17[]
}

export interface Run17 {
    text: string
}

export interface NavigationEndpoint8 {
    clickTrackingParams: string
    browseEndpoint: BrowseEndpoint6
}

export interface BrowseEndpoint6 {
    browseId: string
    params: string
    browseEndpointContextSupportedConfigs?: BrowseEndpointContextSupportedConfigs6
}

export interface BrowseEndpointContextSupportedConfigs6 {
    browseEndpointContextMusicConfig: BrowseEndpointContextMusicConfig6
}

export interface BrowseEndpointContextMusicConfig6 {
    pageType: string
}

export interface AccessibilityData7 {
    accessibilityData: AccessibilityData8
}

export interface AccessibilityData8 {
    label: string
}

export interface Content4 {
    musicTwoRowItemRenderer: MusicTwoRowItemRenderer
}

export interface MusicTwoRowItemRenderer {
    thumbnailRenderer: ThumbnailRenderer
    aspectRatio: string
    title: Title3
    subtitle: Subtitle
    navigationEndpoint: NavigationEndpoint10
    trackingParams: string
    menu: Menu2
    thumbnailOverlay?: ThumbnailOverlay
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

export interface Title3 {
    runs: Run18[]
}

export interface Run18 {
    text: string
    navigationEndpoint?: NavigationEndpoint9
}

export interface NavigationEndpoint9 {
    clickTrackingParams: string
    browseEndpoint: BrowseEndpoint7
}

export interface BrowseEndpoint7 {
    browseId: string
    browseEndpointContextSupportedConfigs: BrowseEndpointContextSupportedConfigs7
    params?: string
}

export interface BrowseEndpointContextSupportedConfigs7 {
    browseEndpointContextMusicConfig: BrowseEndpointContextMusicConfig7
}

export interface BrowseEndpointContextMusicConfig7 {
    pageType: string
}

export interface Subtitle {
    runs: Run19[]
}

export interface Run19 {
    text: string
}

export interface NavigationEndpoint10 {
    clickTrackingParams: string
    browseEndpoint?: BrowseEndpoint8
    watchEndpoint?: WatchEndpoint5
}

export interface BrowseEndpoint8 {
    browseId: string
    browseEndpointContextSupportedConfigs: BrowseEndpointContextSupportedConfigs8
    params?: string
}

export interface BrowseEndpointContextSupportedConfigs8 {
    browseEndpointContextMusicConfig: BrowseEndpointContextMusicConfig8
}

export interface BrowseEndpointContextMusicConfig8 {
    pageType: string
}

export interface WatchEndpoint5 {
    videoId: string
    index: number
    watchEndpointMusicSupportedConfigs: WatchEndpointMusicSupportedConfigs4
    playlistId?: string
    loggingContext?: LoggingContext4
}

export interface WatchEndpointMusicSupportedConfigs4 {
    watchEndpointMusicConfig: WatchEndpointMusicConfig4
}

export interface WatchEndpointMusicConfig4 {
    musicVideoType: string
}

export interface LoggingContext4 {
    vssLoggingContext: VssLoggingContext4
}

export interface VssLoggingContext4 {
    serializedContextData: string
}

export interface Menu2 {
    menuRenderer: MenuRenderer2
}

export interface MenuRenderer2 {
    items: Item5[]
    trackingParams: string
    accessibility: Accessibility5
}

export interface Item5 {
    menuNavigationItemRenderer?: MenuNavigationItemRenderer2
    menuServiceItemRenderer?: MenuServiceItemRenderer2
    toggleMenuServiceItemRenderer?: ToggleMenuServiceItemRenderer2
}

export interface MenuNavigationItemRenderer2 {
    text: Text8
    icon: Icon7
    navigationEndpoint: NavigationEndpoint11
    trackingParams: string
}

export interface Text8 {
    runs: Run20[]
}

export interface Run20 {
    text: string
}

export interface Icon7 {
    iconType: string
}

export interface NavigationEndpoint11 {
    clickTrackingParams: string
    shareEntityEndpoint?: ShareEntityEndpoint2
    watchPlaylistEndpoint?: WatchPlaylistEndpoint
    addToPlaylistEndpoint?: AddToPlaylistEndpoint2
    browseEndpoint?: BrowseEndpoint9
    watchEndpoint?: WatchEndpoint6
}

export interface ShareEntityEndpoint2 {
    serializedShareEntity: string
    sharePanelType: string
}

export interface WatchPlaylistEndpoint {
    playlistId: string
    params: string
}

export interface AddToPlaylistEndpoint2 {
    playlistId?: string
    videoId?: string
}

export interface BrowseEndpoint9 {
    browseId: string
    browseEndpointContextSupportedConfigs: BrowseEndpointContextSupportedConfigs9
}

export interface BrowseEndpointContextSupportedConfigs9 {
    browseEndpointContextMusicConfig: BrowseEndpointContextMusicConfig9
}

export interface BrowseEndpointContextMusicConfig9 {
    pageType: string
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
    text: Text9
    icon: Icon8
    serviceEndpoint: ServiceEndpoint2
    trackingParams: string
}

export interface Text9 {
    runs: Run21[]
}

export interface Run21 {
    text: string
}

export interface Icon8 {
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
    playlistId?: string
    onEmptyQueue: OnEmptyQueue2
    videoId?: string
}

export interface OnEmptyQueue2 {
    clickTrackingParams: string
    watchEndpoint: WatchEndpoint7
}

export interface WatchEndpoint7 {
    playlistId?: string
    videoId?: string
}

export interface Command2 {
    clickTrackingParams: string
    addToToastAction: AddToToastAction2
}

export interface AddToToastAction2 {
    item: Item6
}

export interface Item6 {
    notificationTextRenderer: NotificationTextRenderer2
}

export interface NotificationTextRenderer2 {
    successResponseText: SuccessResponseText2
    trackingParams: string
}

export interface SuccessResponseText2 {
    runs: Run22[]
}

export interface Run22 {
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
    runs: Run23[]
}

export interface Run23 {
    text: string
}

export interface DefaultIcon2 {
    iconType: string
}

export interface DefaultServiceEndpoint2 {
    clickTrackingParams: string
    subscribeEndpoint?: SubscribeEndpoint
    likeEndpoint?: LikeEndpoint3
    feedbackEndpoint?: FeedbackEndpoint3
}

export interface SubscribeEndpoint {
    channelIds: string[]
    params: string
}

export interface LikeEndpoint3 {
    status: string
    target: Target3
}

export interface Target3 {
    playlistId?: string
    videoId?: string
}

export interface FeedbackEndpoint3 {
    feedbackToken: string
}

export interface ToggledText2 {
    runs: Run24[]
}

export interface Run24 {
    text: string
}

export interface ToggledIcon2 {
    iconType: string
}

export interface ToggledServiceEndpoint2 {
    clickTrackingParams: string
    unsubscribeEndpoint?: UnsubscribeEndpoint
    likeEndpoint?: LikeEndpoint4
    feedbackEndpoint?: FeedbackEndpoint4
}

export interface UnsubscribeEndpoint {
    channelIds: string[]
    params: string
}

export interface LikeEndpoint4 {
    status: string
    target: Target4
    actions?: Action3[]
}

export interface Target4 {
    playlistId?: string
    videoId?: string
}

export interface Action3 {
    clickTrackingParams: string
    musicLibraryStatusUpdateCommand: MusicLibraryStatusUpdateCommand3
}

export interface MusicLibraryStatusUpdateCommand3 {
    libraryStatus: string
    addToLibraryFeedbackToken: string
}

export interface FeedbackEndpoint4 {
    feedbackToken: string
}

export interface Accessibility5 {
    accessibilityData: AccessibilityData9
}

export interface AccessibilityData9 {
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
    musicPlayButtonRenderer: MusicPlayButtonRenderer2
}

export interface MusicPlayButtonRenderer2 {
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
    watchPlaylistEndpoint?: WatchPlaylistEndpoint2
    watchEndpoint?: WatchEndpoint8
}

export interface WatchPlaylistEndpoint2 {
    playlistId: string
    params: string
}

export interface WatchEndpoint8 {
    videoId: string
    playlistId?: string
    loggingContext?: LoggingContext6
    watchEndpointMusicSupportedConfigs: WatchEndpointMusicSupportedConfigs6
    index?: number
}

export interface LoggingContext6 {
    vssLoggingContext: VssLoggingContext6
}

export interface VssLoggingContext6 {
    serializedContextData: string
}

export interface WatchEndpointMusicSupportedConfigs6 {
    watchEndpointMusicConfig: WatchEndpointMusicConfig6
}

export interface WatchEndpointMusicConfig6 {
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
    accessibilityData: AccessibilityData10
}

export interface AccessibilityData10 {
    label: string
}

export interface AccessibilityPauseData {
    accessibilityData: AccessibilityData11
}

export interface AccessibilityData11 {
    label: string
}

export interface Header3 {
    musicImmersiveHeaderRenderer: MusicImmersiveHeaderRenderer
}

export interface MusicImmersiveHeaderRenderer {
    title: Title4
    subscriptionButton: SubscriptionButton
    moreButton: MoreButton
    menu: Menu3
    thumbnail: Thumbnail6
    trackingParams: string
    playButton: PlayButton
    startRadioButton: StartRadioButton
    shareEndpoint: ShareEndpoint
}

export interface Title4 {
    runs: Run25[]
}

export interface Run25 {
    text: string
}

export interface SubscriptionButton {
    subscribeButtonRenderer: SubscribeButtonRenderer
}

export interface SubscribeButtonRenderer {
    subscriberCountText: SubscriberCountText
    subscribed: boolean
    enabled: boolean
    type: string
    channelId: string
    showPreferences: boolean
    subscriberCountWithUnsubscribeText: SubscriberCountWithUnsubscribeText
    subscribedButtonText: SubscribedButtonText
    unsubscribedButtonText: UnsubscribedButtonText
    trackingParams: string
    unsubscribeButtonText: UnsubscribeButtonText
    serviceEndpoints: ServiceEndpoint3[]
    longSubscriberCountText: LongSubscriberCountText
    shortSubscriberCountText: ShortSubscriberCountText
    subscribeAccessibility: SubscribeAccessibility
    unsubscribeAccessibility: UnsubscribeAccessibility
}

export interface SubscriberCountText {
    runs: Run26[]
}

export interface Run26 {
    text: string
}

export interface SubscriberCountWithUnsubscribeText {
    runs: Run27[]
}

export interface Run27 {
    text: string
}

export interface SubscribedButtonText {
    runs: Run28[]
}

export interface Run28 {
    text: string
}

export interface UnsubscribedButtonText {
    runs: Run29[]
}

export interface Run29 {
    text: string
}

export interface UnsubscribeButtonText {
    runs: Run30[]
}

export interface Run30 {
    text: string
}

export interface ServiceEndpoint3 {
    clickTrackingParams: string
    subscribeEndpoint?: SubscribeEndpoint2
    signalServiceEndpoint?: SignalServiceEndpoint
}

export interface SubscribeEndpoint2 {
    channelIds: string[]
    params: string
}

export interface SignalServiceEndpoint {
    signal: string
    actions: Action4[]
}

export interface Action4 {
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
    cancelButton: CancelButton2
}

export interface DialogMessage {
    runs: Run31[]
}

export interface Run31 {
    text: string
}

export interface ConfirmButton {
    buttonRenderer: ButtonRenderer5
}

export interface ButtonRenderer5 {
    style: string
    size: string
    text: Text10
    serviceEndpoint: ServiceEndpoint4
    trackingParams: string
}

export interface Text10 {
    runs: Run32[]
}

export interface Run32 {
    text: string
}

export interface ServiceEndpoint4 {
    clickTrackingParams: string
    unsubscribeEndpoint: UnsubscribeEndpoint2
}

export interface UnsubscribeEndpoint2 {
    channelIds: string[]
}

export interface CancelButton2 {
    buttonRenderer: ButtonRenderer6
}

export interface ButtonRenderer6 {
    style: string
    size: string
    text: Text11
    trackingParams: string
}

export interface Text11 {
    runs: Run33[]
}

export interface Run33 {
    text: string
}

export interface LongSubscriberCountText {
    runs: Run34[]
    accessibility: Accessibility6
}

export interface Run34 {
    text: string
}

export interface Accessibility6 {
    accessibilityData: AccessibilityData12
}

export interface AccessibilityData12 {
    label: string
}

export interface ShortSubscriberCountText {
    runs: Run35[]
}

export interface Run35 {
    text: string
}

export interface SubscribeAccessibility {
    accessibilityData: AccessibilityData13
}

export interface AccessibilityData13 {
    label: string
}

export interface UnsubscribeAccessibility {
    accessibilityData: AccessibilityData14
}

export interface AccessibilityData14 {
    label: string
}

export interface MoreButton {
    toggleButtonRenderer: ToggleButtonRenderer
}

export interface ToggleButtonRenderer {
    isToggled: boolean
    isDisabled: boolean
    defaultIcon: DefaultIcon3
    defaultText: DefaultText3
    toggledIcon: ToggledIcon3
    toggledText: ToggledText3
    trackingParams: string
}

export interface DefaultIcon3 {
    iconType: string
}

export interface DefaultText3 {
    runs: Run36[]
}

export interface Run36 {
    text: string
}

export interface ToggledIcon3 {
    iconType: string
}

export interface ToggledText3 {
    runs: Run37[]
}

export interface Run37 {
    text: string
}

export interface Menu3 {
    menuRenderer: MenuRenderer3
}

export interface MenuRenderer3 {
    items: Item7[]
    trackingParams: string
    accessibility: Accessibility7
}

export interface Item7 {
    menuNavigationItemRenderer: MenuNavigationItemRenderer3
}

export interface MenuNavigationItemRenderer3 {
    text: Text12
    icon: Icon9
    navigationEndpoint: NavigationEndpoint12
    trackingParams: string
}

export interface Text12 {
    runs: Run38[]
}

export interface Run38 {
    text: string
}

export interface Icon9 {
    iconType: string
}

export interface NavigationEndpoint12 {
    clickTrackingParams: string
    shareEntityEndpoint: ShareEntityEndpoint3
}

export interface ShareEntityEndpoint3 {
    serializedShareEntity: string
    sharePanelType: string
}

export interface Accessibility7 {
    accessibilityData: AccessibilityData15
}

export interface AccessibilityData15 {
    label: string
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

export interface PlayButton {
    buttonRenderer: ButtonRenderer7
}

export interface ButtonRenderer7 {
    style: string
    size: string
    text: Text13
    icon: Icon10
    navigationEndpoint: NavigationEndpoint13
    accessibility: Accessibility8
    trackingParams: string
    accessibilityData: AccessibilityData16
}

export interface Text13 {
    runs: Run39[]
}

export interface Run39 {
    text: string
}

export interface Icon10 {
    iconType: string
}

export interface NavigationEndpoint13 {
    clickTrackingParams: string
    watchEndpoint: WatchEndpoint9
}

export interface WatchEndpoint9 {
    videoId: string
    playlistId: string
    params: string
    loggingContext: LoggingContext7
}

export interface LoggingContext7 {
    vssLoggingContext: VssLoggingContext7
}

export interface VssLoggingContext7 {
    serializedContextData: string
}

export interface Accessibility8 {
    label: string
}

export interface AccessibilityData16 {
    accessibilityData: AccessibilityData17
}

export interface AccessibilityData17 {
    label: string
}

export interface StartRadioButton {
    buttonRenderer: ButtonRenderer8
}

export interface ButtonRenderer8 {
    text: Text14
    icon: Icon11
    navigationEndpoint: NavigationEndpoint14
    accessibility: Accessibility9
    trackingParams: string
    accessibilityData: AccessibilityData18
}

export interface Text14 {
    runs: Run40[]
}

export interface Run40 {
    text: string
}

export interface Icon11 {
    iconType: string
}

export interface NavigationEndpoint14 {
    clickTrackingParams: string
    watchEndpoint: WatchEndpoint10
}

export interface WatchEndpoint10 {
    videoId: string
    playlistId: string
    params: string
    loggingContext: LoggingContext8
}

export interface LoggingContext8 {
    vssLoggingContext: VssLoggingContext8
}

export interface VssLoggingContext8 {
    serializedContextData: string
}

export interface Accessibility9 {
    label: string
}

export interface AccessibilityData18 {
    accessibilityData: AccessibilityData19
}

export interface AccessibilityData19 {
    label: string
}

export interface ShareEndpoint {
    clickTrackingParams: string
    shareEntityEndpoint: ShareEntityEndpoint4
}

export interface ShareEntityEndpoint4 {
    serializedShareEntity: string
    sharePanelType: string
}
