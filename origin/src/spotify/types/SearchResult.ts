export interface SearchResult {
    data: Data
    extensions: Extensions
}

export interface Data {
    searchV2: SearchV2
}

export interface SearchV2 {
    albumsV2: AlbumsV2
    artists: Artists2
    audiobooks: Audiobooks
    authors: Authors
    chipOrder: ChipOrder
    episodes: Episodes
    genres: Genres
    playlists: Playlists
    podcasts: Podcasts
    topResultsV2: TopResultsV2
    tracksV2: TracksV2
    users: Users
}

export interface AlbumsV2 {
    __typename: string
    items: SpotifySearchAlbum[]
    totalCount: number
}

export interface SpotifySearchAlbum {
    __typename: string
    data: Data2
}

export interface Data2 {
    __typename: string
    artists: Artists
    coverArt: CoverArt
    date: Date
    name: string
    playability: Playability
    type: string
    uri: string
}

export interface Artists {
    items: Item2[]
}

export interface Item2 {
    profile: Profile
    uri: string
}

export interface Profile {
    name: string
}

export interface CoverArt {
    extractedColors: ExtractedColors
    sources: Source[]
}

export interface ExtractedColors {
    colorDark: ColorDark
}

export interface ColorDark {
    hex: string
    isFallback: boolean
}

export interface Source {
    height: number
    url: string
    width: number
}

export interface Date {
    year: number
}

export interface Playability {
    playable: boolean
    reason: string
}

export interface Artists2 {
    items: Item3[]
    totalCount: number
}

export interface Item3 {
    __typename: string
    data: SpotifyCompactArtist
}

export interface SpotifyCompactArtist {
    __typename: string
    profile: Profile2
    uri: string
    visuals: Visuals
}

export interface Profile2 {
    name: string
    verified: boolean
}

export interface Visuals {
    avatarImage: AvatarImage
}

export interface AvatarImage {
    extractedColors: ExtractedColors2
    sources: Source2[]
}

export interface ExtractedColors2 {
    colorDark: ColorDark2
}

export interface ColorDark2 {
    hex: string
    isFallback: boolean
}

export interface Source2 {
    height: number
    url: string
    width: number
}

export interface Audiobooks {
    items: Item4[]
    totalCount: number
}

export interface Item4 {
    __typename: string
    data: Data4
}

export interface Data4 {
    __typename: string
    accessInfo: AccessInfo
    authorsV2: AuthorsV2[]
    coverArt: CoverArt2
    description: string
    audiobookDuration: AudiobookDuration
    isPreRelease: boolean
    mediaType: string
    name: string
    preReleaseEndDateTime: PreReleaseEndDateTime
    publishDate: PublishDate
    topics: Topics
    uri: string
}

export interface AccessInfo {
    accessExplanation: AccessExplanation
    isUserMemberOfAtLeastOneGroup: boolean
    signifier: Signifier
}

export interface AccessExplanation {
    __typename: string
}

export interface Signifier {
    text: string
}

export interface AuthorsV2 {
    name: string
    uri: any
}

export interface CoverArt2 {
    extractedColors: ExtractedColors3
    sources: Source3[]
}

export interface ExtractedColors3 {
    colorDark: ColorDark3
}

export interface ColorDark3 {
    hex: string
    isFallback: boolean
}

export interface Source3 {
    height: number
    url: string
    width: number
}

export interface AudiobookDuration {
    totalMilliseconds: number
}

export interface PreReleaseEndDateTime {
    isoString: string
}

export interface PublishDate {
    isoString: string
    precision: string
}

export interface Topics {
    items: any[]
}

export interface Authors {
    __typename: string
    items: any[]
    totalCount: number
}

export interface ChipOrder {
    items: Item5[]
}

export interface Item5 {
    typeName: string
}

export interface Episodes {
    items: Item6[]
    totalCount: number
}

export interface Item6 {
    __typename: string
    data: Data5
}

export interface Data5 {
    __typename: string
    contentRating: ContentRating
    coverArt: CoverArt3
    description: string
    duration: Duration
    gatedEntityRelations: any[]
    mediaTypes: string[]
    name: string
    playability: Playability2
    playedState: PlayedState
    podcastV2: PodcastV2
    releaseDate: ReleaseDate
    restrictions: Restrictions
    uri: string
    videoPreviewThumbnail?: VideoPreviewThumbnail
}

export interface ContentRating {
    label: string
}

export interface CoverArt3 {
    extractedColors: ExtractedColors4
    sources: Source4[]
}

