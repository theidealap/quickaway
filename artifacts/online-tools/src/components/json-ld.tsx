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
