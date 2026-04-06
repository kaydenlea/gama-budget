import { readRequiredFunctionEnv } from "./env.ts";

export class SupabaseRestError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

export type PlaidItemUpsertRecord = {
  user_id: string;
  plaid_item_id: string;
  access_token: string;
  institution_id: string | null;
  institution_name: string | null;
  available_products: string[];
  billed_products: string[];
  products: string[];
  item_status: "active" | "needs_attention" | "revoked";
  error_code: string | null;
  error_type: string | null;
  error_message: string | null;
  consent_expires_at: string | null;
};

export type BudgetSettingsRecord = {
  user_id: string;
  protected_buffer: number;
  default_daily_budget: number;
  rollover_enabled: boolean;
  default_currency: string;
};

export type PlaidItemRecord = PlaidItemUpsertRecord & {
  id: string;
  transactions_cursor: string | null;
  last_transactions_sync_started_at: string | null;
  last_transactions_sync_completed_at: string | null;
  last_transactions_sync_error: string | null;
};

export type FinancialAccountRecord = {
  id: string;
  external_account_id: string | null;
};

export type FinancialAccountBalanceRecord = {
  user_id: string;
  provider: "manual" | "plaid";
  external_account_id: string | null;
  provider_item_id: string | null;
  institution_name: string | null;
  official_name: string | null;
  display_name: string;
  mask: string | null;
  account_type: string | null;
  account_subtype: string | null;
  currency_code: string;
  current_balance: number | null;
  available_balance: number | null;
  account_status: "active" | "inactive" | "disconnected";
  last_synced_at: string | null;
};

export type FinancialAccountWrite = {
  user_id: string;
  provider: "plaid";
  external_account_id: string;
  provider_item_id: string;
  institution_name: string | null;
  official_name: string | null;
  display_name: string;
  mask: string | null;
  account_type: string | null;
  account_subtype: string | null;
  currency_code: string;
  current_balance: number | null;
  available_balance: number | null;
  account_status: "active" | "inactive" | "disconnected";
  last_synced_at: string;
};

export type LedgerTransactionRecord = {
  id: string;
  external_transaction_id: string | null;
};

export type LedgerTransactionSliceRecord = {
  id: string;
  amount: number;
  posted_on: string;
  pending: boolean;
};

export type LedgerTransactionWrite = {
  user_id: string;
  financial_account_id: string | null;
  source: "plaid";
  external_transaction_id: string;
  amount: number;
  currency_code: string;
  merchant_name: string | null;
  description: string | null;
  posted_on: string;
  authorized_at: string | null;
  pending: boolean;
  pending_external_transaction_id: string | null;
  category_labels: string[];
};

export type BudgetEventRecord = {
  id: string;
  title: string;
  notes: string | null;
  target_amount: number;
  starts_on: string;
  ends_on: string;
  is_shared: boolean;
  status: "active" | "completed" | "archived" | "cancelled";
};

export type EventTransactionAssignmentRecord = {
  id?: string;
  event_id: string;
  ledger_transaction_id: string;
  assignment_source?: "manual" | "suggested";
  confidence_score?: number | null;
  is_ambiguous?: boolean;
  rationale?: string[];
  assignment_note?: string | null;
  review_status: "pending" | "confirmed" | "rejected";
  reviewed_at?: string | null;
};

export type TransactionSplitRecord = {
  ledger_transaction_id: string;
  event_id: string | null;
  split_amount: number;
  split_kind: "event" | "shared" | "manual_adjustment";
};

export type EventSuggestionLedgerTransactionRecord = {
  id: string;
  amount: number;
  posted_on: string;
  pending: boolean;
  merchant_name: string | null;
  description: string | null;
};

export type SuggestedAssignmentWrite = {
  user_id: string;
  event_id: string;
  ledger_transaction_id: string;
  assignment_source: "suggested";
  review_status: "pending";
  confidence_score: number;
  is_ambiguous: boolean;
  rationale: string[];
  assignment_note: null;
  reviewed_at: null;
};

function readSupabaseRestConfig() {
  const supabaseUrl = readRequiredFunctionEnv("SUPABASE_URL");
  const serviceRoleKey = readRequiredFunctionEnv("SUPABASE_SERVICE_ROLE_KEY");

  return {
    restUrl: new URL("/rest/v1", `${supabaseUrl}/`).toString().replace(/\/$/, ""),
    serviceRoleKey
  };
}

