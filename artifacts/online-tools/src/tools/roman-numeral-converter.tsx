import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Copy, ArrowLeftRight, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

// ── Roman numeral logic ───────────────────────────────────────────────────────

const ROMAN_MAP: [number, string][] = [
  [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
  [100,  'C'], [90,  'XC'], [50,  'L'], [40,  'XL'],
  [10,   'X'], [9,   'IX'], [5,   'V'], [4,   'IV'], [1, 'I'],
];

function toRoman(n: number): string {
  if (n < 1 || n > 3999 || !Number.isInteger(n)) return '';
  let result = '';
  for (const [value, numeral] of ROMAN_MAP) {
    while (n >= value) { result += numeral; n -= value; }
  }
  return result;
}

const ROMAN_VALUES: Record<string, number> = {
  M: 1000, D: 500, C: 100, L: 50, X: 10, V: 5, I: 1,
};

function fromRoman(s: string): number | null {
  const upper = s.toUpperCase().trim();
  if (!upper || !/^[MDCLXVI]+$/.test(upper)) return null;
  let total = 0;
  for (let i = 0; i < upper.length; i++) {
    const cur = ROMAN_VALUES[upper[i]];
    const nxt = ROMAN_VALUES[upper[i + 1]] ?? 0;
    total += cur < nxt ? -cur : cur;
  }
  // Validate by round-tripping
  if (total < 1 || total > 3999 || toRoman(total) !== upper) return null;
  return total;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function RomanNumeralConverter() {
  const { toast } = useToast();
  const [numInput, setNumInput] = useState('');
  const [romInput, setRomInput] = useState('');

  const numResult = useMemo(() => {
    if (!numInput) return null;
    const n = parseFloat(numInput);
    if (isNaN(n)) return { ok: false as const, error: 'Enter a whole number between 1 and 3999.' };
    if (!Number.isInteger(n)) return { ok: false as const, error: 'Roman numerals only support whole numbers. Decimals are not allowed.' };
    if (n === 0) return { ok: false as const, error: 'Zero has no Roman numeral representation. The supported range is 1–3999.' };
    if (n < 0) return { ok: false as const, error: 'Roman numerals only support positive numbers. Negative numbers are not supported (range: 1–3999).' };
    if (n > 3999) return { ok: false as const, error: `${n.toLocaleString()} is above the maximum. Roman numerals only go up to MMMCMXCIX (3,999).` };
    return { ok: true as const, output: toRoman(n) };
  }, [numInput]);

  const romResult = useMemo(() => {
    if (!romInput) return null;
    const n = fromRoman(romInput);
    if (n === null) return { ok: false as const, error: 'Not a valid Roman numeral.' };
    return { ok: true as const, output: n };
  }, [romInput]);

  const copy = (val: string, label: string) => {
    navigator.clipboard.writeText(val);
    toast({ title: `Copied ${label}`, description: 'Saved to your clipboard.', duration: 2000 });
  };

  const swap = () => {
    if (numResult?.ok) {
      setRomInput(numResult.output);
      setNumInput('');
    } else if (romResult?.ok) {
      setNumInput(String(romResult.output));
      setRomInput('');
    }
  };

  const canSwap = (numResult?.ok || romResult?.ok) ?? false;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-end">
        {/* Number → Roman */}
        <div className="space-y-2">
          <Label htmlFor="num-input">Number (1–3999)</Label>
          <Input
            id="num-input"
            type="number"
            min="1"
            max="3999"
            step="1"
            placeholder="e.g. 2024"
            value={numInput}
            onChange={(e) => setNumInput(e.target.value)}
            className="h-12"
          />
        </div>

        <div className="flex items-center justify-center pb-0.5">
          <Button
            variant="outline"
            size="icon"
            onClick={swap}
            disabled={!canSwap}
            aria-label="Swap"
            title="Swap result into the other field"
          >
            <ArrowLeftRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Roman → Number */}
        <div className="space-y-2">
          <Label htmlFor="rom-input">Roman Numeral</Label>
          <Input
            id="rom-input"
            type="text"
            placeholder="e.g. MMXXIV"
            value={romInput}
            onChange={(e) => setRomInput(e.target.value.toUpperCase())}
            className="h-12 font-mono tracking-widest uppercase"
            maxLength={15}
          />
        </div>
      </div>

      {/* Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Number → Roman result */}
        <Card className="p-6 min-h-[120px] flex flex-col justify-center bg-primary/5 border-primary/20">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Roman numeral</p>
          {!numInput ? (
            <p className="text-muted-foreground text-sm italic">Enter a number on the left</p>
          ) : !numResult?.ok ? (
            <Alert variant="destructive" className="mt-1">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{numResult?.error}</AlertDescription>
            </Alert>
          ) : (
            <div className="flex items-center justify-between gap-4">
              <span className="text-3xl md:text-4xl font-bold font-mono tracking-widest text-foreground">
                {numResult.output}
              </span>
              <Button size="icon" variant="ghost" onClick={() => copy(numResult.output, 'Roman numeral')}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          )}
        </Card>

        {/* Roman → Number result */}
        <Card className="p-6 min-h-[120px] flex flex-col justify-center bg-primary/5 border-primary/20">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Number</p>
          {!romInput ? (
            <p className="text-muted-foreground text-sm italic">Enter a Roman numeral on the right</p>
          ) : !romResult?.ok ? (
            <Alert variant="destructive" className="mt-1">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{romResult?.error}</AlertDescription>
            </Alert>
          ) : (
            <div className="flex items-center justify-between gap-4">
              <span className="text-3xl md:text-4xl font-bold font-display text-foreground">
                {romResult.output.toLocaleString()}
              </span>
              <Button size="icon" variant="ghost" onClick={() => copy(String(romResult.output), 'number')}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          )}
        </Card>
      </div>

      {/* Quick reference */}
      <details className="group">
        <summary className="text-sm text-muted-foreground cursor-pointer hover:text-foreground select-none list-none flex items-center gap-1.5">
          <span className="transition-transform group-open:rotate-90 inline-block">▶</span>
          Roman numeral reference
        </summary>
        <div className="mt-3 grid grid-cols-3 sm:grid-cols-7 gap-2">
          {ROMAN_MAP.map(([val, sym]) => (
            <div key={sym} className="text-center p-2 rounded-lg border bg-card text-sm">
              <div className="font-mono font-semibold">{sym}</div>
              <div className="text-muted-foreground text-xs">{val.toLocaleString()}</div>
            </div>
          ))}
        </div>
      </details>

      <div className="flex justify-end">
        <Button variant="outline" onClick={() => { setNumInput(''); setRomInput(''); }}
          disabled={!numInput && !romInput}>
          Reset
        </Button>
      </div>

      {/* ── Educational content ───────────────────────────────────────── */}
      <div className="pt-8 mt-8 border-t border-border space-y-0">

        {/* Section 1 — How Roman Numerals Work */}
        <div>
          <h2 className="text-base font-semibold text-foreground mb-3">How Roman Numerals Work</h2>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Roman numerals use seven symbols, each representing a fixed value: I (1), V (5),
              X (10), L (50), C (100), D (500), and M (1,000). Numbers are built by combining
              these symbols, placing larger values to the left. MM = 2,000; MDCC = 1,700.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The system becomes interesting with subtractive notation. When a smaller symbol
              appears immediately to the left of a larger one, the smaller is subtracted rather
              than added. There are exactly six subtractive pairs: IV (4), IX (9), XL (40),
              XC (90), CD (400), and CM (900). Everything else follows the additive rule. This is
              why 1994 is <span className="font-mono font-semibold text-foreground">MCMXCIV</span> —
              M (1,000) + CM (900) + XC (90) + IV (4) — and 2024
              is <span className="font-mono font-semibold text-foreground">MMXXIV</span> —
              MM (2,000) + XX (20) + IV (4).
            </p>
          </div>
        </div>

        {/* Section 2 — How It's Calculated */}
        <div className="pt-8 mt-8 border-t border-border">
          <h2 className="text-base font-semibold text-foreground mb-3">How the Conversion Works</h2>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              To convert an integer to Roman numerals, the algorithm repeatedly subtracts the
              largest symbol value that fits, appending the symbol each time.
              Converting <span className="font-mono font-semibold text-foreground">399</span>:
              subtract C (100) three times → CCC, remainder 99; subtract XC (90) → CCCXC,
              remainder 9; subtract IX (9) → result
              is <span className="font-mono font-semibold text-foreground">CCCXCIX</span>.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              To convert in reverse, read left to right and add each symbol's value — except
              when a smaller value immediately precedes a larger one, subtract the smaller
              instead. <span className="font-mono font-semibold text-foreground">LVIII</span>:
              L (50) + V (5) + I (1) + I (1) + I (1)
              = <span className="font-semibold text-foreground">58</span>.
            </p>
          </div>
        </div>

        {/* Section 3 — When to Use */}
        <div className="pt-8 mt-8 border-t border-border">
          <h2 className="text-base font-semibold text-foreground mb-3">When to Use This Converter</h2>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Roman numerals are still used in specific contexts: chapter numbers in books and
              legal documents, clock faces, film and TV sequel numbering, year labels on historic
              buildings, and major sporting events. Use this converter when formatting a publication
              year (e.g., a film copyright notice), decoding a cornerstone date on a building, or
              confirming the correct numeral for an event — for example, which Super Bowl is LIX?
              (The answer is 59.)
            </p>
          </div>
        </div>

        {/* Section 4 — FAQ */}
        <div className="pt-8 mt-8 border-t border-border">
          <h2 className="text-base font-semibold text-foreground mb-3">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {[
              {
                q: 'Why is 4 written as IV and not IIII?',
                a: "Subtractive notation was adopted to avoid repeating the same symbol more than three times consecutively. The rule is that I, X, C, and M can each appear at most three times in a row in additive position — so 4 must be IV rather than IIII. Some clock faces still use IIII (a historical holdover for visual balance opposite the VIII on the right), but IIII is not standard modern Roman numeral notation.",
              },
              {
                q: 'What is the largest number Roman numerals can represent?',
                a: "Using the standard seven symbols, the maximum is 3,999 — written MMMCMXCIX. M can appear at most three times additively, and CM (900) is the largest subtractive pair available, giving no way to express 4,000 or above without extensions. Some historical systems used a bar over a numeral to multiply it by 1,000 (M̄ = 1,000,000), but those are not part of the modern standard this converter uses.",
              },
              {
                q: 'Did Romans have a symbol for zero?',
                a: 'No. Roman numerals have no symbol for zero, which is a fundamental structural difference from the Hindu-Arabic (0–9) positional system. The Latin word "nulla" (nothing) was used in writing, but there was no numeral for it. This absence made arithmetic operations — especially multiplication and division — significantly harder, which is one reason the Hindu-Arabic system eventually replaced Roman numerals for calculation throughout Europe.',
              },
              {
                q: 'How do you write repeating numerals like 3 or 30?',
                a: "Additive repetition: 3 is III (1+1+1), 30 is XXX (10+10+10), 300 is CCC (100+100+100). The limit is three consecutive identical symbols in additive position. When you need four of the same value, switch to subtractive notation using the next larger symbol: 4 is IV, 40 is XL, 400 is CD — never IIII, XXXX, or CCCC.",
              },
            ].map((item) => (
              <div key={item.q} className="border border-border rounded-md p-4">
                <p className="text-sm font-semibold text-foreground mb-1.5">{item.q}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
