import type { LyricsPreloadedState } from '@origin/genius/types/Lyrics';
import type { HistoryTrack, LikedTrack, Playlist as SoundCloudPlaylist, Track as SoundCloudTrack, User as SoundCloudUser } from '@origin/soundcloud/types/Search';

export type UUID = string;
export type IllusiId = UUID;
export type ISODateString = string;
/** Push and contribution bodies accept an ISO string or epoch milliseconds */
export type TimeInput = ISODateString | number;
/** A temporary, payload-local id for an entity the server hasn't assigned an illusi_id yet */
export type TempRef = string;
/** Either a TempRef or an existing illusi_id */
export type Ref = string;
export type Cursor = string;

export type ITunesExplicitness = 'explicit' | 'cleaned' | 'notExplicit';
export type LyricsService = 'GOLYRICS' | 'BINILYRICS' | 'MUSIXMATCH' | 'LRCLIB' | 'YOUTUBE_MUSIC' | 'GENIUS';
export type LyricsSyncType = 'NONE' | 'LINE' | 'WORD' | 'SYLLABLE';
export type AlbumType = 'SINGLE' | 'ALBUM' | 'EP';
export type InheritanceMode = 'INCLUDE' | 'EXCLUDE' | 'MASK' | 'INTERSECTION';
export type UserRole = 'USER' | 'ADMIN';
export type EntityType = 'track' | 'album' | 'artist';
export type SortType
	= | 'ALPHABETICAL' | 'ALPHABETICAL_REVERSE'
		| 'NEWEST' | 'OLDEST'
		| 'DURATION_HILOW' | 'DURATION_LOWHI'
		| 'PLAYS_HILOW' | 'PLAYS_LOWHI'
		| 'VIEWS_HILOW' | 'VIEWS_LOWHI'
		| 'ADDED_DATE_HILOW' | 'ADDED_DATE_LOWHI'
		| 'DOWNLOAD_DATE_HILOW' | 'DOWNLOAD_DATE_LOWHI'
		| 'LAST_PLAYED_DATE_HILOW' | 'LAST_PLAYED_DATE_LOWHI'
		| 'LAST_SAMPLED_DATE_HILOW' | 'LAST_SAMPLED_DATE_LOWHI'
		| 'LONGEST_PLAYED_HILOW' | 'LONGEST_PLAYED_LOWHI';
export type ReleaseService = 'applemusic' | 'spotify' | 'soundcloud' | 'youtube_music' | 'deezer' | 'tidal' | 'amazonmusic' | 'audiomack' | 'bandlab' | 'pandora';

/** Every service_ids_table column except illusi_id */
export interface ServiceIds {
	youtube_id?: string | null;
	spotify_id?: string | null;
	soundcloud_id?: number | null;
	soundcloud_permalink?: string | null;
	amazonmusic_id?: string | null;
	applemusic_id?: string | null;
	bandlab_id?: string | null;
	audiomack_id?: string | null;
	deezer_id?: string | null;
	pandora_id?: string | null;
	tidal_id?: string | null;
	genius_id?: number | null;
	isrc?: string | null;
}
export type ServiceIdColumn = keyof ServiceIds;

export interface Timestamps {
	created_at: ISODateString;
	modified_at: ISODateString;
}
export interface ServiceIdsRow extends Required<ServiceIds>, Timestamps { illusi_id: IllusiId }

/** Same shape as Illusive's IllusiveThumbnail; unknown sizes are null */
export interface Thumbnail {
	url: string;
	width?: number | null;
	height?: number | null;
}
export interface ThumbnailRow {
	id: IllusiId | null;
	url: string;
	width: number | null;
	height: number | null;
}

export interface Page<T> {
	items: T[];
	next_cursor: Cursor | null;
}
export interface PageQuery {
	cursor?: Cursor;
	limit?: number;
}

/** Error body the API returns on any non-2xx response */
export interface ApiErrorBody {
	error: string;
	code?: string;
	issues?: unknown;
}

