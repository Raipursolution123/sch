export const SUBJECT_TYPE_OPTIONS = [
  { value: 'theory', label: 'Theory' },
  { value: 'practical', label: 'Practical' },
] as const;

export type SubjectType = (typeof SUBJECT_TYPE_OPTIONS)[number]['value'];
