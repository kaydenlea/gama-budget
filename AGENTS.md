# Purpose of this Repository

PocketCurb is a security-first pnpm monorepo for a personal finance product that prioritizes decisions over bookkeeping. The product goal is to eliminate admin work, reduce shame-driven budgeting behavior, and give users short-term clarity first through a trusted Safe-to-Spend number, a Daily Spending Meter, running balances, event and narrative intelligence, and forward-looking cash-flow guidance. Mobile is the primary product lane. Web is a separate growth and SEO lane.

# Repo Map

- `apps/mobile`: Expo mobile app, the primary product surface.
- `apps/web`: website, waitlist, and later SEO or content surfaces.
- `packages/core-domain`: business logic and financial decision rules.
- `packages/schemas`: shared validation, contracts, and domain schemas.
- `packages/api-client`: typed client wrappers for safe app-to-backend communication.
- `packages/supabase-types`: generated or curated Supabase database and function types.
- `packages/ui-mobile`: mobile-only UI primitives and composition patterns.
- `packages/ui-web`: web-only UI primitives and composition patterns.
- `packages/config-*`: centralized lint, TypeScript, and Jest defaults.
- `supabase/*`: migrations, seed data, functions, and generated types.
- `docs/*`: the canonical truth layer for product, architecture, security, runbooks, decisions, specs, and agent workflows.
- `.claude/*` and `.codex/*`: mirrored skills and rules. Workflow parity is mandatory.

# Core Working Principles

1. Plan first for every non-trivial task. Treat any task with 3 or more steps, architectural decisions, security impact, or meaningful verification as non-trivial. Planning and verification are the bottleneck, not typing.
2. Ask clarifying questions before planning when the answer materially changes architecture, security posture, data boundaries, or user-facing behavior. Do not guess.
3. Implement in small verified slices. Do not disappear into long autonomous runs.
4. Prefer the simplest correct design. Avoid hacks, workaround chains, and accidental overengineering.
5. Fix root causes, not symptoms. Preserve minimal code impact while solving the real defect.
6. Treat security, privacy, and data minimization as first-class constraints from day one.
7. Keep the repository aligned with reality. Specs, ADRs, and runbooks must be updated as implementation evolves.
8. Store stable lessons in shared docs and rules. Keep task-specific findings in the task spec. After meaningful corrections, update the relevant task doc or shared rule so the same mistake is less likely to recur.
9. Claude and Codex follow the same workflow, standards, and responsibilities. Do not invent tool-specific operating models.
10. Local automation exists to prevent weak commits and pushes, but it does not replace human judgment.
11. Do not trust agents too early, especially on cold starts, novel architectures, subtle race conditions, scale edges, or security-sensitive changes.
12. Treat balanced elegance as the default quality bar: the simplest correct design, no brittle cleverness, no workaround chains, and no stale clutter left behind.
13. Do not keep retrying broad dependency installs once the failure mode is already known. Prefer static inspection, targeted verification, narrow filtered installs, or repo-owned wrapper scripts before attempting another full workspace install.
14. If the local dependency layout is degraded, do not heal it by looping broad installs. Allow a degraded local gate only for docs, workflow, and repo-automation changes. Product code, shared logic, mobile, web, and Supabase changes still require the full verifier.
15. Review the relevant workflow rules and stable lessons at the start of substantive work so avoidable mistakes are caught before implementation begins.
16. For framework scaffolds and toolchain setup, start from official generator and documentation baselines rather than inventing the shape manually. Use official sources such as `create-expo-app`, Expo Router installation docs, NativeWind installation docs, `create-next-app`, and Tailwind installation docs. If the local environment blocks generator execution, compare the existing app directly against the official documented baseline before finalizing changes.
17. Before any networked package-manager or generator command, inspect the local environment for broken or forced networking settings such as `HTTP_PROXY`, `HTTPS_PROXY`, `ALL_PROXY`, `GIT_HTTP_PROXY`, `GIT_HTTPS_PROXY`, and `NPM_CONFIG_OFFLINE`. If they are pointing to a dead local endpoint or forcing offline mode, stop and classify the problem as an environment issue instead of retrying `pnpm install`, `pnpm add`, `expo install`, `create-expo-app`, or `create-next-app`.

# Default Execution Workflow

1. Review the relevant product, workflow, architecture, security, and lessons context before substantive work starts.
2. Identify whether the task is trivial or non-trivial.
   If the user prompt is short, treat it as an entry point into the workflow, not permission to skip the workflow. Examples: "add this feature", "fix this bug", "build this screen", "add the landing page", and "support shared budgets" should trigger the correct brief, PRD, spec, plan, verification, review, and release path automatically.
