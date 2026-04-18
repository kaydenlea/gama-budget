# Mobile Onboarding Flow

## Goals

- explain Gama as a decision layer first and a memory or sharing layer second
- gather only the minimum setup needed for useful daily guidance
- establish trust around privacy and data handling
- let the user reach first value quickly
- reach a first useful answer as early as possible, ideally within the first session
- create one or two clear aha moments before asking for deeper setup

## Recommended Flow

1. Value framing: Safe-to-Spend, overview clarity, event-aware budgeting, and why the product is different from a tracker.
2. Account setup and secure auth.
3. Minimum setup only: enough to produce a first useful answer or simulation result.
4. Prefer inferred or prefilled setup first: linked-account preview, suggested recurring obligations, event candidates, suggested defaults, or simulation before asking the user to configure details manually.
5. First transaction, linked-account preview, event candidate, or simulation to demonstrate immediate feedback.
6. Overview reveal with a clear explanation of what the guidance means, what data it used, and what confidence or freshness limits apply.
7. Deeper setup only after first value: daily budget preference, optional rollover preference, corrections to recurring obligation basics, event preferences, and shared context only if relevant.
8. Optional second aha moment: show how an event can become a useful receipt, map, or story without requiring public sharing.

## Design Notes

Keep onboarding progressive. Avoid requiring the user to fully categorize history before the product becomes useful.
Do not flood the user with multiple insights before the core guidance is trusted.
Prioritize fast comprehension and trust-building over feature education.
Prefer confirmation of sensible defaults over blank-slate configuration.
Do not ask for sharing, location precision, or social publishing preferences before the user has seen private value first.
