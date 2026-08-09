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

      {/* ── Educational content ───────────────────────────────────────── */}
      <div className="pt-8 mt-8 border-t border-border space-y-0">

        {/* Section 1 — The Case Conventions */}
        <div>
          <h2 className="text-base font-semibold text-foreground mb-3">The Case Conventions This Tool Supports</h2>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Text case is not just uppercase and lowercase — different writing and programming
              contexts have their own conventions. Take the phrase{' '}
              <span className="font-mono text-foreground">"the quick brown fox"</span>. Here is
              what each format produces, verified programmatically:
            </p>
            <div className="border border-border rounded-md bg-secondary p-4 space-y-2">
              {[
                ['UPPER CASE',     'THE QUICK BROWN FOX',              'acronyms, warnings, headings that demand attention'],
                ['lower case',     'the quick brown fox',              'informal writing, CSS values, some URL components'],
                ['Title Case',     'The Quick Brown Fox',              'book and article titles, headings (every word)'],
                ['Sentence case',  'The quick brown fox',              'general prose, UI labels, modern headline styles'],
                ['camelCase',      'theQuickBrownFox',                 'variables and functions in JavaScript, Java, Swift'],
                ['PascalCase',     'TheQuickBrownFox',                 'class names and React components in most languages'],
                ['snake_case',     'the_quick_brown_fox',              'Python variables, database column names, Linux files'],
                ['kebab-case',     'the-quick-brown-fox',              'CSS class names, HTML attributes, URL slugs'],
                ['CONSTANT_CASE',  'THE_QUICK_BROWN_FOX',              'constants and environment variables'],
              ].map(([fmt, output, use]) => (
                <p key={fmt} className="text-sm text-muted-foreground leading-relaxed">
                  <span className="font-mono font-semibold text-foreground">{fmt}:</span>{' '}
                  <span className="font-mono">{output}</span>
                  <span className="font-sans"> — {use}</span>
                </p>
              ))}
            </div>
          </div>
        </div>

        {/* Section 2 — How the Conversion Works */}
        <div className="pt-8 mt-8 border-t border-border">
          <h2 className="text-base font-semibold text-foreground mb-3">How the Conversion Works</h2>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              All programming case formats — camelCase, PascalCase, kebab-case, snake_case,
              CONSTANT_CASE, dot.case — first split the input into individual words. The splitter
              recognises three kinds of boundaries: whitespace, underscores and hyphens, and
              camelCase transitions (a lowercase letter immediately followed by an uppercase
              letter). This means the converter works in any direction: paste camelCase code
              and get back snake_case, or paste a sentence and get camelCase — the word
              boundaries are detected regardless of the starting format.
            </p>
          </div>
        </div>

        {/* Section 3 — When to Use */}
        <div className="pt-8 mt-8 border-t border-border">
          <h2 className="text-base font-semibold text-foreground mb-3">When to Use This Converter</h2>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Use the camelCase or PascalCase outputs when copying variable or class names into
              code. Use snake_case when naming database columns or Python functions, where
              underscores are the standard. Use kebab-case for CSS class names, HTML IDs, and
              URL-friendly slugs — hyphens are readable, valid in those contexts, and handled
              correctly by search engines. Use Sentence case for UI labels, button text, and
              form field copy — most modern design systems (Google Material, Apple HIG) specify
              Sentence case for interface text rather than Title Case.
            </p>
          </div>
        </div>

        {/* Section 4 — FAQ */}
        <div className="pt-8 mt-8 border-t border-border">
          <h2 className="text-base font-semibold text-foreground mb-3">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {[
              {
                q: "What's the difference between camelCase and PascalCase?",
                a: "Both join words without spaces or punctuation, but they differ in the first word: camelCase starts with a lowercase letter (userProfileData), while PascalCase capitalises the first letter of every word including the first (UserProfileData). In most languages, camelCase is used for variables and functions; PascalCase is reserved for class names, types, and components. React component names must be PascalCase — a component named userCard instead of UserCard will not render correctly in JSX.",
              },
              {
                q: 'When should I use Title Case vs. Sentence case?',
                a: "Title Case capitalises the first letter of every word and is traditional in book and article titles, especially in American English publishing (AP and Chicago style). Sentence case capitalises only the first word and is increasingly preferred in digital products and design systems — Google, Apple, and Microsoft all use Sentence case for UI text. For blog posts and marketing copy, the right choice depends on your house style; for UI labels and buttons, Sentence case is the modern standard.",
              },
              {
                q: 'Does Title Case capitalise every word?',
                a: "The 'capitalise every word' rule is the simple version. Proper typographic Title Case skips short function words: articles (a, an, the), coordinating conjunctions (and, but, or, nor), and short prepositions (in, on, at, to, of, by, as). The first and last words of the title are always capitalised regardless of their type. So 'The Catcher in the Rye' is correct; 'The Catcher In The Rye' is over-capitalised. This tool applies the simpler every-word rule for predictability.",
              },
              {
                q: 'Why do programming languages use snake_case or kebab-case instead of spaces?',
                a: "Spaces are not valid in identifiers in any mainstream programming language — a variable named 'user name' would be parsed as two separate tokens and cause a syntax error. Developers needed a way to write multi-word names as a single token. Two conventions emerged: underscores (snake_case, used in Python, C, Ruby, and SQL) and capitalised word boundaries (camelCase and PascalCase, used in Java, JavaScript, and C#). Kebab-case uses hyphens and is standard in CSS and URLs, where hyphens are valid and improve readability.",
              },
            ].map((item) => (
              <div key={item.q} className="border border-border rounded-md p-4">
                <p className="text-sm font-semibold text-foreground mb-1.5">{item.q}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
