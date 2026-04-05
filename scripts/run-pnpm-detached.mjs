import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { spawn } from "node:child_process";
import { repoRoot } from "./common.mjs";

const args = process.argv.slice(2);

if (args.length === 0) {
  console.error("Usage: node ./scripts/run-pnpm-detached.mjs <pnpm-args...>");
  process.exit(1);
}

const artifactsDir = path.join(repoRoot, ".pocketcurb-artifacts");
fs.mkdirSync(artifactsDir, { recursive: true });

const stdoutPath = path.join(artifactsDir, "pnpm-detached.log");
const stderrPath = path.join(artifactsDir, "pnpm-detached.err.log");

for (const filePath of [stdoutPath, stderrPath]) {
  try {
    fs.rmSync(filePath, { force: true });
  } catch {
    // Ignore stale log cleanup failures and continue with a fresh detached run.
  }
}

const stdoutFd = fs.openSync(stdoutPath, "a");
const stderrFd = fs.openSync(stderrPath, "a");

const child = spawn(process.execPath, ["./scripts/pnpm.mjs", ...args], {
  cwd: repoRoot,
  detached: true,
  stdio: ["ignore", stdoutFd, stderrFd],
  windowsHide: true
});

child.unref();

console.log(JSON.stringify({
  pid: child.pid,
  stdoutPath,
  stderrPath
}));
