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

      {/* ── Educational content ───────────────────────────────────────── */}
      <div className="pt-8 mt-8 border-t border-border space-y-0">

        {/* Section 1 */}
        <div>
          <h2 className="text-base font-semibold text-foreground mb-3">What Makes a Password Resistant to Attack</h2>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Password resistance is measured in entropy — how many guesses an attacker would need
              to exhaust all possibilities. The formula is{' '}
              <span className="font-semibold text-foreground">H = L × log₂(N)</span>, where H is
              entropy in bits, L is the password length, and N is the character set size (the number
              of distinct characters the attacker must consider at each position).
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              When all four sets are enabled, this generator draws from a pool of{' '}
              <span className="font-semibold text-foreground">88 characters</span>: 26 uppercase
              (A–Z), 26 lowercase (a–z), 10 digits (0–9), and 26 symbols
              (<span className="font-mono text-xs">!@#$%^&amp;*()-_=+[]{}|;:,.&lt;&gt;?</span>).
              A <span className="font-semibold text-foreground">16-character</span> password from
              the full pool has entropy of 16 × log₂(88) ={' '}
              <span className="font-semibold text-foreground">103.4 bits</span>. A 12-character
              password gives <span className="font-semibold text-foreground">77.5 bits</span>. By
              comparison, an 8-character lowercase-only password has 37.6 bits — roughly 209 billion
              combinations, a number modern hardware can search in hours.
            </p>
          </div>
        </div>

        {/* Section 2 */}
        <div className="pt-8 mt-8 border-t border-border">
          <h2 className="text-base font-semibold text-foreground mb-3">How Passwords Are Generated</h2>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              The tool uses the browser's{' '}
              <span className="font-mono text-xs">crypto.getRandomValues()</span> API — a
              cryptographically secure random number generator (CSPRNG) seeded by the operating
              system. This is categorically different from{' '}
              <span className="font-mono text-xs">Math.random()</span>, which is a pseudorandom
              generator not suitable for security purposes.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The algorithm guarantees at least one character from each enabled set. Required
              characters are selected first; the remaining positions fill from the full pool;
              then the complete set is shuffled using a Fisher-Yates algorithm that also draws
              from <span className="font-mono text-xs">crypto.getRandomValues()</span> at every
              swap — preventing the required characters from appearing in predictable positions.
            </p>
          </div>
        </div>

        {/* Section 3 */}
        <div className="pt-8 mt-8 border-t border-border">
          <h2 className="text-base font-semibold text-foreground mb-3">When to Use This Generator</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            This tool is suited to generating passwords for any account that requires uniqueness
            and randomness — especially where dictionary words or personal information must be
            avoided. Because generated passwords are not stored anywhere, the practical workflow
            is to generate here and immediately paste into a password manager, which handles
            storage and recall. Lengths above 20 characters provide entropy headroom against
            possible future increases in attacker computing speed.
          </p>
        </div>

        {/* Section 4 */}
        <div className="pt-8 mt-8 border-t border-border">
          <h2 className="text-base font-semibold text-foreground mb-3">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {[
              {
                q: 'How long should a password be?',
                a: "Length is the single largest contributor to entropy. A 16-character password from the full 88-character pool (103.4 bits) is highly resistant to brute-force attack by any practical computing resource. NIST guidelines (SP 800-63B) emphasize length over complexity; a 20-character password from even a smaller character set provides more entropy than a short complex one.",
              },
              {
                q: 'Does adding special characters actually help?',
                a: "Yes, but less than adding length. Expanding from lowercase-only (26 chars, 4.70 bits/char) to the full 88-character pool (6.46 bits/char) is a 37% increase per character. Adding one more character to the password adds the full 6.46 bits — equivalent to more than doubling the character set. Both help, but length scales linearly while character set size has diminishing returns once the pool is reasonably large.",
              },
              {
                q: 'What is password entropy?',
                a: "Entropy, measured in bits, describes how unpredictable a password is, assuming the attacker knows the generation method (length and character set) but not the specific password. Each additional bit of entropy doubles the number of guesses required. At 103.4 bits, the number of possible 16-character passwords from this tool's pool is 2^103.4 ≈ 1.29 × 10³¹ — beyond the reach of any foreseeable exhaustive search.",
              },
              {
                q: 'Should I use a password manager instead of memorizing passwords?',
                a: "For most people, yes. Password managers store, recall, and often generate passwords, meaning each account can have a unique, fully random password without memorization. The security model shifts to protecting one strong master password rather than many weaker ones. The passwords this tool generates are intentionally designed to be unmemorizable; saving them immediately to a password manager is the intended workflow.",
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
