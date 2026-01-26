import { load_native_modules } from "@native/gen/load_native_modules"

export async function roze_startup(){
    await load_native_modules();
}