import { Status } from "./types"

export interface CollectionMediaList {
    tabs: Tab[]
    save_media_response: SaveMediaResponse
    save_igtv_response: SaveIgtvResponse
    save_clips_response: SaveClipsResponse
    status: Status
}

export interface Tab {
    tab_type: string
}

export interface SaveMediaResponse {
    num_results: number
    more_available: boolean
    items: CollectionItem[]
    auto_load_more_enabled: boolean
    next_max_id: string
    media_contributors: MediaContributors
    collection_id: string
    collection_name: string
    has_related_media: boolean
}

export interface CollectionItem {
    media: Media
}

export interface Media {
    taken_at: number
    pk: string
    id: string
    fbid: string
    device_timestamp: number
    caption_is_edited: boolean
    strong_id__: string
    deleted_reason: number
    has_shared_to_fb: number
    has_delayed_metadata: boolean
    mezql_token: string
    share_count_disabled: boolean
    is_visual_reply_commenter_notice_enabled: boolean
    like_and_view_counts_disabled: boolean
    is_post_live_clips_media: boolean
    is_quiet_post: boolean
    comment_threading_enabled: boolean
    is_unified_video: boolean
    commerciality_status: string
    client_cache_key: string
    integrity_review_decision: string
    should_request_ads: boolean
    is_reshare_of_text_post_app_media_in_ig: boolean
    has_privately_liked: boolean
    filter_type: number
    can_see_insights_as_brand: boolean
    media_type: number
    code: string
    caption?: Caption
    sharing_friction_info: SharingFrictionInfo
    timeline_pinned_user_ids: any[]
    play_count: number
    has_views_fetching: boolean
    fb_play_count?: number
    ig_play_count: number
    creator_viewer_insights: any[]
    fb_user_tags: FbUserTags
    coauthor_producers: any[]
    coauthor_producer_can_see_organic_insights: boolean
    invited_coauthor_producers: any[]
    is_in_profile_grid: boolean
    profile_grid_control_enabled: boolean
    media_cropping_info: MediaCroppingInfo
    user: User2
    owner: Owner
    image_versions2: ImageVersions2
    original_width: number
    original_height: number
    is_artist_pick: boolean
    media_notes: MediaNotes
    enable_media_notes_production: boolean
    product_type: string
    is_paid_partnership: boolean
    music_metadata: any
    organic_tracking_token: string
    is_third_party_downloads_eligible: boolean
    ig_media_sharing_disabled: boolean
    are_remixes_crosspostable: boolean
    boost_unavailable_identifier: any
    boost_unavailable_reason: any
    boost_unavailable_reason_v2: any
    subscribe_cta_visible: boolean
    is_cutout_sticker_allowed: boolean
    gen_ai_detection_method: GenAiDetectionMethod
    fb_aggregated_like_count: number
    fb_aggregated_comment_count: number
    has_high_risk_gen_ai_inform_treatment: boolean
    open_carousel_show_follow_button: boolean
    is_tagged_media_shared_to_viewer_profile_grid: boolean
    should_show_author_pog_for_tagged_media_shared_to_profile_grid: boolean
    is_eligible_for_media_note_recs_nux: boolean
    is_social_ufi_disabled: boolean
    is_eligible_for_meta_ai_share: boolean
    meta_ai_suggested_prompts: any[]
    can_reply: boolean
    can_view_more_preview_comments: boolean
    preview_comments: any[]
    comment_count: number
    hide_view_all_comment_entrypoint: boolean
    inline_composer_display_condition: string
    is_comments_gif_composer_enabled: boolean
    comment_inform_treatment: CommentInformTreatment
    has_liked: boolean
    like_count: number
    video_sticker_locales: any[]
    is_dash_eligible: number
    video_dash_manifest: string
    number_of_qualities: number
    video_versions: VideoVersion[]
    video_duration: number
    has_audio: boolean
    clips_tab_pinned_user_ids: any[]
    clips_metadata: ClipsMetadata
    has_viewer_saved?: boolean
    saved_collection_ids?: string[]
    can_viewer_save: boolean
    can_viewer_reshare: boolean
    shop_routing_user_id: any
    is_organic_product_tagging_eligible: boolean
    igbio_product: any
    featured_products: any[]
    product_suggestions: any[]
    is_reuse_allowed: boolean
    has_more_comments: boolean
    max_num_visible_preview_comments: number
    explore_hide_comments: boolean
    is_open_to_public_submission: boolean
    creative_config?: CreativeConfig
    video_subtitles_confidence?: number
    video_subtitles_uri?: string
    video_subtitles_locale?: string
    usertags?: Usertags
    photo_of_you?: boolean
    commerce_integrity_review_decision?: string
    location?: Location
    lng?: number
    lat?: number
    clips_mashup_follow_button_info?: ClipsMashupFollowButtonInfo
}

