import type { TurnstileSolver } from "@native/turnstile/turnstile.base";
import { generror } from "@common/utils/error_util";
import os from "os";
import path from "path";
import fs from "fs";

const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36";

const OFFSCREEN_ARGS = [
	"--window-position=-2400,-2400",
	"--window-size=1280,800",
	"--disable-backgrounding-occluded-windows",
	"--disable-renderer-backgrounding",
	"--disable-background-timer-throttling",
	"--disable-features=CalculateNativeWinOcclusion",
];

export const node_turnstile: TurnstileSolver = {
	solve: async (opts) => {
		const timeout_ms = opts.timeout_ms ?? 45_000;

		let chromium;
		try {
			chromium = (await import("patchright")).chromium;
		} catch (e) {
			return generror("Turnstile (node) requires the 'patchright' package", "CRITICAL", { error: String(e) });
		}

		const user_data_dir = fs.mkdtempSync(path.join(os.tmpdir(), "roz-turnstile-"));
		const launch_opts = { headless: false as const, viewport: null, userAgent: UA, args: OFFSCREEN_ARGS };

		let context;
		try {
			// Real Google Chrome solves most reliably; fall back to patchright's bundled Chromium.
			try {
				context = await chromium.launchPersistentContext(user_data_dir, { channel: "chrome", ...launch_opts });
			} catch {
				context = await chromium.launchPersistentContext(user_data_dir, launch_opts);
			}
		} catch (e) {
			fs.rmSync(user_data_dir, { recursive: true, force: true });
			return generror("Turnstile (node) failed to launch a browser; run `npx patchright install chrome`", "CRITICAL", { error: String(e) });
		}

		try {
			const page = context.pages()[0] ?? await context.newPage();
			await page.goto(opts.page_url, { waitUntil: "domcontentloaded", timeout: timeout_ms }).catch(() => { /* token wait below has its own timeout */ });

			await page.evaluate(() => {
				(window as unknown as { __cf: unknown }).__cf = null;
				window.addEventListener("message", (event: MessageEvent) => {
					let data: unknown = event.data;
					try { data = typeof data === "string" ? JSON.parse(data) : data; } catch { return; }
					const parsed_data = data as { type?: string; token?: string; error?: string } | null;
					// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-conversion
					if (parsed_data?.type === "turnstile-token" && parsed_data.token) (window as unknown as { __cf: unknown }).__cf = { token: String(parsed_data.token) };
					else if (parsed_data?.type === "turnstile-error") (window as unknown as { __cf: unknown }).__cf = { error: String(parsed_data.error) };
				});
			});

			const read = async () => page.evaluate(() => (window as unknown as { __cf: unknown }).__cf).catch(() => null) as Promise<{ token?: string; error?: string } | null>;
			const deadline = Date.now() + timeout_ms;
			let captured: { token?: string; error?: string } | null = null;
			while (!captured && Date.now() < deadline) {
				await page.waitForTimeout(500);
				captured = await read();
			}

			if (!captured) return generror("Turnstile (headed) produced no token before timeout", "MEDIUM", { page_url: opts.page_url });
			if (captured.error) return generror(`Turnstile widget error: ${captured.error}`, "MEDIUM", { page_url: opts.page_url });
			if (!captured.token) return generror("Turnstile (headed) produced no token", "MEDIUM", { page_url: opts.page_url });

			const cookies = await context.cookies(opts.page_url);
			return { token: captured.token, cookies: cookies.map(c => `${c.name}=${c.value}`) };
		} catch (e) {
			return generror("Turnstile (headed) execution failed", "CRITICAL", { error: String(e), page_url: opts.page_url });
		} finally {
			await context.close().catch(() => { /* ignore */ });
			fs.rmSync(user_data_dir, { recursive: true, force: true });
		}
	}
};
