import 'dotenv/config';
import * as fs from 'fs';
import { green, cyan, yellow, red, gray, italic, magenta } from "colors";
import { Illusive } from "@illusive/illusive";
import { Prefs } from "@illusive/prefs";
import type { MusicService, MusicServiceType, MusicServiceURI, Track } from "@illusive/types";
import type { ResponseError } from "@common/types";
import { CookieJar } from "@common/utils/cookie_util";
import { generror, catch_log } from "@common/utils/error_util";

type CLIFunction = {
	usage: string;
	min_args: number;
	run: (service: MusicService, args: string[]) => Promise<unknown>;
};

const service_uri_table: Record<MusicServiceURI, MusicServiceType> = {
	illusi: 'Illusi',
	musi: 'Musi',
	youtube: 'YouTube',
	youtubemusic: 'YouTube Music',
	spotify: 'Spotify',
	amazonmusic: 'Amazon Music',
	applemusic: 'Apple Music',
	soundcloud: 'SoundCloud',
	bandlab: 'BandLab',
	audiomack: 'Audiomack',
	deezer: 'Deezer',
	tidal: 'Tidal',
	pandora: 'Pandora',
	api: 'API'
};

const env_cookie_jar_table = {
	YOUTUBE_COOKIE_JAR: 'youtube_cookie_jar',
	YOUTUBE_MUSIC_COOKIE_JAR: 'youtube_music_cookie_jar',
	SPOTIFY_COOKIE_JAR: 'spotify_cookie_jar',
	SOUNDCLOUD_COOKIE_JAR: 'soundcloud_cookie_jar',
	AMAZON_MUSIC_COOKIE_JAR: 'amazon_music_cookie_jar',
	APPLE_MUSIC_COOKIE_JAR: 'apple_music_cookie_jar',
	BANDLAB_COOKIE_JAR: 'bandlab_cookie_jar'
} as const;

function load_env_cookie_jars() {
	for (const [env_name, pref_name] of Object.entries(env_cookie_jar_table)) {
		const value = process.env[env_name];
		if (value === undefined || value === '') continue;
		Prefs.prefs[pref_name].current_value = CookieJar.fromString(value);
	}
}

function resolve_service(name: string): MusicService | ResponseError {
	const normalized = name.toLowerCase().replace(/[\s_-]/g, '');
	const type = service_uri_table[normalized as MusicServiceURI];
	const service = type !== undefined ? Illusive.music_service.get(type) : undefined;
	if (service === undefined) return generror(`Unknown service "${name}"`, 'LOW', { services: Object.values(service_uri_table) });
	return service;
}

function parse_json_arg<T>(arg: string): T | ResponseError {
	try {
		const raw = fs.existsSync(arg) ? fs.readFileSync(arg, 'utf-8') : arg;
		return JSON.parse(raw) as T;
	} catch {
		return generror(`Unable to parse JSON argument "${arg}"`, 'LOW');
	}
}

function require_method<K extends keyof MusicService>(service: MusicService, key: K): NonNullable<MusicService[K]> | ResponseError {
	const method = service[key];
	if (method === undefined) return generror(`Service lacks "${String(key)}"`, 'LOW');
	return method as NonNullable<MusicService[K]>;
}

async function call<K extends keyof MusicService>(service: MusicService, key: K, ...args: unknown[]) {
	const method = require_method(service, key);
	if (typeof method === 'object' && 'error' in method) return method;
	return await (method as (...a: unknown[]) => Promise<unknown>).apply(service, args);
}

async function call_with_tracks(service: MusicService, key: 'add_tracks_to_playlist' | 'delete_tracks_from_playlist', tracks_arg: string, playlist_uri: string) {
	const tracks = parse_json_arg<Track[]>(tracks_arg);
	if ('error' in tracks) return tracks;
	return await call(service, key, tracks, playlist_uri);
}

async function call_with_json(service: MusicService, key: 'search_continuation' | 'get_playlist_continuation', json_arg: string) {
	const continuation = parse_json_arg<unknown>(json_arg);
	if (continuation !== null && typeof continuation === 'object' && 'error' in continuation) return continuation;
	return await call(service, key, continuation);
}