export interface ExtractedColors4 {
    colorDark: ColorDark4
}

export interface ColorDark4 {
    hex: string
    isFallback: boolean
}

export interface Source4 {
    height: number
    url: string
    width: number
}

export interface Duration {
    totalMilliseconds: number
}

export interface Playability2 {
    reason: string
}

export interface PlayedState {
    playPositionMilliseconds: number
    state: string
}

export interface PodcastV2 {
    __typename: string
    data: Data6
}

export interface Data6 {
    __typename: string
    coverArt: CoverArt4
    mediaType: string
    name: string
    publisher: Publisher
    uri: string
}

export interface CoverArt4 {
    sources: Source5[]
}

export interface Source5 {
    height: number
    url: string
    width: number
}

export interface Publisher {
    name: string
}

export interface ReleaseDate {
    isoString: string
    precision: string
}

export interface Restrictions {
    paywallContent: boolean
}

export interface VideoPreviewThumbnail {
    __typename: string
    imagePreview: ImagePreview
}

export interface ImagePreview {
    data: Data7
}

export interface Data7 {
    __typename: string
    sources: Source6[]
}

export interface Source6 {
    maxHeight: number
    maxWidth: number
    url: string
}

export interface Genres {
    items: any[]
    totalCount: number
}

export interface Playlists {
    items: Item7[]
    totalCount: number
}

export interface Item7 {
    __typename: string
    data: Data8
}

export interface Data8 {
    __typename: string
    attributes: Attribute[]
    description: string
    format: string
    images: Images
    name: string
    ownerV2: OwnerV2
    uri: string
}

export interface Attribute {
    key: string
    value: string
}

export interface Images {
    items: Item8[]
}

export interface Item8 {
    extractedColors: ExtractedColors5
    sources: Source7[]
}

export interface ExtractedColors5 {
    colorDark: ColorDark5
}

export interface ColorDark5 {
    hex: string
    isFallback: boolean
}

export interface Source7 {
    height?: number
    url: string
    width?: number
}

export interface OwnerV2 {
    __typename: string
    data: Data9
}

export interface Data9 {
    __typename: string
    avatar: Avatar
    name: string
    uri: string
    username: string
}

export interface Avatar {
    sources: Source8[]
}

export interface Source8 {
    height: number
    url: string
    width: number
}

export interface Podcasts {
    items: Item9[]
    totalCount: number
}

export interface Item9 {
    __typename: string
    data: Data10
}

export interface Data10 {
    __typename: string
    coverArt: CoverArt5
    mediaType: string
    name: string
    publisher: Publisher2
    topics: Topics2
    uri: string
}

export interface CoverArt5 {
    extractedColors: ExtractedColors6
    sources: Source9[]
}

export interface ExtractedColors6 {
    colorDark: ColorDark6
}

export interface ColorDark6 {
    hex: string
    isFallback: boolean
}

export interface Source9 {
    height: number
    url: string
    width: number
}

export interface Publisher2 {
    name: string
}

export interface Topics2 {
    items: Item10[]
}

export interface Item10 {
    __typename: string
    title: string
    uri: string
}

export interface TopResultsV2 {
    featured: Featured[]
    itemsV2: ItemsV2[]
}

export interface Featured {
    __typename: string
    data: Data11
}

export interface Data11 {
    __typename: string
    attributes: Attribute2[]
    description: string
    format: string
    images: Images2
    name: string
    ownerV2: OwnerV22
    uri: string
}

export interface Attribute2 {
    key: string
    value: string
}

export interface Images2 {
    items: Item11[]
}

export interface Item11 {
    extractedColors: ExtractedColors7
    sources: Source10[]
}

export interface ExtractedColors7 {
    colorDark: ColorDark7
}

export interface ColorDark7 {
    hex: string
    isFallback: boolean
}

export interface Source10 {
    height: any
    url: string
    width: any
}

export interface OwnerV22 {
    __typename: string
    data: Data12
}

export interface Data12 {
    __typename: string
    avatar: Avatar2
    name: string
    uri: string
    username: string
}

export interface Avatar2 {
    sources: Source11[]
}

export interface Source11 {
    height: number
    url: string
    width: number
}

export interface ItemsV2 {
    item: Item12
    matchedFields: any[]
}

export interface Item12 {
    __typename: string
    data: Data13
}

