import type { PromiseResult } from '@common/types';
import type { ISOString } from '@illusive/types';
import type { RozChapterContents, RozContent } from './types/roz';
import type { RoZFetchRequestInit } from '@common/rozfetch';
import type Roz from './types/roz';
import { gen_uuid } from '@common/utils/util';
import { generror } from '@common/utils/error_util';
import { html_to_roz_contents, image_url_to_base_64 } from './utils';
import { jsdom_document } from '@common/jsdom';
import { reinterpret_cast } from '@common/cast';
import rozfetch from '@common/rozfetch';

export namespace WitchcultTranslations {
	export interface Opts {
		fetch_opts?: RoZFetchRequestInit;
	}
	export interface ArcNoToRozOpts {
		arc_chapter_list_fetch_opts?: RoZFetchRequestInit;
		chapter_fetch_opts?: RoZFetchRequestInit;
		on_chapter_count?: (count: number) => any;
		on_chapter_fetch?: (chapter: Chapter) => any;
	}

	export interface HomeArc {
		artwork_url: string;
		title: string;
		href: string;
		description: string;
	}
	export interface ArcChapterlistSectionChapter {
		no: number;
		title: string;
		href: string;
		note?: string;
	}
	export interface ArcChapterlistSection {
		title: string;
		chapters: ArcChapterlistSectionChapter[];
		ebook_href?: string;
	}
	export interface ArcChapterlist {
		arc_title: string;
		description: string;
		sections: ArcChapterlistSection[];
		artwork_url?: string;
	}
	export interface TranslationProgress {
		arc: number;
		chapter: number;
		chapter_title: string;
		date: ISOString;
	}
	export interface ChapterMetadata {
		date: ISOString;
		arc: number;
		chapter: number;
		chapter_title: string;
		by: string;
		previous_post_href?: string;
		next_post_href?: string;
	}
	export interface Chapter {
		metadata: ChapterMetadata;
		chapter: RozChapterContents;
	}

	const BASE_URL = 'https://witchculttranslation.com/';
	const ARC_HEADING_REGEX = /^Arc\s*(\d+)\b/i;
	const CHAPTER_HEADING_REGEX = /^(?:Arc\s*(\d+)\s*,\s*)?(.+?)\s*(?:\s[–—-]|:)\s+(.+)$/;
	const SEPARATOR_REGEX = /^[\s※△▼◇◆]+$/;
	const BOILERPLATE_REGEX = /ALL RIGHTS BELONG TO|WEB NOVEL SOURCE|ncode\.syosetu\.com/i;
	const CREDITS_HEADING_REGEX = /\bby\s*:\s*$|^art sources?\s*:?$/i;
	const FOOTER_REGEX = /^(?:translation|translator['’]?s?|tl|author['’]?s?)\s*notes?\b|^\[1\]/i;
	const BARE_URL_REGEX = /^https?:\/\/\S+$/;
	const HEADER_SEARCH_LIMIT = 60;
	const HEADING_TAGS = ['H1', 'H2', 'H3', 'H4'];

	function element_text(el: Element | null | undefined): string {
		return (el?.textContent ?? '').replace(/\s+/g, ' ').trim();
	}
	function resolve_href(href: string): string {
		return new URL(href, BASE_URL).href;
	}
	function is_separator_text(text: string): boolean {
		return text.trim() !== '' && SEPARATOR_REGEX.test(text);
	}
	function is_separator(el: Element): boolean {
		return is_separator_text(element_text(el));
	}
	function image_src(el: Element): string | undefined {
		const image = el.tagName === 'IMG' ? el : el.querySelector('img');
		return image?.getAttribute('src') ?? undefined;
	}
	function is_witchcult_post(href: string): boolean {
		const url = new URL(href, BASE_URL);
		return url.hostname === new URL(BASE_URL).hostname && /^\/\d{4}\/\d{2}\/\d{2}\//.test(url.pathname);
	}
	function to_iso_string(date_string: string | null | undefined): ISOString {
		const date = new Date(date_string ?? NaN);
		return reinterpret_cast<ISOString>((isNaN(date.getTime()) ? new Date(0) : date).toISOString());
	}

