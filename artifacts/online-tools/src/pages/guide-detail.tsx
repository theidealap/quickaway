import { Link } from 'wouter';
import { ArrowRight, BookOpen, Wrench, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SEO } from '@/components/seo';
import {
  JsonLd,
  buildArticleSchema,
  buildGuideBreadcrumbSchema,
} from '@/components/json-ld';
import { guidesRegistry, findGuideBySlug, type GuideSection } from '@/lib/guides-registry';
import { toolsRegistry } from '@/lib/tools-registry';
import NotFound from '@/pages/not-found';

// ── Section renderers ─────────────────────────────────────────────────────────

function renderSection(section: GuideSection, idx: number) {
  switch (section.type) {
    case 'text':
      return (
        <div key={idx} className="space-y-3">
          {section.heading && (
            <h2 className="text-xl font-bold tracking-tight text-foreground">{section.heading}</h2>
          )}
          {section.body.split('\n').map((line, i) =>
            line === '' ? null : (
              <p key={i} className="text-muted-foreground leading-relaxed text-base">
                {line}
              </p>
            )
          )}
        </div>
      );

    case 'steps':
      return (
        <div key={idx} className="space-y-3">
          <h2 className="text-xl font-bold tracking-tight text-foreground">{section.heading}</h2>
          <ol className="space-y-3">
            {section.steps.map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 text-primary text-sm font-bold flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <p className="text-muted-foreground leading-relaxed text-base pt-0.5">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      );

    case 'example':
      return (
        <div key={idx} className="space-y-3">
          <h2 className="text-xl font-bold tracking-tight text-foreground">{section.heading}</h2>
          <Card className="bg-muted/30 border-muted-foreground/20">
            <CardContent className="pt-5 space-y-3">
              <p className="text-sm font-semibold text-foreground">
                Scenario: {section.scenario}
              </p>
              <ol className="space-y-2">
                {section.solution.map((step, i) => (
                  <li key={i} className="flex gap-2.5 text-sm text-muted-foreground leading-relaxed">
                    <span className="shrink-0 font-mono text-primary font-bold mt-0.5">{i + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>
      );

    case 'faq':
      return (
        <div key={idx} className="space-y-4">
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            {section.heading ?? 'Frequently Asked Questions'}
          </h2>
          <div className="space-y-4">
            {section.items.map((item, i) => (
              <div key={i} className="border rounded-xl p-5 space-y-2 bg-card">
                <p className="font-semibold text-foreground text-base">{item.q}</p>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      );

    case 'tip':
      return (
        <div key={idx} className="flex gap-3 bg-primary/5 border border-primary/20 rounded-xl p-5">
          <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <p className="text-sm text-foreground leading-relaxed">{section.body}</p>
        </div>
      );

    case 'table':
      return (
        <div key={idx} className="space-y-3">
          <h2 className="text-xl font-bold tracking-tight text-foreground">{section.heading}</h2>
          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50">
                  {section.headers.map((h, i) => (
                    <th
                      key={i}
                      className="px-4 py-3 text-left font-semibold text-foreground whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {section.rows.map((row, ri) => (
                  <tr key={ri} className={ri % 2 === 0 ? 'bg-card' : 'bg-muted/20'}>
                    {row.map((cell, ci) => (
                      <td key={ci} className="px-4 py-3 text-muted-foreground font-mono">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
  }
}

// ── Page ─────────────────────────────────────────────────────────────────────

interface GuideDetailProps {
  params: { slug: string };
}

export default function GuideDetail({ params }: GuideDetailProps) {
  const guide = findGuideBySlug(params.slug);

  if (!guide) {
    return <NotFound />;
  }

  // Related tools from toolsRegistry
  const relatedTools = guide.relatedToolSlugs
    .map((s) => toolsRegistry.find((t) => t.slug === s))
    .filter(Boolean) as typeof toolsRegistry;

  // Related guides from guidesRegistry
  const relatedGuides = (guide.relatedGuideSlugs ?? [])
    .map((s) => guidesRegistry.find((g) => g.slug === s))
    .filter(Boolean) as typeof guidesRegistry;

  return (
    <>
      <SEO title={guide.seoTitle} description={guide.seoDescription} />
      <JsonLd id="guide-article" schema={buildArticleSchema({
        title: guide.title,
        description: guide.description,
        slug: guide.slug,
        datePublished: guide.datePublished,
      })} />
      <JsonLd id="guide-breadcrumb" schema={buildGuideBreadcrumbSchema({
        title: guide.title,
        slug: guide.slug,
      })} />

      <div className="container mx-auto px-4 py-8 md:py-12 max-w-6xl">
        {/* ── Breadcrumb ── */}
        <nav aria-label="Breadcrumb" className="mb-8">
          <ol className="flex items-center gap-1.5 text-sm text-muted-foreground flex-wrap">
            <li><Link href="/" className="hover:text-primary transition-colors">Home</Link></li>
            <li aria-hidden="true" className="text-muted-foreground/50">›</li>
            <li><Link href="/guides" className="hover:text-primary transition-colors">Guides</Link></li>
            <li aria-hidden="true" className="text-muted-foreground/50">›</li>
            <li className="text-foreground font-medium">{guide.title}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-10">
          {/* ── Main article ── */}
          <article className="space-y-10">
            {/* Header */}
            <header className="space-y-4">
              <Badge variant="secondary">{guide.category}</Badge>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground leading-tight">
                {guide.title}
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {guide.description}
              </p>
            </header>

            {/* Sections */}
            {guide.sections.map((section, idx) => renderSection(section, idx))}

            {/* Related tools inline mention */}
            {relatedTools.length > 0 && (
              <div className="border-t pt-8">
                <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium mb-3">
                  <Wrench className="w-4 h-4" />
                  <span>Use the free tool</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {relatedTools.map((tool) => (
                    <Link
                      key={tool.slug}
                      href={`/tools/${tool.slug}`}
                      className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                    >
                      {tool.name}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </article>

          {/* ── Sidebar ── */}
          <aside className="space-y-6">
            {/* Related Tools card */}
            {relatedTools.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-primary" />
                    Related Tools
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-2">
                  {relatedTools.map((tool) => (
                    <Link
                      key={tool.slug}
                      href={`/tools/${tool.slug}`}
                      className="flex items-center justify-between gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                    >
                      <div>
                        <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                          {tool.name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                          {tool.shortDescription}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Related Guides card */}
            {relatedGuides.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-primary" />
                    Related Guides
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-2">
                  {relatedGuides.map((related) => (
                    <Link
                      key={related.slug}
                      href={`/guides/${related.slug}`}
                      className="flex items-center justify-between gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                    >
                      <div>
                        <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                          {related.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                          {related.description}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Browse all guides */}
            <div className="text-center">
              <Link
                href="/guides"
                className="text-sm text-primary hover:underline underline-offset-4 font-medium"
              >
                ← Browse all guides
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
