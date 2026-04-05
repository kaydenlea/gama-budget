import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { assert, listFiles, resolveCommandPath, runCheck, runCommand } from "./common.mjs";

function resolveDenoCommand() {
  const resolved = resolveCommandPath("deno");
  if (resolved) {
    return resolved;
  }

  const userProfile = process.env.USERPROFILE;
  if (!userProfile) {
    return null;
  }

  const installed = path.join(userProfile, ".deno", "bin", "deno.exe");
  return fs.existsSync(installed) ? installed : null;
}

runCheck("supabase-functions-deno-check", () => {
  const deno = resolveDenoCommand();
  assert(
    deno,
    [
      "Deno is required to verify Supabase Edge Function files in their official runtime.",
      "Install Deno, then rerun node ./scripts/verify.mjs.",
      "The Supabase function lane is now part of the standard proof set and should not rely on editor-only fallback checks."
    ].join("\n"),
  );

  const workspaceConfigPath = "supabase/functions/deno.json";
  const functionTsFiles = listFiles(
    "supabase/functions",
    (relativePath) => relativePath.endsWith(".ts"),
  ).sort();
  const functionVerificationFiles = functionTsFiles.filter((relativePath) => /\.verify\.ts$/u.test(relativePath));

  assert(
    functionTsFiles.length > 0,
    "Expected at least one Supabase Edge Function TypeScript file under supabase/functions.",
  );

  runCommand(deno, ["check", "--config", workspaceConfigPath, ...functionTsFiles]);

  for (const verificationFile of functionVerificationFiles) {
    runCommand(deno, ["run", "--config", workspaceConfigPath, verificationFile]);
  }

  const functionEntrypoints = functionTsFiles.filter((relativePath) =>
    /^supabase\/functions\/[^/_][^/]*\/index\.ts$/u.test(relativePath)
  );

  assert(
    functionEntrypoints.length > 0,
    "Expected at least one Supabase Edge Function entrypoint under supabase/functions/*/index.ts.",
  );

  for (const entrypoint of functionEntrypoints) {
    const functionDirectory = path.posix.dirname(entrypoint);
    const functionConfigPath = `${functionDirectory}/deno.json`;

    assert(
      fs.existsSync(functionConfigPath),
      `Missing function-local Deno config for ${entrypoint}: expected ${functionConfigPath}`,
    );

    runCommand(deno, ["check", "--config", functionConfigPath, entrypoint]);
  }
});
