# Edge Functions

Supabase Edge Functions are the privileged server-side boundary for Gama v1.

They run on Deno, not the repo's Node.js runtime. Each function should keep a local `deno.json` so dependency resolution and checking match the actual runtime instead of generic editor TypeScript behavior.

The repo also keeps a shared `supabase/functions/deno.json` plus `.vscode/settings.json` so mixed Node+Deno editing works correctly inside the monorepo. Use the official VS Code Deno extension when editing these files; otherwise VS Code's built-in TypeScript server will surface false diagnostics such as `Cannot find name 'Deno'` and `.ts` import-path complaints.

Sensitive function scaffolds should keep the shared auth guard and the explicit rate-limit blocker in place until a real backed limiter is implemented as part of feature delivery. Do not bypass that blocker with ad hoc per-function logic.

Use them for:

- secret-backed integrations
- imports and exports
- rate-limited workflows
- server-authoritative calculation paths
- destructive or high-sensitivity mutations

Do not put service-role material in mobile or web clients.

Authenticated functions should own their JWT verification path in code and fail closed before any privileged logic runs. Keep configuration, shared auth helpers, and function behavior aligned so future feature work does not depend on hidden defaults.
