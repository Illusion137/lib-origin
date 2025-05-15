const fs = require('fs');

const comment_map = new Array(8).fill(true).map((v, i) => {
    switch(process.argv[2]){
        default:
        case("-e"): return i == 0 || i == 1;
        case("-m"): return i == 2 || i == 3;
        case("-d"): return i == 4 || i == 5;
        case("-ds"): return i == 6 || i == 7;
    }
});

const path = process.argv[1].replace('build.js', 'bridge.ts');
const bridge_lines = fs.readFileSync(path)
    .toString("utf8")
    .replaceAll("\r\n", '\n')
    .replaceAll("// ", '')
    .split('\n')
    .map((s, i) => comment_map[i] ? s : "// " + s);

fs.writeFileSync(path, bridge_lines.join('\n'));