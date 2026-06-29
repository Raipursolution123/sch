import { Search } from 'lucide-react';
import { Input } from '@components/ui/input';

interface ListSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function ListSearch({
  value,
  onChange,
  placeholder = 'Search...',
  className,
}: ListSearchProps) {
  return (
    <div className={className ?? 'relative max-w-sm'}>
      <Search
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <Input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-9"
        aria-label={placeholder}
      />
    </div>
  );
}
