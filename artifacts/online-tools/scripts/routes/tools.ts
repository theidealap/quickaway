/**
 * Sub-collector: tool routes.
 *
 * Produces one PageRoute per entry in toolsRegistry.
 * Path pattern: /tools/:slug
 *
 * Extension rule: adding a new tool requires only a new entry in
 * src/lib/tools-registry.ts — this file requires no changes.
 *
 * Note on lastModified: ToolEntry has no per-tool date field.
 * TOOLS_LAST_MODIFIED is used as a uniform fallback for all tool pages.
 * When per-tool dates are needed, add a `lastModified?: string` field to
 * ToolEntry and replace the constant below with `tool.lastModified ?? TOOLS_LAST_MODIFIED`.
 */

import { toolsRegistry, CATEGORY_SLUGS } from '../../src/lib/tools-registry.js';
import { SITE_URL, SITE_OG_IMAGE } from '../../src/lib/site-config.js';
import {
  buildSoftwareAppSchema,
  buildBreadcrumbSchema,
  buildFAQSchema,
} from '../../src/components/json-ld.js';
import type { PageRoute } from '../types.js';

/** Uniform lastModified date for all tool pages (site launch date). */
const TOOLS_LAST_MODIFIED = '2026-07-22';

export function collectToolRoutes(): PageRoute[] {
  return toolsRegistry.map((tool): PageRoute => ({
    path: `/tools/${tool.slug}`,
    pageType: 'tool',
    seo: {
      title: tool.seoTitle,
      description: tool.seoDescription,
      canonical: `${SITE_URL}/tools/${tool.slug}`,
      robots: 'index, follow',
      ogImage: SITE_OG_IMAGE,
    },
    schemas: [
      buildSoftwareAppSchema({
        name: tool.name,
        description: tool.shortDescription,
        slug: tool.slug,
      }),
      buildBreadcrumbSchema({
        name: tool.name,
        slug: tool.slug,
        category: {
          name: tool.category,
          slug: CATEGORY_SLUGS[tool.category],
        },
      }),
      ...(tool.faq && tool.faq.length > 0 ? [buildFAQSchema(tool.faq)] : []),
    ],
    lastModified: TOOLS_LAST_MODIFIED,
    priority: 0.8,
    changeFrequency: 'monthly',
  }));
}