export type Action = { token: string } & (
	| { type: 'CHECK_GENIUS'; track_id: IllusiId; query: string }
	| { type: 'CHECK_YOUTUBE_MUSIC'; track_id: IllusiId; query: string; youtube_id?: string }
	| { type: 'UPLOAD_MEDIA'; track_id: IllusiId }
	| { type: 'FETCH_NEW_RELEASES'; artist_id: IllusiId; service: ReleaseService; service_artist_id: string; since: ISODateString }
	| { type: 'RESEARCH_TRACK'; track_id: IllusiId; service: ResearchService; query: string; title: string; artists: string[]; duration_ms: number | null }
);
export type ActionType = Action['type'];
export type ActionOf<T extends ActionType> = Extract<Action, { type: T }>;
/** Any response may carry polite data requests; clients may ignore them */
export interface WithActions { actions?: Action[] }
/** Set when the requested id was merged into the returned entity */
export interface Redirected { redirected_from?: IllusiId }

export interface RegisterBody {
	username: string;
	email: string;
	password: string;
}
export interface LoginBody {
	email: string;
	password: string;
	device_name?: string;
}
export interface RefreshBody { refresh_token: string }
export interface TokenPair {
	access_token: string;
	refresh_token: string;
}

export interface Artist extends Timestamps {
	id: IllusiId;
	name: string;
	description: string | null;
	primary_genre_name: string | null;
}
export interface Album extends Timestamps {
	id: IllusiId;
	artist_id: IllusiId | null;
	name: string;
	album_type: AlbumType | null;
	release_date: ISODateString | null;
	track_count: number | null;
	explicit: boolean | null;
}
export interface Track extends Timestamps {
	id: IllusiId;
	title: string;
	album_id: IllusiId | null;
	duration_ms: number | null;
	explicit: boolean | null;
	imported: boolean;
	/** Unavailable on its original service; play the server copy if there is one */
	backpacked: boolean;
	backpacked_at: ISODateString | null;
}
export interface TrackArtist extends Timestamps { track_id: IllusiId; artist_id: IllusiId }
export interface AlbumTrack extends Timestamps { album_id: IllusiId; track_id: IllusiId; track_number: number | null }
export interface ArtistAlbum extends Timestamps { artist_id: IllusiId; album_id: IllusiId; position: number | null }
export interface TrackProducer {
	track_id: IllusiId;
	producer_id: number;
	name: string | null;
}

export interface SampleData extends Timestamps {
	id: IllusiId;
	mood: string;
	tempo: number;
	brightness: number;
	key: string;
	acousticness: number;
	instrumentalness: number;
	liveness: number;
	danceability: number;
	arousal: number;
	valence: number;
	speechiness: number;
}

/** Selected iTunes fields for a track, album, or artist, keyed by its illusi_id */
export interface ITunesFields {
	id: IllusiId;
	entity_type: EntityType;
	explicitness: ITunesExplicitness | null;
	release_date: ISODateString | null;
	primary_genre_name: string | null;
	/** Largest iTunes artwork URL; the same URLs are also in thumbnails */
	artwork_url: string | null;
}

/** A word (WORD sync) or syllable (SYLLABLE sync); text keeps trailing whitespace so segments join back into the line */
export interface LyricsSegment {
	text: string;
	start_ms: number;
	end_ms: number | null;
}
export interface LyricsLine {
	text: string;
	/** Null for unsynced lyrics */
	start_ms: number | null;
	end_ms: number | null;
	segments?: LyricsSegment[];
	/** Singer id when the source has one */
	agent?: string;
}
export interface ParsedLyrics {
	sync_type: LyricsSyncType;
	lines: LyricsLine[];
	songwriters?: string[];
}
export type LyricsResponse = WithActions & { track_id: IllusiId } & (
	| { lyrics: ParsedLyrics; service: LyricsService; sync_type: LyricsSyncType; instrumental?: never }
	| { lyrics: null; instrumental: true }
	| { lyrics: null; instrumental?: never }
);
export type BestLyrics
	= | { instrumental: true }
		| { instrumental?: false; service: LyricsService; sync_type: LyricsSyncType; lyrics: ParsedLyrics };

