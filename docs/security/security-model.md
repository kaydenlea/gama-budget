# Security Model

PocketCurb is privacy-first and security-first from the start. The default posture is least privilege, data minimization, and explicit boundary ownership.

## Core Principles

- users can access only their own data unless an intentional shared context grants scoped visibility
- direct client access is limited to safe user-scoped operations under strict RLS
- privileged operations run through Supabase Edge Functions
- secrets never live in mobile or web clients
- sensitive local values use secure platform storage
- input validation and sanitization apply at every boundary
- rate limiting protects sensitive and abuse-prone paths
- user-safe errors prevent policy and system-detail leakage
- alerts, rollback, and incident response are first-class controls
- operational monitoring and security alerting are distinct from product analytics; analytics must never become the security system of record

## Control Families

- authentication and session control
- authorization and row ownership
- secret handling
- secure local storage
- audit logging for sensitive actions
- rate limiting and abuse protection
- monitoring and alerting
- backup, restore, and rollback
- release gates and review discipline

## Mobile Baseline

Adopt an OWASP MASVS and MASTG-style baseline for mobile hardening, including secure storage, transport integrity, device-compromise awareness, debug build separation, and planning for device integrity signals such as App Attest and Play Integrity on sensitive flows.

## Current Scaffold Enforcement

- mobile clients use public Supabase URL plus anon key only; privileged keys remain server-side
- mobile API wrappers translate backend failures into user-safe errors instead of leaking raw backend responses
- mobile secure storage defaults to Expo SecureStore for sensitive values through a dedicated wrapper
- mobile MMKV helpers reject obviously sensitive keys and are reserved for non-sensitive cache and preference state
- Supabase Edge Functions use shared helpers for method guards, code-owned JWT verification on authenticated scaffolds, explicit rate-limit release blockers on sensitive scaffolds until a real backend exists, and user-safe error responses
