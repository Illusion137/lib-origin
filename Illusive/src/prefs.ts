import { CookieJar } from '@common/utils/cookie_util';
import type { CompactPlaylist, HexColor, LinkerLink, Track } from '@illusive/types';
import { gen_uuid, generate_new_uid } from '@common/utils/util';
import { base_load_map, base_save_map, generic_load_prefs, generic_reset_prefs, generic_save_pref, type BasePref, type BasePrefLoadMap, type BasePrefSaveMap, type BasePrefTypes } from '@native/mmkv/mmkv_utils';
import { fs } from '@native/fs/fs';
import type { MMKVModule } from '@native/mmkv/mmkv.base';
import { Constants } from './constants';
import { load_native_mmkv, mmkv } from '@native/mmkv/mmkv';
import { force_json_parse, force_json_parse_array } from '@common/utils/parse_util';
import { get_native_platform } from '@native/native_mode';

export namespace Prefs {
	export type OtherPrefTypes = 'BIAS' | 'LINKER_LINKS' | 'PAST_QUEUE' | 'NEW_RELEASES';

	export type PossibleThemes = keyof typeof themes;

	export async function load_mmkv_module() {
		await load_native_mmkv();
		await mmkv().load_mmkv({
			id: 'illusi.illusion.com',
			path: get_native_platform() === 'REACT_NATIVE' ? await fs().document_directory('.illusi', 'ipref.mmkv') : await fs().document_directory('ipref.mmkv')
		});
	}

	const user_uuid = gen_uuid();

	export const equalizer_presets = {
		'Default': [0, 0, 0, 0, 0, 0],

		// Bass variants
		'Super Bass Boost': [8, 6, 2, 0, -1, -2],
		'Bass Boost': [6, 4, 2, 0, -1, -2],
		'Bass Reducer': [-6, -4, -2, 0, 0, 0],
		'Deep Bass': [10, 7, 3, 0, -1, -2],
		'Punchy Bass': [7, 3, 1, 0, -1, -1],
		'Sub Bass': [10, 8, 4, 0, -2, -3],
		'Low Bass': [-6, -4, -2, 0, 0, 0],
		'No Bass': [-12, -6, -2, 0, 0, 0],

		// Treble variants
		'Treble Boost': [-2, -1, 0, 2, 4, 6],
		'Treble Reducer': [0, 0, 0, -2, -4, -6],
		'Air': [-1, 0, 0, 1, 3, 7],

		// Boost variants
		'Small Boost': [3, 2, 1, 0, 0, 0],
		'Loudness': [5, 3, 1, 0, 2, 4],
		'Full Boost': [5, 4, 3, 3, 4, 5],
		'V-Shape': [6, 3, -1, -1, 3, 6],
		'Flat Cut': [-3, -3, -3, -3, -3, -3],

		// Vocal variants
		'Vocal Boost': [-2, -1, 1, 3, 4, 2],
		'Voice Clarity': [-3, -2, 2, 4, 3, 1],
		'Podcast': [-3, -2, 1, 3, 4, 3],
		'Karaoke': [-5, -3, 1, 4, 5, 3],
		'Broadcast': [-2, 0, 2, 4, 4, 2],

		// Genre
		'Rock': [4, 2, 1, 1, 3, 5],
		'Hard Rock': [6, 3, 1, 2, 4, 6],
		'Metal': [7, 4, 1, 2, 4, 7],
		'Pop': [-1, 1, 3, 4, 2, 1],
		'K-Pop': [2, 2, 4, 4, 3, 2],
		'Classical': [0, 1, 2, 1, 0, 2],
		'Orchestra': [2, 1, 2, 1, 1, 3],
		'Jazz': [2, 2, 1, 0, 2, 3],
		'Blues': [5, 3, 1, 0, 2, 4],
		'Soul': [4, 3, 2, 1, 2, 3],
		'R&B': [6, 4, 2, 1, 2, 2],
		'Hip-Hop': [6, 4, 2, 0, 1, -1],
		'Trap': [8, 5, 2, 0, 0, -1],
		'Electronic': [5, 3, 0, 1, 4, 6],
		'EDM': [6, 4, 0, 2, 5, 7],
		'House': [5, 3, 0, 1, 4, 5],
		'Techno': [5, 2, 0, 2, 3, 5],
		'Ambient': [3, 2, 1, 0, 1, 3],
		'Lofi': [4, 3, 2, -1, -2, -3],
		'Acoustic': [-1, 0, 2, 3, 2, 1],
		'Folk': [1, 1, 2, 2, 1, 2],
		'Country': [2, 1, 1, 2, 3, 4],
		'Reggae': [5, 3, -1, -2, 2, 3],
		'Latin': [3, 2, 1, 2, 4, 5],
		'Dance': [5, 3, 0, 2, 4, 5],
		'Funk': [5, 3, 2, 1, 2, 2],
		'Punk': [5, 2, 0, 1, 3, 5],
		'Gospel': [3, 2, 2, 3, 4, 3],

		// Media / use-case
		'Movie': [4, 2, 0, 2, 3, 4],
		'Gaming': [5, 3, 1, 2, 4, 5],
		'Sports Commentary': [-2, 0, 1, 3, 4, 3],
		'Night Mode': [-2, -1, 0, 1, 1, -1],
		'Headphones': [3, 2, 1, 1, 2, 4],
		'Earbuds': [4, 3, 2, 1, 3, 5],
		'Laptop Speakers': [5, 4, 2, 1, 0, -1],
		'Large Room': [4, 2, 0, 1, 2, 4]
	} as const;
	export type EqualizerPreset = keyof typeof equalizer_presets;
	interface PastQueue { index: number; tracks: Track[] }

