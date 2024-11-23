export interface ChannelResultsWContinuation {
    responseContext: ResponseContext
    contents: Contents
    header: Header
    metadata: Metadata2
    trackingParams: string
    topbar: Topbar
    microformat: Microformat
    frameworkUpdates: FrameworkUpdates
}

export interface ResponseContext {
    serviceTrackingParams: ServiceTrackingParam[]
    maxAgeSeconds: number
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
    hasDecorated: boolean
}

export interface Contents {
    twoColumnBrowseResultsRenderer: TwoColumnBrowseResultsRenderer
}

export interface TwoColumnBrowseResultsRenderer {
    tabs: Tab[]
}

export interface Tab {
    tabRenderer?: TabRenderer
    expandableTabRenderer?: ExpandableTabRenderer
}

export interface TabRenderer {
    endpoint: Endpoint
    title: string
    trackingParams: string
    selected?: boolean
    content?: Content
}

export interface Endpoint {
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
    params: string
    canonicalBaseUrl: string
}

export interface Content {
    richGridRenderer: RichGridRenderer
}

export interface RichGridRenderer {
    contents: Content2[]
    trackingParams: string
    targetId: string
    style: string
}

export interface Content2 {
    richItemRenderer?: RichItemRenderer
    continuationItemRenderer?: ContinuationItemRenderer
}

export interface RichItemRenderer {
    content: Content3
    trackingParams: string
}

export interface Content3 {
    playlistRenderer: PlaylistRenderer
}

export interface PlaylistRenderer {
    playlistId: string
    title: Title
    thumbnails: Thumbnail[]
    videoCount: string
    navigationEndpoint: NavigationEndpoint
    shortBylineText: ShortBylineText
    videos: Video[]
    videoCountText: VideoCountText
    trackingParams: string
    thumbnailText: ThumbnailText
    longBylineText: LongBylineText
    thumbnailRenderer: ThumbnailRenderer
    thumbnailOverlays: ThumbnailOverlay[]
}

export interface Title {
    simpleText: string
}

export interface Thumbnail {
    thumbnails: Thumbnail2[]
}

export interface Thumbnail2 {
    url: string
    width: number
    height: number
}

export interface NavigationEndpoint {
    clickTrackingParams: string
    commandMetadata: CommandMetadata2
    watchEndpoint: WatchEndpoint
}

export interface CommandMetadata2 {
    webCommandMetadata: WebCommandMetadata2
}

export interface WebCommandMetadata2 {
    url: string
    webPageType: string
    rootVe: number
}

export interface WatchEndpoint {
    videoId: string
    playlistId: string
    params: string
    loggingContext: LoggingContext
    watchEndpointSupportedOnesieConfig: WatchEndpointSupportedOnesieConfig
}

export interface LoggingContext {
    vssLoggingContext: VssLoggingContext
}

export interface VssLoggingContext {
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

export interface ShortBylineText {
    runs: Run[]
}

export interface Run {
    text: string
    navigationEndpoint?: NavigationEndpoint2
}

export interface NavigationEndpoint2 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata3
    browseEndpoint: BrowseEndpoint2
}

export interface CommandMetadata3 {
    webCommandMetadata: WebCommandMetadata3
}

export interface WebCommandMetadata3 {
    url: string
    webPageType: string
    rootVe: number
    apiUrl: string
}

export interface BrowseEndpoint2 {
    browseId: string
    canonicalBaseUrl: string
}

export interface Video {
    childVideoRenderer: ChildVideoRenderer
}

export interface ChildVideoRenderer {
    title: Title2
    navigationEndpoint: NavigationEndpoint3
    lengthText: LengthText
    videoId: string
}

export interface Title2 {
    simpleText: string
}

export interface NavigationEndpoint3 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata4
    watchEndpoint: WatchEndpoint2
}

export interface CommandMetadata4 {
    webCommandMetadata: WebCommandMetadata4
}

export interface WebCommandMetadata4 {
    url: string
    webPageType: string
    rootVe: number
}

export interface WatchEndpoint2 {
    videoId: string
    playlistId: string
    loggingContext: LoggingContext2
    watchEndpointSupportedOnesieConfig: WatchEndpointSupportedOnesieConfig2
}

export interface LoggingContext2 {
    vssLoggingContext: VssLoggingContext2
}

