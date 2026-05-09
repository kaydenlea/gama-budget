import fs from "node:fs";
import process from "node:process";
import { resolveRepoPath } from "./common.mjs";

const required = ["SUPABASE_URL", "SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY"];
const optional = ["RESEND_API_KEY", "WAITLIST_FROM_EMAIL", "WAITLIST_NOTIFY_EMAIL"];

function readFlag(name) {
  return process.argv.includes(name);
}

function readRequiredEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing ${name}. Pass it as an environment variable when running this script.`);
  }
  return value;
}

function readOptionalEnv(name, fallback = "") {
  return process.env[name]?.trim() || fallback;
}

function writeEnvFile(relativePath, content, force) {
  const absolutePath = resolveRepoPath(relativePath);
  if (fs.existsSync(absolutePath) && !force) {
    throw new Error(`${relativePath} already exists. Re-run with --force if you want to overwrite it.`);
  }

  fs.writeFileSync(absolutePath, content);
  console.log(`Wrote ${relativePath}`);
}

function formatEnvValue(value) {
  if (!/[#\s"'<>]/u.test(value)) {
    return value;
  }

  return `"${value.replaceAll("\\", "\\\\").replaceAll('"', '\\"')}"`;
}

function buildWebEnv(values) {
  return `# Local web env for the Gama web lane using the Gama Supabase project.
NEXT_PUBLIC_SITE_URL=http://localhost:3000
GAMA_DISABLE_INDEXING=true

SUPABASE_URL=${formatEnvValue(values.SUPABASE_URL)}
SUPABASE_SERVICE_ROLE_KEY=${formatEnvValue(values.SUPABASE_SERVICE_ROLE_KEY)}
RESEND_API_KEY=${formatEnvValue(values.RESEND_API_KEY)}
WAITLIST_FROM_EMAIL=${formatEnvValue(values.WAITLIST_FROM_EMAIL)}
WAITLIST_NOTIFY_EMAIL=${formatEnvValue(values.WAITLIST_NOTIFY_EMAIL)}
`;
}

function buildMobileEnv(values) {
  return `# Local Expo env for the Gama mobile app using the Gama Supabase project.
EXPO_PUBLIC_SUPABASE_URL=${formatEnvValue(values.SUPABASE_URL)}
EXPO_PUBLIC_SUPABASE_ANON_KEY=${formatEnvValue(values.SUPABASE_ANON_KEY)}
EXPO_PUBLIC_SENTRY_DSN=
EXPO_PUBLIC_POSTHOG_KEY=
EXPO_PUBLIC_REVENUECAT_APPLE_API_KEY=
EXPO_PUBLIC_REVENUECAT_GOOGLE_API_KEY=
`;
}

try {
  const force = readFlag("--force");
  const values = Object.fromEntries(required.map((name) => [name, readRequiredEnv(name)]));

  for (const name of optional) {
    values[name] = readOptionalEnv(name, name === "WAITLIST_FROM_EMAIL" ? "Gama <waitlist@example.test>" : "");
  }

  writeEnvFile("apps/web/.env.local", buildWebEnv(values), force);
  writeEnvFile("apps/mobile/.env.local", buildMobileEnv(values), force);

  console.log("\nGama Supabase env setup complete.");
  console.log("These files are git-ignored and should not be committed.");
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  console.error("\nRequired env:");
  for (const name of required) {
    console.error(`- ${name}`);
  }
  console.error("\nOptional env:");
  for (const name of optional) {
    console.error(`- ${name}`);
  }
  process.exit(1);
}
