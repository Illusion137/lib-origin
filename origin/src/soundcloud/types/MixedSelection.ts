/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
// ─── Enums / Union Types ───────────────────────────────────────────────────

import type { Track, Playlist as PlaylistFull } from "./Search";

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

// ─── Feed Items (stream) ──────────────────────────────────────────────────

interface Reposted {
    target_urn: string;
    user_urn: string;
    caption: string | null;
}

interface PromotedTracking {
    add_to_set_click?: string[];
    sponsor_click?: string[];
    sound_finish?: string[];
    share_click?: string[];
    sound_skip?: string[];
    repost_click?: string[];
    impression?: string[];
    profile_click?: string[];
    purchase_click?: string[];
    follow_click?: string[];
    ad_click?: string[];
    like_click?: string[];
    sound_click?: string[];
    sound_play?: string[];
    [event: string]: string[] | undefined;
}

interface Promoted {
    ad_urn: string;
    sc_a_id: string;
    tracking: PromotedTracking;
}

/** A newly posted track appearing in the stream */
export interface FeedTrack {
    created_at: string;
    type: "track";
    user: ArtistUser;
    uuid: string;
    caption: string | null;
    track: Track;
}

/** A track reposted by a followed user, appearing in the stream */
export interface FeedTrackRepost {
    created_at: string;
    type: "track-repost";
    user: ArtistUser;
    uuid: string;
    caption: string | null;
    reposted: Reposted;
    track: Track;
}

/** A promoted (ad) track injected into the stream */
export interface FeedTrackPromoted {
    created_at: string;
    type: "track-promoted";
    user: null;
    uuid: string;
    caption: string | null;
    promoted: Promoted;
    track: Track;
}

/** A playlist/album posted by a followed user, appearing in the stream */
export interface FeedPlaylist {
    created_at: string;
    type: "playlist";
    user: ArtistUser;
    uuid: string;
    caption: string | null;
    playlist: PlaylistFull;
}

// ─── Selection Item ───────────────────────────────────────────────────────

/** Items within a selection can be playlists, system playlists, users, or feed tracks */
export type SelectionItem =
    | Playlist
    | SystemPlaylist
    | BaseUser
    | FeedTrack
    | FeedTrackRepost
    | FeedTrackPromoted
    | FeedPlaylist;

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