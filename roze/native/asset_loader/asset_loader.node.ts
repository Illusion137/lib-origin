import path from "path";
import type { AssetLoader } from "./asset_loader.base";

export const node_asset_loader: AssetLoader = {
    get_asset: async(name: string) => {
        return path.join("src/", name).replaceAll('\\', '/');
    }
};
