import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Trash2 } from 'lucide-react';
import { clearPersistState } from '../../lib/storage';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('StudySOS caught an unhandled error:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetData = () => {
    clearPersistState();
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl text-center">
            <div className="w-14 h-14 bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-7 h-7" aria-hidden="true" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              Something went wrong
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
              StudySOS encountered an unexpected display issue. Your data is likely safe in local storage.
            </p>

            {this.state.error && (
              <div className="mb-6 p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-mono text-left text-slate-700 dark:text-slate-300 overflow-x-auto max-h-32">
                {this.state.error.message}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={this.handleReload}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-medium text-sm rounded-xl transition-colors focus:ring-2 focus:ring-teal-500 min-h-[44px]"
              >
                <RefreshCw className="w-4 h-4" />
                Reload App
              </button>
              <button
                type="button"
                onClick={this.handleResetData}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-rose-600 dark:text-rose-400 font-medium text-sm rounded-xl transition-colors focus:ring-2 focus:ring-slate-400 min-h-[44px]"
              >
                <Trash2 className="w-4 h-4" />
                Reset Local Data
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
