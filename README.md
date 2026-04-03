<div style="text-align: center;" align="center">
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
yarn run discord_dev:win # WINDOWS
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

### Illusive

```bash
# Note that because Illusive imports op-sqlite, you need to mock it and drizzle
npx tsx -r ./mock-op-sqlite.cjs ./scratch.ts
```

```typescript
import { catch_log } from "@common/utils/error_util";
import { Illusive } from "@illusive/illusive";

async function _main_() {
	const search_result = await Illusive.music_service.get("SoundCloud")!.search!("Lelo Groundhog Day");
	if ("error" in search_result) return;
	if (search_result.tracks.length === 0) return; // no tracks in result
	const lyrics_result = await Lyrics.get_track_lyrics(search_result.tracks[0]);
	if (typeof lyrics_result === "object") return; // ResponseError
	console.log(lyrics_result);
	/* lyrics_result ->
	[Part I]
	[Verse]
	Ayy
	(Shogun is the man)
	*/
}
_main_().catch(catch_log);
```

### Extracting contents from an EPUB with Roz

```typescript
import { FileParser } from "@roze/file";
import { TimeLog } from "@common/time_log";
import { catch_log } from "@common/utils/error_util";
import { load_native_zip } from "@native/zip/zip";

async function main() {
	await load_native_zip();
	const roz = await FileParser.parse_epub("ascendance-of-a-bookworm-part-5-volume-9.epub", {});
	if ("error" in roz) throw roz.error;
	const novel_contents = roz.chapters
		.map(({ contents }) => contents)
		.flat()
		.filter((c) => c.type !== "IMAGE")
		.map(({ content }) => content)
		.join("\n\n\n");
	console.log(novel_contents);
}
main().catch(catch_log);
```

### Extracting webnovel contents, translating them, then turning them into an audiobook

```typescript
import { Syosetu } from "@roze/syosetu";
import { load_native_fs } from "@native/fs/fs";
import { AudiobookGen } from "@roze/audiobook_gen";

async function main_() {
	await load_native_fs(); // we need to native fs module because internally Syosetu's is cached
	const bookworm_chapters = await Syosetu.webnovel_chapter_contents_range("n4830bu", { translate_contents: true, range_start: 1, range_end: 5 });
	const roz = Syosetu.webnovel_chapters_contents_to_roz(bookworm_chapters);
	// Many options in function sig: (roz: Roz, opts: RozFullAudioOpts, callbacks?: RozChapterToAudiobookCallbacks, voice_options?: VoiceOptions, clean_temp_files?: CleanTempFiles)
	const result = await AudiobookGen.roz_full_audio(roz, { srt_subtitles: true }, {}, {}, "CLEAN_FILES");
	if ("error" in result) return;
	console.log(`FFMPEG Result: ${result.ffmpeg_gen_result.retcode} @ ${result.ffmpeg_gen_result.out_file_path}`);
}
main_().catch(catch_log);
```

