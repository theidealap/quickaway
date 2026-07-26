# QuickAway Build Pipeline — Engineering Conventions

This document is the permanent, authoritative reference for everyone working on the
QuickAway build pipeline (`scripts/`) and the source-layer modules it consumes
(`src/lib/`, `src/components/`).

It is not a tutorial. It is a set of binding rules — if you find yourself about to
violate one, stop, re-read it, and find an approach that does not.

---

## 1. Module ownership

Each concern has exactly one file that owns it. No other file may export the same
thing.

| Concern | Sole owner | Rule |
|---|---|---|
| Site-wide constants (`SITE_URL`, `SITE_NAME`, `SITE_OG_IMAGE`, `SITE_LOGO_URL`) | `src/lib/site-config.ts` | Import from here. Never re-export from another file. |
| Static-page SEO strings (title, description, lastModified) | `src/lib/page-meta.ts` | All 8 fixed-path pages. Dynamic pages use their registry entry. |
| All JSON-LD schema builders | `src/components/json-ld.tsx` | 19 exported builders. No page component or build script may define its own builder. |
| Route table | `scripts/build-routes.ts` → `getAllRoutes()` | The single entry point for all build consumers. |
| Sub-collectors (one per page type) | `scripts/routes/*.ts` | Each file exports exactly one `collect*Routes(): PageRoute[]` function. |
| Shared build types | `scripts/types.ts` | `PageRoute`, `PageSeo`, `PageType`, `ChangeFrequency`. No other file defines these. |
| Prerender engine | `scripts/prerender.ts` | Reads template, writes 40 HTML files. |
| Prerender validator | `scripts/validate-prerender.ts` | Cross-references route data against generated HTML. |

---

## 2. Naming conventions

### Types (`scripts/types.ts`)
- Interfaces: `PascalCase` — `PageRoute`, `PageSeo`
- Union types: `PascalCase` — `PageType`, `ChangeFrequency`
- Extension rule: when a new page type is introduced, add its value to `PageType`
  and create a matching sub-collector. No other file needs to change.

### Sub-collectors (`scripts/routes/`)
- File name: `<page-type>.ts` (singular or descriptive noun), e.g. `tools.ts`, `guides.ts`, `static.ts`
- Exported function: `collect<PageType>Routes(): PageRoute[]`
  - `collectToolRoutes()`, `collectGuideRoutes()`, `collectCategoryRoutes()`, `collectStaticRoutes()`
- One file per page type. Each file owns exactly one `collect*Routes()` function.

### Schema builders (`src/components/json-ld.tsx`)
- All builders are named `build<Entity>Schema(…)` or `build<Entity><Variant>Schema(…)`
- Examples: `buildWebsiteSchema()`, `buildCategoryBreadcrumbSchema()`
- Builders return plain JSON-serialisable objects — no class instances, no React elements.

### Constants (`src/lib/site-config.ts`)
- `SCREAMING_SNAKE_CASE`
- All site-wide string constants go here.

### Page-meta keys (`src/lib/page-meta.ts`)
- `camelCase` record keys: `home`, `about`, `author`, `contact`, `privacy`, `terms`,
  `editorialPolicy`, `guidesIndex`
- Sub-collectors and page components both use these keys.

---

## 3. Import rules

### Inside `scripts/`

```typescript
// ✅ Correct — relative path + .js extension (Node ESM)
import { PAGE_META } from '../../src/lib/page-meta.js';
import { SITE_URL } from '../../src/lib/site-config.js';
import { buildWebsiteSchema } from '../../src/components/json-ld.js';
import { getAllRoutes } from './build-routes.js';
import type { PageRoute } from './types.js';

// ❌ Wrong — @/ alias does not resolve in scripts/
import { PAGE_META } from '@/lib/page-meta';

// ❌ Wrong — no .js extension breaks Node ESM resolution
import { PAGE_META } from '../../src/lib/page-meta';
```

The `@/` alias resolves via `tsconfig.json` `paths` **inside `src/`** and is safe
in scripts because `tsx` resolves it at transpile time. However, using relative
paths with `.js` extensions is the explicit convention for scripts to make the
resolution mechanism obvious.

### Inside `src/`

```typescript
// ✅ Correct — @/ alias for intra-source imports
import { SITE_URL } from '@/lib/site-config';
import { buildWebsiteSchema } from '@/components/json-ld';

// ❌ Wrong — relative paths defeat tree-shaking and make refactoring harder
import { SITE_URL } from '../lib/site-config';
```

### Generator rule (critical)
> **Build generators (`scripts/*.ts`) must never import registry files directly.**
>
> They call `getAllRoutes()` from `scripts/build-routes.ts` and work exclusively
> with `PageRoute[]`. This is the single seam between the build pipeline and the
> application's data model. Violating this rule couples generators to the registry
> structure and breaks the sub-collector abstraction.

---

## 4. Extension rules

### Adding a new tool
1. Add an entry to `src/lib/tools-registry.ts`.
2. Create the React page component in `src/tools/`.
3. Wire the route in `src/App.tsx`.
4. `collectToolRoutes()` picks it up automatically — no script file changes needed.

