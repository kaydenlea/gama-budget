import { buildCorsHeaders } from "./cors.ts";

export function jsonResponse(payload: unknown, status = 200, request?: Request) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      ...buildCorsHeaders(request),
      "cache-control": "no-store"
    }
  });
}

export function methodNotAllowedResponse(request?: Request) {
  return jsonResponse({ error: "Method not allowed" }, 405, request);
}

export function tooManyRequestsResponse(request?: Request) {
  return jsonResponse({ error: "Rate limited" }, 429, request);
}

export function userSafeServerErrorResponse(request?: Request) {
  return jsonResponse({ error: "Request could not be completed" }, 500, request);
}
