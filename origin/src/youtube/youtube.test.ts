import { test, describe, beforeEach, expect } from 'vitest';
import { CookieJar } from '@common/utils/cookie_util';
import { YouTube } from '@origin/youtube/youtube';
import { YouTubeMusic } from '@origin/youtube/youtube_music';
import { expect_error, expect_no_error } from '@common/testing.test';
import 'dotenv/config';

let failed = false;
beforeEach(() => { if (failed) throw new Error('Prior test failed — bailing'); });
async function bail_no_error(value: unknown) {
	try { expect_no_error(value); } catch (e) { failed = true; throw e; }
}
async function bail_error(value: unknown) {
	try { expect_error(value); } catch (e) { failed = true; throw e; }
}

const youtube_mock = {
	cookie_jar: CookieJar.fromString(process.env.YOUTUBE_COOKIE_JAR)
};
const playlist_id = 'PLFgquLnL59alCl_2TQvOiD5Vgm1hCaGSI';
const artist_id = 'UCmMUZbaYdNH0bEd1PAlAqsA';
const search_query = 'Lelo new detroit';
const video_id = 'dQw4w9WgXcQ';
const ytm_album_id = 'MPREb_9nqEki4ZDpp';
const ytm_artist_id = 'UCmMUZbaYdNH0bEd1PAlAqsA';
const ytm_playlist_id = 'PLFgquLnL59alCl_2TQvOiD5Vgm1hCaGSI';

describe('YouTube', () => {
	test('get_home with cookies', async () => bail_no_error(await YouTube.get_home(youtube_mock)));
	test('get_home without cookies', async () => bail_no_error(await YouTube.get_home({})));

	test('get_playlist with cookies', async () => bail_no_error(await YouTube.get_playlist(youtube_mock, playlist_id)));
	test('get_playlist without cookies', async () => bail_no_error(await YouTube.get_playlist({}, playlist_id)));

	test('get_artist with cookies', async () => bail_no_error(await YouTube.get_artist(youtube_mock, artist_id)));
	test('get_artist without cookies', async () => bail_no_error(await YouTube.get_artist({}, artist_id)));

	test('search with cookies', async () => bail_no_error(await YouTube.search(youtube_mock, search_query)));
	test('search without cookies', async () => bail_no_error(await YouTube.search({}, search_query)));

	test('get_library with cookies', async () => bail_no_error(await YouTube.get_library(youtube_mock)));
	test('get_library without cookies', async () => bail_error(await YouTube.get_library({})));

	test('get_youtube_mix with cookies', async () => bail_no_error(await YouTube.get_youtube_mix(youtube_mock, video_id)));
	test('get_youtube_mix without cookies', async () => bail_no_error(await YouTube.get_youtube_mix({}, video_id)));

	test('get_continuation from get_home', async () => {
		const home = await YouTube.get_home(youtube_mock);
		await bail_no_error(home);
		if ('error' in home || home.continuation === null) return;
		await bail_no_error(await YouTube.get_continuation(youtube_mock, home.continuation));
	});
	test('get_continuation with unknown id', async () => bail_error(await YouTube.get_continuation({}, 'unknown-continuation-id')));

	test('playlist_urlid extracts id from url', () => {
		expect(YouTube.playlist_urlid(`https://www.youtube.com/playlist?list=${playlist_id}&si=abc`)).toBe(playlist_id);
		expect(YouTube.playlist_urlid(playlist_id)).toBe(playlist_id);
	});
});

