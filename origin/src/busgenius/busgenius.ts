import rozfetch from '@common/rozfetch';
import { CookieJar } from '@common/utils/cookie_util';
import { encode_params } from '@common/utils/fetch_util';
import type { BusGeniusRouteResponse } from './types';

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
}
