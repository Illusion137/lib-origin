import type { PageHeaderViewModel } from "./PageHeaderViewModel";

export interface PlaylistResultsW {
	responseContext: ResponseContext;
	contents: Contents;
	header: Header3;
	alerts: Alert[];
	metadata: Metadata3;
	trackingParams: string;
	topbar: Topbar;
	microformat: Microformat;
	sidebar: Sidebar;
}

export interface ResponseContext {
	serviceTrackingParams: ServiceTrackingParam[];
	mainAppWebResponseContext: MainAppWebResponseContext;
	responseId: string;
	webResponseContextExtensionData: WebResponseContextExtensionData;
}

export interface ServiceTrackingParam {
	service: string;
	params: Param[];
}

export interface Param {
	key: string;
	value: string;
}

export interface MainAppWebResponseContext {
	datasyncId: string;
	loggedOut: boolean;
	trackingParam: string;
}

export interface WebResponseContextExtensionData {
	webResponseContextPreloadData: WebResponseContextPreloadData;
	ytConfigData: YtConfigData;
	hasDecorated: boolean;
}

export interface WebResponseContextPreloadData {
	preloadMessageNames: string[];
}

export interface YtConfigData {
	visitorData: string;
	sessionIndex: number;
	rootVisualElementType: number;
}

export interface Contents {
	twoColumnBrowseResultsRenderer: TwoColumnBrowseResultsRenderer;
}

export interface TwoColumnBrowseResultsRenderer {
	tabs: Tab[];
}

export interface Tab {
	tabRenderer: TabRenderer;
}

export interface TabRenderer {
	selected: boolean;
	content: Content;
	tabIdentifier: string;
	trackingParams: string;
}

export interface Content {
	sectionListRenderer: SectionListRenderer;
}

export interface SectionListRenderer {
	contents: Content2[];
	trackingParams: string;
	sectionListLayoutConfiguration: SectionListLayoutConfiguration;
	webComponentHint: WebComponentHint;
}

export interface Content2 {
	itemSectionRenderer: ItemSectionRenderer;
}

export interface ItemSectionRenderer {
	contents: Content3[];
	trackingParams: string;
	header: Header2;
	targetId: string;
	headerStyle: string;
}

export interface Content3 {
	lockupViewModel?: LockupViewModel;
	continuationItemViewModel?: ContinuationItemViewModel;
}

export interface LockupViewModel {
	contentImage: ContentImage;
	metadata: Metadata;
	contentId: string;
	contentType: string;
	rendererContext: RendererContext7;
}

export interface ContentImage {
	thumbnailViewModel: ThumbnailViewModel;
}

export interface ThumbnailViewModel {
	image: Image;
	overlays: Overlay[];
}

export interface Image {
	sources: Source[];
}

export interface Source {
	url: string;
	width: number;
	height: number;
}

export interface Overlay {
	thumbnailBottomOverlayViewModel?: ThumbnailBottomOverlayViewModel;
	thumbnailHoverOverlayToggleActionsViewModel?: ThumbnailHoverOverlayToggleActionsViewModel;
}

export interface ThumbnailBottomOverlayViewModel {
	progressBar?: ProgressBar;
	badges: Badge[];
}

export interface ProgressBar {
	thumbnailOverlayProgressBarViewModel: ThumbnailOverlayProgressBarViewModel;
}

export interface ThumbnailOverlayProgressBarViewModel {
	startPercent: number;
}

export interface Badge {
	thumbnailBadgeViewModel: ThumbnailBadgeViewModel;
}

export interface ThumbnailBadgeViewModel {
	icon?: Icon;
	text: string;
	badgeStyle: string;
	animationActivationTargetId: string;
	animationActivationEntityKey: string;
	lottieData: LottieData;
	animatedText: string;
	animationActivationEntitySelectorType: string;
	inlinePlaybackBadgeData?: InlinePlaybackBadgeData;
	rendererContext: RendererContext;
}

export interface Icon {
	sources: Source2[];
}

export interface Source2 {
	clientResource: ClientResource;
}

export interface ClientResource {
	imageName: string;
}

export interface LottieData {
	url: string;
	settings: Settings;
}

export interface Settings {
	loop: boolean;
	autoplay: boolean;
}

export interface InlinePlaybackBadgeData {
	replicateAsTimestamp: boolean;
}

export interface RendererContext {
	accessibilityContext: AccessibilityContext;
}

export interface AccessibilityContext {
	label: string;
}

export interface ThumbnailHoverOverlayToggleActionsViewModel {
	buttons: Button[];
}

export interface Button {
	toggleButtonViewModel: ToggleButtonViewModel;
}

export interface ToggleButtonViewModel {
	defaultButtonViewModel: DefaultButtonViewModel;
	toggledButtonViewModel: ToggledButtonViewModel;
	isToggled: boolean;
	trackingParams: string;
}

export interface DefaultButtonViewModel {
	buttonViewModel: ButtonViewModel;
}

export interface ButtonViewModel {
	iconName: string;
	onTap: OnTap;
	accessibilityText: string;
	style: string;
	trackingParams: string;
	type: string;
	buttonSize: string;
	state: string;
}

export interface OnTap {
	innertubeCommand: InnertubeCommand;
}

export interface InnertubeCommand {
	clickTrackingParams: string;
	commandMetadata: CommandMetadata;
	playlistEditEndpoint?: PlaylistEditEndpoint;
	signalServiceEndpoint?: SignalServiceEndpoint;
}

export interface CommandMetadata {
	webCommandMetadata: WebCommandMetadata;
}

export interface WebCommandMetadata {
	sendPost: boolean;
	apiUrl?: string;
}

export interface PlaylistEditEndpoint {
	playlistId: string;
	actions: Action[];
}

export interface Action {
	addedVideoId: string;
	action: string;
}

export interface SignalServiceEndpoint {
	signal: string;
	actions: Action2[];
}

export interface Action2 {
	clickTrackingParams: string;
	addToPlaylistCommand: AddToPlaylistCommand;
}

export interface AddToPlaylistCommand {
	openMiniplayer: boolean;
	videoId: string;
	listType: string;
	onCreateListCommand: OnCreateListCommand;
	videoIds: string[];
	videoCommand: VideoCommand;
}

export interface OnCreateListCommand {
	clickTrackingParams: string;
	commandMetadata: CommandMetadata2;
	createPlaylistServiceEndpoint: CreatePlaylistServiceEndpoint;
}

export interface CommandMetadata2 {
	webCommandMetadata: WebCommandMetadata2;
}

export interface WebCommandMetadata2 {
	sendPost: boolean;
	apiUrl: string;
}

export interface CreatePlaylistServiceEndpoint {
	videoIds: string[];
	params: string;
}

export interface VideoCommand {
	clickTrackingParams: string;
	commandMetadata: CommandMetadata3;
	watchEndpoint: WatchEndpoint;
}

export interface CommandMetadata3 {
	webCommandMetadata: WebCommandMetadata3;
}

export interface WebCommandMetadata3 {
	url: string;
	webPageType: string;
	rootVe: number;
}

export interface WatchEndpoint {
	videoId: string;
	watchEndpointSupportedOnesieConfig: WatchEndpointSupportedOnesieConfig;
	playerParams?: string;
}

export interface WatchEndpointSupportedOnesieConfig {
	html5PlaybackOnesieConfig: Html5PlaybackOnesieConfig;
}

export interface Html5PlaybackOnesieConfig {
	commonConfig: CommonConfig;
}

export interface CommonConfig {
	url: string;
}

export interface ToggledButtonViewModel {
	buttonViewModel: ButtonViewModel2;
}

export interface ButtonViewModel2 {
	iconName: string;
	onTap?: OnTap2;
	accessibilityText: string;
	style: string;
	trackingParams: string;
	type: string;
	buttonSize: string;
	state: string;
}

export interface OnTap2 {
	innertubeCommand: InnertubeCommand2;
}

export interface InnertubeCommand2 {
	clickTrackingParams: string;
	commandMetadata: CommandMetadata4;
	playlistEditEndpoint: PlaylistEditEndpoint2;
}

export interface CommandMetadata4 {
	webCommandMetadata: WebCommandMetadata4;
}

export interface WebCommandMetadata4 {
	sendPost: boolean;
	apiUrl: string;
}

export interface PlaylistEditEndpoint2 {
	playlistId: string;
	actions: Action3[];
}

export interface Action3 {
	action: string;
	removedVideoId: string;
}

export interface Metadata {
	lockupMetadataViewModel: LockupMetadataViewModel;
}

export interface LockupMetadataViewModel {
	title: Title;
	image: Image2;
	metadata: Metadata2;
	menuButton: MenuButton;
}

export interface Title {
	content: string;
}

export interface Image2 {
	decoratedAvatarViewModel?: DecoratedAvatarViewModel;
	avatarStackViewModel?: AvatarStackViewModel;
}

