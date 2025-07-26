import { fs } from "@native/fs/fs";
import pathlib from 'path';

const native_name = "sqlite";
const native_iname = "SQLite";

const base_path = "./roze/native/";

const import_ts_contents = 
`import type { ${native_iname} } from "@native/${native_name}/${native_name}.base";
import { get_native_platform } from "@native/native_mode";

export let ${native_name}: ${native_iname};
switch(get_native_platform()){
    case "WEB": throw new Error("Web Native ${native_iname} is NOT implemented");
    case "NODE": try {${native_name} = require("./${native_name}.node").node_${native_name};} catch(e) {} break;
    case "REACT_NATIVE": try {${native_name} = require("./${native_name}.mobile").mobile_${native_name};} catch(e) {} break;
}
`;

const base_ts_contents = 
`export interface ${native_iname} {
    
}
`;

const mobile_ts_contents = 
`import type { ${native_iname} } from "@native/${native_name}/${native_name}.base";

export const mobile_${native_name}: ${native_iname} = {

};
`;

const node_ts_contents = 
`import type { ${native_iname} } from "@native/${native_name}/${native_name}.base";

export const node_${native_name}: ${native_iname} = {

};
`;

async function gen_native_main(){
    await fs.make_directory(pathlib.join(base_path, native_name));
    await fs.write_file_as_string(pathlib.join(base_path, native_name, native_name + '.ts'), import_ts_contents, {});
    await fs.write_file_as_string(pathlib.join(base_path, native_name, native_name + '.base.ts'), base_ts_contents, {});
    await fs.write_file_as_string(pathlib.join(base_path, native_name, native_name + '.mobile.ts'), mobile_ts_contents, {});
    await fs.write_file_as_string(pathlib.join(base_path, native_name, native_name + '.node.ts'), node_ts_contents, {});
}

gen_native_main().catch(e => console.error(e));
//fire water wind earth