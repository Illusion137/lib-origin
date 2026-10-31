import type { Repos } from './repos';

/**
 * Which database the app reads and writes. 'legacy' while the 1810 database is still live (before or during its
 * migration), 'v2' afterwards. Repositories register themselves; the SQL* namespaces resolve them per call, so a
 * swap takes effect for the next call.
 */
export namespace Store {
	export type Mode = 'legacy' | 'v2';

	let mode: Mode = 'v2';
	const repos: Partial<Record<Mode, Repos>> = {};

	export function register(for_mode: Mode, implementation: Repos) {
		repos[for_mode] = implementation;
	}
	export function current_mode(): Mode {
		return mode;
	}
	export function set_mode(new_mode: Mode) {
		mode = new_mode;
	}
	export function legacy(): boolean {
		return mode === 'legacy';
	}
	export function get(): Repos {
		const found = repos[mode];
		if (found === undefined) throw new Error(`No ${mode} repositories registered`);
		return found;
	}

	// The write gate lets the migration finish without losing writes: it closes the gate, waits for writes in
	// flight, copies the last changes and flips the mode. Writes that arrive meanwhile wait, then run on v2.
	let gate: Promise<void> | null = null;
	let in_flight = 0;
	let drained: (() => void) | null = null;

	export async function write<T>(fn: (repos: Repos) => Promise<T>): Promise<T> {
		while (gate !== null) await gate;
		in_flight++;
		try {
			return await fn(get());
		} finally {
			in_flight--;
			if (in_flight === 0) drained?.();
		}
	}

	/** Closes the gate once writes in flight finish. Call the returned function to reopen it. */
	export async function pause_writes(): Promise<() => void> {
		let open!: () => void;
		const closed = new Promise<void>((resolve) => { open = resolve; });
		while (gate !== null) await gate;
		gate = closed;
		if (in_flight > 0) await new Promise<void>((resolve) => { drained = resolve; });
		drained = null;
		return () => {
			gate = null;
			open();
		};
	}
}
