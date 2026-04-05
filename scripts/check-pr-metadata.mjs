import fs from "node:fs";
import process from "node:process";

function fail(message) {
  console.error(message);
  process.exit(1);
}

const eventPath = process.env.GITHUB_EVENT_PATH;
if (!eventPath || !fs.existsSync(eventPath)) {
  console.log("PR metadata check skipped: GITHUB_EVENT_PATH not available.");
  process.exit(0);
}

const event = JSON.parse(fs.readFileSync(eventPath, "utf8"));
const pullRequest = event.pull_request;

if (!pullRequest) {
  console.log("PR metadata check skipped: event is not a pull_request.");
  process.exit(0);
}

const body = pullRequest.body ?? "";
if (!body.trim()) {
  fail("Pull request body is required and must follow the repository template.");
}

const sections = [
  "Summary",
  "Planning Artifacts",
  "Release Gate",
  "Verification",
  "Docs and Ops",
  "Review"
];

for (const heading of sections) {
  if (!body.includes(`## ${heading}`)) {
    fail(
      [
        `Pull request body is missing required section: ${heading}`,
        "Use .github/pull_request_template.md or generate a compliant draft with pnpm pr:body."
      ].join("\n"),
    );
  }
}

function extractSection(heading) {
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`## ${escaped}\\s*\\n([\\s\\S]*?)(?=\\n## |$)`, "u");
  const match = body.match(pattern);
  return match?.[1]?.trim() ?? "";
}

function ensureMeaningful(sectionName, content, placeholders = []) {
  if (!content.trim()) {
    fail(`Pull request section "${sectionName}" must not be empty.`);
  }

  for (const placeholder of placeholders) {
    if (content.includes(placeholder)) {
      fail(`Pull request section "${sectionName}" still contains placeholder text.`);
    }
  }
}

function ensureLabelHasValue(sectionName, content, label) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`(?:^|\\n)-?\\s*${escaped}\\s*(.+)`, "u");
  const match = content.match(pattern);
  const value = match?.[1]?.trim() ?? "";

  if (!value) {
    fail(`Pull request section "${sectionName}" must include a non-empty value for "${label}".`);
  }
}

const summary = extractSection("Summary");
const planning = extractSection("Planning Artifacts");
const releaseGate = extractSection("Release Gate");
const verification = extractSection("Verification");
const review = extractSection("Review");

ensureMeaningful("Summary", summary, ["Describe the change and the user or operational outcome."]);
ensureMeaningful("Planning Artifacts", planning, ["If any artifact was not required, explain why."]);
ensureMeaningful("Release Gate", releaseGate, [
  "State whether this change is Gate A, Gate B, Gate C, or Gate D."
]);
ensureMeaningful("Verification", verification, [
  "record the commands or proof items you actually ran",
  "summarize what passed, what was skipped, and why",
  "state any residual risk or write none"
]);
ensureMeaningful("Review", review, [
  "state whether this used a second model/tool or a fresh-context same-tool fallback",
  "summarize findings and whether they were resolved"
]);

if (!/Gate [ABCD]\b/u.test(releaseGate)) {
  fail(
    [
      'Pull request "Release Gate" section must state Gate A, Gate B, Gate C, or Gate D.',
      "Add a plain-language description after the gate if helpful, for example: Gate A - routine product and tooling work.",
      "See docs/runbooks/release-gates.md for definitions."
    ].join("\n"),
  );
}

const requiredPlanningLabels = [
  "Product brief:",
  "PRD:",
  "Feature spec or bugfix spec:",
  "Implementation plan:"
];

const missingPlanningLabels = requiredPlanningLabels.filter((label) => !planning.includes(label));

if (missingPlanningLabels.length > 0) {
  fail(
    [
      'Pull request "Planning Artifacts" section must describe the brief, PRD, spec or bugfix spec, and implementation plan state.',
      `Missing planning label(s): ${missingPlanningLabels.join(", ")}`,
      "Use pnpm pr:body to generate the expected structure."
    ].join("\n"),
  );
}

if (/Gate [BCD]\b/u.test(releaseGate) && !releaseGate.includes("docs/runbooks/security-release-checklist.md")) {
  fail("Gate B, Gate C, and Gate D pull requests must link security-release-checklist evidence.");
}

const requiredVerificationLabels = [
  "Commands run:",
  "Verification summary:",
  "Residual risk:"
];

const missingVerificationLabels = requiredVerificationLabels.filter((label) => !verification.includes(label));

if (missingVerificationLabels.length > 0) {
  fail(
    [
      'Pull request "Verification" section must record concrete proof details.',
      `Missing verification label(s): ${missingVerificationLabels.join(", ")}`,
      "Use pnpm pr:body after recording local review evidence with pnpm review:evidence."
    ].join("\n"),
  );
}

for (const label of requiredVerificationLabels) {
  ensureLabelHasValue("Verification", verification, label);
}

const requiredReviewLabels = [
  "Independent review method:",
  "Independent review outcome:",
  "Human review status:"
];

const missingReviewLabels = requiredReviewLabels.filter((label) => !review.includes(label));

if (missingReviewLabels.length > 0) {
  fail(
    [
      'Pull request "Review" section must record concrete review evidence.',
      `Missing review label(s): ${missingReviewLabels.join(", ")}`,
      "Use pnpm pr:body after recording local review evidence with pnpm review:evidence."
    ].join("\n"),
  );
}

for (const label of requiredReviewLabels) {
  ensureLabelHasValue("Review", review, label);
}

console.log("PASS pr-metadata");
