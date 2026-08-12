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
  /** FAQ items for schema.org FAQPage structured data — pulled from the tool's visible FAQ section. */
  faq?: Array<{ q: string; a: string }>;
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
    faq: [
      { q: 'Why can\'t I just subtract birth year from current year?', a: 'Year subtraction only counts how many birthdays could have occurred, not how many have. If you were born in November and you check in February, subtracting years gives a count one too high — this year\'s birthday hasn\'t arrived yet. The accurate method checks whether the current month and day have passed the birth month and day before settling on the year count.' },
      { q: 'How does a leap year affect age calculation?', a: 'Leap years affect the total days count directly — anyone who has lived through a leap year has accumulated an extra calendar day compared to a non-leap year. For someone born on February 29, the birthday is treated as not-yet-passed until March 1 in non-leap years, so on February 28, 2025, a person born February 29, 1996 is 28 years, 11 months, and 30 days old — not yet 29.' },
      { q: 'What is the difference between age in years and exact age in days?', a: 'Age in years is a rounded, calendar-aware figure used for legal and social purposes. Age in total days is an unambiguous count of the exact number of 24-hour periods since birth. Two people who are both "34 years old" can differ by up to 364 days in their day count, depending on where their birthdays fall in the year. Total days is useful whenever a precise elapsed-time figure matters more than the rounded year.' },
      { q: 'Do some cultures calculate age differently?', a: 'Yes. East Asian age reckoning, traditional in Korea and historically in China and Japan, counts a newborn as age 1 at birth and adds 1 on each January 1st rather than each birthday. A baby born on December 31st becomes age 2 by January 2nd of the following year, even though only two days have passed. South Korea officially adopted the international birthday-based system in June 2023.' },
    ],
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
    faq: [
      { q: 'How do I calculate a percentage increase from one number to another?', a: 'Subtract the original from the new number to get the change, divide that by the original, then multiply by 100. Example: going from 240 to 300 — change is 60, divided by 240 gives 0.25, multiplied by 100 gives 25%. Use the "% Change" tab and enter both numbers to get this result instantly, with the formula shown.' },
      { q: 'What is the difference between percentage points and percent?', a: 'A percentage point is an absolute difference between two percentages; a percent change is a relative one. If an interest rate rises from 5% to 8%, it has increased by 3 percentage points — but it has risen by 60% relative to where it started, because (8 − 5) ÷ 5 × 100 = 60%. Confusing the two is a common error in financial and political reporting.' },
      { q: 'How do I find the original number before a percentage change was applied?', a: 'Divide the final value by (1 − rate) for a percentage decrease, or by (1 + rate) for a percentage increase, where the rate is expressed as a decimal. Example: a product costs $64 after a 20% discount, so the original price was 64 ÷ (1 − 0.20) = 64 ÷ 0.80 = $80. This is sometimes called a reverse percentage calculation.' },
      { q: 'How do I calculate a percentage discount?', a: 'Multiply the original price by the discount rate as a decimal to find the saving, then subtract from the original for the final price. A 30% discount on $150 saves 0.30 × 150 = $45, giving a final price of $105. Alternatively, multiply directly by (1 − rate): $150 × 0.70 = $105. Use the "What is X% of Y?" tab — enter the discount rate and the original price to get the exact saving in one step.' },
    ],
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
    faq: [
      { q: 'Is BMI accurate for athletes and muscular people?', a: 'BMI cannot distinguish between fat mass and lean mass — it only uses total weight and height. A 90 kg bodybuilder at 175 cm gets the same BMI of 29.4 as a sedentary person with identical measurements, despite very different body compositions. For athletes, methods like DEXA scanning or skinfold calipers give a more meaningful picture of actual body fat percentage.' },
      { q: 'What is a healthy BMI range?', a: 'World Health Organization guidelines classify 18.5 to 24.9 as Normal weight for adults — the range associated with the lowest risk of weight-related health conditions in population studies. Some research suggests the optimal range sits slightly lower (18.5–22.9) for adults of Asian descent, where health risks tied to excess body fat can appear at lower BMI values.' },
      { q: 'Does BMI differ by age or sex?', a: 'For adults aged 20 and older, the same four BMI thresholds apply regardless of age or sex. Children and teenagers use sex-specific, age-adjusted BMI-for-age percentile charts instead, because body composition changes substantially during development. For adults, BMI does not capture sex differences in fat distribution — a woman and a man with identical BMIs can carry meaningfully different amounts of body fat.' },
      { q: 'What are BMI\'s key limitations?', a: 'BMI does not capture where fat is stored. Abdominal visceral fat carries a higher cardiovascular risk than fat around the hips and thighs, yet two people with the same BMI can have very different distributions. It also ignores bone density, hydration, and muscle mass. The WHO describes BMI as a population-level screening tool — at the individual level it should always be considered alongside other clinical measurements.' },
    ],
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
    faq: [
      { q: 'How is weekly weight change estimated from a calorie deficit?', a: 'The estimate divides the weekly calorie deficit by an energy density approximation — 7,700 kcal/kg or 3,500 kcal/lb. A 500 kcal/day deficit produces a weekly deficit of 3,500 kcal, translating to approximately 0.455 kg or 1.00 lb per week. This is a linear approximation; actual weekly change varies due to water balance, glycogen stores, the composition of tissue being drawn upon, and metabolic adaptation over time.' },
      { q: 'Why do two people with the same deficit often see different rates of change?', a: 'The formula assumes a fixed energy density for the tissue being drawn upon, but that composition varies by person. Someone drawing primarily from fat stores loses roughly 7,700 kcal worth of energy per kilogram; someone losing a mix of fat and lean tissue loses fewer calories per kilogram because muscle contains more water and less stored energy than fat. Hormonal factors, sleep quality, metabolic rate, and prior dieting history also influence the actual rate.' },
      { q: 'Is a larger deficit always faster?', a: 'A larger deficit produces a faster estimated rate on paper, but the relationship is not linear in practice. Beyond certain thresholds, larger deficits increase the proportion of lean mass loss, slow metabolic rate through adaptation, and affect energy availability for daily functioning. What constitutes a large or small deficit depends on individual starting point, body composition, and health status — factors the formula does not capture.' },
      { q: 'What does the "Aggressive" (−750 kcal/day) option represent?', a: 'At −750 kcal/day, the weekly energy deficit is 5,250 kcal, which the formula estimates as approximately 0.68 kg or 1.50 lb per week. What this represents as a fraction of total intake varies significantly by individual TDEE: for someone maintaining at 2,500 kcal/day, −750 kcal/day is 30% below maintenance; for someone at 1,500 kcal/day, it is 50% below. The labels describe the calorie delta, not individual suitability.' },
    ],
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
    faq: [
      { q: 'What is the difference between BMR and TDEE?', a: 'BMR (Basal Metabolic Rate) is the energy the body uses at complete rest — the minimum to sustain organ function, circulation, and temperature regulation. TDEE adds the energy cost of all daily activity on top of BMR. For most people, BMR makes up 60–75% of TDEE. The activity multiplier converts BMR to TDEE by estimating how much additional energy typical movement patterns require above the resting baseline.' },
      { q: 'Why does the Mifflin-St Jeor formula require sex as an input?', a: 'The sex input adjusts for population-level differences in body composition. On average, male bodies carry a higher proportion of lean muscle mass relative to fat mass than female bodies at the same weight and height. Lean tissue has a higher metabolic rate than fat tissue, which is why the male formula constant (+5) is higher than the female constant (−161). These are statistical population averages — individual metabolic rates vary considerably around these figures.' },
      { q: 'How accurate are TDEE estimates?', a: 'Formula-based TDEE estimates are population averages, not individual measurements. Studies have found that Mifflin-St Jeor estimates are within roughly ±10–15% of measured values for most people — meaning actual TDEE may be noticeably higher or lower than calculated. Factors the formula cannot capture include lean mass proportion, metabolic adaptation, hormonal state, medications, and genetics. The figure is most useful as a starting reference point rather than a precise target.' },
      { q: 'Why does changing the activity level make such a large difference?', a: 'The activity multiplier spans from ×1.2 (sedentary) to ×1.9 (extra active), a range that can account for up to a 58% difference in total energy expenditure. A person with a BMR of 1,500 kcal/day has a TDEE of 1,800 if sedentary and 2,850 if extra active — a 1,050 kcal difference from activity alone. Selecting the most representative activity level is therefore the single most impactful input in the calculation.' },
    ],
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
    faq: [
      { q: 'What\'s the difference between weighted and unweighted GPA?', a: 'An unweighted GPA uses the same 4.0 maximum regardless of course difficulty. A weighted GPA awards extra grade points for advanced courses — AP or IB classes typically use a 5.0 maximum, so an A earns 5.0 instead of 4.0. This calculator supports both 4.0 and 5.0 scales. Note that colleges commonly recalculate GPA on their own scale when reviewing applications, so your transcript\'s weighted figure may differ from what admissions offices use.' },
      { q: 'How do I calculate cumulative GPA across multiple semesters?', a: 'Enter all courses from all semesters into the calculator to get the correct cumulative figure — do not average your semester GPAs separately. Averaging semester GPAs gives the wrong result when semesters have unequal credit loads, because it treats a 12-credit semester and an 18-credit semester as equally weighted. The GPA formula weights each course by its credit hours, so the only correct method sums all quality points and divides by all credits.' },
      { q: 'Does a Pass/Fail class affect GPA?', a: 'A Pass grade typically does not affect GPA — it contributes credit hours toward graduation but adds no quality points to the GPA calculation, leaving the average unchanged. A Fail grade, depending on institution policy, may be counted as 0.0 and pull the GPA down, or may also be excluded. Policies vary significantly between schools, so check your institution\'s academic regulations before assuming a Pass/Fail course is GPA-neutral.' },
      { q: 'What GPA is considered good?', a: 'Context matters more than any universal threshold. A 3.0 (B average) is commonly the minimum for many scholarships and graduate program eligibility. A 3.5 or higher typically qualifies for academic honours. In highly competitive graduate programs such as medicine, law, or top MBA programmes, the median admitted GPA is often above 3.7. For most employers, GPA requirements apply mainly to entry-level roles and typically use 3.0 as a cutoff.' },
    ],
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
    faq: [
      { q: 'What is UTC and why is it the universal reference point?', a: 'UTC (Coordinated Universal Time) is the primary time standard by which all world clocks are regulated. It replaced GMT as the international standard in 1972, though for most purposes the two are indistinguishable. UTC is defined by atomic clocks and is the same everywhere on Earth — all other timezones are expressed as UTC+ or UTC− offsets, making it the natural hub for any timezone conversion.' },
      { q: 'Why might a timezone converter give different results for the same conversion at different times of year?', a: 'Because of Daylight Saving Time. When a location observes DST, its UTC offset changes by one hour on a specific date each year. Converting 3:00 PM New York to London in January gives a different result than in July, because New York is at UTC−5 in January (EST) and UTC−4 in July (EDT). A converter that uses a static "New York = UTC−5" offset will be wrong for half the year.' },
      { q: 'Does every country observe Daylight Saving Time?', a: 'No. Many countries do not observe DST at all — India (UTC+5:30), China (UTC+8), Japan (UTC+9), and most equatorial nations have fixed year-round offsets. Some countries have abolished DST in recent decades. Within the same country, regions can differ: Arizona does not observe DST while most of the US does, keeping Phoenix at MST (UTC−7) year-round.' },
      { q: 'Why do some timezone offsets include 30 or 45 minutes?', a: 'Most timezones were originally defined to reflect local solar time, and some locations sit at longitudes that fall between whole-hour increments. India and Sri Lanka (UTC+5:30) are the largest examples. Nepal (UTC+5:45) and Chatham Islands, New Zealand (UTC+12:45) are further examples. These reflect deliberate decisions to align civil time with solar noon rather than rounding to the nearest hour.' },
    ],
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
    faq: [
      { q: 'Why is 1 inch exactly 2.54 cm?', a: 'The International Yard and Pound Agreement of 1959, signed by the United States, United Kingdom, Canada, Australia, New Zealand, and South Africa, redefined the inch as exactly 2.54 cm (25.4 mm). Before this agreement, the US survey inch and the UK inch differed by about 2 parts per million — enough to matter in surveying. The 1959 definition eliminated that discrepancy and made all inch–metric conversions exact rather than approximate.' },
      { q: 'What\'s the difference between mass and weight in unit conversion?', a: 'Mass measures the amount of matter in an object (kilograms, grams, pounds) and is constant regardless of gravity. Weight measures gravitational force on an object (newtons) and varies — you weigh less on the Moon but your mass is the same. In everyday use, \'weight\' almost always means mass, and the units labelled as weight (pounds, kilograms) are technically mass units. The distinction only matters in physics and engineering; for a luggage scale or a recipe, mass is what\'s being measured.' },
      { q: 'How do temperature conversions differ from other conversions?', a: 'Most unit conversions are pure multiplications by a constant — you can reverse them by dividing by the same factor. Celsius-to-Fahrenheit includes an addition (°F = °C × 9/5 + 32), making it linear but not proportional: you cannot simply multiply a temperature reading by a ratio. Kelvin avoids this: it starts at absolute zero, so Celsius-to-Kelvin is a pure addition (K = °C + 273.15) with no multiplier, making Kelvin calculations cleaner in physics.' },
      { q: 'Are metric conversions always exact?', a: 'Conversions between metric units are always exact — the system was designed around powers of 10. 1 km = exactly 1,000 m; 1 mg = exactly 0.001 g. Conversions from metric to US customary are also exact using the post-1959 definitions (1 inch = exactly 2.54 cm; 1 pound = exactly 453.59237 g), but when the result is displayed to a limited number of decimal places, rounding introduces a small representational error — the underlying conversion is still exact.' },
    ],
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
    faq: [
      { q: 'Why do different word counters give different counts?', a: 'Each tool decides how to handle edge cases: hyphenated words, contractions, em dashes used as joiners, repeated whitespace, leading/trailing spaces, and punctuation attached to words. There is no universal standard. For most text the differences are small — usually 1–3 words — but they compound on longer documents. If a specific count matters for a submission, check which tool the target platform uses to count.' },
      { q: 'Does a hyphenated word count as one word or two?', a: 'It depends on the tool. This counter treats the entire hyphenated string as one word because it splits on whitespace only — "well-known" contains no spaces, so it counts as 1. Microsoft Word also counts hyphenated compounds as one word. Some other tools split on hyphens and count each part separately, making "well-known" count as 2. The distinction usually matters only when you are very close to a hard word limit.' },
      { q: 'What\'s a typical word count for different types of writing?', a: 'A tweet is under 280 characters (roughly 40–50 words). A short-form blog post runs 500–800 words; a standard long-form article is 1,500–2,500 words. A college application essay is typically 500–650 words. A short story is usually 1,000–7,500 words; a novel starts at around 40,000 words. For academic work, a standard double-spaced page of 12pt text holds approximately 250–300 words.' },
      { q: 'How is reading time estimated from word count?', a: 'Reading time is word count divided by an assumed reading speed in words per minute (wpm). The typical adult silent reading speed for non-fiction prose is 200–250 wpm; this tool uses 200 wpm for a conservative estimate. Actual speed varies with text complexity and the reader\'s purpose — skimming is faster, careful technical reading is slower. For spoken audio or video scripts, use 130–150 wpm as the baseline instead of 200.' },
    ],
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
    faq: [
      { q: 'What\'s the difference between complementary and analogous colors?', a: 'Complementary colors are directly opposite each other on the color wheel — 180° apart. They maximize contrast and make each other appear more vivid when placed side by side. Analogous colors are adjacent on the wheel, within about 60° of each other, sharing similar hues for a harmonious, low-tension look. Complementary schemes suit contrast-driven design; analogous schemes suit cohesive, subtle palettes.' },
      { q: 'How many colors should a well-designed palette have?', a: 'Most design systems work with 3 to 5 colors: a primary, a secondary or accent, and one or two neutrals. Going beyond 5 colors without a clear organizational system tends to create visual noise. This generator always produces 5 colors per scheme, but you don\'t have to use all five — choose the two or three that best serve your specific design need.' },
      { q: 'What is the difference between HSL, RGB, and Hex?', a: 'All three formats describe the same color differently. Hex (#RRGGBB) encodes red, green, and blue as a six-character hexadecimal string — the most common format in web design. RGB expresses the same three channels as decimal values from 0 to 255. HSL (Hue, Saturation, Lightness) is more intuitive for designers: hue as a degree on the color wheel, saturation as intensity, and lightness as how bright or dark the color is.' },
      { q: 'How do I choose a good base color?', a: 'Start with the most distinctive color in your brand or subject matter. Avoid near-neutral bases with very low saturation — harmony schemes operate on hue angle, so a grey or near-white base produces a palette of near-greys regardless of which scheme you pick. To anchor a palette in a mood, map it roughly: blues and greens for calm or trust, reds and oranges for energy or urgency, purples for creativity or depth.' },
    ],
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
    faq: [
      { q: 'What\'s the difference between a linear and radial gradient?', a: 'A linear gradient draws the transition along a straight line at a specified angle — the blending runs parallel to that line from edge to edge. A radial gradient draws the transition outward from a central point in all directions; this tool uses the \'circle\' shape, meaning the gradient expands uniformly. Radial gradients work well for spotlight or vignette effects; linear gradients for directional color washes.' },
      { q: 'How does the angle value work in a linear gradient?', a: 'The angle specifies the direction the gradient flows, measured clockwise from the top: 0° points upward (first color at bottom), 90° points right (first color at left), 180° points downward (first color at top), 270° points left (first color at right). Intermediate values create diagonal gradients. The tool\'s default of 135° flows from top-left toward bottom-right.' },
      { q: 'Can I use more than two colors?', a: 'Yes — "Add stop" inserts a new color stop at the midpoint of the largest existing gap, and there is no hard limit on the number of stops. Each stop has its own color and position percentage. You can create multi-step gradients with abrupt boundaries (stops placed very close together), smooth multi-color blends, or rainbow-style transitions by placing stops at evenly spaced intervals.' },
      { q: 'Why does a gradient sometimes look banded or stepped instead of smooth?', a: 'Gradient banding occurs when the color range being interpolated contains fewer distinct values than there are pixels to fill. Most monitors display 8 bits per channel (256 levels per R, G, B), so a very subtle gradient spanning a narrow color range across many pixels can exhaust distinct RGB values before reaching the far edge — producing visible steps. Banding is most common in low-contrast gradients (nearly identical shades of the same hue) on large surfaces. Widening the color range or adding slight noise can reduce it.' },
    ],
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
    faq: [
      { q: 'What is a hash used for in practice?', a: 'The most common everyday use is file integrity checking — software providers publish the SHA-256 hash of their installer so you can verify your download was not corrupted or tampered with. In development, hashes power cache invalidation, content-addressable storage (Git uses SHA hashes to identify every commit and file), and deduplication systems that identify identical files without reading their full contents.' },
      { q: 'Is MD5 still secure?', a: 'MD5 is no longer considered secure for any application where collision resistance matters. Researchers demonstrated practical MD5 collisions in 2004, meaning two different inputs can produce the same digest — which breaks any system relying on hash uniqueness for security. For security-sensitive uses such as digital signatures or password storage, use SHA-256 or stronger. MD5 remains widely used for non-security checksums where collision resistance is not a concern.' },
      { q: 'Can a hash be reversed to recover the original input?', a: 'No — hash functions are designed to be irreversible. There is no algorithm that converts a digest back to its original input because the function deliberately discards information during calculation. What attackers do instead is search for matching inputs: precomputed tables contain millions of common strings and their hashes. Password systems counter this by adding a random value called a salt to each input before hashing, making those tables useless.' },
      { q: 'Why does the same input always produce the same hash?', a: 'Hash functions are deterministic by design — the output depends entirely on the input, with no randomness involved. Every step of the algorithm uses the same operations and constants every time. This predictability is a feature: it is what makes hashes useful for comparison. Two parties can each hash the same file independently and confirm they have identical copies just by comparing the short digests, without ever transferring the files themselves.' },
    ],
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
    faq: [
      { q: 'How much data can a QR code hold?', a: 'Capacity depends on the data type and error correction level. At the lowest error correction level (L), a QR code holds up to 7,089 numeric characters, 4,296 alphanumeric characters, or 2,953 bytes of binary data (covering URLs, text, and most everyday content). At the highest error correction level (H), capacity drops significantly because more of the code is reserved for redundancy rather than data. Most real-world QR codes are well below the maximum capacity.' },
      { q: 'Why do some QR codes still work when partially covered or damaged?', a: 'QR codes use Reed–Solomon error correction, a mathematical technique that lets the scanner reconstruct missing data even when parts of the code are obscured, dirty, or physically damaged. The amount of damage a code tolerates depends on the error correction level set at generation: level L handles ~7% damage, level M ~15%, level Q ~25%, and level H ~30%. Branded QR codes with logos in the center take advantage of this — the logo covers some modules, but enough redundant data remains to reconstruct the full content.' },
      { q: 'What\'s the difference between static and dynamic QR codes?', a: 'A static QR code encodes its destination directly — the URL or text is baked into the pattern itself and cannot be changed after generation. A dynamic QR code encodes a short redirect URL managed by a third-party service; scanning hits that redirect, which forwards to the real destination. Dynamic codes let you change the destination after printing and track scan counts. This tool generates static QR codes — the full content is embedded directly in the code with no redirect and no tracking.' },
      { q: 'Can QR codes contain viruses or malware?', a: 'A QR code is just encoded data — it cannot execute code, carry a virus, or infect a device on its own. The risk is indirect: a malicious QR code can encode a URL that points to a phishing site or triggers a harmful download when you open it in a browser. The QR code is the delivery mechanism for the URL, not the threat itself. The same rule applies as with any link: check the URL your browser shows before proceeding, especially with QR codes in unexpected locations such as stickers placed over legitimate codes in public spaces.' },
    ],
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
    faq: [
      { q: 'What phone number format does the link require?', a: 'The number must be in international format — country code followed by the subscriber number, with no plus sign, spaces, dashes, or parentheses. This tool builds the correct format automatically: select the country (which provides the dial code), enter the local number, and the tool combines and cleans them. Local trunk prefixes like a leading 0 are removed because they are not part of the international number.' },
      { q: 'Does the recipient need to have my number saved to receive the message?', a: 'No. The wa.me link opens a new WhatsApp conversation with the specified number without requiring either party to have the other saved as a contact. The recipient sees the sender\'s number (or profile name if they happen to have it saved) and can respond normally. This is one of the primary advantages of the wa.me format over sharing a plain phone number.' },
      { q: 'Can I pre-fill a message that opens automatically?', a: 'Yes. Text entered in the Welcome Message field is URL-encoded and appended as a ?text= query parameter. When the link is opened, WhatsApp pre-populates the message compose box with that text — but the sender must still tap Send. The message is not transmitted automatically; it is a starting prompt the sender can edit or delete before sending.' },
      { q: 'What happens if the recipient doesn\'t have WhatsApp installed?', a: 'On a device without WhatsApp, opening a wa.me link typically redirects to the WhatsApp download page or the WhatsApp Web interface. On mobile, the user is prompted to install the app. On desktop, wa.me links open WhatsApp Web in the browser if the user has an account linked; otherwise they see a QR code to link a device. The link does not function as a standard call or SMS fallback.' },
    ],
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
    faq: [
      { q: 'Why does my signature look different in Outlook than in Gmail?', a: 'The two clients use fundamentally different rendering engines. Gmail uses a browser-based renderer but strips <style> blocks from received messages, so only inline styles survive. Outlook on Windows uses Microsoft Word\'s HTML engine — not a browser — which has limited CSS support, handles table and image sizing differently, and ignores many standard properties. Table-based layouts with inline styles are the lowest common denominator that works in both.' },
      { q: 'Why shouldn\'t I use custom or web fonts in an email signature?', a: 'Web fonts (loaded via @font-face or Google Fonts) require a network request and CSS parsing that most email clients do not support. Gmail, Outlook, and Apple Mail either fall back to a system font or ignore the font declaration entirely. Web-safe fonts — Arial, Helvetica, Georgia, Times New Roman — are pre-installed on Windows, macOS, iOS, and Android, making them the only fonts that render reliably across clients without fallback surprises.' },
      { q: 'Should I use an image or text for my signature?', a: 'Text-based signatures are strongly preferable for professional email. Image-based signatures — a single graphic containing all contact info — are often blocked by clients that disable remote images by default, leaving recipients with a blank space. Text with inline styles is always visible, is searchable, allows hyperlinks to work natively, and passes through spam filters more cleanly than image-heavy HTML.' },
      { q: 'What size should an email signature be?', a: 'There is no enforced limit, but common guidance from email infrastructure providers suggests keeping signature HTML under approximately 10 KB and avoiding large embedded images. Larger signatures increase message size, slow rendering on mobile, and can trigger spam scoring. The signatures generated here are typically under 2 KB of HTML — lightweight because they use table markup with inline styles rather than embedded images or base64-encoded assets.' },
    ],
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
    faq: [
      { q: 'Does the countdown account for my time zone?', a: 'Yes. When you pick a date and time using the input, those values are interpreted in your device\'s local time zone. A target of \'December 31, 11:59 PM\' is stored as midnight UTC−5 if your device is in EST — not as midnight UTC. The epoch-based storage means the countdown is always counting down to the same absolute moment in time, correctly converted to local time for every viewer.' },
      { q: 'What happens after the countdown reaches zero?', a: 'When the current time passes the target epoch, the numeric countdown is replaced with a completion message. The timer continues checking every second, so there is no delay between the moment the target is reached and the display switching. The countdown does not loop or reset automatically — it simply holds the completion state until you set a new target.' },
      { q: 'Can I use this for a recurring annual event like a birthday?', a: 'The countdown tracks a specific absolute date and time, not a recurring pattern. For an annual event, set the target to the next upcoming occurrence. After the countdown completes, clear it and set a new target for the following year\'s date. There is no repeat or recurrence setting — each countdown is a single, fixed moment in time.' },
      { q: 'Why might this countdown differ by a few hours from another site for the same event?', a: 'The most common cause is timezone interpretation. If you enter \'midnight\' on a target date in UTC−5, this tool stores 05:00 UTC as the target. Another site storing the datetime string \'00:00\' without timezone context may interpret it as midnight UTC, midnight in the viewer\'s local zone, or midnight in the server\'s timezone — potentially differing by several hours. The shareable link from this tool always encodes the exact epoch, eliminating that ambiguity.' },
    ],
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
    faq: [
      { q: 'How long should a password be?', a: 'Length is the single largest contributor to entropy. A 16-character password from the full 88-character pool (103.4 bits) is highly resistant to brute-force attack by any practical computing resource. NIST guidelines (SP 800-63B) emphasize length over complexity; a 20-character password from even a smaller character set provides more entropy than a short complex one.' },
      { q: 'Does adding special characters actually help?', a: 'Yes, but less than adding length. Expanding from lowercase-only (26 chars, 4.70 bits/char) to the full 88-character pool (6.46 bits/char) is a 37% increase per character. Adding one more character to the password adds the full 6.46 bits — equivalent to more than doubling the character set. Both help, but length scales linearly while character set size has diminishing returns once the pool is reasonably large.' },
      { q: 'What is password entropy?', a: 'Entropy, measured in bits, describes how unpredictable a password is, assuming the attacker knows the generation method (length and character set) but not the specific password. Each additional bit of entropy doubles the number of guesses required. At 103.4 bits, the number of possible 16-character passwords from this tool\'s pool is 2^103.4 ≈ 1.34 × 10³¹ — beyond the reach of any foreseeable exhaustive search.' },
      { q: 'Should I use a password manager instead of memorizing passwords?', a: 'For most people, yes. Password managers store, recall, and often generate passwords, meaning each account can have a unique, fully random password without memorization. The security model shifts to protecting one strong master password rather than many weaker ones. The passwords this tool generates are intentionally designed to be unmemorizable; saving them immediately to a password manager is the intended workflow.' },
    ],
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
    faq: [
      { q: 'Why does the days count differ from years × 365?', a: 'Calendar years and months are not uniform in length. Leap years add a day every four years (with century-year exceptions), and months range from 28 to 31 days. A span of exactly \'2 years\' can be 730 days (no leap year) or 731 days (one leap year). The total days figure is computed directly from the millisecond difference between the two dates, making it always exact regardless of which years and months the span crosses.' },
      { q: 'Can I calculate the difference between a past and a future date?', a: 'Yes. The start date can be any valid calendar date and the end date can be any date on or after it — there is no restriction on whether the dates are in the past, present, or future. Calculating how many days remain until a future event, or how many days have elapsed since a past event, uses exactly the same calculation. The calculator simply measures the distance between the two chosen dates.' },
      { q: 'Does the calculator count business days or only calendar days?', a: 'This calculator counts calendar days only — every day including weekends and public holidays. It has no knowledge of weekday vs. weekend distinctions or public holiday calendars for any country or region. For contract notice periods or payment terms specified in \'business days,\' you would need to manually subtract the number of weekends and holidays within the span from the total days figure.' },
      { q: 'Why might two date calculators give slightly different results for years/months/days?', a: 'The raw total days count is unambiguous — any correct implementation will match. The years/months/days breakdown involves a judgment call about how to handle the borrow when a month boundary is crossed: specifically, how many days to attribute to the \'previous month\' when the end day is earlier than the start day. Different calculators resolve this edge case differently, producing results that may differ by 1–2 days in the remaining-days figure while agreeing on the total days count.' },
    ],
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
    faq: [
      { q: 'Why aren\'t two successive discounts the same as their sum?', a: 'Each discount applies to the price as it stands at that moment, not the original. A 20% discount on $200 saves $40, leaving $160. A 10% discount on that $160 saves $16 — not $20 — because the base is now smaller. Two discounts of r1 and r2 have an effective combined rate of 1 − (1 − r1)(1 − r2), not r1 + r2. A 20% + 10% stack removes 28% overall, not 30%.' },
      { q: 'How do I find the original price when only the sale price is known?', a: 'Divide the sale price by (1 − discount rate as a decimal). If an item costs $63 after a 30% discount, the original was $63 ÷ 0.70 = $90.00. A common mistake is dividing by the discount percentage itself ($63 ÷ 0.30 = $210 — wrong). Always divide by the fraction that remains after the discount, not the fraction that was removed.' },
      { q: 'What is the difference between a discount and a markdown?', a: 'A discount is a temporary price reduction — a sale, coupon, or promotional offer — after which the price returns to its original level. A markdown is a permanent reduction, typically used in retail to clear inventory that isn\'t selling at the original price. Both reduce the selling price below the original, but a markdown becomes the new permanent price point.' },
      { q: 'How do I calculate the final price with tax after a discount?', a: 'Apply the discount first, then add tax to the discounted price — not the original. On a $90 item at 30% off (sale price $63.00), an 8% sales tax adds $63 × 0.08 = $5.04, giving a final total of $68.04. Applying tax to the pre-discount price and then discounting produces a different, incorrect result. In most jurisdictions, tax is calculated on the price actually paid.' },
    ],
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
    faq: [
      { q: 'What\'s the difference between simple and compound interest?', a: 'Simple interest is computed on the principal alone every period. Compound interest is computed on the principal plus all previously accumulated interest. On a $10,000 balance at 7% over 20 years, simple interest produces $14,000 in earnings; monthly compound interest produces $30,387 — more than twice as much from the same nominal rate.' },
      { q: 'Does more frequent compounding always mean more money?', a: 'Yes, when the nominal rate is identical. Interest that is added more often starts earning its own interest sooner, which raises the effective yield. The gap between monthly and daily compounding is small, but the difference between annual and monthly compounding on the same stated rate produces a measurably higher balance over long periods.' },
      { q: 'How is compound interest different from APY?', a: 'APY (Annual Percentage Yield) is the real return you receive in one year once compounding is applied. A 6% rate compounded monthly has an APY of 6.168% — that extra 0.168 percentage point is the compounding effect. When comparing savings accounts, always compare APY rather than the stated rate, since it puts different compounding frequencies on equal footing.' },
      { q: 'Can compound interest work against me?', a: 'Yes — any compounding debt works against you the same way a savings account works for you. Credit card balances at 20–25% APR compound daily, meaning unpaid interest is added to your balance each day and the next charge is slightly larger. A $3,000 balance at 22% APR with only minimum payments can take over a decade to clear and cost more than $2,000 in total interest.' },
    ],
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
    faq: [
      { q: 'Why does more of my early payment go to interest?', a: 'Interest is calculated as a percentage of the outstanding balance. At the start of a loan, that balance is at its highest, so the interest charge is largest. As monthly payments chip away at the principal, the balance falls, the monthly interest charge falls with it, and a progressively larger share of each EMI goes toward principal. This is why paying extra in the early months — when the balance is highest — has the largest impact on total interest paid over the life of the loan.' },
      { q: 'How does loan tenure affect total interest paid?', a: 'A longer tenure reduces your monthly EMI but dramatically increases the total interest you pay, because each month\'s charge compounds against a balance that shrinks more slowly. On a $200,000 loan at 8%, a 20-year tenure costs $201,491 in total interest; a 10-year tenure costs $91,186 — less than half the interest — while the EMI rises by only $754 per month. The longer the loan, the higher the total interest multiplier.' },
      { q: 'What happens if I make an extra payment?', a: 'An extra payment goes entirely toward principal, reducing the outstanding balance immediately. Because interest is calculated on the remaining balance each month, a lower balance means less interest charged in every subsequent month, shortening the loan term and reducing the total interest paid. Most standard loans allow extra payments without penalty, but confirm this with your lender — some agreements include prepayment clauses that may limit early repayment.' },
      { q: 'How is EMI different from a simple monthly instalment?', a: 'A simple instalment loan divides the principal equally across all months and adds interest only on the remaining balance each month — meaning the payment decreases over time as the balance falls. An EMI is a fixed, constant payment designed so that equal monthly amounts fully repay both principal and interest by the end of the term. EMI is easier to budget for because the payment never changes; simple instalments cost more in the early months but decrease as the loan progresses.' },
    ],
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
    faq: [
      { q: 'What does PITI stand for and why does it matter?', a: 'PITI stands for Principal, Interest, Taxes, and Insurance — the four components of a full monthly mortgage payment. Lenders use total PITI as the benchmark for affordability: most conventional lenders prefer that PITI not exceed 28–31% of gross monthly income. Quoting only the P&I portion significantly underestimates the true monthly cost, particularly in high-tax areas where property tax alone can add hundreds of dollars per month.' },
      { q: 'When can I stop paying PMI?', a: 'PMI is typically required until your loan balance reaches 80% of the home\'s original purchase price — the point at which you have 20% equity. Under the US Homeowners Protection Act, you can request cancellation once the balance reaches 80% per the original amortisation schedule. Lenders must cancel PMI automatically when the balance reaches 78%. If the home has appreciated, an appraisal confirming at least 20% equity may allow earlier cancellation.' },
      { q: 'How does a larger down payment reduce total cost?', a: 'A larger down payment reduces the loan amount directly, which lowers both the monthly payment and total interest paid. It also eliminates PMI once the down payment reaches 20%. Going from 10% to 20% down on a $400,000 home reduces the loan by $40,000, eliminates $150 per month in PMI, and reduces total interest paid over 30 years by approximately $51,018 at 6.5%.' },
      { q: 'What\'s the difference between a 15-year and 30-year mortgage?', a: 'A 30-year mortgage has a lower monthly payment but pays substantially more interest over the life of the loan. On a $320,000 loan at 6.5%, the 30-year monthly P&I is $2,022.62 and total interest is $408,142; the 15-year monthly P&I is $2,787.54 — about $765 more per month — but total interest is only $181,758, saving $226,384 over the life of the loan. The right choice depends on monthly cash flow, how long you plan to hold the home, and the opportunity cost of the extra monthly payment.' },
    ],
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
    faq: [
      { q: 'Should I tip on the pre-tax or post-tax amount?', a: 'Both conventions exist. Tipping on the pre-tax subtotal is technically the standard in many American etiquette guides, since the tax goes to the government rather than the server. Tipping on the post-tax total is simpler and more common in practice. On a $100 pre-tax bill with 8% tax, the difference between 18% pre-tax ($18.00) and post-tax ($19.44) is $1.44. Most service workers receive either amount graciously — the choice is the payer\'s.' },
      { q: 'What\'s a standard tip percentage?', a: 'Conventions vary by country and venue type. In the US, 15% was the traditional restaurant baseline; 20% has become more common and is now the informal standard in many cities. For coffee shop counter service, 0–15% is typical. Outside the US, conventions differ substantially — in many European countries tips of 5–10% are appreciated but not expected; in Japan, tipping is generally not practised.' },
      { q: 'How do I handle an uneven split where people ordered different amounts?', a: 'This calculator divides the grand total equally. For an uneven split, calculate each person\'s share of the pre-tip subtotal first, apply the tip percentage to each individual subtotal, then sum. For example, if Person A ordered $40 and Person B ordered $60 on a $100 bill, a 20% tip allocates $8 to A (total: $48) and $12 to B (total: $72), rather than splitting $24 equally.' },
      { q: 'How do I calculate a tip when the bill already includes a service charge?', a: 'Check whether the listed charge is a mandatory service fee or a suggested gratuity. Many restaurants add an automatic gratuity (often 18–20%) for large parties — in that case the tip is already included. If a service charge is labelled as a \'service fee\' that goes to the establishment rather than the staff, some diners choose to add a separate tip. Asking the staff how the charge is distributed is the most reliable approach.' },
    ],
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
    faq: [
      { q: 'What\'s the difference between camelCase and PascalCase?', a: 'Both join words without spaces or punctuation, but they differ in the first word: camelCase starts with a lowercase letter (userProfileData), while PascalCase capitalises the first letter of every word including the first (UserProfileData). In most languages, camelCase is used for variables and functions; PascalCase is reserved for class names, types, and components. React component names must be PascalCase — a component named userCard instead of UserCard will not render correctly in JSX.' },
      { q: 'When should I use Title Case vs. Sentence case?', a: 'Title Case capitalises the first letter of every word and is traditional in book and article titles, especially in American English publishing (AP and Chicago style). Sentence case capitalises only the first word and is increasingly preferred in digital products and design systems — Google, Apple, and Microsoft all use Sentence case for UI text. For blog posts and marketing copy, the right choice depends on your house style; for UI labels and buttons, Sentence case is the modern standard.' },
      { q: 'Does Title Case capitalise every word?', a: 'The \'capitalise every word\' rule is the simple version. Proper typographic Title Case skips short function words: articles (a, an, the), coordinating conjunctions (and, but, or, nor), and short prepositions (in, on, at, to, of, by, as). The first and last words of the title are always capitalised regardless of their type. So \'The Catcher in the Rye\' is correct; \'The Catcher In The Rye\' is over-capitalised. This tool applies the simpler every-word rule for predictability.' },
      { q: 'Why do programming languages use snake_case or kebab-case instead of spaces?', a: 'Spaces are not valid in identifiers in any mainstream programming language — a variable named \'user name\' would be parsed as two separate tokens and cause a syntax error. Developers needed a way to write multi-word names as a single token. Two conventions emerged: underscores (snake_case, used in Python, C, Ruby, and SQL) and capitalised word boundaries (camelCase and PascalCase, used in Java, JavaScript, and C#). Kebab-case uses hyphens and is standard in CSS and URLs, where hyphens are valid and improve readability.' },
    ],
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
    faq: [
      { q: 'Why is 4 written as IV and not IIII?', a: 'Subtractive notation was adopted to avoid repeating the same symbol more than three times consecutively. The rule is that I, X, C, and M can each appear at most three times in a row in additive position — so 4 must be IV rather than IIII. Some clock faces still use IIII (a historical holdover for visual balance opposite the VIII on the right), but IIII is not standard modern Roman numeral notation.' },
      { q: 'What is the largest number Roman numerals can represent?', a: 'Using the standard seven symbols, the maximum is 3,999 — written MMMCMXCIX. M can appear at most three times additively, and CM (900) is the largest subtractive pair available, giving no way to express 4,000 or above without extensions. Some historical systems used a bar over a numeral to multiply it by 1,000 (M̄ = 1,000,000), but those are not part of the modern standard this converter uses.' },
      { q: 'Did Romans have a symbol for zero?', a: 'No. Roman numerals have no symbol for zero, which is a fundamental structural difference from the Hindu-Arabic (0–9) positional system. The Latin word "nulla" (nothing) was used in writing, but there was no numeral for it. This absence made arithmetic operations — especially multiplication and division — significantly harder, which is one reason the Hindu-Arabic system eventually replaced Roman numerals for calculation throughout Europe.' },
      { q: 'How do you write repeating numerals like 3 or 30?', a: 'Additive repetition: 3 is III (1+1+1), 30 is XXX (10+10+10), 300 is CCC (100+100+100). The limit is three consecutive identical symbols in additive position. When you need four of the same value, switch to subtractive notation using the next larger symbol: 4 is IV, 40 is XL, 400 is CD — never IIII, XXXX, or CCCC.' },
    ],
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
    faq: [
      { q: 'What does Lorem ipsum actually say?', a: 'The Lorem ipsum passage is a scrambled excerpt from Cicero\'s De Finibus Bonorum et Malorum, which discusses pleasure and pain as criteria for moral action — Epicurean philosophy. The scrambled version retains the visual rhythm and character distribution of Latin prose but does not parse as grammatically correct Latin. It is more accurately described as corrupted Latin derived from real Latin rather than meaningful text.' },
      { q: 'Is Lorem ipsum actual Latin?', a: 'It derives from real Latin but the scrambling means most of the passage is not grammatically correct classical Latin. Some words are genuine (lorem is an accusative form of \'pain\'; ipsum means \'itself\'), but the sentences do not parse correctly. Latin scholars describe it as garbled or corrupted Latin — which is precisely why it works as placeholder text: it reads as convincingly real to most viewers without meaning anything.' },
      { q: 'Why use placeholder text instead of real content?', a: 'Using actual copy from a project as placeholder creates two problems. First, reviewers focus on whether the words are correct rather than whether the layout works. Second, draft content is often confidential or not yet approved, making real text inappropriate for mockups shared beyond the immediate team. Lorem ipsum is universally understood as \'placeholder\' — no context or disclaimer needed.' },
      { q: 'When was Lorem ipsum first used in printing or design?', a: 'Its use in modern publishing dates to Letraset\'s dry-transfer lettering sheets in the 1960s. Its digital adoption began with PageMaker 1.0 in 1985. Before the Letraset era, fragments of classical Latin text appeared in typography specimen books as early as the 16th century to demonstrate typefaces — though the specific scrambled Lorem ipsum passage in its modern form is most reliably traced to the 20th century.' },
    ],
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
    faq: [
      { q: 'Why does computing use binary instead of decimal?', a: 'Digital electronics are built from circuits with two stable states — on and off, represented as 1 and 0. Binary maps directly onto these physical states. Using binary lets hardware be constructed from simple logic gates (AND, OR, NOT) that operate on single bits, making processor design and error detection far more tractable than a decimal equivalent would allow.' },
      { q: 'What is hexadecimal used for in practice?', a: 'Hex is a compact representation of binary: exactly 4 binary digits (a nibble) map to one hex digit, so a full byte (8 bits) is always two hex characters. This makes hex concise where binary would be long. Hex appears in RGB color codes (#FF6B6B), memory dumps, cryptographic hashes (SHA-256 produces 64 hex characters), IPv6 addresses, and Unicode code points (U+1F600).' },
      { q: 'How do I convert binary to hex quickly without going through decimal?', a: 'Split the binary number into groups of 4 bits from the right, then convert each group to its hex digit. Example: binary 1101 0110 → 1101 = 13 = D, 0110 = 6 = 6 → hex D6. This works because 2⁴ = 16, so one hex digit represents exactly one 4-bit nibble. No intermediate decimal step is needed.' },
      { q: 'What is the largest number a given number of bits can represent?', a: 'An n-bit unsigned integer covers 0 to 2ⁿ − 1. For 8 bits: 2⁸ − 1 = 255 (0xFF). For 16 bits: 2¹⁶ − 1 = 65,535 (0xFFFF). For 32 bits: 2³² − 1 = 4,294,967,295 (0xFFFFFFFF). Signed integers split the range: an 8-bit signed integer covers −128 to +127 using two\'s complement representation.' },
    ],
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
    faq: [
      { q: 'How are large numbers named in the short-scale system?', a: 'Each scale word covers a power of 1,000: thousand = 10³, million = 10⁶, billion = 10⁹, trillion = 10¹², quadrillion = 10¹⁵. A number gets its scale word from the highest non-zero group. 1,000,000 is "one million"; 1,001,000 is "one million, one thousand". Every integer maps to exactly one word form by following the grouping rules.' },
      { q: 'What is the difference between the American and British number naming systems?', a: 'Today both use the short scale identically. The historical difference was in the long scale (used in continental Europe and older British English), where "billion" meant 10¹² (a million millions) rather than 10⁹. The UK officially adopted the short scale in 1974. In contemporary American and British English, billion = 10⁹ is unambiguous.' },
      { q: 'How do I write a number in words for a check or legal document?', a: 'Use the capitalised cardinal output: "One thousand, four hundred fifty-two". For check writing, cents are conventionally written as a fraction: "One thousand, four hundred fifty-two and 00/100". The written form is the legally binding value on a check and overrides the numeric figure if there is a discrepancy.' },
      { q: 'Does this tool handle negative numbers or decimals?', a: 'It handles negative integers — the word "negative" is prepended to the written form. It does not convert decimals, because there is no universal convention for how decimal places are spoken in words. For check writing, the decimal portion is written as a fraction (xx/100) rather than as words.' },
    ],
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
    faq: [
      { q: 'What is a UUID used for?', a: 'UUIDs appear as primary keys in databases, API resource identifiers, session IDs, message IDs in event queues, and names for uploaded files. Their value is that they can be generated independently — by any client, server, or device — with no central authority needed to ensure uniqueness. This makes them essential in distributed systems and offline-first apps where coordinating a shared counter is impractical.' },
      { q: 'How likely is a UUID v4 collision?', a: 'With 2¹²² possible values (~5.32 × 10³⁶), the collision probability is vanishingly small. By the birthday paradox approximation, you would need to generate roughly 2.72 × 10¹⁸ UUIDs to reach a 50% chance of any collision — generating one UUID per nanosecond for over 86 years. In practice, UUID v4 collisions are treated as theoretically impossible.' },
      { q: 'What is the difference between UUID v4 and other versions?', a: 'UUID versions differ in how the unique value is derived. Version 1 encodes the current timestamp and the host\'s MAC address — traceable to the generating machine. Versions 3 and 5 are name-based, deterministically generating a UUID from a namespace and a name using MD5 or SHA-1 respectively. Version 4 (this tool) is purely random, making it the preferred choice when traceability is undesirable and collision resistance is sufficient.' },
      { q: 'Are UUIDs the same as GUIDs?', a: 'Yes — GUID (Globally Unique Identifier) is Microsoft\'s term for the same concept and the same 8-4-4-4-12 format. Microsoft Windows, COM, and .NET generate GUIDs; Unix and web standards use UUID. The structure and collision properties are identical. The terms are interchangeable in all practical contexts, though "UUID" appears in the RFC 4122 standard and is preferred in non-Microsoft ecosystems.' },
    ],
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
    faq: [
      { q: 'Is Base64 encoding the same as encryption?', a: 'No. Base64 is encoding, not encryption. It transforms binary data into a text-safe form but provides no confidentiality — anyone who sees the Base64 string can decode it instantly. Encryption transforms data in a way that requires a key to reverse. JWTs, for example, are Base64-encoded but not encrypted by default — their contents are visible to anyone who decodes them.' },
      { q: 'Why does Base64 output sometimes end with = or ==?', a: 'Base64 encodes 3 bytes into 4 characters. When the input length is not a multiple of 3, the final group has 1 or 2 bytes instead of 3. Padding characters (=) bring the output to a multiple of 4: one remaining byte → two == characters; two remaining bytes → one = character. "Man" (3 bytes) needs no padding; "Ma" (2 bytes) gets =; "M" (1 byte) gets ==.' },
      { q: 'Why is Base64 output longer than the input?', a: 'Because 6 bits of binary data are represented as one 8-bit ASCII character. Each 3-byte (24-bit) input group becomes 4 output characters (4 × 8 = 32 bits). The size ratio is exactly 4/3 ≈ 1.333, meaning a 300-byte input produces a 400-character Base64 string. This overhead is the trade-off for compatibility with text-only transport channels.' },
      { q: 'What are the most common real-world uses of Base64 encoding?', a: 'The most frequently encountered uses are: JSON Web Tokens (header and payload are Base64url-encoded JSON), email attachments (MIME encodes binary attachments as Base64 for SMTP transport), data URIs in HTML/CSS (embedding images as src="data:image/png;base64,…"), HTTP Basic Authentication (username:password encoded in Base64 in the Authorization header), and API keys which are often Base64-encoded binary values.' },
    ],
    component: lazy(() => import('@/tools/base64-encoder-decoder')),
  },
  {
    slug: 'currency-converter',
    name: 'Currency Converter',
    shortDescription: 'Convert between currencies using live European Central Bank reference rates.',
    longDescription:
      'Select a source and target currency from a searchable dropdown of ECB-covered currencies, enter an amount, and instantly see the converted value. Rates are fetched from the Frankfurter API (ECB reference data, updated once per business day). The raw exchange rate and the date the rate was published are shown alongside the result.',
    seoTitle: 'Free Currency Converter – Live Exchange Rates | QuickAway',
    seoDescription:
      'Convert between currencies using European Central Bank reference rates via the Frankfurter API — with exchange-rate mechanics explained, ECB update schedule clarified, bank spread vs. mid-market rate difference covered, and honest guidance on when not to rely on reference rates.',
    category: 'Converters',
    faq: [
      { q: 'How often are the rates updated?', a: 'Rates are updated once per business day, sourced from the European Central Bank\'s daily reference rate publication. The ECB typically publishes around 4:00 PM CET on business days. Rates are not updated on weekends or ECB public holidays. The "Rates as of" date shown on every result tells you exactly which day\'s rate is being applied.' },
      { q: 'Are these rates the same as what my bank will give me?', a: 'No. The rates shown here are mid-market reference rates — the midpoint between the buy and sell prices on the interbank market. Banks, credit cards, and currency exchange services apply a margin (commonly called a spread) on top of the mid-market rate, which is how they make money on currency transactions. This margin typically ranges from 1% to 4% for retail customers, though some services advertise rates closer to the mid-market rate.' },
      { q: 'Why do exchange rates change day to day?', a: 'Exchange rates are set by supply and demand in the global forex market. The main drivers of day-to-day changes include central bank interest rate decisions and forward guidance, economic data releases such as inflation figures and employment reports, geopolitical events that affect investor confidence, and shifts in global trade flows.' },
      { q: 'Is this suitable for large financial transactions?', a: 'No. For any transaction where the exact rate matters — large wire transfers, business invoices, property purchases, or investment decisions — obtain a firm quote directly from your bank or a regulated currency broker at the time of the transaction. The reference rates shown here may differ from the rate you actually receive, and the difference on a large sum can be significant.' },
    ],
    component: lazy(() => import('@/tools/currency-converter')),
  },
  {
    slug: 'what-is-my-ip',
    name: 'What Is My IP',
    shortDescription: 'Instantly see your public IP address, browser, OS, and screen resolution.',
    longDescription:
      'Your public IPv4 address is detected automatically on page load via ipify.org — no button press needed. IPv6 is shown if your network supports it. Browser name, operating system, and screen resolution are detected locally in your browser with no additional request. Copy your IP with one click.',
    seoTitle: 'What Is My IP Address? – Find Your Public IP | QuickAway',
    seoDescription:
      'Find your public IPv4 (and IPv6 if supported) address instantly — with the difference between public and private IPs explained, how IP detection actually works disclosed, and honest facts about IP geolocation accuracy covered.',
    category: 'Developer Tools',
    faq: [
      { q: "What's the difference between my public and private IP address?", a: "Your public IP is the address the internet sees — assigned by your ISP and shared by all devices on your network. Your private IP is an internal address assigned by your router, visible only within your local network. The router uses Network Address Translation (NAT) to route traffic between your private devices and the public internet." },
      { q: 'Does this tool store or log my IP address?', a: "QuickAway does not store, log, or process your IP address. ipify.org's server can see your IP as a technical necessity of receiving your request — the same as any website you visit. ipify.org's own privacy policy governs how they handle request data on their end." },
      { q: 'Why does my IP address change sometimes?', a: "Most residential ISPs assign dynamic IP addresses that can change when your router restarts, when your DHCP lease expires, or during ISP network maintenance. If you need a permanently fixed address for hosting a server, a static IP add-on from your ISP or a dynamic DNS service is the right solution." },
      { q: 'Can someone find my exact location from my IP address?', a: "No. IP-based geolocation is approximate. It can typically identify your country reliably and often your city or region — but the city it infers is frequently where your ISP's data centre is located, not where you are. It cannot determine your street address or building. Accuracy degrades further in rural areas and on mobile networks." },
    ],
    component: lazy(() => import('@/tools/what-is-my-ip')),
  },
];
