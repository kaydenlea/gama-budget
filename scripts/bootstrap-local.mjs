import process from "node:process";
import fs from "node:fs";
import path from "node:path";
import { commandExists, resolveCommandPath, runCommand, runPnpm } from "./common.mjs";

function runStep(label, command, args) {
  console.log(`\n==> ${label}`);
  runCommand(command, args);
}

function denoAvailable() {
  if (commandExists("deno") || resolveCommandPath("deno")) {
    return true;
  }

  const userProfile = process.env.USERPROFILE;
  if (!userProfile) {
    return false;
  }

  return fs.existsSync(path.join(userProfile, ".deno", "bin", "deno.exe"));
}

try {
  runStep("Install local git hooks", process.execPath, ["./scripts/install-hooks.mjs"]);
  console.log("\n==> Install workspace dependencies");
  runPnpm(["install", "--ignore-scripts", "--config.confirmModulesPurge=false", "--reporter", "append-only"]);
  if (!denoAvailable()) {
    throw new Error(
      [
        "Deno was not found on this machine.",
        "Install Deno before running PocketCurb bootstrap or relying on the full repo verifier.",
        "Supabase Edge Function typechecking is now part of the standard proof path."
      ].join("\n"),
    );
  }
  runStep("Verify repository contract", process.execPath, ["./scripts/verify.mjs"]);

  if (!commandExists("codex")) {
    console.warn("\nWarning: Codex CLI was not found on this machine.");
    console.warn("The repository is still set up and ready for local coding, but Codex pull-request review will not be available from this machine until Codex CLI is installed.");
  } else {
    try {
      runStep("Check Codex readiness", process.execPath, ["./scripts/check-ai-review-readiness.mjs"]);
    } catch {
      console.warn("\nWarning: Codex CLI is installed but not fully ready.");
      console.warn("The repository is still set up and ready for local coding, but Codex pull-request review will not be available until Codex CLI authentication is fixed.");
    }
  }

  console.log("\nPocketCurb local bootstrap completed successfully.");
  console.log("Local commits and pushes will now use the repo hooks.");
} catch (error) {
  console.error(`\nBootstrap failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}
