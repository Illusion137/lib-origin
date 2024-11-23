export interface LibraryResults_1 {
    responseContext: ResponseContext
    contents: Contents
    header: Header2
    trackingParams: string
    topbar: Topbar
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
    datasyncId: string
    loggedOut: boolean
    trackingParam: string
}

export interface WebResponseContextExtensionData {
    ytConfigData: YtConfigData
    hasDecorated: boolean
}

export interface YtConfigData {
    visitorData: string
    sessionIndex: number
    rootVisualElementType: number
}

export interface Contents {
    twoColumnBrowseResultsRenderer: TwoColumnBrowseResultsRenderer
}

export interface TwoColumnBrowseResultsRenderer {
    tabs: Tab[]
}

export interface Tab {
    tabRenderer: TabRenderer
}

export interface TabRenderer {
    selected: boolean
    content: Content
    trackingParams: string
    targetId: string
}

export interface Content {
    richGridRenderer: RichGridRenderer
}

export interface RichGridRenderer {
    contents: Content2[]
    trackingParams: string
    header: Header
    targetId: string
    layoutSizing: string
    layoutType: string
}

export interface Content2 {
    richItemRenderer: RichItemRenderer
}

export interface RichItemRenderer {
    content: Content3
    trackingParams: string
}

export interface Content3 {
    lockupViewModel: LockupViewModel
}

export interface LockupViewModel {
    contentImage: ContentImage
    metadata: Metadata
    contentId: string
    contentType: string
    rendererContext: RendererContext2
}

export interface ContentImage {
    collectionThumbnailViewModel: CollectionThumbnailViewModel
}

export interface CollectionThumbnailViewModel {
    primaryThumbnail: PrimaryThumbnail
    stackColor: StackColor
}

export interface PrimaryThumbnail {
    thumbnailViewModel: ThumbnailViewModel
}

export interface ThumbnailViewModel {
    image: Image
    overlays: Overlay[]
    backgroundColor: BackgroundColor2
}

export interface Image {
    sources: Source[]
}

export interface Source {
    url: string
    width: number
    height: number
}

export interface Overlay {
    thumbnailOverlayBadgeViewModel?: ThumbnailOverlayBadgeViewModel
    thumbnailHoverOverlayViewModel?: ThumbnailHoverOverlayViewModel
}

export interface ThumbnailOverlayBadgeViewModel {
    thumbnailBadges: ThumbnailBadge[]
    position: string
}

export interface ThumbnailBadge {
    thumbnailBadgeViewModel: ThumbnailBadgeViewModel
}

export interface ThumbnailBadgeViewModel {
    icon: Icon
    text: string
    badgeStyle: string
    backgroundColor: BackgroundColor
}

export interface Icon {
    sources: Source2[]
}

export interface Source2 {
    clientResource: ClientResource
}

export interface ClientResource {
    imageName: string
}

export interface BackgroundColor {
    lightTheme: number
    darkTheme: number
}

export interface ThumbnailHoverOverlayViewModel {
    icon: Icon2
    text: Text
    style: string
}

export interface Icon2 {
    sources: Source3[]
}

export interface Source3 {
    clientResource: ClientResource2
}

export interface ClientResource2 {
    imageName: string
}

export interface Text {
    content: string
    styleRuns: StyleRun[]
}

export interface StyleRun {
    startIndex: number
    length: number
}

export interface BackgroundColor2 {
    lightTheme: number
    darkTheme: number
}

export interface StackColor {
    lightTheme: number
    darkTheme: number
}

export interface Metadata {
    lockupMetadataViewModel: LockupMetadataViewModel
}

export interface LockupMetadataViewModel {
    title: Title
    metadata: Metadata2
    menuButton?: MenuButton
}

export interface Title {
    content: string
}

export interface Metadata2 {
    contentMetadataViewModel: ContentMetadataViewModel
}

export interface ContentMetadataViewModel {
    metadataRows: MetadataRow[]
    delimiter: string
}

export interface MetadataRow {
    metadataParts: MetadataPart[]
}

export interface MetadataPart {
    text: Text2
}

export interface Text2 {
    content: string
    commandRuns?: CommandRun[]
    styleRuns?: StyleRun2[]
    attachmentRuns?: AttachmentRun[]
}

export interface CommandRun {
    startIndex: number
    length: number
    onTap: OnTap
}

export interface OnTap {
    innertubeCommand: InnertubeCommand
}

