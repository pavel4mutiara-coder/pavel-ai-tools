
import React from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';

interface ErrorBoundaryProps {
  children?: React.ReactNode;
  fallback?: React.ReactNode;
  name?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary component to catch rendering errors in its children.
 * This class component provides a standard way to handle runtime errors in the React component tree.
 */
// Fix: Explicitly extending React.Component and using React namespace for types to ensure props and setState are correctly inherited and recognized by TypeScript.
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  // Initializing state as a class property with explicit typing.
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null
  };

  constructor(props: ErrorBoundaryProps) {
    super(props);
  }

  // Static method to update state after an error is caught in a child component.
  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  // Lifecycle method to handle side-effects after an error occurs.
  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Accessing 'props' inherited from React.Component.
    console.error(`Uncaught error in ${this.props.name || 'Component'}:`, error, errorInfo);
  }

  // Resets the error state and reloads the application to recover from the error.
  private handleReset = () => {
    // Accessing 'setState' inherited from React.Component.
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    // Accessing 'state' inherited from React.Component.
    if (this.state.hasError) {
      // Accessing 'props' inherited from React.Component.
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
            {/* Accessing 'props' inherited from React.Component. */}
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

    // Accessing 'props' inherited from React.Component.
    return this.props.children;
  }
}
