
import jsdom from 'jsdom-jscore-rn';

export function jsdom_document(html: string): Document {
    return jsdom.jsdom(html);
}

export function map_html_collection<T>(collection: HTMLCollection|NodeListOf<Element>|undefined, callback: (el: Element) => T) {
    const result: T[] = [];
    if(collection === undefined) return result;
    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for(let i = 0; i < collection.length; i++){
        result.push(callback(collection[i]));
    }
    return result;
}