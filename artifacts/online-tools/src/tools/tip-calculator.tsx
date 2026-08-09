import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Users, Receipt, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ToolEmptyState } from '@/components/tool-empty-state';

function fmt(n: number) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const TIP_PRESETS = [10, 15, 18, 20, 25];

export default function TipCalculator() {
  const [bill, setBill] = useState('');
  const [tipPct, setTipPct] = useState('');
  const [people, setPeople] = useState('1');

  const result = useMemo(() => {
    const b = parseFloat(bill);
    const t = parseFloat(tipPct);
    const p = parseInt(people, 10);

    if (!bill) return null;
    if (isNaN(b) || b < 0) return { ok: false as const, error: 'Enter a valid bill amount.' };
    if (tipPct !== '' && (isNaN(t) || t < 0)) return { ok: false as const, error: 'Tip % must be 0 or more.' };
    if (isNaN(p) || p < 1) return { ok: false as const, error: 'Number of people must be at least 1.' };

    const tipPctVal = isNaN(t) ? 0 : t;
    const tipTotal = b * (tipPctVal / 100);
    const grandTotal = b + tipTotal;
    const tipPerPerson = tipTotal / p;
    const totalPerPerson = grandTotal / p;

    return { ok: true as const, tipTotal, grandTotal, tipPerPerson, totalPerPerson, p };
  }, [bill, tipPct, people]);

  const setPreset = (pct: number) => setTipPct(pct === parseFloat(tipPct) ? '' : String(pct));

  const reset = () => {
    setBill('');
    setTipPct('');
    setPeople('1');
  };

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label htmlFor="bill">Bill Amount ($)</Label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-muted-foreground text-sm pointer-events-none">$</span>
            <Input
              id="bill"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={bill}
              onChange={(e) => setBill(e.target.value)}
              className="h-12 pl-7"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="tip-pct">Tip (%)</Label>
          <div className="relative">
            <Input
              id="tip-pct"
              type="number"
              min="0"
              step="0.5"
              placeholder="e.g. 18"
              value={tipPct}
              onChange={(e) => setTipPct(e.target.value)}
              className="h-12 pr-8"
            />
            <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground text-sm pointer-events-none">%</span>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="people">Split Between</Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
              <Users className="w-4 h-4" />
            </div>
            <Input
              id="people"
              type="number"
              min="1"
              step="1"
              value={people}
              onChange={(e) => setPeople(e.target.value)}
              className="h-12 pl-10"
            />
          </div>
        </div>
      </div>

      {/* Quick-tip presets */}
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Quick tip</p>
        <div className="flex flex-wrap gap-2">
          {TIP_PRESETS.map((pct) => (
            <Button
              key={pct}
              variant={tipPct === String(pct) ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPreset(pct)}
            >
              {pct}%
            </Button>
          ))}
        </div>
      </div>

      {/* Results */}
      {!result ? (
        <ToolEmptyState icon={Receipt} message="Enter a bill amount to calculate the tip" className="h-44" />
      ) : !result.ok ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{result.error}</AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-4">
          {/* Primary: per-person total */}
          <Card className="p-6 bg-primary/5 border-primary/20 text-center py-10">
            <p className="text-sm text-muted-foreground mb-2">
              {result.p > 1 ? `Total per person (÷ ${result.p})` : 'Total (with tip)'}
            </p>
            <p className="text-4xl md:text-5xl font-bold font-display text-foreground break-all">${fmt(result.totalPerPerson)}</p>
          </Card>

          <div className="grid grid-cols-3 gap-3 md:gap-4">
            <Card className="p-3 md:p-4 text-center min-w-0 overflow-hidden">
              <p className="text-xs text-muted-foreground mb-1">Tip Total</p>
              <p className="text-base md:text-2xl font-bold font-display break-all leading-tight">${fmt(result.tipTotal)}</p>
            </Card>
            <Card className="p-3 md:p-4 text-center min-w-0 overflow-hidden">
              <p className="text-xs text-muted-foreground mb-1">Tip / Person</p>
              <p className="text-base md:text-2xl font-bold font-display break-all leading-tight">${fmt(result.tipPerPerson)}</p>
            </Card>
            <Card className="p-3 md:p-4 text-center min-w-0 overflow-hidden">
              <p className="text-xs text-muted-foreground mb-1">Grand Total</p>
              <p className="text-base md:text-2xl font-bold font-display break-all leading-tight">${fmt(result.grandTotal)}</p>
            </Card>
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <Button variant="outline" onClick={reset} disabled={!bill && !tipPct && people === '1'}>
          Reset
        </Button>
      </div>

      {/* ── Educational content ───────────────────────────────────────── */}
      <div className="pt-8 mt-8 border-t border-border space-y-0">

        {/* Section 1 */}
        <div>
          <h2 className="text-base font-semibold text-foreground mb-3">How Tips and Splits Are Calculated</h2>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              A tip is a percentage of the bill added on top of the subtotal. The math:
              tip = bill × (percentage ÷ 100); grand total = bill + tip; per person = grand
              total ÷ number of people.
            </p>
            <div className="border border-border rounded-md bg-secondary p-4 space-y-2">
              {[
                ['$85.00 bill, 18%, 4 people', 'Tip: $15.30 · Total: $100.30 · Per person: $25.07'],
                ['$120.00 bill, 20%, 3 people', 'Tip: $24.00 · Total: $144.00 · Per person: $48.00'],
              ].map(([ex, res]) => (
                <p key={ex} className="text-sm text-muted-foreground leading-relaxed">
                  <span className="font-semibold text-foreground">{ex}:</span> {res}
                </p>
              ))}
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Tip conventions vary significantly by country. In the United States, 15–20% is
              common for restaurant service. In many European countries, 5–10% is typical or
              entirely optional. In Japan, tipping is generally not practised and may be declined.
              In Australia, tipping is not expected but is welcomed for exceptional service.
            </p>
          </div>
        </div>

        {/* Section 2 */}
        <div className="pt-8 mt-8 border-t border-border">
          <h2 className="text-base font-semibold text-foreground mb-3">How the Calculation Works</h2>
          <div className="space-y-3">
            <div className="border border-border rounded-md bg-secondary p-4 space-y-2">
              {[
                ['Tip amount', 'Bill × (tip % ÷ 100)'],
                ['Grand total', 'Bill + tip amount'],
                ['Per person', 'Grand total ÷ number of people'],
              ].map(([label, formula]) => (
                <p key={label} className="text-sm text-muted-foreground leading-relaxed">
                  <span className="font-semibold text-foreground">{label}:</span>{' '}
                  <span className="font-mono">{formula}</span>
                </p>
              ))}
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Tip can be calculated on either the pre-tax or post-tax bill. On a $100 pre-tax
              bill with 8% tax ($108 post-tax), 18% tip on pre-tax = $18.00; 18% tip on
              post-tax = $19.44 — a difference of{' '}
              <span className="font-semibold text-foreground">$1.44</span>. Which base to
              use varies by convention and personal preference.
            </p>
          </div>
        </div>

        {/* Section 3 */}
        <div className="pt-8 mt-8 border-t border-border">
          <h2 className="text-base font-semibold text-foreground mb-3">When to Use This Calculator</h2>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Use the preset buttons (10%, 15%, 18%, 20%, 25%) to quickly apply standard amounts.
              Enter a custom percentage for non-restaurant contexts — spa services often use 15–20%,
              delivery apps typically suggest 10–20%. For unequal group splits where one person
              ordered significantly more, this calculator divides equally; calculate each
              person's share of the subtotal proportionally first, then apply the tip to each
              individual amount before summing.
            </p>
          </div>
        </div>

        {/* Section 4 */}
        <div className="pt-8 mt-8 border-t border-border">
          <h2 className="text-base font-semibold text-foreground mb-3">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {[
              {
                q: 'Should I tip on the pre-tax or post-tax amount?',
                a: "Both conventions exist. Tipping on the pre-tax subtotal is technically the standard in many American etiquette guides, since the tax goes to the government rather than the server. Tipping on the post-tax total is simpler and more common in practice. On a $100 pre-tax bill with 8% tax, the difference between 18% pre-tax ($18.00) and post-tax ($19.44) is $1.44. Most service workers receive either amount graciously — the choice is the payer's.",
              },
              {
                q: "What's a standard tip percentage?",
                a: "Conventions vary by country and venue type. In the US, 15% was the traditional restaurant baseline; 20% has become more common and is now the informal standard in many cities. For coffee shop counter service, 0–15% is typical. Outside the US, conventions differ substantially — in many European countries tips of 5–10% are appreciated but not expected; in Japan, tipping is generally not practised.",
              },
              {
                q: 'How do I handle an uneven split where people ordered different amounts?',
                a: "This calculator divides the grand total equally. For an uneven split, calculate each person's share of the pre-tip subtotal first, apply the tip percentage to each individual subtotal, then sum. For example, if Person A ordered $40 and Person B ordered $60 on a $100 bill, a 20% tip allocates $8 to A (total: $48) and $12 to B (total: $72), rather than splitting $24 equally.",
              },
              {
                q: 'How do I calculate a tip when the bill already includes a service charge?',
                a: "Check whether the listed charge is a mandatory service fee or a suggested gratuity. Many restaurants add an automatic gratuity (often 18–20%) for large parties — in that case the tip is already included. If a service charge is labelled as a 'service fee' that goes to the establishment rather than the staff, some diners choose to add a separate tip. Asking the staff how the charge is distributed is the most reliable approach.",
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
