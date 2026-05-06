import {
  checkWaitlistRateLimit,
  readWaitlistRuntimeConfig,
  submitWaitlistSignup,
  WaitlistConfigurationError,
  WaitlistStorageError
} from "../../../src/server/waitlist";

const maxWaitlistRequestBodyBytes = 8 * 1024;
const noStoreHeaders = {
  "Cache-Control": "no-store"
} as const;

class WaitlistRequestError extends Error {
  constructor(
    readonly code: string,
    readonly status: number
  ) {
    super(code);
    this.name = "WaitlistRequestError";
  }
}

export async function POST(request: Request): Promise<Response> {
  let payload: unknown;

  try {
    payload = await readWaitlistJsonPayload(request);
  } catch (error) {
    if (error instanceof WaitlistRequestError) {
      return waitlistJson({ error: error.code }, error.status);
    }

    return waitlistJson({ error: "invalid_json" }, 400);
  }

  const ipAddress = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  const rateLimit = checkWaitlistRateLimit({
    email: extractEmailForRateLimit(payload),
    ipAddress
  });

  if (!rateLimit.allowed) {
    return waitlistJson(
      { error: "rate_limited" },
      429,
      {
        "Retry-After": String(rateLimit.retryAfterSeconds)
      }
    );
  }

  try {
    const outcome = await submitWaitlistSignup(
      payload,
      {
        userAgent: request.headers.get("user-agent"),
        ipAddress
      },
      readWaitlistRuntimeConfig()
    );

    return waitlistJson({ status: outcome.status }, 202);
  } catch (error) {
    if (isZodValidationError(error)) {
      return waitlistJson({ error: "invalid_waitlist_signup" }, 400);
    }

    if (error instanceof WaitlistConfigurationError) {
      return waitlistJson({ error: "waitlist_not_configured" }, 503);
    }

    if (error instanceof WaitlistStorageError) {
      return waitlistJson({ error: "waitlist_unavailable" }, 502);
    }

    return waitlistJson({ error: "internal_error" }, 500);
  }
}

async function readWaitlistJsonPayload(request: Request): Promise<unknown> {
  if (!isJsonContentType(request.headers.get("content-type"))) {
    throw new WaitlistRequestError("unsupported_media_type", 415);
  }

  const body = await readRequestBodyTextWithLimit(request, maxWaitlistRequestBodyBytes);

  try {
    return JSON.parse(body) as unknown;
  } catch {
    throw new WaitlistRequestError("invalid_json", 400);
  }
}

async function readRequestBodyTextWithLimit(request: Request, maxBytes: number): Promise<string> {
  if (!request.body) {
    return "";
  }

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    totalBytes += value.byteLength;

    if (totalBytes > maxBytes) {
      await reader.cancel();
      throw new WaitlistRequestError("payload_too_large", 413);
    }

    chunks.push(value);
  }

  const merged = new Uint8Array(totalBytes);
  let offset = 0;

  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return new TextDecoder().decode(merged);
}

function isJsonContentType(contentType: string | null): boolean {
  return contentType?.split(";")[0]?.trim().toLowerCase() === "application/json";
}

function waitlistJson(body: Record<string, unknown>, status: number, headers: Record<string, string> = {}): Response {
  return Response.json(body, {
    status,
    headers: {
      ...noStoreHeaders,
      ...headers
    }
  });
}

function extractEmailForRateLimit(payload: unknown): string | null {
  if (!payload || typeof payload !== "object" || !("email" in payload)) {
    return null;
  }

  const email = payload.email;

  return typeof email === "string" ? email : null;
}

function isZodValidationError(error: unknown): boolean {
  return Boolean(error && typeof error === "object" && "name" in error && error.name === "ZodError");
}
