export interface YTDLResponse {
	responseContext: ResponseContext;
	contents: Contents;
	currentVideoEndpoint: NextEndpoint3;
	trackingParams: string;
	playerOverlays: PlayerOverlays;
	onResponseReceivedEndpoints: OnResponseReceivedEndpoint[];
	engagementPanels: EngagementPanel[];
	topbar: Topbar;
	pageVisualEffects: PageVisualEffect[];
	frameworkUpdates: FrameworkUpdates;
}
export interface FrameworkUpdates {
	entityBatchUpdate: EntityBatchUpdate;
}
export interface EntityBatchUpdate {
	mutations: Mutation[];
	timestamp: Timestamp;
}
export interface Timestamp {
	seconds: string;
	nanos: number;
}
export interface Mutation {
	entityKey: string;
	type: string;
	payload?: Payload;
	options?: Options;
}
export interface Options {
	persistenceOption: string;
}
export interface Payload {
	macroMarkersListEntity?: MacroMarkersListEntity;
	likeStatusEntity?: LikeStatusEntity;
	subscriptionStateEntity?: SubscriptionStateEntity;
}
export interface SubscriptionStateEntity {
	key: string;
	subscribed: boolean;
}
export interface MacroMarkersListEntity {
	key: string;
	externalVideoId: string;
	markersList: MarkersList;
}
export interface MarkersList {
	markerType: string;
	markers: Marker[];
	markersMetadata: MarkersMetadata;
	markersDecoration: MarkersDecoration;
}
export interface MarkersDecoration {
	timedMarkerDecorations: TimedMarkerDecoration[];
}
export interface TimedMarkerDecoration {
	visibleTimeRangeStartMillis: number;
	visibleTimeRangeEndMillis: number;
	decorationTimeMillis: number;
	label: Title;
	icon: string;
}
export interface MarkersMetadata {
	heatmapMetadata: HeatmapMetadata;
}
export interface HeatmapMetadata {
	maxHeightDp: number;
	minHeightDp: number;
	showHideAnimationDurationMillis: number;
}
export interface Marker {
	startMillis: string;
	durationMillis: string;
	intensityScoreNormalized: number;
}
export interface PageVisualEffect {
	cinematicContainerRenderer: CinematicContainerRenderer;
}
export interface CinematicContainerRenderer {
	presentationStyle: string;
	config: Config2;
	colorStore: ColorStore;
}
export interface ColorStore {
	sampledColors: ColorMap[];
}
export interface Config2 {
	lightThemeBackgroundColor: number;
	darkThemeBackgroundColor: number;
	animationConfig: AnimationConfig;
	colorSourceSizeMultiplier: number;
	applyClientImageBlur: boolean;
	bottomColorSourceHeightMultiplier: number;
	maxBottomColorSourceHeight: number;
	colorSourceWidthMultiplier: number;
	colorSourceHeightMultiplier: number;
	blurStrength: number;
	watchFullscreenConfig: WatchFullscreenConfig;
	enableInLightTheme: boolean;
}
export interface WatchFullscreenConfig {
	colorSourceWidthMultiplier: number;
	colorSourceHeightMultiplier: number;
	scrimWidthMultiplier: number;
	scrimHeightMultiplier: number;
	scrimGradientConfig: ScrimGradientConfig;
}
export interface ScrimGradientConfig {
	gradientType: string;
	gradientStartPointX: number;
	gradientStartPointY: number;
	gradientEndPointX: number;
	gradientEndPointY: number;
}
export interface AnimationConfig {
	minImageUpdateIntervalMs: number;
	crossfadeDurationMs: number;
	crossfadeStartOffset: number;
	maxFrameRate: number;
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
	forwardButton: BackButton;
	a11ySkipNavigationButton: A11ySkipNavigationButton;
	voiceSearchButton: VoiceSearchButton;
}
export interface VoiceSearchButton {
	buttonRenderer: ButtonRenderer23;
}
export interface ButtonRenderer23 {
	style: string;
	size: string;
	isDisabled: boolean;
	serviceEndpoint: ServiceEndpoint9;
	icon: Icon;
	tooltip: string;
	trackingParams: string;
	accessibilityData: Accessibility;
}
export interface ServiceEndpoint9 {
	clickTrackingParams: string;
	commandMetadata: CommandMetadata6;
	signalServiceEndpoint: SignalServiceEndpoint6;
}
export interface SignalServiceEndpoint6 {
	signal: string;
	actions: Action8[];
}
export interface Action8 {
	clickTrackingParams: string;
	openPopupAction: OpenPopupAction6;
}
export interface OpenPopupAction6 {
	popup: Popup6;
	popupType: string;
}
export interface Popup6 {
	voiceSearchDialogRenderer: VoiceSearchDialogRenderer;
}
export interface VoiceSearchDialogRenderer {
	placeholderHeader: Title;
	promptHeader: Title;
	exampleQuery1: Title;
	exampleQuery2: Title;
	promptMicrophoneLabel: Title;
	loadingHeader: Title;
	connectionErrorHeader: Title;
	connectionErrorMicrophoneLabel: Title;
	permissionsHeader: Title;
	permissionsSubtext: Title;
	disabledHeader: Title;
	disabledSubtext: Title;
	microphoneButtonAriaLabel: Title;
	exitButton: ClearButton;
	trackingParams: string;
	microphoneOffPromptHeader: Title;
}
export interface A11ySkipNavigationButton {
	buttonRenderer: ButtonRenderer22;
}
export interface ButtonRenderer22 {
	style: string;
	size: string;
	isDisabled: boolean;
	text: Title;
	trackingParams: string;
	command: ServiceEndpoint8;
}
export interface BackButton {
	buttonRenderer: ButtonRenderer21;
}
export interface ButtonRenderer21 {
	trackingParams: string;
	command: ServiceEndpoint8;
}
export interface HotkeyDialog {
	hotkeyDialogRenderer: HotkeyDialogRenderer;
}
export interface HotkeyDialogRenderer {
	title: Title;
	sections: Section[];
	dismissButton: DismissButton;
	trackingParams: string;
}
export interface DismissButton {
	buttonRenderer: ButtonRenderer20;
}
export interface ButtonRenderer20 {
	style: string;
	size: string;
	isDisabled: boolean;
	text: Title;
	trackingParams: string;
}
export interface Section {
	hotkeyDialogSectionRenderer: HotkeyDialogSectionRenderer;
}
export interface HotkeyDialogSectionRenderer {
	title: Title;
	options: Option[];
}
export interface Option {
	hotkeyDialogSectionOptionRenderer: HotkeyDialogSectionOptionRenderer;
}
export interface HotkeyDialogSectionOptionRenderer {
	label: Title;
	hotkey: string;
	hotkeyAccessibilityLabel?: Accessibility;
}
export interface TopbarButton {
	topbarMenuButtonRenderer?: TopbarMenuButtonRenderer;
	buttonRenderer?: ButtonRenderer19;
}
export interface ButtonRenderer19 {
	style: string;
	size: string;
	text: Title;
	icon: Icon;
	navigationEndpoint: NavigationEndpoint12;
	trackingParams: string;
	targetId: string;
}
export interface NavigationEndpoint12 {
	clickTrackingParams: string;
	commandMetadata: CommandMetadata;
	signInEndpoint: SignInEndpoint7;
}
export interface SignInEndpoint7 {
	idamTag: string;
}
export interface TopbarMenuButtonRenderer {
	icon: Icon;
	menuRequest: MenuRequest;
	trackingParams: string;
	accessibility: Accessibility;
	tooltip: string;
	style: string;
}
export interface MenuRequest {
	clickTrackingParams: string;
	commandMetadata: CommandMetadata3;
	signalServiceEndpoint: SignalServiceEndpoint5;
}
export interface SignalServiceEndpoint5 {
	signal: string;
	actions: Action7[];
}
export interface Action7 {
	clickTrackingParams: string;
	openPopupAction: OpenPopupAction5;
}
export interface OpenPopupAction5 {
	popup: Popup5;
	popupType: string;
	beReused: boolean;
}
export interface Popup5 {
	multiPageMenuRenderer: MultiPageMenuRenderer;
}
export interface MultiPageMenuRenderer {
	trackingParams: string;
	style: string;
	showLoadingSpinner: boolean;
}
export interface Searchbox {
	fusionSearchboxRenderer: FusionSearchboxRenderer;
}
export interface FusionSearchboxRenderer {
	icon: Icon;
	placeholderText: Title;
	config: Config;
	trackingParams: string;
	searchEndpoint: SearchEndpoint2;
	clearButton: ClearButton;
}
export interface ClearButton {
	buttonRenderer: ButtonRenderer18;
}
export interface ButtonRenderer18 {
	style: string;
	size: string;
	isDisabled: boolean;
	icon: Icon;
	trackingParams: string;
	accessibilityData: Accessibility;
}
export interface SearchEndpoint2 {
	clickTrackingParams: string;
	commandMetadata: CommandMetadata;
	searchEndpoint: SearchEndpoint;
}
export interface SearchEndpoint {
	query: string;
}
export interface Config {
	webSearchboxConfig: WebSearchboxConfig;
}
export interface WebSearchboxConfig {
	requestLanguage: string;
	requestDomain: string;
	hasOnscreenKeyboard: boolean;
	focusSearchbox: boolean;
}
export interface Logo {
	topbarLogoRenderer: TopbarLogoRenderer;
}
export interface TopbarLogoRenderer {
	iconImage: Icon;
	tooltipText: Title;
	endpoint: InnertubeCommand7;
	trackingParams: string;
	overrideEntityKey: string;
}
export interface EngagementPanel {
	engagementPanelSectionListRenderer: EngagementPanelSectionListRendererComments | EngagementPanelSectionListRendererAds | EngagementPanelSectionListRendererStructDescription | EngagementPanelSectionListRendererTranscript;
}
export type EngagementVisibility = "ENGAGEMENT_PANEL_VISIBILITY_HIDDEN";
export interface EngagementPanelSectionListRendererComments {
	panelIdentifier?: "engagement-panel-comments-section";
	header: Header;
	content: { sectionListRenderer: SectionListRenderer };
	veType: number;
	targetId: "engagement-panel-comments-section";
	visibility: EngagementVisibility;
	loggingDirectives: LoggingDirectives;
}
export interface EngagementPanelSectionListRendererAds {
	content: { adsEngagementPanelContentRenderer: SignInEndpoint };
	targetId: "engagement-panel-ads";
	visibility: EngagementVisibility;
	loggingDirectives: LoggingDirectives;
}
export interface EngagementPanelSectionListRendererStructDescription {
	panelIdentifier: "engagement-panel-structured-description";
	header: Header;
	content: { structuredDescriptionContentRenderer: StructuredDescriptionContentRenderer };
	veType: number;
	targetId: "engagement-panel-structured-description";
	visibility: EngagementVisibility;
	loggingDirectives: LoggingDirectives;
	onShowCommands?: OnShowCommand[];
}
export interface EngagementPanelSectionListRendererTranscript {
	panelIdentifier: "engagement-panel-searchable-transcript";
	header: Header;
	content: { continuationItemRenderer: ContinuationItemRenderer3 };
	veType: number;
	targetId: "engagement-panel-searchable-transcript";
	visibility: EngagementVisibility;
	loggingDirectives: LoggingDirectives;
	onShowCommands?: OnShowCommand[];
}
export interface OnShowCommand {
	clickTrackingParams: string;
	scrollToEngagementPanelCommand: ScrollToEngagementPanelCommand;
}
export interface ContinuationItemRenderer3 {
	trigger: string;
	continuationEndpoint: ContinuationEndpoint2;
}
export interface ContinuationEndpoint2 {
	clickTrackingParams: string;
	commandMetadata: CommandMetadata3;
	getTranscriptEndpoint: ModifyChannelNotificationPreferenceEndpoint;
}
export interface StructuredDescriptionContentRenderer {
	items: Item6[];
}
export interface Item6 {
	videoDescriptionHeaderRenderer?: VideoDescriptionHeaderRenderer;
	expandableVideoDescriptionBodyRenderer?: ExpandableVideoDescriptionBodyRenderer;
	horizontalCardListRenderer?: HorizontalCardListRenderer;
	reelShelfRenderer?: ReelShelfRenderer;
	videoDescriptionTranscriptSectionRenderer?: VideoDescriptionTranscriptSectionRenderer;
	videoDescriptionInfocardsSectionRenderer?: VideoDescriptionInfocardsSectionRenderer;
}
export interface VideoDescriptionInfocardsSectionRenderer {
	sectionTitle: ViewCount;
	creatorVideosButton: CreatorVideosButton;
	creatorAboutButton: CreatorVideosButton;
	sectionSubtitle: RelativeDateText;
	channelAvatar: ChannelThumbnail;
	channelEndpoint: NavigationEndpoint7;
	creatorCustomUrlButtons: CreatorCustomUrlButton[];
	trackingParams: string;
}
export interface CreatorCustomUrlButton {
	buttonViewModel: ButtonViewModel7;
}
export interface ButtonViewModel7 {
	title: string;
	onTap: OnTap11;
	style: string;
	trackingParams: string;
	type: string;
	buttonSize: string;
	iconImage: Thumbnail;
}
export interface OnTap11 {
	innertubeCommand: InnertubeCommand11;
}
export interface InnertubeCommand11 {
	clickTrackingParams: string;
	commandMetadata: CommandMetadata;
	urlEndpoint: UrlEndpoint2;
}
export interface UrlEndpoint2 {
	url: string;
	target: string;
}
export interface CreatorVideosButton {
	buttonRenderer: ButtonRenderer17;
}
export interface ButtonRenderer17 {
	style: string;
	size: string;
	isDisabled: boolean;
	text: ViewCount;
	icon: Icon;
	trackingParams: string;
	command: Command16;
}
export interface Command16 {
	clickTrackingParams: string;
	commandMetadata: CommandMetadata4;
	browseEndpoint: BrowseEndpoint3;
}
export interface BrowseEndpoint3 {
	browseId: string;
	params: string;
}
export interface VideoDescriptionTranscriptSectionRenderer {
	sectionTitle: Title;
	subHeaderText: Title;
	primaryButton: PrimaryButton;
	trackingParams: string;
}
export interface PrimaryButton {
	buttonRenderer: ButtonRenderer16;
}
export interface ButtonRenderer16 {
	style: string;
	size: string;
	isDisabled: boolean;
	text: Title;
	trackingParams: string;
	command: Command15;
}
export interface Command15 {
	clickTrackingParams: string;
	commandExecutorCommand: CommandExecutorCommand4;
}
export interface CommandExecutorCommand4 {
	commands: Command14[];
}
export interface Command14 {
	clickTrackingParams: string;
	showEngagementPanelEndpoint?: ShowEngagementPanelEndpoint;
	scrollToEngagementPanelCommand?: ScrollToEngagementPanelCommand;
}
export interface ShowEngagementPanelEndpoint {
	panelIdentifier: string;
	sourcePanelIdentifier: string;
}
export interface ReelShelfRenderer {
	title: Title;
	items: Item5[];
	trackingParams: string;
}
export interface Item5 {
	shortsLockupViewModel: ShortsLockupViewModel;
}
export interface ShortsLockupViewModel {
	entityId: string;
	accessibilityText: string;
	thumbnail: Thumbnail3;
	onTap: OnTap9;
	menuOnTap: MenuOnTap;
	indexInCollection: number;
	menuOnTapA11yLabel: string;
	overlayMetadata: OverlayMetadata;
	loggingDirectives: LoggingDirectives;
}
export interface OverlayMetadata {
	primaryText: BodyText;
	secondaryText: BodyText;
}
export interface MenuOnTap {
	innertubeCommand: InnertubeCommand10;
}
export interface InnertubeCommand10 {
	clickTrackingParams: string;
	showSheetCommand: ShowSheetCommand;
}
export interface ShowSheetCommand {
	panelLoadingStrategy: PanelLoadingStrategy;
}
export interface PanelLoadingStrategy {
	inlineContent: InlineContent;
}
export interface InlineContent {
	sheetViewModel: SheetViewModel;
}
export interface SheetViewModel {
	content: Content5;
}
export interface Content5 {
	listViewModel: ListViewModel;
}
export interface ListViewModel {
	listItems: ListItem[];
}
export interface ListItem {
	listItemViewModel: ListItemViewModel;
}
export interface ListItemViewModel {
	title: BodyText;
	leadingImage: LeadingImage;
	rendererContext: RendererContext;
}
export interface RendererContext {
	loggingContext?: LoggingContext2;
	commandContext: CommandContext;
}
export interface CommandContext {
	onTap: OnTap10;
}
export interface OnTap10 {
	innertubeCommand: InnertubeCommand9;
}
export interface InnertubeCommand9 {
	clickTrackingParams: string;
	commandMetadata: CommandMetadata9;
	signalServiceEndpoint?: SignalServiceEndpoint2;
	userFeedbackEndpoint?: UserFeedbackEndpoint;
}
export interface UserFeedbackEndpoint {
	additionalDatas: AdditionalData[];
}
export interface AdditionalData {
	userFeedbackEndpointProductSpecificValueData: Param;
}
export interface CommandMetadata9 {
	webCommandMetadata: WebCommandMetadata7;
}
export interface WebCommandMetadata7 {
	sendPost?: boolean;
	ignoreNavigation?: boolean;
}
export interface LoggingContext2 {
	loggingDirectives: LoggingDirectives2;
}
export interface LoggingDirectives2 {
	trackingParams: string;
	enableDisplayloggerExperiment: boolean;
}
export interface LeadingImage {
	sources: Source[];
}
export interface Source {
	clientResource: ClientResource;
}
export interface ClientResource {
	imageName: string;
}
export interface OnTap9 {
	innertubeCommand: InnertubeCommand8;
}
export interface InnertubeCommand8 {
	clickTrackingParams: string;
	commandMetadata: CommandMetadata;
	reelWatchEndpoint: ReelWatchEndpoint;
}
export interface ReelWatchEndpoint {
	videoId: string;
	playerParams: string;
	thumbnail: Thumbnail4;
	overlay: Overlay;
	params: string;
	sequenceProvider: string;
	sequenceParams: string;
	loggingContext: LoggingContext;
	ustreamerConfig: string;
}
export interface LoggingContext {
	vssLoggingContext: VssLoggingContext;
	qoeLoggingContext: VssLoggingContext;
}
export interface VssLoggingContext {
	serializedContextData: string;
}
export interface Overlay {
	reelPlayerOverlayRenderer: ReelPlayerOverlayRenderer;
}
export interface ReelPlayerOverlayRenderer {
	style: string;
	trackingParams: string;
	reelPlayerNavigationModel: string;
}
export interface Thumbnail4 {
	thumbnails: Thumbnail[];
	isOriginalAspectRatio: boolean;
}
export interface Thumbnail3 {
	sources: Thumbnail[];
}
export interface HorizontalCardListRenderer {
	cards: Card[];
	trackingParams: string;
	header: Header2;
	style: SubscriptionButton;
	footerButton: FooterButton;
}
export interface FooterButton {
	buttonViewModel: ButtonViewModel6;
}
export interface ButtonViewModel6 {
	iconName: string;
	onTap: OnTap8;
	style: string;
	trackingParams: string;
	type: string;
	buttonSize: string;
	titleFormatted: BodyText;
}
export interface OnTap8 {
	innertubeCommand: InnertubeCommand7;
}
export interface InnertubeCommand7 {
	clickTrackingParams: string;
	commandMetadata: CommandMetadata4;
	browseEndpoint: BrowseEndpoint2;
}
export interface BrowseEndpoint2 {
	browseId: string;
}
export interface Header2 {
	richListHeaderRenderer: RichListHeaderRenderer;
}
export interface RichListHeaderRenderer {
	title: ViewCount;
	subtitle: ViewCount;
	trackingParams: string;
}
export interface Card {
	videoAttributeViewModel: VideoAttributeViewModel;
}
export interface VideoAttributeViewModel {
	image: Image;
	imageStyle: string;
	title: string;
	subtitle: string;
	secondarySubtitle: BodyText;
	orientation: string;
	onTap: OnTap7;
	sizingRule: string;
	overflowMenuOnTap: OverflowMenuOnTap;
	overflowMenuA11yLabel: string;
	loggingDirectives: LoggingDirectives;
}
export interface LoggingDirectives {
	trackingParams: string;
	visibility: Visibility;
	enableDisplayloggerExperiment: boolean;
}
export interface Visibility {
	types: string;
}
export interface OverflowMenuOnTap {
	innertubeCommand: InnertubeCommand6;
}
export interface InnertubeCommand6 {
	clickTrackingParams: string;
	commandMetadata: CommandMetadata2;
	confirmDialogEndpoint: ConfirmDialogEndpoint;
}
export interface ConfirmDialogEndpoint {
	content: Content4;
}
export interface Content4 {
	confirmDialogRenderer: ConfirmDialogRenderer2;
}
export interface ConfirmDialogRenderer2 {
	title: Title;
	trackingParams: string;
	dialogMessages: DialogMessage[];
	confirmButton: ConfirmButton2;
	primaryIsCancel: boolean;
}
export interface ConfirmButton2 {
	buttonRenderer: ButtonRenderer15;
}
export interface ButtonRenderer15 {
	style: string;
	size: string;
	isDisabled: boolean;
	text: Title;
	trackingParams: string;
	accessibilityData: Accessibility;
}
export interface DialogMessage {
	runs: Run5[];
}
export interface Run5 {
	text: string;
	bold?: boolean;
}
export interface OnTap7 {
	innertubeCommand: NextEndpoint3;
}
export interface ExpandableVideoDescriptionBodyRenderer {
	showMoreText: RelativeDateText;
	showLessText: ViewCount;
	attributedDescriptionBodyText: AttributedDescription;
	headerRuns: HeaderRun[];
}
export interface VideoDescriptionHeaderRenderer {
	title: Title;
	channel: ViewCount;
	views: ViewCount;
	publishDate: ViewCount;
	factoid: Factoid2[];
	channelNavigationEndpoint: NavigationEndpoint7;
	channelThumbnail: ChannelThumbnail;
}
export interface ChannelThumbnail {
	thumbnails: CommonConfig[];
}
export interface Factoid2 {
	factoidRenderer?: FactoidRenderer;
	viewCountFactoidRenderer?: ViewCountFactoidRenderer;
}
export interface ViewCountFactoidRenderer {
	viewCountEntityKey: string;
	factoid: Factoid;
	viewCountType: string;
}
export interface Factoid {
	factoidRenderer: FactoidRenderer;
}
export interface FactoidRenderer {
	value: ViewCount;
	label: ViewCount;
	accessibilityText: string;
}
export interface SectionListRenderer {
	contents: Content3[];
	trackingParams: string;
}
export interface Content3 {
	itemSectionRenderer: ItemSectionRenderer;
}
export interface Header {
	engagementPanelTitleHeaderRenderer: EngagementPanelTitleHeaderRenderer;
}
export interface EngagementPanelTitleHeaderRenderer {
	title: Text;
	contextualInfo?: Title;
	menu?: Menu2;
	visibilityButton: VisibilityButton;
	trackingParams: string;
}
export interface VisibilityButton {
	buttonRenderer: ButtonRenderer14;
}
export interface ButtonRenderer14 {
	style?: string;
	size?: string;
	icon: Icon;
	trackingParams: string;
	accessibilityData: Accessibility;
	command: Command13;
	accessibility?: AccessibilityData;
}
export interface Command13 {
	clickTrackingParams: string;
	hideEngagementPanelEndpoint?: HideEngagementPanelEndpoint;
	commandExecutorCommand?: CommandExecutorCommand3;
	changeEngagementPanelVisibilityAction?: ChangeEngagementPanelVisibilityAction;
}
export interface CommandExecutorCommand3 {
	commands: Command12[];
}
export interface Command12 {
	clickTrackingParams: string;
	changeEngagementPanelVisibilityAction?: ChangeEngagementPanelVisibilityAction;
	updateToggleButtonStateCommand?: UpdateToggleButtonStateCommand;
}
export interface UpdateToggleButtonStateCommand {
	toggled: boolean;
	buttonId: string;
}
export interface HideEngagementPanelEndpoint {
	panelIdentifier: string;
}
export interface Menu2 {
	sortFilterSubMenuRenderer?: SortFilterSubMenuRenderer;
	menuRenderer?: MenuRenderer4;
}
export interface MenuRenderer4 {
	items: Item4[];
	trackingParams: string;
	accessibility: Accessibility;
}
export interface Item4 {
	menuServiceItemRenderer: MenuServiceItemRenderer4;
}
export interface MenuServiceItemRenderer4 {
	text: Title;
	serviceEndpoint: ServiceEndpoint8;
	trackingParams: string;
}
export interface ServiceEndpoint8 {
	clickTrackingParams: string;
	commandMetadata: CommandMetadata6;
	signalServiceEndpoint: SignalServiceEndpoint4;
}
export interface SortFilterSubMenuRenderer {
	subMenuItems: SubMenuItem[];
	icon: Icon;
	accessibility: Accessibility;
	trackingParams: string;
}
export interface SubMenuItem {
	title: string;
	selected: boolean;
	serviceEndpoint: ServiceEndpoint7;
	trackingParams: string;
}
export interface ServiceEndpoint7 {
	clickTrackingParams: string;
	commandMetadata: CommandMetadata3;
	continuationCommand: ContinuationCommand2;
}
export interface ContinuationCommand2 {
	token: string;
	request: string;
	command: Command11;
}
export interface Command11 {
	clickTrackingParams: string;
	showReloadUiCommand: ScrollToEngagementPanelCommand;
}
export interface OnResponseReceivedEndpoint {
	clickTrackingParams: string;
	commandMetadata?: CommandMetadata6;
	signalServiceEndpoint?: SignalServiceEndpoint4;
	loadMarkersCommand?: LoadMarkersCommand;
}
export interface LoadMarkersCommand {
	visibleOnLoadKeys: string[];
	entityKeys: string[];
}
export interface SignalServiceEndpoint4 {
	signal: string;
	actions: Action6[];
}
export interface Action6 {
	clickTrackingParams: string;
	signalAction: SignalAction;
}
export interface SignalAction {
	signal: string;
}
export interface PlayerOverlays {
	playerOverlayRenderer: PlayerOverlayRenderer;
}
export interface PlayerOverlayRenderer {
	endScreen: EndScreen;
	autoplay: Autoplay3;
	shareButton: ShareButton;
	addToMenu: AddToMenu;
	videoDetails: VideoDetails;
	autonavToggle: AutonavToggle;
	decoratedPlayerBarRenderer: DecoratedPlayerBarRenderer2;
	speedmasterUserEdu: SpeedmasterUserEdu;
}
export interface SpeedmasterUserEdu {
	speedmasterEduViewModel: SpeedmasterEduViewModel;
}
export interface SpeedmasterEduViewModel {
	bodyText: BodyText;
}
export interface BodyText {
	content: string;
}
export interface DecoratedPlayerBarRenderer2 {
	decoratedPlayerBarRenderer: DecoratedPlayerBarRenderer;
}
export interface DecoratedPlayerBarRenderer {
	playerBar: PlayerBar;
}
export interface PlayerBar {
	multiMarkersPlayerBarRenderer: MultiMarkersPlayerBarRenderer;
}
export interface MultiMarkersPlayerBarRenderer {
	visibleOnLoad: LikeCountEntity;
	trackingParams: string;
}
export interface AutonavToggle {
	autoplaySwitchButtonRenderer: AutoplaySwitchButtonRenderer;
}
export interface AutoplaySwitchButtonRenderer {
	onEnabledCommand: OnEnabledCommand;
	onDisabledCommand: OnEnabledCommand;
	enabledAccessibilityData: Accessibility;
	disabledAccessibilityData: Accessibility;
	trackingParams: string;
	enabled: boolean;
}
export interface OnEnabledCommand {
	clickTrackingParams: string;
	commandMetadata: CommandMetadata3;
	setSettingEndpoint: SetSettingEndpoint;
}
export interface SetSettingEndpoint {
	settingItemId: string;
	boolValue: boolean;
	settingItemIdForClient: string;
}
export interface VideoDetails {
	playerOverlayVideoDetailsRenderer: PlayerOverlayVideoDetailsRenderer;
}
export interface PlayerOverlayVideoDetailsRenderer {
	title: ViewCount;
	subtitle: Title;
}
export interface AddToMenu {
	menuRenderer: MenuRenderer3;
}
export interface MenuRenderer3 {
	trackingParams: string;
}
export interface ShareButton {
	buttonRenderer: ButtonRenderer13;
}
export interface ButtonRenderer13 {
	style: string;
	size: string;
	isDisabled: boolean;
	icon: Icon;
	navigationEndpoint: InnertubeCommand4;
	tooltip: string;
	trackingParams: string;
}
export interface Autoplay3 {
	playerOverlayAutoplayRenderer: PlayerOverlayAutoplayRenderer;
}
export interface PlayerOverlayAutoplayRenderer {
	title: ViewCount;
	videoTitle: RelativeDateText;
	byline: Title2;
	pauseText: ViewCount;
	background: Thumbnail2;
	countDownSecs: number;
	cancelButton: CancelButton2;
	nextButton: NextButton;
	trackingParams: string;
	closeButton: CloseButton;
	thumbnailOverlays: ThumbnailOverlay3[];
	preferImmediateRedirect: boolean;
	videoId: string;
	publishedTimeText: ViewCount;
	webShowNewAutonavCountdown: boolean;
	webShowBigThumbnailEndscreen: boolean;
	shortViewCountText: RelativeDateText;
	countDownSecsForFullscreen: number;
}
export interface ThumbnailOverlay3 {
	thumbnailOverlayTimeStatusRenderer: ThumbnailOverlayTimeStatusRenderer;
}
export interface CloseButton {
	buttonRenderer: ButtonRenderer12;
}
export interface ButtonRenderer12 {
	style: string;
	size: string;
	isDisabled: boolean;
	icon: Icon;
	accessibility: AccessibilityData;
	trackingParams: string;
}
export interface NextButton {
	buttonRenderer: ButtonRenderer11;
}
export interface ButtonRenderer11 {
	style: string;
	size: string;
	isDisabled: boolean;
	navigationEndpoint: NextEndpoint3;
	accessibility: AccessibilityData;
	trackingParams: string;
	accessibilityData: Accessibility;
}
export interface CancelButton2 {
	buttonRenderer: ButtonRenderer10;
}
export interface ButtonRenderer10 {
	style: string;
	size: string;
	isDisabled: boolean;
	text: ViewCount;
	accessibility: AccessibilityData;
	trackingParams: string;
	accessibilityData: Accessibility;
	command: Command10;
}
export interface Command10 {
	clickTrackingParams: string;
	commandMetadata: CommandMetadata3;
	getSurveyCommand: GetSurveyCommand;
}
export interface GetSurveyCommand {
	endpoint: Endpoint;
	action: string;
}
export interface Endpoint {
	watch: SignInEndpoint;
}
export interface EndScreen {
	watchNextEndScreenRenderer: WatchNextEndScreenRenderer;
}
export interface WatchNextEndScreenRenderer {
	results: Result2[];
	title: ViewCount;
	trackingParams: string;
}
export interface Result2 {
	endScreenVideoRenderer: EndScreenVideoRenderer;
}
export interface EndScreenVideoRenderer {
	videoId: string;
	thumbnail: Thumbnail2;
	title: RelativeDateText;
	shortBylineText: ShortBylineText;
	lengthText: RelativeDateText;
	lengthInSeconds: number;
	navigationEndpoint: NextEndpoint3;
	trackingParams: string;
	shortViewCountText: RelativeDateText;
	publishedTimeText: ViewCount;
	thumbnailOverlays: ThumbnailOverlay2[];
}
export interface ThumbnailOverlay2 {
	thumbnailOverlayTimeStatusRenderer?: ThumbnailOverlayTimeStatusRenderer;
	thumbnailOverlayNowPlayingRenderer?: ThumbnailOverlayNowPlayingRenderer;
}
export interface ShortBylineText {
	runs: Run4[];
}
export interface Run4 {
	text: string;
	navigationEndpoint: NavigationEndpoint11;
}
export interface NavigationEndpoint11 {
	clickTrackingParams: string;
	commandMetadata: CommandMetadata8;
	browseEndpoint: BrowseEndpoint;
}
export interface CommandMetadata8 {
	webCommandMetadata?: WebCommandMetadata4;
}
export interface Contents {
	twoColumnWatchNextResults: TwoColumnWatchNextResults;
}
export interface TwoColumnWatchNextResults {
	results: Results2;
	secondaryResults: SecondaryResults2;
	autoplay: Autoplay2;
}
export interface Autoplay2 {
	autoplay: Autoplay;
}
export interface Autoplay {
	sets: Set[];
	countDownSecs: number;
	trackingParams: string;
}
export interface Set {
	mode: string;
	autoplayVideo: NavigationEndpoint;
}
export interface SecondaryResults2 {
	secondaryResults: SecondaryResults;
}
export interface SecondaryResults {
	results: Result[];
	trackingParams: string;
	targetId: string;
}
export interface Result {
	compactVideoRenderer?: CompactVideoRenderer;
	continuationItemRenderer?: ContinuationItemRenderer2;
}
export interface ContinuationItemRenderer2 {
	trigger: string;
	continuationEndpoint: ContinuationEndpoint;
	button: Button6;
}
export interface Button6 {
	buttonRenderer: ButtonRenderer9;
}
export interface ButtonRenderer9 {
	style: string;
	size: string;
	isDisabled: boolean;
	text: Title;
	trackingParams: string;
	command: ContinuationEndpoint;
}
export interface CompactVideoRenderer {
	videoId: string;
	thumbnail: Thumbnail2;
	title: RelativeDateText;
	longBylineText: LongBylineText;
	publishedTimeText: ViewCount;
	viewCountText: ViewCount;
	lengthText: RelativeDateText;
	navigationEndpoint: NavigationEndpoint10;
	shortBylineText: Title2;
	channelThumbnail: Thumbnail2;
	ownerBadges?: Badge[];
	trackingParams: string;
	shortViewCountText: RelativeDateText;
	menu: Menu;
	thumbnailOverlays: ThumbnailOverlay[];
	accessibility: Accessibility;
	badges?: Badge2[];
}
export interface Badge2 {
	metadataBadgeRenderer: MetadataBadgeRenderer2;
}
export interface MetadataBadgeRenderer2 {
	style: string;
	label: string;
	trackingParams: string;
}
export interface ThumbnailOverlay {
	thumbnailOverlayTimeStatusRenderer?: ThumbnailOverlayTimeStatusRenderer;
	thumbnailOverlayToggleButtonRenderer?: ThumbnailOverlayToggleButtonRenderer;
	thumbnailOverlayNowPlayingRenderer?: ThumbnailOverlayNowPlayingRenderer;
}
export interface ThumbnailOverlayNowPlayingRenderer {
	text: Title;
}
export interface ThumbnailOverlayToggleButtonRenderer {
	isToggled?: boolean;
	untoggledIcon: Icon;
	toggledIcon: Icon;
	untoggledTooltip: string;
	toggledTooltip: string;
	untoggledServiceEndpoint: UntoggledServiceEndpoint;
	toggledServiceEndpoint?: ToggledServiceEndpoint;
	untoggledAccessibility: Accessibility;
	toggledAccessibility: Accessibility;
	trackingParams: string;
}
export interface ToggledServiceEndpoint {
	clickTrackingParams: string;
	commandMetadata: CommandMetadata3;
	playlistEditEndpoint: PlaylistEditEndpoint2;
}
export interface PlaylistEditEndpoint2 {
	playlistId: string;
	actions: Action5[];
}
export interface Action5 {
	action: string;
	removedVideoId: string;
}
export interface UntoggledServiceEndpoint {
	clickTrackingParams: string;
	commandMetadata: CommandMetadata5;
	playlistEditEndpoint?: PlaylistEditEndpoint;
	signalServiceEndpoint?: SignalServiceEndpoint3;
}
export interface SignalServiceEndpoint3 {
	signal: string;
	actions: Action4[];
}
export interface Action4 {
	clickTrackingParams: string;
	addToPlaylistCommand: AddToPlaylistCommand;
}
export interface PlaylistEditEndpoint {
	playlistId: string;
	actions: Action3[];
}
export interface Action3 {
	addedVideoId: string;
	action: string;
}
export interface ThumbnailOverlayTimeStatusRenderer {
	text: RelativeDateText;
	style: string;
}
export interface Menu {
	menuRenderer: MenuRenderer2;
}
export interface MenuRenderer2 {
	items: Item3[];
	trackingParams: string;
	accessibility: Accessibility;
	targetId?: string;
}
export interface Item3 {
	menuServiceItemRenderer?: MenuServiceItemRenderer3;
	menuServiceItemDownloadRenderer?: MenuServiceItemDownloadRenderer2;
}
export interface MenuServiceItemDownloadRenderer2 {
	serviceEndpoint: ServiceEndpoint6;
	trackingParams: string;
}
export interface ServiceEndpoint6 {
	clickTrackingParams: string;
	offlineVideoEndpoint: OfflineVideoEndpoint2;
}
export interface OfflineVideoEndpoint2 {
	videoId: string;
	onAddCommand: OnAddCommand2;
}
export interface OnAddCommand2 {
	clickTrackingParams: string;
	getDownloadActionCommand: GetDownloadActionCommand2;
}
export interface GetDownloadActionCommand2 {
	videoId: string;
	params: string;
}
export interface MenuServiceItemRenderer3 {
	text: Title;
	icon: Icon;
	serviceEndpoint: ServiceEndpoint5;
	trackingParams: string;
	hasSeparator?: boolean;
}
export interface ServiceEndpoint5 {
	clickTrackingParams: string;
	commandMetadata: CommandMetadata5;
	signalServiceEndpoint?: SignalServiceEndpoint2;
	shareEntityServiceEndpoint?: ShareEntityServiceEndpoint;
}
export interface SignalServiceEndpoint2 {
	signal: string;
	actions: Action2[];
}
export interface Action2 {
	clickTrackingParams: string;
	addToPlaylistCommand?: AddToPlaylistCommand;
	openPopupAction?: OpenPopupAction4;
}
export interface OpenPopupAction4 {
	popup: Popup4;
	popupType: string;
}
export interface Popup4 {
	notificationActionRenderer: NotificationActionRenderer;
}
export interface NotificationActionRenderer {
	responseText: ViewCount;
	trackingParams: string;
}
export interface AddToPlaylistCommand {
	openMiniplayer: boolean;
	openListPanel: boolean;
	videoId: string;
	listType: string;
	onCreateListCommand: OnCreateListCommand;
	videoIds: string[];
}
export interface OnCreateListCommand {
	clickTrackingParams: string;
	commandMetadata: CommandMetadata3;
	createPlaylistServiceEndpoint: CreatePlaylistServiceEndpoint;
}
export interface CreatePlaylistServiceEndpoint {
	videoIds: string[];
	params: string;
}
export interface NavigationEndpoint10 {
	clickTrackingParams: string;
	commandMetadata: CommandMetadata;
	watchEndpoint: WatchEndpoint3;
}
export interface WatchEndpoint3 {
	videoId: string;
	nofollow: boolean;
	watchEndpointSupportedOnesieConfig: WatchEndpointSupportedOnesieConfig;
}
export interface LongBylineText {
	runs: Run3[];
}
export interface Run3 {
	text: string;
	navigationEndpoint: NavigationEndpoint9;
}
export interface NavigationEndpoint9 {
	clickTrackingParams: string;
	commandMetadata: CommandMetadata7;
	browseEndpoint: BrowseEndpoint;
}
export interface CommandMetadata7 {
	webCommandMetadata?: WebCommandMetadata4;
}
export interface Results2 {
	results: Results;
}
export interface Results {
	contents: Content2[];
	trackingParams: string;
}
export interface Content2 {
	videoPrimaryInfoRenderer?: VideoPrimaryInfoRenderer;
	videoSecondaryInfoRenderer?: VideoSecondaryInfoRenderer;
	itemSectionRenderer?: ItemSectionRenderer;
}
export interface ItemSectionRenderer {
	contents: Content[];
	trackingParams: string;
	sectionIdentifier: string;
	targetId: string;
}
export interface Content {
	continuationItemRenderer: ContinuationItemRenderer;
}
export interface ContinuationItemRenderer {
	trigger: string;
	continuationEndpoint: ContinuationEndpoint;
}
export interface ContinuationEndpoint {
	clickTrackingParams: string;
	commandMetadata: CommandMetadata3;
	continuationCommand: ContinuationCommand;
}
export interface ContinuationCommand {
	token: string;
	request: string;
}
export interface VideoSecondaryInfoRenderer {
	owner: Owner;
	subscribeButton: SubscribeButton;
	metadataRowContainer: MetadataRowContainer;
	showMoreText: ViewCount;
	showLessText: ViewCount;
	trackingParams: string;
	defaultExpanded: boolean;
	descriptionCollapsedLines: number;
	showMoreCommand: ShowMoreCommand;
	showLessCommand: ShowLessCommand;
	attributedDescription: AttributedDescription;
	headerRuns: HeaderRun[];
}
export interface HeaderRun {
	startIndex: number;
	length: number;
	headerMapping: string;
}
export interface AttributedDescription {
	content: string;
	commandRuns: CommandRun[];
	styleRuns: StyleRun[];
	attachmentRuns: AttachmentRun[];
	decorationRuns: DecorationRun[];
}
export interface DecorationRun {
	textDecorator: TextDecorator;
}
export interface TextDecorator {
	highlightTextDecorator: HighlightTextDecorator;
}
export interface HighlightTextDecorator {
	startIndex: number;
	length: number;
	backgroundCornerRadius: number;
	bottomPadding: number;
	highlightTextDecoratorExtensions: HighlightTextDecoratorExtensions;
}
export interface HighlightTextDecoratorExtensions {
	highlightTextDecoratorColorMapExtension: StyleRunColorMapExtension;
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
export interface Properties {
	layoutProperties: LayoutProperties;
}
export interface LayoutProperties {
	height: Height;
	width: Height;
	margin: Margin;
}
export interface Margin {
	top: Height;
}
export interface Height {
	value: number;
	unit: string;
}
export interface Type {
	imageType: ImageType;
}
export interface ImageType {
	image: Image;
}
export interface Image {
	sources: CommonConfig[];
}
export interface StyleRun {
	startIndex: number;
	length: number;
	styleRunExtensions: StyleRunExtensions;
	fontFamilyName?: string;
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
export interface CommandRun {
	startIndex: number;
	length: number;
	onTap: OnTap6;
	onTapOptions?: OnTapOptions;
}
export interface OnTapOptions {
	accessibilityInfo: AccessibilityInfo;
}
export interface AccessibilityInfo {
	accessibilityLabel: string;
}
export interface OnTap6 {
	innertubeCommand: InnertubeCommand5;
}
export interface InnertubeCommand5 {
	clickTrackingParams: string;
	commandMetadata: CommandMetadata;
	urlEndpoint: UrlEndpoint;
}
export interface UrlEndpoint {
	url: string;
	target: string;
	nofollow: boolean;
}
export interface ShowLessCommand {
	clickTrackingParams: string;
	changeEngagementPanelVisibilityAction: ChangeEngagementPanelVisibilityAction;
}
export interface ShowMoreCommand {
	clickTrackingParams: string;
	commandExecutorCommand: CommandExecutorCommand2;
}
export interface CommandExecutorCommand2 {
	commands: Command9[];
}
export interface Command9 {
	clickTrackingParams: string;
	changeEngagementPanelVisibilityAction?: ChangeEngagementPanelVisibilityAction;
	scrollToEngagementPanelCommand?: ScrollToEngagementPanelCommand;
}
export interface ScrollToEngagementPanelCommand {
	targetId: string;
}
export interface ChangeEngagementPanelVisibilityAction {
	targetId: string;
	visibility: string;
}
export interface MetadataRowContainer {
	metadataRowContainerRenderer: MetadataRowContainerRenderer;
}
export interface MetadataRowContainerRenderer {
	collapsedItemCount: number;
	trackingParams: string;
}
export interface SubscribeButton {
	subscribeButtonRenderer: SubscribeButtonRenderer;
}
export interface SubscribeButtonRenderer {
	buttonText: Title;
	subscribed: boolean;
	enabled: boolean;
	type: string;
	channelId: string;
	showPreferences: boolean;
	subscribedButtonText: Title;
	unsubscribedButtonText: Title;
	trackingParams: string;
	unsubscribeButtonText: Title;
	subscribeAccessibility: Accessibility;
	unsubscribeAccessibility: Accessibility;
	notificationPreferenceButton: NotificationPreferenceButton;
	targetId: string;
	signInEndpoint: SignInEndpoint6;
	subscribedEntityKey: string;
	onSubscribeEndpoints: OnSubscribeEndpoint[];
	onUnsubscribeEndpoints: OnUnsubscribeEndpoint[];
}
export interface OnUnsubscribeEndpoint {
	clickTrackingParams: string;
	commandMetadata: CommandMetadata6;
	signalServiceEndpoint: SignalServiceEndpoint;
}
export interface CommandMetadata6 {
	webCommandMetadata: WebCommandMetadata6;
}
export interface WebCommandMetadata6 {
	sendPost: boolean;
}
export interface OnSubscribeEndpoint {
	clickTrackingParams: string;
	commandMetadata: CommandMetadata3;
	subscribeEndpoint: UnsubscribeEndpoint;
}
export interface SignInEndpoint6 {
	clickTrackingParams: string;
	commandMetadata: CommandMetadata2;
	modalEndpoint: ModalEndpoint5;
}
export interface ModalEndpoint5 {
	modal: Modal5;
}
export interface Modal5 {
	modalWithTitleAndButtonRenderer: ModalWithTitleAndButtonRenderer5;
}
export interface ModalWithTitleAndButtonRenderer5 {
	title: ViewCount;
	content: ViewCount;
	button: Button5;
}
export interface Button5 {
	buttonRenderer: ButtonRenderer8;
}
export interface ButtonRenderer8 {
	style: string;
	size: string;
	isDisabled: boolean;
	text: ViewCount;
	navigationEndpoint: NavigationEndpoint8;
	trackingParams: string;
}
export interface NavigationEndpoint8 {
	clickTrackingParams: string;
	commandMetadata: CommandMetadata;
	signInEndpoint: SignInEndpoint5;
}
export interface SignInEndpoint5 {
	nextEndpoint: NextEndpoint3;
	continueAction: string;
	idamTag: string;
}
export interface NotificationPreferenceButton {
	subscriptionNotificationToggleButtonRenderer: SubscriptionNotificationToggleButtonRenderer;
}
export interface SubscriptionNotificationToggleButtonRenderer {
	states: State2[];
	currentStateId: number;
	trackingParams: string;
	command: Command8;
	targetId: string;
	secondaryIcon: Icon;
}
export interface Command8 {
	clickTrackingParams: string;
	commandExecutorCommand: CommandExecutorCommand;
}
export interface CommandExecutorCommand {
	commands: Command7[];
}
export interface Command7 {
	clickTrackingParams: string;
	openPopupAction: OpenPopupAction3;
}
export interface OpenPopupAction3 {
	popup: Popup3;
	popupType: string;
}
export interface Popup3 {
	menuPopupRenderer: MenuPopupRenderer;
}
export interface MenuPopupRenderer {
	items: Item2[];
}
export interface Item2 {
	menuServiceItemRenderer: MenuServiceItemRenderer2;
}
export interface MenuServiceItemRenderer2 {
	text: Text;
	icon: Icon;
	serviceEndpoint: ServiceEndpoint4;
	trackingParams: string;
	isSelected?: boolean;
}
export interface ServiceEndpoint4 {
	clickTrackingParams: string;
	commandMetadata: CommandMetadata5;
	modifyChannelNotificationPreferenceEndpoint?: ModifyChannelNotificationPreferenceEndpoint;
	signalServiceEndpoint?: SignalServiceEndpoint;
}
export interface SignalServiceEndpoint {
	signal: string;
	actions: Action[];
}
export interface Action {
	clickTrackingParams: string;
	openPopupAction: OpenPopupAction2;
}
export interface OpenPopupAction2 {
	popup: Popup2;
	popupType: string;
}
export interface Popup2 {
	confirmDialogRenderer: ConfirmDialogRenderer;
}
export interface ConfirmDialogRenderer {
	trackingParams: string;
	dialogMessages: Title[];
	confirmButton: ConfirmButton;
	cancelButton: CancelButton;
	primaryIsCancel: boolean;
}
export interface CancelButton {
	buttonRenderer: ButtonRenderer7;
}
export interface ButtonRenderer7 {
	style: string;
	size: string;
	isDisabled: boolean;
	text: Title;
	accessibility: AccessibilityData;
	trackingParams: string;
}
export interface ConfirmButton {
	buttonRenderer: ButtonRenderer6;
}
export interface ButtonRenderer6 {
	style: string;
	size: string;
	isDisabled: boolean;
	text: Title;
	serviceEndpoint: ServiceEndpoint3;
	accessibility: AccessibilityData;
	trackingParams: string;
}
export interface ServiceEndpoint3 {
	clickTrackingParams: string;
	commandMetadata: CommandMetadata3;
	unsubscribeEndpoint: UnsubscribeEndpoint;
}
export interface UnsubscribeEndpoint {
	channelIds: string[];
	params: string;
}
export interface ModifyChannelNotificationPreferenceEndpoint {
	params: string;
}
export interface CommandMetadata5 {
	webCommandMetadata: WebCommandMetadata5;
}
export interface WebCommandMetadata5 {
	sendPost: boolean;
	apiUrl?: string;
}
export interface Text {
	simpleText?: string;
	runs?: Run[];
}
export interface State2 {
	stateId: number;
	nextStateId: number;
	state: State;
}
export interface State {
	buttonRenderer: ButtonRenderer5;
}
export interface ButtonRenderer5 {
	style: string;
	size: string;
	isDisabled: boolean;
	icon: Icon;
	accessibility: AccessibilityData;
	trackingParams: string;
	accessibilityData: Accessibility;
}
export interface Owner {
	videoOwnerRenderer: VideoOwnerRenderer;
}
export interface VideoOwnerRenderer {
	thumbnail: Thumbnail2;
	title: Title2;
	subscriptionButton: SubscriptionButton;
	navigationEndpoint: NavigationEndpoint7;
	subscriberCountText: RelativeDateText;
	trackingParams: string;
	badges: Badge[];
}
export interface Badge {
	metadataBadgeRenderer: MetadataBadgeRenderer;
}
export interface MetadataBadgeRenderer {
	icon: Icon;
	style: string;
	tooltip: string;
	trackingParams: string;
	accessibilityData: AccessibilityData;
}
export interface SubscriptionButton {
	type: string;
}
export interface Title2 {
	runs: Run2[];
}
export interface Run2 {
	text: string;
	navigationEndpoint: NavigationEndpoint7;
}
export interface NavigationEndpoint7 {
	clickTrackingParams: string;
	commandMetadata: CommandMetadata4;
	browseEndpoint: BrowseEndpoint;
}
export interface BrowseEndpoint {
	browseId: string;
	canonicalBaseUrl: string;
}
export interface CommandMetadata4 {
	webCommandMetadata: WebCommandMetadata4;
}
export interface WebCommandMetadata4 {
	url: string;
	webPageType: string;
	rootVe: number;
	apiUrl: string;
}
export interface Thumbnail2 {
	thumbnails: Thumbnail[];
}
export interface Thumbnail {
	url: string;
	width: number;
	height: number;
}
export interface VideoPrimaryInfoRenderer {
	title: Title;
	viewCount: ViewCount2;
	videoActions: VideoActions;
	trackingParams: string;
	dateText: ViewCount;
	relativeDateText: RelativeDateText;
}
export interface RelativeDateText {
	accessibility: Accessibility;
	simpleText: string;
}
export interface VideoActions {
	menuRenderer: MenuRenderer;
}
export interface MenuRenderer {
	items: Item[];
	trackingParams: string;
	topLevelButtons: TopLevelButton[];
	accessibility: Accessibility;
	flexibleItems: FlexibleItem[];
}
export interface FlexibleItem {
	menuFlexibleItemRenderer: MenuFlexibleItemRenderer;
}
export interface MenuFlexibleItemRenderer {
	menuItem: MenuItem;
	topLevelButton: TopLevelButton2;
}
export interface TopLevelButton2 {
	downloadButtonRenderer?: DownloadButtonRenderer;
	buttonViewModel?: ButtonViewModel5;
}
export interface ButtonViewModel5 {
	iconName: string;
	title: string;
	onTap: OnTap5;
	accessibilityText: string;
	style: string;
	trackingParams: string;
	isFullWidth: boolean;
	type: string;
	buttonSize: string;
	tooltip: string;
}
export interface OnTap5 {
	serialCommand: SerialCommand5;
}
export interface SerialCommand5 {
	commands: Command6[];
}
export interface Command6 {
	logGestureCommand?: LogGestureCommand;
	innertubeCommand?: ServiceEndpoint2;
}
export interface DownloadButtonRenderer {
	trackingParams: string;
	style: string;
	size: string;
	targetId: string;
	command: ServiceEndpoint;
}
export interface MenuItem {
	menuServiceItemDownloadRenderer?: MenuServiceItemDownloadRenderer;
	menuServiceItemRenderer?: MenuServiceItemRenderer;
}
export interface MenuServiceItemRenderer {
	text: Title;
	icon: Icon;
	serviceEndpoint: ServiceEndpoint2;
	trackingParams: string;
}
export interface ServiceEndpoint2 {
	clickTrackingParams: string;
	commandMetadata: CommandMetadata2;
	modalEndpoint: ModalEndpoint4;
}
export interface ModalEndpoint4 {
	modal: Modal4;
}
export interface Modal4 {
	modalWithTitleAndButtonRenderer: ModalWithTitleAndButtonRenderer4;
}
export interface ModalWithTitleAndButtonRenderer4 {
	title: Title;
	content: Title;
	button: Button4;
}
export interface Button4 {
	buttonRenderer: ButtonRenderer4;
}
export interface ButtonRenderer4 {
	style: string;
	size: string;
	isDisabled: boolean;
	text: ViewCount;
	navigationEndpoint: NavigationEndpoint6;
	trackingParams: string;
}
export interface NavigationEndpoint6 {
	clickTrackingParams: string;
	commandMetadata: CommandMetadata;
	signInEndpoint: SignInEndpoint4;
}
export interface SignInEndpoint4 {
	nextEndpoint: NextEndpoint3;
	idamTag: string;
}
export interface NextEndpoint3 {
	clickTrackingParams: string;
	commandMetadata: CommandMetadata;
	watchEndpoint: WatchEndpoint2;
}
export interface WatchEndpoint2 {
	videoId: string;
	watchEndpointSupportedOnesieConfig: WatchEndpointSupportedOnesieConfig;
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
export interface MenuServiceItemDownloadRenderer {
	serviceEndpoint: ServiceEndpoint;
	trackingParams: string;
}
export interface ServiceEndpoint {
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
	offlineabilityEntityKey: string;
}
export interface Accessibility {
	accessibilityData: AccessibilityData;
}
export interface AccessibilityData {
	label: string;
}
export interface TopLevelButton {
	segmentedLikeDislikeButtonViewModel?: SegmentedLikeDislikeButtonViewModel;
	buttonViewModel?: ButtonViewModel4;
}
export interface ButtonViewModel4 {
	iconName: string;
	title: string;
	onTap: OnTap4;
	accessibilityText: string;
	style: string;
	trackingParams: string;
	isFullWidth: boolean;
	type: string;
	buttonSize: string;
	state: string;
	accessibilityId: string;
	tooltip: string;
}
export interface OnTap4 {
	serialCommand: SerialCommand4;
}
export interface SerialCommand4 {
	commands: Command5[];
}
export interface Command5 {
	logGestureCommand?: LogGestureCommand;
	innertubeCommand?: InnertubeCommand4;
}
export interface InnertubeCommand4 {
	clickTrackingParams: string;
	commandMetadata: CommandMetadata3;
	shareEntityServiceEndpoint: ShareEntityServiceEndpoint;
}
export interface ShareEntityServiceEndpoint {
	serializedShareEntity: string;
	commands: Command4[];
}
export interface Command4 {
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
export interface SegmentedLikeDislikeButtonViewModel {
	likeButtonViewModel: LikeButtonViewModel2;
	dislikeButtonViewModel: DislikeButtonViewModel2;
	iconType: string;
	likeCountEntity: LikeCountEntity;
	dynamicLikeCountUpdateData: DynamicLikeCountUpdateData;
	teasersOrderEntityKey: string;
}
export interface DynamicLikeCountUpdateData {
	updateStatusKey: string;
	placeholderLikeCountValuesKey: string;
	updateDelayLoopId: string;
	updateDelaySec: number;
}
export interface LikeCountEntity {
	key: string;
}
export interface DislikeButtonViewModel2 {
	dislikeButtonViewModel: DislikeButtonViewModel;
}
export interface DislikeButtonViewModel {
	toggleButtonViewModel: ToggleButtonViewModel4;
	dislikeEntityKey: string;
}
export interface ToggleButtonViewModel4 {
	toggleButtonViewModel: ToggleButtonViewModel3;
}
export interface ToggleButtonViewModel3 {
	defaultButtonViewModel: DefaultButtonViewModel2;
	toggledButtonViewModel: ToggledButtonViewModel;
	trackingParams: string;
	isTogglingDisabled: boolean;
}
export interface DefaultButtonViewModel2 {
	buttonViewModel: ButtonViewModel3;
}
export interface ButtonViewModel3 {
	iconName: string;
	title: string;
	onTap: OnTap3;
	accessibilityText: string;
	style: string;
	trackingParams: string;
	isFullWidth: boolean;
	type: string;
	buttonSize: string;
	accessibilityId: string;
	tooltip: string;
}
export interface OnTap3 {
	serialCommand: SerialCommand3;
}
export interface SerialCommand3 {
	commands: Command3[];
}
export interface Command3 {
	logGestureCommand?: LogGestureCommand;
	innertubeCommand?: InnertubeCommand3;
}
export interface InnertubeCommand3 {
	clickTrackingParams: string;
	commandMetadata: CommandMetadata2;
	modalEndpoint: ModalEndpoint3;
}
export interface ModalEndpoint3 {
	modal: Modal3;
}
export interface Modal3 {
	modalWithTitleAndButtonRenderer: ModalWithTitleAndButtonRenderer3;
}
export interface ModalWithTitleAndButtonRenderer3 {
	title: ViewCount;
	content: ViewCount;
	button: Button3;
}
export interface Button3 {
	buttonRenderer: ButtonRenderer3;
}
export interface ButtonRenderer3 {
	style: string;
	size: string;
	isDisabled: boolean;
	text: ViewCount;
	navigationEndpoint: NavigationEndpoint5;
	trackingParams: string;
}
export interface NavigationEndpoint5 {
	clickTrackingParams: string;
	commandMetadata: CommandMetadata;
	signInEndpoint: SignInEndpoint3;
}
export interface SignInEndpoint3 {
	nextEndpoint: NextEndpoint2;
	idamTag: string;
}
export interface NextEndpoint2 {
	clickTrackingParams: string;
	commandMetadata: CommandMetadata3;
	likeEndpoint: LikeEndpoint3;
}
export interface LikeEndpoint3 {
	status: string;
	target: Target;
	dislikeParams: string;
}
export interface LikeButtonViewModel2 {
	likeButtonViewModel: LikeButtonViewModel;
}
export interface LikeButtonViewModel {
	toggleButtonViewModel: ToggleButtonViewModel2;
	likeStatusEntityKey: string;
	likeStatusEntity: LikeStatusEntity;
}
export interface LikeStatusEntity {
	key: string;
	likeStatus: string;
}
export interface ToggleButtonViewModel2 {
	toggleButtonViewModel: ToggleButtonViewModel;
}
export interface ToggleButtonViewModel {
	defaultButtonViewModel: DefaultButtonViewModel;
	toggledButtonViewModel: ToggledButtonViewModel;
	identifier: string;
	trackingParams: string;
	isTogglingDisabled: boolean;
}
export interface ToggledButtonViewModel {
	buttonViewModel: ButtonViewModel2;
}
export interface ButtonViewModel2 {
	iconName: string;
	title: string;
	onTap: OnTap2;
	accessibilityText: string;
	style: string;
	trackingParams: string;
	isFullWidth: boolean;
	type: string;
	buttonSize: string;
	accessibilityId: string;
	tooltip: string;
}
export interface OnTap2 {
	serialCommand: SerialCommand2;
}
export interface SerialCommand2 {
	commands: Command2[];
}
export interface Command2 {
	logGestureCommand?: LogGestureCommand;
	innertubeCommand?: InnertubeCommand2;
}
export interface InnertubeCommand2 {
	clickTrackingParams: string;
	commandMetadata: CommandMetadata3;
	likeEndpoint: LikeEndpoint2;
}
export interface LikeEndpoint2 {
	status: string;
	target: Target;
	removeLikeParams: string;
}
export interface DefaultButtonViewModel {
	buttonViewModel: ButtonViewModel;
}
export interface ButtonViewModel {
	iconName: string;
	title: string;
	onTap: OnTap;
	accessibilityText: string;
	style: string;
	trackingParams: string;
	isFullWidth: boolean;
	type: string;
	buttonSize: string;
	accessibilityId: string;
	tooltip: string;
}
export interface OnTap {
	serialCommand: SerialCommand;
}
export interface SerialCommand {
	commands: Command[];
}
export interface Command {
	logGestureCommand?: LogGestureCommand;
	innertubeCommand?: InnertubeCommand;
}
export interface InnertubeCommand {
	clickTrackingParams: string;
	commandMetadata: CommandMetadata2;
	modalEndpoint: ModalEndpoint2;
}
export interface ModalEndpoint2 {
	modal: Modal2;
}
export interface Modal2 {
	modalWithTitleAndButtonRenderer: ModalWithTitleAndButtonRenderer2;
}
export interface ModalWithTitleAndButtonRenderer2 {
	title: ViewCount;
	content: ViewCount;
	button: Button2;
}
export interface Button2 {
	buttonRenderer: ButtonRenderer2;
}
export interface ButtonRenderer2 {
	style: string;
	size: string;
	isDisabled: boolean;
	text: ViewCount;
	navigationEndpoint: NavigationEndpoint4;
	trackingParams: string;
}
export interface NavigationEndpoint4 {
	clickTrackingParams: string;
	commandMetadata: CommandMetadata;
	signInEndpoint: SignInEndpoint2;
}
export interface SignInEndpoint2 {
	nextEndpoint: NextEndpoint;
	idamTag: string;
}
export interface NextEndpoint {
	clickTrackingParams: string;
	commandMetadata: CommandMetadata3;
	likeEndpoint: LikeEndpoint;
}
export interface LikeEndpoint {
	status: string;
	target: Target;
	likeParams: string;
}
export interface Target {
	videoId: string;
}
export interface CommandMetadata3 {
	webCommandMetadata: WebCommandMetadata3;
}
export interface WebCommandMetadata3 {
	sendPost: boolean;
	apiUrl: string;
}
export interface LogGestureCommand {
	gestureType: string;
	trackingParams: string;
}
export interface Item {
	menuNavigationItemRenderer: MenuNavigationItemRenderer;
}
export interface MenuNavigationItemRenderer {
	text: Title;
	icon: Icon;
	navigationEndpoint: NavigationEndpoint3;
	trackingParams: string;
}
export interface NavigationEndpoint3 {
	clickTrackingParams: string;
	commandMetadata: CommandMetadata2;
	modalEndpoint: ModalEndpoint;
}
export interface ModalEndpoint {
	modal: Modal;
}
export interface Modal {
	modalWithTitleAndButtonRenderer: ModalWithTitleAndButtonRenderer;
}
export interface ModalWithTitleAndButtonRenderer {
	title: Title;
	content: Title;
	button: Button;
}
export interface Button {
	buttonRenderer: ButtonRenderer;
}
export interface ButtonRenderer {
	style: string;
	size: string;
	isDisabled: boolean;
	text: ViewCount;
	navigationEndpoint: NavigationEndpoint2;
	trackingParams: string;
}
export interface NavigationEndpoint2 {
	clickTrackingParams: string;
	commandMetadata: CommandMetadata;
	signInEndpoint: SignInEndpoint;
}
export interface SignInEndpoint {
	hack: boolean;
}
export interface CommandMetadata2 {
	webCommandMetadata: WebCommandMetadata2;
}
export interface WebCommandMetadata2 {
	ignoreNavigation: boolean;
}
export interface Icon {
	iconType: string;
}
export interface ViewCount2 {
	videoViewCountRenderer: VideoViewCountRenderer;
}
export interface VideoViewCountRenderer {
	viewCount: ViewCount;
	shortViewCount: ViewCount;
	originalViewCount: string;
}
export interface ViewCount {
	simpleText: string;
}
export interface Title {
	runs: Run[];
}
export interface Run {
	text: string;
}
export interface ResponseContext {
	serviceTrackingParams: ServiceTrackingParam[];
	mainAppWebResponseContext: MainAppWebResponseContext;
	webResponseContextExtensionData: WebResponseContextExtensionData;
}
export interface WebResponseContextExtensionData {
	ytConfigData: YtConfigData;
	webPrefetchData: WebPrefetchData;
	hasDecorated: boolean;
}
export interface WebPrefetchData {
	navigationEndpoints: NavigationEndpoint[];
}
export interface NavigationEndpoint {
	clickTrackingParams: string;
	commandMetadata: CommandMetadata;
	watchEndpoint: WatchEndpoint;
}
export interface WatchEndpoint {
	videoId: string;
	params: string;
	playerParams: string;
	watchEndpointSupportedPrefetchConfig: WatchEndpointSupportedPrefetchConfig;
}
export interface WatchEndpointSupportedPrefetchConfig {
	prefetchHintConfig: PrefetchHintConfig;
}
export interface PrefetchHintConfig {
	prefetchPriority: number;
	countdownUiRelativeSecondsPrefetchCondition: number;
}
export interface CommandMetadata {
	webCommandMetadata: WebCommandMetadata;
}
export interface WebCommandMetadata {
	url: string;
	webPageType: string;
	rootVe: number;
}
export interface YtConfigData {
	visitorData: string;
	rootVisualElementType: number;
}
export interface MainAppWebResponseContext {
	loggedOut: boolean;
	trackingParam: string;
}
export interface ServiceTrackingParam {
	service: string;
	params: Param[];
}
export interface Param {
	key: string;
	value: string;
}