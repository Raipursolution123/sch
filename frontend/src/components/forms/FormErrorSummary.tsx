import type { FieldErrors } from 'react-hook-form';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@components/ui/alert';

function flattenFieldErrors(
  errors: FieldErrors,
  prefix = '',
): { field: string; message: string }[] {
  const items: { field: string; message: string }[] = [];

  for (const [key, value] of Object.entries(errors)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (!value) continue;

    if ('message' in value && typeof value.message === 'string') {
      items.push({ field: path, message: value.message });
      continue;
    }

    if (typeof value === 'object') {
      items.push(...flattenFieldErrors(value as FieldErrors, path));
    }
  }

  return items;
}

interface FormErrorSummaryProps {
  errors: FieldErrors;
  title?: string;
  className?: string;
}

/** Top-of-form validation summary for multi-field screens. */
export function FormErrorSummary({
  errors,
  title = 'Please fix the following errors',
  className,
}: FormErrorSummaryProps) {
  const messages = flattenFieldErrors(errors);
  if (messages.length === 0) return null;

  return (
    <Alert variant="destructive" className={className}>
      <AlertCircle className="h-4 w-4" aria-hidden="true" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>
        <ul className="mt-2 list-inside list-disc space-y-1 text-sm">
          {messages.map((item) => (
            <li key={item.field}>{item.message}</li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
}
