import * as querystring from 'querystring';
import Cache from './cache';
import { AVFormat, DownloadOptions } from './types';
import * as utils from './utils';
const vm = require("vm-browserify");

// A shared cache to keep track of html5player js functions.
export const cache = new Cache(1);

/**
 * Extract signature deciphering and n parameter transform functions from html5player file.
 *
 * @param {string} html5playerfile
 * @param {Object} options
 * @returns {Promise<Array.<string>>}
 */
export const getFunctions = (html5playerfile: string, options: DownloadOptions): Promise<[vmScript, vmScript]> => {
	return cache.getOrSet(html5playerfile, async () => {
		const body = await utils.request(html5playerfile, options);
		const functions = extractFunctions(body as string);
		cache.set(html5playerfile, functions);
		return functions;
	});
}
const VARIABLE_PART = "[a-zA-Z_\\$][a-zA-Z_0-9\\$]*";
const VARIABLE_PART_DEFINE = "\\\"?" + VARIABLE_PART + "\\\"?";
const BEFORE_ACCESS = "(?:\\[\\\"|\\.)";
const AFTER_ACCESS = "(?:\\\"\\]|)";
const VARIABLE_PART_ACCESS = BEFORE_ACCESS + VARIABLE_PART + AFTER_ACCESS;
const REVERSE_PART = ":function\\(\\w\\)\\{(?:return )?\\w\\.reverse\\(\\)\\}";
const SLICE_PART = ":function\\(\\w,\\w\\)\\{return \\w\\.slice\\(\\w\\)\\}";
const SPLICE_PART = ":function\\(\\w,\\w\\)\\{\\w\\.splice\\(0,\\w\\)\\}";
const SWAP_PART = ":function\\(\\w,\\w\\)\\{" +
	"var \\w=\\w\\[0\\];\\w\\[0\\]=\\w\\[\\w%\\w\\.length\\];\\w\\[\\w(?:%\\w.length|)\\]=\\w(?:;return \\w)?\\}";

const DECIPHER_REGEXP =
	"function(?: " + VARIABLE_PART + ")?\\(([a-zA-Z])\\)\\{" +
	"\\1=\\1\\.split\\(\"\"\\);\\s*" +
	"((?:(?:\\1=)?" + VARIABLE_PART + VARIABLE_PART_ACCESS + "\\(\\1,\\d+\\);)+)" +
	"return \\1\\.join\\(\"\"\\)" +
	"\\}";

const HELPER_REGEXP =
	"var (" + VARIABLE_PART + ")=\\{((?:(?:" +
	VARIABLE_PART_DEFINE + REVERSE_PART + "|" +
	VARIABLE_PART_DEFINE + SLICE_PART + "|" +
	VARIABLE_PART_DEFINE + SPLICE_PART + "|" +
	VARIABLE_PART_DEFINE + SWAP_PART +
	"),?\\n?)+)\\};";

const FUNCTION_TCE_REGEXP =
	"function(?:\\s+[a-zA-Z_\\$][a-zA-Z0-9_\\$]*)?\\(\\w\\)\\{" +
	"\\w=\\w\\.split\\((?:\"\"|[a-zA-Z0-9_$]*\\[\\d+])\\);" +
	"\\s*((?:(?:\\w=)?[a-zA-Z_\\$][a-zA-Z0-9_\\$]*(?:\\[\\\"|\\.)[a-zA-Z_\\$][a-zA-Z0-9_\\$]*(?:\\\"\\]|)\\(\\w,\\d+\\);)+)" +
	"return \\w\\.join\\((?:\"\"|[a-zA-Z0-9_$]*\\[\\d+])\\)}";

