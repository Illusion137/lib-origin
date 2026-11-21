import type { Types } from 'youtubei.js';

export type PathOrBuffer = { path: string } | { buffer: Buffer };

export type StudioVisibility = Types.StudioVisibility;

export type StudioFeature = 'CHANNEL_FEATURES_FEATURE_CUSTOM_THUMBNAILS_AB_QUOTA';

export interface FeatureRateLimit {
	allowed: boolean;
	remaining_tokens: number;
}

export interface ListCreatorVideosOpts {
	page_size?: number;
	page_token?: string;
	order?: string;
}

export type UploadVideoDetails = Omit<Types.UploadVideoDetails, 'thumbnail' | 'subtitles'> & {
	thumbnail?: PathOrBuffer;
	subtitles?: { data: PathOrBuffer; synced: boolean };
};

export interface UploadVideoSuccessfulResult {
	video_link: string;
	file_name: string;
	feedback_token: string | null;
}
