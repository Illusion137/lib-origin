// Intercept both packages before tsx/node tries to load them
const mock = { id: "", filename: "", loaded: true, exports: {} };
const packages = ["drizzle-orm/op-sqlite", "@op-engineering/op-sqlite"];

packages.forEach((pkg) => {
	try {
		mock.id = require.resolve(pkg);
		mock.filename = mock.id;
		require.cache[mock.id] = { ...mock };
	} catch (_) {
		// package not resolvable, skip
	}
});
