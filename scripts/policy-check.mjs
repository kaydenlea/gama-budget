import fs from "node:fs";
import path from "node:path";
import { listFiles, runCheck, assert, repoRoot } from "./common.mjs";

const codeFilePattern = /\.(cjs|mjs|js|jsx|ts|tsx)$/i;

function readMaybe(file) {
  const absolute = path.join(repoRoot, file);
  if (!fs.existsSync(absolute)) {
    return "";
  }

  return fs.readFileSync(absolute, "utf8");
}

function stripQuotedStrings(content) {
  return content
    .replace(/`(?:\\.|[^`\\])*`/g, "``")
    .replace(/"(?:\\.|[^"\\])*"/g, "\"\"")
    .replace(/'(?:\\.|[^'\\])*'/g, "''");
}

const approvedPublicClientVariables = [
  "EXPO_PUBLIC_SUPABASE_ANON_KEY",
  "EXPO_PUBLIC_POSTHOG_KEY",
  "EXPO_PUBLIC_REVENUECAT_APPLE_API_KEY",
  "EXPO_PUBLIC_REVENUECAT_GOOGLE_API_KEY",
  "NEXT_PUBLIC_POSTHOG_KEY"
];

runCheck("no-dangerous-dynamic-code", () => {
  const files = listFiles(".", (file) => codeFilePattern.test(file) && file !== "scripts/policy-check.mjs");

  for (const file of files) {
    const content = stripQuotedStrings(readMaybe(file));
    assert(!/\beval\s*\(/.test(content), `${file} uses eval()`);
    assert(!/\bnew\s+Function\s*\(/.test(content), `${file} uses new Function()`);
  }
});

runCheck("no-unsafe-html-apis-in-source", () => {
  const files = listFiles(".", (file) => codeFilePattern.test(file));

  for (const file of files) {
    const content = readMaybe(file);
    assert(!/\.innerHTML\s*=/.test(content), `${file} writes to innerHTML`);
  }
});

runCheck("no-client-service-role-exposure", () => {
  const clientFiles = listFiles(".", (file) => {
    return (
      codeFilePattern.test(file) &&
      (file.startsWith("apps/mobile/") ||
        file.startsWith("apps/web/") ||
        file.startsWith("packages/ui-mobile/") ||
        file.startsWith("packages/ui-web/"))
    );
  });

  for (const file of clientFiles) {
    const content = readMaybe(file);
    assert(!/SUPABASE_SERVICE_ROLE|service_role/i.test(content), `${file} references service-role material`);

    const expoMatches = content.match(/EXPO_PUBLIC_[A-Z0-9_]+/g) ?? [];
    const nextMatches = content.match(/NEXT_PUBLIC_[A-Z0-9_]+/g) ?? [];

    for (const variable of [...expoMatches, ...nextMatches]) {
      if (approvedPublicClientVariables.includes(variable)) {
        continue;
      }

      assert(
        !/(SECRET|TOKEN|KEY|SERVICE_ROLE)/i.test(variable),
        `${file} appears to expose a sensitive public client variable: ${variable}`
      );
    }
  }
});

runCheck("no-env-files-committed", () => {
  const allowedLocalEnvFiles = new Set([
    "apps/mobile/.env",
    "apps/web/.env.local",
    "supabase/functions/.env.local"
  ]);

  const envFiles = listFiles(".", (file) => {
    const basename = path.basename(file.replaceAll("\\", "/"));
    const normalizedFile = file.replaceAll("\\", "/");
    if (allowedLocalEnvFiles.has(normalizedFile)) {
      return false;
    }

    return basename === ".env" || (/^\.env\./.test(basename) && basename !== ".env.example");
  });

  assert(
    envFiles.length === 0,
    `Disallowed env file(s) detected outside approved local paths: ${envFiles.join(", ")}`
  );
});

runCheck("no-raw-backend-errors-leaked-from-mobile-client", () => {
  const file = "apps/mobile/src/lib/api/client.ts";
  const content = readMaybe(file);
  assert(!/throw error\s*;/.test(content), `${file} must map backend errors to user-safe client errors`);
});
