import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { handleCorsPreflight } from "../_shared/cors.ts";
import {
  FunctionConfigurationError,
  UnauthorizedFunctionRequestError,
  requireAuthenticatedUser,
  unauthorizedResponse
} from "../_shared/auth.ts";
import {
  deletePendingSuggestedAssignmentsForEvent,
  listAssignmentsForEvents,
  listBudgetEventsForUser,
  listEventSuggestionTransactionsForDateRange,
  readBudgetEventForUser,
  SupabaseRestError,
  upsertSuggestedAssignments
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

type RequestPayload = {
  eventId?: string;
  includeSharedContext?: boolean;
  lookbackDays?: number;
};

type SuggestionEvent = {
  id: string;
  title: string;
  notes: string | null;
  startsOn: string;
  endsOn: string;
  targetAmount: number;
};

type SuggestionTransaction = {
  id: string;
  merchantName: string | null;
  description: string | null;
  postedOn: string;
  amount: number;
};

type SuggestedAssignment = {
  ledgerTransactionId: string;
  confidenceScore: number;
  isAmbiguous: boolean;
  rationale: string[];
  competingEventIds: string[];
};

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function readPayload(payload: unknown): { eventId: string; includeSharedContext: boolean; lookbackDays: number } | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const candidate = payload as RequestPayload;
  const eventId = typeof candidate.eventId === "string" ? candidate.eventId.trim() : "";
  const includeSharedContext =
    typeof candidate.includeSharedContext === "boolean" ? candidate.includeSharedContext : true;
  const lookbackDays =
    typeof candidate.lookbackDays === "number" && Number.isInteger(candidate.lookbackDays)
      ? candidate.lookbackDays
      : 45;

  if (!isUuid(eventId) || lookbackDays < 7 || lookbackDays > 90) {
    return null;
  }

  return {
    eventId,
    includeSharedContext,
    lookbackDays
  };
}

