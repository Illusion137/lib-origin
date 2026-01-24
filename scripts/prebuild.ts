// FULL BUILD ORIGIN
import { log_info } from "@common/log";
import { TimeLog } from "@common/time_log";
import { Cookie, CookieJar } from "@common/utils/cookie_util";
import { fs, load_native_fs } from "@native/fs/fs";
import { spawn } from "child_process";
import { getCookies, getProfiles } from 'chrome-cookie-decrypt';
import path from "path-browserify";

const cookie_jar_env_urls = {
    "YOUTUBE_COOKIE_JAR": "youtube.com",
    "YOUTUBE_MUSIC_COOKIE_JAR": "music.youtube.com",
    "SPOTIFY_COOKIE_JAR": "spotify.com",
    "SOUNDCLOUD_COOKIE_JAR": "soundcloud.com",
    "AMAZON_MUSIC_COOKIE_JAR": "music.amazon.com",
    "APPLE_MUSIC_COOKIE_JAR": "music.apple.com",
    "BANDLAB_COOKIE_JAR": "bandlab.com",
    "JNOVEL_COOKIE_JAR": "j-novel.club",
    "INSTAGRAM_COOKIE_JAR": "instagram.com",
    "GOOGLE_TRANSLATE_COOKIE_JAR": "translate.google.com",
} as const;

async function modify_env(key: string, value: string) {
    const env_string = await fs().read_as_string('.env', {});
    if(typeof env_string !== 'string') throw new Error(".env file could not be read.");
    const variables = env_string.split('\n').filter(line => line.trim().length > 0);
    const index = variables.findIndex(line => line.startsWith(`${key}=`));
    if (index === -1) return;
    variables[index] = `${key}='${value}'`;
    await fs().write_file_as_string('.env', variables.join('\n'), {});
}

async function spawn_code(cmd: string, args: string[]) {
    const command = spawn(cmd, args, { stdio: "inherit" });
    const exit_code = new Promise<number>(resolve => {
        command.addListener("exit", (code) => {
            resolve(code ?? -1);
        });
    });
    return await exit_code;
}

async function update_env(){
    log_info("Fetching Chrome Cookies to store in .env...");
    const default_profile = (await getProfiles())[0];
    for(const key of Object.keys(cookie_jar_env_urls)){
        log_info("-- Fetching cookies for " + cookie_jar_env_urls[key]);
        const cookies = await getCookies(cookie_jar_env_urls[key], default_profile.directory);
        log_info(`---- Fetched ${cookies.length} cookies.`);
        const cookie_jar = new CookieJar(
            cookies.map(cookie => new Cookie({
                name: cookie.name,
                value: cookie.value,
                domain: cookie.domain,
                expires: cookie.expires ? new Date(cookie.expires) : undefined,
                path: cookie.path,
                secure: cookie.secure,
                http_only: cookie.httpOnly,
                same_site: cookie.sameSite
            }))
        );
        await modify_env(key, cookie_jar.toString());
    }
}

async function update_spotify_secrets(){
    log_info("Running Spotify Secret Grabber...");
    const secret_grabber_exit_code = await spawn_code("ts-node", ["./scripts/spotify_secret_grabber.ts", "--all"]);
    if (secret_grabber_exit_code !== 0) throw new Error("Spotify Secret Grabber failed.");
}

async function compile_lint_code(){
    log_info("Running TSC and ESLINT...");
    const build_exit_code = await spawn_code("sh", ["./scripts/build.sh"]);
    if (build_exit_code !== 0) throw new Error("TSC or ESLINT failed.");
}

async function generate_illusi_playlists_links(){
    log_info("Generating Illusive Playlists...");
    let illusi_playlists = await fs().read_directory("Illusive/src/data");
    if("error" in illusi_playlists) throw illusi_playlists.error;
    illusi_playlists = illusi_playlists.map(item => path.basename(item, ".json"));

    const default_includes = `import { Constants } from "@illusive/constants";
import { ExploreLocalData } from "@illusive/explore_local_data";
import { create_uri } from "@illusive/illusive_utils";
import type { MusicServicePlaylist, Track } from "@illusive/types";
import { reinterpret_cast } from "@common/cast";
`;

    const import_template = (basename: string) => `import ${basename} from '@illusive/data/${basename}.json';`;
    const function_header = "export function get_local_illusi_playlist(cleaned_url: string): MusicServicePlaylist|undefined{\n";
    const item_template = (basename: string) => `
    if(cleaned_url === "${basename}"){
        return {
            title: ExploreLocalData.illusi_recommend_playlists_map.${basename}.title.name,
            creator: [{name: Constants.local_illusi_uri_id, uri: create_uri('illusi', Constants.local_illusi_uri_id)}],
            tracks: reinterpret_cast<Track[]>(${basename}),
            continuation: null
        };
    }
    `;

    const text = default_includes + illusi_playlists.map(import_template).join('\n') + '\n\n' + function_header + illusi_playlists.map(item_template).join('\n')
        + '\n    return undefined;\n}\n';

    await fs().write_file_as_string("Illusive/src/gen/illusi_playlists_links.ts", text, {});
}

async function run_tests(){
    log_info("Running Tests...");
    const test_exit_code = await spawn_code("yarn", ["test"]);
    if(test_exit_code !== 0) throw new Error("Tests failed.");
}

async function prebuild_main(){
    await load_native_fs();
    await compile_lint_code();
    
    await update_env();
    await generate_illusi_playlists_links();
    await update_spotify_secrets();
    
    await run_tests();
    await compile_lint_code();
    // TODO finish prebuild script
    // Gen-Files
    
    // Generate includes
    // Generate native includes
    
    // Update service.json (outages n stuff)
    
    // If need to run npx drizzle-kit generate --config=drizzle-illusi-mobile.config.ts          37% 23/63GB 
}

TimeLog.log_fn_async("Finished Origin Prebuild", prebuild_main).catch(e => console.error(e));