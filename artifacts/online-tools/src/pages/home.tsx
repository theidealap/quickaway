import { useState, useMemo } from 'react';
import { Link } from 'wouter';
import { toolsRegistry, CATEGORY_SLUGS, type Category } from '@/lib/tools-registry';
import { guidesRegistry } from '@/lib/guides-registry';
import { Search, ArrowRight, BookOpen } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { SEO } from '@/components/seo';
import { JsonLd, buildWebsiteSchema, buildOrganizationSchema } from '@/components/json-ld';

// Surface 3 guides that span different categories for the homepage strip
const featuredGuides = [
  guidesRegistry.find(g => g.slug === 'how-to-calculate-age')!,
  guidesRegistry.find(g => g.slug === 'roman-numerals-chart')!,
  guidesRegistry.find(g => g.slug === 'date-difference-calculator-guide')!,
].filter(Boolean);

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTools = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return toolsRegistry;
    return toolsRegistry.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.shortDescription.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q),
    );
  }, [searchQuery]);

  const categories = useMemo(() => {
    const cats = new Set<Category>();
    filteredTools.forEach((t) => cats.add(t.category));
    return Array.from(cats).sort();
  }, [filteredTools]);

  return (
    <>
      <SEO
        title="ToolBox — Free Online Calculator & Tool Hub"
        description="Free browser-based utilities for everyday calculations, conversions, and text tasks. Age calculator, BMI, percentage, unit converter, and 17 more tools. No sign-up."
      />
      <JsonLd id="website"      schema={buildWebsiteSchema()}      />
      <JsonLd id="organization" schema={buildOrganizationSchema()} />

      {/* ── Compact hero ── */}
      <section className="border-b border-border bg-secondary py-10 md:py-14 px-4">
        <div className="container mx-auto max-w-2xl">
          <h1 className="text-3xl md:text-4xl font-bold mb-3 text-foreground">
            Free Online Calculator &amp; Tool Hub
          </h1>
          <p className="text-muted-foreground text-base md:text-lg mb-6 leading-relaxed">
            Fast, browser-based utilities for everyday calculations, conversions, and text tasks.
            No sign-up. No ads. Always free.
          </p>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              type="search"
              placeholder="Search tools…"
              className="pl-9 h-11 text-base bg-background border-border rounded-md"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="input-search-tools"
            />
          </div>
        </div>
      </section>

      {/* ── Tool grid ── */}
      <section className="container mx-auto px-4 py-10 md:py-14">
        {categories.length === 0 ? (
          <div className="text-center py-20 px-4">
            <p className="text-lg font-semibold mb-2">No tools match "{searchQuery}"</p>
            <p className="text-muted-foreground text-sm mb-6">
              Try a different keyword, or browse all categories.
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="text-sm font-medium text-primary hover:underline underline-offset-4"
            >
              Clear search
            </button>
          </div>
        ) : (
          <div className="space-y-12">
            {categories.map((category) => {
              const categoryTools = filteredTools.filter((t) => t.category === category);
              const categorySlug = CATEGORY_SLUGS[category];

              return (
                <div key={category}>
                  {/* Category heading row */}
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/${categorySlug}`}
                        className="text-lg font-semibold text-foreground hover:text-primary transition-colors"
                      >
                        {category}
                      </Link>
                      <span className="text-xs text-muted-foreground font-mono bg-secondary border border-border rounded px-1.5 py-0.5">
                        {categoryTools.length}
                      </span>
                    </div>
                    {!searchQuery && (
                      <Link
                        href={`/${categorySlug}`}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                        aria-label={`View all ${category} tools`}
                      >
                        View all
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>

                  {/* Tool cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {categoryTools.map((tool) => (
                      <Link
                        key={tool.slug}
                        href={`/tools/${tool.slug}`}
                        data-testid={`link-tool-${tool.slug}`}
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
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Guides strip — below tools, not above ── */}
      {!searchQuery && featuredGuides.length > 0 && (
        <section className="border-t border-border bg-secondary py-10 md:py-12 px-4">
          <div className="container mx-auto">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" />
                <h2 className="text-base font-semibold text-foreground">Popular Guides</h2>
              </div>
              <Link
                href="/guides"
                className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
              >
                Browse all
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {featuredGuides.map((guide) => (
                <Link
                  key={guide.slug}
                  href={`/guides/${guide.slug}`}
                  className="group block border border-border rounded-md p-4 bg-background hover:border-primary/50 hover:bg-background transition-colors"
                >
                  <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                    {guide.category}
                  </span>
                  <p className="font-medium text-sm text-foreground group-hover:text-primary transition-colors mt-1 leading-snug">
                    {guide.title}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
