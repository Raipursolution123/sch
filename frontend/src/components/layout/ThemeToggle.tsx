import { Moon, Sun, Monitor } from 'lucide-react';
import { Button } from '@components/ui/button';
import { useTheme, type ThemeMode } from '@hooks/useTheme';

const MODES: { value: ThemeMode; label: string; icon: typeof Sun }[] = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
];

export function ThemeToggle() {
  const { mode, setMode } = useTheme();

  return (
    <div className="flex items-center gap-1 rounded-lg border bg-muted/40 p-1" role="group" aria-label="Theme">
      {MODES.map(({ value, label, icon: Icon }) => (
        <Button
          key={value}
          type="button"
          variant={mode === value ? 'secondary' : 'ghost'}
          size="sm"
          className="h-8 px-2"
          onClick={() => setMode(value)}
          aria-pressed={mode === value}
          aria-label={`${label} theme`}
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
        </Button>
      ))}
    </div>
  );
}
