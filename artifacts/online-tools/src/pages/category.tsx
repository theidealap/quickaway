import { useRoute, Link } from 'wouter';
import { ArrowRight } from 'lucide-react';
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
import { guidesRegistry } from '@/lib/guides-registry';
import NotFound from '@/pages/not-found';

export default function CategoryPage() {
  const [, params] = useRoute('/:categorySlug');
  const categorySlug = params?.categorySlug ?? '';

  const category: Category | undefined = SLUG_TO_CATEGORY[categorySlug];
  if (!category) return <NotFound />;

  const meta = CATEGORY_META[category];
  const tools = toolsRegistry.filter((t) => t.category === category);
  const otherCategories = (Object.keys(CATEGORY_SLUGS) as Category[]).filter(
    (c) => c !== category,
  );

  // Guides related to this category
  const relatedGuides = guidesRegistry.filter((g) => g.category === category).slice(0, 3);

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

      {/* ── Page header — slim, no tinted band ── */}
      <div className="border-b border-border bg-secondary">
        <div className="container mx-auto px-4 py-8 md:py-10">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-4">
            <ol className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <li>
                <Link href="/" className="hover:text-foreground transition-colors">
                  Home
                </Link>
              </li>
              <li aria-hidden="true" className="text-border">›</li>
              <li className="text-foreground font-medium">{category}</li>
            </ol>
          </nav>

          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                {meta.heading}
              </h1>
              <p className="text-muted-foreground text-sm md:text-base max-w-2xl leading-relaxed">
                {meta.description}
              </p>
            </div>
            <span className="shrink-0 text-xs text-muted-foreground font-mono bg-background border border-border rounded px-2 py-1 mt-1">
              {tools.length} {tools.length === 1 ? 'tool' : 'tools'}
            </span>
          </div>
        </div>
      </div>

      {/* ── Tool grid ── */}
      <section className="container mx-auto px-4 py-10 md:py-12">
        {tools.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-base mb-4">No tools in this category yet — check back soon.</p>
            <Link href="/" className="text-sm font-medium text-primary hover:underline underline-offset-4">
              Browse all tools
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {tools.map((tool) => (
              <Link
                key={tool.slug}
                href={`/tools/${tool.slug}`}
                className="group block border border-border rounded-md p-4 bg-background hover:border-primary/50 hover:bg-secondary transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium text-sm text-foreground group-hover:text-primary transition-colors leading-snug">
                    {tool.name}
                  </p>
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                  {tool.shortDescription}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ── Related guides ── */}
      {relatedGuides.length > 0 && (
        <section className="border-t border-border px-4 py-8">
          <div className="container mx-auto max-w-5xl">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Related Guides
            </h2>
            <div className="flex flex-wrap gap-3">
              {relatedGuides.map((guide) => (
                <Link
                  key={guide.slug}
                  href={`/guides/${guide.slug}`}
                  className="text-sm text-primary hover:underline underline-offset-4 flex items-center gap-1"
                >
                  {guide.title}
                  <ArrowRight className="w-3 h-3" />
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Other categories — clean link list ── */}
      <section className="border-t border-border bg-secondary px-4 py-8">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
            Other Categories
          </h2>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {otherCategories.map((cat) => {
              const count = toolsRegistry.filter((t) => t.category === cat).length;
              return (
                <Link
                  key={cat}
                  href={`/${CATEGORY_SLUGS[cat]}`}
                  className="text-sm text-foreground hover:text-primary transition-colors flex items-center gap-1.5"
                >
                  {cat}
                  <span className="text-xs text-muted-foreground font-mono">({count})</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
