import { Outlet, Link } from 'react-router-dom';
import { BrandMark } from '@components/brand/BrandMark';
import { buttonVariants } from '@components/ui/button';
import { ROUTES } from '@constants/index';
import { cn } from '@utils/cn';

export function MainLayout() {
  return (
    <div className="min-h-dvh bg-background">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-sm focus:bg-card focus:px-4 focus:py-2 focus:outline-none focus:ring-2 focus:ring-ring"
      >
        Skip to main content
      </a>
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <BrandMark to={ROUTES.home} />
          <nav className="flex items-center gap-3 text-sm" aria-label="Account">
            <Link to={ROUTES.login} className="text-muted-foreground hover:text-foreground">
              Sign in
            </Link>
            <Link to={ROUTES.register} className={cn(buttonVariants({ size: 'sm' }))}>
              Register
            </Link>
          </nav>
        </div>
      </header>
      <main id="main-content" tabIndex={-1} className="outline-none">
        <Outlet />
      </main>
    </div>
  );
}
