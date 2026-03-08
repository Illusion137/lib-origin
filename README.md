<div style="text-align: center;">
    <h1>Origin</h1>
    <img src="Illusive/src/assets/icon_transparent.png" height="100" alt="Origin-Logo" />
</div>

Lib-Origin a internal general purpose TypeScript utility library and a web-scaping, data-extracting library. There are several utilities for bridging the native gap between Node.js and React Native through _Roze_. Illusive is built as both a library for extracting music data, but also as a backend to my React Native music app _Illusi_. _Roze_, more than just the native bridge, also is a backend to a audiobook generation app, similarly named [Roze](https://github.com/Illusion137/Roze).

# Library Installation

Note that this library is not on NPM, thus you'll have to likely make a script to pull the library manually. This is assuming you have set a path variable for _lib-origin_ with the variable `$LORIGIN`

### Windows

```powershell
cd $LORIGIN
yarn prepare
[Environment]::SetEnvironmentVariable("Path", "$($env:Path);$($LORIGIN/bin)", "User")
cd -
origin # Command to pull the library to current working directory.
```

### OSX/Linux

```bash
cd $LORIGIN
yarn prepare
```

Add this line to ~/.bashrc

```bash
export PATH=$PATH:$("$LORIGIN/bin")
```

Then run

```bash
cd -
origin # Command to pull the library to current working directory.
```

## TSConfig

In your tsconfig add to the paths:

```json
    "baseUrl": "./",
    "paths": {
        // ...other paths
        "@native/*": ["lib-origin/roze/native/*"],
        "@lib/*": ["lib-origin/roze/lib/*"],
        "@roze/*": ["lib-origin/roze/src/*", "roze/*"],
        "@origin/*": ["lib-origin/origin/src/*"],
        "@lutz/*": ["lib-origin/lutz/src/*"],
        "@sosu/*": ["lib-origin/sosu/src/*"],
        "@illusive/*": ["lib-origin/Illusive/src/*"],
        "@illusicord/*": ["lib-origin/illusicord/src/*"],
        "@common/*": ["lib-origin/common/*"],
        "@admin/*": ["lib-origin/admin/*"],
        "@sample/*": ["lib-origin/sample/*"]
    }
```

## React Native / Metro

If you are using React Native or have a `metro.config.js` then make sure to follow this configuration. This is because you don't want the bundler to complain about the `node` native bridge.

```javascript
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

module.exports = {
	...config,
	resolver: {
		...config.resolver,
		blockList: [config.resolver.blockList, /(\/lib-origin\/roze\/native\/.+?\/.+?\.node\.ts)$/]
	}
};
```

# Usage

## Illusicord

To run the Discord music bot locally you can either run the development server with

```bash
yarn run discord_dev:win #WINDOWS
yarn run discord_dev:osx # OSX/Linux
```

or the just start server with watching it with:

```bash
yarn run discord:win # WINDOWS
yarn run discord:osx # OSX/Linux
```

## Library

The library is lacking significant documentation, so I would recommend just digging in. However, a key principle is that errors are values and are returned in the type

```typescript
interface ResponseError {
	error: Error;
}
```

and errors are created using the `generror_...` functions.

-   `common` contains many utilities like auth, parsing, fetching, timings, logging, seeding, status codes, and caching.
    -   Most importantly would be `rozfetch.ts` which allows for fetching data with caching and better error handling and messages.
-   `origin` contains web scrapers for `amazon_music`, `apple_music`, `youtube`, etc...
-   `illusive` processes information from `origin` and outputs standardized data and such.
-   `roze` processes files to create audio/audiovisual books.
-   `roze/native` bridges React native and Node.js.
-   `roze/lib` bridges Node.js libraries for Windows, OSX, and Linux.

# QuickStart

### Fetching YouTube Playlist with Origin

```typescript
import { YouTube } from "@origin/index";
import { catch_log } from "@common/utils/error_util";

async function main_() {
	const playlist = await YouTube.get_playlist({}, "PLnIB0XeUqT-gyQkHXoYTO24xXB9NkFh-c"); // ICFGData<...> | ResponseError
	if ("error" in playlist) {
		// handle error
		return;
	}
	console.log(playlist.data.tracks); // tracks: { playlist_video_renderer: PlaylistVideoRenderer[]; }
}
main_().catch(catch_log);
```
