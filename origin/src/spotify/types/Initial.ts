export interface AppServerConfig {
    appName: string
    market: string
    locale: Locale
    userCountry: string
    isPremium: boolean
    correlationId: string
    isAnonymous: boolean
    gtmId: string
    optimizeId: string
    pipResources: PipResources
    retargetingPixels: RetargetingPixels
    recaptchaWebPlayerFraudSiteKey: string
    serverTime: number
}

export interface Locale {
    locale: string
    rtl: boolean
    textDirection: string
}

export interface PipResources {
    scripts: string[]
    styles: string[]
}

export interface RetargetingPixels {
    twitter: string
    pinterest: string
    snapchat: string
}

export interface FeatureFlags {
    enableShows: boolean
    isTracingEnabled: boolean
    upgradeButton: string
    mwp: boolean
    isMWPErrorCodeEnabled: boolean
    isMwpRadioEntity: boolean
    isMWPAndPlaybackCapable: boolean
    preauthRecaptcha: boolean
    isEqualizerABEnabled: boolean
    isPodcastEnabled: boolean
    isI18nAdditionalPagesEnabled: boolean
    isInteractionLoggerEnabled: boolean
    isReinventFreeEnabled: boolean
    isEntityReportEnabled: boolean
    isAlbumReportEnabled: boolean
    isTrackReportEnabled: boolean
    isPodcastShowReportEnabled: boolean
    isPodcastEpisodeReportEnabled: boolean
}

export interface RemoteConfig {
    "#v": string
    ugoTestPremiumAdsUpsell: boolean
    enableSubtitlesUsingHarmony: boolean
    enableFullscreenMode: boolean
    enableI18nRoutes: string
    enableNpvAboutPodcast: boolean
    canYourDJUserUseDesktopApp: boolean
    enableNpvCreditsImpressions: boolean
    enableLyricsUpsell: boolean
    enableConcertPageGenres: boolean
    enableAdaptiveTitleEntities: boolean
    enableUserCommentsForEpisodes: boolean
    enableConcertDistanceRadius: boolean
    enableNewMarquee: boolean
    enableProgressBarEasterEggs: boolean
    enableImprovedCinemaModeCanvas: boolean
    enableImprovedCinemaMode: boolean
    enablePrefetching: boolean
    enableUserFraudVerification: boolean
    enableUriLinks: boolean
    enableBlendInvitation: string
    enableUserFraudSignals: boolean
    enableNewTicketingSection: boolean
    enableConcertsInterested: boolean
    enablePremiumPage: boolean
    enableStaticImage2Optimizer: boolean
    enableConcertsTicketPrice: boolean
    enableMandalorianEasterEgg: string
    enableViewMode: boolean
    enablePodcastSpeedControlEndpoint: string
    enableCanvasNpv: string
    enableVenuePages: boolean
    enableShowRating: boolean
    enableHomeImpressions: boolean
    enableSearchImpressions: boolean
    feedBaselineAudioWaveMode: string
    enableHomeSubfeedFeedBaseline: boolean
    enableHybridHomeFeedBaseline: boolean
    enableInteractionLogger: boolean
    enablePersonalizedShare: boolean
    enableConcertsNearYou: boolean
    enableSpotlight: boolean
    enableAudiobookCardPlayButton: boolean
    enableCreateButton: string
    enableHomeCarousels: boolean
    enableYLXPrereleaseAlbums: boolean
    enableEventsInYourLibrary: boolean
    "#configurationAssignmentId": string
    "#groupIds": GroupIds
    "#fetchTimeMillis": number
    "#contextHash": string
}

export interface GroupIds {
    enableConcertsNotInterested: number
    ugoTestPremiumAdsUpsell: number
    enableSubtitlesUsingHarmony: number
    enableFullscreenMode: number
    enableI18nRoutes: number
    enableNpvAboutPodcast: number
    canYourDJUserUseDesktopApp: number
    enableNpvCreditsImpressions: number
    enableLyricsUpsell: number
    enableConcertPageGenres: number
    enableAdaptiveTitleEntities: number
    enableUserCommentsForEpisodes: number
    enableConcertsReportIssue: number
    enableConcertDistanceRadius: number
    enableNewMarquee: number
    enableProgressBarEasterEggs: number
    enableAlignedPanelHeaders: number
    enableLibraryGridDensityIteration: number
    enableImprovedCinemaModeCanvas: number
    enableAmbientModeTimer: number
    enableImprovedCinemaMode: number
    enablePrefetching: number
    enableUserFraudVerification: number
    enableUriLinks: number
    enableBlendInvitation: number
    enableUserFraudSignals: number
    enableNewTicketingSection: number
    enableConcertsInterested: number
    enablePremiumPage: number
    enableAudiobookAdExclusivity: number
    enableStaticImage2Optimizer: number
    enableConcertsTicketPrice: number
    enableSearchCategoryResultsCaching: number
    enableMandalorianEasterEgg: number
    enableReadAlongTranscripts: number
    enableViewMode: number
    enablePodcastSpeedControlEndpoint: number
    enableCanvasNpv: number
    enableVenuePages: number
    enableShowRating: number
    enableHomeImpressions: number
    enableSearchImpressions: number
    feedBaselineAudioWaveMode: number
    enableHomeSubfeedFeedBaseline: number
    enableHybridHomeFeedBaseline: number
    enableInteractionLogger: number
    enablePersonalizedShare: number
    enableReactQueryPersistence: number
    enableConcertsNearYou: number
    enableSpotlight: number
    enableAudiobookCardPlayButton: number
    enableCreateButton: number
    enableHomeCarousels: number
    enableYLXPrereleaseAlbums: number
    enableEventsInYourLibrary: number
}
