import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import {
  getChangedFilesFromBase,
  getComparisonBase,
  readPocketcurbArtifact,
  tryRunGit,
  writePocketcurbArtifact
} from "./git-helpers.mjs";

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function splitLines(value) {
  return value
    ?.split(/\r?\n/u)
    .map((line) => line.trim())
    .filter(Boolean) ?? [];
}

function readJsonArtifact(filename) {
  const content = readPocketcurbArtifact(filename);
  if (!content) {
    return null;
  }

  try {
    return JSON.parse(content);
  } catch {
    return null;
  }
}

function readTextArtifactLines(filename) {
  return splitLines(readPocketcurbArtifact(filename));
}

function getBranchFromGitHead() {
  try {
    const gitFile = path.join(process.cwd(), ".git");
    let gitDir = gitFile;

    if (fs.existsSync(gitFile) && fs.statSync(gitFile).isFile()) {
      const pointer = fs.readFileSync(gitFile, "utf8");
      const gitDirMatch = pointer.match(/^gitdir:\s*(.+)$/imu);
      if (gitDirMatch?.[1]) {
        gitDir = path.resolve(process.cwd(), gitDirMatch[1].trim());
      }
    }

    const headPath = path.join(gitDir, "HEAD");
    if (!fs.existsSync(headPath)) {
      return null;
    }

    const head = fs.readFileSync(headPath, "utf8").trim();
    const branchMatch = head.match(/^ref:\s+refs\/heads\/(.+)$/u);
    return branchMatch?.[1] ?? null;
  } catch {
    return null;
  }
}

function readStoredReviewContext() {
  const localReview = readJsonArtifact("local-review.json");
  const reviewEvidence = readJsonArtifact("review-evidence.json");
  const changedFilesArtifact = readTextArtifactLines("changed-files.txt");

  return {
    branch: localReview?.branch ?? null,
    baseRef: localReview?.baseRef ?? null,
    changedFiles: unique([...(changedFilesArtifact ?? []), ...(localReview?.changedFiles ?? [])]),
    tags: localReview?.tags ?? [],
    recommendedGate: localReview?.recommendedGate ?? null,
    reviewEvidence
  };
}

function collectLiveChangedFiles(baseRef) {
  const collected = [];

  try {
    collected.push(...getChangedFilesFromBase(baseRef));
  } catch {
    // fall through to other local git views
  }

  collected.push(...getHeadCommitFiles());
  collected.push(...getWorkingTreeFiles());

  return unique(collected);
}

function getWorkingTreeFiles() {
  const trackedOutput = tryRunGit(["diff", "--name-only", "HEAD"]);
  const untrackedOutput = tryRunGit(["ls-files", "--others", "--exclude-standard"]);
  const tracked = trackedOutput ? splitLines(trackedOutput) : null;
  const untracked = untrackedOutput ? splitLines(untrackedOutput) : null;

  return unique([...(tracked ?? []), ...(untracked ?? [])]);
}

function getHeadCommitFiles() {
  const output = tryRunGit(["show", "--pretty=", "--name-only", "HEAD"]);
  return splitLines(output);
}

function toMarkdownLinks(paths) {
  if (paths.length === 0) {
    return null;
  }

  return paths.map((file) => `[${file}](${file})`).join(", ");
}

function inferTags(files) {
  const tags = new Set();

  for (const file of files) {
    if (
      file.startsWith("apps/mobile/") ||
      file.startsWith("packages/ui-mobile/") ||
      file.startsWith("docs/specs/mobile/") ||
      file.startsWith("docs/product/mobile/")
    ) {
      tags.add("mobile");
    }

    if (
      file.startsWith("apps/web/") ||
      file.startsWith("packages/ui-web/") ||
      file.startsWith("docs/specs/web/") ||
      file.startsWith("docs/product/web/")
    ) {
      tags.add("web");
    }

    if (file.startsWith("packages/") || file.startsWith("scripts/")) {
      tags.add("shared");
    }

    if (file.startsWith("docs/")) {
      tags.add("docs");
    }

    if (file.startsWith("docs/runbooks/")) {
      tags.add("ops");
    }

    if (
      file.startsWith("supabase/") ||
      file.startsWith("docs/security/") ||
      /auth|secret|privacy|secure-storage|retention|deletion|rollback/i.test(file)
    ) {
      tags.add("security-sensitive");
    }

    if (file.startsWith(".github/workflows/")) {
      tags.add("release-infra");
    }
  }

  return [...tags];
}

