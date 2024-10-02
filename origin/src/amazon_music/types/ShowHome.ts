import { CreateAndBindMethod } from "./ShowHomeCreateAndBindMethod"
import { TemplateListInterfaceMethod } from "./ShowHomeTemplateList"

export interface ShowHome {
    methods: (
        VideoPlayerAuthMethod |
        StorageInterfacePersistenMethod |
        StorageInterfaceMethod |
        TemplateListInterfaceMethod |
        WebTemplateInterfaceMethod |
        CreateTemplateMethod |
        InvokeHttpSkillMethod |
        CreateAndBindMethod
    )[]
}
interface VideoPlayerAuthMethod {
    interface: "VideoPlayerAuthenticationInterface.v1_0.SetVideoPlayerTokenMethod"
    token: string
    header: string
    queue: Queue
    forced: boolean
}
interface StorageInterfacePersistenMethod {
    interface: "StorageInterface.Persistent.v1_0.WriteMethodsToStorageMethod"
    key: string
    serializedMethods: string
    queue: Queue
    forced: boolean
}
interface StorageInterfaceMethod {
    interface: "StorageInterface.v1_0.SetValueInGroupMethod"
    group: string
    key: string
    value: string
    queue: Queue
    forced: boolean
}
interface WebTemplateInterfaceMethod {
    interface: "Web.TemplatesInterface.v1_0.Touch.ChromeTemplateInterface.SetAppEventsMethod"
    onNetworkConnectivityLost: OnNetworkConnectivityLost[]
    onNetworkConnectivityRecovered: OnNetworkConnectivityRecovered[]
    queue: Queue
    forced: boolean
}
interface CreateTemplateMethod {
    interface: "TemplateListInterface.v1_0.CreateTemplateMethod"
    template: Template
    screenMode: string
    queue: Queue
    forced: boolean
}
interface InvokeHttpSkillMethod {
    interface: "InteractionInterface.v1_0.InvokeHttpSkillMethod"
    url: string
    clientInformation: any[]
    before: any[]
    after: any[]
    onSuccess: any[]
    onError: OnError[]
    queue: Queue
    forced: boolean
}

interface OnError {
    interface: string
    key: string
    after: any[]
    onNoMethodsStored: any[]
    queue: Queue
    forced: boolean
}
interface Template {
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
interface TemplateData {
    interface: string
    deeplink: string
    seoHead: SeoHead
    title: string
    description: string
    keywords: string
}
interface SeoHead {
    interface: string
    title: string
    meta: Meum[]
    link: Link[]
    script: any[]
}
interface Meum {
    interface: string
    name: string
    content: string
}
interface Link {
    interface: string
    rel: string
    href: string
}
interface OnCreated {
    interface: string
    url?: string
    clientInformation?: any[]
    before?: any[]
    after?: any[]
    onSuccess?: any[]
    onError?: OnError[]
    queue: Queue
    forced: boolean
    group?: string
}
interface OnError {
    interface: string
    key: string
    after: any[]
    onNoMethodsStored: any[]
    queue: Queue
    forced: boolean
}
interface OnViewed {
    interface: string
    url: string
    clientInformation: string[]
    before: any[]
    after: any[]
    onSuccess: any[]
    onError: any[]
    queue: Queue
    forced: boolean
}
interface OnNetworkConnectivityLost {
    interface: string
    notification: Notification
    queue: Queue
    forced: boolean
}
interface Notification {
    interface: string
    id: string
    message: Message
    timeoutSeconds: number
    onItemSelected: any[]
    onViewed: any[]
}
interface Message {
    interface: string
    text: string
}
interface OnNetworkConnectivityRecovered {
    interface: string
    id: string
    queue: Queue
    forced: boolean
}
interface Queue {
    interface: string
    id: string
}