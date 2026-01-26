export interface BandLabSearchSongs {
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
    description?: string
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
    revision: Revision
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
    color?: string
    isDefault: boolean
    url: string
}

export interface Revision {
    canEdit: boolean
    canEditSettings: boolean
    canMaster: boolean
    canPublish: boolean
    clientId: string
    counters: Counters2
    createdOn: string
    creator: Creator
    description?: string
    genres: Genre[]
    id: string
    isFork: boolean
    isLiked: boolean
    isPublic: boolean
    mastering?: Mastering
    mixdown: Mixdown
    modifiedOn?: string
    parentId?: string
    postId: string
    stamp?: string
}

export interface Counters2 {
    comments: number
    forks: number
    likes: number
    plays: number
}

export interface Creator {
    followingState: string
    id: string
    isFollower: boolean
    isTippable: boolean
    isVerified: boolean
    name: string
    picture: Picture3
    username: string
}

export interface Picture3 {
    isDefault: boolean
    url: string
}

export interface Genre {
    id: string
    name: string
}

export interface Mastering {
    bypass: boolean
    drySampleId: string
    inputGain: number
    intensity: number
    preset: string
    previewId: any
    version: string
}

export interface Mixdown {
    creatorId: string
    device: any
    duration: number
    file: string
    id: string
    isMidi: boolean
    name: any
    source: string
    status: string
    waveform: string
}

export interface Paging {
    cursors: Cursors
    itemsCount: number
    limit: number
}

export interface Cursors {
    after: string
    before: string
}
