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
    </div>
  );
}
