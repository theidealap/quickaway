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

      {/* ── Educational content ───────────────────────────────────────── */}
      <div className="pt-8 mt-8 border-t border-border space-y-0">

        {/* Section 1 — How BMI Works */}
        <div>
          <h2 className="text-base font-semibold text-foreground mb-3">How BMI Works</h2>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              BMI (Body Mass Index) is a number derived from your height and weight that places
              you within one of four standard weight categories. It was developed in the 1800s as
              a population-level screening tool, not a clinical diagnosis — but it remains the
              most widely used first-pass indicator of weight status because it requires only
              two measurements and no specialist equipment.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The calculation divides your weight by the square of your height. A person who is
              175 cm tall and weighs 70 kg has a BMI of 22.9 — solidly in the Normal weight
              range. Adding 20 kg to that same height raises BMI to 29.4, placing them in the
              Overweight band. The four WHO-defined categories are: Underweight (below 18.5),
              Normal weight (18.5–24.9), Overweight (25–29.9), and Obese (30 and above).
              These thresholds apply to adults of all sexes.
            </p>
          </div>
        </div>

        {/* Section 2 — The Formula */}
        <div className="pt-8 mt-8 border-t border-border">
          <h2 className="text-base font-semibold text-foreground mb-3">The BMI Formula</h2>
          <div className="space-y-3">
            <div className="border border-border rounded-md bg-secondary p-4 space-y-2">
              <p className="text-sm text-muted-foreground leading-relaxed">
                <span className="font-semibold text-foreground">Metric: </span>
                <span className="font-mono">BMI = weight (kg) ÷ height (m)²</span>
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                <span className="font-semibold text-foreground">Imperial: </span>
                <span className="font-mono">BMI = (weight (lb) ÷ height (in)²) × 703</span>
              </p>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The multiplier 703 converts from lb/in² to the same scale as the metric formula.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              <span className="font-medium text-foreground">Worked example — imperial:</span> someone
              5 ft 10 in tall weighing 180 lb. Convert to inches: 5 × 12 + 10 = 70 in. Square it:
              70 × 70 = 4,900. Divide: 180 ÷ 4,900 = 0.03673. Multiply by 703:
              0.03673 × 703 ≈ <span className="font-semibold text-foreground">25.8</span> — Overweight.
            </p>
          </div>
        </div>

        {/* Section 3 — When to Use */}
        <div className="pt-8 mt-8 border-t border-border">
          <h2 className="text-base font-semibold text-foreground mb-3">When to Use This Calculator</h2>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              BMI is a quick, equipment-free starting point for understanding weight status —
              useful before a clinical appointment or when tracking trends over months and years.
              A consistent upward trend in BMI is a meaningful signal regardless of the
              absolute number.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              It is less reliable as a standalone measure for heavily muscled individuals, older
              adults, and people of Asian descent, where standard thresholds may overestimate or
              underestimate health risk. In those cases, waist circumference, body fat percentage,
              and clinical bloodwork fill in the gaps that BMI leaves.
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
                q: 'Is BMI accurate for athletes and muscular people?',
                a: 'BMI cannot distinguish between fat mass and lean mass — it only uses total weight and height. A 90 kg bodybuilder at 175 cm gets the same BMI of 29.4 as a sedentary person with identical measurements, despite very different body compositions. For athletes, methods like DEXA scanning or skinfold calipers give a more meaningful picture of actual body fat percentage.',
              },
              {
                q: 'What is a healthy BMI range?',
                a: 'World Health Organization guidelines classify 18.5 to 24.9 as Normal weight for adults — the range associated with the lowest risk of weight-related health conditions in population studies. Some research suggests the optimal range sits slightly lower (18.5–22.9) for adults of Asian descent, where health risks tied to excess body fat can appear at lower BMI values.',
              },
              {
                q: 'Does BMI differ by age or sex?',
                a: 'For adults aged 20 and older, the same four BMI thresholds apply regardless of age or sex. Children and teenagers use sex-specific, age-adjusted BMI-for-age percentile charts instead, because body composition changes substantially during development. For adults, BMI does not capture sex differences in fat distribution — a woman and a man with identical BMIs can carry meaningfully different amounts of body fat.',
              },
              {
                q: "What are BMI's key limitations?",
                a: 'BMI does not capture where fat is stored. Abdominal visceral fat carries a higher cardiovascular risk than fat around the hips and thighs, yet two people with the same BMI can have very different distributions. It also ignores bone density, hydration, and muscle mass. The WHO describes BMI as a population-level screening tool — at the individual level it should always be considered alongside other clinical measurements.',
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
