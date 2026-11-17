export interface BusGeniusRouteResponse {
	active_sorted_route_ids: number[];
	sorted_route_ids: number[];
	buses: Bus[];
	arrival_forecasts: ArrivalForecasts;
	announcements: Announcement[];
	local_time: string;
}

export interface Bus {
	id: number;
	name: string;
	abbrev: string;
	lat: number;
	lng: number;
	route_id: number;
	smoothed_heading: number;
	passenger_count: number;
	capacity: number;
	at_stop: boolean;
}

export type ArrivalForecasts = Record<number, ArrivalForecast[]>;

export interface ArrivalForecast {
	forecast: string;
	forecast_clock_time: string;
	bus: string;
}

export interface Announcement {
	id: number;
	content: string;
	date_time_str: string;
}

export interface BusGeniusStop {
	id: number;
	route_id: number;
	name: string;
	abbrev: string;
	route_abbrev: string;
	lat: number;
	lng: number;
}