export interface User extends Timestamps {
	id: UUID;
	username: string;
	email: string;
	role: UserRole;
	edited_at: ISODateString | null;
}
export interface UserTrack extends Timestamps {
	user_id: UUID;
	track_id: IllusiId;
	title: string | null;
	downloaded_at: ISODateString | null;
	start_at: number | null;
	end_at: number | null;
	deleted: boolean;
	edited_at: ISODateString | null;
}
export interface Playlist extends Timestamps {
	id: UUID;
	user_id: UUID;
	title: string;
	description: string | null;
	pinned: boolean;
	archived: boolean;
	public: boolean;
	sort_mode: SortType;
	deleted: boolean;
	edited_at: ISODateString | null;
	/** `<uuid>.jpg`, downloaded from `/artwork/:artwork_id`; null when the playlist has no custom artwork */
	artwork_id: string | null;
	/** Last-write-wins clock for the artwork, separate from edited_at */
	artwork_edited_at: ISODateString | null;
}
export interface PlaylistTrack extends Timestamps {
	playlist_id: UUID;
	track_id: IllusiId;
	deleted: boolean;
	edited_at: ISODateString | null;
}
export interface PlaylistInheritedSearch extends Timestamps {
	id: number;
	playlist_id: UUID;
	query: string | null;
	mode: InheritanceMode | null;
	deleted: boolean;
	edited_at: ISODateString | null;
}
/** ref_id must be a playlist owned by the same user */
export interface PlaylistInheritedPlaylist extends Timestamps {
	id: number;
	playlist_id: UUID;
	ref_id: UUID;
	mode: InheritanceMode | null;
	deleted: boolean;
	edited_at: ISODateString | null;
}
/** Read-only list of external playlist URIs; no server behavior */
export interface LinkedPlaylist extends Timestamps {
	user_id: UUID;
	service_uri: string;
	deleted: boolean;
	edited_at: ISODateString | null;
}
export interface TrackPlay {
	id: number;
	user_id: UUID;
	track_id: IllusiId;
	client_id: UUID | null;
	created_at: ISODateString;
}
export interface RecentSearch {
	id: number;
	user_id: UUID | null;
	text: string | null;
	client_id: UUID | null;
	created_at: ISODateString;
}

export interface Redirect {
	old_id: IllusiId;
	new_id: IllusiId;
}
/** Every syncable table, in the order a client should apply them */
export interface SyncRows {
	/** Apply first: rewrite local old_id -> new_id (possibly chained) before anything else */
	redirects: Redirect[];
	user: User | null;
	artists: Artist[];
	albums: Album[];
	tracks: Track[];
	tracks_artists: TrackArtist[];
	album_tracks: AlbumTrack[];
	artist_albums: ArtistAlbum[];
	tracks_producers: TrackProducer[];
	service_ids: ServiceIdsRow[];
	thumbnails: ThumbnailRow[];
	sample_data: SampleData[];
	lyrics: { track_id: IllusiId; lyrics: BestLyrics }[];
	itunes: ITunesFields[];
	user_tracks: UserTrack[];
	playlists: Playlist[];
	playlist_tracks: PlaylistTrack[];
	playlist_inherited_searches: PlaylistInheritedSearch[];
	playlist_inherited_playlists: PlaylistInheritedPlaylist[];
	linked_playlists: LinkedPlaylist[];
	track_plays: TrackPlay[];
	recent_searches: RecentSearch[];
}
export interface PullBody { cursor?: Cursor | null }
/** Keep pulling with next_cursor while has_more; store the last next_cursor for the next sync */
export interface PullResponse extends SyncRows, WithActions {
	next_cursor: Cursor;
	has_more: boolean;
}

