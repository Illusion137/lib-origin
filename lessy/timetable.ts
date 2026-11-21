import { strFromU8, unzipSync } from "fflate";

// Mountain Line's published schedule (GTFS), reduced to timepoint departures: stops where a bus running early
// waits for its scheduled time.
export namespace Timetable {
    export const GTFS_URL = 'https://mountainline.syncromatics.com/gtfs';
    export const ROUTE_IDS = new Set(['6269']); // Route 10 - Maroon, the route Lessy tracks
    const FEED_TTL_MS = 24 * 60 * 60 * 1000;
    const DAY_MS = 86_400_000;
    const ARIZONA_OFFSET_MS = -7 * 60 * 60 * 1000;
    const WEEKDAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

    interface Feed {
        calendar: Record<string, string>[];
        calendar_dates: Record<string, string>[];
        departures: Map<string, Map<string, number[]>>; // service id -> stop id -> minutes after service-day midnight
    };

    let cached: { feed: Promise<Feed>; fetched_at: number } | undefined;

    function parse_csv(text: string): Record<string, string>[] {
        const rows: string[][] = [];
        let row: string[] = [], field = '', quoted = false;
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            if (quoted) {
                if (char === '"' && text[i + 1] === '"') field += text[++i];
                else if (char === '"') quoted = false;
                else field += char;
            } else if (char === '"') quoted = true;
            else if (char === ',') { row.push(field); field = ''; }
            else if (char === '\n' || char === '\r') {
                if (char === '\r' && text[i + 1] === '\n') i++;
                row.push(field); field = '';
                if (row.some(value => value !== '')) rows.push(row);
                row = [];
            } else field += char;
        }
        row.push(field);
        if (row.some(value => value !== '')) rows.push(row);
        const [header, ...body] = rows;
        return body.map(values => Object.fromEntries(header.map((name, i) => [name.replace(/^﻿/, ''), values[i] ?? ''])));
    }

    function minutes_of(time: string) {
        const [hours, minutes, seconds] = time.split(':').map(Number);
        return hours * 60 + minutes + (seconds ?? 0) / 60;
    }

    async function fetch_feed(): Promise<Feed> {
        const response = await fetch(GTFS_URL);
        if (!response.ok) throw new Error(`GTFS fetch failed: ${response.status}`);
        const files = unzipSync(new Uint8Array(await response.arrayBuffer()));
        const table = (name: string) => files[name] !== undefined ? parse_csv(strFromU8(files[name])) : [];

        const trips = new Map(table('trips.txt').filter(trip => ROUTE_IDS.has(trip.route_id)).map(trip => [trip.trip_id, trip.service_id]));
        const departures = new Map<string, Map<string, number[]>>();
        for (const stop_time of table('stop_times.txt')) {
            const service_id = trips.get(stop_time.trip_id);
            if (service_id === undefined || stop_time.timepoint !== '1' || stop_time.departure_time === '') continue;
            const by_stop = departures.get(service_id) ?? new Map<string, number[]>();
            const times = by_stop.get(stop_time.stop_id) ?? [];
            times.push(minutes_of(stop_time.departure_time));
            by_stop.set(stop_time.stop_id, times);
            departures.set(service_id, by_stop);
        }
        return { calendar: table('calendar.txt'), calendar_dates: table('calendar_dates.txt'), departures };
    }

    function feed() {
        if (cached === undefined || Date.now() - cached.fetched_at > FEED_TTL_MS) {
            const feed = fetch_feed();
            cached = { feed, fetched_at: Date.now() };
            feed.catch(() => cached = undefined);
        }
        return cached.feed;
    }

    function active_services(feed: Feed, timestamp: Date) {
        const local = new Date(timestamp.getTime() + ARIZONA_OFFSET_MS);
        const date = local.toISOString().slice(0, 10).replaceAll('-', '');
        const weekday = WEEKDAYS[local.getUTCDay()];
        const services = new Set(feed.calendar
            .filter(service => service[weekday] === '1' && service.start_date <= date && date <= service.end_date)
            .map(service => service.service_id));
        for (const exception of feed.calendar_dates) {
            if (exception.date !== date) continue;
            if (exception.exception_type === '1') services.add(exception.service_id);
            if (exception.exception_type === '2') services.delete(exception.service_id);
        }
        return services;
    }

    // Scheduled timepoint departures (epoch ms, ascending) on timestamp's Arizona service day, keyed by Lessy stop
    // key. Empty if the schedule can't be fetched.
    export async function timepoints(timestamp: Date): Promise<Record<string, number[]>> {
        let loaded: Feed;
        try {
            loaded = await feed();
        } catch {
            return {};
        }
        const local_midnight = Math.floor((timestamp.getTime() + ARIZONA_OFFSET_MS) / DAY_MS) * DAY_MS - ARIZONA_OFFSET_MS;
        const result: Record<string, number[]> = {};
        for (const service_id of active_services(loaded, timestamp)) {
            for (const [stop_id, minutes] of loaded.departures.get(service_id) ?? []) {
                const key = `mountain_line:${stop_id}`;
                (result[key] ??= []).push(...minutes.map(minute => local_midnight + minute * 60_000));
            }
        }
        for (const times of Object.values(result)) times.sort((a, b) => a - b);
        return result;
    }
}
