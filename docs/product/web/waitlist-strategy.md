# Waitlist Strategy

## Purpose

The waitlist should measure demand, capture high-intent users, and gather structured insight about which jobs and social-artifact use cases are strongest.

## Data to Collect

- email
- primary pain point
- whether the user is solo, shared household, event organizer, or frequent traveler
- optional interest in event receipts, weekly stories, or place maps
- optional FIRE or long-term-planning interest
- optional consent for research follow-up

## Follow-Up Strategy

- immediate confirmation and expectation setting
- segmented follow-up based on pain point and event or social-artifact interest
- invite selected users into research or alpha access
- maintain disclosure-safe messaging and privacy expectations

## Next Steps

1. Keep the current intake form in controlled launch-readiness mode until deployment, sender-domain, monitoring, retention, and abuse-control review is complete.
2. Update the shared waitlist schema and Supabase storage contract if the captured fields expand to include social-artifact interest, FIRE or long-term-planning interest, or separate research follow-up consent.
3. Align persona options across product copy, form controls, validation, and database constraints. The strategy should distinguish solo users, shared households, event organizers, and frequent travelers.
4. Make consent explicit in the UI. Marketing or product-update consent should stay separate from optional research follow-up consent.
5. Maintain clear confirmation, duplicate-signup, validation-error, rate-limited, and temporary-unavailable states in the form UI.
6. Re-review waitlist and privacy copy before public promotion so users know what is stored, why it is stored, and what follow-up they may receive.
7. Add durable production rate limiting or bot protection for the public waitlist endpoint before routing meaningful real traffic to it.
8. Decide whether email-provider failures should block a successful signup response after storage has already succeeded.
9. Verify the production email sender domain, deployment environment variables, Supabase table policy, and live route behavior before launch.
10. Keep referral mechanics out of the day-one launch unless later acquisition data shows that the conversion fundamentals are already strong and growth is bottlenecked by distribution.

## Open Decision

Current recommendation: do not add referral gamification on day one.

Rationale: the early goal is signal quality and trust, not vanity growth mechanics. Referral mechanics are especially risky for a money product that now includes social-adjacent features.

What would change the decision: a demonstrated acquisition bottleneck after messaging and conversion fundamentals are already strong.
