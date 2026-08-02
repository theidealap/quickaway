import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Clock, ArrowLeftRight, ChevronDown, Check } from 'lucide-react';
import { ToolEmptyState } from '@/components/tool-empty-state';
import { ToolResultBadge } from '@/components/tool-result-badge';

// ── Timezone list ─────────────────────────────────────────────────────────────

const TIMEZONES = [
  { iana: 'UTC',                               label: 'UTC — Coordinated Universal Time'            },
  { iana: 'Pacific/Midway',                    label: 'Midway Island (UTC−11)'                      },
  { iana: 'Pacific/Honolulu',                  label: 'Honolulu (HST, UTC−10)'                      },
  { iana: 'America/Anchorage',                 label: 'Anchorage (AKST/AKDT, UTC−9/−8)'             },
  { iana: 'America/Los_Angeles',               label: 'Los Angeles / Seattle (PST/PDT, UTC−8/−7)'   },
  { iana: 'America/Vancouver',                 label: 'Vancouver (PST/PDT, UTC−8/−7)'               },
  { iana: 'America/Tijuana',                   label: 'Tijuana (PST/PDT, UTC−8/−7)'                 },
  { iana: 'America/Phoenix',                   label: 'Phoenix (MST, UTC−7, no DST)'                },
  { iana: 'America/Denver',                    label: 'Denver / Calgary (MST/MDT, UTC−7/−6)'        },
  { iana: 'America/Chicago',                   label: 'Chicago / Mexico City (CST/CDT, UTC−6/−5)'   },
  { iana: 'America/Mexico_City',               label: 'Mexico City (CST/CDT, UTC−6/−5)'             },
  { iana: 'America/New_York',                  label: 'New York / Miami (EST/EDT, UTC−5/−4)'        },
  { iana: 'America/Toronto',                   label: 'Toronto (EST/EDT, UTC−5/−4)'                 },
  { iana: 'America/Halifax',                   label: 'Halifax (AST/ADT, UTC−4/−3)'                 },
  { iana: 'America/Bogota',                    label: 'Bogotá / Lima (COT/PET, UTC−5)'              },
  { iana: 'America/Lima',                      label: 'Lima (PET, UTC−5)'                           },
  { iana: 'America/Santiago',                  label: 'Santiago (CLT/CLST, UTC−4/−3)'               },
  { iana: 'America/Caracas',                   label: 'Caracas (VET, UTC−4)'                        },
  { iana: 'America/Sao_Paulo',                 label: 'São Paulo / Rio (BRT, UTC−3)'                },
  { iana: 'America/Argentina/Buenos_Aires',    label: 'Buenos Aires (ART, UTC−3)'                   },
  { iana: 'Atlantic/Azores',                   label: 'Azores (AZOT/AZOST, UTC−1/0)'                },
  { iana: 'Atlantic/Reykjavik',                label: 'Reykjavik (GMT, UTC±0)'                      },
  { iana: 'Europe/London',                     label: 'London / Dublin (GMT/BST, UTC+0/+1)'         },
  { iana: 'Europe/Lisbon',                     label: 'Lisbon (WET/WEST, UTC+0/+1)'                 },
  { iana: 'Europe/Paris',                      label: 'Paris / Brussels (CET/CEST, UTC+1/+2)'       },
  { iana: 'Europe/Berlin',                     label: 'Berlin / Warsaw (CET/CEST, UTC+1/+2)'        },
  { iana: 'Europe/Madrid',                     label: 'Madrid / Rome (CET/CEST, UTC+1/+2)'          },
  { iana: 'Europe/Amsterdam',                  label: 'Amsterdam / Zurich (CET/CEST, UTC+1/+2)'     },
  { iana: 'Europe/Stockholm',                  label: 'Stockholm / Oslo (CET/CEST, UTC+1/+2)'       },
  { iana: 'Africa/Lagos',                      label: 'Lagos / Kinshasa (WAT, UTC+1)'               },
  { iana: 'Europe/Athens',                     label: 'Athens / Helsinki (EET/EEST, UTC+2/+3)'      },
  { iana: 'Europe/Bucharest',                  label: 'Bucharest / Kyiv (EET/EEST, UTC+2/+3)'       },
  { iana: 'Africa/Cairo',                      label: 'Cairo (EET, UTC+2)'                          },
  { iana: 'Africa/Johannesburg',               label: 'Johannesburg (SAST, UTC+2)'                  },
  { iana: 'Europe/Istanbul',                   label: 'Istanbul (TRT, UTC+3)'                       },
  { iana: 'Europe/Moscow',                     label: 'Moscow / St. Petersburg (MSK, UTC+3)'        },
  { iana: 'Asia/Riyadh',                       label: 'Riyadh / Kuwait (AST, UTC+3)'                },
  { iana: 'Africa/Nairobi',                    label: 'Nairobi / Addis Ababa (EAT, UTC+3)'          },
  { iana: 'Asia/Dubai',                        label: 'Dubai / Abu Dhabi (GST, UTC+4)'              },
  { iana: 'Asia/Baku',                         label: 'Baku (AZT, UTC+4)'                           },
  { iana: 'Asia/Karachi',                      label: 'Karachi (PKT, UTC+5)'                        },
  { iana: 'Asia/Tashkent',                     label: 'Tashkent (UZT, UTC+5)'                       },
  { iana: 'Asia/Kolkata',                      label: 'Mumbai / Delhi / Kolkata (IST, UTC+5:30)'    },
  { iana: 'Asia/Kathmandu',                    label: 'Kathmandu (NPT, UTC+5:45)'                   },
  { iana: 'Asia/Dhaka',                        label: 'Dhaka (BST, UTC+6)'                          },
  { iana: 'Asia/Almaty',                       label: 'Almaty (ALMT, UTC+6)'                        },
  { iana: 'Asia/Rangoon',                      label: 'Yangon (MMT, UTC+6:30)'                      },
  { iana: 'Asia/Bangkok',                      label: 'Bangkok / Jakarta (ICT/WIB, UTC+7)'          },
  { iana: 'Asia/Ho_Chi_Minh',                  label: 'Ho Chi Minh City (ICT, UTC+7)'               },
  { iana: 'Asia/Singapore',                    label: 'Singapore (SGT, UTC+8)'                      },
  { iana: 'Asia/Kuala_Lumpur',                 label: 'Kuala Lumpur (MYT, UTC+8)'                   },
  { iana: 'Asia/Shanghai',                     label: 'Shanghai / Beijing (CST, UTC+8)'             },
  { iana: 'Asia/Hong_Kong',                    label: 'Hong Kong (HKT, UTC+8)'                      },
  { iana: 'Asia/Taipei',                       label: 'Taipei (CST, UTC+8)'                         },
  { iana: 'Asia/Manila',                       label: 'Manila (PST, UTC+8)'                         },
  { iana: 'Australia/Perth',                   label: 'Perth (AWST, UTC+8)'                         },
  { iana: 'Asia/Seoul',                        label: 'Seoul (KST, UTC+9)'                          },
  { iana: 'Asia/Tokyo',                        label: 'Tokyo / Osaka (JST, UTC+9)'                  },
  { iana: 'Australia/Darwin',                  label: 'Darwin (ACST, UTC+9:30)'                     },
  { iana: 'Australia/Adelaide',                label: 'Adelaide (ACST/ACDT, UTC+9:30/+10:30)'       },
  { iana: 'Australia/Sydney',                  label: 'Sydney / Canberra (AEST/AEDT, UTC+10/+11)'   },
  { iana: 'Australia/Melbourne',               label: 'Melbourne (AEST/AEDT, UTC+10/+11)'           },
  { iana: 'Asia/Vladivostok',                  label: 'Vladivostok (VLAT, UTC+10)'                  },
  { iana: 'Pacific/Noumea',                    label: 'Noumea (NCT, UTC+11)'                        },
  { iana: 'Pacific/Auckland',                  label: 'Auckland / Wellington (NZST/NZDT, UTC+12/+13)' },
  { iana: 'Pacific/Fiji',                      label: 'Fiji (FJT, UTC+12)'                          },
] as const;

