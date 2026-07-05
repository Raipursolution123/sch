import { Link } from 'react-router-dom';
import { ROUTES } from '@constants/index';
import { env } from '@constants/env';

export function HomePage() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          {env.appName}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
          Enterprise-grade multi-school ERP platform. Foundation architecture is ready for modular
          business feature development.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link
            to={ROUTES.login}
            className="rounded-md bg-primary-600 px-6 py-3 text-sm font-medium text-white hover:bg-primary-700"
          >
            Sign in
          </Link>
          <Link
            to={ROUTES.register}
            className="rounded-md border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Get started
          </Link>
        </div>
      </div>
    </section>
  );
}
