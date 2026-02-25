import { Component, type ErrorInfo, type ReactNode } from "react";
import { Flame } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center p-6 text-center"
        style={{ background: "linear-gradient(135deg, hsl(220 50% 14%), hsl(220 40% 22%))" }}
      >
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
          style={{ background: "linear-gradient(135deg, hsl(24 95% 53%), hsl(16 90% 45%))" }}
        >
          <Flame className="w-8 h-8 text-white" strokeWidth={2.5} />
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">Something went wrong</h1>
        <p className="text-white/60 max-w-md mb-8">
          The dashboard encountered an unexpected error. Reloading usually fixes it.
        </p>

        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 rounded-lg font-semibold text-white transition-colors"
          style={{ background: "hsl(24 95% 53%)" }}
        >
          Reload Dashboard
        </button>

        {this.state.error && (
          <details className="mt-8 text-left max-w-lg w-full">
            <summary className="text-white/40 text-sm cursor-pointer hover:text-white/60">
              Error details
            </summary>
            <pre className="mt-2 text-xs text-white/30 overflow-auto p-3 rounded bg-white/5">
              {this.state.error.message}
              {"\n"}
              {this.state.error.stack}
            </pre>
          </details>
        )}

        <p className="text-white/30 text-xs mt-8">© {new Date().getFullYear()} LaunchHouse Events</p>
      </div>
    );
  }
}

export default ErrorBoundary;
