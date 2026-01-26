export interface BandLabProjects {
    data: Daum[]
    paging: Paging
}

export interface Daum {
    author: Author
    bandId: any
    canDelete: boolean
    canEdit: boolean
    collaboratorIds: any
    collaborators: Collaborator[]
    counters: Counters
    createdOn: string
    description: any
    id: string
    isCollaborator: boolean
    isFork: boolean
    isForkable: boolean
    isPublic: boolean
    lastRevisionCreatedOn: string
    modifiedOn: string
    name: string
    original: any
    originalSongId: any
    picture: Picture2
    slug: string
    source: any
    stamp?: string
    status: string
}

export interface Author {
    conversationId: any
    id: string
    name: string
    type: string
    username: string
}

export interface Collaborator {
    id: string
    name: string
    picture: Picture
    role: string
    username: string
}

export interface Picture {
    isDefault: boolean
    url: string
}

export interface Counters {
    collaborators: number
    comments: number
    forks: number
    likes: number
    plays: number
    publicRevisions: number
}

export interface Picture2 {
    adjustedColor: any
    adjustedColorLValue: any
    color: any
    isDefault: boolean
    url: string
}

export interface Paging {
    cursors: Cursors
    itemsCount: number
    limit: number
}

export interface Cursors {
    after: any
    before: string
}
