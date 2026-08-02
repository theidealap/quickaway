import { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Palette } from 'lucide-react';
import { ToolResultBadge } from '@/components/tool-result-badge';

// ── Color math ────────────────────────────────────────────────────────────────

/** Parse a 6-digit hex color (#rrggbb) into [r, g, b] 0-255. */
function hexToRgb(hex: string): [number, number, number] | null {
  const clean = hex.replace(/^#/, '');
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) return null;
  const n = parseInt(clean, 16);
  return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff];
}

/** Convert [r, g, b] 0-255 → [h, s, l] with h in 0-360, s/l in 0-100. */
function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;

  if (max === min) return [0, 0, Math.round(l * 100)];

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if      (max === rn) h = (gn - bn) / d + (gn < bn ? 6 : 0);
  else if (max === gn) h = (bn - rn) / d + 2;
  else                 h = (rn - gn) / d + 4;

  return [Math.round(h * 60), Math.round(s * 100), Math.round(l * 100)];
}

/** Convert [h, s, l] (h: 0-360, s/l: 0-100) → 6-digit lowercase hex. */
function hslToHex(h: number, s: number, l: number): string {
  // Normalise h to 0-360
  h = ((h % 360) + 360) % 360;
  const sn = s / 100, ln = l / 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = sn * Math.min(ln, 1 - ln);
  const f = (n: number) =>
    Math.round((ln - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))) * 255);
  return '#' + [f(0), f(8), f(4)].map(v => v.toString(16).padStart(2, '0')).join('');
}

/** Ensure a foreground colour (black or white) is readable against `bgHex`. */
function contrastColor(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return '#000000';
  const [r, g, b] = rgb;
  // Relative luminance (WCAG formula)
  const toLinear = (c: number) => { const cn = c / 255; return cn <= 0.04045 ? cn / 12.92 : Math.pow((cn + 0.055) / 1.055, 2.4); };
  const L = 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
  return L > 0.179 ? '#000000' : '#ffffff';
}

// ── Harmony schemes ───────────────────────────────────────────────────────────

type Scheme = 'complementary' | 'analogous' | 'triadic' | 'split-complementary';

const SCHEMES: { value: Scheme; label: string; desc: string }[] = [
  { value: 'complementary',      label: 'Complementary',      desc: 'Base + opposite on the wheel'       },
  { value: 'analogous',          label: 'Analogous',          desc: '5 adjacent hues (±60°)'             },
  { value: 'triadic',            label: 'Triadic',            desc: '3 evenly spaced hues (120°)'        },
  { value: 'split-complementary',label: 'Split Comp.',        desc: 'Base + two near-complements (±150°)'},
];

/**
 * Generate 5 harmonious hex colours for the given scheme.
 * S and L are inherited from the base color, hue shifts follow the scheme.
 */
function generatePalette(baseHex: string, scheme: Scheme): string[] {
  const rgb = hexToRgb(baseHex);
  if (!rgb) return [];
  const [h, s, l] = rgbToHsl(...rgb);

  // Clamp L so swatches aren't too dark/light to differentiate
  const ls = Math.max(20, Math.min(80, l));
  const ss = Math.max(30, s);

  const gen = (hues: number[]) => hues.map(dh => hslToHex(h + dh, ss, ls));

  switch (scheme) {
    case 'complementary':
      // Base, near-base +30, midpoint +90, complement +180, near-complement +210
      return gen([0, 30, 90, 180, 210]);

    case 'analogous':
      // −60, −30, base, +30, +60
      return gen([-60, -30, 0, 30, 60]);

    case 'triadic':
      // 3 triadic vertices (0, 120, 240) + 2 halfway points (60, 300)
      return gen([0, 60, 120, 240, 300]);

    case 'split-complementary':
      // Base, split-complement 1 (+150), split-complement 2 (+210), plus +30 and −30 to pad to 5
      return gen([0, 30, 150, 210, 330]);
  }
}

// ── Toggle button class ───────────────────────────────────────────────────────

