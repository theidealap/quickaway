// ── Guide section types ───────────────────────────────────────────────────────

export type GuideSectionText = {
  type: 'text';
  heading?: string;
  body: string;
};

export type GuideSectionSteps = {
  type: 'steps';
  heading: string;
  steps: string[];
};

export type GuideSectionExample = {
  type: 'example';
  heading: string;
  scenario: string;
  solution: string[];
};

export type GuideSectionFaq = {
  type: 'faq';
  heading?: string;
  items: Array<{ q: string; a: string }>;
};

export type GuideSectionTip = {
  type: 'tip';
  body: string;
};

export type GuideSectionTable = {
  type: 'table';
  heading: string;
  headers: string[];
  rows: string[][];
  /**
   * Column indices (0-based) that should render in monospace.
   * Omit or leave undefined for all body-font columns.
   */
  monoColumns?: number[];
};

export type GuideSection =
  | GuideSectionText
  | GuideSectionSteps
  | GuideSectionExample
  | GuideSectionFaq
  | GuideSectionTip
  | GuideSectionTable;

// ── Guide entry ───────────────────────────────────────────────────────────────

export interface GuideEntry {
  slug: string;
  title: string;
  /** Short description shown on index cards and in meta tags. */
  description: string;
  /** Keyword-optimised page title for <title> and OG. */
  seoTitle: string;
  /** 140–160 character meta description. */
  seoDescription: string;
  /** Display category label. */
  category: string;
  /** ISO 8601 date of first publication. */
  datePublished: string;
  /** Slugs of tools in toolsRegistry related to this guide. */
  relatedToolSlugs: string[];
  /** Slugs of other guides in this registry related to this guide. */
  relatedGuideSlugs: string[];
  sections: GuideSection[];
}

// ── Registry ──────────────────────────────────────────────────────────────────

