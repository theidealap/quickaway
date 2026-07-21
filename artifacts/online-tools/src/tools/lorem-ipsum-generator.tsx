import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Copy, RefreshCw, AlignLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ToolResultBadge } from '@/components/tool-result-badge';
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
      <Card className="relative p-6 bg-primary/5 border-primary/20">
        <ToolResultBadge />
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
    </div>
  );
}
