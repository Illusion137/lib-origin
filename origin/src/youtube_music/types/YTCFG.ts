export interface YTCFG {
    CLIENT_CANARY_STATE: string
    DEVICE: string
    ELEMENT_POOL_DEFAULT_CAP: number
    EVENT_ID: string
    EXPERIMENT_FLAGS: ExperimentFlags
    GAPI_HINT_PARAMS: string
    GAPI_HOST: string
    GAPI_LOCALE: string
    GL: string
    HL: string
    HTML_DIR: string
    HTML_LANG: string
    INNERTUBE_API_KEY: string
    INNERTUBE_API_VERSION: string
    INNERTUBE_CLIENT_NAME: string
    INNERTUBE_CLIENT_VERSION: string
    INNERTUBE_CONTEXT: InnertubeContext
    INNERTUBE_CONTEXT_CLIENT_NAME: number
    INNERTUBE_CONTEXT_CLIENT_VERSION: string
    INNERTUBE_CONTEXT_GL: string
    INNERTUBE_CONTEXT_HL: string
    LATEST_ECATCHER_SERVICE_TRACKING_PARAMS: LatestEcatcherServiceTrackingParams
    LOGGED_IN: boolean
    PAGE_BUILD_LABEL: string
    PAGE_CL: number
    scheduler: Scheduler
    SERVER_NAME: string
    SIGNIN_URL: string
    VISITOR_DATA: string
    WEB_PLAYER_CONTEXT_CONFIGS: WebPlayerContextConfigs
    XSRF_FIELD_NAME: string
    XSRF_TOKEN: string
    YPC_MB_URL: string
    YTR_FAMILY_CREATION_URL: string
    SERVER_VERSION: string
    LOCALE: string
    REUSE_COMPONENTS: boolean
    STAMPER_STABLE_LIST: boolean
    DATASYNC_ID: string
    SERIALIZED_CLIENT_CONFIG_DATA: string
    MDX_CONFIG: MdxConfig
    CLIENT_PROTOCOL: string
    CLIENT_TRANSPORT: string
    TIME_CREATED_MS: number
    VALID_SESSION_TEMPDATA_DOMAINS: string[]
    RAW_COLD_CONFIG_GROUP: RawColdConfigGroup
    RAW_HOT_CONFIG_GROUP: RawHotConfigGroup
    SERIALIZED_HOT_HASH_DATA: string
    SERIALIZED_COLD_HASH_DATA: string
    USE_EMBEDDED_INNERTUBE_DATA: boolean
    VISIBILITY_ROOT: string
    YTMUSIC_ICON_SRC: string
    YTMUSIC_LOGO_SRC: string
    UPLOAD_URL: string
    TRANSFER_PAGE_SIGNIN_URL: string
    LOGOUT_URL: string
    IS_SUBSCRIBER: boolean
    IS_MOBILE_WEB: boolean
    INITIAL_ENDPOINT: string
    HOTKEY_DIALOG: HotkeyDialog
    DEFAULT_ALBUM_IMAGE_SRC: string
    AUDIO_QUALITY: string
    ADD_SCRAPER_ATTRIBUTES: boolean
    ACTIVE_ACCOUNT_IS_MADISON_ACCOUNT: boolean
    YTMUSIC_WHITE_ICON_SRC: string
    YTMUSIC_WHITE_LOGO_SRC: string
    ACTIVE_ACCOUNT_CAN_UPLOAD: boolean
}

