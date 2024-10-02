export interface PageHeaderViewModel {
    title: Title
    metadata: Metadata
    actions: Actions
    description: Description
    heroImage: HeroImage
    background: Background
    entityKey: string
    hasTopbarAnimation: boolean
    rendererContext: RendererContext10
}

export interface Title {
    dynamicTextViewModel: DynamicTextViewModel
}

export interface DynamicTextViewModel {
    text: Text
    rendererContext: RendererContext
}

export interface Text {
    content: string
}

export interface RendererContext {
    loggingContext: LoggingContext
}

export interface LoggingContext {
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

export interface Metadata {
    contentMetadataViewModel: ContentMetadataViewModel
}

export interface ContentMetadataViewModel {
    metadataRows: MetadataRow[]
    delimiter: string
    rendererContext: RendererContext3
}

export interface MetadataRow {
    metadataParts: MetadataPart[]
}

export interface MetadataPart {
    avatarStack?: AvatarStack
    text?: Text3
}

export interface AvatarStack {
    avatarStackViewModel: AvatarStackViewModel
}

export interface AvatarStackViewModel {
    avatars: Avatar[]
    text: Text2
    rendererContext: RendererContext2
}

export interface Avatar {
    avatarViewModel: AvatarViewModel
}

export interface AvatarViewModel {
    image: Image
    avatarImageSize: string
}

export interface Image {
    sources: Source[]
    processor: Processor
}

export interface Source {
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

export interface Text2 {
    content: string
    commandRuns: CommandRun[]
    styleRuns: StyleRun[]
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
    canonicalBaseUrl: string
}

export interface StyleRun {
    startIndex: number
    length: number
    fontColor: number
    weightLabel: string
}

export interface RendererContext2 {
    loggingContext: LoggingContext2
    commandContext: CommandContext
}

export interface LoggingContext2 {
    loggingDirectives: LoggingDirectives2
}

export interface LoggingDirectives2 {
    trackingParams: string
    visibility: Visibility2
    clientVeSpec: ClientVeSpec2
}

export interface Visibility2 {
    types: string
}

export interface ClientVeSpec2 {
    uiType: number
    veCounter: number
}

export interface CommandContext {
    onTap: OnTap2
}

export interface OnTap2 {
    innertubeCommand: InnertubeCommand2
}

export interface InnertubeCommand2 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata2
    browseEndpoint: BrowseEndpoint2
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

export interface BrowseEndpoint2 {
    browseId: string
    canonicalBaseUrl: string
}

export interface Text3 {
    content: string
}

export interface RendererContext3 {
    loggingContext: LoggingContext3
}

export interface LoggingContext3 {
    loggingDirectives: LoggingDirectives3
}

export interface LoggingDirectives3 {
    trackingParams: string
    visibility: Visibility3
    clientVeSpec: ClientVeSpec3
}

export interface Visibility3 {
    types: string
}

export interface ClientVeSpec3 {
    uiType: number
    veCounter: number
}

export interface Actions {
    flexibleActionsViewModel: FlexibleActionsViewModel
}

export interface FlexibleActionsViewModel {
    actionsRows: ActionsRow[]
    minimumRowHeight: number
    rendererContext: RendererContext6
}

export interface ActionsRow {
    actions: Action[]
}

export interface Action {
    buttonViewModel: ButtonViewModel
}

export interface ButtonViewModel {
    iconName: string
    title?: string
    onTap: OnTap3
    accessibilityText: string
    style: string
    trackingParams: string
    isFullWidth: boolean
    type: string
    buttonSize: string
    tooltip?: string
    enableIconButton?: boolean
    loggingDirectives?: LoggingDirectives5
    targetId?: string
    state?: string
}

export interface OnTap3 {
    innertubeCommand: InnertubeCommand3
}

export interface InnertubeCommand3 {
    clickTrackingParams: string
    commandMetadata?: CommandMetadata3
    watchEndpoint?: WatchEndpoint
    signalServiceEndpoint?: SignalServiceEndpoint
    playlistEditorEndpoint?: PlaylistEditorEndpoint
    showDialogCommand?: ShowDialogCommand
    showSheetCommand?: ShowSheetCommand
}

export interface CommandMetadata3 {
    webCommandMetadata: WebCommandMetadata3
}

export interface WebCommandMetadata3 {
    url?: string
    webPageType?: string
    rootVe?: number
    sendPost?: boolean
    apiUrl?: string
}

export interface WatchEndpoint {
    videoId: string
    playlistId: string
    playerParams: string
    loggingContext: LoggingContext4
    watchEndpointSupportedOnesieConfig: WatchEndpointSupportedOnesieConfig
}

export interface LoggingContext4 {
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

export interface SignalServiceEndpoint {
    signal: string
    actions: Action2[]
}

export interface Action2 {
    clickTrackingParams: string
    openOnePickAddVideoModalCommand: OpenOnePickAddVideoModalCommand
}

export interface OpenOnePickAddVideoModalCommand {
    listId: string
    modalTitle: string
    selectButtonLabel: string
}

export interface PlaylistEditorEndpoint {
    playlistId: string
    params: string
}

export interface ShowDialogCommand {
    panelLoadingStrategy: PanelLoadingStrategy
    removeDefaultPadding: boolean
}

export interface PanelLoadingStrategy {
    inlineContent: InlineContent
}

export interface InlineContent {
    dialogViewModel: DialogViewModel
}

export interface DialogViewModel {
    header: Header
    footer: Footer
    content: Content
    formId: string
}

export interface Header {
    dialogHeaderViewModel: DialogHeaderViewModel
}

export interface DialogHeaderViewModel {
    headline: Headline
}

export interface Headline {
    content: string
}

export interface Footer {
    panelFooterViewModel: PanelFooterViewModel
}

export interface PanelFooterViewModel {
    primaryButton: PrimaryButton
    secondaryButton: SecondaryButton
    shouldHideDivider: boolean
}

export interface PrimaryButton {
    buttonViewModel: ButtonViewModel2
}

export interface ButtonViewModel2 {
    title: string
    onTap: OnTap4
    accessibilityText: string
    style: string
    trackingParams: string
    isFullWidth: boolean
    type: string
    buttonSize: string
    state: string
}

export interface OnTap4 {
    innertubeCommand: InnertubeCommand4
}

export interface InnertubeCommand4 {
    clickTrackingParams: string
    commandExecutorCommand: CommandExecutorCommand
}

export interface CommandExecutorCommand {
    commands: Command[]
}

export interface Command {
    clickTrackingParams: string
    dismissDialogEndpoint?: DismissDialogEndpoint
    webSubmitFormCommand?: WebSubmitFormCommand
}

export interface DismissDialogEndpoint { }

export interface WebSubmitFormCommand {
    formId: string
}

export interface SecondaryButton {
    buttonViewModel: ButtonViewModel3
}

export interface ButtonViewModel3 {
    title: string
    onTap: OnTap5
    accessibilityText: string
    style: string
    trackingParams: string
    isFullWidth: boolean
    type: string
    buttonSize: string
}

export interface OnTap5 {
    innertubeCommand: InnertubeCommand5
}

export interface InnertubeCommand5 {
    clickTrackingParams: string
    dismissDialogEndpoint: DismissDialogEndpoint2
}

export interface DismissDialogEndpoint2 { }

export interface Content {
    radioButtonGroupViewModel: RadioButtonGroupViewModel
}

export interface RadioButtonGroupViewModel {
    key: string
    radioButtons: RadioButton[]
}

export interface RadioButton {
    radioButtonItemViewModel: RadioButtonItemViewModel
}

export interface RadioButtonItemViewModel {
    key: string
    text: string
    subtext: string
    command: Command2
}

export interface Command2 {
    innertubeCommand: InnertubeCommand6
}

export interface InnertubeCommand6 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata4
    playlistEditEndpoint: PlaylistEditEndpoint
}

export interface CommandMetadata4 {
    webCommandMetadata: WebCommandMetadata4
}

export interface WebCommandMetadata4 {
    sendPost: boolean
    apiUrl: string
}

export interface PlaylistEditEndpoint {
    playlistId: string
    actions: Action3[]
    params: string
}

export interface Action3 {
    action: string
    playlistPrivacy: string
}

export interface ShowSheetCommand {
    panelLoadingStrategy: PanelLoadingStrategy2
}

export interface PanelLoadingStrategy2 {
    inlineContent: InlineContent2
}

export interface InlineContent2 {
    sheetViewModel: SheetViewModel
}

export interface SheetViewModel {
    content: Content2
}

export interface Content2 {
    listViewModel: ListViewModel
}

export interface ListViewModel {
    listItems: ListItem[]
}

export interface ListItem {
    listItemViewModel?: ListItemViewModel
    downloadListItemViewModel?: DownloadListItemViewModel
}

export interface ListItemViewModel {
    title: Title2
    leadingImage: LeadingImage
    rendererContext: RendererContext4
}

export interface Title2 {
    content: string
}

export interface LeadingImage {
    sources: Source2[]
}

export interface Source2 {
    clientResource: ClientResource
}

export interface ClientResource {
    imageName: string
}

export interface RendererContext4 {
    commandContext: CommandContext2
    loggingContext?: LoggingContext6
}

export interface CommandContext2 {
    onTap: OnTap6
}

export interface OnTap6 {
    innertubeCommand: InnertubeCommand7
}

export interface InnertubeCommand7 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata5
    signalServiceEndpoint?: SignalServiceEndpoint2
    addToPlaylistServiceEndpoint?: AddToPlaylistServiceEndpoint
    browseEndpoint?: BrowseEndpoint3
    watchEndpoint?: WatchEndpoint2
}

export interface CommandMetadata5 {
    webCommandMetadata: WebCommandMetadata5
}

export interface WebCommandMetadata5 {
    sendPost?: boolean
    apiUrl?: string
    url?: string
    webPageType?: string
    rootVe?: number
}

export interface SignalServiceEndpoint2 {
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
    confirmDialogRenderer?: ConfirmDialogRenderer
    formPopupRenderer?: FormPopupRenderer
}

export interface ConfirmDialogRenderer {
    title: Title3
    trackingParams: string
    dialogMessages: DialogMessage[]
    confirmButton: ConfirmButton
    cancelButton: CancelButton
    primaryIsCancel: boolean
}

export interface Title3 {
    runs: Run[]
}

export interface Run {
    text: string
}

export interface DialogMessage {
    runs: Run2[]
}

export interface Run2 {
    text: string
    bold?: boolean
}

export interface ConfirmButton {
    buttonRenderer: ButtonRenderer
}

export interface ButtonRenderer {
    style: string
    size: string
    isDisabled: boolean
    text: Text4
    serviceEndpoint: ServiceEndpoint
    trackingParams: string
}

export interface Text4 {
    runs: Run3[]
}

export interface Run3 {
    text: string
}

export interface ServiceEndpoint {
    clickTrackingParams: string
    commandMetadata: CommandMetadata6
    deletePlaylistEndpoint: DeletePlaylistEndpoint
}

export interface CommandMetadata6 {
    webCommandMetadata: WebCommandMetadata6
}

export interface WebCommandMetadata6 {
    sendPost: boolean
    apiUrl: string
}

export interface DeletePlaylistEndpoint {
    playlistId: string
}

export interface CancelButton {
    buttonRenderer: ButtonRenderer2
}

export interface ButtonRenderer2 {
    style: string
    size: string
    isDisabled: boolean
    text: Text5
    trackingParams: string
    command: Command3
}

export interface Text5 {
    runs: Run4[]
}

export interface Run4 {
    text: string
}

export interface Command3 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata7
    signalServiceEndpoint: SignalServiceEndpoint3
}

