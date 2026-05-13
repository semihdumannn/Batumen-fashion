'use client';

import { Component, type ReactNode } from 'react';

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

  componentDidCatch(error: Error, info: { componentStack: string }) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[ErrorBoundary]', error, info.componentStack);
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      if (process.env.NODE_ENV === 'development') {
        return (
          <div className="min-h-screen flex items-center justify-center p-8 bg-gray-50">
            <div className="max-w-2xl w-full bg-white border border-red-200 p-6">
              <h2 className="text-lg font-bold text-red-600 mb-2">Render Hatası</h2>
              <pre className="text-xs text-red-500 overflow-auto whitespace-pre-wrap bg-red-50 p-4">
                {this.state.error?.message}
                {'\n\n'}
                {this.state.error?.stack}
              </pre>
              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                className="mt-4 px-4 py-2 bg-black text-white text-sm"
              >
                Tekrar Dene
              </button>
            </div>
          </div>
        );
      }
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500 text-sm mb-4">Bir hata oluştu.</p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="px-6 py-2 bg-black text-white text-sm"
            >
              Tekrar Dene
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
