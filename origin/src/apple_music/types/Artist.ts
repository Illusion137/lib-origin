export interface Artist {
    data: Daum[]
    resources: Resources
}

export interface Daum {
    id: string
    type: string
    href: string
}

export interface Resources {
    artists: Artists
    albums: Albums
    songs: Songs
}

export type Artists = Record<string, N1630034994>;

export interface N1630034994 {
    id: string
    type: string
    href: string
    attributes: Attributes
}

export interface Attributes {
    genreNames: string[]
    editorialArtwork: EditorialArtwork
    name: string
    hero: Hero[]
    artwork: Artwork2
    isGroup: boolean
    url: string
}

export interface EditorialArtwork { }

export interface Hero {
    content: Content[]
}

export interface Content {
    artwork: Artwork
}

export interface Artwork {
    width: number
    url: string
    height: number
    textColor3: string
    textColor2: string
    textColor4: string
    textColor1: string
    bgColor: string
    recommendedCropCodes: string[]
    hasP3: boolean
}

export interface Artwork2 {
    width: number
    url: string
    height: number
    textColor3: string
    textColor2: string
    textColor4: string
    textColor1: string
    bgColor: string
    hasP3: boolean
}

export interface N1443736146 {
    id: string
    type: string
    href: string
    attributes: Attributes2
    views: Views
    meta: Meta
}

export interface Attributes2 {
    genreNames: string[]
    editorialArtwork: EditorialArtwork2
    origin: string
    name: string
    hero: Hero2[]
    artwork: Artwork4
    isGroup: boolean
    url: string
    artistBio: string
}

export interface EditorialArtwork2 { }

export interface Hero2 {
    content: Content2[]
}

export interface Content2 {
    artwork: Artwork3
}

export interface Artwork3 {
    width: number
    url: string
    height: number
    textColor3: string
    textColor2: string
    textColor4: string
    textColor1: string
    bgColor: string
    hasP3: boolean
}

export interface Artwork4 {
    width: number
    url: string
    height: number
    textColor3: string
    textColor2: string
    textColor4: string
    textColor1: string
    bgColor: string
    hasP3: boolean
}

export interface Views {
    "radio-shows": RadioShows
    "live-albums": LiveAlbums
    "featured-release": FeaturedRelease
    "more-to-hear": MoreToHear
    "featured-albums": FeaturedAlbums
    "latest-release": LatestRelease
    "top-songs": TopSongs
    "more-to-see": MoreToSee
    "similar-artists": SimilarArtists
    "music-videos": MusicVideos
    "appears-on-albums": AppearsOnAlbums
    playlists: Playlists
    "compilation-albums": CompilationAlbums
    singles: Singles
    "full-albums": FullAlbums
}

export interface RadioShows {
    href: string
    attributes: Attributes3
    data: any[]
}

export interface Attributes3 {
    title: string
}

export interface LiveAlbums {
    href: string
    attributes: Attributes4
    data: any[]
}

export interface Attributes4 {
    title: string
}

export interface FeaturedRelease {
    href: string
    attributes: Attributes5
    data: any[]
}

export interface Attributes5 {
    title: string
}

export interface MoreToHear {
    href: string
    attributes: Attributes6
    data: any[]
}

export interface Attributes6 {
    title: string
}

export interface FeaturedAlbums {
    href: string
    attributes: Attributes7
    data: any[]
}

export interface Attributes7 {
    title: string
}

export interface LatestRelease {
    href: string
    attributes: Attributes8
    data: Daum2[]
}

export interface Attributes8 {
    title: string
}

export interface Daum2 {
    id: string
    type: string
    href: string
}

export interface TopSongs {
    href: string
    next: string
    attributes: Attributes9
    data: Daum3[]
}

export interface Attributes9 {
    title: string
}

export interface Daum3 {
    id: string
    type: string
    href: string
}

export interface MoreToSee {
    href: string
    attributes: Attributes10
    data: any[]
}

export interface Attributes10 {
    title: string
}

export interface SimilarArtists {
    href: string
    next: string
    attributes: Attributes11
    data: Daum4[]
}

export interface Attributes11 {
    title: string
}

export interface Daum4 {
    id: string
    type: string
    href: string
}

export interface MusicVideos {
    href: string
    attributes: Attributes12
    data: any[]
}

export interface Attributes12 {
    title: string
}

export interface AppearsOnAlbums {
    href: string
    attributes: Attributes13
    data: Daum5[]
}

export interface Attributes13 {
    title: string
}

export interface Daum5 {
    id: string
    type: string
    href: string
}

export interface Playlists {
    href: string
    attributes: Attributes14
    data: any[]
}

export interface Attributes14 {
    title: string
}

export interface CompilationAlbums {
    href: string
    attributes: Attributes15
    data: any[]
}

export interface Attributes15 {
    title: string
}

export interface Singles {
    href: string
    next: string
    attributes: Attributes16
    data: Daum6[]
}

export interface Attributes16 {
    title: string
}

export interface Daum6 {
    id: string
    type: string
    href: string
}

export interface FullAlbums {
    href: string
    attributes: Attributes17
    data: Daum7[]
}

export interface Attributes17 {
    title: string
}

export interface Daum7 {
    id: string
    type: string
    href: string
}

export interface Meta {
    views: Views2
}

export interface Views2 {
    order: string[]
}

export interface N1656550434 {
    id: string
    type: string
    href: string
    attributes: Attributes18
}

export interface Attributes18 {
    bornOrFormed: string
    genreNames: string[]
    editorialArtwork: EditorialArtwork3
    origin: string
    name: string
    hero: Hero3[]
    artwork: Artwork6
    isGroup: boolean
    url: string
    artistBio: string
}

export interface EditorialArtwork3 { }

export interface Hero3 {
    content: Content3[]
}

export interface Content3 {
    artwork: Artwork5
}

export interface Artwork5 {
    width: number
    url: string
    height: number
    textColor3: string
    textColor2: string
    textColor4: string
    textColor1: string
    bgColor: string
    recommendedCropCodes: string[]
    hasP3: boolean
}

export interface Artwork6 {
    width: number
    url: string
    height: number
    textColor3: string
    textColor2: string
    textColor4: string
    textColor1: string
    bgColor: string
    hasP3: boolean
}

export interface N1434748650 {
    id: string
    type: string
    href: string
    attributes: Attributes19
}

export interface Attributes19 {
    genreNames: string[]
    editorialArtwork: EditorialArtwork4
    origin: string
    name: string
    editorialVideo: EditorialVideo
    hero: Hero4[]
    artwork: Artwork8
    isGroup: boolean
    url: string
}

export interface EditorialArtwork4 { }

export interface EditorialVideo {
    motionArtistSquare1x1: MotionArtistSquare1x1
    motionArtistFullscreen16x9: MotionArtistFullscreen16x9
    motionArtistWide16x9: MotionArtistWide16x9
}

export interface MotionArtistSquare1x1 {
    previewFrame: PreviewFrame
    video: string
}

export interface PreviewFrame {
    width: number
    url: string
    gradient: Gradient
    height: number
    textColor3: string
    textColor2: string
    textColor4: string
    textColor1: string
    bgColor: string
    hasP3: boolean
}

export interface Gradient { }

export interface MotionArtistFullscreen16x9 {
    previewFrame: PreviewFrame2
    video: string
}

export interface PreviewFrame2 {
    width: number
    url: string
    gradient: Gradient2
    height: number
    textColor3: string
    textColor2: string
    textColor4: string
    textColor1: string
    bgColor: string
    hasP3: boolean
}

export interface Gradient2 { }

export interface MotionArtistWide16x9 {
    previewFrame: PreviewFrame3
    video: string
}

export interface PreviewFrame3 {
    width: number
    url: string
    gradient: Gradient3
    height: number
    textColor3: string
    textColor2: string
    textColor4: string
    textColor1: string
    bgColor: string
    hasP3: boolean
}

export interface Gradient3 { }

export interface Hero4 {
    content: Content4[]
}

export interface Content4 {
    artwork: Artwork7
}

export interface Artwork7 {
    width: number
    url: string
    height: number
    textColor3: string
    textColor2: string
    textColor4: string
    textColor1: string
    bgColor: string
    recommendedCropCodes: string[]
    hasP3: boolean
}

export interface Artwork8 {
    width: number
    url: string
    height: number
    textColor3: string
    textColor2: string
    textColor4: string
    textColor1: string
    bgColor: string
    hasP3: boolean
}

export interface N1668170249 {
    id: string
    type: string
    href: string
    attributes: Attributes20
}

export interface Attributes20 {
    genreNames: string[]
    editorialArtwork: EditorialArtwork5
    origin: string
    name: string
    hero: Hero5[]
    artwork: Artwork10
    isGroup: boolean
    url: string
}

export interface EditorialArtwork5 { }

export interface Hero5 {
    content: Content5[]
}

export interface Content5 {
    artwork: Artwork9
}

export interface Artwork9 {
    width: number
    url: string
    height: number
    textColor3: string
    textColor2: string
    textColor4: string
    textColor1: string
    bgColor: string
    hasP3: boolean
}

export interface Artwork10 {
    width: number
    url: string
    height: number
    textColor3: string
    textColor2: string
    textColor4: string
    textColor1: string
    bgColor: string
    hasP3: boolean
}

export interface N589757880 {
    id: string
    type: string
    href: string
    attributes: Attributes21
}

export interface Attributes21 {
    bornOrFormed: string
    genreNames: string[]
    editorialArtwork: EditorialArtwork6
    origin: string
    name: string
    hero: Hero6[]
    artwork: Artwork12
    isGroup: boolean
    url: string
    artistBio: string
}

export interface EditorialArtwork6 { }

export interface Hero6 {
    content: Content6[]
}

export interface Content6 {
    artwork: Artwork11
}

export interface Artwork11 {
    width: number
    url: string
    height: number
    textColor3: string
    textColor2: string
    textColor4: string
    textColor1: string
    bgColor: string
    recommendedCropCodes: string[]
    hasP3: boolean
}

export interface Artwork12 {
    width: number
    url: string
    height: number
    textColor3: string
    textColor2: string
    textColor4: string
    textColor1: string
    bgColor: string
    hasP3: boolean
}

