import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, Hammer } from 'lucide-react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { SEO } from '@/components/seo';

export default function NotFound() {
  return (
    <>
      <SEO title="Page Not Found - QuickAway" description="The page you are looking for does not exist." />
      <div className="flex-1 w-full flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="bg-primary/10 text-primary w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Hammer className="h-10 w-10" />
          </div>
          
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Page Not Found
          </h1>
          
          <p className="text-lg text-muted-foreground">
            We couldn't find the tool or page you were looking for. It might have been moved or doesn't exist yet.
          </p>

          <div className="pt-6">
            <Link href="/">
              <Button size="lg" className="rounded-full">
                Back to Tools
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
