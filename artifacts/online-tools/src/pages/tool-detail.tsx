import { useRoute, Link } from 'wouter';
import { toolsRegistry, CATEGORY_SLUGS } from '@/lib/tools-registry';
import { Suspense } from 'react';
import { ChevronRight, Hammer } from 'lucide-react';
import { SEO } from '@/components/seo';
import { JsonLd, buildSoftwareAppSchema, buildBreadcrumbSchema } from '@/components/json-ld';
import { Skeleton } from '@/components/ui/skeleton';
import NotFound from '@/pages/not-found';

export default function ToolDetail() {
  const [match, params] = useRoute('/tools/:slug');

  if (!match || !params?.slug) {
    return <NotFound />;
  }

  const tool = toolsRegistry.find((t) => t.slug === params.slug);

  if (!tool) {
    return <NotFound />;
  }

  const ToolComponent = tool.component;
  const categorySlug = CATEGORY_SLUGS[tool.category];

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
      <div className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-3">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 text-sm text-muted-foreground"
          >
            <Link href="/" className="hover:text-foreground transition-colors">
              All Tools
            </Link>
            <ChevronRight className="w-3.5 h-3.5 shrink-0" />
            <Link
              href={`/${categorySlug}`}
              className="hover:text-foreground transition-colors"
            >
              {tool.category}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 shrink-0" />
            <span className="text-foreground font-medium truncate">{tool.name}</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-card border rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-[400px]">
              <div className="p-6 border-b bg-muted/30">
                <h1 className="text-3xl font-bold tracking-tight mb-2">{tool.name}</h1>
                <p className="text-muted-foreground">{tool.shortDescription}</p>
              </div>
              <div className="p-6 md:p-8 flex-1 bg-background/50">
                <Suspense
                  fallback={
                    <div className="space-y-4">
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-[200px] w-full" />
                    </div>
                  }
                >
                  <ToolComponent />
                </Suspense>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-card border rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <Hammer className="w-5 h-5 text-primary" />
                About this tool
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {tool.longDescription || tool.shortDescription}
              </p>
            </div>

            <div className="bg-card border rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-lg mb-3">Related Tools</h3>
              <div className="space-y-3">
                {toolsRegistry
                  .filter((t) => t.category === tool.category && t.slug !== tool.slug)
                  .slice(0, 3)
                  .map((relatedTool) => (
                    <Link
                      key={relatedTool.slug}
                      href={`/tools/${relatedTool.slug}`}
                      className="block p-3 rounded-lg hover:bg-secondary border border-transparent hover:border-border transition-colors group"
                    >
                      <div className="font-medium text-sm group-hover:text-primary transition-colors">
                        {relatedTool.name}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {relatedTool.shortDescription}
                      </div>
                    </Link>
                  ))}
                {toolsRegistry.filter(
                  (t) => t.category === tool.category && t.slug !== tool.slug
                ).length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No related tools in this category yet.
                  </p>
                )}
              </div>
              <div className="mt-4 pt-4 border-t">
                <Link
                  href={`/${categorySlug}`}
                  className="text-sm font-medium text-primary hover:underline underline-offset-4 transition-colors"
                >
                  View all {tool.category} tools →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