async function supabaseRestRequest<TResponse>(
  path: string,
  init: RequestInit = {},
): Promise<TResponse> {
  const { restUrl, serviceRoleKey } = readSupabaseRestConfig();
  const response = await fetch(`${restUrl}${path}`, {
    ...init,
    headers: {
      apikey: serviceRoleKey,
      authorization: `Bearer ${serviceRoleKey}`,
      ...init.headers
    }
  });

  if (!response.ok) {
    const payload = await response.text();
    throw new SupabaseRestError(payload || `Supabase REST request failed for ${path}`, response.status);
  }

  if (response.status === 204) {
    return undefined as TResponse;
  }

  const payload = await response.text();
  if (!payload.trim()) {
    return undefined as TResponse;
  }

  return JSON.parse(payload) as TResponse;
}

function quoteInList(values: string[]): string {
  return `(${values.map((value) => `"${value}"`).join(",")})`;
}

function chunkValues<TValue>(values: TValue[], size: number): TValue[][] {
  const chunks: TValue[][] = [];

  for (let index = 0; index < values.length; index += size) {
    chunks.push(values.slice(index, index + size));
  }

  return chunks;
}

const ledgerTransactionExternalIdChunkSize = 50;
const idChunkSize = 50;

export async function readBudgetSettingsForUser(userId: string): Promise<BudgetSettingsRecord | null> {
  const params = new URLSearchParams({
    select: "user_id,protected_buffer,default_daily_budget,rollover_enabled,default_currency",
    user_id: `eq.${userId}`,
    limit: "1"
  });

  const records = await supabaseRestRequest<BudgetSettingsRecord[]>(`/budget_settings?${params.toString()}`);
  return records[0] ?? null;
}

export async function upsertPlaidItem(record: PlaidItemUpsertRecord): Promise<void> {
  await supabaseRestRequest<void>("/plaid_items?on_conflict=plaid_item_id", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      prefer: "resolution=merge-duplicates,return=minimal"
    },
    body: JSON.stringify(record)
  });
}

export async function listPlaidItemsForUser(userId: string, plaidItemId?: string): Promise<PlaidItemRecord[]> {
  const params = new URLSearchParams({
    select: [
      "id",
      "user_id",
      "plaid_item_id",
      "access_token",
      "institution_id",
      "institution_name",
      "available_products",
      "billed_products",
      "products",
      "item_status",
      "error_code",
      "error_type",
      "error_message",
      "consent_expires_at",
      "transactions_cursor",
      "last_transactions_sync_started_at",
      "last_transactions_sync_completed_at",
      "last_transactions_sync_error"
    ].join(","),
    user_id: `eq.${userId}`
  });

  if (plaidItemId) {
    params.set("plaid_item_id", `eq.${plaidItemId}`);
  }

  return supabaseRestRequest<PlaidItemRecord[]>(`/plaid_items?${params.toString()}`);
}

export async function updatePlaidItemState(
  userId: string,
  plaidItemId: string,
  patch: Record<string, unknown>,
): Promise<void> {
  const params = new URLSearchParams({
    user_id: `eq.${userId}`,
    plaid_item_id: `eq.${plaidItemId}`
  });

  await supabaseRestRequest<void>(`/plaid_items?${params.toString()}`, {
    method: "PATCH",
    headers: {
      "content-type": "application/json",
      prefer: "return=minimal"
    },
    body: JSON.stringify(patch)
  });
}

export async function listFinancialAccountsForPlaidItem(
  userId: string,
  plaidItemId: string,
): Promise<FinancialAccountRecord[]> {
  const params = new URLSearchParams({
    select: "id,external_account_id",
    user_id: `eq.${userId}`,
    provider: "eq.plaid",
    provider_item_id: `eq.${plaidItemId}`
  });

  return supabaseRestRequest<FinancialAccountRecord[]>(`/financial_accounts?${params.toString()}`);
}

export async function listActiveFinancialAccountsForUser(userId: string): Promise<FinancialAccountBalanceRecord[]> {
  const params = new URLSearchParams({
    select: [
      "user_id",
      "provider",
      "external_account_id",
      "provider_item_id",
      "institution_name",
      "official_name",
      "display_name",
      "mask",
      "account_type",
      "account_subtype",
      "currency_code",
      "current_balance",
      "available_balance",
      "account_status",
      "last_synced_at"
    ].join(","),
    user_id: `eq.${userId}`,
    account_status: "eq.active"
  });

  return supabaseRestRequest<FinancialAccountBalanceRecord[]>(`/financial_accounts?${params.toString()}`);
}

