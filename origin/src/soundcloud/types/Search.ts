import { HydratableUser } from "./Hydration"

export interface ArtistUser<T> {
    user: HydratableUser
    artist_data: SearchOf<T>
}

export interface SearchOf<T> {
    collection: (T)[]
    total_results: number
    facets: Facet[]
    next_href: string
    query_urn: string
}

export interface Search {
    collection: (User | Playlist | Track)[]
    total_results: number
    facets: Facet[]
    next_href: string
    query_urn: string
}

export interface Facet {
    name: string
    facets: any[]
}

export interface User {
    avatar_url: string
    city: string
    comments_count: number
    country_code: string
    created_at: string
    creator_subscriptions: any[]
    creator_subscription: any[]
    description: string
    followers_count: number
    followings_count: number
    first_name: string
    full_name: string
    groups_count: number
    id: number
    kind: "user"
    last_modified: string
    last_name: string
    likes_count: number
    playlist_likes_count: number
    permalink: string
    permalink_url: string
    playlist_count: number
    reposts_count: number
    track_count: number
    uri: string
    urn: string
    username: string
    verified: boolean
    visuals: any[]
    badges: any[]
    station_urn: string
    station_permalink: string
}

export interface Track {
    artwork_url: string
    caption: any
    commentable: boolean
    comment_count: number
    created_at: string
    description: string
    downloadable: boolean
    download_count: number
    duration: number
    full_duration: number
    embeddable_by: string
    genre: string
    has_downloads_left: boolean
    id: number
    kind: "track"
    label_name: string
    last_modified: string
    license: string
    likes_count: number
    permalink: string
    permalink_url: string
    playback_count: number
    public: boolean
    publisher_metadata: any[]
    purchase_title: any
    purchase_url: any
    release_date: any
    reposts_count: number
    secret_token: any
    sharing: string
    state: string
    streamable: boolean
    tag_list: string
    title: string
    uri: string
    urn: string
    user_id: number
    visuals: any
    waveform_url: string
    display_date: string
    media: Media[]
    station_urn: string
    station_permalink: string
    track_authorization: string
    monetization_model: string
    policy: string
    user: User
}

export interface Playlist {
    artwork_url: any
    created_at: string
    description: any
    duration: number
    embeddable_by: string
    genre: string
    id: number
    kind: "playlist"
    label_name: any
    last_modified: string
    license: string
    likes_count: number
    managed_by_feeds: boolean
    permalink: string
    permalink_url: string
    public: boolean
    purchase_title: any
    purchase_url: any
    release_date: any
    reposts_count: number
    secret_token: any
    sharing: string
    tag_list: string
    title: string
    uri: string
    user_id: number
    set_type: string
    is_album: boolean
    published_at: string
    display_date: string
    user: User | User[]
    tracks: (Track0 | Track1)[]
    track_count: number
}

export interface Track0 {
    id: number
    kind: string
    monetization_model: string
    policy: string
}


export interface Track1 {
    artwork_url: string
    caption: any
    commentable: boolean
    comment_count: number
    created_at: string
    description: any
    downloadable: boolean
    download_count: number
    duration: number
    full_duration: number
    embeddable_by: string
    genre: string
    has_downloads_left: boolean
    id: number
    kind: string
    label_name: string
    last_modified: string
    license: string
    likes_count: number
    permalink: string
    permalink_url: string
    playback_count: number
    public: boolean
    publisher_metadata: PublisherMetadata
    purchase_title: any
    purchase_url: any
    release_date: string
    reposts_count: number
    secret_token: any
    sharing: string
    state: string
    streamable: boolean
    tag_list: string
    title: string
    uri: string
    urn: string
    user_id: number
    visuals: any
    waveform_url: string
    display_date: string
    media: Media
    station_urn: string
    station_permalink: string
    track_authorization: string
    monetization_model: string
    policy: string
    user: User
}

export interface PublisherMetadata {
    id: number
    urn: string
    artist: string
    album_title: string
    contains_music: boolean
    upc_or_ean: string
    isrc: string
    explicit: boolean
    p_line: string
    p_line_for_display: string
    c_line: string
    c_line_for_display: string
    release_title: string
}

export interface Media {
    transcodings: Transcoding[]
}

export interface Transcoding {
    url: string
    preset: string
    duration: number
    snipped: boolean
    format: Format
    quality: string
}

export interface Format {
    protocol: string
    mime_type: string
}

export interface Badges {
    pro: boolean
    creator_mid_tier: boolean
    pro_unlimited: boolean
    verified: boolean
}
