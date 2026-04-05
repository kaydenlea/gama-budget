# Secure Storage

## Mobile Storage Rules

- use Expo SecureStore for auth tokens and other sensitive values
- use MMKV only for non-sensitive preferences and cache state
- do not place password-reset state, recovery tokens, export tokens, credentials, or session material in MMKV
- do not place sensitive data in logs, analytics payloads, or insecure persistence
- prefer the repository storage helpers over raw storage calls so boundary rules stay enforceable

## Server-Side Storage Rules

- protect database access through RLS and least privilege
- store secrets only in deployment secret systems
- encrypt data in transit and rely on managed platform encryption at rest where available

## Device Integrity Planning

App Attest and Play Integrity style controls are launch-blocking requirements for sensitive mobile flows where device trust materially affects risk. Do not ship those flows without an explicit decision, implementation plan, and release evidence covering device-integrity posture.