export interface N1547109817 {
    id: string
    type: string
    href: string
    attributes: Attributes22
}

export interface Attributes22 {
    genreNames: string[]
    editorialArtwork: EditorialArtwork7
    name: string
    hero: Hero7[]
    artwork: Artwork14
    isGroup: boolean
    url: string
}

export interface EditorialArtwork7 { }

export interface Hero7 {
    content: Content7[]
}

export interface Content7 {
    artwork: Artwork13
}

export interface Artwork13 {
    width: number
    url: string
    height: number
    textColor3: string
    textColor2: string
    textColor4: string
    textColor1: string
    bgColor: string
    hasP3: boolean
}

export interface Artwork14 {
    width: number
    url: string
    height: number
    textColor3: string
    textColor2: string
    textColor4: string
    textColor1: string
    bgColor: string
    hasP3: boolean
}

export interface N1209282817 {
    id: string
    type: string
    href: string
    attributes: Attributes23
}

export interface Attributes23 {
    bornOrFormed: string
    genreNames: string[]
    editorialArtwork: EditorialArtwork8
    origin: string
    name: string
    hero: Hero8[]
    artwork: Artwork16
    isGroup: boolean
    url: string
    artistBio: string
}

export interface EditorialArtwork8 { }

export interface Hero8 {
    content: Content8[]
}

export interface Content8 {
    artwork: Artwork15
}

export interface Artwork15 {
    width: number
    url: string
    height: number
    textColor3: string
    textColor2: string
    textColor4: string
    textColor1: string
    bgColor: string
    hasP3: boolean
}

export interface Artwork16 {
    width: number
    url: string
    height: number
    textColor3: string
    textColor2: string
    textColor4: string
    textColor1: string
    bgColor: string
    hasP3: boolean
}

export interface N1663359448 {
    id: string
    type: string
    href: string
    attributes: Attributes24
}

export interface Attributes24 {
    genreNames: string[]
    editorialArtwork: EditorialArtwork9
    name: string
    hero: Hero9[]
    artwork: Artwork18
    isGroup: boolean
    url: string
}

export interface EditorialArtwork9 { }

export interface Hero9 {
    content: Content9[]
}

export interface Content9 {
    artwork: Artwork17
}

export interface Artwork17 {
    width: number
    url: string
    height: number
    textColor3: string
    textColor2: string
    textColor4: string
    textColor1: string
    bgColor: string
    hasP3: boolean
}

export interface Artwork18 {
    width: number
    url: string
    height: number
    textColor3: string
    textColor2: string
    textColor4: string
    textColor1: string
    bgColor: string
    hasP3: boolean
}

export interface N1485961982 {
    id: string
    type: string
    href: string
    attributes: Attributes25
}

export interface Attributes25 {
    genreNames: string[]
    editorialArtwork: EditorialArtwork10
    name: string
    hero: Hero10[]
    artwork: Artwork20
    isGroup: boolean
    url: string
}

export interface EditorialArtwork10 { }

export interface Hero10 {
    content: Content10[]
}

export interface Content10 {
    artwork: Artwork19
}

export interface Artwork19 {
    width: number
    url: string
    height: number
    textColor3: string
    textColor2: string
    textColor4: string
    textColor1: string
    bgColor: string
    recommendedCropCodes: string[]
    hasP3: boolean
}

export interface Artwork20 {
    width: number
    url: string
    height: number
    textColor3: string
    textColor2: string
    textColor4: string
    textColor1: string
    bgColor: string
    hasP3: boolean
}

export interface N1451232200 {
    id: string
    type: string
    href: string
    attributes: Attributes26
}

export interface Attributes26 {
    bornOrFormed: string
    genreNames: string[]
    editorialArtwork: EditorialArtwork11
    origin: string
    name: string
    hero: Hero11[]
    artwork: Artwork22
    isGroup: boolean
    url: string
    artistBio: string
}

export interface EditorialArtwork11 { }

export interface Hero11 {
    content: Content11[]
}

export interface Content11 {
    artwork: Artwork21
}

export interface Artwork21 {
    width: number
    url: string
    height: number
    textColor3: string
    textColor2: string
    textColor4: string
    textColor1: string
    bgColor: string
    recommendedCropCodes: string[]
    hasP3: boolean
}

export interface Artwork22 {
    width: number
    url: string
    height: number
    textColor3: string
    textColor2: string
    textColor4: string
    textColor1: string
    bgColor: string
    hasP3: boolean
}

export type Albums = Record<string, N1788574845>;

export interface N1788574845 {
    id: string
    type: string
    href: string
    attributes: Attributes27
    meta: Meta2
}

export interface Attributes27 {
    copyright: string
    genreNames: string[]
    releaseDate: string
    isMasteredForItunes: boolean
    upc: string
    artwork: Artwork23
    url: string
    playParams: PlayParams
    recordLabel: string
    trackCount: number
    isCompilation: boolean
    isPrerelease: boolean
    audioTraits: string[]
    editorialArtwork: EditorialArtwork12
    isSingle: boolean
    name: string
    artistName: string
    contentRating: string
    isComplete: boolean
}

export interface Artwork23 {
    width: number
    url: string
    height: number
    textColor3: string
    textColor2: string
    textColor4: string
    textColor1: string
    bgColor: string
    hasP3: boolean
}

export interface PlayParams {
    id: string
    kind: string
}

export interface EditorialArtwork12 { }

export interface Meta2 {
    contentVersion: ContentVersion
}

export interface ContentVersion {
    MZ_INDEXER: number
    RTCI: number
}

export interface N1783509655 {
    id: string
    type: string
    href: string
    attributes: Attributes28
    meta: Meta3
}

export interface Attributes28 {
    copyright: string
    genreNames: string[]
    releaseDate: string
    upc: string
    isMasteredForItunes: boolean
    artwork: Artwork24
    playParams: PlayParams2
    url: string
    recordLabel: string
    isCompilation: boolean
    trackCount: number
    isPrerelease: boolean
    audioTraits: string[]
    editorialArtwork: EditorialArtwork13
    isSingle: boolean
    name: string
    artistName: string
    contentRating: string
    isComplete: boolean
}

export interface Artwork24 {
    width: number
    url: string
    height: number
    textColor3: string
    textColor2: string
    textColor4: string
    textColor1: string
    bgColor: string
    hasP3: boolean
}

export interface PlayParams2 {
    id: string
    kind: string
}

export interface EditorialArtwork13 { }

export interface Meta3 {
    contentVersion: ContentVersion2
}

export interface ContentVersion2 {
    MZ_INDEXER: number
    RTCI: number
}

export interface N1666146514 {
    id: string
    type: string
    href: string
    attributes: Attributes29
    meta: Meta4
}

export interface Attributes29 {
    copyright: string
    genreNames: string[]
    releaseDate: string
    upc: string
    isMasteredForItunes: boolean
    artwork: Artwork25
    playParams: PlayParams3
    url: string
    recordLabel: string
    isCompilation: boolean
    trackCount: number
    isPrerelease: boolean
    audioTraits: string[]
    editorialArtwork: EditorialArtwork14
    isSingle: boolean
    name: string
    artistName: string
    contentRating: string
    isComplete: boolean
}

export interface Artwork25 {
    width: number
    url: string
    height: number
    textColor3: string
    textColor2: string
    textColor4: string
    textColor1: string
    bgColor: string
    hasP3: boolean
}

export interface PlayParams3 {
    id: string
    kind: string
}

export interface EditorialArtwork14 { }

export interface Meta4 {
    contentVersion: ContentVersion3
}

export interface ContentVersion3 {
    MZ_INDEXER: number
    RTCI: number
}

export interface N1792243807 {
    id: string
    type: string
    href: string
    attributes: Attributes30
    meta: Meta5
}

export interface Attributes30 {
    copyright: string
    genreNames: string[]
    releaseDate: string
    isMasteredForItunes: boolean
    upc: string
    artwork: Artwork26
    playParams: PlayParams4
    url: string
    recordLabel: string
    trackCount: number
    isCompilation: boolean
    isPrerelease: boolean
    audioTraits: string[]
    editorialArtwork: EditorialArtwork15
    isSingle: boolean
    name: string
    artistName: string
    isComplete: boolean
}

export interface Artwork26 {
    width: number
    url: string
    height: number
    textColor3: string
    textColor2: string
    textColor4: string
    textColor1: string
    bgColor: string
    hasP3: boolean
}

export interface PlayParams4 {
    id: string
    kind: string
}

export interface EditorialArtwork15 { }

export interface Meta5 {
    contentVersion: ContentVersion4
}

export interface ContentVersion4 {
    MZ_INDEXER: number
    RTCI: number
}

export interface N1778233703 {
    id: string
    type: string
    href: string
    attributes: Attributes31
    meta: Meta6
}

export interface Attributes31 {
    copyright: string
    genreNames: string[]
    releaseDate: string
    isMasteredForItunes: boolean
    upc: string
    artwork: Artwork27
    url: string
    playParams: PlayParams5
    recordLabel: string
    trackCount: number
    isCompilation: boolean
    isPrerelease: boolean
    audioTraits: string[]
    editorialArtwork: EditorialArtwork16
    isSingle: boolean
    name: string
    artistName: string
    contentRating: string
    isComplete: boolean
}

export interface Artwork27 {
    width: number
    url: string
    height: number
    textColor3: string
    textColor2: string
    textColor4: string
    textColor1: string
    bgColor: string
    hasP3: boolean
}

export interface PlayParams5 {
    id: string
    kind: string
}

export interface EditorialArtwork16 { }

export interface Meta6 {
    contentVersion: ContentVersion5
}

export interface ContentVersion5 {
    MZ_INDEXER: number
    RTCI: number
}

export interface N1797769177 {
    id: string
    type: string
    href: string
    attributes: Attributes32
    meta: Meta7
}

export interface Attributes32 {
    copyright: string
    genreNames: string[]
    releaseDate: string
    isMasteredForItunes: boolean
    upc: string
    artwork: Artwork28
    url: string
    playParams: PlayParams6
    recordLabel: string
    isCompilation: boolean
    trackCount: number
    isPrerelease: boolean
    audioTraits: string[]
    editorialArtwork: EditorialArtwork17
    isSingle: boolean
    name: string
    artistName: string
    contentRating: string
    isComplete: boolean
}

