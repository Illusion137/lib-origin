import { SHA256, enc } from "crypto-js";
import { eq } from "drizzle-orm";
import type { PromiseResult } from "@common/types";
import { generror, generror_catch } from "@common/utils/error_util";
import { image_webp } from "@native/image_webp/image_webp";
import { fs } from "@native/fs/fs";
import { Illusi } from "@origin/illusi/illusi";
import { SQLfs } from "../../sql/sql_fs";
import { db } from "../database";
import { playlists_table } from "../schema";
import { supabase } from "../supabase";
import { ChangeTracker } from "./change_tracker";

export namespace PlaylistArtwork {
    export const ARTWORK_SIZE = 500;
    const WEBP_QUALITY = 90;

    function base64_to_array_buffer(base64: string): ArrayBuffer {
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        return bytes.buffer;
    }

    function is_duplicate_object_error(error: { message?: string; statusCode?: string | number }): boolean {
        const status = String(error.statusCode ?? "");
        return status === "409" || (error.message ?? "").toLowerCase().includes("already exists");
    }

    export async function upload_playlist_artwork(thumbnail_uri: string): PromiseResult<{ artwork_path: string }> {
        try {
            const source = thumbnail_uri.includes("https:") || thumbnail_uri.includes("http:")
                ? thumbnail_uri
                : SQLfs.custom_thumbnail_directory(thumbnail_uri);

            const webp = await image_webp().to_square_webp(source, ARTWORK_SIZE, WEBP_QUALITY);
            if ("error" in webp) return webp;

            const hash = SHA256(enc.Base64.parse(webp.base64)).toString(enc.Hex);
            const artwork_path = `${hash}.webp`;

            const { error } = await supabase().storage
                .from(Illusi.ARTWORK_BUCKET)
                .upload(artwork_path, base64_to_array_buffer(webp.base64), {
                    contentType: "image/webp",
                    // Content-addressed and insert-only: safe to cache forever.
                    cacheControl: "31536000",
                    upsert: false,
                });
            if (error && !is_duplicate_object_error(error)) {
                return generror(`Artwork upload failed: ${error.message}`, "MEDIUM", { thumbnail_uri, artwork_path });
            }

            const local_copy = await fs().write_file_as_string(
                SQLfs.custom_thumbnail_directory(artwork_path), webp.base64, { encoding: "base64" });
            if (typeof local_copy === "object" && local_copy !== null && "error" in local_copy) {
                console.warn("[PlaylistArtwork] failed to save local webp copy:", local_copy.error);
            }

            return { artwork_path };
        } catch (e) {
            return generror_catch(e, "upload_playlist_artwork failed", "MEDIUM", { thumbnail_uri });
        }
    }

    export async function download_playlist_artwork(artwork_path: string): PromiseResult<{ thumbnail_uri: string }> {
        try {
            const destination = SQLfs.custom_thumbnail_directory(artwork_path);
            const info = await fs().get_info(destination);
            if (info.exists && !info.is_directory) return { thumbnail_uri: artwork_path };

            const download = await fs().download_to_file(Illusi.artwork_public_url(artwork_path), destination);
            if (typeof download === "object" && download !== null && "error" in download) return download;
            return { thumbnail_uri: artwork_path };
        } catch (e) {
            return generror_catch(e, "download_playlist_artwork failed", "MEDIUM", { artwork_path });
        }
    }

    export async function adopt_artwork_from_url(playlist_uuid: string, url: string | undefined | null): Promise<void> {
        if (!url) return;
        const artwork_path = Illusi.artwork_path_from_url(url);
        if (artwork_path === null) return;

        const downloaded = await download_playlist_artwork(artwork_path);
        if ("error" in downloaded) {
            console.warn("[PlaylistArtwork] adopt_artwork_from_url failed:", downloaded.error);
            return;
        }
        await db.update(playlists_table)
            .set({ thumbnail_uri: downloaded.thumbnail_uri, artwork_path })
            .where(eq(playlists_table.uuid, playlist_uuid));
        await ChangeTracker.log_change("playlists", "update", playlist_uuid, undefined);
    }
}
