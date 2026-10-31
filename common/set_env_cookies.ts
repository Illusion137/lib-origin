import { get_cookies } from '@lib/get-chrome-cookies';
import { cookie_jar_env_urls, modify_env } from './utils/node_utils';

export async function refetch_env() {
    const all_cookies = await get_cookies(Object.values(cookie_jar_env_urls));
    if("error" in all_cookies) {
        console.error(all_cookies.error);
        return;
    }
    for(const [env_name, host_name] of Object.entries(cookie_jar_env_urls)) {
        const jar = all_cookies[host_name];
        process.env[env_name] = jar.toString();
        await modify_env(env_name, jar.toString());
    }
}