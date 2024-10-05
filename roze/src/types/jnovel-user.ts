export interface JNovel_User {
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
    user: User
    library: Library
}

export interface User {
    legacyId: string
    customerId: string
    email: string
    username: string
    forumId: number
    emailVerified: boolean
    country: string
    earnedCredits: number
    usedCredits: number
    created: Created
    level: number
    analyticsId: string
    subscriptionStatus: number
    coins: number
}

export interface Created {
    seconds: string
    nanos: number
}

export interface Library {
    books: Book[]
    pagination: Pagination
}

export interface Book {
    downloads: Download[]
    legacyId: string
    volume: Volume
    purchased: Purchased
    serie: Serie
    status: number
    lastDownload: LastDownload
    lastUpdated: LastUpdated
}

export interface Download {
    link: string
    type: number
    label: string
}

export interface Volume {
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
    cover: Cover
    owned: boolean
    originalTitle: string
    noEbook: boolean
    totalParts: number
    premiumExtras: string
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

export interface Cover {
    originalUrl: string
    coverUrl: string
    thumbnailUrl: string
}

export interface Purchased {
    seconds: string
    nanos: number
}

export interface Serie {
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
    cover: Cover2
    following: boolean
    catchup: boolean
    status: number
    rentals: boolean
}

export interface Created3 {
    seconds: string
    nanos: number
}

export interface Cover2 {
    originalUrl: string
    coverUrl: string
    thumbnailUrl: string
}

export interface LastDownload {
    seconds: string
    nanos: number
}

export interface LastUpdated {
    seconds: string
    nanos: number
}

export interface Pagination {
    limit: number
    skip: number
    lastPage: boolean
}

export interface Query { }