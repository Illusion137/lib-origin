import type { ITunesExplicitness } from '@origin/illusi/types';
import type { ExplicitMode, ISOString, NamedUUID, Track, TrackMetaData } from '@illusive/types';
import type { SnapshotNamed, SnapshotThumbnail, TrackSnapshot, UserTrackInsert, UserTrackRow } from '@illusive/db/schema';
import { TrackAnalysis } from '@illusive/track_analysis';
import { album_id_for, artist_id_for } from './keys';

const EPOCH = new Date(0).toISOString() as ISOString;

export const TRACK_SERVICE_ID_FIELDS = [
	'youtube_id', 'spotify_id', 'soundcloud_id', 'soundcloud_permalink', 'amazonmusic_id', 'applemusic_id',
	'bandlab_id', 'audiomack_id', 'deezer_id', 'pandora_id', 'tidal_id'
] as const satisfies readonly (keyof Track)[];

const META_COLUMNS = new Set<keyof TrackMetaData>(['plays', 'added_date', 'last_played_date', 'begdur', 'enddur']);

export function empty_snapshot(): TrackSnapshot {
	return {
		title: '', artists: [], album: null, duration_ms: null, explicit: null, imported: false, service_ids: {}, thumbnails: [], analysis: null,
		alt_title: '', prods: [], unreleased: false, views: 0, imported_id: '', meta_extra: {}
	};
}

export function unavailable_service(track: Pick<Track, 'youtube_id' | 'soundcloud_permalink' | 'bandlab_id' | 'audiomack_id'>): 'youtube' | 'soundcloud' | 'bandlab' | 'audiomack' | null {
	if (track.youtube_id) return 'youtube';
	if (track.soundcloud_permalink) return 'soundcloud';
	if (track.bandlab_id) return 'bandlab';
	if (track.audiomack_id) return 'audiomack';
	return null;
}

export function explicit_to_bool(explicit: ExplicitMode | undefined): boolean | null {
	if (explicit === 'EXPLICIT') return true;
	if (explicit === 'CLEAN') return false;
	return null;
}
export function itunes_explicit(explicitness: ITunesExplicitness | null | undefined): boolean | null {
	if (explicitness === 'explicit') return true;
	if (explicitness === 'cleaned' || explicitness === 'notExplicit') return false;
	return null;
}
export function bool_to_explicit(explicit: boolean | null | undefined): ExplicitMode {
	if (explicit === true) return 'EXPLICIT';
	if (explicit === false) return 'CLEAN';
	return 'NONE';
}

function time_of(iso: string | undefined, fallback: number): number {
	if (iso === undefined || iso === '') return fallback;
	const time = new Date(iso).getTime();
	return Number.isFinite(time) ? time : fallback;
}
function iso_of(time: number | null | undefined): ISOString {
	return (time === null || time === undefined ? EPOCH : new Date(time).toISOString()) as ISOString;
}

export function named_of(entry: SnapshotNamed): NamedUUID {
	if (entry.uri) return { name: entry.name, uri: entry.uri as NamedUUID['uri'] & string };
	if (entry.uuid) return { name: entry.name, uuid: entry.uuid };
	return { name: entry.name, uri: null };
}

export function valid_artists(track: Track): NamedUUID[] {
	return (track.artists ?? []).filter(artist => typeof artist?.name === 'string' && artist.name.trim() !== '');
}

export function artist_ref(entry: SnapshotNamed): string {
	return entry.illusi_id ?? artist_id_for(named_of(entry));
}
export function album_ref(album: SnapshotNamed, first_artist: SnapshotNamed | undefined): string {
	return album.illusi_id ?? album_id_for(named_of(album), first_artist === undefined ? undefined : named_of(first_artist));
}

function named_entry(named: NamedUUID): SnapshotNamed {
	const entry: SnapshotNamed = { name: named.name.trim() };
	if (named.uri) entry.uri = named.uri;
	else if (named.uuid) entry.uuid = named.uuid;
	return entry;
}

function keep_illusi_id(entry: SnapshotNamed, previous: readonly SnapshotNamed[]): SnapshotNamed {
	const key = artist_id_for(named_of(entry));
	const name = entry.name.toLowerCase();
	const match = previous.find(p => p.illusi_id !== undefined && artist_id_for(named_of(p)) === key)
		?? previous.find(p => p.illusi_id !== undefined && p.name.trim().toLowerCase() === name);
	return match === undefined ? entry : { ...entry, illusi_id: match.illusi_id };
}