export interface VssLoggingContext2 {
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

export interface LengthText {
    accessibility: Accessibility
    simpleText: string
}

export interface Accessibility {
    accessibilityData: AccessibilityData
}

export interface AccessibilityData {
    label: string
}

export interface VideoCountText {
    runs: Run2[]
}

export interface Run2 {
    text: string
}

export interface ThumbnailText {
    runs: Run3[]
}

export interface Run3 {
    text: string
    bold?: boolean
}

export interface LongBylineText {
    runs: Run4[]
}

export interface Run4 {
    text: string
    navigationEndpoint?: NavigationEndpoint4
}

export interface NavigationEndpoint4 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata5
    browseEndpoint: BrowseEndpoint3
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

export interface BrowseEndpoint3 {
    browseId: string
    canonicalBaseUrl: string
}

export interface ThumbnailRenderer {
    playlistCustomThumbnailRenderer: PlaylistCustomThumbnailRenderer
}

export interface PlaylistCustomThumbnailRenderer {
    thumbnail: Thumbnail3
}

export interface Thumbnail3 {
    thumbnails: Thumbnail4[]
    sampledThumbnailColor: SampledThumbnailColor
    darkColorPalette: DarkColorPalette
    vibrantColorPalette: VibrantColorPalette
}

export interface Thumbnail4 {
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

export interface ThumbnailOverlay {
    thumbnailOverlayBottomPanelRenderer?: ThumbnailOverlayBottomPanelRenderer
    thumbnailOverlayHoverTextRenderer?: ThumbnailOverlayHoverTextRenderer
    thumbnailOverlayNowPlayingRenderer?: ThumbnailOverlayNowPlayingRenderer
}

export interface ThumbnailOverlayBottomPanelRenderer {
    text: Text
    icon: Icon
}

export interface Text {
    simpleText: string
}

export interface Icon {
    iconType: string
}

export interface ThumbnailOverlayHoverTextRenderer {
    text: Text2
    icon: Icon2
}

export interface Text2 {
    runs: Run5[]
}

export interface Run5 {
    text: string
}

export interface Icon2 {
    iconType: string
}

export interface ThumbnailOverlayNowPlayingRenderer {
    text: Text3
}

export interface Text3 {
    runs: Run6[]
}

export interface Run6 {
    text: string
}

export interface ContinuationItemRenderer {
    trigger: string
    continuationEndpoint: ContinuationEndpoint
}

export interface ContinuationEndpoint {
    clickTrackingParams: string
    commandMetadata: CommandMetadata6
    continuationCommand: ContinuationCommand
}

export interface CommandMetadata6 {
    webCommandMetadata: WebCommandMetadata6
}

export interface WebCommandMetadata6 {
    sendPost: boolean
    apiUrl: string
}

export interface ContinuationCommand {
    token: string
    request: string
}

export interface ExpandableTabRenderer {
    endpoint: Endpoint2
    title: string
    selected: boolean
}

export interface Endpoint2 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata7
    browseEndpoint: BrowseEndpoint4
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

export interface BrowseEndpoint4 {
    browseId: string
    params: string
    canonicalBaseUrl: string
}

export interface Header {
    pageHeaderRenderer: PageHeaderRenderer
}

export interface PageHeaderRenderer {
    pageTitle: string
    content: Content4
}

export interface Content4 {
    pageHeaderViewModel: PageHeaderViewModel
}

export interface PageHeaderViewModel {
    title: Title3
    image: Image2
    metadata: Metadata
    actions: Actions
    description: Description
    rendererContext: RendererContext6
}

export interface Title3 {
    dynamicTextViewModel: DynamicTextViewModel
}

export interface DynamicTextViewModel {
    text: Text4
    maxLines: number
    rendererContext: RendererContext
}

export interface Text4 {
    content: string
    styleRuns: StyleRun[]
    attachmentRuns: AttachmentRun[]
}

export interface StyleRun {
    startIndex: number
    styleRunExtensions: StyleRunExtensions
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
    image: Image
}

export interface Image {
    sources: Source[]
}

export interface Source {
    clientResource: ClientResource
    width: number
    height: number
}

export interface ClientResource {
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

export interface RendererContext {
    loggingContext: LoggingContext3
    accessibilityContext: AccessibilityContext
}

export interface LoggingContext3 {
    loggingDirectives: LoggingDirectives
}

export interface LoggingDirectives {
    trackingParams: string
    visibility: Visibility
    clientVeSpec: ClientVeSpec
}

export interface Visibility {
    types: string
}

export interface ClientVeSpec {
    uiType: number
    veCounter: number
}

export interface AccessibilityContext {
    label: string
}

export interface Image2 {
    decoratedAvatarViewModel: DecoratedAvatarViewModel
}

export interface DecoratedAvatarViewModel {
    avatar: Avatar
}

export interface Avatar {
    avatarViewModel: AvatarViewModel
}

export interface AvatarViewModel {
    image: Image3
    avatarImageSize: string
    loggingDirectives: LoggingDirectives2
}

export interface Image3 {
    sources: Source2[]
    processor: Processor
}

export interface Source2 {
    url: string
    width: number
    height: number
}

export interface Processor {
    borderImageProcessor: BorderImageProcessor
}

export interface BorderImageProcessor {
    circular: boolean
}

export interface LoggingDirectives2 {
    trackingParams: string
    visibility: Visibility2
    enableDisplayloggerExperiment: boolean
}

export interface Visibility2 {
    types: string
}

export interface Metadata {
    contentMetadataViewModel: ContentMetadataViewModel
}

export interface ContentMetadataViewModel {
    metadataRows: MetadataRow[]
    delimiter: string
    rendererContext: RendererContext2
}

export interface MetadataRow {
    metadataParts: MetadataPart[]
}

export interface MetadataPart {
    text: Text5
    enableTruncation?: boolean
}

export interface Text5 {
    content: string
    styleRuns?: StyleRun2[]
}

export interface StyleRun2 {
    startIndex: number
    length: number
}

export interface RendererContext2 {
    loggingContext: LoggingContext4
}

export interface LoggingContext4 {
    loggingDirectives: LoggingDirectives3
}

export interface LoggingDirectives3 {
    trackingParams: string
    visibility: Visibility3
    clientVeSpec: ClientVeSpec2
}

export interface Visibility3 {
    types: string
}

export interface ClientVeSpec2 {
    uiType: number
    veCounter: number
}

export interface Actions {
    flexibleActionsViewModel: FlexibleActionsViewModel
}

export interface FlexibleActionsViewModel {
    actionsRows: ActionsRow[]
    minimumRowHeight: number
    rendererContext: RendererContext4
}

export interface ActionsRow {
    actions: Action[]
}

export interface Action {
    subscribeButtonViewModel: SubscribeButtonViewModel
}

export interface SubscribeButtonViewModel {
    subscribeButtonContent: SubscribeButtonContent
    unsubscribeButtonContent: UnsubscribeButtonContent
    stateEntityStoreKey: string
    trackingParams: string
    disableNotificationBell: boolean
    buttonStyle: ButtonStyle
    backgroundStyle: string
    disableSubscribeButton: boolean
    onShowSubscriptionOptions: OnShowSubscriptionOptions
    channelId: string
    enableSubscribeButtonPostClickAnimation: boolean
    notificationStateEntityStoreKeys: NotificationStateEntityStoreKeys
    bellAccessibilityData: BellAccessibilityData
    loggingDirectives: LoggingDirectives5
}

export interface SubscribeButtonContent {
    buttonText: string
    accessibilityText: string
    imageName: string
    subscribeState: SubscribeState
    onTapCommand: OnTapCommand
}

export interface SubscribeState {
    key: string
    subscribed: boolean
}

export interface OnTapCommand {
    innertubeCommand: InnertubeCommand
}

export interface InnertubeCommand {
    clickTrackingParams: string
    commandMetadata: CommandMetadata8
    subscribeEndpoint: SubscribeEndpoint
}

export interface CommandMetadata8 {
    webCommandMetadata: WebCommandMetadata8
}

export interface WebCommandMetadata8 {
    sendPost: boolean
    apiUrl: string
}

export interface SubscribeEndpoint {
    channelIds: string[]
    params: string
}

export interface UnsubscribeButtonContent {
    buttonText: string
    accessibilityText: string
    imageName: string
    subscribeState: SubscribeState2
    onTapCommand: OnTapCommand2
}

export interface SubscribeState2 {
    key: string
    subscribed: boolean
}

export interface OnTapCommand2 {
    innertubeCommand: InnertubeCommand2
}

export interface InnertubeCommand2 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata9
    signalServiceEndpoint: SignalServiceEndpoint
}

export interface CommandMetadata9 {
    webCommandMetadata: WebCommandMetadata9
}

export interface WebCommandMetadata9 {
    sendPost: boolean
}

export interface SignalServiceEndpoint {
    signal: string
    actions: Action2[]
}

export interface Action2 {
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
    runs: Run7[]
}

export interface Run7 {
    text: string
}

export interface ConfirmButton {
    buttonRenderer: ButtonRenderer
}

export interface ButtonRenderer {
    style: string
    size: string
    isDisabled: boolean
    text: Text6
    serviceEndpoint: ServiceEndpoint
    accessibility: Accessibility2
    trackingParams: string
}

export interface Text6 {
    runs: Run8[]
}

export interface Run8 {
    text: string
}

export interface ServiceEndpoint {
    clickTrackingParams: string
    commandMetadata: CommandMetadata10
    unsubscribeEndpoint: UnsubscribeEndpoint
}

export interface CommandMetadata10 {
    webCommandMetadata: WebCommandMetadata10
}

export interface WebCommandMetadata10 {
    sendPost: boolean
    apiUrl: string
}

export interface UnsubscribeEndpoint {
    channelIds: string[]
    params: string
}

export interface Accessibility2 {
    label: string
}

export interface CancelButton {
    buttonRenderer: ButtonRenderer2
}

export interface ButtonRenderer2 {
    style: string
    size: string
    isDisabled: boolean
    text: Text7
    accessibility: Accessibility3
    trackingParams: string
}

export interface Text7 {
    runs: Run9[]
}

export interface Run9 {
    text: string
}

export interface Accessibility3 {
    label: string
}

export interface ButtonStyle {
    unsubscribedStateStyle: string
    subscribedStateStyle: string
    buttonSize: string
}

export interface OnShowSubscriptionOptions {
    innertubeCommand: InnertubeCommand3
}

export interface InnertubeCommand3 {
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
    content: Content5
}

export interface Content5 {
    listViewModel: ListViewModel
}

export interface ListViewModel {
    listItems: ListItem[]
}

export interface ListItem {
    listItemViewModel: ListItemViewModel
}

export interface ListItemViewModel {
    title: Title4
    leadingImage: LeadingImage
    isDisabled: boolean
    isSelected?: boolean
    selectionStyle?: string
    rendererContext: RendererContext3
}

export interface Title4 {
    content: string
}

export interface LeadingImage {
    sources: Source3[]
}

export interface Source3 {
    clientResource: ClientResource2
}

export interface ClientResource2 {
    imageName: string
}

export interface RendererContext3 {
    loggingContext: LoggingContext5
    commandContext: CommandContext
}

export interface LoggingContext5 {
    loggingDirectives: LoggingDirectives4
}

export interface LoggingDirectives4 {
    trackingParams: string
    visibility: Visibility4
}

export interface Visibility4 {
    types: string
}

export interface CommandContext {
    onTap: OnTap
}

export interface OnTap {
    innertubeCommand: InnertubeCommand4
}

export interface InnertubeCommand4 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata11
    modifyChannelNotificationPreferenceEndpoint?: ModifyChannelNotificationPreferenceEndpoint
    signalServiceEndpoint?: SignalServiceEndpoint2
}

export interface CommandMetadata11 {
    webCommandMetadata: WebCommandMetadata11
}

export interface WebCommandMetadata11 {
    sendPost: boolean
    apiUrl?: string
}

export interface ModifyChannelNotificationPreferenceEndpoint {
    params: string
}

export interface SignalServiceEndpoint2 {
    signal: string
    actions: Action3[]
}

export interface Action3 {
    clickTrackingParams: string
    openPopupAction: OpenPopupAction2
}

export interface OpenPopupAction2 {
    popup: Popup2
    popupType: string
}

export interface Popup2 {
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
    runs: Run10[]
}

export interface Run10 {
    text: string
}

export interface ConfirmButton2 {
    buttonRenderer: ButtonRenderer3
}

export interface ButtonRenderer3 {
    style: string
    size: string
    isDisabled: boolean
    text: Text8
    serviceEndpoint: ServiceEndpoint2
    accessibility: Accessibility4
    trackingParams: string
}

export interface Text8 {
    runs: Run11[]
}

export interface Run11 {
    text: string
}

export interface ServiceEndpoint2 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata12
    unsubscribeEndpoint: UnsubscribeEndpoint2
}

