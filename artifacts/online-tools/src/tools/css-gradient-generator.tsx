import { useState, useId } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Copy, Check } from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

type GradientType = 'linear' | 'radial';

interface Stop {
  id: number;
  color: string;
  position: number; // 0–100
}

// ── Helpers ───────────────────────────────────────────────────────────────────

let nextId = 1;
const newStop = (color: string, position: number): Stop => ({ id: nextId++, color, position });

/** Auto-distribute positions evenly across all stops. */
function distributePositions(stops: Stop[]): Stop[] {
  return stops.map((s, i) => ({
    ...s,
    position: stops.length === 1 ? 0 : Math.round((i / (stops.length - 1)) * 100),
  }));
}

/** Build the CSS gradient string from current state. */
function buildCss(type: GradientType, angle: number, stops: Stop[]): string {
  const stopStr = stops
    .slice()
    .sort((a, b) => a.position - b.position)
    .map(s => `${s.color} ${s.position}%`)
    .join(', ');

  return type === 'linear'
    ? `background: linear-gradient(${angle}deg, ${stopStr});`
    : `background: radial-gradient(circle, ${stopStr});`;
}

// ── Toggle button class ───────────────────────────────────────────────────────

function toggleClass(active: boolean, border = false): string {
  return [
    'px-3 h-12 text-sm font-medium transition-colors',
    border ? 'border-l border-border' : '',
    active
      ? 'bg-[hsl(221,39%,11%)] text-white'
      : 'bg-background text-muted-foreground hover:text-foreground',
  ]
    .filter(Boolean)
    .join(' ');
}

// ── Angle slider ──────────────────────────────────────────────────────────────

