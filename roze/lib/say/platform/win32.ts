import { spawn } from "child_process";
import { catch_ignore, generror, generror_catch } from "@common/utils/error_util";
import type { SayPlatformBase } from "./base";
import type { ResponseError } from "@common/types";
import os from "os";
import path from "path-browserify";
import fs from "fs/promises";
import { gen_uuid } from "@common/utils/util";

export const SayPlatformWin32: SayPlatformBase = {
	get_voices: async () => {
		const ps_command = "Add-Type -AssemblyName System.speech;$speak = New-Object System.Speech.Synthesis.SpeechSynthesizer;$speak.GetInstalledVoices() | % {$_.VoiceInfo.Name}";
		return new Promise((resolve) => {
			try {
				const powershell = spawn("powershell.exe", ["-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", ps_command], { windowsHide: true });

				let voices_str = "";
				let voices: string[] = [];

				powershell.stdin.setDefaultEncoding("ascii");
				powershell.stderr.setEncoding("ascii");

				powershell.stdout.on("data", function (data) {
					const output = data.toString();
					voices_str += output;
				});

				powershell.addListener("exit", () => {
					if (voices_str.length > 0) {
						voices = voices_str.split("\r\n");
						voices = voices[voices.length - 1] === "" ? voices.slice(0, voices.length - 1) : voices;
					}
				});

				powershell.stdin.end();

				powershell.on("close", (code) => (code === 0 ? resolve(voices) : generror("Failed to get tts voices", "CRITICAL", { code })));
			} catch (e) {
				resolve(generror_catch(e, "Failed to get tts voices", "CRITICAL", {}));
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
				ps.on("close", (code) => (code === 0 ? resolve(code) : generror("Failed to speak tts", "CRITICAL", { code })));
			} catch (e) {
				resolve(generror_catch(e, "Failed to speak tts", "CRITICAL", { text, voice, speed }));
			}
		});
	},
	export_batch: async (texts: { text: string; export_path: string }[], voice?: string, speed?: number, on_text_export?: (uuid: string, data: string) => any) => {
		const flush_limit = 2 * 1024 * 1024 * 1024;
		const batch_size = 1;
		const use_batch = true;
		const throttle = Math.max(1, os.cpus().length);
		const max_retries = 1000;

		// Windows SpeechSynthesizer rate is -10..10 — clamp it.
		const rate = Math.max(-10, Math.min(10, speed ?? 0));
		voice = voice ?? "";

		const tmp_directory = os.tmpdir();
		const stamp = gen_uuid();
		const script_path = path.join(tmp_directory, `batch_tts_${stamp}.ps1`);
		const json_path = path.join(tmp_directory, `batch_tts_${stamp}.json`);

		const powershell_script = `
	param(
		[Parameter(Mandatory=$true)][string]$JsonPath,
		[string]$Voice = "",
		[int]$Rate = 0,
		[Int64]$FlushLimitBytes = ${flush_limit},
		[int]$BatchSize = ${batch_size},
		[int]$Throttle = ${throttle},
		[int]$MaxRetries = ${max_retries}
	)

	Add-Type -AssemblyName System.Speech
	$jsonText = Get-Content -LiteralPath $JsonPath -Encoding UTF8 -Raw
	$jobs = $jsonText | ConvertFrom-Json

	function Ensure-Dir {
		param([string]$p)
		$dir = [IO.Path]::GetDirectoryName($p)
		if ($dir -and -not (Test-Path -LiteralPath $dir)) {
			[IO.Directory]::CreateDirectory($dir) | Out-Null
		}
	}

	# Use a synchronized hashtable for thread-safe voice access control
	$script:synthLock = [hashtable]::Synchronized(@{})

	function Generate-Speech-Safe {
		param([string]$text, [string]$Voice, [int]$Rate, [int]$MaxRetries)
		
		for ($attempt = 0; $attempt -le $MaxRetries; $attempt++) {
			$synth = $null
			$ms = $null
			
			try {
				# Create a brand new synthesizer for EACH generation
				$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
				
				if ($Voice) {
					try {
						$synth.SelectVoice($Voice)
					}
					catch {
						if ($attempt -eq 0) {
							[Console]::Error.WriteLine("Warning: Voice '$Voice' not found, using default")
						}
					}
				}
				
				$synth.Rate = [Math]::Max(-10, [Math]::Min(10, $Rate))
				$synth.Volume = 100
				
				$ms = New-Object IO.MemoryStream
				$synth.SetOutputToWaveStream($ms)
				
				# Synchronous speak - blocks until complete
				$synth.Speak($text)
				
				# Flush and read
				$ms.Flush()
				$ms.Position = 0
				$bytes = $ms.ToArray()
				
				# Validate WAV file
				if ($bytes.Length -gt 50) {
					return $bytes
				}
				
				if ($attempt -lt $MaxRetries) {
					Start-Sleep -Milliseconds 250
				}
			}
			catch {
				if ($attempt -lt $MaxRetries) {
					Start-Sleep -Milliseconds 500
				}
				else {
					[Console]::Error.WriteLine("Failed to generate speech: $_")
					throw
				}
			}
			finally {
				if ($ms) { $ms.Dispose() }
				if ($synth) { $synth.Dispose() }
			}
		}
		
		throw "Failed to generate valid speech after $MaxRetries retries"
	}

	function InvokeWorker {
		param([object[]]$Batch, [string]$Voice, [int]$Rate, [Int64]$FlushLimitBytes, [int]$MaxRetries)
		
		$cache = @{}
		$current = 0L

		foreach ($item in $Batch) {
			try {
				Ensure-Dir $item.export_path
				$bytes = Generate-Speech-Safe -text $item.text -Voice $Voice -Rate $Rate -MaxRetries $MaxRetries
				
				[System.Console]::WriteLine("${stamp}")
				
				$cache[$item.export_path] = @{
					Path = $item.export_path
					Bytes = $bytes
				}
				$current += $bytes.Length

				# Flush cache if limit reached
				if ($current -ge $FlushLimitBytes) {
					foreach ($k in $cache.Keys) {
						[IO.File]::WriteAllBytes($cache[$k].Path, $cache[$k].Bytes)
					}
					$cache.Clear()
					$current = 0
				}
			}
			catch {
				[Console]::Error.WriteLine("Error processing '$($item.text)': $_")
			}
		}

		# Write remaining cached files
		if ($cache.Count -gt 0) {
			foreach ($k in $cache.Keys) {
				[IO.File]::WriteAllBytes($cache[$k].Path, $cache[$k].Bytes)
			}
			$cache.Clear()
		}
	}

	function Split-IntoBatches {
		param([object[]]$arr, [int]$size)
		
		if ($arr.Count -eq 0) { return @() }
		$list = @()
		
		for ($i = 0; $i -lt $arr.Count; $i += $size) {
			$end = [Math]::Min($i + $size - 1, $arr.Count - 1)
			$list += ,($arr[$i..$end])
		}
		
		return $list
	}

	$batches = Split-IntoBatches -arr $jobs -size $BatchSize
	$ver = $PSVersionTable.PSVersion.Major

	if ($ver -ge ${use_batch ? '7' : '8'}) {
		$funcWorker = \${function:InvokeWorker}.ToString()
		$funcGen = \${function:Generate-Speech-Safe}.ToString()
		$funcDir = \${function:Ensure-Dir}.ToString()
		
		# PowerShell 7+: parallel execution
		$batches | ForEach-Object -Parallel {
			\${function:InvokeWorker} = $using:funcWorker
			\${function:Generate-Speech-Safe} = $using:funcGen
			\${function:Ensure-Dir} = $using:funcDir
			
			InvokeWorker -Batch $_ -Voice $using:Voice -Rate $using:Rate -FlushLimitBytes $using:FlushLimitBytes -MaxRetries $using:MaxRetries
		} -ThrottleLimit $Throttle
	}
	else {
		# Windows PowerShell 5.1: single-thread execution
		InvokeWorker -Batch $jobs -Voice $Voice -Rate $Rate -FlushLimitBytes $FlushLimitBytes -MaxRetries $MaxRetries
	}
	`;

		await fs.writeFile(script_path, powershell_script, "utf8");
		await fs.writeFile(json_path, JSON.stringify(texts), { encoding: "utf8", flag: "w" });

		return await new Promise<number | ResponseError>((resolve) => {
			const powershell = spawn(
				"pwsh",
				[
					"-NoProfile",
					"-ExecutionPolicy",
					"Bypass",
					"-File",
					script_path,
					"-JsonPath",
					json_path,
					"-Voice",
					voice,
					"-Rate",
					String(rate)
				],
				{ windowsHide: true }
			);

			powershell.stdout.on("data", (data) => {
				on_text_export?.(stamp, data.toString());
			});

			powershell.stderr.on("data", (d) => {
				process.stderr.write(`[TTS ERROR] ${d}`);
			});

			powershell.on("close", async (code) => {
				try {
					await fs.unlink(script_path).catch(catch_ignore);
					await fs.unlink(json_path).catch(catch_ignore);
				} finally {
					code === 0
						? resolve(code)
						: resolve(generror("Failed to export tts", "CRITICAL", { code }));
				}
			});
		});
	}
};