export interface CommandMetadata12 {
    webCommandMetadata: WebCommandMetadata12
}

export interface WebCommandMetadata12 {
    sendPost: boolean
    apiUrl: string
}

export interface UnsubscribeEndpoint2 {
    channelIds: string[]
    params: string
}

export interface Accessibility4 {
    label: string
}

export interface CancelButton2 {
    buttonRenderer: ButtonRenderer4
}

export interface ButtonRenderer4 {
    style: string
    size: string
    isDisabled: boolean
    text: Text9
    accessibility: Accessibility5
    trackingParams: string
}

export interface Text9 {
    runs: Run12[]
}

export interface Run12 {
    text: string
}

export interface Accessibility5 {
    label: string
}

export interface NotificationStateEntityStoreKeys {
    subsNotificationStateKey: string
}

export interface BellAccessibilityData {
    offLabel: string
    allLabel: string
    occasionalLabel: string
    disabledLabel: string
}

export interface LoggingDirectives5 {
    trackingParams: string
    visibility: Visibility5
    enableDisplayloggerExperiment: boolean
}

export interface Visibility5 {
    types: string
}

export interface RendererContext4 {
    loggingContext: LoggingContext6
}

export interface LoggingContext6 {
    loggingDirectives: LoggingDirectives6
}

export interface LoggingDirectives6 {
    trackingParams: string
    visibility: Visibility6
    clientVeSpec: ClientVeSpec3
}

