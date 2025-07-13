import type { FileSystem } from "./fs.base";
import { get_native_platform } from "../native_mode";

export let fs: FileSystem;
switch(get_native_platform()){
    case "WEB": throw new Error("Web Native Filesystem is NOT implemented");
    case "NODE": try {fs = require("./fs.node").node_fs;} catch(e) {} break;
    case "REACT_NATIVE": try {fs = require("./fs.mobile").mobile_fs;} catch(e) {} break;
}