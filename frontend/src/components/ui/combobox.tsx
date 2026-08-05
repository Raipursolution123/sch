import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { ChevronsUpDown, Check } from 'lucide-react';
import { cn } from '@utils/cn';
import { controlHeightClassName, controlInputClassName } from '@utils/form-control';

export interface ComboboxOption {
  value: string;
  label: string;
}

interface ComboboxProps {
  id?: string;
  options: ComboboxOption[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  className?: string;
  emptyMessage?: string;
  /** Allow clearing to empty string (e.g. “All classes”). */
  allowEmpty?: boolean;
  emptyLabel?: string;
}

/**
 * Searchable single-select for dense ERP filters (class / section / session).
 * Keyboard: ArrowUp/Down, Enter, Escape. No extra deps.
 */
export function Combobox({
  id,
  options,
  value,
  onValueChange,
  placeholder = 'Select…',
  searchPlaceholder = 'Search…',
  disabled,
  className,
  emptyMessage = 'No matches',
  allowEmpty,
  emptyLabel = 'All',
}: ComboboxProps) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  const selected = options.find((o) => o.value === value);
  const displayLabel = value === '' && allowEmpty ? emptyLabel : (selected?.label ?? placeholder);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    const base = allowEmpty ? [{ value: '', label: emptyLabel }, ...options] : options;
    if (!term) return base;
    return base.filter((o) => o.label.toLowerCase().includes(term));
  }, [options, query, allowEmpty, emptyLabel]);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onPointer);
    return () => document.removeEventListener('mousedown', onPointer);
  }, [open]);

  useEffect(() => {
    if (open) {
      setQuery('');
      const idx = filtered.findIndex((o) => o.value === value);
      setActiveIndex(idx >= 0 ? idx : 0);
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps -- reset on open only

  const commit = (next: string) => {
    onValueChange(next);
    setOpen(false);
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (disabled) return;
    if (!open && (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      setOpen(true);
      return;
    }
    if (!open) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      setOpen(false);
      return;
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, Math.max(filtered.length - 1, 0)));
      return;
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
      return;
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      const option = filtered[activeIndex];
      if (option) commit(option.value);
    }
  };

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <button
        type="button"
        id={id}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        className={cn(
          controlInputClassName,
          controlHeightClassName,
          'inline-flex items-center justify-between gap-2 text-left',
          !selected && !(allowEmpty && value === '') && 'text-muted-foreground',
        )}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={onKeyDown}
      >
        <span className="truncate">{displayLabel}</span>
        <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" aria-hidden="true" />
      </button>

      {open && (
        <div className="absolute z-40 mt-1 w-full overflow-hidden rounded-sm border border-border bg-card shadow-md">
          <div className="border-b border-border p-1.5">
            <input
              autoFocus
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActiveIndex(0);
              }}
              onKeyDown={onKeyDown}
              placeholder={searchPlaceholder}
              className={cn(controlInputClassName, 'h-8 min-h-8')}
              aria-label={searchPlaceholder}
            />
          </div>
          <ul
            id={listId}
            role="listbox"
            aria-activedescendant={
              filtered[activeIndex] ? `${listId}-opt-${activeIndex}` : undefined
            }
            className="max-h-56 overflow-y-auto py-1"
          >
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-sm text-muted-foreground">{emptyMessage}</li>
            ) : (
              filtered.map((option, index) => {
                const isSelected = option.value === value;
                const isActive = index === activeIndex;
                return (
                  <li key={`${option.value}-${option.label}`} role="none">
                    <button
                      type="button"
                      id={`${listId}-opt-${index}`}
                      role="option"
                      aria-selected={isSelected}
                      className={cn(
                        'flex w-full items-center gap-2 px-3 py-2 text-left text-sm',
                        isActive && 'bg-primary-pale',
                        isSelected && 'font-medium text-primary',
                      )}
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => commit(option.value)}
                    >
                      <Check
                        className={cn(
                          'h-3.5 w-3.5 shrink-0',
                          isSelected ? 'opacity-100' : 'opacity-0',
                        )}
                        aria-hidden="true"
                      />
                      <span className="truncate">{option.label}</span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
