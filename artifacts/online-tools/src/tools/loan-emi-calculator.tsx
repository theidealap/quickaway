import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Landmark, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ToolEmptyState } from '@/components/tool-empty-state';
import { ToolResultBadge } from '@/components/tool-result-badge';

// ── Constants ─────────────────────────────────────────────────────────────────

const MAX_YEARS  = 40;
const MAX_MONTHS = MAX_YEARS * 12; // 480

type TenureUnit = 'years' | 'months';

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtUSD(n: number): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface YearRow {
  year: number;
  openingBalance: number;
  principalPaid: number;
  interestPaid: number;
  closingBalance: number;
}

type CalcResult =
  | { ok: false; error: string }
  | {
      ok: true;
      emi: number;
      principal: number;
      totalInterest: number;
      totalPayment: number;
      rows: YearRow[];
    };

// ── Component ─────────────────────────────────────────────────────────────────

export default function LoanEmiCalculator() {
  const [loanAmount, setLoanAmount]   = useState('');
  const [rate, setRate]               = useState('');
  const [tenure, setTenure]           = useState('');
  const [tenureUnit, setTenureUnit]   = useState<TenureUnit>('years');

  const result = useMemo((): CalcResult | null => {
    if (!loanAmount || !rate || !tenure) return null;

    const P = parseFloat(loanAmount);
    const annualRate = parseFloat(rate);
    const tenureVal  = parseFloat(tenure);

    // Validation
    if (isNaN(P) || P <= 0)
      return { ok: false, error: 'Loan amount must be a number greater than zero.' };
    if (isNaN(annualRate) || annualRate < 0)
      return { ok: false, error: 'Annual interest rate must be 0 or greater.' };
    if (annualRate > 100)
      return { ok: false, error: 'Interest rate seems too high. Enter a percentage like 8.5 for 8.5%.' };
    if (isNaN(tenureVal) || tenureVal <= 0)
      return { ok: false, error: 'Loan tenure must be greater than zero.' };
    if (!Number.isInteger(tenureVal))
      return { ok: false, error: 'Loan tenure must be a whole number.' };

    // Convert tenure to months
    const n = tenureUnit === 'years' ? tenureVal * 12 : tenureVal;

    if (n > MAX_MONTHS)
      return {
        ok: false,
        error: `Maximum supported tenure is ${MAX_YEARS} years (${MAX_MONTHS} months).`,
      };

    // Monthly interest rate
    const r = annualRate / 12 / 100;

    // EMI calculation
    // If r = 0 (interest-free loan): EMI = P / n
    const emi =
      r === 0
        ? P / n
        : (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);

    const totalPayment  = emi * n;
    const totalInterest = totalPayment - P;

    // ── Build amortisation schedule (monthly, then aggregate by year) ──────
    const yearRows: YearRow[] = [];
    let remainingBalance = P;

    // How many complete years + leftover months?
    const totalYears    = Math.ceil(n / 12);

    for (let yr = 1; yr <= totalYears; yr++) {
      const monthStart = (yr - 1) * 12 + 1;
      const monthEnd   = Math.min(yr * 12, n);

      let yearPrincipal = 0;
      let yearInterest  = 0;
      const openingBalance = remainingBalance;

      for (let m = monthStart; m <= monthEnd; m++) {
        const interestThisMonth  = remainingBalance * r;
        let   principalThisMonth = emi - interestThisMonth;

        // Last month: clear any floating-point residue
        if (m === n) {
          principalThisMonth = remainingBalance;
        }

        yearPrincipal    += principalThisMonth;
        yearInterest     += interestThisMonth;
        remainingBalance -= principalThisMonth;
      }

      // Clamp tiny floating-point negatives to zero
      const closingBalance = Math.max(remainingBalance, 0);

      yearRows.push({
        year:           yr,
        openingBalance,
        principalPaid:  yearPrincipal,
        interestPaid:   yearInterest,
        closingBalance,
      });
    }

    return {
      ok: true,
      emi,
      principal:      P,
      totalInterest,
      totalPayment,
      rows:           yearRows,
    };
  }, [loanAmount, rate, tenure, tenureUnit]);

  const reset = () => {
    setLoanAmount('');
    setRate('');
    setTenure('');
    setTenureUnit('years');
  };

  const isEmpty = !loanAmount && !rate && !tenure;

  return (
    <div className="space-y-6">

      {/* ── Inputs ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

        {/* Loan Amount */}
        <div className="space-y-2">
          <Label htmlFor="emi-amount">Loan Amount</Label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-muted-foreground text-sm pointer-events-none">
              $
            </span>
            <Input
              id="emi-amount"
              type="number"
              min="0"
              step="any"
              placeholder="200000"
              value={loanAmount}
              onChange={(e) => setLoanAmount(e.target.value)}
              className="h-12 pl-7"
            />
          </div>
        </div>

        {/* Annual Interest Rate */}
        <div className="space-y-2">
          <Label htmlFor="emi-rate">Annual Interest Rate</Label>
          <div className="relative">
            <Input
              id="emi-rate"
              type="number"
              min="0"
              step="any"
              placeholder="6.5"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              className="h-12 pr-8"
            />
            <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground text-sm pointer-events-none">
              %
            </span>
          </div>
        </div>

        {/* Loan Tenure — spans both columns on sm+ */}
        <div className="space-y-2 sm:col-span-2 md:col-span-1">
          <Label htmlFor="emi-tenure">Loan Tenure</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                id="emi-tenure"
                type="number"
                min="1"
                step="1"
                placeholder={tenureUnit === 'years' ? '20' : '240'}
                value={tenure}
                onChange={(e) => setTenure(e.target.value)}
                className="h-12"
              />
            </div>
            {/* Years / Months toggle */}
            <div className="flex rounded-md border border-border overflow-hidden shrink-0">
              <button
                type="button"
                onClick={() => { setTenureUnit('years'); setTenure(''); }}
                className={[
                  'px-3 h-12 text-sm font-medium transition-colors',
                  tenureUnit === 'years'
                    ? 'bg-[hsl(221,39%,11%)] text-white'
                    : 'bg-background text-muted-foreground hover:text-foreground',
                ].join(' ')}
              >
                Years
              </button>
              <button
                type="button"
                onClick={() => { setTenureUnit('months'); setTenure(''); }}
                className={[
                  'px-3 h-12 text-sm font-medium transition-colors border-l border-border',
                  tenureUnit === 'months'
                    ? 'bg-[hsl(221,39%,11%)] text-white'
                    : 'bg-background text-muted-foreground hover:text-foreground',
                ].join(' ')}
              >
                Months
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* ── Results ──────────────────────────────────────────────────── */}
      <div className="pt-2">
        {isEmpty || result === null ? (
          <ToolEmptyState
            icon={Landmark}
            message="Enter loan amount, interest rate and tenure to calculate your EMI"
            className="h-48"
          />
        ) : !result.ok ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{result.error}</AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">

            {/* Hero — Monthly EMI */}
            <Card className="relative p-6 bg-primary/5 border-primary/20 text-center py-10">
              <ToolResultBadge />
              <span className="text-sm font-medium text-muted-foreground mb-3 flex items-center justify-center gap-1.5">
                <Landmark className="w-4 h-4" />
                Monthly EMI
              </span>
              <p className="text-4xl md:text-5xl font-bold font-display tracking-tight text-foreground tabular-nums break-all">
                ${fmtUSD(result.emi)}
              </p>
            </Card>

            {/* Secondary stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
              <Card className="p-3 md:p-4 text-center min-w-0 overflow-hidden">
                <p className="text-xs text-muted-foreground mb-1">Total Principal</p>
                <p className="text-base md:text-2xl font-bold font-display tabular-nums break-all leading-tight">
                  ${fmtUSD(result.principal)}
                </p>
              </Card>
              <Card className="p-3 md:p-4 text-center min-w-0 overflow-hidden">
                <p className="text-xs text-muted-foreground mb-1">Total Interest</p>
                <p className="text-base md:text-2xl font-bold font-display tabular-nums break-all leading-tight text-amber-600">
                  ${fmtUSD(result.totalInterest)}
                </p>
              </Card>
              <Card className="p-3 md:p-4 text-center min-w-0 overflow-hidden col-span-2 md:col-span-1">
                <p className="text-xs text-muted-foreground mb-1">Total Payment</p>
                <p className="text-base md:text-2xl font-bold font-display tabular-nums break-all leading-tight">
                  ${fmtUSD(result.totalPayment)}
                </p>
              </Card>
            </div>

            {/* Amortisation breakdown table */}
            <div>
              <p className="text-sm font-semibold text-foreground mb-2">
                {result.rows.length <= 12 ? 'Month-by-month' : 'Year-by-year'} breakdown
              </p>
              <div className="rounded-lg border border-border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[480px]">
                    <thead>
                      <tr className="bg-muted/50 border-b border-border">
                        <th className="text-left px-3 py-2.5 text-xs font-semibold text-muted-foreground whitespace-nowrap w-14">
                          {result.rows.length <= 12 ? 'Month' : 'Year'}
                        </th>
                        <th className="text-right px-3 py-2.5 text-xs font-semibold text-muted-foreground whitespace-nowrap">
                          Opening Balance
                        </th>
                        <th className="text-right px-3 py-2.5 text-xs font-semibold text-muted-foreground whitespace-nowrap">
                          Principal Paid
                        </th>
                        <th className="text-right px-3 py-2.5 text-xs font-semibold text-muted-foreground whitespace-nowrap">
                          Interest Paid
                        </th>
                        <th className="text-right px-3 py-2.5 text-xs font-semibold text-muted-foreground whitespace-nowrap">
                          Closing Balance
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
                            ${fmtUSD(row.principalPaid)}
                          </td>
                          <td className="px-3 py-2 text-right text-amber-600 tabular-nums">
                            ${fmtUSD(row.interestPaid)}
                          </td>
                          <td className="px-3 py-2 text-right font-semibold text-foreground tabular-nums">
                            ${fmtUSD(row.closingBalance)}
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
