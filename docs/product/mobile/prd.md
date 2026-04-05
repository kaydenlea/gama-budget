# 1. Header

- Document title: PocketCurb Mobile MVP PRD
- Owner(s): PocketCurb Product and Founding Team
- Status: Finalized working PRD for MVP planning
- Date/version: 2026-04-04 / v1.0
- Product area: Mobile app, short-term clarity and shared-spend decision layer
- Linked docs:
  - [../shared/mission.md](../shared/mission.md)
  - [../shared/product-thesis.md](../shared/product-thesis.md)
  - [../shared/personas-and-use-cases.md](../shared/personas-and-use-cases.md)
  - [../shared/success-metrics.md](../shared/success-metrics.md)
  - [mvp-scope.md](./mvp-scope.md)
  - [roadmap.md](./roadmap.md)

# 2. Executive Summary

PocketCurb MVP is a mobile-first, decision-first personal finance product for people who want short-term spending clarity without category homework, spreadsheet glue, or shame-driven budgeting rituals. The MVP is designed for users who need to answer "Am I safe to spend right now?" and "What does this purchase change?" while also handling messy real-life cases such as reimbursements, event spending, and partially shared household finances.

The strategic goal is not to beat incumbent budgeting tools on feature count. The goal is to remove the admin work those tools still leave behind and replace retrospective cleanup with forward-looking guidance. The MVP centers on a trusted Safe-to-Spend number, a Daily Spending Meter, lightweight running-balance awareness, a forward-looking week or month cash-flow view, and limited but elegant shared-spending support with privacy controls. Event-aware spending organization is part of the MVP because it makes this clarity layer easier to maintain and gives the product a more differentiated narrative-intelligence angle than category-heavy competitors.

This matters now because users still face fragmentation tax across multiple apps and spreadsheets, sync distrust, category fatigue, reimbursement distortion, and guilt-heavy finance UX. The MVP should prove that short-term clarity, shared-spend correctness, and helpful guidance can create a calmer, more trusted personal finance experience than traditional trackers.

# 3. Problem Statement

Users do not primarily need another mirror that shows where money went. They need a decision layer that tells them what is safe to do next.

Current finance tools still fail in several predictable ways:

- They optimize for retrospective categorization and reporting instead of near-term decisions.
- They impose admin residue through category cleanup, rule tuning, reconciliation, and spreadsheet backstops.
- They handle shared spending and reimbursements as awkward side cases, which distorts both budget truth and household trust.
- They often fail to give reliable forward-looking cash-flow visibility, running-balance awareness, or actionable daily guidance.
- They often create guilt and avoidance instead of confidence and clarity.

The market gap is strongest where three pains overlap:

- short-term uncertainty about what is safe to spend
- shared or reimbursed spending that breaks simple budgeting logic
- distrust of cloud-heavy, sync-fragile, manually intensive workflows

The opportunity is to reduce personal finance admin work by turning fragmented transaction history into clear, near-term guidance. PocketCurb should win by answering the user's decision question with enough trust, flexibility, and privacy to replace spreadsheet-plus-app workarounds.

# 4. Target Users and Use Cases

## Primary Users

- Clarity Seekers: individuals who are financially responsible but avoid traditional budgeting because it feels like homework, guilt, or maintenance.
- Shared-Spend Operators: users who routinely mix personal, shared, and reimbursable spending with a partner, roommate, or household and need clarity without surrendering autonomy.

## Secondary Users

- FIRE-Minded Planners who want daily decisions and short-term cash flow to connect to longer-term goals later, but who should not force the MVP into a long-horizon planning product.
- Spreadsheet fallback users who want more control and trust than typical budget apps provide, but who still want less manual effort than a full spreadsheet ritual.

## Core Jobs To Be Done

- Tell me whether I am safe to spend today or this week.
- Show me what upcoming obligations and recent choices changed about that answer.
- Let me simulate a purchase before I make it.
- Keep shared expenses and reimbursements from breaking my budget picture.
- Organize irregular spending into meaningful events without creating maintenance work.
- Preserve personal privacy inside a shared-money context.

