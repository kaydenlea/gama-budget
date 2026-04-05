import process from "node:process";
import { runCommand } from "./common.mjs";

try {
  runCommand(process.execPath, ["./scripts/verify.mjs"]);
  runCommand(process.execPath, ["./scripts/local-review.mjs", "--require-workflow-evidence"]);
  runCommand(process.execPath, ["./scripts/reconcile-docs.mjs"]);
  console.log("Still required before commit or merge:");
  console.log("- review every touched file against the active spec and plan");
  console.log("- run an independent review using a second model/tool or a fresh review-only context when only one tool is available");
  console.log("- debug and iterate on accepted review findings");
  console.log("- rerun proof after those fixes");
  console.log("- complete human review and PR-stage AI review where configured");
  console.log("PR-stage AI review still remains required before merge.");
  console.log("Review-ready checks completed successfully.");
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
