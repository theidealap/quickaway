/**
 * Route table: the single entry point for all build consumers.
 *
 * getAllRoutes() aggregates every PageRoute in the site by composing the
 * four sub-collectors.  All generators (prerender, sitemap, RSS, LLM index)
 * call this function — they never import registry files directly.
 *
 * Order: static → categories → tools → guides.
 * The order is deterministic given stable registry files; changing it does
 * not affect correctness but will change the order of generated files.
 *
 * Extension rule: to introduce a new page type
 *   1. Add its PageType value to scripts/types.ts.
 *   2. Create scripts/routes/<new-type>.ts with collect<NewType>Routes().
 *   3. Import and spread it in the return array below.
 *   No existing file needs to change beyond step 3.
 */

import { collectStaticRoutes } from './routes/static.js';
import { collectCategoryRoutes } from './routes/categories.js';
import { collectToolRoutes } from './routes/tools.js';
import { collectGuideRoutes } from './routes/guides.js';
import type { PageRoute } from './types.js';

export function getAllRoutes(): PageRoute[] {
  return [
    ...collectStaticRoutes(),    //  8 routes  (home, about, author, contact, privacy, terms, editorial-policy, guides-index)
    ...collectCategoryRoutes(),  //  6 routes  (calculators, converters, generators, text-tools, developer-tools, date-time)
    ...collectToolRoutes(),      // 21 routes  (one per tool in toolsRegistry)
    ...collectGuideRoutes(),     //  5 routes  (one per guide in guidesRegistry)
  ];
}

// ── Self-test ─────────────────────────────────────────────────────────────────
// Runs only when this file is executed directly (tsx scripts/build-routes.ts).
// Silent when imported as a module.

const isMain =
  process.argv[1] != null &&
  import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/').split('/').pop()!);

if (isMain) {
  const routes = getAllRoutes();

  // Count by page type
  const counts = new Map<string, number>();
  for (const r of routes) {
    counts.set(r.pageType, (counts.get(r.pageType) ?? 0) + 1);
  }

  console.log(`\n✓ getAllRoutes() → ${routes.length} routes\n`);
  for (const [type, count] of [...counts.entries()].sort()) {
    console.log(`  ${type.padEnd(15)} ${count}`);
  }

  // Canonical uniqueness check
  const canonicals = routes.map((r) => r.seo.canonical);
  const unique = new Set(canonicals);
  if (unique.size !== canonicals.length) {
    const dupes = canonicals.filter((c, i) => canonicals.indexOf(c) !== i);
    console.error(`\n✗ Duplicate canonicals detected:\n  ${dupes.join('\n  ')}`);
    process.exit(1);
  }
  console.log(`\n✓ All canonicals are unique`);

  // Path uniqueness check
  const paths = routes.map((r) => r.path);
  const uniquePaths = new Set(paths);
  if (uniquePaths.size !== paths.length) {
    const dupes = paths.filter((p, i) => paths.indexOf(p) !== i);
    console.error(`\n✗ Duplicate paths detected:\n  ${dupes.join('\n  ')}`);
    process.exit(1);
  }
  console.log(`✓ All paths are unique\n`);
}