export interface DecoratedAvatarViewModel {
	avatar: Avatar;
	a11yLabel: string;
	rendererContext: RendererContext2;
}

export interface Avatar {
	avatarViewModel: AvatarViewModel;
}

export interface AvatarViewModel {
	image: Image3;
	avatarImageSize: string;
}

export interface Image3 {
	sources: Source3[];
}

export interface Source3 {
	url: string;
	width: number;
	height: number;
}

export interface RendererContext2 {
	commandContext: CommandContext;
}

export interface CommandContext {
	onTap: OnTap3;
}

export interface OnTap3 {
	innertubeCommand: InnertubeCommand3;
}

export interface InnertubeCommand3 {
	clickTrackingParams: string;
	commandMetadata: CommandMetadata5;
	browseEndpoint: BrowseEndpoint;
}

export interface CommandMetadata5 {
	webCommandMetadata: WebCommandMetadata5;
}

export interface WebCommandMetadata5 {
	url: string;
	webPageType: string;
	rootVe: number;
	apiUrl: string;
}

export interface BrowseEndpoint {
	browseId: string;
	canonicalBaseUrl?: string;
}

export interface AvatarStackViewModel {
	avatars: Avatar2[];
	avatarClusterSize: string;
	layoutType: string;
	rendererContext: RendererContext3;
}

export interface Avatar2 {
	avatarViewModel: AvatarViewModel2;
}

export interface AvatarViewModel2 {
	image: Image4;
}

export interface Image4 {
	sources: Source4[];
}

export interface Source4 {
	url: string;
	width?: number;
	height?: number;
}

export interface RendererContext3 {
	loggingContext: LoggingContext;
	accessibilityContext: AccessibilityContext2;
	commandContext: CommandContext2;
}

export interface LoggingContext {
	loggingDirectives: LoggingDirectives;
}

export interface LoggingDirectives {
	trackingParams: string;
	visibility: Visibility;
}

export interface Visibility {
	types: string;
}

export interface AccessibilityContext2 {
	label: string;
}

export interface CommandContext2 {
	onTap: OnTap4;
}

export interface OnTap4 {
	innertubeCommand: InnertubeCommand4;
}

export interface InnertubeCommand4 {
	clickTrackingParams: string;
	commandMetadata: CommandMetadata6;
	showDialogCommand: ShowDialogCommand;
}

export interface CommandMetadata6 {
	interactionLoggingCommandMetadata: InteractionLoggingCommandMetadata;
}

export interface InteractionLoggingCommandMetadata {
	screenVisualElement: ScreenVisualElement;
}

export interface ScreenVisualElement {
	uiType: number;
}

export interface ShowDialogCommand {
	panelLoadingStrategy: PanelLoadingStrategy;
}

export interface PanelLoadingStrategy {
	inlineContent: InlineContent;
	screenVe: number;
}

export interface InlineContent {
	dialogViewModel: DialogViewModel;
}

export interface DialogViewModel {
	header: Header;
	customContent: CustomContent;
}

export interface Header {
	dialogHeaderViewModel: DialogHeaderViewModel;
}

export interface DialogHeaderViewModel {
	headline: Headline;
}

export interface Headline {
	content: string;
}

export interface CustomContent {
	listViewModel: ListViewModel;
}

export interface ListViewModel {
	listItems: ListItem[];
}

export interface ListItem {
	listItemViewModel: ListItemViewModel;
}

export interface ListItemViewModel {
	title: Title2;
	subtitle: Subtitle;
	trailingImage: TrailingImage;
	leadingAccessory: LeadingAccessory;
	rendererContext: RendererContext4;
}

export interface Title2 {
	content: string;
	styleRuns: StyleRun[];
	attachmentRuns?: AttachmentRun[];
}

export interface StyleRun {
	fontColor?: number;
	weightLabel?: string;
	startIndex?: number;
	styleRunExtensions?: StyleRunExtensions;
}

export interface StyleRunExtensions {
	styleRunColorMapExtension: StyleRunColorMapExtension;
}

export interface StyleRunColorMapExtension {
	colorMap: ColorMap[];
}

export interface ColorMap {
	key: string;
	value: number;
}

export interface AttachmentRun {
	startIndex: number;
	length: number;
	element: Element;
	alignment: string;
}

export interface Element {
	type: Type;
	properties: Properties;
}

export interface Type {
	imageType: ImageType;
}

export interface ImageType {
	image: Image5;
}

export interface Image5 {
	sources: Source5[];
}

export interface Source5 {
	clientResource: ClientResource2;
	width: number;
	height: number;
}

export interface ClientResource2 {
	imageName: string;
}

export interface Properties {
	layoutProperties: LayoutProperties;
}

export interface LayoutProperties {
	height: Height;
	width: Width;
	margin: Margin;
}

export interface Height {
	value: number;
	unit: string;
}

export interface Width {
	value: number;
	unit: string;
}

export interface Margin {
	left: Left;
}

export interface Left {
	value: number;
	unit: string;
}

export interface Subtitle {
	content: string;
}

export interface TrailingImage {
	sources: Source6[];
}

export interface Source6 {
	clientResource: ClientResource3;
}

export interface ClientResource3 {
	imageName: string;
}

export interface LeadingAccessory {
	avatarViewModel: AvatarViewModel3;
}

export interface AvatarViewModel3 {
	image: Image6;
	accessibilityText: string;
	avatarImageSize: string;
}

export interface Image6 {
	sources: Source7[];
	processor: Processor;
}

export interface Source7 {
	url: string;
}

export interface Processor {
	borderImageProcessor: BorderImageProcessor;
}

export interface BorderImageProcessor {
	circular: boolean;
}

export interface RendererContext4 {
	accessibilityContext: AccessibilityContext3;
	commandContext: CommandContext3;
}

export interface AccessibilityContext3 {
	label: string;
}

export interface CommandContext3 {
	onTap: OnTap5;
}

export interface OnTap5 {
	innertubeCommand: InnertubeCommand5;
}

export interface InnertubeCommand5 {
	clickTrackingParams: string;
	commandMetadata: CommandMetadata7;
	browseEndpoint: BrowseEndpoint2;
}

export interface CommandMetadata7 {
	webCommandMetadata: WebCommandMetadata6;
}

export interface WebCommandMetadata6 {
	url: string;
	webPageType: string;
	rootVe: number;
	apiUrl: string;
}

export interface BrowseEndpoint2 {
	browseId: string;
}

export interface Metadata2 {
	contentMetadataViewModel: ContentMetadataViewModel;
}

export interface ContentMetadataViewModel {
	metadataRows: MetadataRow[];
	delimiter: string;
}

export interface MetadataRow {
	metadataParts: MetadataPart[];
}

export interface MetadataPart {
	text: Text;
	accessibilityLabel?: string;
}

export interface Text {
	content: string;
	commandRuns?: CommandRun[];
	styleRuns?: StyleRun2[];
	attachmentRuns?: AttachmentRun2[];
}

export interface CommandRun {
	startIndex: number;
	length: number;
	onTap: OnTap6;
}

export interface OnTap6 {
	innertubeCommand: InnertubeCommand6;
}

export interface InnertubeCommand6 {
	clickTrackingParams: string;
	commandMetadata: CommandMetadata8;
	browseEndpoint: BrowseEndpoint3;
}

export interface CommandMetadata8 {
	webCommandMetadata: WebCommandMetadata7;
}

export interface WebCommandMetadata7 {
	url: string;
	webPageType: string;
	rootVe: number;
	apiUrl: string;
}

export interface BrowseEndpoint3 {
	browseId: string;
	canonicalBaseUrl: string;
}

export interface StyleRun2 {
	startIndex: number;
	length?: number;
	weightLabel?: string;
	styleRunExtensions?: StyleRunExtensions2;
}

export interface StyleRunExtensions2 {
	styleRunColorMapExtension: StyleRunColorMapExtension2;
}

export interface StyleRunColorMapExtension2 {
	colorMap: ColorMap2[];
}

export interface ColorMap2 {
	key: string;
	value: number;
}

export interface AttachmentRun2 {
	startIndex: number;
	length: number;
	element: Element2;
	alignment: string;
}

export interface Element2 {
	type: Type2;
	properties: Properties2;
}

export interface Type2 {
	imageType: ImageType2;
}

export interface ImageType2 {
	image: Image7;
}

export interface Image7 {
	sources: Source8[];
}

export interface Source8 {
	clientResource: ClientResource4;
	width: number;
	height: number;
}

export interface ClientResource4 {
	imageName: string;
}

export interface Properties2 {
	layoutProperties: LayoutProperties2;
}

export interface LayoutProperties2 {
	height: Height2;
	width: Width2;
	margin: Margin2;
}

export interface Height2 {
	value: number;
	unit: string;
}

export interface Width2 {
	value: number;
	unit: string;
}

export interface Margin2 {
	left: Left2;
}

export interface Left2 {
	value: number;
	unit: string;
}

