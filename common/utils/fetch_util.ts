export function google_query(query: string) { return encodeURIComponent(query).split("%20").join("+"); }

export function encode_params(data: Record<string, unknown>, query?: [string, string]) {
	const encoded_params: string[] = [];
	for(const key of Object.keys(data)) {
		const param = data[key];
		encoded_params.push(`${key}=${encodeURIComponent(typeof(param) === "object" ? JSON.stringify(param) : param as string|number|boolean )}`);
	}
	if(query) 
		encoded_params.push(`${query[0]}=${query[1]}`);
	return encoded_params.join('&');
}
export function get_main_key(obj: object) { return Object.keys(obj)[0]; }