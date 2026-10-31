import type { Playlist, PlaylistsTracks, Track } from '@illusive/types';

export interface TracksRepo {
	load_library(): Promise<Track[]>;
	all(): Promise<Track[]>;
	by_uid(uid: string): Promise<Track | undefined>;
	by_uids(uids: readonly string[]): Promise<Track[]>;
	by_service_id(key: keyof Track, value: string | number): Promise<Track | undefined>;
	exists(uid: string): Promise<boolean>;
	insert(tracks: Track[]): Promise<void>;
	update(uid: string, track: Track): Promise<void>;
	/** sync: whether this change should reach other devices (thumbnail caching, for example, shouldn't) */
	patch(uid: string, fields: Partial<Track>, sync?: boolean): Promise<void>;
	patch_all(fields: Partial<Track>, affected_uids: readonly string[], sync?: boolean): Promise<void>;
	remove(uid: string): Promise<void>;
	restore(uid: string): Promise<Track | undefined>;
	clear(): Promise<void>;
}

export interface PlaylistsRepo {
	count(): Promise<number>;
	has_track(uuid: string, track_uid: string): Promise<boolean>;
	containing_track(track_uid: string): Promise<Set<string>>;
	track_uid_set(uuid: string): Promise<Set<string>>;
	raw_tracks(): Promise<PlaylistsTracks[]>;
	ordered_track_uids(uuid: string): Promise<string[]>;
	/** Non-deleted playlists without visual data */
	all(): Promise<Playlist[]>;
	get(uuid: string): Promise<Playlist | undefined>;
	titles(): Promise<{ title: string }[]>;
	add_tracks(rows: readonly PlaylistsTracks[]): Promise<void>;
	remove_tracks(rows: readonly PlaylistsTracks[]): Promise<void>;
	remove_track_everywhere(track_uid: string): Promise<void>;
	create(uuid: string, title: string): Promise<void>;
	update(uuid: string, fields: Partial<Playlist>): Promise<void>;
	remove(uuid: string): Promise<void>;
}

export interface PlayRange { start: number; end: number }
export interface PlayRow { track_uid: string; created_at: number }

export interface TrackPlaysRepo {
	insert(track_uid: string): Promise<void>;
	between(range: PlayRange, track_uid?: string): Promise<PlayRow[]>;
	between_sync(range: PlayRange, track_uid?: string): PlayRow[];
}

export interface RecentlyPlayedRepo {
	insert(track: Track): Promise<void>;
	remove(track_uid: string): Promise<void>;
	clear(): Promise<void>;
	list(limit?: number): Promise<Track[]>;
	trim(max: number): Promise<void>;
}

export interface BackpackRepo {
	list(): Promise<Track[]>;
	/** Marks the track unavailable. Returns false if it's unknown. */
	add(track_uid: string): Promise<boolean>;
	/** No longer unavailable (replaced or re-found) */
	remove(track_uid: string): Promise<void>;
	/** Drops every backpacked track */
	empty(): Promise<void>;
}

export interface Repos {
	tracks: TracksRepo;
	playlists: PlaylistsRepo;
	track_plays: TrackPlaysRepo;
	recently_played: RecentlyPlayedRepo;
	backpack: BackpackRepo;
}