## Contexts and Trust Needs

- Users may have linked accounts, manual entries, or both. The product must remain useful even when external sync is late, partial, or unavailable.
- Users need short-term confidence, not just historical reports.
- Users want helpful friction: enough interaction to preserve awareness, but not enough to turn the app into homework.
- Shared-finance users need transparency and autonomy at the same time.
- Finance advice-adjacent product behavior must feel cautious, explainable, and non-judgmental.

## Key MVP Use Cases

- Morning check-in: "What is safe to spend today?"
- Pre-purchase check: "If I spend this now, what changes this week?"
- Upcoming-obligation review: "Can I still cover bills, subscriptions, or planned event spending?"
- Shared-expense correction: "I paid first, but part of this is shared or reimbursable."
- Event planning: "What is this trip or event actually costing me?"
- Privacy-sensitive household view: "Show the right shared picture without exposing every personal detail."

# 5. Product Objectives and Success Metrics

## Product Goals

- Deliver trusted short-term spending clarity with minimal manual cleanup.
- Make Safe-to-Spend and the Daily Spending Meter meaningful enough to become habitual decision tools.
- Reduce distortion from shared spending, reimbursements, and event-related expenses.
- Prove that forward-looking finance UX can feel calm, useful, and less shame-inducing than traditional budgeting.

## User Outcomes

- Users understand what is safe to spend today and why.
- Users can spot upcoming pressure before it becomes a surprise shortfall.
- Users spend less time categorizing, reconciling, and mentally tracking reimbursements.
- Users feel more confident and less avoidant about checking finances.

## Business Outcomes

- Establish a clear wedge in a crowded PFM market around short-term clarity and shared-spend correctness.
- Create an MVP strong enough to support early retention, trust, and referral loops.
- Validate that users will return for decision support, not just transaction logging.

## Trust and Quality Goals

- Avoid obvious budget distortion from shared spending and reimbursements.
- Keep user-facing guidance explainable enough that users can understand the reason behind changes.
- Keep privacy expectations explicit in shared contexts.
- Minimize support issues tied to confusion, sync distrust, or unexplained calculation shifts.

## Success Metrics

- Weekly active users who view Safe-to-Spend or the Daily Spending Meter at least once per week.
- Percentage of users who use Add or Simulate Transaction before a purchase decision.
- Percentage of transactions requiring manual cleanup after initial import or entry.
- Percentage of flagged ambiguous event assignments that users resolve successfully.
- Percentage of shared transactions that users complete with a split or reimbursement flow.
- Reduction in support volume tied to reimbursement confusion, shared-spend distortion, or unexplained guidance changes.
- User-reported confidence that the app helps answer "Am I safe to spend right now?"
- User-reported reduction in budgeting-as-homework and shame or avoidance behaviors.

## Guardrails

- Do not drive engagement by increasing anxiety or nagging frequency.
- Do not optimize recommendation surfaces for clicks at the expense of trust.
- Do not widen MVP scope in ways that weaken correctness on Safe-to-Spend, shared spending, or forward cash flow.

# 6. Scope

## In Scope

- Safe-to-Spend as a short-term decision number grounded in upcoming obligations and recent activity.
- Daily Spending Meter with daily guidance tied to the user's current short-term safety picture.
- Daily budget setting and rollover-aware daily budgeting.
- Today's transaction list with fast correction and review flows.
- Add Transaction and Simulate Transaction flows for planned and unplanned spending.
- Forward-looking week or month cash-flow view showing upcoming obligations, paydays, event pressure, and short-term risk.
- Lightweight running-balance awareness on primary decision surfaces so users can see near-term cash pressure and avoid avoidable shortfalls.
- Event or trip budgeting with automatic event grouping, editable assignment, and ambiguity flagging.
- Split and reimbursement-aware shared transaction handling.
- Privacy toggle or personal-pot style controls for partially shared contexts.
- Manual fallback and correction workflows when automated grouping or external data quality is insufficient.
- Calm, actionable warnings and suggestions that explain what changed and what needs review.

