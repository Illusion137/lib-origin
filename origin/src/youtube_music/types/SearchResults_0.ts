export type SearchResults_0 = Root2[]

export interface Root2 {
    responseContext: ResponseContext
    items?: Item[]
    trackingParams: string
    contents: Contents
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
    tabbedSearchResultsRenderer: TabbedSearchResultsRenderer
}

export interface TabbedSearchResultsRenderer {
    tabs: Tab[]
}

export interface Tab {
    tabRenderer: TabRenderer
}

export interface TabRenderer {
    title: string
    selected?: boolean
    content: Content
    tabIdentifier: string
    trackingParams: string
    endpoint?: Endpoint
}

export interface Content {
    sectionListRenderer: SectionListRenderer
}

export interface SectionListRenderer {
    contents: Content2[]
    trackingParams: string
    header: Header3
    continuations?: Continuation[]
}

export interface Content2 {
    musicCardShelfRenderer?: MusicCardShelfRenderer
    musicShelfRenderer?: MusicShelfRenderer
}

export interface MusicCardShelfRenderer {
    trackingParams: string
    thumbnail: Thumbnail
    title: Title
    subtitle: Subtitle
    contents: Content3[]
    buttons: Button2[]
    menu: Menu2
    onTap: OnTap
    header: Header2
    endIcon: EndIcon
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
    browseEndpointContextSupportedConfigs: BrowseEndpointContextSupportedConfigs2
}

export interface BrowseEndpointContextSupportedConfigs2 {
    browseEndpointContextMusicConfig: BrowseEndpointContextMusicConfig2
}

export interface BrowseEndpointContextMusicConfig2 {
    pageType: string
}

export interface Subtitle {
    runs: Run9[]
}

export interface Run9 {
    text: string
}

export interface Content3 {
    musicResponsiveListItemRenderer: MusicResponsiveListItemRenderer
}

export interface MusicResponsiveListItemRenderer {
    trackingParams: string
    thumbnail: Thumbnail4
    flexColumns: FlexColumn[]
    menu: Menu
    playlistItemData?: PlaylistItemData
    flexColumnDisplayStyle: string
    navigationEndpoint: NavigationEndpoint6
    itemHeight: string
    overlay?: Overlay
}

export interface Thumbnail4 {
    musicThumbnailRenderer: MusicThumbnailRenderer2
}

export interface MusicThumbnailRenderer2 {
    thumbnail: Thumbnail5
    thumbnailCrop: string
    thumbnailScale: string
    trackingParams: string
}

export interface Thumbnail5 {
    thumbnails: Thumbnail6[]
}

export interface Thumbnail6 {
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
    runs: Run10[]
}

export interface Run10 {
    text: string
    navigationEndpoint?: NavigationEndpoint4
}

