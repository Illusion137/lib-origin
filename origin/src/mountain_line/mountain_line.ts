import rozfetch from '@common/rozfetch';
import { encode_params } from '@common/utils/fetch_util';

export namespace MountainLine {
	const NAU_PATH_STOPS = 'routes/6269/stops';
	const NAU_PATH_VEHICLES = 'routes/6269/vehicles';
	const NAU_PATH_PATTERNS = 'routes/6269/patterns';

	export interface Bus {
		patternId: number;
		capacity: number;
		id: number;
		lat: number;
		lon: number;
		name: string;
		passengerLoad: number;
		lastUpdated: string;
		heading: string;
		speed: number;
		headingDegrees: number;
		shapeDistanceTraveled: number;
	}

	export interface Stop {
		id: number;
		lat: number;
		lon: number;
		name: string;
		stopCode: string;
		rtpiNumber: string;
	}

	export interface Pattern {
		color: string;
		direction: string | null;
		id: number;
		name: string;
		directionType: string;
		shape: string;
	}

	export interface PatternStop {
		stopSequence: number;
		shapeDistanceTraveled: number;
		stop: Stop;
		routes: number[];
	}

	function headers() {
		return {
			'accept': 'application/json',
			'accept-language': 'en-US,en;q=0.9',
			'cache-control': 'no-cache',
			'pragma': 'no-cache',
			'host': 'mountainline.syncromatics.com',
			'referer': 'https://mountainline.syncromatics.com/route/6269',
			'sec-ch-ua-mobile': '?0',
			'sec-ch-ua-platform': '"macOS"',
			'sec-fetch-dest': 'empty',
			'sec-fetch-mode': 'cors',
			'sec-fetch-site': 'same-origin',
			'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36'
		};
	}

	export async function stops(path: string) {
		const params = {
			path
		};
		const stops_response = await rozfetch<Stop[]>(`https://mountainline.syncromatics.com/api/rtpi?${encode_params(params)}`, { headers: headers() });
		if ('error' in stops_response) return stops_response;
		const stops = await stops_response.json();
		return stops;
	}
	export async function nau_stops() {
		return await stops(NAU_PATH_STOPS);
	}

	export async function live_route(path: string) {
		const params = {
			path
		};
		const buses_response = await rozfetch<Bus[]>(`https://mountainline.syncromatics.com/api/rtpi?${encode_params(params)}`, { headers: headers() });
		if ('error' in buses_response) return buses_response;
		const buses = await buses_response.json();
		return buses;
	}
	export async function nau_live_route() {
		return await live_route(NAU_PATH_VEHICLES);
	}

	export async function patterns(path: string) {
		const params = {
			path
		};
		const patterns_response = await rozfetch<Pattern[]>(`https://mountainline.syncromatics.com/api/rtpi?${encode_params(params)}`, { headers: headers() });
		if ('error' in patterns_response) return patterns_response;
		const patterns = await patterns_response.json();
		return patterns;
	}
	export async function nau_patterns() {
		return await patterns(NAU_PATH_PATTERNS);
	}

	export async function pattern_stops(path: string) {
		const params = {
			path
		};
		const pattern_stops_response = await rozfetch<PatternStop[]>(`https://mountainline.syncromatics.com/api/rtpi?${encode_params(params)}`, { headers: headers() });
		if ('error' in pattern_stops_response) return pattern_stops_response;
		const pattern_stops = await pattern_stops_response.json();
		return pattern_stops;
	}
	export async function nau_pattern_stops(pattern_id: number) {
		return await pattern_stops(`${NAU_PATH_PATTERNS}/${pattern_id}/stops`);
	}
}
