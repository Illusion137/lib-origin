export type ResponseError = { "error": string };
export type PromiseResult<T> = Promise<ResponseError|T>;