import { generror, generror_catch } from "@common/utils/error_util";
import { extract_file_extension } from "@common/utils/util";
import type { DocumentPicker } from "@native/document_picker/document_picker.base";
import { pick, pickDirectory, saveDocuments, type DocumentPickerResponse } from '@react-native-documents/picker';
import ImagePicker from 'react-native-image-crop-picker';

function pick_result_to_selected_file(pick_result: DocumentPickerResponse) {
    if (pick_result.error !== null) return generror(pick_result.error, "MEDIUM", { pick_result });
    if (pick_result.name === null) return generror("Pick Result doesn't have a name", "MEDIUM", { pick_result });
    const file_extension = extract_file_extension(pick_result.name, "none");
    return {
        name: pick_result.name.replace(file_extension, ''),
        extension: file_extension,
        size_bytes: pick_result.size ?? 0,
        type: pick_result.type ?? "",
        uri: pick_result.uri
    };
}

export const mobile_document_picker: DocumentPicker = {
    save_document: async () => {
        try {
            const [saved] = await saveDocuments({
                sourceUris: ['some file uri'],
                copy: false,
                mimeType: 'text/plain',
                fileName: 'some file name',
            });
            if (saved.error !== null) return generror(saved.error, "MEDIUM", {});
            return { uri: saved.uri };
        }
        catch (e) {
            return generror_catch(e, "Failed to save_document", "MEDIUM", {});
        }
    },
    pick_image: async () => {
        try {
            const img = await ImagePicker.openPicker({ mediaType: 'photo', forceJpg: true });
            if (img.sourceURL === undefined) return generror("sourceURL is null", "MEDIUM", {});
            if (img.filename === undefined) return generror("filename is undefined", "MEDIUM", {});
            const file_extension = extract_file_extension(img.filename, "none");
            return {
                name: img.filename.replace(file_extension, ''),
                extension: file_extension,
                size_bytes: img.size,
                type: img.mime,
                uri: img.sourceURL
            };
        }
        catch (e) {
            return generror_catch(e, "Failed to pick_image", "INFO", {});
        }
    },
    pick_file: async () => {
        try {
            const [pick_result] = await pick({
                allowMultiSelection: false,
                allowVirtualFiles: false,
                mode: "import",
                presentationStyle: "fullScreen",
                type: ""
            });
            return pick_result_to_selected_file(pick_result);
        }
        catch (e) {
            return generror_catch(e, "Failed to pick_file", "INFO", {});
        }
    },
    pick_multiple_files: async () => {
        try {
            const pick_result = await pick({
                allowMultiSelection: true,
                allowVirtualFiles: false,
                mode: "import",
                presentationStyle: "fullScreen",
                type: ""
            });

            return pick_result.map(pick_result_to_selected_file);
        }
        catch (e) {
            return generror_catch(e, "Failed to pick_multiple_files", "INFO", {});
        }
    },
    pick_directory: async () => {
        try {
            const directory = await pickDirectory({
                requestLongTermAccess: false
            });

            return directory;
        }
        catch (e) {
            return generror_catch(e, "Failed to pick_directory", "INFO", {});
        }
    }
};
