export interface Credits {
    trackUri: string
    trackTitle: string
    roleCredits: RoleCredit[]
    extendedCredits: any[]
    sourceNames: string[]
}

interface RoleCredit {
    roleTitle: string
    artists: Artist[]
}

interface Artist {
    uri: string
    name: string
    imageUri: string
    subroles: string[]
    weight: number
}
