export interface UserPlaylist {
    data: Daum[]
    resources: Resources
}

export interface Daum {
    id: string
    type: string
    href: string
}

export interface Resources {
    "library-playlists": Record<string, LibraryPlaylists>
    playlists: Record<string, Playlists>
    "library-songs": Record<string, AppleUserPlaylistTrack>
    songs: Songs
    artists: Artists2
}

export interface LibraryPlaylists {
    id: string
    type: string
    href: string
    attributes: Attributes
    relationships: Relationships
}

export interface Attributes {
    hasCollaboration: boolean
    isCollaborativeHost: boolean
    lastModifiedDate: string
    canEdit: boolean
    name: string
    description: Description
    isPublic: boolean
    canDelete: boolean
    artwork: Artwork
    hasCatalog: boolean
    dateAdded: string
    playParams: PlayParams
}

export interface Description {
    standard: string
}

export interface Artwork {
    width: any
    height: any
    url: string
    hasP3: boolean
}

export interface PlayParams {
    id: string
    kind: string
    isLibrary: boolean
    globalId: string
}

export interface Relationships {
    catalog: Catalog
    tracks: Tracks
}

export interface Catalog {
    href: string
    data: Daum2[]
}

export interface Daum2 {
    id: string
    type: string
    href: string
}

export interface Tracks {
    href: string
    data: Daum3[]
    meta: Meta
}

export interface Daum3 {
    id: string
    type: string
    href: string
}

export interface Meta {
    total: number
}

export interface Playlists {
    id: string
    type: string
    href: string
    attributes: Attributes2
    relationships: Relationships2
}

export interface Attributes2 {
    hasCollaboration: boolean
    curatorName: string
    audioTraits: any[]
    lastModifiedDate: string
    isChart: boolean
    supportsSing: boolean
    name: string
    description: Description2
    playlistType: string
    artwork: Artwork2
    url: string
    playParams: PlayParams2
}

export interface Description2 {
    standard: string
}

export interface Artwork2 {
    width: number
    height: number
    url: string
    hasP3: boolean
}

export interface PlayParams2 {
    id: string
    kind: string
    versionHash: string
}

export interface Relationships2 {
    curator: Curator
}

export interface Curator {
    href: string
    data: any[]
}

export interface AppleUserPlaylistTrack {
    id: string
    type: string
    href: string
    attributes: Attributes3
    relationships: Relationships3
}

export interface Attributes3 {
    albumName: string
    discNumber: number
    genreNames: string[]
    hasLyrics: boolean
    trackNumber: number
    releaseDate: string
    durationInMillis: number
    name: string
    contentRating: string
    artistName: string
    artwork: Artwork3
    playParams: PlayParams3
}

export interface Artwork3 {
    width: number
    height: number
    url: string
    hasP3: boolean
}

export interface PlayParams3 {
    id: string
    kind: string
    isLibrary: boolean
    reporting: boolean
    catalogId: string
    reportingId: string
}

export interface Relationships3 {
    catalog: Catalog2
}

export interface Catalog2 {
    href: string
    data: Daum4[]
}

export interface Daum4 {
    id: string
    type: string
    href: string
}

export interface Songs {
    "1486263368": N1486263368
}

export interface N1486263368 {
    id: string
    type: string
    href: string
    attributes: Attributes4
    relationships: Relationships4
    meta: Meta2
}

export interface Attributes4 {
    durationInMillis: number
    artistUrl: string
    artwork: Artwork4
    url: string
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

export interface Relationships4 {
    artists: Artists
}

export interface Artists {
    href: string
    data: Daum5[]
}

export interface Daum5 {
    id: string
    type: string
    href: string
}

export interface Meta2 {
    contentVersion: ContentVersion
}

export interface ContentVersion {
    RTCI: number
    MZ_INDEXER: number
}

export interface Artists2 {
    "830588310": N830588310
}

export interface N830588310 {
    id: string
    type: string
    href: string
    attributes: Attributes5
}

export interface Attributes5 {
    genreNames: string[]
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
