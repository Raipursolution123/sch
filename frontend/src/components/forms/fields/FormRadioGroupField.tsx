import { cn } from '@utils/cn';

interface FormRadioGroupFieldProps {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  optional?: boolean;
  disabled?: boolean;
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string; description?: string }[];
  className?: string;
}

export function FormRadioGroupField({
  label,
  hint,
  error,
  required,
  optional,
  disabled,
  name,
  value,
  onChange,
  options,
  className,
}: FormRadioGroupFieldProps) {
  return (
    <fieldset
      disabled={disabled}
      className={cn('space-y-2', disabled && 'opacity-60', className)}
    >
      <legend className="text-sm font-medium text-foreground">
        {label}
        {required && (
          <span className="ml-0.5 text-destructive" aria-hidden="true">
            *
          </span>
        )}
        {optional && !required && (
          <span className="ml-2 text-xs font-normal text-muted-foreground">(optional)</span>
        )}
      </legend>
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      <div className="space-y-2">
        {options.map((option) => {
          const id = `${name}-${option.value}`;
          return (
            <label
              key={option.value}
              htmlFor={id}
              className="flex cursor-pointer items-start gap-2 rounded-md border border-border/70 px-3 py-2 has-[:checked]:border-primary/40 has-[:checked]:bg-primary-pale/40"
            >
              <input
                id={id}
                type="radio"
                name={name}
                value={option.value}
                checked={value === option.value}
                onChange={() => onChange(option.value)}
                className="mt-0.5 h-4 w-4 accent-primary"
              />
              <span>
                <span className="block text-sm font-medium">{option.label}</span>
                {option.description && (
                  <span className="block text-xs text-muted-foreground">{option.description}</span>
                )}
              </span>
            </label>
          );
        })}
      </div>
      {error && (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
    </fieldset>
  );
}