function AngleSlider({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>Angle</Label>
        <span className="text-sm font-mono text-muted-foreground">{value}°</span>
      </div>
      <input
        type="range"
        min={0}
        max={359}
        step={1}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-full accent-primary cursor-pointer"
        aria-label="Gradient angle"
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>0° (↑)</span>
        <span>90° (→)</span>
        <span>180° (↓)</span>
        <span>270° (←)</span>
      </div>
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function CssGradientGenerator() {
  const uid = useId();

  const [type,   setType]   = useState<GradientType>('linear');
  const [angle,  setAngle]  = useState(135);
  const [stops,  setStops]  = useState<Stop[]>([
    newStop('#3b82f6', 0),
    newStop('#8b5cf6', 100),
  ]);
  const [copied, setCopied] = useState(false);

  // ── Stop operations ─────────────────────────────────────────────────────────

  const addStop = () => {
    // Insert a new stop at the midpoint of the largest gap
    const sorted = [...stops].sort((a, b) => a.position - b.position);
    let maxGap = -1, insertPos = 50;
    for (let i = 0; i < sorted.length - 1; i++) {
      const gap = sorted[i + 1].position - sorted[i].position;
      if (gap > maxGap) {
        maxGap = gap;
        insertPos = Math.round((sorted[i].position + sorted[i + 1].position) / 2);
      }
    }
    // Interpolate color between the two adjacent stops
    const lo = sorted.find(s => s.position <= insertPos) ?? sorted[0];
    setStops(prev => [...prev, newStop(lo.color, insertPos)]);
  };

  const removeStop = (id: number) => {
    if (stops.length <= 2) return;
    setStops(prev => prev.filter(s => s.id !== id));
  };

  const updateColor = (id: number, color: string) => {
    setStops(prev => prev.map(s => s.id === id ? { ...s, color } : s));
  };

  const updatePosition = (id: number, pos: number) => {
    const clamped = Math.max(0, Math.min(100, pos));
    setStops(prev => prev.map(s => s.id === id ? { ...s, position: clamped } : s));
  };

  const redistribute = () => setStops(prev => distributePositions(prev));

  // ── CSS output ──────────────────────────────────────────────────────────────

  const css = buildCss(type, angle, stops);

  // Preview style (without the "background:" keyword)
  const previewStyle =
    type === 'linear'
      ? `linear-gradient(${angle}deg, ${stops.slice().sort((a,b)=>a.position-b.position).map(s=>`${s.color} ${s.position}%`).join(', ')})`
      : `radial-gradient(circle, ${stops.slice().sort((a,b)=>a.position-b.position).map(s=>`${s.color} ${s.position}%`).join(', ')})`;

  const copyCSS = () => {
    navigator.clipboard.writeText(css);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="space-y-6">

      {/* ── Type toggle ──────────────────────────────────────────────────── */}
      <div className="space-y-2">
        <Label>Gradient Type</Label>
        <div className="flex rounded-md border border-border overflow-hidden">
          <button
            type="button"
            onClick={() => setType('linear')}
            className={toggleClass(type === 'linear')}
            style={{ flex: 1 }}
          >
            Linear
          </button>
          <button
            type="button"
            onClick={() => setType('radial')}
            className={toggleClass(type === 'radial', true)}
            style={{ flex: 1 }}
          >
            Radial
          </button>
        </div>
      </div>

      {/* ── Angle (linear only) ──────────────────────────────────────────── */}
      {type === 'linear' && (
        <AngleSlider value={angle} onChange={setAngle} />
      )}

      {/* ── Live preview ─────────────────────────────────────────────────── */}
      <div className="space-y-2">
        <Label>Preview</Label>
        <div
          className="w-full h-32 md:h-40 rounded-lg border border-border"
          style={{ background: previewStyle }}
          aria-label="Gradient preview"
        />
      </div>

      {/* ── Color stops ──────────────────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Color Stops ({stops.length})</Label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={redistribute}
              className="text-xs px-2 py-1 rounded border border-border hover:bg-accent transition-colors"
              title="Distribute stops evenly"
            >
              Redistribute
            </button>
            <button
              type="button"
              onClick={addStop}
              className="text-xs px-2 py-1 rounded border border-border hover:bg-accent transition-colors flex items-center gap-1"
            >
              <Plus className="h-3 w-3" /> Add stop
            </button>
          </div>
        </div>

        <div className="space-y-2">
          {stops
            .slice()
            .sort((a, b) => a.position - b.position)
            .map((stop, idx) => (
              <div key={stop.id} className="flex items-center gap-2">
                {/* Color picker swatch */}
                <label
                  htmlFor={`${uid}-stop-${stop.id}-picker`}
                  className="w-10 h-10 rounded-md border border-input cursor-pointer shrink-0 overflow-hidden"
                  style={{ background: stop.color }}
                  title="Click to change color"
                />
                <input
                  id={`${uid}-stop-${stop.id}-picker`}
                  type="color"
                  value={stop.color}
                  onChange={e => updateColor(stop.id, e.target.value)}
                  className="sr-only"
                />

                {/* Hex text */}
                <Input
                  type="text"
                  value={stop.color}
                  onChange={e => {
                    const v = e.target.value;
                    if (/^#[0-9a-fA-F]{0,6}$/.test(v)) updateColor(stop.id, v);
                  }}
                  className="h-10 w-28 font-mono text-xs uppercase"
                  maxLength={7}
                  spellCheck={false}
                  aria-label={`Stop ${idx + 1} hex color`}
                />

                {/* Position input */}
                <div className="flex items-center gap-1 flex-1">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={stop.position}
                    onChange={e => updatePosition(stop.id, Number(e.target.value))}
                    className="flex-1 h-2 rounded accent-primary cursor-pointer"
                    aria-label={`Stop ${idx + 1} position`}
                  />
                  <div className="relative w-16 shrink-0">
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={stop.position}
                      onChange={e => {
                        const v = e.target.value;
                        if (v !== '') updatePosition(stop.id, Number(v));
                      }}
                      className="h-10 pr-5 text-xs tabular-nums"
                    />
                    <span className="absolute inset-y-0 right-0 pr-2 flex items-center text-muted-foreground text-xs pointer-events-none">%</span>
                  </div>
                </div>

                {/* Remove */}
                <button
                  type="button"
                  onClick={() => removeStop(stop.id)}
                  disabled={stops.length <= 2}
                  className="h-10 w-10 shrink-0 rounded-md border border-border flex items-center justify-center text-muted-foreground hover:text-destructive hover:border-destructive transition-colors disabled:opacity-30 disabled:pointer-events-none"
                  aria-label={`Remove stop ${idx + 1}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
        </div>
      </div>

      {/* ── CSS output ───────────────────────────────────────────────────── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>CSS Code</Label>
          <Button variant="outline" size="sm" onClick={copyCSS} className="gap-1.5">
            {copied ? <><Check className="h-3.5 w-3.5" /> Copied</> : <><Copy className="h-3.5 w-3.5" /> Copy</>}
          </Button>
        </div>
        <Card
          className="p-4 bg-muted/50 cursor-pointer hover:bg-muted/70 transition-colors"
          onClick={copyCSS}
          title="Click to copy"
          role="button"
          tabIndex={0}
          onKeyDown={e => e.key === 'Enter' && copyCSS()}
        >
          <pre className="text-sm font-mono text-foreground whitespace-pre-wrap break-all select-all">
            {css}
          </pre>
        </Card>
        <p className="text-xs text-muted-foreground">
          Click the code block or the Copy button to copy to clipboard.
          Paste directly into any CSS rule.
        </p>
      </div>

      {/* ── Educational content ───────────────────────────────────────── */}
      <div className="pt-8 mt-8 border-t border-border space-y-0">

        {/* Section 1 */}
        <div>
          <h2 className="text-base font-semibold text-foreground mb-3">How CSS Gradients Work</h2>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              A CSS gradient is a smooth transition between two or more colors generated entirely
              by the browser — no image file required. Linear gradients draw the transition along
              a straight line at a specified angle; radial gradients emanate outward from a
              center point. Both are defined by color stops: each stop specifies a color and the
              position along the gradient axis (0%–100%) where that color is fully established.
              Between stops, the browser interpolates values in the sRGB color space.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              This tool generates two formats. Linear three-stop example:{' '}
              <span className="font-mono text-xs break-all">
                background: linear-gradient(135deg, #ff6b6b 0%, #ffd93d 50%, #6bcb77 100%);
              </span>{' '}
              Radial example (circle shape):{' '}
              <span className="font-mono text-xs break-all">
                background: radial-gradient(circle, #3b82f6 0%, #8b5cf6 100%);
              </span>{' '}
              Both paste directly into any CSS <span className="font-mono text-xs">background</span> property.
            </p>
          </div>
        </div>

        {/* Section 2 */}
        <div className="pt-8 mt-8 border-t border-border">
          <h2 className="text-base font-semibold text-foreground mb-3">How Angle and Color Stops Work</h2>
          <div className="space-y-3">
            <div className="border border-border rounded-md bg-secondary p-4 space-y-2">
              {[
                ['0°', 'bottom → top  ↑'],
                ['90°', 'left → right  →'],
                ['180°', 'top → bottom  ↓'],
                ['270°', 'right → left  ←'],
                ['135°', 'top-left → bottom-right  ↘ (tool default)'],
              ].map(([deg, dir]) => (
                <p key={deg} className="text-sm text-muted-foreground leading-relaxed">
                  <span className="font-semibold text-foreground font-mono">{deg}</span> — {dir}
                </p>
              ))}
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Color stop positions are percentages of the total gradient length. A stop at 0%
              sits at the start edge; 50% is the midpoint; 100% is the end edge. Placing two
              stops close together — for example at 48% and 52% — creates a sharp-edged color
              boundary rather than a gradual blend. The "Redistribute" button spaces all stops
              evenly across the full 0%–100% range.
            </p>
          </div>
        </div>

        {/* Section 3 */}
        <div className="pt-8 mt-8 border-t border-border">
          <h2 className="text-base font-semibold text-foreground mb-3">When to Use This Generator</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            CSS gradients replace flat backgrounds wherever depth, direction, or visual hierarchy
            is needed — hero sections, button states, card backgrounds, and decorative dividers.
            Because they are rendered by the browser at display resolution, they are sharp on
            any screen density, unlike raster gradient images which can appear blurry on high-DPI
            displays. The generated <span className="font-mono text-xs">background:</span> line
            pastes directly into a stylesheet, a Tailwind arbitrary-value, or an inline style attribute.
          </p>
        </div>

        {/* Section 4 */}
        <div className="pt-8 mt-8 border-t border-border">
          <h2 className="text-base font-semibold text-foreground mb-3">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {[
              {
                q: "What's the difference between a linear and radial gradient?",
                a: "A linear gradient draws the transition along a straight line at a specified angle — the blending runs parallel to that line from edge to edge. A radial gradient draws the transition outward from a central point in all directions; this tool uses the 'circle' shape, meaning the gradient expands uniformly. Radial gradients work well for spotlight or vignette effects; linear gradients for directional color washes.",
              },
              {
                q: 'How does the angle value work in a linear gradient?',
                a: "The angle specifies the direction the gradient flows, measured clockwise from the top: 0° points upward (first color at bottom), 90° points right (first color at left), 180° points downward (first color at top), 270° points left (first color at right). Intermediate values create diagonal gradients. The tool's default of 135° flows from top-left toward bottom-right.",
              },
              {
                q: 'Can I use more than two colors?',
                a: 'Yes — "Add stop" inserts a new color stop at the midpoint of the largest existing gap, and there is no hard limit on the number of stops. Each stop has its own color and position percentage. You can create multi-step gradients with abrupt boundaries (stops placed very close together), smooth multi-color blends, or rainbow-style transitions by placing stops at evenly spaced intervals.',
              },
              {
                q: 'Why does a gradient sometimes look banded or stepped instead of smooth?',
                a: "Gradient banding occurs when the color range being interpolated contains fewer distinct values than there are pixels to fill. Most monitors display 8 bits per channel (256 levels per R, G, B), so a very subtle gradient spanning a narrow color range across many pixels can exhaust distinct RGB values before reaching the far edge — producing visible steps. Banding is most common in low-contrast gradients (nearly identical shades of the same hue) on large surfaces. Widening the color range or adding slight noise can reduce it.",
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
