# Staff Review Standard

The implicit bar is: would a careful staff engineer approve this for a security-first finance product?

## Focus Areas

- architecture drift
- unnecessary complexity
- weak abstractions or workaround chains
- auth and authorization correctness
- release and rollback safety
- data-boundary mistakes
- missing tests or weak verification
- stale docs or misleading specs
- missing or weak rollback thinking
- changes that no longer match the feature spec or implementation plan

## Required Review Inputs

- active product brief or PRD when relevant
- active feature spec or bugfix spec
- implementation plan
- verification evidence
- release gate classification
- touched-file list

## Required Review Habits

- read every touched file before approving the change
- compare the actual code to the spec and plan, not only the diff summary
- challenge cleverness, silent scope creep, and workaround chains
- stop the review and require re-planning if the implementation shape no longer matches the approved plan

## Review Questions

- is this the simplest correct design?
- does it solve the root cause?
- does it preserve lane ownership and boundaries?
- would a future engineer understand why this was done?
- can it be rolled back safely?
- does it increase long-term maintenance burden without enough payoff?
- if only one agent tool was available, was the fallback independent-review path still applied?

## Review Output

Record:

- major findings
- required changes before merge
- residual risks
- any follow-up work that should not be hidden inside the merge
- whether every touched file was reviewed against the active plan and release gate
