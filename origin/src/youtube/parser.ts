import { YTNodes } from 'youtubei.js';
import type { Misc, Helpers } from 'youtubei.js';
import { parse_time } from '@common/utils/parse_util';

type YTNode = Helpers.YTNode;

export interface YTThumbnail { url: string; width: number; height: number }
export interface YTNamed { name: string; channel_id?: string }
export interface YTTrack {
	video_id: string;
	title: string;
	artists: YTNamed[];
	duration_seconds?: number;
	views?: number;
	thumbnails: YTThumbnail[];
}
export interface YTCompactPlaylist {
	playlist_id: string;
	title: string;
	artists: YTNamed[];
	thumbnails: YTThumbnail[];
}
export interface YTChannelResult {
	channel_id: string;
	name: string;
	thumbnails: YTThumbnail[];
}
export interface YTPlaylistHeader {
	title: string;
	creator: YTNamed[];
	description?: string;
	thumbnails: YTThumbnail[];
}
export interface YTSearchResult {
	tracks: YTTrack[];
	playlists: YTCompactPlaylist[];
	artists: YTChannelResult[];
}
export interface YTPlaylistResult {
	header: YTPlaylistHeader;
	tracks: YTTrack[];
}
export interface YTLibraryPlaylist {
	playlist_id: string;
	title: string;
	thumbnails: YTThumbnail[];
}
export interface YTArtistResult {
	artist: YTChannelResult;
	tracks: YTTrack[];
	albums: YTCompactPlaylist[];
	playlists: YTCompactPlaylist[];
	similar_artists: YTChannelResult[];
	tracks_continuation: string | null;
	albums_continuation: string | null;
	playlists_continuation: string | null;
	similar_artists_continuation: string | null;
}

function thumbs(list?: Misc.Thumbnail[]): YTThumbnail[] {
	return (list ?? []).map(t => ({ url: t.url, width: t.width, height: t.height }));
}
function author_named(author?: Misc.Author): YTNamed {
	return { name: author?.name ?? '', channel_id: author?.id || undefined };
}
function text_of(text?: Misc.Text | string): string {
	if (text === undefined) return '';
	return typeof text === 'string' ? text : (text.text ?? '');
}
function seconds_of(duration?: { seconds?: number; text?: string } | Misc.Text): number | undefined {
	if (duration === undefined) return undefined;
	if ('seconds' in duration && typeof duration.seconds === 'number' && duration.seconds > 0) return duration.seconds;
	const text = text_of(duration as Misc.Text);
	const parsed = parse_time(text);
	return isNaN(parsed) ? undefined : parsed;
}

function views_number(text?: string): number | undefined {
	if (text === undefined || text === '') return undefined;
	const cleaned = text.replace(/\s*(views|view|plays|play)\s*$/i, '').replace(/,/g, '').trim();
	const value = parseFloat(cleaned);
	if (isNaN(value)) return undefined;
	switch (cleaned[cleaned.length - 1]) {
		case 'B': return value * 1_000_000_000;
		case 'M': return value * 1_000_000;
		case 'K': return value * 1_000;
		default: return value;
	}
}

export function parse_video(node: YTNodes.Video): YTTrack {
	return {
		video_id: node.video_id,
		title: text_of(node.title),
		artists: [author_named(node.author)],
		duration_seconds: seconds_of(node.length_text),
		views: views_number(text_of(node.short_view_count) || text_of(node.view_count)),
		thumbnails: thumbs(node.thumbnails)
	};
}

export function parse_playlist_video(node: YTNodes.PlaylistVideo): YTTrack {
	return {
		video_id: node.id,
		title: text_of(node.title),
		artists: [author_named(node.author)],
		duration_seconds: seconds_of(node.duration),
		views: views_number(text_of(node.video_info)),
		thumbnails: thumbs(node.thumbnails)
	};
}

