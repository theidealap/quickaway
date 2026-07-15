import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, Trash2, QrCode as QrCodeIcon } from 'lucide-react';
import { ToolEmptyState } from '@/components/tool-empty-state';
import { ToolResultBadge } from '@/components/tool-result-badge';
import { useToast } from '@/hooks/use-toast';

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

  const encodedValue = (() => {
    if (!rawValue) return '';
    switch (contentType) {
      case 'url':
        return /^https?:\/\//i.test(rawValue) ? rawValue : `https://${rawValue}`;
      case 'email':
        return `mailto:${rawValue}`;
      case 'phone':
        return `tel:${rawValue}`;
      default:
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
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+1 555 123 4567"
            className="h-12"
          />
        </TabsContent>
      </Tabs>

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
          <ToolEmptyState icon={QrCodeIcon} message="Enter content to generate a QR code" className="h-64" />
        ) : (
          <Card className="relative p-6 bg-primary/5 border-primary/20 flex flex-col items-center gap-4">
            <ToolResultBadge />
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <canvas ref={canvasRef} data-testid="canvas-qr-code" />
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
