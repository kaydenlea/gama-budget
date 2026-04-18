import * as jose from "jose";
import {
  requireAuthenticatedUserWithVerifier,
  UnauthorizedFunctionRequestError,
  type JwtPayloadVerifier,
} from "./auth.ts";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

async function expectRejects(
  run: () => Promise<unknown>,
  expectedError: new (message?: string) => Error,
  messageIncludes: string,
): Promise<void> {
  try {
    await run();
  } catch (error) {
    assert(error instanceof expectedError, `Expected ${expectedError.name}, received ${String(error)}`);
    assert(error.message.includes(messageIncludes), `Expected error message to include "${messageIncludes}", received "${error.message}"`);
    return;
  }

  throw new Error(`Expected ${expectedError.name} to be thrown`);
}

async function createJwtVerifier(issuer: string): Promise<{
  verifyJwt: JwtPayloadVerifier;
  signJwt: (claims?: jose.JWTPayload) => Promise<string>;
}> {
  const { privateKey, publicKey } = await jose.generateKeyPair("RS256");

  return {
    verifyJwt: async (accessToken: string) => {
      const { payload } = await jose.jwtVerify(accessToken, publicKey, { issuer });
      return payload;
    },
    signJwt: async (claims: jose.JWTPayload = {}) =>
      await new jose.SignJWT(claims)
        .setProtectedHeader({ alg: "RS256", kid: "test-key" })
        .setIssuer(issuer)
        .setIssuedAt()
        .setExpirationTime("2h")
        .sign(privateKey),
  };
}

async function verifyAcceptedUserJwt(): Promise<void> {
  const issuer = "https://example.supabase.co/auth/v1";
  const { verifyJwt, signJwt } = await createJwtVerifier(issuer);
  const accessToken = await signJwt({ sub: "user-123", role: "authenticated" });

  const authenticatedUser = await requireAuthenticatedUserWithVerifier(
    new Request("https://gama.test/function", {
      headers: { authorization: `Bearer ${accessToken}` },
    }),
    verifyJwt,
  );

  assert(authenticatedUser.userId === "user-123", "Expected authenticated user id to match the JWT subject");
  assert(authenticatedUser.accessToken === accessToken, "Expected authenticated user to retain the original access token");
  assert(authenticatedUser.claims.role === "authenticated", "Expected authenticated user claims to include the verified JWT payload");
}

async function verifyMalformedJwtRejected(): Promise<void> {
  const issuer = "https://example.supabase.co/auth/v1";
  const { verifyJwt } = await createJwtVerifier(issuer);

  await expectRejects(
    () =>
      requireAuthenticatedUserWithVerifier(
        new Request("https://gama.test/function", {
          headers: { authorization: "Bearer not-a-jwt" },
        }),
        verifyJwt,
      ),
    UnauthorizedFunctionRequestError,
    "Invalid or expired JWT",
  );
}

async function verifyNonUserJwtRejected(): Promise<void> {
  const issuer = "https://example.supabase.co/auth/v1";
  const { verifyJwt, signJwt } = await createJwtVerifier(issuer);
  const accessToken = await signJwt({ role: "service_role" });

  await expectRejects(
    () =>
      requireAuthenticatedUserWithVerifier(
        new Request("https://gama.test/function", {
          headers: { authorization: `Bearer ${accessToken}` },
        }),
        verifyJwt,
      ),
    UnauthorizedFunctionRequestError,
    "user subject",
  );
}

async function verifyMalformedBearerHeaderRejected(): Promise<void> {
  const { verifyJwt } = await createJwtVerifier("https://example.supabase.co/auth/v1");

  await expectRejects(
    () =>
      requireAuthenticatedUserWithVerifier(
        new Request("https://gama.test/function", {
          headers: { authorization: "Token abc123" },
        }),
        verifyJwt,
      ),
    UnauthorizedFunctionRequestError,
    "authorization header",
  );
}

async function main(): Promise<void> {
  await verifyAcceptedUserJwt();
  await verifyMalformedJwtRejected();
  await verifyNonUserJwtRejected();
  await verifyMalformedBearerHeaderRejected();
}

if (import.meta.main) {
  await main();
}