## Out of Scope / Non-Goals

- Full investment or asset tracking.
- Full FIRE planning, Monte Carlo planning, or retirement projection experiences.
- Full local-first default operation as the primary MVP architecture.
- Full family or multi-member collaboration beyond limited shared-spend and privacy controls.
- Business-accounting depth, freelancer profit and loss, or tax-estimate workflows.
- Multi-currency support.
- Voice capture.
- Spreadsheet import and export.
- Advanced customizable reports.
- HYSA optimization or cash-moving recommendations.
- Full long-term goal consequence views beyond lightweight future hooks.
- Building a generic AI chat layer as a primary interaction surface.

## Assumptions

- The sharpest MVP wedge is short-term clarity plus shared-spend correctness, not broad financial account coverage.
- The app must remain valuable even when account sync is imperfect; manual entry and simulation are not backup hacks but core trust-preserving workflows.
- Users will tolerate some review-needed states if those states are clear, bounded, and meaningfully reduce later cleanup.
- Shared-finance support should be elegant but limited in MVP rather than trying to solve all household collaboration patterns immediately.

## Dependencies

- Reliable identity and authorization boundaries.
- Secure linked-account integration and transaction ingestion where enabled.
- A canonical transaction and event model capable of supporting splits, reimbursements, and ambiguity states.
- Explainable Safe-to-Spend logic and forward-cash-flow logic.
- Notification and alerting posture that supports useful guidance without spam.
- Clear product disclosures and privacy controls for linked financial data and shared contexts.

# 7. Product Principles

- Decision-first over retrospective tracking.
- Minimize admin work, category homework, and cleanup residue.
- Short-term clarity before long-term sophistication.
- Calm, non-guilt-driven UX over fear- or shame-based finance design.
- Privacy-first and trust-first behavior from day one.
- Helpful friction, not zero friction and not oppressive friction.
- Useful guidance over decorative analytics.
- Shared visibility should not require total privacy loss.
- Automation should reduce work, not reduce understanding.
- Explain what changed, not just what the current number is.

# 8. User Journeys / Scenarios

## Scenario 1: Daily clarity check

- User opens the app and sees Safe-to-Spend, Daily Spending Meter status, upcoming obligations, and any meaningful warnings.
- User understands whether the week is stable, tight, or review-needed without needing to inspect every transaction.
- If the answer changed materially since the last check, the app explains why in plain language.

## Scenario 2: Pre-purchase simulation

- User is considering a purchase.
- User opens Add or Simulate Transaction, enters an amount, optionally marks it as shared or event-related, and sees the projected short-term impact before saving.
- If the simulated spend pushes the week into caution territory, the app shows the change and reason without scolding.

## Scenario 3: Event grouping happy path

- User spends across a trip or event over several days.
- The app auto-groups likely related transactions into an event budget.
- User can review and edit assignments quickly.
- Event-level spending context improves the short-term picture without requiring full recategorization.

## Scenario 4: Event grouping ambiguous path

- A transaction may belong to an event but confidence is low.
- The app flags it as review-needed instead of silently deciding.
- The user can assign, ignore, or split the transaction without hunting through settings or rules.

## Scenario 5: Shared transaction with reimbursement

- User pays for a shared expense.
- The app allows a split and reimbursement expectation to be recorded.
- The user's budget and guidance should reflect that part of the amount is not a true personal spend burden.
- Until reimbursement is received, the app should still acknowledge short-term cash pressure without overstating long-term overspending.

## Scenario 6: Shared context with privacy

- User shares some household visibility but keeps selected transactions or categories private.
- Household-level views show the right shared burden without leaking private line-item detail.
- Privacy controls feel intentional and understandable, not like hidden accounting tricks.

## Scenario 7: Sync delay or incomplete data

- Linked data is delayed, duplicated, or incomplete.
- The app surfaces stale-data or review-needed context where it materially affects trust.
- Manual entry or simulation remains available so the product continues to provide value.

# 9. Functional Requirements

