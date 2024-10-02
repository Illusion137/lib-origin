export interface MyPlaylists {
    data: Daum[]
    resources: Resources
    meta: Meta
}

export interface Daum {
    id: string
    type: string
    href: string
}

export interface Resources {
    "library-playlists": Record<string, LibraryPlaylist>
    playlists: Playlists
}

export interface LibraryPlaylist {
    id: string
    type: string
    href: string
    attributes: Attributes
    relationships: Relationships
}

export interface Attributes {
    hasCollaboration: boolean
    lastModifiedDate: string
    canEdit: boolean
    name: string
    description: Description
    isPublic: boolean
    canDelete: boolean
    hasCatalog: boolean
    dateAdded: string
    playParams: PlayParams
}

export interface Description {
    standard: string
}

export interface PlayParams {
    id: string
    kind: string
    isLibrary: boolean
    globalId: string
}

export interface Relationships {
    catalog: Catalog
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

export interface Playlists {
    "pl.u-EdAVz6dta8eZLgP": PlUEdAvz6dta8eZlgP
}

export interface PlUEdAvz6dta8eZlgP {
    id: string
    type: string
    href: string
    attributes: Attributes2
}

export interface Attributes2 {
    curatorName: string
}

export interface Meta {
    total: number
}
