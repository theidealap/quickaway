import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Copy, Hash, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ToolEmptyState } from '@/components/tool-empty-state';
import { useToast } from '@/hooks/use-toast';

// ── Number → words logic ──────────────────────────────────────────────────────

const ONES = ['','one','two','three','four','five','six','seven','eight','nine',
  'ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen',
  'eighteen','nineteen'];
const TENS = ['','','twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety'];
const SCALES = ['','thousand','million','billion','trillion','quadrillion'];

function belowThousand(n: number): string {
  if (n === 0) return '';
  if (n < 20) return ONES[n];
  if (n < 100) {
    const t = TENS[Math.floor(n / 10)];
    const o = ONES[n % 10];
    return o ? `${t}-${o}` : t;
  }
  const hundreds = ONES[Math.floor(n / 100)];
  const rest = belowThousand(n % 100);
  return rest ? `${hundreds} hundred ${rest}` : `${hundreds} hundred`;
}

function toWords(n: bigint): string {
  if (n === 0n) return 'zero';
  const negative = n < 0n;
  const abs = negative ? -n : n;
  const absStr = abs.toString();

  // Limit to quadrillions (10^18 - 1)
  if (abs >= 10n ** 18n) return '';

  const chunks: number[] = [];
  let remaining = abs;
  while (remaining > 0n) {
    chunks.push(Number(remaining % 1000n));
    remaining /= 1000n;
  }

  const parts: string[] = [];
  for (let i = chunks.length - 1; i >= 0; i--) {
    if (chunks[i] === 0) continue;
    const w = belowThousand(chunks[i]);
    parts.push(SCALES[i] ? `${w} ${SCALES[i]}` : w);
  }

  const result = parts.join(' ');
  return negative ? `negative ${result}` : result;
}

