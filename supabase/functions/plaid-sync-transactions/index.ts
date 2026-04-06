import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { handleCorsPreflight } from "../_shared/cors.ts";
import {
  FunctionConfigurationError,
  UnauthorizedFunctionRequestError,
  requireAuthenticatedUser,
  unauthorizedResponse
} from "../_shared/auth.ts";
import {
  PlaidApiError,
  postPlaid,
  readPlaidConfig,
  type PlaidAccountsGetResponse,
  type PlaidInstitutionGetByIdResponse,
  type PlaidItemGetResponse,
  type PlaidTransaction,
  type PlaidTransactionsSyncResponse
} from "../_shared/plaid.ts";
import { jsonResponse, methodNotAllowedResponse, tooManyRequestsResponse, userSafeServerErrorResponse } from "../_shared/response.ts";
import {
  createFinancialAccount,
  createLedgerTransaction,
  deleteLedgerTransactionsByExternalIds,
  listFinancialAccountsForPlaidItem,
  listLedgerTransactionsByExternalIds,
  listPlaidItemsForUser,
  type PlaidItemRecord,
  SupabaseRestError,
  updateFinancialAccount,
  updateLedgerTransaction,
  updatePlaidItemState
} from "../_shared/supabase-rest.ts";
import {
  enforceFunctionRateLimit,
  SensitiveFunctionRateLimitNotImplementedError
} from "../_shared/rate-limit.ts";

type SyncItemResult = {
  itemId: string;
  institutionName: string | null;
  status: "synced" | "failed";
  added: number;
  modified: number;
  removed: number;
  accountsUpserted: number;
  nextCursor: string | null;
  error: string | null;
};

const PLAID_SYNC_COUNT = 500;

function normalizeCurrencyCode(isoCurrencyCode?: string | null, unofficialCurrencyCode?: string | null): string {
  return isoCurrencyCode ?? unofficialCurrencyCode ?? "USD";
}

function normalizeCategoryLabels(transaction: PlaidTransaction): string[] {
  const labels = new Set<string>();

  if (transaction.personal_finance_category?.primary) {
    labels.add(transaction.personal_finance_category.primary);
  }

  if (transaction.personal_finance_category?.detailed) {
    labels.add(transaction.personal_finance_category.detailed);
  }

  for (const label of transaction.category ?? []) {
    const trimmed = label.trim();
    if (trimmed) {
      labels.add(trimmed);
    }
  }

  return [...labels];
}

async function syncTransactionsPage(accessToken: string, cursor: string | null): Promise<PlaidTransactionsSyncResponse> {
  return postPlaid<PlaidTransactionsSyncResponse>("/transactions/sync", {
    access_token: accessToken,
    cursor: cursor ?? undefined,
    count: PLAID_SYNC_COUNT
  });
}

async function collectTransactionUpdates(accessToken: string, initialCursor: string | null) {
  let restartAttempts = 0;

  while (restartAttempts < 2) {
    const originalCursor = initialCursor;
    let cursor = initialCursor;
    const added: PlaidTransaction[] = [];
    const modified: PlaidTransaction[] = [];
    const removed: string[] = [];

    try {
      while (true) {
        const page = await syncTransactionsPage(accessToken, cursor);
        added.push(...page.added);
        modified.push(...page.modified);
        removed.push(...page.removed.map((entry) => entry.transaction_id));
        cursor = page.next_cursor;

        if (!page.has_more) {
          return {
            added,
            modified,
            removed,
            nextCursor: cursor
          };
        }
      }
    } catch (error) {
      if (
        error instanceof PlaidApiError &&
        error.plaidErrorCode === "TRANSACTIONS_SYNC_MUTATION_DURING_PAGINATION"
      ) {
        restartAttempts += 1;
        cursor = originalCursor;
        continue;
      }

      throw error;
    }
  }

  throw new PlaidApiError(
    "Plaid transactions changed during pagination too many times",
    409,
    "TRANSACTIONS_SYNC_MUTATION_DURING_PAGINATION",
    "TRANSACTIONS_ERROR",
  );
}

