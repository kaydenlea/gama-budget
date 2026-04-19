import {
  dailyGuidanceResponseSchema,
  transactionSimulationSchema,
  waitlistSignupSchema
} from "../index";

describe("transactionSimulationSchema", () => {
  it("accepts a valid simulation payload", () => {
    expect(() =>
      transactionSimulationSchema.parse({
        amount: 18.5,
        merchant: "Coffee",
        dateISO: "2026-04-03T12:00:00.000Z",
        isShared: false,
        reimbursementExpected: false
      })
    ).not.toThrow();
  });
});

describe("dailyGuidanceResponseSchema", () => {
  it("rejects an invalid spending meter value", () => {
    const parsed = dailyGuidanceResponseSchema.safeParse({
      safeToSpendToday: 20,
      recommendedDailyBudget: 20,
      runningBalance: 500,
      crisisCushion: 80,
      dailySpendingMeter: "unsafe"
    });

    expect(parsed.success).toBe(false);
  });
});

describe("waitlistSignupSchema", () => {
  it("normalizes valid email input", () => {
    const parsed = waitlistSignupSchema.parse({
      email: "  USER@Example.COM ",
      firstName: "Kayden",
      persona: "solo",
      biggestPain: "Keeping shared spending visible without doing spreadsheet work.",
      referralSource: "landing-page",
      marketingConsent: true
    });

    expect(parsed.email).toBe("user@example.com");
  });

  it("requires explicit consent", () => {
    const parsed = waitlistSignupSchema.safeParse({
      email: "user@example.com",
      marketingConsent: false
    });

    expect(parsed.success).toBe(false);
  });

  it("rejects filled honeypot fields", () => {
    const parsed = waitlistSignupSchema.safeParse({
      email: "user@example.com",
      marketingConsent: true,
      website: "https://spam.example"
    });

    expect(parsed.success).toBe(false);
  });
});