export interface ExperimentFlags {
    H5_enable_full_pacf_logging: boolean
    H5_use_async_logging: boolean
    ab_det_el_h: boolean
    ab_det_gen_re: boolean
    ab_sa_ef: boolean
    action_companion_center_align_description: boolean
    allow_skip_networkless: boolean
    att_web_record_metrics: boolean
    clean_up_manual_attribution_header: boolean
    clear_user_partitioned_ls: boolean
    compress_gel: boolean
    csi_config_handling_infra: boolean
    csi_on_gel: boolean
    deprecate_csi_has_info: boolean
    disable_av_switcher_when_audio_only: boolean
    disable_cached_masthead_data: boolean
    disable_child_node_auto_formatted_strings: boolean
    disable_enf_isd: boolean
    disable_log_to_visitor_layer: boolean
    disable_pacf_logging_for_memory_limited_tv: boolean
    disable_safari_ui_status_check: boolean
    disable_simple_mixed_direction_formatted_strings: boolean
    embeds_transport_use_scheduler: boolean
    enable_ab_report_on_errorscreen: boolean
    enable_ab_rp_int: boolean
    enable_active_view_display_ad_renderer_web_home: boolean
    enable_ad_context_in_vss_pings: boolean
    enable_async_ab_enf: boolean
    enable_cast_on_music_web: boolean
    enable_client_only_wiz_direct_reactions: boolean
    enable_client_sli_logging: boolean
    enable_client_streamz_web: boolean
    enable_cow_info_csi: boolean
    enable_entity_store_from_dependency_injection: boolean
    enable_eom_webview_header: boolean
    enable_flow_logging_p4e: boolean
    enable_fully_reactive_badge_shape: boolean
    enable_get_account_switcher_endpoint_on_webfe: boolean
    enable_ghost_view_rendering_limited_h5_client: boolean
    enable_google_payment_billing_command_client_support: boolean
    enable_handles_account_menu_switcher: boolean
    enable_in_app_backgrounding_mobile_web: boolean
    enable_ips_gating: boolean
    enable_isk_gating: boolean
    enable_mark_as_unplayed_web_optimistic_ui_updates: boolean
    enable_memberships_and_purchases: boolean
    enable_mixed_direction_formatted_strings: boolean
    enable_modular_player_page_server: boolean
    enable_music_css_mss: boolean
    enable_music_mweb_player_page_modernization: boolean
    enable_music_web_bauhaus_album_detail_page_redesign_client: boolean
    enable_music_web_bauhaus_detail_pages_redesign_download_buttons_client: boolean
    enable_music_web_bauhaus_playlist_detail_page_redesign_client: boolean
    enable_music_wiz_interop_shims: boolean
    enable_music_wiz_next_idom_logging: boolean
    enable_names_handles_account_switcher: boolean
    enable_new_music_mweb_player_bar: boolean
    enable_pacf_slot_asde_infeed_h5: boolean
    enable_pacf_slot_asde_player_byte_h5: boolean
    enable_pacf_slot_asde_player_byte_h5_TV: boolean
    enable_pass_sdc_get_accounts_list: boolean
    enable_pl_r_c: boolean
    enable_pl_r_c_s: boolean
    enable_pl_r_si_fa: boolean
    enable_polymer_resin: boolean
    enable_populate_att_psd_in_abe_feedback: boolean
    enable_populate_psd_in_abe_feedback: boolean
    enable_premium_voluntary_pause: boolean
    enable_rta_manager: boolean
    enable_sdf_in_player_video_h5: boolean
    enable_sdf_midroll_postroll_player_bytes_video_h5: boolean
    enable_sdf_preroll_player_bytes_video_h5: boolean
    enable_sdf_preroll_player_bytes_video_tv: boolean
    enable_skip_ad_guidance_prompt: boolean
    enable_skippable_ads_for_unplugged_ad_pod: boolean
    enable_smearing_expansion_dai: boolean
    enable_sponsored_ad_badge_on_ytm: boolean
    enable_third_party_info: boolean
    enable_web_96_bit_csn: boolean
    enable_web_gpay_command_spinner: boolean
    enable_web_media_session_metadata_fix: boolean
    enable_web_tiered_gel: boolean
    enable_web_upload_support: boolean
    enable_window_constrained_buy_flow_dialog: boolean
    enable_ypc_spinners: boolean
    enable_yt_ata_iframe_authuser: boolean
    err_on_pl_r_c: boolean
    export_networkless_options: boolean
    fetch_bid_for_dclk_status: boolean
    fill_single_video_with_notify_to_lasr: boolean
    fix_isd_logging: boolean
    gcf_config_store_enabled: boolean
    h5_companion_enable_adcpn_macro_substitution_for_click_pings: boolean
    h5_enable_generic_error_logging_event: boolean
    h5_inplayer_enable_adcpn_macro_substitution_for_click_pings: boolean
    h5_reset_cache_and_filter_before_update_masthead: boolean
    hide_endpoint_overflow_on_ytd_display_ad_renderer: boolean
    html5_enable_ads_client_monitoring_log_tv: boolean
    html5_enable_single_video_vod_ivar_on_pacf: boolean
    html5_log_trigger_events_with_debug_data: boolean
    il_attach_cache_limit: boolean
    il_use_view_model_logging_context: boolean
    json_condensed_response: boolean
    kev_adb_pg: boolean
    kevlar_c3po_to_wiz_4: boolean
    kevlar_dropdown_fix: boolean
    kevlar_gel_error_routing: boolean
    kevlar_response_processor_allowlist_killswitch: boolean
    kevlar_service_command_check: boolean
    kevlar_use_vimio_behavior: boolean
    kevlar_woffle_fallback_image: boolean
    live_chat_enable_controller_extraction: boolean
    live_chat_enable_rta_manager: boolean
    log_errors_through_nwl_on_retry: boolean
    log_gel_compression_latency: boolean
    log_heartbeat_with_lifecycles: boolean
    main_app_sink_wrapper_batch_1: boolean
    main_app_sink_wrapper_batch_10: boolean
    main_app_sink_wrapper_batch_11: boolean
    main_app_sink_wrapper_batch_12: boolean
    main_app_sink_wrapper_batch_13: boolean
    main_app_sink_wrapper_batch_14: boolean
    main_app_sink_wrapper_batch_15: boolean
    main_app_sink_wrapper_batch_2: boolean
    main_app_sink_wrapper_batch_3: boolean
    main_app_sink_wrapper_batch_4: boolean
    main_app_sink_wrapper_batch_5: boolean
    main_app_sink_wrapper_batch_6: boolean
    main_app_sink_wrapper_batch_7: boolean
    main_app_sink_wrapper_batch_8: boolean
    main_app_sink_wrapper_batch_9: boolean
    migrate_events_to_ts: boolean
    migrate_remaining_web_ad_badges_to_innertube: boolean
    music_controller_extraction_batch_1: boolean
    music_enable_add_to_save_rename: boolean
    music_enable_explore_tab_on_web: boolean
    music_enable_improve_your_recommendations_setting: boolean
    music_enable_multi_select: boolean
    music_enable_radio_steering_in_queues: boolean
    music_enable_responsive_radio: boolean
    music_enable_responsive_radio_client: boolean
    music_enable_responsive_radio_toast_message: boolean
    music_enable_save_queue_to_playlist: boolean
    music_enable_single_song_queue: boolean
    music_enable_sticky_playlist_saving: boolean
    music_web_cast_enable_loop: boolean
    music_web_cast_set_initial_state: boolean
    music_web_delay_watch_next_processing: boolean
    music_web_display_av_switcher: boolean
    music_web_enable_av_switcher: boolean
    music_web_enable_bauhaus_sidenav: boolean
    music_web_enable_bauhaus_style_buttons_and_chips: boolean
    music_web_enable_bauhaus_style_carousel_buttons: boolean
    music_web_enable_capri_redesign: boolean
    music_web_enable_client_side_playback_screens: boolean
    music_web_enable_drag_drop_upload: boolean
    music_web_enable_intent_header: boolean
    music_web_enable_new_icon_set: boolean
    music_web_enable_persistent_content_warning_flow: boolean
    music_web_enable_player_bar_ve_logging_fixes: boolean
    music_web_enable_player_page_transition_scroll_persistence: boolean
    music_web_enable_reuse_player_queue_item_component: boolean
    music_web_enable_select_autoplay_item: boolean
    music_web_fix_queue_logging_race_condition: boolean
    music_web_is_canary: boolean
    music_web_mark_root_visible: boolean
    music_web_ping_ad_start: boolean
    music_web_player_context_config: boolean
    music_web_prebuffer_autoplay_items: boolean
    music_web_respect_playback_content_mode: boolean
    music_web_volume_slider_granularity: boolean
    music_web_woffle_enable_list_item_badge: boolean
    mweb_deprecate_skip_ve_logging: boolean
    networkless_logging: boolean
    new_csn_storage_design: boolean
    nwl_send_from_memory_when_online: boolean
    pageid_as_header_web: boolean
    polymer_bad_build_labels: boolean
    polymer_verifiy_app_state: boolean
    qoe_send_and_write: boolean
    read_data_from_web_component_wrapper: boolean
    remove_masthead_channel_banner_on_refresh: boolean
    replace_client_url_parsing_with_server_signal: boolean
    replace_closure_window_with_updated_ytwindow_in_studio: boolean
    scheduler_use_raf_by_default: boolean
    shared_enable_controller_extraction: boolean
    shared_enable_sink_wrapping: boolean
    shell_load_gcf: boolean
    skip_invalid_ytcsi_ticks: boolean
    skip_ls_gel_retry: boolean
    skip_setting_info_in_csi_data_object: boolean
    smarter_ve_dedupping: boolean
    start_client_gcf: boolean
    start_sending_config_hash: boolean
    suppress_error_204_logging: boolean
    transport_use_scheduler: boolean
    trigger_impression_pings_on_view_search_desktop: boolean
    update_chrome_api_monitoring_allowed_features: boolean
    update_log_event_config: boolean
    use_color_palettes_modern_collections_v2: boolean
    use_core_sm: boolean
    use_csi_stp_handler: boolean
    use_event_time_ms_header: boolean
    use_fifo_for_networkless: boolean
    use_infogel_early_logging: boolean
    use_new_in_memory_storage: boolean
    use_player_abuse_bg_library: boolean
    use_request_time_ms_header: boolean
    use_session_based_sampling: boolean
    use_ts_visibilitylogger: boolean
    vss_final_ping_send_and_write: boolean
    vss_playback_use_send_and_write: boolean
    web_api_url: boolean
    web_button_rework: boolean
    web_button_rework_with_live: boolean
    web_csi_action_sampling_enabled: boolean
    web_dedupe_ve_grafting: boolean
    web_enable_ab_em_rsp: boolean
    web_enable_ab_rsp_cl: boolean
    web_enable_abd_ref: boolean
    web_enable_error_204: boolean
    web_gel_timeout_cap: boolean
    web_masthead_disappearing_channel_icon_fix: boolean
    web_masthead_visited_channel_color_fix: boolean
    web_modern_buttons: boolean
    web_one_platform_error_handling: boolean
    web_playback_associated_ve: boolean
    web_prefetch_preload_video: boolean
    web_rendererstamper_event_listener: boolean
    web_resizable_advertiser_banner_on_masthead_safari_fix: boolean
    web_scheduler_auto_init: boolean
    web_simple_scriptloader: boolean
    web_simple_styleloader: boolean
    web_use_cache_for_image_fallback: boolean
    webfe_disable_ab_em_plb: boolean
    wiz_prevent_watched_double_logging: boolean
    wiz_use_generic_logging_infra: boolean
    woffle_used_state_report: boolean
    yt_img_shadow_trigger_show_on_visible: boolean
    H5_async_logging_delay_ms: number
    log_window_onerror_fraction: number
    polymer_property_access_logging_percent: number
    tv_pacf_logging_sample_rate: number
    ytidb_transaction_ended_event_rate_limit: number
    ytidb_transaction_ended_event_rate_limit_session: number
    ytidb_transaction_ended_event_rate_limit_transaction: number
    botguard_async_snapshot_timeout_ms: number
    check_navigator_accuracy_timeout_ms: number
    client_streamz_web_flush_count: number
    client_streamz_web_flush_interval_seconds: number
    compression_disable_point: number
    gel_min_batch_size: number
    gel_queue_timeout_max_ms: number
    hide_cta_for_home_web_video_ads_animate_in_time: number
    initial_gel_batch_timeout: number
    max_body_size_to_compress: number
    max_prefetch_window_sec_for_livestream_optimization: number
    min_prefetch_offset_sec_for_livestream_optimization: number
    music_web_canary_stage: number
    music_web_delay_watch_next_ms: number
    music_web_list_continuation_prescan_height_px: number
    music_web_session_check_interval_millis: number
    music_web_sidenav_ttl_ms: number
    network_polling_interval: number
    send_config_hash_timer: number
    slow_compressions_before_abandon_count: number
    swatcheroo_pbs_max_delay_ms: number
    web_foreground_heartbeat_interval_ms: number
    web_gel_debounce_ms: number
    web_logging_max_batch: number
    web_smoothness_test_duration_ms: number
    web_smoothness_test_method: number
    wil_icon_max_concurrent_fetches: number
    ytidb_remake_db_retries: number
    ytidb_reopen_db_retries: number
    debug_forced_promo_id: string
    il_payload_scraping: string
    music_web_body_line_height: string
    music_web_gpst_url_string: string
    music_web_title_line_height: string
    user_preference_collection_initial_browse_id: string
    web_client_version_override: string
    kevlar_command_handler_command_banlist: any[]
    web_op_signal_type_banlist: any[]
}

