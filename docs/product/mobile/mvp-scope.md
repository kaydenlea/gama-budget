# Mobile MVP Scope

## Included

- Overview page with Safe-to-Spend, category budgets, recent transactions inbox, event timeline, and upcoming transactions
- Cash Flow page with net flow, inflow versus outflow, and short-term forecast
- Bills and Recurring page with settled, due soon, and unresolved items
- Accounts page with balances, assets, debts, and account-level overview
- Transactions page with chronological, category, and event organization
- transaction map where merchant and location confidence are strong enough to be trustworthy
- global Quick Add for manual transaction entry, event creation, split setup, and reimbursement notes
- first-session onboarding that reaches a useful answer quickly and explains why the guidance can be trusted
- frictionless capture and correction paths through linked data, simulation, and low-friction manual entry
- inference-first setup through suggested obligations, prefills, and event grouping before deeper manual configuration
- lightweight running-balance awareness on primary decision surfaces
- event or trip auto-grouping with editable assignment
- ambiguous-assignment flagging
- Event Details page with category budgets, collaborators, total budget, favorite spots, and map view
- curated digital receipt generation from event transactions
- opt-in sharing of event receipts and summaries
- private-by-default weekly money story with quick actions
- shared split handling and reimbursement-aware tracking
- privacy controls for shared contexts and social artifacts
- rollover budgeting
- proactive guidance cues when daily spending, bills, or event pressure materially change short-term safety

## Explicitly Deferred

- public profiles, follows, comments, or a broad social feed
- public continuous sharing of raw transactions
- exact public location sharing by default
- multi-currency support
- voice capture
- investments and asset-planning depth beyond the accounts summary
- full FIRE planning mode
- deeper running-balance analytics beyond the first trust-building surfaces
- advanced profile personalization beyond early guidance defaults
- business and tax planning depth
- spreadsheet import and export polish
- local-only mode as the default
- advanced automation beyond MVP confidence thresholds
- merchant monetization or affiliate recommendation flows

## Scope Discipline

If a feature does not materially improve daily clarity, forward-looking guidance, event usefulness, reimbursement correctness, or privacy-first trust, it should not displace MVP work.

If a social surface requires trust the product has not yet earned, it should be simplified, delayed, or kept private by default.

Core resilience is not deferred. MVP should already fail safely, preserve usefulness during stale or partial data conditions, and keep manual fallback available even though full offline-first and local-first modes remain out of scope.

Manual setup should be treated as a cost, not a neutral default. The MVP should prefer inferring, pre-filling, or suggesting wherever doing so does not weaken trust.
