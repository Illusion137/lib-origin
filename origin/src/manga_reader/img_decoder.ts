// import * as fs from 'fs';
//https://www.npmjs.com/package/react-native-crypto
const deob = require("./deob2.js");
const { createCanvas } = (require)('@flyskywhy/react-native-gcanvas');

export async function decode_image_base64(src: string){
    //https://c-1.mreadercdn.com/_v2/1/0dcb8f9eaacfd940603bd75c7c152919c72e45517dcfb1087df215e3be94206cfdf45f64815888ea0749af4c0ae5636fabea0abab8c2e938ab3ad7367e9bfa52/2e/0f/2e0f1e0c8e77417950692b023ad568a4/2e0f1e0c8e77417950692b023ad568a4_1600.jpeg?t=515363393022bbd440b0b7d9918f291a&ttl=1908547557
    const canvas = createCanvas(1135, 1600);
    console.log(deob);
    const deobed = await deob(canvas, src);
    console.log(deobed);
    // const canvas = document.createElement("canvas");
    // const context = canvas.getContext("2d");
    // const img = new Canvas.Image();
    // // img.crossOrigin = "Anonymous";
    // img.onload = () => {
    //     canvas.width = img.width;
    //     canvas.height = img.height;
    //     const draw_image_inputs = decode_image({
    //         url: img.src as string,
    //         width: img.width,
    //         height: img.height,
    //         x: 0,
    //         y: 0
    //     });
    //     // context.drawImage(img, 0, 0);
    //     // draw_image_inputs;
    //     for(const inputs of draw_image_inputs){
    //         console.log(inputs);
    //         context.drawImage(img, ...inputs);
    //     }
    // }
    // img.src = src;
    const buffer = canvas.toBuffer("image/png");
    console.log(buffer.length);
    // fs.writeFileSync("ignore/decoded.png", buffer);
    return buffer.toString("base64");
}