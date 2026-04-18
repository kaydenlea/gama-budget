import { Text, View } from "react-native";
import type { TimelineEvent } from "@gama/core-domain";
import { SectionCard } from "@gama/ui-mobile";

export function ForwardLookingWindowCard({ events }: { events: TimelineEvent[] }) {
  return (
    <SectionCard eyebrow="Forward look" title="Week and month cash flow">
      <Text className="text-sm text-white/70">
        Calendar-grade clarity matters more than category cleanup. This shell keeps upcoming bills,
        trips, and reimbursements visible.
      </Text>
      <View className="mt-4 gap-3">
        {events.map((event) => (
          <View key={event.id} className="rounded-2xl border border-white/10 px-4 py-3">
            <Text className="text-sm uppercase tracking-[1.5px] text-white/50">{event.dateISO}</Text>
            <Text className="mt-1 text-base font-semibold text-white">{event.label}</Text>
            <Text className="mt-1 text-sm text-white/70">
              {event.kind} • ${event.amount.toFixed(0)}
            </Text>
          </View>
        ))}
      </View>
    </SectionCard>
  );
}
