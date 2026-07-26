/**
 * scripts/prerender.ts — Static HTML pre-renderer for QuickAway.
 *
 * Runs AFTER `vite build` as part of the production build pipeline.
 * Reads `dist/public/index.html` as a template, iterates every PageRoute
 * returned by getAllRoutes(), injects route-specific <head> content via
 * Cheerio, and writes one `index.html` per route into the appropriate
 * directory inside `dist/public/`.
 *
 * ── Head content written per page ───────────────────────────────────────────
 *   <title>
 *   <meta name="description">
 *   <meta name="robots">
 *   <link rel="canonical">
 *   <meta property="og:*">           (title, description, url, image, type, site_name)
 *   <meta name="twitter:*">         (card, title, description, image)
 *   <script type="application/ld+json"> (one per schema in PageRoute.schemas)
 *
 * ── Path → file mapping ──────────────────────────────────────────────────────
 *   /                      → dist/public/index.html             (overwritten in-place)
 *   /about                 → dist/public/about/index.html
 *   /tools/age-calculator  → dist/public/tools/age-calculator/index.html
 *   /guides/how-to-…       → dist/public/guides/how-to-…/index.html
 *
 * Vercel's static-file serving resolves these before the catch-all rewrite,
 * so every route receives its own pre-rendered document.
 *
 * ── Design rules ─────────────────────────────────────────────────────────────
 *   - Runtime behaviour is unchanged — this script only writes build output.
 *   - All route data is obtained via getAllRoutes() — no direct registry imports.
 *   - og:type is derived from PageRoute.pageType (guide → article, else website).
 *   - JSON-LD: any existing <script type="application/ld+json"> in the template
 *     is removed before new schemas are injected, preventing stale duplication.
 *   - Asset paths in the template are root-relative (/assets/…) and remain valid
 *     at any directory depth under the Vercel domain.
 */

