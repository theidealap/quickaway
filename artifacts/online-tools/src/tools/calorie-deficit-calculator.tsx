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
import { Scale, AlertCircle } from 'lucide-react';
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

const LOSE_OPTIONS = [
  { value: 'mild'       as const, label: 'Mild',       delta: -250, desc: '−250 cal/day' },
  { value: 'moderate'   as const, label: 'Moderate',   delta: -500, desc: '−500 cal/day' },
  { value: 'aggressive' as const, label: 'Aggressive', delta: -750, desc: '−750 cal/day' },
];

const GAIN_OPTIONS = [
  { value: 'mild'     as const, label: 'Mild',     delta: 250, desc: '+250 cal/day' },
  { value: 'moderate' as const, label: 'Moderate', delta: 500, desc: '+500 cal/day' },
];

type ActivityValue  = (typeof ACTIVITY_LEVELS)[number]['value'];
type GoalType       = 'lose' | 'maintain' | 'gain';
type LoseIntensity  = 'mild' | 'moderate' | 'aggressive';
type GainIntensity  = 'mild' | 'moderate';

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Round to `dp` decimal places; strip trailing zeros; safe for <input> values (no locale commas). */
function toField(n: number, dp = 1): string {
  return parseFloat(n.toFixed(dp)).toString();
}

/** Format a cal/day delta for display. */
function fmtDelta(delta: number): string {
  if (delta === 0) return '0 cal / day';
  const sign = delta > 0 ? '+' : '−';
  return `${sign}${Math.abs(delta).toLocaleString()} cal / day`;
}

/** Format a weekly weight-change value with sign, 2 dp. */
function fmtWeekly(val: number, unit: string): string {
  if (val === 0) return `0 ${unit} / week`;
  const sign = val > 0 ? '+' : '−';
  return `${sign}${Math.abs(val).toFixed(2)} ${unit} / week`;
}

// ── Types ─────────────────────────────────────────────────────────────────────

type Sex        = 'male' | 'female';
type HeightMode = 'cm' | 'ftin';
type WeightMode = 'kg' | 'lb';

type CalcResult =
  | { ok: false; error: string }
  | {
      ok:         true;
      bmr:        number;
      tdee:       number;
      delta:      number;
      targetCals: number;
      weeklyKg:   number;
      weeklyLb:   number;
    };

// ── Toggle button class helper ────────────────────────────────────────────────

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

