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
              <span className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1.5"><Clock className="w-4 h-4" /> Exact Age</span>
              <div className="text-4xl md:text-5xl font-bold font-display tracking-tight text-foreground">
                {result.years} <span className="text-2xl text-muted-foreground font-sans">years</span>, {result.months} <span className="text-2xl text-muted-foreground font-sans">months</span>, {result.days} <span className="text-2xl text-muted-foreground font-sans">days</span>
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
    </div>
  );
}
