// FULL BUILD ORIGIN
import { reinterpret_cast } from "@common/cast";
import { log_error, log_info } from "@common/log";
import { refetch_env } from "@common/set_env_cookies";
import { TimeLog } from "@common/time_log";
import { spawn_code } from "@common/utils/node_utils";
import { Prefs } from "@illusive/prefs";
import { fs, load_native_fs } from "@native/fs/fs";
import path from "path-browserify";

async function update_env() {
    log_info("Fetching Chrome Cookies to store in .env...");
    await refetch_env();
}

async function genv() {
    log_info("Generating types for .env...");
    const genv_exit_code = await spawn_code("genv.sh", []);
    if (genv_exit_code !== 0) throw new Error("GENV failed.");
}

async function update_spotify_secrets() {
    log_info("Running Spotify Secret Grabber...");
    const secret_grabber_exit_code = await spawn_code("ts-node", ["./scripts/spotify_secret_grabber.ts", "--all"]);
    if (secret_grabber_exit_code !== 0) throw new Error("Spotify Secret Grabber failed.");
}

async function compile_lint_code() {
    log_info("Running TSC and ESLINT...");
    const build_exit_code = await spawn_code("sh", ["./scripts/build.sh"]);
    if (build_exit_code !== 0) throw new Error("TSC or ESLINT failed.");
}

async function generate_illusi_playlists_links() {
    log_info("Generating Illusive Playlists...");
    let illusi_playlists = await fs().read_directory("Illusive/src/data");
    if ("error" in illusi_playlists) throw illusi_playlists.error;
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

async function generate_illusive_prefs_themes_css(){
    log_info("Generating Prefs themes CSS (Tailwind color tokens)...");

    const to_kebab = (key: string) => key
        .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
        .replace(/_/g, "-")
        .toLowerCase();

    const color_keys = Object.keys(Prefs.dark_theme.colors) as (keyof Prefs.Theme["colors"])[];

    const theme_tokens = color_keys
        .map(key => `\t--color-${to_kebab(key)}: var(--${key});`)
        .join("\n");

    const theme_block = (selector: string, theme: Prefs.Theme) => {
        const vars = color_keys.map(key => {
            const value = key === "primary" ? theme.colors.default_primary_color : theme.colors[key];
            return `\t--${key}: ${value};`;
        }).join("\n");
        return `${selector} {\n\tcolor-scheme: ${theme.dark ? "dark" : "light"};\n${vars}\n}`;
    };

    const default_theme_key = Prefs.prefs.theme.default_value;
    const blocks = Prefs.all_themes().map(theme_key => {
        const theme = Prefs.get_theme(theme_key);
        const selector = theme_key === default_theme_key
            ? `:root,\n[data-theme="${theme_key}"]`
            : `[data-theme="${theme_key}"]`;
        return theme_block(selector, theme);
    });

    const css = `/*
 * AUTO-GENERATED DO NOT EDIT.
 * Regenerate with: yarn build:gen
 *
 * Switch themes by setting the <html data-theme="<key>"> attribute.
 */

@theme inline {
${theme_tokens}
}

${blocks.join("\n\n")}
`;

    await fs().write_file_as_string("Illusive/src/gen/css/themes.css", css, {});
    log_info("Wrote Illusive/src/gen/css/themes.css");
}

async function run_tests() {
    log_info("Running Tests...");
    const test_exit_code = await spawn_code("yarn", ["test"]);
    if (test_exit_code !== 0) throw new Error("Tests failed.");
}

async function prebuild_main() {
    try {
        await load_native_fs();
        await compile_lint_code();

        await update_env();
        await genv();
        await generate_illusi_playlists_links();
        await generate_illusive_prefs_themes_css();
        
        update_spotify_secrets;
        run_tests;
    }
    catch (e) {
        log_error(reinterpret_cast<Error>(e).message);
        process.exit(1);
    }
    // await compile_lint_code();
    // TODO finish prebuild script
    // Gen-Files

    // Generate includes
    // Generate native includes

    // Update service.json (outages n stuff)

    // If need to run npx drizzle-kit generate --config=drizzle-illusi-mobile.config.ts          37% 23/63GB 
}

TimeLog.log_fn_async("Finished Origin Prebuild", prebuild_main).catch(e => console.error(e));