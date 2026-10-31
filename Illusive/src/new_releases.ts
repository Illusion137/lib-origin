import * as Origin from '@origin/index';
import { ytm_album } from '@illusive/parsers/youtube_music_parser';
import { Prefs } from '@illusive/prefs';
import type { ISOString, CompactPlaylist } from '@illusive/types';
import { Illusi } from '@origin/illusi/illusi';
import { IllusiAccount } from '@illusive/db/sync/illusi_account';
import { IllusiActions } from '@illusive/db/sync/illusi_actions';
import { IllusiViews } from '@illusive/illusi_views';
import { sc_highest_artwork, soundcloud_parse_track } from './parsers/soundcloud_parser';
import { reinterpret_cast } from '@common/cast';
import { create_uri } from './illusive_utils';

export async function youtube_music_get_new_releases(): Promise<CompactPlaylist[]> {
	const cookie_jar = Prefs.get_pref('youtube_music_cookie_jar');
	const new_releases_albums_response = await Origin.YouTubeMusic.new_releases_albums({ cookie_jar: cookie_jar });
	if ('error' in new_releases_albums_response) return [];
	return new_releases_albums_response.map(album => ytm_album(album, 'ALBUM'));
}

export async function soundcloud_get_new_releases(): Promise<CompactPlaylist[]> {
	const cookie_jar = Prefs.get_pref('soundcloud_cookie_jar');
	const feed = await Origin.SoundCloud.feed({ cookie_jar, feed_types: ['TrackPost', 'TrackRepost', 'PlaylistPost'], promoted_playlist: false, limit: 30 });
	if ('error' in feed) return [];

	const new_releases: CompactPlaylist[] = [];
	for (const item of feed.data.collection) {
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

export async function illusi_get_new_releases(): Promise<CompactPlaylist[]> {
	if (!IllusiAccount.is_logged_in()) return [];
	const result = await Illusi.NewReleasesApi.mine(IllusiActions.release_services());
	if (Illusi.is_error(result)) return [];
	IllusiActions.handle(result.actions);
	return [
		...result.albums.map(IllusiViews.album),
		...result.soundcloud_tracks.map(IllusiViews.soundcloud_release).filter(release => release !== null)
	].sort((a, b) => new Date(b.date ?? 0).getTime() - new Date(a.date ?? 0).getTime());
}