export interface NavigationEndpoint4 {
    clickTrackingParams: string
    browseEndpoint?: BrowseEndpoint3
    watchEndpoint?: WatchEndpoint
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

export interface WatchEndpoint {
    videoId: string
    watchEndpointMusicSupportedConfigs: WatchEndpointMusicSupportedConfigs
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
    runs: Run11[]
}

export interface Run11 {
    text: string
}

export interface Icon5 {
    iconType: string
}

export interface NavigationEndpoint5 {
    clickTrackingParams: string
    shareEntityEndpoint?: ShareEntityEndpoint
    browseEndpoint?: BrowseEndpoint4
    addToPlaylistEndpoint?: AddToPlaylistEndpoint
    watchPlaylistEndpoint?: WatchPlaylistEndpoint
    watchEndpoint?: WatchEndpoint2
}

export interface ShareEntityEndpoint {
    serializedShareEntity: string
    sharePanelType: string
}

export interface BrowseEndpoint4 {
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
    videoId?: string
    playlistId?: string
}

export interface WatchPlaylistEndpoint {
    playlistId: string
    params: string
}

export interface WatchEndpoint2 {
    videoId: string
    playlistId: string
    params: string
    loggingContext: LoggingContext
    watchEndpointMusicSupportedConfigs: WatchEndpointMusicSupportedConfigs2
}

export interface LoggingContext {
    vssLoggingContext: VssLoggingContext
}

export interface VssLoggingContext {
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
    runs: Run12[]
}

export interface Run12 {
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
    playlistId?: string
    onEmptyQueue: OnEmptyQueue
    videoId?: string
}

export interface OnEmptyQueue {
    clickTrackingParams: string
    watchEndpoint: WatchEndpoint3
}

export interface WatchEndpoint3 {
    playlistId?: string
    videoId?: string
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
    runs: Run13[]
}

export interface Run13 {
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
    runs: Run14[]
}

export interface Run14 {
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
}

export interface Target {
    playlistId?: string
    videoId?: string
}

export interface FeedbackEndpoint {
    feedbackToken: string
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
    likeEndpoint?: LikeEndpoint2
    feedbackEndpoint?: FeedbackEndpoint2
}

export interface LikeEndpoint2 {
    status: string
    target: Target2
    actions?: Action[]
}

export interface Target2 {
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
    watchEndpoint?: WatchEndpoint4
    browseEndpoint?: BrowseEndpoint5
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

export interface BrowseEndpoint5 {
    browseId: string
    browseEndpointContextSupportedConfigs: BrowseEndpointContextSupportedConfigs5
}

export interface BrowseEndpointContextSupportedConfigs5 {
    browseEndpointContextMusicConfig: BrowseEndpointContextMusicConfig5
}

export interface BrowseEndpointContextMusicConfig5 {
    pageType: string
}

export interface Overlay {
    musicItemThumbnailOverlayRenderer: MusicItemThumbnailOverlayRenderer
}

export interface MusicItemThumbnailOverlayRenderer {
    background: Background
    content: Content4
    contentPosition: string
    displayStyle: string
}

export interface Background {
    verticalGradient: VerticalGradient
}

export interface VerticalGradient {
    gradientLayerColors: string[]
}

export interface Content4 {
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
    watchEndpoint: WatchEndpoint5
}

export interface WatchEndpoint5 {
    videoId: string
    playlistId: string
    loggingContext: LoggingContext2
    watchEndpointMusicSupportedConfigs: WatchEndpointMusicSupportedConfigs4
}

export interface LoggingContext2 {
    vssLoggingContext: VssLoggingContext2
}

export interface VssLoggingContext2 {
    serializedContextData: string
}

export interface WatchEndpointMusicSupportedConfigs4 {
    watchEndpointMusicConfig: WatchEndpointMusicConfig4
}

export interface WatchEndpointMusicConfig4 {
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
    accessibilityData: AccessibilityData5
}

export interface AccessibilityData5 {
    label: string
}

export interface AccessibilityPauseData {
    accessibilityData: AccessibilityData6
}

export interface AccessibilityData6 {
    label: string
}

export interface Button2 {
    buttonRenderer: ButtonRenderer4
}

export interface ButtonRenderer4 {
    style: string
    size?: string
    text: Text7
    icon: Icon7
    accessibility: Accessibility5
    trackingParams: string
    accessibilityData: AccessibilityData7
    command: Command2
}

export interface Text7 {
    runs: Run16[]
}

export interface Run16 {
    text: string
}

export interface Icon7 {
    iconType: string
}

export interface Accessibility5 {
    label: string
}

export interface AccessibilityData7 {
    accessibilityData: AccessibilityData8
}

export interface AccessibilityData8 {
    label: string
}

export interface Command2 {
    clickTrackingParams: string
    watchPlaylistEndpoint: WatchPlaylistEndpoint2
}

export interface WatchPlaylistEndpoint2 {
    playlistId: string
    params: string
}

export interface Menu2 {
    menuRenderer: MenuRenderer2
}

export interface MenuRenderer2 {
    items: Item5[]
    trackingParams: string
    accessibility: Accessibility6
}

export interface Item5 {
    menuNavigationItemRenderer?: MenuNavigationItemRenderer2
    toggleMenuServiceItemRenderer?: ToggleMenuServiceItemRenderer2
}

export interface MenuNavigationItemRenderer2 {
    text: Text8
    icon: Icon8
    navigationEndpoint: NavigationEndpoint7
    trackingParams: string
}

export interface Text8 {
    runs: Run17[]
}

export interface Run17 {
    text: string
}

export interface Icon8 {
    iconType: string
}

export interface NavigationEndpoint7 {
    clickTrackingParams: string
    shareEntityEndpoint?: ShareEntityEndpoint2
    watchPlaylistEndpoint?: WatchPlaylistEndpoint3
}

export interface ShareEntityEndpoint2 {
    serializedShareEntity: string
    sharePanelType: string
}

export interface WatchPlaylistEndpoint3 {
    playlistId: string
    params: string
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
    runs: Run18[]
}

export interface Run18 {
    text: string
}

export interface DefaultIcon2 {
    iconType: string
}

export interface DefaultServiceEndpoint2 {
    clickTrackingParams: string
    subscribeEndpoint: SubscribeEndpoint
}

export interface SubscribeEndpoint {
    channelIds: string[]
    params: string
}

export interface ToggledText2 {
    runs: Run19[]
}

export interface Run19 {
    text: string
}

export interface ToggledIcon2 {
    iconType: string
}

export interface ToggledServiceEndpoint2 {
    clickTrackingParams: string
    unsubscribeEndpoint: UnsubscribeEndpoint
}

export interface UnsubscribeEndpoint {
    channelIds: string[]
    params: string
}

export interface Accessibility6 {
    accessibilityData: AccessibilityData9
}

export interface AccessibilityData9 {
    label: string
}

export interface OnTap {
    clickTrackingParams: string
    browseEndpoint: BrowseEndpoint6
}

export interface BrowseEndpoint6 {
    browseId: string
    browseEndpointContextSupportedConfigs: BrowseEndpointContextSupportedConfigs6
}

export interface BrowseEndpointContextSupportedConfigs6 {
    browseEndpointContextMusicConfig: BrowseEndpointContextMusicConfig6
}

export interface BrowseEndpointContextMusicConfig6 {
    pageType: string
}

export interface Header2 {
    musicCardShelfHeaderBasicRenderer: MusicCardShelfHeaderBasicRenderer
}

export interface MusicCardShelfHeaderBasicRenderer {
    title: Title2
    trackingParams: string
}

export interface Title2 {
    runs: Run20[]
}

export interface Run20 {
    text: string
}

export interface EndIcon {
    iconType: string
}

export interface MusicShelfRenderer {
    title: Title3
    contents: Content5[]
    trackingParams: string
    bottomText: BottomText
    bottomEndpoint: BottomEndpoint
    shelfDivider: ShelfDivider
}

export interface Title3 {
    runs: Run21[]
}

export interface Run21 {
    text: string
}

export interface Content5 {
    musicResponsiveListItemRenderer: MusicResponsiveListItemRenderer2
}

export interface MusicResponsiveListItemRenderer2 {
    trackingParams: string
    thumbnail: Thumbnail7
    flexColumns: FlexColumn2[]
    menu: Menu3
    flexColumnDisplayStyle: string
    navigationEndpoint: NavigationEndpoint10
    itemHeight: string
    playlistItemData?: PlaylistItemData2
    overlay?: Overlay2
}

export interface Thumbnail7 {
    musicThumbnailRenderer: MusicThumbnailRenderer3
}

export interface MusicThumbnailRenderer3 {
    thumbnail: Thumbnail8
    thumbnailCrop: string
    thumbnailScale: string
    trackingParams: string
}

export interface Thumbnail8 {
    thumbnails: Thumbnail9[]
}

export interface Thumbnail9 {
    url: string
    width: number
    height: number
}

export interface FlexColumn2 {
    musicResponsiveListItemFlexColumnRenderer: MusicResponsiveListItemFlexColumnRenderer2
}

export interface MusicResponsiveListItemFlexColumnRenderer2 {
    text: Text9
    displayPriority: string
}

export interface Text9 {
    runs: Run22[]
}

export interface Run22 {
    text: string
    navigationEndpoint?: NavigationEndpoint8
}

export interface NavigationEndpoint8 {
    clickTrackingParams: string
    browseEndpoint?: BrowseEndpoint7
    watchEndpoint?: WatchEndpoint6
}

export interface BrowseEndpoint7 {
    browseId: string
    browseEndpointContextSupportedConfigs: BrowseEndpointContextSupportedConfigs7
}

export interface BrowseEndpointContextSupportedConfigs7 {
    browseEndpointContextMusicConfig: BrowseEndpointContextMusicConfig7
}

export interface BrowseEndpointContextMusicConfig7 {
    pageType: string
}

export interface WatchEndpoint6 {
    videoId: string
    watchEndpointMusicSupportedConfigs: WatchEndpointMusicSupportedConfigs5
}

export interface WatchEndpointMusicSupportedConfigs5 {
    watchEndpointMusicConfig: WatchEndpointMusicConfig5
}

export interface WatchEndpointMusicConfig5 {
    musicVideoType: string
}

export interface Menu3 {
    menuRenderer: MenuRenderer3
}

export interface MenuRenderer3 {
    items: Item6[]
    trackingParams: string
    accessibility: Accessibility7
    topLevelButtons?: TopLevelButton[]
}

export interface Item6 {
    menuNavigationItemRenderer?: MenuNavigationItemRenderer3
    menuServiceItemRenderer?: MenuServiceItemRenderer2
    toggleMenuServiceItemRenderer?: ToggleMenuServiceItemRenderer3
}

export interface MenuNavigationItemRenderer3 {
    text: Text10
    icon: Icon9
    navigationEndpoint: NavigationEndpoint9
    trackingParams: string
}

export interface Text10 {
    runs: Run23[]
}

export interface Run23 {
    text: string
}

export interface Icon9 {
    iconType: string
}

export interface NavigationEndpoint9 {
    clickTrackingParams: string
    shareEntityEndpoint?: ShareEntityEndpoint3
    browseEndpoint?: BrowseEndpoint8
    addToPlaylistEndpoint?: AddToPlaylistEndpoint2
    watchPlaylistEndpoint?: WatchPlaylistEndpoint4
    watchEndpoint?: WatchEndpoint7
}

export interface ShareEntityEndpoint3 {
    serializedShareEntity: string
    sharePanelType: string
}

export interface BrowseEndpoint8 {
    browseId: string
    browseEndpointContextSupportedConfigs: BrowseEndpointContextSupportedConfigs8
}

export interface BrowseEndpointContextSupportedConfigs8 {
    browseEndpointContextMusicConfig: BrowseEndpointContextMusicConfig8
}

export interface BrowseEndpointContextMusicConfig8 {
    pageType: string
}

export interface AddToPlaylistEndpoint2 {
    videoId?: string
    playlistId?: string
}

export interface WatchPlaylistEndpoint4 {
    playlistId: string
    params: string
}

export interface WatchEndpoint7 {
    videoId: string
    playlistId: string
    params: string
    loggingContext: LoggingContext3
    watchEndpointMusicSupportedConfigs: WatchEndpointMusicSupportedConfigs6
}

export interface LoggingContext3 {
    vssLoggingContext: VssLoggingContext3
}

export interface VssLoggingContext3 {
    serializedContextData: string
}

export interface WatchEndpointMusicSupportedConfigs6 {
    watchEndpointMusicConfig: WatchEndpointMusicConfig6
}

export interface WatchEndpointMusicConfig6 {
    musicVideoType: string
}

export interface MenuServiceItemRenderer2 {
    text: Text11
    icon: Icon10
    serviceEndpoint: ServiceEndpoint2
    trackingParams: string
}

export interface Text11 {
    runs: Run24[]
}

export interface Run24 {
    text: string
}

export interface Icon10 {
    iconType: string
}

export interface ServiceEndpoint2 {
    clickTrackingParams: string
    queueAddEndpoint: QueueAddEndpoint2
}

export interface QueueAddEndpoint2 {
    queueTarget: QueueTarget2
    queueInsertPosition: string
    commands: Command3[]
}

export interface QueueTarget2 {
    videoId?: string
    onEmptyQueue: OnEmptyQueue2
    playlistId?: string
}

export interface OnEmptyQueue2 {
    clickTrackingParams: string
    watchEndpoint: WatchEndpoint8
}

export interface WatchEndpoint8 {
    videoId?: string
    playlistId?: string
}

export interface Command3 {
    clickTrackingParams: string
    addToToastAction: AddToToastAction2
}

export interface AddToToastAction2 {
    item: Item7
}

export interface Item7 {
    notificationTextRenderer: NotificationTextRenderer2
}

export interface NotificationTextRenderer2 {
    successResponseText: SuccessResponseText2
    trackingParams: string
}

export interface SuccessResponseText2 {
    runs: Run25[]
}

export interface Run25 {
    text: string
}

export interface ToggleMenuServiceItemRenderer3 {
    defaultText: DefaultText3
    defaultIcon: DefaultIcon3
    defaultServiceEndpoint: DefaultServiceEndpoint3
    toggledText: ToggledText3
    toggledIcon: ToggledIcon3
    toggledServiceEndpoint: ToggledServiceEndpoint3
    trackingParams: string
    isToggled?: boolean
}

export interface DefaultText3 {
    runs: Run26[]
}

export interface Run26 {
    text: string
}

export interface DefaultIcon3 {
    iconType: string
}

export interface DefaultServiceEndpoint3 {
    clickTrackingParams: string
    playlistEditEndpoint?: PlaylistEditEndpoint
    feedbackEndpoint?: FeedbackEndpoint3
    likeEndpoint?: LikeEndpoint3
}

export interface PlaylistEditEndpoint {
    playlistId: string
    actions: Action2[]
    params: string
}

export interface Action2 {
    addedVideoId: string
    action: string
    dedupeOption: string
}

export interface FeedbackEndpoint3 {
    feedbackToken: string
    actions?: Action3[]
}

export interface Action3 {
    clickTrackingParams: string
    addToToastAction: AddToToastAction3
}

export interface AddToToastAction3 {
    item: Item8
}

export interface Item8 {
    notificationActionRenderer: NotificationActionRenderer
}

export interface NotificationActionRenderer {
    responseText: ResponseText
    trackingParams: string
}

export interface ResponseText {
    runs: Run27[]
}

export interface Run27 {
    text: string
}

export interface LikeEndpoint3 {
    status: string
    target: Target3
    actions?: Action4[]
}

export interface Target3 {
    playlistId?: string
    videoId?: string
}

export interface Action4 {
    clickTrackingParams: string
    musicLibraryStatusUpdateCommand: MusicLibraryStatusUpdateCommand2
}

export interface MusicLibraryStatusUpdateCommand2 {
    libraryStatus: string
    addToLibraryFeedbackToken: string
}

export interface ToggledText3 {
    runs: Run28[]
}

export interface Run28 {
    text: string
}

export interface ToggledIcon3 {
    iconType: string
}

export interface ToggledServiceEndpoint3 {
    clickTrackingParams: string
    playlistEditEndpoint?: PlaylistEditEndpoint2
    feedbackEndpoint?: FeedbackEndpoint4
    likeEndpoint?: LikeEndpoint4
}

export interface PlaylistEditEndpoint2 {
    playlistId: string
    actions: Action5[]
}

export interface Action5 {
    action: string
    removedVideoId: string
}

export interface FeedbackEndpoint4 {
    feedbackToken: string
    actions?: Action6[]
}

export interface Action6 {
    clickTrackingParams: string
    addToToastAction: AddToToastAction4
}

export interface AddToToastAction4 {
    item: Item9
}

export interface Item9 {
    notificationActionRenderer: NotificationActionRenderer2
}

export interface NotificationActionRenderer2 {
    responseText: ResponseText2
    trackingParams: string
}

export interface ResponseText2 {
    runs: Run29[]
}

export interface Run29 {
    text: string
}

export interface LikeEndpoint4 {
    status: string
    target: Target4
    actions?: Action7[]
}

export interface Target4 {
    playlistId?: string
    videoId?: string
}

export interface Action7 {
    clickTrackingParams: string
    musicLibraryStatusUpdateCommand: MusicLibraryStatusUpdateCommand3
}

export interface MusicLibraryStatusUpdateCommand3 {
    libraryStatus: string
    addToLibraryFeedbackToken: string
}

export interface Accessibility7 {
    accessibilityData: AccessibilityData10
}

export interface AccessibilityData10 {
    label: string
}

export interface TopLevelButton {
    likeButtonRenderer: LikeButtonRenderer
}

export interface LikeButtonRenderer {
    target: Target5
    likeStatus: string
    trackingParams: string
    likesAllowed: boolean
    serviceEndpoints: ServiceEndpoint3[]
}

export interface Target5 {
    videoId: string
}

export interface ServiceEndpoint3 {
    clickTrackingParams: string
    likeEndpoint: LikeEndpoint5
}

export interface LikeEndpoint5 {
    status: string
    target: Target6
}

export interface Target6 {
    videoId: string
}

export interface NavigationEndpoint10 {
    clickTrackingParams: string
    browseEndpoint?: BrowseEndpoint9
    watchEndpoint?: WatchEndpoint9
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

export interface WatchEndpoint9 {
    videoId: string
    params?: string
    watchEndpointMusicSupportedConfigs: WatchEndpointMusicSupportedConfigs7
}

export interface WatchEndpointMusicSupportedConfigs7 {
    watchEndpointMusicConfig: WatchEndpointMusicConfig7
}

export interface WatchEndpointMusicConfig7 {
    musicVideoType: string
}

export interface PlaylistItemData2 {
    videoId: string
}

export interface Overlay2 {
    musicItemThumbnailOverlayRenderer: MusicItemThumbnailOverlayRenderer2
}

export interface MusicItemThumbnailOverlayRenderer2 {
    background: Background2
    content: Content6
    contentPosition: string
    displayStyle: string
}

export interface Background2 {
    verticalGradient: VerticalGradient2
}

export interface VerticalGradient2 {
    gradientLayerColors: string[]
}

export interface Content6 {
    musicPlayButtonRenderer: MusicPlayButtonRenderer3
}

export interface MusicPlayButtonRenderer3 {
    playNavigationEndpoint: PlayNavigationEndpoint2
    trackingParams: string
    playIcon: PlayIcon2
    pauseIcon: PauseIcon2
    iconColor: number
    backgroundColor: number
    activeBackgroundColor: number
    loadingIndicatorColor: number
    playingIcon: PlayingIcon2
    iconLoadingColor: number
    activeScaleFactor: number
    buttonSize: string
    rippleTarget: string
    accessibilityPlayData: AccessibilityPlayData2
    accessibilityPauseData: AccessibilityPauseData2
}

export interface PlayNavigationEndpoint2 {
    clickTrackingParams: string
    watchPlaylistEndpoint?: WatchPlaylistEndpoint5
    watchEndpoint?: WatchEndpoint10
}

export interface WatchPlaylistEndpoint5 {
    playlistId: string
    params: string
}

export interface WatchEndpoint10 {
    videoId: string
    playlistId: string
    loggingContext: LoggingContext4
    watchEndpointMusicSupportedConfigs: WatchEndpointMusicSupportedConfigs8
}

export interface LoggingContext4 {
    vssLoggingContext: VssLoggingContext4
}

export interface VssLoggingContext4 {
    serializedContextData: string
}

export interface WatchEndpointMusicSupportedConfigs8 {
    watchEndpointMusicConfig: WatchEndpointMusicConfig8
}

export interface WatchEndpointMusicConfig8 {
    musicVideoType: string
}

export interface PlayIcon2 {
    iconType: string
}

export interface PauseIcon2 {
    iconType: string
}

export interface PlayingIcon2 {
    iconType: string
}

export interface AccessibilityPlayData2 {
    accessibilityData: AccessibilityData11
}

export interface AccessibilityData11 {
    label: string
}

export interface AccessibilityPauseData2 {
    accessibilityData: AccessibilityData12
}

export interface AccessibilityData12 {
    label: string
}

export interface BottomText {
    runs: Run30[]
}

export interface Run30 {
    text: string
}

export interface BottomEndpoint {
    clickTrackingParams: string
    searchEndpoint: SearchEndpoint
}

export interface SearchEndpoint {
    query: string
    params: string
}

export interface ShelfDivider {
    musicShelfDividerRenderer: MusicShelfDividerRenderer
}

export interface MusicShelfDividerRenderer {
    hidden: boolean
}

export interface Header3 {
    chipCloudRenderer: ChipCloudRenderer
}

export interface ChipCloudRenderer {
    chips: Chip[]
    collapsedRowCount: number
    trackingParams: string
    horizontalScrollable: boolean
}

export interface Chip {
    chipCloudChipRenderer: ChipCloudChipRenderer
}

export interface ChipCloudChipRenderer {
    style: Style
    text: Text12
    navigationEndpoint: NavigationEndpoint11
    trackingParams: string
    accessibilityData: AccessibilityData13
    isSelected: boolean
    uniqueId: string
}

export interface Style {
    styleType: string
}

export interface Text12 {
    runs: Run31[]
}

export interface Run31 {
    text: string
}

export interface NavigationEndpoint11 {
    clickTrackingParams: string
    searchEndpoint: SearchEndpoint2
}

export interface SearchEndpoint2 {
    query: string
    params: string
}

export interface AccessibilityData13 {
    accessibilityData: AccessibilityData14
}

export interface AccessibilityData14 {
    label: string
}

export interface Continuation {
    reloadContinuationData: ReloadContinuationData
}

export interface ReloadContinuationData {
    continuation: string
    clickTrackingParams: string
}

export interface Endpoint {
    clickTrackingParams: string
    searchEndpoint: SearchEndpoint3
}

export interface SearchEndpoint3 {
    query: string
    params: string
}
