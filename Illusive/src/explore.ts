import { milliseconds_of } from '@common/utils/util';
import { GLOBALS } from './globals';
import type { CompactArtist, CompactPlaylist, FullPlaylist, MusicServiceType, NamedUUID, Track } from './types';
import { FutsalShuffle } from './futsal_shuffle';
import { reinterpret_cast } from '@common/cast';
import { Illusive } from './illusive';
import { SQLfs } from './sql/sql_fs';
import { SQLTracks } from './sql/sql_tracks';
import { generror, generror_catch } from '@common/utils/error_util';
import { should_automatic_refresh } from './illusive_utils';
import { Prefs } from './prefs';
import { wait } from '@common/utils/timed_util';
import { remove_topic } from '@common/utils/clean_util';
import * as Origin from '@origin/index';
import { soundcloud_parse_system_playlist, soundcloud_parse_user } from './parsers/soundcloud_parser';
import { Illusi } from '@origin/illusi/illusi';
import { IllusiAccount } from './db/sync/illusi_account';
import { IllusiViews } from './illusi_views';
import { FSCache } from '@common/fs_cache';
import type { SelectionItem } from '@origin/soundcloud/types/MixedSelection';
import type { ArtistRecommendation } from '@origin/soundcloud/types/Search';

// TODO slight rework

export namespace Explore {
	const YT_MUSIC_TOP_TRACKS_PLAYLIST_URL = 'PL4fGSI1pDJn6O1LS0XSdF3RyO0Rq_LDeI';
	const FORGOTTEN_FAVORITES_SLICE = 50;

	const NEW_RELEASE_SERVICES: MusicServiceType[] = ['Illusi', 'YouTube Music', 'SoundCloud'];
	const NEW_RELEASES_SERVICE_TIMEOUT_MS = milliseconds_of({ seconds: 8 });

	const artist_keys = (artist: NamedUUID) => [artist.uri ?? '', remove_topic(artist.name).trim().toLowerCase()].filter(key => key !== '');
	const release_key = (release: CompactPlaylist) => `${release.title.name.trim().toLowerCase()}\u0000${remove_topic(release.artist[0]?.name ?? '').trim().toLowerCase()}`;

	function artist_affinity(tracks: Track[]): Map<string, number> {
		const affinity = new Map<string, number>();
		for (const track of tracks) {
			const weight = 1 + (track.meta?.plays ?? 0);
			for (const artist of track.artists) {
				for (const key of artist_keys(artist)) affinity.set(key, (affinity.get(key) ?? 0) + weight);
			}
		}
		return affinity;
	}

	export function rank_new_releases(releases: CompactPlaylist[], tracks: Track[], hide_unknowns: boolean): CompactPlaylist[] {
		const affinity = artist_affinity(tracks);
		const seen = new Set<string>();
		const scored: { release: CompactPlaylist; score: number; date: number }[] = [];
		for (const release of releases) {
			const key = release_key(release);
			if (seen.has(key)) continue;
			seen.add(key);
			const score = Math.max(0, ...release.artist.flatMap(artist => artist_keys(artist).map(artist_key => affinity.get(artist_key) ?? 0)));
			if (hide_unknowns && score === 0 && !release.song_track) continue;
			scored.push({ release, score, date: new Date(release.date ?? 0).getTime() || 0 });
		}
		return scored.sort((a, b) => b.score - a.score || b.date - a.date).map(({ release }) => release);
	}

	export function get_new_releases(): CompactPlaylist[] {
		const ranked = rank_new_releases(Prefs.get_pref('new_releases'), GLOBALS.global_var.sql_tracks, Prefs.get_pref('new_releases_hide_unknowns'));
		return ranked.map(release => release.song_track ? { ...release, song_track: SQLTracks.add_playback_saved_data_to_track(release.song_track) } : release);
	}

	export function new_releases_stale(): boolean {
		return Prefs.get_pref('new_releases').length === 0 || should_automatic_refresh(Prefs.get_pref('new_releases_last_refreshed'));
	}

	async function service_new_releases(type: MusicServiceType): Promise<CompactPlaylist[]> {
		const music_service = Illusive.music_service.get(type);
		if (music_service?.get_new_releases === undefined || !music_service.has_credentials()) return [];
		const timed_out = wait(NEW_RELEASES_SERVICE_TIMEOUT_MS).then(() => [] as CompactPlaylist[]);
		return Promise.race([music_service.get_new_releases(), timed_out]).catch((error: unknown) => {
			console.warn(generror_catch(error, 'Failed to get new releases', 'MEDIUM', { type }));
			return [];
		});
	}

	export async function refresh_new_releases(): Promise<CompactPlaylist[]> {
		const releases = (await Promise.all(NEW_RELEASE_SERVICES.map(service_new_releases))).flat();
		if (releases.length === 0) return get_new_releases();
		const old_keys = new Set(Prefs.get_pref('new_releases').map(release_key));
		await Promise.all([
			Prefs.save_pref('new_releases', releases),
			Prefs.save_pref('new_releases_last_refreshed', new Date())
		]);
		const ranked = get_new_releases();
		const total_new = old_keys.size === 0 ? 0 : ranked.filter(release => !old_keys.has(release_key(release))).length;
		if (total_new !== 0) GLOBALS.global_var.bottom_alert('Refreshed New Releases', 'INFO', `${total_new} Added`);
		return ranked;
	}

	export async function clear_new_releases() {
		await Prefs.save_pref('new_releases', []);
		await Prefs.save_pref('new_releases_last_refreshed', new Date(0));
	}

