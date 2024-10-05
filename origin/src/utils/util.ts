export function decode_hex(hex: string) {
	return hex.replace(/\\x22/g, '"').replace(/\\x7b/g, '{').replace(/\\x7d/g, '}').replace(/\\x5b/g, '[').replace(/\\x5d/g, ']').replace(/\\x3b/g, ';').replace(/\\x3d/g, '=').replace(/\\x27/g, '\'').replace(/\\\\/g, 'doubleAntiSlash').replace(/\\/g, '').replace(/doubleAntiSlash/g, '\\')
}
export function generate_new_uid(prefix_name: string) {
	return prefix_name?.replace(/[^a-zA-Z0-9]/g,'') + '-' + new Date().getTime().toString(36).substring(2, 15) +
	Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) +
	Math.random().toString(36).substring(2, 15);
}
export function encode_params(data: Record<string, unknown>){
	const encoded_params: string[] = [];
	for(const key of Object.keys(data)){
		const param = data[key];
		encoded_params.push(`${key}=${encodeURIComponent(typeof(param) === "object" ? JSON.stringify(param) : <string|number|boolean>param )}`);
	}
	return encoded_params.join('&');
}
export function get_main_key(obj: object) { return Object.keys(obj)[0]; }
export function extract_string_from_pattern(str: string, pattern: RegExp){
	const body_groups = pattern.exec(str);
	if(body_groups === null) return {"error": "Couldn't extract pattern from string, NULL found"} ;
	if(body_groups.length < 2) throw {"error": "Couldn't extract pattern from string"};
	const extracted = body_groups[1];
	return extracted;
}
export function extract_all_strings_from_pattern(str: string, pattern: RegExp){
    const matched = str.matchAll(pattern);
    const match_spread = [...matched];
    return match_spread.map(match => match?.[1]).filter(match => match !== undefined);
}
export function parse_time(clock_time: string): number {
	let time = 0;
	const time_split = clock_time.split(":");
	for(let i = 0; i < time_split.length; i++){
		const parsed = parseInt(time_split[time_split.length - 1 - i]);
		if(i == 0) time += parsed;
		else time += parsed * Math.pow(60,i);
	}
	return time;
}
export function parse_runs(runs: ({text: string}[]) | undefined ): string {
    if(runs === undefined) return "";
    return runs.map(run => run.text).join(" ");
}
export function empty_undefined(str: string){ return is_empty(str) ? undefined : str; }
export function url_to_id(url: string, ...remove_links: string[]){ 
    let id = url.replace("https://", "").replace("www.", "").replace("http://", '');
    for(const link of remove_links){ id = id.replace(link, ""); }
    return id;
}
export function make_topic(title: string){ return `${title} - Topic`; }
export function remove_topic(title: string){ return title.replace(" - Topic", ''); }
export function is_empty(value: unknown){ return value === undefined || value === null || value === 0 || value === "" || (typeof value === "string" && value.trim() === "") || (typeof value === "object" && Object.keys(value).length === 0); }
export function remove_prod(title: string) { return title.replace(/\(.+?\)/g, '').replace(/prod\. .+/, ''); }
export function google_query(query: string) { return encodeURIComponent(query).split("%20").join("+"); }
export function remove(str: string, r: string) { return str.replace(r, ''); }
export function remove_special_chars(str: string) {
    const special_characters = "~`!@#$%^&*()_-+={[}]|\\:;\"'<,>.?/";
    for(const char of special_characters) str = remove(str, char);
    return str;
}