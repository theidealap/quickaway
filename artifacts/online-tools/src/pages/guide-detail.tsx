import { Link } from 'wouter';
import { ArrowRight, BookOpen, Wrench, Info } from 'lucide-react';
import { SEO } from '@/components/seo';
import {
  JsonLd,
  buildArticleSchema,
  buildGuideBreadcrumbSchema,
} from '@/components/json-ld';
import { guidesRegistry, findGuideBySlug, type GuideSection } from '@/lib/guides-registry';
import { toolsRegistry } from '@/lib/tools-registry';
import { AuthorCard } from '@/components/author-card';
import NotFound from '@/pages/not-found';

// ── Section renderers ─────────────────────────────────────────────────────────

function SectionWrapper({
  children,
  withDivider,
}: {
  children: React.ReactNode;
  withDivider: boolean;
}) {
  return (
    <div className={withDivider ? 'pt-8 mt-8 border-t border-border' : ''}>
      {children}
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-base font-semibold text-foreground mb-3">{children}</h2>
  );
}

function renderSection(section: GuideSection, idx: number) {
  const withDivider = idx > 0;

  switch (section.type) {
    case 'text':
      return (
        <SectionWrapper key={idx} withDivider={withDivider}>
          {section.heading && <SectionHeading>{section.heading}</SectionHeading>}
          <div className="space-y-3">
            {section.body.split('\n').filter(Boolean).map((line, i) => (
              <p key={i} className="text-sm text-muted-foreground leading-relaxed">
                {line}
              </p>
            ))}
          </div>
        </SectionWrapper>
      );

    case 'steps':
      return (
        <SectionWrapper key={idx} withDivider={withDivider}>
          <SectionHeading>{section.heading}</SectionHeading>
          <ol className="space-y-3">
            {section.steps.map((step, i) => (
              <li key={i} className="flex gap-3 items-start">
                <span className="shrink-0 w-5 h-5 rounded-full border border-border bg-secondary text-xs font-semibold text-muted-foreground flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <p className="text-sm text-muted-foreground leading-relaxed">{step}</p>
              </li>
            ))}
          </ol>
        </SectionWrapper>
      );

    case 'example':
      return (
        <SectionWrapper key={idx} withDivider={withDivider}>
          <SectionHeading>{section.heading}</SectionHeading>
          <div className="border border-border rounded-md bg-secondary p-4 space-y-3">
            <p className="text-sm font-medium text-foreground">
              Scenario: {section.scenario}
            </p>
            <ol className="space-y-2">
              {section.solution.map((step, i) => (
                <li key={i} className="flex gap-2.5 text-sm text-muted-foreground leading-relaxed">
                  <span className="shrink-0 font-mono text-xs text-primary font-semibold mt-0.5">
                    {i + 1}.
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </SectionWrapper>
      );

    case 'faq':
      return (
        <SectionWrapper key={idx} withDivider={withDivider}>
          <SectionHeading>{section.heading ?? 'Frequently Asked Questions'}</SectionHeading>
          <div className="space-y-3">
            {section.items.map((item, i) => (
              <div key={i} className="border border-border rounded-md p-4">
                <p className="text-sm font-semibold text-foreground mb-1.5">{item.q}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </SectionWrapper>
      );

    case 'tip':
      return (
        <SectionWrapper key={idx} withDivider={withDivider}>
          <div className="flex gap-3 border border-amber-200 bg-amber-50 rounded-md p-4">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-900 leading-relaxed">{section.body}</p>
          </div>
        </SectionWrapper>
      );

    case 'table':
      return (
        <SectionWrapper key={idx} withDivider={withDivider}>
          <SectionHeading>{section.heading}</SectionHeading>
          <div className="overflow-x-auto border border-border rounded-md">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-secondary border-b border-border">
                  {section.headers.map((h, i) => (
                    <th
                      key={i}
                      className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {section.rows.map((row, ri) => (
                  <tr key={ri} className="hover:bg-secondary/60 transition-colors">
                    {row.map((cell, ci) => (
                      <td
                        key={ci}
                        className={`px-4 py-2.5 text-sm ${
                          (section.monoColumns ?? []).includes(ci)
                            ? 'font-mono text-foreground'
                            : 'text-muted-foreground'
                        }`}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionWrapper>
      );
  }
}

// ── Page ─────────────────────────────────────────────────────────────────────

interface GuideDetailProps {
  params: { slug: string };
}

export default function GuideDetail({ params }: GuideDetailProps) {
  const guide = findGuideBySlug(params.slug);
  if (!guide) return <NotFound />;

  const relatedTools = guide.relatedToolSlugs
    .map((s) => toolsRegistry.find((t) => t.slug === s))
    .filter(Boolean) as typeof toolsRegistry;

  const relatedGuides = (guide.relatedGuideSlugs ?? [])
    .map((s) => guidesRegistry.find((g) => g.slug === s))
    .filter(Boolean) as typeof guidesRegistry;

  return (
    <>
      <SEO title={guide.seoTitle} description={guide.seoDescription} />
      <JsonLd
        id="guide-article"
        schema={buildArticleSchema({
          title: guide.title,
          description: guide.description,
          slug: guide.slug,
          datePublished: guide.datePublished,
        })}
      />
      <JsonLd
        id="guide-breadcrumb"
        schema={buildGuideBreadcrumbSchema({ title: guide.title, slug: guide.slug })}
      />

      {/* ── Page header ── */}
      <div className="border-b border-border bg-secondary">
        <div className="container mx-auto px-4 py-8 md:py-10 max-w-6xl">
          <nav aria-label="Breadcrumb" className="mb-4">
            <ol className="flex items-center gap-1.5 text-sm text-muted-foreground flex-wrap">
              <li><Link href="/" className="hover:text-foreground transition-colors">Home</Link></li>
              <li aria-hidden="true" className="text-border">›</li>
              <li><Link href="/guides" className="hover:text-foreground transition-colors">Guides</Link></li>
              <li aria-hidden="true" className="text-border">›</li>
              <li className="text-foreground font-medium">{guide.title}</li>
            </ol>
          </nav>

          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            {guide.title}
          </h1>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-2xl">
            {guide.description}
          </p>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="container mx-auto px-4 py-8 md:py-10 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-10">

          {/* ── Article ── */}
          <article className="max-w-prose">
            {guide.sections.map((section, idx) => renderSection(section, idx))}

            {/* Inline tool CTAs at article end */}
            {relatedTools.length > 0 && (
              <div className="pt-8 mt-8 border-t border-border">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5" />
                  Use the free tool
                </p>
                <div className="flex flex-wrap gap-2">
                  {relatedTools.map((tool) => (
                    <Link
                      key={tool.slug}
                      href={`/tools/${tool.slug}`}
                      className="inline-flex items-center gap-1.5 border border-primary text-primary px-3 py-1.5 rounded text-sm font-medium hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      {tool.name}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Author attribution — every guide page */}
            <AuthorCard />
          </article>

          {/* ── Sidebar ── */}
          <aside className="space-y-4 lg:sticky lg:top-20">

            {/* Related Tools */}
            {relatedTools.length > 0 && (
              <div className="border border-border rounded-md p-4">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5" />
                  Related Tools
                </h3>
                <ul className="space-y-1">
                  {relatedTools.map((tool) => (
                    <li key={tool.slug}>
                      <Link
                        href={`/tools/${tool.slug}`}
                        className="block py-1.5 text-sm text-foreground hover:text-primary transition-colors"
                      >
                        {tool.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Related Guides */}
            {relatedGuides.length > 0 && (
              <div className="border border-border rounded-md p-4">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  Related Guides
                </h3>
                <ul className="space-y-2">
                  {relatedGuides.map((related) => (
                    <li key={related.slug}>
                      <Link
                        href={`/guides/${related.slug}`}
                        className="block text-sm text-foreground hover:text-primary transition-colors leading-snug"
                      >
                        {related.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Link
              href="/guides"
              className="block text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              ← All guides
            </Link>
          </aside>
        </div>
      </div>
    </>
  );
}
