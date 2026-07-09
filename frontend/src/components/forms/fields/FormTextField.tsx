import type { HTMLInputTypeAttribute } from 'react';
import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form';
import { FormField, getFormFieldA11yProps } from '@components/forms/FormField';
import { Input } from '@components/ui/input';

interface BaseFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  hint?: string;
  required?: boolean;
  optional?: boolean;
  disabled?: boolean;
  className?: string;
}

interface FormTextFieldProps<T extends FieldValues> extends BaseFieldProps<T> {
  type?: HTMLInputTypeAttribute;
  placeholder?: string;
  autoComplete?: string;
  autoFocus?: boolean;
}

export function FormTextField<T extends FieldValues>({
  control,
  name,
  label,
  hint,
  required,
  optional,
  disabled,
  className,
  type = 'text',
  placeholder,
  autoComplete,
  autoFocus,
}: FormTextFieldProps<T>) {
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
            <Input
              id={fieldId}
              type={type}
              placeholder={placeholder}
              autoComplete={autoComplete}
              autoFocus={autoFocus}
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
