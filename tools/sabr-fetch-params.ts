import { load_native_fs } from '@native/fs/fs';
import { YouTubeDL } from '@origin/youtube/youtube_dl';

const VIDEO_ID = process.argv[2] ?? 'wf4kRfGzflo';

async function main() {
	await load_native_fs();

	const sabr_params = await YouTubeDL.resolve_sabr_info(VIDEO_ID);
	if ('error' in sabr_params) {
		process.stderr.write(`sabr-fetch-params error: ${String(sabr_params.error)}\n`);
		process.exit(1);
	}

	const potoken = await YouTubeDL.fetch_potoken(VIDEO_ID);
	if ('error' in potoken) {
		process.stderr.write(`sabr-fetch-params error: ${String(potoken.error)}\n`);
		process.exit(1);
	}

	const output = {
		...sabr_params,
		potoken
	};

	process.stdout.write(JSON.stringify(output, null, 2) + '\n');
}

main().catch((err) => {
	process.stderr.write(`sabr-fetch-params error: ${err}\n`);
	process.exit(1);
});
