# Mobile Onboarding Flow

## Goals

- explain PocketCurb as a decision layer, not another chore app
- gather only the minimum setup needed for useful daily guidance
- establish trust around privacy and data handling
- let the user reach first value quickly
- reach a first useful answer as early as possible, ideally within the first session
- create one or two clear aha moments before asking for deeper setup

## Recommended Flow

1. Value framing: Safe-to-Spend, Daily Spending Meter, forward-looking clarity, and why the product is different from a tracker.
2. Account setup and secure auth.
3. Minimum setup only: enough to produce a first useful answer or simulation result.
4. Prefer inferred or prefilled setup first: linked-account preview, suggested recurring obligations, suggested defaults, or simulation before asking the user to configure details manually.
5. First transaction, linked-account preview, or simulation to demonstrate immediate feedback.
6. Home screen reveal with a clear explanation of what the guidance means, what data it used, and what confidence or freshness limits apply.
7. Deeper setup only after first value: daily budget preference, optional rollover preference, corrections to recurring obligation basics, and shared context only if relevant.

## Design Notes

Keep onboarding progressive. Avoid requiring the user to fully categorize history before the product becomes useful.
Do not flood the user with multiple insights before the core guidance is trusted.
Prioritize fast comprehension and trust-building over feature education.
Prefer confirmation of sensible defaults over blank-slate configuration.
