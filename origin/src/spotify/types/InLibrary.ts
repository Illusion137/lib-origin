export interface InLibrary {
    data: Data
    extensions: Extensions
}

interface Data {
    tracks: Track[]
}

interface Track {
    __typename: string
    saved: boolean
}

interface Extensions { }
