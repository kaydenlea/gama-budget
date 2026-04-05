# UI Design Standard

PocketCurb design should feel calm, premium, minimal, useful, and consistency-first. The product should reduce shame and admin work rather than amplifying them.

## Source of Truth

External tools such as Stitch, Gemini image generation, 21st.dev, and similar design accelerators are valid for ideation. They are not the source of truth. The source of truth is the repository's own design rules, component standards, and product intent.

## External Reference Intake

- use external tools for inspiration, exploration, rough composition, placeholder copy direction, or non-canonical image ideation
- do not let external tools define PocketCurb's component standards, interaction rules, trust model, or product language
- when a UI task materially borrows from an external reference, record:
  - which reference or tool was used
  - what principle or pattern was borrowed
  - what was intentionally rejected
  - how the final result was reconciled with PocketCurb's internal rules
- prefer adapting principles rather than copying literal layouts blindly

## Privacy and Provenance Rules

- do not paste sensitive user data, real financial data, secrets, internal-only product details, or production screenshots into external design or image-generation tools
- do not assume code or assets from external tools are safe to paste directly into the repo without review
- verify licensing and provenance before reusing external code, design systems, or generated assets
- if external snippets or assets materially influence shipped work, note provenance in the active spec or review notes

## Product Design Rules

- optimize for clarity over novelty
- show guidance, context, suggestions, and warnings instead of raw data dumps
- keep short-term clarity first, event and narrative intelligence second, long-term impact third
- avoid guilt-heavy or chore-like interactions
- prefer repeatable visual systems over one-off styling
- separate web marketing aesthetics from mobile product UX

## Mobile Guidance

- design for quick daily decision support
- make Safe-to-Spend and the Daily Spending Meter legible at a glance
- keep reimbursement, split, and privacy controls explicit without making the flow heavy
- preserve fast manual entry and low-friction correction loops
- maintain accessible touch targets, safe-area correctness, and reduced-motion friendliness
- prefer stable visual hierarchy over novelty in finance-critical flows

## Web Guidance

- optimize for trust, clarity, and conversion without infecting product UX with SEO-first decisions
- keep claims grounded in actual product differentiation: admin work elimination, forward-looking cash flow, Safe-to-Spend, shared spending correctness, and privacy-first resilience
- prefer premium spacing, restrained typography, and calm surfaces over growth-hack visual noise
- make landing, waitlist, privacy, and later content routes feel like one coherent lane rather than unrelated one-off pages
- keep calls to action honest about product readiness and launch timing

## UI Verification Baseline

For meaningful UI work, verify at least:

- responsive layout on the intended viewport classes
- contrast and legibility of primary decision surfaces
- loading, empty, error, and disabled states
- safe-area, keyboard, and touch-target behavior on mobile where applicable
- reduced-motion friendliness for meaningful animation
- visual consistency with existing lane-specific patterns

If visual tooling is unavailable, record the fallback verification method in the spec, review notes, or PR metadata instead of silently skipping it.
