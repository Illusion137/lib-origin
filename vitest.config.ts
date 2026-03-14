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
		include: ["**/*.test.ts", "**/*.test.tsx"],
		testTimeout: 60_000,
		disableConsoleIntercept: false
	},
})
