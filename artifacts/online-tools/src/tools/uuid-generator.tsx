import { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Copy, RefreshCw, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// ── UUID v4 generation ────────────────────────────────────────────────────────

function generateUUID(): string {
  // Use crypto.randomUUID() if available (modern browsers), else polyfill
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant bits
  const hex = Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
}

function generateBatch(count: number, uppercase: boolean): string[] {
  return Array.from({ length: count }, () => {
    const id = generateUUID();
    return uppercase ? id.toUpperCase() : id;
  });
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function UuidGenerator() {
  const { toast } = useToast();
  const [count, setCount] = useState(5);
  const [uppercase, setUppercase] = useState(false);
  const [uuids, setUuids] = useState<string[]>(() => generateBatch(5, false));
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const regen = useCallback((c = count, upper = uppercase) => {
    setUuids(generateBatch(c, upper));
    setCopiedIndex(null);
  }, [count, uppercase]);

  const changeCount = (val: number[]) => {
    const c = val[0];
    setCount(c);
    regen(c, uppercase);
  };

  const toggleUppercase = () => {
    const next = !uppercase;
    setUppercase(next);
    setUuids((prev) => prev.map((id) => (next ? id.toUpperCase() : id.toLowerCase())));
  };

  const copyOne = (uuid: string, index: number) => {
    navigator.clipboard.writeText(uuid);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex((i) => (i === index ? null : i)), 1500);
  };

  const copyAll = () => {
    navigator.clipboard.writeText(uuids.join('\n'));
    toast({ title: `Copied ${uuids.length} UUIDs`, description: 'All UUIDs copied to clipboard.', duration: 2000 });
  };

  return (
    <div className="space-y-6">
      {/* What is a UUID? */}
      <div className="rounded-xl border bg-muted/40 p-4 text-sm text-muted-foreground leading-relaxed">
        <span className="font-semibold text-foreground">What is a UUID?</span>{' '}
        A UUID (Universally Unique Identifier) is a unique ID used by applications, databases, APIs, and software systems to identify records without duplication. Each UUID v4 is randomly generated and practically guaranteed to be unique across all time and space.
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Count slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">Number of UUIDs</Label>
              <p className="text-xs text-muted-foreground mt-0.5">Choose how many unique IDs to generate at once.</p>
            </div>
            <span className="text-2xl font-bold font-display text-primary w-8 text-right">{count}</span>
          </div>
          <Slider min={1} max={20} step={1} value={[count]} onValueChange={changeCount} />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>1</span><span>20</span>
          </div>
        </div>

        {/* Uppercase toggle */}
        <div className="flex items-center justify-between p-4 rounded-xl border bg-card">
          <div>
            <p className="text-sm font-medium">Uppercase</p>
            <p className="text-xs text-muted-foreground font-mono">A1B2C3D4… vs a1b2c3d4…</p>
          </div>
          <Switch checked={uppercase} onCheckedChange={toggleUppercase} aria-label="Toggle uppercase" />
        </div>
      </div>

      {/* UUID list */}
      <Card className="p-5 bg-primary/5 border-primary/20 space-y-2">
        {/* Header row */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            UUID v4 — {count} generated
          </p>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => regen()}>
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Regenerate
            </Button>
            <Button size="sm" onClick={copyAll}>
              <Copy className="w-3.5 h-3.5 mr-1.5" /> Copy all
            </Button>
          </div>
        </div>

        {/* UUID rows */}
        <div className="space-y-1.5">
          {uuids.map((uuid, i) => (
            <div
              key={i}
              className="group flex items-center justify-between gap-3 px-3 py-2 rounded-lg border border-transparent hover:border-border hover:bg-background/60 transition-colors"
            >
              <span className="font-mono text-sm text-foreground select-all tracking-wide flex-1 truncate">
                {uuid}
              </span>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => copyOne(uuid, i)}
                aria-label="Copy UUID"
              >
                {copiedIndex === i ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </Button>
            </div>
          ))}
        </div>
      </Card>

      {/* Info note */}
      <p className="text-xs text-muted-foreground">
        UUID v4 — generated using <code className="font-mono">crypto.getRandomValues()</code>. All IDs are created locally in your browser; nothing is sent to a server.
      </p>
    </div>
  );
}