export interface Artwork28 {
    width: number
    url: string
    height: number
    textColor3: string
    textColor2: string
    textColor4: string
    textColor1: string
    bgColor: string
    hasP3: boolean
}

export interface PlayParams6 {
    id: string
    kind: string
}

export interface EditorialArtwork17 { }

export interface Meta7 {
    contentVersion: ContentVersion6
}

export interface ContentVersion6 {
    MZ_INDEXER: number
    RTCI: number
}

export interface N1773883434 {
    id: string
    type: string
    href: string
    attributes: Attributes33
    meta: Meta8
}

export interface Attributes33 {
    copyright: string
    genreNames: string[]
    releaseDate: string
    isMasteredForItunes: boolean
    upc: string
    artwork: Artwork29
    url: string
    playParams: PlayParams7
    recordLabel: string
    isCompilation: boolean
    trackCount: number
    isPrerelease: boolean
    audioTraits: string[]
    editorialArtwork: EditorialArtwork18
    isSingle: boolean
    name: string
    artistName: string
    contentRating: string
    isComplete: boolean
}

export interface Artwork29 {
    width: number
    url: string
    height: number
    textColor3: string
    textColor2: string
    textColor4: string
    textColor1: string
    bgColor: string
    hasP3: boolean
}

export interface PlayParams7 {
    id: string
    kind: string
}

export interface EditorialArtwork18 { }

export interface Meta8 {
    contentVersion: ContentVersion7
}

export interface ContentVersion7 {
    MZ_INDEXER: number
    RTCI: number
}

export interface N1777330285 {
    id: string
    type: string
    href: string
    attributes: Attributes34
    meta: Meta9
}

export interface Attributes34 {
    copyright: string
    genreNames: string[]
    releaseDate: string
    isMasteredForItunes: boolean
    upc: string
    artwork: Artwork30
    playParams: PlayParams8
    url: string
    recordLabel: string
    trackCount: number
    isCompilation: boolean
    isPrerelease: boolean
    audioTraits: string[]
    editorialArtwork: EditorialArtwork19
    isSingle: boolean
    name: string
    artistName: string
    isComplete: boolean
}

export interface Artwork30 {
    width: number
    url: string
    height: number
    textColor3: string
    textColor2: string
    textColor4: string
    textColor1: string
    bgColor: string
    hasP3: boolean
}

export interface PlayParams8 {
    id: string
    kind: string
}

export interface EditorialArtwork19 { }

export interface Meta9 {
    contentVersion: ContentVersion8
}

export interface ContentVersion8 {
    MZ_INDEXER: number
    RTCI: number
}

export interface N1757509870 {
    id: string
    type: string
    href: string
    attributes: Attributes35
    meta: Meta10
}

export interface Attributes35 {
    copyright: string
    genreNames: string[]
    releaseDate: string
    isMasteredForItunes: boolean
    upc: string
    artwork: Artwork31
    url: string
    playParams: PlayParams9
    recordLabel: string
    trackCount: number
    isCompilation: boolean
    isPrerelease: boolean
    audioTraits: string[]
    editorialArtwork: EditorialArtwork20
    isSingle: boolean
    name: string
    artistName: string
    contentRating: string
    isComplete: boolean
}

export interface Artwork31 {
    width: number
    url: string
    height: number
    textColor3: string
    textColor2: string
    textColor4: string
    textColor1: string
    bgColor: string
    hasP3: boolean
}

export interface PlayParams9 {
    id: string
    kind: string
}

export interface EditorialArtwork20 { }

export interface Meta10 {
    contentVersion: ContentVersion9
}

export interface ContentVersion9 {
    MZ_INDEXER: number
    RTCI: number
}

export interface N1768369629 {
    id: string
    type: string
    href: string
    attributes: Attributes36
    meta: Meta11
}

export interface Attributes36 {
    copyright: string
    genreNames: string[]
    releaseDate: string
    isMasteredForItunes: boolean
    upc: string
    artwork: Artwork32
    playParams: PlayParams10
    url: string
    recordLabel: string
    isCompilation: boolean
    trackCount: number
    isPrerelease: boolean
    audioTraits: string[]
    editorialArtwork: EditorialArtwork21
    isSingle: boolean
    name: string
    artistName: string
    contentRating: string
    isComplete: boolean
}

export interface Artwork32 {
    width: number
    url: string
    height: number
    textColor3: string
    textColor2: string
    textColor4: string
    textColor1: string
    bgColor: string
    hasP3: boolean
}

export interface PlayParams10 {
    id: string
    kind: string
}

export interface EditorialArtwork21 { }

export interface Meta11 {
    contentVersion: ContentVersion10
}

export interface ContentVersion10 {
    MZ_INDEXER: number
    RTCI: number
}

export interface N1745967073 {
    id: string
    type: string
    href: string
    attributes: Attributes37
    meta: Meta12
}

export interface Attributes37 {
    copyright: string
    genreNames: string[]
    releaseDate: string
    isMasteredForItunes: boolean
    upc: string
    artwork: Artwork33
    playParams: PlayParams11
    url: string
    recordLabel: string
    trackCount: number
    isCompilation: boolean
    isPrerelease: boolean
    audioTraits: string[]
    editorialArtwork: EditorialArtwork22
    isSingle: boolean
    name: string
    artistName: string
    contentRating: string
    isComplete: boolean
}

export interface Artwork33 {
    width: number
    url: string
    height: number
    textColor3: string
    textColor2: string
    textColor4: string
    textColor1: string
    bgColor: string
    hasP3: boolean
}

export interface PlayParams11 {
    id: string
    kind: string
}

export interface EditorialArtwork22 { }

export interface Meta12 {
    contentVersion: ContentVersion11
}

export interface ContentVersion11 {
    MZ_INDEXER: number
    RTCI: number
}

export interface N1754104272 {
    id: string
    type: string
    href: string
    attributes: Attributes38
    meta: Meta13
}

export interface Attributes38 {
    copyright: string
    genreNames: string[]
    releaseDate: string
    isMasteredForItunes: boolean
    upc: string
    artwork: Artwork34
    url: string
    playParams: PlayParams12
    recordLabel: string
    trackCount: number
    isCompilation: boolean
    isPrerelease: boolean
    audioTraits: string[]
    editorialArtwork: EditorialArtwork23
    isSingle: boolean
    name: string
    artistName: string
    contentRating: string
    isComplete: boolean
}

export interface Artwork34 {
    width: number
    url: string
    height: number
    textColor3: string
    textColor2: string
    textColor4: string
    textColor1: string
    bgColor: string
    hasP3: boolean
}

export interface PlayParams12 {
    id: string
    kind: string
}

export interface EditorialArtwork23 { }

export interface Meta13 {
    contentVersion: ContentVersion12
}

export interface ContentVersion12 {
    MZ_INDEXER: number
    RTCI: number
}

export interface N1754099387 {
    id: string
    type: string
    href: string
    attributes: Attributes39
    meta: Meta14
}

export interface Attributes39 {
    copyright: string
    genreNames: string[]
    releaseDate: string
    isMasteredForItunes: boolean
    upc: string
    artwork: Artwork35
    url: string
    playParams: PlayParams13
    recordLabel: string
    trackCount: number
    isCompilation: boolean
    isPrerelease: boolean
    audioTraits: string[]
    editorialArtwork: EditorialArtwork24
    isSingle: boolean
    name: string
    artistName: string
    contentRating: string
    isComplete: boolean
}

export interface Artwork35 {
    width: number
    url: string
    height: number
    textColor3: string
    textColor2: string
    textColor4: string
    textColor1: string
    bgColor: string
    hasP3: boolean
}

export interface PlayParams13 {
    id: string
    kind: string
}

export interface EditorialArtwork24 { }

export interface Meta14 {
    contentVersion: ContentVersion13
}

export interface ContentVersion13 {
    MZ_INDEXER: number
    RTCI: number
}

export interface N1689883801 {
    id: string
    type: string
    href: string
    attributes: Attributes40
    meta: Meta15
}

export interface Attributes40 {
    copyright: string
    genreNames: string[]
    releaseDate: string
    isMasteredForItunes: boolean
    upc: string
    artwork: Artwork36
    url: string
    playParams: PlayParams14
    recordLabel: string
    isCompilation: boolean
    trackCount: number
    isPrerelease: boolean
    audioTraits: string[]
    editorialArtwork: EditorialArtwork25
    isSingle: boolean
    name: string
    artistName: string
    contentRating: string
    isComplete: boolean
}

export interface Artwork36 {
    width: number
    url: string
    height: number
    textColor3: string
    textColor2: string
    textColor4: string
    textColor1: string
    bgColor: string
    hasP3: boolean
}

export interface PlayParams14 {
    id: string
    kind: string
}

export interface EditorialArtwork25 { }

export interface Meta15 {
    contentVersion: ContentVersion14
}

export interface ContentVersion14 {
    MZ_INDEXER: number
    RTCI: number
}

export interface N1781023254 {
    id: string
    type: string
    href: string
    attributes: Attributes41
    meta: Meta16
}

export interface Attributes41 {
    copyright: string
    genreNames: string[]
    releaseDate: string
    isMasteredForItunes: boolean
    upc: string
    artwork: Artwork37
    url: string
    playParams: PlayParams15
    recordLabel: string
    trackCount: number
    isCompilation: boolean
    isPrerelease: boolean
    audioTraits: string[]
    editorialArtwork: EditorialArtwork26
    isSingle: boolean
    name: string
    artistName: string
    contentRating: string
    isComplete: boolean
}

export interface Artwork37 {
    width: number
    url: string
    height: number
    textColor3: string
    textColor2: string
    textColor4: string
    textColor1: string
    bgColor: string
    hasP3: boolean
}

export interface PlayParams15 {
    id: string
    kind: string
}

export interface EditorialArtwork26 { }

export interface Meta16 {
    contentVersion: ContentVersion15
}

export interface ContentVersion15 {
    MZ_INDEXER: number
    RTCI: number
}

