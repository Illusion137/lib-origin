export async function wait(milliseconds: number) {
    return new Promise(function(resolve) { 
        setTimeout(resolve, milliseconds, 'HASH_TIMED_OUT');
    });
}
export async function call_wtimeout(promise: () => Promise<any>, timeout_milliseconds: number){
    return await Promise.race([
        promise(),
        wait(timeout_milliseconds)
    ])
}
export async function wait_for(condition_function: () => boolean) {
    const poll = (resolve: () => void) => {
        if (condition_function()) resolve();
        else setTimeout((_: never) => { poll(resolve) }, 400);
    }
    return new Promise(poll as never);
}