export function parse_playlist_panel_video(node: YTNodes.PlaylistPanelVideo): YTTrack {
	return {
		video_id: node.video_id,
		title: text_of(node.title),
		artists: (node.artists?.length ?? 0) > 0
			? node.artists!.map(a => ({ name: a.name, channel_id: a.channel_id }))
			: [{ name: node.author ?? '' }],
		duration_seconds: seconds_of(node.duration),
		thumbnails: thumbs(node.thumbnail)
	};
}

function lockup_thumbnails(node: YTNodes.LockupView): YTThumbnail[] {
	const image = node.content_image;
	if (image?.is(YTNodes.ThumbnailView)) return thumbs(image.as(YTNodes.ThumbnailView).image);
	if (image?.is(YTNodes.CollectionThumbnailView)) return thumbs(image.as(YTNodes.CollectionThumbnailView).primary_thumbnail?.image);
	return [];
}
const LOCKUP_TYPE_LABELS = new Set(['playlist', 'album', 'single', 'ep', 'mix', 'podcast', 'course', 'show', 'video', 'short']);
function strip_type_label(name: string): string {
	const match = name.match(/^(.*?)\s+·\s+([^·]+)$/);
	return match !== null && LOCKUP_TYPE_LABELS.has(match[2].trim().toLowerCase()) ? match[1] : name;
}
function lockup_artist(node: YTNodes.LockupView, owner?: YTNamed): YTNamed {
	const parts = (node.metadata?.metadata?.metadata_rows?.[0]?.metadata_parts ?? []).flatMap(part => {
		const text = part.text;
		if (text === null || text === undefined) return [];
		const run = text.runs?.[0];
		const endpoint = text.endpoint ?? (run !== undefined && 'endpoint' in run ? run.endpoint : undefined);
		const browse_id = (endpoint?.payload as { browseId?: string } | undefined)?.browseId;
		return [{ name: text.text ?? '', channel_id: browse_id?.startsWith('UC') ? browse_id : undefined }];
	});
	const is_label = (name: string) => LOCKUP_TYPE_LABELS.has(name.trim().toLowerCase());
	const linked = parts.find(part => part.channel_id !== undefined && !is_label(part.name));
	if (linked !== undefined) return linked;
	if (owner !== undefined) return { name: owner.name, channel_id: parts.find(part => part.channel_id !== undefined)?.channel_id ?? owner.channel_id };
	const first = parts[0];
	if (first === undefined || is_label(first.name)) return { name: '' };
	return first;
}

function lockup_track(node: YTNodes.LockupView, owner?: YTNamed): YTTrack {
	return {
		video_id: node.content_id,
		title: text_of(node.metadata?.title),
		artists: [lockup_artist(node, owner)],
		thumbnails: lockup_thumbnails(node)
	};
}
function lockup_playlist(node: YTNodes.LockupView, owner?: YTNamed): YTCompactPlaylist {
	return {
		playlist_id: node.content_id,
		title: text_of(node.metadata?.title),
		artists: [lockup_artist(node, owner)],
		thumbnails: lockup_thumbnails(node)
	};
}
export function parse_lockup_track(node: YTNodes.LockupView): YTTrack {
	return lockup_track(node);
}
export function parse_lockup_playlist(node: YTNodes.LockupView): YTCompactPlaylist {
	return lockup_playlist(node);
}

export function parse_grid_playlist(node: YTNodes.GridPlaylist): YTCompactPlaylist {
	return {
		playlist_id: node.id,
		title: text_of(node.title),
		artists: [author_named(node.author)],
		thumbnails: thumbs(node.thumbnails)
	};
}

export function parse_playlist_renderer(node: YTNodes.Playlist): YTCompactPlaylist {
	return {
		playlist_id: node.id,
		title: text_of(node.title),
		artists: ['name' in node.author ? { ...author_named(node.author), name: strip_type_label(node.author.name) } : { name: strip_type_label(text_of(node.author)) }],
		thumbnails: thumbs(node.thumbnails)
	};
}

