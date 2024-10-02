export interface OptionNav {
    icon: string
    title: ExtraSubscreens
}
export interface OptionPress {
    icon: string
    title: string
    confirm: boolean
    on_press: () => Promise<void>
}
export interface OptionNumber {
    icon: string
    title: string
    callback: (value: number) => Promise<void>
}
export interface OptionBoolean {
    icon: string
    title: string
    callback: (value: boolean) => Promise<void>
}
export interface OptionSlideBox {
    icon: string
    title: string
    options: string[]
    callback: (value: string) => Promise<void>
}