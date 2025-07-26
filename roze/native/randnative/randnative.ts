import type { RandNative } from "@native/randnative/randnative.base";
import { get_native_platform } from "@native/native_mode";

export let randnative: RandNative;
switch(get_native_platform()){
    case "WEB": throw new Error("Web Native RandNative is NOT implemented");
    case "NODE": try {randnative = require("./randnative.node").node_randnative;} catch(e) {} break;
    case "REACT_NATIVE": try {randnative = require("./randnative.mobile").mobile_randnative;} catch(e) {} break;
}
