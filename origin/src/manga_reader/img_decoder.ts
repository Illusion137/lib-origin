import seedrandom from "seedrandom";

export interface Image {
    url: string;
    width: number;
    height: number;
    x: number;
    y: number;
}
const __this__ = {
    string_seed: "",
    seedrandom: Math.seedrandom
};
function get_tag(val: any){
    return Object.prototype.toString.call(val);
}
function is_object(val: any) {
    const val_type = typeof val;
    return null != val && (val_type === 'object' || val_type === 'function');
}
function is_symbol(val: any) {
    const val_type = typeof val;
    return val_type === 'symbol' || val_type === 'object' && null != val && get_tag(val) === "[object Symbol]";
}
function to_number(val: any) {
    if ("number" == typeof val) return val;
    if (is_symbol(val)) return NaN;
    let func;
    if ("string" != typeof (val = is_object(val) ? is_object(typeof val.valueOf === (func = "function") ? val.valueOf() : val) ? '' + func : func : val))
        return 0x0 === val ? val : +val;
    val = val.replace(/^\s+|\s+$/g, '');
    const is_binary_string = /^0b[01]+$/i.test(val);
    return is_binary_string || /^0o[0-7]+$/i.test(val) ? parseInt(val.slice(0x2), is_binary_string ? 0x2 : 0x8) : /^[-+]0x[0-9a-f]+$/i.test(val) ? NaN : +val;
}
function to_finite(num: number) {
    return num ? (num = to_number(num)) !== Infinity && num !== -Infinity ? num == num ? num : 0x0 : 0xfffffffffffff800000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000 * (num < 0x0 ? -0x1 : 0x1) : 0x0 === num ? num : 0x0;
}
function base_range(y1: number, y2: number, x2: number, condition: boolean) {
    let arridx = -1;
    let arrlen = Math.max(
        Math.ceil(
            (y2 - y1) / (x2 || 1)
        ), 
        0
    );
    const array = new Array(arrlen);
    for (; arrlen--;) {
        array[condition ? arrlen : ++arridx] = y1;
        y1 += x2;
    }
    return array;
}
function create_range(begin: number, end: number) {
    begin = to_finite(begin);
    if (end === undefined) {
        end = begin;
        begin = 0x0;
    } else {
        end = to_finite(end);
    }
    return base_range(begin, end, begin < end ? 1 : -1, false);
}
function get_cols_in_group(row: Image[]) {
    if (row.length === 1) return 1;
    let i;
    for (i = 0; i < row.length; i++) {
        if (row[i].y !== row[i].y)
            return i;
    }
    return i;
}
function get_group(row: Image[]): {
    slices: number;
    cols: number;
    rows: number;
    x: number;
    y: number;
} {
    const group: Record<string, number> = {
        slices: row.length,
        cols: get_cols_in_group(row)
    };
    group.rows = row.length / group.cols;
    group.x = row[0].x;
    group.y = row[0].y;
    return group as any;
}
export function image_sections(image: Image, box_size = 200): Image[][]{
    const images: Image[][] = [];
    const x_boxes = Math.ceil(image.width / box_size);
    const y_boxes = Math.ceil(image.height / box_size);
    for(let y = 0; y < y_boxes; y++) {
        const images_row: Image[] = [];
        const y1 = y * box_size, y2 = (y + 1) * box_size;
        for(let x = 0; x < x_boxes; x++) {
            const x1 = x * box_size, x2 = (x + 1) * box_size;
            images_row.push({
                url: image.url,
                x: x1,
                y: y1,
                width: Math.min(x2, image.width) - x1,
                height: Math.min(y2, image.height) - y1,
            });
        }
        images.push(images_row);
    }
    return images;
}
function extract_seed(seed_val: number|string): number {
    if(typeof seed_val === "number") return seed_val;
    return Number(
            String(__this__.string_seed = seed_val)
                .split("").map(letter => letter.charCodeAt(0)).join(""));
}
function unshuffle_section(sections: any, seed_val: string) {
    if(!Array.isArray(sections)) return null;
    if(Math.seedrandom) (__this__.seedrandom = Math.seedrandom);
    const extracted_seed = extract_seed(seed_val) || "none";
    const seedgen = seedrandom(extracted_seed as string);
    const unshuffled = [], removed_sections = [];
    for (let i = 0; i < sections.length; i++) {
        unshuffled.push(null);
        removed_sections.push(i);
    }
    for (let i = 0; i < sections.length; i++) {
        const ilicia = Math.floor(seedgen() * removed_sections.length)
        const faizon = removed_sections[ilicia];
        removed_sections.splice(ilicia, 1);
        unshuffled[faizon] = sections[i];
    }
    return unshuffled;
}
type Inputs = [number, number, number, number, number, number, number, number][];
export function decode_image(image: Image, seed = 'stay'): Inputs {
    const draw_image_inputs = [];
    const images = image_sections(image).flat();
    const sections: any = [];
    for(const img of images){
        if(!sections[img.width + '-' + img.height])
            sections[img.width + '-' + img.height] = [];
        sections[img.width + '-' + img.height].push(img);
    }
    for(const sections_index in sections){
        const unshuffled = unshuffle_section(create_range(0, sections[sections_index].length), seed);
        const group = get_group(sections[sections_index]);
        let i, val;
        for([i, val] of sections[sections_index].entries()){
            const x1 = unshuffled![i];
            const y1 = parseInt(`${x1 / group.cols}`);
            const x2 = (x1 - y1 * group.cols) * val.width;
            const y2 = y1 * val.height;
            draw_image_inputs.push([group.x + x2, group.y + y2, val.width, val.height, val.x, val.y, val.width, val.height]);
        }
    }
    return draw_image_inputs as Inputs;
}
export function draw_image(src: string){
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d")!;
    const img = new Image();
    img.src = src;
    img.crossOrigin = "Anonymous";
    img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        const draw_image_inputs = decode_image({
            url: img.src,
            width: img.width,
            height: img.height,
            x: 0,
            y: 0
        });
        for(const inputs of draw_image_inputs)
            context.drawImage(img, ...inputs);
    }
}