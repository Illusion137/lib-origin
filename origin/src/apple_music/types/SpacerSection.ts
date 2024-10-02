export interface SpacerSection {
    id: `spacerSection - footer - ${string}`
    itemKind: "spacer"
    presentation: Presentation
    backgroundTreatment: string
    items: Item[]
}

export interface Presentation {
    kind: string
}

export interface Item {
    id: string
}
