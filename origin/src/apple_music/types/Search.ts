export interface Search {
    results: Results
    resources: Resources
    meta: Meta43
}

export interface Results {
    top: Top
    artist: Artist
    album: Album
    song: Song
    playlist: Playlist
    station: Station
    music_video: MusicVideo
}

export interface Top {
    groupId: string
    name: string
    data: Daum[]
}

export interface Daum {
    id: string
    type: string
    href: string
}

export interface Artist {
    href: string
    groupId: string
    data: Daum2[]
    name: string
}

export interface Daum2 {
    id: string
    type: string
    href: string
}

export interface Album {
    href: string
    next: string
    data: Daum3[]
    name: string
    groupId: string
}

export interface Daum3 {
    id: string
    type: string
    href: string
}

export interface Song {
    href: string
    next: string
    data: Daum4[]
    name: string
    groupId: string
}

export interface Daum4 {
    id: string
    type: string
    href: string
}

export interface Playlist {
    href: string
    groupId: string
    data: Daum5[]
    name: string
}

export interface Daum5 {
    id: string
    type: string
    href: string
}

export interface Station {
    href: string
    groupId: string
    data: Daum6[]
    name: string
}

export interface Daum6 {
    id: string
    type: string
    href: string
}

export interface MusicVideo {
    href: string
    next: string
    data: Daum7[]
    name: string
    groupId: string
}

export interface Daum7 {
    id: string
    type: string
    href: string
}

export interface Resources {
    artists: Artists
    albums: Albums
    songs: Songs
    stations: Stations
    playlists: Playlists
    "music-videos": MusicVideos
}

export type Artists = Record<string, SearchArtist>;

export interface N111051 {
    id: string
    type: string
    href: string
    attributes: Attributes
}

export interface Attributes {
    name: string
    artwork: Artwork
    url: string
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
    hasP3: boolean
}

export interface SearchArtist {
    id: string
    type: string
    href: string
    attributes: Attributes2
}

