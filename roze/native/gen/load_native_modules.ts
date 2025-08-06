import { load_native_fs } from "@native/fs/fs";

export async function load_native_modules(){
    await Promise.all([
        load_native_fs(),
    ]);
}