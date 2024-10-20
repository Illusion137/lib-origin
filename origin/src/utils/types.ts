export type ResponseError = { "error": string };
export type ResponseSuccess = { "success": true };
export type PromiseResult<T> = Promise<ResponseError|T>;
export type FetchMethod = "GET"|"POST"|"DELETE"|"PUT"|"OPTIONS"