export interface N1792403454 {
    id: string
    type: string
    href: string
    attributes: Attributes42
    meta: Meta17
}

export interface Attributes42 {
    copyright: string
    genreNames: string[]
    releaseDate: string
    upc: string
    isMasteredForItunes: boolean
    artwork: Artwork38
    url: string
    playParams: PlayParams16
    recordLabel: string
    isCompilation: boolean
    trackCount: number
    isPrerelease: boolean
    audioTraits: string[]
    editorialArtwork: EditorialArtwork27
    isSingle: boolean
    name: string
    artistName: string
    contentRating: string
    isComplete: boolean
}

export interface Artwork38 {
    width: number
    url: string
    height: number
    textColor3: string
    textColor2: string
    textColor4: string
    textColor1: string
    bgColor: string
    hasP3: boolean
}

export interface PlayParams16 {
    id: string
    kind: string
}

export interface EditorialArtwork27 { }

export interface Meta17 {
    contentVersion: ContentVersion16
}

export interface ContentVersion16 {
    MZ_INDEXER: number
    RTCI: number
}

export interface N1754100034 {
    id: string
    type: string
    href: string
    attributes: Attributes43
    meta: Meta18
}

export interface Attributes43 {
    copyright: string
    genreNames: string[]
    releaseDate: string
    isMasteredForItunes: boolean
    upc: string
    artwork: Artwork39
    url: string
    playParams: PlayParams17
    recordLabel: string
    trackCount: number
    isCompilation: boolean
    isPrerelease: boolean
    audioTraits: string[]
    editorialArtwork: EditorialArtwork28
    isSingle: boolean
    name: string
    artistName: string
    contentRating: string
    isComplete: boolean
}

export interface Artwork39 {
    width: number
    url: string
    height: number
    textColor3: string
    textColor2: string
    textColor4: string
    textColor1: string
    bgColor: string
    hasP3: boolean
}

export interface PlayParams17 {
    id: string
    kind: string
}

export interface EditorialArtwork28 { }

export interface Meta18 {
    contentVersion: ContentVersion17
}

export interface ContentVersion17 {
    MZ_INDEXER: number
    RTCI: number
}

export interface N1762493706 {
    id: string
    type: string
    href: string
    attributes: Attributes44
    meta: Meta19
}

export interface Attributes44 {
    copyright: string
    genreNames: string[]
    releaseDate: string
    isMasteredForItunes: boolean
    upc: string
    artwork: Artwork40
    url: string
    playParams: PlayParams18
    recordLabel: string
    trackCount: number
    isCompilation: boolean
    isPrerelease: boolean
    audioTraits: string[]
    editorialArtwork: EditorialArtwork29
    isSingle: boolean
    name: string
    artistName: string
    contentRating: string
    isComplete: boolean
}

export interface Artwork40 {
    width: number
    url: string
    height: number
    textColor3: string
    textColor2: string
    textColor4: string
    textColor1: string
    bgColor: string
    hasP3: boolean
}

export interface PlayParams18 {
    id: string
    kind: string
}

export interface EditorialArtwork29 { }

export interface Meta19 {
    contentVersion: ContentVersion18
}

export interface ContentVersion18 {
    MZ_INDEXER: number
    RTCI: number
}

export interface N1758200132 {
    id: string
    type: string
    href: string
    attributes: Attributes45
    meta: Meta20
}

export interface Attributes45 {
    copyright: string
    genreNames: string[]
    releaseDate: string
    isMasteredForItunes: boolean
    upc: string
    artwork: Artwork41
    url: string
    playParams: PlayParams19
    recordLabel: string
    trackCount: number
    isCompilation: boolean
    isPrerelease: boolean
    audioTraits: string[]
    editorialArtwork: EditorialArtwork30
    isSingle: boolean
    name: string
    artistName: string
    contentRating: string
    isComplete: boolean
}

export interface Artwork41 {
    width: number
    url: string
    height: number
    textColor3: string
    textColor2: string
    textColor4: string
    textColor1: string
    bgColor: string
    hasP3: boolean
}

export interface PlayParams19 {
    id: string
    kind: string
}

export interface EditorialArtwork30 { }

export interface Meta20 {
    contentVersion: ContentVersion19
}

export interface ContentVersion19 {
    MZ_INDEXER: number
    RTCI: number
}

export interface N1623917352 {
    id: string
    type: string
    href: string
    attributes: Attributes46
    meta: Meta21
}

export interface Attributes46 {
    copyright: string
    genreNames: string[]
    releaseDate: string
    upc: string
    isMasteredForItunes: boolean
    artwork: Artwork42
    playParams: PlayParams20
    url: string
    recordLabel: string
    trackCount: number
    isCompilation: boolean
    isPrerelease: boolean
    audioTraits: string[]
    editorialArtwork: EditorialArtwork31
    isSingle: boolean
    name: string
    artistName: string
    contentRating: string
    isComplete: boolean
}

export interface Artwork42 {
    width: number
    url: string
    height: number
    textColor3: string
    textColor2: string
    textColor4: string
    textColor1: string
    bgColor: string
    hasP3: boolean
}

export interface PlayParams20 {
    id: string
    kind: string
}

export interface EditorialArtwork31 { }

export interface Meta21 {
    contentVersion: ContentVersion20
}

export interface ContentVersion20 {
    MZ_INDEXER: number
    RTCI: number
}

export interface N1764186516 {
    id: string
    type: string
    href: string
    attributes: Attributes47
    meta: Meta22
}

export interface Attributes47 {
    copyright: string
    genreNames: string[]
    releaseDate: string
    isMasteredForItunes: boolean
    upc: string
    artwork: Artwork43
    url: string
    playParams: PlayParams21
    recordLabel: string
    trackCount: number
    isCompilation: boolean
    isPrerelease: boolean
    audioTraits: string[]
    editorialArtwork: EditorialArtwork32
    isSingle: boolean
    name: string
    artistName: string
    contentRating: string
    isComplete: boolean
}

export interface Artwork43 {
    width: number
    url: string
    height: number
    textColor3: string
    textColor2: string
    textColor4: string
    textColor1: string
    bgColor: string
    hasP3: boolean
}

export interface PlayParams21 {
    id: string
    kind: string
}

export interface EditorialArtwork32 { }

export interface Meta22 {
    contentVersion: ContentVersion21
}

export interface ContentVersion21 {
    MZ_INDEXER: number
    RTCI: number
}

export interface N1663487128 {
    id: string
    type: string
    href: string
    attributes: Attributes48
    meta: Meta23
}

export interface Attributes48 {
    copyright: string
    genreNames: string[]
    releaseDate: string
    upc: string
    isMasteredForItunes: boolean
    artwork: Artwork44
    url: string
    playParams: PlayParams22
    recordLabel: string
    isCompilation: boolean
    trackCount: number
    isPrerelease: boolean
    audioTraits: string[]
    editorialArtwork: EditorialArtwork33
    isSingle: boolean
    name: string
    artistName: string
    contentRating: string
    isComplete: boolean
}

export interface Artwork44 {
    width: number
    url: string
    height: number
    textColor3: string
    textColor2: string
    textColor4: string
    textColor1: string
    bgColor: string
    hasP3: boolean
}

export interface PlayParams22 {
    id: string
    kind: string
}

export interface EditorialArtwork33 { }

export interface Meta23 {
    contentVersion: ContentVersion22
}

export interface ContentVersion22 {
    MZ_INDEXER: number
    RTCI: number
}

export interface N1757509867 {
    id: string
    type: string
    href: string
    attributes: Attributes49
    meta: Meta24
}

export interface Attributes49 {
    copyright: string
    genreNames: string[]
    releaseDate: string
    isMasteredForItunes: boolean
    upc: string
    artwork: Artwork45
    url: string
    playParams: PlayParams23
    recordLabel: string
    trackCount: number
    isCompilation: boolean
    isPrerelease: boolean
    audioTraits: string[]
    editorialArtwork: EditorialArtwork34
    isSingle: boolean
    name: string
    artistName: string
    contentRating: string
    isComplete: boolean
}

export interface Artwork45 {
    width: number
    url: string
    height: number
    textColor3: string
    textColor2: string
    textColor4: string
    textColor1: string
    bgColor: string
    hasP3: boolean
}

export interface PlayParams23 {
    id: string
    kind: string
}

export interface EditorialArtwork34 { }

export interface Meta24 {
    contentVersion: ContentVersion23
}

export interface ContentVersion23 {
    MZ_INDEXER: number
    RTCI: number
}

export interface N1766361273 {
    id: string
    type: string
    href: string
    attributes: Attributes50
    meta: Meta25
}

export interface Attributes50 {
    copyright: string
    genreNames: string[]
    releaseDate: string
    isMasteredForItunes: boolean
    upc: string
    artwork: Artwork46
    playParams: PlayParams24
    url: string
    recordLabel: string
    trackCount: number
    isCompilation: boolean
    isPrerelease: boolean
    audioTraits: string[]
    editorialArtwork: EditorialArtwork35
    isSingle: boolean
    name: string
    artistName: string
    contentRating: string
    isComplete: boolean
}

export interface Artwork46 {
    width: number
    url: string
    height: number
    textColor3: string
    textColor2: string
    textColor4: string
    textColor1: string
    bgColor: string
    hasP3: boolean
}

export interface PlayParams24 {
    id: string
    kind: string
}

export interface EditorialArtwork35 { }

export interface Meta25 {
    contentVersion: ContentVersion24
}

export interface ContentVersion24 {
    MZ_INDEXER: number
    RTCI: number
}

export interface N1710217276 {
    id: string
    type: string
    href: string
    attributes: Attributes51
    meta: Meta26
}

export interface Attributes51 {
    copyright: string
    genreNames: string[]
    releaseDate: string
    isMasteredForItunes: boolean
    upc: string
    artwork: Artwork47
    url: string
    playParams: PlayParams25
    recordLabel: string
    trackCount: number
    isCompilation: boolean
    isPrerelease: boolean
    audioTraits: string[]
    editorialArtwork: EditorialArtwork36
    isSingle: boolean
    name: string
    artistName: string
    contentRating: string
    isComplete: boolean
}

