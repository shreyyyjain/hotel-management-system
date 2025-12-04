import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="text-center p-8 max-w-md">
            <div className="text-6xl mb-6">😵</div>
            <h1 className="font-heading text-4xl font-bold text-red-600 mb-4 uppercase tracking-heading">
              Oops!
            </h1>
            <p className="text-gray-700 mb-2 font-medium">Something went wrong.</p>
            <p className="text-sm text-gray-500 mb-8">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="font-heading px-8 py-4 bg-primary text-white rounded-xl font-bold hover:bg-secondary transition-all uppercase tracking-heading shadow-lg hover:shadow-xl"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
