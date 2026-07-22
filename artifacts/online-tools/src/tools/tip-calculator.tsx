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
    </div>
  );
}
