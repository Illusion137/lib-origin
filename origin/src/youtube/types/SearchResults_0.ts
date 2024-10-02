export interface SearchResults_0 {
    responseContext: ResponseContext
    estimatedResults: string
    contents: Contents
    trackingParams: string
    header: Header2
    topbar: Topbar
    refinements: string[]
    onResponseReceivedCommands: OnResponseReceivedCommand[]
    targetId: string
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
    loggedOut: boolean
    trackingParam: string
}

export interface WebResponseContextExtensionData {
    ytConfigData: YtConfigData
    hasDecorated: boolean
}

export interface YtConfigData {
    visitorData: string
    rootVisualElementType: number
}

export interface Contents {
    twoColumnSearchResultsRenderer: TwoColumnSearchResultsRenderer
}

export interface TwoColumnSearchResultsRenderer {
    primaryContents: PrimaryContents
}

export interface PrimaryContents {
    sectionListRenderer: SectionListRenderer
}

export interface SectionListRenderer {
    contents: Content[]
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
    videoRenderer: VideoRenderer
    adSlotRenderer: AdSlotRenderer
    radioRenderer: RadioRenderer
    channelRenderer: ChannelRenderer
    reelShelfRenderer: ReelShelfRenderer
    shelfRenderer: ShelfRenderer
}

export interface VideoRenderer {
    videoId: string
    thumbnail: Thumbnail
    title: Title
    longBylineText: LongBylineText
    lengthText: LengthText
    viewCountText: ViewCountText
    navigationEndpoint: NavigationEndpoint2
    ownerText: OwnerText
    shortBylineText: ShortBylineText
    trackingParams: string
    showActionMenu: boolean
    shortViewCountText: ShortViewCountText
    menu: Menu
    channelThumbnailSupportedRenderers: ChannelThumbnailSupportedRenderers
    thumbnailOverlays: ThumbnailOverlay[]
    detailedMetadataSnippets: DetailedMetadataSnippet[]
    inlinePlaybackEndpoint: InlinePlaybackEndpoint
    searchVideoResultEntityKey: string
    avatar: Avatar
    publishedTimeText?: PublishedTimeText
    ownerBadges?: OwnerBadge[]
    badges?: Badge[]
    richThumbnail?: RichThumbnail
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
    accessibility: Accessibility
}

export interface Run {
    text: string
}

export interface Accessibility {
    accessibilityData: AccessibilityData
}

export interface AccessibilityData {
    label: string
}

export interface LongBylineText {
    runs: Run2[]
}

export interface Run2 {
    text: string
    navigationEndpoint: NavigationEndpoint
}

