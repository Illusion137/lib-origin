export interface AssetLoader {
    get_asset: (name: string) => Promise<any>
}
