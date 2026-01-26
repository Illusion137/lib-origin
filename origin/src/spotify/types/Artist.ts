export interface Artist {
    data: Data
}

export interface Data {
    artistUnion: ArtistUnion
}

export interface ArtistUnion {
    __typename: string
    discography: Discography
    goods: Goods
    id: string
    profile: Profile2
    relatedContent: RelatedContent
    relatedVideos: RelatedVideos
    saved: boolean
    sharingInfo: SharingInfo6
    stats: Stats
    uri: string
    visuals: Visuals2
}

export interface Discography {
    albums: Albums
    compilations: Compilations
    latest: Latest
    popularReleasesAlbums: PopularReleasesAlbums
    singles: Singles
    topTracks: TopTracks
}

export interface Albums {
    items: Item[]
    totalCount: number
}

export interface Item {
    releases: Releases
}

export interface Releases {
    items: SpotifyArtistAlbum[]
}

export interface SpotifyArtistAlbum {
    copyright: Copyright
    coverArt: CoverArt
    date: Date
    id: string
    label: string
    name: string
    playability: Playability
    sharingInfo: SharingInfo
    tracks: Tracks
    type: string
    uri: string
}

export interface Copyright {
    items: Item3[]
}

export interface Item3 {
    text: string
    type: string
}

export interface CoverArt {
    sources: Source[]
}

export interface Source {
    height: number
    url: string
    width: number
}

export interface Date {
    day: number
    month: number
    precision: string
    year: number
}

export interface Playability {
    playable: boolean
    reason: string
}

export interface SharingInfo {
    shareId: string
    shareUrl: string
}

export interface Tracks {
    totalCount: number
}

export interface Compilations {
    items: any[]
    totalCount: number
}

export interface Latest {
    copyright: Copyright2
    coverArt: CoverArt2
    date: Date2
    id: string
    label: string
    name: string
    playability: Playability2
    sharingInfo: SharingInfo2
    tracks: Tracks2
    type: string
    uri: string
}

export interface Copyright2 {
    items: Item4[]
}

export interface Item4 {
    text: string
    type: string
}

export interface CoverArt2 {
    sources: Source2[]
}

export interface Source2 {
    height: number
    url: string
    width: number
}

export interface Date2 {
    day: number
    month: number
    precision: string
    year: number
}

export interface Playability2 {
    playable: boolean
    reason: string
}

export interface SharingInfo2 {
    shareId: string
    shareUrl: string
}

export interface Tracks2 {
    totalCount: number
}

export interface PopularReleasesAlbums {
    items: Item5[]
    totalCount: number
}

export interface Item5 {
    copyright: Copyright3
    coverArt: CoverArt3
    date: Date3
    id: string
    label: string
    name: string
    playability: Playability3
    sharingInfo: SharingInfo3
    tracks: Tracks3
    type: string
    uri: string
}

export interface Copyright3 {
    items: Item6[]
}

export interface Item6 {
    text: string
    type: string
}

export interface CoverArt3 {
    sources: Source3[]
}

export interface Source3 {
    height: number
    url: string
    width: number
}

export interface Date3 {
    day: number
    month: number
    precision: string
    year: number
}

export interface Playability3 {
    playable: boolean
    reason: string
}

export interface SharingInfo3 {
    shareId: string
    shareUrl: string
}

export interface Tracks3 {
    totalCount: number
}

export interface Singles {
    items: Item7[]
    totalCount: number
}

export interface Item7 {
    releases: Releases2
}

export interface Releases2 {
    items: Item8[]
}

export interface Item8 {
    copyright: Copyright4
    coverArt: CoverArt4
    date: Date4
    id: string
    label: string
    name: string
    playability: Playability4
    sharingInfo: SharingInfo4
    tracks: Tracks4
    type: string
    uri: string
}

export interface Copyright4 {
    items: Item9[]
}

export interface Item9 {
    text: string
    type: string
}

export interface CoverArt4 {
    sources: Source4[]
}

export interface Source4 {
    height: number
    url: string
    width: number
}

export interface Date4 {
    day: number
    month: number
    precision: string
    year: number
}

export interface Playability4 {
    playable: boolean
    reason: string
}

export interface SharingInfo4 {
    shareId: string
    shareUrl: string
}

export interface Tracks4 {
    totalCount: number
}

export interface TopTracks {
    items: SpotifyArtistTrack[]
}

export interface SpotifyArtistTrack {
    track: Track
    uid: string
}

export interface Track {
    albumOfTrack: AlbumOfTrack
    artists: Artists
    associations: Associations
    contentRating: ContentRating
    discNumber: number
    duration: Duration
    id: string
    name: string
    playability: Playability5
    playcount: string
    uri: string
}

export interface AlbumOfTrack {
    coverArt: CoverArt5
    uri: string
}

export interface CoverArt5 {
    sources: Source5[]
}

export interface Source5 {
    url: string
}

export interface Artists {
    items: Item11[]
}

export interface Item11 {
    profile: Profile
    uri: string
}

