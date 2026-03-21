import type { YouTubeDL } from '@origin/youtube_dl/index';

export type SabrTokenCallbackReason = 'proactive' | 'expired';

export interface SabrDownloadParams {
	sabrServerUrl: string;
	sabrUstreamerConfig: string;
	sabrFormats?: YouTubeDL.SabrFormat[];
	poToken?: string;
	placeholder_po_token?: string;
	clientInfo?: YouTubeDL.SabrClientInfo;
	cookie?: string;
	on_refresh_po_token?: (reason: SabrTokenCallbackReason) => Promise<string>;
	on_reload_player_response?: (context: any) => Promise<{ sabrServerUrl: string; sabrUstreamerConfig: string } | null>;
	preferOpus?: boolean;
}

export interface SabrDownloader {
	download_sabr: (
		params: SabrDownloadParams,
		output_path: string,
		on_progress?: (progress: number) => void
	) => Promise<void>;
}
