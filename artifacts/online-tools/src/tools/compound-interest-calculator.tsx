import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TrendingUp, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ToolEmptyState } from '@/components/tool-empty-state';
import { ToolResultBadge } from '@/components/tool-result-badge';

// ── Constants ─────────────────────────────────────────────────────────────────

type Frequency = 'annually' | 'semi-annually' | 'quarterly' | 'monthly' | 'daily';

const FREQUENCY_OPTIONS: { value: Frequency; label: string; n: number }[] = [
  { value: 'annually',      label: 'Annually (1×/yr)',      n: 1   },
  { value: 'semi-annually', label: 'Semi-annually (2×/yr)', n: 2   },
  { value: 'quarterly',     label: 'Quarterly (4×/yr)',     n: 4   },
  { value: 'monthly',       label: 'Monthly (12×/yr)',      n: 12  },
  { value: 'daily',         label: 'Daily (365×/yr)',       n: 365 },
];

const MAX_YEARS = 50;

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtUSD(n: number): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtRate(n: number): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface YearRow {
  year: number;
  openingBalance: number;
  interestEarned: number;
  closingBalance: number;
  cumulativeInterest: number;
}

type CalcResult =
  | { ok: false; error: string }
  | {
      ok: true;
      principal: number;
      finalAmount: number;
      totalInterest: number;
      effectiveRate: number;
      rows: YearRow[];
    };

// ── Component ─────────────────────────────────────────────────────────────────

