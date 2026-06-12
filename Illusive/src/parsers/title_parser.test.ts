import { beforeEach, describe, expect, it } from "vitest";
import { GLOBALS } from "@illusive/globals";
import type { Track } from "@illusive/types";
import { clean_music_title, parse_track_title_artist } from "./title_parser";

function sql_track(artists: Track['artists']): Track {
    return { uid: "sql", title: "x", duration: 1, artists } as Track;
}
function yt(title: string, channel = "Random Uploads"): Track {
    return { uid: "t", title, duration: 120, artists: [{ name: channel, uri: "youtube:UCchannel" }] } as Track;
}
function artist_names(track: Track): string[] {
    return track.artists.map(artist => artist.name);
}

beforeEach(() => {
    GLOBALS.global_var.sql_tracks = [
        sql_track([{ name: "Juice WRLD", uri: "youtube:UCjuice" }]),
        sql_track([{ name: "Gunna", uri: "youtubemusic:UCgunna" }]),
        sql_track([{ name: "Lil Baby", uuid: "lil-baby-uuid" }]),
        sql_track([{ name: "Metro Boomin", uri: null }]),
    ];
});

describe("clean_music_title", () => {
    it("strips junk brackets", () => {
        expect(clean_music_title("Song (Official Music Video)")).toBe("Song");
        expect(clean_music_title("Song [Official Video] (HD)")).toBe("Song");
        expect(clean_music_title("Song (Lyric Video)")).toBe("Song");
        expect(clean_music_title("Song (Color Coded Lyrics)")).toBe("Song");
        expect(clean_music_title("Song (Audio)")).toBe("Song");
        expect(clean_music_title("Song (Visualizer)")).toBe("Song");
        expect(clean_music_title("Song [M/V]")).toBe("Song");
        expect(clean_music_title("Song (prod. Metro Boomin)")).toBe("Song");
        expect(clean_music_title("Song(feat. Gunna)")).toBe("Song");
        expect(clean_music_title("Song (dir. by Cole Bennett)")).toBe("Song");
    });
    it("strips bare feat/prod segments", () => {
        expect(clean_music_title("Song ft. Gunna")).toBe("Song");
        expect(clean_music_title("Song feat. Gunna & Lil Baby")).toBe("Song");
        expect(clean_music_title("Song p.CashMoney")).toBe("Song");
        expect(clean_music_title("Song prod. by CashMoneyAP")).toBe("Song");
        expect(clean_music_title("Song w/ Gunna")).toBe("Song");
    });
    it("strips pipe junk segments", () => {
        expect(clean_music_title("Artist - Song | Official Video")).toBe("Artist - Song");
        expect(clean_music_title("Artist - Song | Official Audio | HD")).toBe("Artist - Song");
    });
    it("keeps version identity segments", () => {
        expect(clean_music_title("Song (Acoustic)")).toBe("Song (Acoustic)");
        expect(clean_music_title("Song (Slowed + Reverb)")).toBe("Song (Slowed + Reverb)");
        expect(clean_music_title("Song (Instrumental)")).toBe("Song (Instrumental)");
    });
    it("does not eat hyphenated names", () => {
        expect(clean_music_title("Jay-Z - Song ft. Jay-Z")).toBe("Jay-Z - Song");
    });
});