export interface CommandMetadata7 {
    webCommandMetadata: WebCommandMetadata7
}

export interface WebCommandMetadata7 {
    sendPost: boolean
}

export interface SignalServiceEndpoint3 {
    signal: string
    actions: Action5[]
}

export interface Action5 {
    clickTrackingParams: string
    signalAction: SignalAction
}

export interface SignalAction {
    signal: string
}

export interface FormPopupRenderer {
    title: Title4
    form: Form
    buttons: Button[]
}

export interface Title4 {
    runs: Run5[]
}

export interface Run5 {
    text: string
}

export interface Form {
    formRenderer: FormRenderer
}

export interface FormRenderer {
    fields: Field[]
}

export interface Field {
    toggleFormFieldRenderer: ToggleFormFieldRenderer
}

export interface ToggleFormFieldRenderer {
    label: Label
    toggled: boolean
    toggleOnAction: ToggleOnAction
    toggleOffAction: ToggleOffAction
}

export interface Label {
    runs: Run6[]
}

export interface Run6 {
    text: string
}

export interface ToggleOnAction {
    clickTrackingParams: string
    commandMetadata: CommandMetadata8
    playlistEditEndpoint: PlaylistEditEndpoint2
}

export interface CommandMetadata8 {
    webCommandMetadata: WebCommandMetadata8
}

