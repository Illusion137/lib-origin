/**
 * sabr-fetch-params.ts
 *
 * Fetches live SABR stream parameters for a YouTube video and prints them as
 * JSON to stdout. Used by SabrLiveTests.swift (in RNTPvE) via SABR_FETCH_CMD.
 *
 * Usage:
 *   npx ts-node -r tsconfig-paths/register tools/sabr-fetch-params.ts [videoId]
 *
 * Output JSON shape (matches SabrLiveParams.parseJSON in SabrLiveTests.swift):
 *   {
 *     "sabrServerUrl":       "https://rr1.googlevideo.com/...",
 *     "sabrUstreamerConfig": "<base64>",
 *     "poToken":             "<base64>",
 *     "duration":            173,
 *     "clientName":          1,
 *     "clientVersion":       "2.20250101.00.00",
 *     "formats": [ { itag, lastModified, bitrate, mimeType, ... }, ... ]
 *   }
 */

import { load_native_fs } from '@native/fs/fs';
import { load_native_potoken } from '@native/potoken/potoken';
import { YouTubeDL } from '@origin/youtube_dl/index';

const VIDEO_ID = process.argv[2] ?? 'jNQXAC9IVRw';

async function main() {
	await load_native_fs();
	await load_native_potoken();

	const result = await YouTubeDL.resolve_sabr_url(VIDEO_ID);
	if ('error' in result) {
		process.stderr.write(`sabr-fetch-params error: ${String(result.error)}\n`);
		process.exit(1);
	}

	const output = {
		sabrServerUrl: result.sabrServerUrl,
		sabrUstreamerConfig: result.sabrUstreamerConfig,
		poToken: result.poToken,
		duration: result.duration,
		clientName: result.clientInfo?.clientName,
		clientVersion: result.clientInfo?.clientVersion,
		formats: result.sabrFormats,
	};

	process.stdout.write(JSON.stringify(output, null, 2) + '\n');
}

main().catch((err) => {
	process.stderr.write(`sabr-fetch-params error: ${err}\n`);
	process.exit(1);
});