export interface NavigationEndpoint {
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

export interface LengthText {
    accessibility: Accessibility2
    simpleText: string
}

export interface Accessibility2 {
    accessibilityData: AccessibilityData2
}

export interface AccessibilityData2 {
    label: string
}

export interface ViewCountText {
    simpleText: string
}

export interface NavigationEndpoint2 {
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

export interface OwnerText {
    runs: Run3[]
}

export interface Run3 {
    text: string
    navigationEndpoint: NavigationEndpoint3
}

export interface NavigationEndpoint3 {
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

export interface ShortBylineText {
    runs: Run4[]
}

export interface Run4 {
    text: string
    navigationEndpoint: NavigationEndpoint4
}

export interface NavigationEndpoint4 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata4
    browseEndpoint: BrowseEndpoint3
}

export interface CommandMetadata4 {
    webCommandMetadata: WebCommandMetadata4
}

export interface WebCommandMetadata4 {
    url: string
    webPageType: string
    rootVe: number
    apiUrl: string
}

export interface BrowseEndpoint3 {
    browseId: string
    canonicalBaseUrl: string
}

export interface ShortViewCountText {
    accessibility: Accessibility3
    simpleText: string
}

export interface Accessibility3 {
    accessibilityData: AccessibilityData3
}

export interface AccessibilityData3 {
    label: string
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
    menuServiceItemRenderer?: MenuServiceItemRenderer
    menuServiceItemDownloadRenderer?: MenuServiceItemDownloadRenderer
}

export interface MenuServiceItemRenderer {
    text: Text
    icon: Icon
    serviceEndpoint: ServiceEndpoint
    trackingParams: string
    hasSeparator?: boolean
}

export interface Text {
    runs: Run5[]
}

export interface Run5 {
    text: string
}

export interface Icon {
    iconType: string
}

export interface ServiceEndpoint {
    clickTrackingParams: string
    commandMetadata: CommandMetadata5
    shareEntityServiceEndpoint?: ShareEntityServiceEndpoint
    signalServiceEndpoint?: SignalServiceEndpoint
}

export interface CommandMetadata5 {
    webCommandMetadata: WebCommandMetadata5
}

export interface WebCommandMetadata5 {
    sendPost: boolean
    apiUrl?: string
}

export interface ShareEntityServiceEndpoint {
    serializedShareEntity: string
    commands: Command[]
}

export interface Command {
    clickTrackingParams: string
    openPopupAction: OpenPopupAction
}

export interface OpenPopupAction {
    popup: Popup
    popupType: string
    beReused: boolean
}

export interface Popup {
    unifiedSharePanelRenderer: UnifiedSharePanelRenderer
}

export interface UnifiedSharePanelRenderer {
    trackingParams: string
    showLoadingSpinner: boolean
}

export interface SignalServiceEndpoint {
    signal: string
    actions: Action[]
}

export interface Action {
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
    commandMetadata: CommandMetadata6
    create_playlistServiceEndpoint: create_playlistServiceEndpoint
}

export interface CommandMetadata6 {
    webCommandMetadata: WebCommandMetadata6
}

export interface WebCommandMetadata6 {
    sendPost: boolean
    apiUrl: string
}

export interface create_playlistServiceEndpoint {
    videoIds: string[]
    params: string
}

export interface MenuServiceItemDownloadRenderer {
    serviceEndpoint: ServiceEndpoint2
    trackingParams: string
}

export interface ServiceEndpoint2 {
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

export interface Accessibility4 {
    accessibilityData: AccessibilityData4
}

export interface AccessibilityData4 {
    label: string
}

export interface ChannelThumbnailSupportedRenderers {
    channelThumbnailWithLinkRenderer: ChannelThumbnailWithLinkRenderer
}

export interface ChannelThumbnailWithLinkRenderer {
    thumbnail: Thumbnail3
    navigationEndpoint: NavigationEndpoint5
    accessibility: Accessibility5
}

export interface Thumbnail3 {
    thumbnails: Thumbnail4[]
}

export interface Thumbnail4 {
    url: string
    width: number
    height: number
}

export interface NavigationEndpoint5 {
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
    canonicalBaseUrl?: string
}

export interface Accessibility5 {
    accessibilityData: AccessibilityData5
}

export interface AccessibilityData5 {
    label: string
}

export interface ThumbnailOverlay {
    thumbnailOverlayTimeStatusRenderer?: ThumbnailOverlayTimeStatusRenderer
    thumbnailOverlayToggleButtonRenderer?: ThumbnailOverlayToggleButtonRenderer
    thumbnailOverlayNowPlayingRenderer?: ThumbnailOverlayNowPlayingRenderer
    thumbnailOverlayLoadingPreviewRenderer?: ThumbnailOverlayLoadingPreviewRenderer
}

export interface ThumbnailOverlayTimeStatusRenderer {
    text: Text2
    style: string
}

export interface Text2 {
    accessibility: Accessibility6
    simpleText: string
}

export interface Accessibility6 {
    accessibilityData: AccessibilityData6
}

export interface AccessibilityData6 {
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
    commandMetadata: CommandMetadata8
    signalServiceEndpoint?: SignalServiceEndpoint2
    playlistEditEndpoint?: PlaylistEditEndpoint
}

export interface CommandMetadata8 {
    webCommandMetadata: WebCommandMetadata8
}

export interface WebCommandMetadata8 {
    sendPost: boolean
    apiUrl?: string
}

export interface SignalServiceEndpoint2 {
    signal: string
    actions: Action2[]
}

export interface Action2 {
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
    commandMetadata: CommandMetadata9
    create_playlistServiceEndpoint: create_playlistServiceEndpoint2
}

export interface CommandMetadata9 {
    webCommandMetadata: WebCommandMetadata9
}

export interface WebCommandMetadata9 {
    sendPost: boolean
    apiUrl: string
}

export interface create_playlistServiceEndpoint2 {
    videoIds: string[]
    params: string
}

export interface PlaylistEditEndpoint {
    playlistId: string
    actions: Action3[]
}

export interface Action3 {
    addedVideoId: string
    action: string
}

export interface UntoggledAccessibility {
    accessibilityData: AccessibilityData7
}

export interface AccessibilityData7 {
    label: string
}

export interface ToggledAccessibility {
    accessibilityData: AccessibilityData8
}

export interface AccessibilityData8 {
    label: string
}

export interface ToggledServiceEndpoint {
    clickTrackingParams: string
    commandMetadata: CommandMetadata10
    playlistEditEndpoint: PlaylistEditEndpoint2
}

export interface CommandMetadata10 {
    webCommandMetadata: WebCommandMetadata10
}

export interface WebCommandMetadata10 {
    sendPost: boolean
    apiUrl: string
}

export interface PlaylistEditEndpoint2 {
    playlistId: string
    actions: Action4[]
}

export interface Action4 {
    action: string
    removedVideoId: string
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

export interface ThumbnailOverlayLoadingPreviewRenderer {
    text: Text4
}

export interface Text4 {
    runs: Run7[]
}

export interface Run7 {
    text: string
}

export interface DetailedMetadataSnippet {
    snippetText: SnippetText
    snippetHoverText: SnippetHoverText
    maxOneLine: boolean
}

export interface SnippetText {
    runs: Run8[]
}

export interface Run8 {
    text: string
    bold?: boolean
}

export interface SnippetHoverText {
    runs: Run9[]
}

export interface Run9 {
    text: string
}

export interface InlinePlaybackEndpoint {
    clickTrackingParams: string
    commandMetadata: CommandMetadata11
    watchEndpoint: WatchEndpoint2
}

export interface CommandMetadata11 {
    webCommandMetadata: WebCommandMetadata11
}

export interface WebCommandMetadata11 {
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

export interface Avatar {
    decoratedAvatarViewModel: DecoratedAvatarViewModel
}

export interface DecoratedAvatarViewModel {
    avatar: Avatar2
    a11yLabel: string
    rendererContext: RendererContext
}

export interface Avatar2 {
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
    commandMetadata: CommandMetadata12
    browseEndpoint: BrowseEndpoint5
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

export interface BrowseEndpoint5 {
    browseId: string
    canonicalBaseUrl?: string
}

export interface PublishedTimeText {
    simpleText: string
}

export interface OwnerBadge {
    metadataBadgeRenderer: MetadataBadgeRenderer
}

export interface MetadataBadgeRenderer {
    icon: Icon2
    style: string
    tooltip: string
    trackingParams: string
    accessibilityData: AccessibilityData9
}

export interface Icon2 {
    iconType: string
}

export interface AccessibilityData9 {
    label: string
}

export interface Badge {
    metadataBadgeRenderer: MetadataBadgeRenderer2
}

export interface MetadataBadgeRenderer2 {
    style: string
    label: string
    trackingParams: string
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
    thumbnails: Thumbnail5[]
    logAsMovingThumbnail: boolean
}

export interface Thumbnail5 {
    url: string
    width: number
    height: number
}

export interface AdSlotRenderer {
    adSlotMetadata: AdSlotMetadata
    fulfillmentContent: FulfillmentContent
    enablePacfLoggingWeb: boolean
    trackingParams: string
}

export interface AdSlotMetadata {
    slotId: string
    slotType: string
    slotPhysicalPosition: number
    adSlotLoggingData: AdSlotLoggingData
}

export interface AdSlotLoggingData {
    serializedSlotAdServingDataEntry: string
}

export interface FulfillmentContent {
    fulfilledLayout: FulfilledLayout
}

export interface FulfilledLayout {
    inFeedAdLayoutRenderer: InFeedAdLayoutRenderer
}

export interface InFeedAdLayoutRenderer {
    adLayoutMetadata: AdLayoutMetadata
    renderingContent: RenderingContent
}

export interface AdLayoutMetadata {
    layoutId: string
    layoutType: string
    adLayoutLoggingData: AdLayoutLoggingData
}

export interface AdLayoutLoggingData {
    serializedAdServingDataEntry: string
}

export interface RenderingContent {
    promotedSparklesWebRenderer: PromotedSparklesWebRenderer
}

export interface PromotedSparklesWebRenderer {
    thumbnail: Thumbnail6
    title: Title2
    description: Description
    websiteText: WebsiteText
    navigationEndpoint: NavigationEndpoint6
    impressionCommands: ImpressionCommand[]
    menu: Menu2
    activeView: ActiveView
    trackingParams: string
    clickLocationTargets: ClickLocationTarget[]
    mediaHoverOverlay: MediaHoverOverlay
    mediaBadge: MediaBadge
    promotedSparklesWebStyle: string
    isSquareThumbnail: boolean
    thumbnailNavigationEndpoint: ThumbnailNavigationEndpoint
    adBadge: AdBadge
}

export interface Thumbnail6 {
    thumbnails: Thumbnail7[]
}

export interface Thumbnail7 {
    url: string
    width: number
    height: number
}

export interface Title2 {
    simpleText: string
}

export interface Description {
    simpleText: string
}

export interface WebsiteText {
    simpleText: string
}

export interface NavigationEndpoint6 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata13
    urlEndpoint: UrlEndpoint
}

export interface CommandMetadata13 {
    webCommandMetadata: WebCommandMetadata13
}

export interface WebCommandMetadata13 {
    url: string
    webPageType: string
    rootVe: number
}

export interface UrlEndpoint {
    url: string
    target: string
    attributionSrcMode: string
}

export interface ImpressionCommand {
    clickTrackingParams: string
    loggingUrls: LoggingUrl[]
    pingingEndpoint: PingingEndpoint
}

export interface LoggingUrl {
    baseUrl: string
}

export interface PingingEndpoint {
    hack: boolean
}

export interface Menu2 {
    menuRenderer: MenuRenderer2
}

export interface MenuRenderer2 {
    trackingParams: string
    isDisabled: boolean
    disabledCommand: DisabledCommand
}

export interface DisabledCommand {
    clickTrackingParams: string
    openPopupAction: OpenPopupAction2
}

export interface OpenPopupAction2 {
    popup: Popup2
    popupType: string
    accessibilityData: AccessibilityData10
}

export interface Popup2 {
    aboutThisAdRenderer: AboutThisAdRenderer
}

export interface AboutThisAdRenderer {
    url: Url
    trackingParams: string
}

export interface Url {
    privateDoNotAccessOrElseTrustedResourceUrlWrappedValue: string
}

export interface AccessibilityData10 {
    accessibilityData: AccessibilityData11
}

export interface AccessibilityData11 {
    label: string
}

export interface ActiveView {
    viewableCommands: ViewableCommand[]
    endOfSessionCommands: EndOfSessionCommand[]
    regexUriMacroValidator: RegexUriMacroValidator
}

export interface ViewableCommand {
    clickTrackingParams: string
    loggingUrls: LoggingUrl2[]
    pingingEndpoint: PingingEndpoint2
}

export interface LoggingUrl2 {
    baseUrl: string
}

export interface PingingEndpoint2 {
    hack: boolean
}

export interface EndOfSessionCommand {
    clickTrackingParams: string
    loggingUrls: LoggingUrl3[]
    pingingEndpoint: PingingEndpoint3
}

export interface LoggingUrl3 {
    baseUrl: string
}

export interface PingingEndpoint3 {
    hack: boolean
}

export interface RegexUriMacroValidator {
    emptyMap: boolean
}

export interface ClickLocationTarget {
    location: string
    code: number
    behaviorType: string
}

export interface MediaHoverOverlay {
    buttonRenderer: ButtonRenderer
}

export interface ButtonRenderer {
    style: string
    text: Text5
    icon: Icon3
    trackingParams: string
    iconPosition: string
}

export interface Text5 {
    simpleText: string
}

export interface Icon3 {
    iconType: string
}

export interface MediaBadge {
    metadataBadgeRenderer: MetadataBadgeRenderer3
}

export interface MetadataBadgeRenderer3 {
    icon: Icon4
    style: string
    trackingParams: string
}

export interface Icon4 {
    iconType: string
}

export interface ThumbnailNavigationEndpoint {
    clickTrackingParams: string
    commandMetadata: CommandMetadata14
    urlEndpoint: UrlEndpoint2
}

export interface CommandMetadata14 {
    webCommandMetadata: WebCommandMetadata14
}

export interface WebCommandMetadata14 {
    url: string
    webPageType: string
    rootVe: number
}

export interface UrlEndpoint2 {
    url: string
    target: string
    attributionSrcMode: string
}

export interface AdBadge {
    metadataBadgeRenderer: MetadataBadgeRenderer4
}

export interface MetadataBadgeRenderer4 {
    style: string
    label: string
    trackingParams: string
}

export interface RadioRenderer {
    playlistId: string
    title: Title3
    thumbnail: Thumbnail8
    videoCountText: VideoCountText
    navigationEndpoint: NavigationEndpoint7
    trackingParams: string
    videos: Video[]
    thumbnailText: ThumbnailText
    longBylineText: LongBylineText2
    thumbnailOverlays: ThumbnailOverlay2[]
    videoCountShortText: VideoCountShortText
    thumbnailRenderer: ThumbnailRenderer
}

export interface Title3 {
    simpleText: string
}

export interface Thumbnail8 {
    thumbnails: Thumbnail9[]
    sampledThumbnailColor: SampledThumbnailColor
    darkColorPalette: DarkColorPalette
    vibrantColorPalette: VibrantColorPalette
}

export interface Thumbnail9 {
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

export interface VideoCountText {
    runs: Run10[]
}

export interface Run10 {
    text: string
}

export interface NavigationEndpoint7 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata15
    watchEndpoint: WatchEndpoint3
}

export interface CommandMetadata15 {
    webCommandMetadata: WebCommandMetadata15
}

export interface WebCommandMetadata15 {
    url: string
    webPageType: string
    rootVe: number
}

export interface WatchEndpoint3 {
    videoId: string
    playlistId: string
    params: string
    continuePlayback: boolean
    loggingContext: LoggingContext
    watchEndpointSupportedOnesieConfig: WatchEndpointSupportedOnesieConfig3
}

export interface LoggingContext {
    vssLoggingContext: VssLoggingContext
}

export interface VssLoggingContext {
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

export interface Video {
    childVideoRenderer: ChildVideoRenderer
}

export interface ChildVideoRenderer {
    title: Title4
    navigationEndpoint: NavigationEndpoint8
    lengthText: LengthText2
    videoId: string
}

export interface Title4 {
    simpleText: string
}

export interface NavigationEndpoint8 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata16
    watchEndpoint: WatchEndpoint4
}

export interface CommandMetadata16 {
    webCommandMetadata: WebCommandMetadata16
}

export interface WebCommandMetadata16 {
    url: string
    webPageType: string
    rootVe: number
}

export interface WatchEndpoint4 {
    videoId: string
    playlistId: string
    params: string
    loggingContext: LoggingContext2
    watchEndpointSupportedOnesieConfig: WatchEndpointSupportedOnesieConfig4
}

export interface LoggingContext2 {
    vssLoggingContext: VssLoggingContext2
}

export interface VssLoggingContext2 {
    serializedContextData: string
}

export interface WatchEndpointSupportedOnesieConfig4 {
    html5PlaybackOnesieConfig: Html5PlaybackOnesieConfig4
}

export interface Html5PlaybackOnesieConfig4 {
    commonConfig: CommonConfig4
}

export interface CommonConfig4 {
    url: string
}

export interface LengthText2 {
    accessibility: Accessibility7
    simpleText: string
}

export interface Accessibility7 {
    accessibilityData: AccessibilityData12
}

export interface AccessibilityData12 {
    label: string
}

export interface ThumbnailText {
    runs: Run11[]
}

export interface Run11 {
    text: string
    bold?: boolean
}

export interface LongBylineText2 {
    simpleText: string
}

export interface ThumbnailOverlay2 {
    thumbnailOverlayBottomPanelRenderer?: ThumbnailOverlayBottomPanelRenderer
    thumbnailOverlayHoverTextRenderer?: ThumbnailOverlayHoverTextRenderer
    thumbnailOverlayNowPlayingRenderer?: ThumbnailOverlayNowPlayingRenderer2
}

export interface ThumbnailOverlayBottomPanelRenderer {
    text: Text6
    icon: Icon5
}

export interface Text6 {
    simpleText: string
}

export interface Icon5 {
    iconType: string
}

export interface ThumbnailOverlayHoverTextRenderer {
    text: Text7
    icon: Icon6
}

export interface Text7 {
    runs: Run12[]
}

export interface Run12 {
    text: string
}

export interface Icon6 {
    iconType: string
}

export interface ThumbnailOverlayNowPlayingRenderer2 {
    text: Text8
}

export interface Text8 {
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

export interface ThumbnailRenderer {
    playlistVideoThumbnailRenderer: PlaylistVideoThumbnailRenderer
}

export interface PlaylistVideoThumbnailRenderer {
    thumbnail: Thumbnail10
    trackingParams: string
}

export interface Thumbnail10 {
    thumbnails: Thumbnail11[]
}

export interface Thumbnail11 {
    url: string
    width: number
    height: number
}

export interface ChannelRenderer {
    channelId: string
    title: Title5
    navigationEndpoint: NavigationEndpoint9
    thumbnail: Thumbnail12
    descriptionSnippet: DescriptionSnippet
    shortBylineText: ShortBylineText2
    videoCountText: VideoCountText2
    subscriptionButton: SubscriptionButton
    subscriberCountText: SubscriberCountText
    subscribeButton: SubscribeButton
    trackingParams: string
    longBylineText: LongBylineText3
}

export interface Title5 {
    simpleText: string
}

export interface NavigationEndpoint9 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata17
    browseEndpoint: BrowseEndpoint6
}

export interface CommandMetadata17 {
    webCommandMetadata: WebCommandMetadata17
}

export interface WebCommandMetadata17 {
    url: string
    webPageType: string
    rootVe: number
    apiUrl: string
}

export interface BrowseEndpoint6 {
    browseId: string
    canonicalBaseUrl: string
}

export interface Thumbnail12 {
    thumbnails: Thumbnail13[]
}

export interface Thumbnail13 {
    url: string
    width: number
    height: number
}

export interface DescriptionSnippet {
    runs: Run15[]
}

export interface Run15 {
    text: string
    bold?: boolean
}

export interface ShortBylineText2 {
    runs: Run16[]
}

export interface Run16 {
    text: string
    navigationEndpoint: NavigationEndpoint10
}

export interface NavigationEndpoint10 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata18
    browseEndpoint: BrowseEndpoint7
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

export interface BrowseEndpoint7 {
    browseId: string
    canonicalBaseUrl: string
}

export interface VideoCountText2 {
    accessibility: Accessibility8
    simpleText: string
}

export interface Accessibility8 {
    accessibilityData: AccessibilityData13
}

export interface AccessibilityData13 {
    label: string
}

export interface SubscriptionButton {
    subscribed: boolean
}

export interface SubscriberCountText {
    simpleText: string
}

export interface SubscribeButton {
    buttonRenderer: ButtonRenderer2
}

export interface ButtonRenderer2 {
    style: string
    size: string
    isDisabled: boolean
    text: Text9
    navigationEndpoint: NavigationEndpoint11
    trackingParams: string
}

export interface Text9 {
    runs: Run17[]
}

export interface Run17 {
    text: string
}

export interface NavigationEndpoint11 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata19
    signInEndpoint: SignInEndpoint
}

export interface CommandMetadata19 {
    webCommandMetadata: WebCommandMetadata19
}

export interface WebCommandMetadata19 {
    url: string
    webPageType: string
    rootVe: number
}

export interface SignInEndpoint {
    nextEndpoint: NextEndpoint
    continueAction: string
}

export interface NextEndpoint {
    clickTrackingParams: string
    commandMetadata: CommandMetadata20
    searchEndpoint: SearchEndpoint
}

export interface CommandMetadata20 {
    webCommandMetadata: WebCommandMetadata20
}

export interface WebCommandMetadata20 {
    url: string
    webPageType: string
    rootVe: number
}

export interface SearchEndpoint {
    query: string
}

export interface LongBylineText3 {
    runs: Run18[]
}

export interface Run18 {
    text: string
    navigationEndpoint: NavigationEndpoint12
}

export interface NavigationEndpoint12 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata21
    browseEndpoint: BrowseEndpoint8
}

export interface CommandMetadata21 {
    webCommandMetadata: WebCommandMetadata21
}

export interface WebCommandMetadata21 {
    url: string
    webPageType: string
    rootVe: number
    apiUrl: string
}

export interface BrowseEndpoint8 {
    browseId: string
    canonicalBaseUrl: string
}

export interface ReelShelfRenderer {
    title: Title6
    button: Button
    items: Item3[]
    trackingParams: string
    icon: Icon9
}

export interface Title6 {
    simpleText: string
}

export interface Button {
    menuRenderer: MenuRenderer3
}

export interface MenuRenderer3 {
    items: Item2[]
    trackingParams: string
    accessibility: Accessibility10
}

export interface Item2 {
    menuNavigationItemRenderer: MenuNavigationItemRenderer
}

export interface MenuNavigationItemRenderer {
    text: Text10
    icon: Icon7
    navigationEndpoint: NavigationEndpoint13
    trackingParams: string
    accessibility: Accessibility9
}

export interface Text10 {
    runs: Run19[]
}

export interface Run19 {
    text: string
}

export interface Icon7 {
    iconType: string
}

export interface NavigationEndpoint13 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata22
    userFeedbackEndpoint: UserFeedbackEndpoint
}

export interface CommandMetadata22 {
    webCommandMetadata: WebCommandMetadata22
}

export interface WebCommandMetadata22 {
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

export interface Accessibility9 {
    accessibilityData: AccessibilityData14
}

export interface AccessibilityData14 {
    label: string
}

export interface Accessibility10 {
    accessibilityData: AccessibilityData15
}

export interface AccessibilityData15 {
    label: string
}

export interface Item3 {
    reelItemRenderer: ReelItemRenderer
}

export interface ReelItemRenderer {
    videoId: string
    headline: Headline
    thumbnail: Thumbnail14
    viewCountText: ViewCountText2
    navigationEndpoint: NavigationEndpoint14
    menu: Menu3
    trackingParams: string
    accessibility: Accessibility14
    style: string
    videoType: string
    inlinePlaybackEndpoint: InlinePlaybackEndpoint2
    loggingDirectives: LoggingDirectives
    badge?: Badge2
}

export interface Headline {
    simpleText: string
}

export interface Thumbnail14 {
    thumbnails: Thumbnail15[]
    isOriginalAspectRatio: boolean
}

export interface Thumbnail15 {
    url: string
    width: number
    height: number
}

export interface ViewCountText2 {
    accessibility: Accessibility11
    simpleText: string
}

export interface Accessibility11 {
    accessibilityData: AccessibilityData16
}

export interface AccessibilityData16 {
    label: string
}

export interface NavigationEndpoint14 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata23
    reelWatchEndpoint: ReelWatchEndpoint
}

export interface CommandMetadata23 {
    webCommandMetadata: WebCommandMetadata23
}

export interface WebCommandMetadata23 {
    url: string
    webPageType: string
    rootVe: number
}

export interface ReelWatchEndpoint {
    videoId: string
    playerParams: string
    thumbnail: Thumbnail16
    overlay: Overlay
    params: string
    sequenceProvider: string
    sequenceParams: string
    loggingContext: LoggingContext3
    ustreamerConfig: string
}

export interface Thumbnail16 {
    thumbnails: Thumbnail17[]
    isOriginalAspectRatio: boolean
}

export interface Thumbnail17 {
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

export interface LoggingContext3 {
    vssLoggingContext: VssLoggingContext3
    qoeLoggingContext: QoeLoggingContext
}

export interface VssLoggingContext3 {
    serializedContextData: string
}

export interface QoeLoggingContext {
    serializedContextData: string
}

export interface Menu3 {
    menuRenderer: MenuRenderer4
}

export interface MenuRenderer4 {
    items: Item4[]
    trackingParams: string
    accessibility: Accessibility13
}

export interface Item4 {
    menuNavigationItemRenderer: MenuNavigationItemRenderer2
}

export interface MenuNavigationItemRenderer2 {
    text: Text11
    icon: Icon8
    navigationEndpoint: NavigationEndpoint15
    trackingParams: string
    accessibility: Accessibility12
}

export interface Text11 {
    runs: Run20[]
}

export interface Run20 {
    text: string
}

export interface Icon8 {
    iconType: string
}

export interface NavigationEndpoint15 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata24
    userFeedbackEndpoint: UserFeedbackEndpoint2
}

export interface CommandMetadata24 {
    webCommandMetadata: WebCommandMetadata24
}

export interface WebCommandMetadata24 {
    ignoreNavigation: boolean
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

export interface Accessibility12 {
    accessibilityData: AccessibilityData17
}

export interface AccessibilityData17 {
    label: string
}

export interface Accessibility13 {
    accessibilityData: AccessibilityData18
}

export interface AccessibilityData18 {
    label: string
}

export interface Accessibility14 {
    accessibilityData: AccessibilityData19
}

export interface AccessibilityData19 {
    label: string
}

export interface InlinePlaybackEndpoint2 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata25
    watchEndpoint: WatchEndpoint5
}

export interface CommandMetadata25 {
    webCommandMetadata: WebCommandMetadata25
}

export interface WebCommandMetadata25 {
    url: string
    webPageType: string
    rootVe: number
}

export interface WatchEndpoint5 {
    videoId: string
    playerParams: string
    playerExtraUrlParams: PlayerExtraUrlParam2[]
    watchEndpointSupportedOnesieConfig: WatchEndpointSupportedOnesieConfig5
}

export interface PlayerExtraUrlParam2 {
    key: string
    value: string
}

export interface WatchEndpointSupportedOnesieConfig5 {
    html5PlaybackOnesieConfig: Html5PlaybackOnesieConfig5
}

export interface Html5PlaybackOnesieConfig5 {
    commonConfig: CommonConfig5
}

export interface CommonConfig5 {
    url: string
}

export interface LoggingDirectives {
    trackingParams: string
    visibility: Visibility
    enableDisplayloggerExperiment: boolean
}

export interface Visibility {
    types: string
}

export interface Badge2 {
    textBadgeRenderer: TextBadgeRenderer
}

export interface TextBadgeRenderer {
    label: Label
}

export interface Label {
    simpleText: string
}

export interface Icon9 {
    iconType: string
}

export interface ShelfRenderer {
    title: Title7
    content: Content3
    trackingParams: string
}

export interface Title7 {
    simpleText: string
}

export interface Content3 {
    verticalListRenderer: VerticalListRenderer
}

export interface VerticalListRenderer {
    items: Item5[]
    collapsedItemCount: number
    collapsedStateButtonText: CollapsedStateButtonText
    trackingParams: string
}

export interface Item5 {
    videoRenderer: VideoRenderer2
}

export interface VideoRenderer2 {
    videoId: string
    thumbnail: Thumbnail18
    title: Title8
    longBylineText: LongBylineText4
    publishedTimeText?: PublishedTimeText2
    lengthText: LengthText3
    viewCountText: ViewCountText3
    navigationEndpoint: NavigationEndpoint17
    badges?: Badge3[]
    ownerText: OwnerText2
    shortBylineText: ShortBylineText3
    trackingParams: string
    showActionMenu: boolean
    shortViewCountText: ShortViewCountText2
    menu: Menu4
    channelThumbnailSupportedRenderers: ChannelThumbnailSupportedRenderers2
    thumbnailOverlays: ThumbnailOverlay3[]
    richThumbnail?: RichThumbnail2
    detailedMetadataSnippets: DetailedMetadataSnippet2[]
    inlinePlaybackEndpoint: InlinePlaybackEndpoint3
    searchVideoResultEntityKey: string
    avatar: Avatar3
    ownerBadges?: OwnerBadge2[]
    expandableMetadata?: ExpandableMetadata
}

export interface Thumbnail18 {
    thumbnails: Thumbnail19[]
}

export interface Thumbnail19 {
    url: string
    width: number
    height: number
}

export interface Title8 {
    runs: Run21[]
    accessibility: Accessibility15
}

export interface Run21 {
    text: string
}

export interface Accessibility15 {
    accessibilityData: AccessibilityData20
}

export interface AccessibilityData20 {
    label: string
}

export interface LongBylineText4 {
    runs: Run22[]
}

export interface Run22 {
    text: string
    navigationEndpoint: NavigationEndpoint16
}

export interface NavigationEndpoint16 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata26
    browseEndpoint: BrowseEndpoint9
}

export interface CommandMetadata26 {
    webCommandMetadata: WebCommandMetadata26
}

export interface WebCommandMetadata26 {
    url: string
    webPageType: string
    rootVe: number
    apiUrl: string
}

export interface BrowseEndpoint9 {
    browseId: string
    canonicalBaseUrl: string
}

export interface PublishedTimeText2 {
    simpleText: string
}

export interface LengthText3 {
    accessibility: Accessibility16
    simpleText: string
}

export interface Accessibility16 {
    accessibilityData: AccessibilityData21
}

export interface AccessibilityData21 {
    label: string
}

export interface ViewCountText3 {
    simpleText: string
}

export interface NavigationEndpoint17 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata27
    watchEndpoint: WatchEndpoint6
}

