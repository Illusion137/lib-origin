export interface SeekTables {
	seektableVersion: number;
	offset: number;
	timescale: number;
	segments: Segment[];
	pssh: Pssh;
	initRange: InitRange;
}

export interface Segment {
	size: number;
	duration: number;
}

export interface Pssh {
	widevine: string;
	fairplay: string;
	playready: string;
}

export interface InitRange {
	start: number;
	end: number;
}
