import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { handleCorsPreflight } from "../_shared/cors.ts";
import {
  FunctionConfigurationError,
  UnauthorizedFunctionRequestError,
  requireAuthenticatedUser,
  unauthorizedResponse
} from "../_shared/auth.ts";
import {
  PlaidApiError,
  postPlaid,
  type PlaidItemGetResponse,
  type PlaidPublicTokenExchangeResponse
} from "../_shared/plaid.ts";
import { jsonResponse, methodNotAllowedResponse, tooManyRequestsResponse, userSafeServerErrorResponse } from "../_shared/response.ts";
import {
  enforceFunctionRateLimit,
  SensitiveFunctionRateLimitNotImplementedError
} from "../_shared/rate-limit.ts";
import { upsertPlaidItem, SupabaseRestError } from "../_shared/supabase-rest.ts";

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
    const rateLimit = await enforceFunctionRateLimit("plaid-exchange-public-token", authenticatedUser.userId);
    if (!rateLimit.allowed) {
      return tooManyRequestsResponse(request);
    }

    const rawPayload = await request.json().catch(() => null);
    const publicToken =
      rawPayload && typeof rawPayload.publicToken === "string" ? rawPayload.publicToken.trim() : "";

    if (!publicToken) {
      return jsonResponse({ error: "Public token is required" }, 400, request);
    }

    const exchange = await postPlaid<PlaidPublicTokenExchangeResponse>("/item/public_token/exchange", {
      public_token: publicToken
    });

    const item = await postPlaid<PlaidItemGetResponse>("/item/get", {
      access_token: exchange.access_token
    });

    await upsertPlaidItem({
      user_id: authenticatedUser.userId,
      plaid_item_id: exchange.item_id,
      access_token: exchange.access_token,
      institution_id: item.item.institution_id ?? null,
      institution_name: null,
      available_products: item.item.available_products ?? [],
      billed_products: item.item.billed_products ?? [],
      products: item.item.products ?? [],
      item_status: item.item.error ? "needs_attention" : "active",
      error_code: item.item.error?.error_code ?? null,
      error_type: item.item.error?.error_type ?? null,
      error_message: item.item.error?.error_message ?? null,
      consent_expires_at: item.item.consent_expiration_time ?? null
    });

    return jsonResponse(
      {
        connected: true,
        itemId: exchange.item_id,
        requestId: exchange.request_id
      },
      200,
      request,
    );
  } catch (error) {
    if (error instanceof UnauthorizedFunctionRequestError) {
      return unauthorizedResponse(request);
    }

    if (error instanceof FunctionConfigurationError) {
      console.error("plaid-exchange-public-token auth misconfiguration", error.message);
      return userSafeServerErrorResponse(request);
    }

    if (error instanceof PlaidApiError) {
      console.error(
        "plaid-exchange-public-token Plaid request failed",
        error.status,
        error.plaidErrorType,
        error.plaidErrorCode,
      );
      return jsonResponse({ error: "Plaid token exchange could not be completed" }, 502, request);
    }

    if (error instanceof SupabaseRestError) {
      console.error("plaid-exchange-public-token Supabase write failed", error.status, error.message);
      return userSafeServerErrorResponse(request);
    }

    if (error instanceof SensitiveFunctionRateLimitNotImplementedError) {
      console.error("plaid-exchange-public-token release blocker", error.message);
      return userSafeServerErrorResponse(request);
    }

    console.error("plaid-exchange-public-token unexpected failure", error);
    return userSafeServerErrorResponse(request);
  }
});
