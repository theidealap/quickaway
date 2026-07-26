/**
 * Single source of truth for all site-wide constants.
 *
 * Import from here — never from @/components/seo or any other file.
 * Both React components and build scripts (scripts/) consume this module.
 * It must remain free of React imports, browser APIs, and side effects.
 */

export const SITE_URL = 'https://www.quickaway.app';
export const SITE_NAME = 'QuickAway';

/** Absolute URL to the default Open Graph image (1200×630, served from /public). */
export const SITE_OG_IMAGE = `${SITE_URL}/og-image.png`;

/**
 * Absolute URL to the publisher logo (1024×1024 PNG, white background, /public).
 * Used in Organization, Article publisher, and WebPage schemas.
 */
export const SITE_LOGO_URL = `${SITE_URL}/logo.png`;
