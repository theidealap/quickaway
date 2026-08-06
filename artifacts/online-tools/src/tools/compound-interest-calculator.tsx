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

      {/* ── Educational content ───────────────────────────────────────── */}
      <div className="pt-8 mt-8 border-t border-border space-y-0">

        {/* Section 1 — How it works */}
        <div>
          <h2 className="text-base font-semibold text-foreground mb-3">
            How Compound Interest Works
          </h2>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              With simple interest, your earnings are always calculated on the original deposit.
              Compound interest changes that: the interest you earn is added to your balance, and
              the next period's interest is calculated on the new, larger total. The result is
              exponential growth — money making money on the money it already made.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Compounding frequency determines how often that interest is added and starts earning
              itself. Consider $10,000 invested at 6% for 10 years. Compounded annually, you end up
              with $17,908.48. Compounded monthly, that rises to $18,193.97 — an extra $285 for
              choosing a more frequent compounding schedule. Stretch the horizon to 30 years at the
              same rate, and the gap between annual compounding ($57,434.91) and daily compounding
              ($60,487.53) widens to $3,052.61. The longer the horizon, the more frequency matters.
            </p>
          </div>
        </div>

        {/* Section 2 — The formula */}
        <div className="pt-8 mt-8 border-t border-border">
          <h2 className="text-base font-semibold text-foreground mb-3">
            The Compound Interest Formula
          </h2>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              The formula is: <span className="font-semibold text-foreground font-mono">A = P(1 + r/n)^(nt)</span>
            </p>
            <div className="border border-border rounded-md bg-secondary p-4 space-y-1.5">
              {[
                ['A', 'the final amount (principal plus all earned interest)'],
                ['P', 'the principal — your starting balance'],
                ['r', 'the annual rate as a decimal (e.g. 5% → 0.05)'],
                ['n', 'compounding periods per year (12 for monthly, 365 for daily)'],
                ['t', 'the time in years'],
              ].map(([sym, desc]) => (
                <p key={sym} className="text-sm text-muted-foreground leading-relaxed">
                  <span className="font-semibold text-foreground font-mono">{sym}</span> — {desc}
                </p>
              ))}
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              <span className="font-medium text-foreground">Worked example:</span> $5,000 at 4%
              compounded quarterly for 3 years.
              A&nbsp;=&nbsp;5,000&nbsp;×&nbsp;(1&nbsp;+&nbsp;0.04/4)^(4×3)&nbsp;=&nbsp;5,000&nbsp;×&nbsp;(1.01)^12&nbsp;≈&nbsp;<span className="font-semibold text-foreground">$5,634.13</span>.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The exponent (nt) is where most of the growth hides — doubling the time period has a
              far bigger impact than doubling the rate, which is why starting early matters more
              than chasing a higher yield.
            </p>
          </div>
        </div>

        {/* Section 3 — When to use */}
        <div className="pt-8 mt-8 border-t border-border">
          <h2 className="text-base font-semibold text-foreground mb-3">
            When to Use This Calculator
          </h2>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              This calculator is most useful when comparing savings or investment options with
              different rates and compounding schedules — a lower APR that compounds daily can
              outperform one that compounds annually. It helps you estimate how a one-time lump sum
              grows over a fixed horizon, whether that's a CD, a bond, or an initial investment
              contribution.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Retirement planners use it to check whether an amount saved today will hit a target
              balance by a specific year. It also makes the cost of compound debt concrete: running
              the numbers on a high-APR credit card balance is often more persuasive than any
              written warning label.
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
                q: 'What\'s the difference between simple and compound interest?',
                a: 'Simple interest is computed on the principal alone every period. Compound interest is computed on the principal plus all previously accumulated interest. On a $10,000 balance at 7% over 20 years, simple interest produces $14,000 in earnings; monthly compound interest produces $30,387 — more than twice as much from the same nominal rate.',
              },
              {
                q: 'Does more frequent compounding always mean more money?',
                a: 'Yes, when the nominal rate is identical. Interest that is added more often starts earning its own interest sooner, which raises the effective yield. The gap between monthly and daily compounding is small, but the difference between annual and monthly compounding on the same stated rate produces a measurably higher balance over long periods.',
              },
              {
                q: 'How is compound interest different from APY?',
                a: 'APY (Annual Percentage Yield) is the real return you receive in one year once compounding is applied. A 6% rate compounded monthly has an APY of 6.168% — that extra 0.168 percentage point is the compounding effect. When comparing savings accounts, always compare APY rather than the stated rate, since it puts different compounding frequencies on equal footing.',
              },
              {
                q: 'Can compound interest work against me?',
                a: 'Yes — any compounding debt works against you the same way a savings account works for you. Credit card balances at 20–25% APR compound daily, meaning unpaid interest is added to your balance each day and the next charge is slightly larger. A $3,000 balance at 22% APR with only minimum payments can take over a decade to clear and cost more than $2,000 in total interest.',
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
