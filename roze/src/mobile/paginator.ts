import type { RozChapterContents, RozContent } from "@roze/types/roz";
import { Dimensions, type TextStyle } from "react-native";
import rn_text_size, { type TSFontVariant, type TSFontWeight } from 'react-native-text-size'
import { initialWindowMetrics } from 'react-native-safe-area-context';
import { reinterpret_cast } from "@common/cast";
import { text_style_map } from "./text_style";

export interface WindowSize {
    height: number;
    width: number;
};

export function points_to_px(points: number) {
    return points * 1.3333;
}

export function get_window_size(opts?: { horizontal_padding?: number, vertical_padding?: number }): WindowSize {
    const window_dimensions = Dimensions.get('screen');
    const intitial_window_metrics = initialWindowMetrics;
    if (intitial_window_metrics === null) return window_dimensions;
    const safe_window_height = window_dimensions.height - intitial_window_metrics.insets.top - intitial_window_metrics.insets.bottom - (opts?.vertical_padding ?? 0);
    const safe_window_width = window_dimensions.width - intitial_window_metrics.insets.left - intitial_window_metrics.insets.right - (opts?.horizontal_padding ?? 0);
    return {
        height: safe_window_height,
        width: safe_window_width
    }
}
export async function measure_text_roz_content_height_px(roz_content: RozContent, roz_text_style: TextStyle, window_size: WindowSize) {
    const measurement = await rn_text_size.measure({
        text: '\t' + roz_content.content,
        allowFontScaling: false,
        fontFamily: roz_text_style.fontFamily,
        fontSize: roz_text_style.fontSize,
        fontStyle: roz_text_style.fontStyle,
        fontVariant: reinterpret_cast<TSFontVariant[] | undefined>(roz_text_style.fontVariant),
        fontWeight: reinterpret_cast<TSFontWeight | undefined>(roz_text_style.fontWeight),
        width: window_size.width,
    });
    return points_to_px(measurement.height);
}
// export async function measure_roz_content_height_px_batch(roz_contents: RozContent[], roz_text_style: TextStyle, window_size: WindowSize){
//     rn_text_size.flatHeights({text:, fontWeight:})
// }
export async function paginate_roz_contents(roz_chapter_contents: RozChapterContents[], window_size: WindowSize, text_bottom_margin: number) {
    const roz_pages: RozContent[][] = [];
    let page_content_bucket: RozContent[] = [];
    let accumulated_height = 0;

    function try_insert_bucket() {
        if (page_content_bucket.length > 0) {
            roz_pages.push(page_content_bucket);
            page_content_bucket = [];
            accumulated_height = 0;
        }
    }

    for (const chapter of roz_chapter_contents) {
        for (const content of chapter.contents) {
            if (content.type === "IMAGE") {
                try_insert_bucket();
                page_content_bucket = [content];
                try_insert_bucket();
                continue;
            }
            const text_measurement = await measure_text_roz_content_height_px(content, text_style_map[content.type]("#ffffff"), window_size) + text_bottom_margin;
            if (accumulated_height + text_measurement >= window_size.height) {
                try_insert_bucket();
                page_content_bucket = [content];
            }
            else {
                accumulated_height += text_measurement;
                page_content_bucket.push(content);
            }
        }
        try_insert_bucket();
    }
    return roz_pages;
}