function toggleClass(active: boolean, border = false): string {
  return [
    'px-3 h-9 text-xs font-medium transition-colors',
    border ? 'border-l border-border' : '',
    active
      ? 'bg-[hsl(221,39%,11%)] text-white'
      : 'bg-background text-muted-foreground hover:text-foreground',
  ]
    .filter(Boolean)
    .join(' ');
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ColorPaletteGenerator() {
  const [baseHex, setBaseHex] = useState('#3b82f6');
  const [hexInput, setHexInput] = useState('#3b82f6');
  const [scheme, setScheme]   = useState<Scheme>('complementary');
  const [copied, setCopied]   = useState<string | null>(null);

  // Sync hex text → picker
  const handleHexInput = (raw: string) => {
    setHexInput(raw);
    const normalised = raw.startsWith('#') ? raw : `#${raw}`;
    if (/^#[0-9a-fA-F]{6}$/.test(normalised)) {
      setBaseHex(normalised.toLowerCase());
    }
  };

  // Sync picker → hex text
  const handlePickerChange = (val: string) => {
    setBaseHex(val);
    setHexInput(val);
  };

  const palette = generatePalette(baseHex, scheme);

  const copyColor = useCallback((hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopied(hex);
    setTimeout(() => setCopied(null), 1500);
  }, []);

  const copyAll = () => {
    navigator.clipboard.writeText(palette.join(', '));
    setCopied('__all__');
    setTimeout(() => setCopied(null), 1500);
  };

  // Scheme description
  const currentScheme = SCHEMES.find(s => s.value === scheme)!;

  return (
    <div className="space-y-6">

      {/* ── Inputs ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

        {/* Base color picker + hex input */}
        <div className="space-y-2">
          <Label>Base Color</Label>
          <div className="flex items-center gap-2">
            {/* Native color picker — styled as a swatch button */}
            <label
              htmlFor="cpg-picker"
              className="w-12 h-12 rounded-md border border-input cursor-pointer shrink-0 overflow-hidden"
              style={{ background: baseHex }}
              title="Click to open color picker"
              aria-label="Base color picker"
            />
            <input
              id="cpg-picker"
              type="color"
              value={baseHex}
              onChange={e => handlePickerChange(e.target.value)}
              className="sr-only"
            />
            <div className="relative flex-1">
              <Input
                id="cpg-hex"
                type="text"
                value={hexInput}
                maxLength={7}
                placeholder="#3b82f6"
                onChange={e => handleHexInput(e.target.value)}
                className="h-12 font-mono uppercase"
                spellCheck={false}
              />
            </div>
          </div>
        </div>

        {/* Harmony scheme */}
        <div className="space-y-2">
          <Label>Harmony Scheme</Label>
          <div className="flex rounded-md border border-border overflow-hidden">
            {SCHEMES.map((s, i) => (
              <button
                key={s.value}
                type="button"
                onClick={() => setScheme(s.value)}
                className={toggleClass(scheme === s.value, i > 0)}
                style={{ flex: 1 }}
                title={s.desc}
              >
                {s.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">{currentScheme.desc}</p>
        </div>

      </div>

      {/* ── Palette ──────────────────────────────────────────────────────── */}
      <div className="pt-2">
        <Card className="relative overflow-hidden">
          <ToolResultBadge label="Generated" />
          {/* Color bar preview */}
          <div className="flex h-20 md:h-24">
            {palette.map((hex, i) => (
              <div key={i} className="flex-1" style={{ background: hex }} />
            ))}
          </div>

          {/* Swatch grid */}
          <div className="grid grid-cols-5 divide-x divide-border border-t border-border">
            {palette.map((hex, i) => {
              const isCopied = copied === hex;
              const fg = contrastColor(hex);
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => copyColor(hex)}
                  className="group flex flex-col items-center gap-1 py-4 px-1 hover:bg-accent/50 transition-colors relative"
                  title={`Copy ${hex}`}
                  aria-label={`Copy color ${hex}`}
                >
                  {/* Swatch circle */}
                  <div
                    className="w-10 h-10 rounded-full border border-border/30 mb-1 flex items-center justify-center transition-transform group-hover:scale-105"
                    style={{ background: hex }}
                  >
                    {isCopied && (
                      <span style={{ color: fg, fontSize: '14px' }}>✓</span>
                    )}
                  </div>
                  {/* Hex label */}
                  <span className="text-[10px] md:text-xs font-mono text-muted-foreground uppercase tracking-wide">
                    {isCopied ? 'Copied!' : hex}
                  </span>
                  {/* Index label */}
                  <span className="text-[10px] text-muted-foreground/60">
                    {['Base', '+2', '+3', '+4', '+5'][i]}
                  </span>
                </button>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Copy all */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="text-xs text-muted-foreground">
          Click any swatch to copy its hex code.
          {' '}Hue shifts follow the <strong>{currentScheme.label}</strong> harmony.
        </p>
        <button
          type="button"
          onClick={copyAll}
          className="text-xs px-3 py-1.5 rounded-md border border-border hover:bg-accent transition-colors"
        >
          {copied === '__all__' ? '✓ Copied all' : 'Copy all (CSV)'}
        </button>
      </div>

      {/* Palette detail table */}
      <Card className="overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <p className="text-sm font-semibold">Palette Details</p>
        </div>
        <div className="divide-y divide-border">
          {palette.map((hex, i) => {
            const rgb = hexToRgb(hex)!;
            const [h, s, l] = rgbToHsl(...rgb);
            return (
              <div key={i} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                <div
                  className="w-6 h-6 rounded shrink-0 border border-border/30"
                  style={{ background: hex }}
                />
                <span className="font-mono w-20 text-xs uppercase">{hex}</span>
                <span className="text-muted-foreground text-xs flex-1 tabular-nums">
                  rgb({rgb[0]}, {rgb[1]}, {rgb[2]}) · hsl({h}°, {s}%, {l}%)
                </span>
                <button
                  type="button"
                  onClick={() => copyColor(hex)}
                  className="text-xs text-primary hover:underline shrink-0"
                >
                  {copied === hex ? '✓' : 'Copy'}
                </button>
              </div>
            );
          })}
        </div>
      </Card>

    </div>
  );
}
