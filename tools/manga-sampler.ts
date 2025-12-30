import * as fs from 'fs';
import { MangaReader } from '@origin/manga_reader/manga_reader';
import { catch_log } from '@common/utils/error_util';


async function sample_manga() {
    const manga = await MangaReader.manga_list({query: "Bookworm"});
    if("error" in manga) {
        console.error(manga.error);
        return;
    }
    fs.writeFileSync(`sample/lutz/manga_search.json`, JSON.stringify(manga));
}
sample_manga().catch(catch_log);