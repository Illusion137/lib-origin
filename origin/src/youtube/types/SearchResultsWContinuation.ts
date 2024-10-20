export interface SearchResultsWContinuation {
    responseContext: ResponseContext
    estimatedResults: string
    trackingParams: string
    header: Header
    topbar: Topbar
    onResponseReceivedCommands: OnResponseReceivedCommand[]
}

export interface ResponseContext {
    visitorData: string
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
    hasDecorated: boolean
}

export interface Header {
    searchHeaderRenderer: SearchHeaderRenderer
}

export interface SearchHeaderRenderer {
    searchFilterButton: SearchFilterButton
    trackingParams: string
}

export interface SearchFilterButton {
    buttonRenderer: ButtonRenderer
}

export interface ButtonRenderer {
    style: string
    size: string
    isDisabled: boolean
    text: Text
    icon: Icon
    tooltip: string
    trackingParams: string
    accessibilityData: AccessibilityData
    command: Command
    iconPosition: string
}

export interface Text {
    runs: Run[]
}

export interface Run {
    text: string
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

export interface Command {
    clickTrackingParams: string
    openPopupAction: OpenPopupAction
}

export interface OpenPopupAction {
    popup: Popup
    popupType: string
}

export interface Popup {
    searchFilterOptionsDialogRenderer: SearchFilterOptionsDialogRenderer
}

export interface SearchFilterOptionsDialogRenderer {
    title: Title
    groups: Group[]
}

export interface Title {
    runs: Run2[]
}

export interface Run2 {
    text: string
}

export interface Group {
    searchFilterGroupRenderer: SearchFilterGroupRenderer
}

export interface SearchFilterGroupRenderer {
    title: Title2
    filters: Filter[]
    trackingParams: string
}

export interface Title2 {
    simpleText: string
}

export interface Filter {
    searchFilterRenderer: SearchFilterRenderer
}

export interface SearchFilterRenderer {
    label: Label
    navigationEndpoint?: NavigationEndpoint
    tooltip: string
    trackingParams: string
    status?: string
}

export interface Label {
    simpleText: string
}

export interface NavigationEndpoint {
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
    params: string
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
    endpoint: Endpoint
    trackingParams: string
    overrideEntityKey: string
}

export interface IconImage {
    iconType: string
}

export interface TooltipText {
    runs: Run3[]
}

export interface Run3 {
    text: string
}

export interface Endpoint {
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
}

export interface Searchbox {
    fusionSearchboxRenderer: FusionSearchboxRenderer
}

export interface FusionSearchboxRenderer {
    icon: Icon2
    placeholderText: PlaceholderText
    config: Config
    trackingParams: string
    searchEndpoint: SearchEndpoint2
    clearButton: ClearButton
}

export interface Icon2 {
    iconType: string
}

export interface PlaceholderText {
    runs: Run4[]
}

export interface Run4 {
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

export interface SearchEndpoint2 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata3
    searchEndpoint: SearchEndpoint3
}

export interface CommandMetadata3 {
    webCommandMetadata: WebCommandMetadata3
}

export interface WebCommandMetadata3 {
    url: string
    webPageType: string
    rootVe: number
}

export interface SearchEndpoint3 {
    query: string
}

export interface ClearButton {
    buttonRenderer: ButtonRenderer2
}

export interface ButtonRenderer2 {
    style: string
    size: string
    isDisabled: boolean
    icon: Icon3
    trackingParams: string
    accessibilityData: AccessibilityData3
}

export interface Icon3 {
    iconType: string
}

export interface AccessibilityData3 {
    accessibilityData: AccessibilityData4
}

export interface AccessibilityData4 {
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
    icon?: Icon4
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
    accessibilityData: AccessibilityData5
}

export interface AccessibilityData5 {
    label: string
}

export interface MenuRequest {
    clickTrackingParams: string
    commandMetadata: CommandMetadata4
    signalServiceEndpoint: SignalServiceEndpoint
}

export interface CommandMetadata4 {
    webCommandMetadata: WebCommandMetadata4
}

export interface WebCommandMetadata4 {
    sendPost: boolean
    apiUrl: string
}

export interface SignalServiceEndpoint {
    signal: string
    actions: Action[]
}

export interface Action {
    clickTrackingParams: string
    openPopupAction: OpenPopupAction2
}

export interface OpenPopupAction2 {
    popup: Popup2
    popupType: string
    beReused: boolean
}

export interface Popup2 {
    multiPageMenuRenderer: MultiPageMenuRenderer
}

export interface MultiPageMenuRenderer {
    trackingParams: string
    style: string
    showLoadingSpinner: boolean
}

export interface Accessibility2 {
    accessibilityData: AccessibilityData6
}

export interface AccessibilityData6 {
    label: string
}

export interface Icon4 {
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
    icon: Icon5
    title: Title3
    navigationEndpoint: NavigationEndpoint2
    trackingParams: string
    style: string
}

export interface Icon5 {
    iconType: string
}

export interface Title3 {
    runs: Run5[]
}

export interface Run5 {
    text: string
}

export interface NavigationEndpoint2 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata5
    uploadEndpoint?: UploadEndpoint
    signalNavigationEndpoint?: SignalNavigationEndpoint
    browseEndpoint?: BrowseEndpoint2
}

