import type { CatalogItem, CatalogService, ContributedAlbum, ContributedArtist, ContributedTrack, ContributionGraph, ServiceIds } from '@origin/illusi/types';
import type { CompactArtist, CompactPlaylist, ExplicitMode, MusicServiceURI, NamedUUID, Track } from '@illusive/types';
import { TRACK_SERVICE_ID_FIELDS, explicit_to_bool } from '../v2/track_codec';
import { album_id_for, artist_id_for } from '../v2/keys';

/** Where an object was parsed from; the services other than YouTube and YouTube Music are stored as the service sent them */
export type IngestService = Extract<MusicServiceURI, 'youtube' | 'youtubemusic' | 'musi' | 'soundcloud' | CatalogService>;

const CATALOG_SERVICES: ReadonlySet<string> = new Set<CatalogService>(['spotify', 'applemusic', 'amazonmusic', 'deezer', 'tidal', 'pandora', 'bandlab', 'audiomack']);
export function is_catalog_service(service: string): service is CatalogService {
	return CATALOG_SERVICES.has(service);
}

/** Artists and albums carry their service id in their uri (`spotify:<id>`); YouTube's and SoundCloud's aren't ids the API stores */
const URI_ID_COLUMN: Partial<Record<MusicServiceURI, keyof ServiceIds>> = {
	spotify: 'spotify_id', applemusic: 'applemusic_id', amazonmusic: 'amazonmusic_id', deezer: 'deezer_id',
	tidal: 'tidal_id', pandora: 'pandora_id', bandlab: 'bandlab_id', audiomack: 'audiomack_id'
};