/** User-owned rows carry the client's edit time for row-level last-write-wins; omitted fields keep the stored value */
export interface PushUserTrack {
	track_id: Ref;
	title?: string | null;
	downloaded_at?: TimeInput | null;
	start_at?: number | null;
	end_at?: number | null;
	deleted?: boolean;
	edited_at: TimeInput;
}
export interface PushPlaylist {
	id: UUID;
	title?: string;
	description?: string | null;
	pinned?: boolean;
	archived?: boolean;
	public?: boolean;
	sort_mode?: SortType;
	deleted?: boolean;
	edited_at: TimeInput;
}
export interface PushPlaylistTrack {
	playlist_id: UUID;
	track_id: Ref;
	deleted?: boolean;
	edited_at: TimeInput;
}
/** Existing rows send their server id; new rows send a temp_id instead */
export type PushInheritedRow<T> = T & ({ id: number; temp_id?: never } | { id?: never; temp_id: string });
export type PushInheritedSearch = PushInheritedRow<{
	playlist_id: UUID;
	query?: string | null;
	mode?: InheritanceMode | null;
	deleted?: boolean;
	edited_at: TimeInput;
}>;
export type PushInheritedPlaylist = PushInheritedRow<{
	playlist_id: UUID;
	ref_id: UUID;
	mode?: InheritanceMode | null;
	deleted?: boolean;
	edited_at: TimeInput;
}>;
export interface PushLinkedPlaylist {
	service_uri: string;
	deleted?: boolean;
	edited_at: TimeInput;
}
/** Append-only, deduped by client_id */
export interface PushTrackPlay {
	client_id: UUID;
	track_id: Ref;
	created_at: TimeInput;
}
export interface PushRecentSearch {
	client_id: UUID;
	text: string | null;
	created_at: TimeInput;
}
export interface PushChanges {
	/** New local artists/albums/tracks/relations; track refs in the user rows may be its temp refs */
	entities?: ContributionGraph;
	profile?: { username?: string; edited_at: TimeInput };
	user_tracks?: PushUserTrack[];
	playlists?: PushPlaylist[];
	playlist_tracks?: PushPlaylistTrack[];
	playlist_inherited_searches?: PushInheritedSearch[];
	playlist_inherited_playlists?: PushInheritedPlaylist[];
	linked_playlists?: PushLinkedPlaylist[];
	track_plays?: PushTrackPlay[];
	recent_searches?: PushRecentSearch[];
}
export type PushTable = Exclude<keyof PushChanges, 'entities' | 'profile'>;
export interface PushBody {
	/** Client UUID; a retried push is applied once */
	push_id: UUID;
	base_cursor?: Cursor | null;
	changes: PushChanges;
}
export interface PushRejection {
	table: PushTable | 'profile';
	index: number;
	reason: string;
	issues?: unknown;
}
export interface PushResponse {
	push_id: UUID;
	/** Cursor for the next pull; a push never advances it past other devices' changes */
	cursor: Cursor | null;
	/** temp ref -> illusi_id for every applied entity; save it before sending the next chunk */
	id_map: Record<TempRef, IllusiId>;
	/** temp_id -> server id for new inheritance rows */
	inherited_id_map: {
		playlist_inherited_searches: Record<string, number>;
		playlist_inherited_playlists: Record<string, number>;
	};
	/** Authoritative values of every row this push touched, applied or not; overwrite local copies */
	rows: SyncRows;
	entities: Omit<ContributionResult, 'refs'>;
	rejected: PushRejection[];
	/** Rows actually written per table */
	applied: Partial<Record<PushTable | 'profile', number>>;
	progress: { entities: number; user_rows: number; created: number; matched: number; rejected: number };
}

