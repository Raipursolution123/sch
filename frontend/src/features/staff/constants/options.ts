export const STAFF_GENDER_OPTIONS = [
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
  { value: 'Other', label: 'Other' },
] as const;

export const MARITAL_STATUS_OPTIONS = [
  { value: 'Single', label: 'Single' },
  { value: 'Married', label: 'Married' },
  { value: 'Divorced', label: 'Divorced' },
  { value: 'Widowed', label: 'Widowed' },
] as const;

export const CONTRACT_TYPE_OPTIONS = [
  { value: 'Permanent', label: 'Permanent' },
  { value: 'Contract', label: 'Contract' },
  { value: 'Probation', label: 'Probation' },
  { value: 'Part-time', label: 'Part-time' },
] as const;
