import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form';
import { FormField, getFormFieldA11yProps } from '@components/forms/FormField';
import { Textarea } from '@components/ui/textarea';

interface FormTextareaFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  hint?: string;
  required?: boolean;
  optional?: boolean;
  disabled?: boolean;
  rows?: number;
  placeholder?: string;
  className?: string;
}

export function FormTextareaField<T extends FieldValues>({
  control,
  name,
  label,
  hint,
  required,
  optional,
  disabled,
  rows = 3,
  placeholder,
  className,
}: FormTextareaFieldProps<T>) {
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
            required={required}
            optional={optional}
            disabled={disabled}
            className={className}
          >
            <Textarea
              id={fieldId}
              rows={rows}
              placeholder={placeholder}
              disabled={disabled}
              {...field}
              value={field.value ?? ''}
              {...a11y}
            />
          </FormField>
        );
      }}
    />
  );
}
