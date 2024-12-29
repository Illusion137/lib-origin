export interface Artist {
    data: {
        artistUnion: {
            __typename: string
            discography: {
                albums: {
                    items: {
                        releases: {
                            items: {
                                copyright: {
                                    items: {
                                        text: string
                                        type: string
                                    }[]
                                }
                                coverArt: {
                                    sources: {
                                        height: number
                                        url: string
                                        width: number
                                    }[]
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
                            }[]
                        }
                    }[]
                    totalCount: number
                }
                compilations: {
                    items: any[]
                    totalCount: number
                }
                latest: {
                    copyright: {
                        items: {
                            text: string
                            type: string
                        }[]
                    }
                    coverArt: {
                        sources: {
                            height: number
                            url: string
                            width: number
                        }[]
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
                    items: {
                        copyright: {
                            items: {
                                text: string
                                type: string
                            }[]
                        }
                        coverArt: {
                            sources: {
                                height: number
                                url: string
                                width: number
                            }[]
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
                    }[]
                    totalCount: number
                }
                singles: {
                    items: {
                        releases: {
                            items: {
                                copyright: {
                                    items: {
                                        text: string
                                        type: string
                                    }[]
                                }
                                coverArt: {
                                    sources: {
                                        height: number
                                        url: string
                                        width: number
                                    }[]
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
                            }[]
                        }
                    }[]
                    totalCount: number
                }
                topTracks: {
                    items: {
                        track: {
                            albumOfTrack: {
                                coverArt: {
                                    sources: {
                                        url: string
                                    }[]
                                }
                                uri: string
                            }
                            artists: {
                                items: {
                                    profile: {
                                        name: string
                                    }
                                    uri: string
                                }[]
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
                    }[]
                }
            }
            goods: {
                events: {
                    concerts: {
                        items: any[]
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
                    items: any[]
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
                    items: {
                        name: string
                        url: string
                    }[]
                }
                name: string
                pinnedItem: {
                    backgroundImage: {
                        sources: {
                            url: string
                        }[]
                    }
                    comment: string
                    itemV2: {
                        __typename: string
                        data: {
                            __typename: string
                            coverArt: {
                                sources: {
                                    height: number
                                    url: string
                                    width: number
                                }[]
                            }
                            name: string
                            type: string
                            uri: string
                        }
                    }
                    type: string
                }
                playlistsV2: {
                    items: {
                        data: {
                            __typename: string
                            description: string
                            images: {
                                items: {
                                    sources: {
                                        height?: number
                                        url: string
                                        width?: number
                                    }[]
                                }[]
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
                    }[]
                    totalCount: number
                }
                verified: boolean
            }
            relatedContent: {
                appearsOn: {
                    items: {
                        releases: {
                            items: {
                                artists: {
                                    items: {
                                        profile: {
                                            name: string
                                        }
                                        uri: string
                                    }[]
                                }
                                coverArt: {
                                    sources: {
                                        height: number
                                        url: string
                                        width: number
                                    }[]
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
                            }[]
                            totalCount: number
                        }
                    }[]
                    totalCount: number
                }
                discoveredOnV2: {
                    items: {
                        data: {
                            __typename: string
                            description: string
                            id: string
                            images: {
                                items: {
                                    sources: {
                                        height?: number
                                        url: string
                                        width?: number
                                    }[]
                                }[]
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
                    }[]
                    totalCount: number
                }
                featuringV2: {
                    items: {
                        data: {
                            __typename: string
                            description: string
                            id: string
                            images: {
                                items: {
                                    sources: {
                                        height: any
                                        url: string
                                        width: any
                                    }[]
                                }[]
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
                    }[]
                    totalCount: number
                }
                relatedArtists: {
                    items: {
                        id: string
                        profile: {
                            name: string
                        }
                        uri: string
                        visuals: {
                            avatarImage: {
                                sources: {
                                    height: number
                                    url: string
                                    width: number
                                }[]
                            }
                        }
                    }[]
                    totalCount: number
                }
            }
            relatedVideos: {
                __typename: string
                items: any[]
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
                    items: {
                        city: string
                        country: string
                        numberOfListeners: number
                        region: string
                    }[]
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
                    sources: {
                        height: number
                        url: string
                        width: number
                    }[]
                }
                gallery: {
                    items: {
                        sources: {
                            height: number
                            url: string
                            width: number
                        }[]
                    }[]
                }
                headerImage: {
                    extractedColors: {
                        colorRaw: {
                            hex: string
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
    }
    extensions: {}
}