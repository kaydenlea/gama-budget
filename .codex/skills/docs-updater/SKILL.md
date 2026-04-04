---
name: docs-updater
description: Reconcile specs, docs, ADRs, runbooks, and shared rules after implementation. Use when a task changes durable behavior, architecture, security posture, workflow, or product truth and the repo documentation must stay aligned with reality.
---

# Docs Updater

1. Read `docs/agent-workflows/docs-update-standard.md` and the active spec.
2. Update the minimal set of product, architecture, security, runbook, ADR, and workflow docs required to reflect reality.
3. After user corrections or repeated issues, move stable lessons into shared docs or rules when the pattern is reusable.
4. Keep task-specific nuance inside the relevant spec.
5. Record open decisions explicitly with recommendation, rationale, and change trigger.
6. Ensure the final docs explain what changed, why, and how it was verified.
