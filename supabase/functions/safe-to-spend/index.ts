import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { handleCorsPreflight } from "../_shared/cors.ts";
import {
  FunctionConfigurationError,
  UnauthorizedFunctionRequestError,
  requireAuthenticatedUser,
  unauthorizedResponse
} from "../_shared/auth.ts";
import {
  jsonResponse,
  methodNotAllowedResponse,
  tooManyRequestsResponse,
  userSafeServerErrorResponse
} from "../_shared/response.ts";
import {
  enforceFunctionRateLimit,
  SensitiveFunctionRateLimitNotImplementedError
} from "../_shared/rate-limit.ts";

Deno.serve(async (request: Request): Promise<Response> => {
  try {
    const preflight = handleCorsPreflight(request);
    if (preflight) {
      return preflight;
    }

    if (request.method !== "POST") {
      return methodNotAllowedResponse();
    }

    const authenticatedUser = await requireAuthenticatedUser(request);

    const rateLimit = await enforceFunctionRateLimit("safe-to-spend", authenticatedUser.userId);
    if (!rateLimit.allowed) {
      return tooManyRequestsResponse();
    }

    return jsonResponse({
      message:
        "Safe-to-Spend Edge Function scaffold ready. Replace this with server-authoritative decision logic once the real schema exists."
    });
  } catch (error) {
    if (error instanceof UnauthorizedFunctionRequestError) {
      return unauthorizedResponse();
    }

    if (error instanceof FunctionConfigurationError) {
      console.error("safe-to-spend auth misconfiguration", error.message);
      return userSafeServerErrorResponse();
    }

    if (error instanceof SensitiveFunctionRateLimitNotImplementedError) {
      console.error("safe-to-spend release blocker", error.message);
      return userSafeServerErrorResponse();
    }

    console.error("safe-to-spend unexpected failure", error);
    return userSafeServerErrorResponse();
  }
});
