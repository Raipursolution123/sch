import type { ClassSection } from '@app-types/academics/class-section';

export interface SelectOption {
  value: string;
  label: string;
}

/** Sections assigned to a class via active class-section mappings. */
export function sectionOptionsForClass(
  mappings: ClassSection[],
  classId: number,
  fallback?: { section_id: number; section_name: string | null },
): SelectOption[] {
  const seen = new Map<number, string>();
  for (const row of mappings) {
    if (row.class_id !== classId) continue;
    seen.set(row.section_id, row.section_name);
  }
  if (fallback?.section_id && fallback.section_name && !seen.has(fallback.section_id)) {
    seen.set(fallback.section_id, fallback.section_name);
  }
  return Array.from(seen.entries())
    .map(([value, label]) => ({ value: String(value), label }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

export function firstSectionIdForClass(
  mappings: ClassSection[],
  classId: number,
): number | undefined {
  const options = sectionOptionsForClass(mappings, classId);
  const first = options[0];
  return first ? Number(first.value) : undefined;
}