export interface CommandMetadata5 {
    webCommandMetadata: WebCommandMetadata5
}

export interface WebCommandMetadata5 {
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

export interface BrowseEndpoint2 {
    browseId: string
    params: string
}

export interface NotificationTopbarButtonRenderer {
    icon: Icon6
    menuRequest: MenuRequest2
    style: string
    trackingParams: string
    accessibility: Accessibility3
    tooltip: string
    updateUnseenCountEndpoint: UpdateUnseenCountEndpoint
    notificationCount: number
    handlerDatas: string[]
}

export interface Icon6 {
    iconType: string
}

export interface MenuRequest2 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata6
    signalServiceEndpoint: SignalServiceEndpoint2
}

export interface CommandMetadata6 {
    webCommandMetadata: WebCommandMetadata6
}

export interface WebCommandMetadata6 {
    sendPost: boolean
}

export interface SignalServiceEndpoint2 {
    signal: string
    actions: Action2[]
}

export interface Action2 {
    clickTrackingParams: string
    openPopupAction: OpenPopupAction3
}

export interface OpenPopupAction3 {
    popup: Popup3
    popupType: string
    beReused: boolean
}

export interface Popup3 {
    multiPageMenuRenderer: MultiPageMenuRenderer3
}

export interface MultiPageMenuRenderer3 {
    trackingParams: string
    style: string
    showLoadingSpinner: boolean
}

export interface Accessibility3 {
    accessibilityData: AccessibilityData7
}

export interface AccessibilityData7 {
    label: string
}

export interface UpdateUnseenCountEndpoint {
    clickTrackingParams: string
    commandMetadata: CommandMetadata7
    signalServiceEndpoint: SignalServiceEndpoint3
}

export interface CommandMetadata7 {
    webCommandMetadata: WebCommandMetadata7
}

export interface WebCommandMetadata7 {
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
    title: Title4
    sections: Section2[]
    dismissButton: DismissButton
    trackingParams: string
}

export interface Title4 {
    runs: Run6[]
}

export interface Run6 {
    text: string
}

export interface Section2 {
    hotkeyDialogSectionRenderer: HotkeyDialogSectionRenderer
}

export interface HotkeyDialogSectionRenderer {
    title: Title5
    options: Option[]
}

export interface Title5 {
    runs: Run7[]
}

export interface Run7 {
    text: string
}

export interface Option {
    hotkeyDialogSectionOptionRenderer: HotkeyDialogSectionOptionRenderer
}

export interface HotkeyDialogSectionOptionRenderer {
    label: Label2
    hotkey: string
    hotkeyAccessibilityLabel?: HotkeyAccessibilityLabel
}

export interface Label2 {
    runs: Run8[]
}

export interface Run8 {
    text: string
}

export interface HotkeyAccessibilityLabel {
    accessibilityData: AccessibilityData8
}

export interface AccessibilityData8 {
    label: string
}

export interface DismissButton {
    buttonRenderer: ButtonRenderer3
}

export interface ButtonRenderer3 {
    style: string
    size: string
    isDisabled: boolean
    text: Text2
    trackingParams: string
}

export interface Text2 {
    runs: Run9[]
}

export interface Run9 {
    text: string
}

export interface BackButton {
    buttonRenderer: ButtonRenderer4
}

export interface ButtonRenderer4 {
    trackingParams: string
    command: Command2
}

export interface Command2 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata8
    signalServiceEndpoint: SignalServiceEndpoint4
}

export interface CommandMetadata8 {
    webCommandMetadata: WebCommandMetadata8
}

export interface WebCommandMetadata8 {
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
    buttonRenderer: ButtonRenderer5
}

export interface ButtonRenderer5 {
    trackingParams: string
    command: Command3
}

export interface Command3 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata9
    signalServiceEndpoint: SignalServiceEndpoint5
}

export interface CommandMetadata9 {
    webCommandMetadata: WebCommandMetadata9
}

export interface WebCommandMetadata9 {
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
    buttonRenderer: ButtonRenderer6
}

export interface ButtonRenderer6 {
    style: string
    size: string
    isDisabled: boolean
    text: Text3
    trackingParams: string
    command: Command4
}

export interface Text3 {
    runs: Run10[]
}

export interface Run10 {
    text: string
}

export interface Command4 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata10
    signalServiceEndpoint: SignalServiceEndpoint6
}

export interface CommandMetadata10 {
    webCommandMetadata: WebCommandMetadata10
}

