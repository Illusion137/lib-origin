import { Status } from "./types"

export interface MediaInfo {
    num_results: number
    more_available: boolean
    items: Item[]
    auto_load_more_enabled: boolean
    status: Status
}

export interface Item {
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
    caption: Caption
    sharing_friction_info: SharingFrictionInfo
    timeline_pinned_user_ids: any[]
    play_count: number
    has_views_fetching: boolean
    fb_play_count: number
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
    facepile_top_likers: any[]
    top_likers: any[]
    video_sticker_locales: any[]
    is_dash_eligible: number
    video_dash_manifest: string
    number_of_qualities: number
    video_versions: VideoVersion[]
    video_duration: number
    has_audio: boolean
    clips_tab_pinned_user_ids: any[]
    clips_metadata: ClipsMetadata
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
    hd_profile_pic_versions: HdProfilePicVersion[]
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
    hd_profile_pic_versions: HdProfilePicVersion2[]
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
    audio_ranking_info: AudioRankingInfo
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
    music_info: MusicInfo
    nux_info: any
    original_sound_info: any
    originality_info: any
    reusable_text_attribute_string: any
    reusable_text_info: any
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
    entry_point_container: any
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
    mashup_type: any
    mashups_allowed: boolean
    non_privacy_filtered_mashups_media_count: number
    privacy_filtered_mashups_media_count: any
    original_media: any
}

export interface MusicInfo {
    music_canonical_id: any
    music_asset_info: MusicAssetInfo
    music_consumption_info: MusicConsumptionInfo
}

export interface MusicAssetInfo {
    allows_saving: boolean
    artist_id: any
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
    ig_username: any
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
    ig_artist: any
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

export interface AudioMutingInfo {
    mute_audio: boolean
    mute_reason_str: string
    allow_audio_editing: boolean
    show_muted_audio_toast: boolean
}
