import * as Parser from '@origin/youtube/parser';
import type { YTMAlbum, YTMArtist, YTMArtistRef, YTMArtistResult, YTMHistorySection, YTMLyrics, YTMPlaylistResult, YTMRelatedSection, YTMSearchResult, YTMTrack } from '@origin/youtube/parser';
import { YouTubeSession } from '@origin/youtube/session';
import { YouTubeShared } from '@origin/youtube/shared';
import type { PromiseResult } from '@common/types';
import { is_empty, urlid } from '@common/utils/util';
import { generror, generror_catch } from '@common/utils/error_util';
import { reinterpret_cast } from '@common/cast';
import { YTNodes } from 'youtubei.js';
import type Innertube from 'youtubei.js';
import type { YTMusic, Helpers, Misc, IBrowseResponse } from 'youtubei.js';

type YTNode = Helpers.YTNode;
interface MusicHeaderLike {
	title?: Misc.Text;
	subtitle?: Misc.Text;
	strapline_text_one?: Misc.Text;
	author?: { name?: string; channel_id?: string };
	thumbnail?: { contents?: Misc.Thumbnail[] } | null;
	thumbnails?: Misc.Thumbnail[];
	description?: { description?: Misc.Text; text?: string };
	subscribers?: Misc.Text;
}

export namespace YouTubeMusic {
	type Opts = YouTubeSession.Opts;
	type Privacy = 'PUBLIC' | 'UNLISTED' | 'PRIVATE';

	export type Page<T> = YouTubeShared.Page<T>;
	const make_page = YouTubeShared.make_page;
	const register_more = YouTubeShared.register_more;

	export async function get_continuation(_opts: Opts, continuation_id: string): PromiseResult<Page<unknown>> {
		return await YouTubeShared.get_continuation(continuation_id);
	}

	function browse_continuation_token(page: IBrowseResponse): string | null {
		const grid_token = page.contents_memo?.getType(YTNodes.Grid)?.[0]?.continuation ?? page.continuation_contents_memo?.getType(YTNodes.Grid)?.[0]?.continuation;
		if (grid_token !== undefined && grid_token !== null) return grid_token;
		const cc = page.continuation_contents;
		return cc !== null && cc !== undefined && 'continuation' in cc && typeof cc.continuation === 'string' ? cc.continuation : null;
	}

	async function fetch_grid<T>(session: Innertube, call: () => Promise<IBrowseResponse>, parse: (item: YTNodes.MusicTwoRowItem) => T): Promise<Page<T[]>> {
		const page = await call();
		const memo = page.contents_memo ?? page.continuation_contents_memo;
		const data = (memo?.getType(YTNodes.MusicTwoRowItem) ?? []).map(parse);
		const token = browse_continuation_token(page);
		const continuation = token === null ? null : register_more(() => fetch_grid(session, () => session.actions.execute('/browse', { continuation: token, client: 'YTMUSIC', parse: true }), parse));
		return { data, continuation };
	}

	function register_grid<T>(session: Innertube, endpoint: YTNodes.NavigationEndpoint | null | undefined, parse: (item: YTNodes.MusicTwoRowItem) => T): string | null {
		if (endpoint === null || endpoint === undefined) return null;
		const payload = endpoint.payload as { browseId?: string; params?: string };
		return register_more(() => fetch_grid(session, () => session.actions.execute('/browse', { browseId: payload.browseId, params: payload.params, client: 'YTMUSIC', parse: true }), parse));
	}

	async function fetch_songs(session: Innertube, call: () => Promise<{ contents?: YTNode[]; continuation?: string | null } | undefined>): Promise<Page<YTMTrack[]>> {
		const shelf = await call();
		const tracks = (shelf?.contents ?? []).filter(item => item.is(YTNodes.MusicResponsiveListItem)).map(item => Parser.parse_ytm_track(item.as(YTNodes.MusicResponsiveListItem)));
		const token = shelf?.continuation ?? null;
		const continuation = token === null
			? null
			: register_more(() => fetch_songs(session, async () => {
					const page = await session.actions.execute('/browse', { continuation: token, client: 'YTMUSIC', parse: true });
					const cc = page.continuation_contents;
					const next = cc !== null && cc !== undefined && 'continuation' in cc && typeof cc.continuation === 'string' ? cc.continuation : null;
					return { contents: page.continuation_contents_memo?.getType(YTNodes.MusicResponsiveListItem) ?? [], continuation: next };
				}));
		return { data: tracks, continuation };
	}

