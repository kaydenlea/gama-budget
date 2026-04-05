# Getting Started

This document is the fastest way to understand how to use the PocketCurb repo day to day.

## First Run

Run this once on a fresh clone or new machine:

```bash
pnpm bootstrap:local
```

If your machine has flaky global Corepack or pnpm behavior, run the repo-owned bootstrap directly instead:

```bash
node ./scripts/bootstrap-local.mjs
```

To start the mobile app after bootstrap, prefer the repo-owned wrappers instead of raw `npx expo start`:

```bash
pnpm mobile:start
pnpm mobile:dev
```

That command:

- installs workspace dependencies
- installs the repo Git hooks
- runs repository verification
- checks whether `codex` is installed and authenticated
- warns instead of failing if `codex` is not ready yet on the machine

Codex review belongs at the pull-request stage. Claude users still get the same workflow guidance and mirrored skills, and local hooks still enforce deterministic review before commit or push.

## Install Discipline

- Do not keep retrying broad `pnpm install` or `corepack pnpm install` commands after the same hang or failure repeats.
- Prefer the repo-owned entrypoints first:
  - `node ./scripts/bootstrap-local.mjs`
  - `node ./scripts/pnpm.mjs <args>`
  - `pnpm mobile:start`
  - `pnpm mobile:dev`
- Before any networked package or generator command, inspect machine-level environment settings such as `HTTP_PROXY`, `HTTPS_PROXY`, `ALL_PROXY`, `GIT_HTTP_PROXY`, `GIT_HTTPS_PROXY`, and `NPM_CONFIG_OFFLINE`.
- If those variables are pointing to a dead local endpoint or forcing offline mode unexpectedly, treat that as a machine environment problem first instead of retrying installs.
- Use `pnpm env:check-tooling` or `node ./scripts/networked-tooling-env.mjs install` to fail fast before retrying a network-sensitive package-manager command.
- If install behavior is flaky, separate the problem:
  - CI package-manager bootstrap problem
  - local machine package-manager problem
  - repo test/runtime problem after dependencies already exist
- Prefer static inspection and targeted verification before attempting another full workspace reinstall.

## Framework Baselines

- Mobile app scaffolds should follow the official Expo baseline first: `create-expo-app`, Expo Router installation guidance, and NativeWind's official Expo setup.
- Web app scaffolds should follow the official Next.js and Tailwind baseline first: `create-next-app` and Tailwind's official Next.js setup.
- If local environment policy blocks generator commands or network fetches, reconcile the existing app against the official documented baseline before considering the setup complete.

## Day-to-Day Flow

1. Prompt Codex or Claude normally.
2. For new product or scope-shaping work, start with a product brief or PRD first.
   Use `pnpm new:product-brief -- <slug>` or `pnpm new:prd -- <mobile|web|shared> <slug>` when helpful.
3. For non-trivial delivery work, the agent should create a feature spec and implementation plan before coding.
   If you want to create them explicitly, run `pnpm new:spec:mobile -- <slug>`, `pnpm new:spec:web -- <slug>`, `pnpm new:feature-spec -- <mobile|web> <slug>`, or `pnpm new:implementation-plan -- <mobile|web|shared> <slug>`.
   For meaningful defects, use `pnpm new:bugfix-spec -- <slug>`.
   For backend schema work, classify the table boundary first and use the Supabase migration templates.
4. Make changes in a feature branch.
5. Commit normally.
   The `pre-commit` hook runs repo verification.
6. Push normally.
   The `pre-push` hook:
   - blocks direct pushes to protected branches
   - reruns verification
   - runs the local review gate with workflow-evidence enforcement
   - writes review artifacts under `.git/pocketcurb/`
7. Open a pull request.
8. Request or confirm PR-stage AI review.
   Use Codex review on the PR where configured. Let CodeRabbit review too if installed.
9. Let CI run.
10. Complete human review before merge.

## What Is Automatic

- repo contract verification
- workspace install through the local bootstrap
- local pre-commit verification
- local pre-push verification
- direct-push blocking on protected branches
- local workflow-evidence review before push
- lightweight static policy checks during verification
- Supabase migration security checks during verification
- CI on push and PR
- PR-stage Codex review where configured
- CodeRabbit review if the GitHub app is installed

## What Is Not Fully Automatic

- Git hook installation before the first bootstrap
- human review
- CodeRabbit installation on GitHub
- perfect agent behavior for every possible prompt

The repo is strongly guided, not magic. The docs, rules, skills, hooks, and CI make the default path much safer, but they do not guarantee correctness against every ambiguous or low-quality prompt.

## How Prompting Works

You can usually prompt freely. The repo is designed so Codex and Claude can infer the workflow from:

- `AGENTS.md`
- `docs/agent-workflows/*`
- `docs/product/*`
- `docs/architecture/*`
- `docs/security/*`
- `docs/security/supabase-schema-security.md`
- mirrored skills under `.codex/skills/*` and `.claude/skills/*`

In practice, this means the agent should usually know to:

- plan first for non-trivial work
- use the relevant spec template
- update docs and ADRs when reality changes
- apply the security and release-gate rules
- run verification before claiming the task is done
- avoid client secret exposure and other banned patterns that the policy checks catch quickly

## Important Limits

The setup is robust, but not absolute.

- If the PR-stage Codex reviewer is not configured or temporarily unavailable, the repo still relies on local proof, CI, CodeRabbit where installed, and human review.
- Claude contributors still benefit from the same docs and mirrored skills, and the workflow itself stays shared across both tools.
- If someone bypasses the hooks explicitly, the local gates can be skipped.
- If work is done outside Git or outside this repo, the hooks do not help.
- Human judgment is still required for architecture, security nuance, and release risk.

## Emergency Overrides

Use these only deliberately:

- `POCKETCURB_BYPASS_LOCAL_GATES=1`
- `POCKETCURB_ALLOW_PROTECTED_PUSH=1`

## Recommended Mental Model

Use the README as the entry page, this file as the practical operating guide, and `AGENTS.md` plus `docs/agent-workflows/*` as the canonical workflow rules.
