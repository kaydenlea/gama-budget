import { useMemo, useState, type ComponentProps, type ReactNode } from "react";
import { ActivityIndicator, Pressable, ScrollView, Switch, Text, TextInput, View } from "react-native";
import { Link } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AppScreen, MetricPill, SectionCard } from "@pocketcurb/ui-mobile";
import {
  budgetEventEditorSchema,
  type BudgetEventEditor,
  type EventAssignmentSuggestion,
  manualEventAssignmentSchema
} from "@pocketcurb/schemas";
import type { Database } from "@pocketcurb/supabase-types";
import { apiClient } from "../../lib/api/client";
import { toUserSafeApiError } from "../../lib/api/errors";
import { supabase } from "../../lib/supabase/client";
import { useShellStore } from "../../state/shell-store";

type BudgetEventRow = Database["public"]["Tables"]["budget_events"]["Row"];
type LedgerTransactionRow = Database["public"]["Tables"]["ledger_transactions"]["Row"];
type AssignmentRow = Database["public"]["Tables"]["event_transaction_assignments"]["Row"];

type EventBudgetData = {
  userId: string | null;
  events: BudgetEventRow[];
  transactions: LedgerTransactionRow[];
  assignments: AssignmentRow[];
};

const todayIso = new Date().toISOString().slice(0, 10);

const defaultFormState: EventFormState = {
  title: "",
  notes: "",
  startsOn: todayIso,
  endsOn: todayIso,
  targetAmount: "300",
  isShared: false,
  status: "active"
};

type EventFormState = {
  title: string;
  notes: string;
  startsOn: string;
  endsOn: string;
  targetAmount: string;
  isShared: boolean;
  status: BudgetEventEditor["status"];
};

