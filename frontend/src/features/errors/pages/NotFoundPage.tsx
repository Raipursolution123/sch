import { Link } from 'react-router-dom';
import { buttonVariants } from '@components/ui/button';
import { ROUTES } from '@constants/index';
import { cn } from '@utils/cn';

export function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <p className="text-label text-muted-foreground">404</p>
      <h1 className="mt-2 font-display text-2xl font-medium tracking-display text-foreground">
        Page not found
      </h1>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        That URL doesn&apos;t match anything in this school workspace.
      </p>
      <Link to={ROUTES.home} className={cn(buttonVariants({ variant: 'outline' }), 'mt-6')}>
        Go home
      </Link>
    </div>
  );
}
