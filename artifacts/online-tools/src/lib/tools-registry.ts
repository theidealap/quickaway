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
      'Accurate calculators for everyday maths, finance, health, and academic use. No sign-up, no clutter, instant results.',
    seoTitle: 'Free Online Calculators – Math, Finance & Health | QuickAway',
    seoDescription:
      'Browse free online calculators for everyday use: age, BMI, GPA, percentage, tip, discount and more. Fast, no sign-up, works in any browser.',
  },
  'Converters': {
    heading: 'Free Online Converters',
    description:
      'Convert units of length, weight, temperature, numbers, and more. Accurate, instant, and completely free.',
    seoTitle: 'Free Online Unit Converters – Length, Weight, Temperature & More | QuickAway',
    seoDescription:
      'Convert units of length, weight, temperature, volume and more with free online converter tools. Accurate, instant, and works in any browser without sign-up.',
  },
  'Generators': {
    heading: 'Free Online Generators',
    description:
      'Generate QR codes, links, passwords, email signatures, and more with one click. No watermarks, no account required.',
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
      'Lightweight developer utilities for encoding, decoding, formatting, and generating. Runs entirely in your browser.',
    seoTitle: 'Free Online Developer Tools – Encode, Format & Generate | QuickAway',
    seoDescription:
      'Free online developer tools: Base64 encoder/decoder, JSON formatter, UUID generator and more. No sign-up, runs in your browser, completely free.',
  },
  'Date & Time': {
    heading: 'Free Date & Time Tools',
    description:
      'Live countdowns, date difference calculators, and time utilities. All free, running instantly in your browser.',
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
      'Calculate your exact age in years, months, and days from any birth date to any reference date — with correct handling of leap years, varying month lengths, and mid-year birthdays.',
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
      'Three percentage calculators in one: find X% of a number, calculate what percentage X is of Y, or measure the percentage change between two values — with the formula shown for every result.',
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
      'Enter height and weight in metric or imperial to calculate your BMI, see which WHO weight category it falls into, and understand what the number does — and does not — tell you about your health.',
    category: 'Calculators',
    component: lazy(() => import('@/tools/bmi-calculator')),
  },
  {
    slug: 'calorie-deficit-calculator',
    name: 'Calorie Deficit Calculator',
    shortDescription: 'Calculate your target daily calories for weight loss, maintenance, or gain.',
    longDescription:
      'Enter your sex, age, height, weight, and activity level to calculate your TDEE, then choose a goal (lose, maintain, or gain weight) and a deficit or surplus amount to find your target daily calorie intake and estimated weekly weight change.',
    seoTitle: 'Free Calorie Deficit Calculator – Daily Calories for Weight Loss or Gain | QuickAway',
    seoDescription:
      'Calculate target daily calories for weight loss, maintenance, or gain using the Mifflin-St Jeor equation — with a weekly weight-change estimate based on the 7,700 kcal/kg approximation and an explanation of the formula behind every number.',
    category: 'Calculators',
    component: lazy(() => import('@/tools/calorie-deficit-calculator')),
  },
  {
    slug: 'tdee-calculator',
    name: 'TDEE Calculator',
    shortDescription: 'Calculate your Total Daily Energy Expenditure and BMR using the Mifflin-St Jeor equation.',
    longDescription:
      'Enter your sex, age, height, and weight in metric or imperial units, then select your activity level to see your TDEE (Total Daily Energy Expenditure), Basal Metabolic Rate (BMR), and calorie reference points for weight maintenance, loss, or gain.',
    seoTitle: 'Free TDEE Calculator – Total Daily Energy Expenditure & BMR | QuickAway',
    seoDescription:
      'Calculate TDEE and BMR using the Mifflin-St Jeor equation with five activity multipliers (×1.2 to ×1.9). Enter age, height, and weight in metric or imperial — see BMR, maintenance calories, and informational reference points.',
    category: 'Calculators',
    component: lazy(() => import('@/tools/tdee-calculator')),
  },
  {
    slug: 'gpa-calculator',
    name: 'GPA Calculator',
    shortDescription: 'Calculate your GPA from course grades and credit hours.',
    longDescription:
      'Add your courses with their grades and credit hours to instantly calculate your GPA on a 4.0 or 5.0 scale.',
    seoTitle: 'Free GPA Calculator – 4.0 & 5.0 Scale Grade Point Average | QuickAway',
    seoDescription:
      'Calculate your GPA on a 4.0 or 5.0 scale by entering letter grades and credit hours — see quality points per course and the weighted formula behind every result.',
    category: 'Calculators',
    component: lazy(() => import('@/tools/gpa-calculator')),
  },
  {
    slug: 'time-zone-converter',
    name: 'Time Zone Converter',
    shortDescription: 'Convert a date and time from one timezone to another, with live current time.',
    longDescription:
      'Pick any two IANA timezones using the searchable city dropdowns, enter a date and time in the "From" zone, and instantly see the converted date and time in the "To" zone — with automatic DST handling via the native Intl API. A live current-time strip shows both zones ticking in real time.',
    seoTitle: 'Free Time Zone Converter – Convert Time Between Cities | QuickAway',
    seoDescription:
      'Convert any date and time between 60+ world timezones using the Intl API — with automatic DST handling, IANA timezone names, and a live current-time strip. Covers why fixed UTC offsets give wrong answers during Daylight Saving Time transitions.',
    category: 'Converters',
    component: lazy(() => import('@/tools/time-zone-converter')),
  },
  {
    slug: 'unit-converter',
    name: 'Unit Converter',
    shortDescription: 'Convert between length, weight, temperature, area, and volume units.',
    longDescription:
      'Real-time conversion between common measurement units across length, weight, temperature, area, and volume, with a one-click swap.',
    seoTitle: 'Free Unit Converter – Length, Weight, Temperature & Volume | QuickAway',
    seoDescription:
      'Convert between length, weight, temperature, area, and volume units using exact conversion factors — including the 1959-defined inch (2.54 cm) and exact pound (453.59237 g). Swap, compare, and verify both directions.',
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
      'Count words, characters (with and without spaces), sentences, paragraphs, and estimated reading time as you type — with an explanation of how whitespace-based splitting works and why counters can disagree.',
    category: 'Text Tools',
    component: lazy(() => import('@/tools/word-counter')),
  },
  {
    slug: 'color-palette-generator',
    name: 'Color Palette Generator',
    shortDescription: 'Generate 5 harmonious colors from a base color using complementary, analogous, or triadic schemes.',
    longDescription:
      'Pick a base color with the color picker or by typing a hex code, then choose a harmony scheme — Complementary, Analogous, Triadic, or Split Complementary — to generate 5 matching colors. Click any swatch to copy its hex code. Includes a detail table with RGB and HSL values.',
    seoTitle: 'Free Color Palette Generator – Complementary, Analogous & Triadic | QuickAway',
    seoDescription:
      'Pick any base color and a harmony scheme — complementary, analogous, triadic, or split-complementary — to instantly generate a 5-color palette with click-to-copy hex, RGB, and HSL values.',
    category: 'Generators',
    component: lazy(() => import('@/tools/color-palette-generator')),
  },
  {
    slug: 'css-gradient-generator',
    name: 'CSS Gradient Generator',
    shortDescription: 'Build linear or radial CSS gradients with a live preview and one-click copy.',
    longDescription:
      'Add color stops, set their positions, choose linear or radial gradient type, and adjust the angle with a slider. A live preview updates instantly as you edit. Copy the ready-to-paste CSS code with one click.',
    seoTitle: 'Free CSS Gradient Generator – Linear & Radial Gradients | QuickAway',
    seoDescription:
      'Build linear or radial CSS gradients with a live preview — adjust angle (0°–359°), add unlimited color stops with custom positions, and copy the ready-to-paste background: gradient(...) CSS. Covers how angles, color stops, and gradient banding work.',
    category: 'Generators',
    component: lazy(() => import('@/tools/css-gradient-generator')),
  },
  {
    slug: 'hash-generator',
    name: 'Hash Generator',
    shortDescription: 'Generate MD5, SHA-1, and SHA-256 hashes of any text, instantly in your browser.',
    longDescription:
      'Type or paste any text to instantly see its MD5, SHA-1, and SHA-256 hashes. SHA-1 and SHA-256 use the browser\'s built-in Web Crypto API; MD5 uses an inline RFC 1321 implementation. Click any hash to copy it. Nothing is sent to a server.',
    seoTitle: 'Free Hash Generator – MD5, SHA-1 & SHA-256 Online | QuickAway',
    seoDescription:
      'Instantly generate MD5 (128-bit), SHA-1 (160-bit), and SHA-256 (256-bit) hashes for any text — computed in your browser with no server calls. Click any digest to copy it.',
    category: 'Generators',
    component: lazy(() => import('@/tools/hash-generator')),
  },
  {
    slug: 'qr-code-generator',
    name: 'QR Code Generator',
    shortDescription: 'Generate a QR code from text, a URL, an email, or a phone number.',
    longDescription:
      'Create a QR code from any text, website URL, email address, or phone number, then download it as a PNG in the size you need.',
    seoTitle: 'Free QR Code Generator – Text, URL, Email & Phone | QuickAway',
    seoDescription:
      'Generate a QR code from any text, URL, email address, or phone number and download as PNG. Covers how Reed–Solomon error correction lets QR codes survive partial damage — and why static QR codes contain no tracking.',
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
      'Generate a wa.me click-to-chat link for any phone number — with automatic E.164 formatting, optional pre-filled message URL-encoding, and a scannable QR code. Covers how the wa.me URL structure works and what happens without WhatsApp installed.',
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
      'Generate a professional HTML email signature using inline styles and table-based layout — compatible with Gmail, Outlook, and Apple Mail. Covers why email clients render signatures differently from browsers and why web fonts should not be used.',
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
      'Set a live countdown to any date and time, shown in days, hours, minutes, and seconds — with epoch-based storage so the shareable link resolves to the same absolute moment regardless of the viewer\'s time zone.',
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
      'Generate a cryptographically secure random password using crypto.getRandomValues() — choose length (4–64) and character sets for up to 103.4 bits of entropy. Covers the H = L × log₂(N) entropy formula and why length matters more than complexity.',
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
      'Calculate the exact difference between any two dates in years, months, days, weeks, and total hours — with an explanation of why calendar-unit results differ from total days and how leap years affect the count.',
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
      'Calculate the sale price and exact savings from any discount percentage, or work backwards from two prices to find the discount rate — with stacked-discount and reverse-price formulas explained.',
    category: 'Calculators',
    component: lazy(() => import('@/tools/discount-calculator')),
  },
  {
    slug: 'compound-interest-calculator',
    name: 'Compound Interest Calculator',
    shortDescription: 'Calculate compound interest, final amount, and year-by-year growth.',
    longDescription:
      'Enter a principal, annual interest rate, compounding frequency, and number of years to see the final balance, total interest earned, and a year-by-year breakdown table.',
    seoTitle: 'Free Compound Interest Calculator – Final Amount & Year-by-Year Breakdown | QuickAway',
    seoDescription:
      'See exactly how compounding frequency affects long-term growth — enter any principal, rate and term to get a final balance, effective APY, and a year-by-year interest breakdown.',
    category: 'Calculators',
    component: lazy(() => import('@/tools/compound-interest-calculator')),
  },
  {
    slug: 'loan-emi-calculator',
    name: 'Loan EMI Calculator',
    shortDescription: 'Calculate monthly EMI, total interest, and full loan amortisation schedule.',
    longDescription:
      'Enter a loan amount, annual interest rate, and tenure (in years or months) to instantly see your monthly EMI, total interest payable, and a year-by-year amortisation breakdown.',
    seoTitle: 'Free Loan EMI Calculator – Monthly EMI & Amortisation Schedule | QuickAway',
    seoDescription:
      'Enter any loan amount, interest rate, and term to get your monthly EMI, total interest paid, and a full amortisation schedule showing exactly how much of each payment goes to principal versus interest.',
    category: 'Calculators',
    component: lazy(() => import('@/tools/loan-emi-calculator')),
  },
  {
    slug: 'mortgage-calculator',
    name: 'Mortgage Calculator',
    shortDescription: 'Calculate your monthly mortgage payment including taxes, insurance, and PMI.',
    longDescription:
      'Enter your home price, down payment, interest rate, and loan term to see your total monthly payment broken down into principal & interest, property tax, home insurance, and PMI (if applicable). Includes a full year-by-year amortisation schedule.',
    seoTitle: 'Free Mortgage Calculator – Monthly Payment, PMI & Amortisation Schedule | QuickAway',
    seoDescription:
      'Calculate your full monthly mortgage payment — principal, interest, property tax, home insurance, and PMI — with a year-by-year amortisation schedule and automatic PMI detection below 20% down.',
    category: 'Calculators',
    component: lazy(() => import('@/tools/mortgage-calculator')),
  },
  {
    slug: 'tip-calculator',
    name: 'Tip Calculator',
    shortDescription: 'Calculate tip amount, total bill, and per-person split instantly.',
    longDescription:
      'Enter your bill, choose a tip percentage (or use a preset), and split between any number of people to see the tip per person and total per person.',
    seoTitle: 'Free Tip Calculator – Split Bill & Calculate Tip | QuickAway',
    seoDescription:
      'Calculate tip amount, grand total, and per-person split for any bill — with preset buttons for 10–25%, a custom percentage input, and an explanation of pre-tax vs. post-tax tipping and how tipping conventions vary by country.',
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
      'Convert any text to 11 case formats simultaneously — camelCase, PascalCase, snake_case, kebab-case, CONSTANT_CASE, Title Case, Sentence case and more — with one-click copy and an explanation of where each convention is used.',
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
      'Convert any number from 1 to 3,999 to Roman numerals or back — with a clear explanation of the six subtractive pairs (IV, IX, XL, XC, CD, CM), the three-repeat limit, and why the range stops at MMMCMXCIX.',
    category: 'Converters',
    component: lazy(() => import('@/tools/roman-numeral-converter')),
  },
  {
    slug: 'lorem-ipsum-generator',
    name: 'Lorem Ipsum Generator',
    shortDescription: 'Generate placeholder Lorem Ipsum text by paragraphs, sentences, or words.',
    longDescription:
      'Create Lorem Ipsum placeholder text in any amount. Choose paragraphs, sentences, or words, set the quantity with a slider, and toggle the classic opening phrase. Copy the result with one click.',
    seoTitle: 'Free Lorem Ipsum Generator – Placeholder Text by Paragraph | QuickAway',
    seoDescription:
      'Generate Lorem Ipsum placeholder text by paragraphs, sentences, or words — with the origin traced to Cicero\'s De Finibus Bonorum et Malorum (45 BC) and its path to modern design via Letraset and PageMaker explained.',
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
      'Convert numbers between binary, octal, decimal, and hexadecimal instantly — with worked examples of the division-remainder method, the 4-bit binary-to-hex grouping trick, and the maximum value for 8, 16, and 32-bit unsigned integers.',
    category: 'Converters',
    component: lazy(() => import('@/tools/base-converter')),
  },
  {
    slug: 'number-to-words',
    name: 'Number to Words Converter',
    shortDescription: 'Convert any number into English words, in cardinal and ordinal forms.',
    longDescription:
      'Type any integer (positive or negative, up to 999 quadrillion) and instantly see it written out in English — in lowercase, capitalised, cardinal, and ordinal forms. Copy any variant with one click.',
    seoTitle: 'Free Number to Words Converter – Write Numbers in English | QuickAway',
    seoDescription:
      'Convert any integer to English words in cardinal and ordinal forms — with the short-scale grouping system explained, worked examples up to quadrillions, and guidance on writing numbers in words for checks and legal documents.',
    category: 'Converters',
    component: lazy(() => import('@/tools/number-to-words')),
  },
  {
    slug: 'uuid-generator',
    name: 'UUID Generator',
    shortDescription: 'Generate up to 20 cryptographically random UUID v4 identifiers at once.',
    longDescription:
      'Generate 1–20 UUID v4 identifiers in a single click using your browser\'s native crypto API. Toggle uppercase, copy individual UUIDs or all at once, and regenerate any time. Nothing is sent to a server.',
    seoTitle: 'Free UUID Generator – Random UUID v4 Online | QuickAway',
    seoDescription:
      'Generate UUID v4 identifiers using crypto.randomUUID() — with the 8-4-4-4-12 structure explained, 122-bit randomness quantified (2¹²² ≈ 5.32 × 10³⁶ possible values), and birthday-paradox collision probability computed.',
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
      'Encode text to Base64 or decode Base64 strings — with the 64-character alphabet explained, the 4/3 size-increase ratio derived, padding (= and ==) demystified, and common real-world uses including JWTs, MIME email, and data URIs covered.',
    category: 'Developer Tools',
    component: lazy(() => import('@/tools/base64-encoder-decoder')),
  },
];
