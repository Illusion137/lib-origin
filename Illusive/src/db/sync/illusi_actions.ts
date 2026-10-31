import fuzzysort from 'fuzzysort';
import { catch_log } from '@common/utils/error_util';
import type { Action, ActionOf, LyricsResponse, ReleaseService, ResearchService, UUID } from '@origin/illusi/types';
import { Illusi } from '@origin/illusi/illusi';
import * as Origin from '@origin/index';
import type { Track as SoundCloudTrack, Playlist as SoundCloudPlaylist } from '@origin/soundcloud/types/Search';
import type { CompactPlaylist, MusicServiceType, MusicServiceURI, NamedUUID, Track } from '@illusive/types';
import { Prefs } from '@illusive/prefs';
import { Illusive } from '@illusive/illusive';
import { artist_string, clean_track_info, create_uri, make_https, split_uri } from '@illusive/illusive_utils';
import { SQLfs } from '@illusive/sql/sql_fs';
import { Wifi } from '@illusive/wifi_utils';
import { db } from '@illusive/db/database';
import { user_tracks_table } from '@illusive/db/schema';
import { eq } from 'drizzle-orm';
import { decode_track } from '../v2/track_codec';
import { release_graph, type ReleaseAlbum } from './release_graph';
import { RequestQueue } from './request_queue';
import { milliseconds_of } from '@common/utils/util';

/**
 * Answers the polite data requests the server attaches to responses. Every action is optional: a handler that
 * can't do its part just returns, and the server asks again later.
 */
export namespace IllusiActions {
	/** A duration further off than this means research found a different recording */
	const RESEARCH_DURATION_TOLERANCE_MS = milliseconds_of({ seconds: 15 });
	/** Releases fetched per FETCH_NEW_RELEASES action; the token only lives a few minutes */
	const MAX_RELEASES_PER_ARTIST = 6;
	const MEDIA_TYPES: Record<string, string> = { m4a: 'audio/mp4', mp4: 'audio/mp4', aac: 'audio/aac', mp3: 'audio/mpeg', webm: 'audio/webm', opus: 'audio/ogg', ogg: 'audio/ogg', flac: 'audio/flac', wav: 'audio/wav' };

	const RESEARCH_TARGETS: Record<ResearchService, { service: 'YouTube Music' | 'SoundCloud' | 'BandLab' | 'Audiomack'; id_of: (track: Track) => string }> = {
		youtube: { service: 'YouTube Music', id_of: track => track.youtube_id || '' },
		soundcloud: { service: 'SoundCloud', id_of: track => track.soundcloud_permalink || (track.soundcloud_id ? String(track.soundcloud_id) : '') },
		bandlab: { service: 'BandLab', id_of: track => track.bandlab_id ?? '' },
		audiomack: { service: 'Audiomack', id_of: track => track.audiomack_id ?? '' }
	};

	export const RELEASE_SERVICES: Record<ReleaseService, { type: MusicServiceType; uri: MusicServiceURI }> = {
		applemusic: { type: 'Apple Music', uri: 'applemusic' },
		spotify: { type: 'Spotify', uri: 'spotify' },
		soundcloud: { type: 'SoundCloud', uri: 'soundcloud' },
		youtube_music: { type: 'YouTube Music', uri: 'youtubemusic' },
		deezer: { type: 'Deezer', uri: 'deezer' },
		tidal: { type: 'Tidal', uri: 'tidal' },
		amazonmusic: { type: 'Amazon Music', uri: 'amazonmusic' },
		audiomack: { type: 'Audiomack', uri: 'audiomack' },
		bandlab: { type: 'BandLab', uri: 'bandlab' },
		pandora: { type: 'Pandora', uri: 'pandora' }
	};

	/** Release services this device is logged into, so the server only asks for checks it can do */
	export function release_services(): ReleaseService[] {
		return (Object.keys(RELEASE_SERVICES) as ReleaseService[]).filter(service => Illusive.music_service.get(RELEASE_SERVICES[service].type)?.has_credentials() === true);
	}

	let queue: Promise<void> = Promise.resolve();

	/** Runs the actions one after another in the background; callers never wait on them */
	export function handle(actions: Action[] | undefined) {
		if (actions === undefined || actions.length === 0) return;
		queue = queue.then(async () => run(actions)).catch(catch_log);
	}

