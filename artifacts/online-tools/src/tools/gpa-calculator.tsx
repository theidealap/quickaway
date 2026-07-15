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
          <div key={course.id} className="grid grid-cols-1 md:grid-cols-[1fr_140px_140px_44px] gap-3 items-center">
            <div className="text-sm text-muted-foreground md:hidden">Course {index + 1}</div>
            <div className="hidden md:block text-sm text-muted-foreground">Course {index + 1}</div>
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
    </div>
  );
}
