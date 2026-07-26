import { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Timer, Link2, PartyPopper, CalendarClock } from 'lucide-react';
import { ToolEmptyState } from '@/components/tool-empty-state';
import { ToolResultBadge } from '@/components/tool-result-badge';
import { useToast } from '@/hooks/use-toast';

const TARGET_PARAM = 'target';
const STORAGE_KEY = 'online-tools:countdown-target-epoch';

/**
 * The target time is stored and shared as an absolute epoch (ms), never as
 * a `datetime-local` string. A `datetime-local` value has no timezone —
 * round-tripping it through a receiver's browser re-interprets the same
 * digits in *their* local time, silently shifting the actual moment. Epoch
 * is the single source of truth; the `datetime-local` input is only ever a
 * local-time *view* onto it, derived fresh in each direction.
 */
function epochToLocalInputValue(epoch: number): string {
  const date = new Date(epoch);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function localInputValueToEpoch(value: string): number | null {
  if (!value) return null;
  const time = new Date(value).getTime();
  return isNaN(time) ? null : time;
}

function readInitialEpoch(): number | null {
  if (typeof window === 'undefined') return null;

  const params = new URLSearchParams(window.location.search);
  const raw = params.get(TARGET_PARAM);
  if (raw) {
    const epoch = Number(raw);
    if (!isNaN(epoch)) return epoch;
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored) {
    const epoch = Number(stored);
    if (!isNaN(epoch)) return epoch;
  }

  return null;
}

export default function CountdownToDate() {
  const [targetEpoch, setTargetEpoch] = useState<number | null>(readInitialEpoch);
  const [now, setNow] = useState(() => Date.now());
  const { toast } = useToast();

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Keep the URL and localStorage in sync so a refresh or a shared link
  // always resolves back to the same absolute moment.
  useEffect(() => {
    if (targetEpoch === null) return;
    window.localStorage.setItem(STORAGE_KEY, String(targetEpoch));
    const url = new URL(window.location.href);
    url.searchParams.set(TARGET_PARAM, String(targetEpoch));
    window.history.replaceState({}, '', url.toString());
  }, [targetEpoch]);

  const remaining = useMemo(() => {
    if (targetEpoch === null) return null;
    const diff = targetEpoch - now;
    if (diff <= 0) return { done: true, days: 0, hours: 0, minutes: 0, seconds: 0 };
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    return { done: false, days, hours, minutes, seconds };
  }, [targetEpoch, now]);

  const handleShare = () => {
    if (targetEpoch === null) return;
    navigator.clipboard.writeText(window.location.href);
    toast({ title: 'Shareable link copied to clipboard', duration: 2500 });
  };

  const handleClear = () => {
    setTargetEpoch(null);
    window.localStorage.removeItem(STORAGE_KEY);
    const url = new URL(window.location.href);
    url.searchParams.delete(TARGET_PARAM);
    window.history.replaceState({}, '', url.toString());
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 max-w-sm">
        <Label htmlFor="target-date">Target Date & Time</Label>
        <Input
          id="target-date"
          type="datetime-local"
          value={targetEpoch !== null ? epochToLocalInputValue(targetEpoch) : ''}
          onChange={(e) => setTargetEpoch(localInputValueToEpoch(e.target.value))}
          className="h-12"
        />
      </div>

      <div className="pt-2">
        {!remaining ? (
          <ToolEmptyState icon={Timer} message="Pick a date and time to start the countdown" className="h-48" />
        ) : (
          <Card className="relative p-6 bg-primary/5 border-primary/20">
            <ToolResultBadge />
            <div className="flex items-start justify-center gap-2 text-sm text-muted-foreground mb-4 text-center">
              <CalendarClock className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="break-words">
                {new Date(targetEpoch as number).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
              </span>
            </div>

            {remaining.done ? (
              <div className="flex flex-col items-center py-6 text-center">
                <PartyPopper className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mb-2" />
                <div className="text-2xl font-bold font-display text-emerald-600 dark:text-emerald-400">
                  The moment has arrived!
                </div>
              </div>
            ) : (
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
            )}
          </Card>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" onClick={handleClear} disabled={targetEpoch === null}>
          Clear
        </Button>
        <Button variant="outline" onClick={handleShare} disabled={targetEpoch === null}>
          <Link2 className="w-4 h-4 mr-2" /> Copy Shareable Link
        </Button>
      </div>
    </div>
  );
}
