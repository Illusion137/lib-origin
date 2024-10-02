export interface HomeResults_0 {
    responseContext: ResponseContext
    contents: Contents
    header: Header2
    trackingParams: string
    topbar: Topbar
    frameworkUpdates: FrameworkUpdates
}

export interface ResponseContext {
    serviceTrackingParams: ServiceTrackingParam[]
    maxAgeSeconds: number
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
    icon: Icon3
    tabIdentifier: string
    accessibility: Accessibility3
    trackingParams: string
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
}

export interface Content {
    richGridRenderer: RichGridRenderer
}

export interface RichGridRenderer {
    contents: Content2[]
    trackingParams: string
    targetId: string
    reflowOptions: ReflowOptions
}

export interface Content2 {
    richSectionRenderer: RichSectionRenderer
}

export interface RichSectionRenderer {
    content: Content3
    trackingParams: string
    fullBleed: boolean
}

export interface Content3 {
    searchBarEntryPointViewModel?: SearchBarEntryPointViewModel
    feedNudgeRenderer?: FeedNudgeRenderer
}

export interface SearchBarEntryPointViewModel {
    onTap: OnTap
    placeholderText: string
    topImage: TopImage
    topImageHeight: number
    topImageWidth: number
    onVoiceSearchTap: OnVoiceSearchTap
    voiceSearchA11yText: string
    moreDrawerButton: MoreDrawerButton
    moreDrawerButtonUseCompassIcon: boolean
    moreDrawerButtonUiType: number
    searchBarA11yText: string
    loggingDirectives: LoggingDirectives2
}

export interface OnTap {
    innertubeCommand: InnertubeCommand
}

export interface InnertubeCommand {
    clickTrackingParams: string
    commandMetadata: CommandMetadata2
    searchEndpoint: SearchEndpoint
}

export interface CommandMetadata2 {
    webCommandMetadata: WebCommandMetadata2
}

export interface WebCommandMetadata2 {
    url: string
    webPageType: string
    rootVe: number
}

export interface SearchEndpoint {
    query: string
}

export interface TopImage {
    sources: Source[]
}

export interface Source {
    url: string
    width: number
    height: number
}

export interface OnVoiceSearchTap {
    innertubeCommand: InnertubeCommand2
}

export interface InnertubeCommand2 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata3
    signalServiceEndpoint: SignalServiceEndpoint
}

export interface CommandMetadata3 {
    webCommandMetadata: WebCommandMetadata3
}

export interface WebCommandMetadata3 {
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
    runs: Run[]
}

export interface Run {
    text: string
}

export interface PromptHeader {
    runs: Run2[]
}

export interface Run2 {
    text: string
}

export interface ExampleQuery1 {
    runs: Run3[]
}

export interface Run3 {
    text: string
}

export interface ExampleQuery2 {
    runs: Run4[]
}

export interface Run4 {
    text: string
}

export interface PromptMicrophoneLabel {
    runs: Run5[]
}

export interface Run5 {
    text: string
}

export interface LoadingHeader {
    runs: Run6[]
}

export interface Run6 {
    text: string
}

export interface ConnectionErrorHeader {
    runs: Run7[]
}

export interface Run7 {
    text: string
}

export interface ConnectionErrorMicrophoneLabel {
    runs: Run8[]
}

export interface Run8 {
    text: string
}

export interface PermissionsHeader {
    runs: Run9[]
}

export interface Run9 {
    text: string
}

export interface PermissionsSubtext {
    runs: Run10[]
}

export interface Run10 {
    text: string
}

export interface DisabledHeader {
    runs: Run11[]
}

export interface Run11 {
    text: string
}

export interface DisabledSubtext {
    runs: Run12[]
}

export interface Run12 {
    text: string
}

export interface MicrophoneButtonAriaLabel {
    runs: Run13[]
}

export interface Run13 {
    text: string
}

export interface ExitButton {
    buttonRenderer: ButtonRenderer
}

