export interface CreatePlaylist {
    responseContext: ResponseContext
    playlistId: string
    actions: Action[]
    trackingParams: string
}

export interface ResponseContext {
    serviceTrackingParams: ServiceTrackingParam[]
    consistencyTokenJar: ConsistencyTokenJar
    mainAppWebResponseContext: MainAppWebResponseContext
    webResponseContextExtensionData: WebResponseContextExtensionData
}

export interface ServiceTrackingParam {
    service: string
    params: Param[]
}

export interface Param {
    key: string
    value: string
}

export interface ConsistencyTokenJar {
    encryptedTokenJarContents: string
    expirationSeconds: string
}

export interface MainAppWebResponseContext {
    datasyncId: string
    loggedOut: boolean
    trackingParam: string
}

export interface WebResponseContextExtensionData {
    hasDecorated: boolean
}

export interface Action {
    clickTrackingParams: string
    addToGuideSectionAction?: AddToGuideSectionAction
    openPopupAction?: OpenPopupAction
    runAttestationCommand?: RunAttestationCommand
}

export interface AddToGuideSectionAction {
    handlerData: string
    items: Item[]
}

export interface Item {
    guideEntryRenderer: GuideEntryRenderer
}

export interface GuideEntryRenderer {
    navigationEndpoint: NavigationEndpoint
    icon: Icon
    trackingParams: string
    formattedTitle: FormattedTitle
    entryData: EntryData
}

export interface NavigationEndpoint {
    clickTrackingParams: string
    commandMetadata: CommandMetadata
    browseEndpoint: BrowseEndpoint
}

export interface CommandMetadata {
    webCommandMetadata: WebCommandMetadata
}

export interface WebCommandMetadata {
    url: string
    webPageType: string
    rootVe: number
    apiUrl: string
}

export interface BrowseEndpoint {
    browseId: string
}

export interface Icon {
    iconType: string
}

export interface FormattedTitle {
    simpleText: string
}

export interface EntryData {
    guideEntryData: GuideEntryData
}

export interface GuideEntryData {
    guideEntryId: string
}

export interface OpenPopupAction {
    popup: Popup
    popupType: string
}

export interface Popup {
    notificationActionRenderer: NotificationActionRenderer
}

export interface NotificationActionRenderer {
    responseText: ResponseText
    trackingParams: string
}

export interface ResponseText {
    runs: Run[]
}

export interface Run {
    text: string
}

export interface RunAttestationCommand {
    ids: Id[]
    engagementType: string
}

export interface Id {
    playlistId?: string
    externalChannelId?: string
}