const N_TRANSFORM_REGEXP =
	"function\\(\\s*(\\w+)\\s*\\)\\s*\\{" +
	"var\\s*(\\w+)=(?:\\1\\.split\\(.*?\\)|String\\.prototype\\.split\\.call\\(\\1,.*?\\))," +
	"\\s*(\\w+)=(\\[.*?]);\\s*\\3\\[\\d+]" +
	"(.*?try)(\\{.*?})catch\\(\\s*(\\w+)\\s*\\)\\s*\\{" +
	'\\s*return"[\\w-]+([A-z0-9-]+)"\\s*\\+\\s*\\1\\s*}' +
	'\\s*return\\s*(\\2\\.join\\(""\\)|Array\\.prototype\\.join\\.call\\(\\2,.*?\\))};';

const N_TRANSFORM_TCE_REGEXP =
	"function\\(\\s*(\\w+)\\s*\\)\\s*\\{" +
	"\\s*var\\s*(\\w+)=\\1\\.split\\(\\1\\.slice\\(0,0\\)\\),\\s*(\\w+)=\\[.*?];" +
	".*?catch\\(\\s*(\\w+)\\s*\\)\\s*\\{" +
	"\\s*return(?:\"[^\"]+\"|\\s*[a-zA-Z_0-9$]*\\[\\d+])\\s*\\+\\s*\\1\\s*}" +
	"\\s*return\\s*\\2\\.join\\((?:\"\"|[a-zA-Z_0-9$]*\\[\\d+])\\)};";

const TCE_GLOBAL_VARS_REGEXP =
	"(?:^|[;,])\\s*(var\\s+([\\w$]+)\\s*=\\s*" +
	"(?:" +
	"([\"'])(?:\\\\.|[^\\\\])*?\\3" +
	"\\s*\\.\\s*split\\((" +
	"([\"'])(?:\\\\.|[^\\\\])*?\\5" +
	"\\))" +
	"|" +
	"\\[\\s*(?:([\"'])(?:\\\\.|[^\\\\])*?\\6\\s*,?\\s*)+\\]" +
	"))(?=\\s*[,;])";

const PATTERN_PREFIX = "(?:^|,)\\\"?(" + VARIABLE_PART + ")\\\"?";
const REVERSE_PATTERN = new RegExp(PATTERN_PREFIX + REVERSE_PART, "m");
const SLICE_PATTERN = new RegExp(PATTERN_PREFIX + SLICE_PART, "m");
const SPLICE_PATTERN = new RegExp(PATTERN_PREFIX + SPLICE_PART, "m");
const SWAP_PATTERN = new RegExp(PATTERN_PREFIX + SWAP_PART, "m");

const DECIPHER_ARGUMENT = "sig";
const N_ARGUMENT = "ncode";
const DECIPHER_FUNC_NAME = "DisTubeDecipherFunc";
const N_TRANSFORM_FUNC_NAME = "DisTubeNTransformFunc";

const extractDollarEscapedFirstGroup = (pattern: RegExp, text: string) => {
	const match = text.match(pattern);
	return match ? match[1].replace(/\$/g, "\\$") : null;
  };

const extractDecipherFunc = (body: string) => {
	try {

		const helperMatch = body.match(new RegExp(HELPER_REGEXP, "s"));
		if (!helperMatch) return null;

		const helperObject = helperMatch[0];
		const actionBody = helperMatch[2];
		const helperName = helperMatch[1]; helperName;

		const reverseKey = extractDollarEscapedFirstGroup(REVERSE_PATTERN, actionBody);
		const sliceKey = extractDollarEscapedFirstGroup(SLICE_PATTERN, actionBody);
		const spliceKey = extractDollarEscapedFirstGroup(SPLICE_PATTERN, actionBody);
		const swapKey = extractDollarEscapedFirstGroup(SWAP_PATTERN, actionBody);

		const quotedFunctions = [reverseKey, sliceKey, spliceKey, swapKey]
			.filter(Boolean)
			.map(key => key?.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));

		if (quotedFunctions.length === 0) return null;

		const funcMatch = body.match(new RegExp(DECIPHER_REGEXP, "s"));
		let isTce = false;
		let decipherFunc;

		if (funcMatch) {
			decipherFunc = funcMatch[0];
		} else {

			const tceFuncMatch = body.match(new RegExp(FUNCTION_TCE_REGEXP, "s"));
			if (!tceFuncMatch) return null;

			decipherFunc = tceFuncMatch[0];
			isTce = true;
		}

		let tceVars = "";
		if (isTce) {
			const tceVarsMatch = body.match(new RegExp(TCE_GLOBAL_VARS_REGEXP, "m"));
			if (tceVarsMatch) {
				tceVars = tceVarsMatch[1] + ";\n";
			}
		}

		const resultFunc = tceVars + helperObject + "\nvar " + DECIPHER_FUNC_NAME + "=" + decipherFunc + ";\n";
		const callerFunc = DECIPHER_FUNC_NAME + "(" + DECIPHER_ARGUMENT + ");";

		return resultFunc + callerFunc;
	} catch (e) {
		console.error("Error in extractDecipherFunc:", e);
		return null;
	}
};

