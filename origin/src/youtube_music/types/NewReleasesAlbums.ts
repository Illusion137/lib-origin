export interface NewReleasesAlbums {
	responseContext: ResponseContext;
	contents: Contents;
	header: Header;
	trackingParams: string;
	maxAgeStoreSeconds: number;
}

export interface ResponseContext {
	serviceTrackingParams: ServiceTrackingParam[];
}

export interface ServiceTrackingParam {
	service: string;
	params: Param[];
}

export interface Param {
	key: string;
	value: string;
}

export interface Contents {
	singleColumnBrowseResultsRenderer: SingleColumnBrowseResultsRenderer;
}

export interface SingleColumnBrowseResultsRenderer {
	tabs: Tab[];
}

export interface Tab {
	tabRenderer: TabRenderer;
}

export interface TabRenderer {
	content: Content;
	trackingParams: string;
}

export interface Content {
	sectionListRenderer: SectionListRenderer;
}

export interface SectionListRenderer {
	contents: Content2[];
	trackingParams: string;
}

export interface Content2 {
	gridRenderer: GridRenderer;
}

export interface GridRenderer {
	items: Item[];
	trackingParams: string;
}

export interface Item {
	musicTwoRowItemRenderer: MusicTwoRowItemRenderer;
}

export interface MusicTwoRowItemRenderer {
	thumbnailRenderer: ThumbnailRenderer;
	aspectRatio: string;
	title: Title;
	subtitle: Subtitle;
	navigationEndpoint: NavigationEndpoint3;
	trackingParams: string;
	menu: Menu;
	thumbnailOverlay: ThumbnailOverlay;
	subtitleBadges?: SubtitleBadge[];
}

export interface ThumbnailRenderer {
	musicThumbnailRenderer: MusicThumbnailRenderer;
}

export interface MusicThumbnailRenderer {
	thumbnail: Thumbnail;
	thumbnailCrop: string;
	thumbnailScale: string;
	trackingParams: string;
}

export interface Thumbnail {
	thumbnails: Thumbnail2[];
}

export interface Thumbnail2 {
	url: string;
	width: number;
	height: number;
}

export interface Title {
	runs: Run[];
}

export interface Run {
	text: string;
	navigationEndpoint: NavigationEndpoint;
}

export interface NavigationEndpoint {
	clickTrackingParams: string;
	browseEndpoint: BrowseEndpoint;
}

export interface BrowseEndpoint {
	browseId: string;
	browseEndpointContextSupportedConfigs: BrowseEndpointContextSupportedConfigs;
}

export interface BrowseEndpointContextSupportedConfigs {
	browseEndpointContextMusicConfig: BrowseEndpointContextMusicConfig;
}

export interface BrowseEndpointContextMusicConfig {
	pageType: string;
}

export interface Subtitle {
	runs: Run2[];
}

export interface Run2 {
	text: string;
	navigationEndpoint?: NavigationEndpoint2;
}

export interface NavigationEndpoint2 {
	clickTrackingParams: string;
	browseEndpoint: BrowseEndpoint2;
}

export interface BrowseEndpoint2 {
	browseId: string;
	browseEndpointContextSupportedConfigs: BrowseEndpointContextSupportedConfigs2;
}

export interface BrowseEndpointContextSupportedConfigs2 {
	browseEndpointContextMusicConfig: BrowseEndpointContextMusicConfig2;
}

export interface BrowseEndpointContextMusicConfig2 {
	pageType: string;
}

export interface NavigationEndpoint3 {
	clickTrackingParams: string;
	browseEndpoint: BrowseEndpoint3;
}

export interface BrowseEndpoint3 {
	browseId: string;
	browseEndpointContextSupportedConfigs: BrowseEndpointContextSupportedConfigs3;
}

export interface BrowseEndpointContextSupportedConfigs3 {
	browseEndpointContextMusicConfig: BrowseEndpointContextMusicConfig3;
}

export interface BrowseEndpointContextMusicConfig3 {
	pageType: string;
}

export interface Menu {
	menuRenderer: MenuRenderer;
}

export interface MenuRenderer {
	items: Item2[];
	trackingParams: string;
	accessibility: Accessibility;
}

