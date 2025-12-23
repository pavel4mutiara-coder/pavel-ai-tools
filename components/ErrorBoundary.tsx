
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
  name?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary component to catch rendering errors in its children.
 * Explicitly extending React.Component ensures inherited members are recognized correctly.
 */
export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    // Initialize component state
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log captured error information
    console.error(`Uncaught error in ${this.props.name || 'Component'}:`, error, errorInfo);
  }

  private handleReset = () => {
    // Clear error state and trigger page reload
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    // Display fallback UI if an error was caught
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center p-12 bg-surface/30 border border-red-500/20 rounded-2xl backdrop-blur-sm animate-fade-in text-center max-w-2xl mx-auto my-8">
          <div className="bg-red-500/10 p-4 rounded-full mb-6">
            <AlertTriangle className="w-12 h-12 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Unexpected Error</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed text-sm">
            Something went wrong while rendering {this.props.name || 'this component'}. 
            The AI might have generated a malformed structure or a runtime conflict occurred.
          </p>
          
          <div className="bg-black/40 p-4 rounded-lg w-full mb-8 text-left overflow-auto max-h-40 border border-border">
            <code className="text-xs text-red-400 font-mono">
              {this.state.error?.message || 'Unknown Error'}
            </code>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={this.handleReset}
              className="flex items-center space-x-2 px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg transition-all font-medium shadow-lg shadow-primary/20"
            >
              <RefreshCcw size={16} />
              <span>Reload Workspace</span>
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="flex items-center space-x-2 px-6 py-2 bg-surface hover:bg-surface/80 text-gray-400 rounded-lg transition-all font-medium border border-border"
            >
              <Home size={16} />
              <span>Go to Dashboard</span>
            </button>
          </div>
        </div>
      );
    }

    // Default to rendering children
    return this.props.children;
  }
}
