import { breadcrumb } from './sentry_error_handler';

/**
 * Post-paint startup timeline. The illusi_startup phase summary only measures
 * the awaited prefix of startup — everything data-heavy (tints, sync engine,
 * deferred native/node warm-ups, OTA pull, list section-mapping) runs after
 * set_is_loading(false) and never shows up there. This module answers "where
 * did the JS thread go in the first N seconds after the bundle booted?".
 *
 * Two collectors, meant to be read together:
 *  - marks/spans: explicit timestamps + durations around known suspects.
 *  - stall sampler: a fast interval that logs every event-loop gap over
 *    STALL_THRESHOLD_MS, so a jam in code nobody wrapped still appears as a
 *    timestamped "stall" that can be lined up against the nearest span.
 *
 * All timestamps are ms since this module evaluated (≈ JS bundle boot).
 */

export interface TimelineEntry {
    name: string;
    /** ms since bundle boot when the entry started. */
    at_ms: number;
    /** duration for spans/stalls; undefined for point marks. */
    dur_ms?: number;
    data?: Record<string, unknown>;
}

const MAX_ENTRIES = 300;
const STALL_THRESHOLD_MS = 100;
const SAMPLE_INTERVAL_MS = 50;
const SAMPLER_DURATION_MS = 20_000;

const timeline_t0 = Date.now();
const entries: TimelineEntry[] = [];
let sampler_timer: ReturnType<typeof setInterval> | null = null;

function now_ms(): number {
    return Date.now() - timeline_t0;
}

function push(entry: TimelineEntry) {
    if (entries.length >= MAX_ENTRIES) return;
    entries.push(entry);
}

export function timeline_mark(name: string, data?: Record<string, unknown>) {
    push({ name, at_ms: now_ms(), data });
}

export async function timeline_span<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const at_ms = now_ms();
    try {
        return await fn();
    } finally {
        push({ name, at_ms, dur_ms: now_ms() - at_ms });
    }
}

export function timeline_span_sync<T>(name: string, fn: () => T): T {
    const at_ms = now_ms();
    try {
        return fn();
    } finally {
        push({ name, at_ms, dur_ms: now_ms() - at_ms });
    }
}

/**
 * Watch the event loop for the first SAMPLER_DURATION_MS after boot. A tick
 * arriving `gap` ms later than scheduled means the JS thread was blocked for
 * roughly that long. Point the stalls at the spans around them for attribution.
 * When the watch window ends, the whole timeline is emitted as one breadcrumb
 * so release Sentry events carry it.
 */
export function start_stall_sampler() {
    if (sampler_timer !== null) return;
    let last_tick = Date.now();
    sampler_timer = setInterval(() => {
        const tick = Date.now();
        const gap = tick - last_tick - SAMPLE_INTERVAL_MS;
        last_tick = tick;
        if (gap >= STALL_THRESHOLD_MS) {
            push({ name: 'stall', at_ms: tick - timeline_t0 - gap - SAMPLE_INTERVAL_MS, dur_ms: gap });
        }
        if (tick - timeline_t0 >= SAMPLER_DURATION_MS) {
            stop_stall_sampler();
            // Top offenders only — the app's beforeBreadcrumb caps string fields
            // at 512 chars, so the full report would be truncated anyway (the dev
            // screen has the complete timeline).
            const worst = [...entries]
                .filter((entry) => (entry.dur_ms ?? 0) >= 100)
                .sort((a, b) => (b.dur_ms ?? 0) - (a.dur_ms ?? 0))
                .slice(0, 8)
                .map((entry) => `${entry.name}@${entry.at_ms}ms:${entry.dur_ms}ms`)
                .join(' ');
            breadcrumb('startup', 'post-paint timeline worst spans', { worst });
        }
    }, SAMPLE_INTERVAL_MS);
}

export function stop_stall_sampler() {
    if (sampler_timer === null) return;
    clearInterval(sampler_timer);
    sampler_timer = null;
}

export function get_timeline(): TimelineEntry[] {
    return [...entries].sort((a, b) => a.at_ms - b.at_ms);
}

/** Compact single-string form: "1234ms name 567ms {data}" per line. */
export function timeline_report(): string {
    return get_timeline()
        .map((entry) => {
            const dur = entry.dur_ms !== undefined ? ` ${entry.dur_ms}ms` : '';
            const data = entry.data !== undefined ? ` ${JSON.stringify(entry.data)}` : '';
            return `${entry.at_ms}ms ${entry.name}${dur}${data}`;
        })
        .join('\n');
}
