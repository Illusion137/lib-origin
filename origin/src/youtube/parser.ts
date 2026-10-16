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
function lockup_subtitle(node: YTNodes.LockupView): string {
	const rows = (node.metadata?.metadata as any)?.metadata_rows;
	return rows?.[0]?.metadata_parts?.[0]?.text?.text ?? '';
}
function lockup_subtitle_endpoint(node: YTNodes.LockupView): string | undefined {
	const parts = (node.metadata?.metadata as any)?.metadata_rows?.[0]?.metadata_parts;
	for (const part of parts ?? []) {
		const browse_id = part?.text?.endpoint?.payload?.browseId ?? part?.text?.runs?.[0]?.endpoint?.payload?.browseId;
		if (browse_id) return browse_id;
	}
	return undefined;
}

export function parse_lockup_track(node: YTNodes.LockupView): YTTrack {
	return {
		video_id: node.content_id,
		title: text_of(node.metadata?.title),
		artists: [{ name: lockup_subtitle(node), channel_id: lockup_subtitle_endpoint(node) }],
		thumbnails: lockup_thumbnails(node)
	};
}
export function parse_lockup_playlist(node: YTNodes.LockupView): YTCompactPlaylist {
	return {
		playlist_id: node.content_id,
		title: text_of(node.metadata?.title),
		artists: [{ name: lockup_subtitle(node), channel_id: lockup_subtitle_endpoint(node) }],
		thumbnails: lockup_thumbnails(node)
	};
}

export function parse_grid_playlist(node: YTNodes.GridPlaylist): YTCompactPlaylist {
	return {
		playlist_id: node.id,
		title: text_of(node.title),
		artists: [author_named(node.author)],
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

export function parse_track_node(node: YTNode): YTTrack | undefined {
	if (node.is(YTNodes.Video)) return parse_video(node.as(YTNodes.Video));
	if (node.is(YTNodes.PlaylistVideo)) return parse_playlist_video(node.as(YTNodes.PlaylistVideo));
	if (node.is(YTNodes.PlaylistPanelVideo)) return parse_playlist_panel_video(node.as(YTNodes.PlaylistPanelVideo));
	if (node.is(YTNodes.LockupView) && !is_playlist_content(node.as(YTNodes.LockupView))) return parse_lockup_track(node.as(YTNodes.LockupView));
	return undefined;
}

export function parse_playlist_node(node: YTNode): YTCompactPlaylist | undefined {
	if (node.is(YTNodes.GridPlaylist)) return parse_grid_playlist(node.as(YTNodes.GridPlaylist));
	if (node.is(YTNodes.LockupView) && is_playlist_content(node.as(YTNodes.LockupView))) return parse_lockup_playlist(node.as(YTNodes.LockupView));
	return undefined;
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
	similar_artists: YTMArtist[];
}
export interface YTMRelatedSection { title: string; tracks: YTMTrack[]; playlists: YTMAlbum[] }
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

export function parse_ytm_track(item: YTNodes.MusicResponsiveListItem): YTMTrack {
	return {
		video_id: item.id,
		title: item.title ?? '',
		artists: artist_refs(item.artists),
		album: item.album ? { name: item.album.name, browse_id: item.album.id } : undefined,
		duration_seconds: item.duration?.seconds,
		views: views_number(item.views),
		explicit: has_explicit(item.badges),
		thumbnails: thumbs(item.thumbnails)
	};
}
export function parse_ytm_album(item: YTNodes.MusicResponsiveListItem): YTMAlbum {
	return {
		browse_id: item.id,
		title: item.title ?? '',
		artists: artist_refs(item.artists ?? item.authors ?? (item.author ? [item.author] : [])),
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
		artists: artist_refs(item.artists ?? (item.author ? [item.author] : [])),
		thumbnails: thumbs(item.thumbnail),
		explicit: has_explicit(item.badges?.array?.() ?? undefined),
		year: item.year,
		album_type: album_type_of(item.item_type)
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
		.map(run => ({ run, browse_id: ((run as any).endpoint?.payload)?.browseId as string | undefined }))
		.filter(entry => entry.browse_id !== undefined && (entry.browse_id.startsWith('UC') || entry.browse_id.startsWith('MPAD')))
		.map(entry => ({ name: entry.run.text, browse_id: entry.browse_id }));
}

export function parse_ytm_card_top_result(card: YTNodes.MusicCardShelf): YTMTopResult | undefined {
	const type_label = (card.subtitle?.runs?.[0]?.text ?? card.subtitle?.text ?? '').trim();
	const payload = card.on_tap?.payload;
	if (type_label === 'Artist') {
		return { type: 'ARTIST', artist: { browse_id: payload?.browseId, name: text_of(card.title), thumbnails: music_thumbs(card.thumbnail) } };
	}
	if (type_label === 'Album' || type_label === 'EP' || type_label === 'Single') {
		return { type: 'ALBUM', album: { browse_id: payload?.browseId, title: text_of(card.title), artists: subtitle_artist_refs(card.subtitle), thumbnails: music_thumbs(card.thumbnail), explicit: has_explicit(card.subtitle_badges), album_type: album_type_of(type_label) } };
	}
	if (type_label === 'Playlist') return undefined;
	const video_id = payload?.videoId ?? (card.title?.runs?.[0] as any)?.endpoint?.payload?.videoId;
	if (video_id === undefined) return undefined;
	return { type: 'TRACK', track: { video_id, title: text_of(card.title), artists: subtitle_artist_refs(card.subtitle), duration_seconds: undefined, explicit: has_explicit(card.subtitle_badges), thumbnails: music_thumbs(card.thumbnail) } };
}

export function parse_ytm_description_lyrics(shelf?: YTNodes.MusicDescriptionShelf): YTMLyrics | undefined {
	if (shelf === undefined) return undefined;
	return { lyrics: text_of(shelf.description), source: text_of(shelf.footer) || undefined };
}
