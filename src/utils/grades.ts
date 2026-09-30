import type { GradeEntry, Subject, GradeCategory } from '../types';

// Convert a grade entry to its numeric value with modifier
// German grade system: 1 (best) to 6 (worst)
// 1+ = 1.25, 1- = 1.75, etc.
// Point system: 15 (best) to 0 (worst), no modifiers used

export function gradeToNumber(grade: GradeEntry): number {
  if (grade.pointSystem) {
    return grade.value;
  }
  let base = grade.value;
  if (grade.modifier === '+') base -= 0.25;
  if (grade.modifier === '-') base += 0.25;
  return Math.round(base * 100) / 100;
}

export function formatGrade(grade: GradeEntry): string {
  if (grade.pointSystem) {
    return String(grade.value);
  }
  const mod = grade.modifier || '';
  return `${grade.value}${mod}`;
}

export function pointToGrade(points: number): number {
  // 15 points = 1+, 0 points = 6
  return Math.max(1, Math.min(6, Math.round((17 - points) / 3 * 10) / 10));
}

export function gradeToPoints(grade: number): number {
  return Math.max(0, Math.min(15, Math.round((17 - grade * 3))));
}

export function calculateSubjectAverage(subject: Subject, grades: GradeEntry[]): number | null {
  const subjectGrades = grades.filter((g) => g.subjectId === subject.id);
  if (subjectGrades.length === 0) return null;

  // Group by category and compute weighted average
  const categoryAverages: { weight: number; average: number; count: number }[] = [];

  for (const category of subject.categories) {
    const catGrades = subjectGrades.filter((g) => g.categoryId === category.id);
    if (catGrades.length === 0) continue;

    const sum = catGrades.reduce((acc, g) => acc + gradeToNumber(g), 0);
    const avg = sum / catGrades.length;
    categoryAverages.push({ weight: category.weight, average: avg, count: catGrades.length });
  }

  if (categoryAverages.length === 0) return null;

  // If no weights set (all 0), use simple average
  const totalWeight = categoryAverages.reduce((acc, c) => acc + c.weight, 0);
  if (totalWeight === 0) {
    const allGrades = categoryAverages.reduce((acc, c) => acc + c.average * c.count, 0);
    const totalCount = categoryAverages.reduce((acc, c) => acc + c.count, 0);
    return Math.round((allGrades / totalCount) * 100) / 100;
  }

  const weightedSum = categoryAverages.reduce((acc, c) => acc + c.average * c.weight, 0);
  return Math.round((weightedSum / totalWeight) * 100) / 100;
}

export function calculateOverallGPA(subjects: Subject[], grades: GradeEntry[]): number | null {
  const averages: number[] = [];
  for (const subject of subjects) {
    const avg = calculateSubjectAverage(subject, grades);
    if (avg !== null) averages.push(avg);
  }
  if (averages.length === 0) return null;
  return Math.round((averages.reduce((a, b) => a + b, 0) / averages.length) * 100) / 100;
}

export function formatAverage(avg: number | null, pointSystem: boolean = false): string {
  if (avg === null) return '—';
  if (pointSystem) {
    return avg.toFixed(1) + ' P';
  }
  return avg.toFixed(2);
}

export function getDefaultCategories(): GradeCategory[] {
  return [
    { id: 'cat_written', name: 'Schriftlich', weight: 50 },
    { id: 'cat_oral', name: 'Mündlich', weight: 50 },
  { id: 'cat_project', name: 'Projekt', weight: 0 },
  { id: 'cat_other', name: 'Sonstiges', weight: 0 },
  ];
}
