# SEO Content Strategy

## Objective

Use SEO later to capture users who already feel the pain of budgeting homework, reimbursement messes, event-spend fragmentation, trip-cost confusion, and forward-looking cash-flow uncertainty.

## Content Themes

- decision-first budgeting
- Safe-to-Spend and daily guidance
- reimbursements and shared spending correctness
- event and trip budgeting
- digital receipts and money stories
- private spending maps and place memory
- forward-looking cash-flow planning
- privacy-first alternatives to cloud-heavy finance apps
- connecting daily behavior to FIRE without spreadsheet overload

## Guardrails

- do not publish pages that promise features not yet supported
- keep claims specific and evidence-based
- separate SEO intent from mobile product decisions
- keep privacy, analytics, and disclosures aligned with security docs
- do not imply public financial sharing is the core product behavior

## Content Ladder

Start with problem framing and category education, then move into artifact and use-case education, then comparison content, then deeper guides once product truth and measurement are mature.

## Implementation Phases

1. Foundation
   Route-level metadata ownership, sitemap, robots, canonical URL support, schema factories, breadcrumb support, environment-safe noindex defaults, and typed landing or waitlist content structure for the planned public domain `gamabudget.com`.
2. Launch Surfaces
   Landing, waitlist, privacy, and trust pages that stay faithful to the MVP and avoid unsupported claims.
3. Educational Content
   Problem-framing guides for clarity, trip budgeting, event receipts, and private sharing once the MVP message is stable.
4. Comparison Content
   Comparison and category pages only after product truth and attribution measurement are mature enough to support them.

## Durable Defaults

- register new indexable pages in the shared page registry so metadata, sitemap, and breadcrumb output stay aligned
- keep non-production environments non-indexable by default
- use localhost or clearly synthetic hosts for non-production examples until `gamabudget.com` is actually provisioned
- distinguish AI search discovery from AI training access when adding crawler rules
- do not add structured data types unless the visible page content already supports them
