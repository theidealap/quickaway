import { useRoute, Link } from 'wouter';
import { toolsRegistry, CATEGORY_SLUGS } from '@/lib/tools-registry';
import { guidesRegistry } from '@/lib/guides-registry';
import { Suspense } from 'react';
import { ArrowRight, BookOpen } from 'lucide-react';
import { SEO } from '@/components/seo';
import { JsonLd, buildSoftwareAppSchema, buildBreadcrumbSchema } from '@/components/json-ld';
import { Skeleton } from '@/components/ui/skeleton';
import NotFound from '@/pages/not-found';

export default function ToolDetail() {
  const [match, params] = useRoute('/tools/:slug');

  if (!match || !params?.slug) return <NotFound />;

  const tool = toolsRegistry.find((t) => t.slug === params.slug);
  if (!tool) return <NotFound />;

  const ToolComponent = tool.component;
  const categorySlug = CATEGORY_SLUGS[tool.category];

  // Find a guide that covers this tool
  const relatedGuide = guidesRegistry.find((g) =>
    g.relatedToolSlugs.includes(tool.slug),
  );

  // Sibling tools in the same category
  const siblingTools = toolsRegistry
    .filter((t) => t.category === tool.category && t.slug !== tool.slug)
    .slice(0, 4);

  return (
    <>
      <SEO title={tool.seoTitle} description={tool.seoDescription} />

      <JsonLd
        id={`tool-${tool.slug}`}
        schema={buildSoftwareAppSchema({
          name: tool.name,
          description: tool.seoDescription,
          slug: tool.slug,
        })}
      />
      <JsonLd
        id={`breadcrumb-${tool.slug}`}
        schema={buildBreadcrumbSchema({
          name: tool.name,
          slug: tool.slug,
          category: { name: tool.category, slug: categorySlug },
        })}
      />

      {/* ── Breadcrumb ── */}
      <div className="border-b border-border bg-secondary">
        <div className="container mx-auto px-4 py-3">
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <li>
                <Link href="/" className="hover:text-foreground transition-colors">
                  Home
                </Link>
              </li>
              <li aria-hidden="true" className="text-border">›</li>
              <li>
                <Link
                  href={`/${categorySlug}`}
                  className="hover:text-foreground transition-colors"
                >
                  {tool.category}
                </Link>
              </li>
              <li aria-hidden="true" className="text-border">›</li>
              <li className="text-foreground font-medium truncate">{tool.name}</li>
            </ol>
          </nav>
        </div>
      </div>

      {/* ── Main layout ── */}
      <div className="container mx-auto px-4 py-8 md:py-10 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-10 items-start">

          {/* ── Tool area — no outer card wrapper ── */}
          <div>
            {/* Page header */}
            <div className="mb-6 pb-5 border-b border-border">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1.5">
                {tool.name}
              </h1>
              <p className="text-muted-foreground text-sm md:text-base">
                {tool.shortDescription}
              </p>
            </div>

            {/* Tool component renders directly in the page */}
            <Suspense
              fallback={
                <div className="space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-10 w-3/4" />
                  <Skeleton className="h-40 w-full" />
                </div>
              }
            >
              <ToolComponent />
            </Suspense>
          </div>

          {/* ── Sidebar ── */}
          <aside className="space-y-4 lg:sticky lg:top-20">

            {/* Guide link — highest value item in sidebar */}
            {relatedGuide && (
              <div className="border border-border rounded-md p-4 bg-secondary">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  Read the guide
                </p>
                <Link
                  href={`/guides/${relatedGuide.slug}`}
                  className="text-sm font-medium text-primary hover:underline underline-offset-4 flex items-start gap-1.5 group"
                >
                  <span className="flex-1 leading-snug">{relatedGuide.title}</span>
                  <ArrowRight className="w-3.5 h-3.5 shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </div>
            )}

            {/* Related tools */}
            {siblingTools.length > 0 && (
              <div className="border border-border rounded-md p-4">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                  Related Tools
                </h3>
                <ul className="space-y-1">
                  {siblingTools.map((t) => (
                    <li key={t.slug}>
                      <Link
                        href={`/tools/${t.slug}`}
                        className="block py-1.5 text-sm text-foreground hover:text-primary transition-colors"
                      >
                        {t.name}
                      </Link>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 pt-3 border-t border-border">
                  <Link
                    href={`/${categorySlug}`}
                    className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                  >
                    See all {tool.category}
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </>
  );
}