export default function CalorieDeficitCalculator() {
  // ── Bio inputs ─────────────────────────────────────────────────────────────
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

  // ── Goal inputs ────────────────────────────────────────────────────────────
  const [goalType,      setGoalType]      = useState<GoalType>('lose');
  const [loseIntensity, setLoseIntensity] = useState<LoseIntensity>('moderate');
  const [gainIntensity, setGainIntensity] = useState<GainIntensity>('mild');

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
    // Explicit === '' guards on every required numeric field — never truthiness checks
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
    const bmrRaw =
      sex === 'male'
        ? 10 * wKg + 6.25 * hCm - 5 * ageNum + 5
        : 10 * wKg + 6.25 * hCm - 5 * ageNum - 161;

    if (bmrRaw <= 0)
      return {
        ok: false,
        error: 'This combination of values produces an unrealistic result. Please check your inputs.',
      };

    // ── Activity multiplier ─────────────────────────────────────────────────
    const actLevel = ACTIVITY_LEVELS.find(a => a.value === activity) ?? ACTIVITY_LEVELS[0];
    const tdeeRaw  = bmrRaw * actLevel.multiplier;

    // ── Goal delta ──────────────────────────────────────────────────────────
    const delta =
      goalType === 'lose'
        ? (LOSE_OPTIONS.find(o => o.value === loseIntensity) ?? LOSE_OPTIONS[1]).delta
        : goalType === 'gain'
        ? (GAIN_OPTIONS.find(o => o.value === gainIntensity) ?? GAIN_OPTIONS[0]).delta
        : 0;

    const targetCalsRaw = tdeeRaw + delta;

    // Guard against implausibly low target calories
    if (targetCalsRaw < 100)
      return {
        ok: false,
        error: 'The selected goal results in an implausibly low calorie target. Try a less aggressive deficit or re-check your inputs.',
      };

    return {
      ok:         true,
      bmr:        Math.round(bmrRaw),
      tdee:       Math.round(tdeeRaw),
      delta,
      targetCals: Math.round(targetCalsRaw),
      weeklyKg:   (delta * 7) / 7700,
      weeklyLb:   (delta * 7) / 3500,
    };
  }, [sex, age, heightMode, heightCm, heightFt, heightIn, weightMode, weightKg, weightLb, activity, goalType, loseIntensity, gainIntensity]);

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
    setGoalType('lose');
    setLoseIntensity('moderate');
    setGainIntensity('mild');
  };

  const isEmpty =
    age === '' &&
    heightCm === '' && heightFt === '' &&
    weightKg === '' && weightLb === '';

  const currentActivity   = ACTIVITY_LEVELS.find(a => a.value === activity)!;
  const currentLoseOption = LOSE_OPTIONS.find(o => o.value === loseIntensity)!;
  const currentGainOption = GAIN_OPTIONS.find(o => o.value === gainIntensity)!;

  // Hero label / sub-label
  const heroLabel =
    goalType === 'maintain' ? 'Maintenance Calories' : 'Target Daily Calories';
  const heroSub =
    goalType === 'lose'     ? `${currentLoseOption.desc} below maintenance · weight loss` :
    goalType === 'gain'     ? `${currentGainOption.desc} above maintenance · weight gain` :
    'no deficit or surplus';

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
          <Label htmlFor="cdc-age">Age</Label>
          <div className="relative">
            <Input
              id="cdc-age"
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
            {heightMode === 'cm' ? (
              <div className="relative flex-1">
                <Input
                  id="cdc-height-cm"
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
                    id="cdc-height-ft"
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
                    id="cdc-height-in"
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
          <Label htmlFor="cdc-weight">Weight</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                id="cdc-weight"
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

        {/* Activity Level */}
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="cdc-activity">Activity Level</Label>
          <Select value={activity} onValueChange={(v) => setActivity(v as ActivityValue)}>
            <SelectTrigger id="cdc-activity" className="h-12">
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

        {/* Goal type — 3-way toggle */}
        <div className="space-y-2 sm:col-span-2">
          <Label>Goal</Label>
          <div className="flex rounded-md border border-border overflow-hidden">
            {(['lose', 'maintain', 'gain'] as GoalType[]).map((g, i) => (
              <button
                key={g}
                type="button"
                onClick={() => setGoalType(g)}
                className={toggleClass(goalType === g, i > 0)}
                style={{ flex: 1 }}
              >
                {g === 'lose' ? 'Lose Weight' : g === 'maintain' ? 'Maintain' : 'Gain Weight'}
              </button>
            ))}
          </div>
        </div>

        {/* Intensity sub-selector — only for lose / gain */}
        {goalType === 'lose' && (
          <div className="space-y-2 sm:col-span-2">
            <Label>Deficit Amount</Label>
            <div className="flex rounded-md border border-border overflow-hidden">
              {LOSE_OPTIONS.map((opt, i) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setLoseIntensity(opt.value)}
                  className={toggleClass(loseIntensity === opt.value, i > 0)}
                  style={{ flex: 1 }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {currentLoseOption.desc} below maintenance calories
            </p>
          </div>
        )}

        {goalType === 'gain' && (
          <div className="space-y-2 sm:col-span-2">
            <Label>Surplus Amount</Label>
            <div className="flex rounded-md border border-border overflow-hidden">
              {GAIN_OPTIONS.map((opt, i) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setGainIntensity(opt.value)}
                  className={toggleClass(gainIntensity === opt.value, i > 0)}
                  style={{ flex: 1 }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {currentGainOption.desc} above maintenance calories
            </p>
          </div>
        )}

      </div>

      {/* ── Results ──────────────────────────────────────────────────────── */}
      <div className="pt-2">
        {isEmpty || result === null ? (
          <ToolEmptyState
            icon={Scale}
            message="Enter your details and select a goal to calculate your target daily calories"
            className="h-48"
          />
        ) : !result.ok ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{result.error}</AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">

            {/* Hero — Target Daily Calories */}
            <Card className="relative p-6 bg-primary/5 border-primary/20 text-center py-10">
              <ToolResultBadge />
              <span className="text-sm font-medium text-muted-foreground mb-3 flex items-center justify-center gap-1.5">
                <Scale className="w-4 h-4" />
                {heroLabel}
              </span>
              <p className="text-4xl md:text-5xl font-bold font-display tracking-tight text-foreground tabular-nums">
                {result.targetCals.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground mt-2">{heroSub}</p>
            </Card>

            {/* Secondary stat cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
              <Card className="p-3 md:p-4 text-center min-w-0 overflow-hidden">
                <p className="text-xs text-muted-foreground mb-1">Maintenance (TDEE)</p>
                <p className="text-base md:text-2xl font-bold font-display tabular-nums break-all leading-tight">
                  {result.tdee.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">cal / day</p>
              </Card>

              <Card className="p-3 md:p-4 text-center min-w-0 overflow-hidden">
                <p className="text-xs text-muted-foreground mb-1">
                  {result.delta < 0 ? 'Daily Deficit' : result.delta > 0 ? 'Daily Surplus' : 'Daily Change'}
                </p>
                <p className="text-base md:text-2xl font-bold font-display tabular-nums break-all leading-tight">
                  {fmtDelta(result.delta)}
                </p>
              </Card>

              <Card className="p-3 md:p-4 text-center min-w-0 overflow-hidden col-span-2 md:col-span-1">
                <p className="text-xs text-muted-foreground mb-1">Est. Weekly Change</p>
                <p className="text-base md:text-lg font-bold font-display tabular-nums break-all leading-tight">
                  {fmtWeekly(result.weeklyKg, 'kg')}
                </p>
                <p className="text-sm font-medium font-display tabular-nums text-muted-foreground">
                  {fmtWeekly(result.weeklyLb, 'lb')}
                </p>
              </Card>
            </div>

            {/* BMR footnote */}
            <p className="text-xs text-muted-foreground">
              Basal Metabolic Rate (BMR): {result.bmr.toLocaleString()} cal / day
            </p>

          </div>
        )}
      </div>

      {/* Disclaimer + Reset */}
      <div className="flex justify-between items-start pt-2 flex-wrap gap-4">
        <p className="text-xs text-muted-foreground max-w-md">
          These are estimates for general reference, not medical advice. Consult a healthcare
          provider before starting a weight loss or gain plan, especially if you have any health
          conditions.
        </p>
        <Button variant="outline" onClick={reset} disabled={isEmpty}>
          Reset
        </Button>
      </div>

    </div>
  );
}
