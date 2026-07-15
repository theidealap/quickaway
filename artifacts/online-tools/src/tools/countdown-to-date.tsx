import { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Timer, Link2, PartyPopper } from 'lucide-react';
import { ToolEmptyState } from '@/components/tool-empty-state';
import { ToolResultBadge } from '@/components/tool-result-badge';
import { useToast } from '@/hooks/use-toast';

const TARGET_PARAM = 'target';

function readTargetFromUrl(): string {
  if (typeof window === 'undefined') return '';
  const params = new URLSearchParams(window.location.search);
  const raw = params.get(TARGET_PARAM);
  if (!raw) return '';
  const timestamp = Number(raw);
  if (isNaN(timestamp)) return '';
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return '';
  // toISOString → "YYYY-MM-DDTHH:mm:ss.sssZ"; datetime-local wants "YYYY-MM-DDTHH:mm"
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function CountdownToDate() {
  const [targetDate, setTargetDate] = useState(readTargetFromUrl);
  const [now, setNow] = useState(() => Date.now());
  const { toast } = useToast();

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const target = targetDate ? new Date(targetDate).getTime() : null;

  const remaining = useMemo(() => {
    if (!target) return null;
    const diff = target - now;
    if (diff <= 0) return { done: true, days: 0, hours: 0, minutes: 0, seconds: 0 };
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    return { done: false, days, hours, minutes, seconds };
  }, [target, now]);

  const handleShare = () => {
    if (!target) return;
    const url = new URL(window.location.href);
    url.searchParams.set(TARGET_PARAM, String(target));
    navigator.clipboard.writeText(url.toString());
    toast({ title: 'Shareable link copied to clipboard', duration: 2500 });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 max-w-sm">
        <Label htmlFor="target-date">Target Date & Time</Label>
        <Input
          id="target-date"
          type="datetime-local"
          value={targetDate}
          onChange={(e) => setTargetDate(e.target.value)}
          className="h-12"
        />
      </div>

      <div className="pt-2">
        {!remaining ? (
          <ToolEmptyState icon={Timer} message="Pick a date and time to start the countdown" className="h-48" />
        ) : remaining.done ? (
          <Card className="relative p-6 bg-emerald-500/10 border-emerald-500/30 text-center flex flex-col items-center py-10">
            <ToolResultBadge />
            <PartyPopper className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mb-2" />
            <div className="text-2xl font-bold font-display text-emerald-600 dark:text-emerald-400">
              The moment has arrived!
            </div>
          </Card>
        ) : (
          <Card className="relative p-6 bg-primary/5 border-primary/20">
            <ToolResultBadge />
            <div className="grid grid-cols-4 gap-3 md:gap-4">
              {[
                { label: 'Days', value: remaining.days },
                { label: 'Hours', value: remaining.hours },
                { label: 'Minutes', value: remaining.minutes },
                { label: 'Seconds', value: remaining.seconds },
              ].map((unit) => (
                <div key={unit.label} className="bg-background rounded-xl border p-4 md:p-6 flex flex-col items-center">
                  <span className="text-3xl md:text-5xl font-bold font-display tracking-tight text-foreground tabular-nums">
                    {String(unit.value).padStart(2, '0')}
                  </span>
                  <span className="text-xs md:text-sm text-muted-foreground uppercase tracking-wide mt-1">{unit.label}</span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      <div className="flex justify-end pt-2">
        <Button variant="outline" onClick={handleShare} disabled={!target}>
          <Link2 className="w-4 h-4 mr-2" /> Copy Shareable Link
        </Button>
      </div>
    </div>
  );
}