export interface ButtonRenderer {
    style: string
    size: string
    isDisabled: boolean
    icon: Icon
    trackingParams: string
    accessibilityData: AccessibilityData
}

export interface Icon {
    iconType: string
}

export interface AccessibilityData {
    accessibilityData: AccessibilityData2
}

export interface AccessibilityData2 {
    label: string
}

export interface MicrophoneOffPromptHeader {
    runs: Run14[]
}

export interface Run14 {
    text: string
}

export interface MoreDrawerButton {
    onTap: OnTap2
    accessibilityText: string
    trackingParams: string
}

export interface OnTap2 {
    innertubeCommand: InnertubeCommand3
}

export interface InnertubeCommand3 {
    clickTrackingParams: string
    showMoreDrawerCommand: ShowMoreDrawerCommand
}

export interface ShowMoreDrawerCommand {
    loadingStrategy: LoadingStrategy
}

export interface LoadingStrategy {
    inlineContent: InlineContent
}

export interface InlineContent {
    moreDrawerViewModel: MoreDrawerViewModel
}

export interface MoreDrawerViewModel {
    header: Header
    content: Content4[]
    privacyTos: PrivacyTos
}

export interface Header {
    logoViewModel: LogoViewModel
}

export interface LogoViewModel {
    lightThemeLogo: LightThemeLogo
    darkThemeLogo: DarkThemeLogo
}

export interface LightThemeLogo {
    sources: Source2[]
}

export interface Source2 {
    clientResource: ClientResource
}

export interface ClientResource {
    bundleId: string
    imageName: string
}

export interface DarkThemeLogo {
    sources: Source3[]
}

export interface Source3 {
    clientResource: ClientResource2
}

export interface ClientResource2 {
    bundleId: string
    imageName: string
}

export interface Content4 {
    navigationItemViewModel?: NavigationItemViewModel
    dividerViewModel?: DividerViewModel
}

export interface NavigationItemViewModel {
    text: Text
    icon: Icon2
    onTap: OnTap3
    disableIconTinting?: boolean
    loggingDirectives: LoggingDirectives
}

export interface Text {
    content: string
}

export interface Icon2 {
    sources: Source4[]
}

export interface Source4 {
    clientResource: ClientResource3
}

export interface ClientResource3 {
    imageName: string
}

export interface OnTap3 {
    parallelCommand: ParallelCommand
}

export interface ParallelCommand {
    commands: Command[]
}

export interface Command {
    innertubeCommand: InnertubeCommand4
}

export interface InnertubeCommand4 {
    clickTrackingParams: string
    hideMoreDrawerCommand?: HideMoreDrawerCommand
    commandMetadata?: CommandMetadata4
    urlEndpoint?: UrlEndpoint
    browseEndpoint?: BrowseEndpoint2
}

export interface HideMoreDrawerCommand { }

export interface CommandMetadata4 {
    webCommandMetadata: WebCommandMetadata4
}

export interface WebCommandMetadata4 {
    url: string
    webPageType: string
    rootVe: number
    apiUrl?: string
}

export interface UrlEndpoint {
    url: string
    target: string
}

export interface BrowseEndpoint2 {
    browseId: string
    params?: string
}

export interface LoggingDirectives {
    trackingParams: string
    visibility: Visibility
    enableDisplayloggerExperiment: boolean
}

export interface Visibility {
    types: string
}

export interface DividerViewModel {
    dividerStyle: string
}

export interface PrivacyTos {
    privacyTosViewModel: PrivacyTosViewModel
}

export interface PrivacyTosViewModel {
    privacyText: PrivacyText
    tosText: TosText
    privacyLink: PrivacyLink
    tosLink: TosLink
}

export interface PrivacyText {
    content: string
}

export interface TosText {
    content: string
}

export interface PrivacyLink {
    parallelCommand: ParallelCommand2
}

export interface ParallelCommand2 {
    commands: Command2[]
}

export interface Command2 {
    innertubeCommand: InnertubeCommand5
}