import { load } from 'cheerio';
import { readFileSync, mkdirSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { getAllRoutes } from './build-routes.js';
import { SITE_NAME } from '../src/lib/site-config.js';
import type { PageRoute } from './types.js';

// ── Paths ─────────────────────────────────────────────────────────────────────

const __dirname = dirname(fileURLToPath(import.meta.url));
/** Root of the Vite build output — must exist before this script runs. */
const DIST_DIR = join(__dirname, '..', 'dist', 'public');
const TEMPLATE_PATH = join(DIST_DIR, 'index.html');

// ── Helper: route path → output file path ────────────────────────────────────

/**
 * Converts a route's URL path to its output file path inside dist/public.
 *
 * "/"  → dist/public/index.html            (root: overwrite the template)
 * "/about" → dist/public/about/index.html
 * "/tools/age-calculator" → dist/public/tools/age-calculator/index.html
 */
function routeToOutputPath(routePath: string): string {
  if (routePath === '/') {
    return join(DIST_DIR, 'index.html');
  }
  // Strip the leading "/" and append /index.html
  const segments = routePath.replace(/^\//, '');
  return join(DIST_DIR, segments, 'index.html');
}

// ── Helper: derive og:type from PageRoute.pageType ───────────────────────────

/**
 * Maps the internal page type classification to the Open Graph article type.
 * Guides are long-form editorial content; everything else is a website page.
 */
function ogType(pageType: PageRoute['pageType']): string {
  return pageType === 'guide' ? 'article' : 'website';
}

// ── Core: prerender a single route ───────────────────────────────────────────

/**
 * Injects route-specific <head> content into the template HTML string.
 * Returns a new HTML string; the input template is never mutated.
 *
 * Strategy:
 *   - For tags that the Vite-built template already contains (title, description,
 *     robots, og:*, twitter:*) we update the existing element's attribute in-place
 *     so that element order is preserved and no duplicates are introduced.
 *   - For <link rel="canonical"> — always removed then re-added, because the
 *     source index.html has no static canonical (it was intentionally removed in
 *     Phase 1 to avoid stale values on production).
 *   - For JSON-LD <script> blocks — all existing ones are removed first, then the
 *     route's schemas are appended in order.
 */
function prerenderRoute(template: string, route: PageRoute): string {
  const $ = load(template);
  const { seo, schemas, pageType } = route;

  // ── <title> ───────────────────────────────────────────────────────────────
  $('title').text(seo.title);

  // ── <meta name="description"> ─────────────────────────────────────────────
  const descEl = $('meta[name="description"]');
  if (descEl.length) {
    descEl.attr('content', seo.description);
  } else {
    $('head').append(`<meta name="description" content="${escAttr(seo.description)}" />`);
  }

  // ── <meta name="robots"> ─────────────────────────────────────────────────
  const robotsEl = $('meta[name="robots"]');
  if (robotsEl.length) {
    robotsEl.attr('content', seo.robots);
  } else {
    $('head').append(`<meta name="robots" content="${escAttr(seo.robots)}" />`);
  }

  // ── <link rel="canonical"> ───────────────────────────────────────────────
  // Always remove-then-add to avoid stale values (template has none; guard
  // handles edge-case where a future template change accidentally re-adds one).
  $('link[rel="canonical"]').remove();
  $('head').append(`<link rel="canonical" href="${escAttr(seo.canonical)}" />`);

  // ── Open Graph tags ───────────────────────────────────────────────────────
  const ogTags: Array<[string, string]> = [
    ['og:type',        ogType(pageType)],
    ['og:site_name',   SITE_NAME],
    ['og:title',       seo.title],
    ['og:description', seo.description],
    ['og:url',         seo.canonical],
    ['og:image',       seo.ogImage],
  ];
  for (const [property, content] of ogTags) {
    const el = $(`meta[property="${property}"]`);
    if (el.length) {
      el.attr('content', content);
    } else {
      $('head').append(`<meta property="${property}" content="${escAttr(content)}" />`);
    }
  }

  // ── Twitter / X tags ─────────────────────────────────────────────────────
  const twitterTags: Array<[string, string]> = [
    ['twitter:card',        'summary_large_image'],
    ['twitter:title',       seo.title],
    ['twitter:description', seo.description],
    ['twitter:image',       seo.ogImage],
  ];
  for (const [name, content] of twitterTags) {
    const el = $(`meta[name="${name}"]`);
    if (el.length) {
      el.attr('content', content);
    } else {
      $('head').append(`<meta name="${name}" content="${escAttr(content)}" />`);
    }
  }

  // ── JSON-LD schemas ───────────────────────────────────────────────────────
  // Remove any existing blocks (avoids duplication if the template ever gets one).
  $('script[type="application/ld+json"]').remove();
  for (const schema of schemas) {
    // JSON.stringify produces valid JSON; no attribute escaping needed because
    // the content sits between <script> tags, not in an attribute.
    $('head').append(
      `<script type="application/ld+json">${JSON.stringify(schema)}</script>`,
    );
  }

  return $.html();
}

// ── Utility: escape HTML attribute values ────────────────────────────────────

/**
 * Minimal HTML attribute escaping for values injected via string literals
 * (used only for fallback append paths, not for Cheerio .attr() calls which
 * handle escaping internally).
 */
function escAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// ── Entry point ───────────────────────────────────────────────────────────────

function main(): void {
  // Fail fast if Vite hasn't run yet.
  let template: string;
  try {
    template = readFileSync(TEMPLATE_PATH, 'utf-8');
  } catch {
    console.error(
      `\n✗ Prerender failed: ${TEMPLATE_PATH} not found.\n` +
        `  Run 'vite build' before 'tsx scripts/prerender.ts'.\n`,
    );
    process.exit(1);
  }

  const routes = getAllRoutes();
  const written: string[] = [];
  const errors: string[] = [];

  for (const route of routes) {
    try {
      const html = prerenderRoute(template, route);
      const outPath = routeToOutputPath(route.path);
      mkdirSync(dirname(outPath), { recursive: true });
      writeFileSync(outPath, html, 'utf-8');
      written.push(route.path);
    } catch (err) {
      errors.push(`  ${route.path}: ${(err as Error).message}`);
    }
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  if (errors.length > 0) {
    console.error(`\n✗ Prerender: ${errors.length} error(s):\n${errors.join('\n')}\n`);
    process.exit(1);
  }

  console.log(`\n✓ Prerender: ${written.length} pages written to dist/public/\n`);
}

main();