	export const default_track_shuffle_bias = {
		total_plays: 0,
		too_long_duration: 0,
		too_short_duration: 0,
		last_played: 0,
		recent_add_date: 0,
		is_downloaded: 0,
		has_thumbnail_dl: 0,
		has_lyrics_dl: 0,
		has_synced_lyrics_dl: 0,
		plays_from_artist: 0,
		plays_from_album: 0,
		plays_in_past_month: 0,
		explicit: 0,
		no_explicit: 0,
		acousticness: 0,
		danceability: 0,
		energy: 0,
		instrumentalness: 0,
		liveness: 0,
		speechiness: 0,
		valence: 0
	};
	type Bias = typeof default_track_shuffle_bias;

	export const prefs = {
		legacy_prefs: { default_value: '', current_value: '', type: 'STRING' } as BasePref<string, OtherPrefTypes>,
		youtube_cookie_jar: { default_value: new CookieJar([]), current_value: new CookieJar([]), type: 'COOKIE_JAR' } as BasePref<CookieJar, OtherPrefTypes>,
		youtube_music_cookie_jar: { default_value: new CookieJar([]), current_value: new CookieJar([]), type: 'COOKIE_JAR' } as BasePref<CookieJar, OtherPrefTypes>,
		soundcloud_cookie_jar: { default_value: new CookieJar([]), current_value: new CookieJar([]), type: 'COOKIE_JAR' } as BasePref<CookieJar, OtherPrefTypes>,
		spotify_cookie_jar: { default_value: new CookieJar([]), current_value: new CookieJar([]), type: 'COOKIE_JAR' } as BasePref<CookieJar, OtherPrefTypes>,
		amazon_music_cookie_jar: { default_value: new CookieJar([]), current_value: new CookieJar([]), type: 'COOKIE_JAR' } as BasePref<CookieJar, OtherPrefTypes>,
		apple_music_cookie_jar: { default_value: new CookieJar([]), current_value: new CookieJar([]), type: 'COOKIE_JAR' } as BasePref<CookieJar, OtherPrefTypes>,
		bandlab_cookie_jar: { default_value: new CookieJar([]), current_value: new CookieJar([]), type: 'COOKIE_JAR' } as BasePref<CookieJar, OtherPrefTypes>,
		audiomack_cookie_jar: { default_value: new CookieJar([]), current_value: new CookieJar([]), type: 'COOKIE_JAR' } as BasePref<CookieJar, OtherPrefTypes>,
		deezer_cookie_jar: { default_value: new CookieJar([]), current_value: new CookieJar([]), type: 'COOKIE_JAR' } as BasePref<CookieJar, OtherPrefTypes>,
		pandora_cookie_jar: { default_value: new CookieJar([]), current_value: new CookieJar([]), type: 'COOKIE_JAR' } as BasePref<CookieJar, OtherPrefTypes>,
		tidal_cookie_jar: { default_value: new CookieJar([]), current_value: new CookieJar([]), type: 'COOKIE_JAR' } as BasePref<CookieJar, OtherPrefTypes>,
		user_uuid: { default_value: user_uuid, current_value: user_uuid, type: 'STRING' } as BasePref<string, OtherPrefTypes>,
		last_synced: { default_value: new Date(0), current_value: new Date(0), type: 'DATE' } as BasePref<Date, OtherPrefTypes>,
		automatic_new_releases_last_refreshed: { default_value: new Date(0), current_value: new Date(0), type: 'DATE' } as BasePref<Date, OtherPrefTypes>,
		new_releases_last_refreshed: { default_value: new Date(0), current_value: new Date(0), type: 'DATE' } as BasePref<Date, OtherPrefTypes>,
		discord_webhook_url: { default_value: '', current_value: '', type: 'STRING' } as BasePref<string, OtherPrefTypes>,
		latest_version: { default_value: '16.2.5', current_value: '16.2.5', type: 'STRING' } as BasePref<string, OtherPrefTypes>,
		database_version: { default_value: '17.2.0', current_value: '17.2.0', type: 'STRING' } as BasePref<string, OtherPrefTypes>,
		recent_searches: { default_value: [], current_value: [], type: 'STRING_ARRAY' } as BasePref<string[], OtherPrefTypes>,
		equalizer_preset: { default_value: 'Default', current_value: 'Default', type: 'STRING' } as BasePref<EqualizerPreset, OtherPrefTypes>,
		crossfade: { default_value: 0, current_value: 0, type: 'NUMBER' } as BasePref<number, OtherPrefTypes>,
		past_queue: { default_value: { index: 0, tracks: [] }, current_value: { index: 0, tracks: [] }, type: 'PAST_QUEUE' } as BasePref<PastQueue, OtherPrefTypes>,
		new_releases: { default_value: [], current_value: [], type: 'NEW_RELEASES' } as BasePref<CompactPlaylist[], OtherPrefTypes>,
		last_sleep_timer_ms: { default_value: 0, current_value: 0, type: 'NUMBER' } as BasePref<number, OtherPrefTypes>,
		linker_links: { default_value: [], current_value: [], type: 'LINKER_LINKS' } as BasePref<LinkerLink[], OtherPrefTypes>,
		primary_color: { default_value: '#7400fe', current_value: '#7400fe', type: 'STRING' } as BasePref<HexColor, OtherPrefTypes>,
		theme: { default_value: 'dark', current_value: 'dark', type: 'STRING' } as BasePref<PossibleThemes, OtherPrefTypes>,
		track_shuffle_bias: { default_value: default_track_shuffle_bias, current_value: default_track_shuffle_bias, type: 'BIAS' } as BasePref<Bias, OtherPrefTypes>,
		carplay_play_mode: { default_value: 'shuffle', current_value: 'shuffle', type: 'STRING' } as BasePref<'shuffle' | 'in_order' | 'mix_queue', OtherPrefTypes>,
		p2p_name: { default_value: `sumi!-${generate_new_uid('')}`, current_value: `sumi!-${generate_new_uid('')}`, type: 'STRING' } as BasePref<string, OtherPrefTypes>,
		recent_rejected_ota_update: { default_value: '', current_value: '', type: 'STRING' } as BasePref<string, OtherPrefTypes>,
		illusi_session: { default_value: '', current_value: '', type: 'STRING' } as BasePref<string, OtherPrefTypes>,
		/** JSON array of refresh tokens whose logout didn't reach the server; sent again until it does */
		illusi_pending_logouts: { default_value: '', current_value: '', type: 'STRING' } as BasePref<string, OtherPrefTypes>,
		/** The first account that signed in; the default database holds its library */
		illusi_owner_account: { default_value: '', current_value: '', type: 'STRING' } as BasePref<string, OtherPrefTypes>,
		/** Database file the app opens at startup; empty is the default one */
		illusi_active_db: { default_value: '', current_value: '', type: 'STRING' } as BasePref<string, OtherPrefTypes>,

		default_playlist_max_size: { default_value: 200, current_value: 200, type: 'NUMBER', visible: true, section: 'Playlist' } as BasePref<number, OtherPrefTypes>,
		recently_played_max_size: { default_value: 100, current_value: 100, type: 'NUMBER', visible: true, section: 'Playlist' } as BasePref<number, OtherPrefTypes>,
		upcoming_weeks: { default_value: 3, current_value: 3, type: 'NUMBER', range: { start: 1, end: 52 }, visible: true, section: 'Playlist', description: 'How many weeks back the \'Upcoming\' playlist counts plays from' } as BasePref<number, OtherPrefTypes>,
		fuzzy_search_threshold: { default_value: 50, current_value: 100, type: 'NUMBER', range: { start: 0, end: 100 }, visible: true, section: 'Playlist', description: 'The minimum confidence for Illusi\'s fuzzy-search  (0-100%)' } as BasePref<number, OtherPrefTypes>,
		ignore_fat_finger_for_seconds: { default_value: 0, current_value: 0, type: 'NUMBER', range: { start: 0, end: 30 }, visible: true, section: 'Interactions', description: 'How long to set a delay before you can press on another track for it to actually play. Ignores track inputs after a track press for x seconds.' } as BasePref<number, OtherPrefTypes>,
		default_to_strict_search: { default_value: false, current_value: false, type: 'BOOLEAN', visible: true, section: 'Interactions', description: 'Your searches will default to the strict-search over fuzzy-search' } as BasePref<boolean, OtherPrefTypes>,
		new_releases_hide_unknowns: { default_value: false, current_value: false, type: 'BOOLEAN', visible: true, section: 'Visual', description: 'Hide all artists you\'ve never seen in New-Releases' } as BasePref<boolean, OtherPrefTypes>,
		compact_playlists: { default_value: false, current_value: false, type: 'BOOLEAN', visible: true, section: 'Visual', description: 'Your playlists in the \'Playlists\' screen will become smaller' } as BasePref<boolean, OtherPrefTypes>,
		album_track_tinting: { default_value: false, current_value: false, type: 'BOOLEAN', visible: true, section: 'Visual', description: 'Tints all tracks in a album a different color so that it is easier to differentiate' } as BasePref<boolean, OtherPrefTypes>,
		only_play_downloaded: { default_value: false, current_value: false, type: 'BOOLEAN', visible: true, section: 'Interactions', description: 'Only play downloaded tracks (except searched ones)' } as BasePref<boolean, OtherPrefTypes>,
		always_shuffle: { default_value: true, current_value: true, type: 'BOOLEAN', visible: true, section: 'Interactions', description: 'Always shuffle user-made playlists and library' } as BasePref<boolean, OtherPrefTypes>,
		play_without_popup: { default_value: false, current_value: false, type: 'BOOLEAN', visible: true, section: 'Interactions', description: 'Prevents Audioplayer from popping up when playing a new queue' } as BasePref<boolean, OtherPrefTypes>,
		auto_download: { default_value: false, current_value: false, type: 'BOOLEAN', visible: true, section: 'Automation', description: 'Download track media whenever added to library' } as BasePref<boolean, OtherPrefTypes>,
		auto_cache_thumbnails: { default_value: false, current_value: false, type: 'BOOLEAN', visible: true, section: 'Automation', description: 'Download track thumbnail whenever added to library' } as BasePref<boolean, OtherPrefTypes>,
		auto_cache_lyrics: { default_value: false, current_value: false, type: 'BOOLEAN', visible: true, section: 'Automation', description: 'Download track lyrics whenever added to library' } as BasePref<boolean, OtherPrefTypes>,
		use_track_shuffle_bias: { default_value: false, current_value: false, type: 'BOOLEAN', visible: true, section: 'Interactions', description: 'Enabled shuffle settings from Shuffler' } as BasePref<boolean, OtherPrefTypes>,
		expensive_wifi_only: { default_value: true, current_value: true, type: 'BOOLEAN', visible: true, section: 'Data', description: 'Many expensive network based operations will only happen on WiFi' } as BasePref<boolean, OtherPrefTypes>,
		warmup_youtube: { default_value: false, current_value: false, type: 'BOOLEAN', visible: true, section: 'Data', description: 'Load YouTube Client on startup' } as BasePref<boolean, OtherPrefTypes>,
		warmup_soundcloud: { default_value: false, current_value: false, type: 'BOOLEAN', visible: true, section: 'Data', description: 'Load Soundcloud Client on startup' } as BasePref<boolean, OtherPrefTypes>,

		// Settings that have a chance of breaking things; use with caution; all disabled by default
		enable_vibes_sampler: { default_value: false, current_value: false, type: 'BOOLEAN', visible: true, show_type: 'EXPERIMENTAL', section: 'Automation' } as BasePref<boolean, OtherPrefTypes>,
		enable_linker: { default_value: false, current_value: false, type: 'BOOLEAN', visible: true, show_type: 'EXPERIMENTAL', section: 'Automation' } as BasePref<boolean, OtherPrefTypes>,
		enable_sampler: { default_value: false, current_value: false, type: 'BOOLEAN', visible: true, show_type: 'EXPERIMENTAL', section: 'Automation' } as BasePref<boolean, OtherPrefTypes>,
		fastpack: { default_value: false, current_value: false, type: 'BOOLEAN', visible: true, show_type: 'EXPERIMENTAL', section: 'Automation' } as BasePref<boolean, OtherPrefTypes>,
		quick_fixer_upper: { default_value: false, current_value: false, type: 'BOOLEAN', visible: true, show_type: 'EXPERIMENTAL', section: 'Automation', description: 'May slow down app; only use when necessary' } as BasePref<boolean, OtherPrefTypes>,
		experimental_word_sync: { default_value: false, current_value: false, type: 'BOOLEAN', visible: true, show_type: 'EXPERIMENTAL', section: 'Visual', description: 'Shows line synced lyrics as word synced, estimated from syllables and the track\'s vocals when Illusi has analyzed them' } as BasePref<boolean, OtherPrefTypes>,
		use_cookies_on_download: { default_value: false, current_value: false, type: 'BOOLEAN', visible: true, show_type: 'EXPERIMENTAL', section: 'Data' } as BasePref<boolean, OtherPrefTypes>,
		use_cookies_on_search: { default_value: false, current_value: false, type: 'BOOLEAN', visible: true, show_type: 'EXPERIMENTAL', section: 'Data' } as BasePref<boolean, OtherPrefTypes>,
		use_cookies_on_artist: { default_value: false, current_value: false, type: 'BOOLEAN', visible: true, show_type: 'EXPERIMENTAL', section: 'Data' } as BasePref<boolean, OtherPrefTypes>,
		illusi_api_url: { default_value: 'https://illusi.sumii.me', current_value: 'https://illusi.sumii.me', type: 'STRING', visible: false, section: 'Other', description: 'Illusi server used for accounts and sync (Modification may require restart)' } as BasePref<string, OtherPrefTypes>,
		dev_mode: { default_value: false, current_value: false, type: 'BOOLEAN', visible: true, show_type: 'EXPERIMENTAL', section: 'Other', description: '(Modification may require restart)' } as BasePref<boolean, OtherPrefTypes>
	};
	export type PrefOptions = keyof typeof prefs;
	const user_uuid_key: PrefOptions = 'user_uuid';

