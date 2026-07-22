import { Link } from 'wouter';
import { User } from 'lucide-react';
import { AUTHOR_NAME, AUTHOR_BIO_SHORT, AUTHOR_TITLE, AUTHOR_URL } from '@/lib/author';

/**
 * Compact author attribution card — rendered at the end of every guide article.
 * Improves E-E-A-T signals and links to the full /author page.
 */
export function AuthorCard() {
  return (
    <div className="flex items-start gap-4 border border-border rounded-md p-4 bg-secondary mt-8">
      {/* Avatar placeholder */}
      <div className="shrink-0 w-10 h-10 rounded-full bg-primary/10 border border-border flex items-center justify-center">
        <User className="w-5 h-5 text-primary" />
      </div>

      <div className="min-w-0">
        <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5 mb-1">
          <Link
            href={AUTHOR_URL}
            className="text-sm font-semibold text-foreground hover:text-primary transition-colors"
          >
            {AUTHOR_NAME}
          </Link>
          <span className="text-xs text-muted-foreground">{AUTHOR_TITLE}</span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed mb-2">
          {AUTHOR_BIO_SHORT}
        </p>
        <Link
          href={AUTHOR_URL}
          className="text-xs font-medium text-primary hover:underline underline-offset-4"
        >
          View author profile →
        </Link>
      </div>
    </div>
  );
}
