import type { WiFi } from "@native/wifi/wifi.base";
import { get_native_platform } from "@native/native_mode";

export let wifi: WiFi;
switch(get_native_platform()){
    case "WEB": throw new Error("Web Native WiFi is NOT implemented");
    case "NODE": try {wifi = require("./wifi.node").node_wifi;} catch(e) {} break;
    case "REACT_NATIVE": try {wifi = require("./wifi.mobile").mobile_wifi;} catch(e) {} break;
}
