# Web Architecture

## Current Baseline

The current web lane uses Next.js App Router, React, TypeScript, typed routes, and a Tailwind-based design system foundation. This fits the repo's website responsibilities without leaking SEO or landing-page assumptions into the mobile product lane.

## Responsibilities

- landing and waitlist surfaces
- trust and disclosure content
- structured metadata and search visibility
- future web-specific analytics and experimentation under privacy rules

## Separation Rules

- do not import mobile navigation or mobile design assumptions into the website
- keep marketing copy faithful to the product docs
- share contracts and validation through packages, not UI components by default
- treat external website or SEO-generation tools as ideation inputs, not the source of truth

## Foundation Building Blocks

- route-owned metadata and canonical path helpers
- shared page registry for canonical paths, breadcrumbs, sitemap freshness, and robots posture
- typed content modules for landing, waitlist, privacy, and later educational surfaces
- sitemap, robots, manifest, favicon, and social-image generation owned by the web lane
- JSON-LD factories for Organization, WebSite, WebPage, and BreadcrumbList schema
- no live waitlist backend or analytics-vendor integration until privacy and disclosure ownership are explicit
