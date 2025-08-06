import { generror, generror_catch } from "@common/utils/error_util";
import type { DocumentPicker } from "@native/document_picker/document_picker.base";
import { dialog } from 'electron';

export const node_document_picker: DocumentPicker = {
    save_document: async() => {
        try {

        }
        catch(e){
            return generror_catch(e, "Failed to save_document", {});
        }
    },
    pick_image: async() => {
        try {

        }
        catch(e){
            return generror_catch(e, "Failed to pick_image", {});
        }
    },
    pick_file: async() => {
        try {

        }
        catch(e) {
            return generror_catch(e, "Failed to pick_file", {});
        }
    },
    pick_multiple_files: async() => {
        try {

        }
        catch(e) {
            return generror_catch(e, "Failed to pick_multiple_files", {});
        }
    },
    pick_directory: async() => {
        try {
            dialog.showOpenDialog()
        }
        catch(e) {
            return generror_catch(e, "Failed to pick_directory", {});
        }
    }
};
