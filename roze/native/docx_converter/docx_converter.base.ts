export interface DocxConvertResult {
    value: string;
    messages: { type: string }[];
}

export interface DocxConverter {
    convert_docx_to_html: (arrayBuffer: ArrayBuffer) => Promise<DocxConvertResult>;
}
