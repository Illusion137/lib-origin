import type {
	AlbumRef, AlbumType, AlbumView, ArtistRef, ArtistView, NewReleaseAlbum, NewReleaseSoundCloudTrack, PlaylistView, SearchSuggestions, Thumbnail,
	TrackView
} from '@origin/illusi/types';
import { bool_to_explicit, itunes_explicit, TRACK_SERVICE_ID_FIELDS } from './db/v2/track_codec';
import { TrackAnalysis } from './track_analysis';
import { create_uri } from './illusive_utils';
import type { CompactArtist, CompactPlaylist, CompactPlaylistAlbumType, IllusiveThumbnail, ISOString, NamedUUID, Track, TrackMetaData } from './types';

/**
 * Converts the Illusi read API's views into the shapes the rest of Illusive works with. Server tracks use their
 * illusi_id as uid, the same key the sync engine gives a server track it pulls into the local library.
 */
export namespace IllusiViews {
	/** Albums share the `illusi:` uri scheme with playlists; the prefix tells illusi_get_playlist which one it is */
	export const ALBUM_PREFIX = 'album.';

	export function album_uri(album_id: string) {
		return create_uri('illusi', `${ALBUM_PREFIX}${album_id}`);
	}
	/** The album id in an `illusi:album.<id>` playlist id, or null for a playlist uuid */
	export function album_id_of(playlist_id: string): string | null {
		return playlist_id.startsWith(ALBUM_PREFIX) ? playlist_id.slice(ALBUM_PREFIX.length) : null;
	}

	export function artist_named(artist: ArtistRef): NamedUUID {
		return { name: artist.name, uri: create_uri('illusi', artist.id) };
	}
	export function album_named(album: Pick<AlbumRef, 'id' | 'name'>): NamedUUID {
		return { name: album.name, uri: album_uri(album.id) };
	}

	export function thumbnails(list: readonly Thumbnail[]): IllusiveThumbnail[] {
		return list.map(t => ({ url: t.url, width: t.width ?? 0, height: t.height ?? 0 }));
	}
	export function best_thumbnail_url(list: readonly Thumbnail[]): string {
		let best: Thumbnail | undefined;
		for (const thumbnail of list) {
			if (best === undefined || (thumbnail.width ?? 0) > (best.width ?? 0)) best = thumbnail;
		}
		return best?.url ?? '';
	}

	function album_type(type: AlbumType | null, track_count: number | null): CompactPlaylistAlbumType | undefined {
		if (type === 'EP') return 'EP';
		if (type === 'SINGLE') return track_count === 1 ? 'SONG' : 'SINGLE';
		if (type === 'ALBUM') return 'ALBUM';
		return undefined;
	}

	export function track(view: TrackView): Track {
		const user = view.user;
		const now = new Date().toISOString() as ISOString;
		const meta: TrackMetaData = {
			plays: user?.plays ?? 0,
			added_date: (user?.added_at ?? now) as ISOString,
			last_played_date: (user?.last_played_at ?? new Date(0).toISOString()) as ISOString,
			...(user?.downloaded_at ? { downloaded_date: user.downloaded_at as ISOString } : {}),
			...(user?.start_at == null ? {} : { begdur: user.start_at / 1000 }),
			...(user?.end_at == null ? {} : { enddur: user.end_at / 1000 })
		};
		const result: Track = {
			uid: view.id,
			title: user?.title ?? view.title,
			artists: view.artists.map(artist_named),
			duration: view.duration_ms === null ? 0 : view.duration_ms / 1000,
			prods: view.producers.flatMap(producer => (producer.name ? [{ name: producer.name, producer_id: producer.id }] : [])),
			explicit: bool_to_explicit(view.explicit ?? itunes_explicit(view.itunes?.explicitness)),
			album: view.album ? album_named(view.album) : { name: '', uri: null },
			illusi_id: view.id,
			artwork_url: best_thumbnail_url(view.thumbnails) || view.itunes?.artwork_url || '',
			meta
		};
		const service_ids = view.service_ids as Record<string, unknown>;
		for (const field of TRACK_SERVICE_ID_FIELDS) {
			const value = service_ids[field];
			if (value !== null && value !== undefined) (result as unknown as Record<string, unknown>)[field] = value;
		}
		const analysis = TrackAnalysis.from_values({ genre: view.itunes?.primary_genre_name, ...view.sample_data });
		if (analysis !== undefined) result.analysis = analysis;
		return result;
	}