export interface Item2 {
	menuNavigationItemRenderer?: MenuNavigationItemRenderer;
	menuServiceItemRenderer?: MenuServiceItemRenderer;
	toggleMenuServiceItemRenderer?: ToggleMenuServiceItemRenderer;
	menuServiceItemDownloadRenderer?: MenuServiceItemDownloadRenderer;
}

export interface MenuNavigationItemRenderer {
	text: Text;
	icon: Icon;
	navigationEndpoint: NavigationEndpoint4;
	trackingParams: string;
}

export interface Text {
	runs: Run3[];
}

export interface Run3 {
	text: string;
}

export interface Icon {
	iconType: string;
}

export interface NavigationEndpoint4 {
	clickTrackingParams: string;
	shareEntityEndpoint?: ShareEntityEndpoint;
	browseEndpoint?: BrowseEndpoint4;
	addToPlaylistEndpoint?: AddToPlaylistEndpoint;
	watchPlaylistEndpoint?: WatchPlaylistEndpoint;
}

export interface ShareEntityEndpoint {
	serializedShareEntity: string;
	sharePanelType: string;
}

export interface BrowseEndpoint4 {
	browseId: string;
	browseEndpointContextSupportedConfigs: BrowseEndpointContextSupportedConfigs4;
}

export interface BrowseEndpointContextSupportedConfigs4 {
	browseEndpointContextMusicConfig: BrowseEndpointContextMusicConfig4;
}

export interface BrowseEndpointContextMusicConfig4 {
	pageType: string;
}

export interface AddToPlaylistEndpoint {
	playlistId: string;
}

export interface WatchPlaylistEndpoint {
	playlistId: string;
	params: string;
}

export interface MenuServiceItemRenderer {
	text: Text2;
	icon: Icon2;
	serviceEndpoint: ServiceEndpoint;
	trackingParams: string;
}

export interface Text2 {
	runs: Run4[];
}

export interface Run4 {
	text: string;
}

export interface Icon2 {
	iconType: string;
}

export interface ServiceEndpoint {
	clickTrackingParams: string;
	queueAddEndpoint: QueueAddEndpoint;
}

export interface QueueAddEndpoint {
	queueTarget: QueueTarget;
	queueInsertPosition: string;
	commands: Command[];
}

export interface QueueTarget {
	playlistId: string;
	onEmptyQueue: OnEmptyQueue;
}

export interface OnEmptyQueue {
	clickTrackingParams: string;
	watchEndpoint: WatchEndpoint;
}

export interface WatchEndpoint {
	playlistId: string;
}

export interface Command {
	clickTrackingParams: string;
	addToToastAction: AddToToastAction;
}

export interface AddToToastAction {
	item: Item3;
}

export interface Item3 {
	notificationTextRenderer: NotificationTextRenderer;
}

export interface NotificationTextRenderer {
	successResponseText: SuccessResponseText;
	trackingParams: string;
}

export interface SuccessResponseText {
	runs: Run5[];
}

export interface Run5 {
	text: string;
}

export interface ToggleMenuServiceItemRenderer {
	defaultText: DefaultText;
	defaultIcon: DefaultIcon;
	defaultServiceEndpoint: DefaultServiceEndpoint;
	toggledText: ToggledText;
	toggledIcon: ToggledIcon;
	toggledServiceEndpoint: ToggledServiceEndpoint;
	trackingParams: string;
}

export interface DefaultText {
	runs: Run6[];
}

export interface Run6 {
	text: string;
}

export interface DefaultIcon {
	iconType: string;
}

export interface DefaultServiceEndpoint {
	clickTrackingParams: string;
	feedbackEndpoint?: FeedbackEndpoint;
	likeEndpoint?: LikeEndpoint;
}

export interface FeedbackEndpoint {
	feedbackToken: string;
}

export interface LikeEndpoint {
	status: string;
	target: Target;
}

export interface Target {
	playlistId: string;
}

export interface ToggledText {
	runs: Run7[];
}

export interface Run7 {
	text: string;
}

export interface ToggledIcon {
	iconType: string;
}

export interface ToggledServiceEndpoint {
	clickTrackingParams: string;
	feedbackEndpoint?: FeedbackEndpoint2;
	likeEndpoint?: LikeEndpoint2;
}

