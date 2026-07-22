import { lazy } from 'react';

// ── Category taxonomy ─────────────────────────────────────────────────────────

export type Category =
  | 'Calculators'
  | 'Converters'
  | 'Generators'
  | 'Text Tools'
  | 'Developer Tools'
  | 'Date & Time';

/** Maps each Category to its URL path segment (e.g. /calculators). */
export const CATEGORY_SLUGS: Record<Category, string> = {
  'Calculators':     'calculators',
  'Converters':      'converters',
  'Generators':      'generators',
  'Text Tools':      'text-tools',
  'Developer Tools': 'developer-tools',
  'Date & Time':     'date-time',
};

/** Reverse map: URL slug → Category name. */
export const SLUG_TO_CATEGORY: Record<string, Category> = Object.fromEntries(
  Object.entries(CATEGORY_SLUGS).map(([cat, slug]) => [slug, cat as Category])
);

/** SEO and display metadata for each category page. */
export const CATEGORY_META: Record<
  Category,
  { heading: string; description: string; seoTitle: string; seoDescription: string }
> = {
  'Calculators': {
    heading: 'Free Online Calculators',
    description:
      'Accurate calculators for everyday maths, finance, health, and academic use — no sign-up, no clutter, instant results.',
    seoTitle: 'Free Online Calculators – Math, Finance & Health | QuickAway',
    seoDescription:
      'Browse free online calculators for everyday use: age, BMI, GPA, percentage, tip, discount and more. Fast, no sign-up, works in any browser.',
  },
  'Converters': {
    heading: 'Free Online Converters',
    description:
      'Convert units of length, weight, temperature, numbers, and more — accurate, instant, and completely free.',
    seoTitle: 'Free Online Unit Converters – Length, Weight, Temperature & More | QuickAway',
    seoDescription:
      'Convert units of length, weight, temperature, volume and more with free online converter tools. Accurate, instant, and works in any browser without sign-up.',
  },
  'Generators': {
    heading: 'Free Online Generators',
    description:
      'Generate QR codes, links, passwords, email signatures, and more with one click — no watermarks, no account required.',
    seoTitle: 'Free Online Generators – QR Codes, Passwords, Links & More | QuickAway',
    seoDescription:
      'Generate QR codes, WhatsApp links, email signatures, passwords and more with free online generator tools. No watermarks, no sign-up required.',
  },
  'Text Tools': {
    heading: 'Free Online Text Tools',
    description:
      'Word counters, case converters, and text formatting utilities for writers, students, and everyday use.',
    seoTitle: 'Free Online Text Tools – Word Counter, Case Converter & More | QuickAway',
    seoDescription:
      'Free online text tools for writers and editors: count words and characters, convert text case, and more. Instant results, no sign-up needed.',
  },
  'Developer Tools': {
    heading: 'Free Online Developer Tools',
    description:
      'Encode, decode, format, and generate — lightweight developer utilities that run entirely in your browser.',
    seoTitle: 'Free Online Developer Tools – Encode, Format & Generate | QuickAway',
    seoDescription:
      'Free online developer tools: Base64 encoder/decoder, JSON formatter, UUID generator and more. No sign-up, runs in your browser, completely free.',
  },
  'Date & Time': {
    heading: 'Free Date & Time Tools',
    description:
      'Live countdowns, date difference calculators, and time utilities — all free and running instantly in your browser.',
    seoTitle: 'Free Online Date & Time Tools – Countdown & Date Calculator | QuickAway',
    seoDescription:
      'Free online date and time tools: create live countdowns to any date and calculate the exact difference between two dates. Fast, free, no sign-up.',
  },
};

// ── Tool registry ─────────────────────────────────────────────────────────────

export interface ToolEntry {
  slug: string;
  name: string;
  shortDescription: string;
  longDescription?: string;
  /** Keyword-optimised page title used in <title> and OG tags. */
  seoTitle: string;
  /** Keyword-rich meta description, 140–160 characters. */
  seoDescription: string;
  category: Category;
  component: React.LazyExoticComponent<React.ComponentType<any>>;
}