	function toc_arc_elements(elements: Element[], no: number): Element[] {
		const is_arc_heading = (el: Element) => el.tagName === 'H1' && ARC_HEADING_REGEX.test(element_text(el));
		const start = elements.findIndex(el => is_arc_heading(el) && Number(ARC_HEADING_REGEX.exec(element_text(el))?.[1]) === no);
		if (start === -1) return [];
		const end = elements.findIndex((el, i) => i > start && is_arc_heading(el));
		return elements.slice(start, end === -1 ? undefined : end);
	}

	function parse_section_chapter(li: Element): Omit<ArcChapterlistSectionChapter, 'no'> | undefined {
		const anchor = li.querySelector('a');
		const href = anchor?.getAttribute('href');
		if (!anchor || !href) return undefined;
		const title = element_text(anchor);
		const note = element_text(li).replace(title, '').trim().replace(/^\((.*)\)$/, '$1');
		return { title, href: resolve_href(href), note: note || undefined };
	}

	function parse_arc_elements(elements: Element[], fallback_title: string): Omit<ArcChapterlist, 'arc_title'> {
		const sections: ArcChapterlistSection[] = [];
		const description_lines: string[] = [];
		let artwork_url: string | undefined = undefined;
		let heading: string | undefined = undefined;
		let chapter_no = 0;
		for (const el of elements) {
			artwork_url ??= image_src(el);
			if (HEADING_TAGS.includes(el.tagName)) {
				const text = element_text(el);
				if (text) heading = text;
			} else if (el.tagName === 'P' && sections.length === 0) {
				const text = element_text(el);
				if (text && !is_separator_text(text) && !BOILERPLATE_REGEX.test(text)) description_lines.push(text);
			} else if (el.tagName === 'UL') {
				const chapters = Array.from(el.querySelectorAll('li'))
					.filter(li => li.querySelector('li') === null)
					.map(parse_section_chapter)
					.filter(chapter => chapter !== undefined)
					.map(chapter => ({ ...chapter, no: ++chapter_no }));
				if (chapters.length === 0) continue;
				sections.push({ title: heading ?? fallback_title, chapters });
				heading = undefined;
			}
		}
		return { description: description_lines.join('\n'), sections, artwork_url };
	}

	function flatten_wrappers(elements: Element[]): Element[] {
		return elements.flatMap(el => el.tagName === 'DIV' ? flatten_wrappers(Array.from(el.children)) : [el]);
	}

	function header_end_index(elements: Element[]): number {
		let header_end = -1;
		for (let i = 0; i < Math.min(elements.length, HEADER_SEARCH_LIMIT); i++) {
			const el = elements[i];
			const is_marker = el.id === 'L69' || BOILERPLATE_REGEX.test(element_text(el));
			const is_credits = el.tagName === 'UL' && i > 0 && CREDITS_HEADING_REGEX.test(element_text(elements[i - 1]));
			if (is_marker || is_credits) header_end = i;
		}
		return header_end;
	}

	function chapter_body_elements(elements: Element[]): Element[] {
		const header_end = header_end_index(elements);
		let start = header_end + 1;
		const next_header_separator = (from: number) => header_end === -1
			? -1
			: elements.findIndex((el, i) => i >= from && i <= from + 1 && is_separator(el) && element_text(el).includes('※'));
		for (let separator = next_header_separator(start); separator !== -1; separator = next_header_separator(start)) start = separator + 1;

		const footer = elements.findIndex((el, i) => i >= start && (el.tagName === 'HR' || FOOTER_REGEX.test(element_text(el))));
		let end = footer === -1 ? elements.length : footer;
		const last_separator = () => elements.findLastIndex((el, i) => i >= start && i < end && is_separator(el));
		for (let separator = last_separator(); separator !== -1 && elements.slice(separator + 1, end).every(el => element_text(el) === ''); separator = last_separator()) end = separator;
		return elements.slice(start, end);
	}

