import { point_along_polyline, project_onto_polyline, type LatLon } from "@common/utils/geo_util";
import { Lessy } from "./lessy";

export namespace RoutePath {
    export const MAX_OFFSET_M = 150;

    export function find_route(routes: Lessy.Route[], bus: Lessy.Bus) {
        if (bus.route_id === undefined) return undefined;
        return routes.find(route => route.source === bus.source && route.id === bus.route_id);
    }

    export function position(bus: Lessy.Bus, route: Lessy.Route): number | undefined {
        if (bus.path_distance_m !== undefined && Number.isFinite(bus.path_distance_m)) return bus.path_distance_m;
        const projected = project_onto_polyline(bus, route.path, route.cumulative_m, bus.heading_deg);
        if (projected === undefined || projected.offset_m > MAX_OFFSET_M) return undefined;
        return projected.distance_m;
    }

    export function distance_ahead(route: Lessy.Route, from_m: number, to_m: number): number | undefined {
        const ahead = to_m - from_m;
        if (ahead >= 0) return ahead;
        return route.loop ? ahead + route.length_m : undefined;
    }

    export function advance(route: Lessy.Route, from_m: number, meters: number): { point: LatLon; heading: number; distance_m: number } {
        const target = from_m + meters;
        const distance = route.loop ? ((target % route.length_m) + route.length_m) % route.length_m : Math.min(target, route.length_m);
        return { ...point_along_polyline(route.path, route.cumulative_m, distance), distance_m: distance };
    }

    export function stops_passed(route: Lessy.Route, from_m: number, meters: number): string[] {
        return Object.entries(route.stop_distances_m)
            .filter(([, stop_m]) => {
                const ahead = distance_ahead(route, from_m, stop_m);
                return ahead !== undefined && ahead > 0 && ahead <= meters;
            })
            .map(([stop_key]) => stop_key);
    }
}
