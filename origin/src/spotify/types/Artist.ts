export type Artist = {
    data: {
        artistUnion: {
            __typename: string
            discography: {
                albums: {
                    items: Array<{
                        releases: {
                            items: Array<{
                                copyright: {
                                    items: Array<{
                                        text: string
                                        type: string
                                    }>
                                }
                                coverArt: {
                                    sources: Array<{
                                        height: number
                                        url: string
                                        width: number
                                    }>
                                }
                                date: {
                                    day: number
                                    month: number
                                    precision: string
                                    year: number
                                }
                                id: string
                                label: string
                                name: string
                                playability: {
                                    playable: boolean
                                    reason: string
                                }
                                sharingInfo: {
                                    shareId: string
                                    shareUrl: string
                                }
                                tracks: {
                                    totalCount: number
                                }
                                type: string
                                uri: string
                            }>
                        }
                    }>
                    totalCount: number
                }
                compilations: {
                    items: Array<any>
                    totalCount: number
                }
                latest: {
                    copyright: {
                        items: Array<{
                            text: string
                            type: string
                        }>
                    }
                    coverArt: {
                        sources: Array<{
                            height: number
                            url: string
                            width: number
                        }>
                    }
                    date: {
                        day: number
                        month: number
                        precision: string
                        year: number
                    }
                    id: string
                    label: string
                    name: string
                    playability: {
                        playable: boolean
                        reason: string
                    }
                    sharingInfo: {
                        shareId: string
                        shareUrl: string
                    }
                    tracks: {
                        totalCount: number
                    }
                    type: string
                    uri: string
                }
                popularReleasesAlbums: {
                    items: Array<{
                        copyright: {
                            items: Array<{
                                text: string
                                type: string
                            }>
                        }
                        coverArt: {
                            sources: Array<{
                                height: number
                                url: string
                                width: number
                            }>
                        }
                        date: {
                            day: number
                            month: number
                            precision: string
                            year: number
                        }
                        id: string
                        label: string
                        name: string
                        playability: {
                            playable: boolean
                            reason: string
                        }
                        sharingInfo: {
                            shareId: string
                            shareUrl: string
                        }
                        tracks: {
                            totalCount: number
                        }
                        type: string
                        uri: string
                    }>
                    totalCount: number
                }
                singles: {
                    items: Array<{
                        releases: {
                            items: Array<{
                                copyright: {
                                    items: Array<{
                                        text: string
                                        type: string
                                    }>
                                }
                                coverArt: {
                                    sources: Array<{
                                        height: number
                                        url: string
                                        width: number
                                    }>
                                }
                                date: {
                                    day: number
                                    month: number
                                    precision: string
                                    year: number
                                }
                                id: string
                                label: string
                                name: string
                                playability: {
                                    playable: boolean
                                    reason: string
                                }
                                sharingInfo: {
                                    shareId: string
                                    shareUrl: string
                                }
                                tracks: {
                                    totalCount: number
                                }
                                type: string
                                uri: string
                            }>
                        }
                    }>
                    totalCount: number
                }
                topTracks: {
                    items: Array<{
                        track: {
                            albumOfTrack: {
                                coverArt: {
                                    sources: Array<{
                                        url: string
                                    }>
                                }
                                uri: string
                            }
                            artists: {
                                items: Array<{
                                    profile: {
                                        name: string
                                    }
                                    uri: string
                                }>
                            }
                            associations: {
                                associatedVideos: {
                                    totalCount: number
                                }
                            }
                            contentRating: {
                                label: string
                            }
                            discNumber: number
                            duration: {
                                totalMilliseconds: number
                            }
                            id: string
                            name: string
                            playability: {
                                playable: boolean
                                reason: string
                            }
                            playcount: string
                            uri: string
                        }
                        uid: string
                    }>
                }
            }
            goods: {
                events: {
                    concerts: {
                        items: Array<any>
                        pagingInfo: {
                            limit: number
                        }
                        totalCount: number
                    }
                    userLocation: {
                        name: string
                    }
                }
                merch: {
                    items: Array<any>
                }
            }
            id: string
            preRelease: any
            profile: {
                biography: {
                    text: string
                    type: string
                }
                externalLinks: {
                    items: Array<{
                        name: string
                        url: string
                    }>
                }
                name: string
                pinnedItem: {
                    backgroundImage: {
                        sources: Array<{
                            url: string
                        }>
                    }
                    comment: string
                    itemV2: {
                        __typename: string
                        data: {
                            __typename: string
                            coverArt: {
                                sources: Array<{
                                    height: number
                                    url: string
                                    width: number
                                }>
                            }
                            name: string
                            type: string
                            uri: string
                        }
                    }
                    type: string
                }
                playlistsV2: {
                    items: Array<{
                        data: {
                            __typename: string
                            description: string
                            images: {
                                items: Array<{
                                    sources: Array<{
                                        height?: number
                                        url: string
                                        width?: number
                                    }>
                                }>
                            }
                            name: string
                            ownerV2: {
                                data: {
                                    __typename: string
                                    name: string
                                }
                            }
                            uri: string
                        }
                    }>
                    totalCount: number
                }
                verified: boolean
            }
            relatedContent: {
                appearsOn: {
                    items: Array<{
                        releases: {
                            items: Array<{
                                artists: {
                                    items: Array<{
                                        profile: {
                                            name: string
                                        }
                                        uri: string
                                    }>
                                }
                                coverArt: {
                                    sources: Array<{
                                        height: number
                                        url: string
                                        width: number
                                    }>
                                }
                                date: {
                                    year: number
                                }
                                id: string
                                name: string
                                sharingInfo: {
                                    shareId: string
                                    shareUrl: string
                                }
                                type: string
                                uri: string
                            }>
                            totalCount: number
                        }
                    }>
                    totalCount: number
                }
                discoveredOnV2: {
                    items: Array<{
                        data: {
                            __typename: string
                            description: string
                            id: string
                            images: {
                                items: Array<{
                                    sources: Array<{
                                        height?: number
                                        url: string
                                        width?: number
                                    }>
                                }>
                                totalCount: number
                            }
                            name: string
                            ownerV2: {
                                data: {
                                    __typename: string
                                    name: string
                                }
                            }
                            uri: string
                        }
                    }>
                    totalCount: number
                }
                featuringV2: {
                    items: Array<{
                        data: {
                            __typename: string
                            description: string
                            id: string
                            images: {
                                items: Array<{
                                    sources: Array<{
                                        height: any
                                        url: string
                                        width: any
                                    }>
                                }>
                                totalCount: number
                            }
                            name: string
                            ownerV2: {
                                data: {
                                    __typename: string
                                    name: string
                                }
                            }
                            uri: string
                        }
                    }>
                    totalCount: number
                }
                relatedArtists: {
                    items: Array<{
                        id: string
                        profile: {
                            name: string
                        }
                        uri: string
                        visuals: {
                            avatarImage: {
                                sources: Array<{
                                    height: number
                                    url: string
                                    width: number
                                }>
                            }
                        }
                    }>
                    totalCount: number
                }
            }
            relatedVideos: {
                __typename: string
                items: Array<any>
                totalCount: number
            }
            saved: boolean
            sharingInfo: {
                shareId: string
                shareUrl: string
            }
            stats: {
                followers: number
                monthlyListeners: number
                topCities: {
                    items: Array<{
                        city: string
                        country: string
                        numberOfListeners: number
                        region: string
                    }>
                }
                worldRank: number
            }
            uri: string
            visuals: {
                avatarImage: {
                    extractedColors: {
                        colorRaw: {
                            hex: string
                        }
                    }
                    sources: Array<{
                        height: number
                        url: string
                        width: number
                    }>
                }
                gallery: {
                    items: Array<{
                        sources: Array<{
                            height: number
                            url: string
                            width: number
                        }>
                    }>
                }
                headerImage: {
                    extractedColors: {
                        colorRaw: {
                            hex: string
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
    }
    extensions: {}
}