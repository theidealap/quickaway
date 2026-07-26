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
              <ToolResultBadge />
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
    </div>
  );
}
