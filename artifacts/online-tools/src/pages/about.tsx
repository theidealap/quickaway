import { Link } from 'wouter';
import { SEO } from '@/components/seo';
import { Zap, Shield, BookOpen, User } from 'lucide-react';
import { AUTHOR_NAME, AUTHOR_TITLE, AUTHOR_BIO_SHORT, AUTHOR_URL } from '@/lib/author';

export default function About() {
  return (
    <>
      <SEO
        title="About QuickAway — Free Browser-Based Utilities, No Sign-Up Required"
        description="QuickAway is a free collection of browser-based calculators and utilities that run entirely on your device. No account needed, no data collected, instant results."
      />

      {/* ── Page header ── */}
      <div className="border-b border-border bg-secondary">
        <div className="container mx-auto px-4 py-8 md:py-10 max-w-3xl">
          <nav aria-label="Breadcrumb" className="mb-4">
            <ol className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <li><Link href="/" className="hover:text-foreground transition-colors">Home</Link></li>
              <li aria-hidden="true" className="text-border">›</li>
              <li className="text-foreground font-medium">About</li>
            </ol>
          </nav>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">About QuickAway</h1>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-xl">
            A free collection of browser-based calculators and utilities for the small tasks you run into every day.
          </p>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="container mx-auto px-4 py-10 md:py-12 max-w-3xl space-y-0">

        {/* What it is */}
        <section className="mb-10">
          <h2 className="text-base font-semibold text-foreground mb-3">What QuickAway Is</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            QuickAway is a small set of free calculators and utilities — things like{' '}
            <Link href="/tools/age-calculator" className="text-primary hover:underline underline-offset-4">checking an age</Link>,{' '}
            <Link href="/tools/percentage-calculator" className="text-primary hover:underline underline-offset-4">a percentage</Link>, or a{' '}
            <Link href="/tools/word-counter" className="text-primary hover:underline underline-offset-4">word count</Link>{' '}
            — built to be quick and easy to use, without unnecessary steps in the way.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We're adding more tools over time, based on what people find useful. Have a suggestion? Use the{' '}
            <Link href="/contact" className="text-primary hover:underline underline-offset-4">contact page</Link>.
          </p>
        </section>

        {/* Key properties */}
        <section className="pt-8 border-t border-border mb-10">
          <h2 className="text-base font-semibold text-foreground mb-4">How It Works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="border border-border rounded-md p-4 bg-background">
              <Zap className="w-5 h-5 text-primary mb-2" />
              <h3 className="text-sm font-semibold text-foreground mb-1">Runs in Your Browser</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Every tool works client-side, so results appear instantly as you type — no page reloads or waiting.
              </p>
            </div>
            <div className="border border-border rounded-md p-4 bg-background">
              <Shield className="w-5 h-5 text-primary mb-2" />
              <h3 className="text-sm font-semibold text-foreground mb-1">Nothing You Enter Is Stored</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Whatever you type into a tool stays on your device. We don't collect or store it.
              </p>
            </div>
          </div>
        </section>

        {/* About the Author */}
        <section className="pt-8 border-t border-border mb-10">
          <h2 className="text-base font-semibold text-foreground mb-4">About the Author</h2>
          <div className="flex items-start gap-4 border border-border rounded-md p-4 bg-secondary">
            <div className="shrink-0 w-10 h-10 rounded-full bg-primary/10 border border-border flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5 mb-1">
                <Link href={AUTHOR_URL} className="text-sm font-semibold text-foreground hover:text-primary transition-colors">
                  {AUTHOR_NAME}
                </Link>
                <span className="text-xs text-muted-foreground">{AUTHOR_TITLE}</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed mb-2">{AUTHOR_BIO_SHORT}</p>
              <Link href={AUTHOR_URL} className="text-xs font-medium text-primary hover:underline underline-offset-4">
                View author profile →
              </Link>
            </div>
          </div>
        </section>

        {/* Editorial commitment */}
        <section className="pt-8 border-t border-border mb-10">
          <h2 className="text-base font-semibold text-foreground mb-3">Editorial Standards</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            Every guide on QuickAway is researched and written from primary sources. Formulas are verified, health metrics follow published guidelines (WHO, CDC), and all content is reviewed on a rolling basis.
          </p>
          <Link
            href="/editorial-policy"
            className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline underline-offset-4"
          >
            <BookOpen className="w-3.5 h-3.5" />
            Read our Editorial Policy
          </Link>
        </section>

        {/* Browse CTA */}
        <section className="pt-8 border-t border-border">
          <h2 className="text-base font-semibold text-foreground mb-3">Browse the Tools</h2>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 border border-primary text-primary px-4 py-2 rounded text-sm font-medium hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              Explore all tools
            </Link>
            <Link
              href="/guides"
              className="inline-flex items-center gap-1.5 border border-border text-foreground px-4 py-2 rounded text-sm font-medium hover:bg-secondary transition-colors"
            >
              Read the guides
            </Link>
          </div>
        </section>

      </div>
    </>
  );
}
