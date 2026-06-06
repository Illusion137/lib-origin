import type { ScrapeFetch } from "@native/scrapefetch/scrapefetch.base";

export const fallback_scrapefetch: ScrapeFetch = async(input, init) => fetch(input, init);
