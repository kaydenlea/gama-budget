# Product Brief: Gama

- Date: 2026-04-18
- Status: Drafted for rebrand and product-direction update
- Brand: `Gama`
- Website: planned public domain `gamabudget.com`
- Note: this brief now matches the repo-wide `Gama` and `gamabudget.com` baseline. The domain is planned, not yet provisioned.

## Overview

Gama is a mobile-first money product for people who want short-term clarity without budgeting homework, and who also want their real-life spending to become useful event memory, place memory, and optional shareable artifacts.

The product should answer the daily decision question first: "What is safe to spend, what changed, and what needs attention?" It should then turn transactions from a private ledger into higher-value experiences such as event budgets, curated digital receipts, private weekly money stories, and map-aware place context that helps users revisit, recommend, and understand where their money actually went.

The website at the planned public domain `gamabudget.com` should explain this wedge clearly, capture early demand, and later host trusted share surfaces and educational content without distorting the mobile product lane.

## Problem

Current tools split the job across too many products:

- budgeting apps explain budgets and categories, but rarely create memorable or shareable event outcomes
- shared-expense apps solve settlement, but not full money clarity or forward-looking guidance
- map and recommendation apps help people save places, but do not connect those places to actual spend, budgets, or event outcomes
- social apps capture the memory of a trip or night out, but not the financial truth behind it

Users who travel, go out frequently, split costs, or organize shared events are often forced into a messy stack of bank apps, a budgeting app, screenshots, notes, group chats, Google Maps, and sometimes Splitwise. That stack creates admin work, loses context, and makes it harder to answer both the private money question and the social memory question.

## Not A PRD Yet

This brief does not lock:

- the exact mobile navigation model or tab count
- the final public versus private share model
- the exact precision policy for shared map pins
- whether weekly stories launch in the first public MVP or in a limited beta
- the monetization model for social or share features

Those decisions belong in the PRD and later specs.

## Why Now

This direction matters now for four reasons:

- younger adults are under cost pressure and actively looking for better money control, but do not want another guilt-heavy tracker
- social media already shapes how people learn about money, trips, restaurants, and places to go
- people increasingly expect mobile products to create objects they can share, not just dashboards they can inspect
- the market still has a gap between finance clarity products and social/place-memory products

## Research Basis

Recent inputs that should shape the direction:

- Bank of America Better Money Habits (2025): young adults report higher cost pressure and are actively taking steps to improve financial health
- Spruce by H&R Block (2025): social media has meaningful influence on Gen Z financial learning, which suggests money products must compete with socially native interfaces for attention and trust
- Pew Research (2024): many younger adults still rely on family support or have partial financial independence, reinforcing the need for short-term clarity over abstract long-range reporting
- Origin State of Personal Finance Apps (2024): younger users commonly juggle multiple finance apps, which supports a wedge that consolidates fragmented workflows
- Klook Travel Pulse (2025) and Agoda Gen Z travel research (2025): younger travelers heavily use social recommendations and budget constraints when planning trips

Competitive pattern to preserve:

- Monarch and Copilot emphasize money clarity, collaboration, and recurring-spend organization
- Splitwise and Tricount emphasize trip and group settlement
- Mapstr and newer social map products emphasize trusted place discovery and sharing

The gap is the intersection: trusted personal finance clarity plus event-aware, place-aware, shareable money artifacts.

## Target Users

### Primary Users

- Socially Native Clarity Seekers: mobile-first adults, often 22-35, who want to know what is safe to spend without turning money into homework
- Trip and Event Organizers: users who plan trips, dinners, weekends, birthdays, festivals, or group outings and want both budget truth and a memorable record
- Shared-Spend Operators: people who split, front, reimburse, or partially share spending with partners, friends, roommates, or collaborators

### Secondary Users

- couples or shared-household users who want private autonomy plus lightweight coordination
- dining- and city-oriented users who want a better memory of where they actually spent money
- later: FIRE-minded users who care about longer-term consequences after the short-term clarity loop is trustworthy

## Strategic Fit

This direction still supports the core product thesis:

- the decision layer remains the product
- Safe-to-Spend, cash-flow guidance, and review flows still earn trust first
- event and narrative intelligence become stronger because they now produce reusable artifacts, not just internal grouping
- shared spending and reimbursements remain core because social/event use cases break without them
- the social layer creates retention and referral leverage without requiring the product to become a public feed

Recommended position:

- Gama should be artifact-first, not feed-first
- users should share curated outputs such as event receipts, place maps, or money stories
- the app should never default to exposing raw financial activity continuously

## Success Signals

- users reach a first useful Safe-to-Spend or cash-flow answer quickly
- users create events or trips without heavy manual setup
- users generate and share curated digital receipts or event summaries
- shared artifacts drive saves, revisits, or referrals without causing privacy regret
- users repeatedly return for overview, event, and story check-ins
- place and map surfaces improve usefulness enough that users revisit old events or discover useful places again

## Constraints

- privacy is non-negotiable; all financial and location data must stay private by default
- social features must be explicit opt-in and previewable before sharing
- public raw transaction feeds are out of scope
- precise location sharing for home, sensitive merchants, or personally revealing patterns requires redaction rules or coarsening
- mobile remains the primary product lane; web remains trust, share-surface, and discovery support
- trust-critical calculations remain server-authoritative even if share artifacts are client-rendered previews

## Open Decisions

### Should Gama launch with public profiles or a follow graph?

Recommendation: no.

Rationale: the stronger and safer wedge is shareable artifacts, not public financial identity.

Decision trigger: repeated evidence that artifact sharing alone is insufficient for referral, retention, or content reuse.

### How precise should shared map views be?

Recommendation: exact pins for private views, coarse or user-confirmed pins for shared views.

Rationale: location patterns can reveal home, routine, or sensitive behavior quickly.

Decision trigger: user research showing exact-pin sharing is both high value and low regret with proper controls.

### Should weekly money stories be private by default?

Recommendation: yes, with optional sharing of selected cards or story bundles.

Rationale: stories can improve habit and comprehension without forcing public performance.

Decision trigger: strong evidence that the product needs a more social-first publishing model to unlock growth.