export interface InnertubeCommand {
    clickTrackingParams: string
    commandMetadata: CommandMetadata
    browseEndpoint: BrowseEndpoint
}

export interface CommandMetadata {
    webCommandMetadata: WebCommandMetadata
}

export interface WebCommandMetadata {
    url: string
    webPageType: string
    rootVe: number
    apiUrl: string
}

export interface BrowseEndpoint {
    browseId: string
    canonicalBaseUrl?: string
}

export interface StyleRun2 {
    startIndex: number
    length?: number
    weightLabel?: string
    styleRunExtensions?: StyleRunExtensions
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

export interface AttachmentRun {
    startIndex: number
    length: number
    element: Element
    alignment: string
}

export interface Element {
    type: Type
    properties: Properties
}

export interface Type {
    imageType: ImageType
}

export interface ImageType {
    image: Image2
}

export interface Image2 {
    sources: Source4[]
}

export interface Source4 {
    clientResource: ClientResource3
    width: number
    height: number
}

export interface ClientResource3 {
    imageName: string
}

export interface Properties {
    layoutProperties: LayoutProperties
}

export interface LayoutProperties {
    height: Height
    width: Width
    margin: Margin
}

export interface Height {
    value: number
    unit: string
}

export interface Width {
    value: number
    unit: string
}

export interface Margin {
    left: Left
}

export interface Left {
    value: number
    unit: string
}

export interface MenuButton {
    buttonViewModel: ButtonViewModel
}

export interface ButtonViewModel {
    iconName: string
    onTap: OnTap2
    accessibilityText: string
    style: string
    trackingParams: string
    type: string
    buttonSize: string
    state: string
}

export interface OnTap2 {
    innertubeCommand: InnertubeCommand2
}

export interface InnertubeCommand2 {
    clickTrackingParams: string
    showSheetCommand: ShowSheetCommand
}

export interface ShowSheetCommand {
    panelLoadingStrategy: PanelLoadingStrategy
}

export interface PanelLoadingStrategy {
    inlineContent: InlineContent
}

export interface InlineContent {
    sheetViewModel: SheetViewModel
}

export interface SheetViewModel {
    content: Content4
}

export interface Content4 {
    listViewModel: ListViewModel
}

export interface ListViewModel {
    listItems: ListItem[]
}

export interface ListItem {
    listItemViewModel: ListItemViewModel
}

export interface ListItemViewModel {
    title: Title2
    leadingImage: LeadingImage
    rendererContext: RendererContext
}

export interface Title2 {
    content: string
}

export interface LeadingImage {
    sources: Source5[]
}

export interface Source5 {
    clientResource: ClientResource4
}

export interface ClientResource4 {
    imageName: string
}

export interface RendererContext {
    commandContext: CommandContext
}

export interface CommandContext {
    onTap: OnTap3
}

export interface OnTap3 {
    innertubeCommand: InnertubeCommand3
}

export interface InnertubeCommand3 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata2
    deletePlaylistEndpoint?: DeletePlaylistEndpoint
    playlistEditorEndpoint?: PlaylistEditorEndpoint
}

export interface CommandMetadata2 {
    webCommandMetadata: WebCommandMetadata2
}

export interface WebCommandMetadata2 {
    sendPost: boolean
    apiUrl: string
}

export interface DeletePlaylistEndpoint {
    playlistId: string
    deletePlaylistContext: string
}

export interface PlaylistEditorEndpoint {
    playlistId: string
}

export interface RendererContext2 {
    loggingContext: LoggingContext
    commandContext: CommandContext2
}

export interface LoggingContext {
    loggingDirectives: LoggingDirectives
}

export interface LoggingDirectives {
    trackingParams: string
    clientVeSpec: ClientVeSpec
    enableDisplayloggerExperiment: boolean
}

export interface ClientVeSpec {
    uiType: number
    veCounter: number
}

export interface CommandContext2 {
    onTap: OnTap4
}

export interface OnTap4 {
    innertubeCommand: InnertubeCommand4
}

export interface InnertubeCommand4 {
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
    playlistId: string
    params: string
    playerParams?: string
    loggingContext: LoggingContext2
}

export interface LoggingContext2 {
    vssLoggingContext: VssLoggingContext
}

export interface VssLoggingContext {
    serializedContextData: string
}

export interface Header {
    chipBarViewModel: ChipBarViewModel
}

