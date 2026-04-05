import { ensureDependenciesInstalled, runCheck, runPnpm } from "./common.mjs";

runCheck("jest-coverage", () => {
  ensureDependenciesInstalled();
  runPnpm(["exec", "jest", "--config", "jest.config.cjs", "--coverage", "--runInBand"]);
});
