import { Text, View } from "react-native";
import type { SafeToSpendSnapshot, SpendingMeter } from "@gama/core-domain";
import { MetricPill, SectionCard } from "@gama/ui-mobile";

export function DailySpendingMeterCard({
  snapshot,
  meter
}: {
  snapshot: SafeToSpendSnapshot;
  meter: SpendingMeter;
}) {
  const accentClass =
    meter.status === "comfortable"
      ? "bg-emerald-500/15 text-emerald-200"
      : meter.status === "watch"
        ? "bg-amber-500/15 text-amber-100"
        : "bg-rose-500/15 text-rose-100";

  return (
    <SectionCard eyebrow="Today" title="Daily Spending Meter">
      <Text className="text-5xl font-bold text-white">${snapshot.safeToSpendToday.toFixed(0)}</Text>
      <Text className="mt-2 text-base text-white/70">
        Safe-to-Spend today with your current bills, shared context, and buffer protected.
      </Text>

      <View className={`mt-5 self-start rounded-full px-4 py-2 ${accentClass}`}>
        <Text className="text-xs font-semibold uppercase tracking-[1.5px]">{meter.guidanceLabel}</Text>
      </View>

      <View className="mt-5 flex-row flex-wrap gap-3">
        <MetricPill label="Running balance" value={`$${snapshot.projectedEndOfWindowBalance.toFixed(0)}`} />
        <MetricPill label="Crisis Cushion" value={`$${snapshot.crisisCushion.toFixed(0)}`} />
      </View>
    </SectionCard>
  );
}
