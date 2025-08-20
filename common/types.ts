import type { RoZFetchRequestInit } from "@common/rozfetch";
import type { CookieJar } from "@common/utils/cookie_util";

export interface ResponseError { "error": Error }
export interface ResponseSuccess { "success": true }
export type PromiseResult<T> = Promise<ResponseError|T>;
export type FetchMethod = "GET"|"POST"|"DELETE"|"PUT"|"OPTIONS";

export type HexColor = `#${string}`;
export type FileExtension = ".txt"|".mp3"|".mp4"|".aac"|".mkv"|".ogg"|".m4a"|".wav"|".flv"|".epub"|".pdf"|".roz"|".ps1"|".json"|".srt"|".aiff";

export interface BaseOpts {
    cookie_jar?: CookieJar; 
    fetch_opts?: RoZFetchRequestInit;
}
export class Counter<T extends number|string|object> {
    readonly K!: T extends number ? number : string;
    counter: Map<typeof this.K, number>;
    
    constructor(){
        this.counter = new Map<typeof this.K, number>();
    }
    keygen(value: T): typeof this.K{
        if(typeof value === "number") return value as typeof this.K;
        if(typeof value === "string") return value as typeof this.K;
        return JSON.stringify(value) as typeof this.K;
    }
    add(value: T){
        const key = this.keygen(value);
        const current_count = this.counter.get(key);
        if(current_count !== undefined) this.counter.set(key, current_count + 1);
        else this.counter.set(key, 1);
    }
    get(value: T){
        const key = this.keygen(value);
        return this.counter.get(key);
    }
    all(): [typeof this.K, number][]{
        return [...this.counter.entries()]
            .map<[string|number,number]>(value => [isNaN(Number(value[0])) ? value[0] : Number(value[0]), value[1]])
            .sort((a,b) => b[1] - a[1]) as [typeof this.K, number][];
    }
    first_non_zero(): [typeof this.K, number]|undefined {
        return this.all().find(item => item[0] !== 0);
    }
    non_zero(nth: number){
        return this.all().filter(item => item[0] !== 0)[nth];
    }
    reset(){
        this.counter = new Map<typeof this.K, number>();
    }
}

export class TimedCacheValue<V> {
    lifespan_milliseconds: number
    store?: { created_at: Date, value: V }
    constructor(lifespan_milliseconds: number) {
        this.lifespan_milliseconds = lifespan_milliseconds;
        this.store = undefined;
    }
    get() {
        this.clear_expired();
        return this.store?.value;
    }
    set(value: V) {
        this.clear_expired();
        this.store = {created_at: new Date(), value};
    }
    update(update_value: () => V): V{
        this.clear_expired();
        if(this.store === undefined) {this.store = {created_at: new Date(), value: update_value()};}
        return this.store.value;
    }
    clear_expired() {
        if((this.store?.created_at.getTime() ?? 0) + (this.lifespan_milliseconds) < new Date().getTime()) {
            this.store = undefined;
        }
    }
}

export class TimedCache<K, V> {
    lifespan_milliseconds: number
    store: { created_at: Date, key: K, value: V }[]
    constructor(lifespan_milliseconds: number) {
        this.lifespan_milliseconds = lifespan_milliseconds;
        this.store = [];
    }
    add(key: K, value: V) {
        this.clear_expired();
        this.store.push({created_at: new Date(), key, value});
    }
    get(key: K) {
        this.clear_expired();
        return this.store.find(item => item.key === key)?.value;
    }
    update(key: K, value: V) {
        this.clear_expired();
        const i = this.store.findIndex(item => item.key === key);
        if(i === -1) this.add(key, value);
        this.store[this.store.length - 1].value = value;
        return value;
    }
    clear_expired() {
        this.store = this.store.filter(item => item.created_at.getTime() + (this.lifespan_milliseconds) > new Date().getTime())
    }
}

export class ItemTimedCache<K, V> {
    store: { created_at: Date, key: K, value: V, lifespan_milliseconds: number }[]
    constructor() {
        this.store = [];
    }
    add(key: K, value: V, lifespan_milliseconds: number) {
        this.clear_expired();
        this.store.push({created_at: new Date(), key, value, lifespan_milliseconds});
    }
    get(key: K) {
        this.clear_expired();
        return this.store.find(item => item.key === key)?.value;
    }
    get_raw(key: K){
        this.clear_expired();
        return this.store.find(item => item.key === key);
    }
    update(key: K, value: V, lifespan_milliseconds: number) {
        this.clear_expired();
        const i = this.store.findIndex(item => item.key === key);
        if(i === -1) this.add(key, value, lifespan_milliseconds);
        this.store[this.store.length - 1].value = value;
        return value;
    }
    clear_expired() {
        this.store = this.store.filter(item => item.created_at.getTime() + (item.lifespan_milliseconds) > new Date().getTime())
    }
    remove(key: string) {
        this.store = this.store.filter((_, index) => index !== this.store.findIndex(item => item.key === key));
    }
}