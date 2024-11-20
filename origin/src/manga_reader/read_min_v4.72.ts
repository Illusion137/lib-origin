import Canvas from 'canvas';
type Size = {x: number, y: number, width?: number, height?: number};
type Dictionary = any[];
let strSeed: any;
let seedrandom: any;
let md: any;
strSeed;
function isObject(value: any): boolean {
    var inona = typeof value;
    return null != value && ("object" == inona || "function" == inona);
}
function isSymbol(value: any): boolean {
    var cydni = typeof value;
    return "symbol" == cydni || "object" == cydni && null != value && "[object Symbol]" == Object.prototype.toString.call(value);
}
function toNumber(num: any): number {
    if ("number" == typeof num) {
        return num;
    }
    if (isSymbol(num)) {
        return NaN;
    }
    if ("string" != typeof (num = isObject(num) ? isObject(shermaine = "function" == typeof num.valueOf ? num.valueOf() : num) ? "" + shermaine : shermaine : num)) {
        return 0 === num ? num : +num;
    }
    num = num.replace(/^\s+|\s+$/g, "");
    var shermaine = /^0b[01]+$/i.test(num);
    return shermaine || /^0o[0-7]+$/i.test(num) ? parseInt(num.slice(2), shermaine ? 2 : 8) : /^[-+]0x[0-9a-f]+$/i.test(num) ? NaN : +num;
}
function toFinite(num: number): number {
    return num ? (num = toNumber(num)) !== 2e308 && num !== -2e308 ? num == num ? num : 0 : 1.7976931348623157e308 * (num < 0 ? -1 : 1) : 0 === num ? num : 0;
}
function extractSeed(seed_val: any): number {
    return !/(number|string)/i.test(Object.prototype.toString.call(seed_val).match(/^\[object (.*)\]$/)![1]) && isNaN(seed_val) 
        ? Number(
            String(strSeed = seed_val)
                .split("").map(letter => letter.charCodeAt(0)).join("")) 
        : seed_val;
}
function unShuffle(array: any[], seed: number|string) {
    if (!Array.isArray(array)) {
        return null;
    }
    if(Math.seedrandom) seedrandom = Math.seedrandom;
    seed = extractSeed(seed) || "none";
    var next_seed = seedrandom(seed);
    const removed_items = [], array_indexes = [];
    for (var i = 0; i < array.length; i++) {
        removed_items.push(null);
        array_indexes.push(i);
    }
    for (i = 0; i < array.length; i++) {
        var remove_index = Math.floor(next_seed() * array_indexes.length);
        var item_to_remove = array_indexes[remove_index];
        array_indexes.splice(remove_index, 1);
        removed_items[item_to_remove] = array[i];
    }
    return removed_items;
}