export interface Caption {
    bit_flags: number
    created_at: number
    created_at_utc: number
    did_report_as_spam: boolean
    is_ranked_comment: boolean
    pk: string
    share_enabled: boolean
    content_type: string
    media_id: string
    status: string
    type: number
    user_id: string
    strong_id__: string
    text: string
    user: User
    is_covered: boolean
    private_reply_status: number
    has_translation?: boolean
}

export interface User {
    pk: string
    pk_id: string
    id: string
    username: string
    full_name: string
    is_private: boolean
    is_unpublished: boolean
    strong_id__: string
    fbid_v2: string
    is_verified: boolean
    profile_pic_id: string
    profile_pic_url: string
}

export interface SharingFrictionInfo {
    bloks_app_url: any
    should_have_sharing_friction: boolean
    sharing_friction_payload: any
}

export interface FbUserTags {
    in: any[]
}

export interface MediaCroppingInfo {
    square_crop: SquareCrop
}

export interface SquareCrop {
    crop_left: number
    crop_right: number
    crop_top: number
    crop_bottom: number
}

export interface User2 {
    fbid_v2: string
    feed_post_reshare_disabled: boolean
    full_name: string
    id: string
    is_private: boolean
    is_unpublished: boolean
    pk: string
    pk_id: string
    show_account_transparency_details: boolean
    strong_id__: string
    third_party_downloads_enabled: number
    username: string
    account_type: number
    account_badges: any[]
    fan_club_info: FanClubInfo
    friendship_status: FriendshipStatus
    has_anonymous_profile_picture: boolean
    hd_profile_pic_url_info: HdProfilePicUrlInfo
    hd_profile_pic_versions?: HdProfilePicVersion[]
    is_favorite: boolean
    is_verified: boolean
    profile_pic_id: string
    profile_pic_url: string
    transparency_product_enabled: boolean
    latest_reel_media: number
    can_see_quiet_post_attribution: boolean
}

export interface FanClubInfo {
    autosave_to_exclusive_highlight: any
    connected_member_count: any
    fan_club_id: any
    fan_club_name: any
    has_created_ssc: any
    has_enough_subscribers_for_ssc: any
    is_fan_club_gifting_eligible: any
    is_fan_club_referral_eligible: any
    is_free_trial_eligible: any
    largest_public_bc_id: any
    subscriber_count: any
    fan_consideration_page_revamp_eligiblity: any
}

export interface FriendshipStatus {
    following: boolean
    is_bestie: boolean
    is_feed_favorite: boolean
    is_restricted: boolean
}

export interface HdProfilePicUrlInfo {
    height: number
    url: string
    width: number
}

export interface HdProfilePicVersion {
    height: number
    url: string
    width: number
}

export interface Owner {
    fbid_v2: string
    feed_post_reshare_disabled: boolean
    full_name: string
    id: string
    is_private: boolean
    is_unpublished: boolean
    pk: string
    pk_id: string
    show_account_transparency_details: boolean
    strong_id__: string
    third_party_downloads_enabled: number
    username: string
    account_type: number
    account_badges: any[]
    fan_club_info: FanClubInfo2
    friendship_status: FriendshipStatus2
    has_anonymous_profile_picture: boolean
    hd_profile_pic_url_info: HdProfilePicUrlInfo2
    hd_profile_pic_versions?: HdProfilePicVersion2[]
    is_favorite: boolean
    is_verified: boolean
    profile_pic_id: string
    profile_pic_url: string
    transparency_product_enabled: boolean
    latest_reel_media: number
    can_see_quiet_post_attribution: boolean
}

export interface FanClubInfo2 {
    autosave_to_exclusive_highlight: any
    connected_member_count: any
    fan_club_id: any
    fan_club_name: any
    has_created_ssc: any
    has_enough_subscribers_for_ssc: any
    is_fan_club_gifting_eligible: any
    is_fan_club_referral_eligible: any
    is_free_trial_eligible: any
    largest_public_bc_id: any
    subscriber_count: any
    fan_consideration_page_revamp_eligiblity: any
}

export interface FriendshipStatus2 {
    following: boolean
    is_bestie: boolean
    is_feed_favorite: boolean
    is_restricted: boolean
}

export interface HdProfilePicUrlInfo2 {
    height: number
    url: string
    width: number
}

