/**
 * Shared type definitions for the QuickAway build pipeline.
 *
 * Consumed by:
 *   - scripts/routes/*.ts  (sub-collectors)
 *   - scripts/build-routes.ts  (aggregator)
 *   - scripts/prerender.ts  (HTML generator)
 *   - any future generator (sitemap, RSS, LLM index, …)
 *
 * No runtime dependencies — pure TypeScript type definitions.
 */

// ── Page classification ───────────────────────────────────────────────────────

/**
 * Identifies the category of a route.
 *
 * Extension rule: when a new page type is introduced (comparison pages,
 * landing pages, collections, …), add a value here and create a matching
 * sub-collector in scripts/routes/.  No other file needs to change.
 */
export type PageType =
  | 'home'
  | 'tool'
  | 'guide'
  | 'category'
  | 'guides-index'
  | 'static'; // fixed-path trust/editorial pages: about, author, contact, privacy, terms, editorial-policy

/** Standard sitemap change-frequency values (https://www.sitemaps.org/protocol.html). */
export type ChangeFrequency =
  | 'always'
  | 'hourly'
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'yearly'
  | 'never';

// ── Core interfaces ───────────────────────────────────────────────────────────

/**
 * All metadata written into the <head> of a prerendered page.
 *
 * Every field is required — sub-collectors must supply a concrete value.
 * `ogImage` is per-route (even though currently uniform across all routes)
 * so that per-page OG images can be introduced without refactoring consumers.
 */
export interface PageSeo {
  /** Written to <title>, og:title, twitter:title. */
  title: string;

  /** Written to <meta name="description">, og:description, twitter:description. */
  description: string;

  /**
   * Absolute canonical URL.  Written to <link rel="canonical"> and og:url.
   * Rule: no trailing slash except for the root (https://www.quickaway.app).
   */
  canonical: string;

  /**
   * Written to <meta name="robots">.
   * Default for all public pages: "index, follow".
   * noindex pages are excluded from getAllRoutes() entirely.
   */
  robots: string;

  /** Absolute URL to the OG image. Written to og:image and twitter:image. */
  ogImage: string;
}

/**
 * The universal description of one URL in the site.
 *
 * Contract: every build generator calls getAllRoutes() and works with
 * PageRoute[].  Generators never import registry files directly.
 */
export interface PageRoute {
  /**
   * URL path, always starts with "/".
   * Examples: "/", "/tools/age-calculator", "/guides/how-to-calculate-age".
   */
  path: string;

  /**
   * Identifies the page type.  Used by generators that need to filter routes
   * (e.g. a future sitemap generator that assigns different <priority> rules).
   */
  pageType: PageType;

  /** All metadata needed to populate <head>. */
  seo: PageSeo;

  /**
   * Pre-computed JSON-LD schema objects for this page.
   * Values are plain JSON-serialisable objects — no class instances.
   * The generator serialises them without inspecting content.
   * Use [] for pages that carry no structured data.
   */
  schemas: object[];

  /**
   * ISO 8601 date of the last meaningful content change, e.g. "2026-07-25".
   * Used by the sitemap generator for <lastmod>.
   *   - Guides:      use guide.datePublished (or dateModified when added).
   *   - Static pages: use PAGE_META[key].lastModified.
   *   - Tools:       use a site-wide constant (no per-tool date exists yet).
   *   - Categories:  use the date the category was last significantly changed.
   */
  lastModified: string;

  /**
   * Sitemap <priority>, 0.0 – 1.0.
   * Guideline: 1.0 home · 0.9 category/guides-index · 0.8 tool/guide
   *            · 0.7 about/author · 0.6 editorial-policy
   *            · 0.5 contact · 0.3 privacy/terms
   */
  priority: number;

  /** Sitemap <changefreq>. */
  changeFrequency: ChangeFrequency;
}
