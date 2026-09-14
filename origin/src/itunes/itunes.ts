import rozfetch from "@common/rozfetch";
import type { BaseOpts, PromiseResult } from "@common/types";
import { encode_params, google_query } from "@common/utils/fetch_util";
import type {
    ITunesEntity, ITunesLookupOpts, ITunesLookupResult, ITunesMedia, ITunesMediaEntityMap,
    ITunesResponse, ITunesResultOf, ITunesSearchOpts
} from "@origin/itunes/types";

export type {
    ITunesArtist, ITunesAudiobook, ITunesCollection, ITunesEbook, ITunesEntity, ITunesMedia,
    ITunesMovie, ITunesPodcast, ITunesResponse, ITunesResult, ITunesSoftware, ITunesTrack
} from "@origin/itunes/types";

export namespace ITunes {
    const BASE_URL = "https://itunes.apple.com";

    type Opts = BaseOpts;

    function clean_params(params: Record<string, any>): Record<string, any> {
        const clean: Record<string, any> = {};
        for (const key of Object.keys(params)) {
            const value = params[key];
            if (value === undefined || value === "") continue;
            clean[key] = Array.isArray(value) ? value.join(",") : value;
        }
        return clean;
    }

    async function api_get<T>(path: string, params: Record<string, any>, opts: Opts, query?: [string, string]): PromiseResult<T> {
        const response = await rozfetch<T>(`${BASE_URL}/${path}?${encode_params(clean_params(params), query)}`, {
            method: "GET",
            ...opts.fetch_opts
        });
        if ("error" in response) return response;
        return await response.json();
    }

    export async function search<M extends ITunesMedia = "all", E extends ITunesMediaEntityMap[M] = never>(
        opts: Opts & ITunesSearchOpts<M, E>
    ): PromiseResult<ITunesResponse<ITunesResultOf<M, E>>> {
        return api_get("search", {
            country: opts.country,
            media: opts.media,
            entity: opts.entity,
            attribute: opts.attribute,
            limit: opts.limit,
            lang: opts.lang,
            version: opts.version,
            explicit: opts.explicit
        }, opts, ["term", google_query(opts.term)]);
    }

    export async function lookup<E extends ITunesEntity = never>(
        opts: Opts & ITunesLookupOpts<E>
    ): PromiseResult<ITunesResponse<ITunesLookupResult<E>>> {
        return api_get("lookup", {
            id: opts.id,
            amgArtistId: opts.amgArtistId,
            amgAlbumId: opts.amgAlbumId,
            amgVideoId: opts.amgVideoId,
            upc: opts.upc,
            isbn: opts.isbn,
            bundleId: opts.bundleId,
            entity: opts.entity,
            limit: opts.limit,
            sort: opts.sort,
            country: opts.country
        }, opts);
    }
}
