import type { Status } from "@origin/instagram/types/types"

export interface AllCollections {
    items: Item[]
    more_available: boolean
    auto_load_more_enabled: boolean
    status: Status
}

export interface Item {
    collection_id: string
    collection_name: string
    collection_type: string
    collection_media_count?: number
    cover_media_list?: CoverMediaList[]
    cover_media?: CoverMedia
    viewer_access_level?: string
    collab_meta?: CollabMeta
    collection_audio_count?: number
    cover_audio_list?: CoverAudioList[]
}

export interface CoverMediaList {
    id: string
    pk: string
    strong_id__: string
    image_versions2: ImageVersions2
    media_type: number
    original_height: number
    original_width: number
    product_type: string
    accessibility_caption?: string
}

export interface ImageVersions2 {
    candidates: Candidate[]
    additional_candidates?: AdditionalCandidates
    scrubber_spritesheet_info_candidates?: ScrubberSpritesheetInfoCandidates
}

export interface Candidate {
    width: number
    height: number
    url: string
}

export interface AdditionalCandidates {
    igtv_first_frame: IgtvFirstFrame
    first_frame: FirstFrame
    smart_frame: any
}

export interface IgtvFirstFrame {
    width: number
    height: number
    url: string
}

export interface FirstFrame {
    width: number
    height: number
    url: string
}

export interface ScrubberSpritesheetInfoCandidates {
    default: Default
}

export interface Default {
    video_length: number
    thumbnail_width: number
    thumbnail_height: number
    thumbnail_duration: number
    sprite_urls: string[]
    thumbnails_per_row: number
    total_thumbnail_num_per_sprite: number
    max_thumbnails_per_sprite: number
    sprite_width: number
    sprite_height: number
    rendered_width: number
    file_size_kb: number
}

export interface CoverMedia {
    id: string
    pk: string
    strong_id__: string
    accessibility_caption: string
    image_versions2: ImageVersions22
    media_type: number
    original_height: number
    original_width: number
    product_type: string
}

export interface ImageVersions22 {
    candidates: Candidate2[]
}

export interface Candidate2 {
    width: number
    height: number
    url: string
}

export interface CollabMeta {
    ig_thread_id: string
    facepile_users: FacepileUser[]
    social_context_subtitle: string
}

export interface FacepileUser {
    pk: string
    pk_id: string
    id: string
    username: string
    full_name: string
    is_private: boolean
    strong_id__: string
    is_verified: boolean
    profile_pic_id: string
    profile_pic_url: string
}

export interface CoverAudioList {
    thumbnail_uri: string
}