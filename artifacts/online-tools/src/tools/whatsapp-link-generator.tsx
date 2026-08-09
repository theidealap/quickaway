import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { MessageCircle, Copy, ExternalLink, ChevronsUpDown, Check, AlertCircle, Store, Headset, Megaphone, Contact } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ToolEmptyState } from '@/components/tool-empty-state';
import { useToast } from '@/hooks/use-toast';
import { countries, findCountryByIso2, DEFAULT_COUNTRY_ISO2 } from '@/lib/countries';
import { cn } from '@/lib/utils';

const USE_CASES = [
  { icon: Store, label: 'QR codes for storefronts and packaging' },
  { icon: Headset, label: 'Customer support links on your website' },
  { icon: Megaphone, label: 'Marketing campaigns and social bios' },
  { icon: Contact, label: 'Digital business & personal contact cards' },
];

export default function WhatsAppLinkGenerator() {
  const [iso2, setIso2] = useState(DEFAULT_COUNTRY_ISO2);
  const [countryOpen, setCountryOpen] = useState(false);
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const selectedCountry = findCountryByIso2(iso2) ?? countries[0];

  const digits = phone.replace(/\D/g, '').replace(/^0+/, ''); // drop local trunk "0" prefix (e.g. Saudi 05XXXXXXXX -> 5XXXXXXXX)
  const dialDigits = selectedCountry.dialCode.replace(/\D/g, '');
  const fullNumber = digits ? `${dialDigits}${digits}` : '';

  const phoneTooShort = phone.trim().length > 0 && digits.length < 6;

  const link = fullNumber && !phoneTooShort
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
      <p className="text-sm text-muted-foreground bg-muted/40 border border-border/60 rounded-lg p-4">
        Turn any phone number into a one-tap WhatsApp chat link — perfect for business contact buttons, customer
        support pages, QR codes on printed materials, or a quick way to share your number on social media without
        exposing it as plain text.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-4">
        <div className="space-y-2">
          <Label htmlFor="country-code">Country</Label>
          <Popover open={countryOpen} onOpenChange={setCountryOpen}>
            <PopoverTrigger asChild>
              <Button
                id="country-code"
                variant="outline"
                role="combobox"
                aria-expanded={countryOpen}
                className="h-12 w-full justify-between font-normal"
              >
                <span className="flex items-center gap-2 truncate">
                  <span className="text-lg">{selectedCountry.flag}</span>
                  <span className="truncate">{selectedCountry.name}</span>
                  <span className="text-muted-foreground">{selectedCountry.dialCode}</span>
                </span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[320px] p-0">
              <Command>
                <CommandInput placeholder="Search country or code..." />
                <CommandList>
                  <CommandEmpty>No country found.</CommandEmpty>
                  <CommandGroup>
                    {countries.map((c) => (
                      <CommandItem
                        key={c.iso2}
                        value={`${c.name} ${c.dialCode}`}
                        onSelect={() => {
                          setIso2(c.iso2);
                          setCountryOpen(false);
                        }}
                      >
                        <Check className={cn('h-4 w-4', c.iso2 === iso2 ? 'opacity-100' : 'opacity-0')} />
                        <span className="text-lg">{c.flag}</span>
                        <span className="flex-1 truncate">{c.name}</span>
                        <span className="text-muted-foreground text-sm">{c.dialCode}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            inputMode="numeric"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/[^\d\s\-()]/g, ''))}
            placeholder="5X XXX XXXX"
            className="h-12 font-mono"
            aria-invalid={phoneTooShort}
          />
        </div>
      </div>

      {phoneTooShort && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Enter a complete phone number (at least 6 digits, without the country code).</AlertDescription>
        </Alert>
      )}

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
          <Card className="p-6 bg-primary/5 border-primary/20 flex flex-col items-center gap-4">
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <canvas ref={canvasRef} data-testid="canvas-whatsapp-qr" />
            </div>
            <div className="w-full space-y-1">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Generated Link</Label>
              <div className="w-full text-center text-sm font-mono text-muted-foreground break-all bg-background border rounded-lg px-3 py-2">
                {link}
              </div>
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

      <div className="pt-2 space-y-2">
        <Label className="text-sm text-muted-foreground">Common uses</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {USE_CASES.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 rounded-lg px-3 py-2">
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* ── Educational content ───────────────────────────────────────── */}
      <div className="pt-8 mt-8 border-t border-border space-y-0">

        {/* Section 1 */}
        <div>
          <h2 className="text-base font-semibold text-foreground mb-3">How a WhatsApp Click-to-Chat Link Works</h2>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              A WhatsApp click-to-chat link uses the <span className="font-mono text-xs">wa.me</span> URL
              format. When opened in a browser or tapped on mobile, it launches WhatsApp and opens a
              conversation with the specified number — no need for the recipient to have that number saved
              as a contact first. The URL structure is:
            </p>
            <div className="border border-border rounded-md bg-secondary p-4 space-y-2">
              <p className="text-sm text-muted-foreground leading-relaxed font-mono text-xs break-all">
                https://wa.me/{'{'}phone-number{'}'}
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed font-mono text-xs break-all">
                https://wa.me/{'{'}phone-number{'}'}?text={'{'}url-encoded-message{'}'}
              </p>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Example — US number +1 (415) 555-1234 with a pre-filled message "Hello, I have a question"
              produces:{' '}
              <span className="font-mono text-xs break-all">
                https://wa.me/14155551234?text=Hello%2C%20I%20have%20a%20question
              </span>.
              The <span className="font-mono text-xs">+</span> is omitted; the country code is prepended
              directly to the subscriber number.
            </p>
          </div>
        </div>

        {/* Section 2 */}
        <div className="pt-8 mt-8 border-t border-border">
          <h2 className="text-base font-semibold text-foreground mb-3">How the Link Is Built</h2>
          <div className="space-y-3">
            <div className="border border-border rounded-md bg-secondary p-4 space-y-2">
              <p className="text-sm text-muted-foreground leading-relaxed">
                <span className="font-semibold text-foreground">Phone number:</span>{' '}
                dial code digits + local number digits, leading zeros stripped, no spaces or symbols
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                <span className="font-semibold text-foreground">Message:</span>{' '}
                URL percent-encoded via <span className="font-mono text-xs">encodeURIComponent()</span>,
                appended as <span className="font-mono text-xs">?text=…</span>
              </p>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              WhatsApp's documentation specifies the number must be in E.164 format — international
              country code followed by subscriber number, with no <span className="font-mono text-xs">+</span>,
              spaces, or dashes. This tool produces that format automatically. Local trunk prefixes (such
              as a leading 0 in many countries) are stripped because they are not used in international
              dialing. If a message is provided, spaces become <span className="font-mono text-xs">%20</span>,
              commas become <span className="font-mono text-xs">%2C</span>, and so on.
            </p>
          </div>
        </div>

        {/* Section 3 */}
        <div className="pt-8 mt-8 border-t border-border">
          <h2 className="text-base font-semibold text-foreground mb-3">When to Use This Generator</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Click-to-chat links are useful anywhere you want to make it easy to start a WhatsApp
            conversation without requiring the other party to save a number. Common uses include
            website contact buttons, customer support widgets, QR codes on business cards or printed
            packaging, marketing links in social media bios, and digital business cards. The pre-filled
            message option is especially useful for structured enquiries — it prompts the sender with
            context-relevant starting text that they can edit before sending.
          </p>
        </div>

        {/* Section 4 */}
        <div className="pt-8 mt-8 border-t border-border">
          <h2 className="text-base font-semibold text-foreground mb-3">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {[
              {
                q: 'What phone number format does the link require?',
                a: "The number must be in international format — country code followed by the subscriber number, with no plus sign, spaces, dashes, or parentheses. This tool builds the correct format automatically: select the country (which provides the dial code), enter the local number, and the tool combines and cleans them. Local trunk prefixes like a leading 0 are removed because they are not part of the international number.",
              },
              {
                q: 'Does the recipient need to have my number saved to receive the message?',
                a: "No. The wa.me link opens a new WhatsApp conversation with the specified number without requiring either party to have the other saved as a contact. The recipient sees the sender's number (or profile name if they happen to have it saved) and can respond normally. This is one of the primary advantages of the wa.me format over sharing a plain phone number.",
              },
              {
                q: 'Can I pre-fill a message that opens automatically?',
                a: "Yes. Text entered in the Welcome Message field is URL-encoded and appended as a ?text= query parameter. When the link is opened, WhatsApp pre-populates the message compose box with that text — but the sender must still tap Send. The message is not transmitted automatically; it is a starting prompt the sender can edit or delete before sending.",
              },
              {
                q: "What happens if the recipient doesn't have WhatsApp installed?",
                a: "On a device without WhatsApp, opening a wa.me link typically redirects to the WhatsApp download page or the WhatsApp Web interface. On mobile, the user is prompted to install the app. On desktop, wa.me links open WhatsApp Web in the browser if the user has an account linked; otherwise they see a QR code to link a device. The link does not function as a standard call or SMS fallback.",
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
