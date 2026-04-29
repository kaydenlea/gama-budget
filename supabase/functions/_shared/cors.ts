// Keep the allowlist limited to the one intended public origin.
// Do not add `www.gamabudget.com` until that host is actually provisioned and the
// redirect/canonical policy is finalized across web, SEO, and edge-function CORS.
const defaultAllowedOrigins = ["https://gamabudget.com"] as const;
const loopbackHostPattern = /^(localhost|127(?:\.\d{1,3}){3}|::1)$/iu;

let cachedAllowedOriginsEnv: string | null | undefined;
let cachedAllowedOrigins: Set<string> | null = null;
let hasWarnedAboutAllowedOriginsEnv = false;

const baseCorsHeaders = {
  "content-type": "application/json",
  "access-control-allow-methods": "POST, OPTIONS",
  "access-control-allow-headers": "authorization, x-client-info, apikey, content-type",
  vary: "Origin"
} as const;

function normalizeOrigin(candidate: string): string | null {
  const trimmed = candidate.trim();
  if (!trimmed) {
    return null;
  }

  try {
    const url = new URL(trimmed);
    if (!/^https?:$/iu.test(url.protocol)) {
      return null;
    }

    return url.origin;
  } catch {
    return null;
  }
}

function isLoopbackHost(candidate: string): boolean {
  return loopbackHostPattern.test(candidate.replace(/^\[(.*)\]$/u, "$1"));
}

function isLoopbackOrigin(origin: string): boolean {
  try {
    const url = new URL(origin);
    return isLoopbackHost(url.hostname);
  } catch {
    return false;
  }
}

function isLoopbackRuntime(request: Request): boolean {
  try {
    const url = new URL(request.url);
    return isLoopbackHost(url.hostname);
  } catch {
    return false;
  }
}

function isEnvPermissionError(error: unknown): boolean {
  return error instanceof Deno.errors.PermissionDenied || (error instanceof Error && error.name === "NotCapable");
}

function readRequestOrigin(request: Request): string | null {
  const origin = request.headers.get("origin");
  return origin ? normalizeOrigin(origin) : null;
}

function readAllowedOriginsEnv(): string | null {
  try {
    return Deno.env.get("ALLOWED_ORIGINS") ?? null;
  } catch (error) {
    if (!hasWarnedAboutAllowedOriginsEnv && !isEnvPermissionError(error)) {
      console.warn("ALLOWED_ORIGINS could not be read; using default CORS origins only.");
      hasWarnedAboutAllowedOriginsEnv = true;
    }

    return null;
  }
}

function readAllowedOrigins(): Set<string> {
  const configuredOriginsEnv = readAllowedOriginsEnv();

  if (cachedAllowedOrigins && cachedAllowedOriginsEnv === configuredOriginsEnv) {
    return cachedAllowedOrigins;
  }

  const configuredOrigins = configuredOriginsEnv
    ?.split(",")
    .map((origin) => normalizeOrigin(origin))
    .filter((origin): origin is string => Boolean(origin)) ?? [];

  cachedAllowedOriginsEnv = configuredOriginsEnv;
  cachedAllowedOrigins = new Set([...defaultAllowedOrigins, ...configuredOrigins]);

  return cachedAllowedOrigins;
}

export function isAllowedCorsOrigin(origin: string, request?: Request): boolean {
  if (readAllowedOrigins().has(origin)) {
    return true;
  }

  // Only allow loopback browser origins when the function runtime is also local.
  return request != null && isLoopbackOrigin(origin) && isLoopbackRuntime(request);
}

export function buildCorsHeaders(request?: Request): Record<string, string> {
  if (!request) {
    return { ...baseCorsHeaders };
  }

  const origin = readRequestOrigin(request);
  if (!origin || !isAllowedCorsOrigin(origin, request)) {
    return { ...baseCorsHeaders };
  }

  return {
    ...baseCorsHeaders,
    "access-control-allow-origin": origin
  };
}

export function handleCorsPreflight(request: Request) {
  if (request.method !== "OPTIONS") {
    return null;
  }

  const origin = readRequestOrigin(request);
  if (!origin || !isAllowedCorsOrigin(origin, request)) {
    return new Response(JSON.stringify({ error: "CORS origin not allowed" }), {
      status: 403,
      headers: {
        ...baseCorsHeaders,
        "cache-control": "no-store"
      }
    });
  }

  return new Response("ok", {
    headers: buildCorsHeaders(request)
  });
}
