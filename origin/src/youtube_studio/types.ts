export type StudioFeature = "CHANNEL_FEATURES_FEATURE_CUSTOM_THUMBNAILS_AB_QUOTA";

export type PathOrBuffer = { path: string } | { buffer: Buffer; };

export type StudioVisibility = "PUBLIC" | "UNLISTED" | "PRIVATE";

export interface BotGuardChallenge {
    program: string;
    global_name: string;
    interpreter_hash?: string;
    interpreter_url?: string;
}

export interface StudioChallenge {
    challenge: string;
    web_response: string;
    session_token: string;
    expires_at_ms: number;
}

export interface FeatureRateLimit {
    allowed: boolean;
    remaining_tokens: number;
}

export interface CreatorVideo {
    videoId: string;
    channelId?: string;
    title?: string;
    description?: string;
    privacy?: "VIDEO_PRIVACY_PUBLIC"|"VIDEO_PRIVACY_UNLISTED"|"VIDEO_PRIVACY_PRIVATE";
    status?: "VIDEO_STATUS_PROCESSED";
    draftStatus?: "DRAFT_STATUS_NONE";
    shareUrl?: string;
    watchUrl?: string;
    lengthSeconds?: string;
    videoDurationMs?: number;
    timeCreatedSeconds?: string;
    timePublishedSeconds?: string;
    thumbnailDetails?: { thumbnails: { url: string, width: number, height: number }[] };
}

export interface ListCreatorVideosOpts {
    page_size?: number;
    page_token?: string;
    order?: string;
}

export interface ListCreatorVideosResult {
    videos: CreatorVideo[];
    next_page_token?: string;
    estimated_total_size?: number;
}

export interface UploadVideoDetails {
    title?: string;
    description?: string;
    thumbnail?: PathOrBuffer;
    playlists?: string[];
    audience?: "MADE_FOR_KIDS"|"NOT_MADE_FOR_KIDS";

    paid_promotion?: boolean;
    ai_use?: boolean;

    collaboration_channels?: {
        id: string;
        analytics_setting: "VIDEO_COLLABORATOR_ANALYTICS_SETTING_NONE"|"VIDEO_COLLABORATOR_ANALYTICS_SETTING_BASIC"
    }[];

    automatic_chapters?: boolean;
    featured_places?: boolean;
    automatic_concepts?: boolean;
    tags?: string[];
    
    video_language?: string;
    caption_certification?: string;
    title_and_description_language?: string;

    recording_date?: Date;
    video_location?: string;

    license?: string;
    allow_embedding?: boolean;
    publish_to_subscriptions_feed_and_notify_subscribers?: boolean;
    shorts_remixing?: "ALLOW_VIDEO_AND_AUDIO"|"ALLOW_ONLY_AUDIO"|"DONT_ALLOW";
    category?: "FILM"|"AUTOS"|"MUSIC"|"PETS"|"SPORTS"|"TRAVEL"|"GADGETS"|"PEOPLE"|"COMEDY"|"ENTERTAINMENT"|"NEWS"|"HOWTO"|"EDUCATION"|"SCIENCE"|"GOVERNMENT";

    allow_comments?: "ON"|"OFF"|"PAUSE";
    comment_moderation?: "NONE"|"BASIC"|"STRICT"|"HOLD_ALL";
    who_can_comment?: "ANYONE"|"SUBSCRIBERS_AND_MEMBERS";
    sort_comments_by?: "TOP"|"NEWEST";
    show_how_many_viewers_like_this_video?: boolean;

    visibility?: StudioVisibility;
    subtitles?: {
        data: PathOrBuffer;
        synced: boolean;
    };
};

export interface UploadVideoSuccessfulResult {
    video_link: string;
    file_name: string;
    feedback_token: string|null;
};