import { useEffect } from 'react';
import { SITE_URL, SITE_NAME, SITE_OG_IMAGE, SITE_LOGO_URL } from '@/lib/site-config';
import { PUBLISHER_NAME } from '@/lib/author';

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return null;
}

// ── Schema builders ───────────────────────────────────────────────────────────

/** Schema.org WebSite. */
export function buildWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description:
      'Free online tools for calculations, conversions, productivity and everyday use.',
  };
}

/** Schema.org Organization with logo — used on the homepage. */
export function buildOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: PUBLISHER_NAME,
    url: SITE_URL,
    logo: {
      '@type': 'ImageObject',
      url: SITE_LOGO_URL,
    },
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
 * Includes a Person author and a full Organization publisher with logo
 * for maximum E-E-A-T signal and AdSense / rich-results eligibility.
 */
export function buildArticleSchema(opts: {
  title: string;
  description: string;
  slug: string;
  datePublished: string;
  /** Defaults to datePublished when omitted. */
  dateModified?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: opts.title,
    description: opts.description,
    image: [
      SITE_OG_IMAGE,
    ],
    url: `${SITE_URL}/guides/${opts.slug}`,
    datePublished: opts.datePublished,
    dateModified: opts.dateModified ?? opts.datePublished,
    author: {
      '@type': 'Organization',
      name: PUBLISHER_NAME,
      url: SITE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: PUBLISHER_NAME,
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: SITE_LOGO_URL,
      },
    },
    isAccessibleForFree: true,
    inLanguage: 'en',
  };
}

/** Schema.org FAQPage — emitted alongside Article on guide pages that contain FAQ sections. */
export function buildFAQSchema(items: Array<{ q: string; a: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
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
    name: 'Free Guides & How-To Articles | QuickAway',
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

// ── Author page schema builders ───────────────────────────────────────────────

/**
 * Schema.org Person for the /author page.
 * Describes the site's author with structured identity and expertise signals
 * for E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness).
 */
/**
 * Schema.org Organization for the /author page.
 * Identifies QuickAway as the creator of all site content.
 * A real Person schema should be substituted here once the site owner's
 * name is confirmed — simply replace @type with "Person" and add the
 * real name, jobTitle, and knowsAbout fields.
 */
export function buildPersonSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: {
      '@type': 'ImageObject',
      url: SITE_LOGO_URL,
    },
  };
}

/** BreadcrumbList for the /author page: Home > Author (2 items). */
export function buildAuthorBreadcrumbSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Author', item: `${SITE_URL}/author` },
    ],
  };
}

// ── Editorial Policy page schema builders ─────────────────────────────────────

/**
 * Schema.org WebPage for the /editorial-policy page.
 * Provides structured editorial transparency signals for E-E-A-T.
 */
export function buildEditorialPolicySchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Editorial Policy | QuickAway',
    url: `${SITE_URL}/editorial-policy`,
    description:
      'How QuickAway creates and maintains its guides — accuracy standards, research process, update policy, and editorial purpose.',
    isPartOf: {
      '@type': 'WebSite',
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
}

/** BreadcrumbList for the /editorial-policy page: Home > Editorial Policy (2 items). */
export function buildEditorialBreadcrumbSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Editorial Policy',
        item: `${SITE_URL}/editorial-policy`,
      },
    ],
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
