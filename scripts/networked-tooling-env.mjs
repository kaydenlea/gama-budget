import process from "node:process";
import { pathToFileURL } from "node:url";

const proxyVariableNames = [
  "HTTP_PROXY",
  "HTTPS_PROXY",
  "ALL_PROXY",
  "GIT_HTTP_PROXY",
  "GIT_HTTPS_PROXY"
];

const networkSensitivePnpmCommands = new Set([
  "add",
  "create",
  "dlx",
  "fetch",
  "import",
  "install",
  "patch",
  "patch-commit",
  "patch-remove",
  "remove",
  "unlink",
  "up",
  "update"
]);

function normalizeBoolean(value) {
  return typeof value === "string" && ["1", "true", "yes", "on"].includes(value.trim().toLowerCase());
}

function describeDeadProxy(name, value) {
  try {
    const parsed = new URL(value);
    const hostname = parsed.hostname.toLowerCase();
    const port = parsed.port || (parsed.protocol === "https:" ? "443" : "80");
    const isLoopback = hostname === "127.0.0.1" || hostname === "localhost" || hostname === "::1";

    if (isLoopback && port === "9") {
      return `${name}=${value} points to a dead loopback endpoint`;
    }
  } catch {
    return `${name}=${value} is not a valid proxy URL`;
  }

  return null;
}

export function getSanitizedNetworkEnv(env = process.env) {
  const sanitizedEnv = { ...env };
  const removed = [];

  for (const name of proxyVariableNames) {
    const value = env[name];
    if (!value) {
      continue;
    }

    if (describeDeadProxy(name, value)) {
      delete sanitizedEnv[name];
      removed.push(`${name}=${value}`);
    }
  }

  if (normalizeBoolean(env.NPM_CONFIG_OFFLINE)) {
    delete sanitizedEnv.NPM_CONFIG_OFFLINE;
    removed.push("NPM_CONFIG_OFFLINE=true");
  }

  return { sanitizedEnv, removed };
}

export function getSuspiciousNetworkEnvironment(args, env = process.env) {
  const command = args[0];

  if (!command || !networkSensitivePnpmCommands.has(command)) {
    return [];
  }

  const issues = [];

  for (const name of proxyVariableNames) {
    const value = env[name];
    if (!value) {
      continue;
    }

    const issue = describeDeadProxy(name, value);
    if (issue) {
      issues.push(issue);
    }
  }

  if (normalizeBoolean(env.NPM_CONFIG_OFFLINE) && !args.includes("--offline")) {
    issues.push("NPM_CONFIG_OFFLINE=true forces pnpm into offline mode for a command that normally expects network access");
  }

  return issues;
}

export function assertSafeNetworkedToolingEnv(args, env = process.env) {
  const issues = getSuspiciousNetworkEnvironment(args, env);

  if (issues.length === 0) {
    return;
  }

  throw new Error(
    [
      "Refusing to run a network-sensitive pnpm command because the machine environment is misconfigured.",
      ...issues.map((issue) => `- ${issue}`),
      "This is a machine-level environment problem, not a PocketCurb repo requirement.",
      "Fix or clear the proxy/offline settings first, or run an explicitly offline command if that is truly intended."
    ].join("\n"),
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = process.argv.slice(2);
  const issues = getSuspiciousNetworkEnvironment(args);

  if (issues.length === 0) {
    console.log("PASS networked-tooling-env");
  } else {
    console.error("FAIL networked-tooling-env");
    for (const issue of issues) {
      console.error(`- ${issue}`);
    }
    const { removed } = getSanitizedNetworkEnv();
    if (removed.length > 0) {
      console.error("Repo-owned pnpm commands will strip these settings automatically, but the machine environment should still be corrected.");
    }
    process.exitCode = 1;
  }
}
