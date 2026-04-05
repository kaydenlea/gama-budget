import fs from "node:fs";
import path from "node:path";
import { assert, parseJson, repoRoot } from "./common.mjs";

function readJsonAbsolute(absolutePath) {
  return JSON.parse(fs.readFileSync(absolutePath, "utf8"));
}

function ensureFiles(relativePaths) {
  for (const relativePath of relativePaths) {
    const absolutePath = path.join(repoRoot, relativePath);
    assert(fs.existsSync(absolutePath), `Missing required framework baseline file: ${relativePath}`);
  }
}

function assertDepVersion(deps, name, expected, lane) {
  assert(deps[name] === expected, `${lane} dependency ${name} should be ${expected} but is ${deps[name] ?? "missing"}`);
}

function checkMobile() {
  ensureFiles([
    "apps/mobile/app.config.ts",
    "apps/mobile/app/_layout.tsx",
    "apps/mobile/babel.config.js",
    "apps/mobile/metro.config.js",
    "apps/mobile/global.css",
    "apps/mobile/nativewind-env.d.ts",
    "apps/mobile/tailwind.config.js",
    "apps/mobile/tsconfig.json"
  ]);

  const mobilePackage = parseJson("apps/mobile/package.json");
  const mobileTsconfig = parseJson("apps/mobile/tsconfig.json");
  const expoPackage = readJsonAbsolute(path.join(repoRoot, "apps/mobile/node_modules/expo/package.json"));
  const expoBundledModules = readJsonAbsolute(path.join(repoRoot, "apps/mobile/node_modules/expo/bundledNativeModules.json"));
  const babelPresetExpo = readJsonAbsolute(path.join(repoRoot, "apps/mobile/node_modules/babel-preset-expo/package.json"));
  const jestExpo = readJsonAbsolute(path.join(repoRoot, "apps/mobile/node_modules/jest-expo/package.json"));
  const deps = mobilePackage.dependencies ?? {};
  const devDeps = mobilePackage.devDependencies ?? {};

  assert(mobilePackage.main === "expo-router/entry", "apps/mobile/package.json must use expo-router/entry as the app entry.");
  assert(
    mobileTsconfig.extends === "expo/tsconfig.base",
    "apps/mobile/tsconfig.json must extend expo/tsconfig.base to stay aligned with Expo's official baseline.",
  );

  assertDepVersion(deps, "expo", `~${expoPackage.version}`, "mobile");
  assertDepVersion(deps, "expo-router", expoBundledModules["expo-router"], "mobile");
  assertDepVersion(deps, "expo-constants", expoBundledModules["expo-constants"], "mobile");
  assertDepVersion(deps, "expo-linking", expoBundledModules["expo-linking"], "mobile");
  assertDepVersion(deps, "expo-secure-store", expoBundledModules["expo-secure-store"], "mobile");
  assertDepVersion(deps, "expo-status-bar", expoBundledModules["expo-status-bar"], "mobile");
  assertDepVersion(deps, "expo-device", expoBundledModules["expo-device"], "mobile");
  assertDepVersion(deps, "expo-application", expoBundledModules["expo-application"], "mobile");
  assertDepVersion(deps, "react", expoBundledModules.react, "mobile");
  assertDepVersion(deps, "react-dom", expoBundledModules["react-dom"], "mobile");
  assertDepVersion(deps, "react-native", expoBundledModules["react-native"], "mobile");
  assertDepVersion(deps, "react-native-web", expoBundledModules["react-native-web"], "mobile");
  assertDepVersion(deps, "react-native-gesture-handler", expoBundledModules["react-native-gesture-handler"], "mobile");
  assertDepVersion(deps, "react-native-reanimated", expoBundledModules["react-native-reanimated"], "mobile");
  assertDepVersion(deps, "react-native-screens", expoBundledModules["react-native-screens"], "mobile");
  assertDepVersion(deps, "react-native-safe-area-context", expoBundledModules["react-native-safe-area-context"], "mobile");
  assertDepVersion(deps, "react-native-svg", expoBundledModules["react-native-svg"], "mobile");
  assertDepVersion(deps, "sentry-expo", expoBundledModules["sentry-expo"], "mobile");
  assertDepVersion(devDeps, "babel-preset-expo", `~${babelPresetExpo.version}`, "mobile");
  assertDepVersion(devDeps, "jest-expo", `~${jestExpo.version}`, "mobile");

  const babelConfig = fs.readFileSync(path.join(repoRoot, "apps/mobile/babel.config.js"), "utf8");
  assert(babelConfig.includes("babel-preset-expo"), "apps/mobile/babel.config.js must use babel-preset-expo.");
  assert(babelConfig.includes("nativewind/babel"), "apps/mobile/babel.config.js must include nativewind/babel.");
  assert(babelConfig.includes("react-native-reanimated/plugin"), "apps/mobile/babel.config.js must include the Reanimated Babel plugin.");
}

