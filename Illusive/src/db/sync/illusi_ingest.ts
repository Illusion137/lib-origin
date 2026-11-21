import { catch_log } from '@common/utils/error_util';
import { Illusi } from '@origin/illusi/illusi';
import type { CatalogItem, ContributionGraph, SoundCloudIngestItem } from '@origin/illusi/types';
import type { CompactArtist, CompactPlaylist, Track } from '@illusive/types';
import { RequestQueue } from './request_queue';
import { milliseconds_of } from '@common/utils/util';
import { catalog_album, catalog_artist, catalog_track, EntityGraph, is_catalog_service, split_named_uri, type IngestService } from './illusi_entities';

/**
 * Best-effort submissions the server accepts without being asked. Everything the parsers create is queued,
 * deduplicated for a while, and sent in batches once the account is logged in; nothing waits on them.
 *  - Every track, album and artist goes to /contribute, which creates or matches the global entity.
 *  - Objects from services other than YouTube / YouTube Music also go to /ingest/service as the service sent them
 *    (SoundCloud's raw objects go to /ingest/soundcloud).
 */
export namespace IllusiIngest {
	const FLUSH_DELAY_MS = milliseconds_of({ seconds: 5 });
	/** The server rejects more than 500 items or a body over 4 MB per request */
	const MAX_BATCH_ITEMS = 500;
	const MAX_BATCH_BYTES = 3_000_000;
	const MAX_QUEUE = 5_000;
	/** An object already sent isn't sent again for this long */
	const RESEND_AFTER_MS = milliseconds_of({ minutes: 30 });

	/** A contribution holds at most 1000 entities; parsers add a handful at a time */
	const GRAPH_ENTITIES = 300;
	const MAX_GRAPHS = 20;
	const MAX_CATALOG_QUEUE = 5_000;

	let queue: SoundCloudIngestItem[] = [];
	let graph = new EntityGraph();
	let graphs: EntityGraph[] = [];
	let catalog: CatalogItem[] = [];
	const sent_at = new Map<string, number>();
	let timer: ReturnType<typeof setTimeout> | null = null;
	let flushing: Promise<void> | null = null;

	function logged_in() {
		return Illusi.get_session() !== null;
	}

	function key_of(item: object): string | null {
		const { kind, id } = item as { kind?: unknown; id?: unknown };
		return typeof kind === 'string' && (typeof id === 'number' || typeof id === 'string') ? `${kind}:${id}` : null;
	}

	function prune(now: number) {
		for (const [key, at] of sent_at) {
			if (now - at < RESEND_AFTER_MS) break;
			sent_at.delete(key);
		}
	}

	/** Queues raw SoundCloud objects (users, tracks, playlists, liked/history wrappers) for /ingest/soundcloud */
	export function soundcloud(...items: (object | null | undefined)[]) {
		if (!logged_in()) return;
		const now = Date.now();
		prune(now);
		for (const item of items) {
			if (item === null || item === undefined || typeof item !== 'object') continue;
			const key = key_of(item);
			if (key !== null) {
				if (sent_at.has(key)) continue;
				sent_at.set(key, now);
			}
			if (queue.length >= MAX_QUEUE) queue.shift();
			queue.push(item as SoundCloudIngestItem);
		}
		schedule();
	}

	/** True when the object was queued within RESEND_AFTER_MS already; otherwise remembers it */
	function seen(key: string): boolean {
		const now = Date.now();
		prune(now);
		if (sent_at.has(key)) return true;
		sent_at.set(key, now);
		return false;
	}

	function queue_entity(add: (target: EntityGraph) => boolean) {
		if (!add(graph)) return;
		if (graph.size() >= GRAPH_ENTITIES) {
			graphs.push(graph);
			if (graphs.length > MAX_GRAPHS) graphs.shift();
			graph = new EntityGraph();
		}
	}
	function queue_catalog(item: CatalogItem | null) {
		if (item === null) return;
		if (catalog.length >= MAX_CATALOG_QUEUE) catalog.shift();
		catalog.push(item);
	}