## Onboarding and Setup

- The system must onboard a user into a short-term clarity workflow, not a category-configuration workflow.
- The system must support account creation, authentication, and secure session handling.
- The system must support either linked financial data, manual entry, or both, while making the current data freshness state understandable.
- The system must collect only the minimum setup information required to produce initial short-term guidance.

## Short-Term Clarity Layer

- The system must compute and display a Safe-to-Spend value for the user.
- The system must compute and display a Daily Spending Meter and allow daily budget setting.
- The system must show near-term obligations, paydays, and short-term spending pressure in a forward-looking view.
- The system must provide lightweight running-balance awareness where it affects short-term confidence and overdraft avoidance.
- The system must explain meaningful changes to Safe-to-Spend or daily guidance in plain language.
- The system must present caution, warning, and review-needed states without shaming language.

## Transaction and Budget Interaction

- The system must show today's transactions in a fast-review list.
- The system must allow users to add a real transaction manually.
- The system must allow users to simulate a transaction and see projected impact before saving.
- The system must support quick correction of transaction attributes that materially affect decision quality.
- The system must support daily budget settings and rollover-aware behavior without requiring complex category management.

## Event Grouping and Event Budgets

- The system must support event or trip budgets as a first-class context.
- The system must attempt automatic event grouping for relevant transactions.
- The system must flag ambiguous event assignments instead of silently forcing low-confidence grouping.
- The system must allow fast manual reassignment or removal from an event.
- The system must let users understand what a given event is costing them in a way that improves near-term clarity.

## Shared Household, Reimbursements, and Privacy Toggles

- The system must support marking a transaction as shared, split, reimbursable, or some combination of those states.
- The system must distinguish true personal spending from temporary fronted spending where reimbursement is expected.
- The system must avoid making reimbursable or shared spending appear as simple overspending without context.
- The system must support privacy-toggle or personal-pot style controls so a user can keep selected spending private while still contributing the right shared impact to joint views.
- The system must ensure that shared views only expose data the current user is authorized to see.

## Budget Mechanics

- The system must support daily budgeting with rollover behavior.
- The system must make rollover effects understandable rather than silently changing daily guidance.
- The system must ensure that rollover logic does not hide meaningful short-term risk.

## Roadmap-Aware Extension Points

- The product model must preserve future hooks for longer-term goal or FIRE consequence views without requiring those experiences in MVP.
- The product model must preserve future hooks for deeper running-balance analytics, multi-member household workflows, and local-first variants.

# 10. Non-Functional Requirements

- Home and primary decision surfaces should feel fast enough for habitual use; last-known short-term guidance should render quickly on a typical mobile connection and device.
- Core interactions such as opening the app, reviewing Safe-to-Spend, and simulating a transaction must feel responsive and lightweight.
- The product must remain useful during partial sync failure, stale linked data, or temporary backend degradation.
- User-facing explanations must be understandable without finance-specialist language.
- The system must be maintainable enough to support iterative calibration of guidance logic without constant UI churn.
- The product must support auditability for sensitive calculation changes, shared-data visibility changes, and reimbursement-related state transitions.
- Mobile UX must be accessible enough for routine daily use, including readable text, clear state changes, and touch-safe interaction targets.
- Release posture must be conservative around trust-sensitive logic changes, shared-finance behavior changes, and disclosure-affecting changes.

# 11. Privacy, Security, and Compliance Requirements