export interface CommandMetadata27 {
    webCommandMetadata: WebCommandMetadata27
}

export interface WebCommandMetadata27 {
    url: string
    webPageType: string
    rootVe: number
}

export interface WatchEndpoint6 {
    videoId: string
    playerParams: string
    watchEndpointSupportedOnesieConfig: WatchEndpointSupportedOnesieConfig6
    params?: string
    startTimeSeconds?: number
}

export interface WatchEndpointSupportedOnesieConfig6 {
    html5PlaybackOnesieConfig: Html5PlaybackOnesieConfig6
}

export interface Html5PlaybackOnesieConfig6 {
    commonConfig: CommonConfig6
}

export interface CommonConfig6 {
    url: string
}

export interface Badge3 {
    metadataBadgeRenderer: MetadataBadgeRenderer5
}

export interface MetadataBadgeRenderer5 {
    style: string
    label: string
    trackingParams: string
}

export interface OwnerText2 {
    runs: Run23[]
}

export interface Run23 {
    text: string
    navigationEndpoint: NavigationEndpoint18
}

export interface NavigationEndpoint18 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata28
    browseEndpoint: BrowseEndpoint10
}

export interface CommandMetadata28 {
    webCommandMetadata: WebCommandMetadata28
}

export interface WebCommandMetadata28 {
    url: string
    webPageType: string
    rootVe: number
    apiUrl: string
}