	/** Runs the actions now; resolves once all of them were attempted */
	export async function run(actions: Action[] | undefined) {
		await Illusi.handle_actions(actions, {
			UPLOAD_MEDIA: async action => upload_media(action).catch(catch_log),
			RESEARCH_TRACK: async action => research_track(action).catch(catch_log),
			CHECK_GENIUS: async action => check_genius(action).catch(catch_log),
			CHECK_YOUTUBE_MUSIC: async action => check_youtube_music(action).catch(catch_log),
			FETCH_NEW_RELEASES: async action => fetch_new_releases(action).catch(catch_log)
		});
	}

	async function local_track(illusi_id: string): Promise<Track | undefined> {
		const [row] = await db.select().from(user_tracks_table).where(eq(user_tracks_table.illusi_id, illusi_id));
		return row === undefined ? undefined : decode_track(row);
	}

	export async function upload_media(action: ActionOf<'UPLOAD_MEDIA'>) {
		if (Prefs.get_pref('expensive_wifi_only') && !await Wifi.wifi_connected()) return;
		const track = await local_track(action.track_id);
		const media_uri = track?.media_uri ?? '';
		if (media_uri === '') return;
		const path = SQLfs.media_directory(media_uri);
		const info = await SQLfs.info(path);
		if (!info.exists) return;
		const extension = media_uri.slice(media_uri.lastIndexOf('.') + 1).toLowerCase();
		const result = await RequestQueue.send('media_fulfil', action, { uri: path, name: media_uri, type: MEDIA_TYPES[extension] ?? 'application/octet-stream' });
		if (result !== null && Illusi.is_error(result)) catch_log(result.error);
	}

	/** Looks the track up on the asked service; a wrong-length match is reported as not found */
	export async function research_track(action: ActionOf<'RESEARCH_TRACK'>) {
		const target = RESEARCH_TARGETS[action.service];
		const local = await local_track(action.track_id);
		const track = local ?? {
			uid: action.track_id,
			title: action.title,
			artists: action.artists.map(name => ({ name, uri: null })),
			duration: action.duration_ms === null ? 0 : action.duration_ms / 1000,
			explicit: 'NONE'
		} as Track;
		if (track.artists.length === 0) {
			await RequestQueue.send('track_research_not_found', action);
			return;
		}
		const found = await Illusive.convert_track(track, { to_music_service: target.service, possible_services: [] });
		const match = 'error' in found ? undefined : found.track;
		const service_id = match === undefined ? '' : target.id_of(match);
		const duration_off = match !== undefined && action.duration_ms !== null && match.duration > 0
			&& Math.abs(match.duration * 1000 - action.duration_ms) > RESEARCH_DURATION_TOLERANCE_MS;
		const result = service_id === '' || duration_off
			? await RequestQueue.send('track_research_not_found', action)
			: await RequestQueue.send('track_research', action, service_id);
		if (result !== null && Illusi.is_error(result)) catch_log(result.error);
	}

	function title_artist_match(title: string, artists: string, track: Track | undefined): boolean {
		if (track === undefined) return true;
		const title_result = fuzzysort.single(clean_track_info(title).trim(), clean_track_info(track.title).trim());
		const artist_result = fuzzysort.single(clean_track_info(artists).trim(), clean_track_info(artist_string(track)).trim());
		return (title_result?.score ?? 0) >= 0.6 && (artist_result?.score ?? 0.5) >= 0.5;
	}

	/** Finds the song on Genius and hands the server its page state; resolves with the server's lyrics, if any */
	export async function check_genius(action: ActionOf<'CHECK_GENIUS'>): Promise<LyricsResponse | null> {
		const track = await local_track(action.track_id);
		const hits = await Origin.Genius.search_songs(action.query, {});
		const hit = 'error' in hits ? undefined : hits.find(h => title_artist_match(h.result.title, h.result.artist_names, track));
		const state = hit === undefined ? undefined : await Origin.Genius.get_lyrics_preloaded_state(hit.result, {});
		const result = state === undefined || 'error' in state
			? await RequestQueue.send('genius_not_found', action)
			: await RequestQueue.send('genius', action, state);
		if (result === null) return null;
		if (Illusi.is_error(result)) {
			catch_log(result.error);
			return null;
		}
		return result;
	}

