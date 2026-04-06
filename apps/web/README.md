# Web Lane

`apps/web` is the future landing, waitlist, trust, and SEO lane. It is intentionally separate from the mobile app so that marketing and search concerns do not leak into the product UX model.

Current baseline:

- Next.js 16 App Router with typed routes
- Tailwind CSS 4 using `@tailwindcss/postcss`
- landing, waitlist, privacy, sitemap, and robots foundation
- typed content and metadata helpers for truthful marketing copy
- room for waitlist plumbing, disclosures, and later SEO or educational expansion

What this lane should not do yet:

- share mobile UI components directly
- overclaim product behavior that is not shipped
- become the source of truth for product requirements

Environment note:

- start from `apps/web/.env.example` for local configuration
- local env files are allowed for this lane at `apps/web/.env.local`
- set `NEXT_PUBLIC_SITE_URL` before production launch so canonical URLs, sitemap entries, and metadata use the real web origin
- prefer a fully qualified origin such as `https://pocketcurb.com`; bare hosts are normalized, and blank or invalid values fall back to the production default

Current commands:

- `pnpm --dir apps/web dev`
- `pnpm --dir apps/web build`
- `pnpm verify:web`
