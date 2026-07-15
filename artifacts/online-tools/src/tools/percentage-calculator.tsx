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
    <div className="text-sm font-mono text-muted-foreground bg-muted p-2 rounded-md inline-block">
      {text}
    </div>
  );

  return (
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
  );
}
