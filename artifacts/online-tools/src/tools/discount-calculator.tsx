import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Tag, TrendingDown, AlertCircle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ToolEmptyState } from '@/components/tool-empty-state';

function fmt(n: number) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ── Mode A: Original price + discount % ──────────────────────────────────────

function ModeDiscountPercent() {
  const [original, setOriginal] = useState('');
  const [pct, setPct] = useState('');

  const result = useMemo(() => {
    const orig = parseFloat(original);
    const discount = parseFloat(pct);
    if (!original && !pct) return null;
    if (isNaN(orig) || orig <= 0) return { ok: false as const, error: 'Enter a valid original price.' };
    if (isNaN(discount) || discount < 0 || discount > 100) return { ok: false as const, error: 'Discount must be between 0 and 100.' };
    const savings = orig * (discount / 100);
    const salePrice = orig - savings;
    return { ok: true as const, orig, salePrice, savings, pct: discount };
  }, [original, pct]);

  const QUICK = [5, 10, 15, 20, 25, 30, 50];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="orig-price">Original Price ($)</Label>
          <Input
            id="orig-price"
            type="number"
            min="0"
            step="0.01"
            placeholder="e.g. 80.00"
            value={original}
            onChange={(e) => setOriginal(e.target.value)}
            className="h-12"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="disc-pct">Discount (%)</Label>
          <Input
            id="disc-pct"
            type="number"
            min="0"
            max="100"
            step="0.01"
            placeholder="e.g. 25"
            value={pct}
            onChange={(e) => setPct(e.target.value)}
            className="h-12"
          />
        </div>
      </div>

      {/* Quick-pick buttons */}
      <div className="flex flex-wrap gap-2">
        {QUICK.map((q) => (
          <Button
            key={q}
            variant={pct === String(q) ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPct(String(q))}
          >
            {q}% off
          </Button>
        ))}
      </div>

      <Results result={result} icon={Tag} emptyMessage="Enter a price and discount % to see savings" />

      <div className="flex justify-end">
        <Button variant="outline" onClick={() => { setOriginal(''); setPct(''); }} disabled={!original && !pct}>
          Reset
        </Button>
      </div>
    </div>
  );
}

// ── Mode B: Original price + sale price ──────────────────────────────────────

function ModeDiscountFromPrices() {
  const [original, setOriginal] = useState('');
  const [sale, setSale] = useState('');

  const result = useMemo(() => {
    const orig = parseFloat(original);
    const sp = parseFloat(sale);
    if (!original && !sale) return null;
    if (isNaN(orig) || orig <= 0) return { ok: false as const, error: 'Enter a valid original price.' };
    if (isNaN(sp) || sp < 0) return { ok: false as const, error: 'Enter a valid sale price.' };
    if (sp > orig) return { ok: false as const, error: 'Sale price cannot be higher than original price.' };
    const savings = orig - sp;
    const pct = (savings / orig) * 100;
    return { ok: true as const, orig, salePrice: sp, savings, pct };
  }, [original, sale]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="orig-price-b">Original Price ($)</Label>
          <Input
            id="orig-price-b"
            type="number"
            min="0"
            step="0.01"
            placeholder="e.g. 80.00"
            value={original}
            onChange={(e) => setOriginal(e.target.value)}
            className="h-12"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sale-price">Sale Price ($)</Label>
          <Input
            id="sale-price"
            type="number"
            min="0"
            step="0.01"
            placeholder="e.g. 60.00"
            value={sale}
            onChange={(e) => setSale(e.target.value)}
            className="h-12"
          />
        </div>
      </div>

      <Results result={result} icon={TrendingDown} emptyMessage="Enter both prices to calculate the discount" />

      <div className="flex justify-end">
        <Button variant="outline" onClick={() => { setOriginal(''); setSale(''); }} disabled={!original && !sale}>
          Reset
        </Button>
      </div>
    </div>
  );
}

// ── Shared result block ───────────────────────────────────────────────────────

type ResultValue =
  | { ok: true; orig: number; salePrice: number; savings: number; pct: number }
  | { ok: false; error: string }
  | null;

function Results({
  result,
  icon: Icon,
  emptyMessage,
}: {
  result: ResultValue;
  icon: LucideIcon;
  emptyMessage: string;
}) {
  if (!result) {
    return <ToolEmptyState icon={Icon} message={emptyMessage} className="h-44" />;
  }
  if (!result.ok) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{result.error}</AlertDescription>
      </Alert>
    );
  }
  return (
    <div className="space-y-4">
      <Card className="p-6 bg-primary/5 border-primary/20 text-center py-10">
        <p className="text-sm text-muted-foreground mb-2">Sale Price</p>
        <p className="text-4xl md:text-5xl font-bold font-display text-foreground break-all">${fmt(result.salePrice)}</p>
      </Card>
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4 text-center min-w-0 overflow-hidden">
          <p className="text-xs text-muted-foreground mb-1">You Save</p>
          <p className="text-lg md:text-2xl font-bold text-emerald-500 break-all leading-tight">${fmt(result.savings)}</p>
        </Card>
        <Card className="p-4 text-center min-w-0 overflow-hidden">
          <p className="text-xs text-muted-foreground mb-1">Discount</p>
          <p className="text-lg md:text-2xl font-bold text-emerald-500 break-all leading-tight">{result.pct.toFixed(1)}%</p>
        </Card>
      </div>
    </div>
  );
}

// ── Root export ───────────────────────────────────────────────────────────────

export default function DiscountCalculator() {
  return (
    <Tabs defaultValue="pct" className="space-y-6">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="pct">Original price + % off</TabsTrigger>
        <TabsTrigger value="prices">Original + sale price</TabsTrigger>
      </TabsList>
      <TabsContent value="pct">
        <ModeDiscountPercent />
      </TabsContent>
      <TabsContent value="prices">
        <ModeDiscountFromPrices />
      </TabsContent>
    </Tabs>
  );
}
