import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, AlertCircle, Ruler, Weight } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ToolEmptyState } from '@/components/tool-empty-state';
import { ToolResultBadge } from '@/components/tool-result-badge';

type Unit = 'metric' | 'imperial';

interface Category {
  label: string;
  className: string;
}

function getCategory(bmi: number): Category {
  if (bmi < 18.5) {
    return { label: 'Underweight', className: 'text-sky-600 dark:text-sky-400' };
  }
  if (bmi < 25) {
    return { label: 'Normal weight', className: 'text-emerald-600 dark:text-emerald-400' };
  }
  if (bmi < 30) {
    return { label: 'Overweight', className: 'text-amber-600 dark:text-amber-400' };
  }
  return { label: 'Obese', className: 'text-rose-600 dark:text-rose-400' };
}

function getCategoryCardClass(bmi: number): string {
  if (bmi < 18.5) return 'bg-sky-500/10 border-sky-500/30';
  if (bmi < 25) return 'bg-emerald-500/10 border-emerald-500/30';
  if (bmi < 30) return 'bg-amber-500/10 border-amber-500/30';
  return 'bg-rose-500/10 border-rose-500/30';
}

export default function BmiCalculator() {
  const [unit, setUnit] = useState<Unit>('metric');

  // Metric inputs
  const [heightCm, setHeightCm] = useState('');
  const [weightKg, setWeightKg] = useState('');

  // Imperial inputs
  const [heightFt, setHeightFt] = useState('');
  const [heightIn, setHeightIn] = useState('');
  const [weightLb, setWeightLb] = useState('');

  const parseNum = (str: string) => {
    const num = parseFloat(str);
    return isNaN(num) || num <= 0 ? null : num;
  };

  const result = useMemo(() => {
    if (unit === 'metric') {
      const h = parseNum(heightCm);
      const w = parseNum(weightKg);
      if (!h || !w) return null;
      const heightM = h / 100;
      const bmi = w / (heightM * heightM);
      return { bmi };
    }

    const ft = parseFloat(heightFt) || 0;
    const inch = parseFloat(heightIn) || 0;
    const w = parseNum(weightLb);
    const totalInches = ft * 12 + inch;
    if (totalInches <= 0 || !w) return null;
    const bmi = (w / (totalInches * totalInches)) * 703;
    return { bmi };
  }, [unit, heightCm, weightKg, heightFt, heightIn, weightLb]);

  const handleReset = () => {
    setHeightCm('');
    setWeightKg('');
    setHeightFt('');
    setHeightIn('');
    setWeightLb('');
  };

  const hasAnyInput =
    heightCm || weightKg || heightFt || heightIn || weightLb;

  return (
    <div className="space-y-6">
      <Tabs value={unit} onValueChange={(v) => setUnit(v as Unit)} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6 h-auto p-1">
          <TabsTrigger value="metric" className="py-2.5 text-sm md:text-base">
            Metric (cm / kg)
          </TabsTrigger>
          <TabsTrigger value="imperial" className="py-2.5 text-sm md:text-base">
            Imperial (ft, in / lb)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="metric" className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="heightCm">Height (cm)</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                  <Ruler className="w-4 h-4" />
                </div>
                <Input
                  id="heightCm"
                  type="number"
                  inputMode="decimal"
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value)}
                  placeholder="170"
                  className="pl-10 h-12 font-mono"
                  min={0}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="weightKg">Weight (kg)</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                  <Weight className="w-4 h-4" />
                </div>
                <Input
                  id="weightKg"
                  type="number"
                  inputMode="decimal"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  placeholder="65"
                  className="pl-10 h-12 font-mono"
                  min={0}
                />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="imperial" className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="heightFt">Height (ft)</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                  <Ruler className="w-4 h-4" />
                </div>
                <Input
                  id="heightFt"
                  type="number"
                  inputMode="decimal"
                  value={heightFt}
                  onChange={(e) => setHeightFt(e.target.value)}
                  placeholder="5"
                  className="pl-10 h-12 font-mono"
                  min={0}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="heightIn">Height (in)</Label>
              <Input
                id="heightIn"
                type="number"
                inputMode="decimal"
                value={heightIn}
                onChange={(e) => setHeightIn(e.target.value)}
                placeholder="7"
                className="h-12 font-mono"
                min={0}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weightLb">Weight (lb)</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                  <Weight className="w-4 h-4" />
                </div>
                <Input
                  id="weightLb"
                  type="number"
                  inputMode="decimal"
                  value={weightLb}
                  onChange={(e) => setWeightLb(e.target.value)}
                  placeholder="145"
                  className="pl-10 h-12 font-mono"
                  min={0}
                />
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="pt-2">
        {result === null && hasAnyInput ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Enter valid, positive height and weight values.</AlertDescription>
          </Alert>
        ) : result ? (
          (() => {
            const category = getCategory(result.bmi);
            return (
              <Card className={`relative p-6 border text-center flex flex-col items-center py-10 ${getCategoryCardClass(result.bmi)}`}>
                <ToolResultBadge />
                <span className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                  <Activity className="w-4 h-4" /> Your BMI
                </span>
                <div className="text-4xl md:text-5xl font-bold font-display tracking-tight text-foreground mb-2">
                  {result.bmi.toFixed(1)}
                </div>
                <div className={`text-lg font-semibold ${category.className}`}>{category.label}</div>
              </Card>
            );
          })()
        ) : (
          <ToolEmptyState
            icon={Activity}
            message="Enter your height and weight to calculate BMI"
            className="h-48"
          />
        )}
      </div>

      <div className="flex justify-between items-center pt-2 flex-wrap gap-4">
        <p className="text-xs text-muted-foreground max-w-md">
          BMI is a general screening tool and does not account for muscle mass, bone density, or body composition. Consult a healthcare provider for a full assessment.
        </p>
        <Button variant="outline" onClick={handleReset} disabled={!hasAnyInput}>
          Reset
        </Button>
      </div>
    </div>
  );
}
