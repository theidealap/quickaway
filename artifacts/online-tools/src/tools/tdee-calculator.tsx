import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Flame, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ToolEmptyState } from '@/components/tool-empty-state';
import { ToolResultBadge } from '@/components/tool-result-badge';

// ── Constants ─────────────────────────────────────────────────────────────────

const ACTIVITY_LEVELS = [
  { value: 'sedentary', label: 'Sedentary',         desc: 'Little or no exercise',               multiplier: 1.2   },
  { value: 'light',     label: 'Lightly active',    desc: 'Light exercise 1–3 days/week',         multiplier: 1.375 },
  { value: 'moderate',  label: 'Moderately active', desc: 'Moderate exercise 3–5 days/week',      multiplier: 1.55  },
  { value: 'very',      label: 'Very active',       desc: 'Hard exercise 6–7 days/week',           multiplier: 1.725 },
  { value: 'extra',     label: 'Extra active',      desc: 'Very hard exercise or physical job',   multiplier: 1.9   },
] as const;

type ActivityValue = (typeof ACTIVITY_LEVELS)[number]['value'];

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Round `n` to `dp` decimal places and strip trailing zeros.
 * Returns a string safe for use as an <input> value (no locale commas).
 */
function toField(n: number, dp = 1): string {
  return parseFloat(n.toFixed(dp)).toString();
}

// ── Types ─────────────────────────────────────────────────────────────────────

type Sex        = 'male' | 'female';
type HeightMode = 'cm' | 'ftin';
type WeightMode = 'kg' | 'lb';

type CalcResult =
  | { ok: false; error: string }
  | {
      ok:       true;
      bmr:      number;
      tdee:     number;
      mildLoss: number;
      loss:     number;
      gain:     number;
    };

// ── Toggle button shared styles ───────────────────────────────────────────────

