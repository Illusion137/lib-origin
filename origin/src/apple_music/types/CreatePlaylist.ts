export interface CreatePlaylist {
    data: Daum[]
}

export interface Daum {
    id: string
    type: string
    href: string
    attributes: Attributes
}

export interface Attributes {
    hasCollaboration: boolean
    lastModifiedDate: string
    canEdit: boolean
    name: string
    description: Description
    isPublic: boolean
    canDelete: boolean
    artwork: Artwork
    hasCatalog: boolean
    playParams: PlayParams
    dateAdded: string
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
}
