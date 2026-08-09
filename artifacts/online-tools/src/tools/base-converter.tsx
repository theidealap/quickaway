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

      {/* ── Educational content ───────────────────────────────────────────── */}

      <div className="pt-8 mt-8 border-t border-border">
        <h2 className="text-base font-semibold text-foreground mb-3">How Positional Number Systems Work</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Every positional number system is defined by its <strong>radix</strong> (base) — the count of distinct digit symbols used, and the multiplier that governs each column's place value. Decimal (base 10) uses digits 0–9, and each column is worth 10× the column to its right. Binary (base 2) uses only 0 and 1, with each column worth 2× the column to its right. Hexadecimal (base 16) uses 0–9 plus A–F, with each column worth 16× the column to its right. Octal (base 8) uses digits 0–7.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed mt-2">
          To read a number in any base, multiply each digit by its place value and sum the results. Binary <strong>101010</strong> = (1×32) + (0×16) + (1×8) + (0×4) + (1×2) + (0×1) = 32 + 8 + 2 = <strong>42 decimal</strong>. In the other direction: 42 decimal = <strong>2A hexadecimal</strong> = <strong>52 octal</strong> = <strong>101010 binary</strong>.
        </p>
      </div>

      <div className="pt-8 mt-8 border-t border-border">
        <h2 className="text-base font-semibold text-foreground mb-3">The Conversion Method</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          <strong>Decimal → other base</strong> uses repeated division: divide by the target base, note the remainder, divide the quotient again, repeat until the quotient is zero, then read the remainders from bottom to top.
        </p>
        <div className="border border-border rounded-md bg-secondary p-4 mt-3 text-sm font-mono text-foreground leading-relaxed">
          42 ÷ 2 = 21 r <strong>0</strong> → 21 ÷ 2 = 10 r <strong>1</strong> → 10 ÷ 2 = 5 r <strong>0</strong> → 5 ÷ 2 = 2 r <strong>1</strong> → 2 ÷ 2 = 1 r <strong>0</strong> → 1 ÷ 2 = 0 r <strong>1</strong> → read up: <strong>101010</strong> ✓
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed mt-3">
          <strong>Other base → decimal</strong> uses positional expansion: hex FF = (15×16) + (15×1) = 240 + 15 = <strong>255</strong>. Binary 11010110 = 128+64+16+4+2 = <strong>214</strong>, which is <strong>D6</strong> in hex. The tool converts all four bases simultaneously — type in any field and the rest update instantly.
        </p>
      </div>

      <div className="pt-8 mt-8 border-t border-border">
        <h2 className="text-base font-semibold text-foreground mb-3">When to Use This Converter</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Hexadecimal is the standard notation for memory addresses, RGB color codes (#D6A3F2), byte sequences in network packets, and CPU register contents. Binary appears in bitmasking operations, hardware register documentation, and logic circuit design. Octal is less common today but appears in Unix file permission notation (chmod 755). Converting between these bases is a daily task for developers, embedded engineers, and security researchers.
        </p>
      </div>

      <div className="pt-8 mt-8 border-t border-border">
        <h2 className="text-base font-semibold text-foreground mb-3">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {[
            {
              q: 'Why does computing use binary instead of decimal?',
              a: 'Digital electronics are built from circuits with two stable states — on and off, represented as 1 and 0. Binary maps directly onto these physical states. Using binary lets hardware be constructed from simple logic gates (AND, OR, NOT) that operate on single bits, making processor design and error detection far more tractable than a decimal equivalent would allow.',
            },
            {
              q: 'What is hexadecimal used for in practice?',
              a: 'Hex is a compact representation of binary: exactly 4 binary digits (a nibble) map to one hex digit, so a full byte (8 bits) is always two hex characters. This makes hex concise where binary would be long. Hex appears in RGB color codes (#FF6B6B), memory dumps, cryptographic hashes (SHA-256 produces 64 hex characters), IPv6 addresses, and Unicode code points (U+1F600).',
            },
            {
              q: 'How do I convert binary to hex quickly without going through decimal?',
              a: 'Split the binary number into groups of 4 bits from the right, then convert each group to its hex digit. Example: binary 1101 0110 → 1101 = 13 = D, 0110 = 6 = 6 → hex D6. This works because 2⁴ = 16, so one hex digit represents exactly one 4-bit nibble. No intermediate decimal step is needed.',
            },
            {
              q: 'What is the largest number a given number of bits can represent?',
              a: 'An n-bit unsigned integer covers 0 to 2ⁿ − 1. For 8 bits: 2⁸ − 1 = 255 (0xFF). For 16 bits: 2¹⁶ − 1 = 65,535 (0xFFFF). For 32 bits: 2³² − 1 = 4,294,967,295 (0xFFFFFFFF). Signed integers split the range: an 8-bit signed integer covers −128 to +127 using two\'s complement representation.',
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
