import { spawn } from "child_process";
import { generror, generror_catch } from "@common/utils/error_util";
import type { SayPlatformBase } from "./base";
import type { ResponseError } from "@common/types";
import os from "os";
import path from "path";
import fs from "fs/promises";
import { gen_uuid } from "@common/utils/util";

export const SayPlatformWin32: SayPlatformBase = {
	get_voices: async () => {
		const ps_command = "Add-Type -AssemblyName System.speech;$speak = New-Object System.Speech.Synthesis.SpeechSynthesizer;$speak.GetInstalledVoices() | % {$_.VoiceInfo.Name}";
		return new Promise((resolve) => {
			try {
				const ps = spawn("powershell.exe", ["-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", ps_command], { windowsHide: true });

				let voices_str = "";
				let voices: string[] = [];

				ps.stdin.setDefaultEncoding("ascii");
				ps.stderr.setEncoding("ascii");

				ps.stdout.on("data", function (data) {
					const output = data.toString();
					voices_str += output;
				});

				ps.addListener("exit", () => {
					if (voices_str.length > 0) {
						voices = voices_str.split("\r\n");
						voices = voices[voices.length - 1] === "" ? voices.slice(0, voices.length - 1) : voices;
					}
				});

				ps.stdin.end();

				// ps.stdout.on("data", dat.a => console.log(`[TTS] ${data}`));
				// ps.stderr.on("data", data => console.error(`[TTS ERROR] ${data}`));
				ps.on("close", (code) => (code === 0 ? resolve(voices) : generror("Failed to get tts voices", { code })));
			} catch (e) {
				resolve(generror_catch(e, "Failed to get tts voices", {}));
			}
		});
	},
	speak: async (text: string, voice?: string, speed?: number) => {
		let ps_command = "Add-Type -AssemblyName System.speech;$speak = New-Object System.Speech.Synthesis.SpeechSynthesizer;";
		if (voice) ps_command += `$speak.SelectVoice('${voice}');`;
		if (speed) ps_command += `$speak.Rate = ${speed};`;
		ps_command += `$speak.Speak([Console]::In.ReadToEnd())`;

		return new Promise((resolve) => {
			try {
				const ps = spawn("powershell.exe", ["-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", ps_command], { windowsHide: true });
				ps.stdin.end(text);
				ps.stdout.on("data", (data) => console.log(`[TTS] ${data}`));
				ps.stderr.on("data", (data) => console.error(`[TTS ERROR] ${data}`));
				ps.on("close", (code) => (code === 0 ? resolve(code) : generror("Failed to speak tts", { code })));
			} catch (e) {
				resolve(generror_catch(e, "Failed to speak tts", { text, voice, speed }));
			}
		});
	},
	export_batch: async (texts: { text: string; export_path: string }[], voice?: string, speed?: number, on_text_export?: (uuid:string, data: string) => any) => {
		const flushLimit = 2 * 1024 * 1024 * 1024;
		const batchSize = 1;
        const useBatch = true;
		const throttle = Math.max(1, os.cpus().length);
		// Windows SpeechSynthesizer rate is -10..10 — clamp it.
		const rate = Math.max(-10, Math.min(10, speed ?? 0));
		voice ??= voice ?? "";

		const tmpDir = os.tmpdir();
		const stamp = gen_uuid();
		const script_path = path.join(tmpDir, `batch_tts_${stamp}.ps1`);
		const json_path = path.join(tmpDir, `batch_tts_${stamp}.json`);


		const psScript = `
	param(
	[Parameter(Mandatory=$true)][string]$JsonPath,
	[string]$Voice = "",
	[int]$Rate = 0,
	[Int64]$FlushLimitBytes = ${flushLimit},
	[int]$BatchSize = ${batchSize},
	[int]$Throttle  = ${throttle}
	)

	Add-Type -AssemblyName System.Speech
	$jsonText = Get-Content -LiteralPath $JsonPath -Encoding UTF8 -Raw

	# Remove UTF-8 BOM if present

	$jobs = $jsonText | ConvertFrom-Json

	function Ensure-Dir { param([string]$p)
	$dir = [IO.Path]::GetDirectoryName($p)
	if ($dir -and -not (Test-Path -LiteralPath $dir)) { [IO.Directory]::CreateDirectory($dir) | Out-Null }
	}

	function InvokeWorker {
	param([object[]]$Batch, [string]$Voice, [int]$Rate, [Int64]$FlushLimitBytes, $Write)
	Add-Type -AssemblyName System.Speech
	$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
	try { if ($Voice) { $synth.SelectVoice($Voice) } } catch {}
	try { $synth.Rate = [Math]::Max(-10, [Math]::Min(10, $Rate)) } catch {}
	$synth.Volume = 100
	$cache = @{}
	$current = 0L

	foreach ($item in $Batch) {
	    $ms = New-Object IO.MemoryStream
	    try {
	    $synth.SetOutputToWaveStream($ms)
	    $synth.Speak($item.text)
	    [System.Console]::WriteLine("${stamp}")
	    $bytes = $ms.ToArray()
	    } finally { $ms.Dispose() }
	    $cache[$item.export_path] = @{ Path = $item.export_path; Bytes = $bytes }
	    $current += $bytes.Length

	    if ($current -ge $FlushLimitBytes) {
	    foreach ($k in $cache.Keys) {
	        # Ensure-Dir $cache[$k].Path
	        [IO.File]::WriteAllBytes($cache[$k].Path, $cache[$k].Bytes)
	    }
	    $cache.Clear(); $current = 0
	    }
	}

	if ($cache.Count -gt 0) {
	    foreach ($k in $cache.Keys) {
	    # Ensure-Dir $cache[$k].Path
	    [IO.File]::WriteAllBytes($cache[$k].Path, $cache[$k].Bytes)
	    }
	    $cache.Clear()
	}
	$synth.Dispose()
	}

	function Split-IntoBatches([object[]]$arr, [int]$size) {
	if ($arr.Count -eq 0) { return @() }
	$list = @()
	for ($i=0; $i -lt $arr.Count; $i += $size) {
	    $end = [Math]::Min($i + $size - 1, $arr.Count - 1)
	    $list += ,($arr[$i..$end])
	}
	return $list
	}

	$batches = Split-IntoBatches -arr $jobs -size $BatchSize
	$ver = $PSVersionTable.PSVersion.Major

	if ($ver -ge ${useBatch ? '7' : '8'}) {
    $funcDef = \${function:InvokeWorker}.ToString()
	# PowerShell 7+: true parallel workers. Use $using: to pass outer vars.
	$batches | ForEach-Object -Parallel {
	    # param($batch)
        \${function:InvokeWorker} = $using:funcDef
	    InvokeWorker -Batch $_ -Voice $using:Voice -Rate $using:Rate -FlushLimitBytes $using:FlushLimitBytes
	} -ThrottleLimit $Throttle
	}
	else {
	# Windows PowerShell 5.1: single-thread fallback (still batched + memory-flushed).
	 InvokeWorker -Batch $jobs -Voice $Voice -Rate $Rate -FlushLimitBytes $FlushLimitBytes
	}
	`;

		// Write temp files
		await fs.writeFile(script_path, psScript, "utf8");
		await fs.writeFile(json_path, JSON.stringify(texts), { encoding: "utf8", flag: "w" });
		await fs.stat(json_path);

		// Run the script (powershell.exe exists everywhere; pwsh not required)
		return await new Promise<number | ResponseError>((resolve) => {
			const ps = spawn("pwsh", ["-NoProfile", "-ExecutionPolicy", "Bypass", "-File", script_path, "-JsonPath", json_path, "-Voice", voice, "-Rate", String(rate)], { windowsHide: true });

			ps.stdout.on("data", (data) => on_text_export?.(stamp, data.toString()));
			ps.stderr.on("data", (d) => process.stderr.write(`[TTS ERROR] ${d}`));
			ps.on("close", async (code) => {
				try {
					await fs.unlink(script_path).catch((e) => e);
					await fs.unlink(json_path).catch((e) => e);
				} finally {
					code === 0 ? resolve(code) : resolve(generror("Failed to export tts", { code }));
				}
			});
		});
	}
};