export interface ContributedArtist {
	ref: Ref;
	name: string;
	description?: string | null;
	primary_genre_name?: string | null;
	service_ids?: ServiceIds;
	thumbnails?: Thumbnail[];
}
export interface ContributedAlbum {
	ref: Ref;
	name: string;
	artist_ref?: Ref | null;
	album_type?: AlbumType | null;
	release_date?: TimeInput | null;
	track_count?: number | null;
	explicit?: boolean | null;
	service_ids?: ServiceIds;
	thumbnails?: Thumbnail[];
}
export interface ContributedTrack {
	ref: Ref;
	title: string;
	album_ref?: Ref | null;
	duration_ms?: number | null;
	explicit?: boolean | null;
	imported?: boolean | null;
	service_ids?: ServiceIds;
	thumbnails?: Thumbnail[];
}
export interface ContributionGraph {
	artists?: ContributedArtist[];
	albums?: ContributedAlbum[];
	tracks?: ContributedTrack[];
	relations?: {
		tracks_artists?: { track_ref: Ref; artist_ref: Ref }[];
		album_tracks?: { album_ref: Ref; track_ref: Ref; track_number?: number | null }[];
		artist_albums?: { artist_ref: Ref; album_ref: Ref; position?: number | null }[];
		/** Bidirectional; one or two rows may exist for a pair */
		similar_artists?: { artist_ref: Ref; similar_artist_ref: Ref }[];
	};
}
export interface ContributionPayload extends ContributionGraph {
	/** Client UUID; a retried contribution is applied once */
	contribution_id: UUID;
}
export type RelationKind = keyof NonNullable<ContributionGraph['relations']>;
export interface EntityOutcome {
	ref: Ref;
	type: EntityType;
	illusi_id: IllusiId;
}
export interface MatchedOutcome extends EntityOutcome { by: 'ref' | 'service_id' | 'metadata' }
export interface IdCandidate {
	illusi_id: IllusiId;
	columns: ServiceIdColumn[];
}
export type ConflictReport = EntityOutcome & (
	| { kind: 'service_id_multiple'; others: IdCandidate[] }
	| { kind: 'metadata_multiple'; others: IllusiId[] }
	| { kind: 'metadata_unclear'; candidates: IllusiId[] }
	| { kind: 'service_id'; column: ServiceIdColumn; conflict: 'different_value' | 'taken'; existing_value: string | null; incoming_value: string; other_illusi_id: IllusiId | null }
	| { kind: 'field'; field: string; current: unknown; proposed: unknown }
);
export interface Rejection {
	kind: EntityType | RelationKind;
	index: number;
	ref?: Ref;
	/** A dropped reference field on an entity that was otherwise applied */
	field?: string;
	reason: string;
	issues?: unknown;
}
export interface ContributionResult {
	/** Every applied payload ref -> its illusi_id */
	refs: Record<Ref, IllusiId>;
	created: EntityOutcome[];
	matched: MatchedOutcome[];
	conflicts: ConflictReport[];
	rejected: Rejection[];
}

export interface ResolveItem {
	ref: string;
	type: EntityType;
	service_ids?: ServiceIds;
	title?: string | null;
	artist?: string | null;
	album?: string | null;
	duration_ms?: number | null;
}
export interface ResolveBody { items: ResolveItem[] }
/** ref -> illusi_id, or null when nothing (or nothing clear) matched */
export type ResolveResponse = Record<string, IllusiId | null>;

export type SoundCloudIngestItem = SoundCloudUser | SoundCloudTrack | SoundCloudPlaylist | LikedTrack | HistoryTrack;
export interface SoundCloudIngestBody { items: (SoundCloudIngestItem | { collection: SoundCloudIngestItem[] })[] }
export interface IngestAccepted {
	accepted: number;
	rejected: number;
}

export interface NotFoundReport { result: 'NOT_FOUND' }

export type GeniusIngestBody = { token: string; track_id: IllusiId } & (
	| { preloaded_state: LyricsPreloadedState; result?: never }
	| NotFoundReport
);

/** Lyrics exactly as YouTube Music returned them: a plain string or its JSON payload */
export type YouTubeMusicLyricsPayload = string | Record<string, unknown> | unknown[];
export type YouTubeMusicLyricsIngestBody = { token: string; track_id: IllusiId; youtube_id?: string } & (
	| { lyrics: YouTubeMusicLyricsPayload; result?: never }
	| NotFoundReport
);

