import type { PromiseResult, ResponseSuccess } from "@common/types";
import { distance_m, METERS_PER_MILE } from "@common/utils/geo_util";
import { Lessy } from "./lessy";
import { RoutePath } from "./route_path";

export namespace Analyzer {
    export const STOP_RADIUS_M = 40;
    export const SLOT_MINUTES = 15;
    export const NEAR_TERM_MINUTES = 20;
    export const HISTORY_DAYS = 56;
    export const MAX_SNAPSHOT_GAP_MINUTES = 5;
    export const MAX_HEADWAY_MINUTES = 120;
    export const DEFAULT_SPEED_MPH = 12;
    export const DEFAULT_DWELL_MINUTES: Record<Lessy.Source, number> = { busgenius: 1, mountain_line: 0.25 };
    export const BUSGENIUS_TERMINAL_STOP_IDS = ['1525'];
    export const TERMINAL_PRIOR = 0.3;
    export const PRIOR_WEIGHT = 3;
    export const DISAPPEAR_THRESHOLD = 0.5;
    export const MAX_LAPS = 2;

    const MINUTE_MS = 60_000;
    const DAY_MS = 86_400_000;
    const SLOTS_PER_DAY = 24 * 60 / SLOT_MINUTES;

    export interface Snapshot {
        timestamp: Date;
        buses: Lessy.Bus[];
    };

    export interface SnapshotStore {
        append(snapshot: Snapshot): PromiseResult<ResponseSuccess>;
        range(from: Date, to: Date): PromiseResult<Snapshot[]>;
    };

    export class MemorySnapshotStore implements SnapshotStore {
        private snapshots: Snapshot[] = [];
        async append(snapshot: Snapshot): PromiseResult<ResponseSuccess> {
            this.snapshots.push(snapshot);
            return { success: true };
        }
        async range(from: Date, to: Date): PromiseResult<Snapshot[]> {
            return this.snapshots.filter(snapshot => snapshot.timestamp >= from && snapshot.timestamp <= to);
        }
    };

    export type PredictedStop = Lessy.Stop & {
        predicted_waiting: number | null;
        minutes_until_bus: number | null;
    };

    interface Sample {
        sum: number;
        count: number;
    };
    type Samples = Map<string, Sample>;

    interface Model {
        boardings: Samples;
        headways: Samples;
        dwells: Samples;
        disappearances: Samples;
        terminal_priors: Set<string>;
        speed_mph: Record<Lessy.Source, number>;
    };

    interface StopEvent {
        stop_key: string;
        travelled_m: number;
        arrive_min: number;
        depart_min: number;
        disappears: boolean;
        current: boolean;
    };

    interface Journey {
        route: Lessy.Route;
        start_m: number;
        meters_per_min: number;
        events: StopEvent[];
    };

    interface BusState {
        lat: number;
        lon: number;
        passenger_count: number;
        time: number;
        route?: Lessy.Route;
        path_m?: number;
        stop_key?: string;
        count_before?: number;
        arrived_at?: number;
    };

    function slot_of(date: Date) {
        const { day, weekday, minutes } = Lessy.arizona_time(date);
        return {
            day,
            weekday,
            minutes,
            slot: Math.floor(minutes / SLOT_MINUTES),
            day_type: weekday === 0 || weekday === 6 ? 'weekend' : 'weekday'
        };
    }

    function add_sample(samples: Samples, key: string, value: number) {
        const sample = samples.get(key) ?? { sum: 0, count: 0 };
        sample.sum += value;
        sample.count++;
        samples.set(key, sample);
    }

    function add_bucketed(samples: Samples, id: string, date: Date, value: number) {
        const { weekday, slot, day_type } = slot_of(date);
        add_sample(samples, `${id}|d${weekday}|${slot}`, value);
        add_sample(samples, `${id}|${day_type}|${slot}`, value);
    }

