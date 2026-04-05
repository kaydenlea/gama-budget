# Operating Model

This repository encodes a production-grade feature delivery model for a decision-first personal finance product. The intent is to make the correct workflow the default path for future work instead of relying on contributors to restate it from memory.

## Core Insight

Planning and verification are the bottleneck, not typing. Agents can execute a weak plan very quickly, so the repository treats product context, PRD quality, feature specs, implementation plans, and verification loops as first-class artifacts.

## Default Sequence

1. Review the right product, workflow, architecture, security, and lessons context and confirm the lane: mobile, web, shared package, or backend.
2. For ambiguous or net-new product work, write or refine the product brief and PRD first.
3. For non-trivial delivery work, create a feature spec and implementation plan before coding.
4. Ask clarifying questions before the plan when the answer materially changes architecture, data shape, privacy, security, or release risk.
5. Write the active checklist in checkable form inside the spec or implementation plan.
6. Implement in small slices.
7. Verify after each slice.
8. Re-plan immediately if the design drifts or the plan becomes wrong.
9. Reconcile the spec, PRD, ADRs, runbooks, and other docs as reality changes.
10. Run independent review, PR-stage AI review where configured, and mandatory human review.
11. Apply the correct release gate before merge or deployment.

## Interpreting Short Prompts

Short prompts do not bypass the workflow. If a user says:

- add this feature
- fix this bug
- build this screen
- add the landing page
- support shared budgets

the agent should infer the correct lane and then choose the right built-in path:

- product brief and PRD work when the problem framing is still moving
- feature spec and implementation plan for non-trivial feature delivery
- bugfix spec and root-cause workflow for meaningful defects
- verification, cross-review, PR review, human review, doc reconciliation, and release gates before closing the work

## Why This Matters Here

PocketCurb is not a generic CRUD app. It handles sensitive personal finance data, shared and private visibility rules, reimbursement logic, trusted guidance such as Safe-to-Spend, and forward-looking cash-flow support. Loose execution would create product drift, security drift, and trust failures quickly.

## Built-In Limits

- cold starts and new codebases need extra context
- novel architectures are harder for agents to reason about
- subtle race, performance, and scale bugs still need stronger human judgment
- blindly trusting the agent too early is dangerous

Use this file as the high-level model, then follow the more specific lifecycle docs in this folder.

## Session Discipline

- start substantive work by reviewing the relevant stable lessons and workflow rules
- after user corrections, update the active task doc and decide whether a stable lesson belongs in shared docs or rules
- never claim completion without proof that would satisfy a careful staff engineer

## Read Order

If you want the smallest useful set of workflow docs, read these first:

1. `AGENTS.md`
2. `docs/agent-workflows/00-operating-model.md`
3. `docs/runbooks/how-to-add-a-feature.md` or `docs/runbooks/how-to-fix-a-bug.md`

Then read the more specific lifecycle or standards docs only as needed for the task.