export interface WebCommandMetadata8 {
    sendPost: boolean
    apiUrl: string
}

export interface PlaylistEditEndpoint2 {
    playlistId: string
    actions: Action6[]
    params: string
}

export interface Action6 {
    action: string
    allowEmbed?: boolean
    addToTop?: boolean
    isSeries?: boolean
}

export interface ToggleOffAction {
    clickTrackingParams: string
    commandMetadata: CommandMetadata9
    playlistEditEndpoint: PlaylistEditEndpoint3
}

export interface CommandMetadata9 {
    webCommandMetadata: WebCommandMetadata9
}

export interface WebCommandMetadata9 {
    sendPost: boolean
    apiUrl: string
}

export interface PlaylistEditEndpoint3 {
    playlistId: string
    actions: Action7[]
    params: string
}

export interface Action7 {
    action: string
    allowEmbed?: boolean
    addToTop?: boolean
    isSeries?: boolean
}

export interface Button {
    buttonRenderer: ButtonRenderer3
}

export interface ButtonRenderer3 {
    style: string
    size: string
    isDisabled: boolean
    text: Text6
    trackingParams: string
    command: Command4
}

export interface Text6 {
    runs: Run7[]
}

export interface Run7 {
    text: string
}

export interface Command4 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata10
    signalServiceEndpoint: SignalServiceEndpoint4
}

