export interface ParsedLibraryResults {
    "title": string,
    "thumbnails": Thumbnail[],
    "endpoint": string
}
export interface LibraryResults_0 {
    responseContext: ResponseContext
    contents: Contents
    trackingParams: string
    frameworkUpdates: FrameworkUpdates
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
    tabIdentifier: string
    trackingParams: string
}

export interface Endpoint {
    clickTrackingParams: string
    commandExecutorCommand: CommandExecutorCommand
}

export interface CommandExecutorCommand {
    commands: Command[]
}

export interface Command {
    clickTrackingParams: string
    musicLibraryPersistLaunchNavigationCommand?: MusicLibraryPersistLaunchNavigationCommand
    browseEndpoint?: BrowseEndpoint2
}

export interface MusicLibraryPersistLaunchNavigationCommand {
    command: Command2
}

export interface Command2 {
    clickTrackingParams: string
    browseEndpoint: BrowseEndpoint
}

export interface BrowseEndpoint {
    browseId: string
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

export interface Content {
    sectionListRenderer: SectionListRenderer
}

export interface SectionListRenderer {
    contents: Content2[]
    trackingParams: string
    header?: Header
    continuations?: Continuation2[]
}

export interface Content2 {
    gridRenderer: GridRenderer
}

export interface GridRenderer {
    items: Item[]
    trackingParams: string
    itemSize: string
}

export interface Item {
    musicTwoRowItemRenderer: MusicTwoRowItemRenderer
}

export interface MusicTwoRowItemRenderer {
    thumbnailRenderer: ThumbnailRenderer
    aspectRatio: string
    title: Title
    navigationEndpoint: NavigationEndpoint2
    trackingParams: string
    subtitle?: Subtitle
    menu?: Menu
    thumbnailOverlay?: ThumbnailOverlay
    subtitleBadges?: SubtitleBadge[]
}

export interface ThumbnailRenderer {
    musicThumbnailRenderer: MusicThumbnailRenderer
}

export interface MusicThumbnailRenderer {
    thumbnail: Thumbnail
    thumbnailCrop: string
    thumbnailScale: string
    trackingParams: string
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
}

export interface Run {
    text: string
    navigationEndpoint: NavigationEndpoint
}

export interface NavigationEndpoint {
    clickTrackingParams: string
    create_playlistEndpoint?: create_playlistEndpoint
    browseEndpoint?: BrowseEndpoint3
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
    runs: Run2[]
}

export interface Run2 {
    text: string
}

export interface PrivacyOption {
    dropdownRenderer: DropdownRenderer
}

export interface DropdownRenderer {
    entries: Entry[]
    label: string
    accessibility: Accessibility2
}

export interface Entry {
    dropdownItemRenderer: DropdownItemRenderer
}

export interface DropdownItemRenderer {
    label: Label
    isSelected: boolean
    accessibility: Accessibility
    int32Value: number
    icon: Icon
    descriptionText: DescriptionText
}

export interface Label {
    runs: Run3[]
}

export interface Run3 {
    text: string
}

export interface Accessibility {
    label: string
}

export interface Icon {
    iconType: string
}

export interface DescriptionText {
    runs: Run4[]
}

export interface Run4 {
    text: string
}

export interface Accessibility2 {
    label: string
}

export interface CancelButton {
    buttonRenderer: ButtonRenderer
}

export interface ButtonRenderer {
    style: string
    isDisabled: boolean
    text: Text
    trackingParams: string
}

export interface Text {
    runs: Run5[]
}

export interface Run5 {
    text: string
}

export interface CreateButton {
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

export interface NavigationEndpoint2 {
    clickTrackingParams: string
    create_playlistEndpoint?: create_playlistEndpoint2
    browseEndpoint?: BrowseEndpoint4
}

export interface create_playlistEndpoint2 {
    params: string
    create_playlistDialog: create_playlistDialog2
}

export interface create_playlistDialog2 {
    create_playlistDialogRenderer: create_playlistDialogRenderer2
}

export interface create_playlistDialogRenderer2 {
    dialogTitle: DialogTitle2
    titlePlaceholder: string
    privacyOption: PrivacyOption2
    cancelButton: CancelButton2
    createButton: CreateButton2
}

export interface DialogTitle2 {
    runs: Run7[]
}

export interface Run7 {
    text: string
}

export interface PrivacyOption2 {
    dropdownRenderer: DropdownRenderer2
}

export interface DropdownRenderer2 {
    entries: Entry2[]
    label: string
    accessibility: Accessibility4
}

export interface Entry2 {
    dropdownItemRenderer: DropdownItemRenderer2
}

export interface DropdownItemRenderer2 {
    label: Label2
    isSelected: boolean
    accessibility: Accessibility3
    int32Value: number
    icon: Icon2
    descriptionText: DescriptionText2
}

export interface Label2 {
    runs: Run8[]
}

export interface Run8 {
    text: string
}

export interface Accessibility3 {
    label: string
}

export interface Icon2 {
    iconType: string
}

export interface DescriptionText2 {
    runs: Run9[]
}

export interface Run9 {
    text: string
}

export interface Accessibility4 {
    label: string
}

export interface CancelButton2 {
    buttonRenderer: ButtonRenderer3
}

export interface ButtonRenderer3 {
    style: string
    isDisabled: boolean
    text: Text3
    trackingParams: string
}

export interface Text3 {
    runs: Run10[]
}

export interface Run10 {
    text: string
}

export interface CreateButton2 {
    buttonRenderer: ButtonRenderer4
}

export interface ButtonRenderer4 {
    style: string
    isDisabled: boolean
    text: Text4
    trackingParams: string
}

export interface Text4 {
    runs: Run11[]
}

export interface Run11 {
    text: string
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

export interface Subtitle {
    runs: Run12[]
}

export interface Run12 {
    text: string
    navigationEndpoint?: NavigationEndpoint3
}

export interface NavigationEndpoint3 {
    clickTrackingParams: string
    browseEndpoint: BrowseEndpoint5
}

export interface BrowseEndpoint5 {
    browseId: string
    browseEndpointContextSupportedConfigs: BrowseEndpointContextSupportedConfigs4
}

export interface BrowseEndpointContextSupportedConfigs4 {
    browseEndpointContextMusicConfig: BrowseEndpointContextMusicConfig4
}

export interface BrowseEndpointContextMusicConfig4 {
    pageType: string
}

export interface Menu {
    menuRenderer: MenuRenderer
}

export interface MenuRenderer {
    items: Item2[]
    trackingParams: string
    accessibility: Accessibility5
}

export interface Item2 {
    menuNavigationItemRenderer?: MenuNavigationItemRenderer
    menuServiceItemRenderer?: MenuServiceItemRenderer
    menuServiceItemDownloadRenderer?: MenuServiceItemDownloadRenderer
    toggleMenuServiceItemRenderer?: ToggleMenuServiceItemRenderer
}

export interface MenuNavigationItemRenderer {
    text: Text5
    icon: Icon3
    navigationEndpoint: NavigationEndpoint4
    trackingParams: string
}

export interface Text5 {
    runs: Run13[]
}

export interface Run13 {
    text: string
}

export interface Icon3 {
    iconType: string
}

export interface NavigationEndpoint4 {
    clickTrackingParams: string
    shareEntityEndpoint?: ShareEntityEndpoint
    addToPlaylistEndpoint?: AddToPlaylistEndpoint
    watchPlaylistEndpoint?: WatchPlaylistEndpoint
    confirmDialogEndpoint?: ConfirmDialogEndpoint
    playlistEditorEndpoint?: PlaylistEditorEndpoint2
}

export interface ShareEntityEndpoint {
    serializedShareEntity: string
    sharePanelType: string
}

export interface AddToPlaylistEndpoint {
    playlistId: string
}

export interface WatchPlaylistEndpoint {
    playlistId: string
    params: string
}

export interface ConfirmDialogEndpoint {
    content: Content3
}

export interface Content3 {
    confirmDialogRenderer: ConfirmDialogRenderer
}

export interface ConfirmDialogRenderer {
    title: Title2
    trackingParams: string
    dialogMessages: DialogMessage[]
    confirmButton: ConfirmButton
    cancelButton: CancelButton3
}

export interface Title2 {
    runs: Run14[]
}

export interface Run14 {
    text: string
}

export interface DialogMessage {
    runs: Run15[]
}

export interface Run15 {
    text: string
}

export interface ConfirmButton {
    buttonRenderer: ButtonRenderer5
}

export interface ButtonRenderer5 {
    style: string
    size?: string
    isDisabled: boolean
    text: Text6
    serviceEndpoint?: ServiceEndpoint
    trackingParams: string
    command?: Command3
}

export interface Text6 {
    runs: Run16[]
}

export interface Run16 {
    text: string
}

export interface ServiceEndpoint {
    clickTrackingParams: string
    delete_playlistEndpoint: DeletePlaylistEndpoint
}

export interface DeletePlaylistEndpoint {
    playlistId: string
}

export interface Command3 {
    clickTrackingParams: string
    playlistEditorEndpoint: PlaylistEditorEndpoint
}

export interface PlaylistEditorEndpoint {
    playlistId: string
}

export interface CancelButton3 {
    buttonRenderer: ButtonRenderer6
}

export interface ButtonRenderer6 {
    style: string
    size?: string
    isDisabled: boolean
    text: Text7
    trackingParams: string
}

export interface Text7 {
    runs: Run17[]
}

export interface Run17 {
    text: string
}

export interface PlaylistEditorEndpoint2 {
    playlistId: string
}

export interface MenuServiceItemRenderer {
    text: Text8
    icon: Icon4
    serviceEndpoint: ServiceEndpoint2
    trackingParams: string
}

export interface Text8 {
    runs: Run18[]
}

export interface Run18 {
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
    commands: Command4[]
}

export interface QueueTarget {
    playlistId: string
    onEmptyQueue: OnEmptyQueue
}

export interface OnEmptyQueue {
    clickTrackingParams: string
    watchEndpoint: WatchEndpoint
}

export interface WatchEndpoint {
    playlistId: string
}

export interface Command4 {
    clickTrackingParams: string
    addToToastAction: AddToToastAction
}

export interface AddToToastAction {
    item: Item3
}

export interface Item3 {
    notificationTextRenderer: NotificationTextRenderer
}

export interface NotificationTextRenderer {
    successResponseText: SuccessResponseText
    trackingParams: string
}

export interface SuccessResponseText {
    runs: Run19[]
}

export interface Run19 {
    text: string
}

export interface MenuServiceItemDownloadRenderer {
    serviceEndpoint: ServiceEndpoint3
    trackingParams: string
}

export interface ServiceEndpoint3 {
    clickTrackingParams: string
    offlinePlaylistEndpoint: OfflinePlaylistEndpoint
}

export interface OfflinePlaylistEndpoint {
    playlistId: string
    action: string
    offlineability: Offlineability
    onAddCommand: OnAddCommand
}

export interface Offlineability {
    offlineabilityRenderer: OfflineabilityRenderer
}

export interface OfflineabilityRenderer {
    offlineable: boolean
    clickTrackingParams: string
}

export interface OnAddCommand {
    clickTrackingParams: string
    getDownloadActionCommand: GetDownloadActionCommand
}

export interface GetDownloadActionCommand {
    playlistId: string
    params: string
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
    runs: Run20[]
}

export interface Run20 {
    text: string
}

export interface DefaultIcon {
    iconType: string
}

export interface DefaultServiceEndpoint {
    clickTrackingParams: string
    likeEndpoint: LikeEndpoint
}

export interface LikeEndpoint {
    status: string
    target: Target
    actions: Action[]
}

export interface Target {
    playlistId: string
}

export interface Action {
    clickTrackingParams: string
    hideEnclosingAction: HideEnclosingAction
}

export interface HideEnclosingAction {
    hack: boolean
}

export interface ToggledText {
    runs: Run21[]
}

export interface Run21 {
    text: string
}

export interface ToggledIcon {
    iconType: string
}

export interface ToggledServiceEndpoint {
    clickTrackingParams: string
    likeEndpoint: LikeEndpoint2
}

export interface LikeEndpoint2 {
    status: string
    target: Target2
}

export interface Target2 {
    playlistId: string
}

export interface Accessibility5 {
    accessibilityData: AccessibilityData
}

export interface AccessibilityData {
    label: string
}

export interface ThumbnailOverlay {
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
    watchPlaylistEndpoint: WatchPlaylistEndpoint2
}

export interface WatchPlaylistEndpoint2 {
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
    accessibilityData: AccessibilityData2
}

export interface AccessibilityData2 {
    label: string
}

export interface AccessibilityPauseData {
    accessibilityData: AccessibilityData3
}

export interface AccessibilityData3 {
    label: string
}

export interface SubtitleBadge {
    musicInlineBadgeRenderer: MusicInlineBadgeRenderer
}

export interface MusicInlineBadgeRenderer {
    trackingParams: string
    icon: Icon5
    accessibilityData: AccessibilityData4
}

export interface Icon5 {
    iconType: string
}

export interface AccessibilityData4 {
    accessibilityData: AccessibilityData5
}

export interface AccessibilityData5 {
    label: string
}

export interface Header {
    musicSideAlignedItemRenderer: MusicSideAlignedItemRenderer
}

export interface MusicSideAlignedItemRenderer {
    startItems: StartItem[]
    endItems: EndItem[]
    trackingParams: string
}

export interface StartItem {
    chipCloudRenderer: ChipCloudRenderer
}

export interface ChipCloudRenderer {
    chips: Chip[]
    trackingParams: string
}

export interface Chip {
    chipCloudChipRenderer: ChipCloudChipRenderer
}

export interface ChipCloudChipRenderer {
    navigationEndpoint: NavigationEndpoint5
    trackingParams: string
    icon?: Icon6
    accessibilityData: AccessibilityData6
    isSelected: boolean
    onDeselectedCommand: OnDeselectedCommand
    text?: Text9
    uniqueId?: string
}

export interface NavigationEndpoint5 {
    clickTrackingParams: string
    commandExecutorCommand: CommandExecutorCommand2
}

export interface CommandExecutorCommand2 {
    commands: Command5[]
}

export interface Command5 {
    clickTrackingParams: string
    browseEndpoint?: BrowseEndpoint6
    musicLibraryPersistLaunchNavigationCommand?: MusicLibraryPersistLaunchNavigationCommand2
}

export interface BrowseEndpoint6 {
    browseId: string
}

export interface MusicLibraryPersistLaunchNavigationCommand2 {
    command: Command6
}

export interface Command6 {
    clickTrackingParams: string
    browseEndpoint: BrowseEndpoint7
}

export interface BrowseEndpoint7 {
    browseId: string
}

export interface Icon6 {
    iconType: string
}

export interface AccessibilityData6 {
    accessibilityData: AccessibilityData7
}

export interface AccessibilityData7 {
    label: string
}

export interface OnDeselectedCommand {
    clickTrackingParams: string
    commandExecutorCommand: CommandExecutorCommand3
}

export interface CommandExecutorCommand3 {
    commands: Command7[]
}

export interface Command7 {
    clickTrackingParams: string
    browseEndpoint?: BrowseEndpoint8
    musicLibraryPersistLaunchNavigationCommand?: MusicLibraryPersistLaunchNavigationCommand3
}

export interface BrowseEndpoint8 {
    browseId: string
}

export interface MusicLibraryPersistLaunchNavigationCommand3 {
    command: Command8
}

export interface Command8 {
    clickTrackingParams: string
    browseEndpoint: BrowseEndpoint9
}

export interface BrowseEndpoint9 {
    browseId: string
}

export interface Text9 {
    runs: Run22[]
}

export interface Run22 {
    text: string
}

export interface EndItem {
    musicSortFilterButtonRenderer: MusicSortFilterButtonRenderer
}

export interface MusicSortFilterButtonRenderer {
    title: Title3
    icon: Icon7
    menu: Menu2
    accessibility: Accessibility6
    trackingParams: string
}

export interface Title3 {
    runs: Run23[]
}

export interface Run23 {
    text: string
}

export interface Icon7 {
    iconType: string
}

export interface Menu2 {
    musicMultiSelectMenuRenderer: MusicMultiSelectMenuRenderer
}

export interface MusicMultiSelectMenuRenderer {
    title: Title4
    options: Option[]
    trackingParams: string
    formEntityKey: string
}

export interface Title4 {
    musicMenuTitleRenderer: MusicMenuTitleRenderer
}

export interface MusicMenuTitleRenderer {
    primaryText: PrimaryText
}

export interface PrimaryText {
    runs: Run24[]
}

export interface Run24 {
    text: string
}

export interface Option {
    musicMultiSelectMenuItemRenderer: MusicMultiSelectMenuItemRenderer
}

export interface MusicMultiSelectMenuItemRenderer {
    title: Title5
    formItemEntityKey: string
    selectedCommand: SelectedCommand
    trackingParams: string
    selectedIcon: SelectedIcon
    selectedAccessibility: SelectedAccessibility
    deselectedAccessibility: DeselectedAccessibility
}

export interface Title5 {
    runs: Run25[]
}

export interface Run25 {
    text: string
}

export interface SelectedCommand {
    clickTrackingParams: string
    commandExecutorCommand: CommandExecutorCommand4
}

export interface CommandExecutorCommand4 {
    commands: Command9[]
}

export interface Command9 {
    clickTrackingParams: string
    musicCheckboxFormItemMutatedCommand?: MusicCheckboxFormItemMutatedCommand
    browseSectionListReloadEndpoint?: BrowseSectionListReloadEndpoint
}

export interface MusicCheckboxFormItemMutatedCommand {
    formItemEntityKey: string
    newCheckedState: boolean
}

export interface BrowseSectionListReloadEndpoint {
    continuation: Continuation
}

export interface Continuation {
    reloadContinuationData: ReloadContinuationData
}

export interface ReloadContinuationData {
    continuation: string
    clickTrackingParams: string
    showSpinnerOverlay: boolean
}

export interface SelectedIcon {
    iconType: string
}

export interface SelectedAccessibility {
    accessibilityData: AccessibilityData8
}

export interface AccessibilityData8 {
    label: string
}

export interface DeselectedAccessibility {
    accessibilityData: AccessibilityData9
}

export interface AccessibilityData9 {
    label: string
}

export interface Accessibility6 {
    accessibilityData: AccessibilityData10
}

export interface AccessibilityData10 {
    label: string
}

export interface Continuation2 {
    reloadContinuationData: ReloadContinuationData2
}

export interface ReloadContinuationData2 {
    continuation: string
    clickTrackingParams: string
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
    musicForm?: MusicForm
    musicFormBooleanChoice?: MusicFormBooleanChoice
}

export interface MusicForm {
    id: string
    booleanChoiceEntityKeys: string[]
}

export interface MusicFormBooleanChoice {
    id: string
    parentFormEntityKey: string
    selected: boolean
    opaqueToken: string
}

export interface Timestamp {
    seconds: string
    nanos: number
}