export interface WebCommandMetadata10 {
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

export interface VoiceSearchButton {
    buttonRenderer: ButtonRenderer7
}

export interface ButtonRenderer7 {
    style: string
    size: string
    isDisabled: boolean
    serviceEndpoint: ServiceEndpoint
    icon: Icon8
    tooltip: string
    trackingParams: string
    accessibilityData: AccessibilityData11
}

export interface ServiceEndpoint {
    clickTrackingParams: string
    commandMetadata: CommandMetadata11
    signalServiceEndpoint: SignalServiceEndpoint7
}

export interface CommandMetadata11 {
    webCommandMetadata: WebCommandMetadata11
}

export interface WebCommandMetadata11 {
    sendPost: boolean
}

export interface SignalServiceEndpoint7 {
    signal: string
    actions: Action6[]
}

export interface Action6 {
    clickTrackingParams: string
    openPopupAction: OpenPopupAction4
}

export interface OpenPopupAction4 {
    popup: Popup4
    popupType: string
}

export interface Popup4 {
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
    runs: Run11[]
}

export interface Run11 {
    text: string
}

export interface PromptHeader {
    runs: Run12[]
}

export interface Run12 {
    text: string
}

export interface ExampleQuery1 {
    runs: Run13[]
}

export interface Run13 {
    text: string
}

export interface ExampleQuery2 {
    runs: Run14[]
}

export interface Run14 {
    text: string
}

export interface PromptMicrophoneLabel {
    runs: Run15[]
}

export interface Run15 {
    text: string
}

export interface LoadingHeader {
    runs: Run16[]
}

export interface Run16 {
    text: string
}

export interface ConnectionErrorHeader {
    runs: Run17[]
}

export interface Run17 {
    text: string
}

export interface ConnectionErrorMicrophoneLabel {
    runs: Run18[]
}

export interface Run18 {
    text: string
}

export interface PermissionsHeader {
    runs: Run19[]
}

export interface Run19 {
    text: string
}

export interface PermissionsSubtext {
    runs: Run20[]
}

export interface Run20 {
    text: string
}

export interface DisabledHeader {
    runs: Run21[]
}

export interface Run21 {
    text: string
}

export interface DisabledSubtext {
    runs: Run22[]
}

export interface Run22 {
    text: string
}

export interface MicrophoneButtonAriaLabel {
    runs: Run23[]
}

export interface Run23 {
    text: string
}

export interface ExitButton {
    buttonRenderer: ButtonRenderer8
}

export interface ButtonRenderer8 {
    style: string
    size: string
    isDisabled: boolean
    icon: Icon7
    trackingParams: string
    accessibilityData: AccessibilityData9
}

export interface Icon7 {
    iconType: string
}

export interface AccessibilityData9 {
    accessibilityData: AccessibilityData10
}

export interface AccessibilityData10 {
    label: string
}

export interface MicrophoneOffPromptHeader {
    runs: Run24[]
}

export interface Run24 {
    text: string
}

export interface Icon8 {
    iconType: string
}

export interface AccessibilityData11 {
    accessibilityData: AccessibilityData12
}

export interface AccessibilityData12 {
    label: string
}

export interface OnResponseReceivedCommand {
    clickTrackingParams: string
    appendContinuationItemsAction: AppendContinuationItemsAction
}

export interface AppendContinuationItemsAction {
    continuationItems: ContinuationItem[]
    targetId: string
}

export interface ContinuationItem {
    itemSectionRenderer: ItemSectionRenderer
    continuationItemRenderer: ContinuationItemRenderer
}

export interface ItemSectionRenderer {
    contents: Content[]
    trackingParams: string
}

export interface Content {
    videoRenderer: VideoRenderer
    channelRenderer: ChannelRenderer
    reelShelfRenderer: ReelShelfRenderer
    playlistRenderer: PlaylistRenderer
}

export type PlaylistRenderer = {
    playlistId: string
    title: {
        simpleText: string
    }
    thumbnails: Array<{
        thumbnails: Array<{
            url: string
            width: number
            height: number
        }>
    }>
    videoCount: string
    navigationEndpoint: {
        clickTrackingParams: string
        commandMetadata: {
            webCommandMetadata: {
                url: string
                webPageType: string
                rootVe: number
            }
        }
        watchEndpoint: {
            videoId: string
            playlistId: string
            params: string
            loggingContext: {
                vssLoggingContext: {
                    serializedContextData: string
                }
            }
            watchEndpointSupportedOnesieConfig: {
                html5PlaybackOnesieConfig: {
                    commonConfig: {
                        url: string
                    }
                }
            }
        }
    }
    viewPlaylistText: {
        runs: Array<{
            text: string
            navigationEndpoint: {
                clickTrackingParams: string
                commandMetadata: {
                    webCommandMetadata: {
                        url: string
                        webPageType: string
                        rootVe: number
                        apiUrl: string
                    }
                }
                browseEndpoint: {
                    browseId: string
                }
            }
        }>
    }
    shortBylineText: {
        runs: Array<{
            text: string
            navigationEndpoint?: {
                clickTrackingParams: string
                commandMetadata: {
                    webCommandMetadata: {
                        url: string
                        webPageType: string
                        rootVe: number
                        apiUrl: string
                    }
                }
                browseEndpoint: {
                    browseId: string
                    canonicalBaseUrl: string
                }
            }
        }>
    }
    videos: Array<{
        childVideoRenderer: {
            title: {
                simpleText: string
            }
            navigationEndpoint: {
                clickTrackingParams: string
                commandMetadata: {
                    webCommandMetadata: {
                        url: string
                        webPageType: string
                        rootVe: number
                    }
                }
                watchEndpoint: {
                    videoId: string
                    playlistId: string
                    loggingContext: {
                        vssLoggingContext: {
                            serializedContextData: string
                        }
                    }
                    watchEndpointSupportedOnesieConfig: {
                        html5PlaybackOnesieConfig: {
                            commonConfig: {
                                url: string
                            }
                        }
                    }
                }
            }
            lengthText: {
                accessibility: {
                    accessibilityData: {
                        label: string
                    }
                }
                simpleText: string
            }
            videoId: string
        }
    }>
    videoCountText: {
        runs: Array<{
            text: string
        }>
    }
    trackingParams: string
    thumbnailText: {
        runs: Array<{
            text: string
            bold?: boolean
        }>
    }
    longBylineText: {
        runs: Array<{
            text: string
            navigationEndpoint?: {
                clickTrackingParams: string
                commandMetadata: {
                    webCommandMetadata: {
                        url: string
                        webPageType: string
                        rootVe: number
                        apiUrl: string
                    }
                }
                browseEndpoint: {
                    browseId: string
                    canonicalBaseUrl: string
                }
            }
        }>
    }
    thumbnailRenderer: {
        playlistVideoThumbnailRenderer: {
            thumbnail: {
                thumbnails: Array<{
                    url: string
                    width: number
                    height: number
                }>
                sampledThumbnailColor: {
                    red: number
                    green: number
                    blue: number
                }
                darkColorPalette: {
                    section2Color: number
                    iconInactiveColor: number
                    iconDisabledColor: number
                }
                vibrantColorPalette: {
                    iconInactiveColor: number
                }
            }
            trackingParams: string
        }
    }
    thumbnailOverlays: Array<{
        thumbnailOverlayBottomPanelRenderer?: {
            text: {
                simpleText: string
            }
            icon: {
                iconType: string
            }
        }
        thumbnailOverlayHoverTextRenderer?: {
            text: {
                runs: Array<{
                    text: string
                }>
            }
            icon: {
                iconType: string
            }
        }
        thumbnailOverlayNowPlayingRenderer?: {
            text: {
                runs: Array<{
                    text: string
                }>
            }
        }
    }>
    thumbnail: {
        thumbnails: Array<{
            url: string
            width: number
            height: number
        }>
        sampledThumbnailColor: {
            red: number
            green: number
            blue: number
        }
        darkColorPalette: {
            section2Color: number
            iconInactiveColor: number
            iconDisabledColor: number
        }
        vibrantColorPalette: {
            iconInactiveColor: number
        }
    }
}

export interface ChannelRenderer {
    channelId: string
    title: Title5
    navigationEndpoint: NavigationEndpoint
    thumbnail: Thumbnail
    descriptionSnippet: DescriptionSnippet
    shortBylineText: ShortBylineText
    videoCountText: VideoCountText
    subscriptionButton: SubscriptionButton
    subscriberCountText: SubscriberCountText
    subscribeButton: SubscribeButton
    trackingParams: string
    longBylineText: LongBylineText
}
export interface DescriptionSnippet {
    runs: Run15[]
}
export interface VideoCountText {
    accessibility: Accessibility8
    simpleText: string
}
export interface SubscribeButton {
    buttonRenderer: ButtonRenderer2
}
export interface ButtonRenderer2 {
    style: string
    size: string
    isDisabled: boolean
    text: Text
    navigationEndpoint: NavigationEndpoint
    trackingParams: string
}
export interface SubscriptionButton {
    subscribed: boolean
}
export interface SubscriberCountText {
    simpleText: string
}

export interface VideoRenderer {
    videoId: string
    thumbnail: Thumbnail2
    title: Title6
    longBylineText: LongBylineText
    publishedTimeText?: PublishedTimeText
    lengthText: LengthText
    viewCountText: ViewCountText
    navigationEndpoint: NavigationEndpoint4
    badges?: Badge[]
    ownerBadges?: OwnerBadge[]
    ownerText: OwnerText
    shortBylineText: ShortBylineText
    trackingParams: string
    showActionMenu: boolean
    shortViewCountText: ShortViewCountText
    isWatched?: boolean
    menu: Menu
    channelThumbnailSupportedRenderers: ChannelThumbnailSupportedRenderers
    thumbnailOverlays: ThumbnailOverlay[]
    richThumbnail?: RichThumbnail
    detailedMetadataSnippets: DetailedMetadataSnippet[]
    inlinePlaybackEndpoint: InlinePlaybackEndpoint
    searchVideoResultEntityKey: string
    avatar: Avatar2
}

export interface Thumbnail2 {
    thumbnails: Thumbnail3[]
}

export interface Thumbnail3 {
    url: string
    width: number
    height: number
}

export interface Title6 {
    runs: Run25[]
    accessibility: Accessibility4
}

export interface Run25 {
    text: string
}

export interface Accessibility4 {
    accessibilityData: AccessibilityData13
}

export interface AccessibilityData13 {
    label: string
}

export interface LongBylineText {
    runs: Run26[]
}

export interface Run26 {
    text: string
    navigationEndpoint: NavigationEndpoint3
}

export interface NavigationEndpoint3 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata12
    browseEndpoint: BrowseEndpoint3
}

