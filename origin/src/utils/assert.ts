export default function assert(condition: boolean, message: string){
    if(!condition) throw message;
}