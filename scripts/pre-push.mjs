import process from "node:process";
import fs from "node:fs";
import { spawnSync } from "node:child_process";
import { repoRoot } from "./common.mjs";
import { getChangedFilesFromBase, getComparisonBase, getCurrentBranch, isProtectedBranch } from "./git-helpers.mjs";

const ZERO_OID = "0000000000000000000000000000000000000000";

function readPushRefs() {
  try {
    const content = fs.readFileSync(0, "utf8");
    return content
      .split(/\r?\n/u)
      .filter(Boolean)
      .map((line) => {
        const [localRef, localOid, remoteRef, remoteOid] = line.trim().split(/\s+/u);
        return { localRef, localOid, remoteRef, remoteOid };
      })
      .filter((entry) => entry.remoteRef);
  } catch {
    return [];
  }
}

function remoteBranchName(remoteRef) {
  return remoteRef?.startsWith("refs/heads/") ? remoteRef.slice("refs/heads/".length) : null;
}

function isDeletionPush(ref) {
  return ref.localRef === "(delete)" || ref.localOid === ZERO_OID;
}

if (process.env.POCKETCURB_BYPASS_LOCAL_GATES === "1") {
  console.warn("PocketCurb local gates bypassed via POCKETCURB_BYPASS_LOCAL_GATES=1");
  process.exit(0);
}

const pushRefs = readPushRefs();
const protectedBranchUpdate = pushRefs.find((ref) => {
  const remoteBranch = remoteBranchName(ref.remoteRef);
  return remoteBranch && isProtectedBranch(remoteBranch) && !isDeletionPush(ref);
});

if (protectedBranchUpdate && process.env.POCKETCURB_ALLOW_PROTECTED_PUSH !== "1") {
  const targetBranch = remoteBranchName(protectedBranchUpdate.remoteRef);
  console.error(`Direct pushes to protected branch '${targetBranch}' are blocked. Push a feature branch and open a PR.`);
  process.exit(1);
}

if (pushRefs.length > 0 && pushRefs.every(isDeletionPush)) {
  const protectedDeletion = pushRefs.find((ref) => {
    const remoteBranch = remoteBranchName(ref.remoteRef);
    return remoteBranch && isProtectedBranch(remoteBranch);
  });

  if (protectedDeletion && process.env.POCKETCURB_ALLOW_PROTECTED_PUSH !== "1") {
    const targetBranch = remoteBranchName(protectedDeletion.remoteRef);
    console.error(`Deletion of protected branch '${targetBranch}' is blocked without override.`);
    process.exit(1);
  }

  console.log("Deletion-only push detected. Skipping verify and local review gate.");
  process.exit(0);
}

const branch = getCurrentBranch();

console.log("Running PocketCurb pre-push verification...");
const verifyResult = spawnSync(process.execPath, ["./scripts/verify.mjs"], {
  cwd: repoRoot,
  stdio: "inherit"
});

if ((verifyResult.status ?? 1) !== 0) {
  process.exit(verifyResult.status ?? 1);
}

const baseRef = getComparisonBase();
const changedFiles = getChangedFilesFromBase(baseRef);
const changedFilesPayload = changedFiles.join("\n");

console.log("Running PocketCurb local review gate...");
const reviewEnv = {
  ...process.env,
  POCKETCURB_BRANCH: branch,
  POCKETCURB_BASE_REF: baseRef,
  POCKETCURB_CHANGED_FILES: changedFilesPayload,
  POCKETCURB_CODEX_REVIEW_STATUS: "deferred",
  POCKETCURB_CODEX_REVIEW_MESSAGE: "Codex review is required at pull-request stage, not during local pre-push."
};

const reviewResult = spawnSync(process.execPath, ["./scripts/local-review.mjs", "--require-workflow-evidence"], {
  cwd: repoRoot,
  stdio: "inherit",
  env: reviewEnv
});

process.exit(reviewResult.status ?? 1);
