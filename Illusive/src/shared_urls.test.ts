import { beforeEach, describe, expect, it, vi } from 'vitest';
import rozfetch from '@common/rozfetch';
import * as Origin from '@origin/index';
import { SharedUrls } from './shared_urls';

// The playlist link patterns of Illusive.music_service
vi.mock('@illusive/illusive', () => ({
	Illusive: {
		music_service: new Map<string, { valid_playlist_url_regex: RegExp }>([
			['Illusi', { valid_playlist_url_regex: /(https?:\/\/)illusi\.dev\/playlist\/.+/i }],
			['Musi', { valid_playlist_url_regex: /(https?:\/\/)feelthemusi\.com\/playlist\/.+/i }],
			['YouTube', { valid_playlist_url_regex: /(https?:\/\/)(www\.)?youtube\.com\/playlist\?list=.+/i }],
			['YouTube Music', { valid_playlist_url_regex: /(https?:\/\/)(www\.)?music\.youtube\.com\/playlist\?list=.+/i }],
			['Spotify', { valid_playlist_url_regex: /(https?:\/\/)open\.spotify\.com\/(playlist|album|collection)\/.+/i }],
			['Amazon Music', { valid_playlist_url_regex: /(https?:\/\/)music\.amazon\.com\/(playlists|user-playlists)\/.+/i }],
			['Apple Music', { valid_playlist_url_regex: /(https?:\/\/)music\.apple\.com\/.+?\/playlist\/.+?/i }],
			['SoundCloud', { valid_playlist_url_regex: /(https?:\/\/)soundcloud\.com\/.+?\/(sets\/.+)?/i }],
			['Audiomack', { valid_playlist_url_regex: /(https?:\/\/)?(www\.|m\.)?audiomack\.com\/.+\/(album|playlist)\/.+/i }],
			['Deezer', { valid_playlist_url_regex: /(https?:\/\/)?(www\.)?deezer\.com\/([a-z]{2}\/)?(?:album|playlist)\/.+/i }],
			['Tidal', { valid_playlist_url_regex: /(https?:\/\/)(www\.)?tidal\.com\/browse\/(album|playlist)\/.+/i }],
			['Pandora', { valid_playlist_url_regex: /(https?:\/\/)?(www\.)?pandora\.com\/(playlist|station)\/.+/i }]
		])
	}
}));
vi.mock('@common/rozfetch', () => ({ default: vi.fn() }));
vi.mock('@origin/index', () => ({
	Spotify: { get_credits: vi.fn() },
	ITunes: { lookup: vi.fn() },
	Deezer: { get_track: vi.fn() },
	Tidal: { get_track: vi.fn() },
	Audiomack: { get_song_from_url: vi.fn() },
	BandLab: { get_post: vi.fn(), get_song_info: vi.fn() }
}));
vi.mock('@illusive/prefs', () => ({ Prefs: { get_pref: () => undefined } }));
vi.mock('@illusive/parsers/bandlab_parser', () => ({ bandlab_parse_track: (song: { id: string; name: string }) => ({ uid: 'b', title: song.name, artists: [], duration: Number.NaN, bandlab_id: song.id }) }));
vi.mock('@illusive/parsers/audiomack_parser', () => ({ audiomack_parse_track: vi.fn() }));
vi.mock('@illusive/parsers/deezer_parser', () => ({ deezer_parse_track: (track: { title: string }) => ({ uid: 'd', title: track.title, artists: [], duration: 0 }) }));
vi.mock('@illusive/parsers/tidal_parser', () => ({ tidal_parse_track: vi.fn() }));

function serves(json: object) {
	vi.mocked(rozfetch).mockResolvedValue({ json: async () => json } as never);
}

