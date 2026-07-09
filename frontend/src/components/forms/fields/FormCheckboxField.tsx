import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form';
import { FormField } from '@components/forms/FormField';
import { Checkbox } from '@components/ui/checkbox';

interface FormCheckboxFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  hint?: string;
  disabled?: boolean;
  className?: string;
}

export function FormCheckboxField<T extends FieldValues>({
  control,
  name,
  label,
  hint,
  disabled,
  className,
}: FormCheckboxFieldProps<T>) {
  const fieldId = String(name);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormField
          label={label}
          htmlFor={fieldId}
          hint={hint}
          error={fieldState.error?.message}
          disabled={disabled}
          className={className}
        >
          <Checkbox
            id={fieldId}
            checked={Boolean(field.value)}
            disabled={disabled}
            onChange={(event) => field.onChange(event.target.checked)}
          />
        </FormField>
      )}
    />
  );
}
