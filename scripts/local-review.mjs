import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";
import crypto from "node:crypto";
import { repoRoot } from "./common.mjs";
import { quoteForCmd } from "./common.mjs";
import {
  getComparisonBase,
  getCurrentBranch,
  getChangedFilesFromBase,
  readPocketcurbArtifact,
  tryRunGit,
  writePocketcurbArtifact
} from "./git-helpers.mjs";

const args = new Set(process.argv.slice(2));

function splitLines(value) {
  return value?.split(/\r?\n/u).filter(Boolean) ?? [];
}

function tryRunGitViaShell(args) {
  if (args.length === 0) {
    return null;
  }

  const windowsCommands = [
    {
      command: "cmd.exe",
      args: ["/d", "/s", "/c", `git ${args.map(quoteForCmd).join(" ")}`]
    },
    {
      command: "powershell.exe",
      args: ["-NoProfile", "-Command", `Set-Location '${repoRoot.replace(/'/g, "''")}'; git ${args.join(" ")}`]
    }
  ];

  const attempts = process.platform === "win32"
    ? windowsCommands
    : [{
        command: "git",
        args
      }];

  for (const attempt of attempts) {
    const result = spawnSync(attempt.command, attempt.args, {
        cwd: repoRoot,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"]
      });

    if (!result.error && (result.status ?? 1) === 0) {
      return result.stdout?.toString?.().trim() ?? "";
    }
  }

  return null;
}

function classifyChanges(files) {
  const tags = new Set();

  for (const file of files) {
    if (file.startsWith("apps/mobile/")) tags.add("mobile");
    if (file.startsWith("apps/web/")) tags.add("web");
    if (file.startsWith("packages/")) tags.add("shared-package");
    if (file.startsWith("supabase/")) tags.add("supabase");
    if (file.startsWith("docs/")) tags.add("docs");
    if (file.startsWith("docs/security/")) tags.add("security-sensitive");
    if (file.startsWith("docs/runbooks/")) tags.add("ops");
    if (file.startsWith(".github/")) tags.add("release-infra");

    if (
      file.startsWith("supabase/") ||
      file.startsWith("docs/security/") ||
      /auth|secret|privacy|secure-storage|retention|deletion|rollback/i.test(file)
    ) {
      tags.add("security-sensitive");
    }
  }

  return [...tags].sort();
}

function computeChangedFilesFingerprint(files) {
  const normalized = files
    .filter((value) => typeof value === "string")
    .map((value) => value.trim())
    .filter(Boolean)
    .sort();

  return crypto.createHash("sha256").update(normalized.join("\n"), "utf8").digest("hex");
}

function recommendedGate(tags) {
  if (tags.includes("release-infra") || tags.includes("ops")) {
    return "Gate C";
  }

  if (tags.includes("security-sensitive") || tags.includes("supabase")) {
    return "Gate B";
  }

  return "Gate A";
}

function assessWorkflowEvidence(files, tags) {
  const touchesImplementation = files.some((file) => {
    return (
      file.startsWith("apps/") ||
      file.startsWith("packages/") ||
      file.startsWith("supabase/") ||
      file.startsWith("scripts/") ||
      file.startsWith(".github/") ||
      file === "package.json"
    );
  });

  const touchedFeatureSpec = files.some((file) =>
    /^docs\/specs\/(mobile|web)\/(?!_template\.md$)(?!plans\/).+\.md$/i.test(file),
  );
  const touchedImplementationPlan = files.some((file) =>
    /^docs\/specs\/(mobile|web|shared)\/plans\/.+\.md$/i.test(file),
  );
  const touchedBugfixSpec = files.some((file) => /^docs\/specs\/shared\/bugfixes\/.+\.md$/i.test(file));
  const touchedSecurityDocs = files.some(
    (file) => file.startsWith("docs/security/") || file === "docs/runbooks/security-release-checklist.md",
  );
  const touchedRunbook = files.some((file) => file.startsWith("docs/runbooks/"));
  const warnings = [];

  if (touchesImplementation && !touchedFeatureSpec && !touchedBugfixSpec) {
    warnings.push(
      "Implementation changed without a feature spec or bugfix spec update. This may be valid for trivial work, but review it.",
    );
  }

  if (touchesImplementation && !touchedImplementationPlan && !touchedBugfixSpec) {
    warnings.push(
      "Implementation changed without an implementation plan update. This may be valid for trivial work, but review it.",
    );
  }

  if (tags.includes("security-sensitive") && !touchedSecurityDocs && !touchedRunbook) {
    warnings.push(
      "Security-sensitive changes landed without security docs or runbook updates. Review whether docs/security or docs/runbooks should change.",
    );
  }

  if ((tags.includes("release-infra") || tags.includes("ops")) && !touchedRunbook) {
    warnings.push("Operational or release changes landed without runbook updates. Review docs/runbooks before merge.");
  }

  return {
    touchesImplementation,
    touchedFeatureSpec,
    touchedImplementationPlan,
    touchedBugfixSpec,
    warnings
  };
}

