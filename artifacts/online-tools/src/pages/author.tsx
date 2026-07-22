import { Link } from 'wouter';
import { User, BookOpen, Wrench, Mail } from 'lucide-react';
import { SEO } from '@/components/seo';
import { JsonLd } from '@/components/json-ld';
import { SITE_URL, SITE_NAME } from '@/components/seo';
import {
  AUTHOR_NAME,
  AUTHOR_TITLE,
  AUTHOR_BIO_LONG,
  AUTHOR_EXPERTISE,
} from '@/lib/author';
import { guidesRegistry } from '@/lib/guides-registry';

function buildPersonSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: AUTHOR_NAME,
    jobTitle: AUTHOR_TITLE,
    url: `${SITE_URL}/author`,
    worksFor: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    knowsAbout: AUTHOR_EXPERTISE,
  };
}

function buildAuthorBreadcrumbSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Author', item: `${SITE_URL}/author` },
    ],
  };
}

export default function Author() {
  return (
    <>
      <SEO
        title={`${AUTHOR_NAME} — Author & Web Tools Developer | ToolBox`}
        description={`${AUTHOR_NAME} is the creator of ToolBox — free browser-based calculators and utility tools. Learn about the author's background, expertise, and the mission behind the site.`}
      />
      <JsonLd id="person-schema"           schema={buildPersonSchema()}          />
      <JsonLd id="author-breadcrumb-schema" schema={buildAuthorBreadcrumbSchema()} />

      {/* ── Page header ── */}
      <div className="border-b border-border bg-secondary">
        <div className="container mx-auto px-4 py-8 md:py-10 max-w-3xl">
          <nav aria-label="Breadcrumb" className="mb-4">
            <ol className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <li><Link href="/" className="hover:text-foreground transition-colors">Home</Link></li>
              <li aria-hidden="true" className="text-border">›</li>
              <li className="text-foreground font-medium">Author</li>
            </ol>
          </nav>
          <div className="flex items-center gap-4">
            <div className="shrink-0 w-14 h-14 rounded-full bg-primary/10 border border-border flex items-center justify-center">
              <User className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">{AUTHOR_NAME}</h1>
              <p className="text-sm text-muted-foreground mt-0.5">{AUTHOR_TITLE}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="container mx-auto px-4 py-10 md:py-12 max-w-3xl">

        {/* Bio */}
        <section className="mb-10">
          <h2 className="text-base font-semibold text-foreground mb-3">About</h2>
          <div className="space-y-3">
            {AUTHOR_BIO_LONG.split('\n').filter(Boolean).map((para, i) => (
              <p key={i} className="text-sm text-muted-foreground leading-relaxed">{para}</p>
            ))}
          </div>
        </section>

        {/* Areas of expertise */}
        <section className="mb-10 pt-8 border-t border-border">
          <h2 className="text-base font-semibold text-foreground mb-3">Areas of Expertise</h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {AUTHOR_EXPERTISE.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="text-primary mt-0.5 shrink-0">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* Website mission */}
        <section className="mb-10 pt-8 border-t border-border">
          <h2 className="text-base font-semibold text-foreground mb-3">Website Mission</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            ToolBox exists to give everyone access to fast, accurate, free tools for the small calculations and lookups that come up in everyday life — without sign-ups, ads, or friction. Every tool runs entirely in your browser, so nothing you type is ever sent to a server.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed mt-3">
            The guides on ToolBox are written to the same standard: no filler, no jargon, just clear explanations with worked examples and the formulas behind every result.
          </p>
          <div className="flex flex-wrap gap-4 mt-4">
            <Link href="/editorial-policy" className="text-sm text-primary hover:underline underline-offset-4 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              Editorial Policy
            </Link>
            <Link href="/about" className="text-sm text-primary hover:underline underline-offset-4 flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5" />
              About ToolBox
            </Link>
          </div>
        </section>

        {/* Written guides */}
        <section className="mb-10 pt-8 border-t border-border">
          <h2 className="text-base font-semibold text-foreground mb-3">Guides Written</h2>
          <ul className="space-y-2">
            {guidesRegistry.map((guide) => (
              <li key={guide.slug}>
                <Link
                  href={`/guides/${guide.slug}`}
                  className="text-sm text-foreground hover:text-primary transition-colors"
                >
                  {guide.title}
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/guides" className="mt-4 inline-block text-sm text-primary hover:underline underline-offset-4">
            Browse all guides →
          </Link>
        </section>

        {/* Contact */}
        <section className="pt-8 border-t border-border">
          <h2 className="text-base font-semibold text-foreground mb-3">Get in Touch</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            Have a correction, a question about a guide, or a tool suggestion? Use the contact page — all messages are read personally.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline underline-offset-4"
          >
            <Mail className="w-3.5 h-3.5" />
            Contact page
          </Link>
        </section>

      </div>
    </>
  );
}