### Adding a new guide
1. Add an entry to `src/lib/guides-registry.ts`.
2. Create the React page component in `src/guides/`.
3. Wire the route in `src/App.tsx`.
4. `collectGuideRoutes()` picks it up automatically.

### Adding a new category
1. Add the category value to the `Category` type in `src/lib/tools-registry.ts`.
2. Add an entry to `CATEGORY_SLUGS` and `CATEGORY_META`.
3. Assign tools to the new category.
4. `collectCategoryRoutes()` picks it up automatically.
5. Wire the category page component and route in `src/App.tsx`.

### Adding a new static page
1. Add an entry to `PAGE_META` in `src/lib/page-meta.ts`.
2. Add a `PageRoute` entry in `scripts/routes/static.ts`.
3. Create the React page component in `src/pages/`.
4. Wire the route in `src/App.tsx`.

### Adding a new page type (comparison, landing, collection, …)
1. Add the new value to `PageType` in `scripts/types.ts`.
2. Create `scripts/routes/<new-type>.ts` exporting `collect<NewType>Routes()`.
3. Import and spread it in `getAllRoutes()` in `scripts/build-routes.ts`.
4. If the new type needs schema builders, add them to `src/components/json-ld.tsx`.
5. Add the expected JSON-LD types to `expectedTopLevelTypes()` in `scripts/validate-prerender.ts`.

### Adding a new JSON-LD schema builder
1. Add the builder function to `src/components/json-ld.tsx` and export it.
2. Import it from `json-ld.tsx` — never define builders inline in page files or scripts.
3. Add it to the `schemas` array in the relevant sub-collector.

---

## 5. Schema rules

- Schema builders in `json-ld.tsx` return `object` — plain, JSON-serialisable.
- `PageRoute.schemas` is the sole injection point for JSON-LD in prerendered pages.
- The prerender engine (`prerender.ts`) serialises schemas with `JSON.stringify()`
  without inspecting content — schema shape is the builder's responsibility.
- Guides emit Article + BreadcrumbList always, and FAQPage when at least one FAQ
  section exists.
- Tools emit SoftwareApplication + BreadcrumbList.
- Categories emit CollectionPage + BreadcrumbList.
- Home emits WebSite + Organization.
- `og:type` is derived from `pageType`: `guide` → `article`, all others → `website`.

---

## 6. Build pipeline rules

### Execution order (invariant)
```
pnpm run build
  └─ vite build --config vite.config.ts   # writes dist/public/index.html + assets
  └─ tsx scripts/prerender.ts             # reads template, writes 40 index.html files
```

The prerender script **must** run after Vite because it reads `dist/public/index.html`
as its template. Running it before Vite will fail fast with an error message.

### Validation
```
npx tsx scripts/validate-prerender.ts
```

Run this after any change to the pipeline, route data, or schema builders. It exits
1 on the first failure category and prints the full diff. All CI checks should gate
on this script.

### Route self-test
```
npx tsx scripts/build-routes.ts
```

Run after adding or removing routes. The self-test checks:
- Total count printed per page type
- Canonical uniqueness (`Set` size === array length)
- Path uniqueness

### Template assumption
The prerender script assumes `dist/public/index.html` contains:
- Exactly one `<title>` tag (replaced per route)
- Exactly one `<meta name="description">` (updated per route)
- Exactly one `<meta name="robots">` (updated per route)
- OG and Twitter tags already present (updated in-place, or appended if absent)
- **No** `<link rel="canonical">` (always appended fresh per route)
- **No** `<script type="application/ld+json">` (always appended per route)

If a future Vite plugin or `index.html` change violates these assumptions, run
`npx tsx scripts/validate-prerender.ts` to surface the mismatch immediately.

---

## 7. Documentation standards

Every file in `scripts/` must open with a file-level JSDoc block containing:
1. **One-line purpose statement** — what the file does, not how.
2. **Section: "Head content written"** (prerender/generator files) or **"Schemas emitted"** (sub-collectors) — bullet list of what this file produces.
3. **Section: "Design rules"** — the non-obvious invariants a future editor must know.
4. **Extension rule** — exactly what to touch when the file needs to grow.
5. **Import rule** — which alias/style is used and why.

Sub-collectors additionally document:
- **Path pattern** — the URL shape (`/tools/:slug`, `/:categorySlug`, …)
- **lastModified note** — whether it's per-entry or a uniform fallback, and what to do when per-entry dates are added.

---

## 8. What this architecture does NOT do (intentional omissions)

These are scoped-out intentionally. Do not add them without explicit agreement:

| Feature | Why omitted |
|---|---|
| RSS feed | No editorial use case yet; add when a content subscription model is decided |
| LLM/AI index | No prompt-engineering use case validated yet |
| Localization | Single-language site; routing and schema models must be redesigned if added |
| Per-tool OG images | Uniform OG image is sufficient for AdSense approval; add when brand assets exist |
| Sitemap generator script | `public/sitemap.xml` is hand-maintained; a generator script is a natural next step once the route table stabilises |
| SSR / Next.js | Explicitly rejected — Vite + Wouter + Vercel static is the permanent stack |

---

*Last updated: 2026-07-26. Update this file whenever a convention changes.*