export interface BrowseEndpoint10 {
    browseId: string
    canonicalBaseUrl: string
}

export interface ShortBylineText3 {
    runs: Run24[]
}

export interface Run24 {
    text: string
    navigationEndpoint: NavigationEndpoint19
}

export interface NavigationEndpoint19 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata29
    browseEndpoint: BrowseEndpoint11
}

export interface CommandMetadata29 {
    webCommandMetadata: WebCommandMetadata29
}

export interface WebCommandMetadata29 {
    url: string
    webPageType: string
    rootVe: number
    apiUrl: string
}

export interface BrowseEndpoint11 {
    browseId: string
    canonicalBaseUrl: string
}

export interface ShortViewCountText2 {
    accessibility: Accessibility17
    simpleText: string
}

export interface Accessibility17 {
    accessibilityData: AccessibilityData22
}

export interface AccessibilityData22 {
    label: string
}

export interface Menu4 {
    menuRenderer: MenuRenderer5
}

export interface MenuRenderer5 {
    items: Item6[]
    trackingParams: string
    accessibility: Accessibility18
}

export interface Item6 {
    menuServiceItemRenderer?: MenuServiceItemRenderer2
    menuServiceItemDownloadRenderer?: MenuServiceItemDownloadRenderer2
}

export interface MenuServiceItemRenderer2 {
    text: Text12
    icon: Icon10
    serviceEndpoint: ServiceEndpoint3
    trackingParams: string
    hasSeparator?: boolean
}

