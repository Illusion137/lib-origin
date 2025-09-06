import type { AssetLoader } from "@native/asset_loader/asset_loader.base";

export const mobile_asset_loader: AssetLoader = {
	get_asset: async(name: string) => {
        return require(name);
    }
};
