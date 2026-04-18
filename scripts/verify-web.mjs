import { ensureDependenciesInstalled, runCheck, runCommand, runPnpm } from "./common.mjs";

runCheck("web-framework-baseline", () => {
  ensureDependenciesInstalled();
  runCommand(process.execPath, ["./scripts/check-framework-baselines.mjs", "web"]);
});

runCheck("web-lint", () => {
  ensureDependenciesInstalled();
  runPnpm(["exec", "eslint", "apps/web", "packages/ui-web", "--max-warnings=0"]);
});

runCheck("web-typecheck", () => {
  ensureDependenciesInstalled();
  runPnpm(["exec", "tsc", "-p", "packages/ui-web/tsconfig.json", "--noEmit"]);
  runPnpm(["exec", "tsc", "-p", "apps/web/tsconfig.json", "--noEmit"]);
});

runCheck("web-test", () => {
  ensureDependenciesInstalled();
  runPnpm(["exec", "jest", "--config", "jest.config.cjs", "--runInBand", "--testPathPatterns=apps/web"]);
});