export interface InnertubeContext {
    client: Client
    user: User
    request: Request
    clickTracking: ClickTracking
}

export interface Client {
    hl: string
    gl: string
    remoteHost: string
    deviceMake: string
    deviceModel: string
    visitorData: string
    userAgent: string
    clientName: string
    clientVersion: string
    osName: string
    osVersion: string
    originalUrl: string
    screenPixelDensity: number
    platform: string
    clientFormFactor: string
    configInfo: ConfigInfo
    screenDensityFloat: number
    userInterfaceTheme: string
    timeZone: string
    browserName: string
    browserVersion: string
    acceptHeader: string
    deviceExperimentId: string
}

export interface ConfigInfo {
    appInstallData: string
}

export interface User {
    lockedSafetyMode: boolean
}

export interface Request {
    useSsl: boolean
}

export interface ClickTracking {
    clickTrackingParams: string
}

export interface LatestEcatcherServiceTrackingParams {
    "client.name": string
}

export interface Scheduler {
    useRaf: boolean
    timeout: number
}

export interface WebPlayerContextConfigs {
    WEB_PLAYER_CONTEXT_CONFIG_ID_MUSIC_WATCH: WebPlayerContextConfigIdMusicWatch
}

export interface WebPlayerContextConfigIdMusicWatch {
    rootElementId: string
    jsUrl: string
    cssUrl: string
    contextId: string
    eventLabel: string
    contentRegion: string
    hl: string
    hostLanguage: string
    innertubeApiKey: string
    innertubeApiVersion: string
    innertubeContextClientVersion: string
    controlsType: number
    disableKeyboardControls: boolean
    disableRelatedVideos: boolean
    annotationsLoadPolicy: number
    device: Device
    serializedExperimentIds: string
    serializedExperimentFlags: string
    disableSharing: boolean
    hideInfo: boolean
    disableWatchLater: boolean
    mobileIphoneSupportsInlinePlayback: boolean
    isMobileDevice: boolean
    cspNonce: string
    canaryState: string
    enableCsiLogging: boolean
    datasyncId: string
    allowWoffleManagement: boolean
    canaryStage: string
}

