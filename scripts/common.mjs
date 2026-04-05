import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";
import { getSanitizedNetworkEnv } from "./networked-tooling-env.mjs";

export const repoRoot = process.cwd();
export const corepackHome = path.join(repoRoot, ".corepack");
export const vendoredPnpmBin = path.join(corepackHome, "v1", "pnpm", "10.6.2", "bin", "pnpm.cjs");

export function resolveRepoPath(relativePath) {
  return path.join(repoRoot, relativePath);
}

export function readFile(relativePath) {
  return fs.readFileSync(resolveRepoPath(relativePath), "utf8");
}

export function fileExists(relativePath) {
  return fs.existsSync(resolveRepoPath(relativePath));
}

export function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

export function listFiles(startPath, predicate = () => true) {
  const absolute = resolveRepoPath(startPath);
  if (!fs.existsSync(absolute)) {
    return [];
  }

  const entries = fs.readdirSync(absolute, { withFileTypes: true });
  const files = [];
  const skippedDirectories = new Set([
    ".git",
    ".next",
    ".pnpm-store",
    ".turbo",
    ".expo",
    ".corepack",
    "coverage",
    "dist",
    "build",
    "node_modules"
  ]);

  for (const entry of entries) {
    const absoluteChild = path.join(absolute, entry.name);
    const relativeChild = path.relative(repoRoot, absoluteChild).replaceAll("\\", "/");

    if (entry.isDirectory()) {
      if (skippedDirectories.has(entry.name)) {
        continue;
      }
      files.push(...listFiles(relativeChild, predicate));
      continue;
    }

    if (predicate(relativeChild)) {
      files.push(relativeChild);
    }
  }

  return files;
}

export function parseJson(relativePath) {
  return JSON.parse(readFile(relativePath));
}

function getLinkedStoreDir() {
  const modulesYamlPath = resolveRepoPath("node_modules/.modules.yaml");
  if (!fs.existsSync(modulesYamlPath)) {
    return null;
  }

  const modulesYaml = fs.readFileSync(modulesYamlPath, "utf8");
  const match = modulesYaml.match(/^storeDir:\s+(.+)$/mu);
  return match?.[1]?.trim() || null;
}

export function commandExists(command) {
  const lookup = process.platform === "win32" ? "where.exe" : "which";
  const result = spawnSync(lookup, [command], {
    cwd: repoRoot,
    stdio: "ignore",
    shell: false
  });
  return (result.status ?? 1) === 0;
}

export function resolveCommandPath(command) {
  const lookup = process.platform === "win32" ? "where.exe" : "which";
  const result = spawnSync(lookup, [command], {
    cwd: repoRoot,
    encoding: "utf8",
    shell: false
  });

  if (result.error || (result.status ?? 1) !== 0) {
    return null;
  }

  const firstMatch = result.stdout
    ?.split(/\r?\n/u)
    .map((line) => line.trim())
    .find(Boolean);

  return firstMatch || null;
}

export function dependenciesInstalled() {
  return fileExists("node_modules") && fileExists("pnpm-lock.yaml");
}

export function toolchainLinksAvailable() {
  return fileExists("node_modules/.bin");
}

export function ensureDependenciesInstalled() {
  assert(
    dependenciesInstalled(),
    "Workspace dependencies are not installed. Run pnpm bootstrap:local to install dependencies and hooks.",
  );
}

export function runCommand(command, args, options = {}) {
  const env = {
    ...process.env,
    COREPACK_HOME: corepackHome,
    ...(options.env ?? {})
  };

  for (const name of options.unsetEnv ?? []) {
    delete env[name];
  }

  const result = spawnSync(command, args, {
    cwd: options.cwd ? resolveRepoPath(options.cwd) : repoRoot,
    env,
    stdio: options.stdio ?? "inherit",
    shell: options.shell ?? false
  });

  if (result.error) {
    throw result.error;
  }

  if ((result.status ?? 1) !== 0) {
    throw new Error(`Command failed: ${[command, ...args].join(" ")}`);
  }

  return result;
}

export function quoteForCmd(argument) {
  if (!/[ \t"]/u.test(argument)) {
    return argument;
  }

  return `"${argument.replaceAll('"', '\\"')}"`;
}

export function spawnCommand(command, args, options = {}) {
  const resolvedCommand = resolveCommandPath(command) ?? command;
  const env = {
    ...process.env,
    COREPACK_HOME: corepackHome,
    ...(options.env ?? {})
  };

  for (const name of options.unsetEnv ?? []) {
    delete env[name];
  }

  const baseOptions = {
    cwd: options.cwd ? resolveRepoPath(options.cwd) : repoRoot,
    env,
    encoding: options.encoding,
    timeout: options.timeout,
    stdio: options.stdio,
    shell: false
  };

  if (process.platform === "win32") {
    const commandLine = [resolvedCommand, ...args].map(quoteForCmd).join(" ");
    return spawnSync("cmd.exe", ["/d", "/s", "/c", commandLine], baseOptions);
  }

  return spawnSync(resolvedCommand, args, baseOptions);
}

export function runPnpm(args, options = {}) {
  const { sanitizedEnv, removed } = getSanitizedNetworkEnv({
    ...process.env,
    ...(options.env ?? {})
  });
  const linkedStoreDir = getLinkedStoreDir();
  const unsetEnv = removed.map((entry) => entry.split("=", 1)[0]).filter(Boolean);
  const mergedOptions = {
    ...options,
    env: linkedStoreDir
      ? {
          ...sanitizedEnv,
          npm_config_store_dir: linkedStoreDir
        }
      : sanitizedEnv,
    unsetEnv: [...new Set([...(options.unsetEnv ?? []), ...unsetEnv])]
  };

  if (removed.length > 0) {
    console.warn(`Warning: stripping broken machine proxy/offline settings for pnpm: ${removed.join(", ")}`);
  }

  if (fileExists(path.relative(repoRoot, vendoredPnpmBin))) {
    runCommand(process.execPath, [vendoredPnpmBin, ...args], mergedOptions);
    return;
  }

  if (process.platform === "win32") {
    const command = `corepack pnpm ${args.map(quoteForCmd).join(" ")}`;
    runCommand("cmd.exe", ["/d", "/s", "/c", command], {
      ...mergedOptions,
      shell: false
    });
    return;
  }

  runCommand("corepack", ["pnpm", ...args], mergedOptions);
}

export function ensureHeadingsInOrder(relativePath, headings) {
  const content = readFile(relativePath);
  let lastIndex = -1;

  for (const heading of headings) {
    const index = content.indexOf(heading);
    assert(index !== -1, `${relativePath} is missing heading: ${heading}`);
    assert(index > lastIndex, `${relativePath} has headings out of order near: ${heading}`);
    lastIndex = index;
  }
}

export function ensureContains(relativePath, snippets) {
  const content = readFile(relativePath);
  for (const snippet of snippets) {
    assert(content.includes(snippet), `${relativePath} is missing required content: ${snippet}`);
  }
}

export function runCheck(name, callback) {
  try {
    callback();
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
