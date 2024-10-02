export interface SearchResult {
    data: Data
    extensions: Extensions
}

interface Data {
    searchV2: SearchV2
}

interface SearchV2 {
    albumsV2: AlbumsV2
    artists: Artists2
    audiobooks: Audiobooks
    chipOrder: ChipOrder
    episodes: Episodes
    genres: Genres
    playlists: Playlists
    podcasts: Podcasts
    topResultsV2: TopResultsV2
    tracksV2: TracksV2
    users: Users
}

interface AlbumsV2 {
    __typename: string
    items: Item[]
    totalCount: number
}

interface Item {
    __typename: string
    data: Data2
}

interface Data2 {
    __typename: string
    artists: Artists
    coverArt: CoverArt
    date: Date
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
    extractedColors: ExtractedColors
    sources: Source[]
}

interface ExtractedColors {
    colorDark: ColorDark
}

interface ColorDark {
    hex: string
    isFallback: boolean
}

interface Source {
    height: number
    url: string
    width: number
}

interface Date {
    year: number
}

interface Artists2 {
    items: Item3[]
    totalCount: number
}

interface Item3 {
    __typename: string
    data: Data3
}

interface Data3 {
    __typename: string
    profile: Profile2
    uri: string
    visuals: Visuals
}

interface Profile2 {
    name: string
    verified: boolean
}

interface Visuals {
    avatarImage?: AvatarImage
}

interface AvatarImage {
    extractedColors: ExtractedColors2
    sources: Source2[]
}

interface ExtractedColors2 {
    colorDark: ColorDark2
}

interface ColorDark2 {
    hex: string
    isFallback: boolean
}

interface Source2 {
    height: number
    url: string
    width: number
}

interface Audiobooks {
    items: Item4[]
    totalCount: number
}

interface Item4 {
    __typename: string
    data: Data4
}

interface Data4 {
    __typename: string
    accessInfo: AccessInfo
    authors: Author[]
    coverArt: CoverArt2
    isPreRelease: boolean
    mediaType: string
    name: string
    publishDate: PublishDate
    topics: Topics
    uri: string
}

interface AccessInfo {
    signifier: Signifier
}

interface Signifier {
    text: string
}

interface Author {
    name: string
}

interface CoverArt2 {
    extractedColors: ExtractedColors3
    sources: Source3[]
}

interface ExtractedColors3 {
    colorDark: ColorDark3
}

interface ColorDark3 {
    hex: string
    isFallback: boolean
}

interface Source3 {
    height: number
    url: string
    width: number
}

interface PublishDate {
    isoString: string
}

interface Topics {
    items: any[]
}

interface ChipOrder {
    items: Item5[]
}

interface Item5 {
    typeName: string
}

interface Episodes {
    items: Item6[]
    totalCount: number
}

interface Item6 {
    __typename: string
    data: Data5
}

interface Data5 {
    __typename: string
    contentRating: ContentRating
    coverArt: CoverArt3
    description: string
    duration: Duration
    mediaTypes: string[]
    name: string
    playability: Playability
    playedState: PlayedState
    podcastV2: PodcastV2
    releaseDate: ReleaseDate
    restrictions: Restrictions
    uri: string
}

interface ContentRating {
    label: string
}

interface CoverArt3 {
    extractedColors: ExtractedColors4
    sources: Source4[]
}

interface ExtractedColors4 {
    colorDark: ColorDark4
}

interface ColorDark4 {
    hex: string
    isFallback: boolean
}

interface Source4 {
    height: number
    url: string
    width: number
}

interface Duration {
    totalMilliseconds: number
}

interface Playability {
    reason: string
}

interface PlayedState {
    playPositionMilliseconds: number
    state: string
}

interface PodcastV2 {
    __typename: string
    data: Data6
}

interface Data6 {
    __typename: string
    coverArt: CoverArt4
    mediaType: string
    name: string
    publisher: Publisher
    uri: string
}

interface CoverArt4 {
    sources: Source5[]
}

interface Source5 {
    height: number
    url: string
    width: number
}

interface Publisher {
    name: string
}

interface ReleaseDate {
    isoString: string
    precision: string
}

interface Restrictions {
    paywallContent: boolean
}

interface Genres {
    items: any[]
    totalCount: number
}

interface Playlists {
    items: Item7[]
    totalCount: number
}

