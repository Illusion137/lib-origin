import * as fs from 'fs';
import path from 'path-browserify';
import { log_error } from '@common/log';
const cwd = process.argv[2];

const ignore_top_level_prefixes: string[] = [
    "admin",
    "bin",
    "tests",
    "tools",
    "scratch",
    "LICENSE",
    "translate_m",
    "illusicord",
    "dist-roze-native",
    "SillyTest",
];
// Any path segment equal to one of these (at any depth)
const ignore_segments: string[] = [
    "node_modules",
    ".history",
    ".venv",
    ".vscode",
    ".claude",
    ".husky",
    "python",
];
// Any file/dir (at any depth) whose name starts with one of these
const ignore_name_prefixes: string[] = [
    ".git", // .git, .github, .gitignore, .gitattributes, ...
    ".env",
    "package",
    "tsconfig",
    "babel",
    "jest",
];
// Any file/dir (at any depth) whose name ends with one of these
const ignore_name_suffixes: string[] = [
    "ignore", // .gitignore, .eslintignore, ...
    ".epub",
];
function keep_file(src: string, root: string): boolean {
    const relative = path.relative(root, src);
    if (relative === "") return true;
    const segments = relative.split(/[\\/]/).filter(segment => segment.length !== 0);
    if (ignore_top_level_prefixes.some(prefix => segments[0].startsWith(prefix))) return false;
    for (const segment of segments) {
        if (ignore_segments.includes(segment)) return false;
        if (ignore_name_prefixes.some(prefix => segment.startsWith(prefix))) return false;
        if (ignore_name_suffixes.some(suffix => segment.endsWith(suffix))) return false;
    }
    return true;
}

try {
    const joined = path.join(cwd, "lib-origin");
    if (process.env?.LORIGIN === undefined) {
        log_error("No $LORIGIN supplied.");
        process.exit(1);
    }
    fs.rm(joined, { recursive: true, maxRetries: 0 }, () => {
        fs.mkdir(joined, () => {
            fs.cpSync(process.env.LORIGIN, joined, { recursive: true, filter: (src, _) => keep_file(src, process.env.LORIGIN!) });
        });

    });
} catch (error) { console.log(error); }
console.log("FINISHED TRANSFERING FILES");