	export function get_pref<T extends PrefOptions>(pref_key: T): (typeof prefs)[T]['default_value'] { return prefs[pref_key].current_value; }

	export const illusi_pref_load_map: BasePrefLoadMap<BasePrefTypes | OtherPrefTypes, unknown> = {
		...base_load_map,
		LINKER_LINKS: async (mod: MMKVModule, pref_key: string) => force_json_parse_array(await mod.get_string(pref_key) ?? '[]'),
		PAST_QUEUE: async (mod: MMKVModule, pref_key: string) => force_json_parse(await mod.get_string(pref_key) ?? '{"index":0,"tracks":[]}'),
		NEW_RELEASES: async (mod: MMKVModule, pref_key: string) => force_json_parse_array(await mod.get_string(pref_key) ?? '[]'),
		BIAS: async (mod: MMKVModule, pref_key: string) => force_json_parse_array(await mod.get_string(pref_key) ?? JSON.stringify(default_track_shuffle_bias))
	};
	export const illusi_pref_save_map: BasePrefSaveMap<BasePrefTypes | OtherPrefTypes, unknown> = {
		...base_save_map,
		LINKER_LINKS: async (mod: MMKVModule, pref_key: string, value: unknown) => await mod.set_string(pref_key, JSON.stringify(value as string[])),
		PAST_QUEUE: async (mod: MMKVModule, pref_key: string, value: unknown) => await mod.set_string(pref_key, JSON.stringify(value as PastQueue)),
		NEW_RELEASES: async (mod: MMKVModule, pref_key: string, value: unknown) => await mod.set_string(pref_key, JSON.stringify(value as CompactPlaylist[])),
		BIAS: async (mod: MMKVModule, pref_key: string, value: unknown) => await mod.set_string(pref_key, JSON.stringify(value as Bias))
	};

