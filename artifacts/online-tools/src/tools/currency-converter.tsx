import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, ArrowLeftRight, Copy, Info, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// ── Types ─────────────────────────────────────────────────────────────────────

interface RateResponse {
  amount: number;
  base: string;
  date: string;
  rates: Record<string, number>;
}

// ── Searchable currency select ─────────────────────────────────────────────────

function CurrencySelect({
  id,
  label,
  value,
  onChange,
  currencies,
  disabled,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (code: string) => void;
  currencies: Record<string, string>;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const entries = Object.entries(currencies);
  const filtered = search === ''
    ? entries
    : entries.filter(([code, name]) =>
        code.toLowerCase().includes(search.toLowerCase()) ||
        name.toLowerCase().includes(search.toLowerCase())
      );

  useEffect(() => {
    if (!open) return;
    function handleOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch('');
      }
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [open]);

  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 50);
  }, [open]);

  const selectedLabel = currencies[value] ? `${value} — ${currencies[value]}` : value;

  return (
    <div className="space-y-1.5" ref={ref}>
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <button
          id={id}
          type="button"
          disabled={disabled}
          onClick={() => setOpen((o) => !o)}
          className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className="truncate text-left">{selectedLabel}</span>
          <svg className="ml-2 h-4 w-4 shrink-0 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {open && (
          <div className="absolute z-20 mt-1 w-full rounded-md border border-border bg-background shadow-lg">
            <div className="p-2 border-b border-border">
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search currency…"
                className="w-full rounded border border-input bg-background px-2 py-1.5 text-sm outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div className="max-h-52 overflow-y-auto">
              {filtered.length === 0 ? (
                <p className="px-3 py-2 text-sm text-muted-foreground">No currencies found.</p>
              ) : (
                filtered.map(([code, name]) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => { onChange(code); setOpen(false); setSearch(''); }}
                    className={`flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground text-left ${code === value ? 'bg-primary/10 font-semibold' : ''}`}
                  >
                    <span className="font-mono font-semibold w-10 shrink-0">{code}</span>
                    <span className="truncate text-muted-foreground">{name}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function CurrencyConverter() {
  const { toast } = useToast();

  const [amount, setAmount] = useState('1');
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [currencies, setCurrencies] = useState<Record<string, string>>({});
  const [rate, setRate] = useState<number | null>(null);
  const [rateDate, setRateDate] = useState<string>('');
  const [currenciesLoading, setCurrenciesLoading] = useState(true);
  const [rateLoading, setRateLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch available currencies once on mount
  useEffect(() => {
    fetch('https://api.frankfurter.dev/v1/currencies')
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<Record<string, string>>;
      })
      .then((data) => {
        setCurrencies(data);
        setCurrenciesLoading(false);
      })
      .catch(() => {
        setError('Could not load the currency list. Please check your connection and refresh the page.');
        setCurrenciesLoading(false);
      });
  }, []);

  // Fetch rate whenever currencies change (not on every keystroke)
  useEffect(() => {
    if (currenciesLoading) return;
    if (fromCurrency === '' || toCurrency === '') return;

    // Same currency — rate is exactly 1, no API call needed
    if (fromCurrency === toCurrency) {
      setRate(1);
      setRateDate('');
      return;
    }

    setRateLoading(true);
    setError(null);

    fetch(`https://api.frankfurter.dev/v1/latest?from=${fromCurrency}&to=${toCurrency}`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<RateResponse>;
      })
      .then((data) => {
        const fetchedRate = data.rates[toCurrency];
        if (fetchedRate === undefined) throw new Error('Rate not found in response');
        setRate(fetchedRate);
        setRateDate(data.date);
        setRateLoading(false);
      })
      .catch(() => {
        setError('Could not fetch the exchange rate. The rate service may be temporarily unavailable — please try again in a moment.');
        setRate(null);
        setRateLoading(false);
      });
  }, [fromCurrency, toCurrency, currenciesLoading]);

  const parsedAmount = parseFloat(amount);
  const amountValid = amount !== '' && !isNaN(parsedAmount) && parsedAmount >= 0;
  const convertedAmount = amountValid && rate !== null ? parsedAmount * rate : null;

  const formattedConverted =
    convertedAmount !== null
      ? convertedAmount.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: convertedAmount < 1 ? 6 : 2,
        })
      : null;

  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const copyResult = () => {
    if (formattedConverted === null) return;
    navigator.clipboard.writeText(`${formattedConverted} ${toCurrency}`);
    toast({ title: 'Result copied', duration: 2000 });
  };

  if (currenciesLoading) {
    return (
      <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm">Loading currencies…</span>
      </div>
    );
  }

  return (
    <>
      {/* ── API notice ─────────────────────────────────────────────────────── */}
      <div className="flex items-start gap-2 rounded-md border border-border bg-muted/40 p-3 text-xs text-muted-foreground mb-2">
        <Info className="w-3.5 h-3.5 mt-0.5 shrink-0 text-primary" />
        <span>
          <strong>Live data:</strong> Unlike most QuickAway tools that run entirely in your browser,
          this tool fetches current exchange rates from the{' '}
          <a href="https://www.frankfurter.dev" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Frankfurter API</a>{' '}
          (European Central Bank reference rates). No personal data is sent.
        </span>
      </div>

      {/* ── Input area ─────────────────────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            type="number"
            min="0"
            step="any"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            className="text-base"
          />
          {amount !== '' && !amountValid && (
            <p className="text-xs text-destructive">Please enter a valid non-negative number.</p>
          )}
        </div>

        <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2">
          <CurrencySelect
            id="from-currency"
            label="From"
            value={fromCurrency}
            onChange={setFromCurrency}
            currencies={currencies}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleSwap}
            title="Swap currencies"
            className="mb-0.5"
          >
            <ArrowLeftRight className="w-4 h-4" />
          </Button>
          <CurrencySelect
            id="to-currency"
            label="To"
            value={toCurrency}
            onChange={setToCurrency}
            currencies={currencies}
          />
        </div>
      </div>

      {/* ── Error state ─────────────────────────────────────────────────────── */}
      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* ── Result area ─────────────────────────────────────────────────────── */}
      {!error && (
        <div className="mt-5 space-y-3">
          {/* Hero result card */}
          <Card className="p-6 bg-primary/5 border-primary/20">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Converted Amount</p>
                {rateLoading ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Fetching rate…</span>
                  </div>
                ) : formattedConverted !== null ? (
                  <p className="text-3xl font-bold text-foreground leading-tight">
                    {formattedConverted}{' '}
                    <span className="text-xl font-semibold text-muted-foreground">{toCurrency}</span>
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">Enter an amount above to convert.</p>
                )}
                {amount !== '' && amountValid && !rateLoading && rate !== null && (
                  <p className="text-sm text-muted-foreground">
                    {parsedAmount.toLocaleString()} {fromCurrency}
                  </p>
                )}
              </div>
              {formattedConverted !== null && !rateLoading && (
                <Button size="sm" variant="outline" onClick={copyResult} className="shrink-0 mt-1">
                  <Copy className="w-3.5 h-3.5 mr-1.5" /> Copy
                </Button>
              )}
            </div>
          </Card>

          {/* Secondary stat cards */}
          {rate !== null && !rateLoading && (
            <div className="grid grid-cols-2 gap-3">
              <Card className="p-4 space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Exchange Rate</p>
                <p className="text-sm font-semibold text-foreground">
                  1 {fromCurrency} = {fromCurrency === toCurrency ? '1' : rate.toFixed(6)} {toCurrency}
                </p>
              </Card>
              <Card className="p-4 space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Rates as of</p>
                <p className="text-sm font-semibold text-foreground">
                  {rateDate !== '' ? rateDate : 'Same currency'}
                </p>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* ── Educational content ───────────────────────────────────────────── */}

      <div className="pt-8 mt-8 border-t border-border">
        <h2 className="text-base font-semibold text-foreground mb-3">How Currency Conversion Works</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          An exchange rate is the ratio at which one currency can be exchanged for another. If 1 USD = 0.92 EUR, then 100 USD converts to 92 EUR by multiplying the amount by the rate. Converting in the opposite direction means dividing: 92 EUR ÷ 0.92 = 100 USD. Exchange rates change continuously because currencies trade on the foreign exchange (forex) market — the world's largest financial market, with over $7.5 trillion in daily volume according to the Bank for International Settlements' 2022 triennial survey. Three main forces drive rate movements: supply and demand for each currency on global markets; central bank interest rate decisions (a higher rate attracts foreign capital inflows, increasing demand for that currency); and trade balances (countries that export more than they import typically see sustained demand for their currency, which supports its value).
        </p>
      </div>

      <div className="pt-8 mt-8 border-t border-border">
        <h2 className="text-base font-semibold text-foreground mb-3">Where These Rates Come From</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          This converter fetches rates from the{' '}
          <a href="https://www.frankfurter.dev" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Frankfurter API</a>,
          an open-source project that sources its data from the{' '}
          <a href="https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">European Central Bank's official reference rates</a>.
          The ECB publishes these rates once per business day, typically around 4:00 PM Central European Time. Rates are not published on weekends or ECB public holidays. This means the rates shown here reflect the most recent ECB business-day reference rate — they are not live, real-time market quotes. For most everyday purposes — travel budgeting, understanding a foreign invoice, or comparing international prices — this level of accuracy is entirely sufficient. For active currency trading, you would use a live feed directly from a forex broker or exchange, which reflects the mid-market rate at that exact moment.
        </p>
      </div>

      <div className="pt-8 mt-8 border-t border-border">
        <h2 className="text-base font-semibold text-foreground mb-3">When to Use This Converter</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          This tool is well-suited for three common scenarios. <strong>Travel budgeting:</strong> convert your home currency to your destination currency to plan a daily spending allowance or understand roughly what accommodation and meals will cost. <strong>Understanding international prices:</strong> when shopping on a foreign retailer's website, comparing job salaries across countries, or reviewing a supplier's quote in a foreign currency. <strong>Rough invoice or estimate review:</strong> when a client or contractor quotes in a foreign currency and you need to convert it to your own for internal budgeting or approval. It is not appropriate for executing actual currency trades, making time-sensitive financial decisions, or calculating the exact amount you will receive — for those, check directly with your bank, payment provider, or a regulated currency broker.
        </p>
      </div>

      <div className="pt-8 mt-8 border-t border-border">
        <h2 className="text-base font-semibold text-foreground mb-3">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {[
            {
              q: 'How often are the rates updated?',
              a: 'Rates are updated once per business day, sourced from the European Central Bank\'s daily reference rate publication. The ECB typically publishes around 4:00 PM CET on business days. Rates are not updated on weekends or ECB public holidays. The "Rates as of" date shown on every result tells you exactly which day\'s rate is being applied.',
            },
            {
              q: 'Are these rates the same as what my bank will give me?',
              a: 'No. The rates shown here are mid-market reference rates — the midpoint between the buy and sell prices on the interbank market. Banks, credit cards, and currency exchange services apply a margin (commonly called a spread) on top of the mid-market rate, which is how they make money on currency transactions. This margin typically ranges from 1% to 4% for retail customers, though some services advertise rates closer to the mid-market rate. Always check the final rate your provider quotes before committing to a transaction.',
            },
            {
              q: 'Why do exchange rates change day to day?',
              a: 'Exchange rates are set by supply and demand in the global forex market, which operates 24 hours a day, five days a week. The main drivers of day-to-day changes include: central bank interest rate decisions and forward guidance (which affect expected returns on assets denominated in that currency), economic data releases such as inflation figures, employment reports, and GDP growth, geopolitical events that affect investor confidence, and shifts in global trade flows. Because many of these factors change daily, exchange rates rarely stay fixed for extended periods.',
            },
            {
              q: 'Is this suitable for large financial transactions?',
              a: 'No. For any transaction where the exact rate matters — large wire transfers, business invoices, property purchases, or investment decisions — you should obtain a firm quote directly from your bank or a regulated currency broker at the time of the transaction. The reference rates shown here may differ from the rate you actually receive, and the difference on a large sum can be significant. Use this tool for estimation and orientation, not for executing financial decisions.',
            },
          ].map(({ q, a }) => (
            <div key={q} className="border border-border rounded-md p-4">
              <p className="text-sm font-semibold text-foreground mb-1">{q}</p>
              <p className="text-sm text-muted-foreground">{a}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