    function lookup_sample(samples: Samples, id: string, date: Date): Sample | null {
        const { weekday, slot, day_type } = slot_of(date);
        const previous_slot = (slot + SLOTS_PER_DAY - 1) % SLOTS_PER_DAY;
        const next_slot = (slot + 1) % SLOTS_PER_DAY;
        const tiers = [
            [`${id}|d${weekday}|${slot}`],
            [`${id}|d${weekday}|${previous_slot}`, `${id}|d${weekday}|${next_slot}`],
            [`${id}|${day_type}|${slot}`]
        ];
        for (const tier of tiers) {
            let sum = 0, count = 0;
            for (const key of tier) {
                const sample = samples.get(key);
                if (sample === undefined) continue;
                sum += sample.sum;
                count += sample.count;
            }
            if (count > 0) return { sum, count };
        }
        return null;
    }

    function lookup(samples: Samples, id: string, date: Date): number | null {
        const sample = lookup_sample(samples, id, date);
        return sample !== null ? sample.sum / sample.count : null;
    }

    function nearest_stop(bus: Lessy.Bus, stops: Lessy.Stop[]) {
        let nearest: Lessy.Stop | undefined;
        let nearest_m = STOP_RADIUS_M;
        for (const stop of stops) {
            if (stop.source !== bus.source) continue;
            const meters = distance_m(bus, stop);
            if (meters > nearest_m) continue;
            nearest = stop;
            nearest_m = meters;
        }
        return nearest;
    }

    function terminal_priors({ routes }: Lessy.Network) {
        const priors = new Set(BUSGENIUS_TERMINAL_STOP_IDS.map(id => Lessy.key({ id, source: 'busgenius' })));
        for (const route of routes) {
            if (route.source !== 'mountain_line') continue;
            const first = Object.entries(route.stop_distances_m).sort((a, b) => a[1] - b[1])[0];
            if (first !== undefined) priors.add(first[0]);
        }
        return priors;
    }

    function build_model(snapshots: Snapshot[], network: Lessy.Network): Model {
        const { stops, routes } = network;
        const boardings: Samples = new Map();
        const headways: Samples = new Map();
        const dwells: Samples = new Map();
        const disappearances: Samples = new Map();
        const speeds: Samples = new Map();
        const states = new Map<string, BusState>();
        const last_departure = new Map<string, number>();
        const sorted = [...snapshots].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
        let previous_time: number | undefined;

        for (const snapshot of sorted) {
            const time = snapshot.timestamp.getTime();
            const present = new Set<string>();
            for (const bus of snapshot.buses) {
                const bus_key = Lessy.key(bus);
                present.add(bus_key);
                const previous = states.get(bus_key);
                const stop = nearest_stop(bus, stops);
                const stop_key = stop && Lessy.key(stop);
                const route = RoutePath.find_route(routes, bus);
                const path_m = route && RoutePath.position(bus, route);
                const state: BusState = { lat: bus.lat, lon: bus.lon, passenger_count: bus.passenger_count, time, route, path_m, stop_key };
                const fresh = previous !== undefined && time - previous.time <= MAX_SNAPSHOT_GAP_MINUTES * MINUTE_MS;

                if (fresh) {
                    const midpoint = (previous.time + time) / 2;
                    const hours = (time - previous.time) / (60 * MINUTE_MS);
                    const meters = travelled_m(previous, state) ?? distance_m(previous, bus);
                    const mph = hours > 0 ? meters / METERS_PER_MILE / hours : 0;
                    if (previous.stop_key === undefined && stop_key === undefined && mph > 1 && mph < 60) add_sample(speeds, bus.source, mph);

                    if (previous.stop_key !== undefined && previous.stop_key !== stop_key) {
                        add_bucketed(disappearances, previous.stop_key, snapshot.timestamp, 0);
                        if (previous.count_before !== undefined) {
                            add_bucketed(boardings, previous.stop_key, snapshot.timestamp, Math.max(0, bus.passenger_count - previous.count_before));
                        }
                        if (previous.arrived_at !== undefined) {
                            add_bucketed(dwells, previous.stop_key, snapshot.timestamp, (midpoint - previous.arrived_at) / MINUTE_MS);
                        }
                        const last = last_departure.get(previous.stop_key);
                        if (last !== undefined && time - last <= MAX_HEADWAY_MINUTES * MINUTE_MS) {
                            add_bucketed(headways, previous.stop_key, snapshot.timestamp, (time - last) / MINUTE_MS);
                        }
                        last_departure.set(previous.stop_key, time);
                    }
                    if (stop_key !== undefined) {
                        const same_stop = previous.stop_key === stop_key;
                        state.count_before = same_stop ? previous.count_before : previous.passenger_count;
                        state.arrived_at = same_stop ? previous.arrived_at : midpoint;
                    }
                }
                states.set(bus_key, state);
            }

            if (previous_time !== undefined && time - previous_time <= MAX_SNAPSHOT_GAP_MINUTES * MINUTE_MS) {
                for (const [bus_key, state] of states) {
                    if (present.has(bus_key) || state.time !== previous_time) continue;
                    if (state.stop_key !== undefined) add_bucketed(disappearances, state.stop_key, new Date(state.time), 1);
                    states.delete(bus_key);
                }
            }
            previous_time = time;
        }

        const speed_of_source = (source: Lessy.Source) => {
            const sample = speeds.get(source);
            return sample !== undefined ? sample.sum / sample.count : DEFAULT_SPEED_MPH;
        };
        return {
            boardings,
            headways,
            dwells,
            disappearances,
            terminal_priors: terminal_priors(network),
            speed_mph: {
                busgenius: speed_of_source('busgenius'),
                mountain_line: speed_of_source('mountain_line')
            }
        };
    }

