import { logSafeError } from '../utils/safeError';
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logSafeError('ErrorBoundary caught an unhandled error:', error);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      window.location.reload();
    }
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    try {
      window.location.hash = '';
      window.history.replaceState(null, '', window.location.pathname);
    } catch {}
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[320px] w-full flex items-center justify-center p-6 bg-[#F7F8F4]">
          <div className="max-w-lg w-full bg-white border border-[#E1E7E1] rounded-2xl p-6 sm:p-8 space-y-4 shadow-sm text-center">
            <div className="w-12 h-12 rounded-xl bg-[#FFF9EE] border border-[#E6C687] text-[#9A6700] flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-[#232A24]">
                {this.props.fallbackTitle || 'Se produjo un problema al cargar esta sección'}
              </h3>
              <p className="text-xs text-[#59645C] leading-relaxed">
                El sistema aisló el error para mantener la plataforma disponible. Puedes intentar recargar la sección o volver al inicio.
              </p>
            </div>

            {import.meta.env?.DEV && this.state.error?.message && (
              <pre className="p-3 bg-[#F7F8F4] border border-[#E1E7E1] rounded-xl text-[11px] font-mono text-[#8A6318] text-left overflow-x-auto max-h-32">
                {this.state.error.message}
              </pre>
            )}

            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                onClick={this.handleReload}
                className="px-4 py-2 bg-[#407B5D] hover:bg-[#33654C] text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reintentar</span>
              </button>
              <button
                onClick={this.handleGoHome}
                className="px-4 py-2 bg-white hover:bg-[#E8EEE8] border border-[#E1E7E1] text-[#232A24] text-xs font-semibold rounded-xl flex items-center gap-2 transition-all cursor-pointer"
              >
                <Home className="w-3.5 h-3.5 text-[#59645C]" />
                <span>Ir al Inicio</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
