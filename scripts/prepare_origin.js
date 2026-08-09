import { execFileSync } from "child_process";
import { existsSync } from "fs";

const env = { ...process.env };
if (process.platform === "win32") {
	const ucrt64_bin = "C:\\msys64\\ucrt64\\bin";
	if (existsSync(ucrt64_bin)) env.PATH = `${ucrt64_bin};${env.PATH}`;
}

execFileSync("g++", ["-std=c++23", "./bin/origin.cpp", "-o", "./bin/origin"], {
	stdio: "inherit",
	env,
});
