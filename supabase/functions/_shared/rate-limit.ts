import { readRequiredFunctionEnv } from "./env.ts";

export type FunctionRateLimitPolicy = {
  maxRequests: number;
  windowSeconds: number;
};

export class SensitiveFunctionRateLimitNotImplementedError extends Error {}

type RateLimitRpcResponse = {
  allowed: boolean;
  remaining: number;
  reset_at: string;
};

const sensitiveFunctionPolicies = new Map<string, FunctionRateLimitPolicy>([
  ["safe-to-spend", { maxRequests: 30, windowSeconds: 60 }],
  ["event-assignment-suggestions", { maxRequests: 20, windowSeconds: 60 }],
  ["plaid-link-token", { maxRequests: 10, windowSeconds: 60 }],
  ["plaid-exchange-public-token", { maxRequests: 10, windowSeconds: 60 }],
  ["plaid-sync-transactions", { maxRequests: 5, windowSeconds: 60 }],
  ["daily-guidance", { maxRequests: 60, windowSeconds: 60 }],
  ["simulate-transaction", { maxRequests: 60, windowSeconds: 60 }]
]);

export function readSensitiveFunctionRateLimitPolicy(functionName: string): FunctionRateLimitPolicy | null {
  return sensitiveFunctionPolicies.get(functionName) ?? null;
}

function readRateLimitBackendConfig() {
  const supabaseUrl = readRequiredFunctionEnv("SUPABASE_URL");
  const serviceRoleKey = readRequiredFunctionEnv("SUPABASE_SERVICE_ROLE_KEY");

  return {
    rpcUrl: new URL("/rest/v1/rpc/consume_function_rate_limit", `${supabaseUrl}/`).toString(),
    serviceRoleKey
  };
}

export async function enforceFunctionRateLimit(functionName: string, userId: string): Promise<{ allowed: boolean }> {
  const policy = readSensitiveFunctionRateLimitPolicy(functionName);
  if (!policy) {
    return { allowed: true };
  }

  try {
    const { rpcUrl, serviceRoleKey } = readRateLimitBackendConfig();
    const response = await fetch(rpcUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        apikey: serviceRoleKey,
        authorization: `Bearer ${serviceRoleKey}`
      },
      body: JSON.stringify({
        p_function_name: functionName,
        p_user_id: userId,
        p_max_requests: policy.maxRequests,
        p_window_seconds: policy.windowSeconds
      })
    });

    if (!response.ok) {
      const body = await response.text();
      throw new SensitiveFunctionRateLimitNotImplementedError(
        `${functionName} is a sensitive function and must not proceed until a real rate-limit backend is implemented. Backend failure: ${body}`,
      );
    }

    const payload = await response.json().catch(() => null);
    const result = Array.isArray(payload) ? payload[0] : payload;

    if (!result || typeof result.allowed !== "boolean") {
      throw new SensitiveFunctionRateLimitNotImplementedError(
        `${functionName} is a sensitive function and must not proceed until a real rate-limit backend is implemented. Backend response was invalid.`,
      );
    }

    return {
      allowed: (result as RateLimitRpcResponse).allowed
    };
  } catch (error) {
    if (error instanceof SensitiveFunctionRateLimitNotImplementedError) {
      throw error;
    }

    throw new SensitiveFunctionRateLimitNotImplementedError(
      `${functionName} is a sensitive function and must not proceed until a real rate-limit backend is implemented. Backend error: ${
        error instanceof Error ? error.message : "unknown error"
      }`,
    );
  }
}
