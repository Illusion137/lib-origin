export interface LyricsPreloadedState {
    config: Config
    deviceType: string
    session: Session
    currentPage: string
    songPage: SongPage
    entities: Entities
}

export interface Config { }

export interface Session {
    cmpEnabled: boolean
    showAds: boolean
    logClientMetrics: boolean
    fringeEnabled: boolean
    features: string[]
}

export interface SongPage {
    reactHeaderVariant: string
    longTailCacheExperiment: any
    song: number
    pinnedQuestions: any[]
    metadataQuestions: string[]
    lyricsData: LyricsData
    hotSongsPreview: HotSongsPreview[]
    defaultQuestions: any[]
    unansweredDefaultQuestions: string[]
    showFeaturedQuestion: boolean
    pendingQuestionCount: number
    dfpKv: DfpKv[]
    trackingData: TrackingDaum[]
    title: string
    path: string
    pageType: string
    initialAdUnits: string[]
    hotSongsLink: string
    headerBidPlacements: any[]
    controllerAndAction: string
    chartbeat: Chartbeat
    unreviewedTopAnnotations: UnreviewedTopAnnotations
}

export interface LyricsData {
    referents: number[]
    body: Body
    lyricsPlaceholderReason: any
    eligibleForIqByLyricsSize: boolean
    clientTimestamps: ClientTimestamps
}

export interface Body {
    html: string
    children: [Children, string]
    tag: string
}

export type Children = {
    children: (Children|string)[]
} | {children: (Children|string)[]; tag: string}

export interface ClientTimestamps {
    updatedByHumanAt: number
    lyricsUpdatedAt: number
}

export interface HotSongsPreview {
    url: string
    title: string
    id: number
}

export interface DfpKv {
    values: string[]
    name: string
}

export interface TrackingDaum {
    value: any
    key: string
}

export interface Chartbeat {
    title: string
    sections: string
    authors: string
}

export interface UnreviewedTopAnnotations { }

export interface Entities {
    artists: Artists
    users: Users
    annotations: Annotations
    referents: Referents
    songs: Songs
    questionAnswers: QuestionAnswers
}

export interface Artists {
    "1959093": N1959093
}

export interface N1959093 {
    url: string
    slug: string
    name: string
    isVerified: boolean
    isMemeVerified: boolean
    indexCharacter: string
    imageUrl: string
    id: number
    headerImageUrl: string
    apiPath: string
    type: string
}

export interface Users {
    "16005418": N16005418
}

export interface N16005418 {
    currentUserMetadata: CurrentUserMetadata
    url: string
    roleForDisplay: any
    name: string
    login: string
    isVerified: boolean
    isMemeVerified: boolean
    iq: number
    id: number
    humanReadableRoleForDisplay: any
    headerImageUrl: string
    avatar: Avatar
    apiPath: string
    aboutMeSummary: string
    type: string
}

export interface CurrentUserMetadata {
    interactions: Interactions
    excludedPermissions: string[]
    permissions: any[]
}

export interface Interactions {
    following: boolean
}

export interface Avatar {
    medium: Medium
    small: Small
    thumb: Thumb
    tiny: Tiny
}

export interface Medium {
    boundingBox: BoundingBox
    url: string
}

export interface BoundingBox {
    height: number
    width: number
}

export interface Small {
    boundingBox: BoundingBox2
    url: string
}

export interface BoundingBox2 {
    height: number
    width: number
}

export interface Thumb {
    boundingBox: BoundingBox3
    url: string
}

export interface BoundingBox3 {
    height: number
    width: number
}

export interface Tiny {
    boundingBox: BoundingBox4
    url: string
}

export interface BoundingBox4 {
    height: number
    width: number
}

export interface Annotations {
    "27510505": N27510505
}

