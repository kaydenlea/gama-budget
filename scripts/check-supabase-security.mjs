import path from "node:path";
import { listFiles, readFile, runCheck, assert } from "./common.mjs";

const migrationFiles = listFiles("supabase/migrations", (file) => {
  const base = path.basename(file.replaceAll("\\", "/"));
  return file.endsWith(".sql") && !base.startsWith("_template.");
});

function normalizeSql(content) {
  return content.replace(/\r/g, "");
}

function extractPublicTables(sql) {
  const matches = [...sql.matchAll(/create\s+table\s+(?:if\s+not\s+exists\s+)?public\.([a-z0-9_]+)/gi)];
  return matches.map((match) => match[1]);
}

runCheck("supabase-no-disable-rls", () => {
  for (const file of migrationFiles) {
    const sql = normalizeSql(readFile(file));
    assert(!/disable\s+row\s+level\s+security/i.test(sql), `${file} disables row level security`);
  }
});

runCheck("supabase-public-tables-enable-rls", () => {
  for (const file of migrationFiles) {
    const sql = normalizeSql(readFile(file));
    const tables = extractPublicTables(sql);

    for (const table of tables) {
      const enablePattern = new RegExp(`alter\\s+table\\s+public\\.${table}\\s+enable\\s+row\\s+level\\s+security`, "i");
      assert(enablePattern.test(sql), `${file} creates public.${table} without enabling RLS`);
    }
  }
});

runCheck("supabase-public-tables-have-policies", () => {
  for (const file of migrationFiles) {
    const sql = normalizeSql(readFile(file));
    const tables = extractPublicTables(sql);

    for (const table of tables) {
      const policyPattern = new RegExp(`create\\s+policy[\\s\\S]+?on\\s+public\\.${table}\\b`, "i");
      assert(policyPattern.test(sql), `${file} creates public.${table} without an explicit policy`);
    }
  }
});

runCheck("supabase-no-allow-all-policies", () => {
  for (const file of migrationFiles) {
    const sql = normalizeSql(readFile(file));
    assert(!/using\s*\(\s*true\s*\)/i.test(sql), `${file} contains USING (true), which is too broad for this baseline`);
    assert(!/with\s+check\s*\(\s*true\s*\)/i.test(sql), `${file} contains WITH CHECK (true), which is too broad for this baseline`);
  }
});

runCheck("supabase-no-broad-anon-grants", () => {
  for (const file of migrationFiles) {
    const sql = normalizeSql(readFile(file));
    assert(!/grant\s+all(?:\s+privileges)?\s+on\s+table\s+public\.[a-z0-9_]+\s+to\s+anon/i.test(sql), `${file} grants ALL on a public table to anon`);
  }
});

runCheck("supabase-sensitive-functions-require-auth-gate", () => {
  const file = "supabase/functions/safe-to-spend/index.ts";
  const content = readFile(file);

  assert(
    /requireAuthenticatedUser\s*\(/.test(content),
    `${file} must call requireAuthenticatedUser() before privileged scaffold logic`
  );
});

runCheck("supabase-sensitive-functions-require-rate-limit", () => {
  const file = "supabase/functions/safe-to-spend/index.ts";
  const content = readFile(file);

  assert(
    /enforceFunctionRateLimit\s*\(\s*"safe-to-spend"\s*,\s*authenticatedUser\.userId\s*\)/.test(content),
    `${file} must enforce the shared rate-limit helper with the authenticated user context`
  );
});

runCheck("supabase-rate-limit-blocker-remains-explicit", () => {
  const file = "supabase/functions/_shared/rate-limit.ts";
  const content = readFile(file);

  assert(
    /SensitiveFunctionRateLimitNotImplementedError/.test(content),
    `${file} must keep the explicit release-blocker error for sensitive functions until a real limiter is implemented`
  );
  assert(
    /must not proceed until a real rate-limit backend is implemented/i.test(content),
    `${file} must document the sensitive-function rate-limit blocker in code`
  );
});
