export interface Library {
    data: {
        me: {
            libraryV3: {
                __typename: string
                availableFilters: {
                    id: string
                    name: string
                }[]
                availableSortOrders: {
                    id: string
                    name: string
                }[]
                breadcrumbs: any[]
                items: {
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
                                items: {
                                    profile: {
                                        name: string
                                    }
                                    uri: string
                                }[]
                            }
                            coverArt?: {
                                extractedColors: {
                                    colorDark: {
                                        hex: string
                                        isFallback: boolean
                                    }
                                }
                                sources: {
                                    height: number
                                    url: string
                                    width: number
                                }[]
                            }
                            date?: {
                                isoString: string
                                precision: string
                            }
                            name?: string
                            uri: string
                            attributes?: any[]
                            currentUserCapabilities?: {
                                canEditItems: boolean
                            }
                            description?: string
                            images?: {
                                items: {
                                    extractedColors: {
                                        colorDark: {
                                            hex: string
                                            isFallback: boolean
                                        }
                                    }
                                    sources: {
                                        height: number
                                        url: string
                                        width: number
                                    }[]
                                }[]
                            }
                            ownerV2?: {
                                data: {
                                    __typename: string
                                    avatar?: {
                                        sources: {
                                            height: number
                                            url: string
                                            width: number
                                        }[]
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
                                    sources: {
                                        height: number
                                        url: string
                                        width: number
                                    }[]
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
                                sources: {
                                    height: number
                                    url: string
                                    width: number
                                }[]
                            }
                        }
                    }
                    pinnable: boolean
                    pinned: boolean
                    playedAt?: {
                        isoString: string
                    }
                }[]
                pagingInfo: {
                    limit: number
                    offset: number
                }
                selectedFilters: any[]
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