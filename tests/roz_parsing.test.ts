import { describe, it, expect, beforeAll } from "vitest";
import * as fs from "fs";
import { FileParser } from "@roze/file";
import { load_native_zip } from "@native/zip/zip";
import type Roz from "@roze/types/roz";

beforeAll(async () => {
    await load_native_zip();
});

const FIXTURES = {
    toaru: "C:\\Users\\raygo\\Documents\\ToAru\\A Certain Magical Index NT - Volume 01 [Yen Press][Kobo].epub",
    bookworm: "C:\\Users\\raygo\\Documents\\Ascendance of a Bookworm\\Part 1\\EPUB\\Ascendance of a Bookworm Volume - 01 『Premium Ver』.epub",
    silent_witch: "C:\\Users\\raygo\\Documents\\Novels\\Silent Witch\\Secrets of the Silent Witch - Volume 01 [Yen Press][Kobo].epub",
    stormlight: "C:\\Users\\raygo\\Documents\\StormlightArchive\\Stormlight Archive 01 - The Way of Kings.epub",
};

function total_paragraph_chars(roz: Roz) {
    return roz.chapters
        .flatMap(c => c.contents)
        .filter(x => x.type === "PARAGRAPH")
        .reduce((sum, x) => sum + x.content.length, 0);
}

function assert_no_shouty_titles(roz: Roz) {
    for (const { chapter } of roz.chapters) {
        if (!/[a-zA-Z]/.test(chapter.title)) continue;
        expect(chapter.title, `chapter title "${chapter.title}" should not be all-uppercase`).toMatch(/[a-z]/);
    }
}

describe.skipIf(!fs.existsSync(FIXTURES.toaru))("roz_parsing: epub - A Certain Magical Index NT vol. 1 (Yen Press)", () => {
    it("splits on in-body <h1> headings when the epub binding carries no titles at all, preferring a descriptive subtitle over a generic 'CHAPTER N' label, without over-splitting on in-chapter scene-break numbers", async () => {
        const roz = await FileParser.parse_epub(FIXTURES.toaru, { remove_copyright: true });
        if ("error" in roz) throw roz.error;

        expect(roz.chapters.map(c => c.chapter.title)).toEqual([
            "Cover",
            "Insert",
            "Contents",
            "The Ones Who Became Main Characters Through Some Mistake War?",
            "A Peaceful Academy City Without Him City.",
            "Interlude One",
            "What Happens Next, and the Choices We Should Make Dream.",
            "Interlude Two",
            "A Subtle Blank, and Signs of Future Connections Girl.",
            "Interlude Three",
            "The Right to Become a Good Person, and the Right to Reject It Black.",
            "Interlude Four",
            "Even If I Can’t Be a Hero Knight(s).",
            "A Little Banquet, and Dark Clouds Invited Forth Witch.",
            "Afterword",
        ]);
        assert_no_shouty_titles(roz);
        // Guards against silently losing or duplicating narration text while regrouping chapter boundaries.
        expect(total_paragraph_chars(roz)).toBe(418387);
    });
});

describe.skipIf(!fs.existsSync(FIXTURES.bookworm))("roz_parsing: epub - Ascendance of a Bookworm vol. 1 (J-Novel Club)", () => {
    it("keeps chapter boundaries and titles intact for an epub whose binding already carries every chapter title", async () => {
        const roz = await FileParser.parse_epub(FIXTURES.bookworm, { remove_copyright: true });
        if ("error" in roz) throw roz.error;

        expect(roz.chapters).toHaveLength(35);
        expect(roz.chapters[0].chapter.title).toBe("Cover");
        expect(roz.chapters[4].chapter.title).toBe("Prologue");
        expect(roz.chapters[5].chapter.title).toBe("A New Life");
        expect(roz.chapters[29].chapter.title).toBe("Epilogue");
        expect(roz.chapters[32].chapter.title).toBe("Afterword");
        assert_no_shouty_titles(roz);
        expect(total_paragraph_chars(roz)).toBe(448447);
    });
});

describe.skipIf(!fs.existsSync(FIXTURES.silent_witch))("roz_parsing: epub - Secrets of the Silent Witch vol. 1 (Yen Press)", () => {
    it("doesn't strip a chapter label when it and the descriptive title already share a single heading", async () => {
        const roz = await FileParser.parse_epub(FIXTURES.silent_witch, { remove_copyright: true });
        if ("error" in roz) throw roz.error;

        expect(roz.chapters).toHaveLength(20);
        expect(roz.chapters[0].chapter.title).toBe("Cover");
        expect(roz.chapters[1].chapter.title).toBe("Insert");
        expect(roz.chapters[4].chapter.title).toBe("PROLOGUE: The Black Dragon of Worgan");
        expect(roz.chapters[5].chapter.title).toBe("CHAPTER 1: A Colleague Arrives and Acts Unreasonably");
        expect(roz.chapters[14].chapter.title).toBe("CHAPTER 10: The Perfect Formula");
        assert_no_shouty_titles(roz);
        expect(total_paragraph_chars(roz)).toBe(349466);
    });
});

describe.skipIf(!fs.existsSync(FIXTURES.stormlight))("roz_parsing: epub - Stormlight Archive 01 (Calibre-converted, no NCX, no heading tags)", () => {
    it("recovers chapter titles from the embedded contents-page links when the epub has no NCX and no heading markup anywhere (chapter numbers are decorative images)", async () => {
        const roz = await FileParser.parse_epub(FIXTURES.stormlight, { remove_copyright: true });
        if ("error" in roz) throw roz.error;

        expect(roz.chapters.length).toBeGreaterThan(50);
        expect(roz.chapters.map(c => c.chapter.title)).toEqual(expect.arrayContaining([
            "Prelude to the Stormlight Archive",
            "Book One: The Way of Kings",
            "Part One: Above Silence",
            "Prologue: To Kill",
            "1: Stormblessed",
            "2: Honor Is Dead",
            "Epilogue: Of Most Worth",
            "Ars Arcanum",
        ]));

        const chapter_sizes = roz.chapters.map(c =>
            c.contents.filter(x => x.type === "PARAGRAPH").reduce((sum, x) => sum + x.content.length, 0)
        );
        expect(Math.max(...chapter_sizes)).toBeLessThan(300_000);

        assert_no_shouty_titles(roz);
        expect(total_paragraph_chars(roz)).toBe(2191855);
    });
});