	export type PlaylistType = 'DEFAULT_PLAYLIST' | 'PLAYLIST' | 'ALBUM' | 'MOODS' | 'YTMUSIC_PLAYLIST' | 'BROWSE_ID';
	export function playlist_urlid(playlist_url: string) {
		return urlid(playlist_url, 'music.youtube.com/', 'playlist?list=', /&.+/);
	}
	export function playlist_type(id: string): PlaylistType {
		id = playlist_urlid(id);
		if (id.includes('OLAK5uy') || id.startsWith('MPRE')) return 'ALBUM';
		if (id === 'LM' || id === 'WL' || id === 'LL') return 'DEFAULT_PLAYLIST';
		if (id.includes('PLnIB0XeUqT')) return 'PLAYLIST';
		if (id.includes('RDCLAK5uy')) return 'MOODS';
		if (id.includes('PL4fGSI1pDJn6O1LS0XSdF3RyO0Rq')) return 'YTMUSIC_PLAYLIST';
		return 'BROWSE_ID';
	}

	function categorize_item(item: YTNodes.MusicResponsiveListItem, result: YTMSearchResult) {
		switch (item.item_type) {
			case 'song':
			case 'video':
			case 'non_music_track':
				result.tracks.push(Parser.parse_ytm_track(item));
				break;
			case 'album':
				result.albums.push(Parser.parse_ytm_album(item));
				break;
			case 'playlist':
				result.playlists.push(Parser.parse_ytm_album(item));
				break;
			case 'artist':
			case 'library_artist':
				result.artists.push(Parser.parse_ytm_artist(item));
				break;
			default: break;
		}
	}

	function parse_search(search: YTMusic.Search): YTMSearchResult {
		const result: YTMSearchResult = { tracks: [], albums: [], playlists: [], artists: [] };
		for (const shelf of search.contents ?? []) {
			if (shelf.is(YTNodes.MusicCardShelf)) {
				result.top_result = Parser.parse_ytm_card_top_result(shelf.as(YTNodes.MusicCardShelf));
			} else if (shelf.is(YTNodes.MusicShelf)) {
				for (const item of shelf.as(YTNodes.MusicShelf).contents) categorize_item(item, result);
			} else if (shelf.is(YTNodes.ItemSection)) {
				for (const item of shelf.as(YTNodes.ItemSection).contents) {
					if (item.is(YTNodes.MusicResponsiveListItem)) categorize_item(item.as(YTNodes.MusicResponsiveListItem), result);
				}
			}
		}
		return result;
	}

	function header_thumbnails(header: MusicHeaderLike | undefined): Misc.Thumbnail[] {
		return header?.thumbnail?.contents ?? header?.thumbnails ?? [];
	}

	function playlist_header(header_node: YTNode | undefined): YTMPlaylistResult['header'] {
		const header = reinterpret_cast<MusicHeaderLike | undefined>(header_node);
		const strapline = header?.strapline_text_one;
		const strapline_browse = (strapline?.endpoint?.payload as { browseId?: string } | undefined)?.browseId;
		const artists: YTMArtistRef[] = strapline?.text
			? [{ name: strapline.text, browse_id: strapline_browse }]
			: (header?.author ? [{ name: header.author.name ?? '', browse_id: header.author.channel_id }] : []);
		return {
			title: header?.title?.text ?? '',
			artists,
			description: header?.description?.description?.text ?? header?.description?.text,
			thumbnails: header_thumbnails(header).map(t => ({ url: t.url, width: t.width, height: t.height }))
		};
	}

	function synthesize_album_header(tracks: YTMTrack[]): YTMPlaylistResult['header'] {
		const first = tracks[0];
		return { title: first?.album?.name ?? '', artists: first?.artists ?? [], description: undefined, thumbnails: first?.thumbnails ?? [] };
	}

	function parse_playlist(playlist: YTMusic.Playlist): YTMPlaylistResult {
		const tracks: YTMTrack[] = [];
		for (const item of playlist.items ?? []) {
			if (item.is(YTNodes.MusicResponsiveListItem)) tracks.push(Parser.parse_ytm_track(item.as(YTNodes.MusicResponsiveListItem)));
		}
		const header = playlist.header !== undefined ? playlist_header(playlist.header) : synthesize_album_header(tracks);
		return { header, tracks };
	}

	export async function get_home(opts: Opts): PromiseResult<YTMusic.HomeFeed> {
		try {
			return await (await YouTubeSession.get(opts)).music.getHomeFeed();
		} catch (error) { return generror_catch(error, 'Failed to fetch YouTube Music home', 'MEDIUM'); }
	}

