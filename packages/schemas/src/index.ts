import { z } from "zod";

export const moneyAmountSchema = z.object({
  currency: z.literal("USD"),
  value: z.number().finite()
});

export const transactionSimulationSchema = z.object({
  amount: z.number().positive(),
  merchant: z.string().trim().min(1),
  dateISO: z.string().datetime(),
  notes: z.string().trim().max(280).optional(),
  eventId: z.string().trim().min(1).optional(),
  isShared: z.boolean().default(false),
  reimbursementExpected: z.boolean().default(false)
});

export const dailyGuidanceRequestSchema = z.object({
  householdId: z.string().trim().min(1).optional(),
  includeSharedContext: z.boolean().default(true)
});

export const dailyGuidanceResponseSchema = z.object({
  safeToSpendToday: z.number().min(0),
  recommendedDailyBudget: z.number().min(0),
  runningBalance: z.number(),
  crisisCushion: z.number().min(0),
  dailySpendingMeter: z.enum(["comfortable", "watch", "tight"])
});

export const plaidLinkTokenRequestSchema = z.object({});

export const plaidLinkTokenResponseSchema = z.object({
  linkToken: z.string().trim().min(1),
  expirationISO: z.string().datetime(),
  requestId: z.string().trim().min(1)
});

export const plaidPublicTokenExchangeRequestSchema = z.object({
  publicToken: z.string().trim().min(1)
});

export const plaidPublicTokenExchangeResponseSchema = z.object({
  connected: z.literal(true),
  itemId: z.string().trim().min(1),
  requestId: z.string().trim().min(1)
});

export const plaidTransactionSyncRequestSchema = z.object({
  itemId: z.string().trim().min(1).optional()
});

export const plaidTransactionSyncItemResultSchema = z.object({
  itemId: z.string().trim().min(1),
  institutionName: z.string().trim().min(1).nullable(),
  status: z.enum(["synced", "failed"]),
  added: z.number().int().min(0),
  modified: z.number().int().min(0),
  removed: z.number().int().min(0),
  accountsUpserted: z.number().int().min(0),
  nextCursor: z.string().trim().min(1).nullable(),
  error: z.string().trim().min(1).nullable()
});

export const plaidTransactionSyncResponseSchema = z.object({
  syncedItems: z.number().int().min(0),
  failedItems: z.number().int().min(0),
  results: z.array(plaidTransactionSyncItemResultSchema)
});

export const budgetSettingsSchema = z.object({
  protectedBuffer: z.number().min(0),
  defaultDailyBudget: z.number().min(0),
  rolloverEnabled: z.boolean(),
  defaultCurrency: z.literal("USD")
});

export const financialAccountSchema = z.object({
  id: z.string().uuid(),
  provider: z.enum(["manual", "plaid"]),
  externalAccountId: z.string().trim().min(1).nullable(),
  providerItemId: z.string().trim().min(1).nullable(),
  institutionName: z.string().trim().min(1).nullable(),
  officialName: z.string().trim().min(1).nullable(),
  displayName: z.string().trim().min(1),
  mask: z.string().trim().min(1).max(8).nullable(),
  accountType: z.string().trim().min(1).nullable(),
  accountSubtype: z.string().trim().min(1).nullable(),
  currencyCode: z.literal("USD"),
  currentBalance: z.number().finite().nullable(),
  availableBalance: z.number().finite().nullable(),
  accountStatus: z.enum(["active", "inactive", "disconnected"]),
  lastSyncedAt: z.string().datetime().nullable()
});

export const ledgerTransactionSchema = z.object({
  id: z.string().uuid(),
  financialAccountId: z.string().uuid().nullable(),
  source: z.enum(["manual", "plaid"]),
  externalTransactionId: z.string().trim().min(1).nullable(),
  amount: z.number().finite().refine((value) => value !== 0, "Amount must be non-zero"),
  currencyCode: z.literal("USD"),
  merchantName: z.string().trim().min(1).nullable(),
  description: z.string().trim().min(1).nullable(),
  postedOn: z.string().date(),
  authorizedAt: z.string().datetime().nullable(),
  pending: z.boolean(),
  pendingExternalTransactionId: z.string().trim().min(1).nullable(),
  categoryLabels: z.array(z.string().trim().min(1)),
  userNote: z.string().trim().min(1).nullable()
});

export const budgetEventSchema = z
  .object({
    id: z.string().uuid(),
    title: z.string().trim().min(1).max(120),
    notes: z.string().trim().max(1000).nullable(),
    startsOn: z.string().date(),
    endsOn: z.string().date(),
    targetAmount: z.number().min(0),
    status: z.enum(["active", "completed", "archived", "cancelled"]),
    isShared: z.boolean(),
    archivedAt: z.string().datetime().nullable()
  })
  .refine((value) => value.endsOn >= value.startsOn, {
    message: "Event end date must be on or after the start date",
    path: ["endsOn"]
  });

