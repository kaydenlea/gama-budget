import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { handleCorsPreflight } from "../_shared/cors.ts";
import {
  FunctionConfigurationError,
  UnauthorizedFunctionRequestError,
  requireAuthenticatedUser,
  unauthorizedResponse
} from "../_shared/auth.ts";
import {
  listActiveFinancialAccountsForUser,
  listBudgetEventsForUser,
  listConfirmedAssignmentsForEvents,
  listLedgerTransactionsByIds,
  listLedgerTransactionsForDateRange,
  listTransactionSplitsForEvents,
  readBudgetSettingsForUser,
  SupabaseRestError
} from "../_shared/supabase-rest.ts";
import {
  jsonResponse,
  methodNotAllowedResponse,
  tooManyRequestsResponse,
  userSafeServerErrorResponse
} from "../_shared/response.ts";
import {
  enforceFunctionRateLimit,
  SensitiveFunctionRateLimitNotImplementedError
} from "../_shared/rate-limit.ts";

function roundMoney(value: number): number {
  return Number(value.toFixed(2));
}

function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function endOfUtcMonth(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0));
}

function formatDateIso(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function countInclusiveDays(start: Date, end: Date): number {
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  return Math.max(1, Math.floor((end.getTime() - start.getTime()) / millisecondsPerDay) + 1);
}

function readIncludeSharedContext(requestPayload: unknown): boolean {
  if (
    requestPayload &&
    typeof requestPayload === "object" &&
    "includeSharedContext" in requestPayload &&
    typeof requestPayload.includeSharedContext === "boolean"
  ) {
    return requestPayload.includeSharedContext;
  }

  return true;
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

    const rateLimit = await enforceFunctionRateLimit("safe-to-spend", authenticatedUser.userId);
    if (!rateLimit.allowed) {
      return tooManyRequestsResponse(request);
    }

    const payload = await request.json().catch(() => null);
    const includeSharedContext = readIncludeSharedContext(payload);
    const now = new Date();
    const today = startOfUtcDay(now);
    const monthEnd = endOfUtcMonth(now);
    const todayIso = formatDateIso(today);

    const [budgetSettings, activeAccounts, activeEvents, todayTransactions] = await Promise.all([
      readBudgetSettingsForUser(authenticatedUser.userId),
      listActiveFinancialAccountsForUser(authenticatedUser.userId),
      listBudgetEventsForUser(authenticatedUser.userId, includeSharedContext),
      listLedgerTransactionsForDateRange(authenticatedUser.userId, todayIso, todayIso)
    ]);

    const availableCash = roundMoney(
      activeAccounts.reduce((total, account) => {
        const balance = account.available_balance ?? account.current_balance ?? 0;
        return total + balance;
      }, 0),
    );

    const protectedBuffer = roundMoney(budgetSettings?.protected_buffer ?? 0);
    const defaultDailyBudget = roundMoney(budgetSettings?.default_daily_budget ?? 0);
    const daysRemaining = countInclusiveDays(today, monthEnd);

    const relevantEvents = activeEvents.filter((event) => event.ends_on >= todayIso);
    const relevantEventIds = relevantEvents.map((event) => event.id);
    const [confirmedAssignments, eventSplits] = await Promise.all([
      listConfirmedAssignmentsForEvents(authenticatedUser.userId, relevantEventIds),
      listTransactionSplitsForEvents(authenticatedUser.userId, relevantEventIds)
    ]);

    const splitAmountByEvent = new Map<string, number>();
    const ledgerTransactionIdsWithEventSplits = new Set<string>();
    for (const split of eventSplits) {
      if (split.event_id == null) {
        continue;
      }

      ledgerTransactionIdsWithEventSplits.add(split.ledger_transaction_id);
      splitAmountByEvent.set(
        split.event_id,
        roundMoney((splitAmountByEvent.get(split.event_id) ?? 0) + Math.abs(split.split_amount)),
      );
    }

    const unsplitAssignedTransactions = confirmedAssignments.filter(
      (assignment) => !ledgerTransactionIdsWithEventSplits.has(assignment.ledger_transaction_id),
    );
    const assignedTransactionAmounts = await listLedgerTransactionsByIds(
      authenticatedUser.userId,
      [...new Set(unsplitAssignedTransactions.map((assignment) => assignment.ledger_transaction_id))],
    );
    const ledgerTransactionAmountById = new Map(
      assignedTransactionAmounts.map((transaction) => [transaction.id, transaction.amount]),
    );

    const assignedAmountByEvent = new Map<string, number>(splitAmountByEvent);
    for (const assignment of unsplitAssignedTransactions) {
      const transactionAmount = ledgerTransactionAmountById.get(assignment.ledger_transaction_id);
      if (transactionAmount == null) {
        continue;
      }

      assignedAmountByEvent.set(
        assignment.event_id,
        roundMoney((assignedAmountByEvent.get(assignment.event_id) ?? 0) + Math.max(transactionAmount, 0)),
      );
    }

    const reservedEventOutflow = roundMoney(
      relevantEvents.reduce((total, event) => {
        const assignedAmount = assignedAmountByEvent.get(event.id) ?? 0;
        return total + Math.max(roundMoney(event.target_amount - assignedAmount), 0);
      }, 0),
    );

    const todayNetSpend = roundMoney(
      Math.max(
        todayTransactions.reduce((total, transaction) => total + transaction.amount, 0),
        0,
      ),
    );

    const projectedEndOfWindowBalance = roundMoney(availableCash - reservedEventOutflow - protectedBuffer);
    const safeToSpendPool = Math.max(projectedEndOfWindowBalance, 0);
    const uncappedRecommendedDailyBudget = roundMoney(safeToSpendPool / daysRemaining);
    const recommendedDailyBudget =
      defaultDailyBudget > 0
        ? Math.min(uncappedRecommendedDailyBudget, defaultDailyBudget)
        : uncappedRecommendedDailyBudget;
    const safeToSpendToday = roundMoney(Math.max(recommendedDailyBudget - todayNetSpend, 0));
    const crisisCushion = roundMoney(Math.max(availableCash - safeToSpendPool, 0));

    const dailySpendingMeter =
      safeToSpendToday >= 60 ? "comfortable" : safeToSpendToday >= 20 ? "watch" : "tight";

    return jsonResponse(
      {
        safeToSpendToday,
        recommendedDailyBudget: roundMoney(recommendedDailyBudget),
        runningBalance: projectedEndOfWindowBalance,
        crisisCushion,
        dailySpendingMeter
      },
      200,
      request,
    );
  } catch (error) {
    if (error instanceof UnauthorizedFunctionRequestError) {
      return unauthorizedResponse(request);
    }

    if (error instanceof FunctionConfigurationError) {
      console.error("safe-to-spend auth misconfiguration", error.message);
      return userSafeServerErrorResponse(request);
    }

    if (error instanceof SensitiveFunctionRateLimitNotImplementedError) {
      console.error("safe-to-spend release blocker", error.message);
      return userSafeServerErrorResponse(request);
    }

    if (error instanceof SupabaseRestError) {
      console.error("safe-to-spend Supabase read failure", error.status, error.message);
      return userSafeServerErrorResponse(request);
    }

    console.error("safe-to-spend unexpected failure", error);
    return userSafeServerErrorResponse(request);
  }
});
