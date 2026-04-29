import {
  checkWaitlistRateLimit,
  readWaitlistRuntimeConfig,
  resetWaitlistRateLimitForTests,
  submitWaitlistSignup,
  WaitlistConfigurationError,
  WaitlistStorageError,
  type WaitlistRuntimeConfig
} from "./waitlist";

const supabaseServiceRoleEnvKey = ["SUPABASE", "SERVICE", "ROLE", "KEY"].join("_");

const config: WaitlistRuntimeConfig = {
  supabaseUrl: "https://project.supabase.co",
  supabaseServiceRoleKey: "service-role-key",
  resendApiKey: "resend-key",
  waitlistFromEmail: "Gama <waitlist@gamabudget.com>",
  waitlistNotifyEmail: "team@gamabudget.com"
};

describe("readWaitlistRuntimeConfig", () => {
  it("requires all backend secrets", () => {
    expect(() => readWaitlistRuntimeConfig({})).toThrow(WaitlistConfigurationError);
  });

  it("normalizes configured Supabase URL", () => {
    expect(
      readWaitlistRuntimeConfig({
        SUPABASE_URL: "https://project.supabase.co/",
        [supabaseServiceRoleEnvKey]: "service-role-key",
        RESEND_API_KEY: "resend-key",
        WAITLIST_FROM_EMAIL: "waitlist@gamabudget.com",
        WAITLIST_NOTIFY_EMAIL: "team@gamabudget.com"
      }).supabaseUrl
    ).toBe("https://project.supabase.co");
  });
});

describe("checkWaitlistRateLimit", () => {
  beforeEach(() => {
    resetWaitlistRateLimitForTests();
  });

  it("allows a small burst and then rate limits by IP", () => {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      expect(
        checkWaitlistRateLimit({
          email: `person-${attempt}@example.com`,
          ipAddress: "203.0.113.10",
          nowMs: 1_000
        })
      ).toEqual({ allowed: true });
    }

    expect(
      checkWaitlistRateLimit({
        email: "person-6@example.com",
        ipAddress: "203.0.113.10",
        nowMs: 1_000
      })
    ).toEqual({ allowed: false, retryAfterSeconds: 600 });
  });

  it("allows submissions again after the rate limit window expires", () => {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      checkWaitlistRateLimit({
        email: `person-${attempt}@example.com`,
        ipAddress: "203.0.113.10",
        nowMs: 1_000
      });
    }

    expect(
      checkWaitlistRateLimit({
        email: "person-6@example.com",
        ipAddress: "203.0.113.10",
        nowMs: 601_001
      })
    ).toEqual({ allowed: true });
  });

  it("rate limits repeated attempts for the same email across IP addresses", () => {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      expect(
        checkWaitlistRateLimit({
          email: "person@example.com",
          ipAddress: `203.0.113.${attempt}`,
          nowMs: 1_000
        })
      ).toEqual({ allowed: true });
    }

    expect(
      checkWaitlistRateLimit({
        email: "PERSON@example.com",
        ipAddress: "203.0.113.99",
        nowMs: 1_000
      })
    ).toEqual({ allowed: false, retryAfterSeconds: 600 });
  });
});

describe("submitWaitlistSignup", () => {
  it("stores the signup and sends confirmation and notification emails", async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce(new Response(null, { status: 201 }))
      .mockResolvedValueOnce(new Response(null, { status: 200 }))
      .mockResolvedValueOnce(new Response(null, { status: 200 }));

    await expect(
      submitWaitlistSignup(
        {
          email: " USER@Example.COM ",
          firstName: "Kayden",
          persona: "solo",
          biggestPain: "Too much finance admin.",
          referralSource: "landing-page",
          marketingConsent: true
        },
        { userAgent: "jest", ipAddress: "127.0.0.1" },
        config,
        { fetch: fetchMock as typeof fetch, now: () => new Date("2026-04-18T12:00:00.000Z") }
      )
    ).resolves.toEqual({ status: "accepted" });

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "https://project.supabase.co/rest/v1/waitlist_signups",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining('"email":"user@example.com"')
      })
    );
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("treats duplicate emails as an accepted idempotent outcome without sending email", async () => {
    const fetchMock = jest.fn().mockResolvedValueOnce(new Response(null, { status: 409 }));

    await expect(
      submitWaitlistSignup(
        { email: "user@example.com", marketingConsent: true },
        {},
        config,
        { fetch: fetchMock as typeof fetch, now: () => new Date("2026-04-18T12:00:00.000Z") }
      )
    ).resolves.toEqual({ status: "duplicate" });

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("surfaces storage failures", async () => {
    const fetchMock = jest.fn().mockResolvedValueOnce(new Response(null, { status: 500 }));

    await expect(
      submitWaitlistSignup(
        { email: "user@example.com", marketingConsent: true },
        {},
        config,
        { fetch: fetchMock as typeof fetch, now: () => new Date("2026-04-18T12:00:00.000Z") }
      )
    ).rejects.toThrow(WaitlistStorageError);
  });

  it("logs email provider failures after storage and still accepts the signup", async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce(new Response(null, { status: 201 }))
      .mockResolvedValueOnce(new Response(null, { status: 500 }));
    const logger = { error: jest.fn() };

    await expect(
      submitWaitlistSignup(
        { email: "user@example.com", marketingConsent: true },
        {},
        config,
        {
          fetch: fetchMock as typeof fetch,
          logger,
          now: () => new Date("2026-04-18T12:00:00.000Z")
        }
      )
    ).resolves.toEqual({ status: "accepted" });

    expect(logger.error).toHaveBeenCalledWith(
      "Waitlist signup stored, but email delivery failed.",
      expect.objectContaining({ email: "user@example.com" })
    );
  });
});