	export async function get_explore(opts: Opts): PromiseResult<YTMusic.Explore> {
		try {
			return await (await YouTubeSession.get(opts)).music.getExplore();
		} catch (error) { return generror_catch(error, 'Failed to fetch YouTube Music explore', 'MEDIUM'); }
	}

	export async function search(opts: Opts, search_query: string): PromiseResult<YTMSearchResult> {
		try {
			const results = await (await YouTubeSession.get(opts)).music.search(search_query);
			return parse_search(results);
		} catch (error) { return generror_catch(error, 'Failed to search YouTube Music', 'MEDIUM', { search_query }); }
	}

	export async function get_playlist(opts: Opts, playlist_id: string): PromiseResult<Page<YTMPlaylistResult>> {
		try {
			const session = await YouTubeSession.get(opts);
			const id = playlist_urlid(playlist_id);
			if (id.startsWith('MPRE')) {
				const album = await session.music.getAlbum(id);
				return { data: { header: playlist_header(album.header), tracks: album.contents.map(Parser.parse_ytm_track) }, continuation: null };
			}
			const playlist = await session.music.getPlaylist(id);
			return make_page(playlist, parse_playlist);
		} catch (error) { return generror_catch(error, 'Failed to fetch YouTube Music playlist', 'MEDIUM', { playlist_id }); }
	}

	export async function get_album(opts: Opts, album_id: string): PromiseResult<YTMPlaylistResult> {
		try {
			const album = await (await YouTubeSession.get(opts)).music.getAlbum(album_id);
			return {
				header: playlist_header(album.header),
				tracks: album.contents.map(Parser.parse_ytm_track)
			};
		} catch (error) { return generror_catch(error, 'Failed to fetch YouTube Music album', 'MEDIUM', { album_id }); }
	}

	type CarouselKind = 'albums' | 'singles' | 'videos' | 'playlists' | 'appears_on' | 'similar' | 'unknown';
	function carousel_kind(carousel: YTNodes.MusicCarouselShelf, title: string): CarouselKind {
		const first = carousel.contents.find(item => item.is(YTNodes.MusicTwoRowItem))?.as(YTNodes.MusicTwoRowItem);
		switch (first?.item_type) {
			case 'artist': return 'similar';
			case 'video': return 'videos';
			case 'playlist': return (title.includes('featured') || title.includes('appears')) ? 'appears_on' : 'playlists';
			case 'album': return (title.includes('single') || title.includes('ep')) ? 'singles' : 'albums';
			default: return 'unknown';
		}
	}

	function parse_artist(session: Innertube, artist: YTMusic.Artist, artist_id: string): YTMArtistResult {
		const header = reinterpret_cast<MusicHeaderLike | undefined>(artist.header);
		const result: YTMArtistResult = {
			artist: {
				browse_id: artist_id,
				name: header?.title?.text ?? '',
				thumbnails: header_thumbnails(header).map(t => ({ url: t.url, width: t.width, height: t.height })),
				subscribers: header?.subscribers?.text
			},
			top_tracks: [],
			albums: [],
			singles: [],
			videos: [],
			playlists: [],
			appears_on: [],
			similar_artists: [],
			albums_continuation: null,
			singles_continuation: null,
			tracks_continuation: null,
			similar_artists_continuation: null
		};
		for (const section of artist.sections ?? []) {
			if (section.is(YTNodes.MusicShelf)) {
				for (const item of section.as(YTNodes.MusicShelf).contents) result.top_tracks.push(Parser.parse_ytm_track(item));
				continue;
			}
			if (!section.is(YTNodes.MusicCarouselShelf)) continue;
			const carousel = section.as(YTNodes.MusicCarouselShelf);
			const title = (carousel.header?.title?.text ?? '').toLowerCase();
			const kind = carousel_kind(carousel, title);
			const more_endpoint = carousel.header?.more_content?.endpoint;
			for (const item of carousel.contents) {
				if (item.is(YTNodes.MusicResponsiveListItem)) { result.top_tracks.push(Parser.parse_ytm_track(item.as(YTNodes.MusicResponsiveListItem))); continue; }
				if (!item.is(YTNodes.MusicTwoRowItem)) continue;
				const two_row = item.as(YTNodes.MusicTwoRowItem);
				switch (kind) {
					case 'albums': result.albums.push(Parser.parse_ytm_two_row_album(two_row)); break;
					case 'singles': result.singles.push(Parser.parse_ytm_two_row_album(two_row)); break;
					case 'videos': result.videos.push(Parser.parse_ytm_two_row_video(two_row)); break;
					case 'playlists': result.playlists.push(Parser.parse_ytm_two_row_album(two_row)); break;
					case 'appears_on': result.appears_on.push(Parser.parse_ytm_two_row_album(two_row)); break;
					case 'similar': result.similar_artists.push(Parser.parse_ytm_two_row_artist(two_row)); break;
					default: break;
				}
			}
			if (kind === 'albums') result.albums_continuation = register_grid(session, more_endpoint, Parser.parse_ytm_two_row_album);
			else if (kind === 'singles') result.singles_continuation = register_grid(session, more_endpoint, Parser.parse_ytm_two_row_album);
			else if (kind === 'similar') result.similar_artists_continuation = register_grid(session, more_endpoint, Parser.parse_ytm_two_row_artist);
		}
		if (result.top_tracks.length > 0) result.tracks_continuation = register_more(() => fetch_songs(session, () => artist.getAllSongs()));
		return result;
	}