export interface Profile {
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

export interface Duration {
    totalMilliseconds: number
}

export interface Playability5 {
    playable: boolean
    reason: string
}

export interface Goods {
    events: Events
    merch: Merch
}

export interface Events {
    concerts: Concerts
    userLocation: UserLocation
}

export interface Concerts {
    items: any[]
    pagingInfo: PagingInfo
    totalCount: number
}

export interface PagingInfo {
    limit: number
}

export interface UserLocation {
    name: string
}

export interface Merch {
    items: any[]
}

export interface Profile2 {
    biography: Biography
    externalLinks: ExternalLinks
    name: string
    pinnedItem: PinnedItem
    playlistsV2: PlaylistsV2
    verified: boolean
}

export interface Biography {
    text: any
    type: string
}

export interface ExternalLinks {
    items: Item12[]
}

export interface Item12 {
    name: string
    url: string
}

export interface PinnedItem {
    backgroundImage: BackgroundImage
    comment: string
    itemV2: ItemV2
    type: string
}

export interface BackgroundImage {
    sources: Source6[]
}

export interface Source6 {
    url: string
}

export interface ItemV2 {
    __typename: string
    data: Data2
}

export interface Data2 {
    __typename: string
    images: Images
    name: string
    uri: string
}

export interface Images {
    items: Item13[]
}

export interface Item13 {
    sources: Source7[]
}

export interface Source7 {
    height: any
    url: string
    width: any
}

export interface PlaylistsV2 {
    items: Item14[]
    totalCount: number
}

export interface Item14 {
    data: Data3
}

export interface Data3 {
    __typename: string
    description: string
    images: Images2
    name: string
    ownerV2: OwnerV2
    uri: string
}

export interface Images2 {
    items: Item15[]
}

export interface Item15 {
    sources: Source8[]
}

export interface Source8 {
    height: any
    url: string
    width: any
}

export interface OwnerV2 {
    data: Data4
}

export interface Data4 {
    __typename: string
    name: string
}

export interface RelatedContent {
    appearsOn: AppearsOn
    discoveredOnV2: DiscoveredOnV2
    featuringV2: FeaturingV2
    relatedArtists: RelatedArtists
}

export interface AppearsOn {
    items: Item16[]
    totalCount: number
}

export interface Item16 {
    releases: Releases3
}

export interface Releases3 {
    items: SpotifyArtistApearsOn[]
    totalCount: number
}

export interface SpotifyArtistApearsOn {
    artists: Artists2
    coverArt: CoverArt6
    date: Date5
    id: string
    name: string
    sharingInfo: SharingInfo5
    type: string
    uri: string
}

export interface Artists2 {
    items: Item18[]
}

export interface Item18 {
    profile: Profile3
    uri: string
}

export interface Profile3 {
    name: string
}

export interface CoverArt6 {
    sources: Source9[]
}

export interface Source9 {
    height: number
    url: string
    width: number
}

export interface Date5 {
    year: number
}

export interface SharingInfo5 {
    shareId: string
    shareUrl: string
}

export interface DiscoveredOnV2 {
    items: Item19[]
    totalCount: number
}

export interface Item19 {
    data: Data5
}

export interface Data5 {
    __typename: string
    description?: string
    id?: string
    images?: Images3
    name?: string
    ownerV2?: OwnerV22
    uri?: string
}

export interface Images3 {
    items: Item20[]
    totalCount: number
}

export interface Item20 {
    sources: Source10[]
}

export interface Source10 {
    height?: number
    url: string
    width?: number
}

export interface OwnerV22 {
    data: Data6
}

export interface Data6 {
    __typename: string
    name: string
}

export interface FeaturingV2 {
    items: Item21[]
    totalCount: number
}

export interface Item21 {
    data: Data7
}

export interface Data7 {
    __typename: string
    description: string
    id: string
    images: Images4
    name: string
    ownerV2: OwnerV23
    uri: string
}

export interface Images4 {
    items: Item22[]
    totalCount: number
}

export interface Item22 {
    sources: Source11[]
}

export interface Source11 {
    height: any
    url: string
    width: any
}

export interface OwnerV23 {
    data: Data8
}

export interface Data8 {
    __typename: string
    name: string
}

export interface RelatedArtists {
    items: SpotifySimliarArtist[]
    totalCount: number
}

export interface SpotifySimliarArtist {
    id: string
    profile: Profile4
    uri: string
    visuals: Visuals
}

export interface Profile4 {
    name: string
}

export interface Visuals {
    avatarImage: AvatarImage
}

export interface AvatarImage {
    sources: Source12[]
}

export interface Source12 {
    height: number
    url: string
    width: number
}

export interface RelatedVideos {
    __typename: string
    items: any[]
    totalCount: number
}

export interface SharingInfo6 {
    shareId: string
    shareUrl: string
}

export interface Stats {
    followers: number
    monthlyListeners: number
    topCities: TopCities
    worldRank: number
}

export interface TopCities {
    items: Item24[]
}

export interface Item24 {
    city: string
    country: string
    numberOfListeners: number
    region: string
}

export interface Visuals2 {
    avatarImage: AvatarImage2
    gallery: Gallery
    headerImage: any
}

export interface AvatarImage2 {
    extractedColors: ExtractedColors
    sources: Source13[]
}

export interface ExtractedColors {
    colorRaw: ColorRaw
}

export interface ColorRaw {
    hex: string
}

export interface Source13 {
    height: number
    url: string
    width: number
}

export interface Gallery {
    items: any[]
}
