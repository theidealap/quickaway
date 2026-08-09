import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, Copy, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ToolEmptyState } from '@/components/tool-empty-state';
import { useToast } from '@/hooks/use-toast';
import { isValidEmail, isValidPhone, isValidUrl } from '@/lib/validators';

interface SignatureFields {
  name: string;
  title: string;
  company: string;
  email: string;
  phone: string;
  website: string;
  logoUrl: string;
}

type Template = 'compact' | 'professional' | 'modern';

const initialFields: SignatureFields = {
  name: '',
  title: '',
  company: '',
  email: '',
  phone: '',
  website: '',
  logoUrl: '',
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

/**
 * The logo is only ever rendered from a user-supplied URL, which may be
 * broken, slow, or unreachable. Rather than let the <img> fall back to the
 * browser's broken-image icon, every template swaps in an initials avatar
 * on error — both in the live React preview and in the copied HTML (via an
 * inline onerror handler pointing at the same fallback markup).
 */
function logoOrAvatarHtml(logoUrl: string, name: string, company: string, size: number) {
  const alt = escapeHtml(company || name);
  const fallback = `<div style="width:${size}px;height:${size}px;border-radius:50%;background:#2563eb;color:#ffffff;display:flex;align-items:center;justify-content:center;font-family:Arial,Helvetica,sans-serif;font-size:${Math.round(size / 2.4)}px;font-weight:bold;">${escapeHtml(initials(name) || '•')}</div>`;
  if (!logoUrl) return fallback;
  const escapedUrl = escapeHtml(logoUrl);
  const fallbackAttr = fallback.replace(/"/g, '&quot;');
  return `<img src="${escapedUrl}" alt="${alt}" width="${size}" height="${size}" style="width:${size}px;height:${size}px;object-fit:contain;border-radius:50%;" onerror="this.outerHTML='${fallbackAttr}'" />`;
}

function contactLines(fields: SignatureFields, linkColor: string) {
  const lines: string[] = [];
  if (fields.email) {
    lines.push(`<a href="mailto:${escapeHtml(fields.email)}" style="color:${linkColor};text-decoration:none;">${escapeHtml(fields.email)}</a>`);
  }
  if (fields.phone) {
    lines.push(escapeHtml(fields.phone));
  }
  if (fields.website) {
    const href = /^https?:\/\//i.test(fields.website) ? fields.website : `https://${fields.website}`;
    lines.push(`<a href="${escapeHtml(href)}" style="color:${linkColor};text-decoration:none;">${escapeHtml(fields.website)}</a>`);
  }
  return lines;
}

function buildCompactHtml(fields: SignatureFields) {
  const lines = [escapeHtml(fields.name), [fields.title, fields.company].filter(Boolean).map(escapeHtml).join(' · '), ...contactLines(fields, '#2563eb')].filter(Boolean);
  return `<table style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#111827;border-collapse:collapse;">
  <tr><td style="border-left:3px solid #2563eb;padding-left:10px;line-height:1.5;">
    ${lines.join(' &nbsp;|&nbsp; ')}
  </td></tr>
</table>`;
}

function buildProfessionalHtml(fields: SignatureFields) {
  const logo = logoOrAvatarHtml(fields.logoUrl, fields.name, fields.company, 64);
  const rows = [
    fields.title || fields.company ? `<div style="color:#4b5563;">${[fields.title, fields.company].filter(Boolean).map(escapeHtml).join(' at ')}</div>` : '',
    ...contactLines(fields, '#1d4ed8').map((l) => `<div>${l}</div>`),
  ].filter(Boolean);

  return `<table style="font-family:Georgia,'Times New Roman',serif;font-size:14px;color:#111827;border-collapse:collapse;">
  <tr>
    <td style="padding-right:16px;vertical-align:top;">${logo}</td>
    <td style="vertical-align:top;border-left:2px solid #1d4ed8;padding-left:16px;">
      <div style="font-weight:bold;font-size:16px;">${escapeHtml(fields.name)}</div>
      ${rows.join('\n      ')}
    </td>
  </tr>
</table>`;
}

function buildModernHtml(fields: SignatureFields) {
  const logo = logoOrAvatarHtml(fields.logoUrl, fields.name, fields.company, 48);
  const rows = [
    fields.title || fields.company ? `<div style="color:#6b7280;font-size:13px;">${[fields.title, fields.company].filter(Boolean).map(escapeHtml).join(' · ')}</div>` : '',
    ...contactLines(fields, '#0891b2').map((l) => `<div style="font-size:13px;margin-top:2px;">${l}</div>`),
  ].filter(Boolean);

  return `<table style="font-family:'Segoe UI',Helvetica,Arial,sans-serif;border-collapse:collapse;">
  <tr>
    <td style="vertical-align:middle;padding-right:14px;">${logo}</td>
    <td style="vertical-align:middle;">
      <div style="font-weight:600;font-size:15px;color:#111827;">${escapeHtml(fields.name)}</div>
      ${rows.join('\n      ')}
    </td>
  </tr>
</table>`;
}

const TEMPLATE_BUILDERS: Record<Template, (fields: SignatureFields) => string> = {
  compact: buildCompactHtml,
  professional: buildProfessionalHtml,
  modern: buildModernHtml,
};

const TEMPLATE_LABELS: Record<Template, string> = {
  compact: 'Compact',
  professional: 'Professional',
  modern: 'Modern',
};

export default function EmailSignatureGenerator() {
  const [fields, setFields] = useState<SignatureFields>(initialFields);
  const [template, setTemplate] = useState<Template>('professional');
  const { toast } = useToast();

  const updateField = (field: keyof SignatureFields) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFields((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const hasContent = fields.name.trim().length > 0;

  const errors = {
    email: fields.email && !isValidEmail(fields.email) ? 'Enter a valid email address.' : null,
    phone: fields.phone && !isValidPhone(fields.phone) ? 'Enter a valid phone number.' : null,
    website: fields.website && !isValidUrl(fields.website) ? 'Enter a valid website URL.' : null,
    logoUrl: fields.logoUrl && !isValidUrl(fields.logoUrl) ? 'Enter a valid image URL.' : null,
  };
  const hasErrors = Object.values(errors).some(Boolean);

  const signatureHtml = useMemo(
    () => (hasContent ? TEMPLATE_BUILDERS[template](fields) : ''),
    [fields, hasContent, template],
  );

  const handleCopyHtml = () => {
    if (!signatureHtml) return;
    navigator.clipboard.writeText(signatureHtml);
    toast({ title: 'Signature HTML copied to clipboard', duration: 2000 });
  };

  const handleReset = () => setFields(initialFields);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="sig-name">Name</Label>
          <Input id="sig-name" value={fields.name} onChange={updateField('name')} placeholder="Jane Doe" className="h-12" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sig-title">Job Title</Label>
          <Input id="sig-title" value={fields.title} onChange={updateField('title')} placeholder="Product Designer" className="h-12" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sig-company">Company</Label>
          <Input id="sig-company" value={fields.company} onChange={updateField('company')} placeholder="Acme Inc." className="h-12" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sig-email">Email</Label>
          <Input id="sig-email" type="email" value={fields.email} onChange={updateField('email')} placeholder="jane@acme.com" className="h-12" aria-invalid={!!errors.email} />
          {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="sig-phone">Phone</Label>
          <Input id="sig-phone" type="tel" value={fields.phone} onChange={updateField('phone')} placeholder="+1 555 123 4567" className="h-12" aria-invalid={!!errors.phone} />
          {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="sig-website">Website</Label>
          <Input id="sig-website" value={fields.website} onChange={updateField('website')} placeholder="acme.com" className="h-12" aria-invalid={!!errors.website} />
          {errors.website && <p className="text-xs text-destructive">{errors.website}</p>}
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="sig-logo">Logo URL (optional)</Label>
          <Input id="sig-logo" value={fields.logoUrl} onChange={updateField('logoUrl')} placeholder="https://acme.com/logo.png" className="h-12" aria-invalid={!!errors.logoUrl} />
          {errors.logoUrl && <p className="text-xs text-destructive">{errors.logoUrl}</p>}

        </div>
      </div>

      <div className="space-y-2">
        <Label>Template</Label>
        <Tabs value={template} onValueChange={(v) => setTemplate(v as Template)}>
          <TabsList className="grid grid-cols-3 w-full max-w-md h-auto p-1">
            {(Object.keys(TEMPLATE_LABELS) as Template[]).map((key) => (
              <TabsTrigger key={key} value={key} className="py-2.5">{TEMPLATE_LABELS[key]}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {hasErrors && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Fix the highlighted fields above before copying your signature.</AlertDescription>
        </Alert>
      )}

      <div className="pt-2 space-y-3">
        <Label>Live Preview</Label>
        {!hasContent ? (
          <ToolEmptyState icon={Mail} message="Enter your name to preview your signature" className="h-40" />
        ) : (
          <Card className="p-6 bg-card overflow-x-auto">
            <div dangerouslySetInnerHTML={{ __html: signatureHtml }} />
          </Card>
        )}
      </div>

      <div className="flex justify-between items-center pt-2 flex-wrap gap-4">
        <Button variant="outline" onClick={handleReset} disabled={!hasContent}>
          Reset
        </Button>
        <Button onClick={handleCopyHtml} disabled={!hasContent || hasErrors}>
          <Copy className="w-4 h-4 mr-2" /> Copy HTML Signature
        </Button>
      </div>

      {/* ── Educational content ───────────────────────────────────────── */}
      <div className="pt-8 mt-8 border-t border-border space-y-0">

        {/* Section 1 */}
        <div>
          <h2 className="text-base font-semibold text-foreground mb-3">How HTML Email Signatures Work</h2>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Email signatures are HTML snippets that email clients append to outgoing messages.
              Unlike standard web pages, they cannot rely on external CSS files,{' '}
              <span className="font-mono text-xs">&lt;style&gt;</span> blocks in{' '}
              <span className="font-mono text-xs">&lt;head&gt;</span>, or web fonts — because most
              email clients strip or ignore those entirely. Gmail removes all{' '}
              <span className="font-mono text-xs">&lt;style&gt;</span> content from received HTML.
              Outlook on Windows renders HTML using Microsoft Word's layout engine rather than a
              browser, producing significant differences in how CSS is interpreted.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The solution is table-based layouts with inline styles — CSS written directly on
              each element as a <span className="font-mono text-xs">style="…"</span> attribute.
              This generator produces exactly that: every template outputs a{' '}
              <span className="font-mono text-xs">&lt;table&gt;</span> with all styles inlined,
              using only web-safe fonts (Arial, Helvetica, Georgia, Segoe UI) that are installed
              on virtually all operating systems.
            </p>
          </div>
        </div>

        {/* Section 2 */}
        <div className="pt-8 mt-8 border-t border-border">
          <h2 className="text-base font-semibold text-foreground mb-3">How the HTML Is Structured</h2>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              All three templates produce self-contained HTML with no external dependencies.
              Each uses a <span className="font-mono text-xs">&lt;table&gt;</span> for layout
              because table-based HTML renders consistently in Outlook's Word engine, whereas
              CSS flexbox and grid — standard in web development — are partially or entirely
              unsupported in Outlook 2016 and later Windows versions.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Contact links use <span className="font-mono text-xs">mailto:</span> and{' '}
              <span className="font-mono text-xs">https://</span> hrefs with inline color styles.
              Logo images include an <span className="font-mono text-xs">onerror</span> handler
              that swaps in an initials avatar if the logo URL becomes unreachable. The copied
              HTML pastes directly into Gmail's "Signature" settings, Outlook's signature editor,
              or any client that accepts HTML input.
            </p>
          </div>
        </div>

        {/* Section 3 */}
        <div className="pt-8 mt-8 border-t border-border">
          <h2 className="text-base font-semibold text-foreground mb-3">When to Use This Generator</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Use this tool when setting up or refreshing a professional email signature. The
            Compact template suits transactional or high-volume email contexts where brevity
            matters. Professional is suited to client-facing roles where name prominence and a
            logo are important. Modern works well for creative or technology-focused fields.
            Once copied, the HTML pastes directly into Gmail Settings → Signature, Outlook's
            signature editor, or Apple Mail's Signatures preferences — no external service or
            account required.
          </p>
        </div>

        {/* Section 4 */}
        <div className="pt-8 mt-8 border-t border-border">
          <h2 className="text-base font-semibold text-foreground mb-3">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {[
              {
                q: 'Why does my signature look different in Outlook than in Gmail?',
                a: "The two clients use fundamentally different rendering engines. Gmail uses a browser-based renderer but strips <style> blocks from received messages, so only inline styles survive. Outlook on Windows uses Microsoft Word's HTML engine — not a browser — which has limited CSS support, handles table and image sizing differently, and ignores many standard properties. Table-based layouts with inline styles are the lowest common denominator that works in both.",
              },
              {
                q: "Why shouldn't I use custom or web fonts in an email signature?",
                a: "Web fonts (loaded via @font-face or Google Fonts) require a network request and CSS parsing that most email clients do not support. Gmail, Outlook, and Apple Mail either fall back to a system font or ignore the font declaration entirely. Web-safe fonts — Arial, Helvetica, Georgia, Times New Roman — are pre-installed on Windows, macOS, iOS, and Android, making them the only fonts that render reliably across clients without fallback surprises.",
              },
              {
                q: 'Should I use an image or text for my signature?',
                a: "Text-based signatures are strongly preferable for professional email. Image-based signatures — a single graphic containing all contact info — are often blocked by clients that disable remote images by default, leaving recipients with a blank space. Text with inline styles is always visible, is searchable, allows hyperlinks to work natively, and passes through spam filters more cleanly than image-heavy HTML.",
              },
              {
                q: 'What size should an email signature be?',
                a: "There is no enforced limit, but common guidance from email infrastructure providers suggests keeping signature HTML under approximately 10 KB and avoiding large embedded images. Larger signatures increase message size, slow rendering on mobile, and can trigger spam scoring. The signatures generated here are typically under 2 KB of HTML — lightweight because they use table markup with inline styles rather than embedded images or base64-encoded assets.",
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