export interface Device {
    brand: string
    model: string
    browser: string
    browserVersion: string
    os: string
    osVersion: string
    platform: string
    interfaceName: string
    interfaceVersion: string
}

export interface MdxConfig {
    device: string
    app: string
    appId: string
    disableDial: boolean
    theme: string
    loadCastApiSetupScript: boolean
    capabilities: string[]
    disableAutomaticScreenCache: boolean
    forceMirroring: boolean
    enableConnectWithInitialState: boolean
}

export interface RawColdConfigGroup {
    configData: string
    musicColdConfig: MusicColdConfig
}

export interface MusicColdConfig {
    enableKnightRider: boolean
    enableShortStack: boolean
    enableBottomSheetAccountSwitcher: boolean
    enableShowLibrary: boolean
    enableRemixPlayerPage: boolean
    musicEnableHomePageDiskCaching: boolean
    iosEnableLightweightHomepage: boolean
    enableShowDownloadInLibrary: boolean
    androidEnableRxForPlayerEvents: boolean
    enableMusicDownloadsAutoOffline: boolean
}

export interface RawHotConfigGroup {
    musicHotConfig: MusicHotConfig
}

export interface MusicHotConfig {
    iosEnableLightweightCollectionview: boolean
    enableOfflineLikedTab: boolean
    enableRestrictedModeSetting: boolean
    enablePlaybackLogging: boolean
    enableAndroidShortcuts: boolean
    prebufferContentLengthMs: number
    prebufferCountdownTimeMs: number
    enableSongOffline: boolean
    enableLoopOnMissingNextEndpoint: boolean
    enableAutoOptInForNotifications: boolean
    prefetchMaxRetries: number
    prefetchRetryIntervalMs: number
    musicDisplayConfig: MusicDisplayConfig
    enableNetworkChangeSnackbar: boolean
    enableIosAirplayButton: boolean
    enableMediaBrowserService: boolean
    enableRestorePlaybackState: boolean
    enableWatchHistoryNotifierConditionalRenderer: boolean
    enablePlaybackQueue: boolean
    enableInnertubeSearchSuggestionsService: boolean
    checkMultiwindowBeforeBackground: boolean
    enableQuickseekActions: boolean
    enableMediaKeyActions: boolean
    enableRemixOfflineAlbumDetailPage: boolean
    enableRemixDownloadsSection: boolean
    enableRemixOfflinePlaylistDetailPage: boolean
    musicEnableAmplifierInWatchNextService: boolean
    enableMediaBrowserServiceLogging: boolean
    musicEnableAndroidPersistentQueue: boolean
}

