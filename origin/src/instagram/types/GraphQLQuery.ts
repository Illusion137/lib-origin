import type { Status } from "./types"

export interface GraphQLQuery {
    data: Data
    extensions: Extensions
    status: Status
}

export interface Data {
    xdt_api__v1__feed__user_timeline_graphql_connection: XdtApiV1FeedUserTimelineGraphqlConnection
    xdt_viewer: XdtViewer
}

export interface XdtApiV1FeedUserTimelineGraphqlConnection {
    edges: Edge[]
    page_info: PageInfo
}

export interface Edge {
    node: Node
    cursor: string
}

export interface Node {
    code: string
    pk: string
    id: string
    ad_id: any
    boosted_status: any
    boost_unavailable_identifier: any
    boost_unavailable_reason: any
    caption: Caption
    caption_is_edited: boolean
    feed_demotion_control: any
    feed_recs_demotion_control: any
    taken_at: number
    inventory_source: any
    video_versions?: VideoVersion[]
    is_dash_eligible?: number
    number_of_qualities?: number
    video_dash_manifest?: string
    image_versions2: ImageVersions2
    is_paid_partnership: boolean
    sponsor_tags: any
    affiliate_info: any
    original_height: number
    original_width: number
    organic_tracking_token: string
    link: any
    story_cta: any
    user: User
    group: any
    owner: Owner
    coauthor_producers: any[]
    invited_coauthor_producers: any[]
    follow_hashtag_info: any
    title: any
    comment_count: number
    comments_disabled: any
    commenting_disabled_for_viewer: any
    like_and_view_counts_disabled: boolean
    has_liked: boolean
    top_likers: string[]
    facepile_top_likers: FacepileTopLiker[]
    like_count: number
    preview: any
    can_see_insights_as_brand: boolean
    social_context: SocialContext[]
    view_count: any
    can_reshare: any
    can_viewer_reshare: boolean
    ig_media_sharing_disabled: boolean
    photo_of_you: any
    product_type: string
    media_type: number
    usertags: any
    media_overlay_info: any
    carousel_parent_id: any
    carousel_media_count: any
    carousel_media: any
    location: any
    has_audio?: boolean
    clips_metadata?: ClipsMetadata
    clips_attribution_info: any
    accessibility_caption?: string
    audience: any
    display_uri: any
    media_cropping_info?: MediaCroppingInfo
    thumbnails: any
    timeline_pinned_user_ids: any[]
    upcoming_event: any
    logging_info_token: any
    explore: any
    main_feed_carousel_starting_media_id: any
    is_seen: any
    open_carousel_submission_state: any
    previous_submitter: any
    all_previous_submitters: any
    headline: any
    comments: any
    saved_collection_ids?: string[]
    has_viewer_saved?: boolean
    sharing_friction_info: SharingFrictionInfo
    media_level_comment_controls: any
    __typename: string
}

export interface Caption {
    has_translation: any
    created_at: number
    pk: string
    text: string
}

export interface VideoVersion {
    width: number
    height: number
    url: string
    type: number
}

export interface ImageVersions2 {
    candidates: Candidate[]
}

export interface Candidate {
    url: string
    height: number
    width: number
}

export interface User {
    pk: string
    username: string
    profile_pic_url: string
    is_private: boolean
    is_embeds_disabled: any
    is_unpublished: boolean
    is_verified: boolean
    friendship_status: FriendshipStatus
    latest_besties_reel_media: number
    latest_reel_media: number
    live_broadcast_visibility: any
    live_broadcast_id: any
    seen: any
    supervision_info: any
    id: string
    hd_profile_pic_url_info: HdProfilePicUrlInfo
    full_name: string
    __typename: string
}

export interface FriendshipStatus {
    following: boolean
    is_bestie: boolean
    is_feed_favorite: boolean
    is_restricted: boolean
}

export interface HdProfilePicUrlInfo {
    url: string
}

export interface Owner {
    pk: string
    profile_pic_url: string
    username: string
    friendship_status: FriendshipStatus2
    is_embeds_disabled: any
    is_unpublished: boolean
    is_verified: boolean
    show_account_transparency_details: boolean
    supervision_info: any
    transparency_product: any
    transparency_product_enabled: boolean
    transparency_label: any
    id: string
    __typename: string
    is_private: boolean
}

export interface FriendshipStatus2 {
    is_feed_favorite: boolean
    following: boolean
    is_restricted: boolean
    is_bestie: boolean
}

export interface FacepileTopLiker {
    profile_pic_url: string
    pk: string
    username: string
    id: string
}

export interface SocialContext {
    social_context_type: string
    social_context_users_count: number
    social_context_facepile_users: SocialContextFacepileUser[]
    __typename: string
}

export interface SocialContextFacepileUser {
    profile_pic_url: string
    pk_id: string
    username: string
    id: string
    userID: string
}

export interface ClipsMetadata {
    audio_type?: string
    achievements_info: AchievementsInfo
    music_info?: MusicInfo
    original_sound_info?: OriginalSoundInfo
}

export interface AchievementsInfo {
    show_achievements: boolean
}

export interface MusicInfo {
    music_consumption_info: MusicConsumptionInfo
    music_asset_info: MusicAssetInfo
}

export interface MusicConsumptionInfo {
    should_mute_audio: boolean
    should_mute_audio_reason: string
    is_trending_in_clips: boolean
}

export interface MusicAssetInfo {
    audio_cluster_id: string
    title: string
    display_artist: string
    is_explicit: boolean
}

export interface OriginalSoundInfo {
    original_audio_title: string
    should_mute_audio: boolean
    audio_asset_id: string
    consumption_info: ConsumptionInfo
    ig_artist: IgArtist
    is_explicit: boolean
}

export interface ConsumptionInfo {
    is_trending_in_clips: boolean
    should_mute_audio_reason: string
    should_mute_audio_reason_type: any
}

export interface IgArtist {
    username: string
    id: string
}

export interface MediaCroppingInfo {
    square_crop: SquareCrop
}

export interface SquareCrop {
    crop_bottom: number
    crop_left: number
    crop_right: number
    crop_top: number
}

export interface SharingFrictionInfo {
    should_have_sharing_friction: boolean
    bloks_app_url: any
}

export interface PageInfo {
    end_cursor: string
    has_next_page: boolean
    has_previous_page: boolean
    start_cursor: any
}

export interface XdtViewer {
    user: User2
}

export interface User2 {
    id: string
}

export interface Extensions {
    is_final: boolean
}