	/** Swaps in the library's own copy of a track (its uid, files and playback data) when the user already has it */
	export function prefer_local(tracks: Track[], library: readonly Track[]): Track[] {
		if (tracks.length === 0 || library.length === 0) return tracks;
		const by_illusi_id = new Map<string, Track>();
		for (const t of library) if (t.illusi_id) by_illusi_id.set(t.illusi_id, t);
		return tracks.map(t => (t.illusi_id ? by_illusi_id.get(t.illusi_id) : undefined) ?? t);
	}

	export function playlist(view: PlaylistView): CompactPlaylist {
		return {
			title: { name: view.title, uri: create_uri('illusi', view.id) },
			artist: [{ name: view.owner.username, uri: null }],
			artwork_thumbnails: thumbnails(view.thumbnails),
			date: view.created_at as ISOString,
			type: 'PLAYLIST'
		};
	}

	export function album(view: AlbumView | NewReleaseAlbum): CompactPlaylist {
		const itunes = 'itunes' in view ? view.itunes : null;
		const artwork = best_thumbnail_url(view.thumbnails) || itunes?.artwork_url || undefined;
		return {
			title: album_named(view),
			artist: view.artists.map(artist_named),
			artwork_thumbnails: thumbnails(view.thumbnails),
			...(artwork ? { artwork_url: artwork } : {}),
			...(view.release_date ? { date: view.release_date as ISOString } : {}),
			explicit: bool_to_explicit(view.explicit ?? itunes_explicit(itunes?.explicitness)),
			type: 'ALBUM',
			album_type: album_type(view.album_type, view.track_count)
		};
	}

	export function artist(view: ArtistView): CompactArtist {
		const artwork = best_thumbnail_url(view.thumbnails) || view.itunes?.artwork_url || undefined;
		return {
			name: { name: view.name, uri: create_uri('illusi', view.id) },
			...(artwork ? { profile_artwork_url: artwork } : {}),
			is_official_artist_channel: false
		};
	}

	/** Suggestions in the order a search box lists them: text completions, then tracks, artists and albums */
	export function suggestions(result: SearchSuggestions): (string | Track | CompactPlaylist | CompactArtist)[] {
		const text = result.text.map(item => item.text);
		const tracks = result.tracks.map((item): Track => ({
			uid: item.id,
			title: item.title,
			artists: item.artists.map(artist_named),
			duration: item.duration_ms === null ? 0 : item.duration_ms / 1000,
			explicit: bool_to_explicit(item.explicit),
			album: item.album ? album_named(item.album) : { name: '', uri: null },
			illusi_id: item.id,
			artwork_url: item.thumbnail?.url ?? ''
		}));
		const artists = result.artists.map((item): CompactArtist => ({
			name: { name: item.name, uri: create_uri('illusi', item.id) },
			...(item.thumbnail ? { profile_artwork_url: item.thumbnail.url } : {}),
			is_official_artist_channel: false
		}));
		const albums = result.albums.map((item): CompactPlaylist => ({
			title: album_named(item),
			artist: item.artists.map(artist_named),
			artwork_thumbnails: item.thumbnail ? thumbnails([item.thumbnail]) : [],
			...(item.release_date ? { date: item.release_date as ISOString } : {}),
			explicit: bool_to_explicit(item.explicit),
			type: 'ALBUM',
			album_type: album_type(item.album_type, item.track_count)
		}));
		return [...text, ...tracks, ...artists, ...albums];
	}

	export function soundcloud_release(release: NewReleaseSoundCloudTrack): CompactPlaylist | null {
		if (!release.permalink) return null;
		const user = release.user;
		const song: Track = {
			uid: release.illusi_id ?? `soundcloud:${release.id}`,
			title: release.title,
			artists: user ? [{ name: user.username ?? '', uri: user.permalink ? create_uri('soundcloud', user.permalink) : null }] : [],
			duration: release.duration === null ? 0 : release.duration / 1000,
			...(release.genre ? { analysis: { genre: release.genre } } : {}),
			explicit: bool_to_explicit(release.explicit),
			soundcloud_id: release.id,
			soundcloud_permalink: release.permalink,
			artwork_url: release.artwork_url ?? user?.avatar_url ?? '',
			...(release.illusi_id ? { illusi_id: release.illusi_id } : {})
		};
		return {
			title: { name: release.title, uri: create_uri('soundcloud', release.permalink) },
			artist: song.artists,
			artwork_thumbnails: [],
			...(song.artwork_url ? { artwork_url: song.artwork_url } : {}),
			date: release.release_date as ISOString,
			explicit: song.explicit,
			type: 'ALBUM',
			album_type: 'SONG',
			song_track: song
		};
	}
}
