export function remove(str: string, ...rs: (string|RegExp)[]) { for(const r of rs) str = str.replace(r, ''); return str; }
export function remove_special_chars(str: string) {
    const special_characters = "~`!@#$%^&*()_-+={[}]|\\:;\"'<,>.?/";
    for(const char of special_characters) str = remove(str, char);
    return str;
}

export function remove_topic(title: string) { return title.replace(" - Topic", ''); }
export function remove_prod(title: string) { return title.replace(/\(.+?\)/g, '').replace(/prod\. .+/, ''); }