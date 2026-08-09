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
    return { ok: false, error: 'Invalid Base64 string. Check for incorrect padding or non-Base64 characters.' };
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
    <>
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

      {/* ── Educational content ───────────────────────────────────────────── */}

      <div className="pt-8 mt-8 border-t border-border">
        <h2 className="text-base font-semibold text-foreground mb-3">What Base64 Encoding Does</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Base64 is a binary-to-text encoding scheme that represents any sequence of bytes using only 64 printable ASCII characters: uppercase A–Z (26), lowercase a–z (26), digits 0–9 (10), and the symbols <code className="font-mono text-xs">+</code> and <code className="font-mono text-xs">/</code> (2) — totalling exactly 64 characters, which is the source of the name.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed mt-2">
          Base64 exists because many text-based protocols — email (SMTP), HTTP headers, and JSON — cannot safely transport arbitrary binary data. Raw binary bytes can include control characters or null bytes with special meaning in the protocol. Base64 guarantees output that passes safely through any text channel. Worked example: <code className="font-mono text-xs">"Hello"</code> (5 bytes) encodes to <code className="font-mono text-xs">SGVsbG8=</code> (8 Base64 characters). Decoded: <code className="font-mono text-xs">atob("SGVsbG8=")</code> → <code className="font-mono text-xs">"Hello"</code> ✓.
        </p>
      </div>

      <div className="pt-8 mt-8 border-t border-border">
        <h2 className="text-base font-semibold text-foreground mb-3">How the Encoding Works</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Base64 processes input 3 bytes at a time (24 bits) and converts each group to 4 Base64 characters (6 bits each, since log₂(64) = 6). Three bytes → four characters means output is always exactly <strong>4/3 the size of the input</strong> — a ~33.3% size increase. When the input length is not a multiple of 3, <code className="font-mono text-xs">=</code> padding characters align the output to a multiple of 4:
        </p>
        <div className="border border-border rounded-md bg-secondary p-4 mt-3 text-sm font-mono text-foreground leading-relaxed space-y-1">
          <div>"Man" (3 bytes) → <strong>TWFu</strong> (4 chars, no padding)</div>
          <div>"Ma"  (2 bytes) → <strong>TWE=</strong> (4 chars, one = padding)</div>
          <div>"M"   (1 byte)  → <strong>TQ==</strong> (4 chars, two == padding)</div>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed mt-3">
          This tool encodes via <code className="font-mono text-xs">TextEncoder</code> → <code className="font-mono text-xs">btoa()</code> so Unicode characters (emoji, accented letters) are correctly handled before encoding.
        </p>
      </div>

      <div className="pt-8 mt-8 border-t border-border">
        <h2 className="text-base font-semibold text-foreground mb-3">When to Use This Tool</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Base64 is encountered most often when inspecting data that passes through text-constrained pipelines. Common scenarios: decoding a JWT (JSON Web Token) — the header and payload sections are Base64url-encoded JSON; inspecting binary attachments in email MIME parts; embedding small images or fonts in CSS as <code className="font-mono text-xs">data:</code> URIs; and reading API tokens or keys that are Base64-encoded by convention. If you receive a string that looks like random characters ending with <code className="font-mono text-xs">=</code> or <code className="font-mono text-xs">==</code>, it is likely Base64.
        </p>
      </div>

      <div className="pt-8 mt-8 border-t border-border">
        <h2 className="text-base font-semibold text-foreground mb-3">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {[
            {
              q: 'Is Base64 encoding the same as encryption?',
              a: 'No. Base64 is encoding, not encryption. It transforms binary data into a text-safe form but provides no confidentiality — anyone who sees the Base64 string can decode it instantly. Encryption transforms data in a way that requires a key to reverse. JWTs, for example, are Base64-encoded but not encrypted by default — their contents are visible to anyone who decodes them.',
            },
            {
              q: 'Why does Base64 output sometimes end with = or ==?',
              a: 'Base64 encodes 3 bytes into 4 characters. When the input length is not a multiple of 3, the final group has 1 or 2 bytes instead of 3. Padding characters (=) bring the output to a multiple of 4: one remaining byte → two == characters; two remaining bytes → one = character. "Man" (3 bytes) needs no padding; "Ma" (2 bytes) gets =; "M" (1 byte) gets ==.',
            },
            {
              q: 'Why is Base64 output longer than the input?',
              a: 'Because 6 bits of binary data are represented as one 8-bit ASCII character. Each 3-byte (24-bit) input group becomes 4 output characters (4 × 8 = 32 bits). The size ratio is exactly 4/3 ≈ 1.333, meaning a 300-byte input produces a 400-character Base64 string. This overhead is the trade-off for compatibility with text-only transport channels.',
            },
            {
              q: 'What are the most common real-world uses of Base64 encoding?',
              a: 'The most frequently encountered uses are: JSON Web Tokens (header and payload are Base64url-encoded JSON), email attachments (MIME encodes binary attachments as Base64 for SMTP transport), data URIs in HTML/CSS (embedding images as src="data:image/png;base64,…"), HTTP Basic Authentication (username:password encoded in Base64 in the Authorization header), and API keys which are often Base64-encoded binary values.',
            },
          ].map(({ q, a }) => (
            <div key={q} className="border border-border rounded-md p-4">
              <p className="text-sm font-semibold text-foreground mb-1">{q}</p>
              <p className="text-sm text-muted-foreground">{a}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