const cli_functions: Record<string, CLIFunction> = {
	search: {
		usage: '<query> [limit]',
		min_args: 1,
		run: (service, [query, limit]) => call(service, 'search', query, { limit: limit !== undefined ? Number(limit) : undefined })
	},
	search_continuation: {
		usage: '<continuation-json|file>',
		min_args: 1,
		run: (service, [continuation]) => call_with_json(service, 'search_continuation', continuation)
	},
	explore: {
		usage: '',
		min_args: 0,
		run: (service) => call(service, 'explore')
	},
	get_playlist: {
		usage: '<url>',
		min_args: 1,
		run: (service, [url]) => call(service, 'get_playlist', url)
	},
	get_playlist_continuation: {
		usage: '<continuation-json|file>',
		min_args: 1,
		run: (service, [continuation]) => call_with_json(service, 'get_playlist_continuation', continuation)
	},
	get_full_playlist: {
		usage: '<url>',
		min_args: 1,
		run: (service, [url]) => service.get_full_playlist(url)
	},
	get_user_playlists: {
		usage: '',
		min_args: 0,
		run: (service) => call(service, 'get_user_playlists')
	},
	create_playlist: {
		usage: '<title>',
		min_args: 1,
		run: (service, [title]) => call(service, 'create_playlist', title)
	},
	delete_playlist: {
		usage: '<playlist-uri>',
		min_args: 1,
		run: (service, [playlist_uri]) => call(service, 'delete_playlist', playlist_uri)
	},
	add_tracks_to_playlist: {
		usage: '<tracks-json|file> <playlist-uri>',
		min_args: 2,
		run: (service, [tracks, playlist_uri]) => call_with_tracks(service, 'add_tracks_to_playlist', tracks, playlist_uri)
	},
	delete_tracks_from_playlist: {
		usage: '<tracks-json|file> <playlist-uri>',
		min_args: 2,
		run: (service, [tracks, playlist_uri]) => call_with_tracks(service, 'delete_tracks_from_playlist', tracks, playlist_uri)
	},
	download: {
		usage: '<id>',
		min_args: 1,
		run: async (service, [id]) => {
			const downloadable = require_method(service, 'downloadable');
			if ('error' in downloadable) return downloadable;
			return await downloadable.download_from_id(id);
		}
	},
	get_track_mix: {
		usage: '<id>',
		min_args: 1,
		run: (service, [id]) => call(service, 'get_track_mix', id)
	},
	get_related: {
		usage: '<id>',
		min_args: 1,
		run: (service, [id]) => call(service, 'get_related', id)
	},
	get_artist: {
		usage: '<id>',
		min_args: 1,
		run: (service, [id]) => call(service, 'get_artist', id)
	},
	get_new_releases: {
		usage: '',
		min_args: 0,
		run: (service) => call(service, 'get_new_releases')
	},
	get_latest_releases: {
		usage: '<id>',
		min_args: 1,
		run: (service, [id]) => call(service, 'get_latest_releases', id)
	},
	has_credentials: {
		usage: '',
		min_args: 0,
		run: async (service) => service.has_credentials()
	}
};

function help_contents() {
	const function_lines = Object.entries(cli_functions)
		.map(([name, fn]) => `  ${magenta("illusi")} ${cyan("<service>")} ${yellow(name)} ${cyan(fn.usage)}`)
		.join('\n');
	return green(`${gray(`--Illusi CLI powered by ${italic("The Origin Project")}--`)}

${magenta("illusi")} ${cyan("<service>")} ${cyan("<function>")} ${cyan("[...args]")}

Services: ${yellow(Object.values(service_uri_table).join(', '))}

Functions:
${function_lines}`);
}

function is_response_error(value: unknown): value is ResponseError {
	return value !== null && typeof value === 'object' && 'error' in value && (value as ResponseError).error instanceof Error;
}

async function main() {
	const [service_name, function_name, ...args] = process.argv.slice(2);
	if (service_name === undefined || function_name === undefined || service_name === '-h' || service_name === '--help') {
		console.log(help_contents());
		return;
	}

	const cli_function = cli_functions[function_name];
	if (cli_function === undefined) {
		console.error(red(`Unknown function "${function_name}"`));
		console.log(help_contents());
		process.exit(1);
	}
	if (args.length < cli_function.min_args) {
		console.error(red(`Usage: illusi ${service_name} ${function_name} ${cli_function.usage}`));
		process.exit(1);
	}

	load_env_cookie_jars();
	const service = resolve_service(service_name);
	if ('error' in service) {
		console.error(red(service.error.message));
		process.exit(1);
	}

	const result = await cli_function.run(service, args);
	if (is_response_error(result)) {
		console.error(red(result.error.message));
		process.exit(1);
	}
	console.log(JSON.stringify(result, null, 2));
}

main().catch(catch_log);
