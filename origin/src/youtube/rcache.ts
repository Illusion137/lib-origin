import { FSCache } from '@common/fs_cache';
import { ItemTimedCache } from '@common/types';
import { is_empty, milliseconds_of } from '@common/utils/util';
import type { Types } from 'youtubei.js';

const rcache = new ItemTimedCache<string, ArrayBuffer>();
const rcache_lifespan = milliseconds_of({ minutes: 30 });

export class RCache implements Types.ICache {
	readonly cache_dir: string;
	readonly use_fscache: boolean;
	readonly namespace: string;
	constructor(persistant: boolean, persistent_dir?: string, namespace = '') {
		this.cache_dir = persistent_dir ?? '';
		this.use_fscache = persistant;
		this.namespace = namespace;
	}

	async get(key: string): Promise<ArrayBuffer | undefined> {
		key = this.namespace + key;
		const memcache_result = rcache.get(key);
		if (memcache_result) return memcache_result;
		if (this.use_fscache && !is_empty(this.cache_dir)) {
			const fscache_result = await FSCache.check_cache<ArrayBuffer>(key, milliseconds_of({ days: 3 }), { directory: this.cache_dir, serial_type: 'arraybuffer' });
			return fscache_result;
		}
		return undefined;
	}

	async set(key: string, value: ArrayBuffer): Promise<void> {
		key = this.namespace + key;
		rcache.update(key, value, rcache_lifespan);
		if (this.use_fscache && !is_empty(this.cache_dir)) {
			await FSCache.insert_cache(key, value, { directory: this.cache_dir, serial_type: 'arraybuffer' });
		}
	}

	async remove(key: string): Promise<void> {
		key = this.namespace + key;
		rcache.remove(key);
		if (this.use_fscache && !is_empty(this.cache_dir)) {
			await FSCache.clear_cache(key, { directory: this.cache_dir });
		}
	}
}
