import type { DocxConverter } from "@native/docx_converter/docx_converter.base";
import { get_native_platform } from "@native/native_mode";

let docx_converter_instance: DocxConverter;

export async function load_native_docx_converter(): Promise<DocxConverter> {
	if (docx_converter_instance) return docx_converter_instance;
	switch (get_native_platform()) {
		case "WEB":
			console.error("Web Native DocxConverter is NOT implemented");
			break;
		case "NODE":
			try {
				docx_converter_instance = (await import("./docx_converter.node.ts")).node_docx_converter;
			} catch (e) { console.error(e); }
			break;
		case "REACT_NATIVE":
			try {
				docx_converter_instance = (await import("./docx_converter.mobile.ts")).mobile_docx_converter;
			} catch (e) { console.error(e); }
			break;
	}
	return docx_converter_instance;
}

export function docx_converter(): DocxConverter {
	if (docx_converter_instance) return docx_converter_instance;
	console.error(new Error("Native Module [docx_converter/DocxConverter] is NOT loaded"));
	return docx_converter_instance;
}
