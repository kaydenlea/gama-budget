# Implementation Standard

Implementation follows planning, not the other way around. The goal is small, verified slices that preserve architectural clarity and security boundaries.

## Slice Size

Implement in narrow slices with a clear outcome, verification step, and rollback path. Good slices usually change one behavior, one boundary, or one layer at a time.

## Implementation Rules

- Start from the approved spec or plan.
- Change only the files required for the current slice.
- Prefer root-cause fixes and the simplest correct design.
- Treat balanced elegance as the target quality bar: the simplest correct solution with no brittle cleverness and no unnecessary abstraction.
- If a fix feels ugly, pause and re-evaluate whether the root cause is actually understood and whether a more elegant solution is warranted.
- Avoid workaround chains, speculative abstractions, and broad refactors without a spec.
- Keep lane ownership clean: shared packages for domain logic and contracts, platform packages for platform UI and UX.
- Update specs and docs as design reality changes during implementation.
- Fix ordinary bugs autonomously when the root cause and verification path are sufficiently clear.
- Mark progress in the active checklist as slices complete and add high-level review notes as implementation decisions change.

## Boundary Checks

During implementation, confirm:

- client code does not receive privileged secrets
- direct mobile or web access to Supabase remains user-scoped and protected by RLS
- privileged or secret-backed operations move through Edge Functions
- sensitive values use SecureStore, not MMKV
- analytics and monitoring additions do not violate data-minimization rules

## Re-Planning Triggers

Stop and re-plan when:

- the implementation reveals a different data model than expected
- the current plan would require broadening file scope materially
- review feedback exposes a meaningful design conflict
- verification shows drift from the spec
