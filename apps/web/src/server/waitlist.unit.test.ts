import {
  readWaitlistRuntimeConfig,
  submitWaitlistSignup,
  WaitlistConfigurationError,
  WaitlistEmailError,
  WaitlistStorageError,
  type WaitlistRuntimeConfig
} from "./waitlist";

const config: WaitlistRuntimeConfig = {
  supabaseUrl: "https://project.supabase.co",
  supabaseServiceRoleKey: "service-role-key",
  resendApiKey: "resend-key",
  waitlistFromEmail: "Gama <waitlist@gama.money>",
  waitlistNotifyEmail: "team@gama.money"
};

describe("readWaitlistRuntimeConfig", () => {
  it("requires all backend secrets", () => {
    expect(() => readWaitlistRuntimeConfig({})).toThrow(WaitlistConfigurationError);
  });

  it("normalizes configured Supabase URL", () => {
    expect(
      readWaitlistRuntimeConfig({
        SUPABASE_URL: "https://project.supabase.co/",
        SUPABASE_SERVICE_ROLE_KEY: "service-role-key",
        RESEND_API_KEY: "resend-key",
        WAITLIST_FROM_EMAIL: "waitlist@gama.money",
        WAITLIST_NOTIFY_EMAIL: "team@gama.money"
      }).supabaseUrl
    ).toBe("https://project.supabase.co");
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

  it("surfaces email provider failures", async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce(new Response(null, { status: 201 }))
      .mockResolvedValueOnce(new Response(null, { status: 500 }));

    await expect(
      submitWaitlistSignup(
        { email: "user@example.com", marketingConsent: true },
        {},
        config,
        { fetch: fetchMock as typeof fetch, now: () => new Date("2026-04-18T12:00:00.000Z") }
      )
    ).rejects.toThrow(WaitlistEmailError);
  });
});