export interface Visibility6 {
    types: string
}

export interface ClientVeSpec3 {
    uiType: number
    veCounter: number
}

export interface Description {
    descriptionPreviewViewModel: DescriptionPreviewViewModel
}

export interface DescriptionPreviewViewModel {
    description: Description2
    maxLines: number
    truncationText: TruncationText
    alwaysShowTruncationText: boolean
    rendererContext: RendererContext5
}

export interface Description2 {
    content: string
    styleRuns: StyleRun3[]
}

export interface StyleRun3 {
    startIndex: number
    length: number
}

export interface TruncationText {
    content: string
    styleRuns: StyleRun4[]
}

export interface StyleRun4 {
    startIndex: number
    length: number
    weight: number
}

export interface RendererContext5 {
    loggingContext: LoggingContext7
    accessibilityContext: AccessibilityContext2
    commandContext: CommandContext2
}

export interface LoggingContext7 {
    loggingDirectives: LoggingDirectives7
}

export interface LoggingDirectives7 {
    trackingParams: string
    visibility: Visibility7
    clientVeSpec: ClientVeSpec4
}

export interface Visibility7 {
    types: string
}

export interface ClientVeSpec4 {
    uiType: number
    veCounter: number
}

export interface AccessibilityContext2 {
    label: string
}

