export interface JNovel_Home {
    props: Props
    page: string
    query: Query
    buildId: string
    isFallback: boolean
    isExperimentalCompile: boolean
    gsp: boolean
    locale: string
    locales: string[]
    defaultLocale: string
    scriptLoader: any[]
}

export interface Props {
    pageProps: PageProps
    __N_SSG: boolean
}

export interface PageProps {
    data: Data
    fallback: Fallback
}

export interface Data {
    announcement: any
    titlesLatest: TitlesLatest[]
    volumesLatest: VolumesLatest[]
    volumesLatestPhysical: VolumesLatestPhysical
    physicalLatesSeries: PhysicalLatesSeries
    titlesCatchup: TitlesCatchup[]
}

export interface TitlesLatest {
    id: string
    created: string
    type: string
    label: string
    name: string
    nameShort: string
    nameOriginal: string
    slug: string
    credits: Credits
    tags: string[]
    description: string
    descriptionShort: string
    complete: boolean
    status: string
    physicalState: string
    forumLink: string
    thumbnail: string
    banner: string
    catchup: boolean
    releasedVolumes: number
    bookwalkerSeriesId: number
    public: boolean
    followed: any
}

export interface Credits {
    author: string
    illustrator?: string
    artist?: string
    translator: string
    editor: string
    letterer?: string
}

export interface VolumesLatest {
    index: number
    id: string
    slug: string
    created: string
    titleId: string
    titleName: string
    titleType: string
    titleSlug: string
    number: string
    nameOriginal: string
    name: any
    description: string
    descriptionShort: string
    credits: Credits2
    thumbnail: string
    banner: string
    publishingDate: string
    publishingInfo: any
    publishingDatePhysical: any
    publishingInfoPhysical: any
    publishingDateOriginal: string
    prepubActive: boolean
    prepubExpirationDate: string
    noPremium: boolean
    premiumContent?: string[]
    partFirst: any
    partLast: any
    partCount: number
    parts: any
    public: boolean
}

export interface Credits2 {
    author: string
    illustrator?: string
    artist?: string
    translator: string
    editor: string
    letterer?: string
}

export interface VolumesLatestPhysical {
    volumes: Volume[]
    pagination: Pagination
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
    created: Created
    publishing: Publishing
    description: string
    shortDescription: string
    cover: Cover
    owned: boolean
    originalTitle: string
    noEbook: boolean
    totalParts: number
    premiumExtras?: string
}

export interface Creator {
    name: string
    role: number
    originalName: string
}

