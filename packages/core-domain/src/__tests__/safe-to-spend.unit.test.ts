import { calculateSafeToSpend, deriveDailySpendingMeter, suggestEventAssignments } from "../index";

describe("calculateSafeToSpend", () => {
  it("protects the crisis cushion and produces a daily budget", () => {
    const snapshot = calculateSafeToSpend({
      daysRemaining: 5,
      scheduledInflow: 400,
      scheduledOutflow: 250,
      protectedBuffer: 300,
      availableCash: 650
    });

    expect(snapshot.safeToSpendToday).toBe(100);
    expect(snapshot.projectedEndOfWindowBalance).toBe(500);
  });
});

describe("deriveDailySpendingMeter", () => {
  it("returns a watch state for moderate daily headroom", () => {
    const meter = deriveDailySpendingMeter({
      safeToSpendToday: 42,
      recommendedDailyBudget: 42,
      crisisCushion: 120,
      projectedEndOfWindowBalance: 210
    });

    expect(meter.status).toBe("watch");
    expect(meter.guidanceLabel).toContain("Watch");
  });
});

describe("suggestEventAssignments", () => {
  it("returns a high-confidence suggestion when merchant and dates line up", () => {
    const suggestions = suggestEventAssignments(
      "event_trip",
      [
        {
          id: "event_trip",
          title: "Austin Trip",
          notes: "Flight and hotel",
          startsOn: "2026-05-10",
          endsOn: "2026-05-15",
          targetAmount: 900
        }
      ],
      [
        {
          id: "tx_hotel",
          merchantName: "Austin Hotel Downtown",
          description: "AUSTIN HOTEL",
          postedOn: "2026-05-12",
          amount: 240
        }
      ]
    );

    expect(suggestions).toHaveLength(1);
    expect(suggestions[0]?.confidenceScore).toBeGreaterThanOrEqual(0.7);
    expect(suggestions[0]?.isAmbiguous).toBe(false);
  });

  it("marks a suggestion ambiguous when two events score similarly", () => {
    const suggestions = suggestEventAssignments(
      "event_trip",
      [
        {
          id: "event_trip",
          title: "Austin Trip",
          notes: "Flight and hotel",
          startsOn: "2026-05-10",
          endsOn: "2026-05-15",
          targetAmount: 900
        },
        {
          id: "event_conference",
          title: "Austin Conference",
          notes: "Hotel and badge",
          startsOn: "2026-05-11",
          endsOn: "2026-05-14",
          targetAmount: 1200
        }
      ],
      [
        {
          id: "tx_hotel",
          merchantName: "Austin Hotel Downtown",
          description: "AUSTIN HOTEL",
          postedOn: "2026-05-12",
          amount: 240
        }
      ]
    );

    expect(suggestions).toHaveLength(1);
    expect(suggestions[0]?.isAmbiguous).toBe(true);
    expect(suggestions[0]?.competingEventIds).toContain("event_conference");
  });
});
