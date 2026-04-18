# Verification Loops

Verification is not a single final step. It is a loop that runs at each meaningful checkpoint.

## Slice-Level Loop

For each slice:

1. state what changed
2. run the relevant proof set
3. inspect the output
4. compare the result against the active spec and implementation plan
5. decide whether to continue, fix, or re-plan

## Default Proof Sets

- shared logic or backend slice: lint, typecheck, targeted unit or integration checks, boundary or negative-path checks, and rollback rehearsal when the change affects persistence or release safety
- UI slice: lint, typecheck, targeted tests, build checks, and visual verification when tooling is available
- bugfix slice: reproduce before the fix when possible, confirm the root cause, then compare before and after behavior explicitly
- sensitive slice: include security-boundary, authorization, or abuse-path checks rather than relying only on happy-path tests

## Checkpoint Cadence

- run the loop after each meaningful slice, not after hours of uninterrupted implementation
- if the task is long-running, reopen the spec or plan at regular checkpoints and stop immediately if the implementation drifted
- if a design choice changes during implementation, record it in the spec before continuing

## Verification Types

- lint and formatting checks
- typecheck
- unit tests
- integration tests
- end-to-end or smoke checks
- mobile emulator or device verification
- web visual verification and build checks
- security-specific negative-path checks
- migration and rollback rehearsal where applicable
- accessibility and interaction checks for UI work, including touch targets, reduced motion, and primary-state legibility

## Loop Rules

- verification should match the risk and layer of the change
- backend and system work should lean on scripts, tests, and integration checks
- UI work should include visual verification where available, not only automated tests
- if visual tooling is unavailable, document the fallback manual verification method explicitly
- when external references or generated UI ideas materially influence the work, verify that the shipped result still matches Gama's internal design rules rather than the external tool's defaults
- verification that fails must be resolved or explicitly re-planned before the next slice
- final verification is not a substitute for slice-level verification
- no task is done without proof
