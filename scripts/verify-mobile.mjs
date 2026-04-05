import { ensureDependenciesInstalled, runCheck, runCommand, runPnpm } from "./common.mjs";

runCheck("mobile-framework-baseline", () => {
  ensureDependenciesInstalled();
  runCommand(process.execPath, ["./scripts/check-framework-baselines.mjs", "mobile"]);
});

runCheck("mobile-lint", () => {
  ensureDependenciesInstalled();
  runPnpm(["exec", "eslint", "apps/mobile", "packages/ui-mobile", "--max-warnings=0"]);
});

runCheck("mobile-typecheck", () => {
  ensureDependenciesInstalled();
  runPnpm(["exec", "tsc", "-p", "packages/ui-mobile/tsconfig.json", "--noEmit"]);
  runPnpm(["exec", "tsc", "-p", "apps/mobile/tsconfig.json", "--noEmit"]);
});

runCheck("mobile-test", () => {
  ensureDependenciesInstalled();
  runPnpm([
    "exec",
    "jest",
    "--config",
    "apps/mobile/jest.config.cjs",
    "--runInBand",
    "--runTestsByPath",
    "apps/mobile/src/features/dashboard/HomeScreen.unit.test.tsx"
  ]);
});
