import { RouterProvider } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Suspense } from 'react';
import { Toaster } from 'sonner';
import { ErrorBoundary } from '@components/feedback/ErrorBoundary';
import { LoadingState } from '@components/feedback/LoadingState';
import { queryClient } from '@app/query-client';
import { router } from '@routes/index';

export function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Suspense fallback={<LoadingState message="Loading page..." />}>
          <RouterProvider router={router} />
        </Suspense>
        <Toaster position="top-right" richColors closeButton />
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