export interface HdProfilePicVersion2 {
    height: number
    url: string
    width: number
}

export interface ImageVersions2 {
    candidates: Candidate[]
    additional_candidates: AdditionalCandidates
    scrubber_spritesheet_info_candidates?: ScrubberSpritesheetInfoCandidates
}

export interface Candidate {
    width: number
    height: number
    url: string
}

export interface AdditionalCandidates {
    igtv_first_frame: IgtvFirstFrame
    first_frame: FirstFrame
    smart_frame: any
}

export interface IgtvFirstFrame {
    width: number
    height: number
    url: string
}

export interface FirstFrame {
    width: number
    height: number
    url: string
}

export interface ScrubberSpritesheetInfoCandidates {
    default: Default
}

export interface Default {
    video_length: number
    thumbnail_width: number
    thumbnail_height: number
    thumbnail_duration: number
    sprite_urls: string[]
    thumbnails_per_row: number
    total_thumbnail_num_per_sprite: number
    max_thumbnails_per_sprite: number
    sprite_width: number
    sprite_height: number
    rendered_width: number
    file_size_kb: number
}

export interface MediaNotes {
    items: any[]
}

export interface GenAiDetectionMethod {
    detection_method: string
}

export interface CommentInformTreatment {
    action_type: any
    should_have_inform_treatment: boolean
    text: string
    url: any
}

export interface VideoVersion {
    height: number
    id: string
    type: number
    url: string
    width: number
}

export interface ClipsMetadata {
    breaking_content_info: any
    breaking_creator_info: any
    clips_creation_entry_point: string
    featured_label: any
    is_public_chat_welcome_video: boolean
    is_shared_to_fb: boolean
    professional_clips_upsell_type: number
    reels_on_the_rise_info: any
    show_tips: any
    achievements_info: AchievementsInfo
    additional_audio_info: AdditionalAudioInfo
    asset_recommendation_info: any
    audio_ranking_info?: AudioRankingInfo
    audio_type: string
    branded_content_tag_info: BrandedContentTagInfo
    challenge_info: any
    content_appreciation_info: ContentAppreciationInfo
    contextual_highlight_info: any
    cutout_sticker_info: any[]
    disable_use_in_clips_client_cache: boolean
    external_media_info: any
    is_fan_club_promo_video: boolean
    mashup_info: MashupInfo
    merchandising_pill_info: any
    music_canonical_id: string
    music_info?: MusicInfo
    nux_info: any
    original_sound_info?: OriginalSoundInfo
    originality_info: any
    reusable_text_attribute_string?: string
    reusable_text_info?: ReusableTextInfo[]
    shopping_info: any
    show_achievements: boolean
    template_info: any
    viewer_interaction_settings: any
}

export interface AchievementsInfo {
    num_earned_achievements: any
    show_achievements: boolean
}

export interface AdditionalAudioInfo {
    additional_audio_username: any
    audio_reattribution_info: AudioReattributionInfo
}

export interface AudioReattributionInfo {
    should_allow_restore: boolean
}

export interface AudioRankingInfo {
    best_audio_cluster_id: string
}

export interface BrandedContentTagInfo {
    can_add_tag: boolean
}

export interface ContentAppreciationInfo {
    enabled: boolean
    entry_point_container?: EntryPointContainer
}

export interface EntryPointContainer {
    pill: Pill
    comment: Comment
    overflow: any
    ufi: any
}

export interface Pill {
    action_type: string
    priority: number
}

export interface Comment {
    action_type: string
}

export interface MashupInfo {
    can_toggle_mashups_allowed: boolean
    formatted_mashups_count: any
    has_been_mashed_up: boolean
    has_nonmimicable_additional_audio: boolean
    is_creator_requesting_mashup: boolean
    is_light_weight_check: boolean
    is_light_weight_reuse_allowed_check: boolean
    is_pivot_page_available: boolean
    is_reuse_allowed: boolean
    mashup_type?: string
    mashups_allowed: boolean
    non_privacy_filtered_mashups_media_count: number
    privacy_filtered_mashups_media_count: any
    original_media?: OriginalMedia
}

export interface OriginalMedia {
    formatted_mashups_count: any
    is_light_weight_check: boolean
    is_pivot_page_available: boolean
    mashups_allowed: boolean
    media_type: string
    non_privacy_filtered_mashups_media_count: number
    pk: string
    privacy_filtered_mashups_media_count: any
    product_type: string
    sidecar_child_media_ids: any
    user: User3
}

