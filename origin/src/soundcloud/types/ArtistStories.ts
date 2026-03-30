export interface ArtistStories {
    artist_urn: string
    last_read_story_timestamp: string
    stories: Story[]
}

export interface Story {
    created_at: string
    target_urn: string
    type: string
    snippeted_track: SnippetedTrack
}

export interface SnippetedTrack {
    artwork_url: string
    caption: any
    id: number
    kind: string
    last_modified: string
    permalink: string
    permalink_url: string
    public: boolean
    secret_token: any
    sharing: string
    title: string
    uri: string
    urn: string
    user_id: number
    full_duration: number
    duration: number
    display_date: string
    media: Media
    station_urn: string
    station_permalink: string
    track_authorization: string
    monetization_model: string
    policy: string
    user: User
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
    is_legacy_transcoding: boolean
}

export interface Format {
    protocol: string
    mime_type: string
}

export interface User {
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
    badges: Badges
    station_urn: string
    station_permalink: string
}

export interface Badges {
    pro: boolean
    creator_mid_tier: boolean
    pro_unlimited: boolean
    verified: boolean
}