function toggleClass(active: boolean, border = false): string {
  return [
    'px-3 h-12 text-sm font-medium transition-colors',
    border ? 'border-l border-border' : '',
    active
      ? 'bg-[hsl(221,39%,11%)] text-white'
      : 'bg-background text-muted-foreground hover:text-foreground',
  ]
    .filter(Boolean)
    .join(' ');
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function TdeeCalculator() {
  const [sex, setSex]               = useState<Sex>('male');
  const [age, setAge]               = useState('');
  const [heightMode, setHeightMode] = useState<HeightMode>('cm');
  const [heightCm, setHeightCm]     = useState('');
  const [heightFt, setHeightFt]     = useState('');
  const [heightIn, setHeightIn]     = useState('');
  const [weightMode, setWeightMode] = useState<WeightMode>('kg');
  const [weightKg, setWeightKg]     = useState('');
  const [weightLb, setWeightLb]     = useState('');
  const [activity, setActivity]     = useState<ActivityValue>('sedentary');

  // ── Height unit toggle with live conversion ────────────────────────────────

  const switchHeightMode = (newMode: HeightMode) => {
    if (newMode === heightMode) return;
    if (newMode === 'ftin' && heightCm !== '') {
      const cm = parseFloat(heightCm);
      if (!isNaN(cm) && cm > 0) {
        const totalIn = cm / 2.54;
        setHeightFt(String(Math.floor(totalIn / 12)));
        setHeightIn(toField(totalIn % 12, 1));
      }
    } else if (newMode === 'cm' && heightFt !== '') {
      const ft  = parseFloat(heightFt);
      const ins = heightIn === '' ? 0 : parseFloat(heightIn);
      if (!isNaN(ft) && ft >= 0 && !isNaN(ins) && ins >= 0) {
        setHeightCm(toField((ft * 12 + ins) * 2.54, 1));
      }
    }
    setHeightMode(newMode);
  };

  // ── Weight unit toggle with live conversion ────────────────────────────────

  const switchWeightMode = (newMode: WeightMode) => {
    if (newMode === weightMode) return;
    if (newMode === 'lb' && weightKg !== '') {
      const kg = parseFloat(weightKg);
      if (!isNaN(kg) && kg > 0) setWeightLb(toField(kg * 2.20462, 1));
    } else if (newMode === 'kg' && weightLb !== '') {
      const lb = parseFloat(weightLb);
      if (!isNaN(lb) && lb > 0) setWeightKg(toField(lb / 2.20462, 1));
    }
    setWeightMode(newMode);
  };

  // ── Core calculation ───────────────────────────────────────────────────────

  const result = useMemo((): CalcResult | null => {
    // Explicit === '' guards — never truthiness/falsy checks
    if (age === '') return null;
    if (heightMode === 'cm'   && heightCm === '') return null;
    if (heightMode === 'ftin' && heightFt === '') return null;
    if (weightMode === 'kg'   && weightKg === '') return null;
    if (weightMode === 'lb'   && weightLb === '') return null;

    const ageNum = parseFloat(age);
    if (isNaN(ageNum) || ageNum < 15 || ageNum > 100)
      return { ok: false, error: 'Age must be between 15 and 100.' };

    // ── Height → cm ─────────────────────────────────────────────────────────
    let hCm: number;
    if (heightMode === 'cm') {
      hCm = parseFloat(heightCm);
      if (isNaN(hCm)) return { ok: false, error: 'Height must be a valid number.' };
    } else {
      const ft  = parseFloat(heightFt);
      const ins = heightIn === '' ? 0 : parseFloat(heightIn);
      if (isNaN(ft))  return { ok: false, error: 'Height (feet) must be a valid number.' };
      if (isNaN(ins)) return { ok: false, error: 'Height (inches) must be a valid number.' };
      if (ins < 0 || ins >= 12)
        return { ok: false, error: 'Inches must be between 0 and 11.' };
      hCm = (ft * 12 + ins) * 2.54;
    }

    if (hCm < 50 || hCm > 250)
      return {
        ok: false,
        error: 'Height must be between 50 cm and 250 cm (roughly 1\'8" – 8\'2").',
      };

    // ── Weight → kg ─────────────────────────────────────────────────────────
    let wKg: number;
    if (weightMode === 'kg') {
      wKg = parseFloat(weightKg);
      if (isNaN(wKg)) return { ok: false, error: 'Weight must be a valid number.' };
    } else {
      const lb = parseFloat(weightLb);
      if (isNaN(lb)) return { ok: false, error: 'Weight must be a valid number.' };
      wKg = lb / 2.20462;
    }

    if (wKg < 20 || wKg > 300)
      return {
        ok: false,
        error: 'Weight must be between 20 kg and 300 kg (roughly 44–661 lb).',
      };

    // ── Mifflin-St Jeor BMR ─────────────────────────────────────────────────
    const bmr =
      sex === 'male'
        ? 10 * wKg + 6.25 * hCm - 5 * ageNum + 5
        : 10 * wKg + 6.25 * hCm - 5 * ageNum - 161;

    const actLevel = ACTIVITY_LEVELS.find(a => a.value === activity) ?? ACTIVITY_LEVELS[0];
    const tdee     = bmr * actLevel.multiplier;

    return {
      ok:       true,
      bmr:      Math.round(bmr),
      tdee:     Math.round(tdee),
      mildLoss: Math.round(tdee - 250),
      loss:     Math.round(tdee - 500),
      gain:     Math.round(tdee + 500),
    };
  }, [sex, age, heightMode, heightCm, heightFt, heightIn, weightMode, weightKg, weightLb, activity]);

  // ── Reset ──────────────────────────────────────────────────────────────────

  const reset = () => {
    setSex('male');
    setAge('');
    setHeightMode('cm');
    setHeightCm('');
    setHeightFt('');
    setHeightIn('');
    setWeightMode('kg');
    setWeightKg('');
    setWeightLb('');
    setActivity('sedentary');
  };

  // "Empty" = user has not typed anything into the numeric fields
  const isEmpty =
    age === '' &&
    heightCm === '' && heightFt === '' &&
    weightKg === '' && weightLb === '';

  const currentActivity = ACTIVITY_LEVELS.find(a => a.value === activity)!;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* ── Inputs ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

        {/* Sex toggle */}
        <div className="space-y-2">
          <Label>Sex</Label>
          <div className="flex rounded-md border border-border overflow-hidden">
            <button
              type="button"
              onClick={() => setSex('male')}
              className={toggleClass(sex === 'male')}
              style={{ flex: 1 }}
            >
              Male
            </button>
            <button
              type="button"
              onClick={() => setSex('female')}
              className={toggleClass(sex === 'female', true)}
              style={{ flex: 1 }}
            >
              Female
            </button>
          </div>
        </div>

        {/* Age */}
        <div className="space-y-2">
          <Label htmlFor="tdee-age">Age</Label>
          <div className="relative">
            <Input
              id="tdee-age"
              type="number"
              min="15"
              max="100"
              step="1"
              inputMode="numeric"
              placeholder="30"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="h-12 pr-14"
            />
            <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground text-sm pointer-events-none">
              years
            </span>
          </div>
        </div>

        {/* Height */}
        <div className="space-y-2">
          <Label>Height</Label>
          <div className="flex gap-2">
            {/* Inputs change based on mode */}
            {heightMode === 'cm' ? (
              <div className="relative flex-1">
                <Input
                  id="tdee-height-cm"
                  type="number"
                  min="50"
                  max="250"
                  step="any"
                  inputMode="decimal"
                  placeholder="170"
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value)}
                  className="h-12 pr-10"
                />
                <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground text-sm pointer-events-none">
                  cm
                </span>
              </div>
            ) : (
              <>
                <div className="relative flex-1">
                  <Input
                    id="tdee-height-ft"
                    type="number"
                    min="1"
                    max="8"
                    step="1"
                    inputMode="numeric"
                    placeholder="5"
                    value={heightFt}
                    onChange={(e) => setHeightFt(e.target.value)}
                    className="h-12 pr-8"
                  />
                  <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground text-sm pointer-events-none">
                    ft
                  </span>
                </div>
                <div className="relative flex-1">
                  <Input
                    id="tdee-height-in"
                    type="number"
                    min="0"
                    max="11"
                    step="any"
                    inputMode="decimal"
                    placeholder="7"
                    value={heightIn}
                    onChange={(e) => setHeightIn(e.target.value)}
                    className="h-12 pr-8"
                  />
                  <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground text-sm pointer-events-none">
                    in
                  </span>
                </div>
              </>
            )}

            {/* cm / ft toggle — always present */}
            <div className="flex rounded-md border border-border overflow-hidden shrink-0">
              <button
                type="button"
                onClick={() => switchHeightMode('cm')}
                className={toggleClass(heightMode === 'cm')}
              >
                cm
              </button>
              <button
                type="button"
                onClick={() => switchHeightMode('ftin')}
                className={toggleClass(heightMode === 'ftin', true)}
              >
                ft
              </button>
            </div>
          </div>
        </div>

        {/* Weight */}
        <div className="space-y-2">
          <Label htmlFor="tdee-weight">Weight</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                id="tdee-weight"
                type="number"
                min={weightMode === 'kg' ? '20' : '44'}
                max={weightMode === 'kg' ? '300' : '661'}
                step="any"
                inputMode="decimal"
                placeholder={weightMode === 'kg' ? '70' : '154'}
                value={weightMode === 'kg' ? weightKg : weightLb}
                onChange={(e) =>
                  weightMode === 'kg'
                    ? setWeightKg(e.target.value)
                    : setWeightLb(e.target.value)
                }
                className="h-12 pr-10"
              />
              <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground text-sm pointer-events-none">
                {weightMode}
              </span>
            </div>
            {/* kg / lb toggle */}
            <div className="flex rounded-md border border-border overflow-hidden shrink-0">
              <button
                type="button"
                onClick={() => switchWeightMode('kg')}
                className={toggleClass(weightMode === 'kg')}
              >
                kg
              </button>
              <button
                type="button"
                onClick={() => switchWeightMode('lb')}
                className={toggleClass(weightMode === 'lb', true)}
              >
                lb
              </button>
            </div>
          </div>
        </div>

        {/* Activity Level — spans both columns */}
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="tdee-activity">Activity Level</Label>
          <Select value={activity} onValueChange={(v) => setActivity(v as ActivityValue)}>
            <SelectTrigger id="tdee-activity" className="h-12">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ACTIVITY_LEVELS.map(({ value, label, desc }) => (
                <SelectItem key={value} value={value} className="py-2.5">
                  <span className="font-medium">{label}</span>
                  <span className="text-muted-foreground ml-1.5 text-xs">— {desc}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">{currentActivity.desc}</p>
        </div>

      </div>

      {/* ── Results ──────────────────────────────────────────────────────── */}
      <div className="pt-2">
        {isEmpty || result === null ? (
          <ToolEmptyState
            icon={Flame}
            message="Enter your age, height, weight and activity level to calculate your daily calorie needs"
            className="h-48"
          />
        ) : !result.ok ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{result.error}</AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">

            {/* Hero — TDEE */}
            <Card className="relative p-6 bg-primary/5 border-primary/20 text-center py-10">
              <ToolResultBadge />
              <span className="text-sm font-medium text-muted-foreground mb-3 flex items-center justify-center gap-1.5">
                <Flame className="w-4 h-4" />
                Total Daily Energy Expenditure
              </span>
              <p className="text-4xl md:text-5xl font-bold font-display tracking-tight text-foreground tabular-nums">
                {result.tdee.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground mt-2">calories / day</p>
            </Card>

            {/* Secondary stat cards */}
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              <Card className="p-3 md:p-4 text-center min-w-0 overflow-hidden">
                <p className="text-xs text-muted-foreground mb-1">Basal Metabolic Rate</p>
                <p className="text-base md:text-2xl font-bold font-display tabular-nums break-all leading-tight">
                  {result.bmr.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">cal / day</p>
              </Card>
              <Card className="p-3 md:p-4 text-center min-w-0 overflow-hidden">
                <p className="text-xs text-muted-foreground mb-1">Maintenance Calories</p>
                <p className="text-base md:text-2xl font-bold font-display tabular-nums break-all leading-tight">
                  {result.tdee.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">cal / day</p>
              </Card>
            </div>

            {/* Calorie reference points */}
            <Card className="p-4">
              <p className="text-sm font-semibold text-foreground mb-3">Calorie Reference Points</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Mild weight loss (−250 cal/day)</span>
                  <span className="font-medium tabular-nums">{result.mildLoss.toLocaleString()} cal</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Weight loss (−500 cal/day)</span>
                  <span className="font-medium tabular-nums">{result.loss.toLocaleString()} cal</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Weight gain (+500 cal/day)</span>
                  <span className="font-medium tabular-nums">{result.gain.toLocaleString()} cal</span>
                </div>
              </div>
              <p className="mt-3 pt-3 border-t border-border/50 text-xs text-muted-foreground">
                These are general informational reference points only, not recommendations or a diet plan.
              </p>
            </Card>

          </div>
        )}
      </div>

      {/* Disclaimer + Reset */}
      <div className="flex justify-between items-start pt-2 flex-wrap gap-4">
        <p className="text-xs text-muted-foreground max-w-md">
          These are estimates for general reference. Consult a healthcare provider for personalized advice.
        </p>
        <Button variant="outline" onClick={reset} disabled={isEmpty}>
          Reset
        </Button>
      </div>

      {/* ── Educational content ───────────────────────────────────────── */}
      <div className="pt-8 mt-8 border-t border-border space-y-0">

        {/* Section 1 */}
        <div>
          <h2 className="text-base font-semibold text-foreground mb-3">What TDEE Measures</h2>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              TDEE stands for Total Daily Energy Expenditure — the estimated number of calories
              burned in a day across all activity, from sleeping and breathing to exercise and
              movement. It has two components. BMR (Basal Metabolic Rate) is the energy the body
              uses at complete rest to maintain basic functions: circulation, respiration, and
              temperature regulation. The activity multiplier scales BMR up to account for
              typical daily movement.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Example 1: a 30-year-old male, 80 kg, 175 cm, moderately active (exercise 3–5
              days/week). BMR = <span className="font-semibold text-foreground">1,749 kcal/day</span>.
              TDEE = 1,749 × 1.55 = <span className="font-semibold text-foreground">2,711 kcal/day</span>.
              Example 2: a 25-year-old female, 60 kg, 163 cm, lightly active (exercise 1–3
              days/week). BMR = <span className="font-semibold text-foreground">1,333 kcal/day</span>.
              TDEE = 1,333 × 1.375 = <span className="font-semibold text-foreground">1,833 kcal/day</span>.
            </p>
          </div>
        </div>

        {/* Section 2 */}
        <div className="pt-8 mt-8 border-t border-border">
          <h2 className="text-base font-semibold text-foreground mb-3">The Mifflin-St Jeor Formula</h2>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              This calculator uses the Mifflin-St Jeor equation, published in 1990 and widely
              regarded as the most accurate general-population BMR formula among commonly used
              methods.
            </p>
            <div className="border border-border rounded-md bg-secondary p-4 space-y-2">
              <p className="text-sm text-muted-foreground leading-relaxed">
                <span className="font-semibold text-foreground">Male:</span>{' '}
                <span className="font-mono">BMR = 10 × weight(kg) + 6.25 × height(cm) − 5 × age + 5</span>
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                <span className="font-semibold text-foreground">Female:</span>{' '}
                <span className="font-mono">BMR = 10 × weight(kg) + 6.25 × height(cm) − 5 × age − 161</span>
              </p>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The only difference between the two equations is the constant term (+5 vs −161),
              which reflects population-level differences in body composition. TDEE is then
              BMR multiplied by the activity factor: Sedentary ×1.2 · Lightly active ×1.375 ·
              Moderately active ×1.55 · Very active ×1.725 · Extra active ×1.9.
            </p>
          </div>
        </div>

        {/* Section 3 */}
        <div className="pt-8 mt-8 border-t border-border">
          <h2 className="text-base font-semibold text-foreground mb-3">When to Use This Calculator</h2>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              TDEE estimates are commonly used as a starting reference point for understanding
              approximate energy balance. Researchers, dietitians, and sports coaches use
              formula-based TDEE as an initial baseline that is then adjusted based on observed
              outcomes over weeks. The calorie reference points shown — mild loss (−250 kcal/day),
              weight loss (−500 kcal/day), and gain (+500 kcal/day) — are informational figures
              derived from the TDEE; actual outcomes depend on factors not captured by the formula.
            </p>
          </div>
        </div>

        {/* Section 4 */}
        <div className="pt-8 mt-8 border-t border-border">
          <h2 className="text-base font-semibold text-foreground mb-3">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {[
              {
                q: 'What is the difference between BMR and TDEE?',
                a: "BMR (Basal Metabolic Rate) is the energy the body uses at complete rest — the minimum to sustain organ function, circulation, and temperature regulation. TDEE adds the energy cost of all daily activity on top of BMR. For most people, BMR makes up 60–75% of TDEE. The activity multiplier converts BMR to TDEE by estimating how much additional energy typical movement patterns require above the resting baseline.",
              },
              {
                q: 'Why does the Mifflin-St Jeor formula require sex as an input?',
                a: "The sex input adjusts for population-level differences in body composition. On average, male bodies carry a higher proportion of lean muscle mass relative to fat mass than female bodies at the same weight and height. Lean tissue has a higher metabolic rate than fat tissue, which is why the male formula constant (+5) is higher than the female constant (−161). These are statistical population averages — individual metabolic rates vary considerably around these figures.",
              },
              {
                q: 'How accurate are TDEE estimates?',
                a: "Formula-based TDEE estimates are population averages, not individual measurements. Studies have found that Mifflin-St Jeor estimates are within roughly ±10–15% of measured values for most people — meaning actual TDEE may be noticeably higher or lower than calculated. Factors the formula cannot capture include lean mass proportion, metabolic adaptation, hormonal state, medications, and genetics. The figure is most useful as a starting reference point rather than a precise target.",
              },
              {
                q: 'Why does changing the activity level make such a large difference?',
                a: "The activity multiplier spans from ×1.2 (sedentary) to ×1.9 (extra active), a range that can account for up to a 58% difference in total energy expenditure. A person with a BMR of 1,500 kcal/day has a TDEE of 1,800 if sedentary and 2,850 if extra active — a 1,050 kcal difference from activity alone. Selecting the most representative activity level is therefore the single most impactful input in the calculation.",
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
