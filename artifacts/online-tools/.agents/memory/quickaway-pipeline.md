---
name: QuickAway build pipeline
description: Architecture decisions, module ownership, and extension patterns for the 6-phase static prerender pipeline. Read before any build-pipeline or SEO work.
---

## Status
All 6 phases complete as of 2026-07-26. Build is clean, validation passes on all 40 pages.

## Module ownership (binding — do not duplicate)
- `src/lib/site-config.ts` — sole source of SITE_URL, SITE_NAME, SITE_OG_IMAGE, SITE_LOGO_URL
- `src/lib/page-meta.ts` — sole source of SEO strings for the 8 fixed-path pages
- `src/components/json-ld.tsx` — sole source of all 15 exported `build*Schema()` / `JsonLd` builders
- `scripts/types.ts` — sole source of PageRoute, PageSeo, PageType, ChangeFrequency
- `scripts/build-routes.ts` → `getAllRoutes()` — single entry point for all build consumers
- `scripts/routes/*.ts` — sub-collectors, one per page type, each exports `collect*Routes()`
- `scripts/prerender.ts` — reads dist/public/index.html template, writes 40 route-specific index.html files
- `scripts/validate-prerender.ts` — cross-references route data vs generated HTML; exits 1 on failure
- `scripts/CONVENTIONS.md` — permanent engineering standards (read it)

## Build pipeline (invariant order)
```
pnpm run build
  └─ vite build --config vite.config.ts   # writes dist/public/index.html + assets
  └─ tsx scripts/prerender.ts             # reads template, writes 40 index.html files
```

## Validation commands
```
npx tsx scripts/build-routes.ts       # self-test: 40 routes, unique paths/canonicals
npx tsx scripts/validate-prerender.ts # per-page diff: title, desc, canonical, OG, Twitter, JSON-LD
```

## Key decisions
**Why:** Additive-only pipeline — no SSR, no Next.js, no runtime changes. Pure build-time HTML injection.

**og:type derivation:** `pageType === 'guide'` → `article`; all others → `website`. Derived in prerender.ts, not stored in PageSeo, to keep the interface minimal.

**Root route writes to dist/public/index.html in-place:** Vite's output IS the template; prerender reads it then overwrites it. All other routes write to new nested directories.

**noindex pages (e.g. not-found.tsx) are excluded from getAllRoutes()** and may have inline SEO strings — not a violation of the page-meta rule.

**email-signature-generator.tsx has `build*Html()` functions** — these are HTML string builders for tool output, not JSON-LD schema builders. Not a violation.

**sitemap.xml is hand-maintained** (not generated). Kept in sync with route data as of 2026-07-26. Next natural step: sitemap generator script using getAllRoutes(). See CONVENTIONS.md §8.

## Route counts (as of 2026-07-26)
- home: 1, static: 6, guides-index: 1, category: 6, tool: 21, guide: 5 → **total: 40**

**How to apply:** Before any pipeline change, run validate-prerender.ts. Before adding a new page type, read CONVENTIONS.md §4 (extension rules).
