import type { PdfReader } from "@native/pdf_reader/pdf_reader.base";
import { get_native_platform } from "@native/native_mode";

let pdf_reader_instance: PdfReader;

export async function load_native_pdf_reader(): Promise<PdfReader> {
    if (pdf_reader_instance) return pdf_reader_instance;
    switch (get_native_platform()) {
        case "WEB":
            console.error("Web Native PdfReader is NOT implemented");
            break;
        case "NODE":
            try {
                pdf_reader_instance = (await import("./pdf_reader.node.ts")).node_pdf_reader;
            } catch (e) { console.error(e); }
            break;
        case "REACT_NATIVE":
            try {
                pdf_reader_instance = (await import("./pdf_reader.mobile.ts")).mobile_pdf_reader;
            } catch (e) { console.error(e); }
            break;
    }
    return pdf_reader_instance;
}

export function pdf_reader_native(): PdfReader {
    if (pdf_reader_instance) return pdf_reader_instance;
    console.error(new Error("Native Module [pdf_reader/PdfReader] is NOT loaded"));
    return pdf_reader_instance;
}
