import { cumulative_lengths_m, decode_polyline, distance_m, project_onto_polyline, type LatLon } from "@common/utils/geo_util";
import type { BusGeniusRoute, BusGeniusRouteResponse, BusGeniusStop } from "@origin/busgenius/types";
import { BusGenius, MountainLine } from "@origin/index";

export namespace Lessy {
    export type Source = 'busgenius' | 'mountain_line';

    export interface Bus {
        id: string;
        source: Source;
        lat: number;
		lon: number;
        passenger_count: number;
        capacity: number;
        last_updated: Date;
        heading_deg: number;
        speed_mph?: number;
        route_id?: string;
        path_distance_m?: number;
    };

    export interface Stop {
        id: string;
        source: Source;
        name: string;
        lat: number;
        lon: number;
        route_id?: string;
    };

    export interface Route {
        id: string;
        source: Source;
        path: LatLon[];
        cumulative_m: number[];
        length_m: number;
        loop: boolean;
        stop_distances_m: Record<string, number>;
        name?: string;
        color?: string;
    };

    export interface Network {
        stops: Stop[];
        routes: Route[];
    };

    export interface Live {
        buses: Bus[];
        forecast_minutes: Record<string, number>;
    };

    const ARIZONA_OFFSET_MS = -7 * 60 * 60 * 1000;
    const LOOP_CLOSURE_M = 50;
    const LUMBERJACK_ROUTE_IDS = new Set(BusGenius.NAU_LUMBERJACK_ROUTE.map(Number));

    export function key(item: { id: string, source: Source }) {
        return `${item.source}:${item.id}`;
    }

    export function arizona_time(date: Date) {
        const local = new Date(date.getTime() + ARIZONA_OFFSET_MS);
        return {
            day: Math.floor(local.getTime() / 86_400_000),
            weekday: local.getUTCDay(),
            minutes: local.getUTCHours() * 60 + local.getUTCMinutes()
        };
    }

    export function is_weekend(date: Date) {
        const { weekday } = arizona_time(date);
        return weekday === 0 || weekday === 6;
    }

    export function source_active(source: Source, date: Date) {
        return source !== 'busgenius' || !is_weekend(date);
    }

    function busgenius_bus_to_lessy_bus(bus: BusGeniusRouteResponse['buses'][0]): Bus {
        return {
            id: String(bus.id),
            source: 'busgenius',
            lat: bus.lat,
            lon: bus.lng,
            passenger_count: bus.passenger_count,
            capacity: bus.capacity,
            last_updated: new Date(),
            heading_deg: bus.smoothed_heading,
            route_id: String(bus.route_id)
        };
    }
    function mountain_line_bus_to_lessy_bus(bus: MountainLine.Bus): Bus {
        return {
            id: String(bus.id),
            source: 'mountain_line',
            lat: bus.lat,
            lon: bus.lon,
            passenger_count: bus.passengerLoad * bus.capacity,
            capacity: bus.capacity,
            last_updated: new Date(bus.lastUpdated),
            heading_deg: bus.headingDegrees,
            speed_mph: bus.speed,
            route_id: String(bus.patternId),
            path_distance_m: bus.shapeDistanceTraveled
        };
    }
    function busgenius_stop_to_lessy_stop(stop: BusGeniusStop): Stop {
        return {
            id: String(stop.id),
            source: 'busgenius',
            name: stop.name,
            lat: stop.lat,
            lon: stop.lng,
            route_id: String(stop.route_id)
        };
    }
    function mountain_line_stop_to_lessy_stop(stop: MountainLine.Stop): Stop {
        return {
            id: String(stop.id),
            source: 'mountain_line',
            name: stop.name,
            lat: stop.lat,
            lon: stop.lon
        };
    }

    function parse_forecast_minutes(forecast: string): number | undefined {
        const minutes = /^\s*(\d+)\s*(?:min|$)/i.exec(forecast);
        if (minutes !== null) return Number(minutes[1]);
        if (/arriv|now|due|<\s*1/i.test(forecast)) return 0;
        return undefined;
    }
    function busgenius_forecast_minutes(forecasts: BusGeniusRouteResponse['arrival_forecasts']) {
        const forecast_minutes: Record<string, number> = {};
        for (const [stop_id, stop_forecasts] of Object.entries(forecasts)) {
            const minutes = stop_forecasts
                .map(forecast => parse_forecast_minutes(forecast.forecast))
                .filter((value): value is number => value !== undefined);
            if (minutes.length > 0) forecast_minutes[key({ id: stop_id, source: 'busgenius' })] = Math.min(...minutes);
        }
        return forecast_minutes;
    }