	export async function get_artist(opts: Opts, artist_id: string): PromiseResult<YTMArtistResult> {
		try {
			const session = await YouTubeSession.get(opts);
			const id = await YouTubeSession.resolve_channel_id(opts, artist_id);
			const artist = await session.music.getArtist(id);
			return parse_artist(session, artist, id);
		} catch (error) { return generror_catch(error, 'Failed to fetch YouTube Music artist', 'MEDIUM', { artist_id }); }
	}

	export async function new_releases_albums(opts: Opts): PromiseResult<YTMAlbum[]> {
		try {
			const explore = await (await YouTubeSession.get(opts)).music.getExplore();
			const albums: YTMAlbum[] = [];
			for (const section of explore.sections) {
				for (const item of section.contents) {
					if (item.is(YTNodes.MusicTwoRowItem)) albums.push(Parser.parse_ytm_two_row_album(item.as(YTNodes.MusicTwoRowItem)));
				}
			}
			return albums;
		} catch (error) { return generror_catch(error, 'Failed to fetch YouTube Music new releases', 'MEDIUM'); }
	}

	function parse_suggestion_item(item: YTNodes.MusicResponsiveListItem): YTMTrack | YTMAlbum | YTMArtist | undefined {
		switch (item.item_type) {
			case 'song':
			case 'video':
			case 'non_music_track':
				return Parser.parse_ytm_track(item);
			case 'album':
			case 'playlist':
				return Parser.parse_ytm_album(item);
			case 'artist':
			case 'library_artist':
				return Parser.parse_ytm_artist(item);
			default: return undefined;
		}
	}

	export async function search_suggestions(opts: Opts, search_query: string): Promise<(string | YTMTrack | YTMAlbum | YTMArtist)[]> {
		if (is_empty(search_query)) return [];
		try {
			const sections = await (await YouTubeSession.get(opts)).music.getSearchSuggestions(search_query);
			const suggestions: (string | YTMTrack | YTMAlbum | YTMArtist)[] = [];
			for (const section of sections) {
				for (const item of section.contents) {
					if (item.is(YTNodes.SearchSuggestion)) {
						suggestions.push(item.as(YTNodes.SearchSuggestion).suggestion.text ?? '');
					} else if (item.is(YTNodes.MusicResponsiveListItem)) {
						const parsed = parse_suggestion_item(item.as(YTNodes.MusicResponsiveListItem));
						if (parsed !== undefined) suggestions.push(parsed);
					}
				}
			}
			return suggestions;
		} catch { return []; }
	}

	export async function get_library(opts: Opts): PromiseResult<Page<YTMAlbum[]>> {
		try {
			const library = await (await YouTubeSession.get(opts)).music.getLibrary();
			const playlists: YTMAlbum[] = [];
			for (const section of library.contents ?? []) {
				for (const item of section.contents) {
					if (item.is(YTNodes.MusicResponsiveListItem)) playlists.push(Parser.parse_ytm_album(item.as(YTNodes.MusicResponsiveListItem)));
					else if (item.is(YTNodes.MusicTwoRowItem)) playlists.push(Parser.parse_ytm_two_row_album(item.as(YTNodes.MusicTwoRowItem)));
				}
			}
			return { data: playlists, continuation: null };
		} catch (error) { return generror_catch(error, 'Failed to fetch YouTube Music library', 'MEDIUM'); }
	}