export async function createFinancialAccount(record: FinancialAccountWrite): Promise<void> {
  await supabaseRestRequest<void>("/financial_accounts", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      prefer: "return=minimal"
    },
    body: JSON.stringify(record)
  });
}

export async function updateFinancialAccount(
  userId: string,
  id: string,
  patch: Partial<FinancialAccountWrite>,
): Promise<void> {
  const params = new URLSearchParams({
    user_id: `eq.${userId}`,
    id: `eq.${id}`
  });

  await supabaseRestRequest<void>(`/financial_accounts?${params.toString()}`, {
    method: "PATCH",
    headers: {
      "content-type": "application/json",
      prefer: "return=minimal"
    },
    body: JSON.stringify(patch)
  });
}

export async function listLedgerTransactionsByExternalIds(
  userId: string,
  externalTransactionIds: string[],
): Promise<LedgerTransactionRecord[]> {
  if (externalTransactionIds.length === 0) {
    return [];
  }

  const chunks = chunkValues(externalTransactionIds, ledgerTransactionExternalIdChunkSize);
  const records: LedgerTransactionRecord[] = [];

  for (const chunk of chunks) {
    const params = new URLSearchParams({
      select: "id,external_transaction_id",
      user_id: `eq.${userId}`,
      source: "eq.plaid",
      external_transaction_id: `in.${quoteInList(chunk)}`
    });

    records.push(...(await supabaseRestRequest<LedgerTransactionRecord[]>(`/ledger_transactions?${params.toString()}`)));
  }

  return records;
}

export async function listLedgerTransactionsByIds(
  userId: string,
  transactionIds: string[],
): Promise<LedgerTransactionSliceRecord[]> {
  if (transactionIds.length === 0) {
    return [];
  }

  const chunks = chunkValues(transactionIds, idChunkSize);
  const records: LedgerTransactionSliceRecord[] = [];

  for (const chunk of chunks) {
    const params = new URLSearchParams({
      select: "id,amount,posted_on,pending",
      user_id: `eq.${userId}`,
      id: `in.${quoteInList(chunk)}`
    });

    records.push(...(await supabaseRestRequest<LedgerTransactionSliceRecord[]>(`/ledger_transactions?${params.toString()}`)));
  }

  return records;
}

export async function listLedgerTransactionsForDateRange(
  userId: string,
  startDate: string,
  endDate: string,
): Promise<LedgerTransactionSliceRecord[]> {
  const params = new URLSearchParams({
    select: "id,amount,posted_on,pending",
    user_id: `eq.${userId}`,
    posted_on: `gte.${startDate}`,
    order: "posted_on.asc"
  });
  params.append("posted_on", `lte.${endDate}`);

  return supabaseRestRequest<LedgerTransactionSliceRecord[]>(`/ledger_transactions?${params.toString()}`);
}

export async function listEventSuggestionTransactionsForDateRange(
  userId: string,
  startDate: string,
  endDate: string,
): Promise<EventSuggestionLedgerTransactionRecord[]> {
  const params = new URLSearchParams({
    select: "id,amount,posted_on,pending,merchant_name,description",
    user_id: `eq.${userId}`,
    posted_on: `gte.${startDate}`,
    order: "posted_on.desc"
  });
  params.append("posted_on", `lte.${endDate}`);

  return supabaseRestRequest<EventSuggestionLedgerTransactionRecord[]>(`/ledger_transactions?${params.toString()}`);
}

export async function listBudgetEventsForUser(userId: string, includeSharedContext: boolean): Promise<BudgetEventRecord[]> {
  const params = new URLSearchParams({
    select: "id,title,notes,target_amount,starts_on,ends_on,is_shared,status",
    user_id: `eq.${userId}`,
    status: "eq.active",
    order: "starts_on.asc"
  });

  if (!includeSharedContext) {
    params.set("is_shared", "eq.false");
  }

  return supabaseRestRequest<BudgetEventRecord[]>(`/budget_events?${params.toString()}`);
}

export async function readBudgetEventForUser(userId: string, eventId: string): Promise<BudgetEventRecord | null> {
  const params = new URLSearchParams({
    select: "id,title,notes,target_amount,starts_on,ends_on,is_shared,status",
    user_id: `eq.${userId}`,
    id: `eq.${eventId}`,
    limit: "1"
  });

  const records = await supabaseRestRequest<BudgetEventRecord[]>(`/budget_events?${params.toString()}`);
  return records[0] ?? null;
}

