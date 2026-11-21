import type { TrackAnalysisData } from './types';

export namespace TrackAnalysis {
	export const SCORE_FIELDS = [
		'acousticness', 'danceability', 'energy', 'instrumentalness', 'liveness', 'speechiness', 'valence'
	] as const satisfies readonly (keyof TrackAnalysisData)[];
	const NUMBER_FIELDS = [...SCORE_FIELDS, 'arousal', 'brightness', 'tempo'] as const satisfies readonly (keyof TrackAnalysisData)[];
	const TEXT_FIELDS = ['genre', 'mood', 'key'] as const satisfies readonly (keyof TrackAnalysisData)[];
	export const FIELDS = [...NUMBER_FIELDS, ...TEXT_FIELDS] as const;

	/**
	 * The analysis values among `source`'s fields, or undefined when there are none. The 1810 columns store 0 and ''
	 * for "unknown", so those count as none.
	 */
	export function from_values(source: object | null | undefined): TrackAnalysisData | undefined {
		if (source === null || source === undefined) return undefined;
		const values = source as Partial<Record<string, unknown>>;
		const analysis: TrackAnalysisData = {};
		let measured = false;
		for (const field of NUMBER_FIELDS) {
			const value = Number(values[field]);
			if (values[field] === null || values[field] === undefined || values[field] === '' || !Number.isFinite(value)) continue;
			analysis[field] = value;
			if (value !== 0) measured = true;
		}
		for (const field of TEXT_FIELDS) {
			const value = values[field];
			if (typeof value !== 'string' || value.trim() === '') continue;
			analysis[field] = value.trim();
			measured = true;
		}
		return measured ? analysis : undefined;
	}

	/** Whether the vibe sampler (or the server) measured the track's scores; a genre alone doesn't count */
	export function has_scores(analysis: TrackAnalysisData | undefined): boolean {
		return SCORE_FIELDS.some(field => analysis?.[field] !== undefined && analysis[field] !== 0);
	}

	/** The 1810 columns: one per score (0 where missing) and the genre ('' where missing) */
	export function to_columns(analysis: TrackAnalysisData | undefined): Record<typeof SCORE_FIELDS[number], number> & { genre: string } {
		return { ...Object.fromEntries(SCORE_FIELDS.map(field => [field, analysis?.[field] ?? 0])), genre: analysis?.genre ?? '' } as Record<typeof SCORE_FIELDS[number], number> & { genre: string };
	}
}