3. Start from the right product context. For new product work, create or refine a product brief and PRD before feature planning when scope, positioning, or user value is still fuzzy.
4. For non-trivial work, create or update a feature spec from `docs/specs/mobile/_template.md` or `docs/specs/web/_template.md`, and pair it with an implementation plan before coding.
5. Clarify unknowns that materially affect architecture, data shape, security, user behavior, or launch risk before writing the plan. Do not guess.
6. Produce a file-by-file plan that includes interfaces, design choices, edge cases, failure modes, rollback considerations, and verification criteria for each slice.
7. Write the active checklist in checkable form inside the spec or implementation plan and update progress as slices complete.
8. Cross-check the plan before coding. Prefer a second model or tool when available. If only one agent tool is available, use a fresh context or review-oriented pass in that same tool and treat PR-stage AI review plus human review as the second layer.
9. Implement one slice at a time.
10. Run verification after each slice before continuing, and re-open the spec or plan at each checkpoint to catch drift early.
11. Stop and re-plan immediately if the plan becomes wrong.
12. Update the spec, product docs, runbooks, and decision records as reality changes.
13. Run an independent review again after implementation. Review every touched file before final commit or merge; do not rely on tests or summaries alone.
14. Debug and iterate on post-implementation review findings before commit or push. Do not treat the first passing implementation as automatically ready.
15. Require PR-stage AI review where configured and human review before final commit or merge for substantive agent-generated work.
16. Apply the correct release gate before merge or deployment.
17. Use the local pre-commit and pre-push gates where configured, keep strict deterministic review enabled locally, and require AI review at the pull-request stage before merge.
18. For ordinary bugs, fix them autonomously once the likely root cause and verification path are clear.

# Definition of Done

Work is done only when all of the following are true:

- The current spec reflects the shipped behavior and the relevant design decisions.
- The implementation respects mobile vs web boundaries and does not prematurely share UI assumptions.
- Security, privacy, authorization, and secret-handling rules are satisfied.
- Verification evidence exists for lint, typecheck, tests, and any task-specific checks.
- The active spec or implementation plan checklist and review notes are current enough that another engineer can see what was done, what changed, and what remains risky.
- Sensitive changes pass the correct release gate and update the applicable runbooks.
- Open questions are either resolved or recorded in an explicit `Open Decision` section with recommendation, rationale, and decision triggers.
- Human review is complete before final commit or merge.
- Local verification and review artifacts are current for the changes being proposed.

# Security and Data-Boundary Rules

1. User data is private by default. Users may only access their own data.
2. Use strict authorization and Row Level Security for any direct client access to Supabase data.
3. Allow direct client to Supabase access only for safe user-scoped operations under strict RLS.
4. Route privileged, secret-backed, integration-backed, server-authoritative, or rate-limited operations through Supabase Edge Functions.
5. Never place service-role credentials, privileged secrets, or signing material in the client.
6. Validate and sanitize every input path. Favor schema validation at all boundaries.
7. Store sensitive client values in Expo SecureStore. Store only non-sensitive fast cache data in MMKV.
8. Design for audit logging, incident response, backup and restore, alerting, and rollback from the start.
9. Treat shared household data, privacy toggles, reimbursements, and personal pots as high-sensitivity product areas.

# Documentation Rules

1. `AGENTS.md` plus `docs/**` are the canonical source of truth.
2. Use the correct document type for the current stage: product brief, PRD, feature spec, implementation plan, bugfix spec, ADR, review checklist, release checklist, or postmortem.
3. Create a spec before non-trivial implementation and reconcile it when the work is complete.
4. Update ADRs when a cross-cutting architectural or workflow decision changes.
5. Keep product docs focused on user value, architecture docs focused on boundaries and data flow, and runbooks focused on operational response.
6. Do not hide unresolved issues in prose. Use an explicit `Open Decision` section.
7. Preserve the product thesis language: Decision layer, Safe-to-Spend, Crisis Cushion, Clarity-as-a-Service, admin work elimination, event or narrative intelligence, forward-looking cash flow, shared household with private autonomy, personal pots, and short-term clarity over retrospective cleanup.

# Verification Rules