	export async function load_prefs() {
		const storage_user_uuid = await mmkv().get_string(user_uuid_key);
		if (storage_user_uuid === null) await mmkv().set_string(user_uuid_key, user_uuid);
		await generic_load_prefs<OtherPrefTypes, PrefOptions>(mmkv(), prefs, illusi_pref_load_map);
	}
	export async function save_pref<T extends PrefOptions>(pref_key: T, value: (typeof prefs)[T]['default_value']) {
		await generic_save_pref<OtherPrefTypes, PrefOptions>(mmkv(), prefs, pref_key, value, illusi_pref_save_map);
	}
	export async function reset_prefs() {
		await generic_reset_prefs(mmkv(), [user_uuid_key], load_prefs);
	}

	export interface Theme {
		dark: boolean;
		colors: {
			default_primary_color: string;
			primary: string;
			secondary: string;
			background: string;
			primary_dark: string;
			card: string;
			title: string;
			text: string;
			subtext: string;
			deeptext: string;
			border: string;
			notification: string;
			shelf: string;
			tabInactive: string;
			line: string;
			searchInput: string;
			searchPlaceholder: string;
			inactive: string;
			red: string;
			green: string;
			orange: string;
			playingSong: string;
			playScreen: string;
			track: string;
			highlightPressColor: string;
			black: string;
		};
	}

	export const light_theme: Theme = {
		dark: false,
		colors: {
			default_primary_color: '#7400fe',
			primary: get_pref('primary_color'),
			secondary: '#c46a8f',
			background: '#f7f3ef',
			primary_dark: '#ddd5ca',
			card: '#f0ebe4',
			title: '#3a2e25',
			text: '#2c2319',
			subtext: '#8a7d72',
			deeptext: '#b8afa5',
			border: '#d8cfc5',
			notification: '#7a6bbf',
			shelf: '#ede7df',
			tabInactive: '#b0a498',
			line: '#e0d8d0',
			searchInput: '#e8e1d8',
			searchPlaceholder: '#b8a898',
			inactive: '#b8a898',
			red: '#c0392b',
			green: '#4a8c5c',
			orange: '#c87941',
			playingSong: '#e8e1d8',
			playScreen: '#e8e1d8',
			track: '#e8e1d8',
			highlightPressColor: '#c4a882',
			black: '#1a1a1a'
		}
	};