const extractNTransformFunc = (body: string) => {
	try {

		const nMatch = body.match(new RegExp(N_TRANSFORM_REGEXP, "s"));
		let isTce = false;
		let nFunction;

		if (nMatch) {
			nFunction = nMatch[0];
		} else {

			const nTceMatch = body.match(new RegExp(N_TRANSFORM_TCE_REGEXP, "s"));
			if (!nTceMatch) return null;

			nFunction = nTceMatch[0];
			isTce = true;
		}

		const paramMatch = nFunction.match(/function\s*\(\s*(\w+)\s*\)/);
		if (!paramMatch) return null;

		const paramName = paramMatch[1];

		const cleanedFunction = nFunction.replace(
			new RegExp(`if\\s*\\(typeof\\s*[^\\s()]+\\s*===?.*?\\)return ${paramName}\\s*;?`, "g"),
			""
		);

		let tceVars = "";
		if (isTce) {
			const tceVarsMatch = body.match(new RegExp(TCE_GLOBAL_VARS_REGEXP, "m"));
			if (tceVarsMatch) {
				tceVars = tceVarsMatch[1] + ";\n";
			}
		}

		const resultFunc = tceVars + "var " + N_TRANSFORM_FUNC_NAME + "=" + cleanedFunction + ";\n";
		const callerFunc = N_TRANSFORM_FUNC_NAME + "(" + N_ARGUMENT + ");";

		return resultFunc + callerFunc;
	} catch (e) {
		console.error("Error in extractNTransformFunc:", e);
		return null;
	}
};

let decipherWarning = false;
let nTransformWarning = false;

const getExtractFunction = (extractFunctions: ((body: string) => string | null)[], body: string, postProcess: ((str: string) => void) | null = null): vmScript | null => {
	for (const extractFunction of extractFunctions) {
		try {
			const func = extractFunction(body);
			if (!func) continue;
			return new vm.Script(postProcess ? postProcess(func) : func);
		} catch (err) {
			continue;
		}
	}
	return null;
};

// This is required function to get the stream url, but we can continue if user doesn't need stream url.
const extractDecipher = (body: string) => {
	// Faster: extractDecipherWithName
	const decipherFunc = getExtractFunction([extractDecipherFunc], body);
	if (!decipherFunc && !decipherWarning) {
		console.warn('\x1b[33mWARNING:\x1B[0m Could not parse decipher function.\n' +
			`Please report this issue with the "
        base.js
      " file on https://github.com/distubejs/ytdl-core/issues.\nStream URL will be missing.`);
		decipherWarning = true;
	}
	return decipherFunc!;
};

const extractNTransform = (body: string) => {
	// Faster: extractNTransformFunc
	const nTransformFunc = getExtractFunction([extractNTransformFunc], body);
	if (!nTransformFunc && !nTransformWarning) {
		// This is optional, so we can continue if it's not found, but it will bottleneck the download.
		console.warn('\x1b[33mWARNING:\x1B[0m Could not parse n transform function.\n' +
			`Please report this issue with the "
        base.js
      " file on https://github.com/distubejs/ytdl-core/issues.`);
		nTransformWarning = true;
	}
	return nTransformFunc!;
};