export interface CommandMetadata12 {
    webCommandMetadata: WebCommandMetadata12
}

export interface WebCommandMetadata12 {
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

export interface LengthText {
    accessibility: Accessibility5
    simpleText: string
}

export interface Accessibility5 {
    accessibilityData: AccessibilityData14
}

export interface AccessibilityData14 {
    label: string
}

export interface ViewCountText {
    simpleText: string
}

export interface NavigationEndpoint4 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata13
    watchEndpoint: WatchEndpoint
}

export interface CommandMetadata13 {
    webCommandMetadata: WebCommandMetadata13
}

export interface WebCommandMetadata13 {
    url: string
    webPageType: string
    rootVe: number
}

export interface WatchEndpoint {
    videoId: string
    params: string
    playerParams: string
    watchEndpointSupportedOnesieConfig: WatchEndpointSupportedOnesieConfig
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

export interface Badge {
    metadataBadgeRenderer: MetadataBadgeRenderer
}

export interface MetadataBadgeRenderer {
    style: string
    label: string
    trackingParams: string
}

export interface OwnerBadge {
    metadataBadgeRenderer: MetadataBadgeRenderer2
}

export interface MetadataBadgeRenderer2 {
    icon: Icon9
    style: string
    tooltip: string
    trackingParams: string
    accessibilityData: AccessibilityData15
}

export interface Icon9 {
    iconType: string
}

export interface AccessibilityData15 {
    label: string
}

export interface OwnerText {
    runs: Run27[]
}

export interface Run27 {
    text: string
    navigationEndpoint: NavigationEndpoint5
}

export interface NavigationEndpoint5 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata14
    browseEndpoint: BrowseEndpoint4
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

export interface BrowseEndpoint4 {
    browseId: string
    canonicalBaseUrl: string
}

export interface ShortBylineText {
    runs: Run28[]
}

export interface Run28 {
    text: string
    navigationEndpoint: NavigationEndpoint6
}

export interface NavigationEndpoint6 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata15
    browseEndpoint: BrowseEndpoint5
}

