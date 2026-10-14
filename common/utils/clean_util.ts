export function remove(str: string, ...rs: (string | RegExp)[]) { for (const r of rs) str = str.replace(r, ''); return str; }
export function remove_topic(title: string) { return title.replace(' - Topic', '').replace(/\(@.+?\)/, ''); }
