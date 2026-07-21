import { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Copy, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// ── Conversion helpers ────────────────────────────────────────────────────────

type Base = 2 | 8 | 10 | 16;

const BASE_META: Record<Base, { label: string; placeholder: string; pattern: RegExp; prefix: string }> = {
  2:  { label: 'Binary',      placeholder: '1010 1111',  pattern: /^[01\s]+$/,        prefix: '0b' },
  8:  { label: 'Octal',       placeholder: '777',        pattern: /^[0-7\s]+$/,       prefix: '0o' },
  10: { label: 'Decimal',     placeholder: '255',        pattern: /^[\d\s]+$/,        prefix: ''   },
  16: { label: 'Hexadecimal', placeholder: 'FF or 0xFF', pattern: /^[0-9a-fA-F\s]+$/, prefix: '0x' },
};

const BASES: Base[] = [2, 8, 10, 16];

function clean(s: string): string { return s.replace(/\s/g, ''); }

function parseAny(s: string, base: Base): bigint | null {
  const c = clean(s).replace(/^0[bBoOxX]/, '');
  if (!c) return null;
  try {
    const n = BigInt(`0${base === 16 ? 'x' : base === 8 ? 'o' : base === 2 ? 'b' : ''}${base === 10 ? c : c.toLowerCase()}`);
    if (n < 0n) return null;
    return n;
  } catch {
    return null;
  }
}

function formatOutput(n: bigint, base: Base): string {
  const raw = n.toString(base).toUpperCase();
  if (base === 2) {
    // group binary into nibbles for readability
    const padded = raw.padStart(Math.ceil(raw.length / 4) * 4, '0');
    return padded.replace(/.{4}/g, (m) => m + ' ').trim();
  }
  if (base === 16) {
    // group hex into pairs
    const padded = raw.padStart(Math.ceil(raw.length / 2) * 2, '0');
    return padded.replace(/.{2}/g, (m) => m + ' ').trim();
  }
  return raw;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function BaseConverter() {
  const { toast } = useToast();
  const [values, setValues] = useState<Record<Base, string>>({ 2: '', 8: '', 10: '', 16: '' });
  const [activeBase, setActiveBase] = useState<Base | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = useCallback((base: Base, raw: string) => {
    setActiveBase(base);
    const newValues: Record<Base, string> = { 2: '', 8: '', 10: '', 16: '' };
    newValues[base] = raw;

    const c = clean(raw).replace(/^0[bBoOxX]/, '');
    if (!c) {
      setError(null);
      setValues(newValues);
      return;
    }

    const meta = BASE_META[base];
    // Validate characters (strip prefix for hex)
    const testStr = base === 16 ? c.toLowerCase() : c;
    if (!meta.pattern.test(raw.replace(/^0[bBoOxX]/, ''))) {
      setError(`Invalid character for ${meta.label}.`);
      setValues(newValues);
      return;
    }

    const n = parseAny(raw, base);
    if (n === null) {
      setError(`Cannot parse as ${meta.label}.`);
      setValues(newValues);
      return;
    }

    setError(null);
    for (const b of BASES) {
      newValues[b] = b === base ? raw : formatOutput(n, b);
    }
    setValues(newValues);
  }, []);

  const copy = (base: Base) => {
    const val = clean(values[base]);
    if (!val) return;
    navigator.clipboard.writeText(val);
    toast({ title: `Copied ${BASE_META[base].label}`, duration: 2000 });
  };

  const reset = () => {
    setValues({ 2: '', 8: '', 10: '', 16: '' });
    setActiveBase(null);
    setError(null);
  };

  const hasValue = BASES.some((b) => values[b]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {BASES.map((base) => {
          const meta = BASE_META[base];
          const isActive = activeBase === base;
          const hasResult = !isActive && values[base];
          return (
            <Card
              key={base}
              className={`p-5 transition-colors ${isActive ? 'border-primary/50 bg-primary/5' : hasResult ? 'border-border bg-card' : 'border-border bg-card'}`}
            >
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor={`base-${base}`} className="text-sm font-semibold">
                  {meta.label}
                  <span className="ml-1.5 text-xs font-normal text-muted-foreground font-mono">base {base}</span>
                </Label>
                {hasResult && (
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => copy(base)}>
                    <Copy className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
              <Input
                id={`base-${base}`}
                value={values[base]}
                onChange={(e) => handleChange(base, e.target.value)}
                placeholder={meta.placeholder}
                className="h-11 font-mono text-sm tracking-wide"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
              />
              {base === 16 && values[16] && !error && (
                <p className="mt-1.5 text-xs text-muted-foreground font-mono">
                  {meta.prefix}{clean(values[16]).toUpperCase()}
                </p>
              )}
              {base === 2 && values[2] && !error && (
                <p className="mt-1.5 text-xs text-muted-foreground font-mono">
                  {meta.prefix}{clean(values[2])}
                </p>
              )}
            </Card>
          );
        })}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive p-3 rounded-lg bg-destructive/10 border border-destructive/20">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Quick reference */}
      <details className="group">
        <summary className="text-sm text-muted-foreground cursor-pointer hover:text-foreground select-none list-none flex items-center gap-1.5">
          <span className="transition-transform group-open:rotate-90 inline-block">▶</span>
          Common values reference
        </summary>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-xs font-mono border-collapse">
            <thead>
              <tr className="border-b">
                {['Decimal','Binary','Octal','Hex'].map(h => (
                  <th key={h} className="text-left p-2 text-muted-foreground font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[0,1,8,10,15,16,255,256,1024,65535].map(n => (
                <tr key={n} className="border-b border-border/40 hover:bg-muted/30 transition-colors">
                  <td className="p-2">{n}</td>
                  <td className="p-2">{n.toString(2)}</td>
                  <td className="p-2">{n.toString(8)}</td>
                  <td className="p-2">{n.toString(16).toUpperCase()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>

      <div className="flex justify-end">
        <Button variant="outline" onClick={reset} disabled={!hasValue}>Reset</Button>
      </div>
    </div>
  );
}
