import { useEffect } from 'react';
import { SITE_URL, SITE_NAME } from '@/components/seo';

// ── Generic renderer ─────────────────────────────────────────────────────────

interface JsonLdProps {
  /** A unique DOM id so multiple schemas can coexist without duplication. */
  id: string;
  schema: Record<string, unknown>;
}

/**
 * Injects a <script type="application/ld+json"> into <head>.
 * Uses a stable `id` attribute so React re-renders update in place.
 */
export function JsonLd({ id, schema }: JsonLdProps) {
  useEffect(() => {
    const scriptId = `jsonld-${id}`;
    let el = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!el) {
      el = document.createElement('script');
      el.id = scriptId;
      el.type = 'application/ld+json';
      document.head.appendChild(el);
    }
    el.textContent = JSON.stringify(schema);

    return () => {
      // Remove the script when the component unmounts (page navigation).
      document.getElementById(scriptId)?.remove();
    };
  }, [id, schema]);

  return null;
}

// ── Schema builders ───────────────────────────────────────────────────────────

/** Schema.org WebSite with sitelinks SearchAction. */
export function buildWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description:
      'Free online tools for calculations, conversions, productivity and everyday use.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/** Schema.org Organization. */
export function buildOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
  };
}

/** Schema.org SoftwareApplication for a single tool page. */
export function buildSoftwareAppSchema(opts: {
  name: string;
  description: string;
  slug: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: opts.name,
    description: opts.description,
    url: `${SITE_URL}/tools/${opts.slug}`,
    applicationCategory: 'UtilityApplication',
    operatingSystem: 'Web Browser',
    isAccessibleForFree: true,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  };
}

/**
 * Schema.org BreadcrumbList.
 *
 * - Without `category`: Home > Tool Name  (2 items)
 * - With    `category`: Home > Category > Tool Name  (3 items)
 */
export function buildBreadcrumbSchema(opts: {
  name: string;
  slug: string;
  category?: { name: string; slug: string };
}) {
  const items: Record<string, unknown>[] = [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
  ];

  if (opts.category) {
    items.push({
      '@type': 'ListItem',
      position: 2,
      name: opts.category.name,
      item: `${SITE_URL}/${opts.category.slug}`,
    });
    items.push({
      '@type': 'ListItem',
      position: 3,
      name: opts.name,
      item: `${SITE_URL}/tools/${opts.slug}`,
    });
  } else {
    items.push({
      '@type': 'ListItem',
      position: 2,
      name: opts.name,
      item: `${SITE_URL}/tools/${opts.slug}`,
    });
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items,
  };
}

/**
 * Schema.org BreadcrumbList for category pages: Home > Category Name  (2 items).
 */
export function buildCategoryBreadcrumbSchema(opts: { name: string; slug: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: opts.name, item: `${SITE_URL}/${opts.slug}` },
    ],
  };
}

// ── Guide schema builders ─────────────────────────────────────────────────────

/**
 * Schema.org Article for a single guide page.
 */
export function buildArticleSchema(opts: {
  title: string;
  description: string;
  slug: string;
  datePublished: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: opts.title,
    description: opts.description,
    url: `${SITE_URL}/guides/${opts.slug}`,
    datePublished: opts.datePublished,
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    author: {
      '@type': 'Organization',
      name: SITE_NAME,
    },
    isAccessibleForFree: true,
    inLanguage: 'en',
  };
}

/** BreadcrumbList for the /guides index page: Home > Guides (2 items). */
export function buildGuidesIndexBreadcrumbSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Guides', item: `${SITE_URL}/guides` },
    ],
  };
}

/** BreadcrumbList for a single guide page: Home > Guides > Guide Title (3 items). */
export function buildGuideBreadcrumbSchema(opts: { title: string; slug: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Guides', item: `${SITE_URL}/guides` },
      {
        '@type': 'ListItem',
        position: 3,
        name: opts.title,
        item: `${SITE_URL}/guides/${opts.slug}`,
      },
    ],
  };
}

/** Schema.org CollectionPage for the /guides index listing all guides. */
export function buildGuidesCollectionSchema(guides: Array<{ title: string; slug: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Free Guides & How-To Articles | ToolBox',
    description:
      'Step-by-step guides explaining the maths and concepts behind free online tools — worked examples, formulas, and FAQs.',
    url: `${SITE_URL}/guides`,
    hasPart: guides.map((g) => ({
      '@type': 'Article',
      name: g.title,
      url: `${SITE_URL}/guides/${g.slug}`,
    })),
  };
}

/**
 * Schema.org CollectionPage for a category page listing multiple tools.
 */
export function buildCategorySchema(opts: {
  name: string;
  slug: string;
  description: string;
  tools: Array<{ name: string; slug: string }>;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: opts.name,
    description: opts.description,
    url: `${SITE_URL}/${opts.slug}`,
    hasPart: opts.tools.map((tool) => ({
      '@type': 'SoftwareApplication',
      name: tool.name,
      url: `${SITE_URL}/tools/${tool.slug}`,
      applicationCategory: 'UtilityApplication',
      operatingSystem: 'Web',
      isAccessibleForFree: true,
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
    })),
  };
}
