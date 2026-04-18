import { useQuery } from "@tanstack/react-query";
import { calculateSafeToSpend, deriveDailySpendingMeter, sortTimeline } from "@gama/core-domain";

const previewEvents = sortTimeline([
  {
    id: "event-1",
    label: "Rent",
    amount: 950,
    dateISO: "2026-04-05",
    kind: "bill" as const
  },
  {
    id: "event-2",
    label: "Austin trip",
    amount: 180,
    dateISO: "2026-04-10",
    kind: "event" as const
  },
  {
    id: "event-3",
    label: "Payroll",
    amount: 1200,
    dateISO: "2026-04-12",
    kind: "income" as const
  }
]);

export function useDailyGuidancePreview() {
  return useQuery({
    queryKey: ["daily-guidance-preview"],
    queryFn: async () => {
      const snapshot = calculateSafeToSpend({
        daysRemaining: 11,
        scheduledInflow: 1200,
        scheduledOutflow: 1130,
        protectedBuffer: 250,
        availableCash: 980
      });

      return {
        snapshot,
        meter: deriveDailySpendingMeter(snapshot),
        timeline: previewEvents
      };
    }
  });
}