/** Apple Music's links end in the numeric id (`/us/artist/name/123`); that is the id the API stores */
function entity_id(service: string, id: string): string {
	if (service !== 'applemusic') return id;
	return /(\d+)(?:[?#].*)?\/?$/u.exec(id)?.[1] ?? id;
}

export function split_named_uri(uri: string | null | undefined): { service: string; id: string } | null {
	if (uri === null || uri === undefined) return null;
	const colon = uri.indexOf(':');
	if (colon <= 0 || colon === uri.length - 1) return null;
	const service = uri.slice(0, colon);
	return { service, id: entity_id(service, uri.slice(colon + 1)) };
}

function named_service_ids(named: NamedUUID | undefined): ServiceIds | undefined {
	const parsed = split_named_uri(named?.uri);
	const column = parsed === null ? undefined : URI_ID_COLUMN[parsed.service as MusicServiceURI];
	return parsed === null || column === undefined ? undefined : { [column]: parsed.id };
}

function track_service_ids(track: Track): ServiceIds {
	const ids: Record<string, string | number> = {};
	for (const field of TRACK_SERVICE_ID_FIELDS) {
		const value = track[field];
		if (value !== undefined && value !== '' && value !== 0) ids[field] = value;
	}
	return ids;
}

const present = (name: string | undefined) => typeof name === 'string' && name.trim() !== '';

/** Library-only tracks (imported files, local uploads) have no service id and aren't anyone else's to know about */
export function has_service_identity(track: Track): boolean {
	return Object.keys(track_service_ids(track)).length > 0;
}

const ALBUM_TYPES = { 'ALBUM': 'ALBUM', 'SINGLE': 'SINGLE', 'EP': 'EP', 'SINGLE/EP': 'SINGLE' } as const;
function album_type_of(playlist: CompactPlaylist): ContributedAlbum['album_type'] {
	const type = playlist.album_type;
	return type === undefined ? undefined : (ALBUM_TYPES as Record<string, ContributedAlbum['album_type']>)[type];
}

function iso_date(date: string | undefined): string | undefined {
	if (date === undefined || date === '') return undefined;
	return Number.isNaN(new Date(date).getTime()) ? undefined : date;
}

/** Collects what Illusive parsed into one contribution graph, one entity per artist, album and track */
export class EntityGraph {
	private readonly artists = new Map<string, ContributedArtist>();
	private readonly albums = new Map<string, ContributedAlbum>();
	private readonly tracks = new Map<string, ContributedTrack>();
	private readonly tracks_artists = new Map<string, { track_ref: string; artist_ref: string }>();
	private readonly album_tracks = new Map<string, { album_ref: string; track_ref: string }>();
	private readonly artist_albums = new Map<string, { artist_ref: string; album_ref: string }>();

	size(): number {
		return this.artists.size + this.albums.size + this.tracks.size;
	}

	private add_artist(named: NamedUUID, artwork_url?: string): string {
		const ref = artist_id_for(named);
		const existing = this.artists.get(ref);
		const service_ids = named_service_ids(named);
		if (existing === undefined) {
			this.artists.set(ref, {
				ref, name: named.name.trim(),
				...(service_ids === undefined ? {} : { service_ids }),
				...(artwork_url ? { thumbnails: [{ url: artwork_url }] } : {})
			});
		} else if (artwork_url && existing.thumbnails === undefined) {
			existing.thumbnails = [{ url: artwork_url }];
		}
		return ref;
	}

	private add_album(named: NamedUUID, first_artist: NamedUUID | undefined, extra: Partial<ContributedAlbum> = {}): string {
		const ref = album_id_for(named, first_artist);
		const existing = this.albums.get(ref);
		const service_ids = named_service_ids(named);
		if (existing === undefined) {
			this.albums.set(ref, { ref, name: named.name.trim(), ...(service_ids === undefined ? {} : { service_ids }), ...extra });
		} else {
			// Whichever sighting knows a field fills it
			for (const [key, value] of Object.entries(extra)) {
				const current = existing as unknown as Record<string, unknown>;
				if (current[key] === undefined && value !== undefined) current[key] = value;
			}
		}
		return ref;
	}

	add_track(track: Track): boolean {
		if (!present(track.title) || !has_service_identity(track)) return false;
		const ref = `tr_${track.uid}`;
		const artists = (track.artists ?? []).filter(a => present(a.name));
		const album_named = track.album !== undefined && present(track.album.name) ? track.album : undefined;
		const album_ref = album_named === undefined ? undefined : this.add_album(album_named, artists[0]);
		const entry: ContributedTrack = {
			ref, title: track.title.trim(), service_ids: track_service_ids(track),
			...(album_ref === undefined ? {} : { album_ref }),
			...(track.duration > 0 ? { duration_ms: Math.round(track.duration * 1000) } : {}),
			...(explicit_bool(track.explicit) === null ? {} : { explicit: explicit_bool(track.explicit) }),
			...(track.artwork_url ? { thumbnails: [{ url: track.artwork_url }] } : {})
		};
		this.tracks.set(ref, entry);
		for (const named of artists) {
			const artist_ref = this.add_artist(named);
			this.tracks_artists.set(`${ref}|${artist_ref}`, { track_ref: ref, artist_ref });
			if (album_ref !== undefined) this.artist_albums.set(`${artist_ref}|${album_ref}`, { artist_ref, album_ref });
		}
		if (album_ref !== undefined) this.album_tracks.set(`${album_ref}|${ref}`, { album_ref, track_ref: ref });
		return true;
	}

	add_album_playlist(playlist: CompactPlaylist): boolean {
		if (!present(playlist.title.name)) return false;
		const artists = playlist.artist.filter(a => present(a.name));
		const date = iso_date(playlist.date);
		const album_type = album_type_of(playlist);
		const explicit = explicit_bool(playlist.explicit);
		const ref = this.add_album(playlist.title, artists[0], {
			...(album_type === undefined ? {} : { album_type }),
			...(date === undefined ? {} : { release_date: date }),
			...(explicit === null ? {} : { explicit }),
			...(playlist.artwork_url ? { thumbnails: [{ url: playlist.artwork_url }] } : {})
		});
		for (const named of artists) {
			const artist_ref = this.add_artist(named);
			this.artist_albums.set(`${artist_ref}|${ref}`, { artist_ref, album_ref: ref });
		}
		const first = artists[0];
		if (first !== undefined) this.albums.get(ref)!.artist_ref = artist_id_for(first);
		return true;
	}

	add_compact_artist(artist: CompactArtist): boolean {
		if (!present(artist.name.name)) return false;
		const artwork = typeof artist.profile_artwork_url === 'string' ? artist.profile_artwork_url : undefined;
		this.add_artist(artist.name, artwork);
		return true;
	}

	build(): ContributionGraph {
		return {
			artists: [...this.artists.values()],
			albums: [...this.albums.values()],
			tracks: [...this.tracks.values()],
			relations: {
				tracks_artists: [...this.tracks_artists.values()],
				album_tracks: [...this.album_tracks.values()],
				artist_albums: [...this.artist_albums.values()]
			}
		};
	}
}

function explicit_bool(explicit: ExplicitMode | undefined): boolean | null {
	return explicit_to_bool(explicit);
}

/** The service-specific view of a parsed object, sent beside the contribution */
export function catalog_track(service: CatalogService, track: Track, raw: unknown): CatalogItem | null {
	const column = `${service}_id` as 'spotify_id';
	const id = track[column];
	if (id === undefined || id === '' || !present(track.title)) return null;
	const artists = (track.artists ?? []).filter(a => present(a.name));
	const album = track.album !== undefined && present(track.album.name) ? track.album : undefined;
	return {
		kind: 'track', service, id, raw, title: track.title.trim(),
		...(track.alt_title ? { alt_title: track.alt_title } : {}),
		artist_names: artists.map(a => a.name),
		artist_ids: artists.map(a => split_named_uri(a.uri)?.id).filter((id): id is string => id !== undefined),
		...(album === undefined ? {} : { album_title: album.name, album_id: split_named_uri(album.uri)?.id ?? null }),
		...(track.duration > 0 ? { duration_ms: Math.round(track.duration * 1000) } : {}),
		explicit: explicit_bool(track.explicit),
		...(track.service_plays === undefined ? {} : { plays: track.service_plays }),
		...(track.artwork_url ? { artwork_url: track.artwork_url } : {})
	};
}

export function catalog_album(service: CatalogService, playlist: CompactPlaylist, raw: unknown): CatalogItem | null {
	const parsed = split_named_uri(playlist.title.uri);
	if (parsed?.service !== service || !present(playlist.title.name)) return null;
	const artists = playlist.artist.filter(a => present(a.name));
	const date = iso_date(playlist.date);
	return {
		kind: 'album', service, id: parsed.id, raw, title: playlist.title.name.trim(),
		artist_names: artists.map(a => a.name),
		artist_ids: artists.map(a => split_named_uri(a.uri)?.id).filter((id): id is string => id !== undefined),
		album_type: playlist.album_type ?? null,
		...(date === undefined ? {} : { release_date: date }),
		explicit: explicit_bool(playlist.explicit),
		...(playlist.artwork_url ? { artwork_url: playlist.artwork_url } : {})
	};
}

export function catalog_artist(service: CatalogService, artist: CompactArtist, raw: unknown): CatalogItem | null {
	const parsed = split_named_uri(artist.name.uri);
	if (parsed?.service !== service || !present(artist.name.name)) return null;
	return {
		kind: 'artist', service, id: parsed.id, raw, name: artist.name.name.trim(),
		verified: artist.is_official_artist_channel,
		...(typeof artist.profile_artwork_url === 'string' ? { artwork_url: artist.profile_artwork_url } : {})
	};
}
