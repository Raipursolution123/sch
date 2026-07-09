import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form';
import { FormField, getFormFieldA11yProps } from '@components/forms/FormField';
import { Input } from '@components/ui/input';

interface FormNumberFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  hint?: string;
  required?: boolean;
  optional?: boolean;
  disabled?: boolean;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
}

export function FormNumberField<T extends FieldValues>({
  control,
  name,
  label,
  hint,
  required,
  optional,
  disabled,
  min,
  max,
  step,
  className,
}: FormNumberFieldProps<T>) {
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
              type="number"
              min={min}
              max={max}
              step={step}
              disabled={disabled}
              {...field}
              value={field.value ?? ''}
              onChange={(event) => {
                const next = event.target.value;
                field.onChange(next === '' ? '' : Number(next));
              }}
              {...a11y}
            />
          </FormField>
        );
      }}
    />
  );
}
