# SEO Architecture

## Purpose

SEO architecture should support discoverability and trustworthy content distribution without weakening product truth.

## Building Blocks

- route-level metadata ownership driven by a shared page registry
- canonical URL strategy owned by code, not by per-page strings
- environment-aware robots and noindex defaults so local or non-production deployments do not leak into indexation
- sitemap generation tied to canonical route registry entries and explicit content update signals
- JSON-LD schema factories where claims are factual and stable
- visible breadcrumb hierarchy plus matching breadcrumb schema when page hierarchy exists
- manifest, icons, and social-image defaults owned by the App Router
- privacy-safe analytics and attribution only when explicitly introduced

## Guardrails

- no SEO-driven content may override mobile product priorities
- no unsupported feature claims
- waitlist, contact, and analytics flows must follow privacy and disclosure standards
- canonical URL ownership should live in the web lane, not be scattered through page prose
- `gamabudget.com` is the only intended public domain; non-production examples should use localhost or clearly synthetic hosts, not implied preview subdomains
- do not add `www.gamabudget.com` to runtime allowlists or redirects until that host is actually provisioned and the canonical-domain policy is finalized
- non-production deployments should default to `noindex` plus crawl disallow unless intentionally promoted
- training-crawler controls may be stricter than search-discovery controls, but classic search eligibility must remain intact