	export async function get_history(opts: Opts): PromiseResult<YTMHistorySection[]> {
		try {
			const session = await YouTubeSession.get(opts);
			const response = await session.actions.execute('/browse', { browseId: 'FEmusic_history', client: 'YTMUSIC', parse: true });
			const shelves = response.contents_memo?.getType(YTNodes.MusicShelf) ?? [];
			return shelves.map(shelf => ({
				title: shelf.title?.text ?? '',
				tracks: shelf.contents.map(Parser.parse_ytm_track)
			}));
		} catch (error) { return generror_catch(error, 'Failed to fetch YouTube Music history', 'MEDIUM'); }
	}

	export async function get_watch_next(opts: Opts, video_id: string, automix = true): PromiseResult<Page<YTMTrack[]>> {
		try {
			const panel = await (await YouTubeSession.get(opts)).music.getUpNext(video_id, automix);
			const tracks: YTMTrack[] = [];
			for (const item of panel.contents ?? []) {
				if (item.is(YTNodes.PlaylistPanelVideo)) tracks.push(Parser.parse_ytm_panel_video(item.as(YTNodes.PlaylistPanelVideo)));
			}
			return { data: tracks, continuation: null };
		} catch (error) { return generror_catch(error, 'Failed to fetch YouTube Music watch next', 'MEDIUM', { video_id }); }
	}

	export async function get_lyrics(opts: Opts, video_id: string): PromiseResult<YTMLyrics> {
		try {
			const shelf = await (await YouTubeSession.get(opts)).music.getLyrics(video_id);
			const parsed = Parser.parse_ytm_description_lyrics(shelf);
			if (parsed === undefined) return generror('No lyrics found', 'LOW', { video_id });
			return parsed;
		} catch (error) { return generror_catch(error, 'Failed to fetch YouTube Music lyrics', 'MEDIUM', { video_id }); }
	}

	export async function get_related(opts: Opts, video_id: string): PromiseResult<YTMRelatedSection[]> {
		try {
			const related = await (await YouTubeSession.get(opts)).music.getRelated(video_id);
			if (!related.is(YTNodes.SectionList)) return [];
			const sections: YTMRelatedSection[] = [];
			for (const shelf of related.as(YTNodes.SectionList).contents) {
				if (shelf.is(YTNodes.MusicShelf)) {
					const music_shelf = shelf.as(YTNodes.MusicShelf);
					sections.push({ title: music_shelf.title?.text ?? '', tracks: music_shelf.contents.map(Parser.parse_ytm_track), playlists: [] });
				} else if (shelf.is(YTNodes.MusicCarouselShelf)) {
					const carousel = shelf.as(YTNodes.MusicCarouselShelf);
					const albums: YTMAlbum[] = [];
					for (const item of carousel.contents) {
						if (item.is(YTNodes.MusicTwoRowItem)) albums.push(Parser.parse_ytm_two_row_album(item.as(YTNodes.MusicTwoRowItem)));
					}
					sections.push({ title: carousel.header?.title?.text ?? '', tracks: [], playlists: albums });
				}
			}
			return sections;
		} catch (error) { return generror_catch(error, 'Failed to fetch YouTube Music related', 'MEDIUM', { video_id }); }
	}

	export async function like_track(opts: Opts, video_id: string): Promise<boolean> { return await YouTubeShared.like_track(opts, video_id); }
	export async function dislike_track(opts: Opts, video_id: string): Promise<boolean> { return await YouTubeShared.dislike_track(opts, video_id); }
	export async function unlike_track(opts: Opts, video_id: string): Promise<boolean> { return await YouTubeShared.remove_rating(opts, video_id); }

	export async function create_playlist(opts: Opts, title: string, _privacy: Privacy) {
		return await YouTubeShared.create_playlist(opts, title, 'YouTube Music');
	}
	export async function delete_playlist(opts: Opts, playlist_id: string): Promise<boolean> {
		return await YouTubeShared.delete_playlist(opts, playlist_urlid(playlist_id));
	}
	export async function add_tracks_to_playlist(opts: Opts, playlist_id: string, video_ids: string[]): Promise<boolean> {
		return await YouTubeShared.add_tracks_to_playlist(opts, playlist_urlid(playlist_id), video_ids);
	}
	export async function remove_tracks_to_playlist(opts: Opts, playlist_id: string, set_video_ids: string[]): Promise<boolean> {
		return await YouTubeShared.remove_tracks_from_playlist(opts, playlist_urlid(playlist_id), set_video_ids, true);
	}
	export async function edit_playlist_data(opts: Opts, playlist_id: string, playlist_data: { name: string; description: string; privacy: Privacy }): Promise<boolean> {
		return await YouTubeShared.edit_playlist_data(opts, playlist_urlid(playlist_id), playlist_data.name, playlist_data.description);
	}
}
