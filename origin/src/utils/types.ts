export interface ResponseError { "error": string }
export interface ResponseSuccess { "success": true }
export type PromiseResult<T> = Promise<ResponseError|T>;
export type FetchMethod = "GET"|"POST"|"DELETE"|"PUT"|"OPTIONS";