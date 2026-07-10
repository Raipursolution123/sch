import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form';
import { Search } from 'lucide-react';
import { FormField, getFormFieldA11yProps } from '@components/forms/FormField';
import { Input } from '@components/ui/input';
import { cn } from '@utils/cn';

interface FormSearchFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  hint?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function FormSearchField<T extends FieldValues>({
  control,
  name,
  label,
  hint,
  placeholder = 'Search…',
  disabled,
  className,
}: FormSearchFieldProps<T>) {
  const fieldId = String(name);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const a11y = getFormFieldA11yProps(fieldId, { hint, error: fieldState.error?.message });
        return (
          <FormField
            label={label}
            htmlFor={fieldId}
            hint={hint}
            error={fieldState.error?.message}
            disabled={disabled}
            className={className}
          >
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                id={fieldId}
                type="search"
                placeholder={placeholder}
                disabled={disabled}
                className={cn('pl-9')}
                {...field}
                value={field.value ?? ''}
                {...a11y}
              />
            </div>
          </FormField>
        );
      }}
    />
  );
}
