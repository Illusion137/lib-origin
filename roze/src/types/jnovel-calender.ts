export interface JNovel_Calender {
    props: Props
    page: string
    query: Query
    buildId: string
    isFallback: boolean
    isExperimentalCompile: boolean
    gssp: boolean
    locale: string
    locales: string[]
    defaultLocale: string
    scriptLoader: any[]
}

export interface Props {
    pageProps: PageProps
    __N_SSP: boolean
}

export interface PageProps {
    events: Events
    start: number
}

export interface Events {
    events: Event[]
    pagination: Pagination
}

export interface Event {
    legacyId: string
    name: string
    details: string
    launch: Launch
    legacyLink: string
    serie: Serie
    thumbnail: Thumbnail
}

export interface Launch {
    seconds: string
    nanos: number
}

export interface Serie {
    tags: any[]
    legacyId: string
    type: number
    title: string
    shortTitle: string
    originalTitle: string
    slug: string
    hidden: boolean
    created: Created
    description: string
    shortDescription: string
    cover: Cover
    following: boolean
    catchup: boolean
    status: number
    rentals: boolean
    topicId?: number
}

export interface Created {
    seconds: string
    nanos: number
}

export interface Cover {
    originalUrl: string
    coverUrl: string
    thumbnailUrl: string
}

export interface Thumbnail {
    originalUrl: string
    coverUrl: string
    thumbnailUrl: string
}

export interface Pagination {
    limit: number
    skip: number
    lastPage: boolean
}

export interface Query { }