export interface CommandMetadata15 {
    webCommandMetadata: WebCommandMetadata15
}

export interface WebCommandMetadata15 {
    url: string
    webPageType: string
    rootVe: number
    apiUrl: string
}

export interface BrowseEndpoint5 {
    browseId: string
    canonicalBaseUrl: string
}

export interface ShortViewCountText {
    accessibility: Accessibility6
    simpleText: string
}

export interface Accessibility6 {
    accessibilityData: AccessibilityData16
}

export interface AccessibilityData16 {
    label: string
}

export interface Menu {
    menuRenderer: MenuRenderer2
}

export interface MenuRenderer2 {
    items: Item2[]
    trackingParams: string
    accessibility: Accessibility7
}

export interface Item2 {
    menuServiceItemRenderer?: MenuServiceItemRenderer
    menuServiceItemDownloadRenderer?: MenuServiceItemDownloadRenderer
}

export interface MenuServiceItemRenderer {
    text: Text4
    icon: Icon10
    serviceEndpoint: ServiceEndpoint2
    trackingParams: string
    hasSeparator?: boolean
}

export interface Text4 {
    runs: Run29[]
}

export interface Run29 {
    text: string
}

export interface Icon10 {
    iconType: string
}

export interface ServiceEndpoint2 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata16
    getReportFormEndpoint?: GetReportFormEndpoint
    shareEntityServiceEndpoint?: ShareEntityServiceEndpoint
    signalServiceEndpoint?: SignalServiceEndpoint8
    playlistEditEndpoint?: PlaylistEditEndpoint
    addToPlaylistServiceEndpoint?: AddToPlaylistServiceEndpoint
}

export interface CommandMetadata16 {
    webCommandMetadata: WebCommandMetadata16
}

export interface WebCommandMetadata16 {
    sendPost: boolean
    apiUrl?: string
}

export interface GetReportFormEndpoint {
    params: string
}

export interface ShareEntityServiceEndpoint {
    serializedShareEntity: string
    commands: Command5[]
}

export interface Command5 {
    clickTrackingParams: string
    openPopupAction: OpenPopupAction5
}

export interface OpenPopupAction5 {
    popup: Popup5
    popupType: string
    beReused: boolean
}

export interface Popup5 {
    unifiedSharePanelRenderer: UnifiedSharePanelRenderer
}

export interface UnifiedSharePanelRenderer {
    trackingParams: string
    showLoadingSpinner: boolean
}

export interface SignalServiceEndpoint8 {
    signal: string
    actions: Action7[]
}

export interface Action7 {
    clickTrackingParams: string
    addToPlaylistCommand: AddToPlaylistCommand
}

export interface AddToPlaylistCommand {
    openMiniplayer: boolean
    videoId: string
    listType: string
    onCreateListCommand: OnCreateListCommand
    videoIds: string[]
}

export interface OnCreateListCommand {
    clickTrackingParams: string
    commandMetadata: CommandMetadata17
    createPlaylistServiceEndpoint: CreatePlaylistServiceEndpoint
}

export interface CommandMetadata17 {
    webCommandMetadata: WebCommandMetadata17
}

export interface WebCommandMetadata17 {
    sendPost: boolean
    apiUrl: string
}

export interface CreatePlaylistServiceEndpoint {
    videoIds: string[]
    params: string
}

export interface PlaylistEditEndpoint {
    playlistId: string
    actions: Action8[]
}

export interface Action8 {
    addedVideoId: string
    action: string
}

export interface AddToPlaylistServiceEndpoint {
    videoId: string
}

export interface MenuServiceItemDownloadRenderer {
    serviceEndpoint: ServiceEndpoint3
    trackingParams: string
}

export interface ServiceEndpoint3 {
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
}