describe('SharedUrls.classify', () => {
	it.each([
		['https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'YouTube', 'dQw4w9WgXcQ'],
		['https://youtu.be/dQw4w9WgXcQ?si=abc123', 'YouTube', 'dQw4w9WgXcQ'],
		['https://m.youtube.com/watch?v=dQw4w9WgXcQ&feature=share', 'YouTube', 'dQw4w9WgXcQ'],
		['https://www.youtube.com/shorts/dQw4w9WgXcQ', 'YouTube', 'dQw4w9WgXcQ'],
		['https://music.youtube.com/watch?v=dQw4w9WgXcQ&list=RDAMVMdQw4w9WgXcQ', 'YouTube', 'dQw4w9WgXcQ'],
		['https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=PLx0sYbCqOb8TBPRdmBHs5Iftvv9TPboYG', 'YouTube', 'dQw4w9WgXcQ'],
		['https://soundcloud.com/lelothecorpse/like-sunday?si=xyz&utm_source=clipboard', 'SoundCloud', 'https://soundcloud.com/lelothecorpse/like-sunday'],
		['https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC?si=6f2', 'Spotify', '4uLU6hMCjMI75M1A2tKUQC'],
		['https://open.spotify.com/intl-de/track/4uLU6hMCjMI75M1A2tKUQC', 'Spotify', '4uLU6hMCjMI75M1A2tKUQC'],
		['https://music.apple.com/us/album/never-gonna-give-you-up/1559523357?i=1559523359', 'Apple Music', '1559523359'],
		['https://music.apple.com/us/song/never-gonna-give-you-up/1559523359', 'Apple Music', '1559523359'],
		['https://www.deezer.com/en/track/3135556', 'Deezer', '3135556'],
		['https://tidal.com/browse/track/77640617', 'Tidal', '77640617'],
		['https://audiomack.com/artist-slug/song/song-slug', 'Audiomack', 'https://audiomack.com/artist-slug/song/song-slug'],
		['https://www.bandlab.com/track/3f0a9b0e-b0f1-ef11-90cb-000d3a41ef61?revId=9a1c2e3d-0b1f-ef11-90cb-000d3a41ef62', 'BandLab', '3f0a9b0e-b0f1-ef11-90cb-000d3a41ef61']
	])('opens %s as a %s track', (url, service, id) => {
		expect(SharedUrls.classify(url)).toMatchObject({ type: 'track', service, id });
	});

	it('finds the link in text shared along with it', () => {
		expect(SharedUrls.classify('Check this out! https://youtu.be/dQw4w9WgXcQ')).toMatchObject({ type: 'track', id: 'dQw4w9WgXcQ' });
	});

	it.each([
		['https://www.youtube.com/playlist?list=PLx0sYbCqOb8TBPRdmBHs5Iftvv9TPboYG', 'youtube:youtube.com/playlist?list=PLx0sYbCqOb8TBPRdmBHs5Iftvv9TPboYG'],
		['https://music.youtube.com/playlist?list=OLAK5uy_abc', 'youtubemusic:music.youtube.com/playlist?list=OLAK5uy_abc'],
		['https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M?si=a', 'spotify:open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M?si=a'],
		['https://open.spotify.com/album/4aawyAB9vmqN3uQ7FjRGTy', 'spotify:open.spotify.com/album/4aawyAB9vmqN3uQ7FjRGTy'],
		['https://music.apple.com/us/playlist/todays-hits/pl.f4d106fed2bd41149aaacabb233eb5eb', 'applemusic:music.apple.com/us/playlist/todays-hits/pl.f4d106fed2bd41149aaacabb233eb5eb'],
		['https://soundcloud.com/lelothecorpse/sets/tape', 'soundcloud:soundcloud.com/lelothecorpse/sets/tape'],
		['https://www.deezer.com/en/playlist/908622995', 'deezer:deezer.com/en/playlist/908622995'],
		['https://tidal.com/browse/album/77640616', 'tidal:tidal.com/browse/album/77640616'],
		['https://music.youtube.com/browse/MPREb_9nqEki4ZDpp?si=x', 'youtubemusic:MPREb_9nqEki4ZDpp']
	])('opens %s as a playlist', (url, uri) => {
		expect(SharedUrls.classify(url)).toEqual({ type: 'playlist', uri });
	});

	it.each(['not a link', 'https://example.com/watch?v=dQw4w9WgXcQ', 'https://www.youtube.com/watch?v=short', 'https://www.youtube.com/@someone'])('leaves %s alone', (text) => {
		expect(SharedUrls.classify(text)).toBeNull();
	});
});

describe('SharedUrls.resolve_track', () => {
	beforeEach(() => vi.clearAllMocks());

	it('names a YouTube video from its oEmbed, without the Topic suffix', async () => {
		serves({ title: 'Never Gonna Give You Up', author_name: 'Rick Astley - Topic', thumbnail_url: 'https://i.ytimg.com/vi/x/hq.jpg' });
		const track = await SharedUrls.resolve_track({ type: 'track', service: 'YouTube', id: 'dQw4w9WgXcQ', url: '' });
		expect(track).toMatchObject({ title: 'Never Gonna Give You Up', artists: [{ name: 'Rick Astley' }], youtube_id: 'dQw4w9WgXcQ', artwork_url: 'https://i.ytimg.com/vi/x/hq.jpg' });
	});

	it('still plays a YouTube video its oEmbed doesn\'t describe', async () => {
		vi.mocked(rozfetch).mockResolvedValue({ error: new Error('offline') } as never);
		expect(await SharedUrls.resolve_track({ type: 'track', service: 'YouTube', id: 'dQw4w9WgXcQ', url: '' })).toMatchObject({ youtube_id: 'dQw4w9WgXcQ' });
	});

	it('takes the artist off a SoundCloud title', async () => {
		serves({ title: 'Like Sunday by lelo', author_name: 'lelo' });
		const track = await SharedUrls.resolve_track({ type: 'track', service: 'SoundCloud', id: 'https://soundcloud.com/lelothecorpse/like-sunday', url: '' });
		expect(track).toMatchObject({ title: 'Like Sunday', artists: [{ name: 'lelo' }], soundcloud_permalink: 'https://soundcloud.com/lelothecorpse/like-sunday' });
	});

	it('credits a Spotify track to its performers', async () => {
		serves({ title: 'Song 2' });
		vi.mocked(Origin.Spotify.get_credits).mockResolvedValue({ trackTitle: 'Song 2', roleCredits: [{ roleTitle: 'Writers', artists: [{ name: 'Writer', uri: 'spotify:artist:w' }] }, { roleTitle: 'Performers', artists: [{ name: 'Blur', uri: 'spotify:artist:b' }] }] } as never);
		const track = await SharedUrls.resolve_track({ type: 'track', service: 'Spotify', id: '1FTSo4v6BOZH9QxKc3MbVM', url: '' });
		expect(track).toMatchObject({ title: 'Song 2', artists: [{ name: 'Blur' }], spotify_id: 'spotify:track:1FTSo4v6BOZH9QxKc3MbVM' });
	});

	it('looks an Apple Music song up on iTunes', async () => {
		vi.mocked(Origin.ITunes.lookup).mockResolvedValue({ resultCount: 1, results: [{ wrapperType: 'track', trackId: 1559523359, trackName: 'Never Gonna Give You Up', artistName: 'Rick Astley', trackTimeMillis: 213_000, collectionName: 'Whenever You Need Somebody', artworkUrl100: 'https://a/100x100bb.jpg' }] } as never);
		const track = await SharedUrls.resolve_track({ type: 'track', service: 'Apple Music', id: '1559523359', url: '' });
		expect(track).toMatchObject({ title: 'Never Gonna Give You Up', artists: [{ name: 'Rick Astley' }], duration: 213, applemusic_id: '1559523359', album: { name: 'Whenever You Need Somebody' }, artwork_url: 'https://a/600x600bb.jpg' });
	});

	it('fails when iTunes doesn\'t know the song', async () => {
		vi.mocked(Origin.ITunes.lookup).mockResolvedValue({ resultCount: 0, results: [] } as never);
		expect('error' in await SharedUrls.resolve_track({ type: 'track', service: 'Apple Music', id: '1', url: '' })).toBe(true);
	});

	it('uses the Deezer API for Deezer tracks', async () => {
		vi.mocked(Origin.Deezer.get_track).mockResolvedValue({ title: 'Harder' } as never);
		expect(await SharedUrls.resolve_track({ type: 'track', service: 'Deezer', id: '3135556', url: '' })).toMatchObject({ title: 'Harder' });
		expect(Origin.Deezer.get_track).toHaveBeenCalledWith({ track_id: '3135556' });
	});
});

describe('SharedUrls.resolve', () => {
	const BANDLAB_SONG = '3f0a9b0e-b0f1-ef11-90cb-000d3a41ef61';
	beforeEach(() => vi.clearAllMocks());

	function lands(url: string, page = '') {
		vi.mocked(rozfetch).mockResolvedValue({ url, text: async () => page } as never);
	}

	it('opens links it knows without fetching anything', async () => {
		expect(await SharedUrls.resolve('https://youtu.be/dQw4w9WgXcQ')).toMatchObject({ service: 'YouTube', id: 'dQw4w9WgXcQ' });
		expect(rozfetch).not.toHaveBeenCalled();
	});

	it('follows a short link to where it redirects', async () => {
		lands('https://soundcloud.com/lelothecorpse/like-sunday?ref=clipboard');
		expect(await SharedUrls.resolve('https://on.soundcloud.com/AbCdEf123')).toMatchObject({ service: 'SoundCloud', id: 'https://soundcloud.com/lelothecorpse/like-sunday' });
		expect(rozfetch).toHaveBeenCalledWith('https://on.soundcloud.com/AbCdEf123');
	});

	it('finds the real link on a short link\'s landing page', async () => {
		lands('https://spotify.link/xyz', '<html><a href="https://example.com/">x</a><meta content="https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC?si=a&amp;utm=b"></html>');
		expect(await SharedUrls.resolve('https://spotify.link/xyz')).toMatchObject({ service: 'Spotify', id: '4uLU6hMCjMI75M1A2tKUQC' });
	});

	it('opens playlists behind short links', async () => {
		lands('https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M');
		expect(await SharedUrls.resolve('https://spotify.link/abc')).toEqual({ type: 'playlist', uri: 'spotify:open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M' });
	});

	it('opens the track a BandLab post shares, even behind a short link', async () => {
		vi.mocked(Origin.BandLab.get_post).mockResolvedValue({ id: 'p1', revision: { id: 'r1', song: { id: BANDLAB_SONG, name: 'Demo' } } } as never);
		expect(await SharedUrls.resolve('https://www.bandlab.com/post/p1')).toMatchObject({ service: 'BandLab', id: BANDLAB_SONG });
		lands('https://www.bandlab.com/post/p1');
		expect(await SharedUrls.resolve('https://bnd.la/q2w3e4')).toMatchObject({ service: 'BandLab', id: BANDLAB_SONG });
		expect(Origin.BandLab.get_post).toHaveBeenLastCalledWith('p1', expect.anything());
	});

	it('gives up on BandLab posts that share no track, and on short links that lead nowhere', async () => {
		vi.mocked(Origin.BandLab.get_post).mockResolvedValue({ id: 'p2', revision: null } as never);
		expect(await SharedUrls.resolve('https://www.bandlab.com/post/p2')).toBeNull();
		lands('https://spotify.link/loop', '<a href="https://spotify.link/loop">again</a>');
		expect(await SharedUrls.resolve('https://spotify.link/loop')).toBeNull();
		vi.mocked(rozfetch).mockResolvedValue({ error: new Error('offline') } as never);
		expect(await SharedUrls.resolve('https://tidal.link/x')).toBeNull();
	});

	it('doesn\'t fetch links from hosts it doesn\'t know', async () => {
		expect(await SharedUrls.resolve('https://example.com/song')).toBeNull();
		expect(rozfetch).not.toHaveBeenCalled();
	});

	it('names a BandLab track and takes its length from the mixdown', async () => {
		vi.mocked(Origin.BandLab.get_song_info).mockResolvedValue({ id: BANDLAB_SONG, name: 'Demo', revision: { mixdown: { duration: 93.5 } } } as never);
		expect(await SharedUrls.resolve_track({ type: 'track', service: 'BandLab', id: BANDLAB_SONG, url: '' })).toMatchObject({ title: 'Demo', bandlab_id: BANDLAB_SONG, duration: 93.5 });
	});
});