export const guidesRegistry: GuideEntry[] = [
  // ─── 1. How to Calculate Age ────────────────────────────────────────────────
  {
    slug: 'how-to-calculate-age',
    title: 'How to Calculate Age',
    description:
      'A complete guide to calculating exact age in years, months, and days — including how to handle leap years and age on a specific date.',
    seoTitle: 'How to Calculate Age – Exact Years, Months & Days | QuickAway',
    seoDescription:
      'Learn how to calculate exact age from a date of birth, step by step. Covers year/month/day breakdown, leap years, and age on a specific past or future date.',
    category: 'Calculators',
    datePublished: '2026-07-22',
    relatedToolSlugs: ['age-calculator', 'date-difference-calculator', 'countdown-to-date'],
    relatedGuideSlugs: ['date-difference-calculator-guide'],
    sections: [
      {
        type: 'text',
        heading: 'Introduction',
        body: 'Calculating someone\'s age sounds simple — just subtract the birth year from today\'s year. But that single subtraction misses a crucial detail: has this year\'s birthday happened yet? If not, the person is still one year younger than that subtraction suggests. Getting the full breakdown — years, months, and days — requires a few more careful steps.',
      },
      {
        type: 'text',
        heading: 'The Core Concept',
        body: 'Age is measured from the most recent occurrence of the birthday, not from the raw year difference. If today is July 22, 2026 and your birthday is October 3, your birthday has not happened yet in 2026, so you are still your 2025 age. The moment October 3 arrives, you gain a year. This "has the birthday passed?" check is the most common source of off-by-one errors in manual calculations.',
      },
      {
        type: 'steps',
        heading: 'How to Calculate Age Step by Step',
        steps: [
          'Write down the current date: day (D₂), month (M₂), and year (Y₂).',
          'Write down the birth date: day (D₁), month (M₁), and year (Y₁).',
          'Start with the year difference: years = Y₂ − Y₁.',
          'Compare today\'s month and day against the birth month and day.',
          'If today\'s month is before the birth month, OR today\'s month equals the birth month but today\'s day is before the birth day — subtract 1 from years (the birthday has not happened yet this year).',
          'To find remaining months: count forward from the last birthday\'s month to today\'s month. If today\'s day is before the birth day, subtract 1 from that month count.',
          'To find remaining days: if today\'s day ≥ birth day, subtract birth day from today\'s day. Otherwise, count back to the end of the previous month and add today\'s day.',
        ],
      },
      {
        type: 'example',
        heading: 'Worked Example',
        scenario: 'Birth date: March 15, 1990. Today: July 22, 2026.',
        solution: [
          'Year difference: 2026 − 1990 = 36.',
          'Has the birthday (March 15) passed? Today is July 22 — July > March, so yes, the birthday has passed.',
          'Years = 36.',
          'Months since last birthday (March 15): March → April → May → June → July = 4 months. Since July 22 ≥ March 15, we do not subtract a month.',
          'Days: 22 − 15 = 7 days.',
          'Result: 36 years, 4 months, 7 days.',
        ],
      },
      {
        type: 'example',
        heading: 'Example Where the Birthday Has Not Passed Yet',
        scenario: 'Birth date: October 3, 1995. Today: July 22, 2026.',
        solution: [
          'Year difference: 2026 − 1995 = 31.',
          'Has the birthday (October 3) passed? Today is July 22 — July < October, so no.',
          'Subtract 1: years = 30.',
          'Months since last birthday (October 3, 2025): October → November → December → January → February → March → April → May → June → July = 9 months. But July 22 < October 3 in day? No — we are measuring from October 3, 2025. October to July is 9 months, and since day 22 < day 3 we subtract 1 month.',
          'Months = 8 (October 3, 2025 → June 3, 2026 = 8 months).',
          'Days: July has 31 days. Days in June after June 3 = 27, plus 22 days in July = 49... Actually: last full month boundary was June 3. From June 3 to July 22 = 19 + 22 = 49 — but standard age uses June 3 as the last boundary: July 22 − June 3 = 19 days.',
          'Result: 30 years, 8 months, 19 days.',
        ],
      },
      {
        type: 'tip',
        body: 'For age on a specific past or future date (not today), use the same steps but substitute that target date for "today". This is useful for historical research, legal age verification on a specific past date, or finding out how old you will be on an upcoming event.',
      },
      {
        type: 'faq',
        heading: 'Frequently Asked Questions',
        items: [
          {
            q: 'Do leap years affect age calculation?',
            a: 'Only if you were born on February 29. In non-leap years, February 29 birthdays are typically celebrated on either February 28 or March 1 depending on jurisdiction. For the purposes of calculating how many full years have passed, most systems count the birthday as having occurred on February 28 in non-leap years.',
          },
          {
            q: 'How do I calculate age in months only?',
            a: 'Multiply the completed years by 12, then add the remaining months. Example: 3 years and 5 months = (3 × 12) + 5 = 41 months. This is useful in paediatric medicine where child development milestones are tracked in total months.',
          },
          {
            q: 'What if I only know the birth year, not the exact date?',
            a: 'You can only calculate an approximate age. Subtract the birth year from the current year to get a rough figure. The actual age could be one year less if the birthday has not yet passed this year, so the true answer is "X or X−1 years old".',
          },
          {
            q: 'How do employers or legal systems calculate age?',
            a: 'Most legal systems count a birthday as completed at the start of the birth date (midnight at the beginning of the day). Age increases by 1 when the birthday is reached each year. Legally, a person turns 18 at the start of their 18th birthday, not at the end.',
          },
          {
            q: 'Why does an online age calculator sometimes show a different result than my manual calculation?',
            a: 'The most common cause is a time zone difference — "today" may differ by a day depending on where the server or browser clock is set. Always verify the date the tool is using. A secondary cause is different conventions for handling month-end dates (e.g. January 31 + 1 month = February 28 or March 3?).',
          },
        ],
      },
    ],
  },

  // ─── 2. Percentage Calculation Guide ────────────────────────────────────────
  {
    slug: 'percentage-calculation-guide',
    title: 'Percentage Calculation Guide',
    description:
      'A practical guide covering the three types of percentage problems: finding a percentage of a number, finding what percentage X is of Y, and calculating percentage change.',
    seoTitle: 'Percentage Calculation Guide – Formulas, Examples & FAQs | QuickAway',
    seoDescription:
      'Master percentage calculations with clear formulas and worked examples. Covers finding X% of Y, what % one number is of another, and percentage increase/decrease.',
    category: 'Calculators',
    datePublished: '2026-07-22',
    relatedToolSlugs: ['percentage-calculator', 'discount-calculator', 'tip-calculator'],
    relatedGuideSlugs: ['bmi-calculator-guide'],
    sections: [
      {
        type: 'text',
        heading: 'Introduction',
        body: 'A percentage is a ratio expressed as a fraction of 100. The word comes from the Latin "per centum", meaning "by the hundred". Percentages appear everywhere — sale prices, exam scores, tax rates, nutrition labels, and performance metrics. There are three core types of percentage problems, each with its own formula.',
      },
      {
        type: 'text',
        heading: 'Type 1: Find X% of a Number',
        body: 'This is the most common type. "What is 15% of 240?" Multiply the number by the percentage divided by 100.\n\nFormula: Result = (Percentage ÷ 100) × Number\n\nExample: 15% of 240 = (15 ÷ 100) × 240 = 0.15 × 240 = 36.',
      },
      {
        type: 'text',
        heading: 'Type 2: What Percentage Is X of Y?',
        body: 'This answers questions like "30 is what percent of 200?" Divide the first number by the second and multiply by 100.\n\nFormula: Percentage = (X ÷ Y) × 100\n\nExample: 30 is what % of 200? = (30 ÷ 200) × 100 = 0.15 × 100 = 15%.',
      },
      {
        type: 'text',
        heading: 'Type 3: Percentage Change',
        body: 'This measures how much a value has increased or decreased relative to its original value.\n\nFormula: % Change = ((New Value − Old Value) ÷ Old Value) × 100\n\nA positive result is a percentage increase; a negative result is a percentage decrease.\n\nExample: Price goes from £80 to £96. Change = ((96 − 80) ÷ 80) × 100 = (16 ÷ 80) × 100 = 20% increase.',
      },
      {
        type: 'example',
        heading: 'Worked Example: Sale Price',
        scenario: 'A jacket costs $120 and is on sale for 25% off. What is the sale price?',
        solution: [
          'Find the discount amount: 25% of $120 = (25 ÷ 100) × 120 = $30.',
          'Subtract from the original price: $120 − $30 = $90.',
          'The sale price is $90.',
          'Alternatively: the sale price is 100% − 25% = 75% of the original. 75% of $120 = 0.75 × 120 = $90. ✓',
        ],
      },
      {
        type: 'example',
        heading: 'Worked Example: Exam Score',
        scenario: 'A student scored 68 out of 85 marks. What percentage did they achieve?',
        solution: [
          'Percentage = (Scored ÷ Total) × 100',
          '= (68 ÷ 85) × 100',
          '= 0.8 × 100',
          '= 80%',
        ],
      },
      {
        type: 'example',
        heading: 'Worked Example: Tip Calculation',
        scenario: 'Your restaurant bill is $54. You want to leave an 18% tip. How much is the tip?',
        solution: [
          'Tip = 18% of $54 = (18 ÷ 100) × 54 = 0.18 × 54 = $9.72.',
          'Total bill with tip: $54 + $9.72 = $63.72.',
        ],
      },
      {
        type: 'tip',
        body: 'A handy mental shortcut: to find 10% of any number, move the decimal point one place to the left. For 5%, halve the 10% result. For 20%, double the 10% result. Example: 10% of 340 = 34. 5% = 17. 20% = 68. 15% = 34 + 17 = 51.',
      },
      {
        type: 'faq',
        heading: 'Frequently Asked Questions',
        items: [
          {
            q: 'What is the difference between percentage and percentage points?',
            a: 'A percentage point is the arithmetic difference between two percentages. If a tax rate rises from 20% to 25%, it has risen by 5 percentage points — but by 25% as a percentage change ((25−20)÷20×100 = 25%). Confusing these two is a very common error in financial reporting.',
          },
          {
            q: 'How do I add a percentage to a number (e.g. add VAT)?',
            a: 'Multiply the number by (1 + percentage/100). To add 20% VAT to £50: 50 × 1.20 = £60. To remove VAT (find the pre-tax price): divide by 1.20. £60 ÷ 1.20 = £50.',
          },
          {
            q: 'How do I calculate percentage change when the original value is negative?',
            a: 'The standard formula breaks down when the original value is zero or negative (the result is counterintuitive). In those cases, report the absolute change instead, or note that a percentage change is not meaningful. For example, if a company\'s profit goes from −$10k to +$20k, describing that as a "300% increase" is technically correct but misleading.',
          },
          {
            q: 'Can a percentage be more than 100%?',
            a: 'Yes. A 150% increase means a value has grown by 1.5× its original amount, ending at 2.5× the original. A 200% increase means the value tripled. Percentages above 100 are common in growth metrics, markups, and financial returns.',
          },
          {
            q: 'What is a grade percentage and how is it converted to a letter grade?',
            a: 'A grade percentage is your earned marks divided by total marks, times 100. Conversion to letter grades varies by institution, but a common US scale is: 90–100% = A, 80–89% = B, 70–79% = C, 60–69% = D, below 60% = F.',
          },
        ],
      },
    ],
  },

  // ─── 3. BMI Calculator Guide ────────────────────────────────────────────────
  {
    slug: 'bmi-calculator-guide',
    title: 'BMI Calculator Guide',
    description:
      'Everything you need to know about Body Mass Index: the formula, BMI categories, metric vs. imperial conversion, and the limitations of BMI as a health indicator.',
    seoTitle: 'BMI Calculator Guide – Formula, Categories & Limitations | QuickAway',
    seoDescription:
      'Understand how BMI is calculated, what your BMI score means, how to use metric and imperial measurements, and why BMI alone does not tell the full health picture.',
    category: 'Calculators',
    datePublished: '2026-07-22',
    relatedToolSlugs: ['bmi-calculator', 'unit-converter'],
    relatedGuideSlugs: ['percentage-calculation-guide'],
    sections: [
      {
        type: 'text',
        heading: 'What Is BMI?',
        body: 'Body Mass Index (BMI) is a numerical value calculated from a person\'s height and weight. It was developed by Belgian mathematician Adolphe Quetelet in the 1830s and is now the most widely used screening tool for identifying weight categories in adults. BMI is used by healthcare professionals as an inexpensive and quick first-pass indicator — not a diagnostic tool.',
      },
      {
        type: 'text',
        heading: 'The BMI Formula',
        body: 'Metric: BMI = weight (kg) ÷ height² (m²)\nImperial: BMI = 703 × weight (lbs) ÷ height² (in²)\n\nBoth formulas produce the same number when the inputs are equivalent. The factor 703 converts pounds and inches to the metric equivalent.\n\nExample (metric): Weight = 70 kg, Height = 1.75 m. BMI = 70 ÷ (1.75²) = 70 ÷ 3.0625 ≈ 22.9.',
      },
      {
        type: 'table',
        heading: 'BMI Categories (WHO Standard)',
        headers: ['BMI Range', 'Category', 'Health Risk'],
        rows: [
          ['Below 18.5', 'Underweight', 'Nutritional deficiency risk'],
          ['18.5 – 24.9', 'Normal weight', 'Lowest risk'],
          ['25.0 – 29.9', 'Overweight', 'Moderately increased risk'],
          ['30.0 – 34.9', 'Obese Class I', 'High risk'],
          ['35.0 – 39.9', 'Obese Class II', 'Very high risk'],
          ['40.0 and above', 'Obese Class III', 'Extremely high risk'],
        ],
      },
      {
        type: 'steps',
        heading: 'How to Calculate Your BMI (Metric)',
        steps: [
          'Measure your weight in kilograms (kg).',
          'Measure your height in metres (m). If you know your height in centimetres, divide by 100.',
          'Square your height: height × height.',
          'Divide your weight by the squared height: BMI = weight ÷ height².',
          'Round to one decimal place and look up your category in the table above.',
        ],
      },
      {
        type: 'example',
        heading: 'Worked Example (Imperial)',
        scenario: 'Weight: 165 lbs. Height: 5 feet 9 inches (= 69 inches total).',
        solution: [
          'Convert height to inches: 5 × 12 + 9 = 69 inches.',
          'Square the height: 69² = 4,761.',
          'Apply the formula: BMI = 703 × 165 ÷ 4,761.',
          '= 703 × 165 = 115,995. Then 115,995 ÷ 4,761 ≈ 24.4.',
          'BMI = 24.4 → Normal weight.',
        ],
      },
      {
        type: 'tip',
        body: 'To convert feet and inches to total inches: multiply the feet by 12 and add the remaining inches. So 5 ft 9 in = (5 × 12) + 9 = 60 + 9 = 69 inches. Then convert to metres if needed: 69 × 0.0254 = 1.753 m.',
      },
      {
        type: 'text',
        heading: 'Limitations of BMI',
        body: 'BMI is a ratio of weight to height — it cannot distinguish between muscle and fat. A muscular athlete may have a "overweight" BMI despite having very low body fat. Conversely, an older person can have a "normal" BMI while carrying a high proportion of fat (termed "normal-weight obesity").\n\nBMI also does not account for:\n• Where fat is distributed (abdominal fat carries higher risk than hip/thigh fat)\n• Age and sex (older adults and women naturally carry more fat)\n• Ethnicity (Asian and South Asian populations show elevated cardiometabolic risk at lower BMI thresholds; some guidelines use 23.0 as the overweight threshold for these groups)\n\nFor a more complete picture, healthcare providers typically use BMI alongside waist circumference, blood pressure, blood glucose, and cholesterol levels.',
      },
      {
        type: 'faq',
        heading: 'Frequently Asked Questions',
        items: [
          {
            q: 'Is BMI used for children?',
            a: 'Yes, but the calculation is age- and sex-specific for children aged 2–19. Instead of fixed category ranges, children\'s BMI is compared to growth charts and expressed as a percentile relative to peers of the same age and sex. A child at the 85th–94th percentile is considered "overweight"; at or above the 95th percentile is "obese".',
          },
          {
            q: 'What BMI is considered healthy?',
            a: 'The WHO classifies BMI 18.5–24.9 as the normal healthy weight range for adults. However, "healthy" BMI is not a guarantee of good health — lifestyle factors, diet, activity level, and genetics all play major roles beyond what BMI can capture.',
          },
          {
            q: 'Why does the imperial BMI formula use 703?',
            a: '703 is the conversion factor that adjusts for the difference between kilograms/metres² and pounds/inches². Specifically: 1 kg/m² ≈ 0.00142 lb/in², so the inverse is approximately 703. The formula BMI = 703 × lbs ÷ in² gives the same numerical result as the metric formula.',
          },
          {
            q: 'Can I reduce my BMI by building muscle?',
            a: 'Adding muscle increases weight, which may raise or maintain your BMI even as body fat decreases. BMI does not distinguish between fat mass and muscle mass. Someone following a resistance-training programme may see little change in BMI while significantly improving body composition and health markers. Waist circumference is often a better indicator of health progress in this case.',
          },
          {
            q: 'What should I do if my BMI is outside the normal range?',
            a: 'Use the result as a starting point for a conversation with your doctor or a registered dietitian — not as a final diagnosis. A healthcare professional can evaluate the full picture using additional measurements and your personal medical history.',
          },
        ],
      },
    ],
  },

  // ─── 4. Roman Numerals Chart ────────────────────────────────────────────────
  {
    slug: 'roman-numerals-chart',
    title: 'Roman Numerals Chart',
    description:
      'A complete reference chart for Roman numerals 1–3,999 with the 7 core symbols, subtractive notation rules, and a quick-reference table of common values.',
    seoTitle: 'Roman Numerals Chart – Complete Reference 1 to 3999 | QuickAway',
    seoDescription:
      'Learn the 7 Roman numeral symbols, understand subtractive notation (IV, IX, XL, XC, CD, CM), and use our quick-reference table to read and write Roman numerals.',
    category: 'Converters',
    datePublished: '2026-07-22',
    relatedToolSlugs: ['roman-numeral-converter'],
    relatedGuideSlugs: ['percentage-calculation-guide'],
    sections: [
      {
        type: 'text',
        heading: 'Introduction',
        body: 'Roman numerals are a numeral system that originated in ancient Rome and remained the standard in Europe until the 14th century, when they were gradually replaced by the Arabic numeral system we use today. Roman numerals still appear widely on clock faces, building cornerstones, film and television copyright dates, book chapter numbering, and in formal document outlines.',
      },
      {
        type: 'table',
        heading: 'The 7 Core Roman Numeral Symbols',
        headers: ['Symbol', 'Value', 'Memory Aid'],
        rows: [
          ['I', '1', 'One finger'],
          ['V', '5', 'Spread hand (V shape)'],
          ['X', '10', 'Two V\'s crossed'],
          ['L', '50', 'Fifty'],
          ['C', '100', 'Centum (Latin: hundred)'],
          ['D', '500', 'Half of M (originally Ↄ)'],
          ['M', '1000', 'Mille (Latin: thousand)'],
        ],
        monoColumns: [0, 1],
      },
      {
        type: 'text',
        heading: 'Additive vs. Subtractive Notation',
        body: 'Roman numerals are generally written from largest to smallest, left to right, and their values are added together (additive notation). VII = 5 + 1 + 1 = 7. XII = 10 + 1 + 1 = 12.\n\nHowever, six subtractive combinations are allowed to avoid repeating a symbol more than three times. When a smaller symbol appears before a larger one, it is subtracted:\n\n• IV = 4 (not IIII)\n• IX = 9 (not VIIII)\n• XL = 40 (not XXXX)\n• XC = 90 (not LXXXX)\n• CD = 400 (not CCCC)\n• CM = 900 (not DCCCC)\n\nOnly these six combinations are valid. You cannot write IL for 49 — it must be XLIX (40 + 9). The rule is that only I, X, and C can be used subtractively, and only in front of the next two higher values.',
      },
      {
        type: 'table',
        heading: 'Quick Reference: 1–20',
        headers: ['Number', 'Roman', 'Number', 'Roman'],
        rows: [
          ['1', 'I', '11', 'XI'],
          ['2', 'II', '12', 'XII'],
          ['3', 'III', '13', 'XIII'],
          ['4', 'IV', '14', 'XIV'],
          ['5', 'V', '15', 'XV'],
          ['6', 'VI', '16', 'XVI'],
          ['7', 'VII', '17', 'XVII'],
          ['8', 'VIII', '18', 'XVIII'],
          ['9', 'IX', '19', 'XIX'],
          ['10', 'X', '20', 'XX'],
        ],
        monoColumns: [0, 1, 2, 3],
      },
      {
        type: 'table',
        heading: 'Common Milestone Values',
        headers: ['Number', 'Roman Numeral', 'Breakdown'],
        rows: [
          ['30', 'XXX', 'X + X + X'],
          ['40', 'XL', '50 − 10'],
          ['50', 'L', 'L'],
          ['90', 'XC', '100 − 10'],
          ['100', 'C', 'C'],
          ['400', 'CD', '500 − 100'],
          ['500', 'D', 'D'],
          ['900', 'CM', '1000 − 100'],
          ['1000', 'M', 'M'],
          ['1776', 'MDCCLXXVI', 'M + D + CC + LXX + VI'],
          ['1999', 'MCMXCIX', 'M + CM + XC + IX'],
          ['2024', 'MMXXIV', 'MM + XX + IV'],
          ['3999', 'MMMCMXCIX', 'MMM + CM + XC + IX'],
        ],
        monoColumns: [0, 1],
      },
      {
        type: 'steps',
        heading: 'How to Convert a Number to Roman Numerals',
        steps: [
          'Start with the largest symbol that fits into your number.',
          'Write that symbol and subtract its value from the number.',
          'Repeat with the remainder, always choosing the largest symbol (or valid subtractive pair) that fits.',
          'Continue until the remainder reaches 0.',
          'Example: 1,984. 1984 ≥ 1000 → write M, remainder 984. 984 ≥ 900 → write CM, remainder 84. 84 ≥ 50 → write L, remainder 34. 34 ≥ 10 → write X, remainder 24. 24 ≥ 10 → write X, remainder 14. 14 ≥ 10 → write X, remainder 4. 4 = IV → write IV. Result: MCMLXXXIV.',
        ],
      },
      {
        type: 'faq',
        heading: 'Frequently Asked Questions',
        items: [
          {
            q: 'What is the largest number that can be written in Roman numerals?',
            a: 'Using standard rules, 3,999 (MMMCMXCIX) is the largest, because you cannot have four of the same symbol in a row. Ancient Romans extended the system with vinculum (a bar over a numeral to multiply by 1,000) for larger numbers, but this is not part of the modern standard used on clocks, buildings, and publications.',
          },
          {
            q: 'Does Roman numerals have a symbol for zero?',
            a: 'No. The Romans had no symbol for zero, which is one of the reasons the system was eventually replaced. The concept of zero as a number was developed independently in India and was introduced to Europe via the Arabic numeral system in the Middle Ages.',
          },
          {
            q: 'Why do clock faces use IIII instead of IV for 4?',
            a: 'This is a longstanding clock-making tradition with several proposed explanations: visual balance (IIII mirrors VIII opposite it), the preference of King Louis XIV, or simply that IIII was the historical norm before subtractive notation was standardised. Modern Roman numeral rules favour IV, but IIII remains accepted and widespread on clock faces.',
          },
          {
            q: 'Can you write Roman numerals in lowercase?',
            a: 'Yes. Lowercase Roman numerals (i, ii, iii, iv, v …) are conventionally used for preliminary pages in books (preface, table of contents), footnotes, and outline sub-levels. They are mathematically identical to uppercase; the choice is purely stylistic.',
          },
          {
            q: 'How do you read a Roman numeral on a film or TV copyright date?',
            a: 'Work left to right. Whenever a smaller symbol appears before a larger one, subtract it. Otherwise, add. For example, MMXXVI: MM = 2000, XX = 20, VI = 6. Total = 2026.',
          },
        ],
      },
    ],
  },

  // ─── 5. Date Difference Calculator Guide ────────────────────────────────────
  {
    slug: 'date-difference-calculator-guide',
    title: 'Date Difference Calculator Guide',
    description:
      'Learn how to calculate the exact number of days, weeks, months, and years between two dates — including how leap years affect the count.',
    seoTitle: 'Date Difference Calculator Guide – Days Between Dates Explained | QuickAway',
    seoDescription:
      'Learn how to calculate the exact difference between two dates in days, weeks, months and years. Covers leap years, calendar edge cases, and real-world use cases.',
    category: 'Date & Time',
    datePublished: '2026-07-22',
    relatedToolSlugs: ['date-difference-calculator', 'age-calculator', 'countdown-to-date'],
    relatedGuideSlugs: ['how-to-calculate-age'],
    sections: [
      {
        type: 'text',
        heading: 'Introduction',
        body: 'Knowing the exact number of days between two dates is surprisingly useful — for tracking project timelines, calculating how long until a deadline, determining contract durations, verifying payment terms, or simply satisfying curiosity. While subtraction handles simple cases, accurate date difference calculations must account for months with different lengths, leap years, and whether to count start and end dates inclusively or exclusively.',
      },
      {
        type: 'text',
        heading: 'How Days Between Dates Are Counted',
        body: 'The standard method is to count calendar days from the start date up to (but not including) the end date. This is called an "exclusive end" count and is the default used by most calculators, spreadsheet functions (like Excel\'s DAYS function), and programming libraries.\n\nIf you want to include both the start and end dates (for example, a hospital stay that starts on Monday and ends on Friday counts as 5 days occupancy), add 1 to the exclusive count.',
      },
      {
        type: 'steps',
        heading: 'How to Calculate Days Between Two Dates (Manual Method)',
        steps: [
          'Convert both dates to a sequential day count (known as a Julian Day Number or Rata Die). This converts each date to "number of days since a fixed reference point".',
          'Subtract the earlier day count from the later one.',
          'The result is the number of calendar days between the two dates (exclusive of the end date).',
          'For most everyday purposes, counting month-by-month is practical: note the full months that pass, count the partial months at each end, and add the days for any leap February if it falls between the two dates.',
          'For total weeks: divide total days by 7. The integer part is full weeks; the remainder is extra days.',
          'For years and months: use the same method described in the Age Calculation guide — count full years, then remaining full months, then remaining days.',
        ],
      },
      {
        type: 'example',
        heading: 'Worked Example: Days Between Two Dates',
        scenario: 'Start date: January 15, 2026. End date: July 22, 2026.',
        solution: [
          'Count days remaining in January after the 15th: 31 − 15 = 16 days.',
          'February 2026: 28 days (2026 is not a leap year).',
          'March: 31 days.',
          'April: 30 days.',
          'May: 31 days.',
          'June: 30 days.',
          'July 1–22: 22 days.',
          'Total: 16 + 28 + 31 + 30 + 31 + 30 + 22 = 188 days.',
          'In weeks: 188 ÷ 7 = 26 weeks and 6 days.',
        ],
      },
      {
        type: 'example',
        heading: 'Worked Example: Cross-Year Difference',
        scenario: 'Start date: November 10, 2025. End date: March 5, 2027.',
        solution: [
          'November 10–30, 2025: 20 days.',
          'December 2025: 31 days.',
          'January 2026: 31 days.',
          'February 2026: 28 days (not a leap year).',
          'March 2026: 31 days.',
          'April 2026: 30 days.',
          'May 2026: 31 days.',
          'June 2026: 30 days.',
          'July 2026: 31 days.',
          'August 2026: 31 days.',
          'September 2026: 30 days.',
          'October 2026: 31 days.',
          'November 2026: 30 days.',
          'December 2026: 31 days.',
          'January 2027: 31 days.',
          'February 2027: 28 days.',
          'March 1–5, 2027: 5 days.',
          'Total: 20+31+31+28+31+30+31+30+31+31+30+31+30+31+31+28+5 = 480 days (1 year, 3 months, 23 days).',
        ],
      },
      {
        type: 'tip',
        body: 'Leap years occur in years divisible by 4 — except century years (divisible by 100) which must also be divisible by 400. So 2000 was a leap year; 1900 was not. Between 2000 and 2100 the leap years are: 2000, 2004, 2008, …, 2096. Any calculation spanning one of those Februaries gains an extra day.',
      },
      {
        type: 'table',
        heading: 'How Many Days in Each Month?',
        headers: ['Month', 'Days (normal year)', 'Days (leap year)'],
        rows: [
          ['January', '31', '31'],
          ['February', '28', '29'],
          ['March', '31', '31'],
          ['April', '30', '30'],
          ['May', '31', '31'],
          ['June', '30', '30'],
          ['July', '31', '31'],
          ['August', '31', '31'],
          ['September', '30', '30'],
          ['October', '31', '31'],
          ['November', '30', '30'],
          ['December', '31', '31'],
        ],
      },
      {
        type: 'faq',
        heading: 'Frequently Asked Questions',
        items: [
          {
            q: 'Does the date difference include the start date, the end date, or both?',
            a: 'By convention, most tools count from the start date up to but not including the end date (exclusive end). So from July 1 to July 8 = 7 days. If you need to count both endpoints (e.g. for a hotel stay: check-in July 1, check-out July 8 = 7 nights), the exclusive count is exactly what you want. If you need to count all days that a project was active including both endpoints, add 1 to the result.',
          },
          {
            q: 'How do I calculate business days (excluding weekends)?',
            a: 'Count the total calendar days, then subtract the number of Saturdays and Sundays within the range. A quick formula: business days = total days − (floor(total days / 7) × 2) − adjustments for any partial week at the start or end. Online tools and spreadsheet functions like NETWORKDAYS handle this automatically.',
          },
          {
            q: 'Is "1 month" always 30 days in a date difference?',
            a: 'No — months have different lengths (28–31 days). When expressing a date difference as "X months and Y days", the calculation anchors on calendar months, not 30-day blocks. For example, from January 31 to March 31 = exactly 2 calendar months, even though those 2 months span 59 days (28 + 31) in a non-leap year.',
          },
          {
            q: 'What is the longest possible date difference I can calculate?',
            a: 'Online calculators typically support any date in the Gregorian calendar, which is proleptic back to year 1 AD. The most distant practical range is from January 1, 0001 to December 31, 9999 — a span of about 3.65 million days. For historical calculations before the Gregorian calendar was adopted (1582 in most of Europe), treat results as approximate.',
          },
          {
            q: 'How do contracts and legal documents calculate date differences?',
            a: 'Legal date calculation conventions vary by jurisdiction and document type. Many contracts specify a number of calendar days (including weekends and public holidays). Some use "business days" or "working days". It\'s important to check the exact wording — "within 30 days" typically means 30 calendar days from the event date, not 30 business days.',
          },
        ],
      },
    ],
  },
];

/** Look up a guide by its slug. Returns undefined if not found. */
export function findGuideBySlug(slug: string): GuideEntry | undefined {
  return guidesRegistry.find((g) => g.slug === slug);
}
