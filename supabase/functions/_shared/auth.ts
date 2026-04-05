import * as jose from "jose";
import { readSupabaseJwtVerificationConfig } from "./env.ts";
import { jsonResponse } from "./response.ts";

export class FunctionConfigurationError extends Error {}

export class UnauthorizedFunctionRequestError extends Error {}

export type AuthenticatedUser = {
  accessToken: string;
  userId: string;
  claims: jose.JWTPayload;
};

export type JwtPayloadVerifier = (accessToken: string) => Promise<jose.JWTPayload>;

let supabaseJwtIssuer: string | null = null;
let supabaseJwtKeys: ReturnType<typeof jose.createRemoteJWKSet> | null = null;

type SupabaseJwtVerifier = {
  issuer: string;
  keys: ReturnType<typeof jose.createRemoteJWKSet>;
};

function getSupabaseJwtVerifier(): SupabaseJwtVerifier {
  if (supabaseJwtIssuer && supabaseJwtKeys) {
    return {
      issuer: supabaseJwtIssuer,
      keys: supabaseJwtKeys
    };
  }

  try {
    const { issuer, jwksUrl } = readSupabaseJwtVerificationConfig();
    supabaseJwtIssuer = issuer;
    supabaseJwtKeys = jose.createRemoteJWKSet(jwksUrl);

    return {
      issuer: supabaseJwtIssuer,
      keys: supabaseJwtKeys
    };
  } catch (error) {
    throw new FunctionConfigurationError(error instanceof Error ? error.message : "Missing Supabase JWT verification config");
  }
}

async function verifySupabaseJwt(accessToken: string): Promise<jose.JWTPayload> {
  const { issuer, keys } = getSupabaseJwtVerifier();
  const { payload } = await jose.jwtVerify(accessToken, keys, { issuer });
  return payload;
}

export function readBearerToken(request: Request): string | null {
  const header = request.headers.get("authorization");
  if (!header) {
    return null;
  }

  const [bearer, token] = header.trim().split(/\s+/, 2);
  if (bearer?.toLowerCase() !== "bearer" || !token) {
    return null;
  }

  return token;
}

export function unauthorizedResponse(): Response {
  return jsonResponse({ error: "Unauthorized" }, 401);
}

export async function requireAuthenticatedUser(request: Request): Promise<AuthenticatedUser> {
  return requireAuthenticatedUserWithVerifier(request, verifySupabaseJwt);
}

export async function requireAuthenticatedUserWithVerifier(
  request: Request,
  verifyJwt: JwtPayloadVerifier,
): Promise<AuthenticatedUser> {
  const accessToken = readBearerToken(request);
  if (!accessToken) {
    throw new UnauthorizedFunctionRequestError("Missing or malformed authorization header");
  }

  try {
    const payload = await verifyJwt(accessToken);
    const userId = typeof payload.sub === "string" ? payload.sub.trim() : "";

    if (!userId) {
      throw new UnauthorizedFunctionRequestError("Verified JWT is missing a user subject");
    }

    return {
      accessToken,
      userId,
      claims: payload
    };
  } catch (error) {
    if (error instanceof UnauthorizedFunctionRequestError) {
      throw error;
    }

    if (error instanceof jose.errors.JOSEError) {
      throw new UnauthorizedFunctionRequestError("Invalid or expired JWT");
    }

    throw error;
  }
}
