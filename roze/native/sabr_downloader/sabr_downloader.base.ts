import type { ExtendedSabrStreamConfig } from '@origin/youtube/youtube_dl';

export type SabrTokenCallbackReason = 'placeholder_needed' | 'proactive' | 'expired';

export interface SabrDownloader {
	download_sabr: (
		params: ExtendedSabrStreamConfig,
		output_path: string,
		on_progress?: (progress: number) => void
	) => Promise<void>;
}
