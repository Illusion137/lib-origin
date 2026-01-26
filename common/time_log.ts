export namespace TimeLog {
    let time = Date.now();
    export function start(){
        time = Date.now();
    }
    export function log(msg?: string){
        const duration_ms = Date.now() - time;

        const hours = Math.floor(duration_ms / 3600000);
        const minutes = Math.floor((duration_ms % 3600000) / 60000);
        const seconds = Math.floor(((duration_ms % 3600000) % 60000) / 1000);
        const milliseconds = duration_ms % 1000;

        const str = `${hours > 0 ? `${hours}h ` : "" }${minutes > 0 ? `${minutes}m ` : "" }${seconds > 0 ? `${seconds}s ` : "" }${milliseconds >= 0 ? `${milliseconds}ms` : "" }`;

        console.log((msg ?? "") + " : " + str);
        time = Date.now();
    }
    export function log_fn<T>(msg: string, fn: () => T): T{
        start();
        const value = fn();
        log(msg);
        return value;
    }
    export async function log_fn_async<T>(msg: string, fn: () => Promise<T>): Promise<T>{
        start();
        const value = await fn();
        log(msg);
        return value;
    }
};