async function readInstitutionName(institutionId: string | null): Promise<string | null> {
  if (!institutionId) {
    return null;
  }

  const config = readPlaidConfig();
  const response = await postPlaid<PlaidInstitutionGetByIdResponse>("/institutions/get_by_id", {
    institution_id: institutionId,
    country_codes: config.countryCodes
  });

  return response.institution.name;
}

async function syncSingleItem(userId: string, item: PlaidItemRecord): Promise<SyncItemResult> {
  const syncStartedAt = new Date().toISOString();
  await updatePlaidItemState(userId, item.plaid_item_id, {
    last_transactions_sync_started_at: syncStartedAt,
    last_transactions_sync_error: null
  });

  try {
    const accountsResponse = await postPlaid<PlaidAccountsGetResponse>("/accounts/get", {
      access_token: item.access_token
    });

    const itemResponse = await postPlaid<PlaidItemGetResponse>("/item/get", {
      access_token: item.access_token
    });

    const institutionId = itemResponse.item.institution_id ?? accountsResponse.item.institution_id ?? item.institution_id;
    const institutionName = institutionId ? await readInstitutionName(institutionId) : item.institution_name;

    const existingAccounts = await listFinancialAccountsForPlaidItem(userId, item.plaid_item_id);
    const existingAccountByExternalId = new Map(
      existingAccounts
        .filter((account) => account.external_account_id)
        .map((account) => [account.external_account_id as string, account]),
    );
    const seenExternalAccountIds = new Set(accountsResponse.accounts.map((account) => account.account_id));

    for (const account of accountsResponse.accounts) {
      const write = {
        user_id: userId,
        provider: "plaid" as const,
        external_account_id: account.account_id,
        provider_item_id: item.plaid_item_id,
        institution_name: institutionName,
        official_name: account.official_name ?? null,
        display_name: account.name,
        mask: account.mask ?? null,
        account_type: account.type ?? null,
        account_subtype: account.subtype ?? null,
        currency_code: normalizeCurrencyCode(
          account.balances.iso_currency_code,
          account.balances.unofficial_currency_code,
        ),
        current_balance: account.balances.current ?? null,
        available_balance: account.balances.available ?? null,
        account_status: "active" as const,
        last_synced_at: syncStartedAt
      };

      const existing = existingAccountByExternalId.get(account.account_id);
      if (existing) {
        await updateFinancialAccount(userId, existing.id, write);
      } else {
        await createFinancialAccount(write);
      }
    }

    for (const existingAccount of existingAccounts) {
      if (!existingAccount.external_account_id || seenExternalAccountIds.has(existingAccount.external_account_id)) {
        continue;
      }

      await updateFinancialAccount(userId, existingAccount.id, {
        account_status: "inactive",
        last_synced_at: syncStartedAt
      });
    }

    const refreshedAccounts = await listFinancialAccountsForPlaidItem(userId, item.plaid_item_id);
    const localAccountIdByExternalId = new Map(
      refreshedAccounts
        .filter((account) => account.external_account_id)
        .map((account) => [account.external_account_id as string, account.id]),
    );

    const updates = await collectTransactionUpdates(item.access_token, item.transactions_cursor);
    const upsertTransactions = [...updates.added, ...updates.modified];
    const existingTransactions = await listLedgerTransactionsByExternalIds(
      userId,
      upsertTransactions.map((transaction) => transaction.transaction_id),
    );
    const existingTransactionByExternalId = new Map(
      existingTransactions
        .filter((transaction) => transaction.external_transaction_id)
        .map((transaction) => [transaction.external_transaction_id as string, transaction.id]),
    );

    for (const transaction of upsertTransactions) {
      const write = {
        user_id: userId,
        financial_account_id: localAccountIdByExternalId.get(transaction.account_id) ?? null,
        source: "plaid" as const,
        external_transaction_id: transaction.transaction_id,
        amount: transaction.amount,
        currency_code: normalizeCurrencyCode(transaction.iso_currency_code, transaction.unofficial_currency_code),
        merchant_name: transaction.merchant_name ?? null,
        description: transaction.name || null,
        posted_on: transaction.date,
        authorized_at: transaction.authorized_datetime ?? null,
        pending: transaction.pending,
        pending_external_transaction_id: transaction.pending_transaction_id ?? null,
        category_labels: normalizeCategoryLabels(transaction)
      };

      const existingId = existingTransactionByExternalId.get(transaction.transaction_id);
      if (existingId) {
        await updateLedgerTransaction(userId, existingId, write);
      } else {
        await createLedgerTransaction(write);
      }
    }

    await deleteLedgerTransactionsByExternalIds(userId, updates.removed);

    const syncCompletedAt = new Date().toISOString();
    await updatePlaidItemState(userId, item.plaid_item_id, {
      institution_id: institutionId,
      institution_name: institutionName,
      available_products: itemResponse.item.available_products ?? item.available_products,
      billed_products: itemResponse.item.billed_products ?? item.billed_products,
      products: itemResponse.item.products ?? item.products,
      item_status: itemResponse.item.error ? "needs_attention" : "active",
      error_code: itemResponse.item.error?.error_code ?? null,
      error_type: itemResponse.item.error?.error_type ?? null,
      error_message: itemResponse.item.error?.error_message ?? null,
      consent_expires_at: itemResponse.item.consent_expiration_time ?? null,
      transactions_cursor: updates.nextCursor,
      last_transactions_sync_completed_at: syncCompletedAt,
      last_transactions_sync_error: null
    });

    return {
      itemId: item.plaid_item_id,
      institutionName,
      status: "synced",
      added: updates.added.length,
      modified: updates.modified.length,
      removed: updates.removed.length,
      accountsUpserted: accountsResponse.accounts.length,
      nextCursor: updates.nextCursor,
      error: null
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Plaid sync failed";
    await updatePlaidItemState(userId, item.plaid_item_id, {
      item_status: "needs_attention",
      last_transactions_sync_error: message
    });

    return {
      itemId: item.plaid_item_id,
      institutionName: item.institution_name,
      status: "failed",
      added: 0,
      modified: 0,
      removed: 0,
      accountsUpserted: 0,
      nextCursor: item.transactions_cursor,
      error: message
    };
  }
}

Deno.serve(async (request: Request): Promise<Response> => {
  try {
    const preflight = handleCorsPreflight(request);
    if (preflight) {
      return preflight;
    }

    if (request.method !== "POST") {
      return methodNotAllowedResponse(request);
    }

    const authenticatedUser = await requireAuthenticatedUser(request);
    const rateLimit = await enforceFunctionRateLimit("plaid-sync-transactions", authenticatedUser.userId);
    if (!rateLimit.allowed) {
      return tooManyRequestsResponse(request);
    }

    const rawPayload = await request.json().catch(() => null);
    const requestedItemId =
      rawPayload && typeof rawPayload.itemId === "string" ? rawPayload.itemId.trim() : undefined;

    const items = await listPlaidItemsForUser(authenticatedUser.userId, requestedItemId);
    if (items.length === 0) {
      return jsonResponse(
        {
          syncedItems: 0,
          failedItems: 0,
          results: []
        },
        200,
        request,
      );
    }

    const results: SyncItemResult[] = [];
    for (const item of items) {
      results.push(await syncSingleItem(authenticatedUser.userId, item));
    }

    return jsonResponse(
      {
        syncedItems: results.filter((result) => result.status === "synced").length,
        failedItems: results.filter((result) => result.status === "failed").length,
        results
      },
      200,
      request,
    );
  } catch (error) {
    if (error instanceof UnauthorizedFunctionRequestError) {
      return unauthorizedResponse(request);
    }

    if (error instanceof FunctionConfigurationError) {
      console.error("plaid-sync-transactions auth misconfiguration", error.message);
      return userSafeServerErrorResponse(request);
    }

    if (error instanceof SupabaseRestError) {
      console.error("plaid-sync-transactions Supabase REST failure", error.status, error.message);
      return userSafeServerErrorResponse(request);
    }

    if (error instanceof PlaidApiError) {
      console.error("plaid-sync-transactions Plaid failure", error.status, error.plaidErrorType, error.plaidErrorCode);
      return jsonResponse({ error: "Plaid transactions could not be synchronized" }, 502, request);
    }

    if (error instanceof SensitiveFunctionRateLimitNotImplementedError) {
      console.error("plaid-sync-transactions release blocker", error.message);
      return userSafeServerErrorResponse(request);
    }

    console.error("plaid-sync-transactions unexpected failure", error);
    return userSafeServerErrorResponse(request);
  }
});