export interface Text12 {
    runs: Run25[]
}

export interface Run25 {
    text: string
}

export interface Icon10 {
    iconType: string
}

export interface ServiceEndpoint3 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata30
    shareEntityServiceEndpoint?: ShareEntityServiceEndpoint2
    signalServiceEndpoint?: SignalServiceEndpoint3
}

export interface CommandMetadata30 {
    webCommandMetadata: WebCommandMetadata30
}

export interface WebCommandMetadata30 {
    sendPost: boolean
    apiUrl?: string
}

export interface ShareEntityServiceEndpoint2 {
    serializedShareEntity: string
    commands: Command2[]
}

export interface Command2 {
    clickTrackingParams: string
    openPopupAction: OpenPopupAction3
}

export interface OpenPopupAction3 {
    popup: Popup3
    popupType: string
    beReused: boolean
}

export interface Popup3 {
    unifiedSharePanelRenderer: UnifiedSharePanelRenderer2
}

export interface UnifiedSharePanelRenderer2 {
    trackingParams: string
    showLoadingSpinner: boolean
}

export interface SignalServiceEndpoint3 {
    signal: string
    actions: Action5[]
}

export interface Action5 {
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
    commandMetadata: CommandMetadata31
    create_playlistServiceEndpoint: create_playlistServiceEndpoint3
}

export interface CommandMetadata31 {
    webCommandMetadata: WebCommandMetadata31
}

export interface WebCommandMetadata31 {
    sendPost: boolean
    apiUrl: string
}

export interface create_playlistServiceEndpoint3 {
    videoIds: string[]
    params: string
}

export interface MenuServiceItemDownloadRenderer2 {
    serviceEndpoint: ServiceEndpoint4
    trackingParams: string
}

export interface ServiceEndpoint4 {
    clickTrackingParams: string
    offlineVideoEndpoint: OfflineVideoEndpoint2
}

export interface OfflineVideoEndpoint2 {
    videoId: string
    onAddCommand: OnAddCommand2
}

export interface OnAddCommand2 {
    clickTrackingParams: string
    getDownloadActionCommand: GetDownloadActionCommand2
}

export interface GetDownloadActionCommand2 {
    videoId: string
    params: string
}

export interface Accessibility18 {
    accessibilityData: AccessibilityData23
}

export interface AccessibilityData23 {
    label: string
}

export interface ChannelThumbnailSupportedRenderers2 {
    channelThumbnailWithLinkRenderer: ChannelThumbnailWithLinkRenderer2
}

export interface ChannelThumbnailWithLinkRenderer2 {
    thumbnail: Thumbnail20
    navigationEndpoint: NavigationEndpoint20
    accessibility: Accessibility19
}

export interface Thumbnail20 {
    thumbnails: Thumbnail21[]
}

export interface Thumbnail21 {
    url: string
    width: number
    height: number
}

export interface NavigationEndpoint20 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata32
    browseEndpoint: BrowseEndpoint12
}

export interface CommandMetadata32 {
    webCommandMetadata: WebCommandMetadata32
}

export interface WebCommandMetadata32 {
    url: string
    webPageType: string
    rootVe: number
    apiUrl: string
}

export interface BrowseEndpoint12 {
    browseId: string
    canonicalBaseUrl: string
}

export interface Accessibility19 {
    accessibilityData: AccessibilityData24
}

export interface AccessibilityData24 {
    label: string
}

export interface ThumbnailOverlay3 {
    thumbnailOverlayTimeStatusRenderer?: ThumbnailOverlayTimeStatusRenderer2
    thumbnailOverlayToggleButtonRenderer?: ThumbnailOverlayToggleButtonRenderer2
    thumbnailOverlayNowPlayingRenderer?: ThumbnailOverlayNowPlayingRenderer3
    thumbnailOverlayLoadingPreviewRenderer?: ThumbnailOverlayLoadingPreviewRenderer2
    thumbnailOverlayResumePlaybackRenderer?: ThumbnailOverlayResumePlaybackRenderer
}

export interface ThumbnailOverlayTimeStatusRenderer2 {
    text: Text13
    style: string
}

export interface Text13 {
    accessibility: Accessibility20
    simpleText: string
}

export interface Accessibility20 {
    accessibilityData: AccessibilityData25
}

export interface AccessibilityData25 {
    label: string
}

export interface ThumbnailOverlayToggleButtonRenderer2 {
    untoggledIcon: UntoggledIcon2
    toggledIcon: ToggledIcon2
    untoggledTooltip: string
    toggledTooltip: string
    untoggledServiceEndpoint: UntoggledServiceEndpoint2
    untoggledAccessibility: UntoggledAccessibility2
    toggledAccessibility: ToggledAccessibility2
    trackingParams: string
    isToggled?: boolean
    toggledServiceEndpoint?: ToggledServiceEndpoint2
}

export interface UntoggledIcon2 {
    iconType: string
}

export interface ToggledIcon2 {
    iconType: string
}

export interface UntoggledServiceEndpoint2 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata33
    signalServiceEndpoint?: SignalServiceEndpoint4
    playlistEditEndpoint?: PlaylistEditEndpoint3
}

export interface CommandMetadata33 {
    webCommandMetadata: WebCommandMetadata33
}

export interface WebCommandMetadata33 {
    sendPost: boolean
    apiUrl?: string
}

export interface SignalServiceEndpoint4 {
    signal: string
    actions: Action6[]
}

export interface Action6 {
    clickTrackingParams: string
    addToPlaylistCommand: AddToPlaylistCommand4
}

export interface AddToPlaylistCommand4 {
    openMiniplayer: boolean
    videoId: string
    listType: string
    onCreateListCommand: OnCreateListCommand4
    videoIds: string[]
}

export interface OnCreateListCommand4 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata34
    create_playlistServiceEndpoint: create_playlistServiceEndpoint4
}

export interface CommandMetadata34 {
    webCommandMetadata: WebCommandMetadata34
}

export interface WebCommandMetadata34 {
    sendPost: boolean
    apiUrl: string
}

export interface create_playlistServiceEndpoint4 {
    videoIds: string[]
    params: string
}

export interface PlaylistEditEndpoint3 {
    playlistId: string
    actions: Action7[]
}

export interface Action7 {
    addedVideoId: string
    action: string
}

export interface UntoggledAccessibility2 {
    accessibilityData: AccessibilityData26
}

export interface AccessibilityData26 {
    label: string
}

export interface ToggledAccessibility2 {
    accessibilityData: AccessibilityData27
}

export interface AccessibilityData27 {
    label: string
}

export interface ToggledServiceEndpoint2 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata35
    playlistEditEndpoint: PlaylistEditEndpoint4
}

export interface CommandMetadata35 {
    webCommandMetadata: WebCommandMetadata35
}

