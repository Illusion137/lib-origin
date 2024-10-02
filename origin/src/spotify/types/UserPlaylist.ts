export interface UserPlaylist {
    data: PlaylistData
    extensions: Extensions
}

interface PlaylistData {
    playlistV2: PlaylistV2
}

interface PlaylistV2 {
    __typename: string
    revisionId: string
    uri: string
    name: string
    description: string
    ownerV2: OwnerV2
    images: Images
    collaborative: boolean
    followers: number
    format: string
    attributes: any[]
    sharingInfo: SharingInfo
    content: Content
}

interface OwnerV2 {
    data: Data2
}

interface Data2 {
    __typename: string
    uri: string
    username: string
    name: string
    avatar: any
}

interface Images {
    items: Item[]
}

interface Item {
    extractedColors: ExtractedColors
    sources: Source[]
}

interface ExtractedColors {
    colorRaw: ColorRaw
}

interface ColorRaw {
    hex: string
    isFallback: boolean
}

interface Source {
    url: string
    width: number
    height: number
}

interface SharingInfo {
    shareUrl: string
}

interface Content {
    __typename: string
    totalCount: number
    pagingInfo: PagingInfo
    items: ContentItem[]
}

export interface ContentItem {
    addedAt: AddedAt
    addedBy: AddedBy
    attributes: any[]
    itemV2: ItemV2
    uid: string
}

export interface AddedAt {
    isoString: string
}

export interface AddedBy {
    data: Data
}

export interface Data {
    __typename: string
    avatar: any
    name: string
    uri: string
    username: string
}

export interface ItemV2 {
    __typename: string
    data: Data2_1
}

export interface Data2_1 {
    __typename: string
    albumOfTrack: AlbumOfTrack
    artists: Artists2
    associations: Associations
    audioAttributes: any
    contentRating: ContentRating
    discNumber: number
    trackDuration: TrackDuration
    name: string
    playability: Playability
    playcount: string
    trackNumber: number
    uri: string
}

export interface AlbumOfTrack {
    artists: Artists
    coverArt: CoverArt
    name: string
    uri: string
}

export interface Artists {
    items: ProfileItem[]
}

export interface ProfileItem {
    profile: Profile
    uri: string
}

export interface Profile {
    name: string
}

export interface CoverArt {
    sources: Source[]
}

export interface Artists2 {
    items: Item2[]
}

export interface Item2 {
    profile: Profile2
    uri: string
}

export interface Profile2 {
    name: string
}

export interface Associations {
    associatedVideos: AssociatedVideos
}

export interface AssociatedVideos {
    totalCount: number
}

export interface ContentRating {
    label: string
}

export interface TrackDuration {
    totalMilliseconds: number
}

export interface Playability {
    playable: boolean
    reason: string
}


interface PagingInfo {
    offset: number
    limit: number
}

interface Extensions { }  