import { remove_topic } from '@common/utils/clean_util';
import type { Track } from './types';

export namespace TrackMatch {
	const TITLE_THRESHOLD = 0.85;
	const FEATURE = /\s(?:feat|ft|featuring|prod)\b\.?\s.*$/i;
	const BRACKETS = /\(.*?\)|\[.*?\]|\{.*?\}/g;
	const ARTIST_SEPARATOR = /\s*(?:[,&+/()[\]]|\bx\b|\bwith\b|\band\b|\bfeat\b\.?|\bft\b\.?|\bfeaturing\b)\s*/i;

	function fold(text: string): string {
		return text.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[‘’ʼ`´']/g, '');
	}

	function words(text: string): string[] {
		return fold(text).replace(/[^a-z0-9*]+/g, ' ').split(' ').filter(word => /[a-z0-9]/.test(word));
	}

	function word_equal(a: string, b: string): boolean {
		if (a === b) return true;
		const censored = a.includes('*') ? a : b.includes('*') ? b : undefined;
		if (censored === undefined) return false;
		const other = censored === a ? b : a;
		return other.startsWith(censored.slice(0, censored.indexOf('*')));
	}

	function similarity(a: string[], b: string[]): number {
		if (a.length === 0 || b.length === 0) return 0;
		const unused = [...b];
		let matched = 0;
		for (const word of a) {
			const index = unused.findIndex(other => word_equal(word, other));
			if (index === -1) continue;
			unused.splice(index, 1);
			matched++;
		}
		return 2 * matched / (a.length + b.length);
	}

	export function artist_names(artists: string | string[]): string[] {
		const list = typeof artists === 'string' ? [artists] : artists;
		return list.flatMap(artist => remove_topic(artist).split(ARTIST_SEPARATOR)).map(name => words(name).join('')).filter(name => name !== '');
	}

	export function artists_overlap(a: string[], b: string[]): boolean {
		if (a.length === 0 || b.length === 0) return true;
		return a.some(x => b.some(y => x === y || (Math.min(x.length, y.length) >= 4 && (x.includes(y) || y.includes(x)))));
	}

	/** The title without brackets, features, or an "Artist - " prefix naming one of its artists */
	export function clean_title(title: string, artists: string[] = []): string {
		let cleaned = remove_topic(title).replace(BRACKETS, ' ').replace(FEATURE, '').replace(/\s+/g, ' ').trim();
		const dash = cleaned.indexOf(' - ');
		if (dash !== -1 && artists.length > 0 && artists_overlap(artist_names(cleaned.slice(0, dash)), artists)) cleaned = cleaned.slice(dash + 3).trim();
		return cleaned;
	}

	/** 0 when the candidate isn't the track, otherwise higher for closer titles */
	export function score(title: string, artists: string | string[], track: Track): number {
		const track_artists = artist_names(track.artists.map(artist => artist.name));
		const candidate_artists = artist_names(artists);
		if (!artists_overlap(candidate_artists, track_artists)) return 0;
		const title_score = similarity(words(clean_title(title, candidate_artists)), words(clean_title(track.title, track_artists)));
		if (title_score < TITLE_THRESHOLD) return 0;
		return title_score + similarity(words(remove_topic(title)), words(remove_topic(track.title))) / 100;
	}

	export function matches(title: string, artists: string | string[], track: Track | undefined): boolean {
		return track === undefined || score(title, artists, track) > 0;
	}

	export function best<T>(candidates: T[], describe: (candidate: T) => { title: string; artists: string | string[] }, track: Track | undefined): T | undefined {
		if (track === undefined) return candidates[0];
		let best_candidate: T | undefined;
		let best_score = 0;
		for (const candidate of candidates) {
			const { title, artists } = describe(candidate);
			const candidate_score = score(title, artists, track);
			if (candidate_score > best_score) {
				best_candidate = candidate;
				best_score = candidate_score;
			}
		}
		return best_candidate;
	}
}