export interface Created {
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

export interface Pagination {
    limit: number
    skip: number
    lastPage: boolean
}

export interface PhysicalLatesSeries {
    "64ff0a7425b027661057e25a": N64ff0a7425b027661057e25a
    "64fb6b3940d3b4be53892b16": N64fb6b3940d3b4be53892b16
    "64b942de3d9a73193f2deca5": N64b942de3d9a73193f2deca5
    "64a81c5478830af30772909a": N64a81c5478830af30772909a
    "6495a39b476d1d9876ef4b75": N6495a39b476d1d9876ef4b75
    "649d9303bb3dbcfb597dc1ec": N649d9303bb3dbcfb597dc1ec
    "647109f5df24eb294c8e6d60": N647109f5df24eb294c8e6d60
    "6471d032726f461d41e55bf9": N6471d032726f461d41e55bf9
    "64594c085d637be42a1b9ab1": N64594c085d637be42a1b9ab1
    "6419d0fce9be8e3e55d5c6b7": N6419d0fce9be8e3e55d5c6b7
    "64302b46bbfa9b9015a3b3bc": N64302b46bbfa9b9015a3b3bc
    "6414be7b6eaf08bd2d18648d": N6414be7b6eaf08bd2d18648d
    "6400be84b4385a2b0c86328d": N6400be84b4385a2b0c86328d
    "641b206606a13f285588d5ef": N641b206606a13f285588d5ef
    "63efaa58c243fba57755ec54": N63efaa58c243fba57755ec54
    "640f66fe6b67b7302e80b667": N640f66fe6b67b7302e80b667
    "63ebed8a84eb39745f50c0c3": N63ebed8a84eb39745f50c0c3
    "63d1a443994e78ee5d5aa27f": N63d1a443994e78ee5d5aa27f
    "63af3093e06eb8a36f76efb8": N63af3093e06eb8a36f76efb8
    "639a3cd817e720e10fc676f4": N639a3cd817e720e10fc676f4
    "63bc736f120fb70410d167ed": N63bc736f120fb70410d167ed
    "63c03b61e4936fd765d98dda": N63c03b61e4936fd765d98dda
    "638644b05a4a3a2a395c5fa8": N638644b05a4a3a2a395c5fa8
    "636a7d9facd4dcb71bb756fb": N636a7d9facd4dcb71bb756fb
    "639c220a30e5038e109fa747": N639c220a30e5038e109fa747
    "6364e977953173f823774550": N6364e977953173f823774550
    "635c0604953173f8237744d1": N635c0604953173f8237744d1
    "636c4f25449c28d01bb4b401": N636c4f25449c28d01bb4b401
    "636941b10f70ce58739b2843": N636941b10f70ce58739b2843
    "63331a86853da3577cbdd780": N63331a86853da3577cbdd780
    "6337037a811c9603444b85e1": N6337037a811c9603444b85e1
    "633ee5b8fab695121d1b3ee8": N633ee5b8fab695121d1b3ee8
    "635b950b57e250e223b5ffa1": N635b950b57e250e223b5ffa1
    "6350f4baea178b79645374fe": N6350f4baea178b79645374fe
    "630fc19f0351e72520c0ee10": N630fc19f0351e72520c0ee10
    "63248a596164ffe71fb30573": N63248a596164ffe71fb30573
    "6334993c6164ffe71fb3065d": N6334993c6164ffe71fb3065d
    "631f9a916164ffe71fb3050d": N631f9a916164ffe71fb3050d
    "63248f2fbfd3ac06207431a4": N63248f2fbfd3ac06207431a4
    "62c0263ad440cc5d411b5128": N62c0263ad440cc5d411b5128
    "617d4b5e80f0305a269c14d9": N617d4b5e80f0305a269c14d9
    "62f41486a9f787ca5446a1e9": N62f41486a9f787ca5446a1e9
    "62b490a3a67de7807a04cf1e": N62b490a3a67de7807a04cf1e
    "62bc6a74e9613c820f80e2a6": N62bc6a74e9613c820f80e2a6
    "62ef7299b5690b8c540157c6": N62ef7299b5690b8c540157c6
    "62d596ecd0a949bb54a02e27": N62d596ecd0a949bb54a02e27
    "628e8a0b3e902a0f7bc68898": N628e8a0b3e902a0f7bc68898
    "62962ca2c19fc449447e52d4": N62962ca2c19fc449447e52d4
    "62890e66c19fc449447e51ca": N62890e66c19fc449447e51ca
    "62bca3b1c19fc449447e5554": N62bca3b1c19fc449447e5554
}

export interface N64ff0a7425b027661057e25a {
    tags: string[]
    legacyId: string
    type: number
    title: string
    shortTitle: string
    originalTitle: string
    slug: string
    hidden: boolean
    created: Created2
    description: string
    shortDescription: string
    cover: Cover2
    following: boolean
    catchup: boolean
    status: number
    rentals: boolean
    topicId: number
}

export interface Created2 {
    seconds: string
    nanos: number
}

export interface Cover2 {
    originalUrl: string
    coverUrl: string
    thumbnailUrl: string
}

export interface N64fb6b3940d3b4be53892b16 {
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
    topicId: number
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

export interface N64b942de3d9a73193f2deca5 {
    tags: string[]
    legacyId: string
    type: number
    title: string
    shortTitle: string
    originalTitle: string
    slug: string
    hidden: boolean
    created: Created4
    description: string
    shortDescription: string
    cover: Cover4
    following: boolean
    catchup: boolean
    status: number
    rentals: boolean
}

export interface Created4 {
    seconds: string
    nanos: number
}

export interface Cover4 {
    originalUrl: string
    coverUrl: string
    thumbnailUrl: string
}

export interface N64a81c5478830af30772909a {
    tags: string[]
    legacyId: string
    type: number
    title: string
    shortTitle: string
    originalTitle: string
    slug: string
    hidden: boolean
    created: Created5
    description: string
    shortDescription: string
    cover: Cover5
    following: boolean
    catchup: boolean
    status: number
    rentals: boolean
    topicId: number
}

export interface Created5 {
    seconds: string
    nanos: number
}

export interface Cover5 {
    originalUrl: string
    coverUrl: string
    thumbnailUrl: string
}

export interface N6495a39b476d1d9876ef4b75 {
    tags: string[]
    legacyId: string
    type: number
    title: string
    shortTitle: string
    originalTitle: string
    slug: string
    hidden: boolean
    created: Created6
    description: string
    shortDescription: string
    cover: Cover6
    following: boolean
    catchup: boolean
    status: number
    rentals: boolean
}

export interface Created6 {
    seconds: string
    nanos: number
}

export interface Cover6 {
    originalUrl: string
    coverUrl: string
    thumbnailUrl: string
}

export interface N649d9303bb3dbcfb597dc1ec {
    tags: string[]
    legacyId: string
    type: number
    title: string
    shortTitle: string
    originalTitle: string
    slug: string
    hidden: boolean
    created: Created7
    description: string
    shortDescription: string
    cover: Cover7
    following: boolean
    catchup: boolean
    status: number
    rentals: boolean
    topicId: number
}

export interface Created7 {
    seconds: string
    nanos: number
}

export interface Cover7 {
    originalUrl: string
    coverUrl: string
    thumbnailUrl: string
}

export interface N647109f5df24eb294c8e6d60 {
    tags: string[]
    legacyId: string
    type: number
    title: string
    shortTitle: string
    originalTitle: string
    slug: string
    hidden: boolean
    created: Created8
    description: string
    shortDescription: string
    cover: Cover8
    following: boolean
    catchup: boolean
    status: number
    rentals: boolean
    topicId: number
}

export interface Created8 {
    seconds: string
    nanos: number
}

export interface Cover8 {
    originalUrl: string
    coverUrl: string
    thumbnailUrl: string
}

export interface N6471d032726f461d41e55bf9 {
    tags: string[]
    legacyId: string
    type: number
    title: string
    shortTitle: string
    originalTitle: string
    slug: string
    hidden: boolean
    created: Created9
    description: string
    shortDescription: string
    cover: Cover9
    following: boolean
    catchup: boolean
    status: number
    rentals: boolean
    topicId: number
}

export interface Created9 {
    seconds: string
    nanos: number
}

export interface Cover9 {
    originalUrl: string
    coverUrl: string
    thumbnailUrl: string
}

export interface N64594c085d637be42a1b9ab1 {
    tags: string[]
    legacyId: string
    type: number
    title: string
    shortTitle: string
    originalTitle: string
    slug: string
    hidden: boolean
    created: Created10
    description: string
    shortDescription: string
    cover: Cover10
    following: boolean
    catchup: boolean
    status: number
    rentals: boolean
}

export interface Created10 {
    seconds: string
    nanos: number
}

export interface Cover10 {
    originalUrl: string
    coverUrl: string
    thumbnailUrl: string
}

export interface N6419d0fce9be8e3e55d5c6b7 {
    tags: string[]
    legacyId: string
    type: number
    title: string
    shortTitle: string
    originalTitle: string
    slug: string
    hidden: boolean
    created: Created11
    description: string
    shortDescription: string
    cover: Cover11
    following: boolean
    catchup: boolean
    status: number
    rentals: boolean
    topicId: number
}

export interface Created11 {
    seconds: string
    nanos: number
}

export interface Cover11 {
    originalUrl: string
    coverUrl: string
    thumbnailUrl: string
}

export interface N64302b46bbfa9b9015a3b3bc {
    tags: string[]
    legacyId: string
    type: number
    title: string
    shortTitle: string
    originalTitle: string
    slug: string
    hidden: boolean
    created: Created12
    description: string
    shortDescription: string
    cover: Cover12
    following: boolean
    catchup: boolean
    status: number
    rentals: boolean
    topicId: number
}

export interface Created12 {
    seconds: string
    nanos: number
}

export interface Cover12 {
    originalUrl: string
    coverUrl: string
    thumbnailUrl: string
}

export interface N6414be7b6eaf08bd2d18648d {
    tags: string[]
    legacyId: string
    type: number
    title: string
    shortTitle: string
    originalTitle: string
    slug: string
    hidden: boolean
    created: Created13
    description: string
    shortDescription: string
    cover: Cover13
    following: boolean
    catchup: boolean
    status: number
    rentals: boolean
    topicId: number
}

export interface Created13 {
    seconds: string
    nanos: number
}

export interface Cover13 {
    originalUrl: string
    coverUrl: string
    thumbnailUrl: string
}

export interface N6400be84b4385a2b0c86328d {
    tags: string[]
    legacyId: string
    type: number
    title: string
    shortTitle: string
    originalTitle: string
    slug: string
    hidden: boolean
    created: Created14
    description: string
    shortDescription: string
    cover: Cover14
    following: boolean
    catchup: boolean
    status: number
    rentals: boolean
}

export interface Created14 {
    seconds: string
    nanos: number
}

export interface Cover14 {
    originalUrl: string
    coverUrl: string
    thumbnailUrl: string
}

export interface N641b206606a13f285588d5ef {
    tags: string[]
    legacyId: string
    type: number
    title: string
    shortTitle: string
    originalTitle: string
    slug: string
    hidden: boolean
    created: Created15
    description: string
    shortDescription: string
    cover: Cover15
    following: boolean
    catchup: boolean
    status: number
    rentals: boolean
    topicId: number
}

export interface Created15 {
    seconds: string
    nanos: number
}

export interface Cover15 {
    originalUrl: string
    coverUrl: string
    thumbnailUrl: string
}

export interface N63efaa58c243fba57755ec54 {
    tags: string[]
    legacyId: string
    type: number
    title: string
    shortTitle: string
    originalTitle: string
    slug: string
    hidden: boolean
    created: Created16
    description: string
    shortDescription: string
    cover: Cover16
    following: boolean
    catchup: boolean
    status: number
    rentals: boolean
}

export interface Created16 {
    seconds: string
    nanos: number
}

export interface Cover16 {
    originalUrl: string
    coverUrl: string
    thumbnailUrl: string
}

export interface N640f66fe6b67b7302e80b667 {
    tags: string[]
    legacyId: string
    type: number
    title: string
    shortTitle: string
    originalTitle: string
    slug: string
    hidden: boolean
    created: Created17
    description: string
    shortDescription: string
    cover: Cover17
    following: boolean
    catchup: boolean
    status: number
    rentals: boolean
}

export interface Created17 {
    seconds: string
    nanos: number
}

export interface Cover17 {
    originalUrl: string
    coverUrl: string
    thumbnailUrl: string
}

export interface N63ebed8a84eb39745f50c0c3 {
    tags: string[]
    legacyId: string
    type: number
    title: string
    shortTitle: string
    originalTitle: string
    slug: string
    hidden: boolean
    created: Created18
    description: string
    shortDescription: string
    cover: Cover18
    following: boolean
    catchup: boolean
    status: number
    rentals: boolean
    topicId: number
}

export interface Created18 {
    seconds: string
    nanos: number
}

export interface Cover18 {
    originalUrl: string
    coverUrl: string
    thumbnailUrl: string
}

export interface N63d1a443994e78ee5d5aa27f {
    tags: string[]
    legacyId: string
    type: number
    title: string
    shortTitle: string
    originalTitle: string
    slug: string
    hidden: boolean
    created: Created19
    description: string
    shortDescription: string
    cover: Cover19
    following: boolean
    catchup: boolean
    status: number
    rentals: boolean
}

export interface Created19 {
    seconds: string
    nanos: number
}

export interface Cover19 {
    originalUrl: string
    coverUrl: string
    thumbnailUrl: string
}

export interface N63af3093e06eb8a36f76efb8 {
    tags: string[]
    legacyId: string
    type: number
    title: string
    shortTitle: string
    originalTitle: string
    slug: string
    hidden: boolean
    created: Created20
    description: string
    shortDescription: string
    cover: Cover20
    following: boolean
    catchup: boolean
    status: number
    rentals: boolean
}

export interface Created20 {
    seconds: string
    nanos: number
}

export interface Cover20 {
    originalUrl: string
    coverUrl: string
    thumbnailUrl: string
}

export interface N639a3cd817e720e10fc676f4 {
    tags: string[]
    legacyId: string
    type: number
    title: string
    shortTitle: string
    originalTitle: string
    slug: string
    hidden: boolean
    created: Created21
    description: string
    shortDescription: string
    cover: Cover21
    following: boolean
    catchup: boolean
    status: number
    rentals: boolean
}

export interface Created21 {
    seconds: string
    nanos: number
}

export interface Cover21 {
    originalUrl: string
    coverUrl: string
    thumbnailUrl: string
}

export interface N63bc736f120fb70410d167ed {
    tags: string[]
    legacyId: string
    type: number
    title: string
    shortTitle: string
    originalTitle: string
    slug: string
    hidden: boolean
    created: Created22
    description: string
    shortDescription: string
    cover: Cover22
    following: boolean
    catchup: boolean
    status: number
    rentals: boolean
    topicId: number
}

export interface Created22 {
    seconds: string
    nanos: number
}

export interface Cover22 {
    originalUrl: string
    coverUrl: string
    thumbnailUrl: string
}

export interface N63c03b61e4936fd765d98dda {
    tags: string[]
    legacyId: string
    type: number
    title: string
    shortTitle: string
    originalTitle: string
    slug: string
    hidden: boolean
    created: Created23
    description: string
    shortDescription: string
    cover: Cover23
    following: boolean
    catchup: boolean
    status: number
    rentals: boolean
    topicId: number
}

export interface Created23 {
    seconds: string
    nanos: number
}

export interface Cover23 {
    originalUrl: string
    coverUrl: string
    thumbnailUrl: string
}

export interface N638644b05a4a3a2a395c5fa8 {
    tags: string[]
    legacyId: string
    type: number
    title: string
    shortTitle: string
    originalTitle: string
    slug: string
    hidden: boolean
    created: Created24
    description: string
    shortDescription: string
    cover: Cover24
    following: boolean
    catchup: boolean
    status: number
    rentals: boolean
    topicId: number
}

export interface Created24 {
    seconds: string
    nanos: number
}

export interface Cover24 {
    originalUrl: string
    coverUrl: string
    thumbnailUrl: string
}

export interface N636a7d9facd4dcb71bb756fb {
    tags: string[]
    legacyId: string
    type: number
    title: string
    shortTitle: string
    originalTitle: string
    slug: string
    hidden: boolean
    created: Created25
    description: string
    shortDescription: string
    cover: Cover25
    following: boolean
    catchup: boolean
    status: number
    rentals: boolean
}

export interface Created25 {
    seconds: string
    nanos: number
}

export interface Cover25 {
    originalUrl: string
    coverUrl: string
    thumbnailUrl: string
}

export interface N639c220a30e5038e109fa747 {
    tags: string[]
    legacyId: string
    type: number
    title: string
    shortTitle: string
    originalTitle: string
    slug: string
    hidden: boolean
    created: Created26
    description: string
    shortDescription: string
    cover: Cover26
    following: boolean
    catchup: boolean
    status: number
    rentals: boolean
    topicId: number
}

export interface Created26 {
    seconds: string
    nanos: number
}

export interface Cover26 {
    originalUrl: string
    coverUrl: string
    thumbnailUrl: string
}

export interface N6364e977953173f823774550 {
    tags: string[]
    legacyId: string
    type: number
    title: string
    shortTitle: string
    originalTitle: string
    slug: string
    hidden: boolean
    created: Created27
    description: string
    shortDescription: string
    cover: Cover27
    following: boolean
    catchup: boolean
    status: number
    rentals: boolean
    topicId: number
}

export interface Created27 {
    seconds: string
    nanos: number
}

export interface Cover27 {
    originalUrl: string
    coverUrl: string
    thumbnailUrl: string
}

export interface N635c0604953173f8237744d1 {
    tags: string[]
    legacyId: string
    type: number
    title: string
    shortTitle: string
    originalTitle: string
    slug: string
    hidden: boolean
    created: Created28
    description: string
    shortDescription: string
    cover: Cover28
    following: boolean
    catchup: boolean
    status: number
    rentals: boolean
}

export interface Created28 {
    seconds: string
    nanos: number
}

export interface Cover28 {
    originalUrl: string
    coverUrl: string
    thumbnailUrl: string
}

export interface N636c4f25449c28d01bb4b401 {
    tags: string[]
    legacyId: string
    type: number
    title: string
    shortTitle: string
    originalTitle: string
    slug: string
    hidden: boolean
    created: Created29
    description: string
    shortDescription: string
    cover: Cover29
    following: boolean
    catchup: boolean
    status: number
    rentals: boolean
    topicId: number
}

export interface Created29 {
    seconds: string
    nanos: number
}

export interface Cover29 {
    originalUrl: string
    coverUrl: string
    thumbnailUrl: string
}

export interface N636941b10f70ce58739b2843 {
    tags: string[]
    legacyId: string
    type: number
    title: string
    shortTitle: string
    originalTitle: string
    slug: string
    hidden: boolean
    created: Created30
    description: string
    shortDescription: string
    cover: Cover30
    following: boolean
    catchup: boolean
    status: number
    rentals: boolean
}

export interface Created30 {
    seconds: string
    nanos: number
}

export interface Cover30 {
    originalUrl: string
    coverUrl: string
    thumbnailUrl: string
}

export interface N63331a86853da3577cbdd780 {
    tags: string[]
    legacyId: string
    type: number
    title: string
    shortTitle: string
    originalTitle: string
    slug: string
    hidden: boolean
    created: Created31
    description: string
    shortDescription: string
    cover: Cover31
    following: boolean
    catchup: boolean
    status: number
    rentals: boolean
    topicId: number
}

export interface Created31 {
    seconds: string
    nanos: number
}

export interface Cover31 {
    originalUrl: string
    coverUrl: string
    thumbnailUrl: string
}

export interface N6337037a811c9603444b85e1 {
    tags: string[]
    legacyId: string
    type: number
    title: string
    shortTitle: string
    originalTitle: string
    slug: string
    hidden: boolean
    created: Created32
    description: string
    shortDescription: string
    cover: Cover32
    following: boolean
    catchup: boolean
    status: number
    rentals: boolean
    topicId: number
}

export interface Created32 {
    seconds: string
    nanos: number
}

export interface Cover32 {
    originalUrl: string
    coverUrl: string
    thumbnailUrl: string
}

export interface N633ee5b8fab695121d1b3ee8 {
    tags: string[]
    legacyId: string
    type: number
    title: string
    shortTitle: string
    originalTitle: string
    slug: string
    hidden: boolean
    created: Created33
    description: string
    shortDescription: string
    cover: Cover33
    following: boolean
    catchup: boolean
    status: number
    rentals: boolean
    topicId: number
}

export interface Created33 {
    seconds: string
    nanos: number
}

export interface Cover33 {
    originalUrl: string
    coverUrl: string
    thumbnailUrl: string
}

export interface N635b950b57e250e223b5ffa1 {
    tags: string[]
    legacyId: string
    type: number
    title: string
    shortTitle: string
    originalTitle: string
    slug: string
    hidden: boolean
    created: Created34
    description: string
    shortDescription: string
    cover: Cover34
    following: boolean
    catchup: boolean
    status: number
    rentals: boolean
    topicId: number
}

export interface Created34 {
    seconds: string
    nanos: number
}

export interface Cover34 {
    originalUrl: string
    coverUrl: string
    thumbnailUrl: string
}

export interface N6350f4baea178b79645374fe {
    tags: string[]
    legacyId: string
    type: number
    title: string
    shortTitle: string
    originalTitle: string
    slug: string
    hidden: boolean
    created: Created35
    description: string
    shortDescription: string
    cover: Cover35
    following: boolean
    catchup: boolean
    status: number
    rentals: boolean
    topicId: number
}

export interface Created35 {
    seconds: string
    nanos: number
}

export interface Cover35 {
    originalUrl: string
    coverUrl: string
    thumbnailUrl: string
}

export interface N630fc19f0351e72520c0ee10 {
    tags: string[]
    legacyId: string
    type: number
    title: string
    shortTitle: string
    originalTitle: string
    slug: string
    hidden: boolean
    created: Created36
    description: string
    shortDescription: string
    cover: Cover36
    following: boolean
    catchup: boolean
    status: number
    rentals: boolean
}

export interface Created36 {
    seconds: string
    nanos: number
}

export interface Cover36 {
    originalUrl: string
    coverUrl: string
    thumbnailUrl: string
}

export interface N63248a596164ffe71fb30573 {
    tags: string[]
    legacyId: string
    type: number
    title: string
    shortTitle: string
    originalTitle: string
    slug: string
    hidden: boolean
    created: Created37
    description: string
    shortDescription: string
    cover: Cover37
    following: boolean
    catchup: boolean
    status: number
    rentals: boolean
    topicId: number
}

export interface Created37 {
    seconds: string
    nanos: number
}

export interface Cover37 {
    originalUrl: string
    coverUrl: string
    thumbnailUrl: string
}

export interface N6334993c6164ffe71fb3065d {
    tags: string[]
    legacyId: string
    type: number
    title: string
    shortTitle: string
    originalTitle: string
    slug: string
    hidden: boolean
    created: Created38
    description: string
    shortDescription: string
    cover: Cover38
    following: boolean
    catchup: boolean
    status: number
    rentals: boolean
    topicId: number
}

export interface Created38 {
    seconds: string
    nanos: number
}

export interface Cover38 {
    originalUrl: string
    coverUrl: string
    thumbnailUrl: string
}

export interface N631f9a916164ffe71fb3050d {
    tags: string[]
    legacyId: string
    type: number
    title: string
    shortTitle: string
    originalTitle: string
    slug: string
    hidden: boolean
    created: Created39
    description: string
    shortDescription: string
    cover: Cover39
    following: boolean
    catchup: boolean
    status: number
    rentals: boolean
}

export interface Created39 {
    seconds: string
    nanos: number
}

export interface Cover39 {
    originalUrl: string
    coverUrl: string
    thumbnailUrl: string
}

export interface N63248f2fbfd3ac06207431a4 {
    tags: string[]
    legacyId: string
    type: number
    title: string
    shortTitle: string
    originalTitle: string
    slug: string
    hidden: boolean
    created: Created40
    description: string
    shortDescription: string
    cover: Cover40
    following: boolean
    catchup: boolean
    status: number
    rentals: boolean
    topicId: number
}

export interface Created40 {
    seconds: string
    nanos: number
}

export interface Cover40 {
    originalUrl: string
    coverUrl: string
    thumbnailUrl: string
}

export interface N62c0263ad440cc5d411b5128 {
    tags: string[]
    legacyId: string
    type: number
    title: string
    shortTitle: string
    originalTitle: string
    slug: string
    hidden: boolean
    created: Created41
    description: string
    shortDescription: string
    cover: Cover41
    following: boolean
    catchup: boolean
    status: number
    rentals: boolean
    topicId: number
}

export interface Created41 {
    seconds: string
    nanos: number
}

export interface Cover41 {
    originalUrl: string
    coverUrl: string
    thumbnailUrl: string
}

export interface N617d4b5e80f0305a269c14d9 {
    tags: string[]
    legacyId: string
    type: number
    title: string
    shortTitle: string
    originalTitle: string
    slug: string
    hidden: boolean
    created: Created42
    description: string
    shortDescription: string
    cover: Cover42
    following: boolean
    catchup: boolean
    status: number
    rentals: boolean
}

export interface Created42 {
    seconds: string
    nanos: number
}

export interface Cover42 {
    originalUrl: string
    coverUrl: string
    thumbnailUrl: string
}

export interface N62f41486a9f787ca5446a1e9 {
    tags: string[]
    legacyId: string
    type: number
    title: string
    shortTitle: string
    originalTitle: string
    slug: string
    hidden: boolean
    created: Created43
    description: string
    shortDescription: string
    cover: Cover43
    following: boolean
    catchup: boolean
    status: number
    rentals: boolean
    topicId: number
}

export interface Created43 {
    seconds: string
    nanos: number
}

export interface Cover43 {
    originalUrl: string
    coverUrl: string
    thumbnailUrl: string
}

export interface N62b490a3a67de7807a04cf1e {
    tags: string[]
    legacyId: string
    type: number
    title: string
    shortTitle: string
    originalTitle: string
    slug: string
    hidden: boolean
    created: Created44
    description: string
    shortDescription: string
    cover: Cover44
    following: boolean
    catchup: boolean
    status: number
    rentals: boolean
}

export interface Created44 {
    seconds: string
    nanos: number
}

export interface Cover44 {
    originalUrl: string
    coverUrl: string
    thumbnailUrl: string
}

export interface N62bc6a74e9613c820f80e2a6 {
    tags: string[]
    legacyId: string
    type: number
    title: string
    shortTitle: string
    originalTitle: string
    slug: string
    hidden: boolean
    created: Created45
    description: string
    shortDescription: string
    cover: Cover45
    following: boolean
    catchup: boolean
    status: number
    rentals: boolean
    topicId: number
}

export interface Created45 {
    seconds: string
    nanos: number
}

export interface Cover45 {
    originalUrl: string
    coverUrl: string
    thumbnailUrl: string
}

export interface N62ef7299b5690b8c540157c6 {
    tags: string[]
    legacyId: string
    type: number
    title: string
    shortTitle: string
    originalTitle: string
    slug: string
    hidden: boolean
    created: Created46
    description: string
    shortDescription: string
    cover: Cover46
    following: boolean
    catchup: boolean
    status: number
    rentals: boolean
    topicId: number
}

export interface Created46 {
    seconds: string
    nanos: number
}

export interface Cover46 {
    originalUrl: string
    coverUrl: string
    thumbnailUrl: string
}

export interface N62d596ecd0a949bb54a02e27 {
    tags: string[]
    legacyId: string
    type: number
    title: string
    shortTitle: string
    originalTitle: string
    slug: string
    hidden: boolean
    created: Created47
    description: string
    shortDescription: string
    cover: Cover47
    following: boolean
    catchup: boolean
    status: number
    rentals: boolean
}

export interface Created47 {
    seconds: string
    nanos: number
}

export interface Cover47 {
    originalUrl: string
    coverUrl: string
    thumbnailUrl: string
}

export interface N628e8a0b3e902a0f7bc68898 {
    tags: string[]
    legacyId: string
    type: number
    title: string
    shortTitle: string
    originalTitle: string
    slug: string
    hidden: boolean
    created: Created48
    description: string
    shortDescription: string
    cover: Cover48
    following: boolean
    catchup: boolean
    status: number
    rentals: boolean
}

export interface Created48 {
    seconds: string
    nanos: number
}

export interface Cover48 {
    originalUrl: string
    coverUrl: string
    thumbnailUrl: string
}

export interface N62962ca2c19fc449447e52d4 {
    tags: string[]
    legacyId: string
    type: number
    title: string
    shortTitle: string
    originalTitle: string
    slug: string
    hidden: boolean
    created: Created49
    description: string
    shortDescription: string
    cover: Cover49
    following: boolean
    catchup: boolean
    status: number
    rentals: boolean
}

export interface Created49 {
    seconds: string
    nanos: number
}

export interface Cover49 {
    originalUrl: string
    coverUrl: string
    thumbnailUrl: string
}

export interface N62890e66c19fc449447e51ca {
    tags: string[]
    legacyId: string
    type: number
    title: string
    shortTitle: string
    originalTitle: string
    slug: string
    hidden: boolean
    created: Created50
    description: string
    shortDescription: string
    cover: Cover50
    following: boolean
    catchup: boolean
    status: number
    rentals: boolean
    topicId: number
}

export interface Created50 {
    seconds: string
    nanos: number
}

export interface Cover50 {
    originalUrl: string
    coverUrl: string
    thumbnailUrl: string
}

export interface N62bca3b1c19fc449447e5554 {
    tags: string[]
    legacyId: string
    type: number
    title: string
    shortTitle: string
    originalTitle: string
    slug: string
    hidden: boolean
    created: Created51
    description: string
    shortDescription: string
    cover: Cover51
    following: boolean
    catchup: boolean
    status: number
    rentals: boolean
    topicId: number
}

export interface Created51 {
    seconds: string
    nanos: number
}

export interface Cover51 {
    originalUrl: string
    coverUrl: string
    thumbnailUrl: string
}

export interface TitlesCatchup {
    id: string
    created: string
    type: string
    label: string
    name: string
    nameShort: string
    nameOriginal: string
    slug: string
    credits: Credits3
    tags: string[]
    description: string
    descriptionShort: string
    complete: boolean
    status: string
    physicalState: string
    forumLink: string
    thumbnail: string
    banner: string
    catchup: boolean
    releasedVolumes: number
    bookwalkerSeriesId: number
    public: boolean
    followed: any
}

export interface Credits3 {
    author: string
    illustrator?: string
    artist?: string
    translator: string
    editor: string
    letterer?: string
}

export interface Fallback {
    headerBlog: HeaderBlog
}

export interface HeaderBlog {
    success: boolean
    data: Daum[]
}

export interface Daum {
    id: string
    uuid: string
    title: string
    slug: string
    html: string
    comment_id: string
    feature_image: string
    featured: boolean
    visibility: string
    created_at: string
    updated_at: string
    published_at: string
    custom_excerpt: string
    codeinjection_head: any
    codeinjection_foot: any
    custom_template: any
    canonical_url: any
    email_recipient_filter: string
    url: string
    excerpt: string
    reading_time: number
    access: boolean
    og_image: any
    og_title: any
    og_description: any
    twitter_image: any
    twitter_title: any
    twitter_description: any
    meta_title: any
    meta_description: any
    email_subject: any
    frontmatter: any
    feature_image_alt: any
    feature_image_caption: any
}

export interface Query { }
