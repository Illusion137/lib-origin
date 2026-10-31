import { catch_log } from "@common/utils/error_util";
import { fs, load_native_fs } from "@native/fs/fs";

const path = process.argv[2];
if(path === undefined) throw Error("no path");

async function main(){
    await load_native_fs();
    const har_string = await fs().read_as_string(path, {});
    if(typeof har_string === "object") throw har_string.error;
    const har = JSON.parse(har_string);
    const entries = har.log.entries;
    for(const entry of entries) {
        console.log(`${entry.request.method}: ${entry.request.url}`);
        const includes = "attestationResponseData";
        // const includes = "token";

        if(JSON.stringify(entry?.request?.postData)?.includes?.(includes))
            console.log(` -> ${JSON.stringify(entry.request.postData)}`);
        if(JSON.stringify(entry?.response?.content)?.includes?.(includes) && JSON.stringify(entry?.response?.content).length < 10000)
            console.log(` <- ${JSON.stringify(entry.response.content)}`);
    }
}
main().catch(catch_log);