export interface YTError {
    error: Error
}

export interface Error {
    code: number
    message: string
    errors: Error2[]
    status: string
    details: Detail[]
}

export interface Error2 {
    message: string
    domain: string
    reason: string
    location: string
    locationType: string
}

export interface Detail {
    "@type": string
    reason: string
    domain: string
    metadata: Metadata
}

export interface Metadata {
    method: string
    service: string
}
