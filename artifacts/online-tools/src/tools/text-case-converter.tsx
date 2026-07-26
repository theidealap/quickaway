import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Copy, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// ── Converters ────────────────────────────────────────────────────────────────

function toUpperCase(s: string) { return s.toUpperCase(); }
function toLowerCase(s: string) { return s.toLowerCase(); }
function toTitleCase(s: string) {
  return s.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
}
function toSentenceCase(s: string) {
  return s.toLowerCase().replace(/(^\s*\w|[.!?]\s+\w)/g, (m) => m.toUpperCase());
}
function toAlternatingCase(s: string) {
  return s.split('').map((c, i) => i % 2 === 0 ? c.toLowerCase() : c.toUpperCase()).join('');
}

function words(s: string): string[] {
  return s
    .replace(/([a-z])([A-Z])/g, '$1 $2')  // split camelCase
    .replace(/[_\-]+/g, ' ')               // split kebab/snake
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

function toCamelCase(s: string) {
  const ws = words(s);
  return ws[0].toLowerCase() + ws.slice(1).map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
}
function toPascalCase(s: string) {
  return words(s).map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
}
function toKebabCase(s: string) {
  return words(s).map((w) => w.toLowerCase()).join('-');
}
function toSnakeCase(s: string) {
  return words(s).map((w) => w.toLowerCase()).join('_');
}
function toConstantCase(s: string) {
  return words(s).map((w) => w.toUpperCase()).join('_');
}
function toDotCase(s: string) {
  return words(s).map((w) => w.toLowerCase()).join('.');
}

// ── Case definitions ──────────────────────────────────────────────────────────

const CASES = [
  { label: 'UPPER CASE',      fn: toUpperCase,      example: 'HELLO WORLD'  },
  { label: 'lower case',      fn: toLowerCase,      example: 'hello world'  },
  { label: 'Title Case',      fn: toTitleCase,      example: 'Hello World'  },
  { label: 'Sentence case',   fn: toSentenceCase,   example: 'Hello world'  },
  { label: 'aLtErNaTiNg',     fn: toAlternatingCase,example: 'hElLo wOrLd'  },
  { label: 'camelCase',       fn: toCamelCase,      example: 'helloWorld'   },
  { label: 'PascalCase',      fn: toPascalCase,     example: 'HelloWorld'   },
  { label: 'kebab-case',      fn: toKebabCase,      example: 'hello-world'  },
  { label: 'snake_case',      fn: toSnakeCase,      example: 'hello_world'  },
  { label: 'CONSTANT_CASE',   fn: toConstantCase,   example: 'HELLO_WORLD'  },
  { label: 'dot.case',        fn: toDotCase,        example: 'hello.world'  },
] as const;

// ── Component ─────────────────────────────────────────────────────────────────

export default function TextCaseConverter() {
  const { toast } = useToast();
  const [text, setText] = useState('');

  const copy = (value: string, label: string) => {
    navigator.clipboard.writeText(value);
    toast({ title: `Copied ${label}`, description: 'Saved to your clipboard.', duration: 2000 });
  };

  const hasText = text.trim().length > 0;

  return (
    <div className="space-y-6">
      {/* Input */}
      <div className="relative">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type or paste your text here…"
          className="min-h-[140px] text-base resize-y p-4 md:p-6 rounded-xl border-input focus-visible:ring-primary font-sans leading-relaxed"
          autoFocus
        />
        {text && (
          <div className="absolute bottom-4 right-4 flex gap-2">
            <Button size="sm" variant="destructive" onClick={() => setText('')} className="shadow-sm opacity-80 hover:opacity-100">
              <Trash2 className="w-4 h-4 mr-2" /> Clear
            </Button>
          </div>
        )}
      </div>

      {/* Conversion grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {CASES.map(({ label, fn, example }) => {
          const output = hasText ? fn(text) : '';
          return (
            <div
              key={label}
              className={`group flex items-start justify-between gap-3 p-4 rounded-xl border bg-card transition-colors ${
                hasText ? 'hover:border-primary/40 hover:bg-primary/5' : 'opacity-60'
              }`}
            >
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-muted-foreground mb-1 tracking-wide uppercase">
                  {label}
                </p>
                <p className="text-sm font-mono break-all leading-relaxed text-foreground">
                  {hasText ? output : <span className="italic text-muted-foreground font-sans">{example}</span>}
                </p>
              </div>
              {hasText && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                  onClick={() => copy(output, label)}
                  aria-label={`Copy ${label}`}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