export function EventBudgetsScreen() {
  const includeSharedContext = useShellStore((state) => state.includeSharedContext);
  const queryClient = useQueryClient();
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [formState, setFormState] = useState<EventFormState>(defaultFormState);
  const [formError, setFormError] = useState<string | null>(null);

  const eventQuery = useQuery({
    queryKey: ["event-budgets", includeSharedContext],
    queryFn: async (): Promise<EventBudgetData> => {
      const {
        data: { user },
        error: authError
      } = await supabase.auth.getUser();

      if (authError) {
        throw toUserSafeApiError(authError);
      }

      if (!user) {
        return {
          userId: null,
          events: [],
          transactions: [],
          assignments: []
        };
      }

      let eventQueryBuilder = supabase
        .from("budget_events")
        .select("*")
        .neq("status", "archived")
        .order("starts_on", { ascending: true });

      if (!includeSharedContext) {
        eventQueryBuilder = eventQueryBuilder.eq("is_shared", false);
      }

      const transactionQueryBuilder = supabase
        .from("ledger_transactions")
        .select("*")
        .gte("posted_on", new Date(Date.now() - 1000 * 60 * 60 * 24 * 45).toISOString().slice(0, 10))
        .order("posted_on", { ascending: false })
        .limit(24);

      const [eventsResult, transactionsResult] = await Promise.all([eventQueryBuilder, transactionQueryBuilder]);

      if (eventsResult.error) {
        throw toUserSafeApiError(eventsResult.error);
      }

      if (transactionsResult.error) {
        throw toUserSafeApiError(transactionsResult.error);
      }

      const events = eventsResult.data ?? [];
      const eventIds = events.map((event) => event.id);

      if (eventIds.length === 0) {
        return {
          userId: user.id,
          events,
          transactions: transactionsResult.data ?? [],
          assignments: []
        };
      }

      const assignmentsResult = await supabase
        .from("event_transaction_assignments")
        .select("*")
        .in("event_id", eventIds)
        .eq("review_status", "confirmed");

      if (assignmentsResult.error) {
        throw toUserSafeApiError(assignmentsResult.error);
      }

      return {
        userId: user.id,
        events,
        transactions: transactionsResult.data ?? [],
        assignments: assignmentsResult.data ?? []
      };
    }
  });

  const selectedEvent =
    eventQuery.data?.events.find((event) => event.id === selectedEventId) ??
    eventQuery.data?.events[0] ??
    null;

  const suggestionQuery = useQuery({
    queryKey: ["event-assignment-suggestions", selectedEvent?.id ?? null, includeSharedContext],
    enabled: Boolean(eventQuery.data?.userId && selectedEvent?.id),
    queryFn: async () => {
      if (!selectedEvent) {
        return [];
      }

      const response = await apiClient.listEventAssignmentSuggestions({
        eventId: selectedEvent.id,
        includeSharedContext,
        lookbackDays: 45
      });

      return response.suggestions;
    }
  });

  const assignmentByTransactionId = useMemo(() => {
    const map = new Map<string, AssignmentRow>();

    for (const assignment of eventQuery.data?.assignments ?? []) {
      if (!map.has(assignment.ledger_transaction_id)) {
        map.set(assignment.ledger_transaction_id, assignment);
      }
    }

    return map;
  }, [eventQuery.data?.assignments]);

  const spendByEventId = useMemo(() => {
    const transactionAmountById = new Map<string, number>();

    for (const transaction of eventQuery.data?.transactions ?? []) {
      transactionAmountById.set(transaction.id, Math.max(transaction.amount, 0));
    }

    const map = new Map<string, number>();

    for (const assignment of eventQuery.data?.assignments ?? []) {
      const amount = transactionAmountById.get(assignment.ledger_transaction_id) ?? 0;
      map.set(assignment.event_id, roundMoney((map.get(assignment.event_id) ?? 0) + amount));
    }

    return map;
  }, [eventQuery.data?.assignments, eventQuery.data?.transactions]);

  const resetForm = () => {
    setEditingEventId(null);
    setFormState(defaultFormState);
    setFormError(null);
  };

  const refetchBudgets = async () => {
    await queryClient.invalidateQueries({
      queryKey: ["event-budgets"]
    });
  };

  const refetchSuggestions = async () => {
    await queryClient.invalidateQueries({
      queryKey: ["event-assignment-suggestions"]
    });
  };

  const saveEventMutation = useMutation({
    mutationFn: async () => {
      const userId = eventQuery.data?.userId;

      if (!userId) {
        throw new Error("Sign in required");
      }

      const payload = parseEventForm(formState);

      if (editingEventId) {
        const { error } = await supabase
          .from("budget_events")
          .update({
            title: payload.title,
            notes: payload.notes,
            starts_on: payload.startsOn,
            ends_on: payload.endsOn,
            target_amount: payload.targetAmount,
            status: payload.status,
            is_shared: payload.isShared,
            archived_at: payload.status === "archived" ? new Date().toISOString() : null
          })
          .eq("id", editingEventId);

        if (error) {
          throw toUserSafeApiError(error);
        }

        return editingEventId;
      }

      const { data, error } = await supabase
        .from("budget_events")
        .insert({
          user_id: userId,
          title: payload.title,
          notes: payload.notes,
          starts_on: payload.startsOn,
          ends_on: payload.endsOn,
          target_amount: payload.targetAmount,
          status: payload.status,
          is_shared: payload.isShared
        })
        .select("id")
        .single();

      if (error) {
        throw toUserSafeApiError(error);
      }

      return data.id;
    },
    onSuccess: async (eventId) => {
      await refetchBudgets();
      setSelectedEventId(eventId);
      resetForm();
    },
    onError: (error) => {
      setFormError(error instanceof Error ? error.message : "This event could not be saved.");
    }
  });

  const archiveEventMutation = useMutation({
    mutationFn: async (eventId: string) => {
      const { error } = await supabase
        .from("budget_events")
        .update({
          status: "archived",
          archived_at: new Date().toISOString()
        })
        .eq("id", eventId);

      if (error) {
        throw toUserSafeApiError(error);
      }
    },
    onSuccess: async (_, eventId) => {
      await refetchBudgets();
      if (selectedEventId === eventId) {
        setSelectedEventId(null);
      }
      if (editingEventId === eventId) {
        resetForm();
      }
    }
  });

  const assignMutation = useMutation({
    mutationFn: async (input: { eventId: string; ledgerTransactionId: string }) => {
      const userId = eventQuery.data?.userId;

      if (!userId) {
        throw new Error("Sign in required");
      }

      const payload = manualEventAssignmentSchema.parse({
        eventId: input.eventId,
        ledgerTransactionId: input.ledgerTransactionId,
        assignmentNote: null
      });

      const existingAssignment = assignmentByTransactionId.get(payload.ledgerTransactionId);

      if (existingAssignment && existingAssignment.event_id !== payload.eventId) {
        throw new Error("Unassign this transaction from its current event before moving it.");
      }

      const existingSuggestion = suggestionQuery.data?.find(
        (suggestion) => suggestion.ledgerTransactionId === payload.ledgerTransactionId && suggestion.eventId === payload.eventId
      );

      const assignmentPatch = {
        assignment_source: "manual" as const,
        review_status: "confirmed" as const,
        confidence_score: existingSuggestion?.confidenceScore ?? null,
        is_ambiguous: false,
        rationale: ["Manual assignment"],
        assignment_note: payload.assignmentNote ?? null,
        reviewed_at: new Date().toISOString()
      };

      const { error } = existingSuggestion
        ? await supabase
            .from("event_transaction_assignments")
            .update(assignmentPatch)
            .eq("id", existingSuggestion.assignmentId)
        : await supabase.from("event_transaction_assignments").insert({
            user_id: userId,
            event_id: payload.eventId,
            ledger_transaction_id: payload.ledgerTransactionId,
            ...assignmentPatch
          });

      if (error) {
        throw toUserSafeApiError(error);
      }
    },
    onSuccess: async () => {
      await refetchBudgets();
      await refetchSuggestions();
    }
  });

  const unassignMutation = useMutation({
    mutationFn: async (assignmentId: string) => {
      const { error } = await supabase
        .from("event_transaction_assignments")
        .delete()
        .eq("id", assignmentId);

      if (error) {
        throw toUserSafeApiError(error);
      }
    },
    onSuccess: async () => {
      await refetchBudgets();
      await refetchSuggestions();
    }
  });

  const reviewSuggestionMutation = useMutation({
    mutationFn: async (input: { assignmentId: string; reviewStatus: "confirmed" | "rejected" }) => {
      const { error } = await supabase
        .from("event_transaction_assignments")
        .update({
          review_status: input.reviewStatus,
          reviewed_at: new Date().toISOString()
        })
        .eq("id", input.assignmentId);

      if (error) {
        throw toUserSafeApiError(error);
      }
    },
    onSuccess: async () => {
      await refetchBudgets();
      await refetchSuggestions();
    }
  });

  const mutationError =
    formError ??
    (saveEventMutation.error instanceof Error ? saveEventMutation.error.message : null) ??
    (archiveEventMutation.error instanceof Error ? archiveEventMutation.error.message : null) ??
    (assignMutation.error instanceof Error ? assignMutation.error.message : null) ??
    (unassignMutation.error instanceof Error ? unassignMutation.error.message : null) ??
    (reviewSuggestionMutation.error instanceof Error ? reviewSuggestionMutation.error.message : null) ??
    (suggestionQuery.error instanceof Error ? suggestionQuery.error.message : null);

  if (eventQuery.isLoading) {
    return (
      <AppScreen>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#9BE7C4" />
        </View>
      </AppScreen>
    );
  }

  if (eventQuery.isError) {
    return (
      <AppScreen>
        <SectionCard eyebrow="Events" title="Budget workspace unavailable">
          <Text className="text-sm leading-6 text-white/70">
            {eventQuery.error instanceof Error
              ? eventQuery.error.message
              : "The event budget workspace could not be loaded."}
          </Text>
        </SectionCard>
      </AppScreen>
    );
  }

  if (!eventQuery.data?.userId) {
    return (
      <AppScreen>
        <ScrollView contentContainerStyle={{ gap: 16, paddingBottom: 32 }}>
          <Link href="/(app)" asChild>
            <Text className="text-sm font-semibold text-pocket-mint">Back to home</Text>
          </Link>

          <SectionCard eyebrow="Events" title="Sign in to manage trip budgets">
            <Text className="text-sm leading-6 text-white/70">
              This slice uses the real Supabase-backed event and assignment tables, so it stays
              unavailable until the mobile shell has an authenticated user session.
            </Text>
          </SectionCard>
        </ScrollView>
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <ScrollView contentContainerStyle={{ gap: 16, paddingBottom: 32 }}>
        <Link href="/(app)" asChild>
          <Text className="text-sm font-semibold text-pocket-mint">Back to home</Text>
        </Link>

        <SectionCard eyebrow="Events" title="Create and track real event budgets">
          <Text className="text-sm leading-6 text-white/70">
            This first slice uses direct user-owned table CRUD under RLS. Manual assignment is in;
            heuristics and split editing come next.
          </Text>
        </SectionCard>

        {mutationError ? (
          <View className="rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3">
            <Text className="text-sm text-rose-100">{mutationError}</Text>
          </View>
        ) : null}

        <SectionCard eyebrow={editingEventId ? "Edit" : "Create"} title="Event budget details">
          <View className="gap-4">
            <Field label="Title">
              <Input
                value={formState.title}
                onChangeText={(title) => setFormState((current) => ({ ...current, title }))}
                placeholder="Austin weekend"
              />
            </Field>

            <View className="flex-row gap-3">
              <View className="flex-1">
                <Field label="Start date">
                  <Input
                    value={formState.startsOn}
                    onChangeText={(startsOn) => setFormState((current) => ({ ...current, startsOn }))}
                    placeholder="2026-05-12"
                  />
                </Field>
              </View>
              <View className="flex-1">
                <Field label="End date">
                  <Input
                    value={formState.endsOn}
                    onChangeText={(endsOn) => setFormState((current) => ({ ...current, endsOn }))}
                    placeholder="2026-05-15"
                  />
                </Field>
              </View>
            </View>

            <Field label="Target amount">
              <Input
                value={formState.targetAmount}
                onChangeText={(targetAmount) => setFormState((current) => ({ ...current, targetAmount }))}
                keyboardType="decimal-pad"
                placeholder="800"
              />
            </Field>

            <Field label="Notes">
              <Input
                value={formState.notes}
                onChangeText={(notes) => setFormState((current) => ({ ...current, notes }))}
                placeholder="Flights, hotel, and dinners"
                multiline
              />
            </Field>

            <View className="flex-row items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
              <View className="flex-1 pr-4">
                <Text className="text-sm font-semibold text-white">Shared budget</Text>
                <Text className="mt-1 text-sm text-white/60">
                  Shared stays explicit so the daily meter can later include or exclude it
                  deliberately.
                </Text>
              </View>
              <Switch
                value={formState.isShared}
                onValueChange={(isShared) => setFormState((current) => ({ ...current, isShared }))}
                trackColor={{ true: "#9BE7C4" }}
              />
            </View>

            <View className="flex-row gap-3">
              <ActionButton
                label={editingEventId ? "Save changes" : "Create event"}
                onPress={() => {
                  setFormError(null);
                  saveEventMutation.mutate();
                }}
                disabled={saveEventMutation.isPending}
              />
              <ActionButton label="Reset" onPress={resetForm} disabled={saveEventMutation.isPending} subtle />
            </View>
          </View>
        </SectionCard>

        <SectionCard eyebrow="Budgets" title="Active event budgets">
          <View className="gap-4">
            {eventQuery.data.events.length === 0 ? (
              <Text className="text-sm text-white/60">
                No event budgets yet. Create the first one above, then manually assign real
                transactions below.
              </Text>
            ) : null}

            {eventQuery.data.events.map((event) => {
              const assignedSpend = spendByEventId.get(event.id) ?? 0;
              const remaining = Math.max(roundMoney(event.target_amount - assignedSpend), 0);
              const isSelected = event.id === (selectedEvent?.id ?? null);

              return (
                <Pressable
                  key={event.id}
                  onPress={() => setSelectedEventId(event.id)}
                  className={`rounded-3xl border px-4 py-4 ${isSelected ? "border-pocket-mint bg-white/10" : "border-white/10 bg-white/5"}`}
                >
                  <View className="flex-row items-start justify-between gap-3">
                    <View className="flex-1">
                      <Text className="text-base font-semibold text-white">{event.title}</Text>
                      <Text className="mt-1 text-sm text-white/60">
                        {event.starts_on} to {event.ends_on} • {event.is_shared ? "shared" : "personal"}
                      </Text>
                    </View>
                    <Text className="text-sm font-semibold text-pocket-mint">
                      ${event.target_amount.toFixed(0)}
                    </Text>
                  </View>

                  <View className="mt-4 flex-row flex-wrap gap-2">
                    <MetricPill label="Assigned" value={`$${assignedSpend.toFixed(0)}`} />
                    <MetricPill label="Remaining" value={`$${remaining.toFixed(0)}`} />
                    <MetricPill label="Status" value={event.status} />
                  </View>

                  <View className="mt-4 flex-row gap-3">
                    <ActionButton
                      label="Edit"
                      onPress={() => {
                        setEditingEventId(event.id);
                        setSelectedEventId(event.id);
                        setFormState({
                          title: event.title,
                          notes: event.notes ?? "",
                          startsOn: event.starts_on,
                          endsOn: event.ends_on,
                          targetAmount: String(event.target_amount),
                          isShared: event.is_shared,
                          status: event.status
                        });
                        setFormError(null);
                      }}
                      subtle
                    />
                    <ActionButton
                      label="Archive"
                      onPress={() => archiveEventMutation.mutate(event.id)}
                      disabled={archiveEventMutation.isPending}
                      danger
                    />
                  </View>
                </Pressable>
              );
            })}
          </View>
        </SectionCard>

        <SectionCard
          eyebrow="Manual assignment"
          title={selectedEvent ? `Recent transactions for ${selectedEvent.title}` : "Select an event first"}
        >
          {selectedEvent ? (
            <View className="gap-4">
              <View className="rounded-2xl bg-white/5 p-4">
                <View className="flex-row items-center justify-between gap-3">
                  <View className="flex-1 pr-3">
                    <Text className="text-base font-semibold text-white">Suggested matches</Text>
                    <Text className="mt-1 text-sm text-white/60">
                      Server-side heuristics use event dates and merchant or note overlap. Ambiguous
                      matches stay pending until you review them.
                    </Text>
                  </View>
                  <ActionButton
                    label={suggestionQuery.isFetching ? "Refreshing" : "Refresh"}
                    onPress={() => {
                      void refetchSuggestions();
                    }}
                    disabled={suggestionQuery.isFetching}
                    subtle
                  />
                </View>

                <View className="mt-4 gap-3">
                  {suggestionQuery.isLoading ? (
                    <Text className="text-sm text-white/60">Loading suggestions…</Text>
                  ) : null}

                  {!suggestionQuery.isLoading && (suggestionQuery.data?.length ?? 0) === 0 ? (
                    <Text className="text-sm text-white/60">
                      No pending suggestions right now. You can still manually assign transactions
                      below.
                    </Text>
                  ) : null}

                  {(suggestionQuery.data ?? []).map((suggestion) => (
                    <SuggestedAssignmentCard
                      key={suggestion.assignmentId}
                      suggestion={suggestion}
                      events={eventQuery.data.events}
                      onConfirm={() =>
                        reviewSuggestionMutation.mutate({
                          assignmentId: suggestion.assignmentId,
                          reviewStatus: "confirmed"
                        })
                      }
                      onReject={() =>
                        reviewSuggestionMutation.mutate({
                          assignmentId: suggestion.assignmentId,
                          reviewStatus: "rejected"
                        })
                      }
                      disabled={reviewSuggestionMutation.isPending}
                    />
                  ))}
                </View>
              </View>

              {eventQuery.data.transactions.length === 0 ? (
                <Text className="text-sm text-white/60">
                  No recent transactions are available yet. Sync Plaid or add manual transactions
                  before assigning spend.
                </Text>
              ) : null}

              {eventQuery.data.transactions.map((transaction) => {
                const activeAssignment = assignmentByTransactionId.get(transaction.id);
                const assignedEvent =
                  eventQuery.data?.events.find((event) => event.id === activeAssignment?.event_id) ?? null;
                const isAssignedToSelectedEvent = activeAssignment?.event_id === selectedEvent.id;
                const canAssign = !activeAssignment;

                return (
                  <View key={transaction.id} className="rounded-2xl bg-white/5 p-4">
                    <View className="flex-row items-start justify-between gap-3">
                      <View className="flex-1">
                        <Text className="text-base font-medium text-white">
                          {transaction.merchant_name ?? transaction.description ?? "Imported transaction"}
                        </Text>
                        <Text className="mt-1 text-sm text-white/60">
                          {transaction.posted_on} • {transaction.pending ? "pending" : "posted"}
                        </Text>
                      </View>
                      <Text className="text-base font-semibold text-white">
                        ${Math.abs(transaction.amount).toFixed(2)}
                      </Text>
                    </View>

                    <Text className="mt-2 text-sm text-white/55">
                      {isAssignedToSelectedEvent
                        ? "Assigned to this event."
                        : assignedEvent
                          ? `Assigned to ${assignedEvent.title}.`
                          : "Not assigned to any event yet."}
                    </Text>

                    <View className="mt-4 flex-row gap-3">
                      {isAssignedToSelectedEvent ? (
                        <ActionButton
                          label="Remove"
                          onPress={() => unassignMutation.mutate(activeAssignment.id)}
                          disabled={unassignMutation.isPending}
                          danger
                        />
                      ) : (
                        <ActionButton
                          label="Assign"
                          onPress={() =>
                            assignMutation.mutate({
                              eventId: selectedEvent.id,
                              ledgerTransactionId: transaction.id
                            })
                          }
                          disabled={!canAssign || assignMutation.isPending}
                        />
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <Text className="text-sm text-white/60">
              Pick an event budget above to start manually assigning imported transactions.
            </Text>
          )}
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

function ActionButton({
  label,
  onPress,
  disabled = false,
  subtle = false,
  danger = false
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  subtle?: boolean;
  danger?: boolean;
}) {
  const backgroundClass = danger
    ? "bg-rose-500/15 border-rose-400/30"
    : subtle
      ? "bg-white/5 border-white/10"
      : "bg-pocket-mint/15 border-pocket-mint/30";
  const textClass = danger ? "text-rose-100" : subtle ? "text-white" : "text-pocket-mint";

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={`rounded-2xl border px-4 py-3 ${backgroundClass} ${disabled ? "opacity-50" : ""}`}
    >
      <Text className={`text-sm font-semibold ${textClass}`}>{label}</Text>
    </Pressable>
  );
}

function parseEventForm(formState: EventFormState) {
  const parsedTargetAmount = Number(formState.targetAmount);

  return budgetEventEditorSchema.parse({
    title: formState.title,
    notes: formState.notes.trim().length > 0 ? formState.notes.trim() : null,
    startsOn: formState.startsOn,
    endsOn: formState.endsOn,
    targetAmount: Number.isFinite(parsedTargetAmount) ? parsedTargetAmount : Number.NaN,
    status: formState.status,
    isShared: formState.isShared
  });
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

function SuggestedAssignmentCard({
  suggestion,
  events,
  onConfirm,
  onReject,
  disabled
}: {
  suggestion: EventAssignmentSuggestion;
  events: BudgetEventRow[];
  onConfirm: () => void;
  onReject: () => void;
  disabled: boolean;
}) {
  const competingTitles = suggestion.competingEventIds
    .map((eventId) => events.find((event) => event.id === eventId)?.title)
    .filter((value): value is string => Boolean(value));

  return (
    <View className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <Text className="text-base font-medium text-white">
            {suggestion.merchantName ?? suggestion.description ?? "Imported transaction"}
          </Text>
          <Text className="mt-1 text-sm text-white/60">
            {suggestion.postedOn} • confidence {Math.round(suggestion.confidenceScore * 100)}%
          </Text>
        </View>
        <Text className="text-base font-semibold text-white">
          ${Math.abs(suggestion.amount).toFixed(2)}
        </Text>
      </View>

      <View className="mt-3 gap-1">
        {suggestion.rationale.map((reason) => (
          <Text key={reason} className="text-sm text-white/70">
            • {reason}
          </Text>
        ))}
        {competingTitles.length > 0 ? (
          <Text className="text-sm text-amber-200">
            Also matches: {competingTitles.join(", ")}
          </Text>
        ) : null}
      </View>

      <View className="mt-4 flex-row gap-3">
        <ActionButton label="Confirm" onPress={onConfirm} disabled={disabled} />
        <ActionButton label="Reject" onPress={onReject} disabled={disabled} danger />
      </View>
    </View>
  );
}
