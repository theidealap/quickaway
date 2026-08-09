import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Calendar, CalendarDays, AlertCircle, Clock } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ToolEmptyState } from '@/components/tool-empty-state';
import { ToolResultBadge } from '@/components/tool-result-badge';

type Result =
  | { ok: true; years: number; months: number; days: number; totalDays: number; weeks: number; hours: number }
  | { ok: false; error: string };

export default function DateDifferenceCalculator() {
  const today = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState(today);

  const result = useMemo((): Result | null => {
    if (!startDate || !endDate) return null;

    const start = new Date(startDate);
    const end = new Date(endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    if (start > end) {
      return { ok: false, error: 'Start date must be before or equal to end date.' };
    }

    const totalMs = end.getTime() - start.getTime();
    const totalDays = Math.round(totalMs / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(totalDays / 7);
    const hours = totalDays * 24;

    // Calendar-accurate years / months / remaining days
    let years = end.getFullYear() - start.getFullYear();
    let months = end.getMonth() - start.getMonth();
    let days = end.getDate() - start.getDate();

    if (days < 0) {
      months -= 1;
      const prevMonth = new Date(end.getFullYear(), end.getMonth(), 0);
      days += prevMonth.getDate();
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }

    return { ok: true, years, months, days, totalDays, weeks, hours };
  }, [startDate, endDate]);

  const reset = () => {
    setStartDate('');
    setEndDate(today);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date</Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
              <Calendar className="w-4 h-4" />
            </div>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="pl-10 h-12"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="endDate">End Date</Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
              <CalendarDays className="w-4 h-4" />
            </div>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="pl-10 h-12"
            />
          </div>
        </div>
      </div>

      <div className="pt-2">
        {!result ? (
          <ToolEmptyState
            icon={Calendar}
            message="Enter a start date to calculate the difference"
            className="h-48"
          />
        ) : !result.ok ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{result.error}</AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            {/* Primary result */}
            <Card className="relative p-6 bg-primary/5 border-primary/20 text-center flex flex-col items-center justify-center py-10">
              <ToolResultBadge label="Done" />
              <span className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                <Clock className="w-4 h-4" /> Difference
              </span>
              <div className="flex flex-wrap justify-center items-baseline gap-x-3 gap-y-1">
                {result.years > 0 && (
                  <span className="text-4xl md:text-5xl font-bold font-display tracking-tight text-foreground tabular-nums">
                    {result.years}<span className="text-xl md:text-2xl text-muted-foreground font-sans font-normal ml-1.5">yr</span>
                  </span>
                )}
                {result.months > 0 && (
                  <span className="text-4xl md:text-5xl font-bold font-display tracking-tight text-foreground tabular-nums">
                    {result.months}<span className="text-xl md:text-2xl text-muted-foreground font-sans font-normal ml-1.5">mo</span>
                  </span>
                )}
                <span className="text-4xl md:text-5xl font-bold font-display tracking-tight text-foreground tabular-nums">
                  {result.days}<span className="text-xl md:text-2xl text-muted-foreground font-sans font-normal ml-1.5">day{result.days !== 1 ? 's' : ''}</span>
                </span>
              </div>
            </Card>

            {/* Secondary stats */}
            <div className="grid grid-cols-3 gap-3 md:gap-4">
              <Card className="p-2 md:p-4 text-center min-w-0 overflow-hidden">
                <span className="text-xs text-muted-foreground block mb-1">Total Days</span>
                <span className="text-sm md:text-2xl font-bold font-display leading-tight tabular-nums">{result.totalDays.toLocaleString()}</span>
              </Card>
              <Card className="p-2 md:p-4 text-center min-w-0 overflow-hidden">
                <span className="text-xs text-muted-foreground block mb-1">Weeks</span>
                <span className="text-sm md:text-2xl font-bold font-display leading-tight tabular-nums">{result.weeks.toLocaleString()}</span>
              </Card>
              <Card className="p-2 md:p-4 text-center min-w-0 overflow-hidden">
                <span className="text-xs text-muted-foreground block mb-1">Hours</span>
                <span className="text-sm md:text-2xl font-bold font-display leading-tight tabular-nums">{result.hours.toLocaleString()}</span>
              </Card>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end pt-2">
        <Button variant="outline" onClick={reset} disabled={!startDate && endDate === today}>
          Reset
        </Button>
      </div>

      {/* ── Educational content ───────────────────────────────────────── */}
      <div className="pt-8 mt-8 border-t border-border space-y-0">

        {/* Section 1 */}
        <div>
          <h2 className="text-base font-semibold text-foreground mb-3">How Date Differences Are Calculated</h2>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              The calculator produces two outputs for the same span: a raw total days count and
              a calendar-accurate years/months/days breakdown. These express the same interval
              differently and are not directly interconvertible using simple arithmetic.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Example 1: January 15, 2020 → August 9, 2026. Total days:{' '}
              <span className="font-semibold text-foreground">2,398</span>. Calendar breakdown:{' '}
              <span className="font-semibold text-foreground">6 years, 6 months, 25 days</span>.
              A naive estimate of 6×365 + 6×30 + 25 = 2,395 falls 3 days short, because it
              assumes every year has 365 days and every month has 30. The actual span includes
              two leap years (2020 and 2024) and months of varying length. Total days is always
              exact; the calendar breakdown uses actual month and year lengths at each stage.
            </p>
          </div>
        </div>

        {/* Section 2 */}
        <div className="pt-8 mt-8 border-t border-border">
          <h2 className="text-base font-semibold text-foreground mb-3">How the Calculation Works</h2>
          <div className="space-y-3">
            <div className="border border-border rounded-md bg-secondary p-4 space-y-2">
              {[
                ['Total days', '(end − start) in milliseconds ÷ 86,400,000 — always exact'],
                ['Years', 'Subtract years; if the end month/day is before the start month/day, subtract 1'],
                ['Months', 'Subtract months; if end day < start day, borrow from the previous month using its actual length'],
                ['Days', 'Remaining calendar days after years and months are resolved'],
              ].map(([label, desc]) => (
                <p key={label} className="text-sm text-muted-foreground leading-relaxed">
                  <span className="font-semibold text-foreground">{label}:</span> {desc}
                </p>
              ))}
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Example 2: March 1, 2023 → December 31, 2025 ={' '}
              <span className="font-semibold text-foreground">1,036 total days</span> ={' '}
              <span className="font-semibold text-foreground">2 years, 9 months, 30 days</span>.
              The span crosses the 2024 leap year, contributing one extra day that a 365-per-year
              estimate would miss.
            </p>
          </div>
        </div>

        {/* Section 3 */}
        <div className="pt-8 mt-8 border-t border-border">
          <h2 className="text-base font-semibold text-foreground mb-3">When to Use This Calculator</h2>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              The total days count is useful for contract durations, warranty and subscription
              tracking, and any context where exact elapsed days matter — payment terms, notice
              periods, or legal deadlines. The calendar breakdown (years/months/days) is more
              readable for planning: how long until a visa expires, how long since a project
              started, or how much time remains before a fixed-date event. Both outputs cover
              the same span; which to use depends on how precision needs to be expressed.
            </p>
          </div>
        </div>

        {/* Section 4 */}
        <div className="pt-8 mt-8 border-t border-border">
          <h2 className="text-base font-semibold text-foreground mb-3">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {[
              {
                q: 'Why does the days count differ from years × 365?',
                a: "Calendar years and months are not uniform in length. Leap years add a day every four years (with century-year exceptions), and months range from 28 to 31 days. A span of exactly '2 years' can be 730 days (no leap year) or 731 days (one leap year). The total days figure is computed directly from the millisecond difference between the two dates, making it always exact regardless of which years and months the span crosses.",
              },
              {
                q: 'Can I calculate the difference between a past and a future date?',
                a: "Yes. The start date can be any valid calendar date and the end date can be any date on or after it — there is no restriction on whether the dates are in the past, present, or future. Calculating how many days remain until a future event, or how many days have elapsed since a past event, uses exactly the same calculation. The calculator simply measures the distance between the two chosen dates.",
              },
              {
                q: 'Does the calculator count business days or only calendar days?',
                a: "This calculator counts calendar days only — every day including weekends and public holidays. It has no knowledge of weekday vs. weekend distinctions or public holiday calendars for any country or region. For contract notice periods or payment terms specified in 'business days,' you would need to manually subtract the number of weekends and holidays within the span from the total days figure.",
              },
              {
                q: 'Why might two date calculators give slightly different results for years/months/days?',
                a: "The raw total days count is unambiguous — any correct implementation will match. The years/months/days breakdown involves a judgment call about how to handle the borrow when a month boundary is crossed: specifically, how many days to attribute to the 'previous month' when the end day is earlier than the start day. Different calculators resolve this edge case differently, producing results that may differ by 1–2 days in the remaining-days figure while agreeing on the total days count.",
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