function toOrdinal(words: string): string {
  const ordinalMap: Record<string, string> = {
    one: 'first', two: 'second', three: 'third', four: 'fourth', five: 'fifth',
    six: 'sixth', seven: 'seventh', eight: 'eighth', nine: 'ninth', ten: 'tenth',
    eleven: 'eleventh', twelve: 'twelfth', thirteen: 'thirteenth', fourteen: 'fourteenth',
    fifteen: 'fifteenth', sixteen: 'sixteenth', seventeen: 'seventeenth',
    eighteen: 'eighteenth', nineteen: 'nineteenth', twenty: 'twentieth',
    thirty: 'thirtieth', forty: 'fortieth', fifty: 'fiftieth', sixty: 'sixtieth',
    seventy: 'seventieth', eighty: 'eightieth', ninety: 'ninetieth',
    hundred: 'hundredth', thousand: 'thousandth', million: 'millionth',
    billion: 'billionth', trillion: 'trillionth',
  };
  const lastWord = words.split(/[\s-]/).pop()!;
  const replacement = ordinalMap[lastWord];
  if (!replacement) return words;
  return words.replace(new RegExp(`${lastWord}$`), replacement);
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function NumberToWords() {
  const { toast } = useToast();
  const [input, setInput] = useState('');

  const result = useMemo(() => {
    if (!input.trim()) return null;
    const cleaned = input.replace(/,/g, '').trim();
    if (!/^-?\d+$/.test(cleaned)) {
      return { ok: false as const, error: 'Enter a whole number (decimals and fractions are not supported).' };
    }
    let n: bigint;
    try { n = BigInt(cleaned); } catch { return { ok: false as const, error: 'Number is too large to parse.' }; }
    const abs = n < 0n ? -n : n;
    if (abs >= 10n ** 18n) {
      return { ok: false as const, error: 'Number must be less than one quadrillion (10¹⁵).' };
    }
    const cardinal = toWords(n);
    const ordinal = toOrdinal(cardinal);
    const capitalized = cardinal.charAt(0).toUpperCase() + cardinal.slice(1);
    const ordinalCap = ordinal.charAt(0).toUpperCase() + ordinal.slice(1);
    return { ok: true as const, cardinal, ordinal, capitalized, ordinalCap };
  }, [input]);

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: `Copied ${label}`, duration: 2000 });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="num-input">Number</Label>
        <Input
          id="num-input"
          type="text"
          inputMode="numeric"
          placeholder="e.g. 1000000"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="h-12 text-lg font-mono"
          autoFocus
        />
        <p className="text-xs text-muted-foreground">
          Supports integers from −999 quadrillion to 999 quadrillion. Commas are ignored.
        </p>
      </div>

      {!result ? (
        <ToolEmptyState icon={Hash} message="Enter a number to see it written in words" className="h-44" />
      ) : !result.ok ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{result.error}</AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-3">
          {[
            { label: 'Cardinal (lowercase)',   value: result.cardinal    },
            { label: 'Cardinal (capitalised)', value: result.capitalized },
            { label: 'Ordinal (lowercase)',    value: result.ordinal     },
            { label: 'Ordinal (capitalised)',  value: result.ordinalCap  },
          ].map(({ label, value }, i) => (
            <Card
              key={label}
              className={`p-5 flex items-start justify-between gap-4 transition-colors hover:border-primary/40 hover:bg-primary/5 ${i === 0 ? 'bg-primary/5 border-primary/20' : 'bg-card'}`}
            >
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">{label}</p>
                <p className="text-sm leading-relaxed text-foreground break-words">{value}</p>
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="shrink-0"
                onClick={() => copy(value, label)}
                title={`Copy ${label}`}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </Card>
          ))}
        </div>
      )}

      <div className="flex justify-end">
        <Button variant="outline" onClick={() => setInput('')} disabled={!input}>Reset</Button>
      </div>

      {/* ── Educational content ───────────────────────────────────────────── */}

      <div className="pt-8 mt-8 border-t border-border">
        <h2 className="text-base font-semibold text-foreground mb-3">How Numbers Are Converted to Words</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          English number names are built from a repeating three-digit (thousands) group pattern. The converter breaks any integer into chunks of three digits from the right — each chunk corresponds to a scale word: thousands, millions, billions, trillions, and so on. Each chunk is independently converted to a sub-phrase, the appropriate scale word is appended, and the phrases are joined from largest to smallest.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed mt-2">
          Two worked examples: <strong>1,452</strong> → chunk at thousands level = 1 → "one thousand", chunk at ones level = 452 → "four hundred fifty-two" → <strong>"one thousand, four hundred fifty-two"</strong>. <strong>3,000,007</strong> → chunk at millions = 3 → "three million", chunk at thousands = 0 (skipped), chunk at ones = 7 → "seven" → <strong>"three million, seven"</strong>.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed mt-2">
          Zero-valued groups are silently omitted at every scale. The thousands chunk of
          3,000,007 equals zero and is skipped entirely — which is why the result is "three
          million seven" rather than "three million zero thousand seven". The same rule applies
          consistently: 1,000,000 converts to "one million" because both the thousands and ones
          groups are zero; 42,000 converts to "forty-two thousand" because the ones group is zero.
          No scale word is ever emitted for an empty group.
        </p>
      </div>

      <div className="pt-8 mt-8 border-t border-border">
        <h2 className="text-base font-semibold text-foreground mb-3">The Short-Scale Grouping System</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          The three-digit group system is called the <strong>short scale</strong> naming convention, used in the United States, the United Kingdom (since 1974), and most English-speaking countries:
        </p>
        <div className="border border-border rounded-md bg-secondary p-4 mt-3 text-sm font-mono text-foreground leading-relaxed space-y-1">
          <div>1,000 → <strong>thousand</strong> (10³)</div>
          <div>1,000,000 → <strong>million</strong> (10⁶)</div>
          <div>1,000,000,000 → <strong>billion</strong> (10⁹)</div>
          <div>1,000,000,000,000 → <strong>trillion</strong> (10¹²)</div>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed mt-3">
          Each scale name covers the range from 1 × 10ⁿ to 999 × 10ⁿ before the next scale begins. This tool handles integers up to 999 quadrillion (10¹⁵ − 1). Ordinal forms — "thousandth", "millionth" — are derived by replacing the final word using irregular mappings (first, second, third) and regular suffix rules (-th).
        </p>
      </div>

      <div className="pt-8 mt-8 border-t border-border">
        <h2 className="text-base font-semibold text-foreground mb-3">How Ordinal Numbers Are Formed</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Ordinal conversion replaces only the last word of the cardinal form. The first three are
          completely irregular — <strong>one → first</strong>, <strong>two → second</strong>,{' '}
          <strong>three → third</strong> — with no structural resemblance to the cardinal word.
          From four onward the base pattern is a <strong>-th</strong> suffix, but several numbers
          require a spelling adjustment: <strong>five → fifth</strong> (not "fiveth"),{' '}
          <strong>eight → eighth</strong> (one letter dropped), <strong>nine → ninth</strong>{' '}
          (terminal e dropped), and <strong>twelve → twelfth</strong> (ve becomes fth). The tens
          follow the same principle: twenty → <strong>twentieth</strong>, thirty →{' '}
          <strong>thirtieth</strong>, forty → <strong>fortieth</strong>, and so on through
          ninetieth.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed mt-2">
          For hyphenated numbers, only the last component changes. <strong>21 → "twenty-one" →
          "twenty-first"</strong>: the "twenty" prefix is unchanged and "one" is replaced by
          "first". Similarly, <strong>42 → "forty-two" → "forty-second"</strong>. Scale words
          follow the regular pattern: thousand → <strong>thousandth</strong>, million →{' '}
          <strong>millionth</strong>, billion → <strong>billionth</strong>. Every cardinal has
          exactly one ordinal form — there are no alternative ordinal spellings in standard English.
        </p>
      </div>

      <div className="pt-8 mt-8 border-t border-border">
        <h2 className="text-base font-semibold text-foreground mb-3">When to Use This Converter</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Number-to-words conversion is required in legal documents and checks, where amounts must be written in full to prevent alteration. Financial contracts routinely require both numeric and written forms of sums. It also appears in natural language generation, accessibility contexts where numbers need to be spoken aloud by screen readers, and data entry validation for formal documents. The ordinal output is useful for ranking labels, competition results, and ranked lists.
        </p>
      </div>

      <div className="pt-8 mt-8 border-t border-border">
        <h2 className="text-base font-semibold text-foreground mb-3">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {[
            {
              q: 'How are large numbers named in the short-scale system?',
              a: 'Each scale word covers a power of 1,000: thousand = 10³, million = 10⁶, billion = 10⁹, trillion = 10¹², quadrillion = 10¹⁵. A number gets its scale word from the highest non-zero group. 1,000,000 is "one million"; 1,001,000 is "one million, one thousand". Every integer maps to exactly one word form by following the grouping rules.',
            },
            {
              q: 'What is the difference between the American and British number naming systems?',
              a: 'Today both use the short scale identically. The historical difference was in the long scale (used in continental Europe and older British English), where "billion" meant 10¹² (a million millions) rather than 10⁹. The UK officially adopted the short scale in 1974. In contemporary American and British English, billion = 10⁹ is unambiguous.',
            },
            {
              q: 'How do I write a number in words for a check or legal document?',
              a: 'Use the capitalised cardinal output: "One thousand, four hundred fifty-two". For check writing, cents are conventionally written as a fraction: "One thousand, four hundred fifty-two and 00/100". The written form is the legally binding value on a check and overrides the numeric figure if there is a discrepancy.',
            },
            {
              q: 'Does this tool handle negative numbers or decimals?',
              a: 'It handles negative integers — the word "negative" is prepended to the written form. It does not convert decimals, because there is no universal convention for how decimal places are spoken in words. For check writing, the decimal portion is written as a fraction (xx/100) rather than as words.',
            },
          ].map(({ q, a }) => (
            <div key={q} className="border border-border rounded-md p-4">
              <p className="text-sm font-semibold text-foreground mb-1">{q}</p>
              <p className="text-sm text-muted-foreground">{a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