function hasAnyFile(files, patterns) {
  return files.some((file) => patterns.some((pattern) => pattern.test(file)));
}

function isDocsOnly(tags, files) {
  return tags.length === 1 && tags[0] === "docs" && files.every((file) => file.startsWith("docs/"));
}

function inferPrimaryScope(tags, files) {
  const hasWebCode = files.some((file) => file.startsWith("apps/web/") || file.startsWith("packages/ui-web/"));
  const hasMobileCode = files.some((file) => file.startsWith("apps/mobile/") || file.startsWith("packages/ui-mobile/"));
  const hasSupabase = files.some((file) => file.startsWith("supabase/"));
  const hasSharedCode = files.some(
    (file) => file.startsWith("packages/") || file.startsWith("scripts/") || file.startsWith(".github/workflows/"),
  );

  if (hasWebCode && hasMobileCode) {
    return "Updates both the mobile and web lanes";
  }

  if (hasWebCode && hasSharedCode) {
    return "Builds out the web lane foundation";
  }

  if (hasWebCode) {
    return "Updates the web lane";
  }

  if (hasMobileCode && hasSharedCode) {
    return "Strengthens the mobile lane and supporting workspace tooling";
  }

  if (hasMobileCode) {
    return "Updates the mobile lane";
  }

  if (hasSupabase && tags.includes("security-sensitive")) {
    return "Updates Supabase and security-sensitive backend boundaries";
  }

  if (hasSupabase) {
    return "Updates Supabase backend infrastructure";
  }

  if (files.some((file) => file.startsWith(".github/workflows/"))) {
    return "Updates CI and release infrastructure";
  }

  if (isDocsOnly(tags, files)) {
    return "Reconciles repository docs and workflow guidance";
  }

  if (hasSharedCode) {
    return "Updates shared tooling and workspace infrastructure";
  }

  return "Updates the repository foundation";
}

function inferWorkstreams(tags, files) {
  const workstreams = [];

  const hasWebFoundationUpgrade =
    files.some((file) => file.startsWith("apps/web/package.json") || file.startsWith("apps/web/postcss.config")) ||
    files.some((file) => file.startsWith("apps/web/next.config")) ||
    files.some((file) => file.startsWith("apps/web/app/globals.css"));

  if (hasWebFoundationUpgrade) {
    workstreams.push("aligning the website scaffold with the current Next.js App Router and Tailwind baseline");
  }

  const hasWebRoutesAndMetadata = hasAnyFile(files, [
    /^apps\/web\/app\/waitlist\/page\.tsx$/u,
    /^apps\/web\/app\/privacy\/page\.tsx$/u,
    /^apps\/web\/app\/robots\.ts$/u,
    /^apps\/web\/app\/sitemap\.ts$/u,
    /^apps\/web\/src\/lib\/site-metadata\.ts$/u,
    /^apps\/web\/src\/content\/site-copy\.ts$/u
  ]);

  if (hasWebRoutesAndMetadata) {
    workstreams.push("adding landing, waitlist, privacy, and SEO-ready metadata foundations");
  }

  const hasWebDocs = hasAnyFile(files, [
    /^docs\/product\/web\//u,
    /^docs\/architecture\/web\//u,
    /^docs\/agent-workflows\/(seo-standard|ui-design-standard)\.md$/u,
    /^docs\/specs\/web\//u
  ]);

  if (hasWebDocs) {
    workstreams.push("reconciling the web roadmap, architecture, SEO guidance, and implementation docs");
  }

  const hasMobileFramework = hasAnyFile(files, [
    /^apps\/mobile\/package\.json$/u,
    /^apps\/mobile\/app\.config\.ts$/u,
    /^apps\/mobile\/babel\.config\.js$/u,
    /^apps\/mobile\/metro\.config\.js$/u,
    /^apps\/mobile\/tsconfig\.json$/u
  ]);

  if (hasMobileFramework) {
    workstreams.push("updating the mobile framework baseline and app tooling");
  }

  const hasMobileBehavior = hasAnyFile(files, [
    /^apps\/mobile\/src\//u,
    /^packages\/ui-mobile\/src\//u
  ]);

  if (hasMobileBehavior) {
    workstreams.push("fixing or extending mobile product behavior");
  }

  const hasSharedTooling = hasAnyFile(files, [
    /^scripts\//u,
    /^package\.json$/u,
    /^pnpm-lock\.yaml$/u,
    /^packages\/config-/u
  ]);

  if (hasSharedTooling && !hasWebFoundationUpgrade) {
    workstreams.push("tightening shared tooling, automation, and workspace verification");
  }

  const hasSharedPackages = hasAnyFile(files, [
    /^packages\/(core-domain|schemas|api-client|supabase-types)\//u
  ]);

  if (hasSharedPackages) {
    workstreams.push("updating shared domain or contract packages");
  }

  const hasSecurity = tags.includes("security-sensitive");

  if (hasSecurity && !hasWebDocs) {
    workstreams.push("hardening privacy, security, or release-sensitive boundaries");
  }

  if (isDocsOnly(tags, files) && workstreams.length === 0) {
    workstreams.push("reconciling workflow, product, or architecture documentation");
  }

  return unique(workstreams).slice(0, 3);
}

