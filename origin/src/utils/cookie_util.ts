import { Cookies } from "@react-native-community/cookies";
import { get_main_key } from "./util";

type ExpiredCookie = { "error": "expired" };
type SameSite = "None" | "Lax" | "Strict" | undefined;

export interface CookieData {
    name: string,
    value: string,
    domain?: string,
    path?: string,
    expires?: Date,
    max_age?: number,
    same_site?: SameSite,
    http_only?: boolean,
    secure?: boolean,
}

/* ---- https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie ----
Set-Cookie: <cookie-name>=<cookie-value>
Set-Cookie: <cookie-name>=<cookie-value>; Domain=<domain-value>
Set-Cookie: <cookie-name>=<cookie-value>; Expires=<date>
Set-Cookie: <cookie-name>=<cookie-value>; HttpOnly
Set-Cookie: <cookie-name>=<cookie-value>; Max-Age=<number>
Set-Cookie: <cookie-name>=<cookie-value>; Partitioned
Set-Cookie: <cookie-name>=<cookie-value>; Path=<path-value>
Set-Cookie: <cookie-name>=<cookie-value>; Secure

Set-Cookie: <cookie-name>=<cookie-value>; SameSite=Strict
Set-Cookie: <cookie-name>=<cookie-value>; SameSite=Lax
Set-Cookie: <cookie-name>=<cookie-value>; SameSite=None; Secure
*/
export class Cookie {
    #data: CookieData
    constructor(c: CookieData){
        this.#data = c;
    }
    hasExpired(): boolean { 
        if(this.#data.expires !== undefined) return new Date().getTime() > this.#data.expires?.getTime();
        else return false;
    }
    toString(): string { return `${this.#data.name}=${this.#data.value}`; }
    getData(): CookieData { return this.#data; }
    static fromString(cstring: string): Cookie {
        const attributes = cstring.split(';');
        const key_value_split = attributes[0].split('=');
        const key = key_value_split.shift() as string;
        const value = key_value_split.join('=');

        const expire_attr_index = attributes.findIndex(attr => attr.includes("Expires"));
        const domain_attr_index = attributes.findIndex(attr => attr.includes("Domain"));
        const path_attr_index = attributes.findIndex(attr => attr.includes("Path"));
        const maxage_attr_index = attributes.findIndex(attr => attr.includes("Max-Age"));
        const samesite_attr_index = attributes.findIndex(attr => attr.includes("SameSite"));

        const expires = expire_attr_index !== -1 ? new Date(attributes[expire_attr_index].split('=')[1]) : undefined;
        const domain = domain_attr_index !== -1 ? attributes[domain_attr_index].split('=')[1] : undefined;
        const path = path_attr_index !== -1 ? attributes[path_attr_index].split('=')[1] : undefined;
        const max_age = maxage_attr_index !== -1 ? parseInt(attributes[maxage_attr_index].split('=')[1]) : undefined;
        const same_site = samesite_attr_index !== -1 ? attributes[samesite_attr_index].split('=')[1] : undefined;
        const http_only = attributes.findIndex(attr => attr.includes("HttpOnly")) !== -1;
        const secure = attributes.findIndex(attr => attr.includes("Secure")) !== -1;
        
        return new Cookie({
            name: key,
            value: value,
            domain: domain,
            path: path,
            expires: expires,
            max_age: max_age,
            same_site: same_site as SameSite,
            http_only: http_only,
            secure: secure,
        });
    }
}

export class CookieJar{
    #jar: Cookie[]
    constructor(j: Cookie[]){
        this.#jar = j;
    }
    hasCookie(other_cookie: Cookie): boolean { return this.getCookies().findIndex(cookie => cookie.getData().name === other_cookie.getData().name) !== -1; }
    getCookies(): Cookie[] { 
        const non_expired_cookies = this.#jar.filter(cookie => !cookie.hasExpired());
        this.#jar = non_expired_cookies;
        return this.#jar;
    }
    getCookie(cookie_name: string): Cookie|undefined {
        const cookies = this.getCookies();
        const index = cookies.findIndex(cookie => cookie.getData().name === cookie_name);
        if(index === -1) return undefined;
        else return cookies[index];
    }
    toString(): string { return this.getCookies().map(cookie => cookie.toString()).join("; "); }
    merge(other_jar: CookieJar): void {
        const cookie_names = this.getCookies().map(cookie => cookie.getData().name); 
        for(const other_cookie of other_jar.getCookies()){
            if(cookie_names.includes(other_cookie.getData().name) && !other_cookie.hasExpired()){
                const jar_cookie_index = this.#jar.findIndex(cookie => cookie.getData().name = other_cookie.getData().name);
                this.#jar[jar_cookie_index] = other_cookie;
            }
            else this.#jar.push(other_cookie);
        }
    }
    updateWithFetch(response: Response){
        const set_cookies = response.headers.getSetCookie();
        this.merge(CookieJar.fromStrings(set_cookies));
    }
    static fromString(cstring: string): CookieJar {
        const jar: Cookie[] = cstring.split('; ').map(cstr => Cookie.fromString(cstr));
        return new CookieJar(jar.filter(cookie => !cookie.hasExpired()));
    }
    static fromStrings(cstrings: string[]): CookieJar {
        const jar: Cookie[] = cstrings.map(cstring => Cookie.fromString(cstring));
        return new CookieJar(jar.filter(cookie => !cookie.hasExpired()));
    }
    static fromCookies(cookies: Cookies){
        const cookie_data: Cookie[] = Object.values(cookies).map((cookie) => {
            return new Cookie({
                "name": cookie.name,
                "value": cookie.value,
                "expires": cookie.expires ? new Date(cookie.expires) : undefined
            })
        });
        return new CookieJar(cookie_data);
    }
}