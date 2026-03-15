import type { ResponseError } from "@common/types";
import rozfetch from "@common/rozfetch";
import { jsdom_document } from '@common/jsdom';
import { catch_log, generror } from "@common/utils/error_util";
import { milliseconds_of } from "@common/utils/util";
import { load_native_fs } from "@native/fs/fs";

export namespace GoogleDocs {
    interface Row {
        xcoord: number;
        ycoord: number;
        char: string;
    };
    type Table = Row[];

    async function extract_table(url: string): Promise<ResponseError | Table> {
        const response = await rozfetch(url, { cache_opts: { cache_mode: "file", cache_on: "url", cache_ms: milliseconds_of({ days: 1 }) } });
        if ("error" in response) return response;
        const html = await response.text();
        const document = jsdom_document(html);

        const table: Table = [];
        const table_rows_elements = document.querySelectorAll("table tr");
        if (!table_rows_elements) return generror("No table rows exists", "LOW");

        for (const row of Array.from(table_rows_elements).slice(1)) {
            const [xcoord_element, char_element, ycoord_element] = Array.from(row.querySelectorAll("span"));
            table.push({
                xcoord: Number(xcoord_element.textContent),
                ycoord: Number(ycoord_element.textContent),
                char: char_element.textContent,
            });
        }
        return table;
    }

    function print_grid(table: Table) {
        const grid_width = Math.max(...table.map(({ xcoord }) => xcoord)) + 1;
        const grid_height = Math.max(...table.map(({ ycoord }) => ycoord)) + 1;
        const grid = new Array<string[]>(grid_height);
        for (let i = 0; i < grid.length; i++) {
            grid[i] = new Array<string>(grid_width).fill(" ");
        }

        for (const row of table) {
            grid[grid_height - row.ycoord - 1][row.xcoord] = row.char;
        }

        for (const row of grid) {
            console.log(row.join(''));
        }
    }

    export async function print_decoded_docs_secret_message(url: string) {
        const table = await extract_table(url);
        if ("error" in table) return;
        print_grid(table);
    }
};

async function main__() {
    await load_native_fs();
    // const url = "https://docs.google.com/document/d/e/2PACX-1vTMOmshQe8YvaRXi6gEPKKlsC6UpFJSMAk4mQjLm_u1gmHdVVTaeh7nBNFBRlui0sTZ-snGwZM4DBCT/pub";
    const url = "https://docs.google.com/document/d/e/2PACX-1vSvM5gDlNvt7npYHhp_XfsJvuntUhq184By5xO_pA4b_gCWeXb6dM6ZxwN8rE6S4ghUsCj2VKR21oEP/pub";
    await GoogleDocs.print_decoded_docs_secret_message(url);
}

main__().catch(catch_log);