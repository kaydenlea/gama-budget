# PocketCurb Monorepo

PocketCurb is a security-first, decision-first personal finance operating system. The product is not trying to be another cleanup-heavy budget tracker. The goal is to reduce admin work, minimize categorization burden, handle reimbursements and shared spending correctly, and give users short-term actionable clarity through Safe-to-Spend guidance, a Daily Spending Meter, running-balance awareness, and forward-looking cash-flow context.

This repository now contains both the operating manual and the working monorepo foundation:

- a real Expo mobile lane scaffold
- a separate web lane scaffold for landing, waitlist, and SEO work
- shared workspace packages for domain logic, schemas, API contracts, Supabase types, and config
- Supabase migration and Edge Function conventions
- local hooks, CI, and review automation for agent-assisted development

## Repo Map

- `apps/mobile`: primary product lane, built with Expo, Expo Router, React Native, and TypeScript
- `apps/web`: separate Next.js web lane for landing, waitlist, and content/SEO work
- `packages/core-domain`: Safe-to-Spend, daily-guidance, and decision-layer domain logic
- `packages/schemas`: shared Zod contracts and validation boundaries
- `packages/api-client`: typed wrappers for Supabase Edge Function calls
- `packages/supabase-types`: shared database and function types
- `packages/ui-mobile`: mobile-only UI primitives
- `packages/ui-web`: web-only UI primitives
- `packages/config-*`: shared ESLint, TypeScript, and Jest config
- `supabase/*`: migrations, seed placeholders, Edge Function scaffolds, and type-generation notes
- `docs/*`: canonical product, architecture, security, runbook, ADR, and agent workflow documentation
- `.claude/*` and `.codex/*`: mirrored rules and mirrored skills with the same workflow contract

## Product Lanes

Mobile is the primary product. It owns the decision layer, daily guidance, transaction simulation, shared-spending correction, privacy toggles, and forward-looking finance UX.

Web is a separate lane. It exists for landing pages, waitlist flows, trust/disclosure content, and later SEO or editorial content. It should share schemas and contracts, not mobile UI assumptions.

## Stack

- Mobile: Expo, EAS, Expo Router, React Native, TypeScript
- Web: Next.js App Router, React, TypeScript
- Mobile UI: Gluestack UI, NativeWind, Reanimated, Gesture Handler, FlashList
- State and data: Zustand, TanStack Query, Supabase, Supabase Auth, Supabase Edge Functions
- Forms and validation: React Hook Form, Zod
- Storage: Expo SecureStore for sensitive values, MMKV for non-sensitive persistence, SQLite only when explicitly justified later
- Monitoring and monetization: RevenueCat, PostHog, Sentry
- Tooling: pnpm, ESLint, Prettier, Jest, jest-expo, React Native Testing Library, CodeRabbit-ready review config
- Supabase Edge Functions run on Deno and should be verified in the Deno runtime rather than treated as generic Node TypeScript

Framework baselines should stay close to the official sources:

- Expo mobile scaffolds should follow `create-expo-app` plus Expo Router and Expo package compatibility guidance.
- NativeWind setup should follow NativeWind's official Expo installation guidance.
- Web scaffolds should follow `create-next-app` and Tailwind's official Next.js installation guidance.
- If the environment blocks those generators, reconcile the existing app against the official documented baseline before treating the setup as finished.

## First Run

Run once per clone or machine:

```bash
pnpm bootstrap:local
```

Install Deno from the official Deno instructions before running bootstrap or `pnpm verify`. Install the official VS Code Deno extension too if you edit `supabase/functions/**`, because those files use the Deno language server rather than generic TypeScript diagnostics. Supabase Edge Function checking is part of the standard repo proof path now.

If global Corepack or pnpm is unstable on a machine, run the repo-owned bootstrap directly:

```bash
node ./scripts/bootstrap-local.mjs
```

That command:

- installs workspace dependencies with the repo-pinned pnpm toolchain
- installs the repo Git hooks
- runs repository verification
- checks whether Codex CLI is available and authenticated
- warns instead of failing if Codex is not ready yet on the machine
- requires Deno for the full Supabase Edge Function proof path

Codex review belongs at PR stage. Claude contributors still use the same docs, skills, and workflow, while local hooks keep deterministic proof and workflow evidence strict before anything is pushed.

If a machine shows flaky global Corepack behavior, prefer the repo-owned entrypoints instead of repeatedly retrying broad global install commands:

- `node ./scripts/bootstrap-local.mjs`
- `node ./scripts/pnpm.mjs <args>`
- `pnpm mobile:start`
- `pnpm mobile:dev`

For the mobile app, prefer `pnpm mobile:start` or `pnpm mobile:dev` over raw `npx expo start`. The repo-owned entrypoint uses the pinned pnpm toolchain and fails fast if the workspace links are incomplete.

## Verification

Primary commands:

- `pnpm lint`
- `pnpm policy:check`
- `pnpm supabase:check-security`
- `pnpm supabase:functions:check`
- `pnpm typecheck`
- `pnpm test`
- `pnpm verify`
- `pnpm verify:mobile`
- `pnpm verify:web`
- `pnpm mobile:start`
- `pnpm mobile:dev`
- `pnpm audit`
- `pnpm approve-builds`

