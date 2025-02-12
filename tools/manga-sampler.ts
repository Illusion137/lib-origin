import * as fs from 'fs';
import { MangaReader } from '../origin/src/manga_reader/manga_reader';


async function sample_manga() {
    const manga = await MangaReader.manga_list({query: "Bookworm"});
    if("error" in manga) {
        console.error(manga.error);
        return;
    }
    fs.writeFileSync(`sample/lutz/manga_search.json`, JSON.stringify(manga));
}
sample_manga().catch(e => e);