1. Nothing is done without proof.
2. Run verification after each implementation slice, not only at the end.
3. Verify against the spec and architecture, not only the diff.
4. Use visual verification for UI work when tooling is available.
5. Compare before and after behavior when fixing regressions.
6. Prefer automated checks that prevent silent drift.
7. If visual tooling is unavailable for UI work, record the fallback verification method explicitly instead of silently skipping it.
8. Ask whether a careful staff engineer would approve the proof set before declaring the task done.

# Review Rules

1. Human review is mandatory before final commit or merge for substantive agent-generated work.
2. Use PR-stage Codex review where configured, and use CodeRabbit on pull requests as an additional reviewer, not as the final authority.
3. Review for correctness, security boundaries, rollback safety, user impact, and documentation alignment.
4. Resolve disagreements between reviewers before proceeding.
5. For sensitive changes, require the sensitive change gate before merge or release.
6. If CodeRabbit is unavailable, fall back to local review gates plus human review; do not treat the absence of CodeRabbit as a reason to skip review.
7. If both Claude and Codex are not available together, use the strongest available fallback stack: fresh-context independent review in the available tool, PR-stage AI review where configured, deterministic local and CI checks, and human review.

# Codex PR Review Contract

1. The repo itself must carry the durable review context. Keep the review bar, security posture, architecture boundaries, workflow rules, and release expectations in `AGENTS.md` plus `docs/**`, not only in tool-specific files or ad hoc PR comments.
2. For PR-stage Codex review, treat the PR body as required context, not optional decoration. The PR body must include:
   - Summary
   - Planning Artifacts
   - Release Gate
   - Verification
   - Docs and Ops
   - Review
3. The `Planning Artifacts` section must link the active product brief if any, PRD, feature spec or bugfix spec, and implementation plan when they exist. If an artifact was not required, say so explicitly.
4. The `Release Gate` section must state the gate and plain-language meaning, not only a letter label.
5. Before requesting PR-stage Codex review, make sure local and CI proof is already current enough to review:
   - `pnpm review:ready`
   - `pnpm verify`
   - lane-specific verification when relevant
6. `@codex review` by itself is acceptable as a trigger, but the best default for substantive PRs is a scoped request that points Codex at the active planning artifacts and risk areas.
7. Do not assume PR-stage Codex review will infer every repo-specific expectation from `.codex/*` or `.claude/*` alone. Keep critical review requirements in normal repo files and in the PR body.
8. For security-sensitive, release-sensitive, or architecture-heavy changes, add a focused follow-up review comment after the trigger. Mention the exact risk areas such as auth, RLS, secrets, secure storage, rollback safety, mobile-vs-web separation, or release readiness.
9. Codex review is an additional review layer, not the final authority. Human review remains mandatory.

# Commands

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm test:unit`
- `pnpm test:integration`
- `pnpm test:e2e`
- `pnpm hooks:install`
- `pnpm bootstrap:local`
- `pnpm new:spec:mobile -- <slug>`
- `pnpm new:spec:web -- <slug>`
- `pnpm new:product-brief -- <slug>`
- `pnpm new:prd -- <mobile|web|shared> <slug>`
- `pnpm new:feature-spec -- <mobile|web> <slug>`
- `pnpm new:implementation-plan -- <mobile|web|shared> <slug>`
- `pnpm new:bugfix-spec -- <slug>`
- `pnpm commit:check`
- `pnpm policy:check`
- `pnpm supabase:check-security`
- `pnpm push:check`
- `pnpm review:local`
- `pnpm review:ai`
- `pnpm ai:check`
- `pnpm review:ready`
- `pnpm verify`
- `pnpm audit`
- `pnpm approve-builds`
- `pnpm docs:reconcile`
- `node ./scripts/verify.mjs`

# Product Lanes

- Mobile lane: the primary product. Optimize for low-friction decision support, daily guidance, cash-flow clarity, reimbursements, splits, privacy toggles, and event-based organization.
- Web lane: separate planning and delivery for landing pages, waitlist capture, trust-building messaging, SEO, and content. Do not let web SEO concerns leak into mobile UX decisions.
- Shared packages: share business rules, schemas, contracts, Supabase types, and engineering standards. Do not prematurely share mobile and web UI.

# Where to Read More

- `docs/agent-workflows/*`
- `docs/product/shared/*`
- `docs/product/mobile/*`
- `docs/product/web/*`
- `docs/architecture/shared/*`
- `docs/architecture/mobile/*`
- `docs/architecture/web/*`
- `docs/security/*`
- `docs/runbooks/*`
- `docs/decisions/*`
- `docs/templates/*`