export function encode_track(track: Track, opts: { now: number; title_is_catalog: boolean; previous?: UserTrackRow }): UserTrackInsert {
	const { now, previous } = opts;
	const before = previous?.track;
	const meta = (track.meta ?? {}) as Partial<TrackMetaData>;

	const seen = new Set<string>();
	const artists: SnapshotNamed[] = [];
	for (const named of valid_artists(track)) {
		const entry = keep_illusi_id(named_entry(named), before?.artists ?? []);
		const key = entry.illusi_id ?? artist_id_for(named);
		if (seen.has(key)) continue;
		seen.add(key);
		artists.push(entry);
	}
	const album_named = track.album;
	let album: SnapshotNamed | null = null;
	if (album_named && typeof album_named.name === 'string' && album_named.name.trim() !== '') {
		album = named_entry(album_named);
		if (before?.album?.illusi_id !== undefined && before.album.name.trim().toLowerCase() === album.name.toLowerCase()) album.illusi_id = before.album.illusi_id;
	}

	const meta_extra: Partial<TrackMetaData> = {};
	for (const [key, value] of Object.entries(meta) as [keyof TrackMetaData, unknown][]) {
		if (!META_COLUMNS.has(key) && value !== undefined) (meta_extra as Record<string, unknown>)[key] = value;
	}

	const service_ids: Record<string, string | number> = { ...before?.service_ids };
	for (const field of TRACK_SERVICE_ID_FIELDS) {
		const value = track[field];
		if (value === '' || value === 0 || value === undefined || value === null) delete service_ids[field];
		else service_ids[field] = value;
	}

	const thumbnails: SnapshotThumbnail[] = [...before?.thumbnails ?? []];
	if (track.artwork_url && !thumbnails.some(t => t.url === track.artwork_url)) thumbnails.push({ url: track.artwork_url, width: null, height: null });

	const own_analysis = TrackAnalysis.from_values(track.analysis);
	const analysis = own_analysis === undefined ? before?.analysis ?? null : { ...before?.analysis, ...own_analysis };

	const catalog_title = opts.title_is_catalog || before === undefined || before.title === '' ? track.title : before.title;
	const duration = Number.isFinite(track.duration) && track.duration > 0 ? Math.round(track.duration * 1000) : null;
	const added = time_of(meta.added_date, now);
	const media_uri = track.media_uri ?? '';
	return {
		uid: track.uid,
		illusi_id: previous?.illusi_id ?? (track.illusi_id || null),
		track: {
			title: catalog_title,
			artists,
			album,
			duration_ms: duration,
			explicit: explicit_to_bool(track.explicit),
			imported: !!track.imported_id,
			service_ids,
			thumbnails,
			analysis,
			alt_title: track.alt_title ?? '',
			prods: track.prods ?? [],
			unreleased: track.unreleased ?? false,
			views: Number.isFinite(track.service_plays) ? track.service_plays! : 0,
			imported_id: track.imported_id ?? '',
			meta_extra
		},
		title: track.title === catalog_title ? null : track.title,
		// The server asks for uploads of tracks downloaded on some device, so this follows the media file
		downloaded_at: media_uri === '' ? null : time_of(meta.downloaded_date, now),
		start_at: meta.begdur === undefined || !Number.isFinite(meta.begdur) ? null : Math.round(meta.begdur * 1000),
		end_at: meta.enddur === undefined || !Number.isFinite(meta.enddur) ? null : Math.round(meta.enddur * 1000),
		media_uri,
		thumbnail_uri: track.thumbnail_uri ?? '',
		lyrics_uri: track.lyrics_uri ?? '',
		synced_lyrics_uri: track.synced_lyrics_uri ?? '',
		plays: Number.isFinite(meta.plays) ? meta.plays! : 0,
		last_played_at: meta.last_played_date === undefined || meta.last_played_date === EPOCH ? null : time_of(meta.last_played_date, 0) || null,
		deleted: false,
		edited_at: now,
		created_at: added,
		modified_at: now
	};
}

function best_thumbnail(thumbnails: readonly SnapshotThumbnail[]): string {
	let best: SnapshotThumbnail | undefined;
	for (const thumbnail of thumbnails) {
		if (best === undefined || (thumbnail.width ?? 0) > (best.width ?? 0)) best = thumbnail;
	}
	return best?.url ?? '';
}

export function decode_track(row: UserTrackRow): Track {
	const snapshot = row.track;
	const meta: TrackMetaData = {
		...snapshot.meta_extra,
		plays: row.plays,
		added_date: iso_of(row.created_at),
		last_played_date: iso_of(row.last_played_at),
		...(row.start_at === null ? {} : { begdur: row.start_at / 1000 }),
		...(row.end_at === null ? {} : { enddur: row.end_at / 1000 })
	};
	const result: Track = {
		uid: row.uid,
		title: row.title ?? snapshot.title,
		alt_title: snapshot.alt_title,
		artists: snapshot.artists.map(named_of),
		duration: snapshot.duration_ms === null ? 0 : snapshot.duration_ms / 1000,
		prods: snapshot.prods,
		explicit: bool_to_explicit(snapshot.explicit),
		unreleased: snapshot.unreleased,
		album: snapshot.album ? named_of(snapshot.album) : { name: '', uri: null },
		service_plays: snapshot.views,
		imported_id: snapshot.imported_id,
		illusi_id: row.illusi_id ?? '',
		artwork_url: best_thumbnail(snapshot.thumbnails),
		thumbnail_uri: row.thumbnail_uri,
		media_uri: row.media_uri,
		lyrics_uri: row.lyrics_uri,
		synced_lyrics_uri: row.synced_lyrics_uri,
		meta
	};
	for (const field of TRACK_SERVICE_ID_FIELDS) {
		const value = snapshot.service_ids[field];
		(result as unknown as Record<string, unknown>)[field] = value ?? (field === 'soundcloud_id' ? 0 : '');
	}
	if (snapshot.analysis !== null) result.analysis = snapshot.analysis;
	return result;
}