export interface WebCommandMetadata35 {
    sendPost: boolean
    apiUrl: string
}

export interface PlaylistEditEndpoint4 {
    playlistId: string
    actions: Action8[]
}

export interface Action8 {
    action: string
    removedVideoId: string
}

export interface ThumbnailOverlayNowPlayingRenderer3 {
    text: Text14
}

export interface Text14 {
    runs: Run26[]
}

export interface Run26 {
    text: string
}

export interface ThumbnailOverlayLoadingPreviewRenderer2 {
    text: Text15
}

export interface Text15 {
    runs: Run27[]
}

export interface Run27 {
    text: string
}

export interface ThumbnailOverlayResumePlaybackRenderer {
    percentDurationWatched: number
}

export interface RichThumbnail2 {
    movingThumbnailRenderer: MovingThumbnailRenderer2
}

export interface MovingThumbnailRenderer2 {
    movingThumbnailDetails: MovingThumbnailDetails2
    enableHoveredLogging: boolean
    enableOverlay: boolean
}

export interface MovingThumbnailDetails2 {
    thumbnails: Thumbnail22[]
    logAsMovingThumbnail: boolean
}

export interface Thumbnail22 {
    url: string
    width: number
    height: number
}

export interface DetailedMetadataSnippet2 {
    snippetText: SnippetText2
    snippetHoverText: SnippetHoverText2
    maxOneLine: boolean
}

export interface SnippetText2 {
    runs: Run28[]
}

export interface Run28 {
    text: string
    bold?: boolean
}

export interface SnippetHoverText2 {
    runs: Run29[]
}

export interface Run29 {
    text: string
}

export interface InlinePlaybackEndpoint3 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata36
    watchEndpoint: WatchEndpoint7
}

export interface CommandMetadata36 {
    webCommandMetadata: WebCommandMetadata36
}

export interface WebCommandMetadata36 {
    url: string
    webPageType: string
    rootVe: number
}

export interface WatchEndpoint7 {
    videoId: string
    playerParams: string
    playerExtraUrlParams: PlayerExtraUrlParam3[]
    watchEndpointSupportedOnesieConfig: WatchEndpointSupportedOnesieConfig7
    startTimeSeconds?: number
}

export interface PlayerExtraUrlParam3 {
    key: string
    value: string
}

export interface WatchEndpointSupportedOnesieConfig7 {
    html5PlaybackOnesieConfig: Html5PlaybackOnesieConfig7
}

export interface Html5PlaybackOnesieConfig7 {
    commonConfig: CommonConfig7
}

export interface CommonConfig7 {
    url: string
}

export interface Avatar3 {
    decoratedAvatarViewModel: DecoratedAvatarViewModel2
}

export interface DecoratedAvatarViewModel2 {
    avatar: Avatar4
    a11yLabel: string
    rendererContext: RendererContext2
}

export interface Avatar4 {
    avatarViewModel: AvatarViewModel2
}

export interface AvatarViewModel2 {
    image: Image2
    avatarImageSize: string
}

export interface Image2 {
    sources: Source2[]
}

export interface Source2 {
    url: string
    width: number
    height: number
}

export interface RendererContext2 {
    commandContext: CommandContext2
}

export interface CommandContext2 {
    onTap: OnTap2
}

export interface OnTap2 {
    innertubeCommand: InnertubeCommand2
}

export interface InnertubeCommand2 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata37
    browseEndpoint: BrowseEndpoint13
}

export interface CommandMetadata37 {
    webCommandMetadata: WebCommandMetadata37
}

export interface WebCommandMetadata37 {
    url: string
    webPageType: string
    rootVe: number
    apiUrl: string
}

export interface BrowseEndpoint13 {
    browseId: string
    canonicalBaseUrl: string
}

export interface OwnerBadge2 {
    metadataBadgeRenderer: MetadataBadgeRenderer6
}

export interface MetadataBadgeRenderer6 {
    icon: Icon11
    style: string
    tooltip: string
    trackingParams: string
    accessibilityData: AccessibilityData28
}

export interface Icon11 {
    iconType: string
}

export interface AccessibilityData28 {
    label: string
}

export interface ExpandableMetadata {
    expandableMetadataRenderer: ExpandableMetadataRenderer
}

export interface ExpandableMetadataRenderer {
    header: Header
    expandedContent: ExpandedContent
    expandButton: ExpandButton
    collapseButton: CollapseButton
    trackingParams: string
    colorData: ColorData
    useCustomColors: boolean
    loggingDirectives: LoggingDirectives2
}

export interface Header {
    collapsedTitle: CollapsedTitle
    collapsedThumbnail: CollapsedThumbnail
    collapsedLabel: CollapsedLabel
    expandedTitle: ExpandedTitle
    showLeadingCollapsedLabel: boolean
}

export interface CollapsedTitle {
    runs: Run30[]
}

export interface Run30 {
    text: string
}

export interface CollapsedThumbnail {
    thumbnails: Thumbnail23[]
}

export interface Thumbnail23 {
    url: string
    width: number
    height: number
}

export interface CollapsedLabel {
    runs: Run31[]
}

export interface Run31 {
    text: string
}

export interface ExpandedTitle {
    runs: Run32[]
}

export interface Run32 {
    text: string
}

export interface ExpandedContent {
    horizontalCardListRenderer: HorizontalCardListRenderer
}

export interface HorizontalCardListRenderer {
    cards: Card[]
    trackingParams: string
    style: Style
    previousButton: PreviousButton
    nextButton: NextButton
}

export interface Card {
    macroMarkersListItemRenderer: MacroMarkersListItemRenderer
}

export interface MacroMarkersListItemRenderer {
    title: Title9
    timeDescription: TimeDescription
    thumbnail: Thumbnail24
    onTap: OnTap3
    trackingParams: string
    layout: string
    isHighlighted: boolean
}

export interface Title9 {
    runs: Run33[]
}

export interface Run33 {
    text: string
}

export interface TimeDescription {
    runs: Run34[]
}

export interface Run34 {
    text: string
}

export interface Thumbnail24 {
    thumbnails: Thumbnail25[]
}

export interface Thumbnail25 {
    url: string
    width: number
    height: number
}

export interface OnTap3 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata38
    watchEndpoint: WatchEndpoint8
}

export interface CommandMetadata38 {
    webCommandMetadata: WebCommandMetadata38
}

export interface WebCommandMetadata38 {
    url: string
    webPageType: string
    rootVe: number
}

export interface WatchEndpoint8 {
    videoId: string
    watchEndpointSupportedOnesieConfig: WatchEndpointSupportedOnesieConfig8
    startTimeSeconds?: number
}

export interface WatchEndpointSupportedOnesieConfig8 {
    html5PlaybackOnesieConfig: Html5PlaybackOnesieConfig8
}

export interface Html5PlaybackOnesieConfig8 {
    commonConfig: CommonConfig8
}

export interface CommonConfig8 {
    url: string
}

export interface Style {
    type: string
}

export interface PreviousButton {
    buttonRenderer: ButtonRenderer3
}

export interface ButtonRenderer3 {
    style: string
    size: string
    isDisabled: boolean
    icon: Icon12
    trackingParams: string
}

export interface Icon12 {
    iconType: string
}

export interface NextButton {
    buttonRenderer: ButtonRenderer4
}

export interface ButtonRenderer4 {
    style: string
    size: string
    isDisabled: boolean
    icon: Icon13
    trackingParams: string
}

export interface Icon13 {
    iconType: string
}

export interface ExpandButton {
    buttonRenderer: ButtonRenderer5
}

export interface ButtonRenderer5 {
    style: string
    size: string
    isDisabled: boolean
    icon: Icon14
    trackingParams: string
    accessibilityData: AccessibilityData29
}

export interface Icon14 {
    iconType: string
}

export interface AccessibilityData29 {
    accessibilityData: AccessibilityData30
}

export interface AccessibilityData30 {
    label: string
}

export interface CollapseButton {
    buttonRenderer: ButtonRenderer6
}

export interface ButtonRenderer6 {
    style: string
    size: string
    isDisabled: boolean
    icon: Icon15
    trackingParams: string
    accessibilityData: AccessibilityData31
}

export interface Icon15 {
    iconType: string
}

export interface AccessibilityData31 {
    accessibilityData: AccessibilityData32
}

export interface AccessibilityData32 {
    label: string
}

export interface ColorData {
    lightColorPalette: LightColorPalette
    darkColorPalette: DarkColorPalette2
    vibrantColorPalette: VibrantColorPalette2
}

export interface LightColorPalette {
    section1Color: number
    section2Color: number
    section3Color: number
    primaryTitleColor: number
    secondaryTitleColor: number
    iconActivatedColor: number
    iconInactiveColor: number
    section4Color: number
    iconDisabledColor: number
}

