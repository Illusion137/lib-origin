import path from "path";
import { fs, load_native_fs } from "@native/fs/fs";
import { asset_loader, load_native_asset_loader } from "@native/asset_loader/asset_loader";
import { load_native_miscnative, miscnative } from "@native/miscnative/miscnative";
import { load_native_sqlite, sqlite } from "@native/sqlite/sqlite";
import { load_native_mmkv, mmkv } from "@native/mmkv/mmkv";
import { ffmpeg, load_native_ffmpeg } from "@native/ffmpeg/ffmpeg";

type NativeModuleInfo = [string, () => object, string, () => Promise<any>];
type NativeModuleInfoWithKeys = [string, () => object, string, () => Promise<any>, string[]];
const native_scripts: NativeModuleInfo[] = [
	["fs", fs, "FileSystem", load_native_fs],
	["ffmpeg", ffmpeg, "FFMPEG", load_native_ffmpeg],
	["miscnative", miscnative, "MiscNative", load_native_miscnative],
	["sqlite", sqlite, "SQLite", load_native_sqlite],
	["mmkv", mmkv, "MMKVModule", load_native_mmkv],
    ["asset_loader", asset_loader, "AssetLoader", load_native_asset_loader]
];

function gendependencies(module_titles: string[], type_only: boolean): string {
	return module_titles.map((title) => `import ${type_only ? "type " : ""}{ ${title} } from "@native/${title}/${title}";`).join("\n");
}
function gendependencies_load_natives(module_titles: string[]): string {
	return module_titles.map((title) => `import { load_native_${title} } from "@native/${title}/${title}";`).join("\n");
}

//import { load_native___NATIVE_MODULE__ } from "@native___NATIVE_MODULE__";

async function generate_modules_template(template_file_path: string, native_modules_keys: NativeModuleInfoWithKeys[]){
    const modules_template_contents = await fs().read_as_string(template_file_path, {});
    if(typeof modules_template_contents === 'object') return "__NO_MODULES_TEMPLATE__";
    const modules: string[] = [];
    if(modules_template_contents.includes("__KEY__")){
        for(const native_modules_key of native_modules_keys){
            for(const key of native_modules_key[4]){
                modules.push(
                    modules_template_contents
                        .replaceAll("__KEY__", key)
                        .replaceAll("__NATIVE_MODULE__", native_modules_key[0])
                        .replaceAll("__NATIVE_MODULE_INTERFACE__", native_modules_key[2])
                );
            }
        }
    }
    else {
        for(const native_modules_key of native_modules_keys){
            modules.push(
                modules_template_contents
                    .replaceAll("__NATIVE_MODULE__", native_modules_key[0])
                    .replaceAll("__NATIVE_MODULE_INTERFACE__", native_modules_key[2])
            );
        }
    }

    return modules.join('\n');
}

async function generate_file_from_template(template_file_path: string, save_file_path: string, native_modules_keys: NativeModuleInfoWithKeys[], type_only: boolean, script?: NativeModuleInfoWithKeys){
    const template_contents = await fs().read_as_string(template_file_path, {});
    if(typeof template_contents === 'object') throw template_contents.error;
    await fs().write_file_as_string(
        save_file_path, 
        template_contents
            .replaceAll("__IMPORT_NATIVE_MODULES__", gendependencies(native_modules_keys.map(n => n[0]), type_only))
            .replaceAll("__LOAD_PRELOAD_MODULES__", await generate_modules_template(template_file_path.replace('.template', '.mod.template'), native_modules_keys))
            .replaceAll("__LOAD_PRELOAD_TYPE_MODULES__", await generate_modules_template(template_file_path.replace('.template', '.mod.template'), native_modules_keys))
            .replaceAll("__LOAD_IPC_HANDLE_MODULES__", await generate_modules_template(template_file_path.replace('.template', '.mod.template'), native_modules_keys))
            .replaceAll("__NATIVE_MODULE__", script?.[0] ?? "__NO_SCRIPT__")
            .replaceAll("__NATIVE_MODULE_INTERFACE__", script?.[2] ?? "__NO_SCRIPT__")
    , {});
}
async function generate_load_native_modules_from_template(template_file_path: string, save_file_path: string, native_modules_keys: NativeModuleInfoWithKeys[]){
    const template_contents = await fs().read_as_string(template_file_path, {});
    if(typeof template_contents === 'object') throw template_contents.error;

    await fs().write_file_as_string(
        save_file_path,
        template_contents
            .replaceAll("__IMPORT_LOAD_NATIVE_MODULES__", gendependencies_load_natives(native_modules_keys.map(n => n[0])))
            .replaceAll("__LOAD_NATIVE_MODULES_MODULES__", await generate_modules_template(template_file_path.replace('.template', '.mod.template'), native_modules_keys))
    , {});
}

async function load_native_modules(): Promise<NativeModuleInfoWithKeys[]>{
    return await Promise.all(
        native_scripts.map(
            async(script) => await Promise.all([...script, Object.keys(await (script[3]()))])
        )
    );
}

async function genelectron_native_main() {
    const gen_base_path = "roze/native/gen/electron/";
    const template_base_path = "roze/native/templates/electron/";
	const gen_base_electron_path = path.join(gen_base_path, "/modules/");
	const template_base_electron_path = path.join(template_base_path, "/modules/");
    const native_modules_keys = await load_native_modules();

    await generate_file_from_template(path.join(template_base_path, "load_ipc.template")    , path.join(gen_base_path, "load_ipc.ts")    , native_modules_keys, false);
    await generate_file_from_template(path.join(template_base_path, "preload_type.template"), path.join(gen_base_path, "preload_type.ts"), native_modules_keys, true);
    await generate_file_from_template(path.join(template_base_path, "preload.template")     , path.join(gen_base_path, "preload.ts")     , native_modules_keys, true);

	for (const script of native_modules_keys) {
        await generate_file_from_template(path.join(template_base_electron_path, "native_module.electron.template"), path.join(gen_base_electron_path, `${script[0]}.electron_renderer.ts`), native_modules_keys, true, script);
        await generate_file_from_template(path.join("roze/native/templates/", "native_module.template"), path.join(`roze/native/${script[0]}`, `${script[0]}.ts`), native_modules_keys, true, script);
	}

    await generate_load_native_modules_from_template(path.join("roze/native/templates/", "load_native_modules.template"), path.join("roze/native/gen/", "load_native_modules.ts"), native_modules_keys);
}
genelectron_native_main().catch(console.error);
