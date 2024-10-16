import { ResponseError } from "../../utils/types";
import { Track } from "./types";

export type PlaylistResponse = PlaylistResponseSuccessParsed | ResponseError;
export type PlaylistSuccessData = { title: string, data: Track[] };
export interface PlaylistResponseSuccessParsed {
    success: {
        code: string,
        data: PlaylistSuccessData,
        hash: string,
        title: string
    }
}
export interface PlaylistResponseSuccess {
    success: {
        code: string,
        data: string,
        hash: string,
        title: string
    }
}