export interface User3 {
    pk: string
    pk_id: string
    id: string
    username: string
    full_name: string
    is_private: boolean
    strong_id__: string
    fbid_v2: string
    third_party_downloads_enabled: number
    is_verified: boolean
    profile_pic_id: string
    profile_pic_url: string
    has_anonymous_profile_picture: boolean
    account_badges: any[]
}

export interface MusicInfo {
    music_canonical_id: any
    music_asset_info: MusicAssetInfo
    music_consumption_info: MusicConsumptionInfo
}

export interface MusicAssetInfo {
    allows_saving: boolean
    artist_id?: string
    audio_asset_id: string
    audio_cluster_id: string
    cover_artwork_thumbnail_uri: string
    cover_artwork_uri: string
    dark_message: any
    dash_manifest: any
    display_artist: string
    duration_in_ms: number
    fast_start_progressive_download_url: string
    has_lyrics: boolean
    highlight_start_times_in_ms: number[]
    id: string
    ig_username?: string
    is_eligible_for_audio_effects: boolean
    is_explicit: boolean
    progressive_download_url: string
    reactive_audio_download_url: any
    sanitized_title: any
    subtitle: string
    title: string
    web_30s_preview_download_url: string
    is_eligible_for_vinyl_sticker: boolean
    lyrics: any
}

export interface MusicConsumptionInfo {
    allow_media_creation_with_music: boolean
    audio_asset_start_time_in_ms: number
    contains_lyrics: any
    derived_content_id: any
    display_labels: any
    formatted_clips_media_count: any
    ig_artist?: IgArtist
    is_bookmarked: boolean
    is_trending_in_clips: boolean
    overlap_duration_in_ms: number
    placeholder_profile_pic_url: string
    should_allow_music_editing: boolean
    should_mute_audio: boolean
    should_mute_audio_reason: string
    should_mute_audio_reason_type: any
    should_render_soundwave: boolean
    trend_rank: any
    previous_trend_rank: any
    audio_filter_infos: any[]
    audio_muting_info: AudioMutingInfo
}

export interface IgArtist {
    pk: string
    pk_id: string
    id: string
    username: string
    full_name: string
    is_private: boolean
    strong_id__: string
    is_verified: boolean
    profile_pic_id: string
    profile_pic_url: string
}

export interface AudioMutingInfo {
    mute_audio: boolean
    mute_reason_str: string
    allow_audio_editing: boolean
    show_muted_audio_toast: boolean
}

export interface OriginalSoundInfo {
    allow_creator_to_rename: boolean
    audio_asset_id: string
    attributed_custom_audio_asset_id: any
    can_remix_be_shared_to_fb: boolean
    can_remix_be_shared_to_fb_expansion: boolean
    dash_manifest: string
    duration_in_ms: number
    formatted_clips_media_count: any
    hide_remixing: boolean
    ig_artist: IgArtist2
    is_audio_automatically_attributed: boolean
    is_eligible_for_audio_effects: boolean
    is_eligible_for_vinyl_sticker: boolean
    is_explicit: boolean
    is_original_audio_download_eligible: boolean
    is_reuse_disabled: boolean
    is_xpost_from_fb: boolean
    music_canonical_id: any
    oa_owner_is_music_artist: boolean
    original_audio_subtype: string
    original_audio_title: string
    original_media_id: string
    progressive_download_url: string
    should_mute_audio: boolean
    time_created: number
    trend_rank: any
    previous_trend_rank: any
    overlap_duration_in_ms: any
    audio_asset_start_time_in_ms: any
    audio_filter_infos: any[]
    audio_parts: any[]
    audio_parts_by_filter: any[]
    consumption_info: ConsumptionInfo
    xpost_fb_creator_info: any
}

export interface IgArtist2 {
    pk: string
    pk_id: string
    id: string
    username: string
    full_name: string
    is_private: boolean
    strong_id__: string
    is_verified: boolean
    profile_pic_id: string
    profile_pic_url: string
}

export interface ConsumptionInfo {
    display_media_id: any
    is_bookmarked: boolean
    is_trending_in_clips: boolean
    should_mute_audio_reason: string
    should_mute_audio_reason_type: any
}

export interface ReusableTextInfo {
    id: string
    text: string
    start_time_ms: number
    end_time_ms: number
    width: number
    height: number
    offset_x: number
    offset_y: number
    z_index: number
    rotation_degree: number
    scale: number
    alignment: string
    colors: Color[]
    text_format_type: string
    font_size: number
    text_emphasis_mode: string
    is_animated: number
}

export interface Color {
    count: number
    hex_rgba_color: string
}

