# 1. Header

- Document title: Gama Mobile MVP PRD
- Owner(s): Gama Product and Founding Team
- Status: Updated working PRD for rebrand and product-direction reset
- Date/version: 2026-04-18 / v2.0
- Product area: Mobile app, short-term clarity, event intelligence, and privacy-bounded sharing
- Linked docs:
  - [../shared/gama-product-brief.md](../shared/gama-product-brief.md)
  - [../shared/mission.md](../shared/mission.md)
  - [../shared/product-thesis.md](../shared/product-thesis.md)
  - [../shared/personas-and-use-cases.md](../shared/personas-and-use-cases.md)
  - [../shared/success-metrics.md](../shared/success-metrics.md)
  - [mvp-scope.md](./mvp-scope.md)
  - [screen-map.md](./screen-map.md)
  - [roadmap.md](./roadmap.md)

# 2. Executive Summary

Gama MVP is a mobile-first, decision-first money product for people who want short-term spending clarity without category homework, spreadsheet glue, or shame-driven rituals. The MVP is designed to answer "Am I safe to spend right now?" and "What changed?" while also helping users organize real-life trips, dinners, weekends, and shared events into useful event budgets, digital receipts, and map-aware summaries.

The strategic goal is not to win on feature count. The goal is to remove the admin work left behind by existing budgeting apps, then extend that trust into a shareable artifact layer that makes events and places easier to understand, revisit, and share. Gama should sit in the white space between finance clarity apps, trip-splitting apps, and social place-memory apps.

The MVP should optimize for trust before depth and for private value before public sharing. Users should get one or two fast, clear, confidence-building answers before the product asks them to care about richer automation, stories, or event receipts.

The MVP should also include frictionless capture and core resilience from the start. That means linked data, simulation, low-friction manual correction, event inference, and safe degradation during stale or partial data conditions. This does not require voice capture, public feeds, or a full offline-first architecture in v1.

Manual work elimination remains the explicit bar. The product should infer, prefill, or suggest before it asks users to categorize, configure, or curate by hand, while still preserving reviewable trust boundaries.

# 3. Product Context and Opportunity

Users do not primarily need another mirror that shows where money went. They need a decision layer that tells them what is safe to do next, what needs review, and how real-life spending fits into actual events and places.

Current products still fail in predictable ways:

- budgeting apps optimize for retrospective categorization instead of near-term decisions
- group-expense tools solve settlement but not full money clarity
- map and recommendation tools help users save places but are disconnected from real budgets and transactions
- social products capture memory and aesthetics but not the financial truth underneath those memories

The strongest gap is where five pains overlap:

- short-term uncertainty about what is safe to spend
- shared or reimbursed spending that breaks simple budgeting logic
- fragmented event planning across finance, maps, and group chat
- lack of useful place memory from actual spending
- desire for socially legible outputs without public oversharing of finances

Gama should win by turning fragmented transaction history into clear near-term guidance, then turning that guidance into curated event objects, digital receipts, and place-aware context that users can keep private or selectively share.

# 4. Target Users and Core Jobs

## Primary Users

- Socially Native Clarity Seekers: people who want fast money clarity in a mobile-native experience that feels current, not spreadsheet-like
- Trip and Event Organizers: users who want to understand and summarize what a trip, dinner, or weekend actually cost
- Shared-Spend Operators: users who front, split, reimburse, or partially share spending with others and need correct math plus clear boundaries

## Secondary Users

- couples or shared-household users who want shared visibility with private autonomy
- city and dining enthusiasts who want a better record of where they have spent money
- later: FIRE-lite users who care about longer-term consequences after the short-term loop is trusted

## Core Jobs To Be Done

- tell me whether I am safe to spend today or this week
- show me what upcoming obligations and recent choices changed about that answer
- let me review or correct recent transactions quickly
- let me simulate a purchase before I make it
- organize irregular spending into meaningful events without creating maintenance work
- generate a polished summary or receipt from an event or trip
- show me where money was spent so I can revisit or recommend places
- keep shared expenses and reimbursements from breaking my budget picture
- preserve personal privacy inside shared or social contexts

# 5. Product Goals and Guardrails

## Product Goals

- deliver trusted short-term spending clarity with minimal manual cleanup
- make Overview and Cash Flow meaningful enough to become habitual check-in surfaces
- reduce distortion from shared spending, reimbursements, bills, and event-related expenses
- prove that event-aware finance UX can feel calm, useful, and memorable
- create shareable outputs that drive retention and word-of-mouth without weakening privacy
- deliver first-session value quickly enough that users understand the wedge before setup fatigue takes over
- remove recurring manual setup, categorization, and correction work wherever realistic without weakening trust