export interface N27510505 {
    verifiedBy: any
    topComment: any
    rejectionComment: any
    createdBy: number
    cosignedBy: any[]
    authors: Author[]
    acceptedBy: any
    currentUserMetadata: CurrentUserMetadata2
    votesTotal: number
    verified: boolean
    url: string
    twitterShareMessage: string
    state: string
    source: any
    shareUrl: string
    referentId: number
    pyongsCount: any
    proposedEditCount: number
    pinned: boolean
    needsExegesis: boolean
    id: number
    hasVoters: boolean
    embedContent: string
    deleted: boolean
    customPreview: any
    createdAt: number
    community: boolean
    commentCount: number
    body: Body2
    beingCreated: boolean
    apiPath: string
    type: string
}

export interface Author {
    user: number
    pinnedRole: any
    attribution: number
    type: string
}

export interface CurrentUserMetadata2 {
    iqByAction: IqByAction
    interactions: Interactions2
    excludedPermissions: string[]
    permissions: any[]
}

export interface IqByAction { }

export interface Interactions2 {
    vote: any
    pyong: boolean
    cosign: boolean
}

export interface Body2 {
    markdown: string
    html: string
}

export interface Referents {
    "27510505": N275105052
    "27627294": N27627294
    "27627303": N27627303
    "27627310": N27627310
    "27627316": N27627316
    "27627349": N27627349
    "32677026": N32677026
    "32677032": N32677032
}

export interface N275105052 {
    annotations: number[]
    annotatable: Annotatable
    twitterShareMessage: string
    trackingPaths: TrackingPaths
    currentUserMetadata: CurrentUserMetadata3
    verifiedAnnotatorIds: any[]
    url: string
    songId: number
    range: Range
    path: string
    isImage: boolean
    isDescription: boolean
    iosAppUrl: string
    id: number
    fragment: string
    classification: string
    apiPath: string
    annotatorLogin: string
    annotatorId: number
    type: string
}

export interface Annotatable {
    url: string
    type: string
    title: string
    linkTitle: string
    imageUrl: string
    id: number
    context: string
    clientTimestamps: ClientTimestamps2
    apiPath: string
}

export interface ClientTimestamps2 {
    lyricsUpdatedAt: number
    updatedByHumanAt: number
}

export interface TrackingPaths {
    concurrent: string
    aggregate: string
}

export interface CurrentUserMetadata3 {
    relationships: Relationships
    excludedPermissions: string[]
    permissions: any[]
}

export interface Relationships { }

export interface Range {
    content: string
}

export interface N27627294 {
    fragmentId: string
    classification: string
    editorialState: string
    id: number
}

export interface N27627303 {
    fragmentId: string
    classification: string
    editorialState: string
    id: number
}

export interface N27627310 {
    fragmentId: string
    classification: string
    editorialState: string
    id: number
}

export interface N27627316 {
    fragmentId: string
    classification: string
    editorialState: string
    id: number
}

export interface N27627349 {
    fragmentId: string
    classification: string
    editorialState: string
    id: number
}

export interface N32677026 {
    fragmentId: string
    classification: string
    editorialState: string
    id: number
}

export interface N32677032 {
    fragmentId: string
    classification: string
    editorialState: string
    id: number
}

export interface Songs {
    "8708949": N8708949
}

