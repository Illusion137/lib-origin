export interface BandLabPlaylist {
    counters: Counters
    createdOn: string
    creator: Creator
    description: any
    id: string
    isLiked: boolean
    isPublic: boolean
    lastUpdatedOn: string
    metadata: any
    name: string
    picture: Picture2
    posts: Post[]
    type: string
}

export interface Counters {
    duration: number
    items: number
    likes: number
    plays: number
}

export interface Creator {
    counters: Counters2
    followingState: string
    id: string
    isFollower: boolean
    isTippable: boolean
    isVerified: boolean
    name: string
    picture: Picture
    username: string
}

export interface Counters2 {
    bandFollowings: number
    bands: number
    collections: number
    followers: number
    following: number
    plays: number
}

export interface Picture {
    isDefault: boolean
    url: string
}

export interface Picture2 {
    isDefault: boolean
    url: string
}

export interface Post {
    action: string
    afterForComments: any
    backgroundId: any
    canChangePinState: boolean
    canComment: boolean
    canDelete: boolean
    canEdit: boolean
    canPin: boolean
    caption: string
    channelId: string
    clientId: string
    comments: any[]
    counters: Counters3
    createdOn: string
    creator: Creator2
    id: string
    isBoosted: boolean
    isCommentingAllowed: boolean
    isExclusive: boolean
    isExplicit: boolean
    isLiked: boolean
    isPinned: boolean
    message: string
    permissions: Permissions
    revision: Revision
    state: string
    type: string
}

export interface Counters3 {
    comments: number
    likes: number
}

export interface Creator2 {
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

export interface Permissions {
    comment: boolean
    seeExclusive: boolean
}

export interface Revision {
    canEdit: boolean
    canEditSettings: any
    canMaster: boolean
    canPublish: boolean
    counters: Counters4
    createdOn: string
    creator: Creator3
    description: string
    genres: Genre[]
    id: string
    isFork: boolean
    isLiked: boolean
    isPublic: boolean
    lyrics?: Lyrics
    mastering?: Mastering
    mixdown: Mixdown
    parentId: any
    place: any
    song: Song
    spatialMixdown: any
    tags: any[]
}

export interface Counters4 {
    comments: number
    forks: number
    likes: number
    plays: number
}

export interface Creator3 {
    followingState: string
    id: string
    isFollower: boolean
    isTippable: boolean
    isVerified: boolean
    name: string
    picture: Picture4
    username: string
}

export interface Picture4 {
    isDefault: boolean
    url: string
}

export interface Genre {
    id: string
    name: string
}

export interface Lyrics {
    content: string
}

export interface Mastering {
    bypass: any
    drySampleId: string
    inputGain: any
    intensity: any
    preset: string
    previewId: any
    version: any
}

export interface Mixdown {
    duration: number
    file: string
    id: string
    status: string
    waveform: string
}

export interface Song {
    author: Author
    counters: Counters5
    id: string
    isFork: boolean
    isForkable: boolean
    name: string
    originalSongId?: string
    picture: Picture5
    slug: string
    original?: Original
}

export interface Author {
    conversationId?: string
    id: string
    name: string
    type: string
    username: string
}

export interface Counters5 {
    collaborators: number
    comments: number
    forks: number
    likes: number
    plays: number
    publicRevisions: number
}

export interface Picture5 {
    adjustedColor: any
    adjustedColorLValue: any
    color: any
    isDefault: boolean
    url: string
}

export interface Original {
    creatorName: string
    name: string
    picture: Picture6
    revisionId: string
    songId: string
}

export interface Picture6 {
    adjustedColor: any
    adjustedColorLValue: any
    color: any
    isDefault: boolean
    url: string
}
