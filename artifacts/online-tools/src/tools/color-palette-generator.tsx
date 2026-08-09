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

      {/* ── Educational content ───────────────────────────────────────── */}
      <div className="pt-8 mt-8 border-t border-border space-y-0">

        {/* Section 1 — How Color Harmony Works */}
        <div>
          <h2 className="text-base font-semibold text-foreground mb-3">How Color Harmony Works</h2>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Color harmony is the principle that certain combinations of hues feel visually
              balanced rather than jarring. It is rooted in the geometry of the color wheel — a
              circular arrangement where hues are positioned by wavelength, measured as a degree
              from 0 to 360. Colors that share a predictable geometric relationship on the wheel
              tend to work well together because they provide structured contrast without
              random conflict.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Each harmony scheme exploits a different geometry. Complementary colors sit 180°
              apart and create maximum contrast — the visual tension of blue against orange, or
              red against green. Analogous colors cluster within about 60° of each other, sharing
              adjacent hues that feel cohesive and calm. Triadic schemes pick three hues evenly
              spaced 120° apart, producing vibrant variety while maintaining balance.
              Split-complementary schemes position two accent colors at 150° and 210° from the
              base, softening the high contrast of a pure complementary pair into something
              more approachable.
            </p>
          </div>
        </div>

        {/* Section 2 — How Palettes Are Generated */}
        <div className="pt-8 mt-8 border-t border-border">
          <h2 className="text-base font-semibold text-foreground mb-3">How Palettes Are Generated</h2>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              The generator reads your base color's hue angle and derives four additional colors
              according to the scheme's geometry. All generated colors inherit the saturation and
              lightness of your base — only the hue shifts, keeping the palette tonally consistent.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              <span className="font-medium text-foreground">Example:</span> starting from blue
              (#3B82F6, hue ≈ 217°), the complementary scheme places its primary accent at 37°
              (orange) — exactly 180° away. The triadic scheme on the same base would instead
              produce hues near 337° (red-violet) and 97° (yellow-green), the three vertices of
              an equilateral triangle on the wheel. Switching schemes on the same base color
              completely changes the palette's emotional character while keeping saturation and
              tone identical.
            </p>
          </div>
        </div>

        {/* Section 3 — When to Use Each Scheme */}
        <div className="pt-8 mt-8 border-t border-border">
          <h2 className="text-base font-semibold text-foreground mb-3">When to Use Each Scheme</h2>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Use the complementary scheme when you need high contrast — a hero banner, a
              call-to-action button against a background, or a data visualization where two
              categories must be clearly distinct. Analogous palettes suit designs that need to
              feel calm and unified: photography portfolios, wellness brands, editorial layouts.
              Triadic schemes work well for playful interfaces or anywhere you want variety
              without arbitrary color choices. Split-complementary is a practical middle ground
              when a complementary pair feels too visually intense.
            </p>
          </div>
        </div>

        {/* Section 4 — FAQ */}
        <div className="pt-8 mt-8 border-t border-border">
          <h2 className="text-base font-semibold text-foreground mb-3">
            Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            {[
              {
                q: "What's the difference between complementary and analogous colors?",
                a: 'Complementary colors are directly opposite each other on the color wheel — 180° apart. They maximize contrast and make each other appear more vivid when placed side by side. Analogous colors are adjacent on the wheel, within about 60° of each other, sharing similar hues for a harmonious, low-tension look. Complementary schemes suit contrast-driven design; analogous schemes suit cohesive, subtle palettes.',
              },
              {
                q: 'How many colors should a well-designed palette have?',
                a: "Most design systems work with 3 to 5 colors: a primary, a secondary or accent, and one or two neutrals. Going beyond 5 colors without a clear organizational system tends to create visual noise. This generator always produces 5 colors per scheme, but you don't have to use all five — choose the two or three that best serve your specific design need.",
              },
              {
                q: 'What is the difference between HSL, RGB, and Hex?',
                a: 'All three formats describe the same color differently. Hex (#RRGGBB) encodes red, green, and blue as a six-character hexadecimal string — the most common format in web design. RGB expresses the same three channels as decimal values from 0 to 255. HSL (Hue, Saturation, Lightness) is more intuitive for designers: hue as a degree on the color wheel, saturation as intensity, and lightness as how bright or dark the color is.',
              },
              {
                q: 'How do I choose a good base color?',
                a: "Start with the most distinctive color in your brand or subject matter. Avoid near-neutral bases with very low saturation — harmony schemes operate on hue angle, so a grey or near-white base produces a palette of near-greys regardless of which scheme you pick. To anchor a palette in a mood, map it roughly: blues and greens for calm or trust, reds and oranges for energy or urgency, purples for creativity or depth.",
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
