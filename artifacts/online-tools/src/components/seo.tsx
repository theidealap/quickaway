import { useEffect } from 'react';
import { useLocation } from 'wouter';

export const SITE_URL = 'https://online-tool-hub-drab.vercel.app';
export const SITE_NAME = 'ToolBox';

interface SEOProps {
  title: string;
  description: string;
  /** Absolute URL to an OG image. Defaults to the site-wide OG image. */
  ogImage?: string;
}

/** Set or create a <meta> tag identified by an attribute selector. */
function setMeta(
  selector: string,
  attrName: string,
  attrValue: string,
  content: string,
) {
  let el = document.querySelector(selector) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attrName, attrValue);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

/** Set or create a <link> tag with the given rel attribute. */
function setLink(rel: string, href: string) {
  let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

export function SEO({ title, description, ogImage }: SEOProps) {
  const [location] = useLocation();

  useEffect(() => {
    const canonicalUrl = `${SITE_URL}${location === '/' ? '' : location}`;
    // Prefer an explicit path; fall back to a generic OG image placeholder
    const image = ogImage ?? `${SITE_URL}/og-image.png`;

    // ── Page title ───────────────────────────────────────────────────────────
    document.title = title;

    // ── Standard meta ────────────────────────────────────────────────────────
    setMeta('meta[name="description"]', 'name', 'description', description);

    // ── Canonical link ───────────────────────────────────────────────────────
    setLink('canonical', canonicalUrl);

    // ── Open Graph ───────────────────────────────────────────────────────────
    setMeta('meta[property="og:title"]',       'property', 'og:title',       title);
    setMeta('meta[property="og:description"]', 'property', 'og:description', description);
    setMeta('meta[property="og:url"]',         'property', 'og:url',         canonicalUrl);
    setMeta('meta[property="og:type"]',        'property', 'og:type',        'website');
    setMeta('meta[property="og:site_name"]',   'property', 'og:site_name',   SITE_NAME);
    setMeta('meta[property="og:image"]',       'property', 'og:image',       image);

    // ── Twitter / X ──────────────────────────────────────────────────────────
    setMeta('meta[name="twitter:card"]',        'name', 'twitter:card',        'summary_large_image');
    setMeta('meta[name="twitter:title"]',       'name', 'twitter:title',       title);
    setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description);
    setMeta('meta[name="twitter:image"]',       'name', 'twitter:image',       image);
  }, [title, description, location, ogImage]);

  return null;
}