export interface MenuButton {
	buttonViewModel: ButtonViewModel3;
}

export interface ButtonViewModel3 {
	iconName: string;
	onTap: OnTap7;
	accessibilityText: string;
	style: string;
	trackingParams: string;
	type: string;
	buttonSize: string;
	state: string;
}

export interface OnTap7 {
	innertubeCommand: InnertubeCommand7;
}

export interface InnertubeCommand7 {
	clickTrackingParams: string;
	showSheetCommand: ShowSheetCommand;
}

export interface ShowSheetCommand {
	panelLoadingStrategy: PanelLoadingStrategy2;
}

export interface PanelLoadingStrategy2 {
	inlineContent: InlineContent2;
}

export interface InlineContent2 {
	sheetViewModel: SheetViewModel;
}

export interface SheetViewModel {
	content: Content4;
}

export interface Content4 {
	listViewModel: ListViewModel2;
}

export interface ListViewModel2 {
	listItems: ListItem2[];
}

export interface ListItem2 {
	listItemViewModel?: ListItemViewModel2;
	downloadListItemViewModel?: DownloadListItemViewModel;
}

export interface ListItemViewModel2 {
	title: Title3;
	leadingImage: LeadingImage;
	rendererContext: RendererContext5;
}

export interface Title3 {
	content: string;
}

export interface LeadingImage {
	sources: Source9[];
}

export interface Source9 {
	clientResource: ClientResource5;
}

export interface ClientResource5 {
	imageName: string;
}

export interface RendererContext5 {
	commandContext: CommandContext4;
	loggingContext?: LoggingContext2;
}

export interface CommandContext4 {
	onTap: OnTap8;
}

export interface OnTap8 {
	innertubeCommand: InnertubeCommand8;
}

export interface InnertubeCommand8 {
	clickTrackingParams: string;
	commandMetadata: CommandMetadata9;
	likeEndpoint?: LikeEndpoint;
	shareEntityServiceEndpoint?: ShareEntityServiceEndpoint;
	signalServiceEndpoint?: SignalServiceEndpoint2;
	playlistEditEndpoint?: PlaylistEditEndpoint3;
	showSheetCommand?: ShowSheetCommand2;
}

export interface CommandMetadata9 {
	webCommandMetadata?: WebCommandMetadata8;
	interactionLoggingCommandMetadata?: InteractionLoggingCommandMetadata2;
}

export interface WebCommandMetadata8 {
	sendPost: boolean;
	apiUrl?: string;
}

export interface InteractionLoggingCommandMetadata2 {
	screenVisualElement: ScreenVisualElement2;
}

export interface ScreenVisualElement2 {
	uiType: number;
}

export interface LikeEndpoint {
	status: string;
	target: Target;
	actions: Action4[];
	likeParams: string;
}

export interface Target {
	videoId: string;
}

export interface Action4 {
	clickTrackingParams: string;
	replaceEnclosingAction: ReplaceEnclosingAction;
}

export interface ReplaceEnclosingAction {
	item: Item;
}

export interface Item {
	notificationMultiActionRenderer: NotificationMultiActionRenderer;
}

export interface NotificationMultiActionRenderer {
	responseText: ResponseText;
	trackingParams: string;
}

export interface ResponseText {
	accessibility: Accessibility;
	simpleText: string;
}

export interface Accessibility {
	accessibilityData: AccessibilityData;
}

export interface AccessibilityData {
	label: string;
}

export interface ShareEntityServiceEndpoint {
	serializedShareEntity: string;
	commands: Command[];
}

export interface Command {
	clickTrackingParams: string;
	openPopupAction: OpenPopupAction;
}

export interface OpenPopupAction {
	popup: Popup;
	popupType: string;
	beReused: boolean;
}

export interface Popup {
	unifiedSharePanelRenderer: UnifiedSharePanelRenderer;
}

export interface UnifiedSharePanelRenderer {
	trackingParams: string;
	showLoadingSpinner: boolean;
}

export interface SignalServiceEndpoint2 {
	signal: string;
	actions: Action5[];
}

export interface Action5 {
	clickTrackingParams: string;
	addToPlaylistCommand: AddToPlaylistCommand2;
}

export interface AddToPlaylistCommand2 {
	openMiniplayer: boolean;
	videoId: string;
	listType: string;
	onCreateListCommand: OnCreateListCommand2;
	videoIds: string[];
	videoCommand: VideoCommand2;
}

export interface OnCreateListCommand2 {
	clickTrackingParams: string;
	commandMetadata: CommandMetadata10;
	createPlaylistServiceEndpoint: CreatePlaylistServiceEndpoint2;
}

export interface CommandMetadata10 {
	webCommandMetadata: WebCommandMetadata9;
}

export interface WebCommandMetadata9 {
	sendPost: boolean;
	apiUrl: string;
}

export interface CreatePlaylistServiceEndpoint2 {
	videoIds: string[];
	params: string;
}

export interface VideoCommand2 {
	clickTrackingParams: string;
	commandMetadata: CommandMetadata11;
	watchEndpoint: WatchEndpoint2;
}

export interface CommandMetadata11 {
	webCommandMetadata: WebCommandMetadata10;
}

export interface WebCommandMetadata10 {
	url: string;
	webPageType: string;
	rootVe: number;
}

export interface WatchEndpoint2 {
	videoId: string;
	watchEndpointSupportedOnesieConfig: WatchEndpointSupportedOnesieConfig2;
	playerParams?: string;
}

export interface WatchEndpointSupportedOnesieConfig2 {
	html5PlaybackOnesieConfig: Html5PlaybackOnesieConfig2;
}

export interface Html5PlaybackOnesieConfig2 {
	commonConfig: CommonConfig2;
}

export interface CommonConfig2 {
	url: string;
}

export interface PlaylistEditEndpoint3 {
	playlistId: string;
	actions: Action6[];
}

export interface Action6 {
	addedVideoId: string;
	action: string;
}

export interface ShowSheetCommand2 {
	panelLoadingStrategy: PanelLoadingStrategy3;
	contextualSheetPresentationConfig: ContextualSheetPresentationConfig;
}

export interface PanelLoadingStrategy3 {
	requestTemplate: RequestTemplate;
	screenVe: number;
}

export interface RequestTemplate {
	panelId: string;
	params: string;
}

export interface ContextualSheetPresentationConfig {
	expandToFullWidth: boolean;
}

export interface LoggingContext2 {
	loggingDirectives: LoggingDirectives2;
}

export interface LoggingDirectives2 {
	trackingParams: string;
	visibility: Visibility2;
}

export interface Visibility2 {
	types: string;
}

export interface DownloadListItemViewModel {
	rendererContext: RendererContext6;
}

export interface RendererContext6 {
	loggingContext: LoggingContext3;
	commandContext: CommandContext5;
}

export interface LoggingContext3 {
	loggingDirectives: LoggingDirectives3;
}

export interface LoggingDirectives3 {
	trackingParams: string;
	visibility: Visibility3;
}

export interface Visibility3 {
	types: string;
}

export interface CommandContext5 {
	onTap: OnTap9;
}

export interface OnTap9 {
	innertubeCommand: InnertubeCommand9;
}

export interface InnertubeCommand9 {
	clickTrackingParams: string;
	offlineVideoEndpoint: OfflineVideoEndpoint;
}

export interface OfflineVideoEndpoint {
	videoId: string;
	onAddCommand: OnAddCommand;
}

export interface OnAddCommand {
	clickTrackingParams: string;
	getDownloadActionCommand: GetDownloadActionCommand;
}

export interface GetDownloadActionCommand {
	videoId: string;
	params: string;
	isCrossDeviceDownload: boolean;
}

export interface RendererContext7 {
	loggingContext: LoggingContext4;
	accessibilityContext: AccessibilityContext4;
	commandContext: CommandContext6;
}

export interface LoggingContext4 {
	loggingDirectives: LoggingDirectives4;
}

export interface LoggingDirectives4 {
	trackingParams: string;
	visibility: Visibility4;
}

export interface Visibility4 {
	types: string;
}

export interface AccessibilityContext4 {
	label: string;
}

export interface CommandContext6 {
	onTap: OnTap10;
}

export interface OnTap10 {
	innertubeCommand: InnertubeCommand10;
}

export interface InnertubeCommand10 {
	clickTrackingParams: string;
	commandMetadata: CommandMetadata12;
	watchEndpoint: WatchEndpoint3;
}

export interface CommandMetadata12 {
	webCommandMetadata: WebCommandMetadata11;
}

export interface WebCommandMetadata11 {
	url: string;
	webPageType: string;
	rootVe: number;
}

export interface WatchEndpoint3 {
	videoId: string;
	playlistId: string;
	index: number;
	params: string;
	playerParams: string;
	loggingContext: LoggingContext5;
	watchEndpointSupportedOnesieConfig: WatchEndpointSupportedOnesieConfig3;
	startTimeSeconds?: number;
}

