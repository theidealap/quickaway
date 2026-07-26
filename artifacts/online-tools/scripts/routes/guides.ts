/**
 * Sub-collector: guide routes.
 *
 * Produces one PageRoute per entry in guidesRegistry.
 * Path pattern: /guides/:slug
 *
 * Schemas emitted per guide:
 *   - Article (always)
 *   - BreadcrumbList (always)
 *   - FAQPage (only when the guide contains at least one faq section)
 *
 * Extension rule: adding a new guide requires only a new entry in
 * src/lib/guides-registry.ts — this file requires no changes.
 */

import { guidesRegistry, type GuideSectionFaq } from '../../src/lib/guides-registry.js';
import { SITE_URL, SITE_OG_IMAGE } from '../../src/lib/site-config.js';
import {
  buildArticleSchema,
  buildGuideBreadcrumbSchema,
  buildFAQSchema,
} from '../../src/components/json-ld.js';
import type { PageRoute } from '../types.js';

export function collectGuideRoutes(): PageRoute[] {
  return guidesRegistry.map((guide): PageRoute => {
    // Extract all FAQ sections and flatten their items into one list.
    const faqSections = guide.sections.filter(
      (s): s is GuideSectionFaq => s.type === 'faq',
    );

    const schemas: object[] = [
      buildArticleSchema({
        title: guide.title,
        description: guide.description,
        slug: guide.slug,
        datePublished: guide.datePublished,
      }),
      buildGuideBreadcrumbSchema({ title: guide.title, slug: guide.slug }),
    ];

    if (faqSections.length > 0) {
      const allItems = faqSections.flatMap((s) => s.items);
      schemas.push(buildFAQSchema(allItems));
    }

    return {
      path: `/guides/${guide.slug}`,
      pageType: 'guide',
      seo: {
        title: guide.seoTitle,
        description: guide.seoDescription,
        canonical: `${SITE_URL}/guides/${guide.slug}`,
        robots: 'index, follow',
        ogImage: SITE_OG_IMAGE,
      },
      schemas,
      lastModified: guide.datePublished,
      priority: 0.8,
      changeFrequency: 'monthly',
    };
  });
}
