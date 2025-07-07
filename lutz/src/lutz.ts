import { MangaReader } from "../../origin/src/manga_reader/manga_reader";
import type { SetState } from "./types";
import type { MangaList } from '../../origin/src/manga_reader/types/types';
import { TimedCache } from "../../origin/src/utils/types";

export namespace Lutz {
    const search_cache = new TimedCache<string, MangaList>(1000 * 360);
    export async function search_manga_query(query: string, page = 0, set_search_manga: SetState = () => {}, set_search_manga_title: SetState = () => {}){
        const cache_key = `Q${query} :: P${page}`;
        const cached = search_cache.get(cache_key);
        const cached_hit = cached !== undefined;
        if(cached_hit) return cached;
        const manga_list = await MangaReader.manga_list({page, query});
        if("error" in manga_list) {
            // alert;
            return;
        }
        set_search_manga(manga_list.mangas);
        set_search_manga_title(manga_list.title);
        search_cache.update(cache_key, manga_list);
        return manga_list;
    }
}