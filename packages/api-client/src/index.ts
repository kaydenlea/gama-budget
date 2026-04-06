import {
  type DailyGuidanceRequest,
  type DailyGuidanceResponse,
  dailyGuidanceRequestSchema,
  dailyGuidanceResponseSchema,
  type EventAssignmentSuggestionsRequest,
  type EventAssignmentSuggestionsResponse,
  eventAssignmentSuggestionsRequestSchema,
  eventAssignmentSuggestionsResponseSchema,
  type PlaidLinkTokenRequest,
  type PlaidLinkTokenResponse,
  plaidLinkTokenRequestSchema,
  plaidLinkTokenResponseSchema,
  type PlaidPublicTokenExchangeRequest,
  type PlaidPublicTokenExchangeResponse,
  plaidPublicTokenExchangeRequestSchema,
  plaidPublicTokenExchangeResponseSchema,
  type PlaidTransactionSyncRequest,
  type PlaidTransactionSyncResponse,
  plaidTransactionSyncRequestSchema,
  plaidTransactionSyncResponseSchema,
  type TransactionSimulationInput,
  transactionSimulationSchema
} from "@pocketcurb/schemas";
import type { Database } from "@pocketcurb/supabase-types";

export type PocketCurbFunctionName =
  | "safe-to-spend"
  | "simulate-transaction"
  | "event-assignment-suggestions"
  | "plaid-link-token"
  | "plaid-exchange-public-token"
  | "plaid-sync-transactions";

export type EdgePayload = Record<string, unknown>;

export type EdgeInvoker = <TResponse>(name: PocketCurbFunctionName, payload: EdgePayload) => Promise<TResponse>;

export type PocketCurbApiClient = {
  getDailyGuidance(input: DailyGuidanceRequest): Promise<DailyGuidanceResponse>;
  simulateTransaction(input: TransactionSimulationInput): Promise<{ accepted: true }>;
  listEventAssignmentSuggestions(
    input: EventAssignmentSuggestionsRequest,
  ): Promise<EventAssignmentSuggestionsResponse>;
  createPlaidLinkToken(input?: PlaidLinkTokenRequest): Promise<PlaidLinkTokenResponse>;
  exchangePlaidPublicToken(input: PlaidPublicTokenExchangeRequest): Promise<PlaidPublicTokenExchangeResponse>;
  syncPlaidTransactions(input?: PlaidTransactionSyncRequest): Promise<PlaidTransactionSyncResponse>;
};

export type SupabaseSchemaName = keyof Database;

export function createPocketCurbApiClient(invoke: EdgeInvoker): PocketCurbApiClient {
  return {
    async getDailyGuidance(input) {
      const payload = dailyGuidanceRequestSchema.parse(input);
      const response = await invoke<DailyGuidanceResponse>("safe-to-spend", payload);
      return dailyGuidanceResponseSchema.parse(response);
    },
    async simulateTransaction(input) {
      const payload = transactionSimulationSchema.parse(input);
      await invoke("simulate-transaction", payload);
      return { accepted: true as const };
    },
    async listEventAssignmentSuggestions(input) {
      const payload = eventAssignmentSuggestionsRequestSchema.parse(input);
      const response = await invoke<EventAssignmentSuggestionsResponse>("event-assignment-suggestions", payload);
      return eventAssignmentSuggestionsResponseSchema.parse(response);
    },
    async createPlaidLinkToken(input = {}) {
      const payload = plaidLinkTokenRequestSchema.parse(input);
      const response = await invoke<PlaidLinkTokenResponse>("plaid-link-token", payload);
      return plaidLinkTokenResponseSchema.parse(response);
    },
    async exchangePlaidPublicToken(input) {
      const payload = plaidPublicTokenExchangeRequestSchema.parse(input);
      const response = await invoke<PlaidPublicTokenExchangeResponse>("plaid-exchange-public-token", payload);
      return plaidPublicTokenExchangeResponseSchema.parse(response);
    },
    async syncPlaidTransactions(input = {}) {
      const payload = plaidTransactionSyncRequestSchema.parse(input);
      const response = await invoke<PlaidTransactionSyncResponse>("plaid-sync-transactions", payload);
      return plaidTransactionSyncResponseSchema.parse(response);
    }
  };
}
