export type SupabaseJwtVerificationConfig = {
  issuer: string;
  jwksUrl: URL;
};

function readOptionalFunctionEnv(name: string): string | null {
  return Deno.env.get(name)?.trim() || null;
}

export function readRequiredFunctionEnv(name: string): string {
  const value = readOptionalFunctionEnv(name);
  if (!value) {
    throw new Error(`Missing required function env: ${name}`);
  }
  return value;
}

export function readSupabaseJwtVerificationConfig(): SupabaseJwtVerificationConfig {
  const supabaseUrl = readRequiredFunctionEnv("SUPABASE_URL");
  const issuer = readOptionalFunctionEnv("SB_JWT_ISSUER") ?? new URL("/auth/v1", `${supabaseUrl}/`).toString().replace(/\/$/, "");
  // Supabase documents JWT signing keys at /auth/v1/.well-known/jwks.json for Edge Functions.
  const jwksUrl = new URL("/auth/v1/.well-known/jwks.json", `${supabaseUrl}/`);

  return {
    issuer,
    jwksUrl
  };
}