	export const dark_theme: Theme = {
		dark: true,
		colors: {
			default_primary_color: '#7400fe',
			primary: get_pref('primary_color'),
			secondary: '#fc00c9',
			background: '#0d1016',
			primary_dark: '#1a184f',
			card: '#131213',
			title: '#d0d0d0',
			text: '#ffffff',
			subtext: '#8c939d',
			deeptext: '#606060',
			border: '#222222',
			notification: '#1313ff',
			shelf: '#161B22',
			tabInactive: '#cad1d8',
			line: '#303040',
			searchInput: '#404254',
			searchPlaceholder: '#8080a0',
			inactive: '#8080a0',
			red: '#FF0000',
			green: '#00FF00',
			orange: '#FF7F50',
			playingSong: '#141722',
			playScreen: '#141722',
			track: '#141722',
			highlightPressColor: '#aa99ee',
			black: '#000000'
		}
	};

	export const oled_theme: Theme = {
		dark: true,
		colors: {
			default_primary_color: '#7400fe',
			primary: get_pref('primary_color'),
			secondary: '#fc00c9',
			background: '#000000',
			primary_dark: '#1a184f',
			card: '#000000',
			title: '#d0d0d0',
			text: '#ffffff',
			subtext: '#8c939d',
			deeptext: '#606060',
			border: '#222222',
			notification: '#1313ff',
			shelf: '#000000',
			tabInactive: '#cad1d8',
			line: '#303040',
			searchInput: '#404254',
			searchPlaceholder: '#8080a0',
			inactive: '#8080a0',
			red: '#FF0000',
			green: '#00FF00',
			orange: '#FF7F50',
			playingSong: '#000000',
			playScreen: '#000000',
			track: '#000000',
			highlightPressColor: '#aa99ee',
			black: '#000000'
		}
	};

	export const cozy_dark_theme: Theme = {
		dark: true,
		colors: {
			default_primary_color: '#c97b5a',
			primary: get_pref('primary_color'),
			secondary: '#c46a8f',
			background: '#1a1410',
			primary_dark: '#2a1e14',
			card: '#201812',
			title: '#e8d8b8',
			text: '#d4c4a0',
			subtext: '#8a7a65',
			deeptext: '#5a4a38',
			border: '#2e2420',
			notification: '#9a7a5a',
			shelf: '#241c14',
			tabInactive: '#7a6a55',
			line: '#2a2018',
			searchInput: '#302418',
			searchPlaceholder: '#6a5a48',
			inactive: '#6a5a48',
			red: '#c0392b',
			green: '#4a8c5c',
			orange: '#c87941',
			playingSong: '#221a12',
			playScreen: '#221a12',
			track: '#221a12',
			highlightPressColor: '#b89060',
			black: '#0a0806'
		}
	};

	export const neon_noir_theme: Theme = {
		dark: true,
		colors: {
			default_primary_color: '#00eeff',
			primary: get_pref('primary_color'),
			secondary: '#ff0090',
			background: '#07070f',
			primary_dark: '#0a0a20',
			card: '#0d0d1c',
			title: '#dff8ff',
			text: '#c0e8f8',
			subtext: '#3a5868',
			deeptext: '#1a2430',
			border: '#121228',
			notification: '#00ccee',
			shelf: '#0b0b1e',
			tabInactive: '#385868',
			line: '#0e1624',
			searchInput: '#12162e',
			searchPlaceholder: '#284458',
			inactive: '#284458',
			red: '#ff2244',
			green: '#00ff88',
			orange: '#ff8c00',
			playingSong: '#0a0c20',
			playScreen: '#0a0c20',
			track: '#0a0c20',
			highlightPressColor: '#00d8ee',
			black: '#030308'
		}
	};

	export const sage_mist_theme: Theme = {
		dark: false,
		colors: {
			default_primary_color: '#5a7a4a',
			primary: get_pref('primary_color'),
			secondary: '#8a6a9a',
			background: '#f0f2ee',
			primary_dark: '#cdd8c4',
			card: '#e8ece4',
			title: '#1e2a1c',
			text: '#2c3828',
			subtext: '#7a8878',
			deeptext: '#b0bca8',
			border: '#dce0d8',
			notification: '#6a8890',
			shelf: '#e2e8dc',
			tabInactive: '#9aaa90',
			line: '#e4e8e0',
			searchInput: '#dde4d6',
			searchPlaceholder: '#a8b8a0',
			inactive: '#a8b8a0',
			red: '#b83c30',
			green: '#3a7a50',
			orange: '#b86830',
			playingSong: '#dde4d6',
			playScreen: '#dde4d6',
			track: '#dde4d6',
			highlightPressColor: '#7a9068',
			black: '#181e16'
		}
	};

	export const ember_forge_theme: Theme = {
		dark: true,
		colors: {
			default_primary_color: '#e8920a',
			primary: get_pref('primary_color'),
			secondary: '#c0442a',
			background: '#141008',
			primary_dark: '#2e2008',
			card: '#1a1408',
			title: '#f0d890',
			text: '#d4b870',
			subtext: '#7a6848',
			deeptext: '#3a3020',
			border: '#28200e',
			notification: '#c87830',
			shelf: '#201808',
			tabInactive: '#6a5840',
			line: '#221a08',
			searchInput: '#282010',
			searchPlaceholder: '#584838',
			inactive: '#584838',
			red: '#c0392b',
			green: '#3a8040',
			orange: '#e07820',
			playingSong: '#1c1608',
			playScreen: '#1c1608',
			track: '#1c1608',
			highlightPressColor: '#d4a030',
			black: '#080600'
		}
	};

