import { load_native_docx_converter } from '@native/docx_converter/docx_converter';

const mammoth_lib = {
    convertToHtml: async (opts: { arrayBuffer: ArrayBuffer }) => {
        const mod = await load_native_docx_converter();
        return mod.convert_docx_to_html(opts.arrayBuffer);
    }
};

export default mammoth_lib;
