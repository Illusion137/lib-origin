import lang from '../roze/src/data/language.json';
import zlib from 'zlib';
import { Readable } from 'stream';
import colors from 'colors';
import * as fs from 'fs';
type LangCode = keyof typeof lang;

// Neural machine translation (NMT) : https://en.wikipedia.org/wiki/Neural_machine_translation
const base_url = "https://dl.google.com/translate/offline/nmt/8/2/premium/";

const lang_from: LangCode = "ja";
const lang_to: LangCode = "en";
const from_to = `${lang_from}_${lang_to}`;

const download_paths = [
    "/0/processor_spec.pb.zlib",
    "/0/dictionary.bin.zlib",
    "/0/src_spm_model.model.zlib",
    "/0/decoder_init_0.tflite.zlib",
    "/0/tgt_spm_model.vocab.zlib",
    "/0/tgt_spm_model.model.zlib",
    "/0/translation_model.pb.zlib",
    "/0/src_spm_model.vocab.zlib",
    "/0/src_spm_model.model.zlib",
]

const base_download_path = "C:\\dev\\Illusi\\lib-origin\\translate\\";
const download_folder = `${base_download_path}${from_to}\\`;
async function main(){
    if(fs.existsSync(download_folder)){
        console.log(colors.red("Removing folder: " + download_folder));
        fs.rmSync(download_folder, {"recursive": true});
    }
    fs.mkdirSync(download_folder);
    console.log(colors.blue("Creating folder: " + download_folder));
    for(const path of download_paths){
        const url = `${base_url}${from_to}${path}`;
        const response = await fetch(url);
        const file_path = download_folder + path.replace("/0/", '').replace(".zlib", '');
        const temp_file_path = file_path + ".tmp";

        if (response.ok && response.body) {
            //https://medium.com/deno-the-complete-reference/download-file-with-fetch-in-node-js-57dd370c973a
            console.log(colors.blue("Writing to file: " + temp_file_path));
            let writer = fs.createWriteStream(temp_file_path);
            Readable.fromWeb(<any>response.body).pipe(writer).on("finish", () => {
                const zipped = fs.readFileSync(temp_file_path);
                zlib.unzip(zipped, (err, buffer) => {
                    if(buffer === undefined) {
                        console.log(err);
                        return;
                    }
                    console.log(colors.green("Unzipping to file: " + file_path));
                    fs.writeFileSync(file_path, buffer);
                    console.log(colors.red("Removing file: " + file_path));
                    fs.rmSync(temp_file_path);
                })
            });
        }
    }
}
main();