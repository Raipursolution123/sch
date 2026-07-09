import { Link } from 'react-router-dom';
import { buttonVariants } from '@components/ui/button';
import { ROUTES } from '@constants/index';
import { env } from '@constants/env';
import { cn } from '@utils/cn';

export function HomePage() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          {env.appName}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          Enterprise-grade multi-school ERP platform. Foundation architecture is ready for modular
          business feature development.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link to={ROUTES.login} className={cn(buttonVariants(), 'px-6 py-3')}>
            Sign in
          </Link>
          <Link to={ROUTES.register} className={cn(buttonVariants({ variant: 'outline' }), 'px-6 py-3')}>
            Get started
          </Link>
        </div>
      </div>
    </section>
  );
}