- User data must be private by default.
- Shared views must reveal only explicitly shared information and only to authorized members of that shared context.
- Personal transactions or private notes must not leak into shared surfaces unless the user deliberately shares them.
- The product must clearly distinguish private, shared, and reimbursable spending states where those differences materially affect visibility or guidance.
- Identity, household membership, permissions, linked-account authorization, and canonical persisted financial records must be server-authoritative.
- Trust-critical persisted calculations, including the canonical Safe-to-Spend result and shared-view effects, must be derived from authoritative server-backed data even if the client can show provisional UI previews.
- Client-side calculation is acceptable for drafts, simulations, cached presentation, and local responsiveness, but those views must not silently override canonical persisted results.
- The product must validate and authorize all user actions affecting shared data, reimbursement state, privacy controls, and account connections.
- The product must minimize collected and retained data to what is needed for short-term clarity, event grouping, and shared-spend correctness.
- The product must provide clear deletion and account-disconnect behavior at the product level, including consequences for shared contexts and linked data.
- The product must avoid storing privileged secrets or high-risk credentials on the client.
- The product must support disclosures around linked financial data, analytics, monitoring, and shared-data visibility behavior.
- Security-sensitive failures must fail safely and visibly. The product should prefer a review-needed state over silent corruption or overconfident guidance.

# 12. UX / Behavior Expectations

The experience should feel calm, competent, and helpful. It should feel more like a trusted financial co-pilot than a nagging compliance tool.

- Safe-to-Spend should feel trustworthy, conservative enough to avoid obvious false confidence, and always paired with enough explanation to preserve user understanding.
- The Daily Spending Meter should guide behavior without making the user feel judged. It should show tradeoffs and pressure, not moral failure.
- Forward-looking cash-flow surfaces should reduce surprise and make upcoming obligations tangible.
- Event grouping should feel like the app is reducing clutter for the user, not inventing more cleanup work.
- Ambiguous states should be clear, bounded, and easy to resolve.
- Shared-private controls should feel respectful and explicit; users should understand what remains private, what becomes visible, and why.
- Warning states should say what changed and what the user can do next.
- Empty states should teach the decision-first model, not just prompt users to add more data.
- Failure states should preserve trust by explaining what is missing, stale, or uncertain.

Important UX states:

- Normal: guidance is stable and trustworthy.
- Caution: spending room exists but upcoming obligations or recent actions reduced flexibility.
- Warning: the short-term picture is materially tight and needs attention.
- Review-needed: ambiguity, stale data, or unresolved shared-spend state affects confidence.
- Failure: the product cannot currently compute a trustworthy answer.
- Empty: not enough data yet, but the next step is clear and small.

# 13. Acceptance Criteria

## Safe-to-Spend

- Given a user with sufficient recent transaction and upcoming-obligation data, when they open the home screen, then the app shows a Safe-to-Spend value and a short explanation of what most influenced it.
- Given a material change in upcoming obligations, expected inflows, or confirmed spending, when Safe-to-Spend changes meaningfully, then the app shows that the value changed and why.
- Given the system cannot produce a trustworthy Safe-to-Spend result, when confidence is materially impaired by stale, missing, or unresolved data, then the app shows a review-needed or unavailable state rather than a falsely precise number.

## Daily Spending Meter

- Given a user has set or accepted a daily budget, when they check the app, then the Daily Spending Meter reflects current day progress in the context of rollover-aware short-term guidance.
- Given daily guidance tightens due to upcoming obligations or recent spending, when the user reopens the app, then the meter state updates and the reason is understandable.

## Forward-Looking Cash Flow

- Given the user has upcoming bills, subscriptions, paydays, or planned event spending, when they open the week or month view, then the app shows forward-looking pressure and timing in a way that helps avoid surprise shortfalls.
- Given linked account data is stale or incomplete, when that materially affects the forward-looking view, then the app shows a review-needed or stale-data state.

## Add or Simulate Transaction

- Given a user is considering a purchase, when they simulate a transaction, then the app shows projected short-term impact before the transaction is saved.
- Given the user saves a simulated transaction as real, when it is persisted, then the relevant decision surfaces update accordingly.

## Event Grouping

- Given transactions likely belong to the same trip or event, when the confidence is sufficient, then the app groups them automatically into an event context.
- Given confidence is insufficient, when the app cannot decide safely, then it flags the transaction as ambiguous instead of forcing the grouping.
- Given the user edits an event assignment, when they confirm the new assignment, then event totals and related guidance update accordingly.

## Shared Spend and Reimbursements

