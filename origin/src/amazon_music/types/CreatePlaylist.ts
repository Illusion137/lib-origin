export interface CreatePlaylist {
    methods: Method[]
}

export interface Method {
    interface: string
    url?: string
    clientInformation?: string[]
    before?: any[]
    after?: any[]
    onSuccess?: any[]
    onError?: OnError[]
    queue: Queue2
    forced: boolean
    template?: Template
    screenMode?: string
}

export interface OnError {
    interface: string
    key: string
    after: any[]
    onNoMethodsStored: any[]
    queue: Queue
    forced: boolean
}

export interface Queue {
    interface: string
    id: string
}

export interface Queue2 {
    interface: string
    id: string
}

export interface Template {
    interface: string
    widgets: any[]
    templateData: TemplateData
    onEndOfWidgetsReached: any[]
    onCreated: OnCreated[]
    onBound: any[]
    onViewed: OnViewed[]
    onInteraction: any[]
    onLeave: any[]
    launchMode: string
    cacheSeconds: number
    isEnumerated: boolean
}

export interface TemplateData {
    interface: string
    deeplink: string
    title: string
    description: string
    keywords: string
}

export interface OnCreated {
    interface: string
    url?: string
    clientInformation?: any[]
    before?: any[]
    after?: any[]
    onSuccess?: any[]
    onError?: OnError2[]
    queue: Queue4
    forced: boolean
    group?: string
}

export interface OnError2 {
    interface: string
    key: string
    after: any[]
    onNoMethodsStored: any[]
    queue: Queue3
    forced: boolean
}

export interface Queue3 {
    interface: string
    id: string
}

export interface Queue4 {
    interface: string
    id: string
}

export interface OnViewed {
    interface: string
    url: string
    clientInformation: string[]
    before: any[]
    after: any[]
    onSuccess: any[]
    onError: any[]
    queue: Queue5
    forced: boolean
}

export interface Queue5 {
    interface: string
    id: string
}