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
    // Dwell is modelled as P(bus stops) × how long it stays when it does. Mountain Line skips stops nobody
    // is waiting at or has requested, so its prior is a coin flip; BusGenius almost always stops.
    export const DEFAULT_STOP_RATE: Record<Lessy.Source, number> = { busgenius: 0.9, mountain_line: 0.5 };
    export const DEFAULT_DWELL_MINUTES: Record<Lessy.Source, number> = { busgenius: 0.75, mountain_line: 0.4 };
    export const MAX_DWELL_MINUTES = 10;
    export const STATIONARY_MPH = 2;
    export const STATIONARY_M = 8;
    // A stop crossed between two reports this close together without being seen there was skipped.
    export const MAX_PASS_GAP_S = 25;
    export const MAX_LEG_M = 1500;
    export const MAX_SPEED_MPH = 60;
    export const MIN_SEGMENT_MINUTES = 1;
    // Dwells are heavy-tailed (timepoint holds, layovers), so a parked bus's remaining dwell comes from the
    // stop's dwell histogram rather than the mean.
    export const DWELL_BIN_S = 10;
    export const MIN_HISTOGRAM_DWELLS = 5;
    // Whether a Mountain Line bus stops depends on who's waiting (more the longer since the last bus) and who's
    // aboard to request it, so stop rates are also learned per gap since the previous bus and per load.
    export const GAP_BIN_MINUTES = [2, 5, 10, 20];
    export const BUSY_LOAD_RATIO = 0.25;
    // Today's pace (snow, traffic, events) vs history: recent travel time over what history expected for the
    // same stretches, remembered for about PACE_MEMORY_MINUTES and shrunk toward 1 by PACE_PRIOR_MINUTES.
    export const PACE_MEMORY_MINUTES = 20;
    export const PACE_PRIOR_MINUTES = 5;
    export const PACE_LIMITS = [0.6, 1.6] as const;
    // A stretch's usual speed must be well established, or noise in it reads as buses running fast.
    export const PACE_MIN_HISTORY_MINUTES = 30;
    // An early bus waits at a timepoint for its scheduled departure; further early than this and it's more likely
    // the previous trip running late.
    export const MAX_TIMEPOINT_HOLD_MINUTES = 5;
    // Mountain Line pulls away from a stop slowly, speeds up, and slows again for lights and turns. Each
    // PROFILE_BIN_M of its route learns how slow it usually is there, which shapes where a bus is within a leg
    // (the leg's travel time still comes from segment_speeds). PROFILE_PRIOR_M of average speed smooths thin bins.
    export const PROFILE_BIN_M = 40;
    export const PROFILE_PRIOR_M = 120;
    // Riders leave in proportion to who's aboard (half the bus empties at the NAU Bookstore) and board in numbers
    // that depend on the stop, so a bus's load is carried stop by stop as load × (1 - share off) + riders on.
    export const DEFAULT_ALIGHT_SHARE = 0.1;
    export const BUSGENIUS_TERMINAL_STOP_IDS = ['1525'];
    export const TERMINAL_PRIOR = 0.3;
    export const PRIOR_WEIGHT = 3;
    export const DISAPPEAR_THRESHOLD = 0.5;
    export const MAX_LAPS = 2;
    export const ARRIVAL_HORIZON_MINUTES = 2 * NEAR_TERM_MINUTES;
    export const STALE_REPORT_MINUTES = 2;

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

    export interface Arrival {
        bus_id: string;
        source: Lessy.Source;
        route_id?: string;
        minutes: number;
        passenger_count: number;
        capacity: number;
    };

    export type PredictedStop = Lessy.Stop & {
        predicted_waiting: number | null;
        minutes_until_bus: number | null;
        upcoming: Arrival[];
    };

    interface Sample {
        sum: number;
        count: number;
    };
    type Samples = Map<string, Sample>;

    interface Layout {
        day: number;
        slot: number;
        day_type: 'weekday' | 'weekend';
        snapshots: { minutes: number; buses: Lessy.Bus[] }[];
    };

    export interface Model {
        boardings: Samples; // riders gained per bus visit (0 when it drove past)
        alightings: Samples; // share of the riders aboard who got off, per bus visit
        headways: Samples;
        dwells: Samples; // minutes, only for visits where the bus actually stopped
        stop_rates: Samples; // 1 stopped / 0 passed through, per visit
        segment_speeds: Samples; // metres (sum) over minutes (count) on the leg into a stop, dwell excluded
        motion: Map<string, Motion>; // bus key -> what its latest reports showed
        dwell_histograms: Map<string, number[]>; // stop key -> count of stopped dwells per DWELL_BIN_S bin
        last_departure: Map<string, number>; // stop key -> when a bus last left or passed it
        pace: Record<Lessy.Source, number>; // > 1: buses are running slower than usual right now
        profile: Samples; // route key#bin -> metres (sum) over minutes (count) through that bin, dwell excluded
        disappearances: Samples;
        terminal_priors: Set<string>;
        speed_mph: Record<Lessy.Source, number>;
        layouts: Map<string, Layout>;
        occupancy: Samples;
    };

    export interface Context {
        model: Model;
        network: Lessy.Network;
        live?: Lessy.Live;
        now?: Date;
    };

    interface StopEvent {
        stop_key: string;
        travelled_m: number;
        arrive_min: number;
        depart_min: number;
        disappears: boolean;
        current: boolean;
        meters_per_min: number; // on the leg into this stop
    };

    interface Journey {
        route: Lessy.Route;
        start_m: number;
        meters_per_min: number; // on the leg in progress when the journey ends
        events: StopEvent[];
    };

    export interface Motion {
        stationary: boolean;
        stopped_since?: number; // when it stopped at the stop it's sitting at now
    };

    interface Visit {
        stop_key: string;
        count_before: number;
        load: number; // load_bin on arrival
        stopped_from?: number;
        stopped_until?: number;
    };

    interface BusState {
        lat: number;
        lon: number;
        passenger_count: number;
        time: number;
        last_updated: number;
        route?: Lessy.Route;
        path_m?: number;
        stop_key?: string;
        stationary: boolean;
        visit?: Visit;
    };

    function slot_of(date: Date) {
        const { day, weekday, minutes } = Lessy.arizona_time(date);
        return {
            day,
            weekday,
            minutes,
            slot: Math.floor(minutes / SLOT_MINUTES),
            day_type: (weekday === 0 || weekday === 6 ? 'weekend' : 'weekday') as Layout['day_type']
        };
    }

    function add_sample(samples: Samples, key: string, value: number, weight = 1) {
        const sample = samples.get(key) ?? { sum: 0, count: 0 };
        sample.sum += value;
        sample.count += weight;
        samples.set(key, sample);
    }

    // Also files the sample under the bare id, the last fallback when no time bucket has data.
    function add_bucketed(samples: Samples, id: string, date: Date, value: number, weight = 1) {
        const { weekday, slot, day_type } = slot_of(date);
        add_sample(samples, `${id}|d${weekday}|${slot}`, value, weight);
        add_sample(samples, `${id}|${day_type}|${slot}`, value, weight);
        add_sample(samples, id, value, weight);
    }

    // any_time also falls back to every sample for the id, regardless of when it was taken.
    function lookup_sample(samples: Samples, id: string, date: Date, any_time = false): Sample | null {
        const { weekday, slot, day_type } = slot_of(date);
        const previous_slot = (slot + SLOTS_PER_DAY - 1) % SLOTS_PER_DAY;
        const next_slot = (slot + 1) % SLOTS_PER_DAY;
        const tiers = [
            [`${id}|d${weekday}|${slot}`],
            [`${id}|d${weekday}|${previous_slot}`, `${id}|d${weekday}|${next_slot}`],
            [`${id}|${day_type}|${slot}`],
            ...(any_time ? [[id]] : [])
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

    // Matching by distance along the bus's own route keeps it off the stop across the street (NB vs SB).
    function route_stop_at(route: Lessy.Route, path_m: number) {
        let nearest: string | undefined;
        let nearest_m = STOP_RADIUS_M;
        for (const [stop_key, stop_m] of Object.entries(route.stop_distances_m)) {
            let meters = Math.abs(stop_m - path_m);
            if (route.loop) meters = Math.min(meters, route.length_m - meters);
            if (meters > nearest_m) continue;
            nearest = stop_key;
            nearest_m = meters;
        }
        return nearest;
    }

    function next_stop_key(route: Lessy.Route, path_m: number) {
        let next: string | undefined;
        let next_m = Infinity;
        for (const [stop_key, stop_m] of Object.entries(route.stop_distances_m)) {
            const ahead = RoutePath.distance_ahead(route, path_m, stop_m);
            if (ahead === undefined || ahead <= 0 || ahead >= next_m) continue;
            next = stop_key;
            next_m = ahead;
        }
        return next;
    }

    function gap_bin(gap_minutes: number) {
        return GAP_BIN_MINUTES.filter(threshold => gap_minutes >= threshold).length;
    }

    // 0 empty, 1 a few riders aboard, 2 busy.
    function load_bin(passenger_count: number, capacity: number) {
        if (passenger_count < 1) return 0;
        return passenger_count < BUSY_LOAD_RATIO * capacity ? 1 : 2;
    }

    // Calls visit(bin, metres in that bin) for the stretch of route starting at from_m.
    function each_bin(route: Lessy.Route, from_m: number, meters: number, visit: (bin: number, length: number) => void) {
        let position = from_m, remaining = meters;
        while (remaining > 1e-6) {
            const at = route.loop ? ((position % route.length_m) + route.length_m) % route.length_m : position;
            if (at >= route.length_m) return;
            const bin = Math.floor(at / PROFILE_BIN_M);
            const length = Math.min(remaining, Math.min((bin + 1) * PROFILE_BIN_M, route.length_m) - at);
            if (length <= 0) return;
            visit(bin, length);
            position += length;
            remaining -= length;
        }
    }

    function segment_key(route: Lessy.Route, stop_key: string) {
        return `${Lessy.key(route)}>${stop_key}`;
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

    // Incremental model: feed snapshots in chronological order with add(), read the current model with model().
    export class ModelBuilder {
        private readonly boardings: Samples = new Map();
        private readonly alightings: Samples = new Map();
        private readonly headways: Samples = new Map();
        private readonly dwells: Samples = new Map();
        private readonly dwell_histograms = new Map<string, number[]>();
        private readonly stop_rates: Samples = new Map();
        private readonly segment_speeds: Samples = new Map();
        private readonly profile: Samples = new Map();
        private readonly disappearances: Samples = new Map();
        private readonly speeds: Samples = new Map();
        private readonly occupancy: Samples = new Map();
        private readonly layouts = new Map<string, Layout>();
        private readonly states = new Map<string, BusState>();
        private readonly last_departure = new Map<string, number>();
        private readonly terminal_priors: Set<string>;
        private readonly pace: Record<Lessy.Source, { actual: number; expected: number; time: number }> = {
            busgenius: { actual: 0, expected: 0, time: 0 },
            mountain_line: { actual: 0, expected: 0, time: 0 }
        };
        private previous_time: number | undefined;

        constructor(private readonly network: Lessy.Network) {
            this.terminal_priors = terminal_priors(network);
        }

        // Snapshots must arrive in order; a repeat of the previous timestamp (e.g. two collectors) is dropped.
        add(snapshot: Snapshot) {
            const { stops, routes } = this.network;
            const { segment_speeds, speeds, states } = this;
            const time = snapshot.timestamp.getTime();
            if (this.previous_time !== undefined && time <= this.previous_time) return;
            const previous_time = this.previous_time;
            const present = new Set<string>();
            for (const bus of snapshot.buses) {
                const bus_key = Lessy.key(bus);
                present.add(bus_key);
                const previous = states.get(bus_key);
                const last_updated = bus.last_updated.getTime();
                // No new report since last time (or a long-silent bus): nothing new was observed.
                if (previous !== undefined && last_updated === previous.last_updated) continue;
                if (time - last_updated > STALE_REPORT_MINUTES * MINUTE_MS) {
                    if (previous !== undefined) this.close_visit(previous, previous.time);
                    states.delete(bus_key);
                    continue;
                }

                const route = RoutePath.find_route(routes, bus);
                const path_m = route && RoutePath.position(bus, route);
                const nearest = route === undefined || path_m === undefined ? nearest_stop(bus, stops) : undefined;
                const stop_key = route !== undefined && path_m !== undefined ? route_stop_at(route, path_m) : nearest && Lessy.key(nearest);
                const fresh = previous !== undefined && time - previous.time <= MAX_SNAPSHOT_GAP_MINUTES * MINUTE_MS;
                const moved_m = fresh ? travelled_m(previous, { route, path_m }) : undefined;
                const stationary = bus.speed_mph !== undefined
                    ? bus.speed_mph < STATIONARY_MPH
                    : fresh && (moved_m ?? distance_m(previous, bus)) < STATIONARY_M;
                const state: BusState = { lat: bus.lat, lon: bus.lon, passenger_count: bus.passenger_count, time, last_updated, route, path_m, stop_key, stationary };

                if (!fresh) {
                    if (previous !== undefined) this.close_visit(previous, previous.time);
                } else {
                    const midpoint = (previous.time + time) / 2;
                    const minutes = (time - previous.time) / MINUTE_MS;
                    // Dwells start and end at interval midpoints, so each end parked at a stop gives half the
                    // interval to dwell; only the rest is travel time.
                    const was_parked = previous.visit?.stopped_until === previous.time;
                    const now_parked = stationary && stop_key !== undefined;
                    const travel_minutes = minutes * (1 - (was_parked ? 0.5 : 0) - (now_parked ? 0.5 : 0));
                    const meters = moved_m ?? (route === undefined ? distance_m(previous, bus) : undefined);
                    if (meters !== undefined && travel_minutes > 0 && meters <= MAX_LEG_M && meters / travel_minutes < MAX_SPEED_MPH * METERS_PER_MILE / 60) {
                        const into = moved_m !== undefined ? next_stop_key(route!, previous.path_m!) : undefined;
                        if (into !== undefined) {
                            const segment = segment_key(route!, into);
                            const usual = lookup_sample(segment_speeds, segment, snapshot.timestamp, true);
                            if (usual !== null && usual.count >= PACE_MIN_HISTORY_MINUTES && usual.sum > 0) this.add_pace(bus.source, time, travel_minutes, meters / (usual.sum / usual.count));
                            add_bucketed(segment_speeds, segment, snapshot.timestamp, meters, travel_minutes);
                        }
                        add_sample(speeds, bus.source, meters, travel_minutes);
                        if (moved_m !== undefined) this.add_profile(route!, previous.path_m!, moved_m, travel_minutes);
                    }

                    // Stops crossed between reports without ever being seen inside their radius.
                    if (moved_m !== undefined && moved_m > 0 && moved_m <= MAX_LEG_M && time - previous.time <= MAX_PASS_GAP_S * 1000) {
                        for (const passed of RoutePath.stops_passed(route!, previous.path_m!, moved_m)) {
                            if (passed === previous.visit?.stop_key || passed === stop_key) continue;
                            this.record_departure(passed, snapshot.timestamp, load_bin(previous.passenger_count, bus.capacity), false, 0, 0, previous.passenger_count >= 1 ? 0 : undefined);
                        }
                    }

                    if (previous.visit !== undefined && previous.visit.stop_key !== stop_key) this.close_visit(previous, midpoint, bus.passenger_count);
                    if (stop_key !== undefined) {
                        const visit: Visit = previous.visit?.stop_key === stop_key ? previous.visit : { stop_key, count_before: previous.passenger_count, load: load_bin(previous.passenger_count, bus.capacity) };
                        if (stationary) {
                            visit.stopped_from ??= midpoint;
                            visit.stopped_until = time;
                        }
                        state.visit = visit;
                    }
                }
                states.set(bus_key, state);
            }

            if (previous_time !== undefined && time - previous_time <= MAX_SNAPSHOT_GAP_MINUTES * MINUTE_MS) {
                for (const [bus_key, state] of states) {
                    if (present.has(bus_key) || state.time !== previous_time) continue;
                    if (state.visit !== undefined) add_bucketed(this.disappearances, state.visit.stop_key, new Date(state.time), 1);
                    states.delete(bus_key);
                }
            }
            this.add_layout(snapshot);
            this.previous_time = time;
        }

        // Spreads an interval's travel over the bins it covered; a bus that didn't move (a red light) adds its
        // time to the bin it waited in.
        private add_profile(route: Lessy.Route, from_m: number, meters: number, minutes: number) {
            const key = (bin: number) => `${Lessy.key(route)}#${bin}`;
            if (meters <= 0) {
                each_bin(route, from_m, 1, bin => add_sample(this.profile, key(bin), 0, minutes));
                return;
            }
            each_bin(route, from_m, meters, (bin, length) => add_sample(this.profile, key(bin), length, minutes * length / meters));
        }

        private add_pace(source: Lessy.Source, time: number, actual_minutes: number, expected_minutes: number) {
            const pace = this.pace[source];
            const decay = Math.exp(-Math.max(0, time - pace.time) / (PACE_MEMORY_MINUTES * MINUTE_MS));
            pace.actual = pace.actual * decay + actual_minutes;
            pace.expected = pace.expected * decay + expected_minutes;
            pace.time = time;
        }

        private pace_of(source: Lessy.Source) {
            const pace = this.pace[source];
            const decay = this.previous_time !== undefined ? Math.exp(-Math.max(0, this.previous_time - pace.time) / (PACE_MEMORY_MINUTES * MINUTE_MS)) : 0;
            const ratio = (pace.actual * decay + PACE_PRIOR_MINUTES) / (pace.expected * decay + PACE_PRIOR_MINUTES);
            return Math.min(PACE_LIMITS[1], Math.max(PACE_LIMITS[0], ratio));
        }

        // The bus has left state.visit's stop (at time `left`); passenger_count is its load afterwards.
        private close_visit(state: BusState, left: number, passenger_count = state.passenger_count) {
            const visit = state.visit;
            if (visit === undefined) return;
            state.visit = undefined;
            const date = new Date(left);
            const stopped = visit.stopped_from !== undefined;
            const dwell = stopped ? (Math.min(left, visit.stopped_until! + (left - state.time)) - visit.stopped_from!) / MINUTE_MS : 0;
            add_bucketed(this.disappearances, visit.stop_key, date, 0);
            const change = passenger_count - visit.count_before;
            const alighted = visit.count_before >= 1 ? Math.max(0, -change) / visit.count_before : undefined;
            this.record_departure(visit.stop_key, date, visit.load, stopped, dwell, Math.max(0, change), alighted);
        }

        // alighted is the share of riders aboard who got off; undefined when the bus arrived empty.
        private record_departure(stop_key: string, date: Date, load: number, stopped: boolean, dwell_minutes: number, boarded: number, alighted: number | undefined) {
            const time = date.getTime();
            const last = this.last_departure.get(stop_key);
            add_bucketed(this.stop_rates, stop_key, date, stopped ? 1 : 0);
            if (last !== undefined) {
                const gap = gap_bin((time - last) / MINUTE_MS);
                add_sample(this.stop_rates, `${stop_key}|g${gap}`, stopped ? 1 : 0);
                add_sample(this.stop_rates, `${stop_key}|g${gap}|l${load}`, stopped ? 1 : 0);
            }
            if (stopped && dwell_minutes <= MAX_DWELL_MINUTES) {
                add_bucketed(this.dwells, stop_key, date, Math.max(0, dwell_minutes));
                const histogram = this.dwell_histograms.get(stop_key) ?? new Array<number>(MAX_DWELL_MINUTES * 60 / DWELL_BIN_S + 1).fill(0);
                histogram[Math.floor(Math.max(0, dwell_minutes) * 60 / DWELL_BIN_S)]++;
                this.dwell_histograms.set(stop_key, histogram);
            }
            add_bucketed(this.boardings, stop_key, date, boarded);
            if (alighted !== undefined) add_bucketed(this.alightings, stop_key, date, alighted);
            if (last !== undefined && time - last <= MAX_HEADWAY_MINUTES * MINUTE_MS) {
                add_bucketed(this.headways, stop_key, date, (time - last) / MINUTE_MS);
            }
            this.last_departure.set(stop_key, time);
        }

        private add_layout(snapshot: Snapshot) {
            const { day, weekday, minutes, slot, day_type } = slot_of(snapshot.timestamp);
            const layout_key = `d${weekday}|${slot}`;
            const layout = this.layouts.get(layout_key);
            const entry = { minutes, buses: snapshot.buses };
            if (layout === undefined || day > layout.day) this.layouts.set(layout_key, { day, slot, day_type, snapshots: [entry] });
            else if (day === layout.day) layout.snapshots.push(entry);
            for (const bus of snapshot.buses) {
                if (bus.capacity <= 0) continue;
                add_sample(this.occupancy, `${bus.source}|d${weekday}|${slot}`, bus.passenger_count / bus.capacity);
                add_sample(this.occupancy, `${bus.source}|${day_type}|${slot}`, bus.passenger_count / bus.capacity);
            }
        }

        model(): Model {
            const speed_of_source = (source: Lessy.Source) => {
                const sample = this.speeds.get(source);
                return sample !== undefined && sample.count > 0 ? sample.sum / sample.count * 60 / METERS_PER_MILE : DEFAULT_SPEED_MPH;
            };
            const motion = new Map<string, Motion>();
            for (const [bus_key, state] of this.states) {
                const stopped = state.visit?.stopped_from !== undefined && state.visit.stopped_until === state.time;
                motion.set(bus_key, { stationary: state.stationary, stopped_since: stopped ? state.visit!.stopped_from : undefined });
            }
            return {
                motion,
                dwell_histograms: this.dwell_histograms,
                last_departure: this.last_departure,
                profile: this.profile,
                pace: { busgenius: this.pace_of('busgenius'), mountain_line: this.pace_of('mountain_line') },
                boardings: this.boardings,
                alightings: this.alightings,
                headways: this.headways,
                dwells: this.dwells,
                stop_rates: this.stop_rates,
                segment_speeds: this.segment_speeds,
                disappearances: this.disappearances,
                terminal_priors: this.terminal_priors,
                speed_mph: {
                    busgenius: speed_of_source('busgenius'),
                    mountain_line: speed_of_source('mountain_line')
                },
                layouts: this.layouts,
                occupancy: this.occupancy
            };
        }
    };

    export function build_model(snapshots: Snapshot[], network: Lessy.Network): Model {
        const builder = new ModelBuilder(network);
        const sorted = [...snapshots].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
        for (const snapshot of sorted) builder.add(snapshot);
        return builder.model();
    }

    // How long the bus stays once it has stopped.
    function stopped_dwell_minutes(model: Model, stop_key: string, source: Lessy.Source, timestamp: Date) {
        const sample = lookup_sample(model.dwells, stop_key, timestamp, true);
        const prior = DEFAULT_DWELL_MINUTES[source];
        return ((sample?.sum ?? 0) + prior * PRIOR_WEIGHT) / ((sample?.count ?? 0) + PRIOR_WEIGHT);
    }

    function shrink(sample: Sample | null | undefined, prior: number) {
        return ((sample?.sum ?? 0) + prior * PRIOR_WEIGHT) / ((sample?.count ?? 0) + PRIOR_WEIGHT);
    }

    export interface Demand {
        gap_minutes?: number; // since the previous bus left the stop
        passenger_count: number;
        capacity: number;
    };

    // A bus stops if someone is waiting or someone aboard asks. Riders turn up at rate λ = boardings per bus /
    // minutes between buses, so P(waiting) = 1 - e^(-λ·gap); whatever the stop's usual rate isn't explained by
    // waiting riders at the usual headway is put down to requests from aboard.
    function waiting_prior(model: Model, stop_key: string, timestamp: Date, base: number, gap_minutes: number) {
        const boardings = lookup(model.boardings, stop_key, timestamp);
        const headway = lookup(model.headways, stop_key, timestamp);
        if (boardings === null || headway === null || headway <= 0) return base;
        const usual_waiting = 1 - Math.exp(-boardings);
        if (usual_waiting >= 1) return base;
        const requested = Math.min(1, Math.max(0, (base - usual_waiting) / (1 - usual_waiting)));
        return 1 - Math.exp(-boardings * gap_minutes / headway) * (1 - requested);
    }

    // Each level (stop and time of day, then gap since the last bus, then load) is shrunk toward the one before
    // it, so sparse conditions fall back smoothly.
    function stop_rate(model: Model, stop_key: string, source: Lessy.Source, timestamp: Date, demand?: Demand) {
        const base = shrink(lookup_sample(model.stop_rates, stop_key, timestamp, true), DEFAULT_STOP_RATE[source]);
        if (demand?.gap_minutes === undefined) return base;
        const gap = gap_bin(demand.gap_minutes);
        const by_gap = shrink(model.stop_rates.get(`${stop_key}|g${gap}`), waiting_prior(model, stop_key, timestamp, base, demand.gap_minutes));
        return shrink(model.stop_rates.get(`${stop_key}|g${gap}|l${load_bin(demand.passenger_count, demand.capacity)}`), by_gap);
    }

    // Expected time lost at a stop the bus hasn't reached yet: it may well drive straight past.
    function expected_dwell_minutes(model: Model, stop_key: string, source: Lessy.Source, timestamp: Date, demand?: Demand) {
        return stop_rate(model, stop_key, source, timestamp, demand) * stopped_dwell_minutes(model, stop_key, source, timestamp);
    }

    // Dwell left at the stop the bus is at now. Still moving: it may yet stop if the stop is ahead, and has
    // left it if it's behind. Sitting there: E[D - waited | D > waited] from the stop's dwells, with waited
    // unknown meaning we caught it at a random moment of its dwell (E[D²] / 2E[D]).
    function remaining_dwell_minutes(bus: Lessy.Bus, stop_key: string, approaching: boolean, model: Model, timestamp: Date, demand: Demand) {
        const motion = model.motion.get(Lessy.key(bus));
        const moving = bus.speed_mph !== undefined ? bus.speed_mph >= STATIONARY_MPH : motion !== undefined && !motion.stationary;
        if (moving) return approaching ? expected_dwell_minutes(model, stop_key, bus.source, timestamp, demand) : 0;
        const since = motion?.stopped_since;
        const waited = since !== undefined ? Math.max(0, (bus.last_updated.getTime() - since) / MINUTE_MS) : undefined;
        const histogram = model.dwell_histograms.get(stop_key);
        const total = histogram?.reduce((sum, count) => sum + count, 0) ?? 0;
        if (histogram === undefined || total < MIN_HISTOGRAM_DWELLS) {
            const dwell = stopped_dwell_minutes(model, stop_key, bus.source, timestamp);
            return waited === undefined ? dwell / 2 : Math.max(dwell - waited, dwell / 2);
        }
        let weight = 0, remaining = 0, squared = 0;
        histogram.forEach((count, bin) => {
            const dwell = (bin + 0.5) * DWELL_BIN_S / 60;
            if (waited === undefined) {
                weight += count * dwell;
                squared += count * dwell * dwell;
            } else if (dwell > waited) {
                weight += count;
                remaining += count * (dwell - waited);
            }
        });
        if (weight === 0) return DWELL_BIN_S / 60 / 2;
        return waited === undefined ? squared / weight / 2 : remaining / weight;
    }

    // Travel speed on the leg into stop_key, from history of that leg; falls back to the source average.
    function leg_meters_per_min(model: Model, route: Lessy.Route, stop_key: string, timestamp: Date) {
        const sample = lookup_sample(model.segment_speeds, segment_key(route, stop_key), timestamp, true);
        const usual = sample !== null && sample.count >= MIN_SEGMENT_MINUTES ? sample.sum / sample.count : model.speed_mph[route.source] * METERS_PER_MILE / 60;
        return usual / model.pace[route.source];
    }

    function disappear_probability(model: Model, stop_key: string, timestamp: Date) {
        const sample = lookup_sample(model.disappearances, stop_key, timestamp);
        const prior = model.terminal_priors.has(stop_key) ? TERMINAL_PRIOR : 0;
        return ((sample?.sum ?? 0) + prior * PRIOR_WEIGHT) / ((sample?.count ?? 0) + PRIOR_WEIGHT);
    }

    function disappears_at(model: Model, stop_key: string, timestamp: Date) {
        return disappear_probability(model, stop_key, timestamp) >= DISAPPEAR_THRESHOLD;
    }

    function travelled_m(previous: BusState, current: Pick<BusState, 'route' | 'path_m'>) {
        if (current.route === undefined || previous.route !== current.route) return undefined;
        if (previous.path_m === undefined || current.path_m === undefined) return undefined;
        return RoutePath.distance_ahead(current.route, previous.path_m, current.path_m);
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

    // Departures other buses are projected to make, so a bus knows how recently each stop it reaches was served.
    type Served = Map<string, { bus_key: string; at: number }[]>;

    function minutes_since_served(model: Model, served: Served | undefined, stop_key: string, bus_key: string, at: number) {
        let last = model.last_departure.get(stop_key);
        if (last !== undefined && last > at) last = undefined;
        for (const departure of served?.get(stop_key) ?? []) {
            if (departure.bus_key === bus_key || departure.at > at) continue;
            if (last === undefined || departure.at > last) last = departure.at;
        }
        return last !== undefined ? (at - last) / MINUTE_MS : undefined;
    }

    // The scheduled departure a bus ready to leave stop_key at `ready` (epoch ms) waits for, if it's early.
    function scheduled_departure(network: Lessy.Network, stop_key: string, ready: number) {
        const times = network.timepoints?.[stop_key];
        const next = times?.find(time => time >= ready);
        return next !== undefined && next - ready <= MAX_TIMEPOINT_HOLD_MINUTES * MINUTE_MS ? next : undefined;
    }

    // Minutes are measured from live_time, when the bus last reported.
    function journey(bus: Lessy.Bus, network: Lessy.Network, model: Model, live_time: Date, horizon_min: number, served?: Served): Journey | undefined {
        const route = RoutePath.find_route(network.routes, bus);
        const start_m = route && RoutePath.position(bus, route);
        if (route === undefined || start_m === undefined) return undefined;
        const bus_key = Lessy.key(bus);
        const demand_at = (stop_key: string, minutes: number): Demand => ({
            gap_minutes: minutes_since_served(model, served, stop_key, bus_key, live_time.getTime() + minutes * MINUTE_MS),
            passenger_count: bus.passenger_count,
            capacity: bus.capacity
        });
        // Minutes after live_time the bus can leave a stop it's ready to leave at `ready`, holding at timepoints.
        const leave = (stop_key: string, ready: number) => {
            const scheduled = bus.source === 'mountain_line' ? scheduled_departure(network, stop_key, live_time.getTime() + ready * MINUTE_MS) : undefined;
            return scheduled !== undefined ? Math.max(ready, (scheduled - live_time.getTime()) / MINUTE_MS) : ready;
        };

        const ahead = Object.entries(route.stop_distances_m)
            .map(([stop_key, stop_m]) => ({ stop_key, ahead_m: RoutePath.distance_ahead(route, start_m, stop_m) }))
            .filter((stop): stop is { stop_key: string, ahead_m: number } => stop.ahead_m !== undefined)
            .sort((a, b) => a.ahead_m - b.ahead_m);
        const is_current = (ahead_m: number) => ahead_m <= STOP_RADIUS_M || (route.loop && route.length_m - ahead_m <= STOP_RADIUS_M);

        const events: StopEvent[] = [];
        let clock = 0;
        let travelled = 0;
        const current = ahead.find(stop => is_current(stop.ahead_m));
        let meters_per_min = model.speed_mph[bus.source] * METERS_PER_MILE / 60;
        if (current !== undefined) {
            clock = leave(current.stop_key, remaining_dwell_minutes(bus, current.stop_key, current.ahead_m <= STOP_RADIUS_M, model, live_time, demand_at(current.stop_key, 0)));
            const disappears = disappears_at(model, current.stop_key, live_time);
            events.push({ stop_key: current.stop_key, travelled_m: 0, arrive_min: 0, depart_min: clock, disappears, current: true, meters_per_min });
            if (disappears) return { route, start_m, meters_per_min, events };
        }

        const laps = route.loop ? MAX_LAPS : 1;
        for (let lap = 0; lap < laps; lap++) {
            for (const stop of ahead) {
                if (lap === 0 && stop === current) continue;
                const stop_travelled = stop.ahead_m + lap * route.length_m;
                if (stop_travelled <= travelled) continue;
                meters_per_min = leg_meters_per_min(model, route, stop.stop_key, live_time);
                const arrive_min = clock + (stop_travelled - travelled) / meters_per_min;
                if (arrive_min > horizon_min) return { route, start_m, meters_per_min, events };
                const depart_min = leave(stop.stop_key, arrive_min + expected_dwell_minutes(model, stop.stop_key, bus.source, live_time, demand_at(stop.stop_key, arrive_min)));
                const disappears = disappears_at(model, stop.stop_key, live_time);
                events.push({ stop_key: stop.stop_key, travelled_m: stop_travelled, arrive_min, depart_min, disappears, current: false, meters_per_min });
                if (disappears) return { route, start_m, meters_per_min, events };
                clock = depart_min;
                travelled = stop_travelled;
            }
        }
        return { route, start_m, meters_per_min, events };
    }

    const trips_cache = new WeakMap<Lessy.Live, { model: Model; network: Lessy.Network; live_time: number; trips: Map<string, Journey> }>();

    // Every fresh live bus's journey, keyed by bus. Projected once without knowing about the other buses, then
    // again with each stop's projected departures, so a bus close behind another finds fewer riders waiting
    // and skips more stops (which is how buses bunch). Cached per live fetch: every timeline frame shares it.
    function live_trips(live: Lessy.Live, network: Lessy.Network, model: Model, live_time: Date) {
        const cached = trips_cache.get(live);
        if (cached !== undefined && cached.model === model && cached.network === network && cached.live_time === live_time.getTime()) return cached.trips;
        const buses = live.buses.filter(bus => !is_stale(bus, live_time, 0));
        const horizon = NEAR_TERM_MINUTES + ARRIVAL_HORIZON_MINUTES;
        const project = (served?: Served) => {
            const trips = new Map<string, Journey>();
            for (const bus of buses) {
                const trip = journey(bus, network, model, live_time, horizon, served);
                if (trip !== undefined) trips.set(Lessy.key(bus), trip);
            }
            return trips;
        };
        const first = project();
        const served: Served = new Map();
        for (const [bus_key, trip] of first) {
            for (const event of trip.events) {
                const departures = served.get(event.stop_key) ?? [];
                departures.push({ bus_key, at: live_time.getTime() + event.depart_min * MINUTE_MS });
                served.set(event.stop_key, departures);
            }
        }
        const trips = project(served);
        trips_cache.set(live, { model, network, live_time: live_time.getTime(), trips });
        return trips;
    }

    function live_time_of(timestamp: Date, elapsed: number) {
        return new Date(timestamp.getTime() - elapsed * MINUTE_MS);
    }

    function live_minutes_until_bus(stop: Lessy.Stop, live: Lessy.Live, trips: Map<string, Journey>, elapsed: number) {
        const stop_key = Lessy.key(stop);
        const forecast = live.forecast_minutes[stop_key];
        if (forecast !== undefined && forecast >= elapsed) return forecast - elapsed;

        let best: number | undefined;
        for (const bus of live.buses) {
            if (bus.source !== stop.source) continue;
            const event = trips.get(Lessy.key(bus))?.events.find(event => event.stop_key === stop_key && event.arrive_min <= elapsed + NEAR_TERM_MINUTES);
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
        return predict_stops_with({ model: build_model(history, network), network, live, now }, timestamp);
    }

    // context.network should be the network active at timestamp; context.live is only used for near-term timestamps.
    export function predict_stops_with(context: Context, timestamp: Date): PredictedStop[] {
        const { model, network } = context;
        const offset = offset_minutes(timestamp, context.now ?? new Date());
        const live = is_near_term(offset) ? context.live : undefined;
        const elapsed = Math.max(0, offset);
        const trips = live && live_trips(live, network, model, live_time_of(timestamp, elapsed));
        const arrivals = live && upcoming_arrivals(live, trips!, model, timestamp, elapsed);

        return network.stops.map(stop => {
            const stop_key = Lessy.key(stop);
            const headway = lookup(model.headways, stop_key, timestamp);
            const live_minutes = live && live_minutes_until_bus(stop, live, trips!, elapsed);
            return {
                ...stop,
                predicted_waiting: lookup(model.boardings, stop_key, timestamp),
                minutes_until_bus: live_minutes ?? (headway !== null ? headway / 2 : null),
                upcoming: arrivals?.get(stop_key) ?? []
            };
        });
    }

    // Every live bus's arrivals (minutes after timestamp) within ARRIVAL_HORIZON_MINUTES, keyed by stop.
    // Buses predicted to end their trip at a stop are left out there, matching live_minutes_until_bus.
    function upcoming_arrivals(live: Lessy.Live, trips: Map<string, Journey>, model: Model, timestamp: Date, elapsed: number) {
        const arrivals = new Map<string, Arrival[]>();
        for (const bus of live.buses) {
            const trip = trips.get(Lessy.key(bus));
            if (trip === undefined) continue;
            const passed: string[] = [];
            for (const event of trip.events) {
                if (event.arrive_min - elapsed > ARRIVAL_HORIZON_MINUTES) break;
                if (!event.disappears && event.depart_min >= elapsed) {
                    const stop_arrivals = arrivals.get(event.stop_key) ?? [];
                    stop_arrivals.push({
                        bus_id: bus.id,
                        source: bus.source,
                        route_id: bus.route_id,
                        minutes: Math.max(0, event.arrive_min - elapsed),
                        passenger_count: projected_load(model, bus, passed, timestamp),
                        capacity: bus.capacity
                    });
                    arrivals.set(event.stop_key, stop_arrivals);
                }
                if (!event.current) passed.push(event.stop_key);
            }
        }
        for (const stop_arrivals of arrivals.values()) stop_arrivals.sort((a, b) => a.minutes - b.minutes);
        return arrivals;
    }

    // The bus's load after the stops it has passed, in order.
    function projected_load(model: Model, bus: Lessy.Bus, stop_keys: string[], timestamp: Date) {
        let load = bus.passenger_count;
        for (const stop_key of stop_keys) {
            const off = shrink(lookup_sample(model.alightings, stop_key, timestamp, true), DEFAULT_ALIGHT_SHARE);
            const on = lookup_sample(model.boardings, stop_key, timestamp, true);
            load = load * (1 - off) + (on !== null && on.count > 0 ? on.sum / on.count : 0);
        }
        return Math.min(bus.capacity, Math.max(0, load));
    }

    // A bus that hasn't reported in a while (parked, out of service) shouldn't be moved along its route.
    function is_stale(bus: Lessy.Bus, timestamp: Date, elapsed: number) {
        const live_time = timestamp.getTime() - elapsed * MINUTE_MS;
        return live_time - bus.last_updated.getTime() > STALE_REPORT_MINUTES * MINUTE_MS;
    }

    // Metres covered after `fraction` of the time a leg of `meters` from from_m takes, spending time in each bin in
    // proportion to how slow buses usually are there.
    function along_profile(model: Model, route: Lessy.Route, from_m: number, meters: number, fraction: number) {
        if (fraction <= 0 || meters <= 0) return 0;
        if (fraction >= 1) return meters;
        const average = model.speed_mph[route.source] * METERS_PER_MILE / 60;
        const pieces: { length: number; minutes: number }[] = [];
        each_bin(route, from_m, meters, (bin, length) => {
            const sample = model.profile.get(`${Lessy.key(route)}#${bin}`);
            const speed = ((sample?.sum ?? 0) + PROFILE_PRIOR_M) / ((sample?.count ?? 0) + PROFILE_PRIOR_M / average);
            pieces.push({ length, minutes: length / speed });
        });
        let target = fraction * pieces.reduce((sum, piece) => sum + piece.minutes, 0);
        let covered = 0;
        for (const piece of pieces) {
            if (target <= piece.minutes) return covered + piece.length * target / piece.minutes;
            target -= piece.minutes;
            covered += piece.length;
        }
        return meters;
    }

    function on_route(bus: Lessy.Bus, trip: Journey, travelled: number) {
        const moved = RoutePath.advance(trip.route, trip.start_m, travelled);
        return { ...moved.point, heading_deg: moved.heading, path_distance_m: bus.path_distance_m !== undefined ? moved.distance_m : undefined };
    }

    // Mountain Line buses are drawn strictly on their route, even at their live position.
    function extrapolate_bus(bus: Lessy.Bus, trip: Journey | undefined, model: Model, timestamp: Date, elapsed: number): Lessy.Bus | undefined {
        // Off its route or not reporting: its raw distance along the route can't be trusted (parked buses report 0).
        if (trip === undefined) return { ...bus, path_distance_m: undefined, last_updated: timestamp };
        if (elapsed <= 0) return bus.source === 'mountain_line' ? { ...bus, ...on_route(bus, trip, 0), last_updated: timestamp } : { ...bus, last_updated: timestamp };

        const passed: string[] = [];
        let travelled = 0;
        let moving_since = 0;
        let at_stop = false;
        let meters_per_min = trip.meters_per_min;
        let next: StopEvent | undefined;
        for (const event of trip.events) {
            if (elapsed < event.arrive_min) {
                meters_per_min = event.meters_per_min;
                next = event;
                break;
            }
            if (event.disappears && elapsed >= event.depart_min) return undefined;
            if (!event.current) passed.push(event.stop_key);
            travelled = event.travelled_m;
            moving_since = event.depart_min;
            if (elapsed <= event.depart_min) {
                at_stop = true;
                break;
            }
        }
        if (!at_stop && next !== undefined && bus.source === 'mountain_line') {
            const fraction = (elapsed - moving_since) / (next.arrive_min - moving_since);
            travelled += along_profile(model, trip.route, trip.start_m + travelled, next.travelled_m - travelled, fraction);
        } else if (!at_stop) travelled += (elapsed - moving_since) * meters_per_min;

        return {
            ...bus,
            ...on_route(bus, trip, travelled),
            passenger_count: projected_load(model, bus, passed, timestamp),
            last_updated: timestamp
        };
    }

    function historical_buses(model: Model, timestamp: Date): Lessy.Bus[] {
        const target = slot_of(timestamp);
        const same_weekday = model.layouts.get(`d${target.weekday}|${target.slot}`);
        const layout = same_weekday ?? [...model.layouts.values()]
            .filter(candidate => candidate.slot === target.slot && candidate.day_type === target.day_type)
            .sort((a, b) => b.day - a.day)[0];
        if (layout === undefined) return [];
        const occupancy_key = same_weekday !== undefined ? `d${target.weekday}|${target.slot}` : `${target.day_type}|${target.slot}`;
        const nearest = layout.snapshots.reduce((best, entry) => Math.abs(entry.minutes - target.minutes) < Math.abs(best.minutes - target.minutes) ? entry : best);

        return nearest.buses
            .filter(bus => Lessy.source_active(bus.source, timestamp))
            .map(bus => {
                const sample = model.occupancy.get(`${bus.source}|${occupancy_key}`);
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
            const network: Lessy.Network = { stops: [], routes: [] };
            return predict_buses_with({ model: build_model(history, network), network, now }, timestamp);
        }

        const [history, network, live] = await Promise.all([
            load_history(store, now),
            Lessy.network(now),
            Lessy.live(now)
        ]);
        if ('error' in history) return history;
        return predict_buses_with({ model: build_model(history, network), network, live, now }, timestamp);
    }

    // Near-term timestamps extrapolate context.live along context.network; later ones replay the model's historical layout.
    export function predict_buses_with(context: Context, timestamp: Date): Lessy.Bus[] {
        const { model, network, live } = context;
        const offset = offset_minutes(timestamp, context.now ?? new Date());
        if (!is_near_term(offset)) return historical_buses(model, timestamp);
        if (live === undefined) return [];
        const elapsed = Math.max(0, offset);
        const trips = live_trips(live, network, model, live_time_of(timestamp, elapsed));
        return live.buses
            .map(bus => extrapolate_bus(bus, trips.get(Lessy.key(bus)), model, timestamp, elapsed))
            .filter((bus): bus is Lessy.Bus => bus !== undefined);
    }
}
