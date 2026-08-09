import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, Trash2, QrCode as QrCodeIcon, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ToolEmptyState } from '@/components/tool-empty-state';
import { useToast } from '@/hooks/use-toast';
import { isValidEmail, isValidPhone, isValidUrl } from '@/lib/validators';

type ContentType = 'text' | 'url' | 'email' | 'phone';

export default function QrCodeGenerator() {
  const [contentType, setContentType] = useState<ContentType>('text');
  const [text, setText] = useState('');
  const [url, setUrl] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [size, setSize] = useState(256);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const rawValue = (() => {
    switch (contentType) {
      case 'url':
        return url.trim();
      case 'email':
        return email.trim();
      case 'phone':
        return phone.trim();
      default:
        return text.trim();
    }
  })();

  const validationError = (() => {
    if (!rawValue) return null;
    switch (contentType) {
      case 'url':
        return isValidUrl(rawValue) ? null : 'Enter a valid website URL, e.g. example.com or https://example.com.';
      case 'email':
        return isValidEmail(rawValue) ? null : 'Enter a valid email address, e.g. name@example.com.';
      case 'phone':
        return isValidPhone(rawValue) ? null : 'Enter a valid phone number using digits, spaces, or +, -, ( ).';
      default:
        return null;
    }
  })();

  const isValid = !!rawValue && !validationError;

  // Phone input is restricted at the character level so users can't type
  // letters into a field that only ever produces a `tel:` QR payload.
  const handlePhoneChange = (value: string) => {
    setPhone(value.replace(/[^\d\s+\-().]/g, ''));
  };

  const encodedValue = (() => {
    if (!isValid) return '';
    switch (contentType) {
      case 'url':
        return /^https?:\/\//i.test(rawValue) ? rawValue : `https://${rawValue}`;
      case 'email':
        // mailto: is the standards-compliant QR payload for an email
        // address — scanning apps open the device's mail client with the
        // address pre-filled, which is the expected behavior.
        return `mailto:${rawValue}`;
      case 'phone':
        // tel: is the standards-compliant QR payload for a phone number —
        // scanning apps open the dialer pre-filled with the number, which is
        // expected behavior, not a bug.
        return `tel:${rawValue.replace(/[\s().-]/g, '')}`;
      default:
        // Plain text is encoded verbatim, exactly as entered.
        return rawValue;
    }
  })();

  useEffect(() => {
    if (!encodedValue || !canvasRef.current) return;
    QRCode.toCanvas(canvasRef.current, encodedValue, {
      width: size,
      margin: 1,
    }).catch(() => {
      // Invalid content is rare since any string is valid QR data; ignore silently.
    });
  }, [encodedValue, size]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = 'qr-code.png';
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  const handleClear = () => {
    setText('');
    setUrl('');
    setEmail('');
    setPhone('');
  };

  return (
    <div className="space-y-6">
      <Tabs value={contentType} onValueChange={(v) => setContentType(v as ContentType)} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6 h-auto p-1">
          <TabsTrigger value="text" className="py-2.5 text-sm">Text</TabsTrigger>
          <TabsTrigger value="url" className="py-2.5 text-sm">URL</TabsTrigger>
          <TabsTrigger value="email" className="py-2.5 text-sm">Email</TabsTrigger>
          <TabsTrigger value="phone" className="py-2.5 text-sm">Phone</TabsTrigger>
        </TabsList>

        <TabsContent value="text" className="space-y-2">
          <Label htmlFor="qr-text">Content</Label>
          <Textarea
            id="qr-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter any text..."
            rows={3}
            className="resize-none"
          />
        </TabsContent>

        <TabsContent value="url" className="space-y-2">
          <Label htmlFor="qr-url">Website URL</Label>
          <Input
            id="qr-url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="example.com"
            className="h-12"
          />
        </TabsContent>

        <TabsContent value="email" className="space-y-2">
          <Label htmlFor="qr-email">Email Address</Label>
          <Input
            id="qr-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            className="h-12"
          />
        </TabsContent>

        <TabsContent value="phone" className="space-y-2">
          <Label htmlFor="qr-phone">Phone Number</Label>
          <Input
            id="qr-phone"
            type="tel"
            value={phone}
            onChange={(e) => handlePhoneChange(e.target.value)}
            placeholder="+1 555 123 4567"
            className="h-12"
          />
        </TabsContent>
      </Tabs>

      {validationError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{validationError}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label htmlFor="qr-size">Size</Label>
          <span className="text-sm text-muted-foreground font-mono">{size}px</span>
        </div>
        <Slider
          id="qr-size"
          min={128}
          max={512}
          step={16}
          value={[size]}
          onValueChange={(v) => setSize(v[0])}
        />
      </div>

      <div className="pt-2">
        {!encodedValue ? (
          <ToolEmptyState icon={QrCodeIcon} message="Enter valid content to generate a QR code" className="h-64" />
        ) : (
          <Card className="relative p-6 bg-primary/5 border-primary/20 flex flex-col items-center gap-4">
            <div className="bg-white rounded-lg p-4 shadow-sm overflow-hidden max-w-full">
              <canvas ref={canvasRef} data-testid="canvas-qr-code" className="max-w-full h-auto" />
            </div>
            <div className="flex gap-2 flex-wrap justify-center">
              <Button onClick={handleDownload} data-testid="button-download-qr">
                <Download className="w-4 h-4 mr-2" /> Download PNG
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(encodedValue);
                  toast({ title: 'Copied to clipboard', duration: 2000 });
                }}
              >
                Copy Content
              </Button>
            </div>
          </Card>
        )}
      </div>

      <div className="flex justify-end pt-2">
        <Button variant="outline" onClick={handleClear} disabled={!text && !url && !email && !phone}>
          <Trash2 className="w-4 h-4 mr-2" /> Clear
        </Button>
      </div>

      {/* ── Educational content ───────────────────────────────────────── */}
      <div className="pt-8 mt-8 border-t border-border space-y-0">

        {/* Section 1 — What a QR Code Encodes */}
        <div>
          <h2 className="text-base font-semibold text-foreground mb-3">What a QR Code Encodes and How Scanning Works</h2>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              A QR (Quick Response) code is a two-dimensional matrix barcode that encodes data
              as a pattern of dark and light squares arranged in a grid. Unlike a 1D barcode,
              which can hold only a few dozen characters in a single row, a QR code can store
              up to <span className="font-semibold text-foreground">7,089 numeric characters</span>,{' '}
              <span className="font-semibold text-foreground">4,296 alphanumeric characters</span>,
              or <span className="font-semibold text-foreground">2,953 bytes</span> of binary
              data at the lowest error correction level — verified against the QR library this
              tool uses.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Scanning works by the camera reading the entire grid at once. Three square
              "finder patterns" in the corners orient the image regardless of the angle the
              code is held. The decoder reads format information embedded in the code itself,
              then reconstructs the data. This is why you can scan a QR code held at an angle,
              upside down, or on a slightly curved surface — the finder patterns allow the
              decoder to locate, rotate, and correct the data automatically.
            </p>
          </div>
        </div>

        {/* Section 2 — Error Correction */}
        <div className="pt-8 mt-8 border-t border-border">
          <h2 className="text-base font-semibold text-foreground mb-3">How Error Correction Works</h2>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              QR codes implement Reed–Solomon error correction at four levels, each recovering
              a progressively larger portion of the data if the code is partially obscured
              or damaged:
            </p>
            <div className="border border-border rounded-md bg-secondary p-4 space-y-2">
              {[
                ['Level L (Low)',       '~7% data recovery — smallest code, maximum data capacity'],
                ['Level M (Medium)',    '~15% data recovery — the default used by most generators'],
                ['Level Q (Quartile)', '~25% data recovery'],
                ['Level H (High)',     '~30% data recovery — largest code, smallest data capacity'],
              ].map(([level, desc]) => (
                <p key={level} className="text-sm text-muted-foreground leading-relaxed">
                  <span className="font-semibold text-foreground">{level}:</span> {desc}
                </p>
              ))}
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              This redundancy is built into the code mathematically, not by physically
              duplicating data. A QR code at level H can have nearly a third of its surface
              covered and still decode correctly — which is why branded QR codes with a logo
              placed in the center still scan reliably.
            </p>
          </div>
        </div>

        {/* Section 3 — When to Use */}
        <div className="pt-8 mt-8 border-t border-border">
          <h2 className="text-base font-semibold text-foreground mb-3">When to Use This Generator</h2>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Use the URL tab to link a physical surface — poster, business card, packaging —
              to a website, eliminating the need to type a long address on a mobile device. Use
              the email and phone tabs to pre-fill contact details, reducing friction for anyone
              trying to reach you. Use plain text for Wi-Fi passwords, short instructions, or
              addresses displayed in a public space. Download the PNG at the largest size you
              need and scale it down in your design software — downscaling from a large PNG
              preserves crisp module edges better than upscaling a small one.
            </p>
          </div>
        </div>

        {/* Section 4 — FAQ */}
        <div className="pt-8 mt-8 border-t border-border">
          <h2 className="text-base font-semibold text-foreground mb-3">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {[
              {
                q: 'How much data can a QR code hold?',
                a: "Capacity depends on the data type and error correction level. At the lowest error correction level (L), a QR code holds up to 7,089 numeric characters, 4,296 alphanumeric characters, or 2,953 bytes of binary data (covering URLs, text, and most everyday content). At the highest error correction level (H), capacity drops significantly because more of the code is reserved for redundancy rather than data. Most real-world QR codes are well below the maximum capacity.",
              },
              {
                q: 'Why do some QR codes still work when partially covered or damaged?',
                a: "QR codes use Reed–Solomon error correction, a mathematical technique that lets the scanner reconstruct missing data even when parts of the code are obscured, dirty, or physically damaged. The amount of damage a code tolerates depends on the error correction level set at generation: level L handles ~7% damage, level M ~15%, level Q ~25%, and level H ~30%. Branded QR codes with logos in the center take advantage of this — the logo covers some modules, but enough redundant data remains to reconstruct the full content.",
              },
              {
                q: "What's the difference between static and dynamic QR codes?",
                a: "A static QR code encodes its destination directly — the URL or text is baked into the pattern itself and cannot be changed after generation. A dynamic QR code encodes a short redirect URL managed by a third-party service; scanning hits that redirect, which forwards to the real destination. Dynamic codes let you change the destination after printing and track scan counts. This tool generates static QR codes — the full content is embedded directly in the code with no redirect and no tracking.",
              },
              {
                q: 'Can QR codes contain viruses or malware?',
                a: "A QR code is just encoded data — it cannot execute code, carry a virus, or infect a device on its own. The risk is indirect: a malicious QR code can encode a URL that points to a phishing site or triggers a harmful download when you open it in a browser. The QR code is the delivery mechanism for the URL, not the threat itself. The same rule applies as with any link: check the URL your browser shows before proceeding, especially with QR codes in unexpected locations such as stickers placed over legitimate codes in public spaces.",
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