- Given a user records a shared transaction, when they define a split or reimbursement expectation, then the product reflects both immediate cash impact and reduced true personal-spend burden appropriately.
- Given reimbursement is expected but not yet received, when the user views short-term guidance, then the app acknowledges short-term cash pressure without permanently treating the full amount as true personal spend.
- Given reimbursement is received or resolved, when the shared transaction state changes, then the product updates the user's picture without double counting spend or recovery.

## Privacy Toggles

- Given a user marks spending as private within a shared context, when another household member views the shared surface, then only the authorized shared impact is visible and private detail remains hidden.
- Given a user changes a privacy or sharing setting, when the change is saved, then the resulting visibility is explicit and consistent across shared views.

## Rollover Behavior

- Given a user underspends or overspends their daily target, when the next day or relevant window begins, then rollover behavior is reflected in guidance in a way the user can understand.
- Given rollover would mask a real near-term shortfall, when the system detects that risk, then the app surfaces the shortfall instead of presenting rollover as reassurance.

# 14. Risks, Open Questions, and Decisions

## Risks

- Safe-to-Spend can lose trust quickly if it is either too optimistic or too opaque.
- Shared-spend and reimbursement modeling can become confusing if the product tries to compress too many edge cases into one simple flow.
- Event grouping can create more cleanup instead of less if ambiguity handling is weak.
- Linked-account sync issues can undermine trust if manual fallback flows are not good enough.
- Expanding into too many adjacent finance jobs too early can dilute the MVP wedge.

## Open Questions

- How conservative should the first Safe-to-Spend calibration be relative to expected reimbursements, pending transactions, and uncertain subscriptions?
- How much running-balance detail should appear in MVP before the experience starts to feel like a ledger instead of a decision tool?
- What is the smallest shared-household permission model that still feels elegant and trustworthy at MVP?

## Decisions Made Now

- The MVP is intentionally narrower than a full budgeting suite and focuses on short-term clarity, event-aware organization, and shared-spend correctness.
- The primary MVP differentiation is trusted short-term clarity plus shared-spend correctness; event-aware auto-grouping is a signature supporting differentiator rather than the sole headline wedge.
- Shared-household support is included, but only to the degree needed for privacy-aware shared spending and reimbursement handling.
- Manual entry and simulation are first-class trust-preserving workflows, not fallback afterthoughts.
- FIRE and long-term planning are deferred as later consequence layers, not core MVP surfaces.
- Lightweight running-balance awareness is in MVP because it materially affects short-term trust; deeper balance analytics are deferred.

## Decisions Intentionally Deferred

- Full family collaboration models and advanced permission granularity.
- Full long-term goal consequence modeling and FIRE-date movement.
- Multi-currency and business or tax workflows.
- Import and export heavy workflows, including spreadsheets.

# 15. Suggested Follow-Up Implementation Spec Outline

The implementation spec should not restate this PRD. It should turn this PRD into precise product and engineering slices.

It should cover:

- domain model definitions for transactions, events, obligations, shared state, splits, reimbursements, privacy scopes, and guidance states
- authoritative calculation boundaries for Safe-to-Spend, Daily Spending Meter, forward cash flow, and shared-spend effects
- data freshness, confidence, ambiguity, and review-needed state logic
- onboarding and setup slices, including minimum viable data collection and linked-account versus manual workflows
- home and primary decision-surface behavior
- Add or Simulate Transaction flow behavior, including provisional versus canonical calculation updates
- event grouping heuristics, confidence thresholds, and edit flows
- reimbursement and split modeling, including lifecycle states and user-facing effects
- privacy-toggle behavior and shared-surface visibility rules
- rollover rules and failure-mode handling
- notification and guidance trigger rules
- analytics and trust instrumentation
- security, authorization, and disclosure-sensitive requirements that must be verified before release

The implementation plan derived from that spec should define:

- exact files and modules to add or change
- server-authoritative versus client-calculated logic per area
- slice-by-slice verification criteria
- edge-case matrices for ambiguity, stale data, sync delay, privacy-state changes, and reimbursement resolution
- rollout and rollback considerations for trust-sensitive calculation changes
