import { Link } from 'react-router-dom';
import { buttonVariants } from '@components/ui/button';
import { ROUTES } from '@constants/index';
import { cn } from '@utils/cn';

export function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <h1 className="text-6xl font-bold text-muted-foreground/40">404</h1>
      <p className="mt-4 text-lg text-muted-foreground">Page not found</p>
      <Link to={ROUTES.home} className={cn(buttonVariants({ variant: 'link' }), 'mt-6')}>
        Go home
      </Link>
    </div>
  );
}
