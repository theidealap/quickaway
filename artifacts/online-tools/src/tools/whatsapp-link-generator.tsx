import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageCircle, Copy, ExternalLink } from 'lucide-react';
import { ToolEmptyState } from '@/components/tool-empty-state';
import { ToolResultBadge } from '@/components/tool-result-badge';
import { useToast } from '@/hooks/use-toast';

const COUNTRY_CODES = [
  { code: '+1', label: 'United States / Canada (+1)' },
  { code: '+44', label: 'United Kingdom (+44)' },
  { code: '+91', label: 'India (+91)' },
  { code: '+61', label: 'Australia (+61)' },
  { code: '+49', label: 'Germany (+49)' },
  { code: '+33', label: 'France (+33)' },
  { code: '+34', label: 'Spain (+34)' },
  { code: '+39', label: 'Italy (+39)' },
  { code: '+55', label: 'Brazil (+55)' },
  { code: '+52', label: 'Mexico (+52)' },
  { code: '+27', label: 'South Africa (+27)' },
  { code: '+234', label: 'Nigeria (+234)' },
  { code: '+254', label: 'Kenya (+254)' },
  { code: '+92', label: 'Pakistan (+92)' },
  { code: '+880', label: 'Bangladesh (+880)' },
  { code: '+62', label: 'Indonesia (+62)' },
  { code: '+63', label: 'Philippines (+63)' },
  { code: '+81', label: 'Japan (+81)' },
  { code: '+82', label: 'South Korea (+82)' },
  { code: '+86', label: 'China (+86)' },
];

export default function WhatsAppLinkGenerator() {
  const [countryCode, setCountryCode] = useState('+1');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const digits = phone.replace(/\D/g, '');
  const fullNumber = digits ? `${countryCode.replace('+', '')}${digits}` : '';
  const link = fullNumber
    ? `https://wa.me/${fullNumber}${message.trim() ? `?text=${encodeURIComponent(message.trim())}` : ''}`
    : '';

  useEffect(() => {
    if (!link || !canvasRef.current) return;
    QRCode.toCanvas(canvasRef.current, link, { width: 180, margin: 1 }).catch(() => {});
  }, [link]);

  const handleCopy = () => {
    if (!link) return;
    navigator.clipboard.writeText(link);
    toast({ title: 'Link copied to clipboard', duration: 2000 });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-4">
        <div className="space-y-2">
          <Label htmlFor="country-code">Country Code</Label>
          <Select value={countryCode} onValueChange={setCountryCode}>
            <SelectTrigger id="country-code" className="h-12">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {COUNTRY_CODES.map((c) => (
                <SelectItem key={c.code} value={c.code}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            inputMode="numeric"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="5551234567"
            className="h-12 font-mono"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Welcome Message (optional)</Label>
        <Textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Hi! I'd like to know more about..."
          rows={3}
          className="resize-none"
        />
      </div>

      <div className="pt-2">
        {!link ? (
          <ToolEmptyState icon={MessageCircle} message="Enter a phone number to generate a WhatsApp link" className="h-56" />
        ) : (
          <Card className="relative p-6 bg-primary/5 border-primary/20 flex flex-col items-center gap-4">
            <ToolResultBadge />
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <canvas ref={canvasRef} data-testid="canvas-whatsapp-qr" />
            </div>
            <div className="w-full max-w-md text-center text-sm font-mono text-muted-foreground break-all bg-background border rounded-lg px-3 py-2">
              {link}
            </div>
            <div className="flex gap-2 flex-wrap justify-center">
              <Button onClick={handleCopy} data-testid="button-copy-link">
                <Copy className="w-4 h-4 mr-2" /> Copy Link
              </Button>
              <Button variant="outline" asChild>
                <a href={link} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" /> Open in WhatsApp
                </a>
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
