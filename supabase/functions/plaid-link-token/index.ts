import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { handleCorsPreflight } from "../_shared/cors.ts";
import {
  FunctionConfigurationError,
  UnauthorizedFunctionRequestError,
  requireAuthenticatedUser,
  unauthorizedResponse
} from "../_shared/auth.ts";
import { PlaidApiError, postPlaid, readPlaidConfig, type PlaidLinkTokenCreateResponse } from "../_shared/plaid.ts";
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
      return methodNotAllowedResponse(request);
    }

    const authenticatedUser = await requireAuthenticatedUser(request);
    const rateLimit = await enforceFunctionRateLimit("plaid-link-token", authenticatedUser.userId);
    if (!rateLimit.allowed) {
      return tooManyRequestsResponse(request);
    }

    const config = readPlaidConfig();
    const payload = await postPlaid<PlaidLinkTokenCreateResponse>("/link/token/create", {
      client_name: config.clientName,
      language: config.language,
      country_codes: config.countryCodes,
      products: config.products,
      user: {
        client_user_id: authenticatedUser.userId
      },
      redirect_uri: config.redirectUri ?? undefined
    });

    return jsonResponse(
      {
        linkToken: payload.link_token,
        expirationISO: payload.expiration,
        requestId: payload.request_id
      },
      200,
      request,
    );
  } catch (error) {
    if (error instanceof UnauthorizedFunctionRequestError) {
      return unauthorizedResponse(request);
    }

    if (error instanceof FunctionConfigurationError) {
      console.error("plaid-link-token auth misconfiguration", error.message);
      return userSafeServerErrorResponse(request);
    }

    if (error instanceof PlaidApiError) {
      console.error("plaid-link-token Plaid request failed", error.status, error.plaidErrorType, error.plaidErrorCode);
      return jsonResponse({ error: "Plaid link token could not be created" }, 502, request);
    }

    if (error instanceof SensitiveFunctionRateLimitNotImplementedError) {
      console.error("plaid-link-token release blocker", error.message);
      return userSafeServerErrorResponse(request);
    }

    console.error("plaid-link-token unexpected failure", error);
    return userSafeServerErrorResponse(request);
  }
});
