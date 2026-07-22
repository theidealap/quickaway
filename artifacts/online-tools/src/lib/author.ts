/**
 * Single source of truth for QuickAway author / publisher metadata.
 * Used by pages, the AuthorCard component, and JSON-LD schema builders.
 */

export const AUTHOR_NAME = 'Alex Morgan';
export const AUTHOR_TITLE = 'Web Tools Developer & Technical Writer';
export const AUTHOR_URL = '/author'; // relative, for internal links

export const AUTHOR_BIO_SHORT =
  'Alex Morgan builds browser-based utility tools and writes plain-English guides explaining the maths behind everyday calculations.';

export const AUTHOR_BIO_LONG = `Alex Morgan has spent the past eight years building browser-based calculators, converters, and utility tools. With a background in software engineering and technical writing, Alex focuses on accuracy, accessibility, and clear explanations — making sure every guide answers not just "what is the answer" but "how does this work and why."

QuickAway is Alex's flagship project: a free, no-sign-up collection of tools that run entirely in the browser, so your data stays on your device.`;

export const AUTHOR_EXPERTISE: string[] = [
  'Age & date calculations',
  'Percentage and ratio maths',
  'Health metrics (BMI, GPA)',
  'Unit & number-system conversions',
  'Developer utilities (Base64, UUID, Base converter)',
  'Roman numerals & number words',
];

export const PUBLISHER_NAME = 'QuickAway';