export interface Attributes2 {
    name: string
    artwork: Artwork2
    url: string
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

export interface N876936080 {
    id: string
    type: string
    href: string
    attributes: Attributes3
}

export interface Attributes3 {
    name: string
    url: string
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

export interface N1209282817 {
    id: string
    type: string
    href: string
    attributes: Attributes4
}

export interface Attributes4 {
    name: string
    url: string
    artwork: Artwork4
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

export interface N1433819455 {
    id: string
    type: string
    href: string
    attributes: Attributes5
}

export interface Attributes5 {
    name: string
    artwork: Artwork5
    url: string
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
    hasP3: boolean
}

export interface N1466581504 {
    id: string
    type: string
    href: string
    attributes: Attributes6
}

export interface Attributes6 {
    name: string
    url: string
}

export interface N1473678677 {
    id: string
    type: string
    href: string
    attributes: Attributes7
}

export interface Attributes7 {
    name: string
    artwork: Artwork6
    url: string
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

export interface N1473692829 {
    id: string
    type: string
    href: string
    attributes: Attributes8
}

export interface Attributes8 {
    name: string
    url: string
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
    hasP3: boolean
}

export interface N1478240563 {
    id: string
    type: string
    href: string
    attributes: Attributes9
}

export interface Attributes9 {
    name: string
    artwork: Artwork8
    url: string
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

export interface N1501036002 {
    id: string
    type: string
    href: string
    attributes: Attributes10
}

export interface Attributes10 {
    name: string
    artwork: Artwork9
    url: string
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

export interface N1550747046 {
    id: string
    type: string
    href: string
    attributes: Attributes11
}

export interface Attributes11 {
    name: string
    artwork: Artwork10
    url: string
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

export interface N1562917315 {
    id: string
    type: string
    href: string
    attributes: Attributes12
}

export interface Attributes12 {
    name: string
    artwork: Artwork11
    url: string
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
    hasP3: boolean
}

export interface N1573432856 {
    id: string
    type: string
    href: string
    attributes: Attributes13
}

export interface Attributes13 {
    name: string
    artwork: Artwork12
    url: string
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

export interface N1638445286 {
    id: string
    type: string
    href: string
    attributes: Attributes14
}

export interface Attributes14 {
    name: string
    artwork: Artwork13
    url: string
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

export type Albums = Record<string, SearchAlbum>;

export interface SearchAlbum {
    id: string
    type: string
    href: string
    attributes: Attributes15
    relationships: Relationships
    meta: Meta
}

export interface Attributes15 {
    trackCount: number
    releaseDate: string
    editorialArtwork: EditorialArtwork
    artistUrl: string
    name: string
    contentRating: string
    artistName: string
    artwork: Artwork14
    url: string
    playParams: PlayParams
}

export interface EditorialArtwork { }

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

export interface PlayParams {
    id: string
    kind: string
}

export interface Relationships {
    artists: Artists2
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

export interface Meta {
    contentVersion: ContentVersion
}

export interface ContentVersion {
    MZ_INDEXER: number
    RTCI: number
}

export interface N1576227543 {
    id: string
    type: string
    href: string
    attributes: Attributes16
    relationships: Relationships2
    meta: Meta2
}

export interface Attributes16 {
    trackCount: number
    releaseDate: string
    editorialArtwork: EditorialArtwork2
    artistUrl: string
    name: string
    contentRating: string
    artistName: string
    artwork: Artwork15
    url: string
    playParams: PlayParams2
}

export interface EditorialArtwork2 { }

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

export interface PlayParams2 {
    id: string
    kind: string
}

export interface Relationships2 {
    artists: Artists3
}

export interface Artists3 {
    href: string
    data: Daum9[]
}

export interface Daum9 {
    id: string
    type: string
    href: string
}

export interface Meta2 {
    contentVersion: ContentVersion2
}

export interface ContentVersion2 {
    RTCI: number
    MZ_INDEXER: number
}

export interface N1590219455 {
    id: string
    type: string
    href: string
    attributes: Attributes17
    relationships: Relationships3
    meta: Meta3
}

export interface Attributes17 {
    trackCount: number
    releaseDate: string
    editorialArtwork: EditorialArtwork3
    artistUrl: string
    name: string
    contentRating: string
    artistName: string
    artwork: Artwork16
    url: string
    playParams: PlayParams3
}

export interface EditorialArtwork3 { }

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

export interface PlayParams3 {
    id: string
    kind: string
}

export interface Relationships3 {
    artists: Artists4
}

export interface Artists4 {
    href: string
    data: Daum10[]
}

export interface Daum10 {
    id: string
    type: string
    href: string
}

export interface Meta3 {
    contentVersion: ContentVersion3
}

export interface ContentVersion3 {
    RTCI: number
    MZ_INDEXER: number
}

export interface N1610195530 {
    id: string
    type: string
    href: string
    attributes: Attributes18
    relationships: Relationships4
    meta: Meta4
}

export interface Attributes18 {
    trackCount: number
    releaseDate: string
    editorialArtwork: EditorialArtwork4
    artistUrl: string
    name: string
    contentRating: string
    artistName: string
    artwork: Artwork17
    url: string
    playParams: PlayParams4
}

export interface EditorialArtwork4 {
    staticDetailTall: StaticDetailTall
    staticDetailSquare: StaticDetailSquare
}

export interface StaticDetailTall {
    width: number
    url: string
    textGradient: string[]
    height: number
    textColor3: string
    textColor2: string
    textColor4: string
    textColor1: string
    bgColor: string
    hasP3: boolean
}

export interface StaticDetailSquare {
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

export interface PlayParams4 {
    id: string
    kind: string
}

export interface Relationships4 {
    artists: Artists5
}

export interface Artists5 {
    href: string
    data: Daum11[]
}

export interface Daum11 {
    id: string
    type: string
    href: string
}

export interface Meta4 {
    contentVersion: ContentVersion4
}

export interface ContentVersion4 {
    RTCI: number
    MZ_INDEXER: number
}

export interface N1621400761 {
    id: string
    type: string
    href: string
    attributes: Attributes19
    relationships: Relationships5
    meta: Meta5
}

export interface Attributes19 {
    trackCount: number
    releaseDate: string
    artistUrl: string
    editorialArtwork: EditorialArtwork5
    name: string
    artistName: string
    contentRating: string
    artwork: Artwork18
    url: string
    playParams: PlayParams5
}

export interface EditorialArtwork5 { }

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

export interface PlayParams5 {
    id: string
    kind: string
}

export interface Relationships5 {
    artists: Artists6
}

export interface Artists6 {
    href: string
    data: Daum12[]
}

export interface Daum12 {
    id: string
    type: string
    href: string
}

export interface Meta5 {
    contentVersion: ContentVersion5
}

export interface ContentVersion5 {
    RTCI: number
    MZ_INDEXER: number
}

export interface N1637738625 {
    id: string
    type: string
    href: string
    attributes: Attributes20
    relationships: Relationships6
    meta: Meta6
}

export interface Attributes20 {
    trackCount: number
    releaseDate: string
    editorialArtwork: EditorialArtwork6
    artistUrl: string
    name: string
    contentRating: string
    artistName: string
    artwork: Artwork19
    url: string
    playParams: PlayParams6
}

export interface EditorialArtwork6 { }

export interface Artwork19 {
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

export interface Relationships6 {
    artists: Artists7
}

export interface Artists7 {
    href: string
    data: Daum13[]
}

export interface Daum13 {
    id: string
    type: string
    href: string
}

export interface Meta6 {
    contentVersion: ContentVersion6
}

export interface ContentVersion6 {
    MZ_INDEXER: number
    RTCI: number
}

export interface N1649448024 {
    id: string
    type: string
    href: string
    attributes: Attributes21
    relationships: Relationships7
    meta: Meta7
}

export interface Attributes21 {
    trackCount: number
    releaseDate: string
    editorialArtwork: EditorialArtwork7
    artistUrl: string
    name: string
    contentRating: string
    artistName: string
    artwork: Artwork20
    url: string
    playParams: PlayParams7
}

export interface EditorialArtwork7 { }

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

export interface PlayParams7 {
    id: string
    kind: string
}

export interface Relationships7 {
    artists: Artists8
}

export interface Artists8 {
    href: string
    data: Daum14[]
}

export interface Daum14 {
    id: string
    type: string
    href: string
}

export interface Meta7 {
    contentVersion: ContentVersion7
}

export interface ContentVersion7 {
    MZ_INDEXER: number
    RTCI: number
}

export interface N1662712423 {
    id: string
    type: string
    href: string
    attributes: Attributes22
    relationships: Relationships8
    meta: Meta8
}

export interface Attributes22 {
    trackCount: number
    releaseDate: string
    editorialArtwork: EditorialArtwork8
    artistUrl: string
    name: string
    contentRating: string
    artistName: string
    artwork: Artwork21
    editorialNotes: EditorialNotes
    url: string
    playParams: PlayParams8
}

export interface EditorialArtwork8 { }

export interface Artwork21 {
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

export interface EditorialNotes {
    tagline: string
    short: string
}

export interface PlayParams8 {
    id: string
    kind: string
}

export interface Relationships8 {
    artists: Artists9
}

export interface Artists9 {
    href: string
    data: Daum15[]
}

export interface Daum15 {
    id: string
    type: string
    href: string
}

export interface Meta8 {
    contentVersion: ContentVersion8
}

export interface ContentVersion8 {
    RTCI: number
    MZ_INDEXER: number
}

export interface N1673851160 {
    id: string
    type: string
    href: string
    attributes: Attributes23
    relationships: Relationships9
    meta: Meta9
}

export interface Attributes23 {
    trackCount: number
    releaseDate: string
    artistUrl: string
    editorialArtwork: EditorialArtwork9
    name: string
    artistName: string
    contentRating: string
    artwork: Artwork22
    editorialNotes: EditorialNotes2
    playParams: PlayParams9
    url: string
}

export interface EditorialArtwork9 { }

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

export interface EditorialNotes2 {
    tagline: string
    short: string
}

export interface PlayParams9 {
    id: string
    kind: string
}

export interface Relationships9 {
    artists: Artists10
}

export interface Artists10 {
    href: string
    data: Daum16[]
}

export interface Daum16 {
    id: string
    type: string
    href: string
}

export interface Meta9 {
    contentVersion: ContentVersion9
}

export interface ContentVersion9 {
    RTCI: number
    MZ_INDEXER: number
}

export interface N1675423625 {
    id: string
    type: string
    href: string
    attributes: Attributes24
    relationships: Relationships10
    meta: Meta10
}

export interface Attributes24 {
    trackCount: number
    releaseDate: string
    artistUrl: string
    editorialArtwork: EditorialArtwork10
    name: string
    contentRating: string
    artistName: string
    artwork: Artwork23
    url: string
    playParams: PlayParams10
}

export interface EditorialArtwork10 { }

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

export interface PlayParams10 {
    id: string
    kind: string
}

export interface Relationships10 {
    artists: Artists11
}

export interface Artists11 {
    href: string
    data: Daum17[]
}

export interface Daum17 {
    id: string
    type: string
    href: string
}

export interface Meta10 {
    contentVersion: ContentVersion10
}

export interface ContentVersion10 {
    MZ_INDEXER: number
    RTCI: number
}

export interface N1680132590 {
    id: string
    type: string
    href: string
    attributes: Attributes25
    relationships: Relationships11
    meta: Meta11
}

export interface Attributes25 {
    trackCount: number
    releaseDate: string
    artistUrl: string
    editorialArtwork: EditorialArtwork11
    name: string
    contentRating: string
    artistName: string
    artwork: Artwork24
    url: string
    playParams: PlayParams11
}

export interface EditorialArtwork11 { }

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

export interface PlayParams11 {
    id: string
    kind: string
}

export interface Relationships11 {
    artists: Artists12
}

export interface Artists12 {
    href: string
    data: Daum18[]
}

export interface Daum18 {
    id: string
    type: string
    href: string
}

export interface Meta11 {
    contentVersion: ContentVersion11
}

export interface ContentVersion11 {
    RTCI: number
    MZ_INDEXER: number
}

export interface N1689644680 {
    id: string
    type: string
    href: string
    attributes: Attributes26
    relationships: Relationships12
    meta: Meta12
}

export interface Attributes26 {
    trackCount: number
    releaseDate: string
    editorialArtwork: EditorialArtwork12
    artistUrl: string
    name: string
    contentRating: string
    artistName: string
    artwork: Artwork25
    editorialNotes: EditorialNotes3
    url: string
    playParams: PlayParams12
}

export interface EditorialArtwork12 { }

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

export interface EditorialNotes3 {
    tagline: string
    standard: string
    short: string
}

export interface PlayParams12 {
    id: string
    kind: string
}

export interface Relationships12 {
    artists: Artists13
}

export interface Artists13 {
    href: string
    data: Daum19[]
}

export interface Daum19 {
    id: string
    type: string
    href: string
}

export interface Meta12 {
    contentVersion: ContentVersion12
}

export interface ContentVersion12 {
    MZ_INDEXER: number
    RTCI: number
}

export interface N1691667351 {
    id: string
    type: string
    href: string
    attributes: Attributes27
    relationships: Relationships13
    meta: Meta13
}

export interface Attributes27 {
    trackCount: number
    releaseDate: string
    editorialArtwork: EditorialArtwork13
    artistUrl: string
    name: string
    contentRating: string
    artistName: string
    artwork: Artwork26
    editorialNotes: EditorialNotes4
    url: string
    playParams: PlayParams13
}

export interface EditorialArtwork13 { }

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

export interface EditorialNotes4 {
    tagline: string
    standard: string
    short: string
}

export interface PlayParams13 {
    id: string
    kind: string
}

export interface Relationships13 {
    artists: Artists14
}

export interface Artists14 {
    href: string
    data: Daum20[]
}

export interface Daum20 {
    id: string
    type: string
    href: string
}

export interface Meta13 {
    contentVersion: ContentVersion13
}

export interface ContentVersion13 {
    RTCI: number
    MZ_INDEXER: number
}

export interface N1699702791 {
    id: string
    type: string
    href: string
    attributes: Attributes28
    relationships: Relationships14
    meta: Meta14
}

export interface Attributes28 {
    trackCount: number
    releaseDate: string
    editorialArtwork: EditorialArtwork14
    artistUrl: string
    name: string
    contentRating: string
    artistName: string
    artwork: Artwork27
    playParams: PlayParams14
    url: string
}

export interface EditorialArtwork14 { }

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

export interface PlayParams14 {
    id: string
    kind: string
}

export interface Relationships14 {
    artists: Artists15
}

export interface Artists15 {
    href: string
    data: Daum21[]
}

export interface Daum21 {
    id: string
    type: string
    href: string
}

export interface Meta14 {
    contentVersion: ContentVersion14
}

export interface ContentVersion14 {
    MZ_INDEXER: number
    RTCI: number
}

export interface N1712783916 {
    id: string
    type: string
    href: string
    attributes: Attributes29
    relationships: Relationships15
    meta: Meta15
}

export interface Attributes29 {
    trackCount: number
    releaseDate: string
    editorialArtwork: EditorialArtwork15
    artistUrl: string
    name: string
    contentRating: string
    artistName: string
    artwork: Artwork28
    editorialNotes: EditorialNotes5
    url: string
    playParams: PlayParams15
}

export interface EditorialArtwork15 {
    staticDetailTall: StaticDetailTall2
    staticDetailSquare: StaticDetailSquare2
}

export interface StaticDetailTall2 {
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

export interface StaticDetailSquare2 {
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

export interface EditorialNotes5 {
    tagline: string
    standard: string
    short: string
}

export interface PlayParams15 {
    id: string
    kind: string
}

export interface Relationships15 {
    artists: Artists16
}

export interface Artists16 {
    href: string
    data: Daum22[]
}

export interface Daum22 {
    id: string
    type: string
    href: string
}

export interface Meta15 {
    contentVersion: ContentVersion15
}

export interface ContentVersion15 {
    MZ_INDEXER: number
    RTCI: number
}

export interface N1722536388 {
    id: string
    type: string
    href: string
    attributes: Attributes30
    relationships: Relationships16
    meta: Meta16
}

export interface Attributes30 {
    trackCount: number
    releaseDate: string
    editorialArtwork: EditorialArtwork16
    artistUrl: string
    name: string
    contentRating: string
    artistName: string
    artwork: Artwork29
    url: string
    playParams: PlayParams16
}

export interface EditorialArtwork16 { }

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

export interface PlayParams16 {
    id: string
    kind: string
}

export interface Relationships16 {
    artists: Artists17
}

export interface Artists17 {
    href: string
    data: Daum23[]
}

export interface Daum23 {
    id: string
    type: string
    href: string
}

export interface Meta16 {
    contentVersion: ContentVersion16
}

export interface ContentVersion16 {
    MZ_INDEXER: number
    RTCI: number
}

export interface N1730098222 {
    id: string
    type: string
    href: string
    attributes: Attributes31
    relationships: Relationships17
    meta: Meta17
}

export interface Attributes31 {
    trackCount: number
    releaseDate: string
    editorialArtwork: EditorialArtwork17
    artistUrl: string
    name: string
    contentRating: string
    artistName: string
    artwork: Artwork30
    editorialNotes: EditorialNotes6
    url: string
    playParams: PlayParams17
}

export interface EditorialArtwork17 {
    staticDetailTall: StaticDetailTall3
    staticDetailSquare: StaticDetailSquare3
}

export interface StaticDetailTall3 {
    width: number
    url: string
    textGradient: string[]
    gradient: Gradient
    height: number
    textColor3: string
    textColor2: string
    textColor4: string
    textColor1: string
    bgColor: string
    hasP3: boolean
}

export interface Gradient {
    y2: number
    color: string
}

export interface StaticDetailSquare3 {
    width: number
    url: string
    textGradient: string[]
    gradient: Gradient2
    height: number
    textColor3: string
    textColor2: string
    textColor4: string
    textColor1: string
    bgColor: string
    hasP3: boolean
}

export interface Gradient2 {
    y2: number
    color: string
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

export interface EditorialNotes6 {
    tagline: string
    standard: string
    short: string
}

export interface PlayParams17 {
    id: string
    kind: string
}

export interface Relationships17 {
    artists: Artists18
}

export interface Artists18 {
    href: string
    data: Daum24[]
}

export interface Daum24 {
    id: string
    type: string
    href: string
}

export interface Meta17 {
    contentVersion: ContentVersion17
}

export interface ContentVersion17 {
    RTCI: number
    MZ_INDEXER: number
}

export interface N1752723200 {
    id: string
    type: string
    href: string
    attributes: Attributes32
    relationships: Relationships18
    meta: Meta18
}

export interface Attributes32 {
    trackCount: number
    releaseDate: string
    editorialArtwork: EditorialArtwork18
    artistUrl: string
    name: string
    contentRating: string
    artistName: string
    artwork: Artwork31
    editorialNotes: EditorialNotes7
    url: string
    playParams: PlayParams18
}

export interface EditorialArtwork18 { }

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

export interface EditorialNotes7 {
    tagline: string
    standard: string
    short: string
}

export interface PlayParams18 {
    id: string
    kind: string
}

export interface Relationships18 {
    artists: Artists19
}

export interface Artists19 {
    href: string
    data: Daum25[]
}

export interface Daum25 {
    id: string
    type: string
    href: string
}

export interface Meta18 {
    contentVersion: ContentVersion18
}

export interface ContentVersion18 {
    RTCI: number
    MZ_INDEXER: number
}

export interface N1755057560 {
    id: string
    type: string
    href: string
    attributes: Attributes33
    relationships: Relationships19
    meta: Meta19
}

export interface Attributes33 {
    trackCount: number
    releaseDate: string
    editorialArtwork: EditorialArtwork19
    artistUrl: string
    name: string
    contentRating: string
    artistName: string
    artwork: Artwork32
    url: string
    playParams: PlayParams19
}

export interface EditorialArtwork19 { }

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

export interface PlayParams19 {
    id: string
    kind: string
}

export interface Relationships19 {
    artists: Artists20
}

export interface Artists20 {
    href: string
    data: Daum26[]
}

export interface Daum26 {
    id: string
    type: string
    href: string
}

export interface Meta19 {
    contentVersion: ContentVersion19
}

export interface ContentVersion19 {
    MZ_INDEXER: number
    RTCI: number
}

export interface N1772947215 {
    id: string
    type: string
    href: string
    attributes: Attributes34
    relationships: Relationships20
    meta: Meta20
}

export interface Attributes34 {
    trackCount: number
    releaseDate: string
    artistUrl: string
    editorialArtwork: EditorialArtwork20
    name: string
    contentRating: string
    artistName: string
    artwork: Artwork33
    url: string
    playParams: PlayParams20
}

export interface EditorialArtwork20 { }

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

export interface PlayParams20 {
    id: string
    kind: string
}

export interface Relationships20 {
    artists: Artists21
}

export interface Artists21 {
    href: string
    data: Daum27[]
}

export interface Daum27 {
    id: string
    type: string
    href: string
}

export interface Meta20 {
    contentVersion: ContentVersion20
}

export interface ContentVersion20 {
    RTCI: number
    MZ_INDEXER: number
}

export interface N1775793559 {
    id: string
    type: string
    href: string
    attributes: Attributes35
    relationships: Relationships21
    meta: Meta21
}

export interface Attributes35 {
    trackCount: number
    releaseDate: string
    editorialArtwork: EditorialArtwork21
    artistUrl: string
    name: string
    contentRating: string
    artistName: string
    artwork: Artwork34
    editorialNotes: EditorialNotes8
    url: string
    playParams: PlayParams21
}

export interface EditorialArtwork21 {
    staticDetailTall: StaticDetailTall4
    staticDetailSquare: StaticDetailSquare4
    superHeroTall: SuperHeroTall
}

export interface StaticDetailTall4 {
    width: number
    url: string
    textGradient: string[]
    gradient: Gradient3
    height: number
    textColor3: string
    textColor2: string
    textColor4: string
    textColor1: string
    bgColor: string
    hasP3: boolean
}

export interface Gradient3 {
    y2: number
    color: string
}

export interface StaticDetailSquare4 {
    width: number
    url: string
    textGradient: string[]
    gradient: Gradient4
    height: number
    textColor3: string
    textColor2: string
    textColor4: string
    textColor1: string
    bgColor: string
    hasP3: boolean
}

export interface Gradient4 {
    y2: number
    color: string
}

export interface SuperHeroTall {
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

export interface EditorialNotes8 {
    tagline: string
    standard: string
    short: string
}

export interface PlayParams21 {
    id: string
    kind: string
}

export interface Relationships21 {
    artists: Artists22
}

export interface Artists22 {
    href: string
    data: Daum28[]
}

export interface Daum28 {
    id: string
    type: string
    href: string
}

export interface Meta21 {
    contentVersion: ContentVersion21
}

export interface ContentVersion21 {
    MZ_INDEXER: number
    RTCI: number
}

export type Songs = Record<string, SearchSong>;

export interface SearchSong {
    id: string
    type: string
    href: string
    attributes: Attributes36
    relationships: Relationships22
    meta: Meta22
}

export interface Attributes36 {
    hasTimeSyncedLyrics: boolean
    albumName: string
    genreNames: string[]
    trackNumber: number
    durationInMillis: number
    releaseDate: string
    isVocalAttenuationAllowed: boolean
    isMasteredForItunes: boolean
    isrc: string
    artwork: Artwork35
    composerName: string
    audioLocale: string
    playParams: PlayParams22
    url: string
    discNumber: number
    hasLyrics: boolean
    isAppleDigitalMaster: boolean
    audioTraits: string[]
    artistUrl: string
    previews: Preview[]
    name: string
    contentRating: string
    artistName: string
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

export interface PlayParams22 {
    id: string
    kind: string
}

export interface Preview {
    url: string
}

export interface Relationships22 {
    albums: Albums2
    artists: Artists23
}

export interface Albums2 {
    href: string
    data: Daum29[]
}

export interface Daum29 {
    id: string
    type: string
    href: string
}

export interface Artists23 {
    href: string
    data: Daum30[]
}

export interface Daum30 {
    id: string
    type: string
    href: string
}

export interface Meta22 {
    contentVersion: ContentVersion22
}

export interface ContentVersion22 {
    MZ_INDEXER: number
    RTCI: number
}

export interface N1590220031 {
    id: string
    type: string
    href: string
    attributes: Attributes37
    relationships: Relationships23
    meta: Meta23
}

export interface Attributes37 {
    hasTimeSyncedLyrics: boolean
    albumName: string
    genreNames: string[]
    trackNumber: number
    durationInMillis: number
    releaseDate: string
    isVocalAttenuationAllowed: boolean
    isMasteredForItunes: boolean
    isrc: string
    artwork: Artwork36
    audioLocale: string
    playParams: PlayParams23
    url: string
    discNumber: number
    hasLyrics: boolean
    isAppleDigitalMaster: boolean
    audioTraits: string[]
    artistUrl: string
    previews: Preview2[]
    name: string
    contentRating: string
    artistName: string
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

export interface PlayParams23 {
    id: string
    kind: string
}

export interface Preview2 {
    url: string
}

export interface Relationships23 {
    albums: Albums3
    artists: Artists24
}

export interface Albums3 {
    href: string
    data: Daum31[]
}

export interface Daum31 {
    id: string
    type: string
    href: string
}

export interface Artists24 {
    href: string
    data: Daum32[]
}

export interface Daum32 {
    id: string
    type: string
    href: string
}

export interface Meta23 {
    contentVersion: ContentVersion23
}

export interface ContentVersion23 {
    RTCI: number
    MZ_INDEXER: number
}

export interface N1590220049 {
    id: string
    type: string
    href: string
    attributes: Attributes38
    relationships: Relationships24
    meta: Meta24
}

export interface Attributes38 {
    hasTimeSyncedLyrics: boolean
    albumName: string
    genreNames: string[]
    trackNumber: number
    durationInMillis: number
    releaseDate: string
    isVocalAttenuationAllowed: boolean
    isMasteredForItunes: boolean
    isrc: string
    artwork: Artwork37
    audioLocale: string
    playParams: PlayParams24
    url: string
    discNumber: number
    hasLyrics: boolean
    isAppleDigitalMaster: boolean
    audioTraits: string[]
    artistUrl: string
    previews: Preview3[]
    name: string
    contentRating: string
    artistName: string
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

export interface PlayParams24 {
    id: string
    kind: string
}

export interface Preview3 {
    url: string
}

export interface Relationships24 {
    albums: Albums4
    artists: Artists25
}

export interface Albums4 {
    href: string
    data: Daum33[]
}

export interface Daum33 {
    id: string
    type: string
    href: string
}

export interface Artists25 {
    href: string
    data: Daum34[]
}

export interface Daum34 {
    id: string
    type: string
    href: string
}

export interface Meta24 {
    contentVersion: ContentVersion24
}

export interface ContentVersion24 {
    RTCI: number
    MZ_INDEXER: number
}

export interface N1610195544 {
    id: string
    type: string
    href: string
    attributes: Attributes39
    relationships: Relationships25
    meta: Meta25
}

export interface Attributes39 {
    hasTimeSyncedLyrics: boolean
    albumName: string
    genreNames: string[]
    trackNumber: number
    durationInMillis: number
    releaseDate: string
    isVocalAttenuationAllowed: boolean
    isMasteredForItunes: boolean
    isrc: string
    artwork: Artwork38
    audioLocale: string
    playParams: PlayParams25
    url: string
    discNumber: number
    hasLyrics: boolean
    isAppleDigitalMaster: boolean
    audioTraits: string[]
    artistUrl: string
    previews: Preview4[]
    name: string
    contentRating: string
    artistName: string
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

export interface PlayParams25 {
    id: string
    kind: string
}

export interface Preview4 {
    url: string
}

export interface Relationships25 {
    albums: Albums5
    artists: Artists26
}

export interface Albums5 {
    href: string
    data: Daum35[]
}

export interface Daum35 {
    id: string
    type: string
    href: string
}

export interface Artists26 {
    href: string
    data: Daum36[]
}

export interface Daum36 {
    id: string
    type: string
    href: string
}

export interface Meta25 {
    contentVersion: ContentVersion25
}

export interface ContentVersion25 {
    RTCI: number
    MZ_INDEXER: number
}

export interface N1610195552 {
    id: string
    type: string
    href: string
    attributes: Attributes40
    relationships: Relationships26
    meta: Meta26
}

export interface Attributes40 {
    hasTimeSyncedLyrics: boolean
    albumName: string
    genreNames: string[]
    trackNumber: number
    durationInMillis: number
    releaseDate: string
    isVocalAttenuationAllowed: boolean
    isMasteredForItunes: boolean
    isrc: string
    artwork: Artwork39
    audioLocale: string
    playParams: PlayParams26
    url: string
    discNumber: number
    hasLyrics: boolean
    isAppleDigitalMaster: boolean
    audioTraits: string[]
    artistUrl: string
    previews: Preview5[]
    name: string
    contentRating: string
    artistName: string
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

export interface PlayParams26 {
    id: string
    kind: string
}

export interface Preview5 {
    url: string
}

export interface Relationships26 {
    albums: Albums6
    artists: Artists27
}

export interface Albums6 {
    href: string
    data: Daum37[]
}

export interface Daum37 {
    id: string
    type: string
    href: string
}

export interface Artists27 {
    href: string
    data: Daum38[]
}

export interface Daum38 {
    id: string
    type: string
    href: string
}

export interface Meta26 {
    contentVersion: ContentVersion26
}

export interface ContentVersion26 {
    RTCI: number
    MZ_INDEXER: number
}

export interface N1610195554 {
    id: string
    type: string
    href: string
    attributes: Attributes41
    relationships: Relationships27
    meta: Meta27
}

export interface Attributes41 {
    hasTimeSyncedLyrics: boolean
    albumName: string
    genreNames: string[]
    trackNumber: number
    durationInMillis: number
    releaseDate: string
    isVocalAttenuationAllowed: boolean
    isMasteredForItunes: boolean
    isrc: string
    artwork: Artwork40
    audioLocale: string
    playParams: PlayParams27
    url: string
    discNumber: number
    hasLyrics: boolean
    isAppleDigitalMaster: boolean
    audioTraits: string[]
    artistUrl: string
    previews: Preview6[]
    name: string
    contentRating: string
    artistName: string
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

export interface PlayParams27 {
    id: string
    kind: string
}

export interface Preview6 {
    url: string
}

export interface Relationships27 {
    albums: Albums7
    artists: Artists28
}

export interface Albums7 {
    href: string
    data: Daum39[]
}

export interface Daum39 {
    id: string
    type: string
    href: string
}

export interface Artists28 {
    href: string
    data: Daum40[]
}

export interface Daum40 {
    id: string
    type: string
    href: string
}

export interface Meta27 {
    contentVersion: ContentVersion27
}

export interface ContentVersion27 {
    RTCI: number
    MZ_INDEXER: number
}

export interface N1610195904 {
    id: string
    type: string
    href: string
    attributes: Attributes42
    relationships: Relationships28
    meta: Meta28
}

export interface Attributes42 {
    hasTimeSyncedLyrics: boolean
    albumName: string
    genreNames: string[]
    trackNumber: number
    durationInMillis: number
    releaseDate: string
    isVocalAttenuationAllowed: boolean
    isMasteredForItunes: boolean
    isrc: string
    artwork: Artwork41
    audioLocale: string
    playParams: PlayParams28
    url: string
    discNumber: number
    hasLyrics: boolean
    isAppleDigitalMaster: boolean
    audioTraits: string[]
    artistUrl: string
    previews: Preview7[]
    name: string
    contentRating: string
    artistName: string
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

export interface PlayParams28 {
    id: string
    kind: string
}

export interface Preview7 {
    url: string
}

export interface Relationships28 {
    albums: Albums8
    artists: Artists29
}

export interface Albums8 {
    href: string
    data: Daum41[]
}

export interface Daum41 {
    id: string
    type: string
    href: string
}

export interface Artists29 {
    href: string
    data: Daum42[]
}

export interface Daum42 {
    id: string
    type: string
    href: string
}

export interface Meta28 {
    contentVersion: ContentVersion28
}

export interface ContentVersion28 {
    MZ_INDEXER: number
    RTCI: number
}

export interface N1642383331 {
    id: string
    type: string
    href: string
    attributes: Attributes43
    relationships: Relationships29
    meta: Meta29
}

export interface Attributes43 {
    albumName: string
    hasTimeSyncedLyrics: boolean
    genreNames: string[]
    trackNumber: number
    releaseDate: string
    durationInMillis: number
    isVocalAttenuationAllowed: boolean
    isMasteredForItunes: boolean
    isrc: string
    artwork: Artwork42
    composerName: string
    audioLocale: string
    url: string
    playParams: PlayParams29
    discNumber: number
    hasLyrics: boolean
    isAppleDigitalMaster: boolean
    audioTraits: string[]
    artistUrl: string
    name: string
    previews: Preview8[]
    contentRating: string
    artistName: string
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

export interface PlayParams29 {
    id: string
    kind: string
}

export interface Preview8 {
    url: string
}

export interface Relationships29 {
    albums: Albums9
    artists: Artists30
}

export interface Albums9 {
    href: string
    data: Daum43[]
}

export interface Daum43 {
    id: string
    type: string
    href: string
}

export interface Artists30 {
    href: string
    data: Daum44[]
}

export interface Daum44 {
    id: string
    type: string
    href: string
}

export interface Meta29 {
    contentVersion: ContentVersion29
}

export interface ContentVersion29 {
    RTCI: number
    MZ_INDEXER: number
}

export interface N1673851162 {
    id: string
    type: string
    href: string
    attributes: Attributes44
    relationships: Relationships30
    meta: Meta30
}

export interface Attributes44 {
    hasTimeSyncedLyrics: boolean
    albumName: string
    genreNames: string[]
    trackNumber: number
    durationInMillis: number
    releaseDate: string
    isVocalAttenuationAllowed: boolean
    isMasteredForItunes: boolean
    isrc: string
    artwork: Artwork43
    audioLocale: string
    playParams: PlayParams30
    url: string
    discNumber: number
    hasLyrics: boolean
    isAppleDigitalMaster: boolean
    audioTraits: string[]
    artistUrl: string
    previews: Preview9[]
    name: string
    contentRating: string
    artistName: string
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

export interface PlayParams30 {
    id: string
    kind: string
}

export interface Preview9 {
    url: string
}

export interface Relationships30 {
    albums: Albums10
    artists: Artists31
}

export interface Albums10 {
    href: string
    data: Daum45[]
}

export interface Daum45 {
    id: string
    type: string
    href: string
}

export interface Artists31 {
    href: string
    data: Daum46[]
}

export interface Daum46 {
    id: string
    type: string
    href: string
}

export interface Meta30 {
    contentVersion: ContentVersion30
}

export interface ContentVersion30 {
    RTCI: number
    MZ_INDEXER: number
}

export interface N1673851164 {
    id: string
    type: string
    href: string
    attributes: Attributes45
    relationships: Relationships31
    meta: Meta31
}

export interface Attributes45 {
    hasTimeSyncedLyrics: boolean
    albumName: string
    genreNames: string[]
    trackNumber: number
    durationInMillis: number
    releaseDate: string
    isVocalAttenuationAllowed: boolean
    isMasteredForItunes: boolean
    isrc: string
    artwork: Artwork44
    audioLocale: string
    playParams: PlayParams31
    url: string
    discNumber: number
    hasLyrics: boolean
    isAppleDigitalMaster: boolean
    audioTraits: string[]
    artistUrl: string
    previews: Preview10[]
    name: string
    contentRating: string
    artistName: string
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

export interface PlayParams31 {
    id: string
    kind: string
}

export interface Preview10 {
    url: string
}

export interface Relationships31 {
    albums: Albums11
    artists: Artists32
}

export interface Albums11 {
    href: string
    data: Daum47[]
}

export interface Daum47 {
    id: string
    type: string
    href: string
}

export interface Artists32 {
    href: string
    data: Daum48[]
}

export interface Daum48 {
    id: string
    type: string
    href: string
}

export interface Meta31 {
    contentVersion: ContentVersion31
}

export interface ContentVersion31 {
    MZ_INDEXER: number
    RTCI: number
}

export interface N1680132591 {
    id: string
    type: string
    href: string
    attributes: Attributes46
    relationships: Relationships32
    meta: Meta32
}

export interface Attributes46 {
    hasTimeSyncedLyrics: boolean
    albumName: string
    genreNames: string[]
    trackNumber: number
    durationInMillis: number
    releaseDate: string
    isVocalAttenuationAllowed: boolean
    isMasteredForItunes: boolean
    isrc: string
    artwork: Artwork45
    composerName: string
    audioLocale: string
    playParams: PlayParams32
    url: string
    discNumber: number
    hasLyrics: boolean
    isAppleDigitalMaster: boolean
    audioTraits: string[]
    artistUrl: string
    previews: Preview11[]
    name: string
    contentRating: string
    artistName: string
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

export interface PlayParams32 {
    id: string
    kind: string
}

export interface Preview11 {
    url: string
}

export interface Relationships32 {
    albums: Albums12
    artists: Artists33
}

export interface Albums12 {
    href: string
    data: Daum49[]
}

export interface Daum49 {
    id: string
    type: string
    href: string
}

export interface Artists33 {
    href: string
    data: Daum50[]
}

export interface Daum50 {
    id: string
    type: string
    href: string
}

export interface Meta32 {
    contentVersion: ContentVersion32
}

export interface ContentVersion32 {
    RTCI: number
    MZ_INDEXER: number
}

export interface N1691667354 {
    id: string
    type: string
    href: string
    attributes: Attributes47
    relationships: Relationships33
    meta: Meta33
}

export interface Attributes47 {
    hasTimeSyncedLyrics: boolean
    albumName: string
    genreNames: string[]
    trackNumber: number
    durationInMillis: number
    releaseDate: string
    isVocalAttenuationAllowed: boolean
    isMasteredForItunes: boolean
    isrc: string
    artwork: Artwork46
    audioLocale: string
    playParams: PlayParams33
    url: string
    discNumber: number
    hasLyrics: boolean
    isAppleDigitalMaster: boolean
    audioTraits: string[]
    artistUrl: string
    previews: Preview12[]
    name: string
    contentRating: string
    artistName: string
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

export interface PlayParams33 {
    id: string
    kind: string
}

export interface Preview12 {
    url: string
}

export interface Relationships33 {
    albums: Albums13
    artists: Artists34
}

export interface Albums13 {
    href: string
    data: Daum51[]
}

export interface Daum51 {
    id: string
    type: string
    href: string
}

export interface Artists34 {
    href: string
    data: Daum52[]
}

export interface Daum52 {
    id: string
    type: string
    href: string
}

export interface Meta33 {
    contentVersion: ContentVersion33
}

export interface ContentVersion33 {
    MZ_INDEXER: number
    RTCI: number
}

export interface N1691667374 {
    id: string
    type: string
    href: string
    attributes: Attributes48
    relationships: Relationships34
    meta: Meta34
}

export interface Attributes48 {
    hasTimeSyncedLyrics: boolean
    albumName: string
    genreNames: string[]
    trackNumber: number
    durationInMillis: number
    releaseDate: string
    isVocalAttenuationAllowed: boolean
    isMasteredForItunes: boolean
    isrc: string
    artwork: Artwork47
    audioLocale: string
    playParams: PlayParams34
    url: string
    discNumber: number
    hasLyrics: boolean
    isAppleDigitalMaster: boolean
    audioTraits: string[]
    artistUrl: string
    previews: Preview13[]
    name: string
    contentRating: string
    artistName: string
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

export interface PlayParams34 {
    id: string
    kind: string
}

export interface Preview13 {
    url: string
}

export interface Relationships34 {
    albums: Albums14
    artists: Artists35
}

export interface Albums14 {
    href: string
    data: Daum53[]
}

export interface Daum53 {
    id: string
    type: string
    href: string
}

export interface Artists35 {
    href: string
    data: Daum54[]
}

export interface Daum54 {
    id: string
    type: string
    href: string
}

export interface Meta34 {
    contentVersion: ContentVersion34
}

export interface ContentVersion34 {
    MZ_INDEXER: number
    RTCI: number
}

export interface N1712784067 {
    id: string
    type: string
    href: string
    attributes: Attributes49
    relationships: Relationships35
    meta: Meta35
}

export interface Attributes49 {
    hasTimeSyncedLyrics: boolean
    albumName: string
    genreNames: string[]
    trackNumber: number
    durationInMillis: number
    releaseDate: string
    isVocalAttenuationAllowed: boolean
    isMasteredForItunes: boolean
    isrc: string
    artwork: Artwork48
    audioLocale: string
    playParams: PlayParams35
    url: string
    discNumber: number
    hasLyrics: boolean
    isAppleDigitalMaster: boolean
    audioTraits: string[]
    artistUrl: string
    previews: Preview14[]
    name: string
    contentRating: string
    artistName: string
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

export interface PlayParams35 {
    id: string
    kind: string
}

export interface Preview14 {
    url: string
}

export interface Relationships35 {
    albums: Albums15
    artists: Artists36
}

export interface Albums15 {
    href: string
    data: Daum55[]
}

export interface Daum55 {
    id: string
    type: string
    href: string
}

export interface Artists36 {
    href: string
    data: Daum56[]
}

export interface Daum56 {
    id: string
    type: string
    href: string
}

export interface Meta35 {
    contentVersion: ContentVersion35
}

export interface ContentVersion35 {
    RTCI: number
    MZ_INDEXER: number
}

export interface N1712784193 {
    id: string
    type: string
    href: string
    attributes: Attributes50
    relationships: Relationships36
    meta: Meta36
}

export interface Attributes50 {
    hasTimeSyncedLyrics: boolean
    albumName: string
    genreNames: string[]
    trackNumber: number
    durationInMillis: number
    releaseDate: string
    isVocalAttenuationAllowed: boolean
    isMasteredForItunes: boolean
    isrc: string
    artwork: Artwork49
    audioLocale: string
    playParams: PlayParams36
    url: string
    discNumber: number
    hasLyrics: boolean
    isAppleDigitalMaster: boolean
    audioTraits: string[]
    artistUrl: string
    previews: Preview15[]
    name: string
    contentRating: string
    artistName: string
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

export interface PlayParams36 {
    id: string
    kind: string
}

export interface Preview15 {
    url: string
}

export interface Relationships36 {
    albums: Albums16
    artists: Artists37
}

export interface Albums16 {
    href: string
    data: Daum57[]
}

export interface Daum57 {
    id: string
    type: string
    href: string
}

export interface Artists37 {
    href: string
    data: Daum58[]
}

export interface Daum58 {
    id: string
    type: string
    href: string
}

export interface Meta36 {
    contentVersion: ContentVersion36
}

export interface ContentVersion36 {
    RTCI: number
    MZ_INDEXER: number
}

export interface N1712784414 {
    id: string
    type: string
    href: string
    attributes: Attributes51
    relationships: Relationships37
    meta: Meta37
}

export interface Attributes51 {
    hasTimeSyncedLyrics: boolean
    albumName: string
    genreNames: string[]
    trackNumber: number
    durationInMillis: number
    releaseDate: string
    isVocalAttenuationAllowed: boolean
    isMasteredForItunes: boolean
    isrc: string
    artwork: Artwork50
    audioLocale: string
    playParams: PlayParams37
    url: string
    discNumber: number
    hasLyrics: boolean
    isAppleDigitalMaster: boolean
    audioTraits: string[]
    artistUrl: string
    previews: Preview16[]
    name: string
    contentRating: string
    artistName: string
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

export interface PlayParams37 {
    id: string
    kind: string
}

export interface Preview16 {
    url: string
}

export interface Relationships37 {
    albums: Albums17
    artists: Artists38
}

export interface Albums17 {
    href: string
    data: Daum59[]
}

export interface Daum59 {
    id: string
    type: string
    href: string
}

export interface Artists38 {
    href: string
    data: Daum60[]
}

export interface Daum60 {
    id: string
    type: string
    href: string
}

export interface Meta37 {
    contentVersion: ContentVersion37
}

export interface ContentVersion37 {
    RTCI: number
    MZ_INDEXER: number
}

export interface N1722536389 {
    id: string
    type: string
    href: string
    attributes: Attributes52
    relationships: Relationships38
    meta: Meta38
}

export interface Attributes52 {
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
    playParams: PlayParams38
    url: string
    discNumber: number
    hasLyrics: boolean
    isAppleDigitalMaster: boolean
    audioTraits: string[]
    artistUrl: string
    previews: Preview17[]
    name: string
    contentRating: string
    artistName: string
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

export interface PlayParams38 {
    id: string
    kind: string
}

export interface Preview17 {
    url: string
}

export interface Relationships38 {
    albums: Albums18
    artists: Artists39
}

export interface Albums18 {
    href: string
    data: Daum61[]
}

export interface Daum61 {
    id: string
    type: string
    href: string
}

export interface Artists39 {
    href: string
    data: Daum62[]
}

export interface Daum62 {
    id: string
    type: string
    href: string
}

export interface Meta38 {
    contentVersion: ContentVersion38
}

export interface ContentVersion38 {
    RTCI: number
    MZ_INDEXER: number
}

export interface N1730098698 {
    id: string
    type: string
    href: string
    attributes: Attributes53
    relationships: Relationships39
    meta: Meta39
}

export interface Attributes53 {
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
    composerName: string
    audioLocale: string
    playParams: PlayParams39
    url: string
    discNumber: number
    hasLyrics: boolean
    isAppleDigitalMaster: boolean
    audioTraits: string[]
    artistUrl: string
    previews: Preview18[]
    name: string
    contentRating: string
    artistName: string
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

export interface PlayParams39 {
    id: string
    kind: string
}

export interface Preview18 {
    url: string
}

export interface Relationships39 {
    albums: Albums19
    artists: Artists40
}

export interface Albums19 {
    href: string
    data: Daum63[]
}

export interface Daum63 {
    id: string
    type: string
    href: string
}

export interface Artists40 {
    href: string
    data: Daum64[]
}

export interface Daum64 {
    id: string
    type: string
    href: string
}

export interface Meta39 {
    contentVersion: ContentVersion39
}

export interface ContentVersion39 {
    RTCI: number
    MZ_INDEXER: number
}

export interface N1755022733 {
    id: string
    type: string
    href: string
    attributes: Attributes54
    relationships: Relationships40
    meta: Meta40
}

export interface Attributes54 {
    hasTimeSyncedLyrics: boolean
    albumName: string
    genreNames: string[]
    trackNumber: number
    durationInMillis: number
    releaseDate: string
    isVocalAttenuationAllowed: boolean
    isMasteredForItunes: boolean
    isrc: string
    artwork: Artwork53
    composerName: string
    audioLocale: string
    playParams: PlayParams40
    url: string
    discNumber: number
    hasLyrics: boolean
    isAppleDigitalMaster: boolean
    audioTraits: string[]
    artistUrl: string
    previews: Preview19[]
    name: string
    contentRating: string
    artistName: string
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

export interface PlayParams40 {
    id: string
    kind: string
}

export interface Preview19 {
    url: string
}

export interface Relationships40 {
    albums: Albums20
    artists: Artists41
}

export interface Albums20 {
    href: string
    data: Daum65[]
}

export interface Daum65 {
    id: string
    type: string
    href: string
}

export interface Artists41 {
    href: string
    data: Daum66[]
}

export interface Daum66 {
    id: string
    type: string
    href: string
}

export interface Meta40 {
    contentVersion: ContentVersion40
}

export interface ContentVersion40 {
    RTCI: number
    MZ_INDEXER: number
}

export interface N1775793572 {
    id: string
    type: string
    href: string
    attributes: Attributes55
    relationships: Relationships41
    meta: Meta41
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
    artwork: Artwork54
    audioLocale: string
    playParams: PlayParams41
    url: string
    discNumber: number
    hasLyrics: boolean
    isAppleDigitalMaster: boolean
    audioTraits: string[]
    artistUrl: string
    previews: Preview20[]
    name: string
    contentRating: string
    artistName: string
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

export interface PlayParams41 {
    id: string
    kind: string
}

export interface Preview20 {
    url: string
}

export interface Relationships41 {
    albums: Albums21
    artists: Artists42
}

export interface Albums21 {
    href: string
    data: Daum67[]
}

export interface Daum67 {
    id: string
    type: string
    href: string
}

export interface Artists42 {
    href: string
    data: Daum68[]
}

export interface Daum68 {
    id: string
    type: string
    href: string
}

export interface Meta41 {
    contentVersion: ContentVersion41
}

export interface ContentVersion41 {
    RTCI: number
    MZ_INDEXER: number
}

export interface N1775793692 {
    id: string
    type: string
    href: string
    attributes: Attributes56
    relationships: Relationships42
    meta: Meta42
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
    artwork: Artwork55
    audioLocale: string
    playParams: PlayParams42
    url: string
    discNumber: number
    hasLyrics: boolean
    isAppleDigitalMaster: boolean
    audioTraits: string[]
    artistUrl: string
    previews: Preview21[]
    name: string
    contentRating: string
    artistName: string
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

export interface PlayParams42 {
    id: string
    kind: string
}

export interface Preview21 {
    url: string
}

export interface Relationships42 {
    albums: Albums22
    artists: Artists43
}

export interface Albums22 {
    href: string
    data: Daum69[]
}

export interface Daum69 {
    id: string
    type: string
    href: string
}

export interface Artists43 {
    href: string
    data: Daum70[]
}

export interface Daum70 {
    id: string
    type: string
    href: string
}

export interface Meta42 {
    contentVersion: ContentVersion42
}

export interface ContentVersion42 {
    RTCI: number
    MZ_INDEXER: number
}

export type Stations = Record<string, SearchStation>;

export interface SearchStation {
    id: string
    type: string
    href: string
    attributes: Attributes57
    relationships: Relationships43
}

export interface Attributes57 {
    isLive: boolean
    requiresSubscription: boolean
    kind: string
    radioUrl: string
    name: string
    mediaKind: string
    artwork: Artwork56
    url: string
    playParams: PlayParams43
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

export interface PlayParams43 {
    id: string
    kind: string
    format: string
    stationHash: string
    hasDrm: boolean
    mediaType: number
}

export type Relationships43 = Record<string, RadioShow>;

export interface RadioShow {
    href: string
    data: any[]
}

export type Playlists = Record<string, SearchPlaylist>;

export interface SearchPlaylist {
    id: string
    type: string
    href: string
    attributes: Attributes58
}

export interface Attributes58 {
    hasCollaboration: boolean
    curatorName: string
    lastModifiedDate: string
    audioTraits: any[]
    isChart: boolean
    name: string
    supportsSing: boolean
    playlistType: string
    editorialPlaylistKind: string
    artwork: Artwork57
    url: string
    playParams: PlayParams44
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

export interface PlayParams44 {
    id: string
    kind: string
    versionHash: string
}

export interface Pl0148799c89334765be99af01386e98a7 {
    id: string
    type: string
    href: string
    attributes: Attributes59
}

export interface Attributes59 {
    hasCollaboration: boolean
    curatorName: string
    lastModifiedDate: string
    audioTraits: any[]
    supportsSing: boolean
    name: string
    isChart: boolean
    playlistType: string
    artwork: Artwork58
    editorialNotes: EditorialNotes9
    playParams: PlayParams45
    url: string
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

export interface EditorialNotes9 {
    short: string
}

export interface PlayParams45 {
    id: string
    kind: string
    versionHash: string
}

export interface Pl2d4d74790f074233b82d07bfae5c219c {
    id: string
    type: string
    href: string
    attributes: Attributes60
}

export interface Attributes60 {
    lastModifiedDate: string
    supportsSing: boolean
    description: Description
    artwork: Artwork59
    url: string
    playParams: PlayParams46
    hasCollaboration: boolean
    curatorName: string
    audioTraits: any[]
    isChart: boolean
    name: string
    playlistType: string
    editorialNotes: EditorialNotes10
}

export interface Description {
    standard: string
    short: string
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

export interface PlayParams46 {
    id: string
    kind: string
    versionHash: string
}

export interface EditorialNotes10 {
    name: string
    standard: string
    short: string
    tagline: string
}

export interface Pl4c62f568a0d64293a9c362037175c09b {
    id: string
    type: string
    href: string
    attributes: Attributes61
}

export interface Attributes61 {
    lastModifiedDate: string
    supportsSing: boolean
    description: Description2
    artwork: Artwork60
    url: string
    playParams: PlayParams47
    hasCollaboration: boolean
    curatorName: string
    audioTraits: any[]
    name: string
    isChart: boolean
    playlistType: string
    editorialNotes: EditorialNotes11
}

export interface Description2 {
    standard: string
    short: string
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

export interface PlayParams47 {
    id: string
    kind: string
    versionHash: string
}

export interface EditorialNotes11 {
    name: string
    standard: string
    short: string
    tagline: string
}

export interface Pl87c7af5767764860a0e3368d0bef9a6f {
    id: string
    type: string
    href: string
    attributes: Attributes62
}

export interface Attributes62 {
    lastModifiedDate: string
    supportsSing: boolean
    description: Description3
    artwork: Artwork61
    url: string
    playParams: PlayParams48
    hasCollaboration: boolean
    curatorName: string
    audioTraits: any[]
    name: string
    isChart: boolean
    playlistType: string
    editorialNotes: EditorialNotes12
}

export interface Description3 {
    standard: string
    short: string
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

export interface PlayParams48 {
    id: string
    kind: string
    versionHash: string
}

export interface EditorialNotes12 {
    name: string
    standard: string
    short: string
    tagline: string
}

export interface Pl2b0e6e332fdf4b7a91164da3162127b5 {
    id: string
    type: string
    href: string
    attributes: Attributes63
}

export interface Attributes63 {
    lastModifiedDate: string
    supportsSing: boolean
    description: Description4
    artwork: Artwork62
    playParams: PlayParams49
    url: string
    hasCollaboration: boolean
    curatorName: string
    audioTraits: any[]
    isChart: boolean
    name: string
    playlistType: string
    editorialNotes: EditorialNotes13
}

export interface Description4 {
    standard: string
    short: string
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

export interface PlayParams49 {
    id: string
    kind: string
    versionHash: string
}

export interface EditorialNotes13 {
    name: string
    standard: string
    short: string
    tagline: string
}

export type MusicVideos = Record<string, SearchMusicVideo>;

export interface SearchMusicVideo {
    id: string
    type: string
    href: string
    attributes: Attributes64
    relationships: Relationships44
}

export interface Attributes64 {
    genreNames: string[]
    releaseDate: string
    durationInMillis: number
    isrc: string
    artwork: Artwork63
    playParams: PlayParams50
    url: string
    has4K: boolean
    artistUrl: string
    name: string
    hasHDR: boolean
    previews: Preview22[]
    videoTraits: string[]
    artistName: string
    contentRating: string
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

export interface PlayParams50 {
    id: string
    kind: string
}

export interface Preview22 {
    url: string
    hlsUrl: string
    artwork: Artwork64
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

export interface Relationships44 {
    artists: Artists44
}

export interface Artists44 {
    href: string
    data: Daum71[]
}

export interface Daum71 {
    id: string
    type: string
    href: string
}

export interface N1610828513 {
    id: string
    type: string
    href: string
    attributes: Attributes65
    relationships: Relationships45
}

export interface Attributes65 {
    genreNames: string[]
    durationInMillis: number
    releaseDate: string
    isrc: string
    artwork: Artwork65
    url: string
    playParams: PlayParams51
    has4K: boolean
    artistUrl: string
    name: string
    hasHDR: boolean
    previews: Preview23[]
    videoTraits: string[]
    artistName: string
    contentRating: string
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

export interface PlayParams51 {
    id: string
    kind: string
}

export interface Preview23 {
    url: string
    hlsUrl: string
    artwork: Artwork66
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

export interface Relationships45 {
    artists: Artists45
}

export interface Artists45 {
    href: string
    data: Daum72[]
}

export interface Daum72 {
    id: string
    type: string
    href: string
}

export interface N1611261530 {
    id: string
    type: string
    href: string
    attributes: Attributes66
    relationships: Relationships46
}

export interface Attributes66 {
    genreNames: string[]
    releaseDate: string
    durationInMillis: number
    isrc: string
    artwork: Artwork67
    playParams: PlayParams52
    url: string
    has4K: boolean
    artistUrl: string
    name: string
    hasHDR: boolean
    previews: Preview24[]
    videoTraits: string[]
    artistName: string
    contentRating: string
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

export interface PlayParams52 {
    id: string
    kind: string
}

export interface Preview24 {
    url: string
    hlsUrl: string
    artwork: Artwork68
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

export interface Relationships46 {
    artists: Artists46
}

export interface Artists46 {
    href: string
    data: Daum73[]
}

export interface Daum73 {
    id: string
    type: string
    href: string
}

export interface N1613831223 {
    id: string
    type: string
    href: string
    attributes: Attributes67
    relationships: Relationships47
}

export interface Attributes67 {
    genreNames: string[]
    releaseDate: string
    durationInMillis: number
    isrc: string
    artwork: Artwork69
    url: string
    playParams: PlayParams53
    has4K: boolean
    artistUrl: string
    name: string
    hasHDR: boolean
    previews: Preview25[]
    videoTraits: string[]
    artistName: string
    contentRating: string
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

export interface PlayParams53 {
    id: string
    kind: string
}

export interface Preview25 {
    url: string
    hlsUrl: string
    artwork: Artwork70
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

export interface Relationships47 {
    artists: Artists47
}

export interface Artists47 {
    href: string
    data: Daum74[]
}

export interface Daum74 {
    id: string
    type: string
    href: string
}

export interface N1616927305 {
    id: string
    type: string
    href: string
    attributes: Attributes68
    relationships: Relationships48
}

export interface Attributes68 {
    genreNames: string[]
    durationInMillis: number
    releaseDate: string
    isrc: string
    artwork: Artwork71
    url: string
    playParams: PlayParams54
    has4K: boolean
    artistUrl: string
    name: string
    hasHDR: boolean
    previews: Preview26[]
    videoTraits: string[]
    artistName: string
    contentRating: string
}

export interface Artwork71 {
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

export interface PlayParams54 {
    id: string
    kind: string
}

export interface Preview26 {
    url: string
    hlsUrl: string
    artwork: Artwork72
}

export interface Artwork72 {
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

export interface Relationships48 {
    artists: Artists48
}

export interface Artists48 {
    href: string
    data: Daum75[]
}

export interface Daum75 {
    id: string
    type: string
    href: string
}

export interface N1677181020 {
    id: string
    type: string
    href: string
    attributes: Attributes69
    relationships: Relationships49
}

export interface Attributes69 {
    genreNames: string[]
    releaseDate: string
    durationInMillis: number
    isrc: string
    artwork: Artwork73
    url: string
    playParams: PlayParams55
    has4K: boolean
    artistUrl: string
    name: string
    hasHDR: boolean
    previews: Preview27[]
    videoTraits: string[]
    artistName: string
    contentRating: string
}

export interface Artwork73 {
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

export interface PlayParams55 {
    id: string
    kind: string
}

export interface Preview27 {
    url: string
    hlsUrl: string
    artwork: Artwork74
}

export interface Artwork74 {
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

export interface Relationships49 {
    artists: Artists49
}

export interface Artists49 {
    href: string
    data: Daum76[]
}

export interface Daum76 {
    id: string
    type: string
    href: string
}

export interface N1680652515 {
    id: string
    type: string
    href: string
    attributes: Attributes70
    relationships: Relationships50
}

export interface Attributes70 {
    albumName: string
    genreNames: string[]
    trackNumber: number
    releaseDate: string
    durationInMillis: number
    isrc: string
    artwork: Artwork75
    url: string
    playParams: PlayParams56
    discNumber: number
    has4K: boolean
    artistUrl: string
    name: string
    hasHDR: boolean
    previews: Preview28[]
    videoTraits: string[]
    artistName: string
    contentRating: string
}

export interface Artwork75 {
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

export interface PlayParams56 {
    id: string
    kind: string
}

export interface Preview28 {
    url: string
    hlsUrl: string
    artwork: Artwork76
}

export interface Artwork76 {
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

export interface Relationships50 {
    artists: Artists50
}

export interface Artists50 {
    href: string
    data: Daum77[]
}

export interface Daum77 {
    id: string
    type: string
    href: string
}

export interface N1691459137 {
    id: string
    type: string
    href: string
    attributes: Attributes71
    relationships: Relationships51
}

export interface Attributes71 {
    genreNames: string[]
    releaseDate: string
    durationInMillis: number
    isrc: string
    artwork: Artwork77
    url: string
    playParams: PlayParams57
    has4K: boolean
    artistUrl: string
    name: string
    hasHDR: boolean
    previews: Preview29[]
    videoTraits: string[]
    artistName: string
    contentRating: string
}

export interface Artwork77 {
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

export interface PlayParams57 {
    id: string
    kind: string
}

export interface Preview29 {
    url: string
    hlsUrl: string
    artwork: Artwork78
}

export interface Artwork78 {
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

export interface Relationships51 {
    artists: Artists51
}

export interface Artists51 {
    href: string
    data: Daum78[]
}

export interface Daum78 {
    id: string
    type: string
    href: string
}

export interface N1692454662 {
    id: string
    type: string
    href: string
    attributes: Attributes72
    relationships: Relationships52
}

export interface Attributes72 {
    albumName: string
    genreNames: string[]
    trackNumber: number
    releaseDate: string
    durationInMillis: number
    isrc: string
    artwork: Artwork79
    playParams: PlayParams58
    url: string
    discNumber: number
    has4K: boolean
    artistUrl: string
    name: string
    hasHDR: boolean
    previews: Preview30[]
    videoTraits: any[]
    artistName: string
    contentRating: string
}

export interface Artwork79 {
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

export interface PlayParams58 {
    id: string
    kind: string
}

export interface Preview30 {
    url: string
    hlsUrl: string
    artwork: Artwork80
}

export interface Artwork80 {
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

export interface Relationships52 {
    artists: Artists52
}

export interface Artists52 {
    href: string
    data: Daum79[]
}

export interface Daum79 {
    id: string
    type: string
    href: string
}

export interface N1692604955 {
    id: string
    type: string
    href: string
    attributes: Attributes73
    relationships: Relationships53
}

export interface Attributes73 {
    genreNames: string[]
    releaseDate: string
    durationInMillis: number
    isrc: string
    artwork: Artwork81
    url: string
    playParams: PlayParams59
    has4K: boolean
    artistUrl: string
    name: string
    hasHDR: boolean
    previews: Preview31[]
    videoTraits: string[]
    artistName: string
    contentRating: string
}

export interface Artwork81 {
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

export interface PlayParams59 {
    id: string
    kind: string
}

export interface Preview31 {
    url: string
    hlsUrl: string
    artwork: Artwork82
}

export interface Artwork82 {
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

export interface Relationships53 {
    artists: Artists53
}

export interface Artists53 {
    href: string
    data: Daum80[]
}

export interface Daum80 {
    id: string
    type: string
    href: string
}

export interface N1712650499 {
    id: string
    type: string
    href: string
    attributes: Attributes74
    relationships: Relationships54
}

export interface Attributes74 {
    genreNames: string[]
    durationInMillis: number
    releaseDate: string
    isrc: string
    artwork: Artwork83
    url: string
    playParams: PlayParams60
    has4K: boolean
    artistUrl: string
    name: string
    hasHDR: boolean
    previews: Preview32[]
    videoTraits: any[]
    artistName: string
    contentRating: string
}

export interface Artwork83 {
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

export interface PlayParams60 {
    id: string
    kind: string
}

export interface Preview32 {
    url: string
    hlsUrl: string
    artwork: Artwork84
}

export interface Artwork84 {
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

export interface Relationships54 {
    artists: Artists54
}

export interface Artists54 {
    href: string
    data: Daum81[]
}

export interface Daum81 {
    id: string
    type: string
    href: string
}

export interface N1715034034 {
    id: string
    type: string
    href: string
    attributes: Attributes75
    relationships: Relationships55
}

export interface Attributes75 {
    genreNames: string[]
    durationInMillis: number
    releaseDate: string
    isrc: string
    artwork: Artwork85
    url: string
    playParams: PlayParams61
    has4K: boolean
    artistUrl: string
    name: string
    hasHDR: boolean
    previews: Preview33[]
    videoTraits: any[]
    artistName: string
    contentRating: string
}

export interface Artwork85 {
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

export interface PlayParams61 {
    id: string
    kind: string
}

export interface Preview33 {
    url: string
    hlsUrl: string
    artwork: Artwork86
}

export interface Artwork86 {
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

export interface Relationships55 {
    artists: Artists55
}

export interface Artists55 {
    href: string
    data: Daum82[]
}

export interface Daum82 {
    id: string
    type: string
    href: string
}

export interface N1716126876 {
    id: string
    type: string
    href: string
    attributes: Attributes76
    relationships: Relationships56
}

export interface Attributes76 {
    genreNames: string[]
    durationInMillis: number
    releaseDate: string
    isrc: string
    artwork: Artwork87
    playParams: PlayParams62
    url: string
    has4K: boolean
    artistUrl: string
    name: string
    hasHDR: boolean
    previews: Preview34[]
    videoTraits: string[]
    artistName: string
    contentRating: string
}

export interface Artwork87 {
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

export interface PlayParams62 {
    id: string
    kind: string
}

export interface Preview34 {
    url: string
    hlsUrl: string
    artwork: Artwork88
}

export interface Artwork88 {
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

export interface Relationships56 {
    artists: Artists56
}

export interface Artists56 {
    href: string
    data: Daum83[]
}

export interface Daum83 {
    id: string
    type: string
    href: string
}

export interface N1718815558 {
    id: string
    type: string
    href: string
    attributes: Attributes77
    relationships: Relationships57
}

export interface Attributes77 {
    genreNames: string[]
    releaseDate: string
    durationInMillis: number
    isrc: string
    artwork: Artwork89
    url: string
    playParams: PlayParams63
    has4K: boolean
    artistUrl: string
    name: string
    hasHDR: boolean
    previews: Preview35[]
    videoTraits: any[]
    artistName: string
    contentRating: string
}

export interface Artwork89 {
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

export interface PlayParams63 {
    id: string
    kind: string
}

export interface Preview35 {
    url: string
    hlsUrl: string
    artwork: Artwork90
}

export interface Artwork90 {
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

export interface Relationships57 {
    artists: Artists57
}

export interface Artists57 {
    href: string
    data: Daum84[]
}

export interface Daum84 {
    id: string
    type: string
    href: string
}

export interface N1719338448 {
    id: string
    type: string
    href: string
    attributes: Attributes78
    relationships: Relationships58
}

export interface Attributes78 {
    genreNames: string[]
    releaseDate: string
    durationInMillis: number
    isrc: string
    artwork: Artwork91
    playParams: PlayParams64
    url: string
    has4K: boolean
    artistUrl: string
    name: string
    hasHDR: boolean
    previews: Preview36[]
    videoTraits: any[]
    artistName: string
    contentRating: string
}

export interface Artwork91 {
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

export interface PlayParams64 {
    id: string
    kind: string
}

export interface Preview36 {
    url: string
    hlsUrl: string
    artwork: Artwork92
}

export interface Artwork92 {
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

export interface Relationships58 {
    artists: Artists58
}

export interface Artists58 {
    href: string
    data: Daum85[]
}

export interface Daum85 {
    id: string
    type: string
    href: string
}

export interface N1737018857 {
    id: string
    type: string
    href: string
    attributes: Attributes79
    relationships: Relationships59
}

export interface Attributes79 {
    genreNames: string[]
    releaseDate: string
    durationInMillis: number
    isrc: string
    artwork: Artwork93
    playParams: PlayParams65
    url: string
    has4K: boolean
    artistUrl: string
    name: string
    hasHDR: boolean
    previews: Preview37[]
    videoTraits: any[]
    artistName: string
    contentRating: string
}

export interface Artwork93 {
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

export interface PlayParams65 {
    id: string
    kind: string
}

export interface Preview37 {
    url: string
    hlsUrl: string
    artwork: Artwork94
}

export interface Artwork94 {
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

export interface Relationships59 {
    artists: Artists59
}

export interface Artists59 {
    href: string
    data: Daum86[]
}

export interface Daum86 {
    id: string
    type: string
    href: string
}

export interface N1748193582 {
    id: string
    type: string
    href: string
    attributes: Attributes80
    relationships: Relationships60
}

export interface Attributes80 {
    genreNames: string[]
    durationInMillis: number
    releaseDate: string
    isrc: string
    artwork: Artwork95
    playParams: PlayParams66
    url: string
    has4K: boolean
    artistUrl: string
    name: string
    hasHDR: boolean
    previews: Preview38[]
    videoTraits: string[]
    artistName: string
    contentRating: string
}

export interface Artwork95 {
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

export interface PlayParams66 {
    id: string
    kind: string
}

export interface Preview38 {
    url: string
    hlsUrl: string
    artwork: Artwork96
}

export interface Artwork96 {
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

export interface Relationships60 {
    artists: Artists60
}

export interface Artists60 {
    href: string
    data: Daum87[]
}

export interface Daum87 {
    id: string
    type: string
    href: string
}

export interface N1755298984 {
    id: string
    type: string
    href: string
    attributes: Attributes81
    relationships: Relationships61
}

export interface Attributes81 {
    genreNames: string[]
    durationInMillis: number
    releaseDate: string
    isrc: string
    artwork: Artwork97
    playParams: PlayParams67
    url: string
    has4K: boolean
    artistUrl: string
    name: string
    hasHDR: boolean
    previews: Preview39[]
    videoTraits: string[]
    artistName: string
    contentRating: string
}

export interface Artwork97 {
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

export interface PlayParams67 {
    id: string
    kind: string
}

export interface Preview39 {
    url: string
    hlsUrl: string
    artwork: Artwork98
}

export interface Artwork98 {
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

export interface Relationships61 {
    artists: Artists61
}

export interface Artists61 {
    href: string
    data: Daum88[]
}

export interface Daum88 {
    id: string
    type: string
    href: string
}

export interface N1767754041 {
    id: string
    type: string
    href: string
    attributes: Attributes82
    relationships: Relationships62
}

export interface Attributes82 {
    albumName: string
    genreNames: string[]
    trackNumber: number
    releaseDate: string
    durationInMillis: number
    isrc: string
    artwork: Artwork99
    playParams: PlayParams68
    url: string
    discNumber: number
    has4K: boolean
    artistUrl: string
    name: string
    hasHDR: boolean
    previews: Preview40[]
    videoTraits: string[]
    artistName: string
    contentRating: string
}

export interface Artwork99 {
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

export interface PlayParams68 {
    id: string
    kind: string
}

export interface Preview40 {
    url: string
    hlsUrl: string
    artwork: Artwork100
}

export interface Artwork100 {
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

export interface Relationships62 {
    artists: Artists62
}

export interface Artists62 {
    href: string
    data: Daum89[]
}

export interface Daum89 {
    id: string
    type: string
    href: string
}

export interface N1777300073 {
    id: string
    type: string
    href: string
    attributes: Attributes83
    relationships: Relationships63
}

export interface Attributes83 {
    genreNames: string[]
    durationInMillis: number
    releaseDate: string
    isrc: string
    artwork: Artwork101
    playParams: PlayParams69
    url: string
    has4K: boolean
    artistUrl: string
    name: string
    hasHDR: boolean
    previews: Preview41[]
    videoTraits: string[]
    artistName: string
    contentRating: string
}

export interface Artwork101 {
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

export interface PlayParams69 {
    id: string
    kind: string
}

export interface Preview41 {
    url: string
    hlsUrl: string
    artwork: Artwork102
}

export interface Artwork102 {
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

export interface Relationships63 {
    artists: Artists63
}

export interface Artists63 {
    href: string
    data: Daum90[]
}

export interface Daum90 {
    id: string
    type: string
    href: string
}

export interface N1780248566 {
    id: string
    type: string
    href: string
    attributes: Attributes84
    relationships: Relationships64
}

export interface Attributes84 {
    genreNames: string[]
    releaseDate: string
    durationInMillis: number
    isrc: string
    artwork: Artwork103
    playParams: PlayParams70
    url: string
    has4K: boolean
    artistUrl: string
    name: string
    hasHDR: boolean
    previews: Preview42[]
    videoTraits: string[]
    artistName: string
    contentRating: string
}

export interface Artwork103 {
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

export interface PlayParams70 {
    id: string
    kind: string
}

export interface Preview42 {
    url: string
    hlsUrl: string
    artwork: Artwork104
}

export interface Artwork104 {
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

export interface Relationships64 {
    artists: Artists64
}

export interface Artists64 {
    href: string
    data: Daum91[]
}

export interface Daum91 {
    id: string
    type: string
    href: string
}

export interface Meta43 {
    results: Results2
    metrics: Metrics
}

export interface Results2 {
    order: string[]
    rawOrder: string[]
}

export interface Metrics {
    dataSetId: string
}