export interface NewReleaseAlbum {
	id: IllusiId;
	name: string;
	album_type: AlbumType | null;
	release_date: ISODateString | null;
	track_count: number | null;
	explicit: boolean | null;
	artists: ArtistRef[];
	thumbnails: Thumbnail[];
}
export interface NewReleaseSoundCloudTrack {
	id: number;
	illusi_id: IllusiId | null;
	title: string;
	permalink: string | null;
	artwork_url: string | null;
	duration: number | null;
	genre: string | null;
	explicit: boolean | null;
	release_date: ISODateString;
	user: { id: number; username: string | null; permalink: string | null; avatar_url: string | null; verified: boolean | null } | null;
}
export interface NewReleases extends WithActions {
	since: ISODateString;
	until: ISODateString;
	albums: NewReleaseAlbum[];
	soundcloud_tracks: NewReleaseSoundCloudTrack[];
}
export interface NewReleasesQuery {
	limit?: number;
	/** Comma-separated services the client is logged into; each adds FETCH_NEW_RELEASES actions */
	services?: string;
}
export interface NewReleasesIngestBody {
	token: string;
	artist_id: IllusiId;
	service: ReleaseService;
	contribution_id?: UUID;
	/** Albums and tracks found on the service; not used for SoundCloud */
	releases?: ContributionGraph;
	/** Raw SoundCloud objects; SoundCloud only */
	soundcloud_items?: SoundCloudIngestItem[];
}
export type NewReleasesIngestResult
	= | ContributionResult
		| { written: { users: number; tracks: number; playlists: number }; rejected: number; dropped: number }
		| Record<string, never>;

export interface Media extends Timestamps {
	id: number;
	track_id: IllusiId;
	/** `<uuid>.<ext>` inside the server's MEDIA_DIR */
	resource_id: string;
	quality: string | null;
	content_hash: string;
	uploaded_by: UUID | null;
}
export interface MediaUploadResult {
	media: Media;
	/** True when this track already had media with the same content */
	duplicate: boolean;
}
/** A web/Node Blob, or React Native's { uri, name, type } FormData file descriptor */
export type MediaFile = Blob | { uri: string; name: string; type: string };
export interface MediaUploadOpts {
	quality?: string;
	/** Token from an UPLOAD_MEDIA action, when fulfilling one */
	token?: string;
}
export interface MediaRequestsQuery {
	limit?: number;
	cursor?: IllusiId;
}

/** Services a track can be reported unavailable on, and researched on */
export type ResearchService = 'youtube' | 'soundcloud' | 'bandlab' | 'audiomack';
export interface UnavailableReportBody {
	service: ResearchService;
	reason?: string;
}
export interface UnavailableReportResult extends Redirected {
	track_id: IllusiId;
	backpacked: boolean;
	backpacked_at: ISODateString | null;
	/** The server has a copy, so the track wasn't flagged; stream it through MediaFiles */
	has_media: boolean;
}
export interface BackpackRequestsQuery {
	limit?: number;
}
export type TrackResearchBody = { token: string; track_id: IllusiId; service: ResearchService } & (
	| { service_id: string }
	| { result: 'NOT_FOUND' }
);
export interface TrackResearchResult {
	track_id: IllusiId;
	service: ResearchService;
	status: 'FOUND' | 'NOT_FOUND';
	/** The id filled an empty column */
	applied: boolean;
	backpacked: boolean;
	/** The service already had a different id; it went to admin review */
	conflict?: { column: ServiceIdColumn; kind: 'different_value' | 'taken'; existing_value: string | null; incoming_value: string; other_illusi_id: IllusiId | null };
}

export interface CopiedPlaylist {
	playlist: Playlist;
	tracks: PlaylistTrack[];
}

