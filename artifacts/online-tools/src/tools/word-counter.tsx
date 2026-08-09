import { useState, useMemo } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Trash2, AlignLeft, Type, Hash, Quote } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function WordCounter() {
  const [text, setText] = useState('');
  const { toast } = useToast();

  const stats = useMemo(() => {
    const trimmed = text.trim();
    
    // Words
    const words = trimmed ? trimmed.split(/\s+/).length : 0;
    
    // Characters
    const charsTotal = text.length;
    const charsNoSpaces = text.replace(/\s/g, '').length;
    
    // Sentences (basic approximation splitting on . ! ?)
    const sentences = trimmed ? trimmed.split(/[.!?]+(?=\s|$)/).filter(s => s.trim().length > 0).length : 0;
    
    // Paragraphs
    const paragraphs = trimmed ? trimmed.split(/\n+/).filter(p => p.trim().length > 0).length : 0;
    
    // Reading time (approx 200 words per minute)
    const readingTimeMin = Math.max(1, Math.round(words / 200));

    return { words, charsTotal, charsNoSpaces, sentences, paragraphs, readingTimeMin };
  }, [text]);

  const handleCopy = () => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "The text has been copied to your clipboard.",
      duration: 2000,
    });
  };

  const handleClear = () => {
    setText('');
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Card className="p-3 md:p-4 flex flex-col items-center justify-center text-center bg-card min-w-0 overflow-hidden">
          <span className="text-xs md:text-sm font-medium text-muted-foreground mb-1 flex items-center gap-1.5"><Type className="w-3.5 h-3.5" /> Words</span>
          <span className="text-2xl md:text-4xl font-bold font-display text-primary tabular-nums">{stats.words.toLocaleString()}</span>
        </Card>
        
        <Card className="p-3 md:p-4 flex flex-col items-center justify-center text-center bg-card min-w-0 overflow-hidden">
          <span className="text-xs md:text-sm font-medium text-muted-foreground mb-1 flex items-center gap-1.5"><Hash className="w-3.5 h-3.5" /> Characters</span>
          <span className="text-2xl md:text-4xl font-bold font-display text-foreground tabular-nums">{stats.charsTotal.toLocaleString()}</span>
        </Card>

        <Card className="p-3 md:p-4 flex flex-col items-center justify-center text-center bg-card min-w-0 overflow-hidden">
          <span className="text-xs md:text-sm font-medium text-muted-foreground mb-1 flex items-center gap-1.5"><Quote className="w-3.5 h-3.5" /> Sentences</span>
          <span className="text-2xl md:text-4xl font-bold font-display text-foreground tabular-nums">{stats.sentences.toLocaleString()}</span>
        </Card>

        <Card className="p-3 md:p-4 flex flex-col items-center justify-center text-center bg-card min-w-0 overflow-hidden">
          <span className="text-xs md:text-sm font-medium text-muted-foreground mb-1 flex items-center gap-1.5"><AlignLeft className="w-3.5 h-3.5" /> Paragraphs</span>
          <span className="text-2xl md:text-4xl font-bold font-display text-foreground tabular-nums">{stats.paragraphs.toLocaleString()}</span>
        </Card>
      </div>

      <div className="relative">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Start typing, or paste your text here..."
          className="min-h-[300px] text-base resize-y p-4 md:p-6 rounded-xl border-input focus-visible:ring-primary font-sans leading-relaxed"
          autoFocus
        />
        
        <div className="absolute bottom-4 right-4 flex gap-2">
          {text.length > 0 && (
            <>
              <Button size="sm" variant="secondary" onClick={handleCopy} className="shadow-sm">
                <Copy className="w-4 h-4 mr-2" /> Copy
              </Button>
              <Button size="sm" variant="destructive" onClick={handleClear} className="shadow-sm opacity-80 hover:opacity-100">
                <Trash2 className="w-4 h-4 mr-2" /> Clear
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground justify-between">
        <div className="flex gap-4">
          <span>Characters (no spaces): <strong className="text-foreground">{stats.charsNoSpaces.toLocaleString()}</strong></span>
        </div>
        <div>
          Est. reading time: <strong className="text-foreground">~{stats.readingTimeMin} min</strong>
        </div>
      </div>

      {/* ── Educational content ───────────────────────────────────────── */}
      <div className="pt-8 mt-8 border-t border-border space-y-0">

        {/* Section 1 — How Word Count Is Determined */}
        <div>
          <h2 className="text-base font-semibold text-foreground mb-3">How Word Count Is Determined</h2>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              The word counter splits your text on whitespace — spaces, tabs, and newlines — and
              counts the resulting non-empty segments. Take the sentence{' '}
              <span className="font-mono text-foreground">"The quick brown fox jumps over the lazy dog."</span>{' '}
              Splitting on whitespace gives exactly 9 tokens (The, quick, brown, fox, jumps, over,
              the, lazy, dog.), so the word count is{' '}
              <span className="font-semibold text-foreground">9</span>, total characters are{' '}
              <span className="font-semibold text-foreground">44</span>, and characters without
              spaces are <span className="font-semibold text-foreground">36</span>.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Small implementation choices cause counters to disagree. Some tools count
              "it&apos;s" as one word, others split on apostrophes and count two. Some strip
              punctuation before counting; others leave it attached to the final word. Microsoft
              Word counts hyphenated compounds like "well-known" as one word; some online tools
              split on hyphens and count two. This counter treats any continuous non-whitespace
              run as a single word, which matches the most common word-processor behavior.
            </p>
          </div>
        </div>

        {/* Section 2 — How the Stats Are Calculated */}
        <div className="pt-8 mt-8 border-t border-border">
          <h2 className="text-base font-semibold text-foreground mb-3">How the Stats Are Calculated</h2>
          <div className="space-y-3">
            <div className="border border-border rounded-md bg-secondary p-4 space-y-2">
              {[
                ['Words', 'Trim whitespace, split on any whitespace run, count non-empty segments'],
                ['Characters (total)', 'text.length — every character including spaces and newlines'],
                ['Characters (no spaces)', 'Strip all whitespace, then count what remains'],
                ['Sentences', 'Split on . ! or ? followed by whitespace or end of string'],
                ['Reading time', 'Word count ÷ 200 words per minute, rounded up to 1 min minimum'],
              ].map(([label, desc]) => (
                <p key={label} className="text-sm text-muted-foreground leading-relaxed">
                  <span className="font-semibold text-foreground">{label}:</span> {desc}
                </p>
              ))}
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              A 500-word passage takes approximately{' '}
              <span className="font-semibold text-foreground">3 minutes</span> to read at 200 wpm;
              a 1,500-word blog post takes approximately{' '}
              <span className="font-semibold text-foreground">8 minutes</span>.
            </p>
          </div>
        </div>

        {/* Section 3 — When to Use */}
        <div className="pt-8 mt-8 border-t border-border">
          <h2 className="text-base font-semibold text-foreground mb-3">When to Use This Counter</h2>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Use the character count (no spaces) when a platform imposes a no-spaces limit —
              some form fields and APIs count this way. Use total characters for
              Twitter/X (280 characters), SMS (160 characters per segment), or meta descriptions
              (around 155 characters). The reading time estimate is particularly useful when
              preparing spoken content — presentations, podcast scripts, voiceovers — where
              delivery pace matters as much as word count. At 130–150 words per minute for
              speech (slower than the 200 wpm reading baseline), a 500-word script runs
              about 3–4 minutes spoken aloud.
            </p>
          </div>
        </div>

        {/* Section 4 — FAQ */}
        <div className="pt-8 mt-8 border-t border-border">
          <h2 className="text-base font-semibold text-foreground mb-3">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {[
              {
                q: 'Why do different word counters give different counts?',
                a: "Each tool decides how to handle edge cases: hyphenated words, contractions, em dashes used as joiners, repeated whitespace, leading/trailing spaces, and punctuation attached to words. There is no universal standard. For most text the differences are small — usually 1–3 words — but they compound on longer documents. If a specific count matters for a submission, check which tool the target platform uses to count.",
              },
              {
                q: 'Does a hyphenated word count as one word or two?',
                a: 'It depends on the tool. This counter treats the entire hyphenated string as one word because it splits on whitespace only — "well-known" contains no spaces, so it counts as 1. Microsoft Word also counts hyphenated compounds as one word. Some other tools split on hyphens and count each part separately, making "well-known" count as 2. The distinction usually matters only when you are very close to a hard word limit.',
              },
              {
                q: "What's a typical word count for different types of writing?",
                a: "A tweet is under 280 characters (roughly 40–50 words). A short-form blog post runs 500–800 words; a standard long-form article is 1,500–2,500 words. A college application essay is typically 500–650 words. A short story is usually 1,000–7,500 words; a novel starts at around 40,000 words. For academic work, a standard double-spaced page of 12pt text holds approximately 250–300 words.",
              },
              {
                q: 'How is reading time estimated from word count?',
                a: "Reading time is word count divided by an assumed reading speed in words per minute (wpm). The typical adult silent reading speed for non-fiction prose is 200–250 wpm; this tool uses 200 wpm for a conservative estimate. Actual speed varies with text complexity and the reader's purpose — skimming is faster, careful technical reading is slower. For spoken audio or video scripts, use 130–150 wpm as the baseline instead of 200.",
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