export interface Accessibility7 {
    accessibilityData: AccessibilityData17
}

export interface AccessibilityData17 {
    label: string
}

export interface ChannelThumbnailSupportedRenderers {
    channelThumbnailWithLinkRenderer: ChannelThumbnailWithLinkRenderer
}

export interface ChannelThumbnailWithLinkRenderer {
    thumbnail: Thumbnail4
    navigationEndpoint: NavigationEndpoint7
    accessibility: Accessibility8
}

export interface Thumbnail4 {
    thumbnails: Thumbnail5[]
}

export interface Thumbnail5 {
    url: string
    width: number
    height: number
}

export interface NavigationEndpoint7 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata18
    browseEndpoint: BrowseEndpoint6
}

export interface CommandMetadata18 {
    webCommandMetadata: WebCommandMetadata18
}

export interface WebCommandMetadata18 {
    url: string
    webPageType: string
    rootVe: number
    apiUrl: string
}

export interface BrowseEndpoint6 {
    browseId: string
    canonicalBaseUrl?: string
}

export interface Accessibility8 {
    accessibilityData: AccessibilityData18
}

export interface AccessibilityData18 {
    label: string
}

export interface ThumbnailOverlay {
    thumbnailOverlayResumePlaybackRenderer?: ThumbnailOverlayResumePlaybackRenderer
    thumbnailOverlayTimeStatusRenderer?: ThumbnailOverlayTimeStatusRenderer
    thumbnailOverlayToggleButtonRenderer?: ThumbnailOverlayToggleButtonRenderer
    thumbnailOverlayNowPlayingRenderer?: ThumbnailOverlayNowPlayingRenderer
    thumbnailOverlayLoadingPreviewRenderer?: ThumbnailOverlayLoadingPreviewRenderer
}

export interface ThumbnailOverlayResumePlaybackRenderer {
    percentDurationWatched: number
}

export interface ThumbnailOverlayTimeStatusRenderer {
    text: Text5
    style: string
}

export interface Text5 {
    accessibility: Accessibility9
    simpleText: string
}

export interface Accessibility9 {
    accessibilityData: AccessibilityData19
}

export interface AccessibilityData19 {
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
    commandMetadata: CommandMetadata19
    signalServiceEndpoint?: SignalServiceEndpoint9
    playlistEditEndpoint?: PlaylistEditEndpoint2
}

export interface CommandMetadata19 {
    webCommandMetadata: WebCommandMetadata19
}

export interface WebCommandMetadata19 {
    sendPost: boolean
    apiUrl?: string
}

export interface SignalServiceEndpoint9 {
    signal: string
    actions: Action9[]
}

export interface Action9 {
    clickTrackingParams: string
    addToPlaylistCommand: AddToPlaylistCommand2
}

export interface AddToPlaylistCommand2 {
    openMiniplayer: boolean
    videoId: string
    listType: string
    onCreateListCommand: OnCreateListCommand2
    videoIds: string[]
}

export interface OnCreateListCommand2 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata20
    createPlaylistServiceEndpoint: CreatePlaylistServiceEndpoint2
}

export interface CommandMetadata20 {
    webCommandMetadata: WebCommandMetadata20
}

export interface WebCommandMetadata20 {
    sendPost: boolean
    apiUrl: string
}

export interface CreatePlaylistServiceEndpoint2 {
    videoIds: string[]
    params: string
}

export interface PlaylistEditEndpoint2 {
    playlistId: string
    actions: Action10[]
}

export interface Action10 {
    addedVideoId: string
    action: string
}

export interface UntoggledAccessibility {
    accessibilityData: AccessibilityData20
}

export interface AccessibilityData20 {
    label: string
}

export interface ToggledAccessibility {
    accessibilityData: AccessibilityData21
}

export interface AccessibilityData21 {
    label: string
}

export interface ToggledServiceEndpoint {
    clickTrackingParams: string
    commandMetadata: CommandMetadata21
    playlistEditEndpoint: PlaylistEditEndpoint3
}

export interface CommandMetadata21 {
    webCommandMetadata: WebCommandMetadata21
}

export interface WebCommandMetadata21 {
    sendPost: boolean
    apiUrl: string
}

export interface PlaylistEditEndpoint3 {
    playlistId: string
    actions: Action11[]
}

export interface Action11 {
    action: string
    removedVideoId: string
}

export interface ThumbnailOverlayNowPlayingRenderer {
    text: Text6
}

export interface Text6 {
    runs: Run30[]
}

export interface Run30 {
    text: string
}

export interface ThumbnailOverlayLoadingPreviewRenderer {
    text: Text7
}

export interface Text7 {
    runs: Run31[]
}

export interface Run31 {
    text: string
}

export interface RichThumbnail {
    movingThumbnailRenderer: MovingThumbnailRenderer
}

export interface MovingThumbnailRenderer {
    movingThumbnailDetails: MovingThumbnailDetails
    enableHoveredLogging: boolean
    enableOverlay: boolean
}

export interface MovingThumbnailDetails {
    thumbnails: Thumbnail6[]
    logAsMovingThumbnail: boolean
}

export interface Thumbnail6 {
    url: string
    width: number
    height: number
}

