import type { LucideIcon } from 'lucide-react';

interface ToolEmptyStateProps {
  icon: LucideIcon;
  message: string;
  className?: string;
}

/**
 * Standard "waiting for input" state shown inside a tool before a result is
 * available. Intentionally avoids a dashed border so it doesn't read as a
 * file-upload/drop zone — instead it uses a soft filled surface with a
 * badge-style icon to signal "nothing calculated yet".
 */
export function ToolEmptyState({ icon: Icon, message, className = '' }: ToolEmptyStateProps) {
  return (
    <div
      className={`rounded-xl border border-border/60 bg-muted/40 flex flex-col items-center justify-center gap-3 py-10 px-6 text-center ${className}`}
    >
      <div className="bg-background border rounded-full p-3 shadow-sm">
        <Icon className="w-5 h-5 text-muted-foreground" />
      </div>
      <p className="text-sm text-muted-foreground max-w-xs">{message}</p>
    </div>
  );
}
