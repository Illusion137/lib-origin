import type { YouTubeDL } from '@origin/youtube_dl/index';

export interface SabrDownloadParams {
	sabrServerUrl: string;
	sabrUstreamerConfig: string;
	sabrFormats?: YouTubeDL.SabrFormat[];
	poToken?: string;
	clientInfo?: YouTubeDL.SabrClientInfo;
	cookie?: string;
}

export interface SabrDownloader {
	download_sabr: (
		params: SabrDownloadParams,
		output_path: string,
		on_progress?: (progress: number) => void
	) => Promise<void>;
}
