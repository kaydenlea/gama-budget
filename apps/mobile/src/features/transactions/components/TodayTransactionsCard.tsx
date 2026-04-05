import { Text, View } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { SectionCard } from "@pocketcurb/ui-mobile";
import { mockTransactions } from "../data/mock-transactions";

export function TodayTransactionsCard() {
  return (
    <SectionCard eyebrow="Today" title="Transactions and context">
      <FlashList
        data={mockTransactions}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <View className="mb-3 rounded-2xl bg-white/5 p-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-base font-medium text-white">{item.merchant}</Text>
              <Text className="text-base font-semibold text-white">
                {item.amount > 0 ? "+" : "-"}${Math.abs(item.amount).toFixed(2)}
              </Text>
            </View>
            <Text className="mt-1 text-sm text-white/60">{item.label}</Text>
          </View>
        )}
      />
    </SectionCard>
  );
}