export const budgetEventEditorSchema = z
  .object({
    title: z.string().trim().min(1).max(120),
    notes: z.string().trim().max(1000).nullable(),
    startsOn: z.string().date(),
    endsOn: z.string().date(),
    targetAmount: z.number().min(0),
    status: z.enum(["active", "completed", "archived", "cancelled"]).default("active"),
    isShared: z.boolean().default(false)
  })
  .refine((value) => value.endsOn >= value.startsOn, {
    message: "Event end date must be on or after the start date",
    path: ["endsOn"]
  });

export const eventAssignmentSuggestionsRequestSchema = z.object({
  eventId: z.string().uuid(),
  includeSharedContext: z.boolean().default(true),
  lookbackDays: z.number().int().min(7).max(90).default(45)
});

export const eventAssignmentSuggestionSchema = z.object({
  assignmentId: z.string().uuid(),
  eventId: z.string().uuid(),
  ledgerTransactionId: z.string().uuid(),
  merchantName: z.string().trim().min(1).nullable(),
  description: z.string().trim().min(1).nullable(),
  postedOn: z.string().date(),
  amount: z.number().finite(),
  confidenceScore: z.number().min(0).max(1),
  isAmbiguous: z.boolean(),
  rationale: z.array(z.string().trim().min(1)).min(1),
  competingEventIds: z.array(z.string().uuid()),
  reviewStatus: z.enum(["pending", "confirmed", "rejected"])
});

export const eventAssignmentSuggestionsResponseSchema = z.object({
  eventId: z.string().uuid(),
  generatedAt: z.string().datetime(),
  suggestions: z.array(eventAssignmentSuggestionSchema)
});

export const eventTransactionAssignmentSchema = z.object({
  id: z.string().uuid(),
  eventId: z.string().uuid(),
  ledgerTransactionId: z.string().uuid(),
  assignmentSource: z.enum(["manual", "suggested"]),
  reviewStatus: z.enum(["pending", "confirmed", "rejected"]),
  confidenceScore: z.number().min(0).max(1).nullable(),
  isAmbiguous: z.boolean(),
  rationale: z.array(z.string().trim().min(1)),
  assignmentNote: z.string().trim().max(500).nullable(),
  reviewedAt: z.string().datetime().nullable()
});

export const manualEventAssignmentSchema = z.object({
  eventId: z.string().uuid(),
  ledgerTransactionId: z.string().uuid(),
  assignmentNote: z.string().trim().max(500).nullable().optional()
});

export const transactionSplitSchema = z.object({
  id: z.string().uuid(),
  ledgerTransactionId: z.string().uuid(),
  eventId: z.string().uuid().nullable(),
  splitAmount: z.number().finite().refine((value) => value !== 0, "Split amount must be non-zero"),
  splitKind: z.enum(["event", "shared", "manual_adjustment"]),
  notes: z.string().trim().max(500).nullable()
});

export type TransactionSimulationInput = z.infer<typeof transactionSimulationSchema>;
export type DailyGuidanceRequest = z.infer<typeof dailyGuidanceRequestSchema>;
export type DailyGuidanceResponse = z.infer<typeof dailyGuidanceResponseSchema>;
export type PlaidLinkTokenRequest = z.infer<typeof plaidLinkTokenRequestSchema>;
export type PlaidLinkTokenResponse = z.infer<typeof plaidLinkTokenResponseSchema>;
export type PlaidPublicTokenExchangeRequest = z.infer<typeof plaidPublicTokenExchangeRequestSchema>;
export type PlaidPublicTokenExchangeResponse = z.infer<typeof plaidPublicTokenExchangeResponseSchema>;
export type PlaidTransactionSyncRequest = z.infer<typeof plaidTransactionSyncRequestSchema>;
export type PlaidTransactionSyncResponse = z.infer<typeof plaidTransactionSyncResponseSchema>;
export type BudgetSettings = z.infer<typeof budgetSettingsSchema>;
export type FinancialAccount = z.infer<typeof financialAccountSchema>;
export type LedgerTransaction = z.infer<typeof ledgerTransactionSchema>;
export type BudgetEvent = z.infer<typeof budgetEventSchema>;
export type BudgetEventEditor = z.infer<typeof budgetEventEditorSchema>;
export type EventAssignmentSuggestionsRequest = z.infer<typeof eventAssignmentSuggestionsRequestSchema>;
export type EventAssignmentSuggestion = z.infer<typeof eventAssignmentSuggestionSchema>;
export type EventAssignmentSuggestionsResponse = z.infer<typeof eventAssignmentSuggestionsResponseSchema>;
export type EventTransactionAssignment = z.infer<typeof eventTransactionAssignmentSchema>;
export type ManualEventAssignment = z.infer<typeof manualEventAssignmentSchema>;
export type TransactionSplit = z.infer<typeof transactionSplitSchema>;