export function parse_channel(node: YTNodes.Channel): YTChannelResult {
	return {
		channel_id: node.id,
		name: node.author?.name ?? text_of(node.long_byline),
		thumbnails: thumbs(node.author?.thumbnails)
	};
}

function is_playlist_content(node: YTNodes.LockupView): boolean {
	return node.content_type === 'PLAYLIST' || node.content_type === 'ALBUM' || node.content_type === 'SHOW' || node.content_type === 'PODCAST';
}

function track_node(node: YTNode, owner?: YTNamed): YTTrack | undefined {
	if (node.is(YTNodes.Video)) return parse_video(node.as(YTNodes.Video));
	if (node.is(YTNodes.PlaylistVideo)) return parse_playlist_video(node.as(YTNodes.PlaylistVideo));
	if (node.is(YTNodes.PlaylistPanelVideo)) return parse_playlist_panel_video(node.as(YTNodes.PlaylistPanelVideo));
	if (node.is(YTNodes.LockupView) && !is_playlist_content(node.as(YTNodes.LockupView))) return lockup_track(node.as(YTNodes.LockupView), owner);
	return undefined;
}
function playlist_node(node: YTNode, owner?: YTNamed): YTCompactPlaylist | undefined {
	if (node.is(YTNodes.GridPlaylist)) return parse_grid_playlist(node.as(YTNodes.GridPlaylist));
	if (node.is(YTNodes.Playlist)) return parse_playlist_renderer(node.as(YTNodes.Playlist));
	if (node.is(YTNodes.LockupView) && is_playlist_content(node.as(YTNodes.LockupView))) return lockup_playlist(node.as(YTNodes.LockupView), owner);
	return undefined;
}
export function parse_track_node(node: YTNode): YTTrack | undefined {
	return track_node(node);
}
export function parse_playlist_node(node: YTNode): YTCompactPlaylist | undefined {
	return playlist_node(node);
}
export function channel_track_parser(owner: YTNamed): (node: YTNode) => YTTrack | undefined {
	return node => track_node(node, owner);
}
export function channel_playlist_parser(owner: YTNamed): (node: YTNode) => YTCompactPlaylist | undefined {
	return node => playlist_node(node, owner);
}

export type YTMAlbumType = 'ALBUM' | 'SINGLE' | 'EP' | 'SONG' | 'PLAYLIST';
export interface YTMArtistRef { name: string; browse_id?: string }
export interface YTMTrack {
	video_id?: string;
	playlist_set_video_id?: string;
	title: string;
	artists: YTMArtistRef[];
	album?: YTMArtistRef;
	duration_seconds?: number;
	views?: number;
	explicit: boolean;
	thumbnails: YTThumbnail[];
}
export interface YTMAlbum {
	browse_id?: string;
	title: string;
	artists: YTMArtistRef[];
	thumbnails: YTThumbnail[];
	explicit: boolean;
	year?: string;
	album_type: YTMAlbumType;
}
export interface YTMArtist {
	browse_id?: string;
	name: string;
	thumbnails: YTThumbnail[];
	subscribers?: string;
}
export interface YTMPlaylistHeader {
	title: string;
	artists: YTMArtistRef[];
	description?: string;
	thumbnails: YTThumbnail[];
}
export interface YTMTopResult { type: 'TRACK' | 'ALBUM' | 'ARTIST'; track?: YTMTrack; album?: YTMAlbum; artist?: YTMArtist }
export interface YTMSearchResult {
	top_result?: YTMTopResult;
	tracks: YTMTrack[];
	albums: YTMAlbum[];
	playlists: YTMAlbum[];
	artists: YTMArtist[];
}
export interface YTMPlaylistResult { header: YTMPlaylistHeader; tracks: YTMTrack[] }
export interface YTMArtistResult {
	artist: YTMArtist;
	top_tracks: YTMTrack[];
	albums: YTMAlbum[];
	singles: YTMAlbum[];
	videos: YTMTrack[];
	playlists: YTMAlbum[];
	appears_on: YTMAlbum[];
	similar_artists: YTMArtist[];
	albums_continuation: string | null;
	singles_continuation: string | null;
	playlists_continuation: string | null;
	tracks_continuation: string | null;
	similar_artists_continuation: string | null;
}
export interface YTMRelatedSection { title: string; tracks: YTMTrack[]; playlists: YTMAlbum[] }
export interface YTMHistorySection { title: string; tracks: YTMTrack[] }
export interface YTMLyrics { lyrics: string; source?: string }

