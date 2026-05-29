import type { DocxConverter, DocxConvertResult } from "@native/docx_converter/docx_converter.base";
import mammoth_browser_raw from 'mammoth/mammoth.browser.js';

const mammoth_browser = mammoth_browser_raw as unknown as {
    convertToHtml: (opts: { arrayBuffer: ArrayBuffer }) => Promise<DocxConvertResult>;
};

export const mobile_docx_converter: DocxConverter = {
    convert_docx_to_html: async (arrayBuffer) => mammoth_browser.convertToHtml({ arrayBuffer })
};