	function trim_theme_breaks(contents: RozContent[]): RozContent[] {
		const start = contents.findIndex(content => content.type !== 'THEME_BREAK');
		const end = contents.findLastIndex(content => content.type !== 'THEME_BREAK');
		return start === -1 ? [] : contents.slice(start, end + 1);
	}

	function parse_chapter_heading(heading: string): { arc?: number; chapter: number; chapter_title: string; title: string } {
		const match = CHAPTER_HEADING_REGEX.exec(heading);
		if (!match) return { chapter: Number(/Chapter\s*(\d+)/i.exec(heading)?.[1] ?? 0), chapter_title: heading, title: heading };
		const [, arc, label, raw_title] = match;
		const chapter_title = raw_title.replace(/^["“”']+|["“”']+$/g, '').trim();
		return {
			arc: Number(arc),
			chapter: Number(/(\d+)/.exec(label)?.[1] ?? 0),
			chapter_title,
			title: `${label}: ${chapter_title}`
		};
	}

	export async function get_arcs_list(opts: Opts): PromiseResult<HomeArc[]> {
		const response = await rozfetch(BASE_URL, { ...opts.fetch_opts });
		if ('error' in response) return response;
		const html = await response.text();
		const document = jsdom_document(html);
		const entry_content = document.querySelector('.entry-content');
		if (!entry_content) return generror('Unable to find the arcs list', 'MEDIUM', { opts });

		const arcs: HomeArc[] = [];
		let current_arc: HomeArc | undefined = undefined;
		for (const child of Array.from(entry_content.children)) {
			if (child.tagName === 'HR') {
				current_arc = undefined;
			} else if (child.tagName === 'H1') {
				const anchor = child.querySelector('a');
				const href = anchor?.getAttribute('href');
				if (!anchor || !href) continue;
				current_arc = {
					title: element_text(anchor),
					href: resolve_href(href),
					artwork_url: image_src(child) ?? '',
					description: ''
				};
				arcs.push(current_arc);
			} else if (current_arc && child.tagName === 'P') {
				const text = element_text(child);
				if (text) current_arc.description = current_arc.description ? `${current_arc.description}\n${text}` : text;
			}
		}
		return arcs;
	}

	export async function get_arc_chapter_list_data(arc_href_or_no: string | number, opts: Opts): PromiseResult<ArcChapterlist> {
		const is_table_of_contents = typeof arc_href_or_no === 'number' && arc_href_or_no <= 3;
		const href = typeof arc_href_or_no === 'string'
			? arc_href_or_no
			: is_table_of_contents ? `${BASE_URL}table-of-content/` : `${BASE_URL}arc-${arc_href_or_no}/`;
		const chapter_list_response = await rozfetch(href, { ...opts.fetch_opts });
		if ('error' in chapter_list_response) return chapter_list_response;
		const chapter_list_html = await chapter_list_response.text();
		const document = jsdom_document(chapter_list_html);
		const entry_content = document.querySelector('.entry-content');
		if (!entry_content) return generror('Unable to find the arc chapter list', 'MEDIUM', { arc_href_or_no, href });

		const elements = flatten_wrappers(Array.from(entry_content.children));
		if (is_table_of_contents) {
			const [arc_heading, ...arc_elements] = toc_arc_elements(elements, arc_href_or_no);
			if (!arc_heading) return generror('Unable to find arc in the table of contents', 'MEDIUM', { arc_href_or_no, href });
			const arc_title = element_text(arc_heading);
			return { arc_title, ...parse_arc_elements(arc_elements, arc_title) };
		}
		const arc_title = element_text(document.querySelector('.entry-title'));
		return { arc_title, ...parse_arc_elements(elements, arc_title) };
	}

	export async function parse_chapter(href: string, opts: Opts): PromiseResult<Chapter> {
		const chapter_response = await rozfetch(href, { ...opts.fetch_opts });
		if ('error' in chapter_response) return chapter_response;
		const chapter_html = await chapter_response.text();
		const chapter_dom = jsdom_document(chapter_html);
		const entry_content = chapter_dom.querySelector('.entry-content');
		if (!entry_content) return generror('Unable to find the chapter contents', 'MEDIUM', { href });

		const heading = parse_chapter_heading(element_text(chapter_dom.querySelector('.entry-title')));
		const category_arc = Array.from(chapter_dom.querySelectorAll('.cat-links a'))
			.map(category => ARC_HEADING_REGEX.exec(element_text(category))?.[1])
			.find(arc => arc !== undefined);
		const previous_post_href = chapter_dom.querySelector('.nav-previous a')?.getAttribute('href') ?? undefined;
		const next_post_href = chapter_dom.querySelector('.nav-next a')?.getAttribute('href') ?? undefined;

		const body = chapter_dom.createElement('div');
		for (const el of chapter_body_elements(flatten_wrappers(Array.from(entry_content.children)))) body.appendChild(el);
		const contents = trim_theme_breaks(html_to_roz_contents(chapter_dom, body)
			.filter(content => !BARE_URL_REGEX.test(content.content) || content.type === 'IMAGE')
			.map(content => is_separator_text(content.content) ? { ...content, type: 'THEME_BREAK' } : content));
		if (contents.length === 0) return generror('Chapter has no contents', 'MEDIUM', { href });

		return {
			chapter: {
				chapter: { title: heading.title, uuid: gen_uuid() },
				contents: [{ type: 'CHAPTER_TITLE', content: heading.title, duration: 0, uuid: gen_uuid() }, ...contents]
			},
			metadata: {
				chapter: heading.chapter,
				chapter_title: heading.chapter_title,
				arc: category_arc !== undefined ? Number(category_arc) : heading.arc ?? 0,
				by: element_text(chapter_dom.querySelector('.author')),
				date: to_iso_string(chapter_dom.querySelector('time.entry-date')?.getAttribute('datetime')),
				previous_post_href: previous_post_href ? resolve_href(previous_post_href) : undefined,
				next_post_href: next_post_href ? resolve_href(next_post_href) : undefined
			}
		};
	}

	export async function arcno_to_roz(no: number, opts: ArcNoToRozOpts): PromiseResult<Roz> {
		const chapter_list_data = await get_arc_chapter_list_data(no, { fetch_opts: opts.arc_chapter_list_fetch_opts });
		if ('error' in chapter_list_data) return chapter_list_data;
		const chapter_hrefs = [...new Set(chapter_list_data.sections
			.flatMap(section => section.chapters)
			.map(section_chapter => section_chapter.href)
			.filter(is_witchcult_post))];
		if (chapter_hrefs.length === 0) return generror('Arc has no chapters hosted on Witchcult Translations', 'MEDIUM', { no, opts });
		opts.on_chapter_count?.(chapter_hrefs.length);

		const chapters: Chapter[] = [];
		for (const chapter_href of chapter_hrefs) {
			const chapter = await parse_chapter(chapter_href, { fetch_opts: opts.chapter_fetch_opts });
			if ('error' in chapter) return chapter;
			opts.on_chapter_fetch?.(chapter);
			chapters.push(chapter);
		}

		const cover = chapter_list_data.artwork_url ? await image_url_to_base_64(chapter_list_data.artwork_url) : null;
		if (cover !== null && typeof cover === 'object') return cover;

		return {
			version: 1,
			uuid: gen_uuid(),
			source_file: String(no),
			source_file_type: 'WITCHCULT',
			title: `ReZero Arc ${no} Webnovel`,
			cover: cover,
			author: 'Tappei Nagatsuki',
			publisher: 'Witchcult Translations',
			date: chapters[0].metadata.date,
			series_name: 'ReZero',
			series_no: no,
			chapters: chapters.map(({ chapter }) => chapter)
		};
	}
}
