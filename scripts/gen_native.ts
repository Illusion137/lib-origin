import { fs,load_native_fs } from "@native/fs/fs";
import pathlib from "path";

const native_name = "zip";
const native_iname = "Zip";

const base_path = "./roze/native/";

const import_ts_contents = `import { get_native_platform } from "@native/native_mode";
import type { ${native_iname} } from "@native/${native_name}/${native_name}.base";

let ${native_name}_instance: ${native_iname};

export async function load_native_${native_name}(): Promise<${native_iname}>{
	if (${native_name}_instance) return ${native_name}_instance;
	switch (get_native_platform()) {
		case "WEB":
			console.error("Web Native ${native_iname} is NOT implemented");
			break;
		case "NODE":
			try {
				${native_name}_instance = (await import("./${native_name}.node.ts")).node_${native_name};
			} catch (e) { console.error(e); }
			break;
		case "REACT_NATIVE":
			try {
				${native_name}_instance = (await import("./${native_name}.mobile.ts")).mobile_${native_name};
			} catch (e) { console.error(e); }
			break;
	}
	return ${native_name}_instance;
}
export function ${native_name}(): ${native_iname} {
	if (${native_name}_instance) return ${native_name}_instance;
    console.error(new Error("Native Module [${native_name}/${native_iname}] is NOT loaded"));
	return ${native_name}_instance;
}
`;

const base_ts_contents = `export interface ${native_iname} {
    
}
`;

const mobile_ts_contents = `import type { ${native_iname} } from "@native/${native_name}/${native_name}.base";

export const mobile_${native_name}: ${native_iname} = {

};
`;

const node_ts_contents = `import type { ${native_iname} } from "@native/${native_name}/${native_name}.base";

export const node_${native_name}: ${native_iname} = {

};
`;

async function gen_native_main() {
	await load_native_fs();
	await fs().make_directory(pathlib.join(base_path, native_name));
	await fs().write_file_as_string(pathlib.join(base_path, native_name, native_name + ".ts"), import_ts_contents, {});
	await fs().write_file_as_string(pathlib.join(base_path, native_name, native_name + ".base.ts"), base_ts_contents, {});
	await fs().write_file_as_string(pathlib.join(base_path, native_name, native_name + ".mobile.ts"), mobile_ts_contents, {});
	await fs().write_file_as_string(pathlib.join(base_path, native_name, native_name + ".node.ts"), node_ts_contents, {});
}

gen_native_main().catch((e) => console.error(e));
//fire water wind earth