Helper commands:

- `pnpm new:product-brief -- <slug>`
- `pnpm new:prd -- <mobile|web|shared> <slug>`
- `pnpm new:spec:mobile -- <slug>`
- `pnpm new:spec:web -- <slug>`
- `pnpm new:feature-spec -- <mobile|web> <slug>`
- `pnpm new:implementation-plan -- <mobile|web|shared> <slug>`
- `pnpm new:bugfix-spec -- <slug>`
- `pnpm pr:body`
- `pnpm pr:create -- --title "<title>"`
- `node ./scripts/local-review.mjs`
- `node ./scripts/pre-commit.mjs`
- `node ./scripts/pre-push.mjs`
- `pnpm review:ai`
- `pnpm ai:check`
- `node ./scripts/review-ready.mjs`
- `node ./scripts/reconcile-docs.mjs`

`pnpm verify` is the main repo proof gate. It runs lint, policy checks, Supabase security checks, typecheck, docs checks, and the current unit/integration/e2e baseline.

## Workflow

Read [AGENTS.md](./AGENTS.md) first. That is the canonical source of truth for Claude and Codex.

Then use:

- [docs/getting-started.md](./docs/getting-started.md) for the practical local flow
- [docs/runbooks/how-to-add-a-feature.md](./docs/runbooks/how-to-add-a-feature.md) for the shortest human-readable feature workflow
- [docs/runbooks/how-to-fix-a-bug.md](./docs/runbooks/how-to-fix-a-bug.md) for the shortest human-readable bugfix workflow
- [docs/agent-workflows](./docs/agent-workflows) for the operating model, product-doc lifecycle, feature lifecycle, bugfix lifecycle, verification loops, cross-model review, staff review, release standards, and lessons promotion rules
- [docs/product](./docs/product) for mission, product thesis, MVP scope, and lane strategy
- [docs/architecture](./docs/architecture) for system boundaries and storage/data flow
- [docs/security](./docs/security) and [docs/runbooks](./docs/runbooks) for threat model, auth, privacy, retention, incident response, rollback, monitoring, and release gates
- [docs/templates](./docs/templates) for reusable product-brief, PRD, feature-spec, implementation-plan, bugfix, review, release, ADR, and postmortem templates
- [docs/specs/mobile/_template.md](./docs/specs/mobile/_template.md) and [docs/specs/web/_template.md](./docs/specs/web/_template.md) for non-trivial work

The expected agent flow is:

1. start with the right product context
2. refine the product brief or PRD when the problem framing is still moving
3. create a feature spec and implementation plan for non-trivial work
4. ask before assuming when architecture or security could change
5. implement in small slices
6. verify after each slice
7. stop and re-plan if the plan becomes wrong
8. update specs and docs as reality changes
9. use cross-model review where useful, then PR review plus human review before merge
10. complete `docs/runbooks/security-release-checklist.md` for Gate B, Gate C, and Gate D work

## Local Guardrails

The repo uses `.githooks` as the shared hooks path.

- `pre-commit` runs verification before a commit is created
- `pre-push` reruns verification, blocks direct pushes to protected branches, and runs the local review gate with workflow-evidence enforcement
- `pnpm review:ready` runs the full local proof set before work is considered ready to publish
- `pnpm ai:check` verifies the local Codex CLI installation and authentication state before you rely on PR-stage Codex review

Review artifacts are written to `.git/pocketcurb/`.

Emergency overrides exist, but they are deliberate escape hatches:

- `POCKETCURB_BYPASS_LOCAL_GATES=1`
- `POCKETCURB_ALLOW_PROTECTED_PUSH=1`

## CI and Review Discipline

CI installs dependencies, runs `pnpm verify`, runs lane-targeted mobile/web verification, runs the local review gate, and runs `pnpm audit`.

The automated audit gate currently blocks on `critical` findings. High-severity transitive issues from upstream toolchains still need human review and dependency tracking even when they are not blocking CI.

CodeRabbit is configured through [.coderabbit.yaml](./.coderabbit.yaml), but it only becomes active once the GitHub app is installed on the repo or org. Codex review belongs at PR stage rather than in the local push hook.

Merge discipline is:

1. local hooks
2. CI
3. PR-stage Codex review where configured
4. CodeRabbit where configured
5. mandatory human review

## Pull Requests

GitHub's UI template and `gh pr create --fill` do not always leave you with a validator-compliant PR body. Prefer the repo-owned helpers:

- `pnpm pr:body` prints a compliant draft body based on the current branch's changed docs and lanes
- `pnpm pr:create -- --title "<title>"` creates a PR with that generated body when GitHub CLI is installed

If `gh` is not installed, run `pnpm pr:body`, paste the output into the PR body, and then review the auto-generated summary plus the checkbox state before requesting review.

## Notes

- The repo is pinned to `pnpm@10.6.2`.
- The lockfile is committed and CI installs the pinned pnpm version through `pnpm/action-setup`.
- SQLite is intentionally not the default local data path.
- Better Auth, Clerk, Resend-in-mobile-core, and MCP-first workflows are intentionally not part of this baseline.
