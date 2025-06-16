export interface ResponseError { "error": Error }
export interface ResponseSuccess { "success": true }
export type PromiseResult<T> = Promise<ResponseError|T>;
export type FetchMethod = "GET"|"POST"|"DELETE"|"PUT"|"OPTIONS";

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
        this.store[i].value = value;
    }
    async return_update(key: K, else_value: () => Promise<V>): Promise<V> {
        let value;
        if((value = this.get(key))){
            return value;
        }
        const new_value = await else_value();
        this.update(key, new_value);
        return new_value;
    }
    clear_expired() {
        this.store = this.store.filter(item => item.created_at.getTime() + (this.lifespan_milliseconds) > new Date().getTime())
    }
}