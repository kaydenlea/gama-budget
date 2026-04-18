# System Architecture

Gama uses a pnpm monorepo with two product lanes and shared domain packages.

## High-Level Shape

- `apps/mobile`: primary client, built with Expo, Expo Router, React Native, and TypeScript
- `apps/web`: separate Next.js website lane for landing, waitlist, and later SEO or content
- `packages/*`: shared domain logic, schemas, contracts, generated types, and config
- `supabase/*`: backend platform for v1, including database, auth, storage, migrations, and Edge Functions

## Backend Model

Supabase is the backend platform for v1. A separate dedicated backend is not required initially if:

- RLS is strict and verified
- Edge Functions own privileged operations
- secrets never reach clients
- schemas, contracts, and function boundaries remain explicit

## Architectural Priorities

1. decision support over passive tracking
2. security and privacy from day one
3. clear product-lane separation
4. shared business logic without shared UI coupling
5. rollback-aware release design
