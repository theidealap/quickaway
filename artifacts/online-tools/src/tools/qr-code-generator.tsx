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
    </div>
  );
}