export interface CreativeConfig {
    capture_type: string
    creation_tool_info: any[]
}

export interface Usertags {
    in: In[]
}

export interface In {
    position: number[]
    user: User4
}

export interface User4 {
    pk: string
    pk_id: string
    id: string
    username: string
    full_name: string
    is_private: boolean
    strong_id__: string
    is_verified: boolean
    profile_pic_id: string
    profile_pic_url: string
}

export interface Location {
    address: string
    city: string
    external_source: string
    facebook_places_id: string
    has_viewer_saved: boolean
    is_eligible_for_guides: boolean
    lat: number
    lng: number
    name: string
    pk: string
    short_name: string
}

export interface ClipsMashupFollowButtonInfo {
    show_follow_bottom_sheet_button: boolean
    is_original_author_in_author_exp: boolean
}

export interface MediaContributors {
    "3436535775335183068": N3436535775335183068
    "3484272001658594014": N3484272001658594014
    "3484768912670117377": N3484768912670117377
    "3422059362359679158": N3422059362359679158
    "3396021141807090564": N3396021141807090564
    "3437504751119856787": N3437504751119856787
    "3483932181724073736": N3483932181724073736
    "3484046470419165915": N3484046470419165915
    "3484690715938863841": N3484690715938863841
    "3462949022950427003": N3462949022950427003
    "3479957779895135784": N3479957779895135784
    "3448987432454427146": N3448987432454427146
}

export interface N3436535775335183068 {
    pk: string
    pk_id: string
    username: string
    full_name: string
    is_private: boolean
    has_onboarded_to_text_post_app: boolean
    strong_id__: string
    id: string
    is_verified: boolean
    profile_pic_id: string
    profile_pic_url: string
}

export interface N3484272001658594014 {
    pk: string
    pk_id: string
    username: string
    full_name: string
    is_private: boolean
    strong_id__: string
    id: string
    is_verified: boolean
    profile_pic_id: string
    profile_pic_url: string
}

export interface N3484768912670117377 {
    pk: string
    pk_id: string
    username: string
    full_name: string
    is_private: boolean
    strong_id__: string
    id: string
    is_verified: boolean
    profile_pic_id: string
    profile_pic_url: string
}

export interface N3422059362359679158 {
    pk: string
    pk_id: string
    username: string
    full_name: string
    is_private: boolean
    has_onboarded_to_text_post_app: boolean
    strong_id__: string
    id: string
    is_verified: boolean
    profile_pic_id: string
    profile_pic_url: string
}

export interface N3396021141807090564 {
    pk: string
    pk_id: string
    username: string
    full_name: string
    is_private: boolean
    strong_id__: string
    id: string
    is_verified: boolean
    profile_pic_id: string
    profile_pic_url: string
}

export interface N3437504751119856787 {
    pk: string
    pk_id: string
    username: string
    full_name: string
    is_private: boolean
    strong_id__: string
    id: string
    is_verified: boolean
    profile_pic_id: string
    profile_pic_url: string
}

export interface N3483932181724073736 {
    pk: string
    pk_id: string
    username: string
    full_name: string
    is_private: boolean
    strong_id__: string
    id: string
    is_verified: boolean
    profile_pic_id: string
    profile_pic_url: string
}

export interface N3484046470419165915 {
    pk: string
    pk_id: string
    username: string
    full_name: string
    is_private: boolean
    strong_id__: string
    id: string
    is_verified: boolean
    profile_pic_id: string
    profile_pic_url: string
}

export interface N3484690715938863841 {
    pk: string
    pk_id: string
    username: string
    full_name: string
    is_private: boolean
    strong_id__: string
    id: string
    is_verified: boolean
    profile_pic_id: string
    profile_pic_url: string
}

export interface N3462949022950427003 {
    pk: string
    pk_id: string
    username: string
    full_name: string
    is_private: boolean
    strong_id__: string
    id: string
    is_verified: boolean
    profile_pic_id: string
    profile_pic_url: string
}

export interface N3479957779895135784 {
    pk: string
    pk_id: string
    username: string
    full_name: string
    is_private: boolean
    strong_id__: string
    id: string
    is_verified: boolean
    profile_pic_id: string
    profile_pic_url: string
}

export interface N3448987432454427146 {
    pk: string
    pk_id: string
    username: string
    full_name: string
    is_private: boolean
    strong_id__: string
    id: string
    is_verified: boolean
    profile_pic_id: string
    profile_pic_url: string
}

export interface SaveIgtvResponse { }

export interface SaveClipsResponse { }