import { useState, useMemo } from 'react';
import { Link } from 'wouter';
import { toolsRegistry, CATEGORY_SLUGS, type Category } from '@/lib/tools-registry';
import { guidesRegistry } from '@/lib/guides-registry';
import { Search, ArrowRight, Hammer, BookOpen } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SEO } from '@/components/seo';
import { JsonLd, buildWebsiteSchema, buildOrganizationSchema } from '@/components/json-ld';

// Show the first 3 guides as "Popular Guides" on the homepage
const popularGuides = guidesRegistry.slice(0, 3);

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTools = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return toolsRegistry;
    return toolsRegistry.filter(
      (tool) =>
        tool.name.toLowerCase().includes(query) ||
        tool.shortDescription.toLowerCase().includes(query) ||
        tool.category.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const categories = useMemo(() => {
    const cats = new Set<Category>();
    filteredTools.forEach((tool) => cats.add(tool.category));
    return Array.from(cats).sort();
  }, [filteredTools]);

  return (
    <>
      <SEO
        title="ToolBox - Free Online Utilities for Everyday Tasks"
        description="A fast, no-nonsense hub of free browser-based utilities for everyday calculations and text tasks. No installation required."
      />
      <JsonLd id="website" schema={buildWebsiteSchema()} />
      <JsonLd id="organization" schema={buildOrganizationSchema()} />

      {/* ── Hero ── */}
      <section className="bg-primary/5 py-16 md:py-24 px-4 border-b border-primary/10">
        <div className="container mx-auto max-w-4xl text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm font-semibold tracking-tight mb-4">
            <Hammer className="w-4 h-4" />
            <span>Always Free, Always Fast</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground">
            The sharpest tools in the shed.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            A reliable suite of utilities for students, professionals, and anyone who needs a quick
            answer without the clutter.
          </p>

          <div className="pt-8 max-w-2xl mx-auto">
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                <Search className="h-5 w-5" />
              </div>
              <Input
                type="search"
                placeholder="Search for tools... (e.g. 'Age', 'Word count', 'Percentage')"
                className="pl-12 py-7 text-lg rounded-2xl shadow-sm border-muted-foreground/20 focus-visible:ring-primary/30 transition-all bg-card"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="input-search-tools"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Popular Guides ── */}
      <section className="container mx-auto px-4 pt-12 md:pt-16">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-primary" />
              <h2 className="text-2xl font-bold tracking-tight">Popular Guides</h2>
            </div>
            <Link
              href="/guides"
              className="text-sm font-medium text-primary hover:underline underline-offset-4 transition-colors shrink-0"
            >
              Browse all guides →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {popularGuides.map((guide) => (
              <Link key={guide.slug} href={`/guides/${guide.slug}`}>
                <Card className="h-full hover:border-primary/50 hover:shadow-md transition-all cursor-pointer group flex flex-col bg-card/50">
                  <CardHeader className="flex-1">
                    <Badge variant="secondary" className="text-xs w-fit mb-2">{guide.category}</Badge>
                    <CardTitle className="text-base leading-snug group-hover:text-primary transition-colors">
                      {guide.title}
                    </CardTitle>
                    <CardDescription className="text-sm text-muted-foreground leading-relaxed mt-1">
                      {guide.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tool Grid ── */}
      <section className="container mx-auto px-4 py-12 md:py-16">
        {categories.length === 0 ? (
          <div className="text-center py-20 px-4">
            <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-muted-foreground">
              <Search className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">No tools found</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              We couldn't find any tools matching "{searchQuery}". Try adjusting your search terms
              or browse all categories.
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="mt-6 text-primary font-medium hover:underline"
            >
              Clear search
            </button>
          </div>
        ) : (
          <div className="space-y-16">
            {categories.map((category) => {
              const categoryTools = filteredTools.filter((t) => t.category === category);
              const categorySlug = CATEGORY_SLUGS[category];

              return (
                <div key={category} className="space-y-6">
                  {/* Category heading row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/${categorySlug}`}
                        className="group/heading flex items-center gap-2 hover:text-primary transition-colors"
                      >
                        <h2 className="text-2xl font-bold tracking-tight">{category}</h2>
                        <ArrowRight className="w-5 h-5 opacity-0 -translate-x-1 group-hover/heading:opacity-100 group-hover/heading:translate-x-0 transition-all text-primary" />
                      </Link>
                      <Badge
                        variant="secondary"
                        className="rounded-full bg-secondary text-secondary-foreground font-mono"
                      >
                        {categoryTools.length}
                      </Badge>
                    </div>

                    {/* "View all" link — only when not filtering by search */}
                    {!searchQuery && (
                      <Link
                        href={`/${categorySlug}`}
                        className="text-sm font-medium text-primary hover:underline underline-offset-4 transition-colors shrink-0"
                        aria-label={`View all ${category} tools`}
                      >
                        View all →
                      </Link>
                    )}
                  </div>

                  {/* Tool cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categoryTools.map((tool) => (
                      <Link
                        key={tool.slug}
                        href={`/tools/${tool.slug}`}
                        data-testid={`link-tool-${tool.slug}`}
                      >
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
                </div>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
