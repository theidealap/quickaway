import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Hash, Copy, Check, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ToolEmptyState } from '@/components/tool-empty-state';
import { ToolResultBadge } from '@/components/tool-result-badge';

// ── MD5 implementation (inline, no external network call) ─────────────────────
//
// Standard MD5 algorithm per RFC 1321.
// Uses only arithmetic on 32-bit integers — no external dependencies.
//

function md5(str: string): string {
  // Per-round shift amounts
  const S = [
    7,12,17,22, 7,12,17,22, 7,12,17,22, 7,12,17,22,
    5, 9,14,20, 5, 9,14,20, 5, 9,14,20, 5, 9,14,20,
    4,11,16,23, 4,11,16,23, 4,11,16,23, 4,11,16,23,
    6,10,15,21, 6,10,15,21, 6,10,15,21, 6,10,15,21,
  ];

  // Precomputed K[i] = floor(abs(sin(i+1)) × 2^32)
  const K = Array.from({ length: 64 }, (_, i) =>
    Math.floor(Math.abs(Math.sin(i + 1)) * 0x100000000) >>> 0
  );

  // Encode input as UTF-8 bytes
  const msgBytes = Array.from(new TextEncoder().encode(str));
  const origBitLen = msgBytes.length * 8;

  // Step 1: Pad to 448 mod 512 bits
  msgBytes.push(0x80);
  while (msgBytes.length % 64 !== 56) msgBytes.push(0x00);

  // Step 2: Append original length as 64-bit little-endian
  for (let i = 0; i < 8; i++) {
    msgBytes.push((origBitLen / Math.pow(2, 8 * i)) & 0xff);
  }

  // Initial hash values
  let a0 = 0x67452301, b0 = 0xefcdab89, c0 = 0x98badcfe, d0 = 0x10325476;

  // Process each 512-bit (64-byte) block
  for (let off = 0; off < msgBytes.length; off += 64) {
    // Parse 16 little-endian 32-bit words
    const M = Array.from({ length: 16 }, (_, j) =>
      (msgBytes[off + j * 4] |
       (msgBytes[off + j * 4 + 1] << 8) |
       (msgBytes[off + j * 4 + 2] << 16) |
       (msgBytes[off + j * 4 + 3] << 24)) >>> 0
    );

    let A = a0, B = b0, C = c0, D = d0;

    for (let i = 0; i < 64; i++) {
      let F: number, g: number;
      if      (i < 16) { F = ((B & C) | (~B & D)) >>> 0; g = i;               }
      else if (i < 32) { F = ((D & B) | (~D & C)) >>> 0; g = (5 * i + 1) % 16; }
      else if (i < 48) { F = (B ^ C ^ D) >>> 0;          g = (3 * i + 5) % 16; }
      else             { F = (C ^ (B | ~D)) >>> 0;        g = (7 * i) % 16;     }

      const temp = (F + A + K[i] + M[g]) >>> 0;
      const rotated = ((temp << S[i]) | (temp >>> (32 - S[i]))) >>> 0;
      A = D; D = C; C = B;
      B = (B + rotated) >>> 0;
    }

    a0 = (a0 + A) >>> 0;
    b0 = (b0 + B) >>> 0;
    c0 = (c0 + C) >>> 0;
    d0 = (d0 + D) >>> 0;
  }

  // Output as little-endian hex
  return [a0, b0, c0, d0].map(n => {
    const bytes = [n & 0xff, (n >> 8) & 0xff, (n >> 16) & 0xff, (n >> 24) & 0xff];
    return bytes.map(b => b.toString(16).padStart(2, '0')).join('');
  }).join('');
}

// ── SHA via Web Crypto ────────────────────────────────────────────────────────