	export const crimson_void_theme: Theme = {
		dark: true,
		colors: {
			default_primary_color: '#cc0033',
			primary: get_pref('primary_color'),
			secondary: '#880044',
			background: '#0c0808',
			primary_dark: '#1e0808',
			card: '#140808',
			title: '#ffe4e4',
			text: '#f0d0d0',
			subtext: '#784848',
			deeptext: '#2e1818',
			border: '#200c0c',
			notification: '#cc2244',
			shelf: '#180a0a',
			tabInactive: '#684040',
			line: '#1c0e0e',
			searchInput: '#220e0e',
			searchPlaceholder: '#583838',
			inactive: '#583838',
			red: '#ff2244',
			green: '#44aa66',
			orange: '#dd6622',
			playingSong: '#180a0a',
			playScreen: '#180a0a',
			track: '#180a0a',
			highlightPressColor: '#cc4444',
			black: '#060404'
		}
	};

	export const deep_ocean_theme: Theme = {
		dark: true,
		colors: {
			default_primary_color: '#00b8a0',
			primary: get_pref('primary_color'),
			secondary: '#e08840',
			background: '#080e12',
			primary_dark: '#0e2030',
			card: '#0c1418',
			title: '#d8eef4',
			text: '#b0d0dc',
			subtext: '#507080',
			deeptext: '#1e3040',
			border: '#101e28',
			notification: '#2888a8',
			shelf: '#101c24',
			tabInactive: '#406070',
			line: '#0c1820',
			searchInput: '#101e2a',
			searchPlaceholder: '#305868',
			inactive: '#305868',
			red: '#c0392b',
			green: '#208858',
			orange: '#d07828',
			playingSong: '#0e1820',
			playScreen: '#0e1820',
			track: '#0e1820',
			highlightPressColor: '#38a890',
			black: '#040810'
		}
	};

	export const midnight_plum_theme: Theme = {
		dark: true,
		colors: {
			default_primary_color: '#c77dff',
			primary: get_pref('primary_color'),
			secondary: '#ff7eb6',
			background: '#120c18',
			primary_dark: '#2f1e3d',
			card: '#1b1421',
			title: '#eadcf2',
			text: '#d0c3d8',
			subtext: '#7a7081',
			deeptext: '#534a59',
			border: '#251f2c',
			notification: '#a366d1',
			shelf: '#1f1825',
			tabInactive: '#827889',
			line: '#1f1825',
			searchInput: '#28212e',
			searchPlaceholder: '#685f6f',
			inactive: '#685f6f',
			red: '#ff4d6d',
			green: '#52d394',
			orange: '#ff9f45',
			playingSong: '#1d1623',
			playScreen: '#1d1623',
			track: '#1d1623',
			highlightPressColor: '#cc8bfd',
			black: '#08050b'
		}
	};

	export const aurora_theme: Theme = {
		dark: true,
		colors: {
			default_primary_color: '#4ef0a8',
			primary: get_pref('primary_color'),
			secondary: '#9b7bff',
			background: '#081218',
			primary_dark: '#13362f',
			card: '#101b21',
			title: '#d6f5ee',
			text: '#bddad4',
			subtext: '#6b7f7f',
			deeptext: '#465658',
			border: '#1b262b',
			notification: '#40c48b',
			shelf: '#142025',
			tabInactive: '#738887',
			line: '#142025',
			searchInput: '#1d292d',
			searchPlaceholder: '#5a6d6e',
			inactive: '#5a6d6e',
			red: '#ff5c7a',
			green: '#4ef0a8',
			orange: '#ffb454',
			playingSong: '#121d23',
			playScreen: '#121d23',
			track: '#121d23',
			highlightPressColor: '#62f1b2',
			black: '#04080b'
		}
	};

	export const sakura_night_theme: Theme = {
		dark: true,
		colors: {
			default_primary_color: '#ff8fb7',
			primary: get_pref('primary_color'),
			secondary: '#9ad1ff',
			background: '#161015',
			primary_dark: '#3b242f',
			card: '#1f181e',
			title: '#f6e1ea',
			text: '#dbc8d0',
			subtext: '#82747b',
			deeptext: '#594f55',
			border: '#2a2328',
			notification: '#d07697',
			shelf: '#231d22',
			tabInactive: '#8a7d84',
			line: '#231d22',
			searchInput: '#2c252a',
			searchPlaceholder: '#70646a',
			inactive: '#70646a',
			red: '#ff5470',
			green: '#7ed6a5',
			orange: '#ffab70',
			playingSong: '#211a20',
			playScreen: '#211a20',
			track: '#211a20',
			highlightPressColor: '#fe9bbf',
			black: '#0a0709'
		}
	};

	export const synthwave_theme: Theme = {
		dark: true,
		colors: {
			default_primary_color: '#ff4fd8',
			primary: get_pref('primary_color'),
			secondary: '#ffb347',
			background: '#140b24',
			primary_dark: '#3a1641',
			card: '#1d142d',
			title: '#f3e2ff',
			text: '#d8c8e5',
			subtext: '#7f728d',
			deeptext: '#574c66',
			border: '#281e38',
			notification: '#d041b4',
			shelf: '#211831',
			tabInactive: '#887b96',
			line: '#211831',
			searchInput: '#2a203a',
			searchPlaceholder: '#6d617c',
			inactive: '#6d617c',
			red: '#ff3864',
			green: '#3dffb5',
			orange: '#ff9a3c',
			playingSong: '#1f162f',
			playScreen: '#1f162f',
			track: '#1f162f',
			highlightPressColor: '#fd65de',
			black: '#090510'
		}
	};

	export const arctic_night_theme: Theme = {
		dark: true,
		colors: {
			default_primary_color: '#8fd3ff',
			primary: get_pref('primary_color'),
			secondary: '#c4b5fd',
			background: '#0b1119',
			primary_dark: '#20303e',
			card: '#141a22',
			title: '#e2eef8',
			text: '#c8d3dd',
			subtext: '#727b84',
			deeptext: '#4c535c',
			border: '#1e252d',
			notification: '#75acd1',
			shelf: '#181e26',
			tabInactive: '#7b848d',
			line: '#181e26',
			searchInput: '#20272f',
			searchPlaceholder: '#616972',
			inactive: '#616972',
			red: '#f2667a',
			green: '#6fe0b4',
			orange: '#f6b26b',
			playingSong: '#161c24',
			playScreen: '#161c24',
			track: '#161c24',
			highlightPressColor: '#9bd7fe',
			black: '#05080b'
		}
	};

