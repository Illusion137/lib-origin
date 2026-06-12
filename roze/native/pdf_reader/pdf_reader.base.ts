export interface PdfTextItem {
    str: string;
    transform: number[];
    height: number;
    width: number;
}

export interface PdfTextMarkedContent {
    type: string;
}

export interface PdfTextContent {
    items: (PdfTextItem | PdfTextMarkedContent)[];
}

export interface PdfImageObject {
    data: Uint8Array;
    width: number;
    height: number;
    dataLen: number;
}

export interface PdfOperatorList {
    fnArray: number[];
    argsArray: unknown[][];
}

export interface PdfViewport {
    height: number;
}

export interface PdfPageObjs {
    get: (name: string, callback: (obj: PdfImageObject) => void) => void;
}

export interface PdfPage {
    getViewport: (params: { scale: number }) => PdfViewport;
    getOperatorList: () => Promise<PdfOperatorList>;
    getTextContent: () => Promise<PdfTextContent>;
    objs: PdfPageObjs;
}

export interface PdfMetadataInfo {
    PDFFormatVersion?: string;
    IsAcroFormPresent?: boolean;
    IsXFAPresent?: boolean;
    Title?: string;
    Author?: string;
    Creator?: string;
    Producer?: string;
    CreationDate?: string;
    ModDate?: string;
}

export interface PdfMetadata {
    info: PdfMetadataInfo;
}

export interface PdfDocument {
    numPages: number;
    getPage: (pageNumber: number) => Promise<PdfPage>;
    getMetadata: () => Promise<PdfMetadata>;
}

export interface PdfLoadingTask {
    promise: Promise<PdfDocument>;
    onProgress: ((progress: { loaded: number; total: number }) => void) | null;
}

export interface PdfReaderOPS {
    showText: number;
    showSpacedText: number;
    paintImageXObject: number;
    paintImageXObjectRepeat: number;
}

export interface PdfGetDocumentParams {
    data: Uint8Array;
    password?: string;
    verbosity?: number;
}

export interface PdfReader {
    getDocument: (params: PdfGetDocumentParams) => PdfLoadingTask;
    OPS: PdfReaderOPS;
}