async function sha(algorithm: 'SHA-1' | 'SHA-256', input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const buf  = await crypto.subtle.digest(algorithm, data);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface Hashes {
  md5:    string;
  sha1:   string;
  sha256: string;
}

// ── Copy row ──────────────────────────────────────────────────────────────────

function HashRow({
  algorithm,
  value,
}: {
  algorithm: string;
  value: string;
}) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          {algorithm}
        </span>
        <button
          type="button"
          onClick={copy}
          className="flex items-center gap-1 text-xs text-primary hover:underline shrink-0"
          aria-label={`Copy ${algorithm} hash`}
        >
          {copied
            ? <><Check className="h-3 w-3" /> Copied</>
            : <><Copy className="h-3 w-3" /> Copy</>
          }
        </button>
      </div>
      <div
        className="font-mono text-xs md:text-sm break-all bg-muted/50 rounded-md px-3 py-2.5 select-all cursor-pointer hover:bg-muted/70 transition-colors"
        onClick={copy}
        title="Click to copy"
        role="button"
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && copy()}
      >
        {value}
      </div>
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function HashGenerator() {
  const [input,   setInput]   = useState('');
  const [hashes,  setHashes]  = useState<Hashes | null>(null);
  const [error,   setError]   = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [allCopied, setAllCopied] = useState(false);

  useEffect(() => {
    if (input === '') {           // explicit === '' guard — never falsy
      setHashes(null);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    let cancelled = false;

    (async () => {
      try {
        const [sha1, sha256] = await Promise.all([
          sha('SHA-1',   input),
          sha('SHA-256', input),
        ]);
        if (!cancelled) {
          setHashes({ md5: md5(input), sha1, sha256 });
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError('Failed to compute hashes. Your browser may not support the Web Crypto API.');
          setLoading(false);
        }
      }
    })();

    return () => { cancelled = true; };
  }, [input]);

  const copyAll = useCallback(() => {
    if (!hashes) return;
    const text = [
      `MD5:    ${hashes.md5}`,
      `SHA-1:  ${hashes.sha1}`,
      `SHA-256: ${hashes.sha256}`,
    ].join('\n');
    navigator.clipboard.writeText(text);
    setAllCopied(true);
    setTimeout(() => setAllCopied(false), 1800);
  }, [hashes]);

  const isEmpty = input === '';

  return (
    <div className="space-y-6">

      {/* ── Input ────────────────────────────────────────────────────────── */}
      <div className="space-y-2">
        <Label htmlFor="hash-input">Input Text</Label>
        <textarea
          id="hash-input"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type or paste any text here…"
          rows={5}
          className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-y font-mono"
          spellCheck={false}
          aria-label="Text to hash"
        />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{input.length.toLocaleString()} character{input.length !== 1 ? 's' : ''}</span>
          {!isEmpty && (
            <button
              type="button"
              onClick={() => setInput('')}
              className="hover:text-foreground transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* ── Results ──────────────────────────────────────────────────────── */}
      <div className="pt-1">
        {error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : isEmpty ? (
          <ToolEmptyState
            icon={Hash}
            message="Enter any text above to instantly generate its MD5, SHA-1, and SHA-256 hashes"
            className="h-48"
          />
        ) : loading ? (
          <Card className="p-6 text-center text-sm text-muted-foreground">
            Computing hashes…
          </Card>
        ) : hashes ? (
          <Card className="p-5 space-y-4">
            {/* Badge in its own row — inline so it never overlaps the MD5 copy link */}
            <div className="flex justify-end">
              <ToolResultBadge label="Generated" inline />
            </div>

            <HashRow algorithm="MD5"     value={hashes.md5}    />
            <div className="border-t border-border/50" />
            <HashRow algorithm="SHA-1"   value={hashes.sha1}   />
            <div className="border-t border-border/50" />
            <HashRow algorithm="SHA-256" value={hashes.sha256} />

            <div className="pt-1 flex justify-between items-center">
              <p className="text-xs text-muted-foreground">
                Computed entirely in your browser — nothing is sent to any server.
              </p>
              <Button variant="outline" size="sm" onClick={copyAll} className="gap-1.5 shrink-0">
                {allCopied
                  ? <><Check className="h-3.5 w-3.5" /> Copied all</>
                  : <><Copy className="h-3.5 w-3.5" /> Copy all</>
                }
              </Button>
            </div>
          </Card>
        ) : null}
      </div>

      {/* ── Info note ────────────────────────────────────────────────────── */}
      {!isEmpty && !error && (
        <p className="text-xs text-muted-foreground">
          <strong>SHA-256</strong> and <strong>SHA-1</strong> use the browser's built-in
          Web Crypto API.{' '}
          <strong>MD5</strong> uses an inline implementation (RFC 1321) — no external
          library is loaded. Click any hash or its Copy button to copy to clipboard.
        </p>
      )}

      {/* ── Educational content ───────────────────────────────────────── */}
      <div className="pt-8 mt-8 border-t border-border space-y-0">

        {/* Section 1 — What a Hash Function Does */}
        <div>
          <h2 className="text-base font-semibold text-foreground mb-3">What a Hash Function Does</h2>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              A hash function takes any input — a single word, an entire file, a database
              backup — and produces a fixed-length string of characters called a digest. No matter
              how long or short the input is, the output length never changes for a given
              algorithm. MD5 always produces 32 hexadecimal characters (128 bits). SHA-1 always
              produces 40 characters (160 bits). SHA-256 always produces 64 characters (256 bits).
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Three properties define a cryptographic hash. First, it is <span className="font-medium text-foreground">deterministic</span>:
              the same input always yields the same output — type "hello" and MD5 returns{' '}
              <span className="font-mono text-xs">5d41402abc4b2a76b9719d911017c592</span> every
              time. Second, it is <span className="font-medium text-foreground">one-way</span>: the
              digest cannot be reversed to recover the original input. Third, it has the{' '}
              <span className="font-medium text-foreground">avalanche effect</span>: changing a
              single character in the input produces a completely different digest, not a slightly
              different one.
            </p>
          </div>
        </div>

        {/* Section 2 — How Hashes Are Computed */}
        <div className="pt-8 mt-8 border-t border-border">
          <h2 className="text-base font-semibold text-foreground mb-3">How Hashes Are Computed</h2>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              The algorithm processes the input in fixed-size blocks, mixing bits through a series
              of bitwise operations (AND, OR, XOR, rotations) using predefined constants and an
              internal state variable. Each block's output feeds into the next, so the final
              digest reflects the entire input — not just the last block.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The practical implication: even a single-character input produces a digest of full
              length. The word "hi" and a 10 MB document both produce a 64-character SHA-256
              output, and the two digests share no recognizable similarity. This is intentional —
              making digests predictable based on input length would leak information about the original.
            </p>
          </div>
        </div>

        {/* Section 3 — When to Use */}
        <div className="pt-8 mt-8 border-t border-border">
          <h2 className="text-base font-semibold text-foreground mb-3">When to Use a Hash Generator</h2>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              The most common use is file integrity verification. Software providers publish the
              SHA-256 hash of their installer alongside a download; run the file through a hash
              generator and compare the output to confirm the file arrived intact and unaltered
              in transit.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              In development, hashes power cache keys, content-addressable storage (Git uses SHA
              hashes to identify every file and commit), and deduplication systems that detect
              identical files without reading their full contents. Password databases hash
              credentials before storage — when you log in, your entered password is hashed and
              compared to the stored digest, so the original password is never saved in plaintext.
            </p>
          </div>
        </div>

        {/* Section 4 — FAQ */}
        <div className="pt-8 mt-8 border-t border-border">
          <h2 className="text-base font-semibold text-foreground mb-3">
            Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            {[
              {
                q: 'What is a hash used for in practice?',
                a: 'The most common everyday use is file integrity checking — software providers publish the SHA-256 hash of their installer so you can verify your download was not corrupted or tampered with. In development, hashes power cache invalidation, content-addressable storage (Git uses SHA hashes to identify every commit and file), and deduplication systems that identify identical files without reading their full contents.',
              },
              {
                q: 'Is MD5 still secure?',
                a: 'MD5 is no longer considered secure for any application where collision resistance matters. Researchers demonstrated practical MD5 collisions in 2004, meaning two different inputs can produce the same digest — which breaks any system relying on hash uniqueness for security. For security-sensitive uses such as digital signatures or password storage, use SHA-256 or stronger. MD5 remains widely used for non-security checksums where collision resistance is not a concern.',
              },
              {
                q: 'Can a hash be reversed to recover the original input?',
                a: 'No — hash functions are designed to be irreversible. There is no algorithm that converts a digest back to its original input because the function deliberately discards information during calculation. What attackers do instead is search for matching inputs: precomputed tables contain millions of common strings and their hashes. Password systems counter this by adding a random value called a salt to each input before hashing, making those tables useless.',
              },
              {
                q: 'Why does the same input always produce the same hash?',
                a: 'Hash functions are deterministic by design — the output depends entirely on the input, with no randomness involved. Every step of the algorithm uses the same operations and constants every time. This predictability is a feature: it is what makes hashes useful for comparison. Two parties can each hash the same file independently and confirm they have identical copies just by comparing the short digests, without ever transferring the files themselves.',
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
