import { asset_loader } from "@native/asset_loader/asset_loader";

export namespace IllusiIcons {
    export let illusi_icon = 0;
    export let illusi_dark_icon = 0;
    export let imported_thumbnail = 0;
    export let icon_map: unknown[] = [];
    export async function load_illusi_icons(){
        if(icon_map.length !== 0) return;
        illusi_icon = await asset_loader().get_asset("./assets/illusi_icon.png");
        illusi_dark_icon = await asset_loader().get_asset("./assets/illusi_dark_icon.png");
        imported_thumbnail = await asset_loader().get_asset("./assets/imported_thumbnail.png");
        icon_map = [
            illusi_icon,
            illusi_dark_icon,
            imported_thumbnail
        ];
    }
}