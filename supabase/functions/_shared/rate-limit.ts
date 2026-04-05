export type FunctionRateLimitPolicy = {
  maxRequests: number;
  windowSeconds: number;
};

export class SensitiveFunctionRateLimitNotImplementedError extends Error {}

const sensitiveFunctionPolicies = new Map<string, FunctionRateLimitPolicy>([
  ["safe-to-spend", { maxRequests: 30, windowSeconds: 60 }],
  ["daily-guidance", { maxRequests: 60, windowSeconds: 60 }],
  ["simulate-transaction", { maxRequests: 60, windowSeconds: 60 }]
]);

export function readSensitiveFunctionRateLimitPolicy(functionName: string): FunctionRateLimitPolicy | null {
  return sensitiveFunctionPolicies.get(functionName) ?? null;
}

export async function enforceFunctionRateLimit(functionName: string, userId: string): Promise<{ allowed: boolean }> {
  const policy = readSensitiveFunctionRateLimitPolicy(functionName);
  if (!policy) {
    return { allowed: true };
  }

  void userId;

  throw new SensitiveFunctionRateLimitNotImplementedError(
    `${functionName} is a sensitive function and must not proceed until a real rate-limit backend is implemented.`,
  );
}
