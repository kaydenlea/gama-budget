import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";
import { repoRoot, toolchainLinksAvailable } from "./common.mjs";
import { getStagedFiles } from "./git-helpers.mjs";

const automationSafePrefixes = [
  "docs/",
  ".github/",
  ".githooks/",
  "scripts/",
  ".claude/",
  ".codex/"
];

const automationSafeFiles = new Set([
  "AGENTS.md",
  "CLAUDE.md",
  "README.md",
  "package.json",
  ".npmrc",
  "pnpm-workspace.yaml",
  ".gitignore"
]);

function isAutomationSafeFile(file) {
  return automationSafeFiles.has(file) || automationSafePrefixes.some((prefix) => file.startsWith(prefix));
}

function readStagedFiles() {
  const stagedFilesEnv = process.env.GAMA_STAGED_FILES;
  if (stagedFilesEnv) {
    return stagedFilesEnv.split(/\r?\n/).filter(Boolean);
  }

  return getStagedFiles();
}

function runNodeScript(relativePath) {
  const result = spawnSync(process.execPath, [relativePath], {
    cwd: repoRoot,
    stdio: "inherit"
  });

  if ((result.status ?? 1) !== 0) {
    process.exit(result.status ?? 1);
  }
}

function runSyntaxChecks(files) {
  for (const file of files) {
    if (!/\.(cjs|mjs|js)$/i.test(file)) {
      continue;
    }

    const absolute = path.join(repoRoot, file);
    if (!fs.existsSync(absolute)) {
      continue;
    }

    const result = spawnSync(process.execPath, ["--check", absolute], {
      cwd: repoRoot,
      stdio: "inherit"
    });

    if ((result.status ?? 1) !== 0) {
      process.exit(result.status ?? 1);
    }
  }
}

console.log("Running Gama pre-commit verification...");

if (toolchainLinksAvailable()) {
  const result = spawnSync(process.execPath, ["./scripts/verify.mjs"], {
    cwd: repoRoot,
    stdio: "inherit"
  });

  process.exit(result.status ?? 1);
}

const stagedFiles = readStagedFiles();
const unsafeFiles = stagedFiles.filter((file) => !isAutomationSafeFile(file));

if (unsafeFiles.length > 0) {
  console.error("Full pre-commit verification requires a healthy local toolchain, but node_modules/.bin is missing.");
  console.error("Because staged changes include product or backend code, degraded pre-commit mode is not allowed.");
  for (const file of unsafeFiles) {
    console.error(`- ${file}`);
  }
  console.error("Fix the local dependency layout before committing substantive code changes.");
  process.exit(1);
}

console.warn("Local toolchain links are incomplete, so pre-commit is running in degraded automation-only mode.");
console.warn("This mode is allowed only for docs, scripts, workflow, and repo automation changes.");

runNodeScript("./scripts/policy-check.mjs");
runNodeScript("./scripts/check-docs.mjs");
runNodeScript("./scripts/repo-contract.mjs");
runSyntaxChecks(stagedFiles);

console.log("Degraded automation-only pre-commit checks passed.");
process.exit(0);
