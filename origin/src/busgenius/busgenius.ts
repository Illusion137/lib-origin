import rozfetch from '@common/rozfetch';
import { CookieJar } from '@common/utils/cookie_util';
import { encode_params } from '@common/utils/fetch_util';
import type { PromiseResult } from '@common/types';
import { generror } from '@common/utils/error_util';
import type { BusGeniusMap, BusGeniusRoute, BusGeniusRouteResponse, BusGeniusStop } from './types';

export namespace BusGenius {
	export const NAU_ROUTES = ['129', '130', '135', '182', '477'];
	export const NAU_LUMBERJACK_ROUTE = ['477'];
	const cookie_jar = CookieJar.fromString('contrastMode="light"; tileType="light"');

	export async function live_routes(routes: string[], active_routes: string[]) {
		cookie_jar.updateCookie('routeIDs_2', JSON.stringify(active_routes));
		const params = {
			routes,
			updateAnnouncements: true
		};
		const routes_response = await rozfetch<BusGeniusRouteResponse>(`https://www.busgenius.com/api/v1/get_updated_data/2?${encode_params(params)}`);
		if ('error' in routes_response) return routes_response;
		const routes_data = await routes_response.json();
		return routes_data;
	}
	export async function nau_live_routes() {
		return await live_routes(NAU_ROUTES, NAU_LUMBERJACK_ROUTE);
	}

	const STOP_FIELD_REGEX = /routeObj\[(\d+)\] = \{\};|checkpointObj\[(\d+)\]\.(name|abbrev|route_abbrev|lat|lng) = "((?:[^"\\]|\\.)*)";/g;
	function parse_stops(html: string): BusGeniusStop[] {
		const stops = new Map<number, BusGeniusStop>();
		let route_id = -1;
		for (const match of html.matchAll(STOP_FIELD_REGEX)) {
			if (match[1] !== undefined) {
				route_id = Number(match[1]);
				continue;
			}
			const id = Number(match[2]);
			let stop = stops.get(id);
			if (stop === undefined) {
				stop = { id, route_id, name: '', abbrev: '', route_abbrev: '', lat: NaN, lng: NaN };
				stops.set(id, stop);
			}
			const value = JSON.parse(`"${match[4]}"`) as string;
			const field = match[3] as 'name' | 'abbrev' | 'route_abbrev' | 'lat' | 'lng';
			if (field === 'lat' || field === 'lng') stop[field] = Number(value);
			else stop[field] = value;
		}
		return [...stops.values()].filter(stop => Number.isFinite(stop.lat) && Number.isFinite(stop.lng));
	}
	const ROUTE_PATH_REGEX = /routeObj\[(\d+)\]\.polyline = L\.polyline\((.*?), \{/g;
	function parse_routes(html: string): BusGeniusRoute[] {
		const routes: BusGeniusRoute[] = [];
		for (const match of html.matchAll(ROUTE_PATH_REGEX)) {
			const rings = JSON.parse(match[2]) as [number, number][][];
			const path = rings.flat();
			if (path.length >= 2) routes.push({ id: Number(match[1]), path });
		}
		return routes;
	}
	export async function map(live_url: string): PromiseResult<BusGeniusMap> {
		const map_response = await rozfetch(`https://www.busgenius.com/setup_map_url?${encode_params({ live_url })}`);
		if ('error' in map_response) return map_response;
		const html = await map_response.text();
		const stops = parse_stops(html);
		if (stops.length === 0) return generror('BusGenius map: no checkpoints found in map page', 'MEDIUM', { live_url });
		return { routes: parse_routes(html), stops };
	}
	export async function nau_map() {
		return await map('nau');
	}
}
