import { Component, type ErrorInfo, type ReactNode } from 'react';

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
    console.error('ErrorBoundary caught:', error, errorInfo);
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
              <button
                type="button"
                className="mt-4 rounded-md bg-primary-600 px-4 py-2 text-sm text-white hover:bg-primary-700"
                onClick={() => window.location.reload()}
              >
                Reload page
              </button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
