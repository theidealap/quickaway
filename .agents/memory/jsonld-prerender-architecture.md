---
name: JSON-LD prerender architecture
description: How schema.org structured data gets into the prerendered HTML on QuickAway — build-time, not runtime.
---

JSON-LD schemas appear in the static prerendered HTML via `scripts/routes/tools.ts` (and the other `scripts/routes/*.ts` files), NOT via the `JsonLd` React component.

**The flow:**
- `scripts/prerender.ts` calls `getAllRoutes()` → each `PageRoute` has a `schemas` array
- The prerender script serialises every schema into a `<script type="application/ld+json">` tag in the `<head>` at build time
- The `JsonLd` component (uses `useEffect`) only runs in the browser — it has no effect on the prerendered HTML

**Why it matters:**
Adding a new schema type (e.g. FAQPage) requires adding it to the `schemas` array in the relevant `scripts/routes/*.ts` file — not just to the React component. Adding it only to the component means Google/crawlers never see it.

**How to apply:**
- To add FAQPage (or any new schema) to tool pages: import the builder in `scripts/routes/tools.ts` and spread it into the `schemas` array.
- The React component update is still worth doing for client-side parity, but it is not sufficient alone.
- Always verify by grepping the built `dist/public/tools/<slug>/index.html` for the schema `@type`, not just by checking the browser DevTools.
