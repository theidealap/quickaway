import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Copy, ArrowLeftRight, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { ToolResultBadge } from '@/components/tool-result-badge';

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
    const n = parseInt(numInput, 10);
    if (isNaN(n)) return { ok: false as const, error: 'Enter a whole number.' };
    if (n < 1 || n > 3999) return { ok: false as const, error: 'Number must be between 1 and 3999.' };
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
        <Card className="relative p-6 min-h-[120px] flex flex-col justify-center bg-primary/5 border-primary/20">
          {numResult?.ok && <ToolResultBadge />}
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
        <Card className="relative p-6 min-h-[120px] flex flex-col justify-center bg-primary/5 border-primary/20">
          {romResult?.ok && <ToolResultBadge />}
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
    </div>
  );
}
