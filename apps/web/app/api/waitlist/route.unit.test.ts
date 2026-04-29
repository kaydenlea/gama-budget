import { POST } from "./route";
import {
  checkWaitlistRateLimit,
  readWaitlistRuntimeConfig,
  submitWaitlistSignup,
  WaitlistConfigurationError,
  WaitlistStorageError
} from "../../../src/server/waitlist";

jest.mock("../../../src/server/waitlist", () => {
  class MockWaitlistConfigurationError extends Error {}
  class MockWaitlistStorageError extends Error {}

  return {
    checkWaitlistRateLimit: jest.fn(),
    readWaitlistRuntimeConfig: jest.fn(),
    submitWaitlistSignup: jest.fn(),
    WaitlistConfigurationError: MockWaitlistConfigurationError,
    WaitlistStorageError: MockWaitlistStorageError
  };
});

const mockedCheckWaitlistRateLimit = jest.mocked(checkWaitlistRateLimit);
const mockedReadWaitlistRuntimeConfig = jest.mocked(readWaitlistRuntimeConfig);
const mockedSubmitWaitlistSignup = jest.mocked(submitWaitlistSignup);

function createWaitlistRequest(body: string, headers: HeadersInit = {}) {
  return new Request("https://gamabudget.com/api/waitlist", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...headers
    },
    body
  });
}

async function readJson(response: Response) {
  return (await response.json()) as Record<string, unknown>;
}

describe("POST /api/waitlist", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedCheckWaitlistRateLimit.mockReturnValue({ allowed: true });
    mockedReadWaitlistRuntimeConfig.mockReturnValue({
      supabaseUrl: "https://project.supabase.co",
      supabaseServiceRoleKey: "service-role-key",
      resendApiKey: "resend-key",
      waitlistFromEmail: "Gama <waitlist@gamabudget.com>",
      waitlistNotifyEmail: "team@gamabudget.com"
    });
    mockedSubmitWaitlistSignup.mockResolvedValue({ status: "accepted" });
  });

  it("accepts valid JSON submissions with non-cacheable responses", async () => {
    const request = createWaitlistRequest(
      JSON.stringify({
        email: "user@example.com",
        marketingConsent: true
      }),
      {
        "x-forwarded-for": "203.0.113.10, 198.51.100.1",
        "user-agent": "jest"
      }
    );

    const response = await POST(request);

    expect(response.status).toBe(202);
    expect(response.headers.get("cache-control")).toBe("no-store");
    await expect(readJson(response)).resolves.toEqual({ status: "accepted" });
    expect(mockedCheckWaitlistRateLimit).toHaveBeenCalledWith({
      email: "user@example.com",
      ipAddress: "203.0.113.10"
    });
    expect(mockedSubmitWaitlistSignup).toHaveBeenCalledWith(
      {
        email: "user@example.com",
        marketingConsent: true
      },
      {
        userAgent: "jest",
        ipAddress: "203.0.113.10"
      },
      expect.objectContaining({
        supabaseUrl: "https://project.supabase.co"
      })
    );
  });

  it("treats duplicate submissions as an idempotent success", async () => {
    mockedSubmitWaitlistSignup.mockResolvedValue({ status: "duplicate" });

    const response = await POST(
      createWaitlistRequest(
        JSON.stringify({
          email: "user@example.com",
          marketingConsent: true
        })
      )
    );

    expect(response.status).toBe(202);
    await expect(readJson(response)).resolves.toEqual({ status: "duplicate" });
  });

  it("rejects non-JSON requests before rate limiting or backend work", async () => {
    const response = await POST(createWaitlistRequest("email=user@example.com", { "content-type": "text/plain" }));

    expect(response.status).toBe(415);
    await expect(readJson(response)).resolves.toEqual({ error: "unsupported_media_type" });
    expect(mockedCheckWaitlistRateLimit).not.toHaveBeenCalled();
    expect(mockedSubmitWaitlistSignup).not.toHaveBeenCalled();
  });

  it("rejects oversized request bodies before parsing JSON", async () => {
    const response = await POST(createWaitlistRequest("x".repeat(8 * 1024 + 1)));

    expect(response.status).toBe(413);
    await expect(readJson(response)).resolves.toEqual({ error: "payload_too_large" });
    expect(mockedCheckWaitlistRateLimit).not.toHaveBeenCalled();
  });

  it("rejects malformed JSON", async () => {
    const response = await POST(createWaitlistRequest("{"));

    expect(response.status).toBe(400);
    await expect(readJson(response)).resolves.toEqual({ error: "invalid_json" });
    expect(mockedCheckWaitlistRateLimit).not.toHaveBeenCalled();
  });

  it("returns retry metadata when rate limited", async () => {
    mockedCheckWaitlistRateLimit.mockReturnValue({ allowed: false, retryAfterSeconds: 120 });

    const response = await POST(
      createWaitlistRequest(
        JSON.stringify({
          email: "user@example.com",
          marketingConsent: true
        })
      )
    );

    expect(response.status).toBe(429);
    expect(response.headers.get("retry-after")).toBe("120");
    expect(response.headers.get("cache-control")).toBe("no-store");
    await expect(readJson(response)).resolves.toEqual({ error: "rate_limited" });
    expect(mockedSubmitWaitlistSignup).not.toHaveBeenCalled();
  });

  it("keeps configuration failures user-safe", async () => {
    mockedReadWaitlistRuntimeConfig.mockImplementation(() => {
      throw new WaitlistConfigurationError("Missing private value");
    });

    const response = await POST(
      createWaitlistRequest(
        JSON.stringify({
          email: "user@example.com",
          marketingConsent: true
        })
      )
    );

    expect(response.status).toBe(503);
    await expect(readJson(response)).resolves.toEqual({ error: "waitlist_not_configured" });
  });

  it("keeps schema validation failures user-safe", async () => {
    mockedSubmitWaitlistSignup.mockRejectedValue({ name: "ZodError" });

    const response = await POST(
      createWaitlistRequest(
        JSON.stringify({
          email: "not-an-email",
          marketingConsent: true
        })
      )
    );

    expect(response.status).toBe(400);
    await expect(readJson(response)).resolves.toEqual({ error: "invalid_waitlist_signup" });
  });

  it("keeps storage failures user-safe", async () => {
    mockedSubmitWaitlistSignup.mockRejectedValue(new WaitlistStorageError("internal storage detail"));

    const response = await POST(
      createWaitlistRequest(
        JSON.stringify({
          email: "user@example.com",
          marketingConsent: true
        })
      )
    );

    expect(response.status).toBe(502);
    await expect(readJson(response)).resolves.toEqual({ error: "waitlist_unavailable" });
  });
});