	export function get_forgotten_favorites(): CompactPlaylist[] {
		const max_plays
			= GLOBALS.global_var.sql_tracks
				.filter(track => (track.meta?.plays ?? 0) > 0)
				.map(track => track.meta?.plays ?? 0)
				.sort((a, b) => b - a)?.[0] ?? 0;
		const okay_amount_of_plays = max_plays * 0.15;
		if (okay_amount_of_plays === 0) return [];
		const potential_tracks = GLOBALS.global_var.sql_tracks.filter((track) => {
			if ((track.meta?.plays ?? 0) < okay_amount_of_plays) return false;
			const last_played = new Date(track.meta?.last_played_date ?? 0).getTime();
			if (last_played === 0) return false;
			return Date.now() - last_played >= milliseconds_of({ months: 1 });
		});
		if (potential_tracks.length === 0) return [];
		const potential_weighted_tracks = potential_tracks.map(track => ({ weight: track.meta?.plays ?? 0, value: track })).slice(0, FORGOTTEN_FAVORITES_SLICE * 3);
		const shuffle_weighted_tracks = FutsalShuffle.shuffle_weighted(potential_weighted_tracks);
		return shuffle_weighted_tracks.slice(0, FORGOTTEN_FAVORITES_SLICE).map(track => ({
			title: { name: track.title, uri: null },
			artist: track.artists,
			album_type: 'SONG',
			artwork_url: reinterpret_cast<string>(Illusive.get_track_artwork(SQLfs.document_directory(), track)),
			explicit: track.explicit,
			song_track: track,
			type: 'ALBUM'
		}));
	}
	export async function get_top_tracks(): Promise<Track[]> {
		try {
			const playlist = await Illusive.music_service.get('YouTube Music')!.get_playlist(YT_MUSIC_TOP_TRACKS_PLAYLIST_URL, {
				cache_opts: {
					cache_ms: milliseconds_of({ days: 1 }),
					cache_on: 'url',
					cache_mode: 'file',
					cache_ms_fail: 0
				}
			});
			if ('error' in playlist) return [];
			playlist.tracks = SQLTracks.add_playback_saved_data_to_tracks(playlist.tracks);
			return playlist.tracks;
		} catch (e) {
			console.warn(generror_catch(e, 'Top Tracks generated an error', 'MEDIUM', { YT_MUSIC_TOP_TRACKS_PLAYLIST_URL }));
			return [];
		}
	}
	export async function get_recommended_playlists(): Promise<FullPlaylist[]> {
		const REC_SOUNDCLOUD_CACHE_KEY = 'REC_SOUNDCLOUD_PLAYLISTS_CACHE_KEY';
		const REC_SOUNDCLOUD_CACHE_EXPIRES_MS = milliseconds_of({ days: 1 });
		const cache_hit = await FSCache.check_cache<SelectionItem[]>(REC_SOUNDCLOUD_CACHE_KEY, REC_SOUNDCLOUD_CACHE_EXPIRES_MS, {});
		if (cache_hit) return cache_hit.filter(item => 'kind' in item && item.kind === 'system-playlist')
			.map(soundcloud_parse_system_playlist);
		if (!Illusive.music_service.get('SoundCloud')?.has_credentials()) return [];
		const recommended_playlists_urn = 'soundcloud:selections:personalized-tracks';
		const cookie_jar = Prefs.get_pref('soundcloud_cookie_jar');
		const mixed_selection = await Origin.SoundCloud.mixed_selections({ cookie_jar, fetch_opts: { cache_opts: { cache_ms: milliseconds_of({ days: 1 }), cache_ms_fail: 0, cache_mode: 'file' } } });
		if ('error' in mixed_selection) return [];
		const recommended_playlists_section = mixed_selection.data.collection.find(item => item.urn.startsWith(recommended_playlists_urn))?.items.collection;
		if (!recommended_playlists_section) return [];
		await FSCache.insert_cache(REC_SOUNDCLOUD_CACHE_KEY, recommended_playlists_section, {});
		const playlists = recommended_playlists_section.filter(item => 'kind' in item && item.kind === 'system-playlist')
			.map(soundcloud_parse_system_playlist);
		return playlists;
	}

	export async function get_recommended_artists(): Promise<CompactArtist[]> {
		const REC_SOUNDCLOUD_CACHE_KEY = 'REC_SOUNDCLOUD_ARTISTS_CACHE_KEY';
		const REC_SOUNDCLOUD_CACHE_EXPIRES_MS = milliseconds_of({ days: 3 });
		const cache_hit = await FSCache.check_cache<{ data: { collection: ArtistRecommendation[] } }>(REC_SOUNDCLOUD_CACHE_KEY, REC_SOUNDCLOUD_CACHE_EXPIRES_MS, {});
		if (cache_hit) return cache_hit.data.collection.map(item => soundcloud_parse_user(item.user));
		if (!Illusive.music_service.get('SoundCloud')?.has_credentials()) return [];
		const cookie_jar = Prefs.get_pref('soundcloud_cookie_jar');
		const artists = await Origin.SoundCloud.who_to_follow({ cookie_jar });
		if ('error' in artists) return [];
		await FSCache.insert_cache(REC_SOUNDCLOUD_CACHE_KEY, artists, {});
		return artists.data.collection.map(item => soundcloud_parse_user(item.user));
	}

	export async function get_illusi_public_playlists(): Promise<CompactPlaylist[]> {
		if (!IllusiAccount.is_logged_in()) return [];
		const result = await Illusi.Playlists.public_list({ limit: 50 });
		if (Illusi.is_error(result)) {
			console.warn(generror('Failed to get Illusi public playlists', 'MEDIUM', { result }));
			return [];
		}
		return result.items.map(IllusiViews.playlist);
	}
}