export interface DetailedMetadataSnippet {
    snippetText: SnippetText
    snippetHoverText: SnippetHoverText
    maxOneLine: boolean
}

export interface SnippetText {
    runs: Run32[]
}

export interface Run32 {
    text: string
    bold?: boolean
}

export interface SnippetHoverText {
    runs: Run33[]
}

export interface Run33 {
    text: string
}

export interface InlinePlaybackEndpoint {
    clickTrackingParams: string
    commandMetadata: CommandMetadata22
    watchEndpoint: WatchEndpoint2
}

export interface CommandMetadata22 {
    webCommandMetadata: WebCommandMetadata22
}

export interface WebCommandMetadata22 {
    url: string
    webPageType: string
    rootVe: number
}

export interface WatchEndpoint2 {
    videoId: string
    params: string
    playerParams: string
    playerExtraUrlParams: PlayerExtraUrlParam[]
    watchEndpointSupportedOnesieConfig: WatchEndpointSupportedOnesieConfig2
}

export interface PlayerExtraUrlParam {
    key: string
    value: string
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

export interface Avatar2 {
    decoratedAvatarViewModel: DecoratedAvatarViewModel
}

export interface DecoratedAvatarViewModel {
    avatar: Avatar3
    a11yLabel: string
    rendererContext: RendererContext
}

export interface Avatar3 {
    avatarViewModel: AvatarViewModel
}

export interface AvatarViewModel {
    image: Image
    avatarImageSize: string
}

export interface Image {
    sources: Source[]
}

export interface Source {
    url: string
    width: number
    height: number
}

export interface RendererContext {
    commandContext: CommandContext
}

export interface CommandContext {
    onTap: OnTap
}

export interface OnTap {
    innertubeCommand: InnertubeCommand
}

export interface InnertubeCommand {
    clickTrackingParams: string
    commandMetadata: CommandMetadata23
    browseEndpoint: BrowseEndpoint7
}

export interface CommandMetadata23 {
    webCommandMetadata: WebCommandMetadata23
}

export interface WebCommandMetadata23 {
    url: string
    webPageType: string
    rootVe: number
    apiUrl: string
}

export interface BrowseEndpoint7 {
    browseId: string
    canonicalBaseUrl?: string
}

export interface ReelShelfRenderer {
    title: Title7
    button: Button
    items: Item4[]
    trackingParams: string
    icon: Icon12
}

export interface Title7 {
    simpleText: string
}

export interface Button {
    menuRenderer: MenuRenderer3
}

export interface MenuRenderer3 {
    items: Item3[]
    trackingParams: string
    accessibility: Accessibility11
}

export interface Item3 {
    menuNavigationItemRenderer: MenuNavigationItemRenderer
}

export interface MenuNavigationItemRenderer {
    text: Text8
    icon: Icon11
    navigationEndpoint: NavigationEndpoint8
    trackingParams: string
    accessibility: Accessibility10
}

export interface Text8 {
    runs: Run34[]
}

export interface Run34 {
    text: string
}

export interface Icon11 {
    iconType: string
}

export interface NavigationEndpoint8 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata24
    userFeedbackEndpoint: UserFeedbackEndpoint
}

export interface CommandMetadata24 {
    webCommandMetadata: WebCommandMetadata24
}

export interface WebCommandMetadata24 {
    ignoreNavigation: boolean
}

export interface UserFeedbackEndpoint {
    additionalDatas: AdditionalData[]
}

export interface AdditionalData {
    userFeedbackEndpointProductSpecificValueData: UserFeedbackEndpointProductSpecificValueData
}

export interface UserFeedbackEndpointProductSpecificValueData {
    key: string
    value: string
}

export interface Accessibility10 {
    accessibilityData: AccessibilityData22
}

export interface AccessibilityData22 {
    label: string
}

export interface Accessibility11 {
    accessibilityData: AccessibilityData23
}

export interface AccessibilityData23 {
    label: string
}

export interface Item4 {
    shortsLockupViewModel: ShortsLockupViewModel
}

export interface ShortsLockupViewModel {
    entityId: string
    accessibilityText: string
    thumbnail: Thumbnail7
    onTap: OnTap2
    inlinePlayerData: InlinePlayerData
    menuOnTap: MenuOnTap
    indexInCollection: number
    menuOnTapA11yLabel: string
    overlayMetadata: OverlayMetadata
    loggingDirectives: LoggingDirectives2
    badge?: Badge2
}

export interface Thumbnail7 {
    sources: Source2[]
}

export interface Source2 {
    url: string
    width: number
    height: number
}

export interface OnTap2 {
    innertubeCommand: InnertubeCommand2
}

export interface InnertubeCommand2 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata25
    reelWatchEndpoint: ReelWatchEndpoint
}

export interface CommandMetadata25 {
    webCommandMetadata: WebCommandMetadata25
}

export interface WebCommandMetadata25 {
    url: string
    webPageType: string
    rootVe: number
}

export interface ReelWatchEndpoint {
    videoId: string
    playerParams: string
    thumbnail: Thumbnail8
    overlay: Overlay
    params: string
    sequenceProvider: string
    sequenceParams: string
    loggingContext: LoggingContext
    ustreamerConfig: string
}

export interface Thumbnail8 {
    thumbnails: Thumbnail9[]
    isOriginalAspectRatio: boolean
}

