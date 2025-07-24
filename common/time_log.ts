export namespace TimeLog {
    let time = new Date().getTime();
    export function start(){
        time = new Date().getTime();
    }
    export function log(msg?: string){
        console.log((msg ?? "") + " : " + (new Date().getTime() - time));
        time = new Date().getTime();
    }
};