import { Link } from 'wouter';
import { BookOpen, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
      <JsonLd id="guides-breadcrumb" schema={buildGuidesIndexBreadcrumbSchema()} />
      <JsonLd id="guides-collection" schema={buildGuidesCollectionSchema(guidesRegistry.map(g => ({ title: g.title, slug: g.slug })))} />

      {/* ── Hero ── */}
      <section className="bg-primary/5 py-14 md:py-20 px-4 border-b border-primary/10">
        <div className="container mx-auto max-w-3xl text-center space-y-5">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm font-semibold tracking-tight">
            <BookOpen className="w-4 h-4" />
            <span>Free Guides</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
            How-To Guides &amp; References
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Step-by-step explanations, worked examples, and FAQs for the maths and concepts
            behind our tools — so you understand the answer, not just the number.
          </p>
        </div>
      </section>

      {/* ── Breadcrumb nav ── */}
      <nav aria-label="Breadcrumb" className="container mx-auto px-4 pt-6">
        <ol className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <li><Link href="/" className="hover:text-primary transition-colors">Home</Link></li>
          <li aria-hidden="true" className="text-muted-foreground/50">›</li>
          <li className="text-foreground font-medium">Guides</li>
        </ol>
      </nav>

      {/* ── Guide grid ── */}
      <section className="container mx-auto px-4 py-10 md:py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {guidesRegistry.map((guide) => (
            <Link key={guide.slug} href={`/guides/${guide.slug}`}>
              <Card className="h-full hover:border-primary/50 hover:shadow-md transition-all cursor-pointer group flex flex-col bg-card/50">
                <CardHeader className="flex-1">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <Badge variant="secondary" className="text-xs shrink-0">{guide.category}</Badge>
                    <ArrowRight className="w-4 h-4 text-primary opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all shrink-0 mt-0.5" />
                  </div>
                  <CardTitle className="text-xl leading-snug group-hover:text-primary transition-colors">
                    {guide.title}
                  </CardTitle>
                  <CardDescription className="text-sm md:text-base text-muted-foreground mt-2 leading-relaxed">
                    {guide.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