interface Item7 {
    __typename: string
    data: Data7
}

interface Data7 {
    __typename: string
    attributes: Attribute[]
    description: string
    format: string
    images: Images
    name: string
    ownerV2: OwnerV2
    uri: string
}

interface Attribute {
    key: string
    value: string
}

interface Images {
    items: Item8[]
}

interface Item8 {
    extractedColors: ExtractedColors5
    sources: Source6[]
}

interface ExtractedColors5 {
    colorDark: ColorDark5
}

interface ColorDark5 {
    hex: string
    isFallback: boolean
}

interface Source6 {
    height: number
    url: string
    width: number
}

interface OwnerV2 {
    __typename: string
    data: Data8
}

interface Data8 {
    __typename: string
    avatar: Avatar
    name: string
    uri: string
    username: string
}

interface Avatar {
    sources: Source7[]
}

interface Source7 {
    height: number
    url: string
    width: number
}

interface Podcasts {
    items: Item9[]
    totalCount: number
}

interface Item9 {
    __typename: string
    data: Data9
}

interface Data9 {
    __typename: string
    coverArt: CoverArt5
    mediaType: string
    name: string
    publisher: Publisher2
    topics: Topics2
    uri: string
}

interface CoverArt5 {
    extractedColors: ExtractedColors6
    sources: Source8[]
}

interface ExtractedColors6 {
    colorDark: ColorDark6
}

interface ColorDark6 {
    hex: string
    isFallback: boolean
}

interface Source8 {
    height: number
    url: string
    width: number
}

interface Publisher2 {
    name: string
}

interface Topics2 {
    items: Item10[]
}

interface Item10 {
    __typename: string
    title: string
    uri: string
}

interface TopResultsV2 {
    featured: Featured[]
    itemsV2: ItemsV2[]
}

interface Featured {
    __typename: string
    data: Data10
}

interface Data10 {
    __typename: string
    attributes: Attribute2[]
    description: string
    format: string
    images: Images2
    name: string
    ownerV2: OwnerV22
    uri: string
}

interface Attribute2 {
    key: string
    value: string
}

interface Images2 {
    items: Item11[]
}

interface Item11 {
    extractedColors: ExtractedColors7
    sources: Source9[]
}

interface ExtractedColors7 {
    colorDark: ColorDark7
}

interface ColorDark7 {
    hex: string
    isFallback: boolean
}

interface Source9 {
    height: any
    url: string
    width: any
}

interface OwnerV22 {
    __typename: string
    data: Data11
}

interface Data11 {
    __typename: string
    avatar: Avatar2
    name: string
    uri: string
    username: string
}

interface Avatar2 {
    sources: Source10[]
}

interface Source10 {
    height: number
    url: string
    width: number
}

interface ItemsV2 {
    item: Item12
    matchedFields: string[]
}

interface Item12 {
    __typename: string
    data: Data12
}

interface Data12 {
    __typename: string
    profile?: Profile3
    uri: string
    visuals?: Visuals2
    contentRating?: ContentRating2
    coverArt?: CoverArt6
    description?: string
    duration?: Duration2
    mediaTypes?: string[]
    name?: string
    playability?: Playability2
    playedState?: PlayedState2
    podcastV2?: PodcastV22
    releaseDate?: ReleaseDate2
    restrictions?: Restrictions2
    attributes?: any[]
    format?: string
    images?: Images3
    ownerV2?: OwnerV23
    albumOfTrack?: AlbumOfTrack
    artists?: Artists3
    associations?: Associations
    id?: string
}

interface Profile3 {
    name: string
    verified: boolean
}

interface Visuals2 {
    avatarImage: AvatarImage2
}

interface AvatarImage2 {
    extractedColors: ExtractedColors8
    sources: Source11[]
}

interface ExtractedColors8 {
    colorDark: ColorDark8
}

interface ColorDark8 {
    hex: string
    isFallback: boolean
}

interface Source11 {
    height: number
    url: string
    width: number
}

interface ContentRating2 {
    label: string
}

interface CoverArt6 {
    extractedColors: ExtractedColors9
    sources: Source12[]
}

interface ExtractedColors9 {
    colorDark: ColorDark9
}

interface ColorDark9 {
    hex: string
    isFallback: boolean
}

