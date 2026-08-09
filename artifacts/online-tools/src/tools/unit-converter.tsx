import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeftRight, Ruler } from 'lucide-react';
import { ToolEmptyState } from '@/components/tool-empty-state';
import { ToolResultBadge } from '@/components/tool-result-badge';

type CategoryKey = 'length' | 'weight' | 'temperature' | 'area' | 'volume';

interface UnitDef {
  key: string;
  label: string;
  // factor to convert this unit to the category's base unit (ignored for temperature)
  toBase: number;
}

const UNIT_DATA: Record<CategoryKey, { label: string; units: UnitDef[] }> = {
  length: {
    label: 'Length',
    units: [
      { key: 'mm', label: 'Millimeters (mm)', toBase: 0.001 },
      { key: 'cm', label: 'Centimeters (cm)', toBase: 0.01 },
      { key: 'm', label: 'Meters (m)', toBase: 1 },
      { key: 'km', label: 'Kilometers (km)', toBase: 1000 },
      { key: 'in', label: 'Inches (in)', toBase: 0.0254 },
      { key: 'ft', label: 'Feet (ft)', toBase: 0.3048 },
      { key: 'yd', label: 'Yards (yd)', toBase: 0.9144 },
      { key: 'mi', label: 'Miles (mi)', toBase: 1609.344 },
    ],
  },
  weight: {
    label: 'Weight',
    units: [
      { key: 'mg', label: 'Milligrams (mg)', toBase: 0.001 },
      { key: 'g', label: 'Grams (g)', toBase: 1 },
      { key: 'kg', label: 'Kilograms (kg)', toBase: 1000 },
      { key: 'oz', label: 'Ounces (oz)', toBase: 28.349523125 },
      { key: 'lb', label: 'Pounds (lb)', toBase: 453.59237 },
      { key: 't', label: 'Metric Tons (t)', toBase: 1_000_000 },
    ],
  },
  temperature: {
    label: 'Temperature',
    units: [
      { key: 'c', label: 'Celsius (°C)', toBase: 1 },
      { key: 'f', label: 'Fahrenheit (°F)', toBase: 1 },
      { key: 'k', label: 'Kelvin (K)', toBase: 1 },
    ],
  },
  area: {
    label: 'Area',
    units: [
      { key: 'sqm', label: 'Square Meters (m²)', toBase: 1 },
      { key: 'sqkm', label: 'Square Kilometers (km²)', toBase: 1_000_000 },
      { key: 'sqft', label: 'Square Feet (ft²)', toBase: 0.09290304 },
      { key: 'sqyd', label: 'Square Yards (yd²)', toBase: 0.83612736 },
      { key: 'acre', label: 'Acres', toBase: 4046.8564224 },
      { key: 'hectare', label: 'Hectares', toBase: 10000 },
    ],
  },
  volume: {
    label: 'Volume',
    units: [
      { key: 'ml', label: 'Milliliters (mL)', toBase: 0.001 },
      { key: 'l', label: 'Liters (L)', toBase: 1 },
      { key: 'gal', label: 'US Gallons (gal)', toBase: 3.785411784 },
      { key: 'qt', label: 'US Quarts (qt)', toBase: 0.946352946 },
      { key: 'cup', label: 'US Cups', toBase: 0.2365882365 },
      { key: 'flOz', label: 'US Fluid Ounces (fl oz)', toBase: 0.0295735296 },
    ],
  },
};

function celsiusToUnit(c: number, unit: string): number {
  if (unit === 'c') return c;
  if (unit === 'f') return (c * 9) / 5 + 32;
  return c + 273.15; // k
}

function unitToCelsius(value: number, unit: string): number {
  if (unit === 'c') return value;
  if (unit === 'f') return ((value - 32) * 5) / 9;
  return value - 273.15; // k
}