export interface ChipBarViewModel {
    chips: Chip[]
}

export interface Chip {
    chipViewModel: ChipViewModel
}

export interface ChipViewModel {
    text: string
    displayType: string
    tapCommand: TapCommand
    chipEntityKey: string
}

export interface TapCommand {
    innertubeCommand: InnertubeCommand5
}

export interface InnertubeCommand5 {
    clickTrackingParams: string
    showSheetCommand: ShowSheetCommand2
}

export interface ShowSheetCommand2 {
    panelLoadingStrategy: PanelLoadingStrategy2
}

export interface PanelLoadingStrategy2 {
    inlineContent: InlineContent2
}

export interface InlineContent2 {
    sheetViewModel: SheetViewModel2
}

export interface SheetViewModel2 {
    content: Content5
}

export interface Content5 {
    listViewModel: ListViewModel2
}

export interface ListViewModel2 {
    listItems: ListItem2[]
}

export interface ListItem2 {
    listItemViewModel: ListItemViewModel2
}

export interface ListItemViewModel2 {
    title: Title3
    rendererContext: RendererContext3
}

export interface Title3 {
    content: string
}

export interface RendererContext3 {
    commandContext: CommandContext3
}

export interface CommandContext3 {
    onTap: OnTap5
}

export interface OnTap5 {
    innertubeCommand: InnertubeCommand6
}

export interface InnertubeCommand6 {
    clickTrackingParams: string
    commandExecutorCommand: CommandExecutorCommand
}

export interface CommandExecutorCommand {
    commands: Command[]
}

export interface Command {
    clickTrackingParams: string
    entityUpdateCommand?: EntityUpdateCommand
    commandMetadata?: CommandMetadata4
    continuationCommand?: ContinuationCommand
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
    chipEntity: ChipEntity
}

export interface ChipEntity {
    key: string
    text: string
}

export interface CommandMetadata4 {
    webCommandMetadata: WebCommandMetadata4
}

export interface WebCommandMetadata4 {
    sendPost: boolean
    apiUrl: string
}

export interface ContinuationCommand {
    token: string
    request: string
    command: Command2
}

export interface Command2 {
    clickTrackingParams: string
    showReloadUiCommand: ShowReloadUiCommand
}

export interface ShowReloadUiCommand {
    targetId: string
}

export interface Header2 {
    pageHeaderRenderer: PageHeaderRenderer
}

export interface PageHeaderRenderer {
    pageTitle: string
    content: Content6
}

export interface Content6 {
    pageHeaderViewModel: PageHeaderViewModel
}

export interface PageHeaderViewModel {
    title: Title4
    rendererContext: RendererContext5
}

export interface Title4 {
    dynamicTextViewModel: DynamicTextViewModel
}

export interface DynamicTextViewModel {
    text: Text3
    rendererContext: RendererContext4
}

export interface Text3 {
    content: string
}

export interface RendererContext4 {
    loggingContext: LoggingContext3
}

export interface LoggingContext3 {
    loggingDirectives: LoggingDirectives2
}

export interface LoggingDirectives2 {
    trackingParams: string
    visibility: Visibility
    clientVeSpec: ClientVeSpec2
}

export interface Visibility {
    types: string
}

export interface ClientVeSpec2 {
    uiType: number
    veCounter: number
}

export interface RendererContext5 {
    loggingContext: LoggingContext4
}

export interface LoggingContext4 {
    loggingDirectives: LoggingDirectives3
}

export interface LoggingDirectives3 {
    trackingParams: string
    visibility: Visibility2
    clientVeSpec: ClientVeSpec3
}

export interface Visibility2 {
    types: string
}

export interface ClientVeSpec3 {
    uiType: number
    veCounter: number
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
}

export interface Logo {
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
    runs: Run[]
}

export interface Run {
    text: string
}

export interface Endpoint {
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
}

export interface Searchbox {
    fusionSearchboxRenderer: FusionSearchboxRenderer
}

export interface FusionSearchboxRenderer {
    icon: Icon3
    placeholderText: PlaceholderText
    config: Config
    trackingParams: string
    searchEndpoint: SearchEndpoint
    clearButton: ClearButton
}

export interface Icon3 {
    iconType: string
}

export interface PlaceholderText {
    runs: Run2[]
}

export interface Run2 {
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
    commandMetadata: CommandMetadata6
    searchEndpoint: SearchEndpoint2
}

