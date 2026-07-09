import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form';
import { FormField, getFormFieldA11yProps } from '@components/forms/FormField';
import { Input } from '@components/ui/input';

interface FormDateFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  hint?: string;
  required?: boolean;
  optional?: boolean;
  disabled?: boolean;
  className?: string;
}

export function FormDateField<T extends FieldValues>({
  control,
  name,
  label,
  hint,
  required,
  optional,
  disabled,
  className,
}: FormDateFieldProps<T>) {
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
              type="date"
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

type FormTimeFieldProps<T extends FieldValues> = FormDateFieldProps<T>;

export function FormTimeField<T extends FieldValues>(props: FormTimeFieldProps<T>) {
  const fieldId = String(props.name);

  return (
    <Controller
      control={props.control}
      name={props.name}
      render={({ field, fieldState }) => {
        const a11y = getFormFieldA11yProps(fieldId, {
          hint: props.hint,
          error: fieldState.error?.message,
        });
        return (
          <FormField
            label={props.label}
            htmlFor={fieldId}
            hint={props.hint}
            error={fieldState.error?.message}
            required={props.required}
            optional={props.optional}
            disabled={props.disabled}
            className={props.className}
          >
            <Input
              id={fieldId}
              type="time"
              disabled={props.disabled}
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