export interface Artwork47 {
    width: number
    url: string
    height: number
    textColor3: string
    textColor2: string
    textColor4: string
    textColor1: string
    bgColor: string
    hasP3: boolean
}

export interface PlayParams25 {
    id: string
    kind: string
}

export interface EditorialArtwork36 { }

export interface Meta26 {
    contentVersion: ContentVersion25
}

export interface ContentVersion25 {
    MZ_INDEXER: number
    RTCI: number
}

export interface N1626131457 {
    id: string
    type: string
    href: string
    attributes: Attributes52
    meta: Meta27
}

export interface Attributes52 {
    copyright: string
    genreNames: string[]
    releaseDate: string
    isMasteredForItunes: boolean
    upc: string
    artwork: Artwork48
    url: string
    playParams: PlayParams26
    recordLabel: string
    trackCount: number
    isCompilation: boolean
    isPrerelease: boolean
    audioTraits: string[]
    editorialArtwork: EditorialArtwork37
    isSingle: boolean
    name: string
    artistName: string
    contentRating: string
    isComplete: boolean
}

export interface Artwork48 {
    width: number
    url: string
    height: number
    textColor3: string
    textColor2: string
    textColor4: string
    textColor1: string
    bgColor: string
    hasP3: boolean
}

export interface PlayParams26 {
    id: string
    kind: string
}

export interface EditorialArtwork37 { }

export interface Meta27 {
    contentVersion: ContentVersion26
}

export interface ContentVersion26 {
    MZ_INDEXER: number
    RTCI: number
}

export interface N1673628486 {
    id: string
    type: string
    href: string
    attributes: Attributes53
    meta: Meta28
}

export interface Attributes53 {
    copyright: string
    genreNames: string[]
    releaseDate: string
    isMasteredForItunes: boolean
    upc: string
    artwork: Artwork49
    url: string
    playParams: PlayParams27
    recordLabel: string
    isCompilation: boolean
    trackCount: number
    isPrerelease: boolean
    audioTraits: string[]
    editorialArtwork: EditorialArtwork38
    isSingle: boolean
    name: string
    artistName: string
    contentRating: string
    isComplete: boolean
}

export interface Artwork49 {
    width: number
    url: string
    height: number
    textColor3: string
    textColor2: string
    textColor4: string
    textColor1: string
    bgColor: string
    hasP3: boolean
}

export interface PlayParams27 {
    id: string
    kind: string
}

export interface EditorialArtwork38 { }

export interface Meta28 {
    contentVersion: ContentVersion27
}

export interface ContentVersion27 {
    MZ_INDEXER: number
    RTCI: number
}

export interface N1796150678 {
    id: string
    type: string
    href: string
    attributes: Attributes54
    meta: Meta29
}

export interface Attributes54 {
    copyright: string
    genreNames: string[]
    releaseDate: string
    isMasteredForItunes: boolean
    upc: string
    artwork: Artwork50
    url: string
    playParams: PlayParams28
    recordLabel: string
    isCompilation: boolean
    trackCount: number
    isPrerelease: boolean
    audioTraits: string[]
    editorialArtwork: EditorialArtwork39
    isSingle: boolean
    name: string
    artistName: string
    contentRating: string
    isComplete: boolean
}

export interface Artwork50 {
    width: number
    url: string
    height: number
    textColor3: string
    textColor2: string
    textColor4: string
    textColor1: string
    bgColor: string
    hasP3: boolean
}

export interface PlayParams28 {
    id: string
    kind: string
}

export interface EditorialArtwork39 { }

export interface Meta29 {
    contentVersion: ContentVersion28
}

export interface ContentVersion28 {
    MZ_INDEXER: number
    RTCI: number
}

export type Songs = Record<string, N1781023369>;

export interface N1781023369 {
    id: string
    type: string
    href: string
    attributes: Attributes55
    relationships: Relationships
    meta: Meta30
}

export interface Attributes55 {
    hasTimeSyncedLyrics: boolean
    albumName: string
    genreNames: string[]
    trackNumber: number
    durationInMillis: number
    releaseDate: string
    isVocalAttenuationAllowed: boolean
    isMasteredForItunes: boolean
    isrc: string
    artwork: Artwork51
    audioLocale: string
    composerName: string
    playParams: PlayParams29
    url: string
    discNumber: number
    hasLyrics: boolean
    isAppleDigitalMaster: boolean
    audioTraits: string[]
    editorialArtwork: EditorialArtwork40
    name: string
    previews: Preview[]
    artistName: string
    contentRating: string
    extendedAssetUrls: ExtendedAssetUrls
}

export interface Artwork51 {
    width: number
    url: string
    height: number
    textColor3: string
    textColor2: string
    textColor4: string
    textColor1: string
    bgColor: string
    hasP3: boolean
}

export interface PlayParams29 {
    id: string
    kind: string
}

export interface EditorialArtwork40 { }

export interface Preview {
    url: string
}

export interface ExtendedAssetUrls {
    plus: string
    lightweight: string
    superLightweight: string
    lightweightPlus: string
    enhancedHls: string
}

export interface Relationships {
    artists: Artists2
    albums: Albums2
}

export interface Artists2 {
    href: string
    data: Daum8[]
}

export interface Daum8 {
    id: string
    type: string
    href: string
}

export interface Albums2 {
    href: string
    data: Daum9[]
}

export interface Daum9 {
    id: string
    type: string
    href: string
}

export interface Meta30 {
    contentVersion: ContentVersion29
}

export interface ContentVersion29 {
    MZ_INDEXER: number
    RTCI: number
}

export interface N1754104273 {
    id: string
    type: string
    href: string
    attributes: Attributes56
    relationships: Relationships2
    meta: Meta31
}

export interface Attributes56 {
    hasTimeSyncedLyrics: boolean
    albumName: string
    genreNames: string[]
    trackNumber: number
    durationInMillis: number
    releaseDate: string
    isVocalAttenuationAllowed: boolean
    isMasteredForItunes: boolean
    isrc: string
    artwork: Artwork52
    audioLocale: string
    composerName: string
    playParams: PlayParams30
    url: string
    discNumber: number
    hasLyrics: boolean
    isAppleDigitalMaster: boolean
    audioTraits: string[]
    editorialArtwork: EditorialArtwork41
    name: string
    previews: Preview2[]
    artistName: string
    contentRating: string
    extendedAssetUrls: ExtendedAssetUrls2
}

export interface Artwork52 {
    width: number
    url: string
    height: number
    textColor3: string
    textColor2: string
    textColor4: string
    textColor1: string
    bgColor: string
    hasP3: boolean
}

export interface PlayParams30 {
    id: string
    kind: string
}

export interface EditorialArtwork41 { }

export interface Preview2 {
    url: string
}

export interface ExtendedAssetUrls2 {
    plus: string
    lightweight: string
    superLightweight: string
    lightweightPlus: string
    enhancedHls: string
}

export interface Relationships2 {
    artists: Artists3
    albums: Albums3
}

export interface Artists3 {
    href: string
    data: Daum10[]
}

export interface Daum10 {
    id: string
    type: string
    href: string
}

export interface Albums3 {
    href: string
    data: Daum11[]
}

export interface Daum11 {
    id: string
    type: string
    href: string
}

export interface Meta31 {
    contentVersion: ContentVersion30
}

export interface ContentVersion30 {
    MZ_INDEXER: number
    RTCI: number
}

export interface N1764186522 {
    id: string
    type: string
    href: string
    attributes: Attributes57
    relationships: Relationships3
    meta: Meta32
}

export interface Attributes57 {
    hasTimeSyncedLyrics: boolean
    albumName: string
    genreNames: string[]
    trackNumber: number
    releaseDate: string
    durationInMillis: number
    isVocalAttenuationAllowed: boolean
    isMasteredForItunes: boolean
    isrc: string
    artwork: Artwork53
    audioLocale: string
    composerName: string
    url: string
    playParams: PlayParams31
    discNumber: number
    hasLyrics: boolean
    isAppleDigitalMaster: boolean
    audioTraits: string[]
    editorialArtwork: EditorialArtwork42
    name: string
    previews: Preview3[]
    artistName: string
    contentRating: string
    extendedAssetUrls: ExtendedAssetUrls3
}

export interface Artwork53 {
    width: number
    url: string
    height: number
    textColor3: string
    textColor2: string
    textColor4: string
    textColor1: string
    bgColor: string
    hasP3: boolean
}

export interface PlayParams31 {
    id: string
    kind: string
}

export interface EditorialArtwork42 { }

export interface Preview3 {
    url: string
}

export interface ExtendedAssetUrls3 {
    plus: string
    lightweight: string
    superLightweight: string
    lightweightPlus: string
    enhancedHls: string
}

export interface Relationships3 {
    artists: Artists4
    albums: Albums4
}

export interface Artists4 {
    href: string
    data: Daum12[]
}

export interface Daum12 {
    id: string
    type: string
    href: string
}

export interface Albums4 {
    href: string
    data: Daum13[]
}

export interface Daum13 {
    id: string
    type: string
    href: string
}

export interface Meta32 {
    contentVersion: ContentVersion31
}

export interface ContentVersion31 {
    MZ_INDEXER: number
    RTCI: number
}

export interface N1757509874 {
    id: string
    type: string
    href: string
    attributes: Attributes58
    relationships: Relationships4
    meta: Meta33
}

export interface Attributes58 {
    albumName: string
    hasTimeSyncedLyrics: boolean
    genreNames: string[]
    trackNumber: number
    releaseDate: string
    durationInMillis: number
    isVocalAttenuationAllowed: boolean
    isMasteredForItunes: boolean
    isrc: string
    artwork: Artwork54
    audioLocale: string
    composerName: string
    url: string
    playParams: PlayParams32
    discNumber: number
    isAppleDigitalMaster: boolean
    hasLyrics: boolean
    audioTraits: string[]
    editorialArtwork: EditorialArtwork43
    name: string
    previews: Preview4[]
    artistName: string
    contentRating: string
    extendedAssetUrls: ExtendedAssetUrls4
}