## User Outcomes

- users understand what is safe to spend and why
- users can spot upcoming pressure before it becomes a surprise shortfall
- users spend less time categorizing, reconciling, and mentally tracking reimbursements
- users can see what a trip or event is costing them without spreadsheet cleanup
- users can revisit or share meaningful event summaries and favorite spots
- users feel more confident and less avoidant about checking finances

## Business Outcomes

- establish a wedge in a crowded PFM market around clarity plus event and place intelligence
- create an MVP strong enough to support early retention, trust, and referral loops
- validate that users will return for overview, event, and story value, not just raw transaction logging

## Guardrails

- do not drive engagement by increasing anxiety or nagging frequency
- do not optimize social or recommendation surfaces for clicks at the expense of trust
- do not widen MVP scope in ways that weaken correctness on Safe-to-Spend, shared spending, bills, or forward cash flow
- do not default users into public sharing of money or location data

# 6. MVP Scope and Page Model

## In Scope

- Overview page
- Cash Flow page
- Bills and Recurring page
- Accounts page
- Transactions page with optional map mode
- Quick Add surface
- Event list and Event Details page
- Safe-to-Spend
- category budgets and lightweight daily guidance
- recent transactions inbox for review, confirm, edit, or split
- upcoming transactions and bill pressure
- event or trip budgeting with automatic grouping and editable assignment
- digital receipt generation from event transactions
- opt-in sharing of event summaries and receipts
- favorite spots by category and event-level place context
- private weekly money story with quick actions
- split and reimbursement-aware shared transaction handling
- privacy controls for shared contexts and share artifacts

## Out of Scope / Non-Goals

- public profiles or broad follow graphs
- a public raw-spending feed
- leaderboards or shame-based social comparison
- exact public location sharing by default
- full investment tracking and asset-planning depth
- full FIRE planning, Monte Carlo planning, or retirement projection
- business-accounting depth, freelancer profit and loss, or tax workflows
- multi-currency support
- voice capture
- spreadsheet import and export
- merchant monetization or affiliate recommendation layers

## Recommended Navigation Model

Recommended primary navigation:

- Overview
- Cash Flow
- Events
- Transactions
- Accounts

Recommended secondary surfaces:

- Bills and Recurring
- Quick Add
- Event Details
- Weekly Story
- Settings, Notifications, and Widgets

Rationale: this keeps the app anchored around decision support while still giving Events first-class status. Bills and Quick Add are important pages, but they do not need to consume scarce primary-tab real estate in the first pass.

# 7. Functional Requirements

## Onboarding and Setup

- the system must onboard users into a short-term clarity workflow, not a category-configuration workflow
- the system must support account creation, authentication, and secure session handling
- the system must support linked financial data, manual entry, or both, while making freshness understandable
- the system must collect only the minimum setup information required to produce useful guidance
- the system should aim to produce a first useful answer or simulation before deeper setup
- the system should prefer inferred obligations, defaults, and event candidates before blank-slate configuration

## Overview Page

- the system must compute and display a Safe-to-Spend value
- the system must show category budget posture in a lightweight, understandable way
- the system must show recent transactions that need confirmation, correction, edit, or split handling
- the system must show an event timeline or event strip that makes active or recent events easy to access
- the system must show upcoming transactions or obligations that materially affect near-term safety
- the system must explain meaningful changes in plain language

## Cash Flow Page

- the system must show net flow for the current period and near-term forecast
- the system must compare income versus expenses clearly
- the system must break inflow and outflow into useful categories without forcing full manual bookkeeping
- the system must connect into bills, recurring items, and event pressure

## Bills and Recurring Page

- the system must identify recurring, subscription, and bill-like obligations where data quality allows
- the system must show settled, due soon, overdue, and unresolved states
- the system must help users understand what has already been handled versus what still needs attention
- the system must preserve review-needed states when a recurring detection is uncertain

## Accounts Page

- the system must show accounts, balances, debt, and high-level account value
- the system must keep this surface useful without turning MVP into a full wealth dashboard
- the system must expose stale-data or sync issues clearly when they affect trust

## Transactions Page

- the system must list transactions chronologically
- the system must allow filtering or organization by category and by event
- the system must support quick correction of transaction attributes that materially affect decision quality
- the system should support map visualization when merchant and location confidence are strong enough
- the system must allow users to drill into a place from a transaction where supported

## Quick Add

- the system must allow manual transaction entry
- the system must allow purchase simulation before saving
- the system must allow a user to create or attach an event
- the system must support split, reimbursement, and note entry where relevant

## Event Model and Event Details

