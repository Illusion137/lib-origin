export interface Home {
    data: Data
    extensions: Extensions
}

interface Data {
    home: Home2
}

interface Home2 {
    __typename: string
    greeting: Greeting
    sectionContainer: SectionContainer
    homeChips: HomeChip[]
}

interface Greeting {
    text: string
}

interface SectionContainer {
    sections: Sections
    uri: string
}

interface Sections {
    items: Item[]
    totalCount: number
}

interface Item {
    data: Data2
    sectionItems: SectionItems
    uri: string
}

interface Data2 {
    __typename: string
    title?: Title
}

interface Title {
    text: string
}

interface SectionItems {
    items: Item2[]
    totalCount: number
}

interface Item2 {
    data?: Data3
    content: Content
    uri: string
}

interface Data3 {
    __typename: string
}

interface Content {
    __typename: string
    data: Data4
}

interface Data4 {
    __typename: string
    artists?: Artists
    coverArt?: CoverArt
    name?: string
    uri?: string
    profile?: Profile2
    visuals?: Visuals
    mediaType?: string
    publisher?: Publisher
    contentRating?: ContentRating
    description?: string
    duration?: Duration
    playedState?: PlayedState
    podcastV2?: PodcastV2
    releaseDate?: ReleaseDate
    videoThumbnailImage?: VideoThumbnailImage
    accessInfo?: AccessInfo
    authors?: Author[]
    attributes?: Attribute[]
    format?: string
    images?: Images
    ownerV2?: OwnerV2
}

interface Artists {
    items: Item3[]
}

interface Item3 {
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

interface Profile2 {
    name: string
}

interface Visuals {
    avatarImage: AvatarImage
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

interface Publisher {
    name: string
}

interface ContentRating {
    label: string
}

interface Duration {
    totalMilliseconds: number
}

interface PlayedState {
    playPositionMilliseconds: number
    state: string
}

interface PodcastV2 {
    data: Data5
}

interface Data5 {
    __typename: string
    coverArt: CoverArt2
    mediaType: string
    name: string
    publisher: Publisher2
    uri: string
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

interface Publisher2 {
    name: string
}

interface ReleaseDate {
    isoString: string
}

interface VideoThumbnailImage {
    data: Data6
}

interface Data6 {
    __typename: string
    sources: Source4[]
}

interface Source4 {
    url: string
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

interface Attribute {
    key: string
    value: string
}

interface Images {
    items: Item4[]
}

interface Item4 {
    extractedColors: ExtractedColors4
    sources: Source5[]
}

interface ExtractedColors4 {
    colorDark: ColorDark4
}

interface ColorDark4 {
    hex: string
    isFallback: boolean
}

interface Source5 {
    height?: number
    url: string
    width?: number
}

interface OwnerV2 {
    data: Data7
}

interface Data7 {
    __typename: string
    name: string
}

interface HomeChip {
    id: string
    label: Label
}

interface Label {
    originalLabel: OriginalLabel
    text: string
}

interface OriginalLabel {
    baseText: BaseText
}

interface BaseText {
    text: string
}

interface Extensions { }