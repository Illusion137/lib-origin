
const jsdom = require('jsdom-jscore-rn');

export function jsdom_document(html: string): Document {
    return jsdom.jsdom(html);
}

export function map_html_collection<T>(collection: HTMLCollection|NodeListOf<Element>|undefined, callback: (el: Element) => T) {
    const result: T[] = [];
    if(collection === undefined) return result;
    for(const item of collection)
        result.push(callback(item));
    return result;
}