function checkWeb() {
  ensureFiles([
    "apps/web/app/layout.tsx",
    "apps/web/app/page.tsx",
    "apps/web/app/waitlist/page.tsx",
    "apps/web/app/globals.css",
    "apps/web/next-env.d.ts",
    "apps/web/next.config.mjs",
    "apps/web/postcss.config.mjs",
    "apps/web/tsconfig.json"
  ]);

  const webPackage = parseJson("apps/web/package.json");
  const nextPackage = readJsonAbsolute(path.join(repoRoot, "apps/web/node_modules/next/package.json"));
  const reactPackage = readJsonAbsolute(path.join(repoRoot, "apps/web/node_modules/react/package.json"));
  const reactDomPackage = readJsonAbsolute(path.join(repoRoot, "apps/web/node_modules/react-dom/package.json"));
  const tailwindPackage = readJsonAbsolute(path.join(repoRoot, "apps/web/node_modules/tailwindcss/package.json"));
  const postcssPackage = readJsonAbsolute(path.join(repoRoot, "apps/web/node_modules/postcss/package.json"));
  const tailwindPostcssPackage = readJsonAbsolute(path.join(repoRoot, "apps/web/node_modules/@tailwindcss/postcss/package.json"));
  const deps = webPackage.dependencies ?? {};
  const devDeps = webPackage.devDependencies ?? {};

  assertDepVersion(deps, "next", nextPackage.version, "web");
  assertDepVersion(deps, "react", reactPackage.version, "web");
  assertDepVersion(deps, "react-dom", reactDomPackage.version, "web");
  assertDepVersion(devDeps, "tailwindcss", tailwindPackage.version, "web");
  assertDepVersion(devDeps, "postcss", postcssPackage.version, "web");
  assertDepVersion(devDeps, "@tailwindcss/postcss", `^${tailwindPostcssPackage.version}`, "web");

  const globalsCss = fs.readFileSync(path.join(repoRoot, "apps/web/app/globals.css"), "utf8");
  assert(globalsCss.includes('@import "tailwindcss";'), 'apps/web/app/globals.css must import "tailwindcss".');

  const postcssConfig = fs.readFileSync(path.join(repoRoot, "apps/web/postcss.config.mjs"), "utf8");
  assert(postcssConfig.includes('"@tailwindcss/postcss"'), "apps/web/postcss.config.mjs must use @tailwindcss/postcss.");

  const nextConfig = fs.readFileSync(path.join(repoRoot, "apps/web/next.config.mjs"), "utf8");
  assert(nextConfig.includes("typedRoutes: true"), "apps/web/next.config.mjs must enable typedRoutes.");
}

const lane = process.argv[2];

if (!lane || lane === "all") {
  checkMobile();
  checkWeb();
} else if (lane === "mobile") {
  checkMobile();
} else if (lane === "web") {
  checkWeb();
} else {
  throw new Error(`Unknown framework baseline check target: ${lane}`);
}
