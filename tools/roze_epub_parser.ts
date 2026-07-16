import { catch_log } from "@common/utils/error_util";
import { FileParser } from "@roze/file";

const epub_path = process.argv[2];

async function main(){
    if(epub_path === undefined) {
        console.warn("NEED A PATH ARGV");
        return;
    }
    const roze = await FileParser.parse_epub(epub_path, {});
    if("error" in roze) throw roze.error;
    console.log("CHAPTERS: ----");
    roze.chapters.forEach((chapter, i) => console.log(`(${i + 1}) ${chapter.chapter.title}\n ---- len: ${chapter.contents.length}`));
}

main().catch(catch_log);