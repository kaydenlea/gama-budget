import process from "node:process";
import crypto from "node:crypto";
import { getCurrentBranch, writePocketcurbArtifact } from "./git-helpers.mjs";

function printHelp() {
  console.log(
    [
      "Usage: node ./scripts/review-evidence.mjs [options]",
      "",
      "Required options:",
      "  --verification-summary <text>",
      "  --verification-command <text>    Repeat for each command or proof item",
      "  --independent-review-method <text>",
      "  --independent-review-summary <text>",
      "",
      "Optional options:",
      "  --independent-review-status <completed|pending>",
      "  --human-review-status <pending|completed>",
      "  --human-review-notes <text>",
      "  --residual-risk <text>",
      "  --changed-file <path>            Repeat to bind evidence to the current changed-file set",
      "  --branch <name>",
      "  --help",
      "",
      "Example:",
      '  node ./scripts/review-evidence.mjs --verification-command "node ./scripts/verify.mjs" --verification-summary "Full proof passed after auth fix." --independent-review-method "fresh-context same-tool Codex fallback" --independent-review-summary "Two findings found and resolved." --human-review-status pending --residual-risk "Rate-limit blocker remains prep-only."',
    ].join("\n"),
  );
}

function fail(message) {
  console.error(message);
  process.exit(1);
}

function parseArgs(argv) {
  const repeatedKeys = new Set(["verification-command", "changed-file"]);
  const options = new Map();

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--help") {
      options.set("help", true);
      continue;
    }

    if (!arg.startsWith("--")) {
      fail(`Unexpected argument: ${arg}`);
    }

    const key = arg.slice(2);
    const value = argv[index + 1];

    if (!value || value.startsWith("--")) {
      fail(`Missing value for --${key}`);
    }

    if (repeatedKeys.has(key)) {
      const existing = options.get(key) ?? [];
      existing.push(value.trim());
      options.set(key, existing);
    } else {
      options.set(key, value.trim());
    }

    index += 1;
  }

  return options;
}

function computeChangedFilesFingerprint(files) {
  const normalized = files
    .filter((value) => typeof value === "string")
    .map((value) => value.trim())
    .filter(Boolean)
    .sort();

  return crypto.createHash("sha256").update(normalized.join("\n"), "utf8").digest("hex");
}

const options = parseArgs(process.argv.slice(2));

if (options.get("help")) {
  printHelp();
  process.exit(0);
}

const branch = options.get("branch") || getCurrentBranch();
const verificationCommands = (options.get("verification-command") ?? []).filter(Boolean);
const verificationSummary = options.get("verification-summary") ?? "";
const independentReviewMethod = options.get("independent-review-method") ?? "";
const independentReviewSummary = options.get("independent-review-summary") ?? "";
const independentReviewStatus = options.get("independent-review-status") ?? "completed";
const humanReviewStatus = options.get("human-review-status") ?? "pending";
const humanReviewNotes = options.get("human-review-notes") ?? "";
const residualRisk = options.get("residual-risk") ?? "";
const changedFiles = (options.get("changed-file") ?? []).filter(Boolean);

if (verificationCommands.length === 0) {
  fail("At least one --verification-command is required.");
}

if (!verificationSummary) {
  fail("--verification-summary is required.");
}

if (!independentReviewMethod) {
  fail("--independent-review-method is required.");
}

if (!independentReviewSummary) {
  fail("--independent-review-summary is required.");
}

if (!["completed", "pending"].includes(independentReviewStatus)) {
  fail('--independent-review-status must be "completed" or "pending".');
}

if (!["pending", "completed"].includes(humanReviewStatus)) {
  fail('--human-review-status must be "pending" or "completed".');
}

const artifact = {
  recordedAt: new Date().toISOString(),
  branch,
  changedFiles,
  changedFilesFingerprint: computeChangedFilesFingerprint(changedFiles),
  verification: {
    commands: verificationCommands,
    summary: verificationSummary,
    residualRisk: residualRisk || "none recorded"
  },
  independentReview: {
    status: independentReviewStatus,
    method: independentReviewMethod,
    summary: independentReviewSummary
  },
  humanReview: {
    status: humanReviewStatus,
    notes: humanReviewNotes || (humanReviewStatus === "completed" ? "completed" : "pending before merge")
  }
};

const artifactPath = writePocketcurbArtifact("review-evidence.json", `${JSON.stringify(artifact, null, 2)}\n`);
console.log(`Review evidence recorded: ${artifactPath}`);
