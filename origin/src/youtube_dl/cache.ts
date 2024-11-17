// A cache that expires.
export default class Cache extends Map {
    timeout: number
    constructor(timeout = 1000) {
        super();
        this.timeout = timeout;
    }
    set(key: string, value: any): this {
        return super.set(key, {
            tid: new Date().getTime(),
            value,
        });
    }
    get(key: string) {
        let entry = super.get(key);
        if (entry) {
            return entry.value;
        }
        return null;
    }
    getOrSet(key: string, fn: () => any) {
        if (this.has(key)) {
            return this.get(key);
        } else {
            let value = fn();
            this.set(key, value);
            (async () => {
                try {
                    await value;
                } catch (err) {
                    this.delete(key);
                }
            })();
            return value;
        }
    }
    delete(key: string): boolean {
        let entry = super.get(key);
        if (entry) {
            return super.delete(key);
        }
        return false;
    }
    clear() {
        super.clear();
    }
    clear_expired(){
        for (const entry of this.entries()) {
            if(entry[1].tid + this.timeout > new Date().getTime())
                this.delete(entry[0]);
        }
    }
};
