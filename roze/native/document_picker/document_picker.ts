import type { DocumentPicker } from "@native/document_picker/document_picker.base";
import { get_native_platform } from "@native/native_mode";

export let document_picker: DocumentPicker;
switch(get_native_platform()){
    case "WEB": throw new Error("Web Native DocumentPicker is NOT implemented");
    case "NODE": try {document_picker = require("./document_picker.node").node_document_picker;} catch(e) {} break;
    case "REACT_NATIVE": try {document_picker = require("./document_picker.mobile").mobile_document_picker;} catch(e) {} break;
}