export interface MusicDisplayConfig {
    trackContextMenu: TrackContextMenu
}

export interface TrackContextMenu {
    musicDataBoundMenuRenderer: MusicDataBoundMenuRenderer
}

export interface MusicDataBoundMenuRenderer {
    menuRendererMold: MenuRendererMold
    dataBoundMenuItems: DataBoundMenuItem[]
    dataBoundTopLevelMenuButtons: DataBoundTopLevelMenuButton[]
}

export interface MenuRendererMold {
    menuRenderer: MenuRenderer
}

export interface MenuRenderer {
    trackingParams: string
    openImmediately: boolean
}

export interface DataBoundMenuItem {
    menuItemRendererMold: MenuItemRendererMold
    endpointMold: EndpointMold
}

export interface MenuItemRendererMold {
    menuNavigationItemRenderer?: MenuNavigationItemRenderer
    menuServiceItemRenderer?: MenuServiceItemRenderer
}

export interface MenuNavigationItemRenderer {
    text: Text
    icon: Icon
    trackingParams: string
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

export interface MenuServiceItemRenderer {
    text: Text2
    icon: Icon2
    trackingParams: string
}

export interface Text2 {
    runs: Run2[]
}

export interface Run2 {
    text: string
}

export interface Icon2 {
    iconType: string
}

export interface EndpointMold {
    watchEndpoint?: WatchEndpoint
    queueAddEndpoint?: QueueAddEndpoint
    modalEndpoint?: ModalEndpoint
    shareEntityEndpoint?: ShareEntityEndpoint
}

export interface WatchEndpoint {
    continuePlayback: boolean
}

export interface QueueAddEndpoint {
    queueInsertPosition: string
    commands: Command[]
}

export interface Command {
    clickTrackingParams: string
    addToToastAction: AddToToastAction
}

export interface AddToToastAction {
    item: Item
}

export interface Item {
    notificationTextRenderer: NotificationTextRenderer
}

export interface NotificationTextRenderer {
    successResponseText: SuccessResponseText
    trackingParams: string
}

export interface SuccessResponseText {
    runs: Run3[]
}

export interface Run3 {
    text: string
}

export interface ModalEndpoint {
    modal: Modal
}

export interface Modal {
    modalWithTitleAndButtonRenderer: ModalWithTitleAndButtonRenderer
}

export interface ModalWithTitleAndButtonRenderer {
    title: Title
    content: Content
    button: Button
}

export interface Title {
    runs: Run4[]
}

export interface Run4 {
    text: string
}

export interface Content {
    runs: Run5[]
}

export interface Run5 {
    text: string
}

export interface Button {
    buttonRenderer: ButtonRenderer
}

export interface ButtonRenderer {
    style: string
    isDisabled: boolean
    text: Text3
    navigationEndpoint: NavigationEndpoint
    trackingParams: string
}

export interface Text3 {
    runs: Run6[]
}

export interface Run6 {
    text: string
}

export interface NavigationEndpoint {
    clickTrackingParams: string
    signInEndpoint: SignInEndpoint
}

export interface SignInEndpoint {
    hack: boolean
}

export interface ShareEntityEndpoint {
    hack: boolean
}

export interface DataBoundTopLevelMenuButton {
    menuTopLevelItemRendererMold: MenuTopLevelItemRendererMold
}

export interface MenuTopLevelItemRendererMold {
    likeButtonRenderer: LikeButtonRenderer
}

export interface LikeButtonRenderer {
    trackingParams: string
    dislikeNavigationEndpoint: DislikeNavigationEndpoint
    likeCommand: LikeCommand
}

export interface DislikeNavigationEndpoint {
    clickTrackingParams: string
    modalEndpoint: ModalEndpoint2
}

export interface ModalEndpoint2 {
    modal: Modal2
}

export interface Modal2 {
    modalWithTitleAndButtonRenderer: ModalWithTitleAndButtonRenderer2
}

export interface ModalWithTitleAndButtonRenderer2 {
    title: Title2
    content: Content2
    button: Button2
}

export interface Title2 {
    runs: Run7[]
}

export interface Run7 {
    text: string
}

export interface Content2 {
    runs: Run8[]
}

export interface Run8 {
    text: string
}

export interface Button2 {
    buttonRenderer: ButtonRenderer2
}

export interface ButtonRenderer2 {
    style: string
    isDisabled: boolean
    text: Text4
    navigationEndpoint: NavigationEndpoint2
    trackingParams: string
}

export interface Text4 {
    runs: Run9[]
}

export interface Run9 {
    text: string
}

export interface NavigationEndpoint2 {
    clickTrackingParams: string
    signInEndpoint: SignInEndpoint2
}

export interface SignInEndpoint2 {
    hack: boolean
}

export interface LikeCommand {
    clickTrackingParams: string
    modalEndpoint: ModalEndpoint3
}

export interface ModalEndpoint3 {
    modal: Modal3
}

export interface Modal3 {
    modalWithTitleAndButtonRenderer: ModalWithTitleAndButtonRenderer3
}

export interface ModalWithTitleAndButtonRenderer3 {
    title: Title3
    content: Content3
    button: Button3
}

export interface Title3 {
    runs: Run10[]
}

export interface Run10 {
    text: string
}

export interface Content3 {
    runs: Run11[]
}

export interface Run11 {
    text: string
}

export interface Button3 {
    buttonRenderer: ButtonRenderer3
}

export interface ButtonRenderer3 {
    style: string
    isDisabled: boolean
    text: Text5
    navigationEndpoint: NavigationEndpoint3
    trackingParams: string
}

export interface Text5 {
    runs: Run12[]
}

export interface Run12 {
    text: string
}

export interface NavigationEndpoint3 {
    clickTrackingParams: string
    signInEndpoint: SignInEndpoint3
}

export interface SignInEndpoint3 {
    hack: boolean
}

export interface HotkeyDialog {
    title: Title4
    sections: Section[]
}

export interface Title4 {
    runs: Run13[]
}

export interface Run13 {
    text: string
}

export interface Section {
    hotkeyDialogSectionRenderer: HotkeyDialogSectionRenderer
}

export interface HotkeyDialogSectionRenderer {
    title: Title5
    options: Option[]
}

export interface Title5 {
    runs: Run14[]
}

export interface Run14 {
    text: string
}

export interface Option {
    hotkeyDialogSectionOptionRenderer: HotkeyDialogSectionOptionRenderer
}

export interface HotkeyDialogSectionOptionRenderer {
    label: Label
    hotkey: string
}

export interface Label {
    runs: Run15[]
}

export interface Run15 {
    text: string
}
