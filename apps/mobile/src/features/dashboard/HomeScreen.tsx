import { Link } from "expo-router";
import { ActivityIndicator, ScrollView, Switch, Text, View } from "react-native";
import { AppScreen } from "@gama/ui-mobile";
import { useDailyGuidancePreview } from "./hooks/useDailyGuidancePreview";
import { DailySpendingMeterCard } from "./components/DailySpendingMeterCard";
import { ForwardLookingWindowCard } from "./components/ForwardLookingWindowCard";
import { TodayTransactionsCard } from "../transactions/components/TodayTransactionsCard";
import { getMonitoringBootstrapSummary } from "../../lib/monitoring/bootstrap";
import { useShellStore } from "../../state/shell-store";

export function HomeScreen() {
  const query = useDailyGuidancePreview();
  const monitoring = getMonitoringBootstrapSummary();
  const includeSharedContext = useShellStore((state) => state.includeSharedContext);
  const setIncludeSharedContext = useShellStore((state) => state.setIncludeSharedContext);

  if (query.isLoading || !query.data) {
    return (
      <AppScreen>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#9BE7C4" />
        </View>
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <ScrollView contentContainerStyle={{ gap: 16, paddingBottom: 32 }}>
        <View className="gap-3">
          <Text className="text-xs uppercase tracking-[2.5px] text-pocket-mint">Gama</Text>
          <Text className="text-3xl font-bold text-white">Decision-first clarity, not finance homework.</Text>
          <Text className="text-base leading-6 text-white/70">
            Baseline mobile shell for Safe-to-Spend, shared-spending context, forward-looking cash
            flow, and admin-work elimination.
          </Text>
        </View>

        <View className="rounded-3xl border border-white/10 bg-pocket-panel px-5 py-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-1 pr-4">
              <Text className="text-base font-semibold text-white">Shared context on</Text>
              <Text className="mt-1 text-sm text-white/60">
                Keep household visibility without losing private autonomy or personal pots.
              </Text>
            </View>
            <Switch
              value={includeSharedContext}
              onValueChange={setIncludeSharedContext}
              trackColor={{ true: "#9BE7C4" }}
            />
          </View>
        </View>

        <DailySpendingMeterCard snapshot={query.data.snapshot} meter={query.data.meter} />
        <TodayTransactionsCard />
        <ForwardLookingWindowCard events={query.data.timeline} />

        <View className="rounded-3xl border border-dashed border-white/15 p-5">
          <Text className="text-base font-semibold text-white">Add or simulate a transaction</Text>
          <Text className="mt-2 text-sm text-white/65">
            Use the first form shell to see how a decision changes the next few days before it
            lands.
          </Text>
          <Link href="/(app)/simulate" asChild>
            <Text className="mt-4 text-sm font-semibold text-pocket-mint">Open simulation shell</Text>
          </Link>
        </View>

        <View className="rounded-3xl border border-white/10 bg-white/5 px-5 py-4">
          <Text className="text-sm font-semibold text-white">Observability wiring</Text>
          <Text className="mt-2 text-sm text-white/60">
            Sentry ready: {String(monitoring.sentryReady)} • PostHog ready:{" "}
            {String(monitoring.posthogReady)} • RevenueCat ready:{" "}
            {String(monitoring.revenueCatReady)}
          </Text>
        </View>
      </ScrollView>
    </AppScreen>
  );
}
