export type CurrencyCode = "USD";

export type MoneyAmount = {
  currency: CurrencyCode;
  value: number;
};

export type CashFlowWindow = {
  daysRemaining: number;
  scheduledInflow: number;
  scheduledOutflow: number;
  protectedBuffer: number;
  availableCash: number;
};

export type SafeToSpendSnapshot = {
  safeToSpendToday: number;
  recommendedDailyBudget: number;
  crisisCushion: number;
  projectedEndOfWindowBalance: number;
};

export type SpendingMeterStatus = "comfortable" | "watch" | "tight";

export type SpendingMeter = {
  status: SpendingMeterStatus;
  remainingToday: number;
  guidanceLabel: string;
};

export type TimelineEvent = {
  id: string;
  label: string;
  amount: number;
  dateISO: string;
  kind: "bill" | "income" | "event" | "reimbursement";
};

export type EventSuggestionEvent = {
  id: string;
  title: string;
  notes: string | null;
  startsOn: string;
  endsOn: string;
  targetAmount: number;
};

export type EventSuggestionTransaction = {
  id: string;
  merchantName: string | null;
  description: string | null;
  postedOn: string;
  amount: number;
};

export type SuggestedEventAssignment = {
  eventId: string;
  ledgerTransactionId: string;
  confidenceScore: number;
  isAmbiguous: boolean;
  rationale: string[];
  competingEventIds: string[];
};

export function calculateSafeToSpend(window: CashFlowWindow): SafeToSpendSnapshot {
  const projectedEndOfWindowBalance =
    window.availableCash + window.scheduledInflow - window.scheduledOutflow - window.protectedBuffer;
  const safeToSpendPool = Math.max(projectedEndOfWindowBalance, 0);
  const recommendedDailyBudget =
    window.daysRemaining > 0 ? Number((safeToSpendPool / window.daysRemaining).toFixed(2)) : safeToSpendPool;

  return {
    safeToSpendToday: recommendedDailyBudget,
    recommendedDailyBudget,
    crisisCushion: Number((window.availableCash - safeToSpendPool).toFixed(2)),
    projectedEndOfWindowBalance: Number(projectedEndOfWindowBalance.toFixed(2))
  };
}

export function deriveDailySpendingMeter(snapshot: SafeToSpendSnapshot): SpendingMeter {
  if (snapshot.safeToSpendToday >= 60) {
    return {
      status: "comfortable",
      remainingToday: snapshot.safeToSpendToday,
      guidanceLabel: "Comfortable runway"
    };
  }

  if (snapshot.safeToSpendToday >= 20) {
    return {
      status: "watch",
      remainingToday: snapshot.safeToSpendToday,
      guidanceLabel: "Watch spend today"
    };
  }

  return {
    status: "tight",
    remainingToday: Math.max(snapshot.safeToSpendToday, 0),
    guidanceLabel: "Tight cash-flow day"
  };
}

export function sortTimeline(events: TimelineEvent[]): TimelineEvent[] {
  return [...events].sort((left, right) => left.dateISO.localeCompare(right.dateISO));
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

function dateDistanceInDays(leftIso: string, rightIso: string): number {
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  const leftTime = new Date(`${leftIso}T00:00:00.000Z`).getTime();
  const rightTime = new Date(`${rightIso}T00:00:00.000Z`).getTime();
  return Math.round(Math.abs(leftTime - rightTime) / millisecondsPerDay);
}

function roundScore(value: number): number {
  return Number(Math.max(0, Math.min(1, value)).toFixed(2));
}

type CandidateScore = {
  eventId: string;
  score: number;
  rationale: string[];
};

function scoreTransactionForEvent(
  event: EventSuggestionEvent,
  transaction: EventSuggestionTransaction,
): CandidateScore {
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
  } else {
    const nearestDistance = Math.min(daysFromStart, daysFromEnd);
    if (nearestDistance <= 3) {
      score += 0.2;
      rationale.push("Transaction posted within three days of the event window.");
    }
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

export function suggestEventAssignments(
  selectedEventId: string,
  events: EventSuggestionEvent[],
  transactions: EventSuggestionTransaction[],
): SuggestedEventAssignment[] {
  const selectedEvent = events.find((event) => event.id === selectedEventId);
  if (!selectedEvent) {
    return [];
  }

  const suggestions: SuggestedEventAssignment[] = [];

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
      eventId: selectedEvent.id,
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
