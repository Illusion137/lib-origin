export type Library = {
    data: {
        me: {
            libraryV3: {
                __typename: string
                availableFilters: Array<{
                    id: string
                    name: string
                }>
                availableSortOrders: Array<{
                    id: string
                    name: string
                }>
                breadcrumbs: Array<any>
                items: Array<{
                    addedAt: {
                        isoString: string
                    }
                    depth: number
                    item: {
                        __typename: string
                        _uri: string
                        data: {
                            __typename: string
                            artists?: {
                                items: Array<{
                                    profile: {
                                        name: string
                                    }
                                    uri: string
                                }>
                            }
                            coverArt?: {
                                extractedColors: {
                                    colorDark: {
                                        hex: string
                                        isFallback: boolean
                                    }
                                }
                                sources: Array<{
                                    height: number
                                    url: string
                                    width: number
                                }>
                            }
                            date?: {
                                isoString: string
                                precision: string
                            }
                            name?: string
                            uri: string
                            attributes?: Array<any>
                            currentUserCapabilities?: {
                                canEditItems: boolean
                            }
                            description?: string
                            images?: {
                                items: Array<{
                                    extractedColors: {
                                        colorDark: {
                                            hex: string
                                            isFallback: boolean
                                        }
                                    }
                                    sources: Array<{
                                        height: number
                                        url: string
                                        width: number
                                    }>
                                }>
                            }
                            ownerV2?: {
                                data: {
                                    __typename: string
                                    avatar?: {
                                        sources: Array<{
                                            height: number
                                            url: string
                                            width: number
                                        }>
                                    }
                                    id: string
                                    name: string
                                    uri: string
                                    username: string
                                }
                            }
                            revisionId?: string
                            profile?: {
                                name: string
                            }
                            visuals?: {
                                avatarImage: {
                                    extractedColors: {
                                        colorDark: {
                                            hex: string
                                            isFallback: boolean
                                        }
                                    }
                                    sources: Array<{
                                        height: number
                                        url: string
                                        width: number
                                    }>
                                }
                            }
                            count?: number
                            image?: {
                                extractedColors: {
                                    colorDark: {
                                        hex: string
                                        isFallback: boolean
                                    }
                                }
                                sources: Array<{
                                    height: number
                                    url: string
                                    width: number
                                }>
                            }
                        }
                    }
                    pinnable: boolean
                    pinned: boolean
                    playedAt?: {
                        isoString: string
                    }
                }>
                pagingInfo: {
                    limit: number
                    offset: number
                }
                selectedFilters: Array<any>
                selectedSortOrder: {
                    id: string
                    name: string
                }
                totalCount: number
            }
        }
    }
    extensions: {}
}