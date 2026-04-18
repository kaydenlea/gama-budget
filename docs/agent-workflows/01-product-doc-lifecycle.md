# Product Doc Lifecycle

This lifecycle defines how product thinking should move from opportunity framing into implementation-ready direction.

## Document Order

1. Product brief: captures opportunity, target user, problem framing, and strategic constraints.
2. PRD: turns the brief into concrete product requirements, non-goals, UX expectations, risk boundaries, and success measures.
3. Feature spec: turns the PRD into implementation-facing scope, file plan, interfaces, edge cases, and verification.
4. Implementation plan: turns the feature spec into small slices with concrete proof requirements.

## Document Responsibilities

- Product brief:
  decide why the work matters, who it serves, and why now.
- PRD:
  decide what the product must do, what it must not do, and what trust constraints shape the work.
- Feature spec:
  decide how the feature should behave, what files and interfaces will change, and what acceptance bar must be met.
- Implementation plan:
  decide the order of execution, slice boundaries, review checkpoints, and per-slice proof.
- Bugfix spec:
  decide what failed, what evidence supports the diagnosis, what the root cause is, and how the smallest correct fix will be verified.

Do not collapse these into one vague doc. Each exists to reduce a different kind of ambiguity.

## When To Refresh Product Docs

Refresh the product brief or PRD when:

- the user problem changes materially
- the lane changes from mobile-first product work to web trust or SEO work
- MVP scope changes
- a later feature is pulled forward
- reimbursement, privacy, or shared-household assumptions change
- the narrative or mission framing needs correction

Refresh architecture or security docs when:

- the file or service boundaries change materially
- a new trust boundary, storage pattern, provider integration, or privileged path is introduced
- the implementation changes how auth, RLS, secrets, retention, or rollback work
- web and mobile lane responsibilities shift

Refresh the task spec only, without reopening higher-level docs, when:

- the product framing is stable
- the architecture remains within the existing documented boundaries
- the work changes implementation detail rather than product direction or trust assumptions

## Product-Specific Guardrails

The product docs must preserve these truths:

- Gama is a decision-first personal finance operating system, not another categorization-heavy tracker
- short-term clarity beats retrospective cleanup
- Safe-to-Spend, Daily Spending Meter, Crisis Cushion, running balances, and forward-looking cash flow are trust-critical concepts
- shared spending, reimbursements, privacy toggles, and personal pots are core differentiators
- the tone should be calm, useful, and not shame-driven

## Completion Standard

Product docs are current when an engineer or agent can explain:

- what user problem is being solved
- why this matters strategically
- what is in scope now versus later
- what constraints must not be violated during implementation
