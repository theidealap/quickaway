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
              <span className="font-mono text-[11px] sm:text-sm text-foreground select-all flex-1 min-w-0 break-all">
                {uuid}
              </span>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
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
        UUID v4, generated using <code className="font-mono">crypto.getRandomValues()</code>. All IDs are created locally in your browser; nothing is sent to a server.
      </p>

      {/* ── Educational content ───────────────────────────────────────────── */}

      <div className="pt-8 mt-8 border-t border-border">
        <h2 className="text-base font-semibold text-foreground mb-3">What a UUID Is and How It Is Structured</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          A UUID (Universally Unique Identifier) is a 128-bit identifier displayed as 32 hexadecimal characters in an 8-4-4-4-12 pattern — for example, <code className="font-mono text-xs">550e8400-e29b-41d4-a716-446655440000</code>. The hyphens are purely for readability. The full 128 bits = 32 hex characters × 4 bits each.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed mt-2">
          This tool generates <strong>UUID version 4</strong> — the most widely used variant. Of the 128 bits, 122 are cryptographically random. The remaining 6 bits are fixed: 4 bits encode the version (0100 = v4) and 2 bits encode the RFC 4122 variant. These fixed bits explain why UUID v4 always shows a <code className="font-mono text-xs">4</code> as the first character of the third group, and always starts the fourth group with <code className="font-mono text-xs">8</code>, <code className="font-mono text-xs">9</code>, <code className="font-mono text-xs">a</code>, or <code className="font-mono text-xs">b</code>.
        </p>
      </div>

      <div className="pt-8 mt-8 border-t border-border">
        <h2 className="text-base font-semibold text-foreground mb-3">How v4 UUIDs Are Generated and How Unique They Are</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          This tool calls <code className="font-mono text-xs">crypto.randomUUID()</code> — the browser's cryptographically secure random number generator (CSPRNG), seeded by the operating system. With 122 random bits, the total number of possible UUID v4 values is 2¹²² ≈ <strong>5.32 × 10³⁶</strong>.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed mt-2">
          Using the birthday paradox approximation, generating approximately <strong>2.72 × 10¹⁸</strong> UUIDs would be required to reach a 50% probability of any collision. At one billion UUIDs generated, the collision probability is effectively zero. Even at 10¹⁵ (one quadrillion) UUIDs, the collision probability is only ~9.4 × 10⁻⁸. In any practical system, UUID v4 collisions are astronomically unlikely.
        </p>
      </div>

      <div className="pt-8 mt-8 border-t border-border">
        <h2 className="text-base font-semibold text-foreground mb-3">When to Use This Generator</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          UUID v4 is the standard identifier format wherever records must be created without a central coordinator — distributed databases, microservice APIs, client-generated record IDs, event tracking, session tokens, and uploaded file names. Unlike auto-incrementing integers, UUIDs can be generated independently on any client without risking conflicts. The "Copy all" button is useful for seeding test data or database migration scripts where a batch of unique IDs is needed at once.
        </p>
      </div>

      <div className="pt-8 mt-8 border-t border-border">
        <h2 className="text-base font-semibold text-foreground mb-3">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {[
            {
              q: 'What is a UUID used for?',
              a: 'UUIDs appear as primary keys in databases, API resource identifiers, session IDs, message IDs in event queues, and names for uploaded files. Their value is that they can be generated independently — by any client, server, or device — with no central authority needed to ensure uniqueness. This makes them essential in distributed systems and offline-first apps where coordinating a shared counter is impractical.',
            },
            {
              q: 'How likely is a UUID v4 collision?',
              a: 'With 2¹²² possible values (~5.32 × 10³⁶), the collision probability is vanishingly small. By the birthday paradox approximation, you would need to generate roughly 2.72 × 10¹⁸ UUIDs to reach a 50% chance of any collision — generating one UUID per nanosecond for over 86 years. In practice, UUID v4 collisions are treated as theoretically impossible.',
            },
            {
              q: 'What is the difference between UUID v4 and other versions?',
              a: 'UUID versions differ in how the unique value is derived. Version 1 encodes the current timestamp and the host\'s MAC address — traceable to the generating machine. Versions 3 and 5 are name-based, deterministically generating a UUID from a namespace and a name using MD5 or SHA-1 respectively. Version 4 (this tool) is purely random, making it the preferred choice when traceability is undesirable and collision resistance is sufficient.',
            },
            {
              q: 'Are UUIDs the same as GUIDs?',
              a: 'Yes — GUID (Globally Unique Identifier) is Microsoft\'s term for the same concept and the same 8-4-4-4-12 format. Microsoft Windows, COM, and .NET generate GUIDs; Unix and web standards use UUID. The structure and collision properties are identical. The terms are interchangeable in all practical contexts, though "UUID" appears in the RFC 4122 standard and is preferred in non-Microsoft ecosystems.',
            },
          ].map(({ q, a }) => (
            <div key={q} className="border border-border rounded-md p-4">
              <p className="text-sm font-semibold text-foreground mb-1">{q}</p>
              <p className="text-sm text-muted-foreground">{a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
