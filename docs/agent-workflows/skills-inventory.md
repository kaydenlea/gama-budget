# Skills Inventory

Claude and Codex must maintain the same skill inventory and the same workflow responsibilities. The canonical workflow logic lives in `AGENTS.md` and `docs/agent-workflows/*`; the skill folders in `.claude/skills` and `.codex/skills` are execution shortcuts, not competing standards.

## Shared Skills

- `product-brief-writer`: create or refine product briefs so opportunity framing, user problem, and strategic fit are explicit before PRD or feature work begins.
- `prd-writer`: create or refine PRDs so requirements, non-goals, trust constraints, and success metrics are concrete before implementation planning.
- `spec-planner`: create or reconcile task specs before non-trivial work, including file plan, interfaces, edge cases, and verification.
- `implementation-slicer`: break planned work into small slices with checkpoint verification, re-planning triggers, balanced elegance, and minimal-impact execution.
- `verification-runner`: choose and run the right proof set for the current slice, including visual checks for UI work.
- `security-reviewer`: inspect auth, authorization, secret handling, storage, logging, privacy, rate limiting, and release-risk boundaries.
- `supabase-workflow`: apply the Supabase-first v1 model, RLS posture, Edge Function boundary, migration discipline, and schema-security baseline.
- `mobile-ui-builder`: implement mobile UI aligned with Gama's calm, premium, useful, decision-first UX rules.
- `web-ui-builder`: implement web lane UI without leaking mobile product assumptions into SEO or conversion surfaces.
- `seo-site-builder`: create web content and SEO structures grounded in real product truth and disclosure-safe claims.
- `docs-updater`: reconcile specs, ADRs, runbooks, and docs after each meaningful change.
- `pr-reviewer`: review against spec, architecture, security, and rollback readiness, not only the diff.
- `release-checklist`: evaluate the correct release gate and confirm release, rollback, monitoring, and disclosure readiness.
- `bugfix-workflow`: reproduce, debug, root-cause, fix, verify, and capture lessons for meaningful bug work.
- `cross-model-reviewer`: run independent review against the plan, implementation, verification, and release posture when a second opinion is useful.

## Usage Rules

- Use the same skill names under both `.claude/skills` and `.codex/skills`.
- Keep workflow logic identical. Only minimal tool-adapter differences are allowed.
- Use the reusable generators and templates where they exist instead of inventing ad hoc document structures.
- Update skills when a stable workflow lesson should be reused across tasks.
- Do not let a skill contradict `AGENTS.md` or the workflow docs.
- Local hooks and review gates support the workflow, but they do not replace the responsibilities encoded by these skills.