export interface CommandContext2 {
    onTap: OnTap2
}

export interface OnTap2 {
    innertubeCommand: InnertubeCommand5
}

export interface InnertubeCommand5 {
    clickTrackingParams: string
    showEngagementPanelEndpoint: ShowEngagementPanelEndpoint
}

export interface ShowEngagementPanelEndpoint {
    engagementPanel: EngagementPanel
    identifier: Identifier2
    engagementPanelPresentationConfigs: EngagementPanelPresentationConfigs
}

export interface EngagementPanel {
    engagementPanelSectionListRenderer: EngagementPanelSectionListRenderer
}

export interface EngagementPanelSectionListRenderer {
    header: Header2
    content: Content6
    targetId: string
    identifier: Identifier
}

export interface Header2 {
    engagementPanelTitleHeaderRenderer: EngagementPanelTitleHeaderRenderer
}

export interface EngagementPanelTitleHeaderRenderer {
    title: Title5
    visibilityButton: VisibilityButton
    trackingParams: string
}

export interface Title5 {
    simpleText: string
}

export interface VisibilityButton {
    buttonRenderer: ButtonRenderer5
}

export interface ButtonRenderer5 {
    style: string
    size: string
    isDisabled: boolean
    icon: Icon3
    accessibility: Accessibility6
    trackingParams: string
    accessibilityData: AccessibilityData2
    command: Command
}

export interface Icon3 {
    iconType: string
}

export interface Accessibility6 {
    label: string
}

export interface AccessibilityData2 {
    accessibilityData: AccessibilityData3
}

export interface AccessibilityData3 {
    label: string
}

export interface Command {
    clickTrackingParams: string
    changeEngagementPanelVisibilityAction: ChangeEngagementPanelVisibilityAction
}

export interface ChangeEngagementPanelVisibilityAction {
    targetId: string
    visibility: string
}

export interface Content6 {
    sectionListRenderer: SectionListRenderer
}

export interface SectionListRenderer {
    contents: Content7[]
    trackingParams: string
    scrollPaneStyle: ScrollPaneStyle
}

export interface Content7 {
    itemSectionRenderer: ItemSectionRenderer
}

export interface ItemSectionRenderer {
    contents: Content8[]
    trackingParams: string
    sectionIdentifier: string
    targetId: string
}

export interface Content8 {
    continuationItemRenderer: ContinuationItemRenderer2
}

export interface ContinuationItemRenderer2 {
    trigger: string
    continuationEndpoint: ContinuationEndpoint2
}

export interface ContinuationEndpoint2 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata13
    continuationCommand: ContinuationCommand2
}

export interface CommandMetadata13 {
    webCommandMetadata: WebCommandMetadata13
}

export interface WebCommandMetadata13 {
    sendPost: boolean
    apiUrl: string
}

export interface ContinuationCommand2 {
    token: string
    request: string
}

export interface ScrollPaneStyle {
    scrollable: boolean
}

export interface Identifier {
    surface: string
    tag: string
}

export interface Identifier2 {
    surface: string
    tag: string
}

export interface EngagementPanelPresentationConfigs {
    engagementPanelPopupPresentationConfig: EngagementPanelPopupPresentationConfig
}

export interface EngagementPanelPopupPresentationConfig {
    popupType: string
}

export interface RendererContext6 {
    loggingContext: LoggingContext8
}

export interface LoggingContext8 {
    loggingDirectives: LoggingDirectives8
}

export interface LoggingDirectives8 {
    trackingParams: string
    visibility: Visibility8
    clientVeSpec: ClientVeSpec5
}

export interface Visibility8 {
    types: string
}

export interface ClientVeSpec5 {
    uiType: number
    veCounter: number
}

