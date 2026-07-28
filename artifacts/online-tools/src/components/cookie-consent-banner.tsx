import { useState } from 'react';
import { X, Cookie, ChevronDown, ChevronUp, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useConsent } from '@/hooks/use-consent';
import { cn } from '@/lib/utils';

export function CookieConsentBanner() {
  const { showBanner, acceptAll, rejectAll, saveCustom } = useConsent();
  const [showManage, setShowManage] = useState(false);
  const [analyticsOn, setAnalyticsOn] = useState(false);
  const [adsOn, setAdsOn] = useState(false);

  if (!showBanner) return null;

  return (
    /* Backdrop overlay — subtle, doesn't block content */
    <div
      className="fixed inset-0 z-50 flex items-end justify-center pointer-events-none"
      aria-live="polite"
    >
      <div
        className={cn(
          'pointer-events-auto w-full max-w-2xl mx-4 mb-4 sm:mb-6',
          'bg-white border border-[hsl(220,13%,91%)] rounded-xl shadow-xl',
          'transition-all duration-300 ease-out',
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Cookie consent"
      >
        {/* ── Main panel ─────────────────────────────────────────── */}
        <div className="p-5 sm:p-6">
          {/* Header row */}
          <div className="flex items-start gap-3 mb-3">
            <div className="mt-0.5 flex-shrink-0 w-8 h-8 rounded-lg bg-[hsl(221,39%,11%)] flex items-center justify-center">
              <Cookie className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <h2 className="text-[15px] font-semibold text-[hsl(221,39%,11%)] leading-snug">
                We use cookies
              </h2>
              <p className="mt-1 text-[13px] text-[hsl(215,16%,47%)] leading-relaxed">
                QuickAway uses cookies to understand how people use the site (analytics) and to
                show relevant ads. All tool calculations stay 100% in your browser — we never
                store your inputs.{' '}
                <a
                  href="/privacy"
                  className="underline underline-offset-2 hover:text-[hsl(221,39%,11%)] transition-colors"
                >
                  Privacy policy
                </a>
              </p>
            </div>
          </div>

          {/* ── Manage preferences panel ──────────────────────────── */}
          {showManage && (
            <div className="mt-4 mb-4 rounded-lg border border-[hsl(220,13%,91%)] bg-[hsl(210,40%,98%)] divide-y divide-[hsl(220,13%,91%)]">
              {/* Always-on row */}
              <div className="flex items-center justify-between px-4 py-3 gap-4">
                <div className="min-w-0">
                  <p className="text-[13px] font-medium text-[hsl(221,39%,11%)]">
                    Strictly necessary
                  </p>
                  <p className="text-[12px] text-[hsl(215,16%,47%)] mt-0.5">
                    Required for the site to function. Always active.
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center gap-1 text-[12px] font-medium text-emerald-600">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Always on
                  </span>
                </div>
              </div>

              {/* Analytics toggle */}
              <div className="flex items-center justify-between px-4 py-3 gap-4">
                <div className="min-w-0">
                  <p className="text-[13px] font-medium text-[hsl(221,39%,11%)]">
                    Analytics cookies
                  </p>
                  <p className="text-[12px] text-[hsl(215,16%,47%)] mt-0.5">
                    Help us understand which tools are used most (Google Analytics 4).
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={analyticsOn}
                  onClick={() => setAnalyticsOn(v => !v)}
                  className={cn(
                    'flex-shrink-0 relative inline-flex h-5 w-9 items-center rounded-full',
                    'transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(221,39%,11%)] focus-visible:ring-offset-2',
                    analyticsOn ? 'bg-[hsl(221,39%,11%)]' : 'bg-[hsl(215,20%,75%)]',
                  )}
                >
                  <span
                    className={cn(
                      'inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform duration-200',
                      analyticsOn ? 'translate-x-4' : 'translate-x-1',
                    )}
                  />
                  <span className="sr-only">{analyticsOn ? 'Disable' : 'Enable'} analytics cookies</span>
                </button>
              </div>

              {/* Advertising toggle */}
              <div className="flex items-center justify-between px-4 py-3 gap-4">
                <div className="min-w-0">
                  <p className="text-[13px] font-medium text-[hsl(221,39%,11%)]">
                    Advertising cookies
                  </p>
                  <p className="text-[12px] text-[hsl(215,16%,47%)] mt-0.5">
                    Used to show relevant ads and measure ad performance (Google AdSense).
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={adsOn}
                  onClick={() => setAdsOn(v => !v)}
                  className={cn(
                    'flex-shrink-0 relative inline-flex h-5 w-9 items-center rounded-full',
                    'transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(221,39%,11%)] focus-visible:ring-offset-2',
                    adsOn ? 'bg-[hsl(221,39%,11%)]' : 'bg-[hsl(215,20%,75%)]',
                  )}
                >
                  <span
                    className={cn(
                      'inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform duration-200',
                      adsOn ? 'translate-x-4' : 'translate-x-1',
                    )}
                  />
                  <span className="sr-only">{adsOn ? 'Disable' : 'Enable'} advertising cookies</span>
                </button>
              </div>
            </div>
          )}

          {/* ── Action buttons ─────────────────────────────────────── */}
          <div className="flex flex-wrap items-center gap-2 mt-4">
            {/* Accept All — primary, most prominent */}
            <Button
              size="sm"
              onClick={acceptAll}
              className="bg-[hsl(221,39%,11%)] text-white border-[hsl(221,39%,11%)] hover:opacity-90"
            >
              Accept all
            </Button>

            {/* Reject All */}
            <Button
              size="sm"
              variant="outline"
              onClick={rejectAll}
            >
              Reject all
            </Button>

            {/* Manage / Save preferences */}
            {showManage ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => saveCustom(analyticsOn, adsOn)}
                className="ml-auto"
              >
                Save preferences
              </Button>
            ) : (
              <button
                type="button"
                onClick={() => setShowManage(true)}
                className="ml-auto inline-flex items-center gap-1 text-[13px] text-[hsl(215,16%,47%)] hover:text-[hsl(221,39%,11%)] transition-colors underline underline-offset-2"
              >
                Manage preferences
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
