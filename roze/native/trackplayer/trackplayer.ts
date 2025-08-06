import type { TrackPlayer } from "@native/trackplayer/trackplayer.base";
import { get_native_platform } from "@native/native_mode";

export let trackplayer: TrackPlayer;
switch (get_native_platform()) {
	case "WEB":
		console.error("Web Native TrackPlayer is NOT implemented");
		break;
	case "ELECTRON_RENDERER":
		console.error("Electron Renderer Native TrackPlayer is NOT implemented");
		break;
	case "NODE":
		try {
			trackplayer = require("./trackplayer.node").node_trackplayer;
		} catch (e) {}
		break;
	case "REACT_NATIVE":
		try {
			trackplayer = require("./trackplayer.mobile").mobile_trackplayer;
		} catch (e) {}
		break;
}