describe('YouTubeMusic', () => {
	test('get_home with cookies', async () => bail_no_error(await YouTubeMusic.get_home(youtube_mock)));
	test('get_home without cookies', async () => bail_no_error(await YouTubeMusic.get_home({})));

	test('get_explore with cookies', async () => bail_no_error(await YouTubeMusic.get_explore(youtube_mock)));
	test('get_explore without cookies', async () => bail_no_error(await YouTubeMusic.get_explore({})));

	test('search with cookies', async () => bail_no_error(await YouTubeMusic.search(youtube_mock, search_query)));
	test('search without cookies', async () => bail_no_error(await YouTubeMusic.search({}, search_query)));

	test('search_suggestions with cookies', async () => expect((await YouTubeMusic.search_suggestions(youtube_mock, 'lelo')).length).toBeGreaterThan(0));
	test('search_suggestions without cookies', async () => expect((await YouTubeMusic.search_suggestions({}, 'lelo')).length).toBeGreaterThan(0));
	test('search_suggestions with empty query', async () => expect(await YouTubeMusic.search_suggestions({}, '')).toEqual([]));

	test('get_playlist with cookies', async () => bail_no_error(await YouTubeMusic.get_playlist(youtube_mock, ytm_playlist_id)));
	test('get_playlist without cookies', async () => bail_no_error(await YouTubeMusic.get_playlist({}, ytm_playlist_id)));
	test('get_playlist with album id', async () => bail_no_error(await YouTubeMusic.get_playlist({}, ytm_album_id)));

	test('get_album with cookies', async () => bail_no_error(await YouTubeMusic.get_album(youtube_mock, ytm_album_id)));
	test('get_album without cookies', async () => bail_no_error(await YouTubeMusic.get_album({}, ytm_album_id)));

	test('get_artist with cookies', async () => bail_no_error(await YouTubeMusic.get_artist(youtube_mock, ytm_artist_id)));
	test('get_artist without cookies', async () => bail_no_error(await YouTubeMusic.get_artist({}, ytm_artist_id)));

	test('new_releases_albums with cookies', async () => bail_no_error(await YouTubeMusic.new_releases_albums(youtube_mock)));
	test('new_releases_albums without cookies', async () => bail_no_error(await YouTubeMusic.new_releases_albums({})));

	test('get_library with cookies', async () => bail_no_error(await YouTubeMusic.get_library(youtube_mock)));
	test('get_library without cookies', async () => bail_error(await YouTubeMusic.get_library({})));

	test('get_history with cookies', async () => bail_no_error(await YouTubeMusic.get_history(youtube_mock)));
	test('get_history without cookies', async () => bail_no_error(await YouTubeMusic.get_history({})));

	test('get_watch_next with cookies', async () => bail_no_error(await YouTubeMusic.get_watch_next(youtube_mock, video_id)));
	test('get_watch_next without cookies', async () => bail_no_error(await YouTubeMusic.get_watch_next({}, video_id)));
	test('get_watch_next without automix', async () => bail_no_error(await YouTubeMusic.get_watch_next({}, video_id, false)));

	test('get_lyrics with cookies', async () => bail_no_error(await YouTubeMusic.get_lyrics(youtube_mock, video_id)));
	test('get_lyrics without cookies', async () => bail_no_error(await YouTubeMusic.get_lyrics({}, video_id)));

	test('get_related with cookies', async () => bail_no_error(await YouTubeMusic.get_related(youtube_mock, video_id)));
	test('get_related without cookies', async () => bail_no_error(await YouTubeMusic.get_related({}, video_id)));

	test('get_continuation from get_playlist', async () => {
		const playlist = await YouTubeMusic.get_playlist(youtube_mock, ytm_playlist_id);
		await bail_no_error(playlist);
		if ('error' in playlist || playlist.continuation === null) return;
		await bail_no_error(await YouTubeMusic.get_continuation(youtube_mock, playlist.continuation));
	});
	test('get_continuation with unknown id', async () => bail_error(await YouTubeMusic.get_continuation({}, 'unknown-continuation-id')));

	test('playlist_urlid extracts id from url', () => {
		expect(YouTubeMusic.playlist_urlid(`https://music.youtube.com/playlist?list=${ytm_playlist_id}&si=abc`)).toBe(ytm_playlist_id);
	});
	test('playlist_type classifies ids', () => {
		expect(YouTubeMusic.playlist_type('MPREb_abc')).toBe('ALBUM');
		expect(YouTubeMusic.playlist_type('OLAK5uy_abc')).toBe('ALBUM');
		expect(YouTubeMusic.playlist_type('LL')).toBe('DEFAULT_PLAYLIST');
		expect(YouTubeMusic.playlist_type('RDCLAK5uy_abc')).toBe('MOODS');
		expect(YouTubeMusic.playlist_type('VLsomething')).toBe('BROWSE_ID');
	});
});
