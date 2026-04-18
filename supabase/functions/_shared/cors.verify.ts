import {
  buildCorsHeaders,
  handleCorsPreflight,
  isAllowedCorsOrigin,
} from "./cors.ts";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function verifyDefaultAllowedOrigin(): void {
  assert(isAllowedCorsOrigin("https://gama.money"), "Expected production origin to be allowed");
  assert(!isAllowedCorsOrigin("https://www.gama.money"), "Expected non-canonical www origin to be rejected");
}

function verifyLoopbackAllowedForLocalRuntime(): void {
  const request = new Request("http://127.0.0.1:54321/functions/v1/safe-to-spend");

  assert(isAllowedCorsOrigin("http://localhost:54321", request), "Expected localhost origin to be allowed locally");
  assert(isAllowedCorsOrigin("http://127.0.0.1:3000", request), "Expected loopback origin to be allowed locally");
}

function verifyLoopbackRejectedForNonLocalRuntime(): void {
  const request = new Request("https://project.supabase.co/functions/v1/safe-to-spend");

  assert(
    !isAllowedCorsOrigin("http://localhost:54321", request),
    "Expected localhost origin to be rejected for non-local runtimes",
  );
}

function verifyDisallowedOriginRejected(): void {
  assert(!isAllowedCorsOrigin("https://malicious.example"), "Expected unrelated origin to be rejected");
}

function verifyResponseHeadersReflectAllowedOrigin(): void {
  const headers = buildCorsHeaders(
    new Request("https://gama.test/function", {
      headers: { origin: "https://gama.money" },
    }),
  );

  assert(
    headers["access-control-allow-origin"] === "https://gama.money",
    "Expected allowed origin to be reflected in response headers",
  );
}

async function verifyPreflightRejectsDisallowedOrigin(): Promise<void> {
  const response = handleCorsPreflight(
    new Request("https://gama.test/function", {
      method: "OPTIONS",
      headers: { origin: "https://malicious.example" },
    }),
  );

  assert(response instanceof Response, "Expected preflight helper to return a response");
  assert(response.status === 403, `Expected 403 for disallowed origin, received ${response.status}`);
}

async function verifyPreflightRejectsLoopbackOriginForNonLocalRuntime(): Promise<void> {
  const response = handleCorsPreflight(
    new Request("https://project.supabase.co/functions/v1/safe-to-spend", {
      method: "OPTIONS",
      headers: { origin: "http://localhost:54321" },
    }),
  );

  assert(response instanceof Response, "Expected loopback preflight helper to return a response");
  assert(response.status === 403, `Expected 403 for non-local loopback origin, received ${response.status}`);
}

async function main(): Promise<void> {
  verifyDefaultAllowedOrigin();
  verifyLoopbackAllowedForLocalRuntime();
  verifyLoopbackRejectedForNonLocalRuntime();
  verifyDisallowedOriginRejected();
  verifyResponseHeadersReflectAllowedOrigin();
  await verifyPreflightRejectsDisallowedOrigin();
  await verifyPreflightRejectsLoopbackOriginForNonLocalRuntime();
}

if (import.meta.main) {
  await main();
}
