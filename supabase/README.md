# Supabase Workspace

This directory contains the backend platform assets for the Supabase-first v1 architecture.

- `migrations/`: SQL schema changes that must remain reviewable and rollback-aware.
- `seed/`: non-production seed assets and scripts.
- `functions/`: Supabase Edge Functions for privileged or secret-backed operations.
- `types/`: generated or curated type artifacts that can be promoted into `packages/supabase-types`.

Direct client access is allowed only for safe user-scoped operations under strict RLS. Privileged logic belongs in Edge Functions.

Use `docs/security/supabase-schema-security.md` plus `pnpm supabase:check-security` before introducing real schema migrations.

## Current Baseline

- `config.toml`: local Supabase CLI settings
- `migrations/`: secure table templates and future timestamped migrations
- `functions/_shared`: shared helpers for auth, secrets, and common responses
- `functions/safe-to-spend`: starter Edge Function shape for privileged decision-layer logic
- `functions/*/deno.json`: function-local Deno configuration for runtime-correct dependency resolution and checking
- `functions/*/deno.lock`: pinned Deno dependency graph for reproducible function checks
- `types/`: placeholders and notes for generated database types before they are promoted into `packages/supabase-types`

## Secret Handling

- do not commit real service-role keys or third-party credentials
- anon/public keys belong in client env only when they are safe public values
- privileged secrets stay in Edge Function runtime configuration
- imports, exports, destructive deletes, and server-authoritative calculations must remain server-side
