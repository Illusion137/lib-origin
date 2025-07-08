import { Illusive } from "../../illusive";

export namespace IllusiIcons {
    export const illusi_icon: number = require(Illusive.illusi_icon);
    export const illusi_dark_icon: number = require(Illusive.illusi_dark_icon);
    export const imported_thumbnail: number = require(Illusive.imported_thumbnail);
    export const icon_map = {
        "./assets/illusi_icon.png": illusi_icon,
        "./assets/illusi_dark_icon.png": illusi_dark_icon,
        "./assets/imported_thumbnail.png": imported_thumbnail
    }
}