export interface ArtistRef {
	id: IllusiId;
	name: string;
}
export interface AlbumRef {
	id: IllusiId;
	name: string;
	album_type: AlbumType | null;
	release_date: ISODateString | null;
}
/** The caller's own library data for a track */
export interface UserTrackOverlay {
	title: string | null;
	downloaded_at: ISODateString | null;
	start_at: number | null;
	end_at: number | null;
	added_at: ISODateString;
	plays: number;
	last_played_at: ISODateString | null;
}
export interface TrackView extends Track, Redirected {
	artists: ArtistRef[];
	album: AlbumRef | null;
	track_number: number | null;
	service_ids: ServiceIds;
	thumbnails: Thumbnail[];
	itunes: ITunesFields | null;
	sample_data: SampleData | null;
	producers: { id: number; name: string | null }[];
	has_media: boolean;
	has_lyrics: boolean;
	/** Null when the track isn't in the caller's library */
	user: UserTrackOverlay | null;
}
export interface AlbumView extends Album, Redirected {
	artist: ArtistRef | null;
	artists: ArtistRef[];
	service_ids: ServiceIds;
	thumbnails: Thumbnail[];
	itunes: ITunesFields | null;
}
export interface ArtistView extends Artist, Redirected {
	service_ids: ServiceIds;
	thumbnails: Thumbnail[];
	itunes: ITunesFields | null;
	album_count: number;
	track_count: number;
	in_library: boolean;
}
export interface PlaylistView extends Playlist {
	owner: { id: UUID; username: string };
	is_owner: boolean;
	track_count: number;
	thumbnails: Thumbnail[];
	/** Owner only */
	inherited_searches?: PlaylistInheritedSearch[];
	/** Owner only */
	inherited_playlists?: PlaylistInheritedPlaylist[];
}

export interface Me {
	user: User;
	stats: { tracks: number; playlists: number; plays: number };
}
export interface LibraryQuery extends PageQuery {
	sort?: SortType;
	/** Track query, using the same flags as search-inherited playlists */
	q?: string;
}
export interface MyPlaylistsQuery {
	include_archived?: boolean;
	include_deleted?: boolean;
}
export interface PlayView {
	id: number;
	client_id: UUID | null;
	created_at: ISODateString;
	track: TrackView;
}
export interface PublicPlaylistsQuery extends PageQuery { q?: string }
export interface TrackBatchBody { ids: IllusiId[] }
export interface TrackBatchResponse {
	items: TrackView[];
	missing: IllusiId[];
}
export interface AlbumDetail {
	album: AlbumView;
	tracks: TrackView[];
}
export interface ArtistAlbumsQuery extends PageQuery { album_type?: AlbumType }
export interface ArtistTracksQuery extends PageQuery { sort?: 'popular' | 'newest' | 'title' }
export interface SimilarQuery { limit?: number }

export type SearchType = 'track' | 'album' | 'artist' | 'playlist';
export interface SearchQuery {
	q: string;
	/** Comma-separated SearchType values; default all */
	types?: string;
	scope?: 'global' | 'library';
	limit?: number;
	/** Only valid when types names a single type */
	cursor?: Cursor;
}
export interface SearchResponse {
	tracks?: Page<TrackView>;
	albums?: Page<AlbumView>;
	artists?: Page<ArtistView>;
	playlists?: Page<PlaylistView>;
}

export type ReviewKind = 'FIELD_CONFLICT' | 'SERVICE_ID_CONFLICT' | 'LYRICS_PARSE_FAILURE' | 'GENIUS_MATCH_REJECTED' | 'AUTO_MERGE' | 'AUTO_SPLIT';
export type ReviewStatus = 'OPEN' | 'APPLIED' | 'DISMISSED';
export type SharedEntityTable
	= | 'artists_table' | 'albums_table' | 'tracks_table'
		| 'service_ids_table' | 'thumbnails_table'
		| 'tracks_artists_table' | 'album_tracks_table' | 'artist_albums_table' | 'similar_artists_table'
		| 'track_lyrics_table' | 'track_sample_data_table'
		| 'itunes_artists_table' | 'itunes_collections_table' | 'itunes_tracks_table'
		| 'soundcloud_users_table' | 'soundcloud_tracks_table' | 'soundcloud_playlist_table'
		| 'genius_artists_table' | 'genius_songs_table';
