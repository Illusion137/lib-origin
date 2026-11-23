import type { PromiseResult } from '@common/types';
import rozfetch from '@common/rozfetch';
import { remove_topic } from '@common/utils/clean_util';
import { generror } from '@common/utils/error_util';
import { generate_new_uid } from '@common/utils/util';
import * as Origin from '@origin/index';
import { Illusive } from '@illusive/illusive';
import { create_uri, music_service_to_music_service_uri } from '@illusive/illusive_utils';
import { Prefs } from '@illusive/prefs';
import { audiomack_parse_track } from '@illusive/parsers/audiomack_parser';
import { bandlab_parse_track } from '@illusive/parsers/bandlab_parser';
import { deezer_parse_track } from '@illusive/parsers/deezer_parser';
import { tidal_parse_track } from '@illusive/parsers/tidal_parser';
import type { IllusiveURI, MusicServiceType, Track } from '@illusive/types';

export namespace SharedUrls {
	export type TrackService = 'YouTube' | 'SoundCloud' | 'Spotify' | 'Apple Music' | 'Deezer' | 'Tidal' | 'Audiomack' | 'BandLab';
	export type Target = { type: 'track'; service: TrackService; id: string; url: string } | { type: 'playlist'; uri: IllusiveURI };

	const YOUTUBE_ID = /^[\w-]{11}$/;
	const BANDLAB_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
	const SHORT_HOSTS = new Set(['on.soundcloud.com', 'spotify.link', 'spotify.app.link', 'link.deezer.com', 'deezer.page.link', 'tidal.link', 'bnd.la', 'apple.co', 'amzn.to']);
	const PAGE_LINK = /https?:\/\/[^\s"'<>\\]+/gi;
	// soundcloud.com/<user>/<this> pages that list tracks rather than being one
	const SOUNDCLOUD_USER_PAGES = new Set(['sets', 'tracks', 'albums', 'popular-tracks', 'reposts', 'likes', 'followers', 'following', 'comments', 'spotlight']);
	const PLAYLIST_SERVICES: readonly MusicServiceType[] = ['YouTube', 'YouTube Music', 'Spotify', 'Amazon Music', 'Apple Music', 'SoundCloud', 'Audiomack', 'Deezer', 'Tidal', 'Pandora', 'Musi', 'Illusi'];

	function parsed_url(text: string): URL | null {
		const match = /https?:\/\/\S+/i.exec(text.trim());
		if (match === null) return null;
		try {
			return new URL(match[0]);
		} catch {
			return null;
		}
	}

	function host_of(url: URL): string {
		return url.hostname.toLowerCase().replace(/^(www|m)\./, '');
	}

	function youtube_track(url: URL, host: string): string | null {
		const segments = url.pathname.split('/').filter(Boolean);
		let id: string | null = null;
		if (host === 'youtu.be') id = segments[0] ?? null;
		else if (host === 'youtube.com' || host === 'music.youtube.com') {
			if (segments[0] === 'watch') id = url.searchParams.get('v');
			else if (segments[0] === 'shorts' || segments[0] === 'live' || segments[0] === 'embed') id = segments[1] ?? null;
		}
		return id !== null && YOUTUBE_ID.test(id) ? id : null;
	}

	function track_target(url: URL): Target | null {
		const host = host_of(url);
		const segments = url.pathname.split('/').filter(Boolean);
		const target = (service: TrackService, id: string | null | undefined): Target | null => (id ? { type: 'track', service, id, url: url.href } : null);

		const youtube_id = youtube_track(url, host);
		if (youtube_id !== null) return target('YouTube', youtube_id);
		if (host === 'soundcloud.com' && segments.length === 2 && !SOUNDCLOUD_USER_PAGES.has(segments[1]))
			return target('SoundCloud', `https://soundcloud.com/${segments[0]}/${segments[1]}`);
		if (host === 'open.spotify.com') {
			const at = segments.indexOf('track');
			if (at !== -1) return target('Spotify', segments[at + 1]);
		}
		if (host === 'music.apple.com') {
			const song = url.searchParams.get('i');
			if (segments.includes('album') && song !== null) return target('Apple Music', song);
			if (segments.includes('song')) return target('Apple Music', segments.at(-1));
		}
		if (host === 'deezer.com' && segments.at(-2) === 'track') return target('Deezer', segments.at(-1));
		if (host === 'tidal.com' && segments.at(-2) === 'track') return target('Tidal', segments.at(-1));
		if (host === 'audiomack.com' && segments[1] === 'song') return target('Audiomack', url.href);
		if (host === 'bandlab.com' && segments[0] === 'track' && BANDLAB_ID.test(segments[1] ?? '')) return target('BandLab', segments[1]);
		return null;
	}

	function playlist_target(url: URL): Target | null {
		const segments = url.pathname.split('/').filter(Boolean);
		// YouTube Music albums, which its playlist loader takes by their bare browse id
		if (host_of(url) === 'music.youtube.com' && segments[0] === 'browse' && segments[1]?.startsWith('MPRE')) return { type: 'playlist', uri: create_uri('youtubemusic', segments[1]) };
		const link = `${url.protocol}//${url.host}${url.pathname}${url.search}`;
		for (const name of PLAYLIST_SERVICES) {
			const service = Illusive.music_service.get(name);
			if (service?.valid_playlist_url_regex.test(link)) return { type: 'playlist', uri: create_uri(music_service_to_music_service_uri(name), link) };
		}
		return null;
	}

	// What a shared link points at
	export function classify(text: string): Target | null {
		const url = parsed_url(text);
		if (url === null) return null;
		return track_target(url) ?? playlist_target(url);
	}

	async function bandlab_post_target(url: URL, post_id: string): Promise<Target | null> {
		const post = await Origin.BandLab.get_post(post_id, { cookie_jar: Prefs.get_pref('bandlab_cookie_jar') });
		const song_id = 'error' in post ? undefined : post.revision?.song?.id;
		return song_id ? { type: 'track', service: 'BandLab', id: song_id, url: url.href } : null;
	}

	async function expanded_target(url: URL): Promise<Target | null> {
		const response = await rozfetch(url.href);
		if ('error' in response) return null;
		const landed = parsed_url(response.url);
		if (landed !== null && !SHORT_HOSTS.has(host_of(landed))) {
			const target = await resolve(landed.href, false);
			if (target !== null) return target;
		}
		const page = await response.text();
		for (const [link] of page.replace(/&amp;/g, '&').matchAll(PAGE_LINK)) {
			const candidate = parsed_url(link);
			if (candidate === null || SHORT_HOSTS.has(host_of(candidate))) continue;
			const target = classify(link);
			if (target !== null) return target;
		}
		return null;
	}

	export async function resolve(text: string, expand = true): Promise<Target | null> {
		const url = parsed_url(text);
		if (url === null) return null;
		const direct = track_target(url) ?? playlist_target(url);
		if (direct !== null) return direct;
		const host = host_of(url);
		const segments = url.pathname.split('/').filter(Boolean);
		if (host === 'bandlab.com' && segments[0] === 'post' && segments[1]) return bandlab_post_target(url, segments[1]);
		if (expand && SHORT_HOSTS.has(host)) return expanded_target(url);
		return null;
	}

	interface OEmbed { title?: string; author_name?: string; thumbnail_url?: string }

	async function oembed(endpoint: string, url: string): Promise<OEmbed | null> {
		const response = await rozfetch<OEmbed>(`${endpoint}?format=json&url=${encodeURIComponent(url)}`);
		if ('error' in response) return null;
		const json = await response.json();
		return 'error' in json ? null : json;
	}

	function shared_track(title: string, artist: string, fields: Partial<Track>): Track {
		return { uid: generate_new_uid(title), title, artists: [{ name: artist, uri: null }], duration: 0, ...fields };
	}

	export async function resolve_track(target: Extract<Target, { type: 'track' }>): PromiseResult<Track> {
		switch (target.service) {
			case 'YouTube': {
				const embed = await oembed('https://www.youtube.com/oembed', `https://www.youtube.com/watch?v=${target.id}`);
				return shared_track(embed?.title ?? target.id, remove_topic(embed?.author_name ?? ''), { youtube_id: target.id, ...(embed?.thumbnail_url ? { artwork_url: embed.thumbnail_url } : {}) });
			}
			case 'SoundCloud': {
				const embed = await oembed('https://soundcloud.com/oembed', target.id);
				const artist = embed?.author_name ?? '';
				const title = (embed?.title ?? target.id.split('/').at(-1) ?? '').replace(new RegExp(` by ${artist.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`), '');
				return shared_track(title, artist, { soundcloud_permalink: target.id, ...(embed?.thumbnail_url ? { artwork_url: embed.thumbnail_url } : {}) });
			}
			case 'Spotify': {
				const [embed, credits] = await Promise.all([oembed('https://open.spotify.com/oembed', `https://open.spotify.com/track/${target.id}`), Origin.Spotify.get_credits({ uri_id: `spotify:track:${target.id}` })]);
				const title = embed?.title ?? ('error' in credits ? null : credits.trackTitle);
				if (!title) return generror('Couldn\'t find the shared Spotify track', 'LOW', { target });
				const performers = 'error' in credits ? [] : credits.roleCredits.find(role => /perform|artist/i.test(role.roleTitle))?.artists ?? [];
				return { ...shared_track(title, '', { spotify_id: `spotify:track:${target.id}`, ...(embed?.thumbnail_url ? { artwork_url: embed.thumbnail_url } : {}) }), artists: performers.length > 0 ? performers.map(artist => ({ name: artist.name, uri: create_uri('spotify', artist.uri) })) : [{ name: '', uri: null }] };
			}
			case 'Apple Music': {
				const lookup = await Origin.ITunes.lookup({ id: target.id, entity: 'song' });
				const song = 'error' in lookup ? undefined : lookup.results.find(result => result.wrapperType === 'track' && String(result.trackId) === target.id);
				if (song?.trackName === undefined) return generror('Couldn\'t find the shared Apple Music track', 'LOW', { target });
				return shared_track(song.trackName, song.artistName ?? '', {
					applemusic_id: target.id,
					duration: (song.trackTimeMillis ?? 0) / 1000,
					...(song.collectionName ? { album: { name: song.collectionName, uri: null } } : {}),
					...(song.artworkUrl100 ? { artwork_url: song.artworkUrl100.replace(/100x100/, '600x600') } : {})
				});
			}
			case 'Deezer': {
				const track = await Origin.Deezer.get_track({ track_id: target.id });
				return 'error' in track ? track : deezer_parse_track(track);
			}
			case 'Tidal': {
				const track = await Origin.Tidal.get_track({ track_id: target.id });
				return 'error' in track ? track : tidal_parse_track(track);
			}
			case 'BandLab': {
				const song = await Origin.BandLab.get_song_info(target.id, { cookie_jar: Prefs.get_pref('bandlab_cookie_jar') });
				if ('error' in song) return song;
				const track = bandlab_parse_track(song);
				const duration = song.revision?.mixdown?.duration;
				return duration ? { ...track, duration } : track;
			}
			case 'Audiomack': {
				const track = await Origin.Audiomack.get_song_from_url({ url: target.id });
				return 'error' in track ? track : audiomack_parse_track(track);
			}
		}
	}
}