export interface DarkColorPalette2 {
    section1Color: number
    section2Color: number
    section3Color: number
    primaryTitleColor: number
    secondaryTitleColor: number
    iconActivatedColor: number
    iconInactiveColor: number
    section4Color: number
    iconDisabledColor: number
}

export interface VibrantColorPalette2 {
    section1Color: number
    section2Color: number
    section3Color: number
    primaryTitleColor: number
    secondaryTitleColor: number
    iconActivatedColor: number
    iconInactiveColor: number
    section4Color: number
    iconDisabledColor: number
}

export interface LoggingDirectives2 {
    trackingParams: string
    visibility: Visibility2
    enableDisplayloggerExperiment: boolean
}

export interface Visibility2 {
    types: string
}

export interface CollapsedStateButtonText {
    runs: Run35[]
    accessibility: Accessibility21
}

export interface Run35 {
    text: string
}

export interface Accessibility21 {
    accessibilityData: AccessibilityData33
}

export interface AccessibilityData33 {
    label: string
}

export interface ContinuationItemRenderer {
    trigger: string
    continuationEndpoint: ContinuationEndpoint
    loggingDirectives: LoggingDirectives3
}

export interface ContinuationEndpoint {
    clickTrackingParams: string
    commandMetadata: CommandMetadata39
    continuationCommand: ContinuationCommand
}

export interface CommandMetadata39 {
    webCommandMetadata: WebCommandMetadata39
}

export interface WebCommandMetadata39 {
    sendPost: boolean
    apiUrl: string
}

export interface ContinuationCommand {
    token: string
    request: string
}

export interface LoggingDirectives3 {
    trackingParams: string
}

export interface SubMenu {
    searchSubMenuRenderer: SearchSubMenuRenderer
}

export interface SearchSubMenuRenderer {
    trackingParams: string
}

export interface Header2 {
    searchHeaderRenderer: SearchHeaderRenderer
}

export interface SearchHeaderRenderer {
    chipBar: ChipBar
    searchFilterButton: SearchFilterButton
    trackingParams: string
}

export interface ChipBar {
    chipCloudRenderer: ChipCloudRenderer
}

export interface ChipCloudRenderer {
    chips: Chip[]
    trackingParams: string
    nextButton: NextButton2
    previousButton: PreviousButton2
    loggingDirectives: LoggingDirectives4
}

export interface Chip {
    chipCloudChipRenderer: ChipCloudChipRenderer
}

export interface ChipCloudChipRenderer {
    style: Style2
    text: Text16
    trackingParams: string
    isSelected: boolean
    location: string
    navigationEndpoint?: NavigationEndpoint21
}

export interface Style2 {
    styleType: string
}

export interface Text16 {
    simpleText: string
}

export interface NavigationEndpoint21 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata40
    continuationCommand: ContinuationCommand2
}

export interface CommandMetadata40 {
    webCommandMetadata: WebCommandMetadata40
}

export interface WebCommandMetadata40 {
    sendPost: boolean
    apiUrl: string
}

export interface ContinuationCommand2 {
    token: string
    request: string
    command: Command3
}

export interface Command3 {
    clickTrackingParams: string
    showReloadUiCommand: ShowReloadUiCommand
}

export interface ShowReloadUiCommand {
    targetId: string
}

export interface NextButton2 {
    buttonRenderer: ButtonRenderer7
}

export interface ButtonRenderer7 {
    style: string
    size: string
    isDisabled: boolean
    icon: Icon16
    accessibility: Accessibility22
    trackingParams: string
}

export interface Icon16 {
    iconType: string
}

export interface Accessibility22 {
    label: string
}

export interface PreviousButton2 {
    buttonRenderer: ButtonRenderer8
}

export interface ButtonRenderer8 {
    style: string
    size: string
    isDisabled: boolean
    icon: Icon17
    accessibility: Accessibility23
    trackingParams: string
}

export interface Icon17 {
    iconType: string
}

export interface Accessibility23 {
    label: string
}

export interface LoggingDirectives4 {
    trackingParams: string
    visibility: Visibility3
    enableDisplayloggerExperiment: boolean
}

export interface Visibility3 {
    types: string
}

export interface SearchFilterButton {
    buttonRenderer: ButtonRenderer9
}

export interface ButtonRenderer9 {
    style: string
    size: string
    isDisabled: boolean
    text: Text17
    icon: Icon18
    tooltip: string
    trackingParams: string
    accessibilityData: AccessibilityData34
    command: Command4
    iconPosition: string
}

export interface Text17 {
    runs: Run36[]
}

export interface Run36 {
    text: string
}

export interface Icon18 {
    iconType: string
}

export interface AccessibilityData34 {
    accessibilityData: AccessibilityData35
}

export interface AccessibilityData35 {
    label: string
}

export interface Command4 {
    clickTrackingParams: string
    openPopupAction: OpenPopupAction4
}

export interface OpenPopupAction4 {
    popup: Popup4
    popupType: string
}

export interface Popup4 {
    searchFilterOptionsDialogRenderer: SearchFilterOptionsDialogRenderer
}

export interface SearchFilterOptionsDialogRenderer {
    title: Title10
    groups: Group[]
}

export interface Title10 {
    runs: Run37[]
}

export interface Run37 {
    text: string
}

export interface Group {
    searchFilterGroupRenderer: SearchFilterGroupRenderer
}

export interface SearchFilterGroupRenderer {
    title: Title11
    filters: Filter[]
    trackingParams: string
}

export interface Title11 {
    simpleText: string
}

export interface Filter {
    searchFilterRenderer: SearchFilterRenderer
}

export interface SearchFilterRenderer {
    label: Label2
    navigationEndpoint?: NavigationEndpoint22
    tooltip: string
    trackingParams: string
    status?: string
}

export interface Label2 {
    simpleText: string
}

export interface NavigationEndpoint22 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata41
    searchEndpoint: SearchEndpoint2
}

export interface CommandMetadata41 {
    webCommandMetadata: WebCommandMetadata41
}

export interface WebCommandMetadata41 {
    url: string
    webPageType: string
    rootVe: number
}

export interface SearchEndpoint2 {
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
    runs: Run38[]
}

export interface Run38 {
    text: string
}

export interface Endpoint {
    clickTrackingParams: string
    commandMetadata: CommandMetadata42
    browseEndpoint: BrowseEndpoint14
}

export interface CommandMetadata42 {
    webCommandMetadata: WebCommandMetadata42
}

export interface WebCommandMetadata42 {
    url: string
    webPageType: string
    rootVe: number
    apiUrl: string
}

export interface BrowseEndpoint14 {
    browseId: string
}

export interface Searchbox {
    fusionSearchboxRenderer: FusionSearchboxRenderer
}

export interface FusionSearchboxRenderer {
    icon: Icon19
    placeholderText: PlaceholderText
    config: Config
    trackingParams: string
    searchEndpoint: SearchEndpoint3
    clearButton: ClearButton
}

export interface Icon19 {
    iconType: string
}

export interface PlaceholderText {
    runs: Run39[]
}

export interface Run39 {
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

export interface SearchEndpoint3 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata43
    searchEndpoint: SearchEndpoint4
}

export interface CommandMetadata43 {
    webCommandMetadata: WebCommandMetadata43
}

export interface WebCommandMetadata43 {
    url: string
    webPageType: string
    rootVe: number
}

export interface SearchEndpoint4 {
    query: string
}

export interface ClearButton {
    buttonRenderer: ButtonRenderer10
}

export interface ButtonRenderer10 {
    style: string
    size: string
    isDisabled: boolean
    icon: Icon20
    trackingParams: string
    accessibilityData: AccessibilityData36
}

export interface Icon20 {
    iconType: string
}

export interface AccessibilityData36 {
    accessibilityData: AccessibilityData37
}

export interface AccessibilityData37 {
    label: string
}

export interface TopbarButton {
    topbarMenuButtonRenderer?: TopbarMenuButtonRenderer
    buttonRenderer?: ButtonRenderer11
}

export interface TopbarMenuButtonRenderer {
    icon: Icon21
    menuRequest: MenuRequest
    trackingParams: string
    accessibility: Accessibility24
    tooltip: string
    style: string
}

export interface Icon21 {
    iconType: string
}

export interface MenuRequest {
    clickTrackingParams: string
    commandMetadata: CommandMetadata44
    signalServiceEndpoint: SignalServiceEndpoint5
}

export interface CommandMetadata44 {
    webCommandMetadata: WebCommandMetadata44
}

export interface WebCommandMetadata44 {
    sendPost: boolean
    apiUrl: string
}

export interface SignalServiceEndpoint5 {
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
    beReused: boolean
}