export interface LoggingContext5 {
	vssLoggingContext: VssLoggingContext;
}

export interface VssLoggingContext {
	serializedContextData: string;
}

export interface WatchEndpointSupportedOnesieConfig3 {
	html5PlaybackOnesieConfig: Html5PlaybackOnesieConfig3;
}

export interface Html5PlaybackOnesieConfig3 {
	commonConfig: CommonConfig3;
}

export interface CommonConfig3 {
	url: string;
}

export interface ContinuationItemViewModel {
	trigger: string;
	continuationCommand: ContinuationCommand;
}

export interface ContinuationCommand {
	innertubeCommand: InnertubeCommand11;
}

export interface InnertubeCommand11 {
	clickTrackingParams: string;
	commandMetadata: CommandMetadata13;
	continuationCommand: ContinuationCommand2;
}

export interface CommandMetadata13 {
	webCommandMetadata: WebCommandMetadata12;
}

export interface WebCommandMetadata12 {
	sendPost: boolean;
	apiUrl: string;
}

export interface ContinuationCommand2 {
	token: string;
	request: string;
}

export interface Header2 {
	chipBarViewModel: ChipBarViewModel;
}

export interface ChipBarViewModel {
	chips: Chip[];
}

export interface Chip {
	chipViewModel: ChipViewModel;
}

export interface ChipViewModel {
	text: string;
	selected: boolean;
	displayType: string;
	tapCommand: TapCommand;
	accessibilityLabel: string;
	loggingDirectives: LoggingDirectives5;
}

export interface TapCommand {
	innertubeCommand: InnertubeCommand12;
}

export interface InnertubeCommand12 {
	clickTrackingParams: string;
	commandMetadata: CommandMetadata14;
	browseEndpoint: BrowseEndpoint4;
}

export interface CommandMetadata14 {
	webCommandMetadata: WebCommandMetadata13;
}

export interface WebCommandMetadata13 {
	url: string;
	webPageType: string;
	rootVe: number;
	apiUrl: string;
}

export interface BrowseEndpoint4 {
	browseId: string;
	nofollow: boolean;
	navigationType: string;
	params?: string;
}

export interface LoggingDirectives5 {
	trackingParams: string;
	visibility: Visibility5;
}

export interface Visibility5 {
	types: string;
}

export interface SectionListLayoutConfiguration {
	layoutConfiguration: LayoutConfiguration;
}

export interface LayoutConfiguration {
	responsiveContainerConfiguration: ResponsiveContainerConfiguration;
}

export interface ResponsiveContainerConfiguration {
	responsiveSize: string;
	responsiveMap: ResponsiveMap[];
}

export interface ResponsiveMap {
	containerSize: string;
	containerType: string;
	maxWidth: number;
	minColumnSize: number;
	minColumnCount: number;
	maxColumnCount: number;
	spacingConfiguration: SpacingConfiguration;
	columnMultiplier: number;
	columnAdder: number;
}

export interface SpacingConfiguration {
	columnGap: number;
	rowGap: number;
}

export interface WebComponentHint {
	componentVersion: string;
}

export interface Header3 {
	playlistHeaderRenderer: PlaylistHeaderRenderer;
	pageHeaderRenderer: { content: { pageHeaderViewModel: PageHeaderViewModel } };
}

export interface PlaylistHeaderRenderer {
	playlistId: string;
	title: Title4;
	numVideosText: NumVideosText;
	ownerText: OwnerText;
	viewCountText: ViewCountText;
	shareData: ShareData;
	isEditable: boolean;
	privacy: string;
	ownerEndpoint: OwnerEndpoint;
	editableDetails: EditableDetails;
	offlineability: Offlineability;
	trackingParams: string;
	serviceEndpoints: ServiceEndpoint[];
	stats: Stat[];
	briefStats: BriefStat[];
	playlistHeaderBanner: PlaylistHeaderBanner;
	moreActionsMenu: MoreActionsMenu;
	playButton: PlayButton;
	shufflePlayButton: ShufflePlayButton;
	cinematicContainer: CinematicContainer;
	byline: Byline[];
}

export interface Title4 {
	simpleText: string;
}

export interface NumVideosText {
	runs: Run[];
}

export interface Run {
	text: string;
}

export interface OwnerText {
	runs: Run2[];
}

export interface Run2 {
	text: string;
	navigationEndpoint: NavigationEndpoint;
}

export interface NavigationEndpoint {
	clickTrackingParams: string;
	commandMetadata: CommandMetadata15;
	browseEndpoint: BrowseEndpoint5;
}

export interface CommandMetadata15 {
	webCommandMetadata: WebCommandMetadata14;
}

export interface WebCommandMetadata14 {
	url: string;
	webPageType: string;
	rootVe: number;
	apiUrl: string;
}

export interface BrowseEndpoint5 {
	browseId: string;
	canonicalBaseUrl: string;
}

export interface ViewCountText {
	simpleText: string;
}

export interface ShareData {
	canShare: boolean;
}

export interface OwnerEndpoint {
	clickTrackingParams: string;
	commandMetadata: CommandMetadata16;
	browseEndpoint: BrowseEndpoint6;
}

export interface CommandMetadata16 {
	webCommandMetadata: WebCommandMetadata15;
}

export interface WebCommandMetadata15 {
	url: string;
	webPageType: string;
	rootVe: number;
	apiUrl: string;
}

export interface BrowseEndpoint6 {
	browseId: string;
	canonicalBaseUrl: string;
}

export interface EditableDetails {
	canDelete: boolean;
}

export interface Offlineability {
	downloadButtonRenderer: DownloadButtonRenderer;
}

export interface DownloadButtonRenderer {
	trackingParams: string;
	style: string;
	size: string;
	accessibilityData: AccessibilityData2;
	targetId: string;
	command: Command2;
}

export interface AccessibilityData2 {
	accessibilityData: AccessibilityData3;
}

export interface AccessibilityData3 {
	label: string;
}

export interface Command2 {
	clickTrackingParams: string;
	offlinePlaylistEndpoint: OfflinePlaylistEndpoint;
}

export interface OfflinePlaylistEndpoint {
	playlistId: string;
	onAddCommand: OnAddCommand2;
}

export interface OnAddCommand2 {
	clickTrackingParams: string;
	getDownloadActionCommand: GetDownloadActionCommand2;
}

export interface GetDownloadActionCommand2 {
	playlistId: string;
	params: string;
}

export interface ServiceEndpoint {
	clickTrackingParams: string;
	commandMetadata: CommandMetadata17;
	playlistEditEndpoint: PlaylistEditEndpoint4;
}

export interface CommandMetadata17 {
	webCommandMetadata: WebCommandMetadata16;
}

export interface WebCommandMetadata16 {
	sendPost: boolean;
	apiUrl: string;
}

export interface PlaylistEditEndpoint4 {
	actions: Action7[];
}

export interface Action7 {
	action: string;
	sourcePlaylistId: string;
}

export interface Stat {
	runs?: Run3[];
	simpleText?: string;
}

export interface Run3 {
	text: string;
}

export interface BriefStat {
	runs: Run4[];
}

export interface Run4 {
	text: string;
}

export interface PlaylistHeaderBanner {
	heroPlaylistThumbnailRenderer: HeroPlaylistThumbnailRenderer;
}

export interface HeroPlaylistThumbnailRenderer {
	thumbnail: Thumbnail;
	maxRatio: number;
	trackingParams: string;
	onTap: OnTap11;
	thumbnailOverlays: ThumbnailOverlays;
}

export interface Thumbnail {
	thumbnails: Thumbnail2[];
}

export interface Thumbnail2 {
	url: string;
	width: number;
	height: number;
}

export interface OnTap11 {
	clickTrackingParams: string;
	commandMetadata: CommandMetadata18;
	watchEndpoint: WatchEndpoint4;
}

export interface CommandMetadata18 {
	webCommandMetadata: WebCommandMetadata17;
}

export interface WebCommandMetadata17 {
	url: string;
	webPageType: string;
	rootVe: number;
}

export interface WatchEndpoint4 {
	videoId: string;
	playlistId: string;
	playerParams: string;
	loggingContext: LoggingContext6;
	watchEndpointSupportedOnesieConfig: WatchEndpointSupportedOnesieConfig4;
}

export interface LoggingContext6 {
	vssLoggingContext: VssLoggingContext2;
}

export interface VssLoggingContext2 {
	serializedContextData: string;
}

export interface WatchEndpointSupportedOnesieConfig4 {
	html5PlaybackOnesieConfig: Html5PlaybackOnesieConfig4;
}

export interface Html5PlaybackOnesieConfig4 {
	commonConfig: CommonConfig4;
}

export interface CommonConfig4 {
	url: string;
}

export interface ThumbnailOverlays {
	thumbnailOverlayHoverTextRenderer: ThumbnailOverlayHoverTextRenderer;
}

export interface ThumbnailOverlayHoverTextRenderer {
	text: Text2;
	icon: Icon2;
}

