import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

class RootErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; errorMessage: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: unknown) {
    return {
      hasError: true,
      errorMessage: error instanceof Error ? error.message : String(error)
    };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0B0F17] text-slate-100 flex items-center justify-center p-6">
          <div className="max-w-md w-full rounded-2xl bg-slate-900 border border-rose-500/40 p-6 space-y-4 text-xs">
            <div className="text-base font-bold text-rose-400">
              YUSUF CODE — Хатои боркунӣ
            </div>
            <p className="text-slate-300 font-mono break-words">
              {this.state.errorMessage}
            </p>
            <button
              type="button"
              onClick={() => {
                try {
                  localStorage.clear();
                } catch {
                  // ignore
                }
                window.location.reload();
              }}
              className="w-full py-2.5 rounded-xl bg-sky-500 text-slate-950 font-semibold"
            >
              Бозсозии муҳити корӣ (Reload)
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <RootErrorBoundary>
    <App />
  </RootErrorBoundary>
);

