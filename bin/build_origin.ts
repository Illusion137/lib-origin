import * as fs from 'fs';
import path from 'path-browserify';
import { log_error } from '@common/log';
const cwd = process.argv[2];

declare namespace NodeJS {
	export interface ProcessEnv {
        LORIGIN: string;
	}
}


const ignore_sources: string[] = [
    "node_modules", 
    "admin", 
    "bin", 
    "tests", 
    "tools", 
    ".env", 
    "package", 
    "scratch", 
    "tsconfig", 
    "babel", 
    "jest", 
    "LICENSE", 
    "README", 
    "gitignore", 
    ".git", 
    ".history",
    "translate",
    "python",
    "ignore",
    ".venv",
    ".vscode"
];
function keep_file(src: string): boolean {
    for(const ignore_source of ignore_sources)
        if(src.includes(ignore_source)) return false;
    return true;
}

try {
    const joined = path.join(cwd, "lib-origin");
    if(process.env?.LORIGIN === undefined) {
        log_error("No $LORIGIN supplied.");
        process.exit(1);
    }
    fs.rm(joined, {recursive: true, maxRetries: 0}, () => {
        fs.mkdir(joined, () => {
            fs.cpSync(process.env.LORIGIN!, joined, {recursive: true, filter: (src, _) =>keep_file(src)});
        });

    });
} catch (error) { console.log(error); }
console.log("FINISHED TRANSFERING FILES");