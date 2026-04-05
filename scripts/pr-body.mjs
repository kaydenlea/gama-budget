import path from "node:path";
import process from "node:process";
import { getChangedFilesFromBase, getComparisonBase, tryRunGit, writePocketcurbArtifact } from "./git-helpers.mjs";

function unique(values) {
  return [...new Set(values.filter(Boolean))];
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

function inferReleaseGate(files, tags) {
  if (tags.includes("security-sensitive")) {
    return "Gate B";
  }

  if (files.some((file) => file.startsWith(".github/workflows/"))) {
    return "Gate C";
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

function inferSummary(branch, tags) {
  const described = [];

  if (tags.includes("mobile")) described.push("mobile");
  if (tags.includes("web")) described.push("web");
  if (tags.includes("shared")) described.push("shared tooling/packages");
  if (tags.includes("docs")) described.push("docs");

  if (described.length === 0) {
    return `Draft summary for branch \`${branch}\`: repository updates. Replace with a user-facing summary before merge.`;
  }

  if (described.length === 1) {
    return `Draft summary for branch \`${branch}\`: ${described[0]} updates. Replace with a user-facing summary before merge.`;
  }

  return `Draft summary for branch \`${branch}\`: ${described.slice(0, -1).join(", ")} and ${described.at(-1)} updates. Replace with a user-facing summary before merge.`;
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

export function buildPrBody() {
  const branch =
    process.env.POCKETCURB_BRANCH ||
    tryRunGit(["branch", "--show-current"]) ||
    tryRunGit(["rev-parse", "--abbrev-ref", "HEAD"]) ||
    "unknown-branch";

  const changedFilesFromEnv = process.env.POCKETCURB_CHANGED_FILES
    ?.split(/\r?\n/u)
    .map((file) => file.trim())
    .filter(Boolean);

  const baseRef =
    process.env.POCKETCURB_BASE_REF ||
    (() => {
      try {
        return getComparisonBase();
      } catch {
        return "HEAD";
      }
    })();

  const files = changedFilesFromEnv && changedFilesFromEnv.length > 0
    ? changedFilesFromEnv
    : (() => {
        try {
          return getChangedFilesFromBase(baseRef);
        } catch {
          return [];
        }
      })();
  const tags = inferTags(files);
  const artifacts = collectArtifacts(files);
  const releaseGate = inferReleaseGate(files, tags);
  const codexReviewPrompt = inferCodexReviewPrompt(tags, releaseGate);
  const releaseChecklistLine = releaseGateChecklistEvidenceLine(releaseGate);

  return [
    "## Summary",
    "",
    inferSummary(branch, tags),
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
