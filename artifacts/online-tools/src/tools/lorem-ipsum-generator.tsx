import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Copy, RefreshCw, AlignLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';

// ── Word bank ─────────────────────────────────────────────────────────────────

const WORDS = [
  'lorem','ipsum','dolor','sit','amet','consectetur','adipiscing','elit','sed','do',
  'eiusmod','tempor','incididunt','ut','labore','et','dolore','magna','aliqua','enim',
  'ad','minim','veniam','quis','nostrud','exercitation','ullamco','laboris','nisi',
  'aliquip','ex','ea','commodo','consequat','duis','aute','irure','in','reprehenderit',
  'voluptate','velit','esse','cillum','eu','fugiat','nulla','pariatur','excepteur',
  'sint','occaecat','cupidatat','non','proident','sunt','culpa','qui','officia',
  'deserunt','mollit','anim','id','est','laborum','perspiciatis','unde','omnis','iste',
  'natus','error','accusantium','doloremque','laudantium','totam','rem','aperiam',
  'eaque','ipsa','quae','ab','inventore','veritatis','architecto','beatae','vitae',
  'dicta','explicabo','nemo','ipsam','quia','voluptas','aspernatur','aut','odit','fugit',
  'magni','dolores','eos','ratione','sequi','nesciunt','neque','porro','quisquam',
  'adipisci','numquam','eius','modi','tempora','incidunt','quaerat','rerum','facilis',
  'expedita','distinctio','libero','temporibus','autem','quibusdam','officiis',
  'debitis','rerum','necessitatibus','saepe','eveniet','voluptates','repudiandae',
  'recusandae','itaque','earum','hic','tenetur','sapiente','delectus','voluntas',
  'blanditiis','praesentium','voluptatum','deleniti','atque','corrupti','quos','quas',
  'molestias','excepturi','occaecati','cupiditate','similique','mollitia','harum',
  'quidem','rerum','facilis','assumenda','repellendus','temporibus','dignissimos',
  'ducimus','blanditiis','praesentium','possimus','omnis','dolorum','asperiores',
  'repellat','accusamus','iusto','dignissimos','ducimus','similique','blanditiis',
].filter((w, i, a) => a.indexOf(w) === i); // deduplicate

const LOREM_START = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.';

function pick<T>(arr: T[]): T {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return arr[buf[0] % arr.length];
}

function sentence(wordCount: number): string {
  const ws: string[] = [];
  for (let i = 0; i < wordCount; i++) ws.push(pick(WORDS));
  ws[0] = ws[0].charAt(0).toUpperCase() + ws[0].slice(1);
  return ws.join(' ') + '.';
}

function paragraph(sentenceCount: number): string {
  const sentences: string[] = [];
  for (let i = 0; i < sentenceCount; i++) {
    const wc = 8 + (new Uint32Array(1), (() => { const b = new Uint32Array(1); crypto.getRandomValues(b); return b[0] % 10; })());
    sentences.push(sentence(wc));
  }
  return sentences.join(' ');
}

function generateParagraphs(count: number, startWithLorem: boolean): string {
  const paras: string[] = [];
  const sentPerPara = () => { const b = new Uint32Array(1); crypto.getRandomValues(b); return 4 + (b[0] % 4); };
  for (let i = 0; i < count; i++) {
    if (i === 0 && startWithLorem) {
      paras.push(LOREM_START + ' ' + paragraph(sentPerPara() - 1));
    } else {
      paras.push(paragraph(sentPerPara()));
    }
  }
  return paras.join('\n\n');
}

function generateSentences(count: number, startWithLorem: boolean): string {
  const sentences: string[] = [];
  if (startWithLorem) sentences.push(LOREM_START);
  const need = startWithLorem ? count - 1 : count;
  for (let i = 0; i < need; i++) {
    const wc = 8 + (() => { const b = new Uint32Array(1); crypto.getRandomValues(b); return b[0] % 10; })();
    sentences.push(sentence(wc));
  }
  return sentences.join(' ');
}

function generateWords(count: number, startWithLorem: boolean): string {
  const ws: string[] = [];
  if (startWithLorem) {
    const loremWords = LOREM_START.replace(/[.,]/g, '').split(' ');
    ws.push(...loremWords.slice(0, Math.min(count, loremWords.length)));
  }
  while (ws.length < count) ws.push(pick(WORDS));
  return ws.slice(0, count).join(' ');
}

// ── Component ─────────────────────────────────────────────────────────────────

type Mode = 'paragraphs' | 'sentences' | 'words';