export interface Thumbnail9 {
    url: string
    width: number
    height: number
}

export interface Overlay {
    reelPlayerOverlayRenderer: ReelPlayerOverlayRenderer
}

export interface ReelPlayerOverlayRenderer {
    style: string
    trackingParams: string
    reelPlayerNavigationModel: string
}

export interface LoggingContext {
    vssLoggingContext: VssLoggingContext
    qoeLoggingContext: QoeLoggingContext
}

export interface VssLoggingContext {
    serializedContextData: string
}

export interface QoeLoggingContext {
    serializedContextData: string
}

export interface InlinePlayerData {
    onVisible: OnVisible
}

export interface OnVisible {
    innertubeCommand: InnertubeCommand3
}

export interface InnertubeCommand3 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata26
    watchEndpoint: WatchEndpoint3
}

export interface CommandMetadata26 {
    webCommandMetadata: WebCommandMetadata26
}

export interface WebCommandMetadata26 {
    url: string
    webPageType: string
    rootVe: number
}

export interface WatchEndpoint3 {
    videoId: string
    playerParams: string
    playerExtraUrlParams: PlayerExtraUrlParam2[]
    watchEndpointSupportedOnesieConfig: WatchEndpointSupportedOnesieConfig3
}

export interface PlayerExtraUrlParam2 {
    key: string
    value: string
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

export interface MenuOnTap {
    innertubeCommand: InnertubeCommand4
}

export interface InnertubeCommand4 {
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
    content: Content2
}

export interface Content2 {
    listViewModel: ListViewModel
}

export interface ListViewModel {
    listItems: ListItem[]
}

export interface ListItem {
    listItemViewModel: ListItemViewModel
}

export interface ListItemViewModel {
    title: Title8
    leadingImage: LeadingImage
    rendererContext: RendererContext2
}

export interface Title8 {
    content: string
}

export interface LeadingImage {
    sources: Source3[]
}

export interface Source3 {
    clientResource: ClientResource
}

export interface ClientResource {
    imageName: string
}

export interface RendererContext2 {
    loggingContext?: LoggingContext2
    commandContext: CommandContext2
}

export interface LoggingContext2 {
    loggingDirectives: LoggingDirectives
}

export interface LoggingDirectives {
    trackingParams: string
    enableDisplayloggerExperiment: boolean
}

export interface CommandContext2 {
    onTap: OnTap3
}

export interface OnTap3 {
    innertubeCommand: InnertubeCommand5
}

export interface InnertubeCommand5 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata27
    signalServiceEndpoint?: SignalServiceEndpoint10
    getReportFormEndpoint?: GetReportFormEndpoint2
    userFeedbackEndpoint?: UserFeedbackEndpoint2
}

export interface CommandMetadata27 {
    webCommandMetadata: WebCommandMetadata27
}

export interface WebCommandMetadata27 {
    sendPost?: boolean
    apiUrl?: string
    ignoreNavigation?: boolean
}

export interface SignalServiceEndpoint10 {
    signal: string
    actions: Action12[]
}

export interface Action12 {
    clickTrackingParams: string
    addToPlaylistCommand: AddToPlaylistCommand3
}

export interface AddToPlaylistCommand3 {
    openMiniplayer: boolean
    videoId: string
    listType: string
    onCreateListCommand: OnCreateListCommand3
    videoIds: string[]
}

export interface OnCreateListCommand3 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata28
    createPlaylistServiceEndpoint: CreatePlaylistServiceEndpoint3
}

export interface CommandMetadata28 {
    webCommandMetadata: WebCommandMetadata28
}

export interface WebCommandMetadata28 {
    sendPost: boolean
    apiUrl: string
}

export interface CreatePlaylistServiceEndpoint3 {
    videoIds: string[]
    params: string
}

export interface GetReportFormEndpoint2 {
    params: string
}

export interface UserFeedbackEndpoint2 {
    additionalDatas: AdditionalData2[]
}

export interface AdditionalData2 {
    userFeedbackEndpointProductSpecificValueData: UserFeedbackEndpointProductSpecificValueData2
}

export interface UserFeedbackEndpointProductSpecificValueData2 {
    key: string
    value: string
}

export interface OverlayMetadata {
    primaryText: PrimaryText
    secondaryText: SecondaryText
}

export interface PrimaryText {
    content: string
}

export interface SecondaryText {
    content: string
}

export interface LoggingDirectives2 {
    trackingParams: string
    visibility: Visibility
    enableDisplayloggerExperiment: boolean
}

export interface Visibility {
    types: string
}

export interface Badge2 {
    badgeViewModel: BadgeViewModel
}

export interface BadgeViewModel {
    badgeText: string
    badgeStyle: string
    trackingParams: string
    accessibilityLabel: string
    loggingDirectives: LoggingDirectives3
}

export interface LoggingDirectives3 {
    trackingParams: string
    visibility: Visibility2
    enableDisplayloggerExperiment: boolean
}

export interface Visibility2 {
    types: string
}

export interface Icon12 {
    iconType: string
}

export interface ContinuationItemRenderer {
    trigger: string
    continuationEndpoint: ContinuationEndpoint
    loggingDirectives: LoggingDirectives4
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

export interface LoggingDirectives4 {
    trackingParams: string
}