export interface CommandMetadata10 {
    webCommandMetadata: WebCommandMetadata10
}

export interface WebCommandMetadata10 {
    sendPost: boolean
}

export interface SignalServiceEndpoint4 {
    signal: string
    actions: Action8[]
}

export interface Action8 {
    clickTrackingParams: string
    signalAction: SignalAction2
}

export interface SignalAction2 {
    signal: string
}

export interface AddToPlaylistServiceEndpoint {
    playlistId: string
}

export interface BrowseEndpoint3 {
    browseId: string
    params: string
    nofollow: boolean
    navigationType: string
}

export interface WatchEndpoint2 {
    videoId: string
    playlistId: string
    params: string
    playerParams: string
    loggingContext: LoggingContext5
    watchEndpointSupportedOnesieConfig: WatchEndpointSupportedOnesieConfig2
}

export interface LoggingContext5 {
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

export interface LoggingContext6 {
    loggingDirectives: LoggingDirectives4
}

export interface LoggingDirectives4 {
    trackingParams: string
    enableDisplayloggerExperiment: boolean
}

export interface DownloadListItemViewModel {
    rendererContext: RendererContext5
}

export interface RendererContext5 {
    commandContext: CommandContext3
}

export interface CommandContext3 {
    onTap: OnTap7
}

export interface OnTap7 {
    innertubeCommand: InnertubeCommand8
}

export interface InnertubeCommand8 {
    clickTrackingParams: string
    offlinePlaylistEndpoint: OfflinePlaylistEndpoint
}

export interface OfflinePlaylistEndpoint {
    playlistId: string
    onAddCommand: OnAddCommand
}

export interface OnAddCommand {
    clickTrackingParams: string
    getDownloadActionCommand: GetDownloadActionCommand
}

export interface GetDownloadActionCommand {
    playlistId: string
    params: string
}

export interface LoggingDirectives5 {
    trackingParams: string
    visibility: Visibility4
    enableDisplayloggerExperiment: boolean
}

export interface Visibility4 {
    types: string
}

export interface RendererContext6 {
    loggingContext: LoggingContext7
}

export interface LoggingContext7 {
    loggingDirectives: LoggingDirectives6
}

export interface LoggingDirectives6 {
    trackingParams: string
    visibility: Visibility5
    clientVeSpec: ClientVeSpec4
}

export interface Visibility5 {
    types: string
}

export interface ClientVeSpec4 {
    uiType: number
    veCounter: number
}

export interface Description {
    descriptionPreviewViewModel: DescriptionPreviewViewModel
}

export interface DescriptionPreviewViewModel {
    truncationText: TruncationText
    rendererContext: RendererContext7
}

export interface TruncationText {
    content: string
    styleRuns: StyleRun2[]
}

export interface StyleRun2 {
    startIndex: number
    length: number
    weight: number
}

export interface RendererContext7 {
    loggingContext: LoggingContext8
}

export interface LoggingContext8 {
    loggingDirectives: LoggingDirectives7
}

export interface LoggingDirectives7 {
    trackingParams: string
    visibility: Visibility6
    clientVeSpec: ClientVeSpec5
}

export interface Visibility6 {
    types: string
}

export interface ClientVeSpec5 {
    uiType: number
    veCounter: number
}

export interface HeroImage {
    contentPreviewImageViewModel: ContentPreviewImageViewModel
}

export interface ContentPreviewImageViewModel {
    image: Image2
    style: string
    layoutMode: string
    overlays: Overlay[]
    rendererContext: RendererContext9
}

export interface Image2 {
    sources: Source3[]
}

export interface Source3 {
    url: string
    width: number
    height: number
}

export interface Overlay {
    thumbnailHoverOverlayViewModel: ThumbnailHoverOverlayViewModel
}

export interface ThumbnailHoverOverlayViewModel {
    icon: Icon
    text: Text7
    style: string
    rendererContext: RendererContext8
}

export interface Icon {
    sources: Source4[]
}

export interface Source4 {
    clientResource: ClientResource2
}

export interface ClientResource2 {
    imageName: string
}

export interface Text7 {
    content: string
    styleRuns: StyleRun3[]
}

export interface StyleRun3 {
    startIndex: number
    length: number
}

export interface RendererContext8 {
    commandContext: CommandContext4
}

export interface CommandContext4 {
    onTap: OnTap8
}

export interface OnTap8 {
    innertubeCommand: InnertubeCommand9
}

export interface InnertubeCommand9 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata11
    watchEndpoint: WatchEndpoint3
}