export interface FeedbackEndpoint2 {
	feedbackToken: string;
}

export interface LikeEndpoint2 {
	status: string;
	target: Target2;
}

export interface Target2 {
	playlistId: string;
}

export interface MenuServiceItemDownloadRenderer {
	serviceEndpoint: ServiceEndpoint2;
	trackingParams: string;
}

export interface ServiceEndpoint2 {
	clickTrackingParams: string;
	offlinePlaylistEndpoint: OfflinePlaylistEndpoint;
}

export interface OfflinePlaylistEndpoint {
	playlistId: string;
	action: string;
	offlineability: Offlineability;
	onAddCommand: OnAddCommand;
}

export interface Offlineability {
	offlineabilityRenderer: OfflineabilityRenderer;
}

export interface OfflineabilityRenderer {
	offlineable: boolean;
	clickTrackingParams: string;
}

export interface OnAddCommand {
	clickTrackingParams: string;
	getDownloadActionCommand: GetDownloadActionCommand;
}

export interface GetDownloadActionCommand {
	playlistId: string;
	params: string;
}

export interface Accessibility {
	accessibilityData: AccessibilityData;
}

export interface AccessibilityData {
	label: string;
}

export interface ThumbnailOverlay {
	musicItemThumbnailOverlayRenderer: MusicItemThumbnailOverlayRenderer;
}

export interface MusicItemThumbnailOverlayRenderer {
	background: Background;
	content: Content3;
	contentPosition: string;
	displayStyle: string;
}

export interface Background {
	verticalGradient: VerticalGradient;
}

export interface VerticalGradient {
	gradientLayerColors: string[];
}

export interface Content3 {
	musicPlayButtonRenderer: MusicPlayButtonRenderer;
}

export interface MusicPlayButtonRenderer {
	playNavigationEndpoint: PlayNavigationEndpoint;
	trackingParams: string;
	playIcon: PlayIcon;
	pauseIcon: PauseIcon;
	iconColor: number;
	backgroundColor: number;
	activeBackgroundColor: number;
	loadingIndicatorColor: number;
	playingIcon: PlayingIcon;
	iconLoadingColor: number;
	activeScaleFactor: number;
	buttonSize: string;
	rippleTarget: string;
	accessibilityPlayData: AccessibilityPlayData;
	accessibilityPauseData: AccessibilityPauseData;
}

export interface PlayNavigationEndpoint {
	clickTrackingParams: string;
	watchEndpoint: WatchEndpoint2;
}

export interface WatchEndpoint2 {
	videoId: string;
	playlistId: string;
	loggingContext: LoggingContext;
	watchEndpointMusicSupportedConfigs: WatchEndpointMusicSupportedConfigs;
	playerParams?: string;
}

export interface LoggingContext {
	vssLoggingContext: VssLoggingContext;
}

export interface VssLoggingContext {
	serializedContextData: string;
}

export interface WatchEndpointMusicSupportedConfigs {
	watchEndpointMusicConfig: WatchEndpointMusicConfig;
}

export interface WatchEndpointMusicConfig {
	musicVideoType: string;
}

export interface PlayIcon {
	iconType: string;
}

export interface PauseIcon {
	iconType: string;
}

export interface PlayingIcon {
	iconType: string;
}

export interface AccessibilityPlayData {
	accessibilityData: AccessibilityData2;
}

export interface AccessibilityData2 {
	label: string;
}

export interface AccessibilityPauseData {
	accessibilityData: AccessibilityData3;
}

export interface AccessibilityData3 {
	label: string;
}

export interface SubtitleBadge {
	musicInlineBadgeRenderer: MusicInlineBadgeRenderer;
}

export interface MusicInlineBadgeRenderer {
	trackingParams: string;
	icon: Icon3;
	accessibilityData: AccessibilityData4;
}

export interface Icon3 {
	iconType: string;
}

export interface AccessibilityData4 {
	accessibilityData: AccessibilityData5;
}

export interface AccessibilityData5 {
	label: string;
}

export interface Header {
	musicHeaderRenderer: MusicHeaderRenderer;
}

export interface MusicHeaderRenderer {
	title: Title2;
	trackingParams: string;
}

export interface Title2 {
	runs: Run8[];
}

export interface Run8 {
	text: string;
}
