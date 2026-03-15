import type { Zip } from "@native/zip/zip.base";
import { generror_catch } from "@common/utils/error_util";
import AdmZip from 'adm-zip';

export const node_zip: Zip = {
    list_entries: async (file_path) => {
        try {
            const zip = new AdmZip(file_path);
            return zip.getEntries().map((e) => e.entryName);
        } catch (e) {
            return generror_catch(e, "Failed to list zip entries", "MEDIUM", { file_path });
        }
    },
    stream_entry: async (file_path, entry) => {
        try {
            const zip = new AdmZip(file_path);
            const data = zip.readFile(entry);
            if (!data) throw new Error(`Entry not found: ${entry}`);
            return data;
        } catch (e) {
            return generror_catch(e, "Failed to stream zip entry", "MEDIUM", { file_path, entry });
        }
    },
    extract_all: async (file_path, destination_path) => {
        try {
            const zip = new AdmZip(file_path);
            zip.extractAllTo(destination_path, true);
            return true;
        } catch (e) {
            return generror_catch(e, "Failed to extract zip", "MEDIUM", { file_path, destination_path });
        }
    },
    create_zip: async (source_path, destination_path) => {
        try {
            const zip = new AdmZip();
            zip.addLocalFolder(source_path);
            zip.writeZip(destination_path);
            return true;
        } catch (e) {
            return generror_catch(e, "Failed to create zip", "MEDIUM", { source_path, destination_path });
        }
    }
};
