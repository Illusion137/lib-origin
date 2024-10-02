export interface Album {
    data: AlbumData
    extensions: Extensions
}

interface AlbumData {
    albumUnion: AlbumUnion
}

interface AlbumUnion {
    __typename: string
    uri: string
    name: string
    artists: Artists
    coverArt: CoverArt
    discs: Discs
    releases: Releases
    type: string
    date: Date
    playability: Playability
    label: string
    copyright: Copyright
    courtesyLine: string
    saved: boolean
    sharingInfo: SharingInfo2
    tracks: Tracks2
    moreAlbumsByArtist: MoreAlbumsByArtist
}

interface Artists {
    totalCount: number
    items: Item[]
}

interface Item {
    id: string
    uri: string
    profile: Profile
    visuals: Visuals
    sharingInfo: SharingInfo
}

interface Profile {
    name: string
}

interface Visuals {
    avatarImage: AvatarImage
}

interface AvatarImage {
    sources: Source[]
}

interface Source {
    url: string
    width: number
    height: number
}

interface SharingInfo {
    shareUrl: string
}

interface CoverArt {
    extractedColors: ExtractedColors
    sources: Source2[]
}

interface ExtractedColors {
    colorRaw: ColorRaw
    colorLight: ColorLight
    colorDark: ColorDark
}

interface ColorRaw {
    hex: string
}

interface ColorLight {
    hex: string
}

interface ColorDark {
    hex: string
}

interface Source2 {
    url: string
    width: number
    height: number
}

interface Discs {
    totalCount: number
    items: Item2[]
}

interface Item2 {
    number: number
    tracks: Tracks
}

interface Tracks {
    totalCount: number
}

interface Releases {
    totalCount: number
    items: any[]
}

interface Date {
    isoString: string
    precision: string
}

interface Playability {
    playable: boolean
    reason: string
}

interface Copyright {
    totalCount: number
    items: Item3[]
}

interface Item3 {
    type: string
    text: string
}

interface SharingInfo2 {
    shareUrl: string
    shareId: string
}

interface Tracks2 {
    totalCount: number
    items: Item4[]
}

export interface Item4 {
    uid: string
    track: Track
}

interface Track {
    saved: boolean
    uri: string
    name: string
    playcount: string
    discNumber: number
    trackNumber: number
    contentRating: ContentRating
    relinkingInformation: any
    duration: Duration
    playability: Playability2
    artists: Artists2
}

interface ContentRating {
    label: string
}

interface Duration {
    totalMilliseconds: number
}

interface Playability2 {
    playable: boolean
}

interface Artists2 {
    items: Item5[]
}

interface Item5 {
    uri: string
    profile: Profile2
}

interface Profile2 {
    name: string
}

interface MoreAlbumsByArtist {
    items: Item6[]
}

interface Item6 {
    discography: Discography
}

interface Discography {
    popularReleasesAlbums: PopularReleasesAlbums
}

interface PopularReleasesAlbums {
    items: Item7[]
}

interface Item7 {
    id: string
    uri: string
    name: string
    date: Date2
    coverArt: CoverArt2
    playability: Playability3
    sharingInfo: SharingInfo3
    type: string
}

interface Date2 {
    year: number
}

interface CoverArt2 {
    sources: Source3[]
}

interface Source3 {
    url: string
    width: number
    height: number
}

interface Playability3 {
    playable: boolean
    reason: string
}

interface SharingInfo3 {
    shareId: string
    shareUrl: string
}

interface Extensions { }
