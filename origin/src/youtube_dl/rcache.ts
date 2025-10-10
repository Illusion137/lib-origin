import { ItemTimedCache } from "@common/types";
import { milliseconds_of } from "@common/utils/util";
import type { ICache } from "youtubei.js/dist/src/types";

const rcache = new ItemTimedCache<string, ArrayBuffer>();
const rcache_lifespan = milliseconds_of({minutes: 30});
export class RCache implements ICache {
    readonly cache_dir: string;
    constructor(_: boolean, __?: string) {
        this.cache_dir = "";
    }
    async get(key: string): Promise<ArrayBuffer | undefined> {
        return rcache.get(key);
    }
    async set(key: string, value: ArrayBuffer): Promise<void> {
        rcache.update(key, value, rcache_lifespan);
    }
    async remove(key: string): Promise<void> {
        rcache.remove(key);
    }

}