export interface Data13 {
    __typename: string
    profile?: Profile3
    uri: string
    visuals?: Visuals2
    artists?: Artists3
    coverArt?: CoverArt6
    date?: Date2
    name?: string
    playability?: Playability3
    type?: string
    albumOfTrack?: AlbumOfTrack
    associationsV3?: AssociationsV3
    contentRating?: ContentRating2
    duration?: Duration2
    id?: string
    trackMediaType?: string
}

export interface Profile3 {
    name: string
    verified: boolean
}

export interface Visuals2 {
    avatarImage: AvatarImage2
}

export interface AvatarImage2 {
    extractedColors: ExtractedColors8
    sources: Source12[]
}

export interface ExtractedColors8 {
    colorDark: ColorDark8
}

export interface ColorDark8 {
    hex: string
    isFallback: boolean
}

export interface Source12 {
    height: number
    url: string
    width: number
}

export interface Artists3 {
    items: Item13[]
}

export interface Item13 {
    profile: Profile4
    uri: string
}

export interface Profile4 {
    name: string
}

export interface CoverArt6 {
    extractedColors: ExtractedColors9
    sources: Source13[]
}

export interface ExtractedColors9 {
    colorDark: ColorDark9
}

export interface ColorDark9 {
    hex: string
    isFallback: boolean
}

export interface Source13 {
    height: number
    url: string
    width: number
}

export interface Date2 {
    year: number
}

export interface Playability3 {
    playable: boolean
    reason: string
}

export interface AlbumOfTrack {
    coverArt: CoverArt7
    id: string
    name: string
    uri: string
}

export interface CoverArt7 {
    extractedColors: ExtractedColors10
    sources: Source14[]
}

export interface ExtractedColors10 {
    colorDark: ColorDark10
}

export interface ColorDark10 {
    hex: string
    isFallback: boolean
}

export interface Source14 {
    height: number
    url: string
    width: number
}

export interface AssociationsV3 {
    audioAssociations: AudioAssociations
    videoAssociations: VideoAssociations
}

export interface AudioAssociations {
    totalCount: number
}

export interface VideoAssociations {
    totalCount: number
}

export interface ContentRating2 {
    label: string
}

export interface Duration2 {
    totalMilliseconds: number
}

export interface TracksV2 {
    items: SpotifySearchTrack[]
    totalCount: number
}

export interface SpotifySearchTrack {
    item: Item15
    matchedFields: any[]
}

export interface Item15 {
    __typename: string
    data: Data14
}

export interface Data14 {
    __typename: string
    albumOfTrack: AlbumOfTrack2
    artists: Artists4
    associationsV3: AssociationsV32
    contentRating: ContentRating3
    duration: Duration3
    id: string
    trackMediaType: string
    name: string
    playability: Playability4
    uri: string
}

export interface AlbumOfTrack2 {
    coverArt: CoverArt8
    id: string
    name: string
    uri: string
}

export interface CoverArt8 {
    extractedColors: ExtractedColors11
    sources: Source15[]
}

export interface ExtractedColors11 {
    colorDark: ColorDark11
}

export interface ColorDark11 {
    hex: string
    isFallback: boolean
}

export interface Source15 {
    height: number
    url: string
    width: number
}

export interface Artists4 {
    items: Item16[]
}

export interface Item16 {
    profile: Profile5
    uri: string
}

export interface Profile5 {
    name: string
}

export interface AssociationsV32 {
    audioAssociations: AudioAssociations2
    videoAssociations: VideoAssociations2
}

export interface AudioAssociations2 {
    totalCount: number
}

export interface VideoAssociations2 {
    totalCount: number
}

export interface ContentRating3 {
    label: string
}

export interface Duration3 {
    totalMilliseconds: number
}

export interface Playability4 {
    playable: boolean
    reason: string
}

export interface Users {
    items: Item17[]
    totalCount: number
}

export interface Item17 {
    __typename: string
    data: Data15
}

export interface Data15 {
    __typename: string
    avatar: Avatar3
    id: string
    displayName: string
    uri: string
    username: string
}

export interface Avatar3 {
    extractedColors: ExtractedColors12
    sources: Source16[]
}

export interface ExtractedColors12 {
    colorDark: ColorDark12
}

export interface ColorDark12 {
    hex: string
    isFallback: boolean
}

export interface Source16 {
    height: number
    url: string
    width: number
}

export interface Extensions {
    requestIds: RequestIds
}

export interface RequestIds {
    "/searchV2": SearchV22
    "/searchV2/topResultsV2": SearchV2TopResultsV2
}

export interface SearchV22 {
    "search-api": string
}

export interface SearchV2TopResultsV2 {
    "search-api": string
}
