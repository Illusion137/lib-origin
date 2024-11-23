import { ResponseError } from "../../utils/types"

export type Explore = ExploreSuccess|ResponseError;
export interface ExploreSuccess {
    success: Success
}
export interface Success {
    modules: Module[]
    top_tracks: TopTrack[]
}  
export interface Module {
    identifier: string
    placements: Placement[]
    type: string
    title?: string
} 
export interface Placement {
    icon_image_url: string
    subtitle: string
    title: string
    track?: Track
    playlist?: Playlist
} 
export interface Track {
    duration: number
    id: string
    title: string
    user: string
} 
export interface Playlist {
    name: string
    youtube_playlist_id?: string
    musi_playlist_id?: string
}  
export interface TopTrack {
    duration: number
    id: string
    title: string
    user: string
}  