    function dwell_minutes(model: Model, stop_key: string, source: Lessy.Source, timestamp: Date) {
        return lookup(model.dwells, stop_key, timestamp) ?? DEFAULT_DWELL_MINUTES[source];
    }

    function disappear_probability(model: Model, stop_key: string, timestamp: Date) {
        const sample = lookup_sample(model.disappearances, stop_key, timestamp);
        const prior = model.terminal_priors.has(stop_key) ? TERMINAL_PRIOR : 0;
        return ((sample?.sum ?? 0) + prior * PRIOR_WEIGHT) / ((sample?.count ?? 0) + PRIOR_WEIGHT);
    }

    function disappears_at(model: Model, stop_key: string, timestamp: Date) {
        return disappear_probability(model, stop_key, timestamp) >= DISAPPEAR_THRESHOLD;
    }

    function travelled_m(previous: BusState, current: BusState) {
        if (current.route === undefined || previous.route !== current.route) return undefined;
        if (previous.path_m === undefined || current.path_m === undefined) return undefined;
        return RoutePath.distance_ahead(current.route, previous.path_m, current.path_m);
    }

    function speed_of(bus: Lessy.Bus, model: Model) {
        return bus.speed_mph !== undefined && bus.speed_mph > 1 ? bus.speed_mph : model.speed_mph[bus.source];
    }

    function offset_minutes(timestamp: Date, now: Date) {
        return (timestamp.getTime() - now.getTime()) / MINUTE_MS;
    }

    function is_near_term(offset: number) {
        return Math.abs(offset) <= NEAR_TERM_MINUTES;
    }

    async function load_history(store: SnapshotStore, now: Date) {
        return await store.range(new Date(now.getTime() - HISTORY_DAYS * DAY_MS), now);
    }

    export async function record_snapshot(store: SnapshotStore, timestamp = new Date()): PromiseResult<Snapshot> {
        const snapshot: Snapshot = { timestamp, buses: await Lessy.all_buses(timestamp) };
        const appended = await store.append(snapshot);
        if ('error' in appended) return appended;
        return snapshot;
    }

