import { defineConfig } from "vitest/config"
import tsconfigPaths from "vite-tsconfig-paths"

export default defineConfig({
	plugins: [tsconfigPaths()],
	resolve: {},
	test: {
		include: [
			"common/testing.test.ts",
			"common/common.test.ts",
			"common/utils/utils.test.ts",
			"Illusive/src/**/*.test.ts",
			"tests/roze.test.ts",
		],
		exclude: [
			"Illusive/src/lyrics_align.test.ts",
		],
		testTimeout: 60_000,
		disableConsoleIntercept: false
	},
})