function readReviewEvidence(branch) {
  const content = readPocketcurbArtifact("review-evidence.json");
  if (!content) {
    return null;
  }

  try {
    const evidence = JSON.parse(content);
    if (!evidence || typeof evidence !== "object") {
      return null;
    }

    const artifactBranch = typeof evidence.branch === "string" ? evidence.branch.trim() : "";
    if (!artifactBranch || artifactBranch !== branch) {
      return {
        status: "stale",
        evidence
      };
    }

    return {
      status: "valid",
      evidence
    };
  } catch {
    return {
      status: "invalid",
      evidence: null
    };
  }
}

function assessReviewEvidence(branch, files, workflowEvidence) {
  const reviewEvidence = readReviewEvidence(branch);
  const warnings = [];
  const substantiveImplementation = workflowEvidence.touchesImplementation;
  const changedFilesFingerprint = computeChangedFilesFingerprint(files);

  if (!substantiveImplementation) {
    return {
      substantiveImplementation,
      warnings,
      status: "not-required",
      evidence: reviewEvidence?.evidence ?? null
    };
  }

  if (!reviewEvidence) {
    warnings.push(
      "Substantive implementation changes require explicit review evidence. Run `pnpm review:evidence -- --verification-command \"node ./scripts/verify.mjs\" --verification-summary \"...\" --independent-review-method \"...\" --independent-review-summary \"...\"` before treating this branch as review-ready.",
    );
    return {
      substantiveImplementation,
      warnings,
      status: "missing",
      evidence: null
    };
  }

  if (reviewEvidence.status === "invalid") {
    warnings.push("Review evidence artifact exists but is invalid JSON. Recreate it with `pnpm review:evidence`.");
    return {
      substantiveImplementation,
      warnings,
      status: "invalid",
      evidence: null
    };
  }

  if (reviewEvidence.status === "stale") {
    warnings.push("Review evidence artifact belongs to a different branch. Recreate it on the current branch with `pnpm review:evidence`.");
    return {
      substantiveImplementation,
      warnings,
      status: "stale",
      evidence: reviewEvidence.evidence
    };
  }

  const evidence = reviewEvidence.evidence;
  if (evidence?.changedFilesFingerprint !== changedFilesFingerprint) {
    warnings.push("Review evidence is stale for the current changed-file set. Recreate it with `pnpm review:evidence` after the latest edits.");
  }
  const verificationCommands = Array.isArray(evidence?.verification?.commands)
    ? evidence.verification.commands.filter((entry) => typeof entry === "string" && entry.trim().length > 0)
    : [];
  const verificationSummary = typeof evidence?.verification?.summary === "string" ? evidence.verification.summary.trim() : "";
  const independentReviewMethod =
    typeof evidence?.independentReview?.method === "string" ? evidence.independentReview.method.trim() : "";
  const independentReviewSummary =
    typeof evidence?.independentReview?.summary === "string" ? evidence.independentReview.summary.trim() : "";
  const independentReviewStatus =
    typeof evidence?.independentReview?.status === "string" ? evidence.independentReview.status.trim() : "";
  const humanReviewStatus = typeof evidence?.humanReview?.status === "string" ? evidence.humanReview.status.trim() : "";

  if (verificationCommands.length === 0) {
    warnings.push("Review evidence must record at least one verification command or proof item.");
  }

  if (!verificationSummary) {
    warnings.push("Review evidence must include a verification summary.");
  }

  if (!independentReviewMethod) {
    warnings.push("Review evidence must include the independent-review method.");
  }

  if (!independentReviewSummary) {
    warnings.push("Review evidence must include the independent-review outcome summary.");
  }

  if (independentReviewStatus !== "completed") {
    warnings.push("Independent review must be recorded as completed before the branch is treated as review-ready.");
  }

  if (!["pending", "completed"].includes(humanReviewStatus)) {
    warnings.push('Review evidence must record human review status as "pending" or "completed".');
  }

  return {
    substantiveImplementation,
    warnings,
    status: warnings.length === 0 ? "valid" : "incomplete",
    evidence
  };
}

