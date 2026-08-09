/**
 * Single source of truth for SEO strings on all static pages.
 *
 * "Static pages" are routes whose metadata is fixed at build time and does not
 * depend on a registry entry (home, about, author, contact, privacy, terms,
 * editorial-policy, guides-index).
 *
 * Dynamic pages (tool, guide, category) derive their SEO strings from their
 * respective registry entries (tools-registry.ts, guides-registry.ts) — they
 * are NOT in this file.
 *
 * ── Extension rule ────────────────────────────────────────────────────────────
 * To add a new static page:
 *   1. Add an entry below with title, description, and lastModified.
 *   2. Import PAGE_META in the React page component and in scripts/routes/static.ts.
 * That is the only change required — no other file needs touching.
 *
 * ── Import rule ───────────────────────────────────────────────────────────────
 * This file may import from src/lib/* (pure TS, no React, no browser APIs).
 * It must NOT import from src/components/* or src/pages/*.
 */

import { AUTHOR_NAME } from '@/lib/author';

export interface StaticPageMeta {
  /** <title>, og:title, twitter:title */
  title: string;
  /** <meta name="description">, og:description, twitter:description */
  description: string;
  /**
   * ISO 8601 date of last meaningful content change, e.g. "2026-07-25".
   * Used by the build pipeline (sitemap generator, prerender).
   * Update this when page copy or metadata is meaningfully edited.
   */
  lastModified: string;
}

export const PAGE_META: Record<string, StaticPageMeta> = {
  home: {
    title: 'QuickAway — Free Online Calculator & Tool Hub',
    description:
      'Free browser-based utilities for everyday calculations, conversions, and text tasks. Age calculator, BMI, percentage, unit converter, and 17 more tools. No sign-up.',
    lastModified: '2026-07-26',
  },

  about: {
    title: 'About QuickAway — Free Browser-Based Utilities, No Sign-Up Required',
    description:
      'QuickAway is a free collection of browser-based calculators and utilities that run entirely on your device. No account needed, no data collected, instant results.',
    lastModified: '2026-07-25',
  },

  author: {
    title: `${AUTHOR_NAME} — Author & Web Tools Developer | QuickAway`,
    description: `${AUTHOR_NAME} is the creator of QuickAway — free browser-based calculators and utility tools. Learn about the author's background, expertise, and the mission behind the site.`,
    lastModified: '2026-07-25',
  },

  contact: {
    title: 'Contact Us - QuickAway',
    description:
      'Get in touch with the QuickAway team. Request new tools, report bugs, or just say hello.',
    lastModified: '2026-07-25',
  },

  privacy: {
    title: 'Privacy Policy - QuickAway',
    description:
      'QuickAway does not collect the data you enter into its tools. All calculations run locally in your browser. Read our full privacy policy.',
    lastModified: '2026-07-23',
  },

  terms: {
    title: 'Terms of Service - QuickAway',
    description:
      'Terms and conditions for using QuickAway\'s free online calculators and utilities. Tools are provided as-is for informational purposes.',
    lastModified: '2026-07-23',
  },

  editorialPolicy: {
    title: 'Editorial Policy | QuickAway',
    description:
      'How QuickAway creates and maintains its guides, covering accuracy standards, research process, update policy, and editorial purpose.',
    lastModified: '2026-07-23',
  },

  guidesIndex: {
    title: 'Free Guides & How-To Articles | QuickAway',
    description:
      'In-depth guides explaining the formulas, worked examples, and edge cases behind QuickAway\'s calculators and converters — covering compound interest, percentage change, GPA, BMI, and Roman numerals.',
    lastModified: '2026-07-25',
  },
};