export interface Metadata2 {
    channelMetadataRenderer: ChannelMetadataRenderer
}

export interface ChannelMetadataRenderer {
    title: string
    description: string
    rssUrl: string
    externalId: string
    keywords: string
    ownerUrls: string[]
    avatar: Avatar2
    channelUrl: string
    isFamilySafe: boolean
    availableCountryCodes: string[]
    androidDeepLink: string
    androidAppindexingLink: string
    iosAppindexingLink: string
    vanityChannelUrl: string
}

export interface Avatar2 {
    thumbnails: Thumbnail5[]
}

export interface Thumbnail5 {
    url: string
    width: number
    height: number
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
    iconImage: IconImage
    tooltipText: TooltipText
    endpoint: Endpoint3
    trackingParams: string
    overrideEntityKey: string
}

export interface IconImage {
    iconType: string
}

export interface TooltipText {
    runs: Run13[]
}

export interface Run13 {
    text: string
}

export interface Endpoint3 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata14
    browseEndpoint: BrowseEndpoint5
}

export interface CommandMetadata14 {
    webCommandMetadata: WebCommandMetadata14
}

export interface WebCommandMetadata14 {
    url: string
    webPageType: string
    rootVe: number
    apiUrl: string
}

export interface BrowseEndpoint5 {
    browseId: string
}

export interface Searchbox {
    fusionSearchboxRenderer: FusionSearchboxRenderer
}

export interface FusionSearchboxRenderer {
    icon: Icon4
    placeholderText: PlaceholderText
    config: Config
    trackingParams: string
    searchEndpoint: SearchEndpoint
    clearButton: ClearButton
}

export interface Icon4 {
    iconType: string
}

export interface PlaceholderText {
    runs: Run14[]
}

export interface Run14 {
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
    commandMetadata: CommandMetadata15
    searchEndpoint: SearchEndpoint2
}

export interface CommandMetadata15 {
    webCommandMetadata: WebCommandMetadata15
}

export interface WebCommandMetadata15 {
    url: string
    webPageType: string
    rootVe: number
}

export interface SearchEndpoint2 {
    query: string
}

export interface ClearButton {
    buttonRenderer: ButtonRenderer6
}

export interface ButtonRenderer6 {
    style: string
    size: string
    isDisabled: boolean
    icon: Icon5
    trackingParams: string
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

export interface TopbarButton {
    topbarMenuButtonRenderer?: TopbarMenuButtonRenderer
    notificationTopbarButtonRenderer?: NotificationTopbarButtonRenderer
}

export interface TopbarMenuButtonRenderer {
    avatar?: Avatar3
    menuRequest?: MenuRequest
    trackingParams: string
    accessibility: Accessibility8
    tooltip: string
    icon?: Icon6
    menuRenderer?: MenuRenderer
    style?: string
}

export interface Avatar3 {
    thumbnails: Thumbnail6[]
    accessibility: Accessibility7
}

export interface Thumbnail6 {
    url: string
    width: number
    height: number
}

export interface Accessibility7 {
    accessibilityData: AccessibilityData6
}

export interface AccessibilityData6 {
    label: string
}

export interface MenuRequest {
    clickTrackingParams: string
    commandMetadata: CommandMetadata16
    signalServiceEndpoint: SignalServiceEndpoint3
}

export interface CommandMetadata16 {
    webCommandMetadata: WebCommandMetadata16
}

export interface WebCommandMetadata16 {
    sendPost: boolean
    apiUrl: string
}

export interface SignalServiceEndpoint3 {
    signal: string
    actions: Action4[]
}

export interface Action4 {
    clickTrackingParams: string
    openPopupAction: OpenPopupAction3
}

export interface OpenPopupAction3 {
    popup: Popup3
    popupType: string
    beReused: boolean
}

export interface Popup3 {
    multiPageMenuRenderer: MultiPageMenuRenderer
}

export interface MultiPageMenuRenderer {
    trackingParams: string
    style: string
    showLoadingSpinner: boolean
}

export interface Accessibility8 {
    accessibilityData: AccessibilityData7
}

export interface AccessibilityData7 {
    label: string
}

export interface Icon6 {
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
    icon: Icon7
    title: Title6
    navigationEndpoint: NavigationEndpoint5
    trackingParams: string
    style: string
}

export interface Icon7 {
    iconType: string
}

export interface Title6 {
    runs: Run15[]
}

export interface Run15 {
    text: string
}

export interface NavigationEndpoint5 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata17
    uploadEndpoint?: UploadEndpoint
    signalNavigationEndpoint?: SignalNavigationEndpoint
    browseEndpoint?: BrowseEndpoint6
}

export interface CommandMetadata17 {
    webCommandMetadata: WebCommandMetadata17
}