function scanRiskPatterns(files) {
  const findings = [];
  const selfScanningRuleFiles = new Set([
    "scripts/local-review.mjs",
    "scripts/policy-check.mjs"
  ]);

  for (const file of files) {
    if (!/\.(cjs|mjs|js|jsx|ts|tsx|json|ya?ml|toml|sql|sh)$/i.test(file)) {
      continue;
    }

    if (selfScanningRuleFiles.has(file)) {
      continue;
    }

    const absolute = path.join(repoRoot, file);
    if (!fs.existsSync(absolute)) {
      continue;
    }

    const content = fs.readFileSync(absolute, "utf8");

    if (/eval\s*\(/.test(content)) {
      findings.push({
        severity: "high",
        file,
        rule: "dangerous-eval",
        message: "Avoid eval()."
      });
    }

    if (/dangerouslySetInnerHTML|\.innerHTML\s*=/.test(content)) {
      findings.push({
        severity: "medium",
        file,
        rule: "unsafe-html",
        message: "Review HTML injection risk carefully."
      });
    }

    if (
      (file.startsWith("apps/") || file.startsWith("packages/ui-")) &&
      /SUPABASE_SERVICE_ROLE|service_role/i.test(content)
    ) {
      findings.push({
        severity: "high",
        file,
        rule: "client-service-role",
        message: "Client-facing code must not reference service-role credentials."
      });
    }
  }

  return findings;
}

function readChangedFiles() {
  const changedFilesFile = process.env.POCKETCURB_CHANGED_FILES_FILE;
  if (changedFilesFile) {
    const content = fs.readFileSync(changedFilesFile, "utf8");
    return content.split(/\r?\n/).filter(Boolean);
  }

  const changedFilesEnv = process.env.POCKETCURB_CHANGED_FILES;
  if (changedFilesEnv) {
    return changedFilesEnv.split(/\r?\n/).filter(Boolean);
  }

  try {
    const baseRef = getComparisonBase();
    return getChangedFilesFromBase(baseRef);
  } catch {
    const tracked = splitLines(tryRunGit(["diff", "--name-only", "HEAD"]) || tryRunGitViaShell(["diff", "--name-only", "HEAD"]));
    const untracked = splitLines(
      tryRunGit(["ls-files", "--others", "--exclude-standard"]) || tryRunGitViaShell(["ls-files", "--others", "--exclude-standard"])
    );
    const headFiles = splitLines(tryRunGit(["show", "--pretty=", "--name-only", "HEAD"]) || tryRunGitViaShell(["show", "--pretty=", "--name-only", "HEAD"]));
    return [...new Set([...tracked, ...untracked, ...headFiles])];
  }
}

const branch = process.env.POCKETCURB_BRANCH || (() => {
  try {
    return getCurrentBranch();
  } catch {
    return tryRunGit(["rev-parse", "--abbrev-ref", "HEAD"]) || tryRunGitViaShell(["rev-parse", "--abbrev-ref", "HEAD"]) || "unknown";
  }
})();
const baseRef = process.env.POCKETCURB_BASE_REF || (() => {
  try {
    return getComparisonBase();
  } catch {
    return tryRunGitViaShell(["merge-base", "HEAD", "origin/main"]) || "HEAD";
  }
})();
const changedFiles = readChangedFiles();
const tags = classifyChanges(changedFiles);
const gate = recommendedGate(tags);
const findings = scanRiskPatterns(changedFiles);
const workflowEvidence = assessWorkflowEvidence(changedFiles, tags);
const reviewEvidence = assessReviewEvidence(branch, changedFiles, workflowEvidence);
const codexReview = {
  status: process.env.POCKETCURB_CODEX_REVIEW_STATUS || (args.has("--require-ai") ? "failed" : "deferred"),
  message:
    process.env.POCKETCURB_CODEX_REVIEW_MESSAGE || "Codex review is expected at pull-request stage before merge."
};

const artifact = {
  reviewedAt: new Date().toISOString(),
  branch,
  baseRef,
  changedFiles,
  tags,
  recommendedGate: gate,
  workflowEvidence,
  reviewEvidence,
  findings,
  codexReview
};

const artifactPath = writePocketcurbArtifact("local-review.json", `${JSON.stringify(artifact, null, 2)}\n`);
writePocketcurbArtifact("changed-files.txt", changedFiles.length > 0 ? `${changedFiles.join("\n")}\n` : "");

console.log(`Local review artifact: ${artifactPath}`);
console.log(`Branch: ${branch}`);
console.log(`Base: ${baseRef}`);
console.log(`Recommended release gate: ${gate}`);
console.log(`Tags: ${tags.length > 0 ? tags.join(", ") : "none"}`);
if (changedFiles.length === 0) {
  console.warn("Changed files could not be derived automatically. Local review coverage is reduced unless the caller provides explicit git context.");
}
if (workflowEvidence.warnings.length > 0) {
  for (const warning of workflowEvidence.warnings) {
    console.warn(warning);
  }
}

if (reviewEvidence.warnings.length > 0) {
  for (const warning of reviewEvidence.warnings) {
    console.warn(warning);
  }
}

if (args.has("--require-workflow-evidence") && (workflowEvidence.warnings.length > 0 || reviewEvidence.warnings.length > 0)) {
  console.error("Workflow evidence is required before this step can pass:");
  for (const warning of workflowEvidence.warnings) {
    console.error(`- ${warning}`);
  }
  for (const warning of reviewEvidence.warnings) {
    console.error(`- ${warning}`);
  }
  process.exit(1);
}

if (findings.length > 0) {
  console.error("Local policy findings:");
  for (const finding of findings) {
    console.error(`- [${finding.severity}] ${finding.file}: ${finding.message}`);
  }
  process.exit(1);
}

if (args.has("--require-ai") && codexReview.status !== "passed") {
  console.error(`AI review required but did not complete successfully: ${codexReview.message}`);
  process.exit(1);
}
