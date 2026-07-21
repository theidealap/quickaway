import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Copy, Trash2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ToolResultBadge } from '@/components/tool-result-badge';
import { useToast } from '@/hooks/use-toast';

// ── Encode / decode helpers ───────────────────────────────────────────────────

function encodeBase64(text: string): string {
  // Correctly handles unicode via TextEncoder
  const bytes = new TextEncoder().encode(text);
  const binary = Array.from(bytes, (b) => String.fromCharCode(b)).join('');
  return btoa(binary);
}

function decodeBase64(b64: string): { ok: true; text: string } | { ok: false; error: string } {
  try {
    const binary = atob(b64.trim());
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    const text = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    return { ok: true, text };
  } catch {
    return { ok: false, error: 'Invalid Base64 — check for incorrect padding or non-Base64 characters.' };
  }
}

// ── Shared output card ────────────────────────────────────────────────────────

function OutputCard({ value, onCopy }: { value: string; onCopy: () => void }) {
  return (
    <Card className="relative p-5 bg-primary/5 border-primary/20 space-y-3">
      <ToolResultBadge />
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Output</p>
        <Button size="sm" variant="outline" onClick={onCopy}>
          <Copy className="w-3.5 h-3.5 mr-1.5" /> Copy
        </Button>
      </div>
      <pre className="text-sm font-mono leading-relaxed break-all whitespace-pre-wrap text-foreground select-all">
        {value}
      </pre>
    </Card>
  );
}

// ── Encode panel ─────────────────────────────────────────────────────────────

function EncodePanel() {
  const { toast } = useToast();
  const [input, setInput] = useState('');
  const encoded = input ? encodeBase64(input) : '';

  const copy = () => {
    if (!encoded) return;
    navigator.clipboard.writeText(encoded);
    toast({ title: 'Encoded text copied', duration: 2000 });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="enc-input">Plain text</Label>
        <div className="relative">
          <Textarea
            id="enc-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type or paste text to encode…"
            className="min-h-[140px] text-base resize-y p-4 font-sans leading-relaxed"
            autoFocus
          />
          {input && (
            <Button
              size="sm"
              variant="destructive"
              className="absolute bottom-3 right-3 shadow-sm opacity-80 hover:opacity-100"
              onClick={() => setInput('')}
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Clear
            </Button>
          )}
        </div>
      </div>

      {encoded && <OutputCard value={encoded} onCopy={copy} />}

      {input && (
        <p className="text-xs text-muted-foreground">
          {input.length} characters → {encoded.length} Base64 characters
          {' '}(~{Math.round((encoded.length / input.length) * 100)}% of original size)
        </p>
      )}
    </div>
  );
}

// ── Decode panel ─────────────────────────────────────────────────────────────

function DecodePanel() {
  const { toast } = useToast();
  const [input, setInput] = useState('');

  const result = input.trim() ? decodeBase64(input) : null;

  const copy = () => {
    if (!result?.ok) return;
    navigator.clipboard.writeText(result.text);
    toast({ title: 'Decoded text copied', duration: 2000 });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="dec-input">Base64 string</Label>
        <div className="relative">
          <Textarea
            id="dec-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste a Base64-encoded string here…"
            className="min-h-[140px] text-base resize-y p-4 font-mono text-sm leading-relaxed"
            autoFocus
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
          />
          {input && (
            <Button
              size="sm"
              variant="destructive"
              className="absolute bottom-3 right-3 shadow-sm opacity-80 hover:opacity-100"
              onClick={() => setInput('')}
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Clear
            </Button>
          )}
        </div>
      </div>

      {result && (
        result.ok ? (
          <OutputCard value={result.text} onCopy={copy} />
        ) : (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{result.error}</AlertDescription>
          </Alert>
        )
      )}
    </div>
  );
}

// ── Root export ───────────────────────────────────────────────────────────────

export default function Base64EncoderDecoder() {
  return (
    <Tabs defaultValue="encode" className="space-y-6">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="encode">Encode (text → Base64)</TabsTrigger>
        <TabsTrigger value="decode">Decode (Base64 → text)</TabsTrigger>
      </TabsList>
      <TabsContent value="encode">
        <EncodePanel />
      </TabsContent>
      <TabsContent value="decode">
        <DecodePanel />
      </TabsContent>
    </Tabs>
  );
}
