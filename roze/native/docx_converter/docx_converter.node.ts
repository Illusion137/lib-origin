import type { DocxConverter } from "@native/docx_converter/docx_converter.base";
import mammoth from 'mammoth';

export const node_docx_converter: DocxConverter = {
    convert_docx_to_html: async (arrayBuffer) => mammoth.convertToHtml({ arrayBuffer })
};
