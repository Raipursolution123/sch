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
          <div className="flex min-h-dvh items-center justify-center bg-canvas-soft p-8">
            <div className="max-w-md rounded-panel border border-border bg-card p-6">
              <h1 className="font-display text-lg font-medium tracking-display text-foreground">
                Something went wrong
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                The page hit an unexpected error. Reload to continue, or go back and try again.
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
