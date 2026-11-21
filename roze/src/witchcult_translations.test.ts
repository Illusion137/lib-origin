import { describe, test, expect } from 'vitest';
import { WitchcultTranslations } from '@roze/witchcult_translations';
import { expect_error, expect_no_error } from '@common/testing.test';

const BASE_URL = 'https://witchculttranslation.com/';
const JUNK_REGEX = /ALL RIGHTS BELONG|WEB NOVEL SOURCE|^(?:Human |Machine[- ])?Translated by|^Proofread by|^Translation Notes|^Author['’]?s? Note|^https?:\/\//i;

interface ExpectedChapter {
	href: string;
	chapter: number;
	title: string;
	first_paragraph: string;
}

const arc_chapters: Record<number, ExpectedChapter[]> = {
	1: [
		{ href: '2021/05/19/prologue-waste-heat-of-the-beginning/', chapter: 0, title: 'Prologue: Waste Heat Of The Beginning', first_paragraph: '―This is really bad.' },
		{ href: '2021/05/19/arc-1-chapter-12-reunion-with-the-witch/', chapter: 12, title: 'Chapter 12: Reunion with the Witch', first_paragraph: '“―Quit spacing out, man.' },
		{ href: '2021/05/19/arc-1-interlude-the-moon-is-watching/', chapter: 0, title: 'Interlude: The Moon is Watching', first_paragraph: 'A faint blue light' }
	],
	3: [
		{ href: '2025/06/25/arc-3-chapter-13-same-hometown/', chapter: 13, title: 'Chapter 13: Same Hometown', first_paragraph: 'Subaru sank into the floor' }
	],
	4: [
		{ href: '2017/05/18/arc-4-appendix-the-advent/', chapter: 0, title: 'Appendix: The Advent', first_paragraph: '——Footsteps echoed through the cold, dark chamber.' }
	],
	5: [
		{ href: '2018/11/28/arc-5-chapter-1-it-always-starts-with-a-visitor/', chapter: 1, title: 'Chapter 1: It Always Starts With a Visitor', first_paragraph: '—He breaks into a sprint' },
		{ href: '2018/10/25/arc-5-chapter-43-before-the-rendezvous/', chapter: 43, title: 'Chapter 43: Before The Rendezvous', first_paragraph: 'Reinhard: [Forgive me' },
		{ href: '2023/04/27/arc-5-interlude-iii-name-of-warmth/', chapter: 0, title: 'Interlude III: Name of Warmth', first_paragraph: 'No matter what, in the end' }
	],
	6: [
		{ href: '2023/12/04/arc-6-chapter-1-the-dragon-carriages-way-back/', chapter: 1, title: 'Chapter 1: The Dragon Carriage’s Way Back', first_paragraph: '——Natsuki Subaru’s group' },
		{ href: '2018/08/22/arc-6-chapter-45-embrace-of-the-guilty/', chapter: 45, title: 'Chapter 45: Embrace of The Guilty', first_paragraph: '――A painful red drop of blood' },
		{ href: '2021/05/24/arc-6-chapter-88-ask-thy-will/', chapter: 88, title: 'Chapter 88: Ask Thy Will', first_paragraph: 'ーーUnder the clouds' }
	],
	7: [
		{ href: '2021/01/23/arc-7-chapter-1-initiation/', chapter: 1, title: 'Chapter 1: Baptism', first_paragraph: '…As soon as the plume of smoke cleared up' },
		{ href: '2022/04/30/arc-7-chapter-59-taritta-shudraq/', chapter: 59, title: 'Chapter 59: Taritta Shudraq', first_paragraph: '???: [Hey, Taritta.' },
		{ href: '2023/03/08/arc-7-chapter-110-congratulatory-words/', chapter: 110, title: 'Chapter 110: Congratulatory Words', first_paragraph: 'Digging into the ground powerfully' }
	],
	8: [
		{ href: '2023/04/15/arc-8-chapter-1-change-of-victory-conditions/', chapter: 1, title: 'Chapter 1: Change of Victory Conditions', first_paragraph: '――The battle between the Imperial Forces' },
		{ href: '2023/11/24/arc-8-chapter-39-laughter-of-the-unbounded-one/', chapter: 39, title: 'Chapter 39: Laughter of the One Unbounded', first_paragraph: '――Cecilus Segmunt was a Stargazer.' },
		{ href: '2024/06/14/arc-8-curtains-close-priscilla-barielle/', chapter: 0, title: 'Curtain’s Close: Priscilla Barielle', first_paragraph: '――The Great Disaster averted' }
	],
	9: [
		{ href: '2024/07/26/arc-9-chapter-1-o-prayers-be-as-clouds/', chapter: 1, title: 'Chapter 1: O Prayers, Be As Clouds', first_paragraph: '――The final hours were calm' },
		{ href: '2025/05/23/arc-9-chapter-31-one-hundred-percent-effort/', chapter: 31, title: 'Chapter 31: One-Hundred Percent Effort', first_paragraph: '――Its visibility accompanied by a thundering' },
		{ href: '2025/12/04/arc-9-curtains-close-reweave/', chapter: 0, title: 'Curtain’s Close: Reweave', first_paragraph: 'While looking at the servants' }
	],
	10: [
		{ href: '2026/02/05/arc-10-chapter-1-friends/', chapter: 1, title: 'Chapter 1: Friends', first_paragraph: '???: [――Well ain’t that just like that prince' },
		{ href: '2026/05/06/arc-10-chapter-13-mustnt-stain-with-blood/', chapter: 13, title: 'Chapter 13: Mustn’t Stain with Blood', first_paragraph: '――Within the Noble District of the Royal Capital' },
		{ href: '2026/08/09/arc-10-chapter-26-a-word-of-congratulations/', chapter: 26, title: 'Chapter 26: A Word of Congratulations', first_paragraph: '――From the very outset' }
	]
};

const chapter_cases = Object.entries(arc_chapters)
	.flatMap(([arc, chapters]) => chapters.map(expected => ({ arc: Number(arc), ...expected, href: `${BASE_URL}${expected.href}` })));

describe('WitchcultTranslations', () => {
	test('get_arcs_list', async () => {
		const arcs = await WitchcultTranslations.get_arcs_list({});
		expect_no_error(arcs);
		if ('error' in arcs) return;
		expect(arcs.length).toBeGreaterThanOrEqual(8);
		expect(arcs.map(arc => arc.title)).toContain('Arc IX: Light of a Nameless Star');
		for (const arc of arcs) {
			expect(arc.title).not.toBe('');
			expect(arc.href.startsWith(BASE_URL)).toBe(true);
			expect(arc.artwork_url).toMatch(/^https?:\/\//);
			expect(arc.description).not.toBe('');
		}
	});

	test.each([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])('get_arc_chapter_list_data arc %i', async (no) => {
		const chapter_list = await WitchcultTranslations.get_arc_chapter_list_data(no, {});
		expect_no_error(chapter_list);
		if ('error' in chapter_list) return;
		expect(chapter_list.arc_title).toMatch(new RegExp(`^Arc ${no}\\b`));
		expect(chapter_list.description).not.toBe('');
		expect(chapter_list.sections.length).toBeGreaterThan(0);
		const chapters = chapter_list.sections.flatMap(section => section.chapters);
		expect(chapters.map(chapter => chapter.no)).toEqual(chapters.map((_, i) => i + 1));
		for (const chapter of chapters) {
			expect(chapter.title).not.toBe('');
			expect(chapter.href).toMatch(/^https?:\/\//);
		}
		for (const expected of arc_chapters[no] ?? []) {
			expect(chapters.map(chapter => chapter.href)).toContain(`${BASE_URL}${expected.href}`);
		}
	});

	test('get_arc_chapter_list_data sections and notes', async () => {
		const arc_4 = await WitchcultTranslations.get_arc_chapter_list_data(4, {});
		expect_no_error(arc_4);
		if ('error' in arc_4) return;
		expect(arc_4.sections.map(section => section.title)).toEqual(expect.arrayContaining(['Phase 1', 'Phase 2', 'Phase 3', 'Phase 4', 'Phase 5', 'Phase 6']));
		expect(arc_4.artwork_url).toMatch(/^https?:\/\//);

		const arc_5 = await WitchcultTranslations.get_arc_chapter_list_data(5, {});
		expect_no_error(arc_5);
		if ('error' in arc_5) return;
		expect(arc_5.sections.flatMap(section => section.chapters).map(chapter => chapter.note)).toContain('Edited Machine Translation');
	});

	test('get_arc_chapter_list_data by href matches by number', async () => {
		const by_href = await WitchcultTranslations.get_arc_chapter_list_data(`${BASE_URL}arc-9/`, {});
		const by_no = await WitchcultTranslations.get_arc_chapter_list_data(9, {});
		expect_no_error(by_href);
		expect(by_href).toEqual(by_no);
	});

	test('get_arc_chapter_list_data invalid arcs', async () => {
		expect_error(await WitchcultTranslations.get_arc_chapter_list_data(0, {}));
		expect_error(await WitchcultTranslations.get_arc_chapter_list_data(99, {}));
	});

	test.each(chapter_cases)('parse_chapter arc $arc: $title', async ({ arc, href, chapter, title, first_paragraph }) => {
		const result = await WitchcultTranslations.parse_chapter(href, {});
		expect_no_error(result);
		if ('error' in result) return;
		const { metadata, chapter: chapter_contents } = result;
		const contents = chapter_contents.contents;

		expect(metadata.arc).toBe(arc);
		expect(metadata.chapter).toBe(chapter);
		expect(chapter_contents.chapter.title).toBe(title);
		expect(title.endsWith(metadata.chapter_title)).toBe(true);
		expect(metadata.by).not.toBe('');
		expect(new Date(metadata.date).getFullYear()).toBeGreaterThanOrEqual(2016);
		for (const post_href of [metadata.previous_post_href, metadata.next_post_href]) {
			if (post_href !== undefined) expect(post_href.startsWith(BASE_URL)).toBe(true);
		}

		expect(contents[0]).toMatchObject({ type: 'CHAPTER_TITLE', content: title });
		expect(contents[1].type).toBe('PARAGRAPH');
		expect(contents[1].content.startsWith(first_paragraph)).toBe(true);
		expect(contents[contents.length - 1].type).not.toBe('THEME_BREAK');

		const paragraphs = contents.filter(content => content.type === 'PARAGRAPH');
		expect(paragraphs.length).toBeGreaterThanOrEqual(20);
		expect(paragraphs.filter(paragraph => JUNK_REGEX.test(paragraph.content)).map(paragraph => paragraph.content)).toEqual([]);
	});

	test('parse_chapter invalid href', async () => {
		expect_error(await WitchcultTranslations.parse_chapter(`${BASE_URL}this-chapter-does-not-exist/`, {}));
	});

	test('arcno_to_roz', async () => {
		const counts: number[] = [];
		const fetched: WitchcultTranslations.Chapter[] = [];
		const roz = await WitchcultTranslations.arcno_to_roz(3, {
			on_chapter_count: count => counts.push(count),
			on_chapter_fetch: chapter => fetched.push(chapter)
		});
		expect_no_error(roz);
		if ('error' in roz) return;
		expect(roz).toMatchObject({
			version: 1,
			source_file: '3',
			source_file_type: 'WITCHCULT',
			title: 'ReZero Arc 3 Webnovel',
			author: 'Tappei Nagatsuki',
			publisher: 'Witchcult Translations',
			series_name: 'ReZero',
			series_no: 3
		});
		expect(counts).toEqual([roz.chapters.length]);
		expect(fetched.map(chapter => chapter.chapter.chapter.title)).toEqual(roz.chapters.map(chapter => chapter.chapter.title));
		expect(roz.chapters.map(chapter => chapter.chapter.title)).toContain('Chapter 13: Same Hometown');
		expect(roz.date).toBe(fetched[0].metadata.date);
	});

	test('arcno_to_roz arc without hosted chapters', async () => {
		expect_error(await WitchcultTranslations.arcno_to_roz(2, {}));
	});
});
