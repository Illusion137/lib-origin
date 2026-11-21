import type { AlbumType, ContributedAlbum, ContributedArtist, ContributedTrack, ContributionGraph, ServiceIds, Thumbnail } from '@origin/illusi/types';
import type { CompactPlaylist, NamedUUID, Track } from '@illusive/types';
import { album_id_for, artist_id_for } from '../v2/keys';
import { explicit_to_bool } from '../v2/track_codec';

const SERVER_ID_COLUMNS = [
	'youtube_id', 'spotify_id', 'soundcloud_id', 'soundcloud_permalink', 'amazonmusic_id', 'applemusic_id', 'bandlab_id', 'audiomack_id', 'deezer_id',
	'pandora_id', 'tidal_id'
] as const satisfies readonly (keyof ServiceIds & keyof Track)[];

export interface ReleaseAlbum {
	album: CompactPlaylist;
	tracks: Track[];
}
export interface ReleaseGraphOpts {
	/** The artist the server asked about; credits to it use this illusi_id as their ref */
	target_ref: string;
	is_target: (artist: NamedUUID) => boolean;
	releases: ReleaseAlbum[];
}

function album_type_of(album: CompactPlaylist): AlbumType | null {
	switch (album.album_type) {
		case 'ALBUM': return 'ALBUM';
		case 'EP': return 'EP';
		case 'SINGLE': case 'SINGLE/EP': case 'SONG': return 'SINGLE';
		default: return null;
	}
}

function album_thumbnails(album: CompactPlaylist): Thumbnail[] {
	const thumbnails: Thumbnail[] = (album.artwork_thumbnails ?? []).map(t => ({ url: t.url, width: t.width || null, height: t.height || null }));
	if (thumbnails.length === 0 && album.artwork_url) thumbnails.push({ url: album.artwork_url, width: null, height: null });
	return thumbnails.slice(0, 32);
}

function service_ids_of(track: Track): ServiceIds {
	const ids: ServiceIds = {};
	for (const column of SERVER_ID_COLUMNS) {
		const value = track[column];
		if (value !== undefined && value !== null && value !== '' && value !== 0) (ids as Record<string, unknown>)[column] = value;
	}
	return ids;
}

function valid_date(date: string | undefined): string | null {
	if (date === undefined) return null;
	return Number.isNaN(new Date(date).getTime()) ? null : date;
}

/**
 * The contribution graph for an artist's releases found on a service: every album is credited to the target
 * artist, and tracks keep their own credits. Refs are temporary except the target's.
 */
export function release_graph(opts: ReleaseGraphOpts): ContributionGraph {
	const artists = new Map<string, ContributedArtist>();
	const albums: ContributedAlbum[] = [];
	const tracks: ContributedTrack[] = [];
	const tracks_artists: { track_ref: string; artist_ref: string }[] = [];
	const album_tracks: { album_ref: string; track_ref: string; track_number?: number | null }[] = [];
	const artist_albums: { artist_ref: string; album_ref: string }[] = [];
	const seen_tracks = new Set<string>();

	const artist_ref = (named: NamedUUID): string | null => {
		if (typeof named?.name !== 'string' || named.name.trim() === '') return null;
		if (opts.is_target(named)) return opts.target_ref;
		const ref = artist_id_for(named);
		if (!artists.has(ref)) artists.set(ref, { ref, name: named.name.trim() });
		return ref;
	};

	for (const { album, tracks: album_track_list } of opts.releases) {
		if (album_track_list.length === 0) continue;
		const album_ref = album_id_for(album.title, album.artist[0]);
		albums.push({
			ref: album_ref,
			name: album.title.name,
			artist_ref: opts.target_ref,
			album_type: album_type_of(album),
			release_date: valid_date(album.date),
			track_count: album_track_list.length,
			explicit: album.explicit === undefined ? null : explicit_to_bool(album.explicit),
			thumbnails: album_thumbnails(album)
		});
		artist_albums.push({ artist_ref: opts.target_ref, album_ref });
		album_track_list.forEach((track, index) => {
			const track_ref = `tr_${album_ref}_${index}`;
			if (seen_tracks.has(track_ref)) return;
			seen_tracks.add(track_ref);
			tracks.push({
				ref: track_ref,
				title: track.title,
				album_ref,
				duration_ms: Number.isFinite(track.duration) && track.duration > 0 ? Math.round(track.duration * 1000) : null,
				explicit: explicit_to_bool(track.explicit),
				service_ids: service_ids_of(track),
				thumbnails: track.artwork_url ? [{ url: track.artwork_url, width: null, height: null }] : []
			});
			const credits = new Set<string>();
			for (const named of track.artists ?? []) {
				const ref = artist_ref(named);
				if (ref !== null) credits.add(ref);
			}
			if (credits.size === 0) credits.add(opts.target_ref);
			for (const ref of credits) tracks_artists.push({ track_ref, artist_ref: ref });
			album_tracks.push({ album_ref, track_ref, track_number: index + 1 });
		});
	}
	return { artists: [...artists.values()], albums, tracks, relations: { tracks_artists, album_tracks, artist_albums } };
}
