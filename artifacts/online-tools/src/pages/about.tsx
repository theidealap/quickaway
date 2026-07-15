import { SEO } from '@/components/seo';
import { Hammer, Zap, Shield, Sparkles } from 'lucide-react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';

export default function About() {
  return (
    <>
      <SEO
        title="About ToolBox - Free, Fast Online Utilities"
        description="ToolBox is a growing collection of free, ad-free, browser-based tools built to help you solve everyday problems in seconds."
      />

      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-6">
            <Hammer className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">Everyday problems deserve instant answers.</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            ToolBox is a growing hub of free online tools built to solve small, everyday tasks quickly — without the clutter that usually comes with them.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <div className="bg-card border rounded-2xl p-8 shadow-sm">
            <Zap className="w-8 h-8 text-amber-500 mb-4" />
            <h3 className="text-xl font-semibold mb-3">Lightning Fast</h3>
            <p className="text-muted-foreground">Every tool runs entirely in your browser. No server round-trips, no loading spinners — just instant results as you type.</p>
          </div>
          <div className="bg-card border rounded-2xl p-8 shadow-sm">
            <Shield className="w-8 h-8 text-emerald-500 mb-4" />
            <h3 className="text-xl font-semibold mb-3">Privacy First</h3>
            <p className="text-muted-foreground">Your data never leaves your device. We don't track what you calculate, count, or convert — it stays between you and your browser.</p>
          </div>
          <div className="bg-card border rounded-2xl p-8 shadow-sm">
            <Sparkles className="w-8 h-8 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-3">Always Growing</h3>
            <p className="text-muted-foreground">We're steadily adding new tools across categories, from quick calculators to everyday text utilities — all built with the same standard of quality.</p>
          </div>
        </div>

        <div className="prose prose-lg dark:prose-invert mx-auto">
          <h2>Why ToolBox Exists</h2>
          <p>
            Small tasks shouldn't take five minutes. Checking a word count, calculating a percentage, figuring out an exact age, or converting a unit are the kinds of things people need to do dozens of times a year — yet most tools built for these jobs are buried under ads, pop-ups, and pages that take longer to load than the task itself takes to do by hand.
          </p>
          <p>
            <strong>ToolBox</strong> takes a different approach. We're building a reliable, no-nonsense library of utilities that just work: clean interfaces, instant results, and nothing standing between you and the answer you came for.
          </p>

          <h2>A Toolkit That Keeps Expanding</h2>
          <p>
            ToolBox isn't a fixed set of calculators — it's a foundation we're actively building on. Every tool we add follows the same principles: fast, private, and genuinely useful for real everyday situations, whether that's for students, professionals, or anyone who just needs a quick, trustworthy answer.
          </p>

          <h2>What's Next?</h2>
          <p>
            We're continuously expanding our catalog of tools based on what people actually need. Have an idea for a tool you use often but can never find a good version of? Head over to our contact page and let us know — your suggestions directly shape what we build next.
          </p>
        </div>

        <div className="mt-16 text-center border-t pt-16">
          <h2 className="text-2xl font-bold mb-6">Ready to get things done?</h2>
          <Link href="/">
            <Button size="lg" className="rounded-full px-8">
              Explore All Tools
            </Button>
          </Link>
        </div>
      </div>
    </>
  );
}
