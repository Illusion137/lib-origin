// import { Proxy } from "../origin/src";
import { Traktrain } from "../origin/src/traktrain/traktrain";
import * as fs from 'fs';

async function main(){
    const producer_id = process.argv[2];
    if(producer_id === undefined) throw new Error("Producer argument is undefined");
    
    // const proxies = await Proxy.get_proxy_list();
    // if("error" in proxies) throw proxies.error;
    const proxy = 
    undefined;
    // Proxy.get_random_proxy(proxies);
    console.log("Using proxy: ", proxy);

    const prod = await Traktrain.producer(producer_id, {proxy});
    await Traktrain.online({proxy});
    
    prod.forEach((beat, i) => console.log(`[${i}]: ${beat[0]}:        ${beat[1]}`));

    const beat = await Traktrain.beat_mp3(producer_id, prod[11][1], {proxy});
    fs.writeFileSync("./ignore/samuel.mp3", beat, 'binary');
}

main().catch((error: Error) => console.error("ERROR: ", error.message));