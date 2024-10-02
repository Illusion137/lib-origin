export type Hydration = (HydratableUser | HydratablePlaylist | HydratableSound | HydratableId)[]

export interface HydratableId {
    hydratable: "anonymousId"
    data: string
}

export interface HydratableUser {
    hydratable: "user"
    data: UserData
}

export interface HydratableSound {
    hydratable: "sound"
    data: SoundData
}

export interface UserData {
    avatar_url: string
    city: string
    comments_count: number
    country_code: string
    created_at: string
    creator_subscriptions: CreatorSubscription[]
    creator_subscription: CreatorSubscription2
    description: string
    followers_count: number
    followings_count: number
    first_name: string
    full_name: string
    groups_count: number
    id: number
    kind: string
    last_modified: string
    last_name: string
    likes_count: number
    playlist_likes_count: number
    permalink: string
    permalink_url: string
    playlist_count: number
    reposts_count: any
    track_count: number
    uri: string
    urn: string
    username: string
    verified: boolean
    visuals: Visuals
    badges: Badges
    station_urn: string
    station_permalink: string
    url: string
}

export interface CreatorSubscription {
    product: Product
}

export interface Product {
    id: string
}

export interface CreatorSubscription2 {
    product: Product2
}

export interface Product2 {
    id: string
}

export interface Visuals {
    urn: string
    enabled: boolean
    visuals: Visual[]
    tracking: any
}

export interface Visual {
    urn: string
    entry_time: number
    visual_url: string
}

export interface Badges {
    pro: boolean
    creator_mid_tier: boolean
    pro_unlimited: boolean
    verified: boolean
}

export interface HydratablePlaylist {
    hydratable: "playlist"
    data: Data
}

export interface Data {
    artwork_url: any
    created_at: string
    description: any
    duration: number
    embeddable_by: string
    genre: string
    id: number
    kind: string
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
    user: User
    tracks: Track[]
    track_count: number
    url: string
}

export interface SoundData {
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
    kind: string
    label_name: any
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
    contains_music: boolean
    isrc: string
    explicit: boolean
    writer_composer: string
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

export interface User {
    avatar_url: string
    city: string
    comments_count: number
    country_code: string
    created_at: string
    creator_subscriptions: CreatorSubscription[]
    creator_subscription: CreatorSubscription2
    description: string
    followers_count: number
    followings_count: number
    first_name: string
    full_name: string
    groups_count: number
    id: number
    kind: string
    last_modified: string
    last_name: string
    likes_count: number
    playlist_likes_count: number
    permalink: string
    permalink_url: string
    playlist_count: number
    reposts_count: any
    track_count: number
    uri: string
    urn: string
    username: string
    verified: boolean
    visuals: Visuals
    badges: Badges
    station_urn: string
    station_permalink: string
}

export interface CreatorSubscription {
    product: Product
}

export interface Product {
    id: string
}

export interface CreatorSubscription2 {
    product: Product2
}

export interface Product2 {
    id: string
}

export interface Visuals {
    urn: string
    enabled: boolean
    visuals: Visual[]
    tracking: any
}

export interface Visual {
    urn: string
    entry_time: number
    visual_url: string
}

export interface Badges {
    pro: boolean
    creator_mid_tier: boolean
    pro_unlimited: boolean
    verified: boolean
}

export interface User {
    avatar_url: string
    city: string
    comments_count: number
    country_code: string
    created_at: string
    creator_subscriptions: CreatorSubscription[]
    creator_subscription: CreatorSubscription2
    description: string
    followers_count: number
    followings_count: number
    first_name: string
    full_name: string
    groups_count: number
    id: number
    kind: string
    last_modified: string
    last_name: string
    likes_count: number
    playlist_likes_count: number
    permalink: string
    permalink_url: string
    playlist_count: number
    reposts_count: any
    track_count: number
    uri: string
    urn: string
    username: string
    verified: boolean
    visuals: Visuals
    badges: Badges
    station_urn: string
    station_permalink: string
}

export interface CreatorSubscription {
    product: Product
}

export interface Product {
    id: string
}

export interface CreatorSubscription2 {
    product: Product2
}

export interface Product2 {
    id: string
}

export interface Visuals {
    urn: string
    enabled: boolean
    visuals: Visual[]
    tracking: any
}

export interface Visual {
    urn: string
    entry_time: number
    visual_url: string
}

export interface Badges {
    pro: boolean
    creator_mid_tier: boolean
    pro_unlimited: boolean
    verified: boolean
}

export interface Track {
    artwork_url?: string
    caption: any
    commentable?: boolean
    comment_count?: number
    created_at?: string
    description?: string
    downloadable?: boolean
    download_count?: number
    duration: number
    full_duration?: number
    embeddable_by?: string
    genre?: string
    has_downloads_left?: boolean
    id: number
    kind: string
    label_name: any
    last_modified?: string
    license?: string
    likes_count?: number
    permalink?: string
    permalink_url?: string
    playback_count?: number
    public?: boolean
    publisher_metadata?: PublisherMetadata
    purchase_title: any
    purchase_url: any
    release_date: any
    reposts_count?: number
    secret_token: any
    sharing?: string
    state?: string
    streamable?: boolean
    tag_list?: string
    title: string
    uri?: string
    urn?: string
    user_id?: number
    visuals: any
    waveform_url?: string
    display_date?: string
    media?: Media
    station_urn?: string
    station_permalink?: string
    track_authorization?: string
    monetization_model: string
    policy: string
    user: User2
}

export interface PublisherMetadata {
    id: number
    urn: string
    artist: string
    contains_music: boolean
    isrc: string
    explicit: boolean
    writer_composer: string
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

export interface User2 {
    avatar_url: string
    first_name: string
    followers_count: number
    full_name: string
    id: number
    kind: string
    last_modified: string
    last_name: string
    permalink: string
    permalink_url: string
    uri: string
    urn: string
    username: string
    verified: boolean
    city: string
    country_code: string
    badges: Badges2
    station_urn: string
    station_permalink: string
}

export interface Badges2 {
    pro: boolean
    creator_mid_tier: boolean
    pro_unlimited: boolean
    verified: boolean
}
