# Bugfix Spec

## Overview

Describe the bug and why it matters.

## Failure Context

Capture the observed behavior, expected behavior, and user or system impact.

## Reproduction

Describe exact reproduction steps or explain why direct reproduction is currently unavailable.

## Evidence

Capture the logs, failing tests, traces, screenshots, or reports that support the current understanding.

## Root-Cause Statement

State the root cause clearly and record what evidence supports it. If the diagnosis is still provisional, say so explicitly.

## File Plan

List the exact files likely to change.

## Minimal Fix Plan

Describe the smallest correct fix that addresses the root cause without unnecessary side effects.

## Edge Cases

List nearby failure modes or regressions to watch for.

## Verification Plan

State how the bug will be proven fixed, how before/after behavior will be compared when relevant, and what regression checks must run.
If the bug touches trust-critical boundaries, also list any applicable remaining feature-dependent obligations from `docs/security/security-review-baseline.md` and classify them.

## Review Notes

Capture meaningful findings and any residual risk.

## Final Reconciliation

Record the actual root cause, the fix, and any stable lessons that should be promoted into shared docs or rules.
