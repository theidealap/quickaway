/**
 * Sub-collector: category routes.
 *
 * Produces one PageRoute per category defined in CATEGORY_META.
 * Path pattern: /:categorySlug  (e.g. /calculators, /converters)
 *
 * Schemas emitted per category:
 *   - CollectionPage listing all tools in that category
 *   - BreadcrumbList (Home > Category Name)
 *
 * Extension rule: adding a new category requires:
 *   1. A new value in the Category type in tools-registry.ts.
 *   2. A new entry in CATEGORY_SLUGS and CATEGORY_META.
 *   3. Tools assigned to the new category.
 *   This file requires no changes.
 *
 * Note on lastModified: categories have no per-entry date.
 * CATEGORIES_LAST_MODIFIED is a uniform fallback.
 */

import {
  toolsRegistry,
  CATEGORY_META,
  CATEGORY_SLUGS,
  type Category,
} from '../../src/lib/tools-registry.js';
import { SITE_URL, SITE_OG_IMAGE } from '../../src/lib/site-config.js';
import {
  buildCategorySchema,
  buildCategoryBreadcrumbSchema,
} from '../../src/components/json-ld.js';
import type { PageRoute } from '../types.js';

/** Uniform lastModified date for all category pages (site launch date). */
const CATEGORIES_LAST_MODIFIED = '2026-07-22';

export function collectCategoryRoutes(): PageRoute[] {
  return (Object.keys(CATEGORY_META) as Category[]).map((category): PageRoute => {
    const slug = CATEGORY_SLUGS[category];
    const meta = CATEGORY_META[category];
    const tools = toolsRegistry
      .filter((t) => t.category === category)
      .map((t) => ({ name: t.name, slug: t.slug }));

    return {
      path: `/${slug}`,
      pageType: 'category',
      seo: {
        title: meta.seoTitle,
        description: meta.seoDescription,
        canonical: `${SITE_URL}/${slug}`,
        robots: 'index, follow',
        ogImage: SITE_OG_IMAGE,
      },
      schemas: [
        buildCategorySchema({
          name: meta.heading,
          slug,
          description: meta.description,
          tools,
        }),
        buildCategoryBreadcrumbSchema({ name: meta.heading, slug }),
      ],
      lastModified: CATEGORIES_LAST_MODIFIED,
      priority: 0.9,
      changeFrequency: 'weekly',
    };
  });
}
