# Lessons and Rule Promotion

The repository should improve over time rather than collecting stale task debris.

## Promotion Rule

Promote a lesson into shared docs, rules, or skills only when it is:

- stable
- reusable
- likely to recur
- specific enough to be actionable

After a meaningful user correction, update the active task doc immediately and decide whether the correction revealed a stable reusable pattern that belongs in shared docs, rules, or skills.

## Keep Task-Specific Details Local

Keep one-off details inside:

- the active spec
- the review notes for that change
- the postmortem if the issue was incident-shaped

## Anti-Clutter Rule

Do not create random instruction fragments. If a lesson is worth keeping, put it in the correct shared location and reconcile nearby docs so the system stays coherent.

## Current Stable Lessons

- Do not keep retrying broad workspace dependency installs after the same failure mode has already repeated. Promote that lesson immediately and switch to the narrowest viable option.
- Prefer repo-owned package-manager entrypoints and wrapper scripts over ad hoc global Corepack commands when the machine or environment has shown flaky package-manager behavior.
- Separate bootstrap failures from application failures. Fix CI package-manager setup first, then debug repo-level test or runtime issues independently.
- Review relevant stable lessons at the start of substantive work instead of rediscovering them after the mistake recurs.
- Before any networked package-manager or generator command, inspect machine-level proxy and offline settings first. Broken loopback proxies and forced offline flags are environment problems, not repo setup requirements.
