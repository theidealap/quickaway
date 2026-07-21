import { useRoute, Link } from 'wouter';
import { ArrowRight, ChevronRight, Layers } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SEO } from '@/components/seo';
import {
  JsonLd,
  buildCategorySchema,
  buildCategoryBreadcrumbSchema,
} from '@/components/json-ld';
import {
  toolsRegistry,
  SLUG_TO_CATEGORY,
  CATEGORY_SLUGS,
  CATEGORY_META,
  type Category,
} from '@/lib/tools-registry';
import NotFound from '@/pages/not-found';

export default function CategoryPage() {
  const [, params] = useRoute('/:categorySlug');
  const categorySlug = params?.categorySlug ?? '';

  // Validate the slug maps to a known category
  const category: Category | undefined = SLUG_TO_CATEGORY[categorySlug];
  if (!category) return <NotFound />;

  const meta = CATEGORY_META[category];
  const tools = toolsRegistry.filter((t) => t.category === category);
  const otherCategories = (Object.keys(CATEGORY_SLUGS) as Category[]).filter(
    (c) => c !== category
  );

  return (
    <>
      <SEO title={meta.seoTitle} description={meta.seoDescription} />

      <JsonLd
        id={`category-${categorySlug}`}
        schema={buildCategorySchema({
          name: category,
          slug: categorySlug,
          description: meta.description,
          tools: tools.map((t) => ({ name: t.name, slug: t.slug })),
        })}
      />
      <JsonLd
        id={`breadcrumb-category-${categorySlug}`}
        schema={buildCategoryBreadcrumbSchema({ name: category, slug: categorySlug })}
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
            <span className="text-foreground font-medium">{category}</span>
          </nav>
        </div>
      </div>

      {/* ── Hero ── */}
      <section className="bg-primary/5 border-b border-primary/10 py-12 md:py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm font-semibold mb-4">
            <Layers className="w-4 h-4" />
            <span>{tools.length} free {tools.length === 1 ? 'tool' : 'tools'}</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
            {meta.heading}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">{meta.description}</p>
        </div>
      </section>

      {/* ── Tool Grid ── */}
      <section className="container mx-auto px-4 py-12 md:py-16">
        {tools.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-lg">No tools in this category yet — check back soon.</p>
            <Link href="/" className="mt-4 inline-block text-primary font-medium hover:underline">
              Browse all tools
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool) => (
              <Link key={tool.slug} href={`/tools/${tool.slug}`}>
                <Card className="h-full hover:border-primary/50 hover:shadow-md transition-all cursor-pointer group flex flex-col bg-card/50">
                  <CardHeader>
                    <CardTitle className="text-xl group-hover:text-primary transition-colors flex justify-between items-start">
                      {tool.name}
                      <ArrowRight className="w-5 h-5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary shrink-0" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <CardDescription className="text-sm md:text-base text-muted-foreground">
                      {tool.shortDescription}
                    </CardDescription>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ── Other Categories ── */}
      <section className="border-t bg-muted/20 py-12 px-4">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-xl font-bold tracking-tight mb-6">Browse Other Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {otherCategories.map((cat) => {
              const count = toolsRegistry.filter((t) => t.category === cat).length;
              return (
                <Link key={cat} href={`/${CATEGORY_SLUGS[cat]}`}>
                  <div className="flex flex-col gap-1.5 p-4 rounded-xl border bg-card hover:border-primary/50 hover:shadow-sm transition-all cursor-pointer group">
                    <span className="font-medium text-sm group-hover:text-primary transition-colors leading-snug">
                      {cat}
                    </span>
                    <Badge
                      variant="secondary"
                      className="w-fit rounded-full text-xs font-mono bg-secondary text-secondary-foreground"
                    >
                      {count}
                    </Badge>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
