import type { PdfDocument, PdfGetDocumentParams, PdfLoadingTask } from "@native/pdf_reader/pdf_reader.base";
import { load_native_pdf_reader } from "@native/pdf_reader/pdf_reader";

export type { TextItem } from 'pdfjs-dist/types/src/display/api';
export type PDFDocumentProxy = PdfDocument;

// OPS constants are stable across pdfjs-dist versions.
// Verified against pdfjs-dist node_modules source.
const OPS = {
    showText: 44,
    showSpacedText: 45,
    paintImageXObject: 85,
    paintImageXObjectRepeat: 88,
} as const;

/**
 * Returns a PdfLoadingTask synchronously. The native module is loaded lazily
 * inside the task's promise so callers can set .onProgress before awaiting.
 */
function getDocument(opts: PdfGetDocumentParams): PdfLoadingTask {
    let on_progress_fn: ((progress: { loaded: number; total: number }) => void) | null = null;

    const promise: Promise<PdfDocument> = load_native_pdf_reader().then(async (mod) => {
        const raw_task = mod.getDocument(opts);
        if (on_progress_fn !== null) {
            raw_task.onProgress = on_progress_fn;
        }
        return raw_task.promise;
    });

    const task: PdfLoadingTask = {
        promise,
        get onProgress() { return on_progress_fn; },
        set onProgress(fn) { on_progress_fn = fn; },
    };

    return task;
}

const pdfjs_lib = {
    getDocument,
    OPS,
};

export default pdfjs_lib;