	/** Fetches YouTube Music's lyrics for the track (searching for its video when the server has none) */
	export async function check_youtube_music(action: ActionOf<'CHECK_YOUTUBE_MUSIC'>): Promise<LyricsResponse | null> {
		const cookie_jar = Prefs.get_pref('youtube_music_cookie_jar');
		let video_id = action.youtube_id;
		if (video_id === undefined) {
			const track = await local_track(action.track_id);
			const search = await Origin.YouTubeMusic.search({ cookie_jar }, action.query);
			const candidates = 'error' in search ? [] : search.tracks;
			video_id = candidates.find(t => t.video_id && title_artist_match(t.title, t.artists.map(a => a.name).join(' '), track))?.video_id;
		}
		const lyrics = video_id === undefined ? undefined : await Origin.YouTubeMusic.get_lyrics({ cookie_jar }, video_id);
		const result = lyrics === undefined || 'error' in lyrics || lyrics.lyrics.trim() === ''
			? await RequestQueue.send('youtube_music_not_found', action)
			: await RequestQueue.send('youtube_music_lyrics', action, lyrics.lyrics, video_id);
		if (result === null) return null;
		if (Illusi.is_error(result)) {
			catch_log(result.error);
			return null;
		}
		return result;
	}

	function released_since(date: string | undefined, since: number): boolean {
		if (date === undefined) return false;
		const time = new Date(date).getTime();
		return !Number.isNaN(time) && time >= since;
	}

	async function release_tracks(service: MusicServiceType, release: CompactPlaylist): Promise<Track[]> {
		if (release.song_track) return [release.song_track];
		const uri = release.title.uri;
		if (!uri) return [];
		const playlist = await Illusive.music_service.get(service)!.get_playlist(make_https(split_uri(uri)[1]));
		return 'error' in playlist && playlist.error !== undefined ? [] : playlist.tracks;
	}

	async function soundcloud_release_items(artist_id: string, since: number): Promise<(SoundCloudTrack | SoundCloudPlaylist)[] | null> {
		const cookie_jar = Prefs.get_pref('soundcloud_cookie_jar');
		const hydration = await Origin.SoundCloud.get_hydration('https://www.soundcloud.com', { cookie_jar });
		if ('error' in hydration) return null;
		const client_id = await Origin.SoundCloud.get_client_id({ cookie_jar, scripts: hydration.scripts_urls });
		if ('error' in client_id) return null;
		const [tracks, albums] = await Promise.all([
			Origin.SoundCloud.get_artist('TRACKS', { cookie_jar, client_id: client_id.client_id, artist_id, limit: 50 }),
			Origin.SoundCloud.get_artist('ALBUMS', { cookie_jar, client_id: client_id.client_id, artist_id, limit: 10 })
		]);
		if ('error' in tracks) return null;
		const recent = <T extends { created_at?: string; display_date?: string; release_date?: string | null }>(item: T) =>
			released_since(item.release_date ?? item.display_date ?? item.created_at, since);
		return [
			...tracks.artist_data.collection.filter(recent),
			...('error' in albums ? [] : albums.artist_data.collection.filter(recent))
		];
	}

	/** Fetches the artist's releases since `action.since` on the asked service and contributes them */
	export async function fetch_new_releases(action: ActionOf<'FETCH_NEW_RELEASES'>, contribution_id: UUID = Illusi.uuid_v4()) {
		const target = RELEASE_SERVICES[action.service];
		const music_service = Illusive.music_service.get(target.type);
		if (!music_service?.has_credentials()) return;
		const since = new Date(action.since).getTime();

		if (action.service === 'soundcloud') {
			const items = await soundcloud_release_items(action.service_artist_id, since);
			if (items === null) return;
			const result = await RequestQueue.send('new_releases', action, items.length === 0 ? {} : { soundcloud_items: items });
			if (result !== null && Illusi.is_error(result)) catch_log(result.error);
			return;
		}

		if (music_service.get_artist === undefined) return;
		const artist = await music_service.get_artist(action.service_artist_id);
		if ('error' in artist && artist.error !== undefined) return;
		const candidates = new Map<string, CompactPlaylist>();
		for (const release of [artist.latest_release, ...artist.albums, ...artist.singles_eps]) {
			if (release === undefined || !released_since(release.date, since)) continue;
			const key = release.title.uri ?? release.title.name;
			if (!candidates.has(key)) candidates.set(key, release);
		}
		const releases: ReleaseAlbum[] = [];
		for (const release of [...candidates.values()].slice(0, MAX_RELEASES_PER_ARTIST)) {
			releases.push({ album: release, tracks: await release_tracks(target.type, release) });
		}
		const target_uri = create_uri(target.uri, action.service_artist_id);
		const artist_name = artist.name.trim().toLowerCase();
		const is_target = (named: NamedUUID) => (named.uri ? named.uri === target_uri : named.name.trim().toLowerCase() === artist_name);
		const graph = release_graph({ target_ref: action.artist_id, is_target, releases });
		const result = await RequestQueue.send('new_releases', action, (graph.albums?.length ?? 0) === 0 ? {} : { releases: graph, contribution_id });
		if (result !== null && Illusi.is_error(result)) catch_log(result.error);
	}
}
