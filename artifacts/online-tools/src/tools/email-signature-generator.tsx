import { useMemo } from 'react';
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Mail, Copy } from 'lucide-react';
import { ToolEmptyState } from '@/components/tool-empty-state';
import { ToolResultBadge } from '@/components/tool-result-badge';
import { useToast } from '@/hooks/use-toast';

interface SignatureFields {
  name: string;
  title: string;
  company: string;
  email: string;
  phone: string;
  website: string;
  logoUrl: string;
}

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

function buildSignatureHtml(fields: SignatureFields) {
  const { name, title, company, email, phone, website, logoUrl } = fields;
  const rows: string[] = [];

  if (title || company) {
    rows.push(`<div style="color:#555555;">${[escapeHtml(title), escapeHtml(company)].filter(Boolean).join(' at ')}</div>`);
  }
  if (email) {
    rows.push(`<div><a href="mailto:${escapeHtml(email)}" style="color:#2563eb;text-decoration:none;">${escapeHtml(email)}</a></div>`);
  }
  if (phone) {
    rows.push(`<div>${escapeHtml(phone)}</div>`);
  }
  if (website) {
    const href = /^https?:\/\//i.test(website) ? website : `https://${website}`;
    rows.push(`<div><a href="${escapeHtml(href)}" style="color:#2563eb;text-decoration:none;">${escapeHtml(website)}</a></div>`);
  }

  const logoCell = logoUrl
    ? `<td style="padding-right:16px;vertical-align:top;"><img src="${escapeHtml(logoUrl)}" alt="${escapeHtml(company || name)}" style="width:64px;height:64px;object-fit:contain;" /></td>`
    : '';

  return `<table style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#111827;border-collapse:collapse;">
  <tr>
    ${logoCell}
    <td style="vertical-align:top;border-left:${logoUrl ? '2px solid #2563eb;padding-left:16px;' : 'none;'}">
      <div style="font-weight:bold;font-size:16px;">${escapeHtml(name)}</div>
      ${rows.join('\n      ')}
    </td>
  </tr>
</table>`;
}

export default function EmailSignatureGenerator() {
  const [fields, setFields] = useState<SignatureFields>(initialFields);
  const { toast } = useToast();

  const updateField = (field: keyof SignatureFields) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFields((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const hasContent = fields.name.trim().length > 0;

  const signatureHtml = useMemo(() => (hasContent ? buildSignatureHtml(fields) : ''), [fields, hasContent]);

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
          <Input id="sig-email" type="email" value={fields.email} onChange={updateField('email')} placeholder="jane@acme.com" className="h-12" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sig-phone">Phone</Label>
          <Input id="sig-phone" type="tel" value={fields.phone} onChange={updateField('phone')} placeholder="+1 555 123 4567" className="h-12" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sig-website">Website</Label>
          <Input id="sig-website" value={fields.website} onChange={updateField('website')} placeholder="acme.com" className="h-12" />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="sig-logo">Logo URL (optional)</Label>
          <Input id="sig-logo" value={fields.logoUrl} onChange={updateField('logoUrl')} placeholder="https://acme.com/logo.png" className="h-12" />
        </div>
      </div>

      <div className="pt-2 space-y-3">
        <Label>Live Preview</Label>
        {!hasContent ? (
          <ToolEmptyState icon={Mail} message="Enter your name to preview your signature" className="h-40" />
        ) : (
          <Card className="relative p-6 bg-card">
            <ToolResultBadge />
            <div dangerouslySetInnerHTML={{ __html: signatureHtml }} />
          </Card>
        )}
      </div>

      <div className="flex justify-between items-center pt-2 flex-wrap gap-4">
        <Button variant="outline" onClick={handleReset} disabled={!hasContent}>
          Reset
        </Button>
        <Button onClick={handleCopyHtml} disabled={!hasContent}>
          <Copy className="w-4 h-4 mr-2" /> Copy HTML Signature
        </Button>
      </div>
    </div>
  );
}
