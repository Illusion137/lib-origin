export interface ProfileData {
    data: Data
    extensions: Extensions
}

interface Data {
    me: Me
}

interface Me {
    account: Account
    profile: Profile
}

interface Account {
    attributes: Attributes
}

interface Attributes {
    dsaModeAvailable: boolean
    dsaModeEnabled: boolean
    optInTrialPremiumOnlyMarket: boolean
}

interface Profile {
    avatar: any
    avatarBackgroundColor: number
    name: string
    uri: string
    username: string
}

interface Extensions { }