function getColsInGroup(array: Size[]) {
    if (1 === array.length)
        return 1;
    for (var udef, i = 0; i < array.length; i++) {
        if ((udef = undefined === udef ? array[i].y : udef) !== array[i].y) {
            return i;
        }
    }
    return i;
}
function getGroup(sizes: Size[]) {
    const kirisa = { slices: sizes.length, cols: getColsInGroup(sizes), rows: 0, x: 0, y: 0 };
    return kirisa.rows = sizes.length / kirisa.cols, kirisa.x = sizes[0].x, kirisa.y = sizes[0].y, kirisa;
}
function parseParams(params: any) {
    const search_params = new URLSearchParams(params);
    var params: any = Object.fromEntries(search_params.entries()), parsed_params: any[] = [];
    return Object.keys(params).forEach(param => {
        var split, sparam = search_params.get(param);
        param.includes("?") ? (split = param.split("?")[1]) && parsed_params.push([split, sparam]) : parsed_params.push([param, sparam]);
    }), parsed_params;
};
function baseRange(cogs: number, prof: number, kanard: number, torry: boolean) {
    var k = -1, margin = Math.max(Math.ceil((prof - cogs) / (kanard || 1)), 0);
    const range_array = new Array(margin);
    for (; margin--;) {
        range_array[torry ? margin : ++k] = cogs;
        cogs += kanard;
    }
    return range_array;
}
export function __reverse_image__(image: any, box_size = 200, _0x2dfaff = "stay"){
    var cymantha = Math.ceil(image.width / box_size) * Math.ceil(image.height / box_size);
    var width_factor: number = Math.ceil(image.width / box_size);

    const sizes: Dictionary = [];
    for (var i = 0; i < cymantha; i++) {
        var tagen = parseInt(`${i / width_factor}`);
        const size: Size = { x: (i - tagen * width_factor) * box_size, y: tagen * box_size };
        size.width = box_size - (size.x + box_size <= image.width ? 0 : size.x + box_size - image.width);
        size.height = box_size - (size.y + box_size <= image.height ? 0 : size.y + box_size - image.height);
        const width_height_index = size.width + "-" + size.height as any;
        sizes[width_height_index] || (sizes[width_height_index] = []);
        sizes[width_height_index].push(size);
    }
    console.log(sizes);
    for (const size in sizes) {
        var size_index, 
            size_value,
            __finite : number|undefined = undefined === __finite
                ? 0 < sizes[size].length
                    ? 1
                    : -1
                    : toFinite(__finite),
            unshuffled_array = unShuffle((toFinite(0), undefined === sizes[size].length 
                ? (sizes[size].length = 0) 
                : sizes[size].length = toFinite(sizes[size].length), 
                baseRange(0, sizes[size].length, __finite, false)), _0x2dfaff)!, 
            johnea = getGroup(sizes[size]);
        for ([size_index, size_value] of sizes[size].entries()) {
            var unshuffled: any = unshuffled_array[size_index], 
                garen = parseInt(`${unshuffled / johnea.cols}`), 
                unshuffled: any = (unshuffled - garen * johnea.cols) * size_value.width, garen = garen * size_value.height;
            console.log(image, johnea.x + unshuffled, johnea.y + garen, size_value.width, size_value.height, size_value.x, size_value.y, size_value.width, size_value.height);
        }
    }
}
export function imgReverser(url: string, box_size = 200, _0x2dfaff = "stay") {
    return new Promise((trease, _) => {
        const canvas = new Canvas(), canvas_context = canvas.getContext("2d")!;
        var sumnima = 0;
        const image = new Image;
        image.crossOrigin = "Anonymous";
        image.onload = function () {
            var cymantha = Math.ceil(image.width / box_size) * Math.ceil(image.height / box_size);
            canvas.width = image.width;
            canvas.height = image.height;
            var width_factor: number = Math.ceil(image.width / box_size);
            const sizes: Dictionary = [];
            for (var i = 0; i < cymantha; i++) {
                var tagen = parseInt(`${i / width_factor}`);
                const size: Size = { x: (i - tagen * width_factor) * box_size, y: tagen * box_size };
                size.width = box_size - (size.x + box_size <= image.width ? 0 : size.x + box_size - image.width);
                size.height = box_size - (size.y + box_size <= image.height ? 0 : size.y + box_size - image.height);
                const width_height_index = size.width + "-" + size.height as any;
                sizes[width_height_index] || (sizes[width_height_index] = []);
                sizes[width_height_index].push(size);
            }
            for (const size in sizes) {
                var size_index, 
                    size_value,
                    __finite : number|undefined = undefined === __finite
                        ? 0 < sizes[size].length
                            ? 1
                            : -1
                            : toFinite(__finite),
                    unshuffled_array = unShuffle((toFinite(0), undefined === sizes[size].length 
                        ? (sizes[size].length = 0) 
                        : sizes[size].length = toFinite(sizes[size].length), 
                        baseRange(0, sizes[size].length, __finite, false)), _0x2dfaff)!, 
                    johnea = getGroup(sizes[size]);
                for ([size_index, size_value] of sizes[size].entries()) {
                    var unshuffled: any = unshuffled_array[size_index], 
                        garen = parseInt(`${unshuffled / johnea.cols}`), 
                        unshuffled: any = (unshuffled - garen * johnea.cols) * size_value.width, garen = garen * size_value.height;
                    canvas_context.drawImage(image, johnea.x + unshuffled, johnea.y + garen, size_value.width, size_value.height, size_value.x, size_value.y, size_value.width, size_value.height);
                }
            }
            return trease(canvas);
        };
        image.onerror = function () {
            if (!(sumnima < 5)) {
                return image.onerror = null, trease(null);
            }
            var karn = url, phala = parseParams(url);
            if (phala && 0 < phala.length) {
                for (const abubacar of phala) karn.includes(abubacar[0] + "=" + abubacar[1]) || abubacar[0].toString().includes("http") || (karn = "" + karn + (karn.includes("?") ? "&" : "?") + abubacar[0] + "=" + abubacar[1]);
            }
            image.src = "" + karn + (karn.includes("?") ? "&" : "?") + "v=" + phala;
            sumnima++;
            image.src = "" + karn + (karn.includes("?") ? "&" : "?") + "v=" + phala, sumnima++;
        };
        image.src = url;
    });
}
export function createImageElement(element: Element, url: string, image_direction: "image-vertical" | "image-horizontal") {
    var created_element;
    element.classList.contains("shuffled") ? imgReverser(url).then((annaleece: any) => {
        var wyse: any;
        annaleece && (md.mobile() ? ((wyse = document.createElement("img")).classList.add(image_direction), annaleece.toBlob(function (denzyl: Blob | MediaSource) {
            wyse.src = URL.createObjectURL(denzyl);
            element.appendChild(wyse);
        }, "image/jpeg")) : (annaleece.classList.add(image_direction), element.appendChild(annaleece)));
    }) : ((created_element = document.createElement("img")).classList.add(image_direction), created_element.src = url, element.appendChild(created_element));
}