export interface BandlabSearchUsers {
    data: Daum[]
    paging: Paging
}

export interface Daum {
    about?: string
    backgroundPicture: BackgroundPicture
    backgroundPictureId: any
    badges: any[]
    collaborationStatus: string
    conversationId: string
    counters: Counters
    createdOn: string
    followingState: string
    genres: Genre[]
    hasOnlyEduPlatform: boolean
    id: string
    inspiredBy: any[]
    introVideo?: IntroVideo
    invite: any
    isBoosted: boolean
    isFollower: boolean
    isPrivate: boolean
    isTippable: boolean
    isVerified: boolean
    links: Links
    liveShowId: any
    modifiedOn: string
    name: string
    picture: Picture2
    pictureId: string
    place?: Place
    skills: Skill[]
    username: string
}

export interface BackgroundPicture {
    isDefault: boolean
    url: string
}

export interface Counters {
    bandFollowings: number
    bands: number
    collections: number
    followers: number
    following: number
    plays: number
}

export interface Genre {
    id: string
    name: string
}

export interface IntroVideo {
    counters: any
    duration: number
    id: string
    isLiked: boolean
    picture: Picture
    status: string
    url: string
}

export interface Picture {
    isDefault: boolean
    url: string
}

export interface Links { }

export interface Picture2 {
    adjustedColor: any
    adjustedColorLValue: any
    color: any
    isDefault: boolean
    url: string
}

export interface Place {
    city: string
    country: string
    countryCode: string
    id: string
    name: string
    state: string
}

export interface Skill {
    id: string
    name: string
}

export interface Paging {
    cursors: Cursors
    itemsCount: number
    limit: number
}

export interface Cursors {
    after: string
    before: any
}
