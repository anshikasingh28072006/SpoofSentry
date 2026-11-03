import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    // If it's a MetaMask or extension error, do not break the app UI
    const msg = error?.message || '';
    if (
      msg.includes('MetaMask') ||
      msg.includes('Failed to connect to MetaMask') ||
      msg.includes('ethereum')
    ) {
      return { hasError: false, error: null };
    }
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const msg = (error?.message || '') + ' ' + (error?.stack || '');
    if (
      msg.includes('MetaMask') ||
      msg.includes('Failed to connect to MetaMask') ||
      msg.includes('ethereum')
    ) {
      // Ignore extension-injected errors
      return;
    }
    console.error('Uncaught application error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public override render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#EAE9E4] text-[#1A1A1B] flex items-center justify-center p-6 font-mono">
          <div className="max-w-md w-full bg-white border-2 border-[#1A1A1B] p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-[#B22222]">
              <AlertTriangle className="w-6 h-6" />
              <h2 className="font-serif font-bold text-lg text-[#1A1A1B]">Application Error Encountered</h2>
            </div>
            <p className="text-xs text-[#1A1A1B]/80 font-sans leading-relaxed">
              An unexpected client runtime error occurred. You can safely reload the page to restore the application.
            </p>
            {this.state.error && (
              <div className="bg-[#FAF9F5] border border-[#1A1A1B]/20 p-2.5 text-[11px] text-[#B22222] font-mono break-all max-h-32 overflow-y-auto">
                {this.state.error.message}
              </div>
            )}
            <button
              type="button"
              onClick={this.handleReset}
              className="w-full py-2.5 bg-[#1A1A1B] hover:bg-[#333] text-white font-mono font-bold text-xs border-2 border-[#1A1A1B] flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>RELOAD APPLICATION</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
