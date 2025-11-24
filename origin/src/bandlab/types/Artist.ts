export interface BandlabArtist {
    about: any
    backgroundPicture: BackgroundPicture
    backgroundPictureId: any
    badges: any[]
    canChat: boolean
    collaborationStatus: string
    conversationId: string
    counters: Counters
    createdOn: string
    followingMeState: string
    followingState: string
    genres: Genre[]
    hasOnlyEduPlatform: boolean
    id: string
    inspiredBy: any[]
    introVideo: any
    invite: any
    isBlocked: boolean
    isBlockingMe: boolean
    isBoosted: boolean
    isFollower: boolean
    isPrivate: boolean
    isSubscriber: boolean
    isTippable: boolean
    isVerified: boolean
    links: Links
    liveShowId: any
    modifiedOn: string
    name: string
    picture: Picture
    pictureId: string
    place: any
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
    profilePictures: number
}

export interface Genre {
    id: string
    name: string
}

export interface Links {
    website: string
}

export interface Picture {
    adjustedColor: string
    adjustedColorLValue: number
    color: string
    isDefault: boolean
    url: string
}

export interface Skill {
    id: string
    name: string
}