	export const phosphor_theme: Theme = {
		dark: true,
		colors: {
			default_primary_color: '#39ff6a',
			primary: get_pref('primary_color'),
			secondary: '#b6ff3b',
			background: '#050806',
			primary_dark: '#0d3016',
			card: '#0d120e',
			title: '#c8f7d2',
			text: '#b1daba',
			subtext: '#637b68',
			deeptext: '#405043',
			border: '#171e18',
			notification: '#2fce56',
			shelf: '#111612',
			tabInactive: '#6a8470',
			line: '#111612',
			searchInput: '#18201a',
			searchPlaceholder: '#536858',
			inactive: '#536858',
			red: '#ff4040',
			green: '#39ff6a',
			orange: '#ffc23d',
			playingSong: '#0f1410',
			playScreen: '#0f1410',
			track: '#0f1410',
			highlightPressColor: '#4efe7a',
			black: '#020403'
		}
	};

	export const royal_velvet_theme: Theme = {
		dark: true,
		colors: {
			default_primary_color: '#e6c35c',
			primary: get_pref('primary_color'),
			secondary: '#b48cff',
			background: '#0b0d1c',
			primary_dark: '#2e2a26',
			card: '#141623',
			title: '#ece6d4',
			text: '#d1ccbe',
			subtext: '#777574',
			deeptext: '#4e4e53',
			border: '#1f212d',
			notification: '#ba9f4f',
			shelf: '#181a27',
			tabInactive: '#807e7c',
			line: '#181a27',
			searchInput: '#22232e',
			searchPlaceholder: '#656466',
			inactive: '#656466',
			red: '#e5484d',
			green: '#46c28a',
			orange: '#e8964a',
			playingSong: '#161825',
			playScreen: '#161825',
			track: '#161825',
			highlightPressColor: '#e7c86e',
			black: '#05060d'
		}
	};

	export const lavender_haze_theme: Theme = {
		dark: true,
		colors: {
			default_primary_color: '#b8a1ff',
			primary: get_pref('primary_color'),
			secondary: '#f0a6ca',
			background: '#15131c',
			primary_dark: '#2f2a40',
			card: '#1d1b25',
			title: '#e8e4f4',
			text: '#cfcbda',
			subtext: '#7a7784',
			deeptext: '#54525d',
			border: '#28262f',
			notification: '#9785d2',
			shelf: '#222029',
			tabInactive: '#83808c',
			line: '#222029',
			searchInput: '#2a2832',
			searchPlaceholder: '#696772',
			inactive: '#696772',
			red: '#f27390',
			green: '#7dd3ae',
			orange: '#f5b47a',
			playingSong: '#201d27',
			playScreen: '#201d27',
			track: '#201d27',
			highlightPressColor: '#bfabfd',
			black: '#09090d'
		}
	};

	export const graphite_theme: Theme = {
		dark: true,
		colors: {
			default_primary_color: '#f5d90a',
			primary: get_pref('primary_color'),
			secondary: '#8ab4f8',
			background: '#121212',
			primary_dark: '#363211',
			card: '#1a1a1a',
			title: '#e6e6e6',
			text: '#cdcdcd',
			subtext: '#787878',
			deeptext: '#525252',
			border: '#252525',
			notification: '#c8b10c',
			shelf: '#1f1f1f',
			tabInactive: '#808080',
			line: '#1f1f1f',
			searchInput: '#272727',
			searchPlaceholder: '#676767',
			inactive: '#676767',
			red: '#f15b5b',
			green: '#5ccf8a',
			orange: '#ff9d3d',
			playingSong: '#1d1d1d',
			playScreen: '#1d1d1d',
			track: '#1d1d1d',
			highlightPressColor: '#f3db2b',
			black: '#080808'
		}
	};

	export const rainy_city_theme: Theme = {
		dark: true,
		colors: {
			default_primary_color: '#6ea8fe',
			primary: get_pref('primary_color'),
			secondary: '#e879f9',
			background: '#0c0f1a',
			primary_dark: '#1c273e',
			card: '#141723',
			title: '#dde3f5',
			text: '#c4cadb',
			subtext: '#707583',
			deeptext: '#4b4f5c',
			border: '#1f222e',
			notification: '#5a89d0',
			shelf: '#191c27',
			tabInactive: '#797d8c',
			line: '#191c27',
			searchInput: '#212430',
			searchPlaceholder: '#606472',
			inactive: '#606472',
			red: '#f7768e',
			green: '#73daca',
			orange: '#ff9e64',
			playingSong: '#161a25',
			playScreen: '#161a25',
			track: '#161a25',
			highlightPressColor: '#7fb1fd',
			black: '#05070c'
		}
	};

	export const matcha_night_theme: Theme = {
		dark: true,
		colors: {
			default_primary_color: '#a3d977',
			primary: get_pref('primary_color'),
			secondary: '#e8b86d',
			background: '#0d120c',
			primary_dark: '#25321d',
			card: '#161b14',
			title: '#e4eedb',
			text: '#cad4c2',
			subtext: '#747c6f',
			deeptext: '#4e544a',
			border: '#20261f',
			notification: '#85b162',
			shelf: '#1a1f18',
			tabInactive: '#7d8478',
			line: '#1a1f18',
			searchInput: '#222821',
			searchPlaceholder: '#636a5f',
			inactive: '#636a5f',
			red: '#e5645a',
			green: '#a3d977',
			orange: '#e8a050',
			playingSong: '#181d16',
			playScreen: '#181d16',
			track: '#181d16',
			highlightPressColor: '#addc86',
			black: '#060805'
		}
	};

