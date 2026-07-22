import { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Copy, RefreshCw, ShieldCheck, ShieldAlert, ShieldOff, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const CHARS = {
  upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lower: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*()-_=+[]{}|;:,.<>?',
};

function generatePassword(
  length: number,
  opts: { upper: boolean; lower: boolean; numbers: boolean; symbols: boolean }
): string {
  const pool = [
    opts.upper ? CHARS.upper : '',
    opts.lower ? CHARS.lower : '',
    opts.numbers ? CHARS.numbers : '',
    opts.symbols ? CHARS.symbols : '',
  ].join('');

  if (!pool) return '';

  // Guarantee at least one character from each selected set
  const required: string[] = [];
  if (opts.upper) required.push(pick(CHARS.upper));
  if (opts.lower) required.push(pick(CHARS.lower));
  if (opts.numbers) required.push(pick(CHARS.numbers));
  if (opts.symbols) required.push(pick(CHARS.symbols));

  const rest = Array.from({ length: length - required.length }, () => pick(pool));
  return shuffle([...required, ...rest]).join('');
}

function pick(str: string): string {
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  return str[arr[0] % str.length];
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    const j = buf[0] % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

type Strength = 'Weak' | 'Fair' | 'Strong' | 'Very Strong';

function getStrength(
  length: number,
  opts: { upper: boolean; lower: boolean; numbers: boolean; symbols: boolean }
): Strength {
  const sets = [opts.upper, opts.lower, opts.numbers, opts.symbols].filter(Boolean).length;
  const score = length * 0.4 + sets * 5;
  if (score < 14) return 'Weak';
  if (score < 22) return 'Fair';
  if (score < 30) return 'Strong';
  return 'Very Strong';
}

const STRENGTH_CONFIG: Record<Strength, { color: string; bar: string; icon: typeof ShieldCheck }> = {
  'Weak':        { color: 'text-destructive', bar: 'bg-destructive',  icon: ShieldOff   },
  'Fair':        { color: 'text-orange-500',  bar: 'bg-orange-500',   icon: ShieldAlert },
  'Strong':      { color: 'text-emerald-500', bar: 'bg-emerald-500',  icon: ShieldCheck },
  'Very Strong': { color: 'text-primary',     bar: 'bg-primary',      icon: ShieldCheck },
};
const STRENGTH_WIDTH: Record<Strength, string> = {
  'Weak': 'w-1/4', 'Fair': 'w-2/4', 'Strong': 'w-3/4', 'Very Strong': 'w-full',
};

export default function PasswordGenerator() {
  const { toast } = useToast();
  const [length, setLength] = useState(8);
  const [opts, setOpts] = useState({ upper: true, lower: true, numbers: true, symbols: true });
  const [password, setPassword] = useState(() =>
    generatePassword(8, { upper: true, lower: true, numbers: true, symbols: true })
  );

  const regen = useCallback(() => {
    setPassword(generatePassword(length, opts));
  }, [length, opts]);

  const toggle = (key: keyof typeof opts) => {
    const next = { ...opts, [key]: !opts[key] };
    const active = Object.values(next).filter(Boolean).length;
    if (active === 0) return; // keep at least one set active
    setOpts(next);
    setPassword(generatePassword(length, next));
  };

  const changeLength = (val: number[]) => {
    const l = val[0];
    setLength(l);
    setPassword(generatePassword(l, opts));
  };

  const copy = () => {
    if (!password) return;
    // Trim defensively to guarantee no leading/trailing whitespace is copied
    navigator.clipboard.writeText(password.trim());
    toast({ title: 'Password copied', description: 'Saved to your clipboard.', duration: 2000 });
  };

  const anyActive = Object.values(opts).some(Boolean);
  const strength = anyActive ? getStrength(length, opts) : 'Weak';
  const sc = STRENGTH_CONFIG[strength];
  const StrengthIcon = sc.icon;

  return (
    <div className="space-y-6">
      {/* Output */}
      <Card className="p-6 bg-primary/5 border-primary/20">
        <div className="flex items-center gap-3">
          <Lock className="w-5 h-5 text-muted-foreground shrink-0" />
          <span
            className="flex-1 font-mono text-base md:text-lg font-semibold tracking-widest break-all select-all text-foreground"
            aria-label="Generated password"
          >
            {password || <span className="text-muted-foreground italic font-sans font-normal text-sm">Select at least one character set</span>}
          </span>
        </div>
        <div className="flex gap-2 mt-4">
          <Button variant="outline" size="sm" onClick={copy} disabled={!password} className="flex-1 sm:flex-none">
            <Copy className="w-4 h-4 mr-2" /> Copy
          </Button>
          <Button variant="secondary" size="sm" onClick={regen} disabled={!anyActive} className="flex-1 sm:flex-none">
            <RefreshCw className="w-4 h-4 mr-2" /> Regenerate
          </Button>
        </div>
      </Card>

      {/* Strength bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Password strength</span>
          <span className={`font-semibold flex items-center gap-1.5 ${sc.color}`}>
            <StrengthIcon className="w-4 h-4" /> {strength}
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-300 ${sc.bar} ${STRENGTH_WIDTH[strength]}`} />
        </div>
      </div>

      {/* Length */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-base">Length</Label>
          <span className="text-2xl font-bold font-display text-primary w-10 text-right">{length}</span>
        </div>
        <Slider
          min={4}
          max={64}
          step={1}
          value={[length]}
          onValueChange={changeLength}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>4</span><span>64</span>
        </div>
      </div>

      {/* Character sets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {(
          [
            { key: 'upper',   label: 'Uppercase letters', example: 'A–Z'  },
            { key: 'lower',   label: 'Lowercase letters', example: 'a–z'  },
            { key: 'numbers', label: 'Numbers',            example: '0–9'  },
            { key: 'symbols', label: 'Symbols',            example: '!@#…' },
          ] as const
        ).map(({ key, label, example }) => (
          <div
            key={key}
            className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${
              opts[key] ? 'border-primary/40 bg-primary/5' : 'border-border bg-card'
            }`}
          >
            <div>
              <p className="text-sm font-medium">{label}</p>
              <p className="text-xs text-muted-foreground font-mono">{example}</p>
            </div>
            <Switch
              checked={opts[key]}
              onCheckedChange={() => toggle(key)}
              aria-label={`Toggle ${label}`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
