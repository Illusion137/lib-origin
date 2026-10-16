import * as Parser from '@origin/youtube/parser';
import type { YTMAlbum, YTMArtist, YTMArtistResult, YTMHistorySection, YTMLyrics, YTMPlaylistResult, YTMRelatedSection, YTMSearchResult, YTMTrack } from '@origin/youtube/parser';
import { YouTubeSession } from '@origin/youtube/session';
import type { PromiseResult } from '@common/types';
import { gen_uuid, is_empty, milliseconds_of, urlid } from '@common/utils/util';
import { generror, generror_catch } from '@common/utils/error_util';
import { YTNodes } from 'youtubei.js';
import type { YTMusic, Helpers } from 'youtubei.js';

type YTNode = Helpers.YTNode;

export namespace YouTubeMusic {
	type Opts = YouTubeSession.Opts;
	type Privacy = 'PUBLIC' | 'UNLISTED' | 'PRIVATE';

	export interface Page<T> { data: T; continuation: string | null }

	interface CachedContinuation { next: () => Promise<Page<unknown>>; created_at: number }
	const continuations = new Map<string, CachedContinuation>();
	const CONTINUATION_TTL_MS = milliseconds_of({ minutes: 30 });

	function prune_continuations() {
		const now = Date.now();
		for (const [id, entry] of continuations) {
			if (now - entry.created_at > CONTINUATION_TTL_MS) continuations.delete(id);
		}
	}

	function register_continuation<F extends { has_continuation?: boolean; getContinuation: () => Promise<F> }, T>(feed: F, parse: (feed: F) => T): string | null {
		if (!('has_continuation' in feed) || feed.has_continuation !== true) return null;
		prune_continuations();
		const id = gen_uuid();
		continuations.set(id, { created_at: Date.now(), next: async () => make_page(await feed.getContinuation(), parse) });
		return id;
	}

	function make_page<F extends { has_continuation?: boolean; getContinuation: () => Promise<F> }, T>(feed: F, parse: (feed: F) => T): Page<T> {
		return { data: parse(feed), continuation: register_continuation(feed, parse) };
	}

