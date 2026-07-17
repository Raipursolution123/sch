import { isRouteErrorResponse, useRouteError, useNavigate } from 'react-router-dom';
import { Button } from '@components/ui/button';
import { ROUTES } from '@constants/index';
import { getApiErrorMessage } from '@utils/error-message';

export function RouteErrorPage() {
  const navigate = useNavigate();
  const error = useRouteError();

  let title = 'Something went wrong';
  let message = 'An unexpected error occurred while loading this page.';

  if (isRouteErrorResponse(error)) {
    title = `${error.status} ${error.statusText}`;
    message = getApiErrorMessage(error.data, error.statusText || message);
  } else {
    message = getApiErrorMessage(error, message);
  }

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center p-6 text-center">
      <h1 className="text-lg font-semibold text-foreground">{title}</h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">{message}</p>
      <div className="mt-6 flex gap-3">
        <Button variant="outline" onClick={() => window.location.reload()}>
          Reload
        </Button>
        <Button variant="outline" onClick={() => navigate(ROUTES.dashboard)}>
          Back to dashboard
        </Button>
      </div>
    </div>
  );
}