type TzIana = (typeof TIMEZONES)[number]['iana'];

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Format a Date in a given IANA timezone, returning { date, time, offset } parts. */
function formatInTz(d: Date, tz: string) {
  const fmt = (opts: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat('en-US', { timeZone: tz, ...opts }).format(d);

  const date = fmt({ weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
  const time = fmt({ hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  const offsetParts = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    timeZoneName: 'shortOffset',
  }).formatToParts(d);
  const offset = offsetParts.find(p => p.type === 'timeZoneName')?.value ?? '';

  return { date, time, offset };
}

/**
 * Return the UTC offset (in minutes) of `tz` at a given UTC millisecond timestamp.
 * Strategy: format the UTC instant in `tz`, parse it back to "naive UTC" ms, diff.
 */
function getOffsetMinutes(ms: number, tz: string): number {
  const d = new Date(ms);
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false,
  }).formatToParts(d);
  const get = (t: string) => parseInt(parts.find(p => p.type === t)?.value ?? '0');
  const h = get('hour');
  const localMs = Date.UTC(get('year'), get('month') - 1, get('day'), h === 24 ? 0 : h, get('minute'), get('second'));
  return Math.round((localMs - ms) / 60000);
}

/**
 * Convert a naive datetime-local string (e.g. "2026-08-02T14:30") interpreted as
 * being in `fromTz` to a UTC Date object.
 */
function localToUTC(datetimeLocal: string, fromTz: string): Date | null {
  if (!datetimeLocal) return null;
  const [datePart, timePart] = datetimeLocal.split('T');
  if (!datePart || !timePart) return null;
  const [y, m, d] = datePart.split('-').map(Number);
  const [h, min] = timePart.split(':').map(Number);
  if ([y, m, d, h, min].some(isNaN)) return null;

  // Treat input as UTC to get approximate ms, then correct for the timezone offset
  const naiveMs = Date.UTC(y, m - 1, d, h, min, 0);
  const offsetMin = getOffsetMinutes(naiveMs, fromTz);
  return new Date(naiveMs - offsetMin * 60000);
}

/** Format a Date as a datetime-local input value in a given timezone. */
function dateToLocalInput(d: Date, tz: string): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false,
  }).formatToParts(d);
  const get = (t: string) => parts.find(p => p.type === t)?.value ?? '00';
  const h = get('hour') === '24' ? '00' : get('hour');
  return `${get('year')}-${get('month')}-${get('day')}T${h}:${get('minute')}`;
}

