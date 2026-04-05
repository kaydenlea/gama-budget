import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";
import { quoteForCmd, repoRoot } from "./common.mjs";

function resolveGitExecutable() {
  if (process.platform !== "win32") {
    return "git";
  }

  const candidates = [
    "C:\\Program Files\\Git\\cmd\\git.exe",
    "C:\\Program Files\\Git\\bin\\git.exe",
    "git.exe",
    "git"
  ];

  for (const candidate of candidates) {
    if (candidate.includes("\\") && !fs.existsSync(candidate)) {
      continue;
    }

    return candidate;
  }

  return "git";
}

const gitExecutable = resolveGitExecutable();

function spawnGit(args, options = {}) {
  const baseOptions = {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    ...options
  };

  const directResult = spawnSync(gitExecutable, args, baseOptions);

  if (process.platform === "win32" && directResult.error?.code === "EPERM") {
    const commandLine = [gitExecutable, ...args].map(quoteForCmd).join(" ");
    return spawnSync("cmd.exe", ["/d", "/s", "/c", commandLine], baseOptions);
  }

  return directResult;
}

export function runGit(args, options = {}) {
  const result = spawnGit(args, options);

  if (result.error || (result.status ?? 1) !== 0) {
    const stderr = result.stderr?.toString?.().trim();
    throw new Error(stderr || `git ${args.join(" ")} failed`);
  }

  return result.stdout?.toString?.().trim() ?? "";
}

export function tryRunGit(args, options = {}) {
  try {
    return runGit(args, options);
  } catch {
    return null;
  }
}

export function hasStagedChanges() {
  const result = spawnGit(["diff", "--cached", "--quiet"], {
    stdio: "ignore"
  });

  if (result.status === 0) {
    return false;
  }

  if (result.status === 1) {
    return true;
  }

  throw new Error("Unable to determine whether staged changes exist");
}

export function getStagedFiles() {
  const output = runGit(["diff", "--cached", "--name-only", "--diff-filter=ACMR"]);
  return output ? output.split(/\r?\n/).filter(Boolean) : [];
}

export function getCurrentBranch() {
  return runGit(["rev-parse", "--abbrev-ref", "HEAD"]);
}

export function refExists(ref) {
  const result = spawnGit(["rev-parse", "--verify", "--quiet", ref], {
    stdio: "ignore"
  });

  return result.status === 0;
}

export function getComparisonBase() {
  const requested = process.env.POCKETCURB_REVIEW_BASE;
  const candidates = [requested, "origin/main", "main", "origin/master", "master"].filter(Boolean);

  for (const candidate of candidates) {
    if (refExists(candidate)) {
      return candidate;
    }
  }

  const headMinusOne = tryRunGit(["rev-parse", "--verify", "--quiet", "HEAD~1"]);
  if (headMinusOne) {
    return "HEAD~1";
  }

  return "HEAD";
}

export function getChangedFilesFromBase(baseRef) {
  if (baseRef === "HEAD") {
    const output = tryRunGit(["show", "--pretty=", "--name-only", "HEAD"]);
    return output ? output.split(/\r?\n/).filter(Boolean) : [];
  }

  const output = runGit(["diff", "--name-only", `${baseRef}...HEAD`]);
  return output ? output.split(/\r?\n/).filter(Boolean) : [];
}

export function isProtectedBranch(branch) {
  return branch === "main" || branch === "master" || branch.startsWith("release/");
}

export function getGitDir() {
  return path.resolve(repoRoot, runGit(["rev-parse", "--git-dir"]));
}

export function ensurePocketcurbGitDir() {
  for (const dir of getPocketcurbArtifactDirectories()) {
    try {
      fs.mkdirSync(dir, { recursive: true });
      fs.accessSync(dir, fs.constants.W_OK);
      return dir;
    } catch {
      // try the next artifact directory candidate
    }
  }

  throw new Error("Unable to find a writable PocketCurb artifact directory.");
}

export function getPocketcurbArtifactPath(filename) {
  return path.join(ensurePocketcurbGitDir(), filename);
}

export function getPocketcurbArtifactDirectories() {
  const directories = [];

  try {
    directories.push(path.join(getGitDir(), "pocketcurb"));
  } catch {
    // fall through to local filesystem candidates
  }

  directories.push(path.join(repoRoot, ".git", "pocketcurb"));
  directories.push(path.join(repoRoot, ".pocketcurb-artifacts", "pocketcurb"));

  return [...new Set(directories)];
}

export function writePocketcurbArtifact(filename, content) {
  for (const directory of getPocketcurbArtifactDirectories()) {
    try {
      fs.mkdirSync(directory, { recursive: true });
      const target = path.join(directory, filename);
      fs.writeFileSync(target, content, "utf8");
      return target;
    } catch {
      // try the next artifact directory candidate
    }
  }

  throw new Error(`Unable to write PocketCurb artifact: ${filename}`);
}

export function readPocketcurbArtifact(filename) {
  for (const directory of getPocketcurbArtifactDirectories()) {
    const target = path.join(directory, filename);
    if (!fs.existsSync(target)) {
      continue;
    }

    return fs.readFileSync(target, "utf8");
  }

  return null;
}
