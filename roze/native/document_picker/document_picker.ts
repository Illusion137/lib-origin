import type { DocumentPicker } from "@native/document_picker/document_picker.base";
import { get_native_platform } from "@native/native_mode";

let document_picker_instance: DocumentPicker;

export async function load_native_document_picker(): Promise<DocumentPicker>{
    if (document_picker_instance) return document_picker_instance;
    switch (get_native_platform()) {
        case "WEB":
            console.error("Web Native document_picker is NOT implemented");
            break;
        case "NODE":
            console.error("Node Native document_picker is NOT implemented");
            break;
        case "REACT_NATIVE":
            try {
                document_picker_instance = (await import("./document_picker.mobile.ts")).mobile_document_picker;
            } catch (e) { console.error(e); }
            break;
    }
    return document_picker_instance;
}

export function document_picker(): DocumentPicker {
    if (document_picker_instance) return document_picker_instance;
    console.error(new Error("Native Module [document_picker/DocumentPicker] is NOT loaded"));
    return document_picker_instance;
}