export interface N8708949 {
    primaryArtists: number[]
    primaryArtist: PrimaryArtist
    featuredArtists: FeaturedArtist[]
    url: string
    updatedByHumanAt: number
    titleWithFeatured: string
    title: string
    stats: Stats
    songArtImageUrl: string
    songArtImageThumbnailUrl: string
    releaseDateWithAbbreviatedMonthForDisplay: string
    releaseDateForDisplay: string
    releaseDateComponents: ReleaseDateComponents
    relationshipsIndexUrl: string
    pyongsCount: any
    primaryArtistNames: string
    path: string
    lyricsUpdatedAt: number
    lyricsState: string
    lyricsOwnerId: number
    instrumental: boolean
    id: number
    headerImageUrl: string
    headerImageThumbnailUrl: string
    fullTitle: string
    artistNames: string
    apiPath: string
    annotationCount: number
    type: string
    writerArtists: WriterArtist[]
    verifiedLyricsBy: any[]
    verifiedContributors: any[]
    verifiedAnnotationsBy: any[]
    translationSongs: any[]
    topScholar: TopScholar
    tags: Tag[]
    songRelationships: SongRelationship[]
    producerArtists: ProducerArtist[]
    primaryTag: PrimaryTag
    nextSong: number
    media: Medum[]
    lyricsMarkedStaffApprovedBy: any
    lyricsMarkedCompleteBy: any
    descriptionAnnotation: number
    customPerformances: any[]
    albums: any[]
    album: any
    stubhubDeal: string
    songArtTextColor: string
    songArtSecondaryColor: string
    songArtPrimaryColor: string
    currentUserMetadata: CurrentUserMetadata5
    youtubeUrl: string
    youtubeStart: any
    vttpId: any
    viewableByRoles: any[]
    twitterShareMessageWithoutUrl: string
    twitterShareMessage: string
    transcriptionPriority: string
    trackingPaths: TrackingPaths2
    trackingData: TrackingDaum2[]
    spotifyUuid: any
    soundcloudUrl: string
    shareUrl: string
    releaseDate: string
    recordingLocation: any
    pusherChannel: string
    published: boolean
    pendingLyricsEditsCount: number
    nextSongSource: string
    metadataFieldsNa: MetadataFieldsNa
    lyricsVerified: boolean
    language: string
    isMusic: boolean
    hidden: boolean
    hasInstagramReelAnnotations: boolean
    featuredVideo: boolean
    facebookShareMessageWithoutUrl: string
    explicit: boolean
    embedContent: string
    descriptionPreview: string
    description: Description
    customSongArtImageUrl: string
    customHeaderImageUrl: any
    commentCount: number
    appleMusicPlayerUrl: string
    appleMusicId: string
}

export interface PrimaryArtist {
    url: string
    slug: string
    name: string
    isVerified: boolean
    isMemeVerified: boolean
    indexCharacter: string
    imageUrl: string
    id: number
    headerImageUrl: string
    apiPath: string
    type: string
}

export interface FeaturedArtist {
    iq: number
    url: string
    slug: string
    name: string
    isVerified: boolean
    isMemeVerified: boolean
    indexCharacter: string
    imageUrl: string
    id: number
    headerImageUrl: string
    apiPath: string
    type: string
}

export interface Stats {
    hot: boolean
    verifiedAnnotations: number
    unreviewedAnnotations: number
    transcribers: number
    iqEarners: number
    contributors: number
    acceptedAnnotations: number
}

export interface ReleaseDateComponents {
    day: number
    month: number
    year: number
}

export interface WriterArtist {
    url: string
    slug: string
    name: string
    isVerified: boolean
    isMemeVerified: boolean
    indexCharacter: string
    imageUrl: string
    id: number
    headerImageUrl: string
    apiPath: string
    type: string
    iq?: number
}

export interface TopScholar {
    user: User
    pinnedRole: any
    attributionValue: number
    type: string
}

export interface User {
    currentUserMetadata: CurrentUserMetadata4
    url: string
    roleForDisplay: string
    name: string
    login: string
    isVerified: boolean
    isMemeVerified: boolean
    iq: number
    id: number
    humanReadableRoleForDisplay: string
    headerImageUrl: string
    avatar: Avatar2
    apiPath: string
    aboutMeSummary: string
    type: string
}

export interface CurrentUserMetadata4 {
    interactions: Interactions3
    excludedPermissions: string[]
    permissions: any[]
}

export interface Interactions3 {
    following: boolean
}

export interface Avatar2 {
    medium: Medium2
    small: Small2
    thumb: Thumb2
    tiny: Tiny2
}

export interface Medium2 {
    boundingBox: BoundingBox5
    url: string
}

export interface BoundingBox5 {
    height: number
    width: number
}

export interface Small2 {
    boundingBox: BoundingBox6
    url: string
}

export interface BoundingBox6 {
    height: number
    width: number
}

