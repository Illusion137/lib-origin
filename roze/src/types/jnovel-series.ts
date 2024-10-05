export interface JNovel_Series {
    props: Props
    page: string
    query: Query
    buildId: string
    isFallback: boolean
    isExperimentalCompile: boolean
    gip: boolean
    locale: string
    locales: string[]
    defaultLocale: string
    scriptLoader: any[]
}

export interface Props {
    pageProps: PageProps
}

export interface PageProps {
    aggregate: Aggregate
    id: string
}

export interface Aggregate {
    volumes: Volume[]
    series: Series
}

export interface Volume {
    parts: Part[]
    volume: Volume2
}

export interface Part {
    legacyId: string
    title: string
    slug: string
    number: number
    preview: boolean
    hidden: boolean
    created: Created
    expiration?: Expiration
    launch: Launch
    cover: Cover
    progress: number
    originalTitle: string
    totalMangaPages: number
}

export interface Created {
    seconds: string
    nanos: number
}

export interface Expiration {
    seconds: string
    nanos: number
}

export interface Launch {
    seconds: string
    nanos: number
}

export interface Cover {
    originalUrl: string
    coverUrl: string
    thumbnailUrl: string
}

export interface Volume2 {
    creators: Creator[]
    legacyId: string
    title: string
    slug: string
    number: number
    originalPublisher: string
    label: string
    hidden: boolean
    forumTopicId: number
    created: Created2
    publishing: Publishing
    description: string
    shortDescription: string
    cover: Cover2
    owned: boolean
    originalTitle: string
    noEbook: boolean
    totalParts: number
    premiumExtras: string
    physicalPublishing?: PhysicalPublishing
}

export interface Creator {
    name: string
    role: number
    originalName: string
}

export interface Created2 {
    seconds: string
    nanos: number
}

export interface Publishing {
    seconds: string
    nanos: number
}

export interface Cover2 {
    originalUrl: string
    coverUrl: string
    thumbnailUrl: string
}

export interface PhysicalPublishing {
    seconds: string
    nanos: number
}

export interface Series {
    tags: string[]
    legacyId: string
    type: number
    title: string
    shortTitle: string
    originalTitle: string
    slug: string
    hidden: boolean
    created: Created3
    description: string
    shortDescription: string
    cover: Cover3
    following: boolean
    catchup: boolean
    status: number
    rentals: boolean
}

export interface Created3 {
    seconds: string
    nanos: number
}

export interface Cover3 {
    originalUrl: string
    coverUrl: string
    thumbnailUrl: string
}

export interface Query {
    slug: string
}