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
    </div>
  );
}
