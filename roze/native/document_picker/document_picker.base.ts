import type { PromiseResult, ResponseError } from "@common/types";

export interface DocumentPickerSelectedFile {
    uri: string;
    name: string; // Filename without extension
    extension: string;
    size_bytes: number;
    type: string;
}
export interface DocumentPickerSelectedDirectory {
    uri: string;
}
export interface DocumentPickerSaveDocumentResponse {
    uri: string;
}
export interface DocumentPicker {
    save_document: () => PromiseResult<DocumentPickerSaveDocumentResponse>;
    pick_image: () => PromiseResult<DocumentPickerSelectedFile|null>;
    pick_file: () => PromiseResult<DocumentPickerSelectedFile>;
    pick_multiple_files: () => PromiseResult<(DocumentPickerSelectedFile|ResponseError)[]>;
    pick_directory: () => PromiseResult<DocumentPickerSelectedDirectory>;
}