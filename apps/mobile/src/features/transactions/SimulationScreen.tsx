import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, type ComponentProps, type ReactNode } from "react";
import { Controller, useForm } from "react-hook-form";
import { ScrollView, Switch, Text, TextInput, View } from "react-native";
import { Link } from "expo-router";
import { AppScreen, SectionCard } from "@gama/ui-mobile";
import { transactionSimulationSchema, type TransactionSimulationInput } from "@gama/schemas";

export function SimulationScreen() {
  const form = useForm<TransactionSimulationInput>({
    resolver: zodResolver(transactionSimulationSchema),
    defaultValues: {
      amount: 24,
      merchant: "Weekend groceries",
      dateISO: new Date("2026-04-03T12:00:00.000Z").toISOString(),
      notes: "",
      isShared: true,
      reimbursementExpected: false
    }
  });

  const values = form.watch();
  const summary = useMemo(() => {
    return values.isShared
      ? "Shared context enabled. Privacy and reimbursement rules will matter for the final posting flow."
      : "Personal transaction. The default posting path stays private unless you move it into a shared event.";
  }, [values.isShared]);

  return (
    <AppScreen>
      <ScrollView contentContainerStyle={{ gap: 16, paddingBottom: 32 }}>
        <Link href="/(app)" asChild>
          <Text className="text-sm font-semibold text-pocket-mint">Back to home</Text>
        </Link>

        <SectionCard eyebrow="Simulation" title="Preview the next decision">
          <Text className="text-sm leading-6 text-white/70">
            This shell is intentionally thin. It proves the form, validation, and decision-preview
            path without pretending the full transaction engine is already finished.
          </Text>
        </SectionCard>

        <SectionCard eyebrow="Form" title="Transaction draft">
          <View className="gap-4">
            <Field label="Merchant">
              <Controller
                control={form.control}
                name="merchant"
                render={({ field }) => <Input value={field.value} onChangeText={field.onChange} />}
              />
            </Field>

            <Field label="Amount">
              <Controller
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <Input
                    value={String(field.value)}
                    onChangeText={(next) => field.onChange(Number(next || 0))}
                    keyboardType="decimal-pad"
                  />
                )}
              />
            </Field>

            <Field label="ISO Date">
              <Controller
                control={form.control}
                name="dateISO"
                render={({ field }) => <Input value={field.value} onChangeText={field.onChange} />}
              />
            </Field>

            <View className="flex-row items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
              <View className="flex-1 pr-4">
                <Text className="text-sm font-semibold text-white">Shared transaction</Text>
                <Text className="mt-1 text-sm text-white/60">
                  Shared toggles stay explicit because privacy and reimbursements distort the truth
                  if they are hidden.
                </Text>
              </View>
              <Controller
                control={form.control}
                name="isShared"
                render={({ field }) => (
                  <Switch value={field.value} onValueChange={field.onChange} trackColor={{ true: "#9BE7C4" }} />
                )}
              />
            </View>
          </View>
        </SectionCard>

        <SectionCard eyebrow="Decision preview" title="What changes next">
          <Text className="text-base text-white">{summary}</Text>
          <Text className="mt-3 text-sm text-white/60">
            Final compute, event auto-assignment, split editing, and ambiguous-match review will
            live behind the Supabase-backed decision layer.
          </Text>
        </SectionCard>
      </ScrollView>
    </AppScreen>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View>
      <Text className="mb-2 text-sm font-semibold text-white">{label}</Text>
      {children}
    </View>
  );
}

function Input(props: ComponentProps<typeof TextInput>) {
  return (
    <TextInput
      placeholderTextColor="#8da39c"
      className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white"
      {...props}
    />
  );
}