	/**
	 * A parsed track, for its service. Returns the track so a parser can `return IllusiIngest.track(...)`. Tracks
	 * without a service id (imported files) are not shared.
	 */
	export function track<T extends Track>(service: IngestService, parsed: T, raw?: unknown): T {
		if (!logged_in()) return parsed;
		const id = [parsed.illusi_id, parsed.youtube_id, parsed.spotify_id, parsed.soundcloud_permalink, parsed.applemusic_id, parsed.amazonmusic_id, parsed.deezer_id, parsed.tidal_id, parsed.pandora_id, parsed.bandlab_id, parsed.audiomack_id].find(value => value !== undefined && value !== '');
		if (id === undefined || seen(`track:${service}:${id}`)) return parsed;
		queue_entity(target => target.add_track(parsed));
		if (is_catalog_service(service) && raw !== undefined) queue_catalog(catalog_track(service, parsed, raw));
		schedule();
		return parsed;
	}
	/** A parsed album; callers only pass compact playlists that are albums */
	export function album<T extends CompactPlaylist>(service: IngestService, parsed: T, raw?: unknown): T {
		if (!logged_in()) return parsed;
		const uri = split_named_uri(parsed.title.uri)?.id ?? parsed.title.name;
		if (seen(`album:${service}:${uri}`)) return parsed;
		queue_entity(target => target.add_album_playlist(parsed));
		if (is_catalog_service(service) && raw !== undefined) queue_catalog(catalog_album(service, parsed, raw));
		schedule();
		return parsed;
	}
	export function artist<T extends CompactArtist>(service: IngestService, parsed: T, raw?: unknown): T {
		if (!logged_in()) return parsed;
		const id = split_named_uri(parsed.name.uri)?.id ?? parsed.name.name;
		if (seen(`artist:${service}:${id}`)) return parsed;
		queue_entity(target => target.add_compact_artist(parsed));
		if (is_catalog_service(service) && raw !== undefined) queue_catalog(catalog_artist(service, parsed, raw));
		schedule();
		return parsed;
	}

	function has_pending() {
		return queue.length > 0 || catalog.length > 0 || graphs.length > 0 || graph.size() > 0;
	}

	function schedule() {
		if (timer !== null || !has_pending()) return;
		timer = setTimeout(() => {
			timer = null;
			void flush();
		}, FLUSH_DELAY_MS);
	}

	function take_batch(): SoundCloudIngestItem[] {
		const batch: SoundCloudIngestItem[] = [];
		let bytes = 0;
		while (queue.length > 0 && batch.length < MAX_BATCH_ITEMS) {
			const size = JSON.stringify(queue[0]).length;
			if (batch.length > 0 && bytes + size > MAX_BATCH_BYTES) break;
			bytes += size;
			batch.push(queue.shift()!);
		}
		return batch;
	}

	function take_catalog_batch(): CatalogItem[] {
		const batch: CatalogItem[] = [];
		let bytes = 0;
		while (catalog.length > 0 && batch.length < MAX_BATCH_ITEMS) {
			const size = JSON.stringify(catalog[0]).length;
			if (batch.length > 0 && bytes + size > MAX_BATCH_BYTES) break;
			bytes += size;
			batch.push(catalog.shift()!);
		}
		return batch;
	}

	async function flush_entities() {
		if (graph.size() > 0) {
			graphs.push(graph);
			graph = new EntityGraph();
		}
		while (graphs.length > 0 && logged_in()) {
			const next: ContributionGraph = graphs.shift()!.build();
			const result = await RequestQueue.send('contribute', next, Illusi.uuid_v4());
			if (result !== null && Illusi.is_error(result)) catch_log(result);
		}
		while (catalog.length > 0 && logged_in()) {
			const batch = take_catalog_batch();
			const result = await RequestQueue.send('ingest_service', batch);
			if (result !== null && Illusi.is_error(result)) catch_log(result);
		}
	}

	/**
	 * Sends everything queued. Offline, the rest is handed to the RequestQueue for the next sync; batches the
	 * server refuses are dropped, since these submissions are optional.
	 */
	export async function flush(): Promise<void> {
		if (flushing !== null) return flushing;
		flushing = (async () => {
			while (queue.length > 0 && logged_in()) {
				const batch = take_batch();
				const result = await RequestQueue.send('ingest_soundcloud', batch);
				if (result === null) {
					while (queue.length > 0) await RequestQueue.enqueue('ingest_soundcloud', take_batch());
					break;
				}
				if (Illusi.is_error(result)) {
					catch_log(result);
					break;
				}
			}
			await flush_entities();
			if (!logged_in()) {
				queue = [];
				catalog = [];
				graphs = [];
				graph = new EntityGraph();
			}
		})().finally(() => { flushing = null; });
		return flushing;
	}

	/** Test seam */
	export function reset() {
		queue = [];
		catalog = [];
		graphs = [];
		graph = new EntityGraph();
		sent_at.clear();
		if (timer !== null) clearTimeout(timer);
		timer = null;
	}
	export function pending(): number {
		return queue.length;
	}
	export function pending_entities(): number {
		return graphs.reduce((total, g) => total + g.size(), graph.size());
	}
	export function pending_catalog(): number {
		return catalog.length;
	}
}
