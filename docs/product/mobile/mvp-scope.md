# Mobile MVP Scope

## Included

- Safe-to-Spend computation and display
- Daily Spending Meter and daily budget setting
- first-session onboarding that reaches a useful answer quickly and explains why the guidance can be trusted
- frictionless capture and correction paths through linked data, simulation, and low-friction manual entry
- inference-first setup through suggested obligations, prefills, and event grouping before deeper manual configuration
- transaction entry and purchase simulation
- today's transaction feed
- lightweight running-balance awareness on primary decision surfaces
- event or trip auto-grouping with editable assignment
- ambiguous-assignment flagging
- shared split handling and reimbursement-aware tracking
- privacy toggle for shared contexts and personal autonomy
- rollover budgeting
- week or month forward-looking view with upcoming obligations and insights
- proactive guidance cues when daily spending or upcoming obligations materially change short-term safety

## Explicitly Deferred

- multi-currency support
- voice capture
- investments and asset tracking
- full FIRE planning mode
- deeper running-balance analytics beyond the first trust-building surfaces
- advanced profile personalization beyond early guidance defaults
- business and tax planning depth
- spreadsheet import and export polish
- local-only mode as the default
- advanced automation beyond MVP confidence thresholds

## Scope Discipline

If a feature does not materially improve daily clarity, forward-looking guidance, reimbursement correctness, or privacy-first trust, it should not displace MVP work.

If an insight or automation surface requires trust the product has not yet earned, it should be simplified, delayed, or shown only after the user has already reached a clear first answer.

Core resilience is not deferred. MVP should already fail safely, preserve usefulness during stale or partial data conditions, and keep manual fallback available even though full offline-first and local-first modes remain out of scope.

Manual setup should be treated as a cost, not a neutral default. The MVP should prefer inferring, pre-filling, or suggesting wherever doing so does not weaken trust.
