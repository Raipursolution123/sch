import * as React from 'react';
import { cn } from '@utils/cn';

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, id, ...props }, ref) => {
    const checkbox = (
      <input
        type="checkbox"
        id={id}
        ref={ref}
        className={cn(
          'h-4 w-4 shrink-0 rounded border border-input text-primary accent-primary',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        {...props}
      />
    );

    if (!label) return checkbox;

    return (
      <label htmlFor={id} className="inline-flex cursor-pointer items-center gap-2 text-sm">
        {checkbox}
        <span>{label}</span>
      </label>
    );
  },
);
Checkbox.displayName = 'Checkbox';

export { Checkbox };