export interface InnertubeCommand5 {
    clickTrackingParams: string
    hideMoreDrawerCommand?: HideMoreDrawerCommand2
    commandMetadata?: CommandMetadata5
    urlEndpoint?: UrlEndpoint2
}

export interface HideMoreDrawerCommand2 { }

export interface CommandMetadata5 {
    webCommandMetadata: WebCommandMetadata5
}

export interface WebCommandMetadata5 {
    url: string
    webPageType: string
    rootVe: number
}

export interface UrlEndpoint2 {
    url: string
    target: string
}

export interface TosLink {
    parallelCommand: ParallelCommand3
}

export interface ParallelCommand3 {
    commands: Command3[]
}

export interface Command3 {
    innertubeCommand: InnertubeCommand6
}

export interface InnertubeCommand6 {
    clickTrackingParams: string
    hideMoreDrawerCommand?: HideMoreDrawerCommand3
    commandMetadata?: CommandMetadata6
    urlEndpoint?: UrlEndpoint3
}

export interface HideMoreDrawerCommand3 { }

export interface CommandMetadata6 {
    webCommandMetadata: WebCommandMetadata6
}

export interface WebCommandMetadata6 {
    url: string
    webPageType: string
    rootVe: number
}

export interface UrlEndpoint3 {
    url: string
}

export interface LoggingDirectives2 {
    trackingParams: string
    visibility: Visibility2
    enableDisplayloggerExperiment: boolean
}

export interface Visibility2 {
    types: string
}

export interface FeedNudgeRenderer {
    title: Title
    subtitle: Subtitle
    impressionEndpoint: ImpressionEndpoint
    trackingParams: string
    applyModernizedStyle: boolean
    contentsLocation: string
    trimStyle: string
    backgroundStyle: string
    disableDropShadow: boolean
}

export interface Title {
    runs: Run15[]
    accessibility: Accessibility
}

export interface Run15 {
    text: string
}

export interface Accessibility {
    accessibilityData: AccessibilityData3
}

export interface AccessibilityData3 {
    label: string
}

export interface Subtitle {
    runs: Run16[]
    accessibility: Accessibility2
}

export interface Run16 {
    text: string
}

export interface Accessibility2 {
    accessibilityData: AccessibilityData4
}

export interface AccessibilityData4 {
    label: string
}

export interface ImpressionEndpoint {
    clickTrackingParams: string
    commandMetadata: CommandMetadata7
    feedbackEndpoint: FeedbackEndpoint
}

export interface CommandMetadata7 {
    webCommandMetadata: WebCommandMetadata7
}

export interface WebCommandMetadata7 {
    sendPost: boolean
    apiUrl: string
}

export interface FeedbackEndpoint {
    feedbackToken: string
}

export interface ReflowOptions {
    minimumRowsOfVideosAtStart: number
    minimumRowsOfVideosBetweenSections: number
}

export interface Icon3 {
    iconType: string
}

export interface Accessibility3 {
    accessibilityData: AccessibilityData5
}

export interface AccessibilityData5 {
    label: string
}

export interface Header2 {
    feedTabbedHeaderRenderer: FeedTabbedHeaderRenderer
}

export interface FeedTabbedHeaderRenderer {
    title: Title2
}

export interface Title2 {
    runs: Run17[]
}

export interface Run17 {
    text: string
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
    commandMetadata: CommandMetadata8
    searchEndpoint: SearchEndpoint2
}

export interface CommandMetadata8 {
    webCommandMetadata: WebCommandMetadata8
}

export interface WebCommandMetadata8 {
    url: string
    webPageType: string
    rootVe: number
}

export interface SearchEndpoint2 {
    params: string
    hack: boolean
}

export interface VoiceSearchButton {
    buttonRenderer: ButtonRenderer2
}

export interface ButtonRenderer2 {
    style: string
    size: string
    isDisabled: boolean
    serviceEndpoint: ServiceEndpoint
    icon: Icon5
    tooltip: string
    trackingParams: string
    accessibilityData: AccessibilityData8
}

