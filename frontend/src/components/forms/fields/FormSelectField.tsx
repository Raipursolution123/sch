import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form';
import { FormField, getFormFieldA11yProps } from '@components/forms/FormField';
import { Select } from '@components/ui/select';

interface SelectOption {
  value: string;
  label: string;
}

interface FormSelectFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  options: SelectOption[];
  hint?: string;
  placeholder?: string;
  required?: boolean;
  optional?: boolean;
  disabled?: boolean;
  className?: string;
}

export function FormSelectField<T extends FieldValues>({
  control,
  name,
  label,
  options,
  hint,
  placeholder,
  required,
  optional,
  disabled,
  className,
}: FormSelectFieldProps<T>) {
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
            <Select
              id={fieldId}
              options={options}
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
