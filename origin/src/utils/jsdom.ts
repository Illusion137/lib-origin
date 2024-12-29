
const jsdom = require('jsdom-jscore-rn');

export function jsdom_document(html: string): Document {
    return jsdom.jsdom(html);
}