- the system must support event or trip budgets as first-class contexts
- the system must attempt automatic event grouping for relevant transactions
- the system must flag ambiguous event assignments instead of forcing low-confidence grouping
- the system must allow fast manual reassignment, splitting, or removal from an event
- Event Details must show total budget, actual spend, category breakdown, collaborator state, favorite spots, and map view
- Event Details must support editing collaborators, event metadata, and event assignment state

## Digital Receipts and Sharing

- the system must be able to generate a curated digital receipt from an event
- the receipt should include at minimum total spend, category breakdown, time window, collaborators where authorized, and place context
- the system must allow opt-in sharing of the receipt or summary
- the system must show a share preview before publishing or sending
- the system must support redaction or omission of private detail when a share leaves the app

## Weekly Money Stories

- the system should generate a private-by-default weekly recap when the user has sufficient data
- the story should highlight useful patterns, event outcomes, or budget drift in plain language
- the story should include quick actions such as adjust a budget, review a transaction, or revisit an event
- the system must avoid turning the story into a guilt-heavy scorecard

## Shared Spending, Reimbursements, and Privacy Controls

- the system must support marking a transaction as shared, split, reimbursable, or some combination
- the system must distinguish true personal spending from fronted spending where reimbursement is expected
- the system must avoid making reimbursable or shared spending appear as simple overspending without context
- the system must support privacy controls so a user can keep selected spending private while still contributing the right shared impact to joint views
- the system must ensure that shared views and share artifacts only expose data the current user is authorized to reveal

# 8. Non-Functional Requirements

- primary decision surfaces should feel fast enough for habitual use
- core interactions such as opening the app, reviewing the inbox, and simulating a transaction must feel responsive
- the product must remain useful during partial sync failure, stale linked data, or temporary backend degradation
- the product must degrade safely by showing freshness, uncertainty, and fallback options
- user-facing explanations must be understandable without finance-specialist language
- the system must remain maintainable enough to calibrate guidance logic and share artifacts without constant UI churn
- the product must support auditability for sensitive calculation changes, share-state changes, and reimbursement transitions
- mobile UX must be accessible enough for routine daily use, including readable text and touch-safe targets

# 9. Privacy, Security, and Trust Constraints

- user data must be private by default
- financial and location sharing must always be explicit, previewable, and revocable where possible
- shared views must reveal only explicitly shared information and only to authorized viewers
- personal transactions, private notes, or sensitive places must not leak into shared surfaces unless the user deliberately shares them
- the product must distinguish private, shared, reimbursable, and shareable states clearly
- identity, household membership, permissions, linked-account authorization, and canonical persisted financial records must be server-authoritative
- trust-critical persisted calculations must be derived from authoritative server-backed data even if the client can show provisional previews
- client-side calculation is acceptable for drafts, simulations, cached presentation, and local responsiveness, but must not silently override canonical results
- the product must validate and authorize all actions affecting shared data, event collaborators, privacy controls, location-sharing state, and account connections
- the product must minimize collected and retained data to what is needed for short-term clarity, event grouping, and place-aware value
- security-sensitive failures must fail safely and visibly; review-needed is preferable to silent corruption or overconfident guidance

# 10. UX and Behavior Expectations

The experience should feel calm, competent, current, and socially fluent. It should feel more like a trusted money companion than a nagging compliance tool or a performative feed.

- Safe-to-Spend should feel trustworthy, conservative enough to avoid false confidence, and paired with enough explanation to preserve understanding
- Overview should feel like the user's money home base, not an overwhelming dashboard
- Cash Flow and Bills should reduce surprise and make upcoming obligations tangible
- Event grouping should feel like the app is reducing clutter, not inventing more cleanup work
- digital receipts should feel polished and worth saving or sending
- map surfaces should feel useful and memory-rich, not creepy or overexposed
- the first session should emphasize one or two clear aha moments, not a tour of every feature
- capture and correction flows should feel fast enough that users do not experience the product as bookkeeping
- review-needed flows should stay narrow and high-signal
- shared and private controls should feel respectful and explicit
- weekly stories should be actionable, not judgmental

Important UX states:

- Normal: guidance is stable and trustworthy
- Caution: spending room exists but flexibility is lower
- Warning: the short-term picture is materially tight and needs attention
- Review-needed: ambiguity, stale data, or unresolved shared-spend state affects confidence
- Failure: the product cannot compute a trustworthy answer
- Empty: not enough data yet, but the next step is small and clear

# 11. Acceptance Criteria

## Overview and Clarity

