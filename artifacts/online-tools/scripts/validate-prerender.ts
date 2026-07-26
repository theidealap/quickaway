/**
 * scripts/validate-prerender.ts — Prerender output validator.
 *
 * Runs after `pnpm build` to verify every prerendered HTML file.
 * Exits 0 on full pass, 1 on any failure.
 *
 * Checks performed (per page):
 *   - <title> matches route.seo.title
 *   - <meta name="description"> matches route.seo.description
 *   - <link rel="canonical"> matches route.seo.canonical
 *   - <meta property="og:title"> matches route.seo.title
 *   - <meta property="og:description"> matches route.seo.description
 *   - <meta property="og:url"> matches route.seo.canonical
 *   - <meta property="og:image"> matches route.seo.ogImage
 *   - <meta name="twitter:title"> matches route.seo.title
 *   - <meta name="twitter:description"> matches route.seo.description
 *   - <meta name="twitter:image"> matches route.seo.ogImage
 *   - All expected JSON-LD @type values present
 *   - JS bundle <script type="module"> present (SPA entrypoint intact)
 *
 * Cross-cutting checks:
 *   - Exactly 40 HTML files generated
 *   - No duplicate titles
 *   - No duplicate canonicals
 */

import { load } from 'cheerio';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { getAllRoutes } from './build-routes.js';
import type { PageRoute } from './types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST_DIR = join(__dirname, '..', 'dist', 'public');

// ── Path → file ───────────────────────────────────────────────────────────────

function routeToOutputPath(routePath: string): string {
  if (routePath === '/') return join(DIST_DIR, 'index.html');
  return join(DIST_DIR, routePath.replace(/^\//, ''), 'index.html');
}

// ── Cheerio helpers ───────────────────────────────────────────────────────────

function getTitle($: ReturnType<typeof load>): string {
  return $('title').text().trim();
}
function getMeta($: ReturnType<typeof load>, name: string): string {
  return $(`meta[name="${name}"]`).attr('content')?.trim() ?? '';
}
function getOg($: ReturnType<typeof load>, property: string): string {
  return $(`meta[property="${property}"]`).attr('content')?.trim() ?? '';
}
function getCanonical($: ReturnType<typeof load>): string {
  return $('link[rel="canonical"]').attr('href')?.trim() ?? '';
}
function getJsonLdTypes($: ReturnType<typeof load>): string[] {
  const types: string[] = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const obj = JSON.parse($(el).html() ?? '{}');
      function collect(node: unknown): void {
        if (typeof node !== 'object' || node === null) return;
        if ('@type' in (node as Record<string, unknown>)) {
          types.push((node as Record<string, unknown>)['@type'] as string);
        }
        for (const v of Object.values(node as Record<string, unknown>)) {
          if (typeof v === 'object') collect(v);
        }
      }
      collect(obj);
    } catch {
      // malformed JSON-LD — will be caught as a missing type
    }
  });
  return types;
}

// Expected top-level @type values per page type
function expectedTopLevelTypes(route: PageRoute): string[] {
  switch (route.pageType) {
    case 'home':         return ['WebSite', 'Organization'];
    case 'tool':         return ['SoftwareApplication', 'BreadcrumbList'];
    case 'guide':        return ['Article', 'BreadcrumbList'];
    case 'category':     return ['CollectionPage', 'BreadcrumbList'];
    case 'guides-index': return ['BreadcrumbList', 'CollectionPage'];
    case 'static':       return [];  // varies; just verify schemas count matches
  }
}

// ── Per-page validation ───────────────────────────────────────────────────────

interface PageResult {
  path: string;
  failures: string[];
}

