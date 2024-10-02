export interface AmznMusic {
    appConfig: AppConfig
    ssr: boolean
    isInContainerApp: boolean
}

interface AppConfig {
    accessToken: string
    accessTokenExpiresIn: string
    customerId: string
    deviceType: string
    deviceId: string
    displayLanguage: string
    faviconUrl: string
    features: Features
    marketplaceId: string
    musicTerritory: string
    siteRegion: string
    version: string
    sessionId: string
    ipAddress: string
    csrf: Csrf
    metricsContext: MetricsContext
    isStarlightEnabled: boolean
    weblabV2Enabled: boolean
    isRetailLOPEnabled: boolean
    isRetailCOPEnabled: boolean
    isClientMetricsLambdaEnabled: boolean
    isCloudWatchRumEnabled: boolean
    isStarlightBauhausUIEnabled: boolean
    isRedhoodPlusEnabled: boolean
    isRedhoodPlusMetricsEnabled: boolean
    isRedhoodSonicRushEnabled: boolean
    isAnonymousFreeTierDialogEnabled: boolean
    isAccentOutlineUpsellBadgeEnabled: boolean
    isUhdEnabled: boolean
    isRedhoodLocalStorageEnabled: boolean
    isAndroidMShopBottomTabsAutoHideEnabled: boolean
}

interface Features {
    isDogmatixIntegrationEnabled: boolean
    isRnEdpWebEnabled: boolean
    isRnAtcWebEnabled: boolean
    isRnLiveHubWebEnabled: boolean
    isRnAdpWebEnabled: boolean
    isRnFlpWebEnabled: boolean
    isRnMdpWebEnabled: boolean
    isRnGemaWebEnabled: boolean
    isRnNewWebEnabled: boolean
    isRnChartsWebEnabled: boolean
    isRWPRnAdpWebEnabled: boolean
    isRWPRnMShopEnabled: boolean
    isRnFanpollWebEnabled: boolean
    isRnBrowseHomeWebEnabled: boolean
}

interface Csrf {
    token: string
    ts: string
    rnd: string
}

interface MetricsContext {
    encodedAffiliateTags: string
    referer: string
    refMarker: string
}