/**
 * Extracts the actions that should be taken to decipher a signature
 * and transform the n parameter
 *
 * @param {string} body
 * @returns {Array.<string>}
 */
export const extractFunctions = (body: string): [ReturnType<typeof extractDecipher>, ReturnType<typeof extractNTransform>] => [
	extractDecipher(body),
	extractNTransform(body),
];

export function valueToJS(val: any): string {
	if (typeof val === "string") return `'${val}'`;
	if (typeof val === "object") return `${JSON.stringify(val)}`;
	return String(val);
}

export function runScript(context: Record<string, any>, vmScript: vmScript) {
	const script_items: string = Object.entries(context).map(item => `let ${item[0]}=${valueToJS(item[1])}; `).join("");
	const script = script_items + vmScript.code;
	return eval(script);
}

interface vmScript { code: string, runInNewContext: (context: Record<string, any>) => string }
/**
 * Apply decipher and n-transform to individual format
 *
 * @param {Object} format
 * @param {vm.Script} decipherScript
 * @param {vm.Script} nTransformScript
 */
export const setDownloadURL = (format: AVFormat, decipherScript: vmScript, nTransformScript: vmScript) => {
	if (!format) return;
	const decipher = (url: string): string => {
		const args = querystring.parse(url);
		if (!args.s || !decipherScript) return args.url as string;

		try {
			const components = new URL(decodeURIComponent(args.url as string));
			const context: Record<string, any> = {};
			context[DECIPHER_ARGUMENT] = decodeURIComponent(args.s as string);
			// const decipheredSig = decipherScript.runInNewContext(context);
			const decipheredSig = runScript(context, decipherScript);

			components.searchParams.set((args.sp || "sig") as string, decipheredSig);
			return components.toString();
		} catch (err) {
			console.error("Error applying decipher:", err);
			return args.url as string;
		}
	};
	const nTransform = (url: string) => {
		try {
			const components = new URL(decodeURIComponent(url));
			const n = components.searchParams.get("n");

			if (!n || !nTransformScript) return url;

			const context: Record<string, any> = {};
			context[N_ARGUMENT] = n;
			
			// const transformedN = nTransformScript.runInNewContext(context);
			const transformedN = runScript(context, nTransformScript);

			if (transformedN) {

				if (n === transformedN) {
					console.warn("Transformed n parameter is the same as input, n function possibly short-circuited");
				} else if (transformedN.startsWith("enhanced_except_") || transformedN.endsWith("_w8_" + n)) {
					console.warn("N function did not complete due to exception");
				}

				components.searchParams.set("n", transformedN);
			} else {
				console.warn("Transformed n parameter is null, n function possibly faulty");
			}

			return components.toString();
		} catch (err) {
			console.error("Error applying n transform:", err);
			return url;
		}
	};
	const cipher = !format.url;
	const url = format.url || format.signatureCipher || format.cipher;
	if (!url) return;

	try {
		format.url = nTransform(cipher ? decipher(url) : url);

		delete format.signatureCipher;
		delete format.cipher;
	} catch (err) {
		console.error("Error setting download URL:", err);
	}
};

/**
 * Applies decipher and n parameter transforms to all format URL's.
 *
 * @param {Array.<Object>} formats
 * @param {string} html5player
 * @param {Object} options
 */
export const decipherFormats = async (formats: AVFormat[], html5player: string, options: DownloadOptions) => {
	try {
		const decipheredFormats: Record<string, any> = {};
		const [decipherScript, nTransformScript] = await getFunctions(html5player, options);

		formats.forEach(format => {
			setDownloadURL(format, decipherScript, nTransformScript);
			if (format.url) {
				decipheredFormats[format.url] = format;
			}
		});

		return decipheredFormats;
	} catch (err) {
		console.error("Error deciphering formats:", err);
		return {};
	}
};