export interface ServiceEndpoint {
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
}

export interface Popup2 {
    voiceSearchDialogRenderer: VoiceSearchDialogRenderer2
}

export interface VoiceSearchDialogRenderer2 {
    placeholderHeader: PlaceholderHeader2
    promptHeader: PromptHeader2
    exampleQuery1: ExampleQuery12
    exampleQuery2: ExampleQuery22
    promptMicrophoneLabel: PromptMicrophoneLabel2
    loadingHeader: LoadingHeader2
    connectionErrorHeader: ConnectionErrorHeader2
    connectionErrorMicrophoneLabel: ConnectionErrorMicrophoneLabel2
    permissionsHeader: PermissionsHeader2
    permissionsSubtext: PermissionsSubtext2
    disabledHeader: DisabledHeader2
    disabledSubtext: DisabledSubtext2
    microphoneButtonAriaLabel: MicrophoneButtonAriaLabel2
    exitButton: ExitButton2
    trackingParams: string
    microphoneOffPromptHeader: MicrophoneOffPromptHeader2
}

export interface PlaceholderHeader2 {
    runs: Run18[]
}

export interface Run18 {
    text: string
}

export interface PromptHeader2 {
    runs: Run19[]
}

export interface Run19 {
    text: string
}

export interface ExampleQuery12 {
    runs: Run20[]
}

export interface Run20 {
    text: string
}

export interface ExampleQuery22 {
    runs: Run21[]
}

export interface Run21 {
    text: string
}

export interface PromptMicrophoneLabel2 {
    runs: Run22[]
}

export interface Run22 {
    text: string
}

export interface LoadingHeader2 {
    runs: Run23[]
}

export interface Run23 {
    text: string
}

export interface ConnectionErrorHeader2 {
    runs: Run24[]
}

export interface Run24 {
    text: string
}

export interface ConnectionErrorMicrophoneLabel2 {
    runs: Run25[]
}

export interface Run25 {
    text: string
}

export interface PermissionsHeader2 {
    runs: Run26[]
}

export interface Run26 {
    text: string
}

export interface PermissionsSubtext2 {
    runs: Run27[]
}

export interface Run27 {
    text: string
}

export interface DisabledHeader2 {
    runs: Run28[]
}

export interface Run28 {
    text: string
}

export interface DisabledSubtext2 {
    runs: Run29[]
}

export interface Run29 {
    text: string
}

export interface MicrophoneButtonAriaLabel2 {
    runs: Run30[]
}

export interface Run30 {
    text: string
}

export interface ExitButton2 {
    buttonRenderer: ButtonRenderer3
}

export interface ButtonRenderer3 {
    style: string
    size: string
    isDisabled: boolean
    icon: Icon4
    trackingParams: string
    accessibilityData: AccessibilityData6
}

export interface Icon4 {
    iconType: string
}

export interface AccessibilityData6 {
    accessibilityData: AccessibilityData7
}

export interface AccessibilityData7 {
    label: string
}

export interface MicrophoneOffPromptHeader2 {
    runs: Run31[]
}

export interface Run31 {
    text: string
}

export interface Icon5 {
    iconType: string
}

export interface AccessibilityData8 {
    accessibilityData: AccessibilityData9
}

export interface AccessibilityData9 {
    label: string
}

export interface TopbarLogo {
    topbarLogoRenderer: TopbarLogoRenderer
}

export interface TopbarLogoRenderer {
    iconImage: IconImage
    tooltipText: TooltipText
    endpoint: Endpoint2
    trackingParams: string
    overrideEntityKey: string
}

export interface IconImage {
    iconType: string
}

export interface TooltipText {
    runs: Run32[]
}

export interface Run32 {
    text: string
}

export interface Endpoint2 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata10
    browseEndpoint: BrowseEndpoint3
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

export interface BrowseEndpoint3 {
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
    options: Options
}

export interface Options {
    persistenceOption: string
}

export interface Timestamp {
    seconds: string
    nanos: number
}
