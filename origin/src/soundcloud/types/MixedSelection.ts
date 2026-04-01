/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
// ─── Enums / Union Types ───────────────────────────────────────────────────

type MonetizationModel = "AD_SUPPORTED" | "BLACKBOX" | "NOT_APPLICABLE";
type Policy = "MONETIZE" | "ALLOW";
type PlaylistType = "PLAYLIST" | "ARTIST_STATION";
type SetType = "ep" | "single" | "album" | "";
type SelectionTrackingFeature =
    | "personalized-tracks"
    | "recently-played"
    | "your-moods"
    | "made-for-you"
    | "artist-stations"
    | "liked-by"
    | "personalised-curated-global"
    | "buzzing";

type SystemPlaylistTrackingFeature =
    | "personalized-tracks"
    | "your-moods"
    | "new-for-you"
    | "weekly"
    | "artist-stations"
    | "liked-by";

// ─── Shared Primitives ────────────────────────────────────────────────────

interface Badges {
    pro: boolean;
    creator_mid_tier: boolean;
    pro_unlimited: boolean;
    verified: boolean;
}

interface TrackRef {
    id: number;
    kind: "track";
    monetization_model: MonetizationModel;
    policy: Policy;
}

interface SeedRef {
    urn: string;
    permalink: string;
}

// ─── Users ────────────────────────────────────────────────────────────────

interface BaseUser {
    avatar_url: string;
    first_name: string;
    followers_count: number;
    full_name: string;
    id: number;
    kind: "user";
    last_modified: string; // ISO 8601
    last_name: string;
    permalink: string;
    permalink_url: string;
    uri: string;
    urn: string;
    username: string;
    verified: boolean;
    city: string | null;
    country_code: string | null;
    badges: Badges;
}

interface ArtistUser extends BaseUser {
    station_urn: string;
    station_permalink: string;
}

// ─── Playlist (user-created) ──────────────────────────────────────────────

interface Playlist {
    artwork_url: string | null;
    created_at: string;
    duration: number;
    id: number;
    kind: "playlist";
    last_modified: string;
    likes_count: number;
    managed_by_feeds: boolean;
    permalink: string;
    permalink_url: string;
    public: boolean;
    reposts_count: number;
    secret_token: string | null;
    sharing: "public" | "private";
    title: string;
    track_count: number;
    uri: string;
    user_id: number;
    set_type: SetType;
    is_album: boolean;
    published_at: string | null;
    release_date: string | null;
    display_date: string;
    user: BaseUser;
}

// ─── System Playlist ──────────────────────────────────────────────────────

export interface SystemPlaylist {
    kind: "system-playlist";
    id: string;
    urn: string;
    query_urn: string;
    permalink: string;
    permalink_url: string;
    title: string;
    description: string | null;
    short_title: string | null;
    short_description: string | null;
    tracking_feature_name: SystemPlaylistTrackingFeature;
    playlist_type: PlaylistType;
    last_updated: string | null;
    artwork_url: string | null;
    calculated_artwork_url: string;
    likes_count: number;
    seed: SeedRef | null;
    tracks: TrackRef[];
    is_public: boolean;
    /** Present on personalized playlists, null on public artist stations */
    made_for: BaseUser | null;
    user: ArtistUser;
}

// ─── Selection Item ───────────────────────────────────────────────────────

/** Items within a selection can be playlists, system playlists, or users */
type SelectionItem = Playlist | SystemPlaylist | BaseUser;

// ─── Selection ────────────────────────────────────────────────────────────

interface SelectionItems {
    collection: SelectionItem[];
    next_href: string | null;
    query_urn: string | null;
}

interface Selection {
    kind: "selection";
    id: string;
    urn: string;
    query_urn: string;
    title: string;
    description: string | null;
    tracking_feature_name: SelectionTrackingFeature;
    last_updated: string | null;
    style: unknown | null;
    social_proof: unknown | null;
    social_proof_users: unknown | null;
    items: SelectionItems;
}

export interface SoundCloudMixedSelection {
    collection: Selection[];
    next_href: string | null;
    query_urn: string;
}