/**
 * Sub-collector: fixed-path ("static") routes.
 *
 * Owns routes whose paths do not vary with registry data:
 *   /  /about  /author  /contact  /privacy  /terms  /editorial-policy  /guides
 *
 * Extension rule: to add a new static page
 *   1. Add an entry to PAGE_META in src/lib/page-meta.ts.
 *   2. Add a PageRoute entry to the array returned here.
 *   3. Create the React page component and wire it in App.tsx.
 *   No other file needs to change.
 *
 * Import rule: use relative paths with .js extensions (Node ESM).
 *   The @/ alias inside imported source files is resolved via tsconfig paths.
 */

import { PAGE_META } from '../../src/lib/page-meta.js';
import { SITE_URL, SITE_OG_IMAGE } from '../../src/lib/site-config.js';
import {
  buildWebsiteSchema,
  buildOrganizationSchema,
  buildPersonSchema,
  buildAuthorBreadcrumbSchema,
  buildEditorialPolicySchema,
  buildEditorialBreadcrumbSchema,
  buildGuidesIndexBreadcrumbSchema,
  buildGuidesCollectionSchema,
} from '../../src/components/json-ld.js';
import { guidesRegistry } from '../../src/lib/guides-registry.js';
import type { PageRoute } from '../types.js';

export function collectStaticRoutes(): PageRoute[] {
  return [
    // ── Home ────────────────────────────────────────────────────────────────
    {
      path: '/',
      pageType: 'home',
      seo: {
        title: PAGE_META.home.title,
        description: PAGE_META.home.description,
        canonical: SITE_URL,          // root: no trailing slash, no path appended
        robots: 'index, follow',
        ogImage: SITE_OG_IMAGE,
      },
      schemas: [buildWebsiteSchema(), buildOrganizationSchema()],
      lastModified: PAGE_META.home.lastModified,
      priority: 1.0,
      changeFrequency: 'weekly',
    },

    // ── About ────────────────────────────────────────────────────────────────
    {
      path: '/about',
      pageType: 'static',
      seo: {
        title: PAGE_META.about.title,
        description: PAGE_META.about.description,
        canonical: `${SITE_URL}/about`,
        robots: 'index, follow',
        ogImage: SITE_OG_IMAGE,
      },
      schemas: [],
      lastModified: PAGE_META.about.lastModified,
      priority: 0.7,
      changeFrequency: 'monthly',
    },

    // ── Author ───────────────────────────────────────────────────────────────
    {
      path: '/author',
      pageType: 'static',
      seo: {
        title: PAGE_META.author.title,
        description: PAGE_META.author.description,
        canonical: `${SITE_URL}/author`,
        robots: 'index, follow',
        ogImage: SITE_OG_IMAGE,
      },
      schemas: [buildPersonSchema(), buildAuthorBreadcrumbSchema()],
      lastModified: PAGE_META.author.lastModified,
      priority: 0.7,
      changeFrequency: 'monthly',
    },

    // ── Contact ──────────────────────────────────────────────────────────────
    {
      path: '/contact',
      pageType: 'static',
      seo: {
        title: PAGE_META.contact.title,
        description: PAGE_META.contact.description,
        canonical: `${SITE_URL}/contact`,
        robots: 'index, follow',
        ogImage: SITE_OG_IMAGE,
      },
      schemas: [],
      lastModified: PAGE_META.contact.lastModified,
      priority: 0.5,
      changeFrequency: 'monthly',
    },

    // ── Privacy ──────────────────────────────────────────────────────────────
    {
      path: '/privacy',
      pageType: 'static',
      seo: {
        title: PAGE_META.privacy.title,
        description: PAGE_META.privacy.description,
        canonical: `${SITE_URL}/privacy`,
        robots: 'index, follow',
        ogImage: SITE_OG_IMAGE,
      },
      schemas: [],
      lastModified: PAGE_META.privacy.lastModified,
      priority: 0.3,
      changeFrequency: 'yearly',
    },

    // ── Terms ────────────────────────────────────────────────────────────────
    {
      path: '/terms',
      pageType: 'static',
      seo: {
        title: PAGE_META.terms.title,
        description: PAGE_META.terms.description,
        canonical: `${SITE_URL}/terms`,
        robots: 'index, follow',
        ogImage: SITE_OG_IMAGE,
      },
      schemas: [],
      lastModified: PAGE_META.terms.lastModified,
      priority: 0.3,
      changeFrequency: 'yearly',
    },

    // ── Editorial Policy ─────────────────────────────────────────────────────
    {
      path: '/editorial-policy',
      pageType: 'static',
      seo: {
        title: PAGE_META.editorialPolicy.title,
        description: PAGE_META.editorialPolicy.description,
        canonical: `${SITE_URL}/editorial-policy`,
        robots: 'index, follow',
        ogImage: SITE_OG_IMAGE,
      },
      schemas: [buildEditorialPolicySchema(), buildEditorialBreadcrumbSchema()],
      lastModified: PAGE_META.editorialPolicy.lastModified,
      priority: 0.6,
      changeFrequency: 'monthly',
    },

    // ── Guides Index ─────────────────────────────────────────────────────────
    {
      path: '/guides',
      pageType: 'guides-index',
      seo: {
        title: PAGE_META.guidesIndex.title,
        description: PAGE_META.guidesIndex.description,
        canonical: `${SITE_URL}/guides`,
        robots: 'index, follow',
        ogImage: SITE_OG_IMAGE,
      },
      schemas: [
        buildGuidesIndexBreadcrumbSchema(),
        buildGuidesCollectionSchema(
          guidesRegistry.map((g) => ({ title: g.title, slug: g.slug })),
        ),
      ],
      lastModified: PAGE_META.guidesIndex.lastModified,
      priority: 0.9,
      changeFrequency: 'weekly',
    },
  ];
}
