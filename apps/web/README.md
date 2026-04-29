# Web Lane

`apps/web` is the future landing, waitlist, trust, and SEO lane. It is intentionally separate from the mobile app so that marketing and search concerns do not leak into the product UX model.

Current baseline:

- Next.js 16 App Router with typed routes
- Tailwind CSS 4 using `@tailwindcss/postcss`
- landing, waitlist, privacy, sitemap, robots, manifest, favicon, and social-image foundation
- centralized route registry for canonical URLs, metadata, breadcrumbs, schema, and sitemap freshness
- environment-aware noindex behavior for local and preview deployments
- typed JSON-LD helpers for Organization, WebSite, WebPage, and BreadcrumbList output
- automated tests for metadata, schema, robots, and sitemap behavior
- room for waitlist plumbing, disclosures, and later SEO or educational expansion

What this lane should not do yet:

- share mobile UI components directly
- overclaim product behavior that is not shipped
- become the source of truth for product requirements

Environment note:

- start from `apps/web/.env.example` for local configuration
- keep `GAMA_DISABLE_INDEXING=true` for local, sandbox, or preview-style environments
- until the public domain exists, keep `NEXT_PUBLIC_SITE_URL` on localhost or another clearly synthetic non-production origin; do not assume a real preview subdomain host
- set `NEXT_PUBLIC_SITE_URL=https://gamabudget.com` only when the planned public domain is actually provisioned for launch
- prefer a fully qualified origin such as `https://gamabudget.com`; bare hosts are normalized, and blank or invalid values fall back to the planned canonical public origin

Current commands:

- `pnpm --dir apps/web dev`
- `pnpm --dir apps/web build`
- `pnpm verify:web`
