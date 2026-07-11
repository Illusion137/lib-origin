import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
// Aliased better-sqlite3@12 — the runtime ^9 dep has no binding for this node ABI.
import Database from "better-sqlite3-node25";

// The sql module graph pulls in react-native-only packages (Flow syntax node can't
// parse) — stub the service layer and native-only modules.
vi.mock("@illusive/illusive", () => ({ Illusive: { get_track_artwork: () => "artwork" } }));
vi.mock("expo-image-manipulator", () => ({ ImageManipulator: {}, SaveFormat: {} }));
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as fs from "fs";
import * as path from "path";
import { use_database } from "@illusive/db/database";
import { playlists_table, playlists_tracks_table, tracks_table } from "@illusive/db/schema";
import { load_native_sqlite } from "@native/sqlite/sqlite";
import type { DrizzleDB } from "@native/sqlite/sqlite.base";
import { GLOBALS } from "@illusive/globals";
import type { InheritedPlaylist, InheritedSearch, Track } from "@illusive/types";
import { SQLPlaylists } from "./sql_playlists";

const migrations_dir = path.resolve(__dirname, "../drizzle/mobile");

function fixture_track(uid: string): Track {
    return { uid, title: `title-${uid}`, duration: 60, artists: [], meta: { plays: 0 } } as unknown as Track;
}

let db: DrizzleDB;

beforeAll(async () => {
    await load_native_sqlite();
    const connection = new Database(":memory:");
    for (const file of fs.readdirSync(migrations_dir).filter(name => name.endsWith(".sql")).sort()) {
        connection.exec(fs.readFileSync(path.join(migrations_dir, file), "utf8"));
    }
    db = drizzle(connection) as unknown as DrizzleDB;
    use_database(db);
});

async function seed_playlist(uuid: string, track_uids: string[], inherited_playlists: InheritedPlaylist[] = [], inherited_searchs: InheritedSearch[] = []) {
    await db.insert(playlists_table).values({ uuid, title: uuid, inherited_playlists, inherited_searchs });
    for (const track_uid of track_uids) {
        await db.insert(playlists_tracks_table).values({ uuid, track_uid });
    }
}

function uids(tracks: Track[]): string[] {
    return tracks.map(track => track.uid);
}

beforeEach(async () => {
    await db.delete(playlists_table);
    await db.delete(playlists_tracks_table);
    await db.delete(tracks_table);
    SQLPlaylists.invalidate_playlist_tracks_cache();
    // Library of 6 tracks the store hydrates playlist rows from.
    GLOBALS.global_var.sql_tracks = ["t1", "t2", "t3", "t4", "t5", "t6"].map(fixture_track);
});

describe("playlist_tracks inheritance resolution", () => {
    it("returns base tracks in playlists_tracks id order", async () => {
        await seed_playlist("base", ["t3", "t1", "t2"]);
        expect(uids(await SQLPlaylists.playlist_tracks("base"))).toEqual(["t3", "t1", "t2"]);
    });

    it("drops uids not present in the library", async () => {
        await seed_playlist("base", ["t1", "missing", "t2"]);
        expect(uids(await SQLPlaylists.playlist_tracks("base"))).toEqual(["t1", "t2"]);
    });

    it("resolves INCLUDE chains depth 2", async () => {
        await seed_playlist("leaf", ["t4"]);
        await seed_playlist("mid", ["t3"], [{ uuid: "leaf", mode: "INCLUDE" }]);
        await seed_playlist("top", ["t1"], [{ uuid: "mid", mode: "INCLUDE" }]);
        expect(uids(await SQLPlaylists.playlist_tracks("top"))).toEqual(["t1", "t3", "t4"]);
    });

    it("applies mixed set operations sequentially in array order", async () => {
        await seed_playlist("include_src", ["t2", "t3", "t4"]);
        await seed_playlist("exclude_src", ["t3"]);
        await seed_playlist("mixed", ["t1"], [
            { uuid: "include_src", mode: "INCLUDE" },
            { uuid: "exclude_src", mode: "EXCLUDE" }
        ]);
        expect(uids(await SQLPlaylists.playlist_tracks("mixed"))).toEqual(["t1", "t2", "t4"]);
    });

    it("applies INTERSECTION after INCLUDE", async () => {
        await seed_playlist("include_src", ["t2", "t3"]);
        await seed_playlist("intersect_src", ["t1", "t3"]);
        await seed_playlist("chained", ["t1"], [
            { uuid: "include_src", mode: "INCLUDE" },
            { uuid: "intersect_src", mode: "INTERSECTION" }
        ]);
        expect(uids(await SQLPlaylists.playlist_tracks("chained"))).toEqual(["t1", "t3"]);
    });

    it("keeps MASK's asymmetric append semantics", async () => {
        // MASK removes overlap from the original and appends incoming-not-in-original AFTER.
        await seed_playlist("mask_src", ["t2", "t5"]);
        await seed_playlist("masked", ["t1", "t2", "t3"], [{ uuid: "mask_src", mode: "MASK" }]);
        expect(uids(await SQLPlaylists.playlist_tracks("masked"))).toEqual(["t1", "t3", "t5"]);
    });

    it("applies a diamond ancestor on every branch", async () => {
        await seed_playlist("shared", ["t5"]);
        await seed_playlist("left", ["t2"], [{ uuid: "shared", mode: "INCLUDE" }]);
        await seed_playlist("right", ["t3"], [{ uuid: "shared", mode: "INCLUDE" }]);
        await seed_playlist("root", ["t1"], [
            { uuid: "left", mode: "INCLUDE" },
            { uuid: "right", mode: "INCLUDE" }
        ]);
        expect(uids(await SQLPlaylists.playlist_tracks("root"))).toEqual(["t1", "t2", "t5", "t3"]);
    });

    it("terminates on inheritance cycles", async () => {
        await seed_playlist("a", ["t1"], [{ uuid: "b", mode: "INCLUDE" }]);
        await seed_playlist("b", ["t2"], [{ uuid: "a", mode: "INCLUDE" }]);
        expect(uids(await SQLPlaylists.playlist_tracks("a"))).toEqual(["t1", "t2"]);
    });

    it("includes the whole library through an empty inherited search query", async () => {
        await seed_playlist("searchy", ["t1"], [], [{ query: "", mode: "INCLUDE" }]);
        expect(uids(await SQLPlaylists.playlist_tracks("searchy"))).toEqual(["t1", "t2", "t3", "t4", "t5", "t6"]);
    });

    it("serves subsequent resolutions from the cache until invalidated", async () => {
        await seed_playlist("cached", ["t1", "t2"]);
        const first = await SQLPlaylists.playlist_tracks("cached");
        await db.insert(playlists_tracks_table).values({ uuid: "cached", track_uid: "t3" });
        // No invalidation ran — still the cached membership, and a fresh array each call.
        const second = await SQLPlaylists.playlist_tracks("cached");
        expect(uids(second)).toEqual(uids(first));
        expect(second).not.toBe(first);
        SQLPlaylists.invalidate_playlist_tracks_cache();
        expect(uids(await SQLPlaylists.playlist_tracks("cached"))).toEqual(["t1", "t2", "t3"]);
    });
});
