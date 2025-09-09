import { fs } from "@native/fs/fs";

export namespace Paths {
    export async function get_roz_document_directory(...paths: string[]){
        //TODO 
        return await fs().document_directory("Roze", ...paths)
    }
}