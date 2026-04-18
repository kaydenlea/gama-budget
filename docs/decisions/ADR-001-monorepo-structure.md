# ADR-001: Monorepo Structure

## Status

Accepted.

## Context

Gama needs a mobile-first product lane, a separate web lane, shared business logic, shared schemas, shared contracts, and shared engineering standards without collapsing platform-specific UX into one code path.

## Decision

Use a pnpm monorepo with:

- `apps/mobile`
- `apps/web`
- shared packages for domain logic, schemas, API clients, Supabase types, UI by platform, and config
- `supabase/*` for backend platform assets
- `docs/*` as the canonical operating layer

## Consequences

- shared logic becomes reusable without forcing shared UI
- mobile and web planning remain distinct
- CI, release, and documentation standards can be enforced centrally
- future package boundaries are explicit instead of improvised

