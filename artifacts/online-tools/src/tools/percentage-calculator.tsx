import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Percent, ArrowRight, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { ToolEmptyState } from '@/components/tool-empty-state';
import { ToolResultBadge } from '@/components/tool-result-badge';

export default function PercentageCalculator() {
  const [val1, setVal1] = useState('');
  const [val2, setVal2] = useState('');
  
  const [val3, setVal3] = useState('');
  const [val4, setVal4] = useState('');
  
  const [val5, setVal5] = useState('');
  const [val6, setVal6] = useState('');

  const parseNum = (str: string) => {
    const num = parseFloat(str);
    return isNaN(num) ? null : num;
  };

  const formatResult = (num: number) => {
    return Number.isInteger(num) ? num.toString() : num.toFixed(2).replace(/\.?0+$/, '');
  };

  const renderFormula = (text: string) => (
    <div className="text-sm font-mono text-muted-foreground bg-muted px-3 py-2 rounded-md max-w-full overflow-x-auto whitespace-nowrap">
      {text}
    </div>
  );

  return (
    <>
    <Tabs defaultValue="what-is" className="w-full">
      <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 mb-8 h-auto p-1">
        <TabsTrigger value="what-is" className="py-2.5 text-sm md:text-base">What is X% of Y?</TabsTrigger>
        <TabsTrigger value="is-what" className="py-2.5 text-sm md:text-base">X is what % of Y?</TabsTrigger>
        <TabsTrigger value="change" className="py-2.5 text-sm md:text-base">% Change (X to Y)</TabsTrigger>
      </TabsList>

      {/* Mode 1: What is X% of Y? */}
      <TabsContent value="what-is" className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
        <div className="flex flex-col md:flex-row items-center gap-4 text-lg md:text-xl font-medium">
          <span>What is</span>
          <div className="relative w-full md:w-32">
            <Input 
              type="number" 
              value={val1} 
              onChange={(e) => setVal1(e.target.value)} 
              placeholder="20"
              className="text-lg md:text-xl h-12 pr-8 font-mono"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"><Percent className="w-4 h-4"/></div>
          </div>
          <span>of</span>
          <div className="w-full md:w-48">
            <Input 
              type="number" 
              value={val2} 
              onChange={(e) => setVal2(e.target.value)} 
              placeholder="150"
              className="text-lg md:text-xl h-12 font-mono"
            />
          </div>
          <span className="hidden md:inline">?</span>
        </div>

        {val1 && val2 && parseNum(val1) !== null && parseNum(val2) !== null ? (() => {
          const x = parseNum(val1)!;
          const y = parseNum(val2)!;
          const result = (x / 100) * y;
          return (
            <Card className="relative p-6 bg-primary/5 border-primary/20 mt-8 flex flex-col items-center">
              <ToolResultBadge />
              <span className="text-muted-foreground mb-2 font-medium">Result</span>
              <div className="text-4xl md:text-5xl font-bold font-display text-foreground mb-4">
                {formatResult(result)}
              </div>
              {renderFormula(`(${x} ÷ 100) × ${y} = ${formatResult(result)}`)}
            </Card>
          );
        })() : (
          <ToolEmptyState icon={Percent} message="Enter both numbers to see the result" className="mt-8" />
        )}
      </TabsContent>

      {/* Mode 2: X is what % of Y? */}
      <TabsContent value="is-what" className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
        <div className="flex flex-col md:flex-row items-center gap-4 text-lg md:text-xl font-medium">
          <div className="w-full md:w-48">
            <Input 
              type="number" 
              value={val3} 
              onChange={(e) => setVal3(e.target.value)} 
              placeholder="30"
              className="text-lg md:text-xl h-12 font-mono"
            />
          </div>
          <span>is what % of</span>
          <div className="w-full md:w-48">
            <Input 
              type="number" 
              value={val4} 
              onChange={(e) => setVal4(e.target.value)} 
              placeholder="150"
              className="text-lg md:text-xl h-12 font-mono"
            />
          </div>
          <span className="hidden md:inline">?</span>
        </div>

        {val3 && val4 && parseNum(val3) !== null && parseNum(val4) !== null ? (() => {
          const x = parseNum(val3)!;
          const y = parseNum(val4)!;
          if (y === 0) return <div className="text-destructive mt-8 text-center font-medium">Cannot divide by zero</div>;
          
          const result = (x / y) * 100;
          return (
            <Card className="relative p-6 bg-primary/5 border-primary/20 mt-8 flex flex-col items-center">
              <ToolResultBadge />
              <span className="text-muted-foreground mb-2 font-medium">Result</span>
              <div className="text-4xl md:text-5xl font-bold font-display text-foreground mb-4 flex items-center gap-1">
                {formatResult(result)}<Percent className="w-8 h-8 text-muted-foreground"/>
              </div>
              {renderFormula(`(${x} ÷ ${y}) × 100 = ${formatResult(result)}%`)}
            </Card>
          );
        })() : (
          <ToolEmptyState icon={Percent} message="Enter both numbers to see the result" className="mt-8" />
        )}
      </TabsContent>

      {/* Mode 3: Percentage Change */}
      <TabsContent value="change" className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
        <div className="flex flex-col md:flex-row items-center gap-4 text-lg md:text-xl font-medium">
          <span>Change from</span>
          <div className="w-full md:w-48">
            <Input 
              type="number" 
              value={val5} 
              onChange={(e) => setVal5(e.target.value)} 
              placeholder="100"
              className="text-lg md:text-xl h-12 font-mono"
            />
          </div>
          <span>to</span>
          <div className="w-full md:w-48">
            <Input 
              type="number" 
              value={val6} 
              onChange={(e) => setVal6(e.target.value)} 
              placeholder="150"
              className="text-lg md:text-xl h-12 font-mono"
            />
          </div>
        </div>

        {val5 && val6 && parseNum(val5) !== null && parseNum(val6) !== null ? (() => {
          const from = parseNum(val5)!;
          const to = parseNum(val6)!;
          if (from === 0) return <div className="text-destructive mt-8 text-center font-medium">Starting value cannot be zero</div>;
          
          const change = to - from;
          const result = (change / Math.abs(from)) * 100;
          const isIncrease = result > 0;
          const isDecrease = result < 0;
          
          return (
            <Card className={`relative p-6 border mt-8 flex flex-col items-center ${isIncrease ? 'bg-emerald-500/10 border-emerald-500/30' : isDecrease ? 'bg-rose-500/10 border-rose-500/30' : 'bg-primary/5 border-primary/20'}`}>
              <ToolResultBadge />
              <span className="text-muted-foreground mb-2 font-medium">
                {isIncrease ? 'Percentage Increase' : isDecrease ? 'Percentage Decrease' : 'No Change'}
              </span>
              <div className={`text-4xl md:text-5xl font-bold font-display mb-4 flex items-center gap-2 ${isIncrease ? 'text-emerald-600 dark:text-emerald-400' : isDecrease ? 'text-rose-600 dark:text-rose-400' : 'text-foreground'}`}>
                {isIncrease && <ArrowUpRight className="w-8 h-8" />}
                {isDecrease && <ArrowDownRight className="w-8 h-8" />}
                {!isIncrease && !isDecrease && <ArrowRight className="w-8 h-8 text-muted-foreground" />}
                {formatResult(Math.abs(result))}<Percent className="w-8 h-8 opacity-50"/>
              </div>
              {renderFormula(`((${to} - ${from}) ÷ |${from}|) × 100 = ${formatResult(result)}%`)}
            </Card>
          );
        })() : (
          <ToolEmptyState icon={Percent} message="Enter both numbers to see the change" className="mt-8" />
        )}
      </TabsContent>
    </Tabs>

    {/* ── Educational content ───────────────────────────────────────── */}
    <div className="pt-8 mt-8 border-t border-border space-y-0">

      {/* Section 1 — How Percentage Calculations Work */}
      <div>
        <h2 className="text-base font-semibold text-foreground mb-3">How Percentage Calculations Work</h2>
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground leading-relaxed">
            "Percent" means "per hundred" — a percentage is a ratio expressed as a fraction of 100.
            All three modes in this calculator are variations on the same underlying relationship:
            Part = (Percent ÷ 100) × Whole.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The first variation finds the part: 15% of 80 is (15 ÷ 100) × 80 = 12. The second
            finds the percentage itself: 45 is what percent of 180? → (45 ÷ 180) × 100 = 25%.
            The third measures change: going from 240 to 300 is an increase of 60, which is
            (60 ÷ 240) × 100 = 25% growth. Going from 120 to 90 is a decrease of 30, which
            is (30 ÷ 120) × 100 = 25% — expressed as −25%.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            All three formulas are rearrangements of the same relationship: if you know any two
            of Part, Whole, and Percent, you can always find the third.
          </p>
        </div>
      </div>

      {/* Section 2 — The Formulas */}
      <div className="pt-8 mt-8 border-t border-border">
        <h2 className="text-base font-semibold text-foreground mb-3">The Formulas</h2>
        <div className="space-y-3">
          <div className="border border-border rounded-md bg-secondary p-4 space-y-2">
            {[
              ['Finding a percentage of a number', 'Result = (Percent ÷ 100) × Number'],
              ['Finding what percentage X is of Y', 'Percent = (Part ÷ Whole) × 100'],
              ['Percentage change between two values', 'Change % = ((New − Old) ÷ |Old|) × 100'],
            ].map(([label, formula]) => (
              <p key={label} className="text-sm text-muted-foreground leading-relaxed">
                <span className="font-semibold text-foreground">{label}: </span>
                <span className="font-mono">{formula}</span>
              </p>
            ))}
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The absolute value in formula 3 ensures the denominator is always positive, so the
            sign of the result correctly reflects direction: positive for an increase, negative
            for a decrease.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            To reverse a percentage change and find the original value, rearrange formula 1:
            Original = Result ÷ (1 − rate) for a discount, or Result ÷ (1 + rate) for a
            mark-up. Example: if a price after a 20% discount is $64, the original was
            64 ÷ 0.8 = <span className="font-semibold text-foreground">$80</span>.
          </p>
        </div>
      </div>

      {/* Section 3 — When to Use */}
      <div className="pt-8 mt-8 border-t border-border">
        <h2 className="text-base font-semibold text-foreground mb-3">When to Use This Calculator</h2>
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Use "What is X% of Y?" to calculate a tip, a tax amount, or a discount's dollar
            value. Use "X is what % of Y?" to express a test score as a percentage, find a
            commission rate, or calculate what share of a budget one line item represents.
            Use "% Change" to determine whether a salary increase, a stock price move, or a
            year-over-year revenue figure represents growth or decline — and by exactly how much.
          </p>
        </div>
      </div>

      {/* Section 4 — FAQ */}
      <div className="pt-8 mt-8 border-t border-border">
        <h2 className="text-base font-semibold text-foreground mb-3">
          Frequently Asked Questions
        </h2>
        <div className="space-y-3">
          {[
            {
              q: 'How do I calculate a percentage increase from one number to another?',
              a: 'Subtract the original from the new number to get the change, divide that by the original, then multiply by 100. Example: going from 240 to 300 — change is 60, divided by 240 gives 0.25, multiplied by 100 gives 25%. Use the "% Change" tab and enter both numbers to get this result instantly, with the formula shown.',
            },
            {
              q: 'What is the difference between percentage points and percent?',
              a: 'A percentage point is an absolute difference between two percentages; a percent change is a relative one. If an interest rate rises from 5% to 8%, it has increased by 3 percentage points — but it has risen by 60% relative to where it started, because (8 − 5) ÷ 5 × 100 = 60%. Confusing the two is a common error in financial and political reporting.',
            },
            {
              q: 'How do I find the original number before a percentage change was applied?',
              a: 'Divide the final value by (1 − rate) for a percentage decrease, or by (1 + rate) for a percentage increase, where the rate is expressed as a decimal. Example: a product costs $64 after a 20% discount, so the original price was 64 ÷ (1 − 0.20) = 64 ÷ 0.80 = $80. This is sometimes called a reverse percentage calculation.',
            },
            {
              q: 'How do I calculate a percentage discount?',
              a: 'Multiply the original price by the discount rate as a decimal to find the saving, then subtract from the original for the final price. A 30% discount on $150 saves 0.30 × 150 = $45, giving a final price of $105. Alternatively, multiply directly by (1 − rate): $150 × 0.70 = $105. Use the "What is X% of Y?" tab — enter the discount rate and the original price to get the exact saving in one step.',
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
    </>
  );
}