export interface Popup5 {
    multiPageMenuRenderer: MultiPageMenuRenderer
}

export interface MultiPageMenuRenderer {
    trackingParams: string
    style: string
    showLoadingSpinner: boolean
}

export interface Accessibility24 {
    accessibilityData: AccessibilityData38
}

export interface AccessibilityData38 {
    label: string
}

export interface ButtonRenderer11 {
    style: string
    size: string
    text: Text18
    icon: Icon22
    navigationEndpoint: NavigationEndpoint23
    trackingParams: string
    targetId: string
}

export interface Text18 {
    runs: Run40[]
}

export interface Run40 {
    text: string
}

export interface Icon22 {
    iconType: string
}

export interface NavigationEndpoint23 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata45
    signInEndpoint: SignInEndpoint2
}

export interface CommandMetadata45 {
    webCommandMetadata: WebCommandMetadata45
}

export interface WebCommandMetadata45 {
    url: string
    webPageType: string
    rootVe: number
}

export interface SignInEndpoint2 {
    idamTag: string
}

export interface HotkeyDialog {
    hotkeyDialogRenderer: HotkeyDialogRenderer
}

export interface HotkeyDialogRenderer {
    title: Title12
    sections: Section[]
    dismissButton: DismissButton
    trackingParams: string
}

export interface Title12 {
    runs: Run41[]
}

export interface Run41 {
    text: string
}

export interface Section {
    hotkeyDialogSectionRenderer: HotkeyDialogSectionRenderer
}

export interface HotkeyDialogSectionRenderer {
    title: Title13
    options: Option[]
}

export interface Title13 {
    runs: Run42[]
}

export interface Run42 {
    text: string
}

export interface Option {
    hotkeyDialogSectionOptionRenderer: HotkeyDialogSectionOptionRenderer
}

export interface HotkeyDialogSectionOptionRenderer {
    label: Label3
    hotkey: string
    hotkeyAccessibilityLabel?: HotkeyAccessibilityLabel
}

export interface Label3 {
    runs: Run43[]
}

export interface Run43 {
    text: string
}

export interface HotkeyAccessibilityLabel {
    accessibilityData: AccessibilityData39
}

export interface AccessibilityData39 {
    label: string
}

export interface DismissButton {
    buttonRenderer: ButtonRenderer12
}

export interface ButtonRenderer12 {
    style: string
    size: string
    isDisabled: boolean
    text: Text19
    trackingParams: string
}

export interface Text19 {
    runs: Run44[]
}

export interface Run44 {
    text: string
}

export interface BackButton {
    buttonRenderer: ButtonRenderer13
}

export interface ButtonRenderer13 {
    trackingParams: string
    command: Command5
}

export interface Command5 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata46
    signalServiceEndpoint: SignalServiceEndpoint6
}

export interface CommandMetadata46 {
    webCommandMetadata: WebCommandMetadata46
}

export interface WebCommandMetadata46 {
    sendPost: boolean
}

export interface SignalServiceEndpoint6 {
    signal: string
    actions: Action10[]
}

export interface Action10 {
    clickTrackingParams: string
    signalAction: SignalAction
}

export interface SignalAction {
    signal: string
}

export interface ForwardButton {
    buttonRenderer: ButtonRenderer14
}

export interface ButtonRenderer14 {
    trackingParams: string
    command: Command6
}

export interface Command6 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata47
    signalServiceEndpoint: SignalServiceEndpoint7
}

export interface CommandMetadata47 {
    webCommandMetadata: WebCommandMetadata47
}

export interface WebCommandMetadata47 {
    sendPost: boolean
}

export interface SignalServiceEndpoint7 {
    signal: string
    actions: Action11[]
}

export interface Action11 {
    clickTrackingParams: string
    signalAction: SignalAction2
}

export interface SignalAction2 {
    signal: string
}

export interface A11ySkipNavigationButton {
    buttonRenderer: ButtonRenderer15
}

export interface ButtonRenderer15 {
    style: string
    size: string
    isDisabled: boolean
    text: Text20
    trackingParams: string
    command: Command7
}

export interface Text20 {
    runs: Run45[]
}

export interface Run45 {
    text: string
}

export interface Command7 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata48
    signalServiceEndpoint: SignalServiceEndpoint8
}

export interface CommandMetadata48 {
    webCommandMetadata: WebCommandMetadata48
}

export interface WebCommandMetadata48 {
    sendPost: boolean
}

export interface SignalServiceEndpoint8 {
    signal: string
    actions: Action12[]
}

export interface Action12 {
    clickTrackingParams: string
    signalAction: SignalAction3
}

export interface SignalAction3 {
    signal: string
}

export interface VoiceSearchButton {
    buttonRenderer: ButtonRenderer16
}

export interface ButtonRenderer16 {
    style: string
    size: string
    isDisabled: boolean
    serviceEndpoint: ServiceEndpoint5
    icon: Icon24
    tooltip: string
    trackingParams: string
    accessibilityData: AccessibilityData42
}

export interface ServiceEndpoint5 {
    clickTrackingParams: string
    commandMetadata: CommandMetadata49
    signalServiceEndpoint: SignalServiceEndpoint9
}

export interface CommandMetadata49 {
    webCommandMetadata: WebCommandMetadata49
}

export interface WebCommandMetadata49 {
    sendPost: boolean
}

export interface SignalServiceEndpoint9 {
    signal: string
    actions: Action13[]
}

export interface Action13 {
    clickTrackingParams: string
    openPopupAction: OpenPopupAction6
}

export interface OpenPopupAction6 {
    popup: Popup6
    popupType: string
}

export interface Popup6 {
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
    runs: Run46[]
}

export interface Run46 {
    text: string
}

export interface PromptHeader {
    runs: Run47[]
}

export interface Run47 {
    text: string
}

export interface ExampleQuery1 {
    runs: Run48[]
}

export interface Run48 {
    text: string
}

export interface ExampleQuery2 {
    runs: Run49[]
}

export interface Run49 {
    text: string
}

export interface PromptMicrophoneLabel {
    runs: Run50[]
}

export interface Run50 {
    text: string
}

export interface LoadingHeader {
    runs: Run51[]
}

export interface Run51 {
    text: string
}

export interface ConnectionErrorHeader {
    runs: Run52[]
}

export interface Run52 {
    text: string
}

export interface ConnectionErrorMicrophoneLabel {
    runs: Run53[]
}

export interface Run53 {
    text: string
}

export interface PermissionsHeader {
    runs: Run54[]
}

export interface Run54 {
    text: string
}

export interface PermissionsSubtext {
    runs: Run55[]
}

export interface Run55 {
    text: string
}

export interface DisabledHeader {
    runs: Run56[]
}

export interface Run56 {
    text: string
}

export interface DisabledSubtext {
    runs: Run57[]
}

export interface Run57 {
    text: string
}

export interface MicrophoneButtonAriaLabel {
    runs: Run58[]
}

export interface Run58 {
    text: string
}

export interface ExitButton {
    buttonRenderer: ButtonRenderer17
}

export interface ButtonRenderer17 {
    style: string
    size: string
    isDisabled: boolean
    icon: Icon23
    trackingParams: string
    accessibilityData: AccessibilityData40
}

export interface Icon23 {
    iconType: string
}

export interface AccessibilityData40 {
    accessibilityData: AccessibilityData41
}

export interface AccessibilityData41 {
    label: string
}

export interface MicrophoneOffPromptHeader {
    runs: Run59[]
}

export interface Run59 {
    text: string
}

export interface Icon24 {
    iconType: string
}

export interface AccessibilityData42 {
    accessibilityData: AccessibilityData43
}

export interface AccessibilityData43 {
    label: string
}

export interface OnResponseReceivedCommand {
    clickTrackingParams: string
    adsControlFlowOpportunityReceivedCommand: AdsControlFlowOpportunityReceivedCommand
}

export interface AdsControlFlowOpportunityReceivedCommand {
    opportunityType: string
    isInitialLoad: boolean
    adSlotAndLayoutMetadata: AdSlotAndLayoutMetadaum[]
    enablePacfLoggingWeb: boolean
}

export interface AdSlotAndLayoutMetadaum {
    adSlotMetadata: AdSlotMetadata2
    adLayoutMetadata: AdLayoutMetadaum[]
}

export interface AdSlotMetadata2 {
    slotId: string
    slotType: string
    slotPhysicalPosition: number
    adSlotLoggingData: AdSlotLoggingData2
}

export interface AdSlotLoggingData2 {
    serializedSlotAdServingDataEntry: string
}

export interface AdLayoutMetadaum {
    layoutId: string
    layoutType: string
    adLayoutLoggingData: AdLayoutLoggingData2
}

export interface AdLayoutLoggingData2 {
    serializedAdServingDataEntry: string
}
