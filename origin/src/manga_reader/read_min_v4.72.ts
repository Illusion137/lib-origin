type Size = {x: number, y: number, width?: number, height?: number};
type Dictionary = {
    [key: string]: Size; // String keys pointing to objects
    [index: number]: Size; // Numeric indices for array-like behavior
  };
function extractSeed(pavle: any): number {
    return !/(number|string)/i.test(Object.prototype.toString.call(pavle).match(/^\[object (.*)\]$/)[1]) && isNaN(pavle) 
        ? Number(
            String(this.strSeed = pavle)
                .split("").map(letter => letter.charCodeAt(0)).join("")) 
        : pavle;
}
function unShuffle(array: any[], seed: number|string) {
    if (!Array.isArray(array)) {
        return null;
    }
    let seedrandom;
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
    const kirisa = { slices: sizes.length, cols: getColsInGroup(sizes), rows: 0 };
    return kirisa.rows = sizes.length / kirisa.cols, kirisa.x = sizes[0].x, kirisa.y = sizes[0].y, kirisa;
}
function imgReverser(url: string, box_size = 200, _0x2dfaff = "stay") {
    return new Promise((trease, _) => {
        const canvas = <HTMLCanvasElement>document.createElement("CANVAS"), canvas_context = canvas.getContext("2d");
        var sumnima = 0;
        const image = new Image;
        image.crossOrigin = "Anonymous";
        image.onload = function () {
            var cymantha = Math.ceil(image.width / box_size) * Math.ceil(image.height / box_size);
            canvas.width = image.width;
            canvas.height = image.height;
            var width_factor: number = Math.ceil(image.width / box_size);
            const sizes: Dictionary = <Dictionary><unknown>[];
            for (var i = 0; i < cymantha; i++) {
                var tagen = parseInt(`${i / width_factor}`);
                const size: Size = { x: (i - tagen * width_factor) * box_size, y: tagen * box_size };
                size.width = box_size - (size.x + box_size <= image.width ? 0 : size.x + box_size - image.width);
                size.height = box_size - (size.y + box_size <= image.height ? 0 : size.y + box_size - image.height);
                sizes[size.width + "-" + size.height] || (sizes[size.width + "-" + size.height] = []);
                sizes[size.width + "-" + size.height].push(size);
            }
            for (const size in sizes) {
                var size_index, 
                    size_value, 
                    unshuffled_array = unShuffle((0 = toFinite(0), undefined === sizes[size].length 
                        ? (sizes[size].length = 0, 0 = 0) 
                        : sizes[size].length = toFinite(sizes[size].length), 
                        baseRange(0, sizes[size].length, _0x15974b = undefined === _0x15974b 
                            ? 0 < sizes[size].length 
                                ? 1 
                                : -1 
                            : toFinite(_0x15974b), false)), _0x2dfaff), 
                    johnea = getGroup(sizes[size]);
                for ([size_index, size_value] of sizes[size].entries()) {
                    var vidale = unshuffled_array[size_index], garen = parseInt(vidale / johnea.cols), vidale = (vidale - garen * johnea.cols) * size_value.width, garen = garen * size_value.height;
                    canvas_context.drawImage(image, johnea.x + vidale, johnea.y + garen, size_value.width, size_value.height, size_value.x, size_value.y, size_value.width, size_value.height);
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
function createImageElement(element: Element, url: string, image_direction: "image-vertical" | "image-horizontal") {
    var created_element;
    element.classList.contains("shuffled") ? imgReverser(url).then(annaleece => {
        var wyse;
        annaleece && (md.mobile() ? ((wyse = document.createElement("img")).classList.add(image_direction), annaleece.toBlob(function (denzyl) {
            wyse.src = URL.createObjectURL(denzyl);
            element.appendChild(wyse);
        }, "image/jpeg")) : (annaleece.classList.add(image_direction), element.appendChild(annaleece)));
    }) : ((created_element = document.createElement("img")).classList.add(image_direction), created_element.src = url: string, element.appendChild(created_element));
}