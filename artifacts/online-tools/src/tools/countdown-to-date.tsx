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
            <ToolResultBadge label="Done" />
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

      {/* ── Educational content ───────────────────────────────────────── */}
      <div className="pt-8 mt-8 border-t border-border space-y-0">

        {/* Section 1 */}
        <div>
          <h2 className="text-base font-semibold text-foreground mb-3">How a Countdown Is Calculated</h2>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              A countdown measures the time remaining between the current moment and a fixed
              target date and time. It is calculated by subtracting the current timestamp from
              the target timestamp to get a difference in milliseconds, which is then broken
              into days, hours, minutes, and seconds.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Illustrative example: target = January 1, 2027, 00:00 UTC; reference moment =
              August 9, 2026, 12:00 UTC. Difference: 12,484,800 seconds. Broken down:{' '}
              <span className="font-semibold text-foreground">144 days, 12 hours, 0 minutes,
              0 seconds</span>. The display updates every second as the current time advances.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The target is stored as an absolute epoch (milliseconds since January 1, 1970 UTC),
              not a datetime string. A datetime string like "2027-01-01 00:00" has no timezone
              attached — sharing it would allow a recipient's browser to re-interpret those digits
              in their own local time, silently shifting the moment. Storing the epoch avoids this.
            </p>
          </div>
        </div>

        {/* Section 2 */}
        <div className="pt-8 mt-8 border-t border-border">
          <h2 className="text-base font-semibold text-foreground mb-3">How the Display Is Computed</h2>
          <div className="space-y-3">
            <div className="border border-border rounded-md bg-secondary p-4 space-y-2">
              {[
                ['Days',    'floor(totalMs ÷ 86,400,000)'],
                ['Hours',   'floor((totalMs ÷ 3,600,000) mod 24)'],
                ['Minutes', 'floor((totalMs ÷ 60,000) mod 60)'],
                ['Seconds', 'floor((totalMs ÷ 1,000) mod 60)'],
              ].map(([unit, formula]) => (
                <p key={unit} className="text-sm text-muted-foreground leading-relaxed">
                  <span className="font-semibold text-foreground">{unit}:</span>{' '}
                  <span className="font-mono">{formula}</span>
                </p>
              ))}
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Each unit is derived from the same totalMs value, so the four numbers always
              add up exactly to the remaining time. The page recalculates every 1,000 ms
              (one second) using a JavaScript interval. Time zone note: if you set a target
              to "midnight on December 31" on a device in UTC−5 (EST), the stored epoch is
              00:00 EST = 05:00 UTC — a viewer in UTC will see the countdown reach zero
              at 5:00 AM their time.
            </p>
          </div>
        </div>

        {/* Section 3 */}
        <div className="pt-8 mt-8 border-t border-border">
          <h2 className="text-base font-semibold text-foreground mb-3">When to Use This Countdown</h2>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Use the shareable link feature when coordinating a deadline across multiple
              people. Because the target is stored as an absolute epoch in the URL parameter,
              anyone who opens the shared link sees a countdown to the same absolute moment
              regardless of their timezone — they see it expressed in their local time labels,
              but the underlying moment is identical. Useful for product launch countdowns,
              event timers, and personal milestone tracking where the shared link eliminates
              timezone ambiguity.
            </p>
          </div>
        </div>

        {/* Section 4 */}
        <div className="pt-8 mt-8 border-t border-border">
          <h2 className="text-base font-semibold text-foreground mb-3">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {[
              {
                q: 'Does the countdown account for my time zone?',
                a: "Yes. When you pick a date and time using the input, those values are interpreted in your device's local time zone. A target of 'December 31, 11:59 PM' is stored as midnight UTC−5 if your device is in EST — not as midnight UTC. The epoch-based storage means the countdown is always counting down to the same absolute moment in time, correctly converted to local time for every viewer.",
              },
              {
                q: 'What happens after the countdown reaches zero?',
                a: "When the current time passes the target epoch, the numeric countdown is replaced with a completion message. The timer continues checking every second, so there is no delay between the moment the target is reached and the display switching. The countdown does not loop or reset automatically — it simply holds the completion state until you set a new target.",
              },
              {
                q: 'Can I use this for a recurring annual event like a birthday?',
                a: "The countdown tracks a specific absolute date and time, not a recurring pattern. For an annual event, set the target to the next upcoming occurrence. After the countdown completes, clear it and set a new target for the following year's date. There is no repeat or recurrence setting — each countdown is a single, fixed moment in time.",
              },
              {
                q: 'Why might this countdown differ by a few hours from another site for the same event?',
                a: "The most common cause is timezone interpretation. If you enter 'midnight' on a target date in UTC−5, this tool stores 05:00 UTC as the target. Another site storing the datetime string '00:00' without timezone context may interpret it as midnight UTC, midnight in the viewer's local zone, or midnight in the server's timezone — potentially differing by several hours. The shareable link from this tool always encodes the exact epoch, eliminating that ambiguity.",
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
