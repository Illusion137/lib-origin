import { defineConfig } from "vitest/config"
import tsconfigPaths from "vite-tsconfig-paths"

export default defineConfig({
	plugins: [tsconfigPaths()],
	test: {
		include: ["**/*.test.ts"],
		testTimeout: 30_000,
		disableConsoleIntercept: false
	},
})
