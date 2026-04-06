import { createPocketCurbApiClient, type PocketCurbFunctionName } from "./index";

describe("createPocketCurbApiClient", () => {
  it("validates request and response boundaries", async () => {
    const client = createPocketCurbApiClient(async <TResponse>() =>
      ({
        safeToSpendToday: 35,
        recommendedDailyBudget: 35,
        runningBalance: 420,
        crisisCushion: 120,
        dailySpendingMeter: "watch"
      }) as TResponse
    );

    await expect(
      client.getDailyGuidance({
        includeSharedContext: true
      })
    ).resolves.toMatchObject({
      safeToSpendToday: 35,
      dailySpendingMeter: "watch"
    });
  });

  it("validates Plaid token flow boundaries", async () => {
    const client = createPocketCurbApiClient(async <TResponse>(name: PocketCurbFunctionName) => {
      if (name === "plaid-link-token") {
        return {
          linkToken: "link-sandbox-123",
          expirationISO: "2026-04-05T12:00:00.000Z",
          requestId: "req_link"
        } as TResponse;
      }

      return {
        connected: true,
        itemId: "item_123",
        requestId: "req_exchange"
      } as TResponse;
    });

    await expect(client.createPlaidLinkToken()).resolves.toMatchObject({
      linkToken: "link-sandbox-123"
    });

    await expect(
      client.exchangePlaidPublicToken({
        publicToken: "public-sandbox-123"
      })
    ).resolves.toMatchObject({
      connected: true,
      itemId: "item_123"
    });
  });

  it("validates Plaid transaction sync boundaries", async () => {
    const client = createPocketCurbApiClient(async <TResponse>() =>
      ({
        syncedItems: 1,
        failedItems: 0,
        results: [
          {
            itemId: "item_123",
            institutionName: "Plaid Sandbox",
            status: "synced",
            added: 4,
            modified: 1,
            removed: 1,
            accountsUpserted: 2,
            nextCursor: "cursor_456",
            error: null
          }
        ]
      }) as TResponse
    );

    await expect(client.syncPlaidTransactions()).resolves.toMatchObject({
      syncedItems: 1,
      failedItems: 0
    });
  });

  it("validates event assignment suggestion boundaries", async () => {
    const client = createPocketCurbApiClient(async <TResponse>() =>
      ({
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
      }) as TResponse
    );

    await expect(
      client.listEventAssignmentSuggestions({
        eventId: "f1245df6-9287-49cf-9fba-c1f1af9089e8",
        includeSharedContext: true,
        lookbackDays: 45
      })
    ).resolves.toMatchObject({
      suggestions: [
        expect.objectContaining({
          isAmbiguous: true
        })
      ]
    });
  });
});
