import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form';
import { FormField } from '@components/forms/FormField';
import { Switch } from '@components/ui/switch';

interface FormSwitchFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  hint?: string;
  disabled?: boolean;
  onLabel?: string;
  offLabel?: string;
  className?: string;
}

export function FormSwitchField<T extends FieldValues>({
  control,
  name,
  label,
  hint,
  disabled,
  onLabel = 'Yes',
  offLabel = 'No',
  className,
}: FormSwitchFieldProps<T>) {
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
          <div className="flex items-center gap-2 pt-1">
            <Switch
              id={fieldId}
              checked={Boolean(field.value)}
              disabled={disabled}
              onCheckedChange={field.onChange}
            />
            <span className="text-sm text-muted-foreground">
              {field.value ? onLabel : offLabel}
            </span>
          </div>
        </FormField>
      )}
    />
  );
}