	export async function get_continuation(_opts: Opts, continuation_id: string): PromiseResult<Page<unknown>> {
		const entry = continuations.get(continuation_id);
		if (entry === undefined) return generror('Unknown or expired YouTube Music continuation', 'LOW', { continuation_id });
		continuations.delete(continuation_id);
		try {
			return await entry.next();
		} catch (error) { return generror_catch(error, 'Failed to fetch YouTube Music continuation', 'MEDIUM', { continuation_id }); }
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

	function playlist_header(header: YTNode | undefined): YTMPlaylistResult['header'] {
		const h = header as any;
		const strapline = h?.strapline_text_one;
		const artists = strapline?.text ? [{ name: strapline.text as string, browse_id: (strapline.endpoint?.payload)?.browseId }] : (h?.author ? [{ name: h.author.name as string, browse_id: h.author.channel_id }] : []);
		const thumbnails = h?.thumbnail?.contents ?? h?.thumbnails ?? [];
		return {
			title: h?.title?.text ?? '',
			artists,
			description: h?.description?.description?.text ?? h?.description?.text,
			thumbnails: thumbnails.map((t: any) => ({ url: t.url, width: t.width, height: t.height }))
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

	function parse_artist(artist: YTMusic.Artist, artist_id: string): YTMArtistResult {
		const header = artist.header as any;
		const result: YTMArtistResult = {
			artist: {
				browse_id: artist_id,
				name: header?.title?.text ?? '',
				thumbnails: (header?.thumbnail?.contents ?? header?.thumbnails ?? []).map((t: any) => ({ url: t.url, width: t.width, height: t.height })),
				subscribers: header?.subscribers?.text
			},
			top_tracks: [],
			albums: [],
			singles: [],
			similar_artists: []
		};
		for (const section of artist.sections ?? []) {
			if (section.is(YTNodes.MusicShelf)) {
				for (const item of section.as(YTNodes.MusicShelf).contents) result.top_tracks.push(Parser.parse_ytm_track(item));
			} else if (section.is(YTNodes.MusicCarouselShelf)) {
				const carousel = section.as(YTNodes.MusicCarouselShelf);
				const title = (carousel.header?.title?.text ?? '').toLowerCase();
				for (const item of carousel.contents) {
					if (item.is(YTNodes.MusicTwoRowItem)) {
						const two_row = item.as(YTNodes.MusicTwoRowItem);
						if (title.includes('single')) result.singles.push(Parser.parse_ytm_two_row_album(two_row));
						else if (title.includes('album')) result.albums.push(Parser.parse_ytm_two_row_album(two_row));
						else if (two_row.item_type === 'artist' || title.includes('like') || title.includes('similar') || title.includes('fans')) result.similar_artists.push(Parser.parse_ytm_two_row_artist(two_row));
						else result.albums.push(Parser.parse_ytm_two_row_album(two_row));
					} else if (item.is(YTNodes.MusicResponsiveListItem)) {
						result.top_tracks.push(Parser.parse_ytm_track(item.as(YTNodes.MusicResponsiveListItem)));
					}
				}
			}
		}
		return result;
	}

	export async function get_artist(opts: Opts, artist_id: string): PromiseResult<YTMArtistResult> {
		try {
			const session = await YouTubeSession.get(opts);
			const id = await YouTubeSession.resolve_channel_id(opts, artist_id);
			const artist = await session.music.getArtist(id);
			return parse_artist(artist, id);
		} catch (error) { return generror_catch(error, 'Failed to fetch YouTube Music artist', 'MEDIUM', { artist_id }); }
	}

	export async function new_releases_albums(opts: Opts): PromiseResult<YTMAlbum[]> {
		try {
			const explore = await (await YouTubeSession.get(opts)).music.getExplore();
			const albums: YTMAlbum[] = [];
			for (const section of (explore as any).sections ?? []) {
				if (section.is?.(YTNodes.MusicCarouselShelf)) {
					for (const item of section.as(YTNodes.MusicCarouselShelf).contents) {
						if (item.is(YTNodes.MusicTwoRowItem)) albums.push(Parser.parse_ytm_two_row_album(item.as(YTNodes.MusicTwoRowItem)));
					}
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
			for (const section of (library as any).contents ?? []) {
				const items = section?.contents ?? (section?.is?.(YTNodes.MusicShelf) ? section.as(YTNodes.MusicShelf).contents : []);
				for (const item of items ?? []) {
					if (item?.is?.(YTNodes.MusicResponsiveListItem)) playlists.push(Parser.parse_ytm_album(item.as(YTNodes.MusicResponsiveListItem)));
					else if (item?.is?.(YTNodes.MusicTwoRowItem)) playlists.push(Parser.parse_ytm_two_row_album(item.as(YTNodes.MusicTwoRowItem)));
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

	export async function like_track(opts: Opts, video_id: string): Promise<boolean> {
		try { return (await (await YouTubeSession.get(opts)).interact.like(video_id)).success; } catch { return false; }
	}
	export async function dislike_track(opts: Opts, video_id: string): Promise<boolean> {
		try { return (await (await YouTubeSession.get(opts)).interact.dislike(video_id)).success; } catch { return false; }
	}
	export async function unlike_track(opts: Opts, video_id: string): Promise<boolean> {
		try { return (await (await YouTubeSession.get(opts)).interact.removeRating(video_id)).success; } catch { return false; }
	}

	export async function create_playlist(opts: Opts, title: string, _privacy: Privacy) {
		try {
			const created = await (await YouTubeSession.get(opts)).playlist.create(title, []);
			if (!created.success) return generror('Failed to create YouTube Music playlist', 'LOW', { title });
			return { playlistId: created.playlist_id };
		} catch (error) { return generror_catch(error, 'Failed to create YouTube Music playlist', 'MEDIUM', { title }); }
	}
	export async function delete_playlist(opts: Opts, playlist_id: string): Promise<boolean> {
		try { return (await (await YouTubeSession.get(opts)).playlist.delete(playlist_urlid(playlist_id))).success; } catch { return false; }
	}
	export async function add_tracks_to_playlist(opts: Opts, playlist_id: string, video_ids: string[]): Promise<boolean> {
		try { await (await YouTubeSession.get(opts)).playlist.addVideos(playlist_urlid(playlist_id), video_ids); return true; } catch { return false; }
	}
	export async function remove_tracks_to_playlist(opts: Opts, playlist_id: string, set_video_ids: string[]): Promise<boolean> {
		try { await (await YouTubeSession.get(opts)).playlist.removeVideos(playlist_urlid(playlist_id), set_video_ids, true); return true; } catch { return false; }
	}
	export async function edit_playlist_data(opts: Opts, playlist_id: string, playlist_data: { name: string; description: string; privacy: Privacy }): Promise<boolean> {
		try {
			const session = await YouTubeSession.get(opts);
			const id = playlist_urlid(playlist_id);
			await session.playlist.setName(id, playlist_data.name);
			await session.playlist.setDescription(id, playlist_data.description);
			return true;
		} catch { return false; }
	}
}
