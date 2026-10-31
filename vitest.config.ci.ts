import { defineConfig } from "vitest/config"
import tsconfigPaths from "vite-tsconfig-paths"
import path from "path"

export default defineConfig({
	plugins: [tsconfigPaths()],
	resolve: {
		alias: {
			'react-native': path.resolve(__dirname, './tests/__mocks__/react-native.js'),
		},
	},
	test: {
		include: [
			"common/testing.test.ts",
			"common/common.test.ts",
			"common/utils/utils.test.ts",
			"Illusive/src/**/*.test.ts",
			"tests/roze.test.ts",
		],
		testTimeout: 60_000,
		disableConsoleIntercept: false
	},
})
