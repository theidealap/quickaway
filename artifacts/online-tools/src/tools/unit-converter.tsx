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
            <ToolResultBadge />
            <div className="text-2xl md:text-3xl font-bold font-display tracking-tight text-foreground">
              {value} {fromLabel.split(' (')[0]} = {formatResult(result)} {toLabel.split(' (')[0]}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
