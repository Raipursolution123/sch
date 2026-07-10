import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form';
import { FormField, getFormFieldA11yProps } from '@components/forms/FormField';
import { cn } from '@utils/cn';
import { controlInputClassName, controlHeightClassName } from '@utils/form-control';

interface FormFileFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  hint?: string;
  required?: boolean;
  optional?: boolean;
  disabled?: boolean;
  accept?: string;
  className?: string;
}

export function FormFileField<T extends FieldValues>({
  control,
  name,
  label,
  hint,
  required,
  optional,
  disabled,
  accept,
  className,
}: FormFileFieldProps<T>) {
  const fieldId = String(name);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, ref, value }, fieldState }) => {
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
            <input
              id={fieldId}
              ref={ref}
              type="file"
              accept={accept}
              disabled={disabled}
              onBlur={onBlur}
              onChange={(event) => onChange(event.target.files?.[0] ?? null)}
              className={cn(
                controlInputClassName,
                controlHeightClassName,
                'cursor-pointer file:mr-3 file:rounded-md file:border-0 file:bg-muted file:px-3 file:py-1 file:text-sm file:font-medium',
              )}
              {...a11y}
            />
            {value != null && typeof value === 'object' && 'name' in value && (
              <p className="text-xs text-muted-foreground">Selected: {(value as File).name}</p>
            )}
          </FormField>
        );
      }}
    />
  );
}
