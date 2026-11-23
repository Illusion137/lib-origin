// Intercept both packages before tsx/node tries to load them
const noop_module = new Proxy({}, { get: (_, key) => key === "__esModule" ? true : () => undefined });
const packages = {
	"drizzle-orm/op-sqlite": {},
	"@op-engineering/op-sqlite": {},
	"react-native": {},
	"react-native-mmkv": {},
	"react-native-quick-base64": {},
	"react-native-quick-crypto": {},
	"@sentry/react-native": noop_module
};

Object.entries(packages).forEach(([pkg, exports]) => {
	try {
		const id = require.resolve(pkg);
		require.cache[id] = { id, filename: id, loaded: true, exports };
	} catch (_) {
		// package not resolvable, skip
	}
});
