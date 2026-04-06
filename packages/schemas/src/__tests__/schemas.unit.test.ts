import {
  budgetEventSchema,
  budgetEventEditorSchema,
  dailyGuidanceResponseSchema,
  eventAssignmentSuggestionsResponseSchema,
  eventTransactionAssignmentSchema,
  financialAccountSchema,
  manualEventAssignmentSchema,
  plaidLinkTokenResponseSchema,
  plaidPublicTokenExchangeRequestSchema,
  plaidTransactionSyncResponseSchema,
  transactionSimulationSchema,
  transactionSplitSchema
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

describe("budgetEventSchema", () => {
  it("rejects an event where the end date is before the start date", () => {
    const parsed = budgetEventSchema.safeParse({
      id: "6f0e4a60-fde6-4d34-999d-a486d8c32bbc",
      title: "Weekend Trip",
      notes: null,
      startsOn: "2026-05-12",
      endsOn: "2026-05-11",
      targetAmount: 500,
      status: "active",
      isShared: false,
      archivedAt: null
    });

    expect(parsed.success).toBe(false);
  });
});

describe("budgetEventEditorSchema", () => {
  it("accepts a valid event editor payload", () => {
    expect(() =>
      budgetEventEditorSchema.parse({
        title: "Austin Trip",
        notes: "Hotel and food",
        startsOn: "2026-05-12",
        endsOn: "2026-05-15",
        targetAmount: 800,
        status: "active",
        isShared: true
      })
    ).not.toThrow();
  });
});

describe("financialAccountSchema", () => {
  it("accepts a Plaid-backed account payload", () => {
    expect(() =>
      financialAccountSchema.parse({
        id: "0384ef48-49a4-40dc-a4db-ac9f19e4d95e",
        provider: "plaid",
        externalAccountId: "acc_123",
        providerItemId: "item_123",
        institutionName: "Chase",
        officialName: "Chase Checking",
        displayName: "Daily Checking",
        mask: "1234",
        accountType: "depository",
        accountSubtype: "checking",
        currencyCode: "USD",
        currentBalance: 1200.55,
        availableBalance: 1000.55,
        accountStatus: "active",
        lastSyncedAt: "2026-04-05T12:00:00.000Z"
      })
    ).not.toThrow();
  });
});

describe("eventTransactionAssignmentSchema", () => {
  it("requires explainable rationale entries to be non-empty strings", () => {
    const parsed = eventTransactionAssignmentSchema.safeParse({
      id: "6a9635cc-c9bd-43d6-a84c-8ca2f2b6f8d8",
      eventId: "f1245df6-9287-49cf-9fba-c1f1af9089e8",
      ledgerTransactionId: "f583f8b2-d2ef-4a6d-9d28-3d0a21a99791",
      assignmentSource: "suggested",
      reviewStatus: "pending",
      confidenceScore: 0.62,
      isAmbiguous: true,
      rationale: [""],
      assignmentNote: null,
      reviewedAt: null
    });

    expect(parsed.success).toBe(false);
  });
});

describe("manualEventAssignmentSchema", () => {
  it("rejects a manual assignment with an invalid event id", () => {
    const parsed = manualEventAssignmentSchema.safeParse({
      eventId: "not-a-uuid",
      ledgerTransactionId: "f583f8b2-d2ef-4a6d-9d28-3d0a21a99791",
      assignmentNote: null
    });

    expect(parsed.success).toBe(false);
  });
});

describe("eventAssignmentSuggestionsResponseSchema", () => {
  it("accepts an explainable suggestion payload", () => {
    expect(() =>
      eventAssignmentSuggestionsResponseSchema.parse({
        eventId: "f1245df6-9287-49cf-9fba-c1f1af9089e8",
        generatedAt: "2026-04-05T12:00:00.000Z",
        suggestions: [
          {
            assignmentId: "6a9635cc-c9bd-43d6-a84c-8ca2f2b6f8d8",
            eventId: "f1245df6-9287-49cf-9fba-c1f1af9089e8",
            ledgerTransactionId: "f583f8b2-d2ef-4a6d-9d28-3d0a21a99791",
            merchantName: "Austin Hotel",
            description: "AUSTIN HOTEL",
            postedOn: "2026-05-12",
            amount: 240,
            confidenceScore: 0.82,
            isAmbiguous: true,
            rationale: ["Transaction posted during the event window."],
            competingEventIds: ["8d576633-7bb2-410c-bb77-95b4fbf3f2a0"],
            reviewStatus: "pending"
          }
        ]
      })
    ).not.toThrow();
  });
});

describe("transactionSplitSchema", () => {
  it("rejects zero-value splits", () => {
    const parsed = transactionSplitSchema.safeParse({
      id: "7bfde2d6-3b6b-40d1-8e18-6980a61b6eb4",
      ledgerTransactionId: "8d576633-7bb2-410c-bb77-95b4fbf3f2a0",
      eventId: null,
      splitAmount: 0,
      splitKind: "shared",
      notes: null
    });

    expect(parsed.success).toBe(false);
  });
});

describe("plaidLinkTokenResponseSchema", () => {
  it("accepts a valid Plaid link token response", () => {
    expect(() =>
      plaidLinkTokenResponseSchema.parse({
        linkToken: "link-sandbox-123",
        expirationISO: "2026-04-05T12:00:00.000Z",
        requestId: "req_123"
      })
    ).not.toThrow();
  });
});

describe("plaidPublicTokenExchangeRequestSchema", () => {
  it("rejects an empty public token", () => {
    const parsed = plaidPublicTokenExchangeRequestSchema.safeParse({
      publicToken: ""
    });

    expect(parsed.success).toBe(false);
  });
});

describe("plaidTransactionSyncResponseSchema", () => {
  it("accepts a sync response with per-item results", () => {
    expect(() =>
      plaidTransactionSyncResponseSchema.parse({
        syncedItems: 1,
        failedItems: 0,
        results: [
          {
            itemId: "item_123",
            institutionName: "Plaid Sandbox",
            status: "synced",
            added: 2,
            modified: 1,
            removed: 0,
            accountsUpserted: 2,
            nextCursor: "cursor_123",
            error: null
          }
        ]
      })
    ).not.toThrow();
  });
});