export interface Artwork54 {
    width: number
    url: string
    height: number
    textColor3: string
    textColor2: string
    textColor4: string
    textColor1: string
    bgColor: string
    hasP3: boolean
}

export interface PlayParams32 {
    id: string
    kind: string
}

export interface EditorialArtwork43 { }

export interface Preview4 {
    url: string
}

export interface ExtendedAssetUrls4 {
    plus: string
    lightweight: string
    superLightweight: string
    lightweightPlus: string
    enhancedHls: string
}

export interface Relationships4 {
    artists: Artists5
    albums: Albums5
}

export interface Artists5 {
    href: string
    data: Daum14[]
}

export interface Daum14 {
    id: string
    type: string
    href: string
}

export interface Albums5 {
    href: string
    data: Daum15[]
}

export interface Daum15 {
    id: string
    type: string
    href: string
}

export interface Meta33 {
    contentVersion: ContentVersion32
}

export interface ContentVersion32 {
    MZ_INDEXER: number
    RTCI: number
}

export interface N1796150995 {
    id: string
    type: string
    href: string
    attributes: Attributes59
    relationships: Relationships5
    meta: Meta34
}

export interface Attributes59 {
    hasTimeSyncedLyrics: boolean
    albumName: string
    genreNames: string[]
    trackNumber: number
    durationInMillis: number
    releaseDate: string
    isVocalAttenuationAllowed: boolean
    isMasteredForItunes: boolean
    isrc: string
    artwork: Artwork55
    audioLocale: string
    composerName: string
    playParams: PlayParams33
    url: string
    discNumber: number
    hasLyrics: boolean
    isAppleDigitalMaster: boolean
    audioTraits: string[]
    editorialArtwork: EditorialArtwork44
    name: string
    previews: Preview5[]
    artistName: string
    contentRating: string
    extendedAssetUrls: ExtendedAssetUrls5
}

export interface Artwork55 {
    width: number
    url: string
    height: number
    textColor3: string
    textColor2: string
    textColor4: string
    textColor1: string
    bgColor: string
    hasP3: boolean
}

export interface PlayParams33 {
    id: string
    kind: string
}

export interface EditorialArtwork44 { }

export interface Preview5 {
    url: string
}

export interface ExtendedAssetUrls5 {
    plus: string
    lightweight: string
    superLightweight: string
    lightweightPlus: string
    enhancedHls: string
}

export interface Relationships5 {
    artists: Artists6
    albums: Albums6
}

export interface Artists6 {
    href: string
    data: Daum16[]
}

export interface Daum16 {
    id: string
    type: string
    href: string
}

export interface Albums6 {
    href: string
    data: Daum17[]
}

export interface Daum17 {
    id: string
    type: string
    href: string
}

export interface Meta34 {
    contentVersion: ContentVersion33
}

export interface ContentVersion33 {
    MZ_INDEXER: number
    RTCI: number
}

export interface N1754099629 {
    id: string
    type: string
    href: string
    attributes: Attributes60
    relationships: Relationships6
    meta: Meta35
}

export interface Attributes60 {
    hasTimeSyncedLyrics: boolean
    albumName: string
    genreNames: string[]
    trackNumber: number
    releaseDate: string
    durationInMillis: number
    isVocalAttenuationAllowed: boolean
    isMasteredForItunes: boolean
    isrc: string
    artwork: Artwork56
    audioLocale: string
    composerName: string
    url: string
    playParams: PlayParams34
    discNumber: number
    hasLyrics: boolean
    isAppleDigitalMaster: boolean
    audioTraits: string[]
    editorialArtwork: EditorialArtwork45
    name: string
    previews: Preview6[]
    artistName: string
    contentRating: string
    extendedAssetUrls: ExtendedAssetUrls6
}

export interface Artwork56 {
    width: number
    url: string
    height: number
    textColor3: string
    textColor2: string
    textColor4: string
    textColor1: string
    bgColor: string
    hasP3: boolean
}

export interface PlayParams34 {
    id: string
    kind: string
}

export interface EditorialArtwork45 { }

export interface Preview6 {
    url: string
}

export interface ExtendedAssetUrls6 {
    plus: string
    lightweight: string
    superLightweight: string
    lightweightPlus: string
    enhancedHls: string
}

export interface Relationships6 {
    artists: Artists7
    albums: Albums7
}

export interface Artists7 {
    href: string
    data: Daum18[]
}

export interface Daum18 {
    id: string
    type: string
    href: string
}

export interface Albums7 {
    href: string
    data: Daum19[]
}

export interface Daum19 {
    id: string
    type: string
    href: string
}

export interface Meta35 {
    contentVersion: ContentVersion34
}

export interface ContentVersion34 {
    MZ_INDEXER: number
    RTCI: number
}

export interface N1792403455 {
    id: string
    type: string
    href: string
    attributes: Attributes61
    relationships: Relationships7
    meta: Meta36
}

export interface Attributes61 {
    hasTimeSyncedLyrics: boolean
    albumName: string
    genreNames: string[]
    trackNumber: number
    durationInMillis: number
    releaseDate: string
    isVocalAttenuationAllowed: boolean
    isMasteredForItunes: boolean
    isrc: string
    artwork: Artwork57
    audioLocale: string
    composerName: string
    playParams: PlayParams35
    url: string
    discNumber: number
    hasLyrics: boolean
    isAppleDigitalMaster: boolean
    audioTraits: string[]
    editorialArtwork: EditorialArtwork46
    name: string
    previews: Preview7[]
    artistName: string
    contentRating: string
    extendedAssetUrls: ExtendedAssetUrls7
}

export interface Artwork57 {
    width: number
    url: string
    height: number
    textColor3: string
    textColor2: string
    textColor4: string
    textColor1: string
    bgColor: string
    hasP3: boolean
}

export interface PlayParams35 {
    id: string
    kind: string
}

export interface EditorialArtwork46 { }

export interface Preview7 {
    url: string
}

export interface ExtendedAssetUrls7 {
    plus: string
    lightweight: string
    superLightweight: string
    lightweightPlus: string
    enhancedHls: string
}

export interface Relationships7 {
    artists: Artists8
    albums: Albums8
}

export interface Artists8 {
    href: string
    data: Daum20[]
}

export interface Daum20 {
    id: string
    type: string
    href: string
}

export interface Albums8 {
    href: string
    data: Daum21[]
}

export interface Daum21 {
    id: string
    type: string
    href: string
}

export interface Meta36 {
    contentVersion: ContentVersion35
}

export interface ContentVersion35 {
    MZ_INDEXER: number
    RTCI: number
}

export interface N1778233707 {
    id: string
    type: string
    href: string
    attributes: Attributes62
    relationships: Relationships8
    meta: Meta37
}

export interface Attributes62 {
    albumName: string
    hasTimeSyncedLyrics: boolean
    genreNames: string[]
    trackNumber: number
    releaseDate: string
    durationInMillis: number
    isVocalAttenuationAllowed: boolean
    isMasteredForItunes: boolean
    isrc: string
    artwork: Artwork58
    audioLocale: string
    composerName: string
    url: string
    playParams: PlayParams36
    discNumber: number
    isAppleDigitalMaster: boolean
    hasLyrics: boolean
    audioTraits: string[]
    editorialArtwork: EditorialArtwork47
    name: string
    previews: Preview8[]
    artistName: string
    contentRating: string
    extendedAssetUrls: ExtendedAssetUrls8
}

export interface Artwork58 {
    width: number
    url: string
    height: number
    textColor3: string
    textColor2: string
    textColor4: string
    textColor1: string
    bgColor: string
    hasP3: boolean
}

export interface PlayParams36 {
    id: string
    kind: string
}

export interface EditorialArtwork47 { }

export interface Preview8 {
    url: string
}

export interface ExtendedAssetUrls8 {
    plus: string
    lightweight: string
    superLightweight: string
    lightweightPlus: string
    enhancedHls: string
}

export interface Relationships8 {
    artists: Artists9
    albums: Albums9
}

export interface Artists9 {
    href: string
    data: Daum22[]
}

export interface Daum22 {
    id: string
    type: string
    href: string
}

export interface Albums9 {
    href: string
    data: Daum23[]
}

export interface Daum23 {
    id: string
    type: string
    href: string
}

export interface Meta37 {
    contentVersion: ContentVersion36
}

export interface ContentVersion36 {
    MZ_INDEXER: number
    RTCI: number
}

export interface N1758200137 {
    id: string
    type: string
    href: string
    attributes: Attributes63
    relationships: Relationships9
    meta: Meta38
}

export interface Attributes63 {
    hasTimeSyncedLyrics: boolean
    albumName: string
    genreNames: string[]
    trackNumber: number
    durationInMillis: number
    releaseDate: string
    isVocalAttenuationAllowed: boolean
    isMasteredForItunes: boolean
    isrc: string
    artwork: Artwork59
    audioLocale: string
    composerName: string
    url: string
    playParams: PlayParams37
    discNumber: number
    hasLyrics: boolean
    isAppleDigitalMaster: boolean
    audioTraits: string[]
    editorialArtwork: EditorialArtwork48
    name: string
    previews: Preview9[]
    artistName: string
    contentRating: string
    extendedAssetUrls: ExtendedAssetUrls9
}

export interface Artwork59 {
    width: number
    url: string
    height: number
    textColor3: string
    textColor2: string
    textColor4: string
    textColor1: string
    bgColor: string
    hasP3: boolean
}

export interface PlayParams37 {
    id: string
    kind: string
}

export interface EditorialArtwork48 { }

export interface Preview9 {
    url: string
}

export interface ExtendedAssetUrls9 {
    plus: string
    lightweight: string
    superLightweight: string
    lightweightPlus: string
    enhancedHls: string
}

export interface Relationships9 {
    artists: Artists10
    albums: Albums10
}

export interface Artists10 {
    href: string
    data: Daum24[]
}

export interface Daum24 {
    id: string
    type: string
    href: string
}

export interface Albums10 {
    href: string
    data: Daum25[]
}

export interface Daum25 {
    id: string
    type: string
    href: string
}

export interface Meta38 {
    contentVersion: ContentVersion37
}

export interface ContentVersion37 {
    MZ_INDEXER: number
    RTCI: number
}