export interface WebCommandMetadata17 {
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

export interface BrowseEndpoint6 {
    browseId: string
    params: string
}

export interface NotificationTopbarButtonRenderer {
    icon: Icon8
    menuRequest: MenuRequest2
    style: string
    trackingParams: string
    accessibility: Accessibility9
    tooltip: string
    updateUnseenCountEndpoint: UpdateUnseenCountEndpoint
    notificationCount: number
    handlerDatas: string[]
}

export interface Icon8 {
    iconType: string
}

export interface MenuRequest2 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata18
    signalServiceEndpoint: SignalServiceEndpoint4
}

export interface CommandMetadata18 {
    webCommandMetadata: WebCommandMetadata18
}

export interface WebCommandMetadata18 {
    sendPost: boolean
}

export interface SignalServiceEndpoint4 {
    signal: string
    actions: Action5[]
}

export interface Action5 {
    clickTrackingParams: string
    openPopupAction: OpenPopupAction4
}

export interface OpenPopupAction4 {
    popup: Popup4
    popupType: string
    beReused: boolean
}

export interface Popup4 {
    multiPageMenuRenderer: MultiPageMenuRenderer3
}

export interface MultiPageMenuRenderer3 {
    trackingParams: string
    style: string
    showLoadingSpinner: boolean
}

export interface Accessibility9 {
    accessibilityData: AccessibilityData8
}

export interface AccessibilityData8 {
    label: string
}

export interface UpdateUnseenCountEndpoint {
    clickTrackingParams: string
    commandMetadata: CommandMetadata19
    signalServiceEndpoint: SignalServiceEndpoint5
}

export interface CommandMetadata19 {
    webCommandMetadata: WebCommandMetadata19
}

export interface WebCommandMetadata19 {
    sendPost: boolean
    apiUrl: string
}

export interface SignalServiceEndpoint5 {
    signal: string
}

export interface HotkeyDialog {
    hotkeyDialogRenderer: HotkeyDialogRenderer
}

export interface HotkeyDialogRenderer {
    title: Title7
    sections: Section2[]
    dismissButton: DismissButton
    trackingParams: string
}

export interface Title7 {
    runs: Run16[]
}

export interface Run16 {
    text: string
}

export interface Section2 {
    hotkeyDialogSectionRenderer: HotkeyDialogSectionRenderer
}

export interface HotkeyDialogSectionRenderer {
    title: Title8
    options: Option[]
}

export interface Title8 {
    runs: Run17[]
}

export interface Run17 {
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
    runs: Run18[]
}

export interface Run18 {
    text: string
}

export interface HotkeyAccessibilityLabel {
    accessibilityData: AccessibilityData9
}

export interface AccessibilityData9 {
    label: string
}

export interface DismissButton {
    buttonRenderer: ButtonRenderer7
}

export interface ButtonRenderer7 {
    style: string
    size: string
    isDisabled: boolean
    text: Text10
    trackingParams: string
}

export interface Text10 {
    runs: Run19[]
}

export interface Run19 {
    text: string
}

export interface BackButton {
    buttonRenderer: ButtonRenderer8
}

export interface ButtonRenderer8 {
    trackingParams: string
    command: Command2
}

export interface Command2 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata20
    signalServiceEndpoint: SignalServiceEndpoint6
}

export interface CommandMetadata20 {
    webCommandMetadata: WebCommandMetadata20
}

export interface WebCommandMetadata20 {
    sendPost: boolean
}

export interface SignalServiceEndpoint6 {
    signal: string
    actions: Action6[]
}

export interface Action6 {
    clickTrackingParams: string
    signalAction: SignalAction
}

export interface SignalAction {
    signal: string
}

export interface ForwardButton {
    buttonRenderer: ButtonRenderer9
}

export interface ButtonRenderer9 {
    trackingParams: string
    command: Command3
}

export interface Command3 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata21
    signalServiceEndpoint: SignalServiceEndpoint7
}

export interface CommandMetadata21 {
    webCommandMetadata: WebCommandMetadata21
}

export interface WebCommandMetadata21 {
    sendPost: boolean
}

export interface SignalServiceEndpoint7 {
    signal: string
    actions: Action7[]
}

export interface Action7 {
    clickTrackingParams: string
    signalAction: SignalAction2
}

export interface SignalAction2 {
    signal: string
}

export interface A11ySkipNavigationButton {
    buttonRenderer: ButtonRenderer10
}

export interface ButtonRenderer10 {
    style: string
    size: string
    isDisabled: boolean
    text: Text11
    trackingParams: string
    command: Command4
}

export interface Text11 {
    runs: Run20[]
}

export interface Run20 {
    text: string
}

export interface Command4 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata22
    signalServiceEndpoint: SignalServiceEndpoint8
}

