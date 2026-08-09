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
    <>
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

    {/* ── Educational content ───────────────────────────────────────── */}
    <div className="pt-8 mt-8 border-t border-border space-y-0">

      {/* Section 1 — How Discount Calculations Work */}
      <div>
        <h2 className="text-base font-semibold text-foreground mb-3">How Discount Calculations Work</h2>
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground leading-relaxed">
            A discount reduces an original price by a fixed percentage. The core calculation is
            straightforward: multiply the original price by the discount rate (as a decimal) to get
            the saving, then subtract from the original for the sale price. A $80 item at 25% off
            gives savings of $80 × 0.25 = <span className="font-semibold text-foreground">$20.00</span> and
            a sale price of <span className="font-semibold text-foreground">$60.00</span>.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Where things get counterintuitive is stacked discounts. Two successive discounts of 20%
            and 10% are <em>not</em> the same as a single 30% discount. On a $200 item: 20% off
            brings the price to $160. Then 10% off that $160 brings it
            to <span className="font-semibold text-foreground">$144</span> — saving $56 total,
            which is an effective rate of <span className="font-semibold text-foreground">28%</span>,
            not 30%. The second discount applies to the already-reduced price, not the original.
          </p>
        </div>
      </div>

      {/* Section 2 — The Formulas */}
      <div className="pt-8 mt-8 border-t border-border">
        <h2 className="text-base font-semibold text-foreground mb-3">The Discount Formulas</h2>
        <div className="space-y-3">
          <div className="border border-border rounded-md bg-secondary p-4 space-y-2">
            {[
              ['Sale price', 'Original × (1 − discount ÷ 100)'],
              ['Discount %', '((Original − Sale) ÷ Original) × 100'],
              ['Original price', 'Sale price ÷ (1 − discount ÷ 100)'],
            ].map(([label, formula]) => (
              <p key={label} className="text-sm text-muted-foreground leading-relaxed">
                <span className="font-semibold text-foreground">{label}:</span>{' '}
                <span className="font-mono">{formula}</span>
              </p>
            ))}
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The third formula — reverse-calculating the original — is useful when a sale price
            is displayed without the original. An item marked $63 after a 30% discount came from
            an original of $63 ÷ (1 − 0.30) = $63 ÷ 0.70
            = <span className="font-semibold text-foreground">$90.00</span>. For stacked discounts,
            multiply the remaining-fraction factors: two discounts of 20% and 10% keep
            (1 − 0.20) × (1 − 0.10) = 0.72 of the original, removing 28% overall.
          </p>
        </div>
      </div>

      {/* Section 3 — When to Use */}
      <div className="pt-8 mt-8 border-t border-border">
        <h2 className="text-base font-semibold text-foreground mb-3">When to Use This Calculator</h2>
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Use the "Original price + % off" tab for standard retail scenarios — a sale sign, a
            coupon, or a seasonal discount where the percentage is clearly stated. Use the
            "Original + sale price" tab when you know both prices and want to verify the advertised
            discount percentage, or compare deals across retailers where different base prices make
            percentage comparisons misleading. The reverse formula (finding the original price) is
            particularly useful for evaluating clearance or outlet prices, where the original is
            often unlisted.
          </p>
        </div>
      </div>

      {/* Section 4 — FAQ */}
      <div className="pt-8 mt-8 border-t border-border">
        <h2 className="text-base font-semibold text-foreground mb-3">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {[
            {
              q: "Why aren't two successive discounts the same as their sum?",
              a: "Each discount applies to the price as it stands at that moment, not the original. A 20% discount on $200 saves $40, leaving $160. A 10% discount on that $160 saves $16 — not $20 — because the base is now smaller. Two discounts of r1 and r2 have an effective combined rate of 1 − (1 − r1)(1 − r2), not r1 + r2. A 20% + 10% stack removes 28% overall, not 30%.",
            },
            {
              q: 'How do I find the original price when only the sale price is known?',
              a: "Divide the sale price by (1 − discount rate as a decimal). If an item costs $63 after a 30% discount, the original was $63 ÷ 0.70 = $90.00. A common mistake is dividing by the discount percentage itself ($63 ÷ 0.30 = $210 — wrong). Always divide by the fraction that remains after the discount, not the fraction that was removed.",
            },
            {
              q: 'What is the difference between a discount and a markdown?',
              a: "A discount is a temporary price reduction — a sale, coupon, or promotional offer — after which the price returns to its original level. A markdown is a permanent reduction, typically used in retail to clear inventory that isn't selling at the original price. Both reduce the selling price below the original, but a markdown becomes the new permanent price point.",
            },
            {
              q: 'How do I calculate the final price with tax after a discount?',
              a: "Apply the discount first, then add tax to the discounted price — not the original. On a $90 item at 30% off (sale price $63.00), an 8% sales tax adds $63 × 0.08 = $5.04, giving a final total of $68.04. Applying tax to the pre-discount price and then discounting produces a different, incorrect result. In most jurisdictions, tax is calculated on the price actually paid.",
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
    </>
  );
}