export const toolsRegistry: ToolEntry[] = [
  {
    slug: 'age-calculator',
    name: 'Age Calculator',
    shortDescription: 'Calculate exact age in years, months, and days from a birth date.',
    longDescription:
      'Find out exactly how old you are down to the day. You can also calculate your age on a specific date in the past or future.',
    seoTitle: 'Free Age Calculator – Calculate Your Exact Age Online | QuickAway',
    seoDescription:
      'Enter your date of birth to find your exact age in years, months and days — or calculate your age on any past or future date. Free, instant, no sign-up.',
    category: 'Calculators',
    component: lazy(() => import('@/tools/age-calculator')),
  },
  {
    slug: 'percentage-calculator',
    name: 'Percentage Calculator',
    shortDescription: 'Quickly calculate percentages, increases, decreases, and ratios.',
    longDescription:
      'A versatile calculator for working out percentages. Figure out X% of Y, what percentage X is of Y, or the percentage change between two numbers.',
    seoTitle: 'Free Percentage Calculator – Find % of a Number, Change & Ratio | QuickAway',
    seoDescription:
      'Calculate any percentage instantly: find X% of a number, what percentage X is of Y, or the percentage change between two values. Free online tool.',
    category: 'Calculators',
    component: lazy(() => import('@/tools/percentage-calculator')),
  },
  {
    slug: 'bmi-calculator',
    name: 'BMI Calculator',
    shortDescription: 'Calculate your Body Mass Index from height and weight.',
    longDescription:
      'Enter your height and weight in metric or imperial units to find your BMI and see which weight category it falls into.',
    seoTitle: 'Free BMI Calculator – Metric & Imperial Body Mass Index Checker | QuickAway',
    seoDescription:
      'Calculate your Body Mass Index from height and weight in metric or imperial. See your BMI category (Underweight to Obese) instantly. Free online BMI tool.',
    category: 'Calculators',
    component: lazy(() => import('@/tools/bmi-calculator')),
  },
  {
    slug: 'gpa-calculator',
    name: 'GPA Calculator',
    shortDescription: 'Calculate your GPA from course grades and credit hours.',
    longDescription:
      'Add your courses with their grades and credit hours to instantly calculate your GPA on a 4.0 or 5.0 scale.',
    seoTitle: 'Free GPA Calculator – 4.0 & 5.0 Scale Grade Point Average | QuickAway',
    seoDescription:
      'Add your courses with their letter grades and credit hours to calculate your cumulative GPA on a 4.0 or 5.0 scale. Instant results, completely free.',
    category: 'Calculators',
    component: lazy(() => import('@/tools/gpa-calculator')),
  },
  {
    slug: 'unit-converter',
    name: 'Unit Converter',
    shortDescription: 'Convert between length, weight, temperature, area, and volume units.',
    longDescription:
      'Real-time conversion between common measurement units across length, weight, temperature, area, and volume, with a one-click swap.',
    seoTitle: 'Free Unit Converter – Length, Weight, Temperature & Volume | QuickAway',
    seoDescription:
      'Convert length, weight, temperature, area and volume units in real time. Covers metric and imperial with a one-click swap. Free online unit converter.',
    category: 'Converters',
    component: lazy(() => import('@/tools/unit-converter')),
  },
  {
    slug: 'word-counter',
    name: 'Word Counter',
    shortDescription: 'Count words, characters, sentences, and paragraphs in real-time.',
    longDescription:
      'Paste or type your text to instantly see the number of words, characters (with and without spaces), sentences, and paragraphs.',
    seoTitle: 'Free Word Counter – Count Words, Characters & Paragraphs Instantly | QuickAway',
    seoDescription:
      'Paste or type text to instantly count words, characters (with and without spaces), sentences and paragraphs. Perfect for essays and social posts. Free.',
    category: 'Text Tools',
    component: lazy(() => import('@/tools/word-counter')),
  },
  {
    slug: 'qr-code-generator',
    name: 'QR Code Generator',
    shortDescription: 'Generate a QR code from text, a URL, an email, or a phone number.',
    longDescription:
      'Create a QR code from any text, website URL, email address, or phone number, then download it as a PNG in the size you need.',
    seoTitle: 'Free QR Code Generator – Text, URL, Email & Phone | QuickAway',
    seoDescription:
      'Generate a QR code from any text, URL, email address or phone number in seconds. Download as PNG at any size. No watermarks, completely free.',
    category: 'Generators',
    component: lazy(() => import('@/tools/qr-code-generator')),
  },
  {
    slug: 'whatsapp-link-generator',
    name: 'WhatsApp Link Generator',
    shortDescription: 'Create a direct WhatsApp chat link with an optional pre-filled message.',
    longDescription:
      'Generate a shareable wa.me link (plus a scannable QR code) for a phone number, with an optional pre-filled welcome message.',
    seoTitle: 'Free WhatsApp Link Generator – Create a Direct wa.me Chat Link | QuickAway',
    seoDescription:
      'Create a shareable wa.me link for any phone number — with or without a pre-filled message. Includes a scannable QR code. Free WhatsApp link maker.',
    category: 'Generators',
    component: lazy(() => import('@/tools/whatsapp-link-generator')),
  },
  {
    slug: 'email-signature-generator',
    name: 'Email Signature Generator',
    shortDescription: 'Build a professional HTML email signature with a live preview.',
    longDescription:
      'Fill in your name, title, company, and contact details to generate a clean HTML email signature you can copy straight into your email client.',
    seoTitle: 'Free Email Signature Generator – Professional HTML Signatures | QuickAway',
    seoDescription:
      'Design a professional HTML email signature with your name, title and contact details. Choose from 3 templates and paste into Gmail or Outlook. Free.',
    category: 'Generators',
    component: lazy(() => import('@/tools/email-signature-generator')),
  },
  {
    slug: 'countdown-to-date',
    name: 'Countdown to Date',
    shortDescription: 'Create a live countdown to any future date and time.',
    longDescription:
      'Pick a target date and time to see a live countdown in days, hours, minutes, and seconds, with a shareable link to the same countdown.',
    seoTitle: 'Free Countdown Timer – Live Countdown to Any Date & Time | QuickAway',
    seoDescription:
      'Set a live countdown to any future date and time — shown in days, hours, minutes and seconds. Share it with a link. Free online countdown timer.',
    category: 'Date & Time',
    component: lazy(() => import('@/tools/countdown-to-date')),
  },
  {
    slug: 'password-generator',
    name: 'Password Generator',
    shortDescription: 'Generate a secure random password with custom length and character sets.',
    longDescription:
      'Create cryptographically random passwords of any length (4–64 characters). Choose uppercase, lowercase, numbers, and symbols, with a real-time strength indicator.',
    seoTitle: 'Free Password Generator – Strong Random Passwords Online | QuickAway',
    seoDescription:
      'Generate a secure random password instantly. Choose length (4–64) and character sets (letters, numbers, symbols). No tracking, runs entirely in your browser.',
    category: 'Generators',
    component: lazy(() => import('@/tools/password-generator')),
  },
  {
    slug: 'date-difference-calculator',
    name: 'Date Difference Calculator',
    shortDescription: 'Find the exact number of days, weeks, months, and years between two dates.',
    longDescription:
      'Pick any two dates to see the precise difference broken down into years, months, and days — plus total days, total weeks, and total hours.',
    seoTitle: 'Free Date Difference Calculator – Days Between Two Dates | QuickAway',
    seoDescription:
      'Calculate the exact difference between two dates in years, months, days, weeks, and hours. Free online date difference calculator — no sign-up needed.',
    category: 'Date & Time',
    component: lazy(() => import('@/tools/date-difference-calculator')),
  },
  {
    slug: 'discount-calculator',
    name: 'Discount Calculator',
    shortDescription: 'Calculate sale price, savings, and discount percentage instantly.',
    longDescription:
      'Enter an original price and a discount percentage to see the sale price and total savings — or enter both prices to find the discount percentage.',
    seoTitle: 'Free Discount Calculator – Sale Price & Savings | QuickAway',
    seoDescription:
      'Calculate the sale price and savings from a percentage off, or find the discount % from two prices. Fast, free online discount calculator.',
    category: 'Calculators',
    component: lazy(() => import('@/tools/discount-calculator')),
  },
  {
    slug: 'tip-calculator',
    name: 'Tip Calculator',
    shortDescription: 'Calculate tip amount, total bill, and per-person split instantly.',
    longDescription:
      'Enter your bill, choose a tip percentage (or use a preset), and split between any number of people to see the tip per person and total per person.',
    seoTitle: 'Free Tip Calculator – Split Bill & Calculate Tip | QuickAway',
    seoDescription:
      'Calculate the tip on any bill and split it between any number of people. Preset tip buttons for 10%, 15%, 18%, 20%, and 25%. Free online tip calculator.',
    category: 'Calculators',
    component: lazy(() => import('@/tools/tip-calculator')),
  },
  {
    slug: 'text-case-converter',
    name: 'Text Case Converter',
    shortDescription: 'Convert text to UPPER, lower, Title, camelCase, snake_case and more.',
    longDescription:
      'Paste any text and instantly see it converted into 11 case formats — including UPPER CASE, lower case, Title Case, Sentence case, camelCase, PascalCase, kebab-case, snake_case, CONSTANT_CASE, dot.case, and aLtErNaTiNg. Copy any result with one click.',
    seoTitle: 'Free Text Case Converter – camelCase, snake_case, Title Case & More | QuickAway',
    seoDescription:
      'Convert text to any case format: UPPER, lower, Title, Sentence, camelCase, PascalCase, kebab-case, snake_case, CONSTANT_CASE and more. Free, instant, no sign-up.',
    category: 'Text Tools',
    component: lazy(() => import('@/tools/text-case-converter')),
  },
  {
    slug: 'roman-numeral-converter',
    name: 'Roman Numeral Converter',
    shortDescription: 'Convert numbers to Roman numerals and Roman numerals back to numbers.',
    longDescription:
      'Enter any number from 1 to 3,999 to see its Roman numeral equivalent — or type a Roman numeral to convert it back to a standard number. Includes a one-click swap and a quick-reference table.',
    seoTitle: 'Free Roman Numeral Converter – Numbers to Roman Numerals | QuickAway',
    seoDescription:
      'Convert any number (1–3999) to Roman numerals, or convert Roman numerals back to numbers. Instant, bidirectional converter with quick-reference table. Free.',
    category: 'Converters',
    component: lazy(() => import('@/tools/roman-numeral-converter')),
  },
  {
    slug: 'lorem-ipsum-generator',
    name: 'Lorem Ipsum Generator',
    shortDescription: 'Generate placeholder Lorem Ipsum text by paragraphs, sentences, or words.',
    longDescription:
      'Create Lorem Ipsum placeholder text in any amount — choose paragraphs, sentences, or words, set the quantity with a slider, and toggle the classic opening phrase. Copy the result with one click.',
    seoTitle: 'Free Lorem Ipsum Generator – Placeholder Text by Paragraph | QuickAway',
    seoDescription:
      'Generate Lorem Ipsum placeholder text by paragraphs, sentences, or words. Choose quantity, toggle the classic opening, and copy instantly. Free online Lorem Ipsum tool.',
    category: 'Generators',
    component: lazy(() => import('@/tools/lorem-ipsum-generator')),
  },
  {
    slug: 'base-converter',
    name: 'Binary / Hex / Octal Converter',
    shortDescription: 'Convert numbers between binary, octal, decimal, and hexadecimal in real time.',
    longDescription:
      'Type a number in any base — binary (base 2), octal (base 8), decimal (base 10), or hexadecimal (base 16) — and all four representations update instantly. Includes a common values reference table.',
    seoTitle: 'Free Binary / Hex / Octal Converter – Base 2, 8, 10, 16 | QuickAway',
    seoDescription:
      'Convert numbers between binary, octal, decimal, and hexadecimal instantly. Type in any base and all others update in real time. Free online number base converter.',
    category: 'Converters',
    component: lazy(() => import('@/tools/base-converter')),
  },
  {
    slug: 'number-to-words',
    name: 'Number to Words Converter',
    shortDescription: 'Convert any number into English words — cardinal and ordinal forms.',
    longDescription:
      'Type any integer (positive or negative, up to 999 quadrillion) and instantly see it written out in English — in lowercase, capitalised, cardinal, and ordinal forms. Copy any variant with one click.',
    seoTitle: 'Free Number to Words Converter – Write Numbers in English | QuickAway',
    seoDescription:
      'Convert any number to English words: cardinal (one thousand) and ordinal (one thousandth) forms, in lowercase and capitalised. Free, instant, no sign-up.',
    category: 'Converters',
    component: lazy(() => import('@/tools/number-to-words')),
  },
  {
    slug: 'uuid-generator',
    name: 'UUID Generator',
    shortDescription: 'Generate up to 20 cryptographically random UUID v4 identifiers at once.',
    longDescription:
      'Generate 1–20 UUID v4 identifiers in a single click using your browser\'s native crypto API. Toggle uppercase, copy individual UUIDs or all at once, and regenerate any time — nothing is sent to a server.',
    seoTitle: 'Free UUID Generator – Random UUID v4 Online | QuickAway',
    seoDescription:
      'Generate 1–20 cryptographically random UUID v4 identifiers instantly. Copy individual or all at once. Runs entirely in your browser — no server, no tracking. Free.',
    category: 'Developer Tools',
    component: lazy(() => import('@/tools/uuid-generator')),
  },
  {
    slug: 'base64-encoder-decoder',
    name: 'Base64 Encoder / Decoder',
    shortDescription: 'Encode plain text to Base64 or decode a Base64 string back to text.',
    longDescription:
      'Switch between Encode and Decode modes. Encoding converts any Unicode text to a Base64 string; decoding converts a Base64 string back to readable text, with clear error messages for invalid input. Everything runs in your browser.',
    seoTitle: 'Free Base64 Encoder / Decoder – Online Base64 Tool | QuickAway',
    seoDescription:
      'Encode plain text to Base64 or decode Base64 strings back to text. Handles Unicode correctly. Runs entirely in your browser — no uploads, no tracking. Free.',
    category: 'Developer Tools',
    component: lazy(() => import('@/tools/base64-encoder-decoder')),
  },
];
