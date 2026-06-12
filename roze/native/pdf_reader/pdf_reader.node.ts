import type { PdfReader, PdfLoadingTask, PdfDocument, PdfPage, PdfPageObjs, PdfMetadata, PdfMetadataInfo, PdfImageObject } from "@native/pdf_reader/pdf_reader.base";
import type { PDFDocumentLoadingTask, PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist';
import pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';

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

function wrap_loading_task(raw_task: PDFDocumentLoadingTask): PdfLoadingTask {
    return {
        promise: raw_task.promise.then((raw_doc) => wrap_document(raw_doc)),
        get onProgress(): PdfLoadingTask['onProgress'] {
            return raw_task.onProgress as PdfLoadingTask['onProgress'];
        },
        set onProgress(fn: PdfLoadingTask['onProgress']) {
            raw_task.onProgress = fn ?? ((): void => { return; });
        }
    };
}

export const node_pdf_reader: PdfReader = {
    getDocument: (params) => wrap_loading_task(pdfjs.getDocument(params)),
    OPS: {
        showText: pdfjs.OPS.showText,
        showSpacedText: pdfjs.OPS.showSpacedText,
        paintImageXObject: pdfjs.OPS.paintImageXObject,
        paintImageXObjectRepeat: pdfjs.OPS.paintImageXObjectRepeat,
    }
};
