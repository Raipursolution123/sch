import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Button } from '@components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@components/ui/dialog';
import { Input } from '@components/ui/input';
import { flattenNavigation } from '@constants/navigation';
import { useFilteredNav } from '@hooks/useFilteredNav';
import { cn } from '@utils/cn';

export function ModuleSwitcher() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const navItems = useFilteredNav();

  const routes = useMemo(() => flattenNavigation(navItems), [navItems]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return routes;
    return routes.filter((route) => {
      const haystack = `${route.label} ${route.group ?? ''} ${route.section ?? ''}`.toLowerCase();
      return haystack.includes(normalized);
    });
  }, [query, routes]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen(true);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  function goTo(path: string) {
    setOpen(false);
    setQuery('');
    navigate(path);
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="hidden h-9 gap-2 text-muted-foreground md:inline-flex"
        onClick={() => setOpen(true)}
        aria-label="Jump to module"
      >
        <Search className="h-4 w-4" aria-hidden="true" />
        <span className="hidden lg:inline">Jump to module</span>
        <kbd className="hidden rounded border bg-muted px-1.5 py-0.5 text-[10px] font-medium lg:inline">
          Ctrl+K
        </kbd>
      </Button>

      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setQuery('');
        }}
      >
        <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-lg">
          <DialogHeader className="border-b px-4 py-4">
            <DialogTitle>Jump to module</DialogTitle>
            <DialogDescription>Search modules and pages across the ERP.</DialogDescription>
          </DialogHeader>
          <div className="border-b px-4 py-3">
            <Input
              autoFocus
              placeholder="Search students, fees, settings..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              aria-label="Search modules"
            />
          </div>
          <ul className="max-h-72 overflow-y-auto p-2" role="listbox">
            {filtered.length === 0 ? (
              <li className="px-3 py-6 text-center text-sm text-muted-foreground">
                No modules match your search.
              </li>
            ) : (
              filtered.map((route) => (
                <li key={route.id}>
                  <button
                    type="button"
                    role="option"
                    className={cn(
                      'flex w-full flex-col rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-muted',
                    )}
                    onClick={() => goTo(route.path)}
                  >
                    <span className="text-sm font-medium text-foreground">
                      {route.group ? `${route.group} / ${route.label}` : route.label}
                    </span>
                    {route.section && (
                      <span className="text-xs capitalize text-muted-foreground">
                        {route.section}
                      </span>
                    )}
                  </button>
                </li>
              ))
            )}
          </ul>
        </DialogContent>
      </Dialog>
    </>
  );
}
