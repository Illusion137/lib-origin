import axios from "axios"
import { CookieJar } from "./cookie_util";

namespace request {
    interface RequestOptions extends AxiosRequestOptions {
        cookie_jar: CookieJar
    }
    interface ResponseSuccess {
        status_code: number,
        message: string,
        data: any,
        new_jar: CookieJar
    }
    type Response = ResponseSuccess | ResponseError;
    export async function get(url: string, config: {}, jar: CookieJar | undefined = undefined): Promise<Response>{
        try {
            const response = axios.get(url, config);
            // Do stuff with cookies
            return response;   
        } catch (error) { return { "error": String(error) }; }
    }
}