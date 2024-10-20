export type InitialData = {
    trackingParams: string
    responseContext: object
};
export type InitialContinuationData = {
    responseContext: object
    estimatedResults: string
    trackingParams: string
    header: object
    topbar: object
    onResponseReceivedCommands: {
        clickTrackingParams: string
        appendContinuationItemsAction: {
            continuationItems: object[]
            targetId: string
        }
    }[]
}