function formatDateIso(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function addUtcDays(dateIso: string, days: number): string {
  const date = new Date(`${dateIso}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return formatDateIso(date);
}

function maxDate(leftIso: string, rightIso: string): string {
  return leftIso >= rightIso ? leftIso : rightIso;
}

function minDate(leftIso: string, rightIso: string): string {
  return leftIso <= rightIso ? leftIso : rightIso;
}

function tokenize(value: string | null | undefined): string[] {
  if (!value) {
    return [];
  }

  return value
    .toLowerCase()
    .split(/[^a-z0-9]+/g)
    .map((token) => token.trim())
    .filter((token) => token.length >= 3);
}

function unique(values: string[]): string[] {
  return [...new Set(values)];
}

function roundScore(value: number): number {
  return Number(Math.max(0, Math.min(1, value)).toFixed(2));
}

function dateDistanceInDays(leftIso: string, rightIso: string): number {
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  const leftTime = new Date(`${leftIso}T00:00:00.000Z`).getTime();
  const rightTime = new Date(`${rightIso}T00:00:00.000Z`).getTime();
  return Math.round(Math.abs(leftTime - rightTime) / millisecondsPerDay);
}

function scoreTransactionForEvent(event: SuggestionEvent, transaction: SuggestionTransaction) {
  const rationale: string[] = [];
  let score = 0;
  const eventTokens = unique([...tokenize(event.title), ...tokenize(event.notes)]);
  const transactionTokens = unique([
    ...tokenize(transaction.merchantName),
    ...tokenize(transaction.description)
  ]);
  const overlappingTokens = eventTokens.filter((token) => transactionTokens.includes(token));
  const daysFromStart = dateDistanceInDays(event.startsOn, transaction.postedOn);
  const daysFromEnd = dateDistanceInDays(event.endsOn, transaction.postedOn);
  const withinEventWindow = transaction.postedOn >= event.startsOn && transaction.postedOn <= event.endsOn;

  if (withinEventWindow) {
    score += 0.45;
    rationale.push("Transaction posted during the event window.");
  } else if (Math.min(daysFromStart, daysFromEnd) <= 3) {
    score += 0.2;
    rationale.push("Transaction posted within three days of the event window.");
  }

  if (overlappingTokens.length > 0) {
    score += Math.min(0.35, 0.18 + overlappingTokens.length * 0.08);
    rationale.push(`Matched event keywords: ${overlappingTokens.slice(0, 3).join(", ")}.`);
  }

  if (Math.abs(transaction.amount) <= Math.max(event.targetAmount, 1)) {
    score += 0.1;
    rationale.push("Transaction amount is plausible for the event budget.");
  }

  return {
    eventId: event.id,
    score: roundScore(score),
    rationale
  };
}

function suggestAssignmentsForEvent(
  selectedEventId: string,
  events: SuggestionEvent[],
  transactions: SuggestionTransaction[],
): SuggestedAssignment[] {
  const selectedEvent = events.find((event) => event.id === selectedEventId);
  if (!selectedEvent) {
    return [];
  }

  const suggestions: SuggestedAssignment[] = [];

  for (const transaction of transactions) {
    if (transaction.amount <= 0) {
      continue;
    }

    const candidates = events
      .map((event) => scoreTransactionForEvent(event, transaction))
      .filter((candidate) => candidate.score >= 0.45)
      .sort((left, right) => right.score - left.score);

    if (candidates.length === 0) {
      continue;
    }

    const selectedCandidate = candidates.find((candidate) => candidate.eventId === selectedEventId);
    if (!selectedCandidate) {
      continue;
    }

    const topCandidate = candidates[0];
    const competingCandidates = candidates.filter(
      (candidate) =>
        candidate.eventId !== selectedEventId && Math.abs(candidate.score - selectedCandidate.score) <= 0.12,
    );

    if (topCandidate && topCandidate.eventId !== selectedEventId && selectedCandidate.score < topCandidate.score) {
      continue;
    }

    suggestions.push({
      ledgerTransactionId: transaction.id,
      confidenceScore: selectedCandidate.score,
      isAmbiguous: competingCandidates.length > 0,
      rationale: [
        ...selectedCandidate.rationale,
        ...(competingCandidates.length > 0
          ? [
              `Also matches ${competingCandidates
                .map((candidate) => events.find((event) => event.id === candidate.eventId)?.title ?? "another event")
                .join(", ")}.`
            ]
          : [])
      ],
      competingEventIds: competingCandidates.map((candidate) => candidate.eventId)
    });
  }

  return suggestions.sort((left, right) => right.confidenceScore - left.confidenceScore);
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

    const rateLimit = await enforceFunctionRateLimit("event-assignment-suggestions", authenticatedUser.userId);
    if (!rateLimit.allowed) {
      return tooManyRequestsResponse(request);
    }

    const payload = readPayload(await request.json().catch(() => null));
    if (!payload) {
      return jsonResponse({ error: "Invalid request" }, 400, request);
    }

    const selectedEvent = await readBudgetEventForUser(authenticatedUser.userId, payload.eventId);
    if (!selectedEvent || selectedEvent.status !== "active") {
      return jsonResponse({ error: "Invalid request" }, 400, request);
    }

    const activeEvents = await listBudgetEventsForUser(authenticatedUser.userId, payload.includeSharedContext);
    const evaluationEvents = [
      selectedEvent,
      ...activeEvents.filter((event) => event.id !== selectedEvent.id)
    ];

    const todayIso = formatDateIso(new Date());
    const lookbackStartIso = formatDateIso(new Date(Date.now() - payload.lookbackDays * 24 * 60 * 60 * 1000));
    const transactionStartIso = minDate(lookbackStartIso, addUtcDays(selectedEvent.starts_on, -3));
    const transactionEndIso = maxDate(todayIso, addUtcDays(selectedEvent.ends_on, 3));

    const [transactions, allAssignments] = await Promise.all([
      listEventSuggestionTransactionsForDateRange(authenticatedUser.userId, transactionStartIso, transactionEndIso),
      listAssignmentsForEvents(
        authenticatedUser.userId,
        evaluationEvents.map((event) => event.id)
      )
    ]);

    const confirmedTransactionIds = new Set(
      allAssignments
        .filter((assignment) => assignment.review_status === "confirmed")
        .map((assignment) => assignment.ledger_transaction_id)
    );
    const rejectedForSelectedEvent = new Set(
      allAssignments
        .filter(
          (assignment) => assignment.event_id === selectedEvent.id && assignment.review_status === "rejected"
        )
        .map((assignment) => assignment.ledger_transaction_id)
    );

    const suggestions = suggestAssignmentsForEvent(
      selectedEvent.id,
      evaluationEvents.map((event) => ({
        id: event.id,
        title: event.title,
        notes: event.notes,
        startsOn: event.starts_on,
        endsOn: event.ends_on,
        targetAmount: event.target_amount
      })),
      transactions
        .filter(
          (transaction) =>
            !confirmedTransactionIds.has(transaction.id) && !rejectedForSelectedEvent.has(transaction.id)
        )
        .map((transaction) => ({
          id: transaction.id,
          merchantName: transaction.merchant_name,
          description: transaction.description,
          postedOn: transaction.posted_on,
          amount: transaction.amount
        }))
    );

    await deletePendingSuggestedAssignmentsForEvent(authenticatedUser.userId, selectedEvent.id);

    await upsertSuggestedAssignments(
      suggestions.map((suggestion) => ({
        user_id: authenticatedUser.userId,
        event_id: selectedEvent.id,
        ledger_transaction_id: suggestion.ledgerTransactionId,
        assignment_source: "suggested" as const,
        review_status: "pending" as const,
        confidence_score: suggestion.confidenceScore,
        is_ambiguous: suggestion.isAmbiguous,
        rationale: suggestion.rationale,
        assignment_note: null,
        reviewed_at: null
      }))
    );

    const persistedAssignments = await listAssignmentsForEvents(authenticatedUser.userId, [selectedEvent.id]);
    const persistedAssignmentByTransactionId = new Map(
      persistedAssignments
        .filter(
          (assignment) =>
            assignment.event_id === selectedEvent.id &&
            assignment.assignment_source === "suggested" &&
            assignment.review_status === "pending" &&
            assignment.id
        )
        .map((assignment) => [assignment.ledger_transaction_id, assignment])
    );
    const transactionById = new Map(transactions.map((transaction) => [transaction.id, transaction]));

    return jsonResponse(
      {
        eventId: selectedEvent.id,
        generatedAt: new Date().toISOString(),
        suggestions: suggestions
          .map((suggestion) => {
            const assignment = persistedAssignmentByTransactionId.get(suggestion.ledgerTransactionId);
            const transaction = transactionById.get(suggestion.ledgerTransactionId);
            if (!assignment?.id || !transaction) {
              return null;
            }

            return {
              assignmentId: assignment.id,
              eventId: selectedEvent.id,
              ledgerTransactionId: suggestion.ledgerTransactionId,
              merchantName: transaction.merchant_name,
              description: transaction.description,
              postedOn: transaction.posted_on,
              amount: transaction.amount,
              confidenceScore: suggestion.confidenceScore,
              isAmbiguous: suggestion.isAmbiguous,
              rationale: suggestion.rationale,
              competingEventIds: suggestion.competingEventIds,
              reviewStatus: "pending"
            };
          })
          .filter((suggestion) => suggestion !== null)
      },
      200,
      request
    );
  } catch (error) {
    if (error instanceof UnauthorizedFunctionRequestError) {
      return unauthorizedResponse(request);
    }

    if (error instanceof FunctionConfigurationError) {
      console.error("event-assignment-suggestions auth misconfiguration", error.message);
      return userSafeServerErrorResponse(request);
    }

    if (error instanceof SensitiveFunctionRateLimitNotImplementedError) {
      console.error("event-assignment-suggestions release blocker", error.message);
      return userSafeServerErrorResponse(request);
    }

    if (error instanceof SupabaseRestError) {
      console.error("event-assignment-suggestions Supabase failure", error.status, error.message);
      return userSafeServerErrorResponse(request);
    }

    console.error("event-assignment-suggestions unexpected failure", error);
    return userSafeServerErrorResponse(request);
  }
});