    function journey(bus: Lessy.Bus, routes: Lessy.Route[], model: Model, timestamp: Date, horizon_min: number): Journey | undefined {
        const route = RoutePath.find_route(routes, bus);
        const start_m = route && RoutePath.position(bus, route);
        if (route === undefined || start_m === undefined) return undefined;
        const meters_per_min = speed_of(bus, model) * METERS_PER_MILE / 60;

        const ahead = Object.entries(route.stop_distances_m)
            .map(([stop_key, stop_m]) => ({ stop_key, ahead_m: RoutePath.distance_ahead(route, start_m, stop_m) }))
            .filter((stop): stop is { stop_key: string, ahead_m: number } => stop.ahead_m !== undefined)
            .sort((a, b) => a.ahead_m - b.ahead_m);
        const is_current = (ahead_m: number) => ahead_m <= STOP_RADIUS_M || (route.loop && route.length_m - ahead_m <= STOP_RADIUS_M);

        const events: StopEvent[] = [];
        let clock = 0;
        let travelled = 0;
        const current = ahead.find(stop => is_current(stop.ahead_m));
        if (current !== undefined) {
            clock = dwell_minutes(model, current.stop_key, bus.source, timestamp) / 2;
            const disappears = disappears_at(model, current.stop_key, timestamp);
            events.push({ stop_key: current.stop_key, travelled_m: 0, arrive_min: 0, depart_min: clock, disappears, current: true });
            if (disappears) return { route, start_m, meters_per_min, events };
        }

        const laps = route.loop ? MAX_LAPS : 1;
        for (let lap = 0; lap < laps; lap++) {
            for (const stop of ahead) {
                if (lap === 0 && stop === current) continue;
                const stop_travelled = stop.ahead_m + lap * route.length_m;
                if (stop_travelled <= travelled) continue;
                const arrive_min = clock + (stop_travelled - travelled) / meters_per_min;
                if (arrive_min > horizon_min) return { route, start_m, meters_per_min, events };
                const depart_min = arrive_min + dwell_minutes(model, stop.stop_key, bus.source, timestamp);
                const disappears = disappears_at(model, stop.stop_key, timestamp);
                events.push({ stop_key: stop.stop_key, travelled_m: stop_travelled, arrive_min, depart_min, disappears, current: false });
                if (disappears) return { route, start_m, meters_per_min, events };
                clock = depart_min;
                travelled = stop_travelled;
            }
        }
        return { route, start_m, meters_per_min, events };
    }

    function live_minutes_until_bus(stop: Lessy.Stop, live: Lessy.Live, routes: Lessy.Route[], model: Model, timestamp: Date, elapsed: number) {
        const stop_key = Lessy.key(stop);
        const forecast = live.forecast_minutes[stop_key];
        if (forecast !== undefined && forecast >= elapsed) return forecast - elapsed;

        let best: number | undefined;
        for (const bus of live.buses) {
            if (bus.source !== stop.source) continue;
            const event = journey(bus, routes, model, timestamp, elapsed + NEAR_TERM_MINUTES)?.events.find(event => event.stop_key === stop_key);
            if (event === undefined || event.disappears || event.depart_min < elapsed) continue;
            const remaining = Math.max(0, event.arrive_min - elapsed);
            if (best === undefined || remaining < best) best = remaining;
        }
        return best;
    }

    export async function predict_stops(store: SnapshotStore, timestamp: Date): PromiseResult<PredictedStop[]> {
        const now = new Date();
        const offset = offset_minutes(timestamp, now);
        const [history, network, live] = await Promise.all([
            load_history(store, now),
            Lessy.network(timestamp),
            is_near_term(offset) ? Lessy.live(now) : undefined
        ]);
        if ('error' in history) return history;
        const model = build_model(history, network);

        return network.stops.map(stop => {
            const stop_key = Lessy.key(stop);
            const headway = lookup(model.headways, stop_key, timestamp);
            const live_minutes = live && live_minutes_until_bus(stop, live, network.routes, model, timestamp, Math.max(0, offset));
            return {
                ...stop,
                predicted_waiting: lookup(model.boardings, stop_key, timestamp),
                minutes_until_bus: live_minutes ?? (headway !== null ? headway / 2 : null)
            };
        });
    }