export interface N1757509878 {
    id: string
    type: string
    href: string
    attributes: Attributes64
    relationships: Relationships10
    meta: Meta39
}

export interface Attributes64 {
    hasTimeSyncedLyrics: boolean
    albumName: string
    genreNames: string[]
    trackNumber: number
    releaseDate: string
    durationInMillis: number
    isVocalAttenuationAllowed: boolean
    isMasteredForItunes: boolean
    isrc: string
    artwork: Artwork60
    audioLocale: string
    composerName: string
    url: string
    playParams: PlayParams38
    discNumber: number
    hasLyrics: boolean
    isAppleDigitalMaster: boolean
    audioTraits: string[]
    editorialArtwork: EditorialArtwork49
    name: string
    previews: Preview10[]
    artistName: string
    contentRating: string
    extendedAssetUrls: ExtendedAssetUrls10
}

export interface Artwork60 {
    width: number
    url: string
    height: number
    textColor3: string
    textColor2: string
    textColor4: string
    textColor1: string
    bgColor: string
    hasP3: boolean
}

export interface PlayParams38 {
    id: string
    kind: string
}

export interface EditorialArtwork49 { }

export interface Preview10 {
    url: string
}

export interface ExtendedAssetUrls10 {
    plus: string
    lightweight: string
    superLightweight: string
    lightweightPlus: string
    enhancedHls: string
}

export interface Relationships10 {
    artists: Artists11
    albums: Albums11
}

export interface Artists11 {
    href: string
    data: Daum26[]
}

export interface Daum26 {
    id: string
    type: string
    href: string
}

export interface Albums11 {
    href: string
    data: Daum27[]
}

export interface Daum27 {
    id: string
    type: string
    href: string
}

export interface Meta39 {
    contentVersion: ContentVersion38
}

export interface ContentVersion38 {
    MZ_INDEXER: number
    RTCI: number
}

export interface N1783509656 {
    id: string
    type: string
    href: string
    attributes: Attributes65
    relationships: Relationships11
    meta: Meta40
}

export interface Attributes65 {
    albumName: string
    hasTimeSyncedLyrics: boolean
    genreNames: string[]
    trackNumber: number
    releaseDate: string
    durationInMillis: number
    isVocalAttenuationAllowed: boolean
    isMasteredForItunes: boolean
    isrc: string
    artwork: Artwork61
    audioLocale: string
    composerName: string
    url: string
    playParams: PlayParams39
    discNumber: number
    isAppleDigitalMaster: boolean
    hasLyrics: boolean
    audioTraits: string[]
    editorialArtwork: EditorialArtwork50
    name: string
    previews: Preview11[]
    artistName: string
    contentRating: string
    extendedAssetUrls: ExtendedAssetUrls11
}

export interface Artwork61 {
    width: number
    url: string
    height: number
    textColor3: string
    textColor2: string
    textColor4: string
    textColor1: string
    bgColor: string
    hasP3: boolean
}

export interface PlayParams39 {
    id: string
    kind: string
}

export interface EditorialArtwork50 { }

export interface Preview11 {
    url: string
}

export interface ExtendedAssetUrls11 {
    plus: string
    lightweight: string
    superLightweight: string
    lightweightPlus: string
    enhancedHls: string
}

export interface Relationships11 {
    artists: Artists12
    albums: Albums12
}

export interface Artists12 {
    href: string
    data: Daum28[]
}

export interface Daum28 {
    id: string
    type: string
    href: string
}

export interface Albums12 {
    href: string
    data: Daum29[]
}

export interface Daum29 {
    id: string
    type: string
    href: string
}

export interface Meta40 {
    contentVersion: ContentVersion39
}

export interface ContentVersion39 {
    MZ_INDEXER: number
    RTCI: number
}

export interface N1788574999 {
    id: string
    type: string
    href: string
    attributes: Attributes66
    relationships: Relationships12
    meta: Meta41
}

export interface Attributes66 {
    albumName: string
    hasTimeSyncedLyrics: boolean
    genreNames: string[]
    trackNumber: number
    releaseDate: string
    durationInMillis: number
    isVocalAttenuationAllowed: boolean
    isMasteredForItunes: boolean
    isrc: string
    artwork: Artwork62
    audioLocale: string
    composerName: string
    playParams: PlayParams40
    url: string
    discNumber: number
    isAppleDigitalMaster: boolean
    hasLyrics: boolean
    audioTraits: string[]
    editorialArtwork: EditorialArtwork51
    name: string
    previews: Preview12[]
    artistName: string
    contentRating: string
    extendedAssetUrls: ExtendedAssetUrls12
}

export interface Artwork62 {
    width: number
    url: string
    height: number
    textColor3: string
    textColor2: string
    textColor4: string
    textColor1: string
    bgColor: string
    hasP3: boolean
}

export interface PlayParams40 {
    id: string
    kind: string
}

export interface EditorialArtwork51 { }

export interface Preview12 {
    url: string
}

export interface ExtendedAssetUrls12 {
    plus: string
    lightweight: string
    superLightweight: string
    lightweightPlus: string
    enhancedHls: string
}

export interface Relationships12 {
    artists: Artists13
    albums: Albums13
}

export interface Artists13 {
    href: string
    data: Daum30[]
}

export interface Daum30 {
    id: string
    type: string
    href: string
}

export interface Albums13 {
    href: string
    data: Daum31[]
}

export interface Daum31 {
    id: string
    type: string
    href: string
}

export interface Meta41 {
    contentVersion: ContentVersion40
}

export interface ContentVersion40 {
    MZ_INDEXER: number
    RTCI: number
}

export interface N1757509873 {
    id: string
    type: string
    href: string
    attributes: Attributes67
    relationships: Relationships13
    meta: Meta42
}

export interface Attributes67 {
    hasTimeSyncedLyrics: boolean
    albumName: string
    genreNames: string[]
    trackNumber: number
    durationInMillis: number
    releaseDate: string
    isVocalAttenuationAllowed: boolean
    isMasteredForItunes: boolean
    isrc: string
    artwork: Artwork63
    audioLocale: string
    composerName: string
    url: string
    playParams: PlayParams41
    discNumber: number
    hasLyrics: boolean
    isAppleDigitalMaster: boolean
    audioTraits: string[]
    editorialArtwork: EditorialArtwork52
    name: string
    previews: Preview13[]
    artistName: string
    contentRating: string
    extendedAssetUrls: ExtendedAssetUrls13
}

export interface Artwork63 {
    width: number
    url: string
    height: number
    textColor3: string
    textColor2: string
    textColor4: string
    textColor1: string
    bgColor: string
    hasP3: boolean
}

export interface PlayParams41 {
    id: string
    kind: string
}

export interface EditorialArtwork52 { }

export interface Preview13 {
    url: string
}

export interface ExtendedAssetUrls13 {
    plus: string
    lightweight: string
    superLightweight: string
    lightweightPlus: string
    enhancedHls: string
}

export interface Relationships13 {
    artists: Artists14
    albums: Albums14
}

export interface Artists14 {
    href: string
    data: Daum32[]
}

export interface Daum32 {
    id: string
    type: string
    href: string
}

export interface Albums14 {
    href: string
    data: Daum33[]
}

export interface Daum33 {
    id: string
    type: string
    href: string
}

export interface Meta42 {
    contentVersion: ContentVersion41
}

export interface ContentVersion41 {
    MZ_INDEXER: number
    RTCI: number
}

export interface N1797769178 {
    id: string
    type: string
    href: string
    attributes: Attributes68
    relationships: Relationships14
    meta: Meta43
}

export interface Attributes68 {
    albumName: string
    hasTimeSyncedLyrics: boolean
    genreNames: string[]
    trackNumber: number
    releaseDate: string
    durationInMillis: number
    isVocalAttenuationAllowed: boolean
    isMasteredForItunes: boolean
    isrc: string
    artwork: Artwork64
    audioLocale: string
    composerName: string
    playParams: PlayParams42
    url: string
    discNumber: number
    isAppleDigitalMaster: boolean
    hasLyrics: boolean
    audioTraits: string[]
    editorialArtwork: EditorialArtwork53
    name: string
    previews: Preview14[]
    artistName: string
    contentRating: string
    extendedAssetUrls: ExtendedAssetUrls14
}

export interface Artwork64 {
    width: number
    url: string
    height: number
    textColor3: string
    textColor2: string
    textColor4: string
    textColor1: string
    bgColor: string
    hasP3: boolean
}

export interface PlayParams42 {
    id: string
    kind: string
}

export interface EditorialArtwork53 { }

export interface Preview14 {
    url: string
}

export interface ExtendedAssetUrls14 {
    plus: string
    lightweight: string
    superLightweight: string
    lightweightPlus: string
    enhancedHls: string
}

export interface Relationships14 {
    artists: Artists15
    albums: Albums15
}

export interface Artists15 {
    href: string
    data: Daum34[]
}

export interface Daum34 {
    id: string
    type: string
    href: string
}

export interface Albums15 {
    href: string
    data: Daum35[]
}

export interface Daum35 {
    id: string
    type: string
    href: string
}

export interface Meta43 {
    contentVersion: ContentVersion42
}

export interface ContentVersion42 {
    MZ_INDEXER: number
    RTCI: number
}

export interface N1754100044 {
    id: string
    type: string
    href: string
    attributes: Attributes69
    relationships: Relationships15
    meta: Meta44
}

export interface Attributes69 {
    albumName: string
    hasTimeSyncedLyrics: boolean
    genreNames: string[]
    trackNumber: number
    releaseDate: string
    durationInMillis: number
    isVocalAttenuationAllowed: boolean
    isMasteredForItunes: boolean
    isrc: string
    artwork: Artwork65
    audioLocale: string
    composerName: string
    playParams: PlayParams43
    url: string
    discNumber: number
    isAppleDigitalMaster: boolean
    hasLyrics: boolean
    audioTraits: string[]
    editorialArtwork: EditorialArtwork54
    name: string
    previews: Preview15[]
    artistName: string
    contentRating: string
    extendedAssetUrls: ExtendedAssetUrls15
}

