import { Link } from 'react-router-dom';
import { BrandMark } from '@components/brand/BrandMark';
import { buttonVariants } from '@components/ui/button';
import { ROUTES } from '@constants/index';
import { useSchoolBrand } from '@hooks/usePublicBranding';
import { cn } from '@utils/cn';

export function HomePage() {
  const { name } = useSchoolBrand();

  return (
    <section className="mx-auto flex max-w-3xl flex-col items-center px-4 py-20 text-center sm:px-6 lg:px-8">
      <BrandMark variant="hero" />
      <h1 className="sr-only">{name}</h1>
      <p className="mt-6 max-w-xl text-lg text-muted-foreground">
        Run admissions, attendance, fees, exams, and day-to-day school operations from one calm
        admin workspace.
      </p>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Link to={ROUTES.login} className={cn(buttonVariants(), 'px-6 py-3')}>
          Sign in
        </Link>
        <Link
          to={ROUTES.register}
          className={cn(buttonVariants({ variant: 'outline' }), 'px-6 py-3')}
        >
          Create account
        </Link>
      </div>
    </section>
  );
}