export default function CompoundInterestCalculator() {
  const [principal, setPrincipal] = useState('');
  const [rate, setRate]           = useState('');
  const [frequency, setFrequency] = useState<Frequency>('monthly');
  const [years, setYears]         = useState('');

  const result = useMemo((): CalcResult | null => {
    // Wait until every required field has a value
    if (!principal || !rate || !years) return null;

    const P = parseFloat(principal);
    const r = parseFloat(rate);
    const t = parseFloat(years);
    const n = FREQUENCY_OPTIONS.find(f => f.value === frequency)!.n;

    // Validation
    if (isNaN(P) || P <= 0)
      return { ok: false, error: 'Principal must be a number greater than zero.' };
    if (isNaN(r) || r < 0)
      return { ok: false, error: 'Annual interest rate must be 0 or greater.' };
    if (r > 1000)
      return { ok: false, error: 'Interest rate looks unusually high. Enter a percentage like 5 for 5%.' };
    if (isNaN(t) || t <= 0)
      return { ok: false, error: 'Number of years must be greater than zero.' };
    if (!Number.isInteger(t))
      return { ok: false, error: 'Number of years must be a whole number (e.g. 10, not 10.5).' };
    if (t > MAX_YEARS)
      return { ok: false, error: `Maximum supported term is ${MAX_YEARS} years.` };

    const rDecimal = r / 100;

    // A = P × (1 + r/n)^(n×t)
    const finalAmount     = P * Math.pow(1 + rDecimal / n, n * t);
    const totalInterest   = finalAmount - P;
    // Effective Annual Rate = (1 + r/n)^n − 1
    const effectiveRate   = (Math.pow(1 + rDecimal / n, n) - 1) * 100;

    // Year-by-year table
    const rows: YearRow[] = [];
    let prevBalance = P;
    for (let y = 1; y <= t; y++) {
      const closingBalance     = P * Math.pow(1 + rDecimal / n, n * y);
      const interestEarned     = closingBalance - prevBalance;
      const cumulativeInterest = closingBalance - P;
      rows.push({ year: y, openingBalance: prevBalance, interestEarned, closingBalance, cumulativeInterest });
      prevBalance = closingBalance;
    }

    return { ok: true, principal: P, finalAmount, totalInterest, effectiveRate, rows };
  }, [principal, rate, frequency, years]);

  const reset = () => {
    setPrincipal('');
    setRate('');
    setFrequency('monthly');
    setYears('');
  };

  const isEmpty = !principal && !rate && !years;

  return (
    <div className="space-y-6">

      {/* ── Inputs ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

        {/* Principal */}
        <div className="space-y-2">
          <Label htmlFor="ci-principal">Principal Amount</Label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-muted-foreground text-sm pointer-events-none">
              $
            </span>
            <Input
              id="ci-principal"
              type="number"
              min="0"
              step="any"
              placeholder="10000"
              value={principal}
              onChange={(e) => setPrincipal(e.target.value)}
              className="h-12 pl-7"
            />
          </div>
        </div>

        {/* Annual Rate */}
        <div className="space-y-2">
          <Label htmlFor="ci-rate">Annual Interest Rate</Label>
          <div className="relative">
            <Input
              id="ci-rate"
              type="number"
              min="0"
              step="any"
              placeholder="5"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              className="h-12 pr-8"
            />
            <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground text-sm pointer-events-none">
              %
            </span>
          </div>
        </div>

        {/* Compounding Frequency */}
        <div className="space-y-2">
          <Label htmlFor="ci-frequency">Compounding Frequency</Label>
          <Select
            value={frequency}
            onValueChange={(v) => setFrequency(v as Frequency)}
          >
            <SelectTrigger id="ci-frequency" className="h-12">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FREQUENCY_OPTIONS.map((f) => (
                <SelectItem key={f.value} value={f.value}>
                  {f.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Years */}
        <div className="space-y-2">
          <Label htmlFor="ci-years">Number of Years</Label>
          <div className="relative">
            <Input
              id="ci-years"
              type="number"
              min="1"
              max={MAX_YEARS}
              step="1"
              placeholder="10"
              value={years}
              onChange={(e) => setYears(e.target.value)}
              className="h-12 pr-8"
            />
            <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground text-sm pointer-events-none">
              yr
            </span>
          </div>
        </div>

      </div>

      {/* ── Results ──────────────────────────────────────────────────── */}
      <div className="pt-2">
        {isEmpty || result === null ? (
          <ToolEmptyState
            icon={TrendingUp}
            message="Enter a principal, rate, frequency and term to see your returns"
            className="h-48"
          />
        ) : !result.ok ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{result.error}</AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">

            {/* Hero — Final Amount */}
            <Card className="relative p-6 bg-primary/5 border-primary/20 text-center py-10">
              <ToolResultBadge />
              <span className="text-sm font-medium text-muted-foreground mb-3 flex items-center justify-center gap-1.5">
                <TrendingUp className="w-4 h-4" />
                Final Amount
              </span>
              <p className="text-4xl md:text-5xl font-bold font-display tracking-tight text-foreground tabular-nums break-all">
                ${fmtUSD(result.finalAmount)}
              </p>
            </Card>

            {/* Secondary stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
              <Card className="p-3 md:p-4 text-center min-w-0 overflow-hidden">
                <p className="text-xs text-muted-foreground mb-1">Principal</p>
                <p className="text-base md:text-2xl font-bold font-display tabular-nums break-all leading-tight">
                  ${fmtUSD(result.principal)}
                </p>
              </Card>
              <Card className="p-3 md:p-4 text-center min-w-0 overflow-hidden">
                <p className="text-xs text-muted-foreground mb-1">Total Interest</p>
                <p className="text-base md:text-2xl font-bold font-display tabular-nums break-all leading-tight text-emerald-600">
                  +${fmtUSD(result.totalInterest)}
                </p>
              </Card>
              <Card className="p-3 md:p-4 text-center min-w-0 overflow-hidden col-span-2 md:col-span-1">
                <p className="text-xs text-muted-foreground mb-1">Effective Annual Rate</p>
                <p className="text-base md:text-2xl font-bold font-display tabular-nums break-all leading-tight">
                  {fmtRate(result.effectiveRate)}%
                </p>
              </Card>
            </div>

            {/* Year-by-year breakdown table */}
            <div>
              <p className="text-sm font-semibold text-foreground mb-2">
                Year-by-year breakdown
              </p>
              <div className="rounded-lg border border-border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[540px]">
                    <thead>
                      <tr className="bg-muted/50 border-b border-border">
                        <th className="text-left px-3 py-2.5 text-xs font-semibold text-muted-foreground whitespace-nowrap w-14">
                          Year
                        </th>
                        <th className="text-right px-3 py-2.5 text-xs font-semibold text-muted-foreground whitespace-nowrap">
                          Opening Balance
                        </th>
                        <th className="text-right px-3 py-2.5 text-xs font-semibold text-muted-foreground whitespace-nowrap">
                          Interest Earned
                        </th>
                        <th className="text-right px-3 py-2.5 text-xs font-semibold text-muted-foreground whitespace-nowrap">
                          Closing Balance
                        </th>
                        <th className="text-right px-3 py-2.5 text-xs font-semibold text-muted-foreground whitespace-nowrap">
                          Cumulative Interest
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {result.rows.map((row, i) => (
                        <tr
                          key={row.year}
                          className={i % 2 === 0 ? 'bg-background' : 'bg-muted/20'}
                        >
                          <td className="px-3 py-2 font-medium text-foreground tabular-nums">
                            {row.year}
                          </td>
                          <td className="px-3 py-2 text-right text-muted-foreground tabular-nums">
                            ${fmtUSD(row.openingBalance)}
                          </td>
                          <td className="px-3 py-2 text-right text-emerald-600 font-medium tabular-nums">
                            +${fmtUSD(row.interestEarned)}
                          </td>
                          <td className="px-3 py-2 text-right font-semibold text-foreground tabular-nums">
                            ${fmtUSD(row.closingBalance)}
                          </td>
                          <td className="px-3 py-2 text-right text-muted-foreground tabular-nums">
                            ${fmtUSD(row.cumulativeInterest)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* Reset */}
      <div className="flex justify-end pt-2">
        <Button
          variant="outline"
          onClick={reset}
          disabled={isEmpty}
        >
          Reset
        </Button>
      </div>

    </div>
  );
}