export interface ProposedValue {
	value: unknown;
	source_user_ids: UUID[];
	occurrences: number;
	plan?: unknown;
	evidence?: unknown;
}
export interface ReviewEntityContext {
	entity_id: string;
	redirected_to: IllusiId | null;
	kind: EntityType | null;
	entity: Track | Album | Artist | null;
	service_ids: ServiceIdsRow | null;
	/** iTunes, Genius and SoundCloud rows linked through the service ids */
	links: Record<string, unknown>;
}
export interface ReviewItem extends Timestamps {
	id: number;
	kind: ReviewKind;
	entity_table: string;
	entity_id: string;
	field: string | null;
	current_value: unknown;
	proposed_values: ProposedValue[];
	source_user_ids: UUID[];
	occurrences: number;
	details: unknown;
	status: ReviewStatus;
	resolved_by: UUID | null;
	resolved_at: ISODateString | null;
	context: ReviewEntityContext;
	/** SERVICE_ID_CONFLICT only: the other entities in the plan */
	group?: ReviewEntityContext[];
	conflicts?: Record<string, unknown>[];
}
export interface ReviewListQuery {
	kind?: ReviewKind;
	entity_table?: string;
	status?: ReviewStatus;
	sort?: 'occurrences' | 'age';
	order?: 'asc' | 'desc';
	page?: number;
	limit?: number;
}
export interface ReviewList {
	items: ReviewItem[];
	total: number;
	page: number;
	limit: number;
	has_more: boolean;
}
export interface ReviewApplyBody {
	/** Index into proposed_values; defaults to the most reported proposal or the latest plan */
	proposal_index?: number;
	/** A value the admin typed instead of one of the proposals */
	value?: unknown;
}
export type ReviewApplyResult = { id: number; status: 'APPLIED' } & (
	| { steps: { type: string; applied: boolean; skipped: string | null; new_id: IllusiId | null }[] }
	| { entity_table: string; entity_id: string; before: Record<string, unknown>; after: Record<string, unknown> }
);
export interface ReviewDismissResult {
	id: number;
	status: 'DISMISSED';
}
export type EntityPatchBody = Record<string, unknown>;
export interface EntityPatchResult {
	table: string;
	id: IllusiId;
	redirected_from: IllusiId | null;
	before: Record<string, unknown>;
	after: Record<string, unknown>;
}

export interface ArtworkResult {
	/** False when the server already had a newer artwork change; playlist then shows what it kept */
	applied: boolean;
	playlist: Playlist;
}
export type ArtworkFile = MediaFile;

export interface SearchSuggestionsQuery {
	q: string;
	/** 1-10, default 5 */
	limit?: number;
}
export interface SuggestionTrack {
	id: IllusiId;
	title: string;
	artists: string[];
	thumbnail: Thumbnail | null;
	in_library: boolean;
}
export interface SuggestionArtist {
	id: IllusiId;
	name: string;
	thumbnail: Thumbnail | null;
	in_library: boolean;
}
export interface SuggestionAlbum {
	id: IllusiId;
	name: string;
	artists: string[];
	thumbnail: Thumbnail | null;
	in_library: boolean;
}
export interface SuggestionText {
	text: string;
	kind: 'recent' | 'artist' | 'track' | 'album';
}
/** Under 2 characters everything is empty; at 2 only recent searches; the catalog is searched from 3 */
export interface SearchSuggestions {
	tracks: SuggestionTrack[];
	artists: SuggestionArtist[];
	albums: SuggestionAlbum[];
	text: SuggestionText[];
}

export type ExportStatus = 'PENDING' | 'RUNNING' | 'READY' | 'FAILED' | 'EXPIRED';
export interface ExportJob {
	id: UUID;
	status: ExportStatus;
	created_at: ISODateString;
	started_at: ISODateString | null;
	finished_at: ISODateString | null;
	expires_at: ISODateString | null;
	/** Bytes of the gzipped file once ready */
	size: number | null;
	error: string | null;
}
export interface DeleteAccountBody {
	password: string;
}
