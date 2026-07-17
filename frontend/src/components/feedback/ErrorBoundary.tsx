import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from '@components/ui/button';
import { formatErrorForLog } from '@utils/error-message';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', formatErrorForLog(error), errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex min-h-screen items-center justify-center p-8">
            <div className="max-w-md rounded-lg border border-red-200 bg-white p-6 shadow-sm">
              <h1 className="text-lg font-semibold text-red-700">Something went wrong</h1>
              <p className="mt-2 text-sm text-gray-600">
                {this.state.error?.message || 'An unexpected error occurred.'}
              </p>
              <Button type="button" className="mt-4" onClick={() => window.location.reload()}>
                Reload page
              </Button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
