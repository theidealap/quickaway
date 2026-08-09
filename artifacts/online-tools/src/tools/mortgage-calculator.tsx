import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Home, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ToolEmptyState } from '@/components/tool-empty-state';
import { ToolResultBadge } from '@/components/tool-result-badge';

// ── Constants ─────────────────────────────────────────────────────────────────

const LOAN_TERMS = [15, 20, 30] as const;
type LoanTerm = (typeof LOAN_TERMS)[number];
type DPMode = '$' | '%';

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Format as USD with 2 decimal places for display. */
function fmtUSD(n: number): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** Round to 2 decimal places, strip trailing zeros — safe for input field values (no commas). */
function toInputValue(n: number): string {
  return parseFloat(n.toFixed(2)).toString();
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
      loanAmount: number;
      downPaymentAmt: number;
      monthlyPI: number;
      monthlyTax: number;
      monthlyInsurance: number;
      monthlyPMI: number;
      hasPMI: boolean;
      totalMonthly: number;
      rows: YearRow[];
    };

// ── Component ─────────────────────────────────────────────────────────────────

export default function MortgageCalculator() {
  const [homePrice, setHomePrice]         = useState('');
  const [dpMode, setDPMode]               = useState<DPMode>('%');
  const [dpValue, setDPValue]             = useState('20'); // default 20 %
  const [rate, setRate]                   = useState('');
  const [loanTerm, setLoanTerm]           = useState<LoanTerm>(30);
  const [propertyTax, setPropertyTax]     = useState('');
  const [homeInsurance, setHomeInsurance] = useState('');

  // ── Toggle down payment mode with live conversion ──────────────────────────

  const switchDPMode = (newMode: DPMode) => {
    if (newMode === dpMode) return;
    const priceNum = parseFloat(homePrice);
    const dpNum    = parseFloat(dpValue);
    if (!isNaN(priceNum) && priceNum > 0 && !isNaN(dpNum) && dpNum >= 0) {
      if (newMode === '$') {
        setDPValue(toInputValue((dpNum / 100) * priceNum));
      } else {
        setDPValue(toInputValue((dpNum / priceNum) * 100));
      }
    }
    // If conversion isn't possible (missing price), keep value as-is and let user re-enter
    setDPMode(newMode);
  };

  // ── Loan amount hint shown live below the down payment field ───────────────

  const displayLoanAmount = useMemo(() => {
    const hp  = parseFloat(homePrice);
    const dpV = parseFloat(dpValue);
    if (isNaN(hp) || hp <= 0 || isNaN(dpV) || dpV < 0) return null;
    const dpAmt = dpMode === '%' ? (dpV / 100) * hp : dpV;
    if (dpAmt > hp) return null;
    return hp - dpAmt;
  }, [homePrice, dpMode, dpValue]);

  // ── Core calculation ───────────────────────────────────────────────────────

  const result = useMemo((): CalcResult | null => {
    // Required fields must not be blank (explicit === '' guards, never truthy checks)
    if (homePrice === '' || dpValue === '' || rate === '') return null;

    const homePriceNum = parseFloat(homePrice);
    const dpV          = parseFloat(dpValue);
    const rateNum      = parseFloat(rate);
    // Optional fields: blank → 0
    const taxAnnual      = propertyTax   === '' ? 0 : parseFloat(propertyTax);
    const insuranceAnnual = homeInsurance === '' ? 0 : parseFloat(homeInsurance);

    // ── Validation ──────────────────────────────────────────────────────────
    if (isNaN(homePriceNum) || homePriceNum <= 0)
      return { ok: false, error: 'Home price must be a number greater than zero.' };

    if (isNaN(dpV) || dpV < 0)
      return {
        ok: false,
        error:
          dpMode === '%'
            ? 'Down payment percentage must be 0 or greater.'
            : 'Down payment must be 0 or greater.',
      };

    if (dpMode === '%' && dpV > 100)
      return { ok: false, error: 'Down payment percentage cannot exceed 100%.' };

    const dpAmt = dpMode === '%' ? (dpV / 100) * homePriceNum : dpV;

    if (dpAmt > homePriceNum)
      return { ok: false, error: 'Down payment cannot exceed the home price.' };

    if (isNaN(rateNum) || rateNum < 0)
      return { ok: false, error: 'Interest rate must be 0 or greater.' };

    if (rateNum > 100)
      return {
        ok: false,
        error: 'Interest rate seems too high. Enter a percentage like 6.5 for 6.5%.',
      };

    if (isNaN(taxAnnual) || taxAnnual < 0)
      return {
        ok: false,
        error: 'Property tax must be 0 or greater (or leave blank to treat as $0).',
      };

    if (isNaN(insuranceAnnual) || insuranceAnnual < 0)
      return {
        ok: false,
        error: 'Home insurance must be 0 or greater (or leave blank to treat as $0).',
      };

    // ── Core maths ──────────────────────────────────────────────────────────
    const loanAmount = homePriceNum - dpAmt;
    const n          = loanTerm * 12;
    const r          = rateNum / 12 / 100;

    // P&I — handle 0% rate (interest-free) and 100% down (zero loan)
    const monthlyPI =
      loanAmount <= 0
        ? 0
        : r === 0
        ? loanAmount / n
        : (loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);

    const monthlyTax       = taxAnnual / 12;
    const monthlyInsurance = insuranceAnnual / 12;

    // PMI: estimated at 0.5 % p.a. when down payment < 20 % of home price
    const hasPMI     = dpAmt < homePriceNum * 0.2;
    const monthlyPMI = hasPMI ? (loanAmount * 0.005) / 12 : 0;

    const totalMonthly = monthlyPI + monthlyTax + monthlyInsurance + monthlyPMI;

    // ── Year-by-year amortisation (P&I only — taxes/insurance/PMI don't amortise) ──
    const rows: YearRow[] = [];

    if (loanAmount > 0) {
      let remainingBalance = loanAmount;

      for (let yr = 1; yr <= loanTerm; yr++) {
        const monthStart     = (yr - 1) * 12 + 1;
        const monthEnd       = yr * 12;
        let yearPrincipal    = 0;
        let yearInterest     = 0;
        const openingBalance = remainingBalance;

        for (let m = monthStart; m <= monthEnd; m++) {
          const interestThisMonth  = remainingBalance * r;
          let   principalThisMonth = monthlyPI - interestThisMonth;
          // Last payment: clear any floating-point residue
          if (m === n) principalThisMonth = remainingBalance;
          yearPrincipal    += principalThisMonth;
          yearInterest     += interestThisMonth;
          remainingBalance -= principalThisMonth;
        }

        rows.push({
          year:          yr,
          openingBalance,
          principalPaid: yearPrincipal,
          interestPaid:  yearInterest,
          closingBalance: Math.max(remainingBalance, 0),
        });
      }
    }

    return {
      ok: true,
      loanAmount,
      downPaymentAmt: dpAmt,
      monthlyPI,
      monthlyTax,
      monthlyInsurance,
      monthlyPMI,
      hasPMI,
      totalMonthly,
      rows,
    };
  }, [homePrice, dpMode, dpValue, rate, loanTerm, propertyTax, homeInsurance]);

  // ── Reset ──────────────────────────────────────────────────────────────────

  const reset = () => {
    setHomePrice('');
    setDPMode('%');
    setDPValue('20');
    setRate('');
    setLoanTerm(30);
    setPropertyTax('');
    setHomeInsurance('');
  };

  // "Empty" = user has not entered the two critical required fields
  const isEmpty = homePrice === '' && rate === '';

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* ── Inputs ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

        {/* Home Price */}
        <div className="space-y-2">
          <Label htmlFor="mc-home-price">Home Price</Label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-muted-foreground text-sm pointer-events-none">
              $
            </span>
            <Input
              id="mc-home-price"
              type="number"
              min="0"
              step="any"
              placeholder="400000"
              value={homePrice}
              onChange={(e) => setHomePrice(e.target.value)}
              className="h-12 pl-7"
            />
          </div>
        </div>

        {/* Down Payment */}
        <div className="space-y-2">
          <Label htmlFor="mc-down-payment">Down Payment</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              {dpMode === '$' && (
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-muted-foreground text-sm pointer-events-none">
                  $
                </span>
              )}
              <Input
                id="mc-down-payment"
                type="number"
                min="0"
                step="any"
                placeholder={dpMode === '%' ? '20' : '80000'}
                value={dpValue}
                onChange={(e) => setDPValue(e.target.value)}
                className={['h-12', dpMode === '$' ? 'pl-7' : 'pr-8'].join(' ')}
              />
              {dpMode === '%' && (
                <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground text-sm pointer-events-none">
                  %
                </span>
              )}
            </div>
            {/* $ / % toggle */}
            <div className="flex rounded-md border border-border overflow-hidden shrink-0">
              <button
                type="button"
                onClick={() => switchDPMode('$')}
                className={[
                  'px-3 h-12 text-sm font-medium transition-colors',
                  dpMode === '$'
                    ? 'bg-[hsl(221,39%,11%)] text-white'
                    : 'bg-background text-muted-foreground hover:text-foreground',
                ].join(' ')}
              >
                $
              </button>
              <button
                type="button"
                onClick={() => switchDPMode('%')}
                className={[
                  'px-3 h-12 text-sm font-medium transition-colors border-l border-border',
                  dpMode === '%'
                    ? 'bg-[hsl(221,39%,11%)] text-white'
                    : 'bg-background text-muted-foreground hover:text-foreground',
                ].join(' ')}
              >
                %
              </button>
            </div>
          </div>
          {/* Live loan amount hint */}
          {displayLoanAmount !== null && (
            <p className="text-xs text-muted-foreground">
              Loan amount:{' '}
              <span className="font-medium text-foreground">${fmtUSD(displayLoanAmount)}</span>
            </p>
          )}
        </div>

        {/* Annual Interest Rate */}
        <div className="space-y-2">
          <Label htmlFor="mc-rate">Annual Interest Rate</Label>
          <div className="relative">
            <Input
              id="mc-rate"
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

        {/* Loan Term — 3-way toggle */}
        <div className="space-y-2">
          <Label>Loan Term</Label>
          <div className="flex rounded-md border border-border overflow-hidden">
            {LOAN_TERMS.map((term, i) => (
              <button
                key={term}
                type="button"
                onClick={() => setLoanTerm(term)}
                className={[
                  'flex-1 h-12 text-sm font-medium transition-colors',
                  i > 0 ? 'border-l border-border' : '',
                  loanTerm === term
                    ? 'bg-[hsl(221,39%,11%)] text-white'
                    : 'bg-background text-muted-foreground hover:text-foreground',
                ].join(' ')}
              >
                {term} yr
              </button>
            ))}
          </div>
        </div>

        {/* Property Tax */}
        <div className="space-y-2">
          <Label htmlFor="mc-tax">
            Property Tax{' '}
            <span className="font-normal text-xs text-muted-foreground">(annual, optional)</span>
          </Label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-muted-foreground text-sm pointer-events-none">
              $
            </span>
            <Input
              id="mc-tax"
              type="number"
              min="0"
              step="any"
              placeholder="0"
              value={propertyTax}
              onChange={(e) => setPropertyTax(e.target.value)}
              className="h-12 pl-7"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Leave blank if unknown; check your local assessor for an estimate
          </p>
        </div>

        {/* Home Insurance */}
        <div className="space-y-2">
          <Label htmlFor="mc-insurance">
            Home Insurance{' '}
            <span className="font-normal text-xs text-muted-foreground">(annual, optional)</span>
          </Label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-muted-foreground text-sm pointer-events-none">
              $
            </span>
            <Input
              id="mc-insurance"
              type="number"
              min="0"
              step="any"
              placeholder="0"
              value={homeInsurance}
              onChange={(e) => setHomeInsurance(e.target.value)}
              className="h-12 pl-7"
            />
          </div>
        </div>

      </div>

      {/* ── Results ──────────────────────────────────────────────────────── */}
      <div className="pt-2">
        {isEmpty || result === null ? (
          <ToolEmptyState
            icon={Home}
            message="Enter home price, down payment and interest rate to see your mortgage payment"
            className="h-48"
          />
        ) : !result.ok ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{result.error}</AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">

            {/* Hero — Total Monthly Payment */}
            <Card className="relative p-6 bg-primary/5 border-primary/20 text-center py-10">
              <ToolResultBadge />
              <span className="text-sm font-medium text-muted-foreground mb-3 flex items-center justify-center gap-1.5">
                <Home className="w-4 h-4" />
                Total Monthly Payment
              </span>
              <p className="text-4xl md:text-5xl font-bold font-display tracking-tight text-foreground tabular-nums break-all">
                ${fmtUSD(result.totalMonthly)}
              </p>
            </Card>

            {/* Secondary stat cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
              <Card className="p-3 md:p-4 text-center min-w-0 overflow-hidden">
                <p className="text-xs text-muted-foreground mb-1">Principal &amp; Interest</p>
                <p className="text-base md:text-2xl font-bold font-display tabular-nums break-all leading-tight">
                  ${fmtUSD(result.monthlyPI)}
                </p>
              </Card>
              <Card className="p-3 md:p-4 text-center min-w-0 overflow-hidden">
                <p className="text-xs text-muted-foreground mb-1">Loan Amount</p>
                <p className="text-base md:text-2xl font-bold font-display tabular-nums break-all leading-tight">
                  ${fmtUSD(result.loanAmount)}
                </p>
              </Card>
              <Card className="p-3 md:p-4 text-center min-w-0 overflow-hidden col-span-2 md:col-span-1">
                <p className="text-xs text-muted-foreground mb-1">Down Payment</p>
                <p className="text-base md:text-2xl font-bold font-display tabular-nums break-all leading-tight">
                  ${fmtUSD(result.downPaymentAmt)}
                </p>
              </Card>
            </div>

            {/* Monthly payment breakdown */}
            <Card className="p-4">
              <p className="text-sm font-semibold text-foreground mb-3">Monthly Payment Breakdown</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Principal &amp; Interest</span>
                  <span className="font-medium tabular-nums">${fmtUSD(result.monthlyPI)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Property Tax</span>
                  <span className="font-medium tabular-nums">${fmtUSD(result.monthlyTax)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Home Insurance</span>
                  <span className="font-medium tabular-nums">${fmtUSD(result.monthlyInsurance)}</span>
                </div>
                {result.hasPMI && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">PMI</span>
                    <span className="font-medium tabular-nums">${fmtUSD(result.monthlyPMI)}</span>
                  </div>
                )}
                <div className="border-t border-border pt-2 flex justify-between items-center font-semibold">
                  <span>Total Monthly</span>
                  <span className="tabular-nums">${fmtUSD(result.totalMonthly)}</span>
                </div>
              </div>
              {result.hasPMI && (
                <p className="mt-3 pt-3 border-t border-border/50 text-xs text-muted-foreground">
                  <span className="font-medium">PMI note:</span> PMI is estimated since your down
                  payment is below 20%. Actual PMI varies by lender.
                </p>
              )}
            </Card>

            {/* Year-by-year amortisation table (P&I only) */}
            {result.rows.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-foreground mb-2">
                  Year-by-year amortisation breakdown
                </p>
                <div className="rounded-lg border border-border overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[480px]">
                      <thead>
                        <tr className="bg-muted/50 border-b border-border">
                          <th className="text-left px-3 py-2.5 text-xs font-semibold text-muted-foreground whitespace-nowrap w-14">
                            Year
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
            )}

          </div>
        )}
      </div>

      {/* Reset */}
      <div className="flex justify-end pt-2">
        <Button variant="outline" onClick={reset} disabled={isEmpty}>
          Reset
        </Button>
      </div>

      {/* ── Educational content ───────────────────────────────────────── */}
      <div className="pt-8 mt-8 border-t border-border space-y-0">

        {/* Section 1 — PITI */}
        <div>
          <h2 className="text-base font-semibold text-foreground mb-3">What Makes Up a Mortgage Payment (PITI)</h2>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              A full mortgage payment is commonly described by the acronym PITI: Principal,
              Interest, Taxes, and Insurance. Principal reduces your loan balance; interest is the
              cost of borrowing. Taxes and insurance are typically collected by the lender monthly,
              held in an escrow account, and paid on your behalf to the tax authority and insurer
              annually.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              If your down payment is less than 20% of the home price, lenders also require
              Private Mortgage Insurance (PMI) — an additional monthly charge that protects the
              lender if you default. On a $400,000 home with a 10% down payment, the loan is
              $360,000 and PMI is estimated at 0.5% of the loan amount annually,
              adding <span className="font-semibold text-foreground">$150.00</span> per month to
              the payment. PMI is removed once the loan balance falls below 80% of the original
              home value.
            </p>
          </div>
        </div>

        {/* Section 2 — How the Payment Is Calculated */}
        <div className="pt-8 mt-8 border-t border-border">
          <h2 className="text-base font-semibold text-foreground mb-3">How the Monthly Payment Is Calculated</h2>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              The principal and interest (P&I) portion follows the standard amortisation formula:
            </p>
            <div className="border border-border rounded-md bg-secondary p-4">
              <p className="text-sm font-mono font-semibold text-foreground">
                Monthly P&I = L × r × (1 + r)^n ÷ ((1 + r)^n − 1)
              </p>
            </div>
            <div className="border border-border rounded-md bg-secondary p-4 space-y-1.5">
              {[
                ['L', 'Loan amount (home price minus down payment)'],
                ['r', 'Monthly interest rate = annual rate ÷ 12 ÷ 100'],
                ['n', 'Total number of payments (years × 12)'],
              ].map(([v, d]) => (
                <p key={v} className="text-sm text-muted-foreground leading-relaxed">
                  <span className="font-mono font-semibold text-foreground">{v}</span> — {d}
                </p>
              ))}
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Worked example: $400,000 home, 20% down ($80,000), loan $320,000, 6.5% rate,
              30-year term. r = 6.5 ÷ 12 ÷ 100 = 0.005417. n = 360.
              Monthly P&I = <span className="font-semibold text-foreground">$2,022.62</span>.
              Total interest over 30 years:
              <span className="font-semibold text-foreground"> $408,142</span> — more than the
              loan amount itself paid in interest alone. Property tax and insurance are divided by
              12 and added directly to this figure.
            </p>
          </div>
        </div>

        {/* Section 3 — When to Use */}
        <div className="pt-8 mt-8 border-t border-border">
          <h2 className="text-base font-semibold text-foreground mb-3">When to Use This Calculator</h2>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Use this calculator when comparing homes at different price points or deciding how
              much down payment to put toward a purchase. The loan term toggle makes the 15-year
              vs. 30-year tradeoff immediately visible: on a $320,000 loan at 6.5%, a 30-year term
              costs $408,142 in total interest versus $181,758 on a 15-year term — a difference of
              $226,384, in exchange for a higher monthly payment of roughly $765. Enter your own
              numbers to find the crossover point that fits your cash flow.
            </p>
          </div>
        </div>

        {/* Section 4 — FAQ */}
        <div className="pt-8 mt-8 border-t border-border">
          <h2 className="text-base font-semibold text-foreground mb-3">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {[
              {
                q: 'What does PITI stand for and why does it matter?',
                a: "PITI stands for Principal, Interest, Taxes, and Insurance — the four components of a full monthly mortgage payment. Lenders use total PITI as the benchmark for affordability: most conventional lenders prefer that PITI not exceed 28–31% of gross monthly income. Quoting only the P&I portion significantly underestimates the true monthly cost, particularly in high-tax areas where property tax alone can add hundreds of dollars per month.",
              },
              {
                q: 'When can I stop paying PMI?',
                a: "PMI is typically required until your loan balance reaches 80% of the home's original purchase price — the point at which you have 20% equity. Under the US Homeowners Protection Act, you can request cancellation once the balance reaches 80% per the original amortisation schedule. Lenders must cancel PMI automatically when the balance reaches 78%. If the home has appreciated, an appraisal confirming at least 20% equity may allow earlier cancellation.",
              },
              {
                q: 'How does a larger down payment reduce total cost?',
                a: "A larger down payment reduces the loan amount directly, which lowers both the monthly payment and total interest paid. It also eliminates PMI once the down payment reaches 20%. Going from 10% to 20% down on a $400,000 home reduces the loan by $40,000, eliminates $150 per month in PMI, and reduces total interest paid over 30 years by approximately $51,018 at 6.5%.",
              },
              {
                q: "What's the difference between a 15-year and 30-year mortgage?",
                a: "A 30-year mortgage has a lower monthly payment but pays substantially more interest over the life of the loan. On a $320,000 loan at 6.5%, the 30-year monthly P&I is $2,022.62 and total interest is $408,142; the 15-year monthly P&I is $2,787.54 — about $765 more per month — but total interest is only $181,758, saving $226,384 over the life of the loan. The right choice depends on monthly cash flow, how long you plan to hold the home, and the opportunity cost of the extra monthly payment.",
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