// ── Searchable timezone picker ────────────────────────────────────────────────

function TzPicker({
  id,
  value,
  onChange,
  label,
}: {
  id: string;
  value: TzIana;
  onChange: (v: TzIana) => void;
  label: string;
}) {
  const [open, setOpen]     = useState(false);
  const [query, setQuery]   = useState('');
  const containerRef        = useRef<HTMLDivElement>(null);
  const inputRef            = useRef<HTMLInputElement>(null);

  const selected = TIMEZONES.find(t => t.iana === value);

  const filtered = query.trim() === ''
    ? TIMEZONES
    : TIMEZONES.filter(t =>
        t.label.toLowerCase().includes(query.toLowerCase()) ||
        t.iana.toLowerCase().includes(query.toLowerCase())
      );

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const select = (iana: TzIana) => {
    onChange(iana);
    setOpen(false);
    setQuery('');
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div ref={containerRef} className="relative">
        <button
          id={id}
          type="button"
          onClick={() => {
            setOpen(o => !o);
            setTimeout(() => inputRef.current?.focus(), 50);
          }}
          className="w-full h-12 px-3 pr-10 text-left text-sm border border-input rounded-md bg-background hover:bg-accent/50 transition-colors flex items-center truncate"
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          <span className="truncate text-foreground">{selected?.label ?? value}</span>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        </button>

        {open && (
          <div className="absolute z-50 top-full mt-1 left-0 right-0 bg-popover border border-border rounded-md shadow-lg overflow-hidden">
            <div className="p-2 border-b border-border">
              <Input
                ref={inputRef}
                placeholder="Search city or timezone…"
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="h-8 text-sm"
              />
            </div>
            <div className="max-h-56 overflow-y-auto">
              {filtered.length === 0 ? (
                <p className="py-3 px-3 text-sm text-muted-foreground">No results.</p>
              ) : (
                filtered.map(tz => (
                  <button
                    key={tz.iana}
                    type="button"
                    onClick={() => select(tz.iana as TzIana)}
                    className="w-full px-3 py-2 text-left text-sm flex items-center justify-between gap-2 hover:bg-accent transition-colors"
                  >
                    <span className="truncate">{tz.label}</span>
                    {tz.iana === value && <Check className="h-3.5 w-3.5 shrink-0 text-primary" />}
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

// ── Component ─────────────────────────────────────────────────────────────────

export default function TimeZoneConverter() {
  const [fromTz, setFromTz] = useState<TzIana>('America/New_York');
  const [toTz, setToTz]     = useState<TzIana>('Europe/London');
  const [inputDt, setInputDt] = useState(() => dateToLocalInput(new Date(), 'America/New_York'));
  const [now, setNow]         = useState(new Date());
  const [copied, setCopied]   = useState(false);

  // Live clock tick
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // When fromTz changes, re-express the current inputDt in the new timezone
  const handleFromTzChange = (tz: TzIana) => {
    const utc = localToUTC(inputDt, fromTz);
    if (utc) setInputDt(dateToLocalInput(utc, tz));
    setFromTz(tz);
  };

  const swapZones = () => {
    const utc = localToUTC(inputDt, fromTz);
    setFromTz(toTz);
    setToTz(fromTz);
    if (utc) setInputDt(dateToLocalInput(utc, toTz));
  };

  const setToNow = () => setInputDt(dateToLocalInput(new Date(), fromTz));

  // Derived
  const utcDate = localToUTC(inputDt, fromTz);
  const fromInfo = utcDate ? formatInTz(utcDate, fromTz) : null;
  const toInfo   = utcDate ? formatInTz(utcDate, toTz)   : null;

  const nowFromInfo = formatInTz(now, fromTz);
  const nowToInfo   = formatInTz(now, toTz);

  const copyResult = () => {
    if (!toInfo) return;
    const toLabel = TIMEZONES.find(t => t.iana === toTz)?.label ?? toTz;
    navigator.clipboard.writeText(`${toInfo.date} ${toInfo.time} ${toInfo.offset} (${toLabel})`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const isEmpty = inputDt === '';

  return (
    <div className="space-y-6">

      {/* ── Inputs ───────────────────────────────────────────────────────── */}
      <div className="space-y-4">

        {/* Row: From TZ + swap + To TZ */}
        <div className="flex items-end gap-2">
          <div className="flex-1 min-w-0">
            <TzPicker id="tz-from" value={fromTz} onChange={handleFromTzChange} label="From Timezone" />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={swapZones}
            className="h-12 w-12 shrink-0 mb-0"
            title="Swap timezones"
            aria-label="Swap timezones"
          >
            <ArrowLeftRight className="h-4 w-4" />
          </Button>
          <div className="flex-1 min-w-0">
            <TzPicker id="tz-to" value={toTz} onChange={setToTz} label="To Timezone" />
          </div>
        </div>

        {/* Date + time input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="tz-datetime">Date &amp; Time (in "From" timezone)</Label>
            <button
              type="button"
              onClick={setToNow}
              className="text-xs text-primary hover:underline"
            >
              Use current time
            </button>
          </div>
          <Input
            id="tz-datetime"
            type="datetime-local"
            value={inputDt}
            onChange={e => setInputDt(e.target.value)}
            className="h-12"
          />
        </div>

      </div>

      {/* ── Results ──────────────────────────────────────────────────────── */}
      <div className="pt-2">
        {isEmpty || !utcDate || !fromInfo || !toInfo ? (
          <ToolEmptyState
            icon={Clock}
            message="Select two timezones and a date & time to convert"
            className="h-48"
          />
        ) : (
          <div className="space-y-4">

            {/* Hero — converted time */}
            <Card className="relative p-6 bg-primary/5 border-primary/20 text-center py-8">
              <ToolResultBadge label="Converted" />
              <span className="text-sm font-medium text-muted-foreground mb-3 flex items-center justify-center gap-1.5">
                <Clock className="w-4 h-4" />
                {TIMEZONES.find(t => t.iana === toTz)?.label ?? toTz}
              </span>
              <p className="text-3xl md:text-4xl font-bold font-display tracking-tight text-foreground tabular-nums">
                {toInfo.time}
              </p>
              <p className="text-base text-muted-foreground mt-1">{toInfo.date}</p>
              <p className="text-sm text-muted-foreground mt-0.5 font-mono">{toInfo.offset}</p>
            </Card>

            {/* From / To stat cards */}
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              <Card className="p-3 md:p-4 min-w-0 overflow-hidden">
                <p className="text-xs text-muted-foreground mb-1 truncate">
                  From: {TIMEZONES.find(t => t.iana === fromTz)?.label.split(' ')[0]}
                </p>
                <p className="text-sm md:text-base font-semibold tabular-nums">{fromInfo.time}</p>
                <p className="text-xs text-muted-foreground">{fromInfo.date}</p>
                <p className="text-xs font-mono text-muted-foreground mt-0.5">{fromInfo.offset}</p>
              </Card>
              <Card className="p-3 md:p-4 min-w-0 overflow-hidden">
                <p className="text-xs text-muted-foreground mb-1 truncate">
                  To: {TIMEZONES.find(t => t.iana === toTz)?.label.split(' ')[0]}
                </p>
                <p className="text-sm md:text-base font-semibold tabular-nums">{toInfo.time}</p>
                <p className="text-xs text-muted-foreground">{toInfo.date}</p>
                <p className="text-xs font-mono text-muted-foreground mt-0.5">{toInfo.offset}</p>
              </Card>
            </div>

            {/* Copy result */}
            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={copyResult}>
                {copied ? '✓ Copied' : 'Copy result'}
              </Button>
            </div>

          </div>
        )}
      </div>

      {/* ── Live current time strip ───────────────────────────────────────── */}
      <Card className="p-4 bg-muted/40">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          Current time (live)
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-muted-foreground truncate mb-0.5">
              {TIMEZONES.find(t => t.iana === fromTz)?.label ?? fromTz}
            </p>
            <p className="text-base font-bold tabular-nums">{nowFromInfo.time}</p>
            <p className="text-xs text-muted-foreground">{nowFromInfo.date} · {nowFromInfo.offset}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground truncate mb-0.5">
              {TIMEZONES.find(t => t.iana === toTz)?.label ?? toTz}
            </p>
            <p className="text-base font-bold tabular-nums">{nowToInfo.time}</p>
            <p className="text-xs text-muted-foreground">{nowToInfo.date} · {nowToInfo.offset}</p>
          </div>
        </div>
      </Card>

    </div>
  );
}