    function boarded(model: Model, stop_keys: string[], timestamp: Date) {
        return stop_keys.reduce((sum, stop_key) => sum + (lookup(model.boardings, stop_key, timestamp) ?? 0), 0);
    }

    function extrapolate_bus(bus: Lessy.Bus, routes: Lessy.Route[], model: Model, timestamp: Date, elapsed: number): Lessy.Bus | undefined {
        if (elapsed <= 0) return { ...bus, last_updated: timestamp };
        const trip = journey(bus, routes, model, timestamp, elapsed);
        if (trip === undefined) return { ...bus, last_updated: timestamp };

        const passed: string[] = [];
        let travelled = 0;
        let moving_since = 0;
        let at_stop = false;
        for (const event of trip.events) {
            if (elapsed < event.arrive_min) break;
            if (event.disappears && elapsed >= event.depart_min) return undefined;
            if (!event.current) passed.push(event.stop_key);
            travelled = event.travelled_m;
            moving_since = event.depart_min;
            if (elapsed <= event.depart_min) {
                at_stop = true;
                break;
            }
        }
        if (!at_stop) travelled += (elapsed - moving_since) * trip.meters_per_min;

        const moved = RoutePath.advance(trip.route, trip.start_m, travelled);
        return {
            ...bus,
            ...moved.point,
            heading_deg: moved.heading,
            path_distance_m: bus.path_distance_m !== undefined ? moved.distance_m : undefined,
            passenger_count: Math.min(bus.capacity, bus.passenger_count + boarded(model, passed, timestamp)),
            last_updated: timestamp
        };
    }

    function historical_buses(history: Snapshot[], timestamp: Date): Lessy.Bus[] {
        const target = slot_of(timestamp);
        const in_slot = history.map(snapshot => ({ snapshot, slot: slot_of(snapshot.timestamp) })).filter(({ slot }) => slot.slot === target.slot);
        const same_weekday = in_slot.filter(({ slot }) => slot.weekday === target.weekday);
        const pool = same_weekday.length > 0 ? same_weekday : in_slot.filter(({ slot }) => slot.day_type === target.day_type);
        if (pool.length === 0) return [];

        const occupancy: Samples = new Map();
        for (const { snapshot } of pool) {
            for (const bus of snapshot.buses) {
                if (bus.capacity > 0) add_sample(occupancy, bus.source, bus.passenger_count / bus.capacity);
            }
        }
        const layout = [...pool].sort((a, b) => b.slot.day - a.slot.day || Math.abs(a.slot.minutes - target.minutes) - Math.abs(b.slot.minutes - target.minutes))[0];

        return layout.snapshot.buses
            .filter(bus => Lessy.source_active(bus.source, timestamp))
            .map(bus => {
                const sample = occupancy.get(bus.source);
                const ratio = sample !== undefined ? sample.sum / sample.count : bus.passenger_count / Math.max(1, bus.capacity);
                return { ...bus, passenger_count: ratio * bus.capacity, last_updated: timestamp };
            });
    }

    export async function predict_buses(store: SnapshotStore, timestamp: Date): PromiseResult<Lessy.Bus[]> {
        const now = new Date();
        const offset = offset_minutes(timestamp, now);
        if (!is_near_term(offset)) {
            const history = await load_history(store, now);
            if ('error' in history) return history;
            return historical_buses(history, timestamp);
        }

        const [history, network, live] = await Promise.all([
            load_history(store, now),
            Lessy.network(now),
            Lessy.live(now)
        ]);
        if ('error' in history) return history;
        const model = build_model(history, network);
        return live.buses
            .map(bus => extrapolate_bus(bus, network.routes, model, timestamp, Math.max(0, offset)))
            .filter((bus): bus is Lessy.Bus => bus !== undefined);
    }
}
