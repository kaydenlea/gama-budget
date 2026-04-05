import process from "node:process";
import { assert, fileExists, runPnpm, toolchainLinksAvailable } from "./common.mjs";

function ensureMobileDependenciesLinked() {
  assert(
    toolchainLinksAvailable(),
    [
      "Workspace binaries are not linked yet, so Expo cannot start from this checkout.",
      "Run node ./scripts/bootstrap-local.mjs or node ./scripts/pnpm.mjs install --ignore-scripts --config.confirmModulesPurge=false first.",
      "Prefer this repo-owned entrypoint over raw npx expo start on Windows and flaky machines."
    ].join("\n"),
  );

  assert(
    fileExists("apps/mobile/node_modules/expo/package.json"),
    [
      "apps/mobile does not have a linked Expo dependency yet.",
      "The pnpm store may exist, but the workspace install has not completed wiring local package links.",
      "Finish the repo-owned bootstrap or pnpm install before starting the mobile app."
    ].join("\n"),
  );
}

try {
  ensureMobileDependenciesLinked();
  runPnpm(["--dir", "apps/mobile", "exec", "expo", "start", ...process.argv.slice(2)]);
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
