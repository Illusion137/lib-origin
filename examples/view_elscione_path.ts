import { CookieJar } from "@common/utils/cookie_util";
import { load_native_fs } from "@native/fs/fs";
import { Elscione } from "@origin/elscione/elscione";

async function main__view_elscione_path() {
    await load_native_fs();
    const cookie_jar = new CookieJar([]);
    const all_items = await Elscione.view_path({path: "/Officially%20Translated%20Light%20Novels/", cookie_jar, filter: true});
    console.log(all_items);
}
main__view_elscione_path().catch(e => console.log(e));