export interface Artwork65 {
    width: number
    url: string
    height: number
    textColor3: string
    textColor2: string
    textColor4: string
    textColor1: string
    bgColor: string
    hasP3: boolean
}

export interface PlayParams43 {
    id: string
    kind: string
}

export interface EditorialArtwork54 { }

export interface Preview15 {
    url: string
}

export interface ExtendedAssetUrls15 {
    plus: string
    lightweight: string
    superLightweight: string
    lightweightPlus: string
    enhancedHls: string
}

export interface Relationships15 {
    artists: Artists16
    albums: Albums16
}

export interface Artists16 {
    href: string
    data: Daum36[]
}

export interface Daum36 {
    id: string
    type: string
    href: string
}

export interface Albums16 {
    href: string
    data: Daum37[]
}

export interface Daum37 {
    id: string
    type: string
    href: string
}

export interface Meta44 {
    contentVersion: ContentVersion43
}

export interface ContentVersion43 {
    MZ_INDEXER: number
    RTCI: number
}

export interface N1783509665 {
    id: string
    type: string
    href: string
    attributes: Attributes70
    relationships: Relationships16
    meta: Meta45
}

export interface Attributes70 {
    albumName: string
    hasTimeSyncedLyrics: boolean
    genreNames: string[]
    trackNumber: number
    releaseDate: string
    durationInMillis: number
    isVocalAttenuationAllowed: boolean
    isMasteredForItunes: boolean
    isrc: string
    artwork: Artwork66
    audioLocale: string
    composerName: string
    playParams: PlayParams44
    url: string
    discNumber: number
    isAppleDigitalMaster: boolean
    hasLyrics: boolean
    audioTraits: string[]
    editorialArtwork: EditorialArtwork55
    name: string
    previews: Preview16[]
    artistName: string
    contentRating: string
    extendedAssetUrls: ExtendedAssetUrls16
}

export interface Artwork66 {
    width: number
    url: string
    height: number
    textColor3: string
    textColor2: string
    textColor4: string
    textColor1: string
    bgColor: string
    hasP3: boolean
}

export interface PlayParams44 {
    id: string
    kind: string
}

export interface EditorialArtwork55 { }

export interface Preview16 {
    url: string
}

export interface ExtendedAssetUrls16 {
    plus: string
    lightweight: string
    superLightweight: string
    lightweightPlus: string
    enhancedHls: string
}

export interface Relationships16 {
    artists: Artists17
    albums: Albums17
}

export interface Artists17 {
    href: string
    data: Daum38[]
}

export interface Daum38 {
    id: string
    type: string
    href: string
}

export interface Albums17 {
    href: string
    data: Daum39[]
}

export interface Daum39 {
    id: string
    type: string
    href: string
}

export interface Meta45 {
    contentVersion: ContentVersion44
}

export interface ContentVersion44 {
    MZ_INDEXER: number
    RTCI: number
}

export interface N1762493713 {
    id: string
    type: string
    href: string
    attributes: Attributes71
    relationships: Relationships17
    meta: Meta46
}

export interface Attributes71 {
    albumName: string
    hasTimeSyncedLyrics: boolean
    genreNames: string[]
    trackNumber: number
    releaseDate: string
    durationInMillis: number
    isVocalAttenuationAllowed: boolean
    isMasteredForItunes: boolean
    isrc: string
    artwork: Artwork67
    audioLocale: string
    composerName: string
    playParams: PlayParams45
    url: string
    discNumber: number
    isAppleDigitalMaster: boolean
    hasLyrics: boolean
    audioTraits: string[]
    editorialArtwork: EditorialArtwork56
    name: string
    previews: Preview17[]
    artistName: string
    contentRating: string
    extendedAssetUrls: ExtendedAssetUrls17
}

export interface Artwork67 {
    width: number
    url: string
    height: number
    textColor3: string
    textColor2: string
    textColor4: string
    textColor1: string
    bgColor: string
    hasP3: boolean
}

export interface PlayParams45 {
    id: string
    kind: string
}

export interface EditorialArtwork56 { }

export interface Preview17 {
    url: string
}

export interface ExtendedAssetUrls17 {
    plus: string
    lightweight: string
    superLightweight: string
    lightweightPlus: string
    enhancedHls: string
}

export interface Relationships17 {
    artists: Artists18
    albums: Albums18
}

export interface Artists18 {
    href: string
    data: Daum40[]
}

export interface Daum40 {
    id: string
    type: string
    href: string
}

export interface Albums18 {
    href: string
    data: Daum41[]
}

export interface Daum41 {
    id: string
    type: string
    href: string
}

export interface Meta46 {
    contentVersion: ContentVersion45
}

export interface ContentVersion45 {
    MZ_INDEXER: number
    RTCI: number
}

export interface N1757509868 {
    id: string
    type: string
    href: string
    attributes: Attributes72
    relationships: Relationships18
    meta: Meta47
}

export interface Attributes72 {
    albumName: string
    hasTimeSyncedLyrics: boolean
    genreNames: string[]
    trackNumber: number
    releaseDate: string
    durationInMillis: number
    isVocalAttenuationAllowed: boolean
    isMasteredForItunes: boolean
    isrc: string
    artwork: Artwork68
    audioLocale: string
    composerName: string
    playParams: PlayParams46
    url: string
    discNumber: number
    isAppleDigitalMaster: boolean
    hasLyrics: boolean
    audioTraits: string[]
    editorialArtwork: EditorialArtwork57
    name: string
    previews: Preview18[]
    artistName: string
    contentRating: string
    extendedAssetUrls: ExtendedAssetUrls18
}

export interface Artwork68 {
    width: number
    url: string
    height: number
    textColor3: string
    textColor2: string
    textColor4: string
    textColor1: string
    bgColor: string
    hasP3: boolean
}

export interface PlayParams46 {
    id: string
    kind: string
}

export interface EditorialArtwork57 { }

export interface Preview18 {
    url: string
}

export interface ExtendedAssetUrls18 {
    plus: string
    lightweight: string
    superLightweight: string
    lightweightPlus: string
    enhancedHls: string
}

export interface Relationships18 {
    artists: Artists19
    albums: Albums19
}

export interface Artists19 {
    href: string
    data: Daum42[]
}

export interface Daum42 {
    id: string
    type: string
    href: string
}

export interface Albums19 {
    href: string
    data: Daum43[]
}

export interface Daum43 {
    id: string
    type: string
    href: string
}

export interface Meta47 {
    contentVersion: ContentVersion46
}

export interface ContentVersion46 {
    MZ_INDEXER: number
    RTCI: number
}

export interface N1626131458 {
    id: string
    type: string
    href: string
    attributes: Attributes73
    relationships: Relationships19
    meta: Meta48
}

export interface Attributes73 {
    albumName: string
    hasTimeSyncedLyrics: boolean
    genreNames: string[]
    trackNumber: number
    durationInMillis: number
    releaseDate: string
    isVocalAttenuationAllowed: boolean
    isMasteredForItunes: boolean
    isrc: string
    artwork: Artwork69
    audioLocale: string
    composerName: string
    url: string
    playParams: PlayParams47
    discNumber: number
    isAppleDigitalMaster: boolean
    hasLyrics: boolean
    audioTraits: string[]
    editorialArtwork: EditorialArtwork58
    name: string
    previews: Preview19[]
    artistName: string
    contentRating: string
    extendedAssetUrls: ExtendedAssetUrls19
}

export interface Artwork69 {
    width: number
    url: string
    height: number
    textColor3: string
    textColor2: string
    textColor4: string
    textColor1: string
    bgColor: string
    hasP3: boolean
}

export interface PlayParams47 {
    id: string
    kind: string
}

export interface EditorialArtwork58 { }

export interface Preview19 {
    url: string
}

export interface ExtendedAssetUrls19 {
    plus: string
    lightweight: string
    superLightweight: string
    lightweightPlus: string
    enhancedHls: string
}

export interface Relationships19 {
    artists: Artists20
    albums: Albums20
}

export interface Artists20 {
    href: string
    data: Daum44[]
}

export interface Daum44 {
    id: string
    type: string
    href: string
}

export interface Albums20 {
    href: string
    data: Daum45[]
}

export interface Daum45 {
    id: string
    type: string
    href: string
}

export interface Meta48 {
    contentVersion: ContentVersion47
}

export interface ContentVersion47 {
    MZ_INDEXER: number
    RTCI: number
}

export interface N1757510159 {
    id: string
    type: string
    href: string
    attributes: Attributes74
    relationships: Relationships20
    meta: Meta49
}

export interface Attributes74 {
    hasTimeSyncedLyrics: boolean
    albumName: string
    genreNames: string[]
    trackNumber: number
    durationInMillis: number
    releaseDate: string
    isVocalAttenuationAllowed: boolean
    isMasteredForItunes: boolean
    isrc: string
    artwork: Artwork70
    audioLocale: string
    composerName: string
    playParams: PlayParams48
    url: string
    discNumber: number
    hasLyrics: boolean
    isAppleDigitalMaster: boolean
    audioTraits: string[]
    editorialArtwork: EditorialArtwork59
    name: string
    previews: Preview20[]
    artistName: string
    contentRating: string
    extendedAssetUrls: ExtendedAssetUrls20
}

export interface Artwork70 {
    width: number
    url: string
    height: number
    textColor3: string
    textColor2: string
    textColor4: string
    textColor1: string
    bgColor: string
    hasP3: boolean
}

export interface PlayParams48 {
    id: string
    kind: string
}

export interface EditorialArtwork59 { }

export interface Preview20 {
    url: string
}

export interface ExtendedAssetUrls20 {
    plus: string
    lightweight: string
    superLightweight: string
    lightweightPlus: string
    enhancedHls: string
}

export interface Relationships20 {
    artists: Artists21
    albums: Albums21
}

export interface Artists21 {
    href: string
    data: Daum46[]
}

export interface Daum46 {
    id: string
    type: string
    href: string
}

export interface Albums21 {
    href: string
    data: Daum47[]
}

export interface Daum47 {
    id: string
    type: string
    href: string
}

export interface Meta49 {
    contentVersion: ContentVersion48
}

export interface ContentVersion48 {
    MZ_INDEXER: number
    RTCI: number
}