describe("parse_track_title_artist", () => {
    it("leaves 'A - B' unsplit when neither side can be identified", () => {
        const track = parse_track_title_artist(yt("Foo Baz - Bar Song"));
        expect(track.title).toBe("Foo Baz - Bar Song");
        expect(artist_names(track)).toEqual(["Random Uploads"]);
        expect(track.alt_title).toBe("Foo Baz - Bar Song");
    });
    it("splits 'Artist - Title' when the artist is known from sql_tracks", () => {
        const track = parse_track_title_artist(yt("Juice WRLD - Bar Song"));
        expect(track.title).toBe("Bar Song");
        expect(artist_names(track)).toEqual(["Random Uploads", "Juice WRLD"]);
    });
    it("splits 'Title - Artist' when artist is known from sql_tracks and copies uri", () => {
        const track = parse_track_title_artist(yt("Lucid Dreams - Juice WRLD"));
        expect(track.title).toBe("Lucid Dreams");
        const juice = track.artists.find(artist => artist.name === "Juice WRLD");
        expect(juice?.uri).toBe("youtube:UCjuice");
    });
    it("splits 'Title - Artist' when artist matches the channel (topic)", () => {
        const track = parse_track_title_artist(yt("Lucid Dreams - Juice WRLD", "Juice WRLD - Topic"));
        expect(track.title).toBe("Lucid Dreams");
        expect(artist_names(track)).toEqual(["Juice WRLD - Topic"]);
    });
    it("splits 'Artist - Title' when artist matches a VEVO channel", () => {
        const track = parse_track_title_artist(yt("Juice WRLD - Robbery (Official Video)", "JuiceWRLDVEVO"));
        expect(track.title).toBe("Robbery");
        expect(artist_names(track)).toEqual(["JuiceWRLDVEVO"]);
    });
    it("parses bracketed feats with '&' separator and copies uri/uuid", () => {
        const track = parse_track_title_artist(yt("Mood (feat. Gunna & Lil Baby)"));
        expect(track.title).toBe("Mood");
        const gunna = track.artists.find(artist => artist.name === "Gunna");
        const baby = track.artists.find(artist => artist.name === "Lil Baby");
        expect(gunna?.uri).toBe("youtubemusic:UCgunna");
        expect(baby?.uuid).toBe("lil-baby-uuid");
    });
    it("parses comma separated feats", () => {
        const track = parse_track_title_artist(yt("Mood ft. Gunna, Lil Baby"));
        expect(track.title).toBe("Mood");
        expect(artist_names(track)).toContain("Gunna");
        expect(artist_names(track)).toContain("Lil Baby");
    });
    it("segments space-only separated feats using known artists", () => {
        const track = parse_track_title_artist(yt("Mood ft. Gunna Lil Baby"));
        expect(artist_names(track)).toContain("Gunna");
        expect(artist_names(track)).toContain("Lil Baby");
    });
    it("keeps unknown multi-word feat as one artist", () => {
        const track = parse_track_title_artist(yt("Mood ft. Zzz Qqq"));
        expect(artist_names(track)).toEqual(["Random Uploads", "Zzz Qqq"]);
    });
    it("extracts producers into prods, not artists", () => {
        const track = parse_track_title_artist(yt("Knots (prod. Metro Boomin)"));
        expect(track.title).toBe("Knots");
        expect(track.prods).toBe("Metro Boomin");
        expect(artist_names(track)).toEqual(["Random Uploads"]);
    });
    it("extracts 'p.producer' producers", () => {
        const track = parse_track_title_artist(yt("Knots p.CashMoney"));
        expect(track.title).toBe("Knots");
        expect(track.prods).toBe("CashMoney");
    });
    it("extracts multiple producers", () => {
        const track = parse_track_title_artist(yt("Knots (Prod by JUUG & Mooktoven)"));
        expect(track.prods).toBe("JUUG, Mooktoven");
    });
    it("handles combined artist, junk, feat and quality tags", () => {
        const track = parse_track_title_artist(yt("Juice WRLD - Bar Song (Official Music Video) ft. Gunna [HD]"));
        expect(track.title).toBe("Bar Song");
        expect(artist_names(track)).toEqual(["Random Uploads", "Juice WRLD", "Gunna"]);
    });
    it("extracts remixer as artist and strips remix bracket", () => {
        const track = parse_track_title_artist(yt("Lucid Dreams (Tiesto Remix)"));
        expect(track.title).toBe("Lucid Dreams");
        expect(artist_names(track)).toContain("Tiesto");
    });
    it("ignores plain (Remix) without a remixer name", () => {
        const track = parse_track_title_artist(yt("Lucid Dreams (Remix)"));
        expect(track.title).toBe("Lucid Dreams");
        expect(artist_names(track)).toEqual(["Random Uploads"]);
    });
    it("parses quoted titles", () => {
        const track = parse_track_title_artist(yt('Polo G "Epidemic" (Official Video)'));
        expect(track.title).toBe("Epidemic");
        expect(artist_names(track)).toContain("Polo G");
    });
    it("strips pipe junk before splitting", () => {
        const track = parse_track_title_artist(yt("Gunna - Bar Song | Official Video"));
        expect(track.title).toBe("Bar Song");
        expect(artist_names(track)).toContain("Gunna");
    });
    it("flags explicit / clean / unreleased", () => {
        expect(parse_track_title_artist(yt("Song (Explicit)")).explicit).toBe("EXPLICIT");
        expect(parse_track_title_artist(yt("Song (Clean Version)")).explicit).toBe("CLEAN");
        const unreleased = parse_track_title_artist(yt("Song unreleased"));
        expect(unreleased.unreleased).toBe(true);
        expect(unreleased.title).toBe("Song");
    });
    it("preserves an incoming explicit badge when title has no flag", () => {
        const track = parse_track_title_artist({ ...yt("Song"), explicit: "EXPLICIT" });
        expect(track.explicit).toBe("EXPLICIT");
    });
    it("does not duplicate the channel artist from feats", () => {
        const track = parse_track_title_artist(yt("Mood ft. Gunna", "Gunna"));
        expect(artist_names(track)).toEqual(["Gunna"]);
    });
    it("leaves titles without separators untouched", () => {
        const track = parse_track_title_artist(yt("Just A Song"));
        expect(track.title).toBe("Just A Song");
        expect(artist_names(track)).toEqual(["Random Uploads"]);
    });

    it("does not split title-internal dashes (YTM-style clean titles)", () => {
        const track = parse_track_title_artist(yt("Some Song - Part 2"));
        expect(track.title).toBe("Some Song - Part 2");
        expect(artist_names(track)).toEqual(["Random Uploads"]);
    });
    it("does not duplicate the artist when the channel has a suffix (BabyTron SB)", () => {
        const track = parse_track_title_artist(yt("BabyTron Ft. Rell Vert - No Fakers [Day 20/30]", "Babytron SB"));
        expect(track.title).toBe("No Fakers");
        expect(artist_names(track)).toEqual(["Babytron SB", "Rell Vert"]);
    });
    it("does not invent an artist from an undetermined 'Title - Artists' split (CARNIVAL)", () => {
        const track = parse_track_title_artist(yt("CARNIVAL - KANYE WEST x TY DOLLA $IGN x PLAYBOI CARTI x RICH THE KID AMV", "DETOX"));
        expect(track.title).toBe("CARNIVAL - KANYE WEST x TY DOLLA $IGN x PLAYBOI CARTI x RICH THE KID");
        expect(artist_names(track)).toEqual(["DETOX"]);
    });
    it("splits 'Title - Artists' x-collabs once an artist is known", () => {
        GLOBALS.global_var.sql_tracks = [
            ...GLOBALS.global_var.sql_tracks,
            sql_track([{ name: "Kanye West", uri: "youtubemusic:UCkanye" }]),
        ];
        const track = parse_track_title_artist(yt("CARNIVAL - KANYE WEST x TY DOLLA $IGN AMV", "DETOX"));
        expect(track.title).toBe("CARNIVAL");
        expect(artist_names(track)).toEqual(["DETOX", "Kanye West", "TY DOLLA $IGN"]);
    });
});