export interface Text2 {
	simpleText: string;
}

export interface Icon2 {
	iconType: string;
}

export interface MoreActionsMenu {
	menuRenderer: MenuRenderer;
}

export interface MenuRenderer {
	items: Item2[];
	trackingParams: string;
	accessibility: Accessibility2;
	targetId: string;
}

export interface Item2 {
	menuNavigationItemRenderer: MenuNavigationItemRenderer;
}

export interface MenuNavigationItemRenderer {
	text: Text3;
	icon: Icon3;
	navigationEndpoint: NavigationEndpoint2;
	trackingParams: string;
}

export interface Text3 {
	simpleText: string;
}

export interface Icon3 {
	iconType: string;
}

export interface NavigationEndpoint2 {
	clickTrackingParams: string;
	commandMetadata: CommandMetadata19;
	browseEndpoint: BrowseEndpoint7;
}

export interface CommandMetadata19 {
	webCommandMetadata: WebCommandMetadata18;
}

export interface WebCommandMetadata18 {
	url: string;
	webPageType: string;
	rootVe: number;
	apiUrl: string;
}

export interface BrowseEndpoint7 {
	browseId: string;
	params: string;
	nofollow: boolean;
	navigationType: string;
}

export interface Accessibility2 {
	accessibilityData: AccessibilityData4;
}

export interface AccessibilityData4 {
	label: string;
}

export interface PlayButton {
	buttonRenderer: ButtonRenderer;
}

export interface ButtonRenderer {
	style: string;
	size: string;
	isDisabled: boolean;
	text: Text4;
	icon: Icon4;
	navigationEndpoint: NavigationEndpoint3;
	trackingParams: string;
}

export interface Text4 {
	simpleText: string;
}

export interface Icon4 {
	iconType: string;
}

export interface NavigationEndpoint3 {
	clickTrackingParams: string;
	commandMetadata: CommandMetadata20;
	watchEndpoint: WatchEndpoint5;
}

export interface CommandMetadata20 {
	webCommandMetadata: WebCommandMetadata19;
}

export interface WebCommandMetadata19 {
	url: string;
	webPageType: string;
	rootVe: number;
}

export interface WatchEndpoint5 {
	videoId: string;
	playlistId: string;
	playerParams: string;
	loggingContext: LoggingContext7;
	watchEndpointSupportedOnesieConfig: WatchEndpointSupportedOnesieConfig5;
}

export interface LoggingContext7 {
	vssLoggingContext: VssLoggingContext3;
}

export interface VssLoggingContext3 {
	serializedContextData: string;
}

export interface WatchEndpointSupportedOnesieConfig5 {
	html5PlaybackOnesieConfig: Html5PlaybackOnesieConfig5;
}

export interface Html5PlaybackOnesieConfig5 {
	commonConfig: CommonConfig5;
}

export interface CommonConfig5 {
	url: string;
}

export interface ShufflePlayButton {
	buttonRenderer: ButtonRenderer2;
}

export interface ButtonRenderer2 {
	style: string;
	size: string;
	isDisabled: boolean;
	text: Text5;
	icon: Icon5;
	navigationEndpoint: NavigationEndpoint4;
	trackingParams: string;
}

export interface Text5 {
	simpleText: string;
}

export interface Icon5 {
	iconType: string;
}

export interface NavigationEndpoint4 {
	clickTrackingParams: string;
	commandMetadata: CommandMetadata21;
	watchEndpoint: WatchEndpoint6;
}

export interface CommandMetadata21 {
	webCommandMetadata: WebCommandMetadata20;
}

export interface WebCommandMetadata20 {
	url: string;
	webPageType: string;
	rootVe: number;
}

export interface WatchEndpoint6 {
	videoId: string;
	playlistId: string;
	params: string;
	playerParams: string;
	loggingContext: LoggingContext8;
	watchEndpointSupportedOnesieConfig: WatchEndpointSupportedOnesieConfig6;
}

export interface LoggingContext8 {
	vssLoggingContext: VssLoggingContext4;
}

export interface VssLoggingContext4 {
	serializedContextData: string;
}

export interface WatchEndpointSupportedOnesieConfig6 {
	html5PlaybackOnesieConfig: Html5PlaybackOnesieConfig6;
}

export interface Html5PlaybackOnesieConfig6 {
	commonConfig: CommonConfig6;
}

export interface CommonConfig6 {
	url: string;
}

export interface CinematicContainer {
	cinematicContainerRenderer: CinematicContainerRenderer;
}

export interface CinematicContainerRenderer {
	backgroundImageConfig: BackgroundImageConfig;
	gradientColorConfig: GradientColorConfig[];
	config: Config;
}

export interface BackgroundImageConfig {
	thumbnail: Thumbnail3;
}

export interface Thumbnail3 {
	thumbnails: Thumbnail4[];
}

export interface Thumbnail4 {
	url: string;
	width: number;
	height: number;
}

export interface GradientColorConfig {
	lightThemeColor: number;
	darkThemeColor: number;
	startLocation: number;
}

export interface Config {
	lightThemeBackgroundColor: number;
	darkThemeBackgroundColor: number;
	colorSourceSizeMultiplier: number;
	applyClientImageBlur: boolean;
}

export interface Byline {
	playlistBylineRenderer: PlaylistBylineRenderer;
}

export interface PlaylistBylineRenderer {
	text: Text6;
}

export interface Text6 {
	runs?: Run5[];
	simpleText?: string;
}

export interface Run5 {
	text: string;
}

export interface Alert {
	alertWithButtonRenderer: AlertWithButtonRenderer;
}

export interface AlertWithButtonRenderer {
	type: string;
	text: Text7;
	dismissButton: DismissButton;
}

export interface Text7 {
	simpleText: string;
}

export interface DismissButton {
	buttonRenderer: ButtonRenderer3;
}

export interface ButtonRenderer3 {
	style: string;
	size: string;
	isDisabled: boolean;
	icon: Icon6;
	trackingParams: string;
	accessibilityData: AccessibilityData5;
}

export interface Icon6 {
	iconType: string;
}

export interface AccessibilityData5 {
	accessibilityData: AccessibilityData6;
}

export interface AccessibilityData6 {
	label: string;
}

export interface Metadata3 {
	playlistMetadataRenderer: PlaylistMetadataRenderer;
}

export interface PlaylistMetadataRenderer {
	title: string;
	androidAppindexingLink: string;
	iosAppindexingLink: string;
}

export interface Topbar {
	desktopTopbarRenderer: DesktopTopbarRenderer;
}

export interface DesktopTopbarRenderer {
	logo: Logo;
	searchbox: Searchbox;
	trackingParams: string;
	topbarButtons: TopbarButton[];
	hotkeyDialog: HotkeyDialog;
	backButton: BackButton;
	forwardButton: ForwardButton;
	a11ySkipNavigationButton: A11ySkipNavigationButton;
	voiceSearchButton: VoiceSearchButton;
}

export interface Logo {
	topbarLogoRenderer: TopbarLogoRenderer;
}

export interface TopbarLogoRenderer {
	iconImage: IconImage;
	tooltipText: TooltipText;
	endpoint: Endpoint;
	trackingParams: string;
	overrideEntityKey: string;
}

export interface IconImage {
	iconType: string;
}

export interface TooltipText {
	runs: Run6[];
}

export interface Run6 {
	text: string;
}

export interface Endpoint {
	clickTrackingParams: string;
	commandMetadata: CommandMetadata22;
	browseEndpoint: BrowseEndpoint8;
}

export interface CommandMetadata22 {
	webCommandMetadata: WebCommandMetadata21;
}

export interface WebCommandMetadata21 {
	url: string;
	webPageType: string;
	rootVe: number;
	apiUrl: string;
}

export interface BrowseEndpoint8 {
	browseId: string;
}

export interface Searchbox {
	fusionSearchboxRenderer: FusionSearchboxRenderer;
}

export interface FusionSearchboxRenderer {
	icon: Icon7;
	placeholderText: PlaceholderText;
	config: Config2;
	trackingParams: string;
	searchEndpoint: SearchEndpoint;
	clearButton: ClearButton;
	showImageSourceDialog: ShowImageSourceDialog;
}

export interface Icon7 {
	iconType: string;
}

export interface PlaceholderText {
	runs: Run7[];
}

export interface Run7 {
	text: string;
}

export interface Config2 {
	webSearchboxConfig: WebSearchboxConfig;
}

export interface WebSearchboxConfig {
	requestLanguage: string;
	requestDomain: string;
	hasOnscreenKeyboard: boolean;
	focusSearchbox: boolean;
}

export interface SearchEndpoint {
	clickTrackingParams: string;
	commandMetadata: CommandMetadata23;
	searchEndpoint: SearchEndpoint2;
}

export interface CommandMetadata23 {
	webCommandMetadata: WebCommandMetadata22;
}

