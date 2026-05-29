import type { PdfReader, PdfLoadingTask, PdfDocument, PdfPage, PdfPageObjs, PdfMetadata, PdfMetadataInfo, PdfImageObject } from "@native/pdf_reader/pdf_reader.base";
import type { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist';
import type pdfjs_dist_module from 'pdfjs-dist';

type PdfjsModule = typeof pdfjs_dist_module;

let pdfjs_cache: PdfjsModule | null = null;

async function get_pdfjs(): Promise<PdfjsModule> {
    if (pdfjs_cache) return pdfjs_cache;
    if (typeof (globalThis as Record<string, unknown>).DOMMatrix === 'undefined') {
        (globalThis as Record<string, unknown>).DOMMatrix = class {
            a = 1; b = 0; c = 0; d = 1; e = 0; f = 0;
            is2D = true; isIdentity = true;
            constructor(init?: number[]) {
                if (Array.isArray(init) && init.length >= 6) {
                    this.a = init[0]; this.b = init[1]; this.c = init[2];
                    this.d = init[3]; this.e = init[4]; this.f = init[5];
                }
            }
            invertSelf() { return this; }
            preMultiplySelf(_m: unknown) { return this; }
            multiplySelf(_m: unknown) { return this; }
            translate(_tx: number, _ty: number) { return this; }
            scale(_s: number) { return this; }
        };
    }
    pdfjs_cache = await import('pdfjs-dist/build/pdf.mjs') as unknown as PdfjsModule;
    return pdfjs_cache;
}

function wrap_page_objs(raw_objs: PDFPageProxy['objs']): PdfPageObjs {
    return {
        get: (name: string, callback: (obj: PdfImageObject) => void): void => {
            raw_objs.get(name, callback);
        }
    };
}

function wrap_page(raw_page: PDFPageProxy): PdfPage {
    return {
        getViewport: (params: { scale: number }) => raw_page.getViewport(params),
        getOperatorList: async () => raw_page.getOperatorList(),
        getTextContent: async () => raw_page.getTextContent(),
        objs: wrap_page_objs(raw_page.objs)
    };
}

function wrap_document(raw_doc: PDFDocumentProxy): PdfDocument {
    return {
        get numPages() { return raw_doc.numPages; },
        getPage: async (pageNumber: number) => wrap_page(await raw_doc.getPage(pageNumber)),
        getMetadata: async (): Promise<PdfMetadata> => {
            const result = await raw_doc.getMetadata();
            return { info: result.info as PdfMetadataInfo };
        }
    };
}

export const mobile_pdf_reader: PdfReader = {
    getDocument: (params) => {
        let on_progress_fn: PdfLoadingTask['onProgress'] = null;
        return {
            promise: get_pdfjs().then(async (pdfjs) => {
                const raw_task = pdfjs.getDocument(params);
                if (on_progress_fn !== null) raw_task.onProgress = on_progress_fn;
                return wrap_document(await raw_task.promise);
            }),
            get onProgress(): PdfLoadingTask['onProgress'] { return on_progress_fn; },
            set onProgress(fn: PdfLoadingTask['onProgress']) { on_progress_fn = fn; }
        };
    },
    OPS: {
        showText: 44,
        showSpacedText: 45,
        paintImageXObject: 85,
        paintImageXObjectRepeat: 88,
    }
};