    export async function live(timestamp = new Date()): Promise<Live> {
        const [busgenius_data, mountain_line_buses] = await Promise.all([
            source_active('busgenius', timestamp) ? BusGenius.nau_live_routes() : undefined,
            MountainLine.nau_live_route()
        ]);
        const buses: Bus[] = [];
        let forecast_minutes: Record<string, number> = {};
        if (busgenius_data !== undefined && !("error" in busgenius_data)) {
            buses.push(...busgenius_data.buses.filter(bus => LUMBERJACK_ROUTE_IDS.has(bus.route_id)).map(busgenius_bus_to_lessy_bus));
            forecast_minutes = busgenius_forecast_minutes(busgenius_data.arrival_forecasts);
        }
        if (!("error" in mountain_line_buses)) buses.push(...mountain_line_buses.map(mountain_line_bus_to_lessy_bus));
        return { buses, forecast_minutes };
    }

    export async function all_buses(timestamp = new Date()): Promise<Bus[]> {
        return (await live(timestamp)).buses;
    }

    function make_route(id: string, source: Source, path: LatLon[], loop: boolean, stop_distances_m: Record<string, number>): Route {
        const cumulative_m = cumulative_lengths_m(path);
        return { id, source, path, cumulative_m, length_m: cumulative_m[cumulative_m.length - 1], loop, stop_distances_m };
    }
    function stop_path_distances(route: Route, stops: BusGeniusStop[]) {
        return stops.map(stop => project_onto_polyline({ lat: stop.lat, lon: stop.lng }, route.path, route.cumulative_m)?.distance_m ?? 0);
    }
    function ascending_steps(distances: number[]) {
        let steps = 0;
        for (let i = 0; i < distances.length; i++) {
            if (distances[(i + 1) % distances.length] > distances[i]) steps++;
        }
        return steps;
    }
    function busgenius_route_to_lessy_route(route: BusGeniusRoute, stops: BusGeniusStop[]): Route {
        const route_stops = stops.filter(stop => stop.route_id === route.id);
        const drawn = route.path.map(([lat, lon]) => ({ lat, lon }));
        const loop = distance_m(drawn[0], drawn[drawn.length - 1]) <= LOOP_CLOSURE_M;
        const forward = make_route(String(route.id), 'busgenius', drawn, loop, {});
        const reversed = make_route(String(route.id), 'busgenius', [...drawn].reverse(), loop, {});
        const forward_distances = stop_path_distances(forward, route_stops);
        const reversed_distances = stop_path_distances(reversed, route_stops);
        const use_reversed = ascending_steps(reversed_distances) > ascending_steps(forward_distances);
        const lessy_route = use_reversed ? reversed : forward;
        const distances = use_reversed ? reversed_distances : forward_distances;
        route_stops.forEach((stop, i) => {
            lessy_route.stop_distances_m[key({ id: String(stop.id), source: 'busgenius' })] = distances[i];
        });
        return lessy_route;
    }
    async function mountain_line_routes(): Promise<Route[]> {
        const patterns = await MountainLine.nau_patterns();
        if ("error" in patterns) return [];
        const routes = await Promise.all(patterns.map(async pattern => {
            const pattern_stops = await MountainLine.nau_pattern_stops(pattern.id);
            const path = decode_polyline(pattern.shape);
            if (path.length < 2) return undefined;
            const stop_distances_m: Record<string, number> = {};
            if (!("error" in pattern_stops)) {
                for (const pattern_stop of pattern_stops) {
                    stop_distances_m[key({ id: String(pattern_stop.stop.id), source: 'mountain_line' })] = pattern_stop.shapeDistanceTraveled;
                }
            }
            const route: Route = { ...make_route(String(pattern.id), 'mountain_line', path, pattern.directionType === 'Loop', stop_distances_m), name: pattern.name, color: pattern.color };
            return route;
        }));
        return routes.filter((route): route is Route => route !== undefined);
    }

    export async function network(timestamp = new Date()): Promise<Network> {
        const [busgenius_map, mountain_line_stops, mountain_line_route_list] = await Promise.all([
            source_active('busgenius', timestamp) ? BusGenius.nau_map() : { routes: [], stops: [] },
            MountainLine.nau_stops(),
            mountain_line_routes()
        ]);
        const stops: Stop[] = [];
        const routes: Route[] = [...mountain_line_route_list];
        if (!("error" in busgenius_map)) {
            const lumberjack_stops = busgenius_map.stops.filter(stop => LUMBERJACK_ROUTE_IDS.has(stop.route_id));
            stops.push(...lumberjack_stops.map(busgenius_stop_to_lessy_stop));
            routes.push(...busgenius_map.routes.filter(route => LUMBERJACK_ROUTE_IDS.has(route.id)).map(route => busgenius_route_to_lessy_route(route, lumberjack_stops)));
        }
        if (!("error" in mountain_line_stops)) stops.push(...mountain_line_stops.map(mountain_line_stop_to_lessy_stop));
        return { stops, routes };
    }

    export async function all_stops(timestamp = new Date()): Promise<Stop[]> {
        return (await network(timestamp)).stops;
    }
}