	export const coral_reef_theme: Theme = {
		dark: true,
		colors: {
			default_primary_color: '#ff7f6b',
			primary: get_pref('primary_color'),
			secondary: '#3ddbd9',
			background: '#06141a',
			primary_dark: '#2e2527',
			card: '#0f1d23',
			title: '#dff2f2',
			text: '#c5d7d8',
			subtext: '#6e7f82',
			deeptext: '#47575b',
			border: '#1a282d',
			notification: '#cd6a5b',
			shelf: '#132127',
			tabInactive: '#77878a',
			line: '#132127',
			searchInput: '#1c2a30',
			searchPlaceholder: '#5d6d70',
			inactive: '#5d6d70',
			red: '#ff5468',
			green: '#40d39c',
			orange: '#ffa64d',
			playingSong: '#111f25',
			playScreen: '#111f25',
			track: '#111f25',
			highlightPressColor: '#fa907f',
			black: '#03090c'
		}
	};

	export const latte_light_theme: Theme = {
		dark: false,
		colors: {
			default_primary_color: '#9c5b34',
			primary: get_pref('primary_color'),
			secondary: '#4f7c8a',
			background: '#f6efe6',
			primary_dark: '#e2cebf',
			card: '#efe7de',
			title: '#3b2a20',
			text: '#514238',
			subtext: '#86796f',
			deeptext: '#aba097',
			border: '#e5ddd4',
			notification: '#ae7958',
			shelf: '#ebe3da',
			tabInactive: '#82756b',
			line: '#ebe3da',
			searchInput: '#e3dbd2',
			searchPlaceholder: '#95897f',
			inactive: '#95897f',
			red: '#c0392b',
			green: '#3f8a57',
			orange: '#c8732e',
			playingSong: '#ede5dc',
			playScreen: '#ede5dc',
			track: '#ede5dc',
			highlightPressColor: '#8d5431',
			black: '#1a1a1a'
		}
	};
	const themes = {
		light: light_theme,
		dark: dark_theme,
		oled: oled_theme,
		mist_light: sage_mist_theme,
		crimson_void: crimson_void_theme,
		neon_noir: neon_noir_theme,
		forge_dark: ember_forge_theme,
		ocean_dark: deep_ocean_theme,
		cozy_dark: cozy_dark_theme,
		midnight_plum: midnight_plum_theme,
		aurora: aurora_theme,
		sakura_night: sakura_night_theme,
		synthwave: synthwave_theme,
		arctic_night: arctic_night_theme,
		phosphor: phosphor_theme,
		royal_velvet: royal_velvet_theme,
		lavender_haze: lavender_haze_theme,
		graphite: graphite_theme,
		rainy_city: rainy_city_theme,
		matcha_night: matcha_night_theme,
		coral_reef: coral_reef_theme,
		latte_light: latte_light_theme
	};

	export async function try_remove_from_recent_searches(query: string) {
		const recent_searches: string[] = get_pref('recent_searches');
		const recent_search_index = recent_searches.findIndex(search => search === query);
		if (recent_search_index !== -1) {
			recent_searches.splice(recent_search_index, 1);
		}
		await save_pref('recent_searches', recent_searches);
		return recent_searches;
	}
	let recent_search_listener: ((query: string) => void) | undefined;
	export function on_recent_search(listener: ((query: string) => void) | undefined) {
		recent_search_listener = listener;
	}
	export async function add_to_recent_searches(query: string) {
		recent_search_listener?.(query);
		let recent_searches = await try_remove_from_recent_searches(query);
		recent_searches.unshift(query);
		recent_searches = recent_searches.slice(0, Constants.recent_search_limit);
		await save_pref('recent_searches', recent_searches);
		return recent_searches;
	}

	export function snake_case_to_plain_text(text: string) {
		text = text.replace(/_/g, ' ');
		const words = text.split(' ');
		for (let i = 0; i < words.length; i++) {
			words[i] = words[i][0].toUpperCase() + words[i].slice(1);
		}
		return words.join(' ');
	}
	export async function set_settings_number(key: PrefOptions, value: number) {
		await save_pref(key, value);
	}
	export async function set_settings_toggle(key: PrefOptions, value: boolean) {
		await save_pref(key, value);
	}

	export function pref_set_theme(set_theme: (_: Theme) => void) {
		const theme = get_theme(get_pref('theme'));
		set_theme(
			{
				dark: theme.dark,
				colors: {
					...theme.colors,
					primary: get_pref('primary_color')
				}
			}
		);
	}
	export function get_theme(key: PossibleThemes) {
		const fallback_theme = dark_theme;
		if (key in themes) return themes[key];
		return fallback_theme;
	}
	export function all_themes(): PossibleThemes[] {
		return Object.keys(themes) as PossibleThemes[];
	}
	export interface PrimaryColorDetails { color: HexColor; icon: string; name: string }
	export const possible_primary_colors: PrimaryColorDetails[] = [
		{ color: '#7400fe', icon: '🔮', name: 'Illusi' },
		{ color: '#FFFAFA', icon: '❄️', name: 'Snow' },
		{ color: '#FFCCFF', icon: '🌔', name: 'Moon' },
		{ color: '#FF007F', icon: '🌹', name: 'Rose' },
		{ color: '#FF69B4', icon: '🌸', name: 'Hot' },
		{ color: '#14f727', icon: '📗', name: 'Science' },
		{ color: '#FF7F50', icon: '🪸', name: 'Coral' },
		{ color: '#EB6123', icon: '🎃', name: 'Halloween' },
		{ color: '#4B0082', icon: '🫐', name: 'Indigo' },
		{ color: '#E6E6FA', icon: '💠', name: 'Lavender' },
		{ color: '#00FA9A', icon: '🍃', name: 'Spring' },
		{ color: '#87CEEB', icon: '🌌', name: 'Sky' },
		{ color: '#FF0000', icon: '🏢', name: 'YouTube' },
		{ color: '#1ED760', icon: '🏢', name: 'Spotify' },
		{ color: '#0077C1', icon: '🏢', name: 'Amazon' },
		{ color: '#FC3C44', icon: '🏢', name: 'Apple' },
		{ color: '#FF7700', icon: '🏢', name: 'SoundCloud' }
	];
}