export interface CommandMetadata22 {
    webCommandMetadata: WebCommandMetadata22
}

export interface WebCommandMetadata22 {
    sendPost: boolean
}

export interface SignalServiceEndpoint8 {
    signal: string
    actions: Action8[]
}

export interface Action8 {
    clickTrackingParams: string
    signalAction: SignalAction3
}

export interface SignalAction3 {
    signal: string
}

export interface VoiceSearchButton {
    buttonRenderer: ButtonRenderer11
}

export interface ButtonRenderer11 {
    style: string
    size: string
    isDisabled: boolean
    serviceEndpoint: ServiceEndpoint3
    icon: Icon10
    tooltip: string
    trackingParams: string
    accessibilityData: AccessibilityData12
}

export interface ServiceEndpoint3 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata23
    signalServiceEndpoint: SignalServiceEndpoint9
}

export interface CommandMetadata23 {
    webCommandMetadata: WebCommandMetadata23
}

export interface WebCommandMetadata23 {
    sendPost: boolean
}

export interface SignalServiceEndpoint9 {
    signal: string
    actions: Action9[]
}

export interface Action9 {
    clickTrackingParams: string
    openPopupAction: OpenPopupAction5
}

export interface OpenPopupAction5 {
    popup: Popup5
    popupType: string
}

export interface Popup5 {
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
    runs: Run21[]
}

export interface Run21 {
    text: string
}

export interface PromptHeader {
    runs: Run22[]
}

export interface Run22 {
    text: string
}

export interface ExampleQuery1 {
    runs: Run23[]
}

export interface Run23 {
    text: string
}

export interface ExampleQuery2 {
    runs: Run24[]
}

export interface Run24 {
    text: string
}

export interface PromptMicrophoneLabel {
    runs: Run25[]
}

export interface Run25 {
    text: string
}

export interface LoadingHeader {
    runs: Run26[]
}

export interface Run26 {
    text: string
}

export interface ConnectionErrorHeader {
    runs: Run27[]
}

export interface Run27 {
    text: string
}

export interface ConnectionErrorMicrophoneLabel {
    runs: Run28[]
}

export interface Run28 {
    text: string
}

export interface PermissionsHeader {
    runs: Run29[]
}

export interface Run29 {
    text: string
}

export interface PermissionsSubtext {
    runs: Run30[]
}

export interface Run30 {
    text: string
}

export interface DisabledHeader {
    runs: Run31[]
}

export interface Run31 {
    text: string
}

export interface DisabledSubtext {
    runs: Run32[]
}

export interface Run32 {
    text: string
}

export interface MicrophoneButtonAriaLabel {
    runs: Run33[]
}

export interface Run33 {
    text: string
}

export interface ExitButton {
    buttonRenderer: ButtonRenderer12
}

export interface ButtonRenderer12 {
    style: string
    size: string
    isDisabled: boolean
    icon: Icon9
    trackingParams: string
    accessibilityData: AccessibilityData10
}

export interface Icon9 {
    iconType: string
}

export interface AccessibilityData10 {
    accessibilityData: AccessibilityData11
}

export interface AccessibilityData11 {
    label: string
}

export interface MicrophoneOffPromptHeader {
    runs: Run34[]
}

export interface Run34 {
    text: string
}

export interface Icon10 {
    iconType: string
}

export interface AccessibilityData12 {
    accessibilityData: AccessibilityData13
}

export interface AccessibilityData13 {
    label: string
}

export interface Microformat {
    microformatDataRenderer: MicroformatDataRenderer
}

export interface MicroformatDataRenderer {
    urlCanonical: string
    title: string
    description: string
    thumbnail: Thumbnail7
    siteName: string
    appName: string
    androidPackage: string
    iosAppStoreId: string
    iosAppArguments: string
    ogType: string
    urlApplinksWeb: string
    urlApplinksIos: string
    urlApplinksAndroid: string
    urlTwitterIos: string
    urlTwitterAndroid: string
    twitterCardType: string
    twitterSiteHandle: string
    schemaDotOrgType: string
    noindex: boolean
    unlisted: boolean
    familySafe: boolean
    availableCountries: string[]
    linkAlternates: LinkAlternate[]
}

export interface Thumbnail7 {
    thumbnails: Thumbnail8[]
}

export interface Thumbnail8 {
    url: string
    width: number
    height: number
}

export interface LinkAlternate {
    hrefUrl: string
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
    subscriptionStateEntity?: SubscriptionStateEntity
    subscriptionNotificationStateEntity?: SubscriptionNotificationStateEntity
}

export interface SubscriptionStateEntity {
    key: string
    subscribed: boolean
}

export interface SubscriptionNotificationStateEntity {
    key: string
    state: string
}

export interface Timestamp {
    seconds: string
    nanos: number
}