export async function listConfirmedAssignmentsForEvents(
  userId: string,
  eventIds: string[],
): Promise<EventTransactionAssignmentRecord[]> {
  if (eventIds.length === 0) {
    return [];
  }

  const chunks = chunkValues(eventIds, idChunkSize);
  const records: EventTransactionAssignmentRecord[] = [];

  for (const chunk of chunks) {
    const params = new URLSearchParams({
      select: "event_id,ledger_transaction_id,review_status",
      user_id: `eq.${userId}`,
      review_status: "eq.confirmed",
      event_id: `in.${quoteInList(chunk)}`
    });

    records.push(...(await supabaseRestRequest<EventTransactionAssignmentRecord[]>(`/event_transaction_assignments?${params.toString()}`)));
  }

  return records;
}

export async function listAssignmentsForEvents(
  userId: string,
  eventIds: string[],
): Promise<EventTransactionAssignmentRecord[]> {
  if (eventIds.length === 0) {
    return [];
  }

  const chunks = chunkValues(eventIds, idChunkSize);
  const records: EventTransactionAssignmentRecord[] = [];

  for (const chunk of chunks) {
    const params = new URLSearchParams({
      select: [
        "id",
        "event_id",
        "ledger_transaction_id",
        "assignment_source",
        "confidence_score",
        "is_ambiguous",
        "rationale",
        "assignment_note",
        "review_status",
        "reviewed_at"
      ].join(","),
      user_id: `eq.${userId}`,
      event_id: `in.${quoteInList(chunk)}`
    });

    records.push(...(await supabaseRestRequest<EventTransactionAssignmentRecord[]>(`/event_transaction_assignments?${params.toString()}`)));
  }

  return records;
}

export async function listTransactionSplitsForEvents(
  userId: string,
  eventIds: string[],
): Promise<TransactionSplitRecord[]> {
  if (eventIds.length === 0) {
    return [];
  }

  const chunks = chunkValues(eventIds, idChunkSize);
  const records: TransactionSplitRecord[] = [];

  for (const chunk of chunks) {
    const params = new URLSearchParams({
      select: "ledger_transaction_id,event_id,split_amount,split_kind",
      user_id: `eq.${userId}`,
      event_id: `in.${quoteInList(chunk)}`
    });

    records.push(...(await supabaseRestRequest<TransactionSplitRecord[]>(`/transaction_splits?${params.toString()}`)));
  }

  return records;
}

export async function createLedgerTransaction(record: LedgerTransactionWrite): Promise<void> {
  await supabaseRestRequest<void>("/ledger_transactions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      prefer: "return=minimal"
    },
    body: JSON.stringify(record)
  });
}

export async function updateLedgerTransaction(
  userId: string,
  id: string,
  patch: Partial<LedgerTransactionWrite>,
): Promise<void> {
  const params = new URLSearchParams({
    user_id: `eq.${userId}`,
    id: `eq.${id}`
  });

  await supabaseRestRequest<void>(`/ledger_transactions?${params.toString()}`, {
    method: "PATCH",
    headers: {
      "content-type": "application/json",
      prefer: "return=minimal"
    },
    body: JSON.stringify(patch)
  });
}

export async function deleteLedgerTransactionsByExternalIds(userId: string, externalTransactionIds: string[]): Promise<void> {
  if (externalTransactionIds.length === 0) {
    return;
  }

  const chunks = chunkValues(externalTransactionIds, ledgerTransactionExternalIdChunkSize);

  for (const chunk of chunks) {
    const params = new URLSearchParams({
      user_id: `eq.${userId}`,
      source: "eq.plaid",
      external_transaction_id: `in.${quoteInList(chunk)}`
    });

    await supabaseRestRequest<void>(`/ledger_transactions?${params.toString()}`, {
      method: "DELETE",
      headers: {
        prefer: "return=minimal"
      }
    });
  }
}

export async function deletePendingSuggestedAssignmentsForEvent(userId: string, eventId: string): Promise<void> {
  const params = new URLSearchParams({
    user_id: `eq.${userId}`,
    event_id: `eq.${eventId}`,
    assignment_source: "eq.suggested",
    review_status: "eq.pending"
  });

  await supabaseRestRequest<void>(`/event_transaction_assignments?${params.toString()}`, {
    method: "DELETE",
    headers: {
      prefer: "return=minimal"
    }
  });
}

export async function upsertSuggestedAssignments(records: SuggestedAssignmentWrite[]): Promise<void> {
  if (records.length === 0) {
    return;
  }

  await supabaseRestRequest<void>("/event_transaction_assignments?on_conflict=event_id,ledger_transaction_id", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      prefer: "resolution=merge-duplicates,return=minimal"
    },
    body: JSON.stringify(records)
  });
}
