
import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  name?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary component to catch rendering errors in its children.
 * Fixed inheritance issue by using React.Component explicitly to ensure property visibility.
 */
// Inheriting from React.Component to ensure props and setState are correctly inherited and typed
export class ErrorBoundary extends React.Component<Props, State> {
  // Initializing state with explicit State type
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Fixed: 'props' is now correctly recognized as a member of React.Component
    console.error(`Uncaught error in ${this.props.name || 'Component'}:`, error, errorInfo);
  }

  private handleReset = () => {
    // Fixed: 'setState' is now correctly recognized as a member of React.Component
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      // Fixed: 'props' access within render method
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center p-12 bg-surface/30 border border-red-500/20 rounded-2xl backdrop-blur-sm animate-fade-in text-center max-w-2xl mx-auto my-8">
          <div className="bg-red-500/10 p-4 rounded-full mb-6">
            <AlertTriangle className="w-12 h-12 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Unexpected Error</h2>
          <p className="text-gray-400 mb-8 leading-relaxed">
            Something went wrong while rendering {this.props.name || 'this component'}. 
            The AI might have generated a malformed structure or a runtime conflict occurred.
          </p>
          
          <div className="bg-black/40 p-4 rounded-lg w-full mb-8 text-left overflow-auto max-h-40 border border-white/5">
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
              className="flex items-center space-x-2 px-6 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg transition-all font-medium border border-white/10"
            >
              <Home size={16} />
              <span>Go to Dashboard</span>
            </button>
          </div>
        </div>
      );
    }

    // Fixed: 'props.children' is now correctly recognized via inheritance
    return this.props.children;
  }
}
