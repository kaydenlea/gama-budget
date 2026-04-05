# Local Development Flow

## Default Flow

0. Run `pnpm bootstrap:local` once on a fresh clone.
   If global Corepack or pnpm is unreliable on the machine, run `node ./scripts/bootstrap-local.mjs` instead.
   The bootstrap installs dependencies, installs hooks, verifies the repo, and checks Codex readiness. If Codex is not ready yet, bootstrap warns but still completes.
   For the Expo app, prefer `pnpm mobile:start` or `pnpm mobile:dev` instead of raw `npx expo start`.
   Run `pnpm ai:check` any time you need a quick Codex installation/auth sanity check before opening a PR.
1. Create or update the correct document for the stage of work: product brief, PRD, feature spec, implementation plan, or bugfix spec.
   Prefer the reusable generators such as `pnpm new:product-brief`, `pnpm new:prd`, `pnpm new:feature-spec`, `pnpm new:implementation-plan`, and `pnpm new:bugfix-spec`.
2. Implement in small slices.
3. Let `pre-commit` run local verification before each commit.
4. Push a feature branch, not `main`.
5. Let `pre-push` run the local gate and block unsafe pushes.
6. Run `pnpm review:ready` when you want the full local proof and review gate before PR.
7. Generate a validator-compliant PR body with `pnpm pr:body`, or if GitHub CLI is installed use `pnpm pr:create -- --title "<title>"`.
   The generated body now includes a `Codex Review Prompt` section with a ready-to-paste PR comment.
8. Open or update the pull request with that generated body.
9. Request or confirm PR-stage Codex review, then let CodeRabbit review if installed.
10. Let CI run, then complete human review.
11. If the work maps to Gate B, Gate C, or Gate D, complete `docs/runbooks/security-release-checklist.md` before merge.

## Codex PR Review Prompts

Use these as copy-paste defaults on the PR after the body is current.

Routine substantive PR:

```text
@codex review against the linked planning artifacts in the PR body. Focus on correctness, security boundaries, rollback safety, documentation alignment, and missing verification.
```

Security-sensitive or data-boundary PR:

```text
@codex review against the linked planning artifacts in the PR body. Focus on auth, authorization, RLS, secrets, secure storage, privacy, rollback safety, and whether negative-path verification is sufficient.
```

Mobile-heavy PR:

```text
@codex review against the linked planning artifacts in the PR body. Focus on mobile architecture, Safe-to-Spend trust, secure storage, regression risk, and mobile-vs-web separation.
```

Web-heavy PR:

```text
@codex review against the linked planning artifacts in the PR body. Focus on truthful claims, waitlist or SEO separation, privacy-safe analytics, release risk, and missing verification.
```

Release, CI, or deployment PR:

```text
@codex review against the linked planning artifacts in the PR body. Focus on release readiness, rollback safety, CI or deployment regressions, monitoring and alerting impact, and whether the stated release gate is correct.
```

## If CodeRabbit Is Installed

- open or update the PR
- let CodeRabbit review automatically
- fix findings
- repeat until CI and review are green

## If CodeRabbit Is Not Installed

- rely on local hooks and CI for deterministic checks
- request PR-stage Codex review if that integration is configured
- use human review before merge

Contributors may still use Claude for day-to-day authoring because workflow docs and skills are mirrored. PR-stage Codex review is an additional review layer, not a separate workflow.

## If the AI Review Gate Fails

- Run `pnpm ai:check` to confirm the Codex CLI is installed and authenticated.
- If `pnpm ai:check` fails, fix the local CLI or auth problem first.
- If the PR-stage Codex reviewer still fails after that, treat it as a network or GitHub-integration availability problem and rely on CI, CodeRabbit where installed, and human review until it recovers.

## If Package Installation Is Flaky

- Do not keep retrying the same broad `pnpm install` or `corepack pnpm install` command after repeated hangs.
- Prefer `node ./scripts/bootstrap-local.mjs` for first-run setup because it uses the repo-owned pnpm path.
- Prefer `node ./scripts/pnpm.mjs <args>` over ad hoc global Corepack commands for targeted package-manager tasks.
- Prefer `pnpm mobile:start` or `pnpm mobile:dev` over `npx expo start` so Expo uses the repo-owned pnpm path and clearer dependency checks.
- Before any networked package-manager, Expo, or generator command, inspect machine-level environment settings such as `HTTP_PROXY`, `HTTPS_PROXY`, `ALL_PROXY`, `GIT_HTTP_PROXY`, `GIT_HTTPS_PROXY`, and `NPM_CONFIG_OFFLINE`.
- If those values point to a dead loopback endpoint or force offline mode unexpectedly, stop and classify the problem as an environment issue before retrying installs or generator commands.
- Use `pnpm env:check-tooling` or `node ./scripts/networked-tooling-env.mjs install` to confirm the machine environment before retrying a network-sensitive package-manager command.
- Distinguish between:
  - CI bootstrap failures, which usually mean the workflow setup order is wrong
  - local install failures, which usually mean the machine package-manager environment is unstable
  - post-install test/runtime failures, which should be debugged without another broad reinstall unless the dependency graph is actually invalid
- If manifests or the lockfile did not change, prefer targeted verification over another full workspace reinstall.
- If the local dependency layout is incomplete and you are only changing docs, CI, rules, or repo automation, the pre-commit hook may use a degraded automation-only path. That mode is intentionally blocked for app, package, and Supabase code.

## Important Boundary

Local automation can catch structural mistakes, policy violations, missing docs alignment, and some risky patterns. It cannot guarantee the absence of logic bugs, race conditions, or nuanced security flaws. Human review remains mandatory for substantive work.
