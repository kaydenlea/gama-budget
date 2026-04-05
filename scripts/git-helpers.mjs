import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";
import { repoRoot } from "./common.mjs";

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

export function runGit(args, options = {}) {
  if (process.platform === "win32") {
    const result = spawnSync(gitExecutable, args, {
      cwd: repoRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      ...options
    });

    if (result.error || (result.status ?? 1) !== 0) {
      const stderr = result.stderr?.toString?.().trim();
      throw new Error(stderr || `git ${args.join(" ")} failed`);
    }

    return result.stdout?.toString?.().trim() ?? "";
  }

  const result = spawnSync(gitExecutable, args, {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    ...options
  });

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
  const result = spawnSync(gitExecutable, ["diff", "--cached", "--quiet"], {
    cwd: repoRoot,
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
  const result = spawnSync(gitExecutable, ["rev-parse", "--verify", "--quiet", ref], {
    cwd: repoRoot,
    stdio: "ignore"
  });

  return result.status === 0;
}

export function getComparisonBase() {
  const requested = process.env.POCKETCURB_REVIEW_BASE;
  const candidates = [requested, "main", "origin/main", "master", "origin/master"].filter(Boolean);

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
  let baseDir;
  try {
    baseDir = getGitDir();
  } catch {
    baseDir = path.join(repoRoot, ".pocketcurb-artifacts");
  }

  const dir = path.join(baseDir, "pocketcurb");
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export function writePocketcurbArtifact(filename, content) {
  const dir = ensurePocketcurbGitDir();
  const target = path.join(dir, filename);
  fs.writeFileSync(target, content, "utf8");
  return target;
}
