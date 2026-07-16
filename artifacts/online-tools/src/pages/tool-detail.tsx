import { useRoute, Link } from 'wouter';
import { toolsRegistry } from '@/lib/tools-registry';
import { Suspense } from 'react';
import { ArrowLeft, Hammer } from 'lucide-react';
import { SEO } from '@/components/seo';
import { Skeleton } from '@/components/ui/skeleton';
import NotFound from '@/pages/not-found';

export default function ToolDetail() {
  const [match, params] = useRoute('/tools/:slug');

  if (!match || !params?.slug) {
    return <NotFound />;
  }

  const tool = toolsRegistry.find(t => t.slug === params.slug);

  if (!tool) {
    return <NotFound />;
  }

  const ToolComponent = tool.component;

  return (
    <>
      <SEO 
        title={`${tool.name} - ToolBox`} 
        description={tool.shortDescription}
      />
      
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to tools
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-card border rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-[400px]">
              <div className="p-6 border-b bg-muted/30">
                <h1 className="text-3xl font-bold tracking-tight mb-2">{tool.name}</h1>
                <p className="text-muted-foreground">{tool.shortDescription}</p>
              </div>
              <div className="p-6 md:p-8 flex-1 bg-background/50">
                <Suspense fallback={
                  <div className="space-y-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-[200px] w-full" />
                  </div>
                }>
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
                  .filter(t => t.category === tool.category && t.slug !== tool.slug)
                  .slice(0, 3)
                  .map(relatedTool => (
                    <Link 
                      key={relatedTool.slug} 
                      href={`/tools/${relatedTool.slug}`}
                      className="block p-3 rounded-lg hover:bg-secondary border border-transparent hover:border-border transition-colors group"
                    >
                      <div className="font-medium text-sm group-hover:text-primary transition-colors">{relatedTool.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{relatedTool.shortDescription}</div>
                    </Link>
                  ))}
                {toolsRegistry.filter(t => t.category === tool.category && t.slug !== tool.slug).length === 0 && (
                  <p className="text-sm text-muted-foreground">No related tools in this category.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
