import type { Zip } from "@native/zip/zip.base";
import { listZipContents, streamFileFromZip, unzipFile, createZipFile } from 'react-native-zip-stream';
import { generror_catch } from "@common/utils/error_util";

export const mobile_zip: Zip = {
    list_entries: async (file_path) => {
        try {
            const contents = await listZipContents(file_path);
            return contents as string[];
        }
        catch (e) {
            return generror_catch(e, "Failed to extract zip contents", "MEDIUM", { file_path });
        }
    },
    stream_entry: async (file_path, entry) => {
        try {
            const data = await streamFileFromZip(file_path, entry, "arraybuffer");
            return Buffer.from(data as ArrayBuffer);
        } catch (e) {
            return generror_catch(e, "Failed to stream zip entry", "MEDIUM", { file_path, entry });
        }
    },
    extract_all: async (file_path, destination_path) => {
        try {
            return await unzipFile(file_path, destination_path) as boolean;
        } catch (e) {
            return generror_catch(e, "Failed to extract zip", "MEDIUM", { file_path, destination_path });
        }
    },
    create_zip: async (source_path, destination_path) => {
        try {
            return await createZipFile(destination_path, source_path) as boolean;
        } catch (e) {
            return generror_catch(e, "Failed to create zip", "MEDIUM", { source_path, destination_path });
        }
    }
};