export interface WebCommandMetadata22 {
	url: string;
	webPageType: string;
	rootVe: number;
}

export interface SearchEndpoint2 {
	query: string;
}

export interface ClearButton {
	buttonRenderer: ButtonRenderer4;
}

export interface ButtonRenderer4 {
	style: string;
	size: string;
	isDisabled: boolean;
	icon: Icon8;
	trackingParams: string;
	accessibilityData: AccessibilityData7;
}

export interface Icon8 {
	iconType: string;
}

export interface AccessibilityData7 {
	accessibilityData: AccessibilityData8;
}

export interface AccessibilityData8 {
	label: string;
}

export interface ShowImageSourceDialog {
	clickTrackingParams: string;
	showDialogCommand: ShowDialogCommand2;
}

export interface ShowDialogCommand2 {
	panelLoadingStrategy: PanelLoadingStrategy4;
}

export interface PanelLoadingStrategy4 {
	inlineContent: InlineContent3;
}

export interface InlineContent3 {
	dialogViewModel: DialogViewModel2;
}

export interface DialogViewModel2 {
	header: Header4;
	footer: Footer;
	content: Content5;
}

export interface Header4 {
	dialogHeaderViewModel: DialogHeaderViewModel2;
}

export interface DialogHeaderViewModel2 {
	headline: Headline2;
}

export interface Headline2 {
	content: string;
}

export interface Footer {
	panelFooterViewModel: PanelFooterViewModel;
}

export interface PanelFooterViewModel {
	primaryButton: PrimaryButton;
	secondaryButton: SecondaryButton;
	shouldHideDivider: boolean;
}

export interface PrimaryButton {
	buttonViewModel: ButtonViewModel4;
}

export interface ButtonViewModel4 {
	title: string;
	style: string;
	trackingParams: string;
	isFullWidth: boolean;
	type: string;
}

export interface SecondaryButton {
	buttonViewModel: ButtonViewModel5;
}

export interface ButtonViewModel5 {
	title: string;
	style: string;
	trackingParams: string;
	isFullWidth: boolean;
	type: string;
}

export interface Content5 {
	basicContentViewModel: BasicContentViewModel;
}

export interface BasicContentViewModel {
	paragraphs: Paragraph[];
}

export interface Paragraph {
	text: Text8;
}

export interface Text8 {
	content: string;
}

export interface TopbarButton {
	buttonRenderer?: ButtonRenderer5;
	notificationTopbarButtonRenderer?: NotificationTopbarButtonRenderer;
	topbarMenuButtonRenderer?: TopbarMenuButtonRenderer;
}

export interface ButtonRenderer5 {
	style: string;
	size: string;
	text: Text9;
	icon: Icon9;
	trackingParams: string;
	command: Command3;
}

export interface Text9 {
	runs: Run8[];
}

export interface Run8 {
	text: string;
}

export interface Icon9 {
	iconType: string;
}

export interface Command3 {
	clickTrackingParams: string;
	openPopupAction: OpenPopupAction2;
}

export interface OpenPopupAction2 {
	popup: Popup2;
	popupType: string;
}

export interface Popup2 {
	multiPageMenuRenderer: MultiPageMenuRenderer;
}

export interface MultiPageMenuRenderer {
	sections: Section[];
	trackingParams: string;
	style: string;
}

export interface Section {
	multiPageMenuSectionRenderer: MultiPageMenuSectionRenderer;
}

export interface MultiPageMenuSectionRenderer {
	items: Item3[];
	trackingParams: string;
}

export interface Item3 {
	compactLinkRenderer: CompactLinkRenderer;
}

export interface CompactLinkRenderer {
	icon: Icon10;
	title: Title5;
	navigationEndpoint: NavigationEndpoint5;
	trackingParams: string;
	style: string;
}

export interface Icon10 {
	iconType: string;
}

export interface Title5 {
	runs: Run9[];
}

export interface Run9 {
	text: string;
}

export interface NavigationEndpoint5 {
	clickTrackingParams: string;
	commandMetadata: CommandMetadata24;
	uploadEndpoint?: UploadEndpoint;
	signalNavigationEndpoint?: SignalNavigationEndpoint;
	browseEndpoint?: BrowseEndpoint9;
}

export interface CommandMetadata24 {
	webCommandMetadata: WebCommandMetadata23;
}

export interface WebCommandMetadata23 {
	url: string;
	webPageType: string;
	rootVe: number;
	apiUrl?: string;
}

export interface UploadEndpoint {
	hack: boolean;
}

export interface SignalNavigationEndpoint {
	signal: string;
}

export interface BrowseEndpoint9 {
	browseId: string;
	params: string;
}

export interface NotificationTopbarButtonRenderer {
	icon: Icon11;
	menuRequest: MenuRequest;
	style: string;
	trackingParams: string;
	accessibility: Accessibility3;
	tooltip: string;
	updateUnseenCountEndpoint: UpdateUnseenCountEndpoint;
	notificationCount: number;
	handlerDatas: string[];
}

export interface Icon11 {
	iconType: string;
}

export interface MenuRequest {
	clickTrackingParams: string;
	commandMetadata: CommandMetadata25;
	signalServiceEndpoint: SignalServiceEndpoint3;
}

export interface CommandMetadata25 {
	webCommandMetadata: WebCommandMetadata24;
}

export interface WebCommandMetadata24 {
	sendPost: boolean;
}

export interface SignalServiceEndpoint3 {
	signal: string;
	actions: Action8[];
}

export interface Action8 {
	clickTrackingParams: string;
	openPopupAction: OpenPopupAction3;
}

export interface OpenPopupAction3 {
	popup: Popup3;
	popupType: string;
	beReused: boolean;
}

export interface Popup3 {
	multiPageMenuRenderer: MultiPageMenuRenderer2;
}

export interface MultiPageMenuRenderer2 {
	trackingParams: string;
	style: string;
	showLoadingSpinner: boolean;
}

export interface Accessibility3 {
	accessibilityData: AccessibilityData9;
}

export interface AccessibilityData9 {
	label: string;
}

export interface UpdateUnseenCountEndpoint {
	clickTrackingParams: string;
	commandMetadata: CommandMetadata26;
	signalServiceEndpoint: SignalServiceEndpoint4;
}

export interface CommandMetadata26 {
	webCommandMetadata: WebCommandMetadata25;
}

export interface WebCommandMetadata25 {
	sendPost: boolean;
	apiUrl: string;
}

export interface SignalServiceEndpoint4 {
	signal: string;
}

export interface TopbarMenuButtonRenderer {
	avatar: Avatar3;
	menuRequest: MenuRequest2;
	trackingParams: string;
	accessibility: Accessibility5;
	tooltip: string;
}

export interface Avatar3 {
	thumbnails: Thumbnail5[];
	accessibility: Accessibility4;
}

export interface Thumbnail5 {
	url: string;
	width: number;
	height: number;
}

export interface Accessibility4 {
	accessibilityData: AccessibilityData10;
}

export interface AccessibilityData10 {
	label: string;
}

export interface MenuRequest2 {
	clickTrackingParams: string;
	commandMetadata: CommandMetadata27;
	signalServiceEndpoint: SignalServiceEndpoint5;
}

export interface CommandMetadata27 {
	webCommandMetadata: WebCommandMetadata26;
}

export interface WebCommandMetadata26 {
	sendPost: boolean;
	apiUrl: string;
}

export interface SignalServiceEndpoint5 {
	signal: string;
	actions: Action9[];
}

export interface Action9 {
	clickTrackingParams: string;
	openPopupAction: OpenPopupAction4;
}

export interface OpenPopupAction4 {
	popup: Popup4;
	popupType: string;
	beReused: boolean;
}

export interface Popup4 {
	multiPageMenuRenderer: MultiPageMenuRenderer3;
}

export interface MultiPageMenuRenderer3 {
	trackingParams: string;
	style: string;
	showLoadingSpinner: boolean;
}

export interface Accessibility5 {
	accessibilityData: AccessibilityData11;
}

export interface AccessibilityData11 {
	label: string;
}

export interface HotkeyDialog {
	hotkeyDialogRenderer: HotkeyDialogRenderer;
}

export interface HotkeyDialogRenderer {
	title: Title6;
	sections: Section2[];
	dismissButton: DismissButton2;
	trackingParams: string;
}

export interface Title6 {
	runs: Run10[];
}

export interface Run10 {
	text: string;
}

export interface Section2 {
	hotkeyDialogSectionRenderer: HotkeyDialogSectionRenderer;
}

export interface HotkeyDialogSectionRenderer {
	title: Title7;
	options: Option[];
}

export interface Title7 {
	runs: Run11[];
}

export interface Run11 {
	text: string;
}

export interface Option {
	hotkeyDialogSectionOptionRenderer: HotkeyDialogSectionOptionRenderer;
}

export interface HotkeyDialogSectionOptionRenderer {
	label: Label;
	hotkey: string;
	hotkeyAccessibilityLabel?: HotkeyAccessibilityLabel;
	badge?: Badge2;
}

