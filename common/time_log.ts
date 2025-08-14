export namespace TimeLog {
    let time = new Date().getTime();
    export function start(){
        time = new Date().getTime();
    }
    export function log(msg?: string){
        console.log((msg ?? "") + " : " + (new Date().getTime() - time) + 'ms');
        time = new Date().getTime();
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