export interface CommandMetadata6 {
    webCommandMetadata: WebCommandMetadata6
}

export interface WebCommandMetadata6 {
    url: string
    webPageType: string
    rootVe: number
}

export interface SearchEndpoint2 {
    query: string
    params: string
}

export interface ClearButton {
    buttonRenderer: ButtonRenderer
}

export interface ButtonRenderer {
    style: string
    size: string
    isDisabled: boolean
    icon: Icon4
    trackingParams: string
    accessibilityData: AccessibilityData
}

export interface Icon4 {
    iconType: string
}

export interface AccessibilityData {
    accessibilityData: AccessibilityData2
}

export interface AccessibilityData2 {
    label: string
}

export interface TopbarButton {
    topbarMenuButtonRenderer?: TopbarMenuButtonRenderer
    notificationTopbarButtonRenderer?: NotificationTopbarButtonRenderer
}

export interface TopbarMenuButtonRenderer {
    avatar?: Avatar
    menuRequest?: MenuRequest
    trackingParams: string
    accessibility: Accessibility2
    tooltip: string
    icon?: Icon5
    menuRenderer?: MenuRenderer
    style?: string
}

export interface Avatar {
    thumbnails: Thumbnail[]
    accessibility: Accessibility
}

export interface Thumbnail {
    url: string
    width: number
    height: number
}

export interface Accessibility {
    accessibilityData: AccessibilityData3
}

export interface AccessibilityData3 {
    label: string
}

export interface MenuRequest {
    clickTrackingParams: string
    commandMetadata: CommandMetadata7
    signalServiceEndpoint: SignalServiceEndpoint
}

export interface CommandMetadata7 {
    webCommandMetadata: WebCommandMetadata7
}

export interface WebCommandMetadata7 {
    sendPost: boolean
    apiUrl: string
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
    beReused: boolean
}

export interface Popup {
    multiPageMenuRenderer: MultiPageMenuRenderer
}

export interface MultiPageMenuRenderer {
    trackingParams: string
    style: string
    showLoadingSpinner: boolean
}

export interface Accessibility2 {
    accessibilityData: AccessibilityData4
}

export interface AccessibilityData4 {
    label: string
}

export interface Icon5 {
    iconType: string
}

export interface MenuRenderer {
    multiPageMenuRenderer: MultiPageMenuRenderer2
}

export interface MultiPageMenuRenderer2 {
    sections: Section[]
    trackingParams: string
    style: string
}

export interface Section {
    multiPageMenuSectionRenderer: MultiPageMenuSectionRenderer
}

export interface MultiPageMenuSectionRenderer {
    items: Item[]
    trackingParams: string
}

export interface Item {
    compactLinkRenderer: CompactLinkRenderer
}

export interface CompactLinkRenderer {
    icon: Icon6
    title: Title5
    navigationEndpoint: NavigationEndpoint
    trackingParams: string
    style: string
}

export interface Icon6 {
    iconType: string
}

export interface Title5 {
    runs: Run3[]
}

export interface Run3 {
    text: string
}

export interface NavigationEndpoint {
    clickTrackingParams: string
    commandMetadata: CommandMetadata8
    uploadEndpoint?: UploadEndpoint
    signalNavigationEndpoint?: SignalNavigationEndpoint
    browseEndpoint?: BrowseEndpoint3
}

export interface CommandMetadata8 {
    webCommandMetadata: WebCommandMetadata8
}

export interface WebCommandMetadata8 {
    url: string
    webPageType: string
    rootVe: number
    apiUrl?: string
}

export interface UploadEndpoint {
    hack: boolean
}

export interface SignalNavigationEndpoint {
    signal: string
}

export interface BrowseEndpoint3 {
    browseId: string
    params: string
}

export interface NotificationTopbarButtonRenderer {
    icon: Icon7
    menuRequest: MenuRequest2
    style: string
    trackingParams: string
    accessibility: Accessibility3
    tooltip: string
    updateUnseenCountEndpoint: UpdateUnseenCountEndpoint
    notificationCount: number
    handlerDatas: string[]
}

export interface Icon7 {
    iconType: string
}

export interface MenuRequest2 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata9
    signalServiceEndpoint: SignalServiceEndpoint2
}

export interface CommandMetadata9 {
    webCommandMetadata: WebCommandMetadata9
}

export interface WebCommandMetadata9 {
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
    beReused: boolean
}

