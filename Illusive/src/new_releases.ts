import * as Origin from '@origin/index';
import { ytm_album } from '@illusive/parsers/youtube_music_parser';
import { Prefs } from '@illusive/prefs';
import type { ISOString, CompactPlaylist, MusicServiceURI } from '@illusive/types';
import type { YouTubeMusicFeedAlbum } from '@origin/illusi/types';
import { Illusi } from '@origin/illusi/illusi';
import { IllusiAccount } from '@illusive/db/sync/illusi_account';
import { IllusiActions } from '@illusive/db/sync/illusi_actions';
import { IllusiViews } from '@illusive/illusi_views';
import { sc_highest_artwork, soundcloud_parse_track } from './parsers/soundcloud_parser';
import { reinterpret_cast } from '@common/cast';
import { create_uri, split_uri } from './illusive_utils';

/** Releases kept: the ones by artists the user plays most, then the newest */
export const NEW_RELEASES_LIMIT = 200;

export async function youtube_music_get_new_releases(): Promise<CompactPlaylist[]> {
	const cookie_jar = Prefs.get_pref('youtube_music_cookie_jar');
	const new_releases_albums_response = await Origin.YouTubeMusic.new_releases_albums({ cookie_jar: cookie_jar });
	if ('error' in new_releases_albums_response) return [];
	return new_releases_albums_response.map(album => ytm_album(album, 'ALBUM'));
}

/** The tracks and playlists in the user's SoundCloud stream, raw, so the server can take them as they are */
export async function soundcloud_feed_items() {
	const cookie_jar = Prefs.get_pref('soundcloud_cookie_jar');
	const feed = await Origin.SoundCloud.feed({ cookie_jar, feed_types: ['TrackPost', 'TrackRepost', 'PlaylistPost'], promoted_playlist: false, limit: 30 });
	if ('error' in feed) return [];
	return feed.data.collection;
}
export type SoundCloudFeedItem = Awaited<ReturnType<typeof soundcloud_feed_items>>[number];

export function soundcloud_parse_new_releases(items: readonly SoundCloudFeedItem[]): CompactPlaylist[] {
	const new_releases: CompactPlaylist[] = [];
	for (const item of items) {
		if (!('type' in item)) continue;
		if (item.type === 'track' || item.type === 'track-repost') {
			new_releases.push(
				{
					title: { name: item.track.title, uri: null },
					artist: soundcloud_parse_track(item.track).artists,
					artwork_thumbnails: [],
					artwork_url: item.track.artwork_url ? sc_highest_artwork(item.track.artwork_url) : sc_highest_artwork(item.user.avatar_url),
					date: reinterpret_cast<ISOString>(item.created_at),
					explicit: 'NONE',
					album_type: 'SONG',
					song_track: soundcloud_parse_track(item.track)
				}
			);
		}
		if (item.type === 'playlist') {
			new_releases.push(
				{
					title: { name: item.playlist.title, uri: create_uri('soundcloud', item.playlist.permalink_url) },
					artist: [{ name: item.user.username, uri: create_uri('soundcloud', item.user.permalink) }],
					artwork_thumbnails: [],
					artwork_url: item.playlist.artwork_url ? sc_highest_artwork(item.playlist.artwork_url) : sc_highest_artwork(item.user.avatar_url),
					date: reinterpret_cast<ISOString>(item.created_at),
					explicit: 'NONE',
					album_type: item.playlist.set_type === 'ep' ? 'EP' : item.playlist.set_type === 'album' ? 'ALBUM' : 'PLAYLIST'
				}
			);
		}
	}
	return new_releases;
}

export async function soundcloud_get_new_releases(): Promise<CompactPlaylist[]> {
	return soundcloud_parse_new_releases(await soundcloud_feed_items());
}

/** What this device's own feeds showed; the server stores them beside the releases it finds itself */
export interface NewReleaseFeeds {
	soundcloud_items?: SoundCloudFeedItem[];
	youtube_music_albums?: CompactPlaylist[];
}

function uri_id(uri: string | null | undefined, service: MusicServiceURI): string | null {
	if (!uri) return null;
	const [uri_service, id] = split_uri(uri);
	return uri_service === service && id ? id : null;
}

function youtube_music_feed_album(album: CompactPlaylist): YouTubeMusicFeedAlbum | null {
	const id = uri_id(album.title.uri, 'youtubemusic');
	if (id === null || album.title.name.trim() === '') return null;
	return {
		id,
		name: album.title.name,
		album_type: album.album_type ?? null,
		artists: album.artist.filter(artist => artist.name.trim() !== '').map(artist => ({ name: artist.name, id: uri_id(artist.uri, 'youtubemusic') })),
		artwork_url: album.artwork_url?.startsWith('http') ? album.artwork_url : null,
		explicit: album.explicit === undefined ? null : album.explicit === 'EXPLICIT'
	};
}

/**
 * Hands the feeds over and returns the server's new releases: those and releases by artists in the library. Null when
 * not logged in or the server couldn't be reached, so the caller can fall back to the feeds alone.
 */
export async function illusi_sync_new_releases(feeds: NewReleaseFeeds = {}): Promise<CompactPlaylist[] | null> {
	if (!IllusiAccount.is_logged_in()) return null;
	const result = await Illusi.NewReleasesApi.sync({
		limit: NEW_RELEASES_LIMIT,
		services: IllusiActions.release_services(),
		soundcloud_items: feeds.soundcloud_items ?? [],
		youtube_music_albums: (feeds.youtube_music_albums ?? []).map(youtube_music_feed_album).filter(album => album !== null)
	});
	if (Illusi.is_error(result)) return null;
	IllusiActions.handle(result.actions);
	return [
		...result.albums.map(IllusiViews.album),
		...result.soundcloud_tracks.map(IllusiViews.soundcloud_release).filter(release => release !== null),
		...(result.feed_albums ?? []).map(IllusiViews.feed_album)
	].sort((a, b) => new Date(b.date ?? 0).getTime() - new Date(a.date ?? 0).getTime());
}

export async function illusi_get_new_releases(): Promise<CompactPlaylist[]> {
	return await illusi_sync_new_releases() ?? [];
}
