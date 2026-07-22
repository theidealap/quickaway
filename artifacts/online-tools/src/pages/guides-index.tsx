import { Link } from 'wouter';
import { ArrowRight } from 'lucide-react';
import { SEO } from '@/components/seo';
import {
  JsonLd,
  buildGuidesIndexBreadcrumbSchema,
  buildGuidesCollectionSchema,
} from '@/components/json-ld';
import { guidesRegistry } from '@/lib/guides-registry';

export default function GuidesIndex() {
  return (
    <>
      <SEO
        title="Free Guides & How-To Articles | ToolBox"
        description="Step-by-step guides explaining the maths and concepts behind our free online tools. Learn how to calculate age, percentages, BMI, Roman numerals, and more."
      />
      <JsonLd id="guides-breadcrumb"  schema={buildGuidesIndexBreadcrumbSchema()} />
      <JsonLd id="guides-collection"  schema={buildGuidesCollectionSchema(guidesRegistry.map(g => ({ title: g.title, slug: g.slug })))} />

      {/* ── Page header — no tinted band ── */}
      <div className="border-b border-border bg-secondary">
        <div className="container mx-auto px-4 py-8 md:py-10">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-4">
            <ol className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <li>
                <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
              </li>
              <li aria-hidden="true" className="text-border">›</li>
              <li className="text-foreground font-medium">Guides</li>
            </ol>
          </nav>

          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Guides &amp; References
          </h1>
          <p className="text-muted-foreground text-sm md:text-base max-w-xl leading-relaxed">
            Step-by-step explanations, worked examples, and FAQs for the maths behind our tools —
            so you understand the answer, not just the number.
          </p>
        </div>
      </div>

      {/* ── Guide list ── */}
      <section className="container mx-auto px-4 py-10 md:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {guidesRegistry.map((guide) => (
            <Link key={guide.slug} href={`/guides/${guide.slug}`} className="group block border border-border rounded-md p-5 bg-background hover:border-primary/50 hover:bg-secondary transition-colors">
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                {guide.category}
              </span>
              <div className="flex items-start justify-between gap-2 mt-1.5 mb-2">
                <p className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors leading-snug">
                  {guide.title}
                </p>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {guide.description}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