export interface Popup2 {
    multiPageMenuRenderer: MultiPageMenuRenderer3
}

export interface MultiPageMenuRenderer3 {
    trackingParams: string
    style: string
    showLoadingSpinner: boolean
}

export interface Accessibility3 {
    accessibilityData: AccessibilityData5
}

export interface AccessibilityData5 {
    label: string
}

export interface UpdateUnseenCountEndpoint {
    clickTrackingParams: string
    commandMetadata: CommandMetadata10
    signalServiceEndpoint: SignalServiceEndpoint3
}

export interface CommandMetadata10 {
    webCommandMetadata: WebCommandMetadata10
}

export interface WebCommandMetadata10 {
    sendPost: boolean
    apiUrl: string
}

export interface SignalServiceEndpoint3 {
    signal: string
}

export interface HotkeyDialog {
    hotkeyDialogRenderer: HotkeyDialogRenderer
}

export interface HotkeyDialogRenderer {
    title: Title6
    sections: Section2[]
    dismissButton: DismissButton
    trackingParams: string
}

export interface Title6 {
    runs: Run4[]
}

export interface Run4 {
    text: string
}

export interface Section2 {
    hotkeyDialogSectionRenderer: HotkeyDialogSectionRenderer
}

export interface HotkeyDialogSectionRenderer {
    title: Title7
    options: Option[]
}

export interface Title7 {
    runs: Run5[]
}

export interface Run5 {
    text: string
}

export interface Option {
    hotkeyDialogSectionOptionRenderer: HotkeyDialogSectionOptionRenderer
}

export interface HotkeyDialogSectionOptionRenderer {
    label: Label
    hotkey: string
    hotkeyAccessibilityLabel?: HotkeyAccessibilityLabel
}

export interface Label {
    runs: Run6[]
}

export interface Run6 {
    text: string
}

export interface HotkeyAccessibilityLabel {
    accessibilityData: AccessibilityData6
}

export interface AccessibilityData6 {
    label: string
}

export interface DismissButton {
    buttonRenderer: ButtonRenderer2
}

export interface ButtonRenderer2 {
    style: string
    size: string
    isDisabled: boolean
    text: Text4
    trackingParams: string
}

export interface Text4 {
    runs: Run7[]
}

export interface Run7 {
    text: string
}

export interface BackButton {
    buttonRenderer: ButtonRenderer3
}

export interface ButtonRenderer3 {
    trackingParams: string
    command: Command3
}

export interface Command3 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata11
    signalServiceEndpoint: SignalServiceEndpoint4
}

export interface CommandMetadata11 {
    webCommandMetadata: WebCommandMetadata11
}

export interface WebCommandMetadata11 {
    sendPost: boolean
}

export interface SignalServiceEndpoint4 {
    signal: string
    actions: Action3[]
}

export interface Action3 {
    clickTrackingParams: string
    signalAction: SignalAction
}

export interface SignalAction {
    signal: string
}

export interface ForwardButton {
    buttonRenderer: ButtonRenderer4
}

export interface ButtonRenderer4 {
    trackingParams: string
    command: Command4
}

export interface Command4 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata12
    signalServiceEndpoint: SignalServiceEndpoint5
}

export interface CommandMetadata12 {
    webCommandMetadata: WebCommandMetadata12
}

export interface WebCommandMetadata12 {
    sendPost: boolean
}

export interface SignalServiceEndpoint5 {
    signal: string
    actions: Action4[]
}

export interface Action4 {
    clickTrackingParams: string
    signalAction: SignalAction2
}

export interface SignalAction2 {
    signal: string
}

export interface A11ySkipNavigationButton {
    buttonRenderer: ButtonRenderer5
}

export interface ButtonRenderer5 {
    style: string
    size: string
    isDisabled: boolean
    text: Text5
    trackingParams: string
    command: Command5
}

export interface Text5 {
    runs: Run8[]
}

export interface Run8 {
    text: string
}

export interface Command5 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata13
    signalServiceEndpoint: SignalServiceEndpoint6
}

export interface CommandMetadata13 {
    webCommandMetadata: WebCommandMetadata13
}

export interface WebCommandMetadata13 {
    sendPost: boolean
}

export interface SignalServiceEndpoint6 {
    signal: string
    actions: Action5[]
}

export interface Action5 {
    clickTrackingParams: string
    signalAction: SignalAction3
}

export interface SignalAction3 {
    signal: string
}