export interface Label {
	runs: Run12[];
}

export interface Run12 {
	text: string;
}

export interface HotkeyAccessibilityLabel {
	accessibilityData: AccessibilityData12;
}

export interface AccessibilityData12 {
	label: string;
}

export interface Badge2 {
	metadataBadgeRenderer: MetadataBadgeRenderer;
}

export interface MetadataBadgeRenderer {
	icon: Icon12;
	trackingParams: string;
}

export interface Icon12 {
	iconType: string;
}

export interface DismissButton2 {
	buttonRenderer: ButtonRenderer6;
}

export interface ButtonRenderer6 {
	style: string;
	size: string;
	isDisabled: boolean;
	text: Text10;
	trackingParams: string;
}

export interface Text10 {
	runs: Run13[];
}

export interface Run13 {
	text: string;
}

export interface BackButton {
	buttonRenderer: ButtonRenderer7;
}

export interface ButtonRenderer7 {
	trackingParams: string;
	command: Command4;
}

export interface Command4 {
	clickTrackingParams: string;
	commandMetadata: CommandMetadata28;
	signalServiceEndpoint: SignalServiceEndpoint6;
}

export interface CommandMetadata28 {
	webCommandMetadata: WebCommandMetadata27;
}

export interface WebCommandMetadata27 {
	sendPost: boolean;
}

export interface SignalServiceEndpoint6 {
	signal: string;
	actions: Action10[];
}

export interface Action10 {
	clickTrackingParams: string;
	signalAction: SignalAction;
}

export interface SignalAction {
	signal: string;
}

export interface ForwardButton {
	buttonRenderer: ButtonRenderer8;
}

export interface ButtonRenderer8 {
	trackingParams: string;
	command: Command5;
}

export interface Command5 {
	clickTrackingParams: string;
	commandMetadata: CommandMetadata29;
	signalServiceEndpoint: SignalServiceEndpoint7;
}

export interface CommandMetadata29 {
	webCommandMetadata: WebCommandMetadata28;
}

export interface WebCommandMetadata28 {
	sendPost: boolean;
}

export interface SignalServiceEndpoint7 {
	signal: string;
	actions: Action11[];
}

export interface Action11 {
	clickTrackingParams: string;
	signalAction: SignalAction2;
}

export interface SignalAction2 {
	signal: string;
}

export interface A11ySkipNavigationButton {
	buttonRenderer: ButtonRenderer9;
}

export interface ButtonRenderer9 {
	style: string;
	size: string;
	isDisabled: boolean;
	text: Text11;
	trackingParams: string;
	command: Command6;
}

export interface Text11 {
	runs: Run14[];
}

export interface Run14 {
	text: string;
}

export interface Command6 {
	clickTrackingParams: string;
	commandMetadata: CommandMetadata30;
	signalServiceEndpoint: SignalServiceEndpoint8;
}

export interface CommandMetadata30 {
	webCommandMetadata: WebCommandMetadata29;
}

export interface WebCommandMetadata29 {
	sendPost: boolean;
}

export interface SignalServiceEndpoint8 {
	signal: string;
	actions: Action12[];
}

export interface Action12 {
	clickTrackingParams: string;
	signalAction: SignalAction3;
}

export interface SignalAction3 {
	signal: string;
}

export interface VoiceSearchButton {
	buttonRenderer: ButtonRenderer10;
}

export interface ButtonRenderer10 {
	style: string;
	size: string;
	isDisabled: boolean;
	serviceEndpoint: ServiceEndpoint2;
	icon: Icon14;
	tooltip: string;
	trackingParams: string;
	accessibilityData: AccessibilityData15;
}

export interface ServiceEndpoint2 {
	clickTrackingParams: string;
	commandMetadata: CommandMetadata31;
	signalServiceEndpoint: SignalServiceEndpoint9;
}

export interface CommandMetadata31 {
	webCommandMetadata: WebCommandMetadata30;
}

export interface WebCommandMetadata30 {
	sendPost: boolean;
}

export interface SignalServiceEndpoint9 {
	signal: string;
	actions: Action13[];
}

export interface Action13 {
	clickTrackingParams: string;
	openPopupAction: OpenPopupAction5;
}

export interface OpenPopupAction5 {
	popup: Popup5;
	popupType: string;
}

export interface Popup5 {
	voiceSearchDialogRenderer: VoiceSearchDialogRenderer;
}

export interface VoiceSearchDialogRenderer {
	placeholderHeader: PlaceholderHeader;
	promptHeader: PromptHeader;
	exampleQuery1: ExampleQuery1;
	exampleQuery2: ExampleQuery2;
	promptMicrophoneLabel: PromptMicrophoneLabel;
	loadingHeader: LoadingHeader;
	connectionErrorHeader: ConnectionErrorHeader;
	connectionErrorMicrophoneLabel: ConnectionErrorMicrophoneLabel;
	permissionsHeader: PermissionsHeader;
	permissionsSubtext: PermissionsSubtext;
	disabledHeader: DisabledHeader;
	disabledSubtext: DisabledSubtext;
	microphoneButtonAriaLabel: MicrophoneButtonAriaLabel;
	exitButton: ExitButton;
	trackingParams: string;
	microphoneOffPromptHeader: MicrophoneOffPromptHeader;
}

export interface PlaceholderHeader {
	runs: Run15[];
}

export interface Run15 {
	text: string;
}

export interface PromptHeader {
	runs: Run16[];
}

export interface Run16 {
	text: string;
}

export interface ExampleQuery1 {
	runs: Run17[];
}

export interface Run17 {
	text: string;
}

export interface ExampleQuery2 {
	runs: Run18[];
}

export interface Run18 {
	text: string;
}

export interface PromptMicrophoneLabel {
	runs: Run19[];
}

export interface Run19 {
	text: string;
}

export interface LoadingHeader {
	runs: Run20[];
}

export interface Run20 {
	text: string;
}

export interface ConnectionErrorHeader {
	runs: Run21[];
}

export interface Run21 {
	text: string;
}

export interface ConnectionErrorMicrophoneLabel {
	runs: Run22[];
}

export interface Run22 {
	text: string;
}

export interface PermissionsHeader {
	runs: Run23[];
}

export interface Run23 {
	text: string;
}

export interface PermissionsSubtext {
	runs: Run24[];
}

export interface Run24 {
	text: string;
}

export interface DisabledHeader {
	runs: Run25[];
}

export interface Run25 {
	text: string;
}

export interface DisabledSubtext {
	runs: Run26[];
}

export interface Run26 {
	text: string;
}

export interface MicrophoneButtonAriaLabel {
	runs: Run27[];
}

export interface Run27 {
	text: string;
}

export interface ExitButton {
	buttonRenderer: ButtonRenderer11;
}

export interface ButtonRenderer11 {
	style: string;
	size: string;
	isDisabled: boolean;
	icon: Icon13;
	trackingParams: string;
	accessibilityData: AccessibilityData13;
}

export interface Icon13 {
	iconType: string;
}

export interface AccessibilityData13 {
	accessibilityData: AccessibilityData14;
}

export interface AccessibilityData14 {
	label: string;
}

export interface MicrophoneOffPromptHeader {
	runs: Run28[];
}

export interface Run28 {
	text: string;
}

export interface Icon14 {
	iconType: string;
}

export interface AccessibilityData15 {
	accessibilityData: AccessibilityData16;
}

export interface AccessibilityData16 {
	label: string;
}

export interface Microformat {
	microformatDataRenderer: MicroformatDataRenderer;
}

export interface MicroformatDataRenderer {
	urlCanonical: string;
	title: string;
	description: string;
	thumbnail: Thumbnail6;
	siteName: string;
	appName: string;
	androidPackage: string;
	iosAppStoreId: string;
	iosAppArguments: string;
	ogType: string;
	urlApplinksWeb: string;
	urlApplinksIos: string;
	urlApplinksAndroid: string;
	urlTwitterIos: string;
	urlTwitterAndroid: string;
	twitterCardType: string;
	twitterSiteHandle: string;
	schemaDotOrgType: string;
	noindex: boolean;
	unlisted: boolean;
	linkAlternates: LinkAlternate[];
}

export interface Thumbnail6 {
	thumbnails: Thumbnail7[];
	sampledThumbnailColor: SampledThumbnailColor;
	darkColorPalette: DarkColorPalette;
	vibrantColorPalette: VibrantColorPalette;
}

export interface Thumbnail7 {
	url: string;
	width: number;
	height: number;
}

export interface SampledThumbnailColor {
	red: number;
	green: number;
	blue: number;
}

export interface DarkColorPalette {
	section2Color: number;
	iconInactiveColor: number;
	iconDisabledColor: number;
}

export interface VibrantColorPalette {
	iconInactiveColor: number;
}

export interface LinkAlternate {
	hrefUrl: string;
}