function music_thumbs(thumbnail?: YTNodes.MusicThumbnail | null): YTThumbnail[] {
	return thumbs(thumbnail?.contents);
}
function has_explicit(badges?: YTNode[]): boolean {
	return (badges ?? []).some(b => b.is(YTNodes.MusicInlineBadge) && b.as(YTNodes.MusicInlineBadge).icon_type === 'MUSIC_EXPLICIT_BADGE');
}
function artist_refs(artists?: { name: string; channel_id?: string }[]): YTMArtistRef[] {
	return (artists ?? []).map(a => ({ name: a.name, browse_id: a.channel_id || undefined }));
}
function album_type_of(item_type?: string): YTMAlbumType {
	switch ((item_type ?? '').toLowerCase()) {
		case 'single': return 'SINGLE';
		case 'ep': return 'EP';
		case 'song': return 'SONG';
		case 'playlist': return 'PLAYLIST';
		default: return 'ALBUM';
	}
}

function run_browse_id(run: Misc.TextRun | Misc.EmojiRun): string | undefined {
	return 'endpoint' in run ? (run.endpoint?.payload as { browseId?: string } | undefined)?.browseId : undefined;
}
const ITEM_TYPE_LABELS = new Set(['song', 'video', 'episode', 'podcast', 'album', 'single', 'ep', 'playlist', 'artist', 'profile', 'station', 'audiobook']);
interface CreditPart { text: string; browse_id?: string }

function is_type_label(text: string) {
	return ITEM_TYPE_LABELS.has(text.trim().toLowerCase());
}
function is_credit_metadata(text: string) {
	return /^(\d{4}|[\d.,]+[KMB]?\s*(plays?|views?|subscribers?|monthly audience|songs?|tracks?|episodes?|videos?)|\d+:\d{2}(:\d{2})?|\d+\s*(min|hr|sec)\b.*|(jan(uary)?|feb(ruary)?|mar(ch)?|apr(il)?|may|june?|july?|aug(ust)?|sep(t(ember)?)?|oct(ober)?|nov(ember)?|dec(ember)?) \d{1,2}(, \d{4})?|\d+ (seconds?|minutes?|hours?|days?|weeks?|months?|years?) ago)$/i.test(text.trim());
}
function is_artist_browse_id(browse_id: string) {
	return browse_id.startsWith('UC') || browse_id.startsWith('MPAD') || browse_id.startsWith('FEmusic_library_privately_owned_artist');
}
function credit_segments(runs: (Misc.TextRun | Misc.EmojiRun)[]): CreditPart[][] {
	const segments: CreditPart[][] = [[]];
	for (const run of runs) {
		const browse_id = run_browse_id(run);
		if (browse_id !== undefined) {
			segments[segments.length - 1].push({ text: run.text, browse_id });
			continue;
		}
		run.text.split('•').forEach((text, i) => {
			if (i > 0) segments.push([]);
			if (text.trim() !== '') segments[segments.length - 1].push({ text });
		});
	}
	return segments.filter(segment => segment.length > 0);
}
function segment_credits(segment: CreditPart[]): YTMArtistRef[] {
	return segment.flatMap(part => part.browse_id !== undefined
		? [{ name: part.text, browse_id: part.browse_id }]
		: part.text.split(/,|&/).map(name => name.trim()).filter(name => name !== '').map(name => ({ name })));
}
function runs_artist_refs(runs: (Misc.TextRun | Misc.EmojiRun)[] | undefined): YTMArtistRef[] {
	const segments = credit_segments(runs ?? []);
	const linked = segments.find(segment => segment.some(part => part.browse_id !== undefined && is_artist_browse_id(part.browse_id)));
	if (linked !== undefined) return segment_credits(linked);
	const label = segments.findIndex(segment => segment.length === 1 && is_type_label(segment[0].text));
	const after_label = label === -1 ? undefined : segments[label + 1];
	if (after_label === undefined || after_label.some(part => part.browse_id !== undefined || is_credit_metadata(part.text))) return [];
	return segment_credits(after_label);
}
function credited_artists(credit_texts: (Misc.Text | undefined)[], fallback: YTMArtistRef[]): YTMArtistRef[] {
	const cleaned = fallback.filter(ref => ref.browse_id !== undefined || !is_type_label(ref.name));
	for (const text of credit_texts) {
		const refs = runs_artist_refs(text?.runs);
		if (refs.length > 0) return refs.length >= cleaned.length ? refs : cleaned;
	}
	return cleaned;
}
function column_artist_refs(item: YTNodes.MusicResponsiveListItem, fallback: YTMArtistRef[]): YTMArtistRef[] {
	return credited_artists(item.flex_columns.slice(1).map(column => column.title), fallback);
}

