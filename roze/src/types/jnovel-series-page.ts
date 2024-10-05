export interface JNovel_Series_Page {
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
    seriesList: SeriesList
}

export interface SeriesList {
    success: boolean
    data: Data
}

export interface Data {
    series: Series[]
    pagination: Pagination
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

export interface Pagination {
    limit: number
    skip: number
    lastPage: boolean
}

export interface Query { }  