- given a user with sufficient recent transaction and upcoming-obligation data, when they open Overview, then the app shows Safe-to-Spend, budget posture, a recent transaction inbox, and upcoming pressure with a short explanation
- given a material change in upcoming obligations or confirmed spending, when Safe-to-Spend changes meaningfully, then the app explains that change in plain language
- given confidence is materially impaired by stale, missing, or unresolved data, when the user opens Overview, then the app shows a review-needed or unavailable state rather than a falsely precise number

## Bills and Cash Flow

- given the user has upcoming bills, subscriptions, or paydays, when they open Cash Flow or Bills, then the app shows timing and status in a way that helps avoid surprise shortfalls
- given linked data is stale or incomplete, when that materially affects the view, then the app shows a stale-data or review-needed state

## Transactions and Quick Add

- given a user is considering a purchase, when they simulate a transaction, then the app shows projected short-term impact before saving
- given a user edits a transaction, split, or reimbursement state, when they save the change, then the relevant clarity and event surfaces update accordingly

## Event Details and Digital Receipts

- given transactions likely belong to the same trip or event, when confidence is sufficient, then the app groups them automatically into an event context
- given confidence is insufficient, when the app cannot decide safely, then it flags the transaction as ambiguous instead of forcing the grouping
- given an event has enough data, when the user opens Event Details, then the app shows total spend, category breakdown, collaborators where authorized, and place context
- given the user generates a digital receipt, when the preview appears, then the user can review what will be shared and remove or redact sensitive detail before sharing

## Map and Place Context

- given a transaction has trustworthy merchant or location data, when the user opens a transaction or event map view, then the app shows associated places in a useful and understandable way
- given a place is sensitive or low-confidence, when the user prepares a share, then the product omits, coarsens, or flags that location instead of exposing it silently

## Weekly Money Story

- given the user has sufficient weekly activity, when the story is generated, then it summarizes useful patterns and includes at least one clear next action
- given the user does not want to share the story, when they dismiss or keep it private, then the product does not pressure them into publication

# 12. Risks, Open Questions, and Decisions

## Risks

- Safe-to-Spend can lose trust quickly if it is too optimistic or too opaque
- social framing can backfire if the product looks like public financial performance instead of private utility
- event grouping can create more cleanup instead of less if ambiguity handling is weak
- map features can create privacy regret if precision rules are weak
- linked-account sync issues can undermine trust if manual fallback flows are not good enough
- expanding into too many adjacent jobs too early can dilute the wedge

## Open Questions

- how conservative should the first Safe-to-Spend calibration be relative to expected reimbursements, pending transactions, and uncertain subscriptions?
- how much running-balance detail should appear in MVP before the experience starts to feel like a ledger instead of a decision tool?
- should weekly money stories be part of the first public MVP or a limited rollout after event receipts are validated?

## Decisions Made Now

- the product brand is now Gama and the planned public website domain is `gamabudget.com`
- the MVP focuses on short-term clarity, event-aware organization, place-aware context, and privacy-bounded sharing
- the primary MVP differentiation is trusted clarity plus event and place intelligence, not a public budgeting community
- the social layer is artifact-first; public raw-spending feeds are out of scope
- Event Details and digital receipts are first-class MVP surfaces
- shared-household support is included only to the degree needed for privacy-aware shared spending and reimbursement handling
- manual entry and simulation are first-class trust-preserving workflows, not fallback afterthoughts
- onboarding should optimize for fast trust and first-session value rather than broad feature exposure

## Decisions Intentionally Deferred

- public follow graph or community feed
- full family collaboration models and advanced permission granularity
- exact public map-sharing defaults
- full long-term goal consequence modeling and FIRE-date movement
- multi-currency and business or tax workflows
- heavy import and export workflows

# 13. Suggested Follow-Up Implementation Spec Outline

The implementation spec should turn this PRD into precise product and engineering slices. It should cover:

- domain model definitions for transactions, events, obligations, shared state, splits, reimbursements, privacy scopes, share artifacts, and place metadata
- authoritative calculation boundaries for Safe-to-Spend, budget posture, bills, cash flow, and shared-spend effects
- data freshness, confidence, ambiguity, and review-needed state logic
- onboarding and setup slices, including minimum viable data collection and linked-account versus manual workflows
- Overview, Cash Flow, Bills, Accounts, Transactions, and Event Details behavior
- Quick Add and simulation behavior, including provisional versus canonical calculation updates
- event grouping heuristics, confidence thresholds, and edit flows
- digital receipt generation, preview, redaction, and sharing rules
- map confidence, precision, and sensitive-place handling
- reimbursement and split modeling, including lifecycle states and user-facing effects
- privacy-control behavior and shared-surface visibility rules
- story generation rules and action types
- analytics and trust instrumentation
- security, authorization, location-sharing, and disclosure-sensitive requirements that must be verified before release
