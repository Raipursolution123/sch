import { useEffect, useId, useMemo, useRef, useState } from 'react';
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
  const [activeIndex, setActiveIndex] = useState(0);
  const navigate = useNavigate();
  const navItems = useFilteredNav();
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    setActiveIndex(0);
  }, [query, open]);

  function goTo(path: string) {
    setOpen(false);
    setQuery('');
    setActiveIndex(0);
    navigate(path);
  }

  function onListKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (filtered.length === 0) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % filtered.length);
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((index) => (index - 1 + filtered.length) % filtered.length);
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      const route = filtered[activeIndex];
      if (route) goTo(route.path);
    }
  }

  const activeId = filtered[activeIndex]
    ? `${listId}-option-${filtered[activeIndex].id}`
    : undefined;

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-8 gap-2 border-border bg-card px-2.5 text-xs text-muted-foreground hover:border-rule-2 hover:text-foreground sm:px-3"
        onClick={() => setOpen(true)}
        aria-label="Search modules"
        aria-keyshortcuts="Control+K Meta+K"
      >
        <Search className="h-3.5 w-3.5" aria-hidden="true" />
        <span className="hidden lg:inline">Search</span>
        <kbd className="hidden rounded-sm border border-border bg-card px-1 py-0.5 font-mono text-[10px] font-medium sm:inline">
          ⌘K
        </kbd>
      </Button>

      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) {
            setQuery('');
            setActiveIndex(0);
          }
        }}
      >
        <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-lg sm:rounded-panel">
          <DialogHeader className="border-b border-border px-4 py-4">
            <DialogTitle className="font-display font-medium tracking-display">
              Jump to module
            </DialogTitle>
            <DialogDescription>Search modules and pages across the ERP.</DialogDescription>
          </DialogHeader>
          <div className="border-b border-border px-4 py-3">
            <Input
              ref={inputRef}
              autoFocus
              placeholder="Search students, fees, settings…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={onListKeyDown}
              aria-label="Search modules"
              aria-controls={listId}
              aria-activedescendant={activeId}
              role="combobox"
              aria-expanded={open}
              aria-autocomplete="list"
            />
          </div>
          <ul id={listId} className="max-h-72 overflow-y-auto p-2" role="listbox">
            {filtered.length === 0 ? (
              <li className="px-3 py-6 text-center text-sm text-muted-foreground">
                No modules match your search.
              </li>
            ) : (
              filtered.map((route, index) => {
                const selected = index === activeIndex;
                return (
                  <li key={route.id} role="presentation">
                    <button
                      type="button"
                      id={`${listId}-option-${route.id}`}
                      role="option"
                      aria-selected={selected}
                      className={cn(
                        'flex w-full flex-col rounded-sm px-3 py-2.5 text-left transition-colors',
                        selected ? 'bg-primary-pale text-ink' : 'hover:bg-muted',
                      )}
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => goTo(route.path)}
                    >
                      <span className="text-sm font-medium text-foreground">
                        {route.group ? `${route.group} / ${route.label}` : route.label}
                      </span>
                      {route.section && (
                        <span className="text-label mt-0.5 capitalize text-muted-foreground">
                          {route.section}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </DialogContent>
      </Dialog>
    </>
  );
}
