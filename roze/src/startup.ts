import { load_native_modules } from "@native/gen/load_native_modules"

export type StartupMode = "INITIALIZE_PROCESS"|"INITIALIZE_APPLICATION"
export async function roze_startup(startup_mode: StartupMode){
    await load_native_modules();
}