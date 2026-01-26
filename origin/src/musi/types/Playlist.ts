import type { ResponseError } from "@common/types";
import type { Track } from "@origin/musi/types/types";

export type PlaylistResponse = PlaylistResponseSuccess | ResponseError;
export interface PlaylistSuccessData { title: string, data: Track[] }
export interface PlaylistResponseSuccessParsed {
    success: {
        code: string,
        data: PlaylistSuccessData,
        custom_image_url?: string
        hash: string,
        title: string
    }
}
export interface PlaylistResponseSuccess {
    success: {
        code: string,
        data: string,
        custom_image_url?: string
        hash: string,
        title: string
    }
}