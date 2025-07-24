import type { ResponseError } from "../types";
import { status_codes_descriptions } from "../status_codes";
import { CookieJar } from "./cookie_util";

export function args_prettystring(args: object, indent = 2){
	let str = '{\n';
	const keys = Object.keys(args);
	for(const key of keys){
		str += `${new Array(indent).fill(' ').join('')}${key}: ${JSON.stringify(args[key])}\n`;
	}
	str += '}'
	return str;
}
function is_error_instance(e: unknown){
    return e instanceof Error;
}
export function is_timeout_error(e: unknown){
    return e instanceof DOMException && e.name === "TimeoutError";
}

function clean_error_trace(error: Error): Error {
    if(!error.stack) return error;
	const bad_regexes: RegExp[] = [
		/anon_\d*_/i,
		/asyncGeneratorStep/i,
		/tryCallOne/i,
		/InternalBytecode/i,
		/invokeCallback/i,
		/callTimer/i,
		/callReact/i,
		/flushedQueue/i,
		/_next/i,
		/__guard/i,
		/anonymous/i,
		/apply/i,
        /generror(_.*?)?/i,
        /processTicksAndRejections/i,
        /Promise\._resolveFromExecutor/i,
        /\._compile/i,
        /node:interal/i,
        /Module\._?load/i,
        /wrapModuleLoad/i,
        /\.traceSync/i,
        /require.extensions.<computed>/i,
	];
    const filtered_lines = error.stack.split('\n').filter(line => line.includes("at ") && !bad_regexes.some(regex => regex.test(line)));
    error.stack = error.message + '\n' + filtered_lines.join('\n');
    return error;
}
function generror_base_msg(msg: string, emsg?: string, args: object = {}): string{
    return `${msg}${emsg ? " | " + emsg : ""}\n : args${args_prettystring(args)}`;
}
export function generror_catch(e: unknown, msg: string, args: object = {}): ResponseError{
    if(is_error_instance(e)){
        e.message = generror_base_msg(msg, e.message, args)
        return {error: clean_error_trace(e)};
    }
    else if(typeof e === "object" && e !== null && "error" in e){
        const err = e.error as Error;
        err.message = generror_base_msg(msg, err.message, args)
        return {error: clean_error_trace(err)};
    }
    return {error: clean_error_trace(new Error(`e: ${e}\n ${generror_base_msg(msg, undefined, args)}`))};
}
export function generror(msg: string, args: object = {}): ResponseError{
	return {error: clean_error_trace(new Error(generror_base_msg(msg, undefined, args)))};
}
export function generror_fetch(response: Response, msg: string, maybe_jar?: {cookie_jar?: CookieJar}, args: object = {}): ResponseError{
	return generror(`${msg};\n Response failed with status code ${response.status}(${status_codes_descriptions[response.status]}) : "${response.statusText}"${maybe_jar?.cookie_jar !== undefined ? " [Using Cookies]" : ""}`, args);
}