import { bold, cyan, red } from "colors";

export function log_info(str: any) {
    console.log(cyan(`${bold("[INFO]:")} ${str}`));
}
export function log_error(str: any) {
    console.log(red(`${bold("[ERROR]:")} ${str}`));
}