export interface CommandMetadata11 {
    webCommandMetadata: WebCommandMetadata11
}

export interface WebCommandMetadata11 {
    url: string
    webPageType: string
    rootVe: number
}

export interface WatchEndpoint3 {
    videoId: string
    playlistId: string
    playerParams: string
    loggingContext: LoggingContext9
    watchEndpointSupportedOnesieConfig: WatchEndpointSupportedOnesieConfig3
}

export interface LoggingContext9 {
    vssLoggingContext: VssLoggingContext3
}

export interface VssLoggingContext3 {
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

export interface RendererContext9 {
    loggingContext: LoggingContext10
    accessibilityContext: AccessibilityContext
}

export interface LoggingContext10 {
    loggingDirectives: LoggingDirectives8
}

export interface LoggingDirectives8 {
    trackingParams: string
    visibility: Visibility7
    clientVeSpec: ClientVeSpec6
}

export interface Visibility7 {
    types: string
}

export interface ClientVeSpec6 {
    uiType: number
    veCounter: number
}

export interface AccessibilityContext {
    label: string
}

export interface Background {
    cinematicContainerViewModel: CinematicContainerViewModel
}

export interface CinematicContainerViewModel {
    backgroundImageConfig: BackgroundImageConfig
    gradientColorConfig: GradientColorConfig[]
    config: Config
}

export interface BackgroundImageConfig {
    image: Image3
}

export interface Image3 {
    sources: Source5[]
}

export interface Source5 {
    url: string
    width: number
    height: number
}

export interface GradientColorConfig {
    lightThemeColor: number
    darkThemeColor: number
    startLocation: number
}

export interface Config {
    lightThemeBackgroundColor: number
    darkThemeBackgroundColor: number
    colorSourceSizeMultiplier: number
    applyClientImageBlur: boolean
}

export interface RendererContext10 {
    loggingContext: LoggingContext11
}

export interface LoggingContext11 {
    loggingDirectives: LoggingDirectives9
}

export interface LoggingDirectives9 {
    trackingParams: string
    visibility: Visibility8
    clientVeSpec: ClientVeSpec7
}

export interface Visibility8 {
    types: string
}

export interface ClientVeSpec7 {
    uiType: number
    veCounter: number
}