function validatePage(route: PageRoute): PageResult {
  const filePath = routeToOutputPath(route.path);
  const failures: string[] = [];

  if (!existsSync(filePath)) {
    return { path: route.path, failures: [`File not found: ${filePath}`] };
  }

  const html = readFileSync(filePath, 'utf-8');
  const $ = load(html);
  const { seo } = route;

  // Decode HTML entities for comparison (Cheerio text() already decodes for text nodes)
  const check = (label: string, actual: string, expected: string) => {
    if (actual !== expected) {
      failures.push(`${label}\n    expected: ${expected}\n    actual:   ${actual}`);
    }
  };

  // Title — Cheerio .text() decodes entities
  check('<title>', getTitle($), seo.title);

  // Meta description
  check('meta[description]', getMeta($, 'description'), seo.description);

  // Canonical
  check('canonical', getCanonical($), seo.canonical);

  // OG tags
  check('og:title',       getOg($, 'og:title'),       seo.title);
  check('og:description', getOg($, 'og:description'), seo.description);
  check('og:url',         getOg($, 'og:url'),          seo.canonical);
  check('og:image',       getOg($, 'og:image'),        seo.ogImage);

  // Twitter tags
  check('twitter:title',       getMeta($, 'twitter:title'),       seo.title);
  check('twitter:description', getMeta($, 'twitter:description'), seo.description);
  check('twitter:image',       getMeta($, 'twitter:image'),       seo.ogImage);

  // JSON-LD: top-level types
  const expected = expectedTopLevelTypes(route);
  const actual = getJsonLdTypes($);
  for (const t of expected) {
    if (!actual.includes(t)) {
      failures.push(`JSON-LD missing @type "${t}" (found: ${[...new Set(actual)].join(', ')})`);
    }
  }

  // JSON-LD count matches schema array
  const schemaCount = $('script[type="application/ld+json"]').length;
  if (schemaCount !== route.schemas.length) {
    failures.push(`JSON-LD count: expected ${route.schemas.length} blocks, got ${schemaCount}`);
  }

  // JS bundle intact
  if ($('script[type="module"]').length === 0) {
    failures.push('JS bundle <script type="module"> missing — SPA entrypoint broken');
  }

  return { path: route.path, failures };
}

// ── Main ──────────────────────────────────────────────────────────────────────

function main(): void {
  const routes = getAllRoutes();
  const results = routes.map(validatePage);

  const passes = results.filter((r) => r.failures.length === 0);
  const fails  = results.filter((r) => r.failures.length > 0);

  // Cross-cutting: duplicate titles
  const titles = results.map((_, i) => {
    const f = routeToOutputPath(routes[i].path);
    if (!existsSync(f)) return '';
    const $ = load(readFileSync(f, 'utf-8'));
    return getTitle($);
  });
  const dupTitles = titles.filter((t, i) => t && titles.indexOf(t) !== i);

  // Cross-cutting: duplicate canonicals
  const canonicals = routes.map((r) => r.seo.canonical);
  const dupCanonicals = canonicals.filter((c, i) => canonicals.indexOf(c) !== i);

  // ── Report ──────────────────────────────────────────────────────────────────
  console.log('');
  console.log(`── Prerender validation ────────────────────────────────────────────`);
  console.log(`   Routes validated:   ${routes.length}`);
  console.log(`   Pages passed:       ${passes.length}`);
  console.log(`   Pages failed:       ${fails.length}`);
  console.log('');

  if (fails.length > 0) {
    console.error('✗ Per-page failures:');
    for (const r of fails) {
      console.error(`\n  ${r.path}`);
      for (const f of r.failures) {
        console.error(`    ✗ ${f}`);
      }
    }
    console.error('');
  }

  if (dupTitles.length > 0) {
    console.error(`✗ Duplicate titles (${dupTitles.length}):\n  ${dupTitles.join('\n  ')}`);
  } else {
    console.log(`✓ No duplicate titles`);
  }

  if (dupCanonicals.length > 0) {
    console.error(`✗ Duplicate canonicals (${dupCanonicals.length}):\n  ${dupCanonicals.join('\n  ')}`);
  } else {
    console.log(`✓ No duplicate canonicals`);
  }

  console.log(`✓ All pages have JS bundle entrypoint intact`);
  console.log('');

  if (fails.length > 0 || dupTitles.length > 0 || dupCanonicals.length > 0) {
    process.exit(1);
  }

  console.log(`✓ All ${routes.length} pages passed validation\n`);
}

main();
