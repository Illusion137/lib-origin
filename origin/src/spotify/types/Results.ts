export interface SpotifyImageSource {
    url: string;
    width?: number;
    height?: number;
    maxWidth?: number;
    maxHeight?: number;
    imageFormat?: string;
}

export interface ExtractedColor {
    hex: string;
    isFallback: boolean;
}

export interface ProfileAttributes {
    data: {
        me: {
            profile: {
                accountId: string;
                avatar: string | null;
                avatarBackgroundColor: number | null;
                name: string;
                socialHandle: string | null;
                uri: string;
                username: string;
            };
        };
    };
}

export interface AccountAttributes {
    data: {
        me: {
            account: {
                attributes: {
                    ads: boolean;
                    catalogue: string;
                    estimatedAge: number | null;
                    filterExplicitContent: boolean;
                    onDemand: boolean;
                    [attribute: string]: string | number | boolean | null;
                };
                country: string;
                features: Record<string, string>;
                product: string;
            };
        };
    };
}

export interface ExtractedColors {
    data: {
        extractedColors: {
            __typename: "ExtractedColors";
            colorDark: ExtractedColor;
            colorLight: ExtractedColor;
            colorRaw: ExtractedColor;
        }[];
    };
}

export interface ChildEntities {
    data: {
        lookupEntities: {
            __typename: string;
            uri: string;
            visualIdentityTrait: {
                __typename: string;
                squareCoverImage: {
                    image: { data: { __typename: string; sources: SpotifyImageSource[] } };
                    originalInstances: { flatFile: { cdnUrl: string }; size: string }[];
                };
            } | null;
        }[];
    };
}

export interface CuratedStatus {
    data: {
        lookup: {
            __typename: string;
            data: { __typename: string; isCurated: boolean };
        }[];
    };
}

export interface RecentlyPlayed {
    data: {
        lookup: {
            __typename: string;
            _uri: string;
            data: {
                __typename: string;
                uri: string;
                name: string;
                artists?: { items: { uri: string; profile: { name: string } }[] };
                coverArt?: { sources: SpotifyImageSource[] };
            };
        }[];
    };
}

export interface FeedBaseline {
    data: {
        lookup: {
            __typename: string;
            _uri: string;
            data: {
                __typename: string;
                previewItems?: { items: unknown[] };
            };
        }[];
    };
}

export interface NotFound {
    __typename: "NotFound";
    message: string;
}

export interface PlaylistMetadata {
    data: {
        playlistV2: NotFound | ({ __typename: string } & Record<string, unknown>);
    };
}