export interface Thumb2 {
    boundingBox: BoundingBox7
    url: string
}

export interface BoundingBox7 {
    height: number
    width: number
}

export interface Tiny2 {
    boundingBox: BoundingBox8
    url: string
}

export interface BoundingBox8 {
    height: number
    width: number
}

export interface Tag {
    url: string
    primary: boolean
    name: string
    id: number
    type: string
}

export interface SongRelationship {
    songs: Song[]
    url?: string
    type: string
    relationshipType: string
}

export interface Song {
    primaryArtists: PrimaryArtist2[]
    primaryArtist: PrimaryArtist3
    featuredArtists: FeaturedArtist2[]
    url: string
    updatedByHumanAt: number
    titleWithFeatured: string
    title: string
    stats: Stats2
    songArtImageUrl: string
    songArtImageThumbnailUrl: string
    releaseDateWithAbbreviatedMonthForDisplay: string
    releaseDateForDisplay: string
    releaseDateComponents: ReleaseDateComponents2
    relationshipsIndexUrl: string
    pyongsCount: number
    primaryArtistNames: string
    path: string
    lyricsUpdatedAt: number
    lyricsState: string
    lyricsOwnerId: number
    instrumental: boolean
    id: number
    headerImageUrl: string
    headerImageThumbnailUrl: string
    fullTitle: string
    artistNames: string
    apiPath: string
    annotationCount: number
    type: string
}

export interface PrimaryArtist2 {
    url: string
    slug: string
    name: string
    isVerified: boolean
    isMemeVerified: boolean
    indexCharacter: string
    imageUrl: string
    id: number
    headerImageUrl: string
    apiPath: string
    type: string
}

export interface PrimaryArtist3 {
    url: string
    slug: string
    name: string
    isVerified: boolean
    isMemeVerified: boolean
    indexCharacter: string
    imageUrl: string
    id: number
    headerImageUrl: string
    apiPath: string
    type: string
}

export interface FeaturedArtist2 {
    url: string
    slug: string
    name: string
    isVerified: boolean
    isMemeVerified: boolean
    indexCharacter: string
    imageUrl: string
    id: number
    headerImageUrl: string
    apiPath: string
    type: string
}

export interface Stats2 {
    pageviews: number
    hot: boolean
    unreviewedAnnotations: number
}

export interface ReleaseDateComponents2 {
    day: number
    month: number
    year: number
}

export interface ProducerArtist {
    url: string
    slug: string
    name: string
    isVerified: boolean
    isMemeVerified: boolean
    indexCharacter: string
    imageUrl: string
    id: number
    headerImageUrl: string
    apiPath: string
    type: string
}

export interface PrimaryTag {
    url: string
    primary: boolean
    name: string
    id: number
    type: string
}

export interface Medum {
    url: string
    type: string
    provider: string
    attribution?: string
    start?: number
}

export interface CurrentUserMetadata5 {
    iqByAction: IqByAction2
    relationships: Relationships2
    interactions: Interactions4
    excludedPermissions: string[]
    permissions: string[]
}

export interface IqByAction2 { }

export interface Relationships2 { }

export interface Interactions4 {
    following: boolean
    pyong: boolean
}

export interface TrackingPaths2 {
    concurrent: string
    aggregate: string
}

export interface TrackingDaum2 {
    value: any
    key: string
}

export interface MetadataFieldsNa {
    songMeaning: boolean
    albums: boolean
}

export interface Description {
    markdown: string
    html: string
}

export interface QuestionAnswers {
    "producer:song:8708949": ProducerSong8708949
    "release-date:song:8708949": ReleaseDateSong8708949
    "writer:song:8708949": WriterSong8708949
}

export interface ProducerSong8708949 {
    question: string
    path: string
    id: string
    answer: string
    type: string
}

export interface ReleaseDateSong8708949 {
    question: string
    path: string
    id: string
    answer: string
    type: string
}

export interface WriterSong8708949 {
    question: string
    path: string
    id: string
    answer: string
    type: string
}
