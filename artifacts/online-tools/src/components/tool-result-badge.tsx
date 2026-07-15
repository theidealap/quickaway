import { CheckCircle2 } from 'lucide-react';

/**
 * Small corner badge placed on a result Card to visually confirm the
 * calculation completed. Pair with a `relative` container.
 */
export function ToolResultBadge() {
  return (
    <span className="absolute top-3 right-3 inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
      <CheckCircle2 className="w-3 h-3" />
      Calculated
    </span>
  );
}
