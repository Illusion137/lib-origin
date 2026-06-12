import type { DocxConverter, DocxConvertResult } from "@native/docx_converter/docx_converter.base";

interface MammothBrowser { convertToHtml: (opts: { arrayBuffer: ArrayBuffer }) => Promise<DocxConvertResult> }

let mammoth_cache: MammothBrowser | null = null;
async function get_mammoth(): Promise<MammothBrowser> {
    if (mammoth_cache) return mammoth_cache;
    mammoth_cache = (await import('mammoth/mammoth.browser.js')).default as unknown as MammothBrowser;
    return mammoth_cache;
}

export const mobile_docx_converter: DocxConverter = {
    convert_docx_to_html: async (arrayBuffer) => (await get_mammoth()).convertToHtml({ arrayBuffer })
};
