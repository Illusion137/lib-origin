import type { ResponseError } from "@common/types";
import { generror_catch } from "@common/utils/error_util";
import { is_empty, small_string } from "@common/utils/util";
import { remove } from "@common/utils/clean_util";

function json_eval<T>(json: string): T {
    const result = eval("let evaluated = " + json + "; evaluated;");
    return result;
}
export function force_json_parse<T>(json_string: string): T {
	try { return JSON.parse(json_string) as T; } catch (error) { return {} as never; }
}
export function try_json_parse<T>(json_string: string): T|ResponseError {
	try { return JSON.parse(json_string) as T; } catch (error) { return generror_catch(error, "Failed to parse JSON", {json_string: small_string(json_string)}); }
}
export function try_json_eval<T>(json_string: string): T|ResponseError {
	try { return json_eval<T>(json_string); } catch (error) { return generror_catch(error, "Failed to eval JSON", {json_string: small_string(json_string)}); }
}

export function parse_time(clock_time: string|undefined): number {
    if(clock_time === undefined) return NaN;
	let time = 0;
	const time_split = clock_time.split(":");
	for(let i = 0; i < time_split.length; i++) {
		const parsed = parseInt(time_split[time_split.length - 1 - i]);
		if(i == 0) time += parsed;
		else time += parsed * Math.pow(60,i);
	}
	return time;
}
export function youtube_views_number(views_string?: string): number {
    if(is_empty(views_string)) return 0;
    views_string = remove(views_string!, " views",  " view", " plays", " play");
    const last_char = views_string[views_string.length - 1];

    switch(last_char) {
        case 'B': return parseFloat(views_string) * 1000000000;
        case 'M': return parseFloat(views_string) * 1000000;
        case 'K': return parseFloat(views_string) * 1000;
        default: return parseFloat(views_string);
    }
}
export function parse_runs(runs: ({text: string}[]) | undefined, join_with?: string ): string {
    if(runs === undefined) return "";
    return runs.map(run => run.text).join(join_with ?? " ");
}

export function parse_pdf_date(pdf_date: string): Date{
    if(!pdf_date.startsWith("D:")) return new Date(0);
    pdf_date = pdf_date.slice(2);
    const date = new Date(0);
    date.setFullYear(Number(pdf_date.slice(0,4)));
    date.setMonth(Number(pdf_date.slice(4,6)));
    date.setDate(Number(pdf_date.slice(6,8)));
    date.setHours(Number(pdf_date.slice(8,10)));
    date.setMinutes(Number(pdf_date.slice(10,12)));
    date.setSeconds(Number(pdf_date.slice(12,14)));
    return date;
}