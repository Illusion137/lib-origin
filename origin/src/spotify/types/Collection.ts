export interface Collection {
    data: Data
    extensions: Extensions
}

interface Data {
    me: Me
}

interface Me {
    library: Library
}

interface Library {
    tracks: Tracks
}

interface Tracks {
    __typename: string
    items: CollectionItem[]
    pagingInfo: PagingInfo
    totalCount: number
}

export interface CollectionItem {
    __typename: string
    addedAt: AddedAt
    track: Track
}

interface AddedAt {
    isoString: string
}

interface Track {
    _uri: string
    data: Data2
}

interface Data2 {
    __typename: string
    albumOfTrack: AlbumOfTrack
    artists: Artists2
    associations: Associations
    contentRating: ContentRating
    discNumber: number
    duration: Duration
    name: string
    playability: Playability
    trackNumber: number
}

interface AlbumOfTrack {
    artists: Artists
    coverArt: CoverArt
    name: string
    uri: string
}

interface Artists {
    items: Item2[]
}

interface Item2 {
    profile: Profile
    uri: string
}

interface Profile {
    name: string
}

interface CoverArt {
    sources: Source[]
}

interface Source {
    height: number
    url: string
    width: number
}

interface Artists2 {
    items: Item3[]
}

interface Item3 {
    profile: Profile2
    uri: string
}

interface Profile2 {
    name: string
}

interface Associations {
    associatedVideos: AssociatedVideos
}

interface AssociatedVideos {
    totalCount: number
}

interface ContentRating {
    label: string
}

interface Duration {
    totalMilliseconds: number
}

interface Playability {
    playable: boolean
}

interface PagingInfo {
    limit: number
    offset: number
}

interface Extensions { }