function inferReleaseGate(files, tags) {
  if (tags.includes("release-infra") || tags.includes("ops")) {
    return "Gate C";
  }

  if (tags.includes("security-sensitive")) {
    return "Gate B";
  }

  return "Gate A";
}

function describeReleaseGate(gate) {
  switch (gate) {
    case "Gate A":
      return "routine product, maintenance, or docs work";
    case "Gate B":
      return "sensitive security, privacy, billing, deletion, auth, or trust-critical work";
    case "Gate C":
      return "release, deployment, CI, or production-like shipping work";
    case "Gate D":
      return "launch, app-store, legal/disclosure, or compliance-sensitive work";
    default:
      return "review docs/runbooks/release-gates.md";
  }
}

function joinClauses(clauses) {
  if (clauses.length === 0) {
    return "";
  }

  if (clauses.length === 1) {
    return clauses[0];
  }

  if (clauses.length === 2) {
    return `${clauses[0]} and ${clauses[1]}`;
  }

  return `${clauses.slice(0, -1).join(", ")}, and ${clauses.at(-1)}`;
}

function humanizeBranchName(branch) {
  const slug = branch
    .replace(/^refs\/heads\//u, "")
    .replace(/^(feat|feature|fix|bugfix|chore|docs|refactor|test|release)\//u, "")
    .replace(/^[A-Z]+-\d+[-/]/u, "")
    .replaceAll(/[-_/]+/gu, " ")
    .trim();

  if (!slug) {
    return null;
  }

  return slug.replace(/\b\w/gu, (char) => char.toUpperCase());
}

function inferSummaryFromBranch(branch) {
  const branchHint = humanizeBranchName(branch);
  if (!branchHint) {
    return null;
  }

  if (/^(Add|Align|Build|Create|Document|Fix|Harden|Improve|Implement|Introduce|Migrate|Reconcile|Refactor|Remove|Repair|Set Up|Setup|Stabilize|Strengthen|Update|Upgrade)\b/u.test(branchHint)) {
    return `${branchHint}.`;
  }

  return `Implements ${branchHint.toLowerCase()}.`;
}

function inferSummary(branch, tags, files) {
  const primaryScope = inferPrimaryScope(tags, files);
  const workstreams = inferWorkstreams(tags, files);

  if (workstreams.length === 0) {
    if (files.length === 0) {
      const branchSummary = inferSummaryFromBranch(branch);
      if (branchSummary) {
        return `${branchSummary} Review the generated summary before merge and tighten the wording if needed.`;
      }
    }

    return `${primaryScope}.`;
  }

  const firstSentence = `${primaryScope} by ${joinClauses(workstreams)}.`;

  if (files.length === 0) {
    return `${firstSentence} Generated from branch \`${branch}\` without a diff artifact; review the summary before merge.`;
  }

  return firstSentence;
}

function collectArtifacts(files) {
  const productBriefs = files.filter((file) => /^docs\/product\/shared\/briefs\/.+\.md$/u.test(file));
  const prds = files.filter((file) => {
    if (!/^docs\/product\/(mobile|web|shared)\/.+\.md$/u.test(file) || /^docs\/product\/shared\/briefs\/.+\.md$/u.test(file)) {
      return false;
    }

    const basename = path.basename(file).toLowerCase();
    return basename === "prd.md" || basename.includes("prd");
  });
  const specs = files.filter((file) => /^docs\/specs\/(mobile|web)\/(?!_template\.md$)(?!plans\/).+\.md$/u.test(file));
  const bugfixes = files.filter((file) => /^docs\/specs\/shared\/bugfixes\/.+\.md$/u.test(file));
  const implementationPlans = files.filter((file) => /^docs\/specs\/(mobile|web|shared)\/plans\/.+\.md$/u.test(file));

  const tags = inferTags(files);
  const inferredPrds = [];

  if (prds.length === 0) {
    if (tags.includes("mobile")) {
      inferredPrds.push("docs/product/mobile/prd.md");
    }

    if (tags.includes("web")) {
      inferredPrds.push("docs/product/web/website-prd.md");
    }
  }

  const resolvedPrds = unique([...prds, ...inferredPrds]);
  const resolvedSpecs = unique([...specs, ...bugfixes]);

  return {
    productBriefs,
    prds: resolvedPrds,
    specs: resolvedSpecs,
    implementationPlans
  };
}

function formatArtifactLine(label, paths, fallback) {
  const links = toMarkdownLinks(paths);
  return `- ${label} ${links ?? fallback}`;
}

function inferCodexReviewPrompt(tags, releaseGate) {
  if (tags.includes("security-sensitive") || releaseGate === "Gate B") {
    return "@codex review against the linked planning artifacts in the PR body. Focus on auth, authorization, RLS, secrets, secure storage, privacy, rollback safety, and whether negative-path verification is sufficient.";
  }

  if (releaseGate === "Gate C" || releaseGate === "Gate D" || tags.includes("release-infra")) {
    return "@codex review against the linked planning artifacts in the PR body. Focus on release readiness, rollback safety, CI or deployment regressions, monitoring and alerting impact, and whether the stated release gate is correct.";
  }

  if (tags.includes("mobile")) {
    return "@codex review against the linked planning artifacts in the PR body. Focus on mobile architecture, Safe-to-Spend trust, secure storage, regression risk, and mobile-vs-web separation.";
  }

  if (tags.includes("web")) {
    return "@codex review against the linked planning artifacts in the PR body. Focus on truthful claims, waitlist or SEO separation, privacy-safe analytics, release risk, and missing verification.";
  }

  return "@codex review against the linked planning artifacts in the PR body. Focus on correctness, security boundaries, rollback safety, documentation alignment, and missing verification.";
}

function releaseGateChecklistEvidenceLine(releaseGate) {
  if (!["Gate B", "Gate C", "Gate D"].includes(releaseGate)) {
    return null;
  }

  return "Security release checklist evidence: [docs/runbooks/security-release-checklist.md](docs/runbooks/security-release-checklist.md)";
}

function formatEvidenceList(values, fallback) {
  if (!Array.isArray(values)) {
    return fallback;
  }

  const normalized = values
    .filter((value) => typeof value === "string")
    .map((value) => value.trim())
    .filter(Boolean);

  return normalized.length > 0 ? normalized.join(" | ") : fallback;
}

function readReviewEvidenceFields(reviewEvidence) {
  return {
    verificationCommands: formatEvidenceList(
      reviewEvidence?.verification?.commands,
      "record the commands or proof items you actually ran",
    ),
    verificationSummary:
      typeof reviewEvidence?.verification?.summary === "string" && reviewEvidence.verification.summary.trim()
        ? reviewEvidence.verification.summary.trim()
        : "summarize what passed, what was skipped, and why",
    residualRisk:
      typeof reviewEvidence?.verification?.residualRisk === "string" && reviewEvidence.verification.residualRisk.trim()
        ? reviewEvidence.verification.residualRisk.trim()
        : "state any residual risk or write none",
    independentReviewMethod:
      typeof reviewEvidence?.independentReview?.method === "string" && reviewEvidence.independentReview.method.trim()
        ? reviewEvidence.independentReview.method.trim()
        : "state whether this used a second model/tool or a fresh-context same-tool fallback",
    independentReviewOutcome:
      typeof reviewEvidence?.independentReview?.summary === "string" && reviewEvidence.independentReview.summary.trim()
        ? reviewEvidence.independentReview.summary.trim()
        : "summarize findings and whether they were resolved",
    humanReviewStatus:
      typeof reviewEvidence?.humanReview?.status === "string" && reviewEvidence.humanReview.status.trim()
        ? reviewEvidence.humanReview.status.trim()
        : "pending before merge"
  };
}

export function buildPrBody() {
  const storedReviewContext = readStoredReviewContext();
  const branchFromGit =
    getBranchFromGitHead() ||
    tryRunGit(["branch", "--show-current"]) ||
    tryRunGit(["rev-parse", "--abbrev-ref", "HEAD"]);
  const branch =
    process.env.POCKETCURB_BRANCH ||
    branchFromGit ||
    storedReviewContext.branch ||
    "unknown-branch";

  const changedFilesFromEnv = process.env.POCKETCURB_CHANGED_FILES
    ? splitLines(process.env.POCKETCURB_CHANGED_FILES)
    : null;

  const canUseStoredReviewContext =
    !process.env.POCKETCURB_BRANCH &&
    Boolean(storedReviewContext.branch) &&
    storedReviewContext.branch === branch;

  const baseRef =
    process.env.POCKETCURB_BASE_REF ||
    (() => {
      try {
        return getComparisonBase();
      } catch {
        return canUseStoredReviewContext ? storedReviewContext.baseRef || "HEAD" : "HEAD";
      }
    })();

  const liveChangedFiles = changedFilesFromEnv && changedFilesFromEnv.length > 0
    ? changedFilesFromEnv
    : collectLiveChangedFiles(baseRef);

  const files = liveChangedFiles.length > 0
    ? liveChangedFiles
    : canUseStoredReviewContext
      ? storedReviewContext.changedFiles
      : [];
  const tags = files.length > 0
    ? inferTags(files)
    : canUseStoredReviewContext
      ? storedReviewContext.tags
      : [];
  const artifacts = collectArtifacts(files);
  const releaseGate = files.length > 0
    ? inferReleaseGate(files, tags)
    : canUseStoredReviewContext
      ? storedReviewContext.recommendedGate || inferReleaseGate(files, tags)
      : inferReleaseGate(files, tags);
  const codexReviewPrompt = inferCodexReviewPrompt(tags, releaseGate);
  const releaseChecklistLine = releaseGateChecklistEvidenceLine(releaseGate);
  const reviewEvidence = storedReviewContext.reviewEvidence?.branch === branch ? storedReviewContext.reviewEvidence : null;
  const reviewEvidenceFields = readReviewEvidenceFields(reviewEvidence);

  return [
    "## Summary",
    "",
    inferSummary(branch, tags, files),
    "",
    "## Planning Artifacts",
    "",
    formatArtifactLine("Product brief:", artifacts.productBriefs, "not required for this branch based on the current changed files."),
    formatArtifactLine("PRD:", artifacts.prds, "not required for this branch based on the current changed files."),
    formatArtifactLine("Feature spec or bugfix spec:", artifacts.specs, "not required for this branch based on the current changed files."),
    formatArtifactLine("Implementation plan:", artifacts.implementationPlans, "not required for this branch based on the current changed files."),
    "",
    "## Release Gate",
    "",
    `${releaseGate} - ${describeReleaseGate(releaseGate)}`,
    ...(releaseChecklistLine ? ["", releaseChecklistLine] : []),
    "",
    "See `docs/runbooks/release-gates.md` for the full gate definitions.",
    "",
    "## Verification",
    "",
    "- [ ] lint",
    "- [ ] typecheck",
    "- [ ] unit",
    "- [ ] integration",
    "- [ ] end-to-end",
    "- [ ] visual verification if UI changed",
    "- [ ] security review if sensitive",
    "- Commands run: " + reviewEvidenceFields.verificationCommands,
    "- Verification summary: " + reviewEvidenceFields.verificationSummary,
    "- Residual risk: " + reviewEvidenceFields.residualRisk,
    "",
    "## Docs and Ops",
    "",
    "- [ ] docs reconciled",
    "- [ ] rollback path reviewed",
    "- [ ] monitoring or alerting impact reviewed",
    "",
    "## Review",
    "",
    "- [ ] human review required",
    "- [ ] every touched file reviewed against the active spec or plan",
    "- [ ] independent review completed using a second tool or a fresh review-only context when only one tool was available",
    "- [ ] Codex PR review requested or completed where configured",
    "- [ ] CodeRabbit review completed if installed",
    "- [ ] local review artifact checked if CodeRabbit is unavailable",
    "- Independent review method: " + reviewEvidenceFields.independentReviewMethod,
    "- Independent review outcome: " + reviewEvidenceFields.independentReviewOutcome,
    "- Human review status: " + reviewEvidenceFields.humanReviewStatus,
    "",
    "## Codex Review Prompt",
    "",
    `- Ready to paste as a PR comment: \`${codexReviewPrompt}\``,
    ""
  ].join("\n");
}

const body = buildPrBody();
const writeFlag = process.argv.includes("--write");

if (writeFlag) {
  const artifactPath = writePocketcurbArtifact("pr-body.md", `${body}\n`);
  console.log(artifactPath);
} else {
  process.stdout.write(`${body}\n`);
}