export interface Sidebar {
	playlistSidebarRenderer: PlaylistSidebarRenderer;
}

export interface PlaylistSidebarRenderer {
	items: Item4[];
	trackingParams: string;
}

export interface Item4 {
	playlistSidebarPrimaryInfoRenderer?: PlaylistSidebarPrimaryInfoRenderer;
	playlistSidebarSecondaryInfoRenderer?: PlaylistSidebarSecondaryInfoRenderer;
}

export interface PlaylistSidebarPrimaryInfoRenderer {
	thumbnailRenderer: ThumbnailRenderer;
	title: Title8;
	stats: Stat2[];
	menu: Menu;
	thumbnailOverlays: ThumbnailOverlay[];
	navigationEndpoint: NavigationEndpoint9;
	badges: Badge3[];
	showMoreText: ShowMoreText;
}

export interface ThumbnailRenderer {
	playlistVideoThumbnailRenderer: PlaylistVideoThumbnailRenderer;
}

export interface PlaylistVideoThumbnailRenderer {
	thumbnail: Thumbnail8;
	trackingParams: string;
}

export interface Thumbnail8 {
	thumbnails: Thumbnail9[];
}

export interface Thumbnail9 {
	url: string;
	width: number;
	height: number;
}

export interface Title8 {
	runs: Run29[];
}

export interface Run29 {
	text: string;
	navigationEndpoint: NavigationEndpoint6;
}

export interface NavigationEndpoint6 {
	clickTrackingParams: string;
	commandMetadata: CommandMetadata32;
	watchEndpoint: WatchEndpoint7;
}

export interface CommandMetadata32 {
	webCommandMetadata: WebCommandMetadata31;
}

export interface WebCommandMetadata31 {
	url: string;
	webPageType: string;
	rootVe: number;
}

export interface WatchEndpoint7 {
	videoId: string;
	playlistId: string;
	playerParams: string;
	loggingContext: LoggingContext9;
	watchEndpointSupportedOnesieConfig: WatchEndpointSupportedOnesieConfig7;
}

export interface LoggingContext9 {
	vssLoggingContext: VssLoggingContext5;
}

export interface VssLoggingContext5 {
	serializedContextData: string;
}

export interface WatchEndpointSupportedOnesieConfig7 {
	html5PlaybackOnesieConfig: Html5PlaybackOnesieConfig7;
}

export interface Html5PlaybackOnesieConfig7 {
	commonConfig: CommonConfig7;
}

export interface CommonConfig7 {
	url: string;
}

export interface Stat2 {
	runs?: Run30[];
	simpleText?: string;
}

export interface Run30 {
	text: string;
}

export interface Menu {
	menuRenderer: MenuRenderer2;
}

export interface MenuRenderer2 {
	items: Item5[];
	trackingParams: string;
	topLevelButtons: TopLevelButton[];
	accessibility: Accessibility7;
	targetId: string;
}

export interface Item5 {
	menuNavigationItemRenderer: MenuNavigationItemRenderer2;
}

export interface MenuNavigationItemRenderer2 {
	text: Text12;
	icon: Icon15;
	navigationEndpoint: NavigationEndpoint7;
	trackingParams: string;
}

export interface Text12 {
	simpleText: string;
}

export interface Icon15 {
	iconType: string;
}

export interface NavigationEndpoint7 {
	clickTrackingParams: string;
	commandMetadata: CommandMetadata33;
	browseEndpoint: BrowseEndpoint10;
}

export interface CommandMetadata33 {
	webCommandMetadata: WebCommandMetadata32;
}

export interface WebCommandMetadata32 {
	url: string;
	webPageType: string;
	rootVe: number;
	apiUrl: string;
}

export interface BrowseEndpoint10 {
	browseId: string;
	params: string;
	nofollow: boolean;
	navigationType: string;
}

export interface TopLevelButton {
	buttonRenderer: ButtonRenderer12;
}

export interface ButtonRenderer12 {
	style: string;
	size: string;
	isDisabled: boolean;
	icon: Icon16;
	navigationEndpoint: NavigationEndpoint8;
	accessibility: Accessibility6;
	tooltip: string;
	trackingParams: string;
}

export interface Icon16 {
	iconType: string;
}

export interface NavigationEndpoint8 {
	clickTrackingParams: string;
	commandMetadata: CommandMetadata34;
	watchEndpoint: WatchEndpoint8;
}

export interface CommandMetadata34 {
	webCommandMetadata: WebCommandMetadata33;
}

export interface WebCommandMetadata33 {
	url: string;
	webPageType: string;
	rootVe: number;
}

export interface WatchEndpoint8 {
	videoId: string;
	playlistId: string;
	params: string;
	playerParams: string;
	loggingContext: LoggingContext10;
	watchEndpointSupportedOnesieConfig: WatchEndpointSupportedOnesieConfig8;
}

export interface LoggingContext10 {
	vssLoggingContext: VssLoggingContext6;
}

export interface VssLoggingContext6 {
	serializedContextData: string;
}

export interface WatchEndpointSupportedOnesieConfig8 {
	html5PlaybackOnesieConfig: Html5PlaybackOnesieConfig8;
}

export interface Html5PlaybackOnesieConfig8 {
	commonConfig: CommonConfig8;
}

export interface CommonConfig8 {
	url: string;
}

export interface Accessibility6 {
	label: string;
}

export interface Accessibility7 {
	accessibilityData: AccessibilityData17;
}

export interface AccessibilityData17 {
	label: string;
}

export interface ThumbnailOverlay {
	thumbnailOverlaySidePanelRenderer: ThumbnailOverlaySidePanelRenderer;
}

export interface ThumbnailOverlaySidePanelRenderer {
	text: Text13;
	icon: Icon17;
}

export interface Text13 {
	simpleText: string;
}

export interface Icon17 {
	iconType: string;
}

export interface NavigationEndpoint9 {
	clickTrackingParams: string;
	commandMetadata: CommandMetadata35;
	watchEndpoint: WatchEndpoint9;
}

export interface CommandMetadata35 {
	webCommandMetadata: WebCommandMetadata34;
}

export interface WebCommandMetadata34 {
	url: string;
	webPageType: string;
	rootVe: number;
}

export interface WatchEndpoint9 {
	videoId: string;
	playlistId: string;
	playerParams: string;
	loggingContext: LoggingContext11;
	watchEndpointSupportedOnesieConfig: WatchEndpointSupportedOnesieConfig9;
}

export interface LoggingContext11 {
	vssLoggingContext: VssLoggingContext7;
}

export interface VssLoggingContext7 {
	serializedContextData: string;
}

export interface WatchEndpointSupportedOnesieConfig9 {
	html5PlaybackOnesieConfig: Html5PlaybackOnesieConfig9;
}

export interface Html5PlaybackOnesieConfig9 {
	commonConfig: CommonConfig9;
}

export interface CommonConfig9 {
	url: string;
}

export interface Badge3 {
	metadataBadgeRenderer: MetadataBadgeRenderer2;
}

export interface MetadataBadgeRenderer2 {
	icon: Icon18;
	style: string;
	label: string;
	trackingParams: string;
}

export interface Icon18 {
	iconType: string;
}

export interface ShowMoreText {
	runs: Run31[];
}

export interface Run31 {
	text: string;
}

export interface PlaylistSidebarSecondaryInfoRenderer {
	videoOwner: VideoOwner;
}

export interface VideoOwner {
	videoOwnerRenderer: VideoOwnerRenderer;
}

export interface VideoOwnerRenderer {
	thumbnail: Thumbnail10;
	title: Title9;
	navigationEndpoint: NavigationEndpoint11;
	trackingParams: string;
}

export interface Thumbnail10 {
	thumbnails: Thumbnail11[];
}

export interface Thumbnail11 {
	url: string;
	width: number;
	height: number;
}

export interface Title9 {
	runs: Run32[];
}

export interface Run32 {
	text: string;
	navigationEndpoint: NavigationEndpoint10;
}

export interface NavigationEndpoint10 {
	clickTrackingParams: string;
	commandMetadata: CommandMetadata36;
	browseEndpoint: BrowseEndpoint11;
}

export interface CommandMetadata36 {
	webCommandMetadata: WebCommandMetadata35;
}

export interface WebCommandMetadata35 {
	url: string;
	webPageType: string;
	rootVe: number;
	apiUrl: string;
}

export interface BrowseEndpoint11 {
	browseId: string;
	canonicalBaseUrl: string;
}

export interface NavigationEndpoint11 {
	clickTrackingParams: string;
	commandMetadata: CommandMetadata37;
	browseEndpoint: BrowseEndpoint12;
}

export interface CommandMetadata37 {
	webCommandMetadata: WebCommandMetadata36;
}

export interface WebCommandMetadata36 {
	url: string;
	webPageType: string;
	rootVe: number;
	apiUrl: string;
}

export interface BrowseEndpoint12 {
	browseId: string;
	canonicalBaseUrl: string;
}
