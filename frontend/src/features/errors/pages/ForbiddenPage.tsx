import { Link } from 'react-router-dom';
import { ShieldX } from 'lucide-react';
import { buttonVariants } from '@components/ui/button';
import { ROUTES } from '@constants/routes';
import { cn } from '@utils/cn';

/** Shown when the user is authenticated but lacks permission for the current route. */
export function ForbiddenPage() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center justify-center py-16 text-center">
      <ShieldX className="h-16 w-16 text-muted-foreground" aria-hidden />
      <h1 className="mt-6 text-2xl font-semibold text-foreground">Access denied</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        You do not have permission to view this page. Contact your administrator if you believe this
        is an error.
      </p>
      <Link to={ROUTES.dashboard} className={cn(buttonVariants(), 'mt-8')}>
        Back to dashboard
      </Link>
    </div>
  );
}
