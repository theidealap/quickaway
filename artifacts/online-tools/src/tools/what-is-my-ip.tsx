import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Copy, Info, Loader2, Monitor, Globe } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// ── Client-side browser / OS detection ───────────────────────────────────────

function detectBrowser(): string {
  const ua = navigator.userAgent;
  if (/Edg\//.test(ua)) return 'Microsoft Edge';
  if (/OPR\/|Opera/.test(ua)) return 'Opera';
  if (/Firefox\//.test(ua)) return 'Firefox';
  if (/SamsungBrowser\//.test(ua)) return 'Samsung Internet';
  if (/Chrome\//.test(ua)) return 'Chrome';
  if (/Safari\//.test(ua)) return 'Safari';
  return 'Unknown browser';
}

function detectOS(): string {
  const ua = navigator.userAgent;
  if (/iPhone/.test(ua)) return 'iOS (iPhone)';
  if (/iPad/.test(ua)) return 'iOS (iPad)';
  if (/Android/.test(ua)) return 'Android';
  if (/Windows NT/.test(ua)) return 'Windows';
  if (/Mac OS X/.test(ua)) return 'macOS';
  if (/Linux/.test(ua)) return 'Linux';
  if (/CrOS/.test(ua)) return 'Chrome OS';
  return 'Unknown OS';
}

function getScreenInfo(): string {
  const dpr = window.devicePixelRatio ?? 1;
  return `${screen.width} × ${screen.height}${dpr !== 1 ? ` @ ${dpr}×` : ''}`;
}

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <Card className="p-4 space-y-1">
      <div className="flex items-center gap-1.5">
        {icon}
        <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
      </div>
      <p className="text-sm font-semibold text-foreground">{value}</p>
    </Card>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function WhatIsMyIp() {
  const { toast } = useToast();

  const [ipv4, setIpv4] = useState<string | null>(null);
  const [ipv6, setIpv6] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Client-side device info — derived synchronously, no API call
  const [deviceInfo] = useState(() => ({
    browser: detectBrowser(),
    os: detectOS(),
    screen: getScreenInfo(),
  }));

  useEffect(() => {
    // Fetch IPv4 and attempt IPv6 in parallel; IPv6 failure is non-fatal
    Promise.all([
      fetch('https://api.ipify.org?format=json')
        .then((r) => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          return r.json() as Promise<{ ip: string }>;
        }),
      fetch('https://api6.ipify.org?format=json')
        .then((r) => (r.ok ? (r.json() as Promise<{ ip: string }>) : null))
        .catch(() => null),
    ])
      .then(([v4data, v6data]) => {
        setIpv4(v4data.ip);
        if (v6data && v6data.ip && v6data.ip !== v4data.ip) {
          setIpv6(v6data.ip);
        }
        setLoading(false);
      })
      .catch(() => {
        setError(
          'Could not retrieve your IP address. Please check your internet connection and refresh the page. If you are using a strict VPN or firewall, it may be blocking the request.'
        );
        setLoading(false);
      });
  }, []);

  const copyIP = (ip: string, label: string) => {
    navigator.clipboard.writeText(ip);
    toast({ title: `${label} copied`, duration: 2000 });
  };

  return (
    <>
      {/* ── API notice ─────────────────────────────────────────────────────── */}
      <div className="flex items-start gap-2 rounded-md border border-border bg-muted/40 p-3 text-xs text-muted-foreground mb-4">
        <Info className="w-3.5 h-3.5 mt-0.5 shrink-0 text-primary" />
        <span>
          <strong>Live data:</strong> Unlike most QuickAway tools that run entirely in your browser,
          this tool makes a request to{' '}
          <a href="https://www.ipify.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">ipify.org</a>{' '}
          to detect your public IP address. Your IP is inherently visible to any server you contact — QuickAway does not store it.
        </span>
      </div>

      {/* ── Loading state ──────────────────────────────────────────────────── */}
      {loading && (
        <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Detecting your IP address…</span>
        </div>
      )}

      {/* ── Error state ─────────────────────────────────────────────────────── */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* ── Result area ─────────────────────────────────────────────────────── */}
      {!loading && !error && ipv4 !== null && (
        <div className="space-y-3">
          {/* Hero card — IPv4 */}
          <Card className="p-6 bg-primary/5 border-primary/20">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1 min-w-0">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Your Public IP Address (IPv4)
                </p>
                <p className="text-3xl font-bold font-mono text-foreground tracking-tight break-all leading-tight">
                  {ipv4}
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyIP(ipv4, 'IPv4 address')}
                className="shrink-0 mt-1"
              >
                <Copy className="w-3.5 h-3.5 mr-1.5" /> Copy
              </Button>
            </div>
          </Card>

          {/* IPv6 card — only shown if detected and different from IPv4 */}
          {ipv6 !== null && (
            <Card className="p-4 border-border">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">IPv6 Address</p>
                  <p className="text-base font-semibold font-mono text-foreground break-all">{ipv6}</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyIP(ipv6, 'IPv6 address')}
                  className="shrink-0"
                >
                  <Copy className="w-3.5 h-3.5 mr-1.5" /> Copy
                </Button>
              </div>
            </Card>
          )}

          {/* Secondary stat cards — client-side device info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <StatCard
              label="Browser"
              value={deviceInfo.browser}
              icon={<Globe className="w-3.5 h-3.5 text-muted-foreground" />}
            />
            <StatCard
              label="Operating System"
              value={deviceInfo.os}
              icon={<Monitor className="w-3.5 h-3.5 text-muted-foreground" />}
            />
            <StatCard
              label="Screen Resolution"
              value={deviceInfo.screen}
              icon={<Monitor className="w-3.5 h-3.5 text-muted-foreground" />}
            />
          </div>

          <p className="text-xs text-muted-foreground">
            Browser, OS, and screen resolution are detected locally in your browser — no additional request is made.
          </p>
        </div>
      )}

      {/* ── Educational content ───────────────────────────────────────────── */}

      <div className="pt-8 mt-8 border-t border-border">
        <h2 className="text-base font-semibold text-foreground mb-3">What Your Public IP Address Is</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Every device connected to the internet has two types of IP addresses. Your <strong>private IP address</strong> (also called a local or LAN address) is assigned by your router and is only meaningful within your home or office network — typical ranges are <code className="font-mono text-xs">192.168.x.x</code>, <code className="font-mono text-xs">10.x.x.x</code>, and <code className="font-mono text-xs">172.16.x.x – 172.31.x.x</code>. Multiple devices on the same network (your phone, laptop, smart TV) each have a different private IP. Your <strong>public IP address</strong> is the address that the rest of the internet sees. It is assigned by your Internet Service Provider (ISP) and is shared by all devices on your network through a process called Network Address Translation (NAT). This is why this tool shows one IP address even if ten devices are on your Wi-Fi — they all exit to the internet from the same public address.
        </p>
      </div>

      <div className="pt-8 mt-8 border-t border-border">
        <h2 className="text-base font-semibold text-foreground mb-3">How This Tool Gets Your IP</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          When you load this page, your browser makes an HTTP request to{' '}
          <a href="https://www.ipify.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">ipify.org</a>,
          a free public API service. ipify's server receives that request and can see the IP address it came from — the same way any website you visit can see your IP address. ipify then returns that IP address to your browser as JSON. This is not something QuickAway can detect or intercept internally; it requires an outbound request from your device. QuickAway does not receive, store, or log your IP address as part of this process. The same approach is used to optionally detect your IPv6 address via a separate request to <code className="font-mono text-xs">api6.ipify.org</code>, which only responds if your network supports IPv6.
        </p>
      </div>

      <div className="pt-8 mt-8 border-t border-border">
        <h2 className="text-base font-semibold text-foreground mb-3">When You'd Need to Know Your IP</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Knowing your public IP address is useful in several practical situations. <strong>Troubleshooting network issues:</strong> your ISP's support team may ask for your public IP when diagnosing connectivity problems. <strong>Setting up remote access:</strong> if you are configuring remote desktop, SSH, or a home server, you need your public IP so others can connect to you (noting that dynamic IPs may change — see FAQ). <strong>Port forwarding:</strong> when opening a port on your router for gaming, self-hosting, or P2P applications, your public IP is the address others will use to reach you. <strong>Checking if a VPN is working:</strong> if this tool shows your ISP-assigned address when you expect your VPN's IP, your VPN is not routing traffic correctly.
        </p>
      </div>

      <div className="pt-8 mt-8 border-t border-border">
        <h2 className="text-base font-semibold text-foreground mb-3">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {[
            {
              q: "What's the difference between my public and private IP address?",
              a: "Your public IP is the address the internet sees — it's assigned by your ISP and is the same for all devices on your network. Your private IP is an internal address assigned by your router, visible only within your local network (home, office, etc.). The router uses Network Address Translation (NAT) to route traffic between your private devices and the public internet. Think of your public IP as a building's street address, and your private IP as the apartment number inside.",
            },
            {
              q: 'Does this tool store or log my IP address?',
              a: "QuickAway does not store, log, or process your IP address. However, any web server you contact — including ipify.org, which this tool uses — can see your IP address as a technical necessity of how the internet works. ipify.org's privacy policy governs how they handle request data on their end. As with any website you visit, your ISP can also see that you made a request to ipify.org. This is a fundamental property of internet communication, not specific to this tool.",
            },
            {
              q: 'Why does my IP address change sometimes?',
              a: "Most residential ISPs assign dynamic IP addresses, meaning your public IP can change. Common triggers include: your router being restarted or powered off, your DHCP lease expiring (ISPs renew leases on a schedule, typically every 24 hours to several days), or your ISP reassigning addresses during network maintenance. Some ISPs offer static IP addresses (that never change) as an add-on, usually marketed to business customers. If you need a stable, never-changing address for hosting a server, a static IP or a dynamic DNS service is the right solution.",
            },
            {
              q: 'Can someone find my exact location from my IP address?',
              a: "No. IP-based geolocation is approximate and often unreliable for precise location. It can typically identify your country with high accuracy and usually your city or region — but the \"city\" it infers is often where your ISP's regional data centre is located, not where you physically are. It cannot determine your street address, building, or floor. Accuracy degrades further in rural areas and when using mobile networks, where the inferred location may be many kilometres away. Your IP address is not a GPS coordinate.",
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