const MODE_CONFIG: Record<Mode, { label: string; min: number; max: number; step: number; default: number }> = {
  paragraphs: { label: 'Paragraphs', min: 1, max: 10, step: 1, default: 3 },
  sentences:  { label: 'Sentences',  min: 1, max: 30, step: 1, default: 5 },
  words:      { label: 'Words',      min: 10, max: 200, step: 5, default: 50 },
};

export default function LoremIpsumGenerator() {
  const { toast } = useToast();
  const [mode, setMode] = useState<Mode>('paragraphs');
  const [count, setCount] = useState(3);
  const [startWithLorem, setStartWithLorem] = useState(true);
  const [output, setOutput] = useState(() => generateParagraphs(3, true));

  const generate = useCallback((m: Mode, c: number, lorem: boolean) => {
    if (m === 'paragraphs') setOutput(generateParagraphs(c, lorem));
    else if (m === 'sentences') setOutput(generateSentences(c, lorem));
    else setOutput(generateWords(c, lorem));
  }, []);

  const changeMode = (m: string) => {
    const newMode = m as Mode;
    const cfg = MODE_CONFIG[newMode];
    setMode(newMode);
    setCount(cfg.default);
    generate(newMode, cfg.default, startWithLorem);
  };

  const changeCount = (val: number[]) => {
    setCount(val[0]);
    generate(mode, val[0], startWithLorem);
  };

  const toggleLorem = () => {
    const next = !startWithLorem;
    setStartWithLorem(next);
    generate(mode, count, next);
  };

  const regen = () => generate(mode, count, startWithLorem);

  const copy = () => {
    navigator.clipboard.writeText(output);
    toast({ title: 'Copied to clipboard', description: 'Lorem ipsum text copied.', duration: 2000 });
  };

  const cfg = MODE_CONFIG[mode];

  return (
    <div className="space-y-6">
      {/* Mode tabs */}
      <Tabs value={mode} onValueChange={changeMode}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="paragraphs">Paragraphs</TabsTrigger>
          <TabsTrigger value="sentences">Sentences</TabsTrigger>
          <TabsTrigger value="words">Words</TabsTrigger>
        </TabsList>
        <TabsContent value={mode} className="mt-0" />
      </Tabs>

      {/* Count slider */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-base">{cfg.label}</Label>
          <span className="text-2xl font-bold font-display text-primary w-10 text-right">{count}</span>
        </div>
        <Slider
          min={cfg.min}
          max={cfg.max}
          step={cfg.step}
          value={[count]}
          onValueChange={changeCount}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{cfg.min}</span><span>{cfg.max}</span>
        </div>
      </div>

      {/* Options */}
      <div className="flex items-center justify-between p-4 rounded-xl border bg-card">
        <div>
          <p className="text-sm font-medium">Start with "Lorem ipsum…"</p>
          <p className="text-xs text-muted-foreground">Classic opening sentence</p>
        </div>
        <button
          role="switch"
          aria-checked={startWithLorem}
          onClick={toggleLorem}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
            startWithLorem ? 'bg-primary' : 'bg-input'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
              startWithLorem ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Output */}
      <Card className="p-6 bg-primary/5 border-primary/20">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <AlignLeft className="w-4 h-4" />
            <span>{output.trim().split(/\s+/).length} words</span>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button size="sm" variant="outline" onClick={regen}>
              <RefreshCw className="w-4 h-4 mr-2" /> Regenerate
            </Button>
            <Button size="sm" onClick={copy}>
              <Copy className="w-4 h-4 mr-2" /> Copy
            </Button>
          </div>
        </div>
        <div className="prose prose-sm max-w-none text-foreground text-sm leading-relaxed">
          {output.split('\n\n').map((para, i) => (
            <p key={i} className="mb-3 last:mb-0">{para}</p>
          ))}
        </div>
      </Card>

      {/* ── Educational content ───────────────────────────────────────── */}
      <div className="pt-8 mt-8 border-t border-border space-y-0">

        {/* Section 1 */}
        <div>
          <h2 className="text-base font-semibold text-foreground mb-3">What Lorem Ipsum Is</h2>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              "Lorem ipsum" is a scrambled passage of Latin that has served as the standard
              placeholder text in graphic design and publishing for over five decades. The text
              originates from <em>De Finibus Bonorum et Malorum</em>, a philosophical work by
              the Roman orator Cicero, written in 45 BC — specifically from sections 1.10.32
              and 1.10.33. In 1994, Richard McClintock, a Latin scholar at Hampden-Sydney
              College, traced the origin by searching for the unusual word "consectetur" in
              classical Latin literature.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The passage is not a direct quotation — it is scrambled, with words rearranged
              and some altered, so that it resembles Latin text visually without reading as
              coherent sentences. This is precisely what makes it useful for design: it looks
              like real text at a glance without distracting the viewer with actual meaning.
            </p>
          </div>
        </div>

        {/* Section 2 */}
        <div className="pt-8 mt-8 border-t border-border">
          <h2 className="text-base font-semibold text-foreground mb-3">How It Became the Default Placeholder</h2>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Lorem ipsum entered modern publishing via Letraset, which produced dry-transfer
              lettering sheets used for page layout in the 1960s and 1970s. Designers used these
              sheets before digital tools existed, and Letraset included Lorem ipsum as filler
              in their catalogues. When Aldus Corporation released PageMaker 1.0 in 1985 — one
              of the first desktop publishing applications — it included Lorem ipsum as built-in
              placeholder text. From there it spread to virtually every design, layout, and
              word-processing tool.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The classic opening — <em>"Lorem ipsum dolor sit amet, consectetur adipiscing
              elit…"</em> — is now universally recognised as the signal for "this is placeholder
              text." The "Start with Lorem ipsum…" toggle preserves this canonical opening line
              in every generated block.
            </p>
          </div>
        </div>

        {/* Section 3 */}
        <div className="pt-8 mt-8 border-t border-border">
          <h2 className="text-base font-semibold text-foreground mb-3">When to Use Placeholder Text</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Placeholder text fills space with visually realistic content during layout without
            drawing attention away from the structure, typography, and spacing being evaluated.
            When a layout is shown with real copy, reviewers often focus on the words rather
            than the design. Placeholder text suppresses that reaction. It is standard practice
            in wireframes, UI mockups, print proofs, website templates, and any context where
            the visual hierarchy needs to be assessed before final content is written.
          </p>
        </div>

        {/* Section 4 */}
        <div className="pt-8 mt-8 border-t border-border">
          <h2 className="text-base font-semibold text-foreground mb-3">How This Generator Works</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The generator uses a deduplicated bank of 159 words drawn from classical Lorem ipsum
            passages. When the "Start with Lorem ipsum" toggle is on, every output opens with the
            canonical 19-word sentence — <em>"Lorem ipsum dolor sit amet, consectetur adipiscing
            elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."</em> —
            verbatim. All subsequent sentences are assembled by randomly picking words from the
            bank using <code>crypto.getRandomValues()</code>, which gives cryptographic-quality
            randomness rather than a predictable repeating sequence. The text is never cycled
            from a fixed stored passage: every regeneration produces a different combination.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed mt-2">
            Each generated sentence is 8–17 words long (a base of 8 plus a random 0–9
            additional words). Each paragraph contains 4–7 sentences. A three-paragraph output
            therefore contains between 96 and 357 words depending on the random draw, which is
            why the live word counter changes on every regeneration. Beyond print and design, Lorem
            ipsum is the default placeholder in web development: WordPress themes, Joomla
            templates, and website builders ship with Lorem ipsum as sample post content, making
            it the first text most developers see when installing a new theme.
          </p>
        </div>

        {/* Section 5 */}
        <div className="pt-8 mt-8 border-t border-border">
          <h2 className="text-base font-semibold text-foreground mb-3">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {[
              {
                q: 'What does Lorem ipsum actually say?',
                a: "The Lorem ipsum passage is a scrambled excerpt from Cicero's De Finibus Bonorum et Malorum, which discusses pleasure and pain as criteria for moral action — Epicurean philosophy. The scrambled version retains the visual rhythm and character distribution of Latin prose but does not parse as grammatically correct Latin. It is more accurately described as corrupted Latin derived from real Latin rather than meaningful text.",
              },
              {
                q: 'Is Lorem ipsum actual Latin?',
                a: "It derives from real Latin but the scrambling means most of the passage is not grammatically correct classical Latin. Some words are genuine (lorem is an accusative form of 'pain'; ipsum means 'itself'), but the sentences do not parse correctly. Latin scholars describe it as garbled or corrupted Latin — which is precisely why it works as placeholder text: it reads as convincingly real to most viewers without meaning anything.",
              },
              {
                q: 'Why use placeholder text instead of real content?',
                a: "Using actual copy from a project as placeholder creates two problems. First, reviewers focus on whether the words are correct rather than whether the layout works. Second, draft content is often confidential or not yet approved, making real text inappropriate for mockups shared beyond the immediate team. Lorem ipsum is universally understood as 'placeholder' — no context or disclaimer needed.",
              },
              {
                q: 'When was Lorem ipsum first used in printing or design?',
                a: "Its use in modern publishing dates to Letraset's dry-transfer lettering sheets in the 1960s. Its digital adoption began with PageMaker 1.0 in 1985. Before the Letraset era, fragments of classical Latin text appeared in typography specimen books as early as the 16th century to demonstrate typefaces — though the specific scrambled Lorem ipsum passage in its modern form is most reliably traced to the 20th century.",
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
