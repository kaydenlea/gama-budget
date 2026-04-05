import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { repoRoot } from "./common.mjs";
import {
  getComparisonBase,
  getCurrentBranch,
  getChangedFilesFromBase,
  writePocketcurbArtifact
} from "./git-helpers.mjs";

const args = new Set(process.argv.slice(2));

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
      file.startsWith("supabase/")
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
    return [];
  }
}

const branch = process.env.POCKETCURB_BRANCH || (() => {
  try {
    return getCurrentBranch();
  } catch {
    return "unknown";
  }
})();
const baseRef = process.env.POCKETCURB_BASE_REF || (() => {
  try {
    return getComparisonBase();
  } catch {
    return "HEAD";
  }
})();
const changedFiles = readChangedFiles();
const tags = classifyChanges(changedFiles);
const gate = recommendedGate(tags);
const findings = scanRiskPatterns(changedFiles);
const workflowEvidence = assessWorkflowEvidence(changedFiles, tags);
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

if (args.has("--require-workflow-evidence") && workflowEvidence.warnings.length > 0) {
  console.error("Workflow evidence is required before this step can pass:");
  for (const warning of workflowEvidence.warnings) {
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