interface Source12 {
    height: number
    url: string
    width: number
}

interface Duration2 {
    totalMilliseconds: number
}

interface Playability2 {
    playable?: boolean
    reason?: string
}

interface PlayedState2 {
    playPositionMilliseconds: number
    state: string
}

interface PodcastV22 {
    __typename: string
    data: Data13
}

interface Data13 {
    __typename: string
    coverArt: CoverArt7
    mediaType: string
    name: string
    publisher: Publisher3
    uri: string
}

interface CoverArt7 {
    sources: Source13[]
}

interface Source13 {
    height: number
    url: string
    width: number
}

interface Publisher3 {
    name: string
}

interface ReleaseDate2 {
    isoString: string
    precision: string
}

interface Restrictions2 {
    paywallContent: boolean
}

interface Images3 {
    items: Item13[]
}

interface Item13 {
    extractedColors: ExtractedColors10
    sources: Source14[]
}

interface ExtractedColors10 {
    colorDark: ColorDark10
}

interface ColorDark10 {
    hex: string
    isFallback: boolean
}

interface Source14 {
    height: number
    url: string
    width: number
}

interface OwnerV23 {
    __typename: string
    data: Data14
}

interface Data14 {
    __typename: string
    avatar: Avatar3
    name: string
    uri: string
    username: string
}

interface Avatar3 {
    sources: Source15[]
}

interface Source15 {
    height: number
    url: string
    width: number
}

interface AlbumOfTrack {
    coverArt: CoverArt8
    id: string
    name: string
    uri: string
}

interface CoverArt8 {
    extractedColors: ExtractedColors11
    sources: Source16[]
}

interface ExtractedColors11 {
    colorDark: ColorDark11
}

interface ColorDark11 {
    hex: string
    isFallback: boolean
}

interface Source16 {
    height: number
    url: string
    width: number
}

interface Artists3 {
    items: Item14[]
}

interface Item14 {
    profile: Profile4
    uri: string
}

interface Profile4 {
    name: string
}

interface Associations {
    associatedVideos: AssociatedVideos
}

interface AssociatedVideos {
    totalCount: number
}

interface TracksV2 {
    items: Item15[]
    totalCount: number
}

export interface SpotifySearchTrack {
    item: Item16
    matchedFields: string[]
}

interface Item16 {
    __typename: string
    data: Data15
}

interface Data15 {
    __typename: string
    albumOfTrack: AlbumOfTrack2
    artists: Artists4
    associations: Associations2
    contentRating: ContentRating3
    duration: Duration3
    id: string
    name: string
    playability: Playability3
    uri: string
}

interface AlbumOfTrack2 {
    coverArt: CoverArt9
    id: string
    name: string
    uri: string
}

interface CoverArt9 {
    extractedColors: ExtractedColors12
    sources: Source17[]
}

interface ExtractedColors12 {
    colorDark: ColorDark12
}

interface ColorDark12 {
    hex: string
    isFallback: boolean
}

interface Source17 {
    height: number
    url: string
    width: number
}

interface Artists4 {
    items: Item17[]
}

interface Item17 {
    profile: Profile5
    uri: string
}

interface Profile5 {
    name: string
}

interface Associations2 {
    associatedVideos: AssociatedVideos2
}

interface AssociatedVideos2 {
    totalCount: number
}

interface ContentRating3 {
    label: string
}

interface Duration3 {
    totalMilliseconds: number
}

interface Playability3 {
    playable: boolean
}

interface Users {
    items: Item18[]
    totalCount: number
}

interface Item18 {
    __typename: string
    data: Data16
}

interface Data16 {
    __typename: string
    avatar?: Avatar4
    id: string
    displayName: string
    uri: string
    username: string
}

interface Avatar4 {
    extractedColors: ExtractedColors13
    sources: Source18[]
}

interface ExtractedColors13 {
    colorDark: ColorDark13
}

interface ColorDark13 {
    hex: string
    isFallback: boolean
}

interface Source18 {
    height: number
    url: string
    width: number
}

interface Extensions {
    requestIds: RequestIds
}

interface RequestIds {
    "/searchV2": SearchV22
    "/searchV2/topResultsV2": SearchV2TopResultsV2
}

interface SearchV22 {
    "search-api": string
}

interface SearchV2TopResultsV2 {
    "search-api": string
}
