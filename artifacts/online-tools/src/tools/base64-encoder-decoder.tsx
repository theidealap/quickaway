import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Copy, Trash2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

// ── Encode / decode helpers ───────────────────────────────────────────────────

function encodeBase64(text: string): string {
  // Correctly handles unicode via TextEncoder → btoa pipeline
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
    <Card className="p-5 bg-primary/5 border-primary/20 space-y-3">
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

// ── Root export — state lifted here so tab switching preserves content ────────

export default function Base64EncoderDecoder() {
  const { toast } = useToast();

  // Both inputs live at the top level so switching tabs never clears them
  const [encodeInput, setEncodeInput] = useState('');
  const [decodeInput, setDecodeInput] = useState('');

  const encoded = encodeInput ? encodeBase64(encodeInput) : '';
  const decodeResult = decodeInput.trim() ? decodeBase64(decodeInput) : null;

  const copyEncoded = () => {
    if (!encoded) return;
    navigator.clipboard.writeText(encoded);
    toast({ title: 'Encoded text copied', duration: 2000 });
  };

  const copyDecoded = () => {
    if (!decodeResult?.ok) return;
    navigator.clipboard.writeText(decodeResult.text);
    toast({ title: 'Decoded text copied', duration: 2000 });
  };

  return (
    <Tabs defaultValue="encode" className="space-y-6">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="encode">Encode (text → Base64)</TabsTrigger>
        <TabsTrigger value="decode">Decode (Base64 → text)</TabsTrigger>
      </TabsList>

      {/* ── Encode panel ── */}
      <TabsContent value="encode" className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="enc-input">Plain text</Label>
          <div className="relative">
            <Textarea
              id="enc-input"
              value={encodeInput}
              onChange={(e) => setEncodeInput(e.target.value)}
              placeholder="Type or paste text to encode…"
              className="min-h-[140px] text-base resize-y p-4 font-sans leading-relaxed"
              autoComplete="off"
            />
            {encodeInput && (
              <Button
                size="sm"
                variant="destructive"
                className="absolute bottom-3 right-3 shadow-sm opacity-80 hover:opacity-100"
                onClick={() => setEncodeInput('')}
              >
                <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Clear
              </Button>
            )}
          </div>
        </div>

        {encoded && <OutputCard value={encoded} onCopy={copyEncoded} />}

        {encodeInput && (
          <p className="text-xs text-muted-foreground">
            {encodeInput.length} characters → {encoded.length} Base64 characters
            {' '}(~{Math.round((encoded.length / encodeInput.length) * 100)}% of original size)
          </p>
        )}
      </TabsContent>

      {/* ── Decode panel ── */}
      <TabsContent value="decode" className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="dec-input">Base64 string</Label>
          <div className="relative">
            <Textarea
              id="dec-input"
              value={decodeInput}
              onChange={(e) => setDecodeInput(e.target.value)}
              placeholder="Paste a Base64-encoded string here…"
              className="min-h-[140px] text-base resize-y p-4 font-mono text-sm leading-relaxed"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
            />
            {decodeInput && (
              <Button
                size="sm"
                variant="destructive"
                className="absolute bottom-3 right-3 shadow-sm opacity-80 hover:opacity-100"
                onClick={() => setDecodeInput('')}
              >
                <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Clear
              </Button>
            )}
          </div>
        </div>

        {decodeResult && (
          decodeResult.ok ? (
            <OutputCard value={decodeResult.text} onCopy={copyDecoded} />
          ) : (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{decodeResult.error}</AlertDescription>
            </Alert>
          )
        )}
      </TabsContent>
    </Tabs>
  );
}
