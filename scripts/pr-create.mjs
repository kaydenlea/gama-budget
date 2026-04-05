import process from "node:process";
import { commandExists, runCommand } from "./common.mjs";
import { buildPrBody } from "./pr-body.mjs";
import { writePocketcurbArtifact } from "./git-helpers.mjs";

if (!commandExists("gh")) {
  console.error("GitHub CLI (gh) is not installed on this machine.");
  console.error("Install gh, then run node ./scripts/pr-create.mjs --title \"...\" or use pnpm pr:body and paste the result into the PR manually.");
  process.exit(1);
}

const body = buildPrBody();
const artifactPath = writePocketcurbArtifact("pr-body.md", `${body}\n`);

try {
  runCommand("gh", ["pr", "create", "--body-file", artifactPath, ...process.argv.slice(2)]);
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  console.error(`The generated PR body is available at ${artifactPath}`);
  process.exit(1);
}
