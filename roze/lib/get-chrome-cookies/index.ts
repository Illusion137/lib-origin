import type { PromiseResult } from "@common/types";
import { Cookie, CookieJar } from "@common/utils/cookie_util";
import { generror, generror_catch } from "@common/utils/error_util";
import { spawn_code } from "@common/utils/node_utils";
import { try_json_parse } from "@common/utils/parse_util";
import { gen_uuid, groupby_map } from "@common/utils/util";
import { fs, load_native_fs } from "@native/fs/fs";
import path from "path-browserify";
import chrome_cookies_secure from 'chrome-cookies-secure';

const EXE = "chromelevator_x64.exe";
async function try_chromelevator(host_names: string[], profile): PromiseResult<Record<string, CookieJar>> {
    try {
        if(process.platform !== "win32") return generror("Platform must be win32", "INFO", {platform: process.platform});
        await load_native_fs();
        const output_path = path.join(await fs().temp_directory(), gen_uuid());
        await spawn_code(EXE, [
            "--output-path",
            output_path,
            "chrome"
        ], "ignore");
        const chrome_output_cookies_path = path.join(output_path, "Chrome", profile, "cookies.json");
        if (!(await fs().get_info(chrome_output_cookies_path)).exists) return generror("No cookie path found", "INFO");

        const cookies_string = await fs().read_as_string(chrome_output_cookies_path, {});
        if(typeof cookies_string === "object") return cookies_string;
        const cookies_json = try_json_parse<{host: string, name: string, path: string, is_secure: boolean, is_httponly: boolean, expires: number, value:string}[]>(cookies_string);
        if("error" in cookies_json) return cookies_json;
        const all_cookies = cookies_json.map(cookie => new Cookie({
            name: cookie.name,
            value: cookie.value,
            domain: cookie.host,
            // Sum bout UNIX timestamps or something
            expires: new Date(cookie.expires / 1000 - 11644473600000),
            http_only: cookie.is_httponly,
            secure: cookie.is_secure,
            path: cookie.path
        })).filter(cookie => host_names.includes(cookie.getData().domain ?? ""));
        all_cookies.reverse(); // reverse since newer cookies get stored at the bottom

        if ((await fs().get_info(output_path)).is_directory) await fs().remove_dir(output_path);

        return groupby_map(all_cookies, (c => c.getData().domain), (cookies) => new CookieJar(cookies));
    }
    catch(e) {
        return generror_catch(e, "try_chromelevator failed", "INFO");
    }
}

async function try_chrome_cookies_secure(host_names: string[], profile): PromiseResult<Record<string, CookieJar>> {
    try {
        const cookie_map: Record<string, CookieJar> = {};
        for(const host_name of host_names) {
            cookie_map[host_name] = CookieJar.fromString(await chrome_cookies_secure.getCookiesPromised(host_name, "header", profile));
        }
        return cookie_map;
    }
    catch(e) {
        return generror_catch(e, "try_chrome_cookies_secure failed", "INFO");
    }
}

// would add support for chrome-cookie-decrypt, but it doesn't just fail on other platforms; you simply can't intsall it naturally
export async function get_cookies(host_names: string[], profile = "Default"): PromiseResult<Record<string, CookieJar>>{
    const chromelevator_result = try_chromelevator(host_names, profile);
    if(!("error" in chromelevator_result)) return chromelevator_result;
    const chrome_cookies_secure_result = try_chrome_cookies_secure(host_names, profile);
    if(!("error" in chrome_cookies_secure_result)) return chrome_cookies_secure_result;
    return chromelevator_result;
}