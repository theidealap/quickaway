import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Calendar, CalendarDays, Hash, Clock, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ToolEmptyState } from '@/components/tool-empty-state';
import { ToolResultBadge } from '@/components/tool-result-badge';

type AgeResult =
  | { ok: true; years: number; months: number; days: number; totalDaysLived: number }
  | { ok: false; error: string };

export default function AgeCalculator() {
  const today = new Date().toISOString().split('T')[0];
  const [birthDate, setBirthDate] = useState('');
  const [asOfDate, setAsOfDate] = useState(today);

  const result = useMemo((): AgeResult | null => {
    if (!birthDate || !asOfDate) return null;

    const bDate = new Date(birthDate);
    const aDate = new Date(asOfDate);

    if (bDate > aDate) {
      return { ok: false, error: 'Birth date cannot be after the "calculate as of" date.' };
    }

    // Reset time components to ensure accurate date difference
    bDate.setHours(0, 0, 0, 0);
    aDate.setHours(0, 0, 0, 0);

    let years = aDate.getFullYear() - bDate.getFullYear();
    let months = aDate.getMonth() - bDate.getMonth();
    let days = aDate.getDate() - bDate.getDate();

    if (days < 0) {
      months -= 1;
      const lastMonth = new Date(aDate.getFullYear(), aDate.getMonth(), 0);
      days += lastMonth.getDate();
    }

    if (months < 0) {
      years -= 1;
      months += 12;
    }

    const totalDaysLived = Math.floor((aDate.getTime() - bDate.getTime()) / (1000 * 60 * 60 * 24));

    return { ok: true, years, months, days, totalDaysLived };
  }, [birthDate, asOfDate]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="birthDate">Date of Birth</Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
              <Calendar className="w-4 h-4" />
            </div>
            <Input
              id="birthDate"
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="pl-10 h-12"
              max={asOfDate || today}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="asOfDate">Calculate age as of</Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
              <CalendarDays className="w-4 h-4" />
            </div>
            <Input
              id="asOfDate"
              type="date"
              value={asOfDate}
              onChange={(e) => setAsOfDate(e.target.value)}
              className="pl-10 h-12"
            />
          </div>
        </div>
      </div>

      <div className="pt-4">
        {!result ? (
          <ToolEmptyState
            icon={Calendar}
            message="Enter a birth date to calculate age"
            className="h-48"
          />
        ) : !result.ok ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{result.error}</AlertDescription>
          </Alert>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="relative p-6 col-span-1 md:col-span-3 bg-primary/5 border-primary/20 text-center flex flex-col items-center justify-center py-10">
              <ToolResultBadge />
              <span className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-1.5"><Clock className="w-4 h-4" /> Exact Age</span>
              <div className="flex flex-wrap justify-center items-baseline gap-x-4 gap-y-1">
                <span className="text-4xl md:text-5xl font-bold font-display tracking-tight text-foreground tabular-nums">
                  {result.years}<span className="text-xl md:text-2xl text-muted-foreground font-sans font-normal ml-1.5">yr</span>
                </span>
                <span className="text-4xl md:text-5xl font-bold font-display tracking-tight text-foreground tabular-nums">
                  {result.months}<span className="text-xl md:text-2xl text-muted-foreground font-sans font-normal ml-1.5">mo</span>
                </span>
                <span className="text-4xl md:text-5xl font-bold font-display tracking-tight text-foreground tabular-nums">
                  {result.days}<span className="text-xl md:text-2xl text-muted-foreground font-sans font-normal ml-1.5">d</span>
                </span>
              </div>
            </Card>

            <Card className="p-4 flex flex-col items-center justify-center text-center">
              <span className="text-sm text-muted-foreground mb-1">Years</span>
              <span className="text-3xl font-semibold">{result.years}</span>
            </Card>
            
            <Card className="p-4 flex flex-col items-center justify-center text-center">
              <span className="text-sm text-muted-foreground mb-1">Months</span>
              <span className="text-3xl font-semibold">{result.years * 12 + result.months}</span>
            </Card>

            <Card className="p-4 flex flex-col items-center justify-center text-center relative overflow-hidden">
              <span className="text-sm text-muted-foreground mb-1 flex items-center gap-1"><Hash className="w-3 h-3" /> Total Days</span>
              <span className="text-3xl font-semibold">{result.totalDaysLived.toLocaleString()}</span>
            </Card>
          </div>
        )}
      </div>
      
      <div className="flex justify-end pt-2">
        <Button 
          variant="outline" 
          onClick={() => {
            setBirthDate('');
            setAsOfDate(today);
          }}
          disabled={!birthDate && asOfDate === today}
        >
          Reset
        </Button>
      </div>

      {/* ── Educational content ───────────────────────────────────────── */}
      <div className="pt-8 mt-8 border-t border-border space-y-0">

        {/* Section 1 — How Age Is Calculated */}
        <div>
          <h2 className="text-base font-semibold text-foreground mb-3">How Age Is Calculated</h2>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Age calculation sounds simple — subtract the birth year from the current year — but
              that single figure ignores whether your birthday has occurred yet this calendar year.
              Someone born December 15, 1990, calculated on January 10, 2025, is actually 34 years
              old, not 35. A naive year subtraction gives 35 (2025 − 1990), but the December
              birthday has not arrived yet in January. The correct year count is one lower.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The precise method works in three stages. First, subtract birth year from reference
              year and check whether this year's birthday has passed — if not, reduce the year count
              by one. Second, compute remaining months by the same logic, borrowing days from the
              preceding month when needed. Third, count the leftover days. This produces a result
              like 34 years, 0 months, 26 days and a total of 12,445 days lived — precise to the
              calendar day, with no rounding of month lengths or leap years.
            </p>
          </div>
        </div>

        {/* Section 2 — How It's Calculated */}
        <div className="pt-8 mt-8 border-t border-border">
          <h2 className="text-base font-semibold text-foreground mb-3">How the Calculation Works</h2>
          <div className="space-y-3">
            <div className="border border-border rounded-md bg-secondary p-4 space-y-2">
              {[
                ['Step 1', 'Subtract birth year from reference year → initial year count.'],
                ['Step 2', 'If the birthday has not occurred yet this year (month or day is later), subtract 1.'],
                ['Step 3', "Compute remaining months and days using the calendar's actual month lengths."],
                ['Step 4', 'Total days = (reference date − birth date) in milliseconds ÷ 86,400,000.'],
              ].map(([label, desc]) => (
                <p key={label} className="text-sm text-muted-foreground leading-relaxed">
                  <span className="font-semibold text-foreground">{label}: </span>{desc}
                </p>
              ))}
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Why this matters: calendar months have 28–31 days, and February has 29 in leap years.
              A calculator that treats every month as 30 days accumulates errors of several days per
              year. This tool uses the calendar's actual month lengths at each step, so the day
              count is always exact.
            </p>
          </div>
        </div>

        {/* Section 3 — When to Use */}
        <div className="pt-8 mt-8 border-t border-border">
          <h2 className="text-base font-semibold text-foreground mb-3">When to Use This Calculator</h2>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              The "calculate as of" field makes this more than a today-only tool. Use it to find
              someone's age on a program enrolment date, a legal eligibility cutoff, or a past
              or future milestone. The total days count matters for precise milestone tracking:
              reaching 10,000 days alive happens at roughly age 27 years and 4–5 months, but the
              exact date depends on birth date and which leap years fall within that span — so
              the figure is different for every person.
            </p>
          </div>
        </div>

        {/* Section 4 — FAQ */}
        <div className="pt-8 mt-8 border-t border-border">
          <h2 className="text-base font-semibold text-foreground mb-3">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {[
              {
                q: "Why can't I just subtract birth year from current year?",
                a: "Year subtraction only counts how many birthdays could have occurred, not how many have. If you were born in November and you check in February, subtracting years gives a count one too high — this year's birthday hasn't arrived yet. The accurate method checks whether the current month and day have passed the birth month and day before settling on the year count.",
              },
              {
                q: 'How does a leap year affect age calculation?',
                a: "Leap years affect the total days count directly — anyone who has lived through a leap year has accumulated an extra calendar day compared to a non-leap year. For someone born on February 29, the birthday is treated as not-yet-passed until March 1 in non-leap years, so on February 28, 2025, a person born February 29, 1996 is 28 years, 11 months, and 30 days old — not yet 29.",
              },
              {
                q: 'What is the difference between age in years and exact age in days?',
                a: 'Age in years is a rounded, calendar-aware figure used for legal and social purposes. Age in total days is an unambiguous count of the exact number of 24-hour periods since birth. Two people who are both "34 years old" can differ by up to 364 days in their day count, depending on where their birthdays fall in the year. Total days is useful whenever a precise elapsed-time figure matters more than the rounded year.',
              },
              {
                q: 'Do some cultures calculate age differently?',
                a: 'Yes. East Asian age reckoning, traditional in Korea and historically in China and Japan, counts a newborn as age 1 at birth and adds 1 on each January 1st rather than each birthday. A baby born on December 31st becomes age 2 by January 2nd of the following year, even though only two days have passed. South Korea officially adopted the international birthday-based system in June 2023.',
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
