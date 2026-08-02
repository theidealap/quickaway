import { CheckCircle2 } from 'lucide-react';

/**
 * Status badge confirming a result has been computed.
 *
 * Two placement modes:
 *
 * 1. Default (inline={false}): absolutely positioned at top-right of its
 *    nearest `relative` ancestor. Use only on hero/summary cards that have
 *    NO interactive elements (buttons, links) near their top-right corner.
 *    The parent Card must have `className="relative ..."`.
 *
 * 2. inline={true}: renders as a normal inline-flex element — no absolute
 *    positioning. Use inside a flex/grid container so the caller controls
 *    exact placement. Required for any card that has copy buttons or other
 *    interactive elements near the top-right (e.g. Hash Generator results).
 *
 * Label should match the tool category:
 *   Calculators  → "Calculated"  (default)
 *   Converters   → "Converted"
 *   Generators   → "Generated"
 *   Date & Time  → "Done"
 */
export function ToolResultBadge({
  label = 'Calculated',
  inline = false,
}: {
  label?: string;
  inline?: boolean;
}) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1',
        'text-[11px] font-semibold uppercase tracking-wide',
        'text-emerald-600 dark:text-emerald-400',
        'bg-emerald-500/10 border border-emerald-500/20',
        'px-2 py-0.5 rounded-full whitespace-nowrap',
        inline ? '' : 'absolute top-3 right-3',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <CheckCircle2 className="w-3 h-3 shrink-0" />
      {label}
    </span>
  );
}
