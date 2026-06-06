import type Roz from "@roze/types/roz";
import type { RozContent } from "@roze/types/roz";
import { paginate_roz_contents, type WindowSize } from "./paginator";

export interface TimedContent {
	content: RozContent;
	chapter_index: number;
	content_index: number;
	start: number;
	end: number;
}

export interface AudiobookContentTimeline {
	items: TimedContent[];
	spoken: TimedContent[];
	total_duration: number;
}

export interface TimedImage {
	image: string;
	is_cover: boolean;
	start: number;
	end: number;
}

export interface AudiobookImageTimeline {
	images: TimedImage[];
	total_duration: number;
}

export interface TimedPage {
	contents: RozContent[];
	start: number;
	end: number;
}

export interface AudiobookPageTimeline {
	pages: TimedPage[];
	total_duration: number;
}

export function build_content_timeline(roz: Roz): AudiobookContentTimeline {
	const items: TimedContent[] = [];
	const spoken: TimedContent[] = [];
	let acc = 0;
	roz.chapters.forEach((cc, chapter_index) => {
		cc.contents.forEach((content, content_index) => {
			const start = acc;
			acc += content.duration ?? 0;
			const item: TimedContent = { content, chapter_index, content_index, start, end: acc };
			items.push(item);
			if (item.end > item.start) spoken.push(item);
		});
	});
	return { items, spoken, total_duration: acc };
}

function rightmost_at_or_before<T extends { start: number }>(sorted: T[], t: number): number {
	let lo = 0, hi = sorted.length - 1, idx = 0;
	while (lo <= hi) {
		const mid = (lo + hi) >> 1;
		if (sorted[mid].start <= t) { idx = mid; lo = mid + 1; }
		else hi = mid - 1;
	}
	return idx;
}

export function content_at_time(timeline: AudiobookContentTimeline, t: number): TimedContent | undefined {
	if (timeline.spoken.length === 0) return undefined;
	return timeline.spoken[rightmost_at_or_before(timeline.spoken, Math.max(0, t))];
}

export function build_image_timeline(roz: Roz): AudiobookImageTimeline {
	const { items, total_duration } = build_content_timeline(roz);
	const images: TimedImage[] = [];
	const cover = roz.cover ?? "";
	const first_image = items.find(it => it.content.type === "IMAGE");
	const cover_end = first_image ? first_image.start : total_duration;
	if (cover.length > 0) images.push({ image: cover, is_cover: true, start: 0, end: cover_end });

	let i = 0;
	while (i < items.length) {
		if (items[i].content.type !== "IMAGE") { i++; continue; }
		const run: TimedContent[] = [];
		while (i < items.length && items[i].content.type === "IMAGE") { run.push(items[i]); i++; }
		const window_start = run[0].start;
		let next_image_start = total_duration;
		for (let j = i; j < items.length; j++) {
			if (items[j].content.type === "IMAGE") { next_image_start = items[j].start; break; }
		}
		const span = Math.max(next_image_start - window_start, run.length);
		const per = span / run.length;
		run.forEach((it, k) => images.push({
			image: it.content.content,
			is_cover: false,
			start: window_start + per * k,
			end: window_start + per * (k + 1),
		}));
	}

	// no cover: let the first embedded image fill the opening narration
	if (cover.length === 0 && images.length > 0) images[0].start = 0;
	return { images, total_duration };
}

export function image_at_time(timeline: AudiobookImageTimeline, t: number): TimedImage | undefined {
	if (timeline.images.length === 0) return undefined;
	return timeline.images[rightmost_at_or_before(timeline.images, Math.max(0, t))];
}

export async function build_page_timeline(roz: Roz, window_size: WindowSize, text_bottom_margin: number): Promise<AudiobookPageTimeline> {
	const pages = await paginate_roz_contents(roz.chapters, window_size, text_bottom_margin);
	let acc = 0;
	const timed_pages: TimedPage[] = pages.map((page) => {
		const start = acc;
		acc += page.reduce((s, c) => s + (c.duration ?? 0), 0);
		return { contents: page, start, end: acc };
	});
	return { pages: timed_pages, total_duration: acc };
}

export function page_index_at_time(timeline: AudiobookPageTimeline, t: number): number {
	if (timeline.pages.length === 0) return 0;
	return rightmost_at_or_before(timeline.pages, Math.max(0, t));
}

export function global_time_for(roz: Roz, chapter_index: number, position_sec: number): number {
	let acc = 0;
	const upto = Math.min(chapter_index, roz.chapters.length);
	for (let i = 0; i < upto; i++) {
		acc += roz.chapters[i].contents.reduce((s, c) => s + (c.duration ?? 0), 0);
	}
	return acc + Math.max(0, position_sec);
}

export function total_spoken_duration(roz: Roz): number {
	return roz.chapters.reduce((s, cc) => s + cc.contents.reduce((cs, c) => cs + (c.duration ?? 0), 0), 0);
}