function column_views(item: YTNodes.MusicResponsiveListItem): string | undefined {
	for (const column of item.flex_columns) {
		const text = column.title.toString().split('•').at(-1)?.trim() ?? '';
		if (/^[\d.,]+[KMB]?\s*(plays?|views?)$/i.test(text)) return text;
	}
	return undefined;
}

function column_album(item: YTNodes.MusicResponsiveListItem): YTMArtistRef | undefined {
	for (const column of item.flex_columns) {
		const run = column.title.runs?.find(run => run_browse_id(run)?.startsWith('MPRE'));
		if (run !== undefined) return { name: run.text, browse_id: run_browse_id(run) };
	}
	return undefined;
}

export function parse_ytm_track(item: YTNodes.MusicResponsiveListItem): YTMTrack {
	return {
		video_id: item.id,
		title: item.title ?? '',
		artists: column_artist_refs(item, artist_refs(item.artists ?? item.authors ?? (item.author ? [item.author] : []))),
		album: item.album ? { name: item.album.name, browse_id: item.album.id } : column_album(item),
		duration_seconds: item.duration?.seconds,
		views: views_number(item.views ?? column_views(item)),
		explicit: has_explicit(item.badges),
		thumbnails: thumbs(item.thumbnails)
	};
}
export function parse_ytm_album(item: YTNodes.MusicResponsiveListItem): YTMAlbum {
	return {
		browse_id: item.id,
		title: item.title ?? '',
		artists: column_artist_refs(item, artist_refs(item.artists ?? item.authors ?? (item.author ? [item.author] : []))),
		thumbnails: thumbs(item.thumbnails),
		explicit: has_explicit(item.badges),
		year: item.year,
		album_type: album_type_of(item.item_type)
	};
}
export function parse_ytm_artist(item: YTNodes.MusicResponsiveListItem): YTMArtist {
	return {
		browse_id: item.id,
		name: item.name ?? item.title ?? '',
		thumbnails: thumbs(item.thumbnails),
		subscribers: item.subscribers
	};
}
export function parse_ytm_two_row_album(item: YTNodes.MusicTwoRowItem): YTMAlbum {
	return {
		browse_id: item.id ?? (item.endpoint?.payload)?.browseId,
		title: text_of(item.title),
		artists: credited_artists([item.subtitle], artist_refs(item.artists ?? (item.author ? [item.author] : []))),
		thumbnails: thumbs(item.thumbnail),
		explicit: has_explicit(item.badges?.array?.() ?? undefined),
		year: item.year,
		album_type: album_type_of(item.item_type)
	};
}
export function parse_ytm_two_row_video(item: YTNodes.MusicTwoRowItem): YTMTrack {
	return {
		video_id: (item.endpoint?.payload)?.videoId ?? item.id,
		title: text_of(item.title),
		artists: credited_artists([item.subtitle], artist_refs(item.artists ?? (item.author ? [item.author] : []))),
		views: views_number(item.views),
		explicit: has_explicit(item.badges?.array?.() ?? undefined),
		thumbnails: thumbs(item.thumbnail)
	};
}
export function parse_ytm_two_row_artist(item: YTNodes.MusicTwoRowItem): YTMArtist {
	return {
		browse_id: item.id ?? (item.endpoint?.payload)?.browseId,
		name: text_of(item.title),
		thumbnails: thumbs(item.thumbnail),
		subscribers: item.subscribers
	};
}
export function parse_ytm_panel_video(item: YTNodes.PlaylistPanelVideo): YTMTrack {
	return {
		video_id: item.video_id,
		playlist_set_video_id: item.set_video_id,
		title: text_of(item.title),
		artists: (item.artists?.length ?? 0) > 0 ? item.artists!.map(a => ({ name: a.name, browse_id: a.channel_id })) : [{ name: item.author ?? '' }],
		album: item.album ? { name: item.album.name, browse_id: item.album.id } : undefined,
		duration_seconds: item.duration?.seconds,
		explicit: has_explicit(item.badges),
		thumbnails: thumbs(item.thumbnail)
	};
}