export default function UnitConverter() {
  const [category, setCategory] = useState<CategoryKey>('length');
  const [fromUnit, setFromUnit] = useState(UNIT_DATA.length.units[0].key);
  const [toUnit, setToUnit] = useState(UNIT_DATA.length.units[2].key);
  const [value, setValue] = useState('');

  const handleCategoryChange = (cat: CategoryKey) => {
    setCategory(cat);
    setFromUnit(UNIT_DATA[cat].units[0].key);
    setToUnit(UNIT_DATA[cat].units[1]?.key ?? UNIT_DATA[cat].units[0].key);
    setValue('');
  };

  const units = UNIT_DATA[category].units;

  const result = useMemo(() => {
    const num = parseFloat(value);
    if (isNaN(num)) return null;

    if (category === 'temperature') {
      const celsius = unitToCelsius(num, fromUnit);
      return celsiusToUnit(celsius, toUnit);
    }

    const fromDef = units.find((u) => u.key === fromUnit);
    const toDef = units.find((u) => u.key === toUnit);
    if (!fromDef || !toDef) return null;
    const base = num * fromDef.toBase;
    return base / toDef.toBase;
  }, [value, fromUnit, toUnit, category, units]);

  const handleSwap = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
  };

  const formatResult = (n: number) => {
    if (!isFinite(n)) return '—';
    const rounded = Math.round(n * 1_000_000) / 1_000_000;
    return rounded.toLocaleString(undefined, { maximumFractionDigits: 6 });
  };

  const fromLabel = units.find((u) => u.key === fromUnit)?.label ?? fromUnit;
  const toLabel = units.find((u) => u.key === toUnit)?.label ?? toUnit;

  return (
    <div className="space-y-6">
      <Tabs value={category} onValueChange={(v) => handleCategoryChange(v as CategoryKey)}>
        <TabsList className="grid grid-cols-3 md:grid-cols-5 w-full h-auto p-1 gap-1">
          {(Object.keys(UNIT_DATA) as CategoryKey[]).map((key) => (
            <TabsTrigger key={key} value={key} className="py-2.5 text-sm">
              {UNIT_DATA[key].label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-end">
        <div className="space-y-2">
          <Label htmlFor="from-unit">From</Label>
          <Select value={fromUnit} onValueChange={setFromUnit}>
            <SelectTrigger id="from-unit" className="h-12">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {units.map((u) => (
                <SelectItem key={u.key} value={u.key}>{u.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="number"
            inputMode="decimal"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Enter value"
            className="h-12 font-mono"
          />
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={handleSwap}
          className="h-12 w-12 justify-self-center rotate-90 md:rotate-0"
          aria-label="Swap units"
        >
          <ArrowLeftRight className="w-4 h-4" />
        </Button>

        <div className="space-y-2">
          <Label htmlFor="to-unit">To</Label>
          <Select value={toUnit} onValueChange={setToUnit}>
            <SelectTrigger id="to-unit" className="h-12">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {units.map((u) => (
                <SelectItem key={u.key} value={u.key}>{u.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="h-12 flex items-center px-3 rounded-md border bg-muted/40 font-mono text-lg overflow-x-auto whitespace-nowrap">
            {result !== null ? formatResult(result) : '—'}
          </div>
        </div>
      </div>

      <div className="pt-2">
        {result === null ? (
          <ToolEmptyState icon={Ruler} message="Enter a value to see the conversion" className="h-32" />
        ) : (
          <Card className="relative p-6 bg-primary/5 border-primary/20 text-center flex flex-col items-center py-8">
            <ToolResultBadge label="Converted" />
            <div className="text-xl md:text-2xl lg:text-3xl font-bold font-display tracking-tight text-foreground break-words max-w-full px-2">
              {value} {fromLabel.split(' (')[0]} = {formatResult(result)} {toLabel.split(' (')[0]}
            </div>
          </Card>
        )}
      </div>

      {/* ── Educational content ───────────────────────────────────────── */}
      <div className="pt-8 mt-8 border-t border-border space-y-0">

        {/* Section 1 — How Unit Conversion Works */}
        <div>
          <h2 className="text-base font-semibold text-foreground mb-3">How Unit Conversion Works</h2>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Every unit conversion reduces to a multiplication by a conversion factor — a ratio
              that relates one unit to another. Converting 5 kilometers to meters multiplies by
              exactly 1,000, giving{' '}
              <span className="font-semibold text-foreground">5,000 m</span>. Converting 12 inches
              to centimeters multiplies by exactly 2.54, giving{' '}
              <span className="font-semibold text-foreground">30.48 cm</span>.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Some conversions are exact by definition (the kilometer is a power-of-10 multiple
              of the meter), while others are exact by international agreement. The inch-to-centimeter
              relationship is exactly 2.54 cm per inch — not an approximation. This was fixed by
              the International Yard and Pound Agreement of 1959, which redefined the inch in
              terms of the metric system. Today 1 inch = exactly 25.4 mm, 1 mile = exactly
              1.609344 km, and 1 pound = exactly 453.59237 grams — all exact definitions, not
              rounded estimates.
            </p>
          </div>
        </div>

        {/* Section 2 — How the Conversion Is Done */}
        <div className="pt-8 mt-8 border-t border-border">
          <h2 className="text-base font-semibold text-foreground mb-3">How the Conversion Is Done</h2>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              The converter uses a base-unit approach: every unit in a category has a fixed
              factor to convert it to the category's base unit (meters for length, grams for
              weight, liters for volume). Converting from any unit to any other goes via the
              base: <span className="font-mono text-foreground">input × from-factor ÷ to-factor</span>.
            </p>
            <div className="border border-border rounded-md bg-secondary p-4 space-y-2">
              {[
                ['26.2 miles → km', '26.2 × 1,609.344 m ÷ 1,000 = 42.1648 km (a marathon)'],
                ['70 kg → pounds', '70,000 g ÷ 453.59237 = 154.3236 lbs'],
                ['10 L → US gallons', '10 ÷ 3.785411784 = 2.6417 US gallons'],
                ['100°C → °F', '100 × 9/5 + 32 = 212°F (water boiling point)'],
              ].map(([ex, calc]) => (
                <p key={ex} className="text-sm text-muted-foreground leading-relaxed">
                  <span className="font-semibold text-foreground">{ex}:</span> {calc}
                </p>
              ))}
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Temperature is the exception — Celsius to Fahrenheit is a linear but
              non-multiplicative formula (°F = °C × 9/5 + 32) and is handled separately
              rather than via the base-unit factor approach.
            </p>
          </div>
        </div>

        {/* Section 3 — When to Use */}
        <div className="pt-8 mt-8 border-t border-border">
          <h2 className="text-base font-semibold text-foreground mb-3">When to Use This Converter</h2>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Use the swap button to verify a conversion both directions — if 12 inches converts
              to 30.48 cm, then 30.48 cm should give back exactly 12 inches. The temperature tab
              is useful for cooking (a recipe in Celsius when your oven uses Fahrenheit) and
              travel (weather forecasts in unfamiliar scales). The area tab covers real estate
              and land measurements, where acres, hectares, square feet, and square meters are
              all used in different countries for the same piece of land. The volume tab handles
              recipe scaling across US customary and metric measurements.
            </p>
          </div>
        </div>

        {/* Section 4 — FAQ */}
        <div className="pt-8 mt-8 border-t border-border">
          <h2 className="text-base font-semibold text-foreground mb-3">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {[
              {
                q: 'Why is 1 inch exactly 2.54 cm?',
                a: "The International Yard and Pound Agreement of 1959, signed by the United States, United Kingdom, Canada, Australia, New Zealand, and South Africa, redefined the inch as exactly 2.54 cm (25.4 mm). Before this agreement, the US survey inch and the UK inch differed by about 2 parts per million — enough to matter in surveying. The 1959 definition eliminated that discrepancy and made all inch–metric conversions exact rather than approximate.",
              },
              {
                q: "What's the difference between mass and weight in unit conversion?",
                a: "Mass measures the amount of matter in an object (kilograms, grams, pounds) and is constant regardless of gravity. Weight measures gravitational force on an object (newtons) and varies — you weigh less on the Moon but your mass is the same. In everyday use, 'weight' almost always means mass, and the units labelled as weight (pounds, kilograms) are technically mass units. The distinction only matters in physics and engineering; for a luggage scale or a recipe, mass is what's being measured.",
              },
              {
                q: 'How do temperature conversions differ from other conversions?',
                a: "Most unit conversions are pure multiplications by a constant — you can reverse them by dividing by the same factor. Celsius-to-Fahrenheit includes an addition (°F = °C × 9/5 + 32), making it linear but not proportional: you cannot simply multiply a temperature reading by a ratio. Kelvin avoids this: it starts at absolute zero, so Celsius-to-Kelvin is a pure addition (K = °C + 273.15) with no multiplier, making Kelvin calculations cleaner in physics.",
              },
              {
                q: 'Are metric conversions always exact?',
                a: "Conversions between metric units are always exact — the system was designed around powers of 10. 1 km = exactly 1,000 m; 1 mg = exactly 0.001 g. Conversions from metric to US customary are also exact using the post-1959 definitions (1 inch = exactly 2.54 cm; 1 pound = exactly 453.59237 g), but when the result is displayed to a limited number of decimal places, rounding introduces a small representational error — the underlying conversion is still exact.",
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
