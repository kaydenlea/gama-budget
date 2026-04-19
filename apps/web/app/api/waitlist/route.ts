import {
  readWaitlistRuntimeConfig,
  submitWaitlistSignup,
  WaitlistConfigurationError,
  WaitlistEmailError,
  WaitlistStorageError
} from "../../../src/server/waitlist";

export async function POST(request: Request): Promise<Response> {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }

  try {
    const outcome = await submitWaitlistSignup(
      payload,
      {
        userAgent: request.headers.get("user-agent"),
        ipAddress: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null
      },
      readWaitlistRuntimeConfig()
    );

    return Response.json({ status: outcome.status }, { status: 202 });
  } catch (error) {
    if (isZodValidationError(error)) {
      return Response.json({ error: "invalid_waitlist_signup" }, { status: 400 });
    }

    if (error instanceof WaitlistConfigurationError) {
      return Response.json({ error: "waitlist_not_configured" }, { status: 503 });
    }

    if (error instanceof WaitlistStorageError || error instanceof WaitlistEmailError) {
      return Response.json({ error: "waitlist_unavailable" }, { status: 502 });
    }

    return Response.json({ error: "internal_error" }, { status: 500 });
  }
}

function isZodValidationError(error: unknown): boolean {
  return Boolean(error && typeof error === "object" && "name" in error && error.name === "ZodError");
}
