export async function wait(milliseconds: number) {
    return new Promise(function(resolve) { 
        setTimeout(resolve, milliseconds, 'HASH_TIMED_OUT');
    });
}
export async function timeout_call(promise: () => Promise<any>, timeout_milliseconds: number){
    await Promise.race([
        promise(),
        wait(timeout_milliseconds)
    ])
}
export async function wait_for(condition_function: () => boolean, poll_rate_ms = 400) {
    const poll = (resolve: () => void) => {
        if (condition_function()) resolve();
        else setTimeout((_: never) => { poll(resolve) }, poll_rate_ms);
    }
    return new Promise(poll as never);
}