function subtitle_artist_refs(subtitle?: Misc.Text): YTMArtistRef[] {
	return (subtitle?.runs ?? [])
		.map((run) => {
			const endpoint = 'endpoint' in run ? run.endpoint : undefined;
			const browse_id = (endpoint?.payload as { browseId?: string } | undefined)?.browseId;
			return { name: run.text, browse_id };
		})
		.filter(ref => ref.browse_id !== undefined && (ref.browse_id.startsWith('UC') || ref.browse_id.startsWith('MPAD')));
}

function subtitle_duration(subtitle?: Misc.Text): number | undefined {
	const text = text_of(subtitle).split('•').map(part => part.trim()).findLast(part => /^\d+(:\d{2})+$/.test(part));
	return text === undefined ? undefined : seconds_of({ text });
}

export function parse_ytm_card_top_result(card: YTNodes.MusicCardShelf): YTMTopResult | undefined {
	const type_label = (card.subtitle?.runs?.[0]?.text ?? card.subtitle?.text ?? '').trim();
	const payload = card.on_tap?.payload as { browseId?: string; videoId?: string } | undefined;
	if (type_label === 'Artist') {
		return { type: 'ARTIST', artist: { browse_id: payload?.browseId, name: text_of(card.title), thumbnails: music_thumbs(card.thumbnail) } };
	}
	if (type_label === 'Album' || type_label === 'EP' || type_label === 'Single') {
		return { type: 'ALBUM', album: { browse_id: payload?.browseId, title: text_of(card.title), artists: subtitle_artist_refs(card.subtitle), thumbnails: music_thumbs(card.thumbnail), explicit: has_explicit(card.subtitle_badges), album_type: album_type_of(type_label) } };
	}
	if (type_label === 'Playlist') return undefined;
	const title_run = card.title?.runs?.[0];
	const run_endpoint = title_run !== undefined && 'endpoint' in title_run ? title_run.endpoint : undefined;
	const video_id = payload?.videoId ?? (run_endpoint?.payload as { videoId?: string } | undefined)?.videoId;
	if (video_id === undefined) return undefined;
	return { type: 'TRACK', track: { video_id, title: text_of(card.title), artists: subtitle_artist_refs(card.subtitle), duration_seconds: subtitle_duration(card.subtitle), explicit: has_explicit(card.subtitle_badges), thumbnails: music_thumbs(card.thumbnail) } };
}

export function parse_ytm_description_lyrics(shelf?: YTNodes.MusicDescriptionShelf): YTMLyrics | undefined {
	if (shelf === undefined) return undefined;
	return { lyrics: text_of(shelf.description), source: text_of(shelf.footer) || undefined };
}
