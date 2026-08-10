import { fs } from "@native/fs/fs";
import { spawn, type StdioOptions } from "node:child_process";

export const cookie_jar_env_urls = {
    "YOUTUBE_COOKIE_JAR": ".youtube.com",
    "YOUTUBE_MUSIC_COOKIE_JAR": ".youtube.com",
    "SPOTIFY_COOKIE_JAR": ".spotify.com",
    "SOUNDCLOUD_COOKIE_JAR": ".soundcloud.com",
    "AMAZON_MUSIC_COOKIE_JAR": ".amazon.com",
    "APPLE_MUSIC_COOKIE_JAR": ".apple.com",
    "BANDLAB_COOKIE_JAR": ".bandlab.com",
    "JNOVEL_COOKIE_JAR": ".j-novel.club",
    "INSTAGRAM_COOKIE_JAR": ".instagram.com",
    "GOOGLE_TRANSLATE_COOKIE_JAR": ".google.com",
} as const;

export async function modify_env(key: string, value: string) {
    const env_string = await fs().read_as_string('.env', {});
    if (typeof env_string !== 'string') throw new Error(".env file could not be read.");
    const variables = env_string.split('\n').filter(line => line.trim().length > 0);
    const index = variables.findIndex(line => line.startsWith(`${key}=`));
    if (index === -1) {
        variables.push(`${key}='${value}'`);
    }
    else {
        variables[index] = `${key}='${value}'`;
    }
    await fs().write_file_as_string('.env', variables.join('\n'), {});
}

export async function spawn_code(cmd: string, args: string[], stdio?: StdioOptions) {
    const command = spawn(cmd, args, { stdio: stdio ?? "inherit" });
    const exit_code = new Promise<number>(resolve => {
        command.addListener("exit", (code) => {
            resolve(code ?? -1);
        });
    });
    return await exit_code;
}
