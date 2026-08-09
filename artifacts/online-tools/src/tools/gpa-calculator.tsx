import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GraduationCap, Plus, Trash2 } from 'lucide-react';
import { ToolEmptyState } from '@/components/tool-empty-state';
import { ToolResultBadge } from '@/components/tool-result-badge';

type Scale = '4.0' | '5.0';

interface Course {
  id: string;
  grade: string;
  credits: string;
}

const GRADE_POINTS: Record<Scale, Record<string, number>> = {
  '4.0': {
    'A': 4.0, 'A-': 3.7,
    'B+': 3.3, 'B': 3.0, 'B-': 2.7,
    'C+': 2.3, 'C': 2.0, 'C-': 1.7,
    'D+': 1.3, 'D': 1.0,
    'F': 0.0,
  },
  '5.0': {
    'A': 5.0, 'A-': 4.7,
    'B+': 4.3, 'B': 4.0, 'B-': 3.7,
    'C+': 3.3, 'C': 3.0, 'C-': 2.7,
    'D+': 2.3, 'D': 2.0,
    'F': 0.0,
  },
};

let nextId = 1;
const createCourse = (): Course => ({ id: `course-${nextId++}`, grade: 'A', credits: '' });

export default function GpaCalculator() {
  const [scale, setScale] = useState<Scale>('4.0');
  const [courses, setCourses] = useState<Course[]>([createCourse(), createCourse()]);

  const grades = Object.keys(GRADE_POINTS[scale]);

  const updateCourse = (id: string, field: keyof Omit<Course, 'id'>, value: string) => {
    setCourses((prev) => prev.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
  };

  const addCourse = () => setCourses((prev) => [...prev, createCourse()]);
  const removeCourse = (id: string) => setCourses((prev) => prev.filter((c) => c.id !== id));

  const result = useMemo(() => {
    let totalPoints = 0;
    let totalCredits = 0;
    for (const course of courses) {
      const credits = parseFloat(course.credits);
      if (!credits || credits <= 0) continue;
      const points = GRADE_POINTS[scale][course.grade] ?? 0;
      totalPoints += points * credits;
      totalCredits += credits;
    }
    if (totalCredits === 0) return null;
    return { gpa: totalPoints / totalCredits, totalCredits };
  }, [courses, scale]);

  const handleReset = () => {
    nextId = 1;
    setCourses([createCourse(), createCourse()]);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>GPA Scale</Label>
        <Tabs value={scale} onValueChange={(v) => setScale(v as Scale)}>
          <TabsList className="grid grid-cols-2 w-full max-w-xs h-auto p-1">
            <TabsTrigger value="4.0" className="py-2.5">4.0 Scale</TabsTrigger>
            <TabsTrigger value="5.0" className="py-2.5">5.0 Scale</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="space-y-3">
        <div className="hidden md:grid grid-cols-[1fr_140px_140px_44px] gap-3 px-1">
          <Label className="text-xs text-muted-foreground uppercase tracking-wide">Course</Label>
          <Label className="text-xs text-muted-foreground uppercase tracking-wide">Grade</Label>
          <Label className="text-xs text-muted-foreground uppercase tracking-wide">Credit Hours</Label>
          <span />
        </div>

        {courses.map((course, index) => (
          <div key={course.id} className="grid grid-cols-[1fr_96px_44px] md:grid-cols-[1fr_140px_140px_44px] gap-2 md:gap-3 items-center">
            <div className="col-span-3 md:col-span-1 text-sm text-muted-foreground">Course {index + 1}</div>
            <Select value={course.grade} onValueChange={(v) => updateCourse(course.id, 'grade', v)}>
              <SelectTrigger data-testid={`select-grade-${index}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {grades.map((g) => (
                  <SelectItem key={g} value={g}>{g}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="number"
              inputMode="decimal"
              min={0}
              placeholder="3"
              value={course.credits}
              onChange={(e) => updateCourse(course.id, 'credits', e.target.value)}
              data-testid={`input-credits-${index}`}
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeCourse(course.id)}
              disabled={courses.length <= 1}
              aria-label="Remove course"
            >
              <Trash2 className="w-4 h-4 text-muted-foreground" />
            </Button>
          </div>
        ))}

        <Button variant="outline" onClick={addCourse} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" /> Add Course
        </Button>
      </div>

      <div className="pt-2">
        {!result ? (
          <ToolEmptyState icon={GraduationCap} message="Enter grades and credit hours to calculate your GPA" className="h-40" />
        ) : (
          <Card className="relative p-6 bg-primary/5 border-primary/20 text-center flex flex-col items-center py-10">
            <ToolResultBadge />
            <span className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4" /> Your GPA ({scale} scale)
            </span>
            <div className="text-4xl md:text-5xl font-bold font-display tracking-tight text-foreground mb-2">
              {result.gpa.toFixed(2)}
            </div>
            <div className="text-sm text-muted-foreground">{result.totalCredits} total credit hours</div>
          </Card>
        )}
      </div>

      <div className="flex justify-end pt-2">
        <Button variant="outline" onClick={handleReset}>Reset</Button>
      </div>

      {/* ── Educational content ───────────────────────────────────────── */}
      <div className="pt-8 mt-8 border-t border-border space-y-0">

        {/* Section 1 — How GPA Is Calculated */}
        <div>
          <h2 className="text-base font-semibold text-foreground mb-3">How GPA Is Calculated</h2>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              GPA (Grade Point Average) converts letter grades into a single number representing
              overall academic performance. Each letter grade maps to a grade point value — on the
              standard 4.0 scale, an A equals 4.0, a B+ equals 3.3, a B equals 3.0, and so on.
              That grade point value is multiplied by the number of credit hours the course carries,
              producing "quality points" for that course. Summing all quality points and dividing
              by total credit hours gives the GPA.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Example: three courses — Biology with an A (4.0 points) worth 4 credit hours gives
              16.0 quality points; Calculus with a B+ (3.3 points) worth 3 credit hours gives 9.9;
              History with a B (3.0 points) worth 3 credit hours gives 9.0. Total quality
              points: 34.9. Total credit hours: 10.
              GPA: 34.9 ÷ 10 = <span className="font-semibold text-foreground">3.49</span>.
            </p>
          </div>
        </div>

        {/* Section 2 — The Formula */}
        <div className="pt-8 mt-8 border-t border-border">
          <h2 className="text-base font-semibold text-foreground mb-3">The GPA Formula</h2>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              <span className="font-mono font-semibold text-foreground">GPA = Σ(grade points × credit hours) ÷ Σ(credit hours)</span>
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              To calculate cumulative GPA across multiple semesters, do not average the semester
              GPAs directly — that ignores the fact that semesters may have different credit loads.
              Instead, sum all quality points from all semesters and divide by total credit hours
              across all semesters.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              <span className="font-medium text-foreground">Example:</span> Semester 1 GPA 3.5 on
              15 credit hours (52.5 quality points); Semester 2 GPA 3.2 on 16 credit hours
              (51.2 quality points). Cumulative: (52.5 + 51.2) ÷ (15 + 16) = 103.7 ÷ 31
              = <span className="font-semibold text-foreground">3.35</span>. Simply averaging
              3.5 and 3.2 gives 3.35 here by coincidence, but the difference grows when semester
              credit loads differ significantly.
            </p>
          </div>
        </div>

        {/* Section 3 — When to Use */}
        <div className="pt-8 mt-8 border-t border-border">
          <h2 className="text-base font-semibold text-foreground mb-3">When to Use This Calculator</h2>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Use this calculator to model your GPA before final grades post by entering expected
              grades and checking whether you can reach a target threshold. It makes the credit
              weight of each course visible: an A in a 1-credit elective moves a GPA far less than
              an A in a 4-credit core course with the same letter grade. This is also useful for
              checking scholarship or honour roll cutoffs, graduate program minimum requirements,
              or whether retaking a course would materially change your cumulative figure.
            </p>
          </div>
        </div>

        {/* Section 4 — FAQ */}
        <div className="pt-8 mt-8 border-t border-border">
          <h2 className="text-base font-semibold text-foreground mb-3">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {[
              {
                q: "What's the difference between weighted and unweighted GPA?",
                a: "An unweighted GPA uses the same 4.0 maximum regardless of course difficulty. A weighted GPA awards extra grade points for advanced courses — AP or IB classes typically use a 5.0 maximum, so an A earns 5.0 instead of 4.0. This calculator supports both 4.0 and 5.0 scales. Note that colleges commonly recalculate GPA on their own scale when reviewing applications, so your transcript's weighted figure may differ from what admissions offices use.",
              },
              {
                q: 'How do I calculate cumulative GPA across multiple semesters?',
                a: "Enter all courses from all semesters into the calculator to get the correct cumulative figure — do not average your semester GPAs separately. Averaging semester GPAs gives the wrong result when semesters have unequal credit loads, because it treats a 12-credit semester and an 18-credit semester as equally weighted. The GPA formula weights each course by its credit hours, so the only correct method sums all quality points and divides by all credits.",
              },
              {
                q: 'Does a Pass/Fail class affect GPA?',
                a: "A Pass grade typically does not affect GPA — it contributes credit hours toward graduation but adds no quality points to the GPA calculation, leaving the average unchanged. A Fail grade, depending on institution policy, may be counted as 0.0 and pull the GPA down, or may also be excluded. Policies vary significantly between schools, so check your institution's academic regulations before assuming a Pass/Fail course is GPA-neutral.",
              },
              {
                q: 'What GPA is considered good?',
                a: "Context matters more than any universal threshold. A 3.0 (B average) is commonly the minimum for many scholarships and graduate program eligibility. A 3.5 or higher typically qualifies for academic honours. In highly competitive graduate programs such as medicine, law, or top MBA programmes, the median admitted GPA is often above 3.7. For most employers, GPA requirements apply mainly to entry-level roles and typically use 3.0 as a cutoff.",
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
