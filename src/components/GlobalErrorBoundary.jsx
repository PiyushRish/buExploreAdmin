import React from 'react';
import { AlertCircle } from 'lucide-react';

class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(_error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    console.error("Uncaught rendering error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8 font-sans">
          <div className="bg-white p-8 rounded-2xl shadow-xl max-w-2xl w-full border border-red-100">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Something went wrong</h1>
                <p className="text-gray-500">The application encountered an unexpected error.</p>
              </div>
            </div>
            
            <div className="bg-gray-900 rounded-xl p-4 overflow-auto max-h-96">
              <p className="text-red-400 font-mono text-sm font-bold mb-2">
                {this.state.error && this.state.error.toString()}
              </p>
              <pre className="text-gray-300 font-mono text-xs whitespace-pre-wrap">
                {this.state.errorInfo && this.state.errorInfo.componentStack}
              </pre>
            </div>

            <button
              onClick={() => window.location.reload()}
              className="mt-6 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-xl transition-colors w-full"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default GlobalErrorBoundary;
