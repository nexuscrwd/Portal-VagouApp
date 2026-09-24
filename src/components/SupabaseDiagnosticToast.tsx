import React, { useState, useEffect } from 'react';
import { Database, CheckCircle2, AlertTriangle, X, RefreshCw, UserCheck, ShieldCheck } from 'lucide-react';
import { checkSupabaseHealth, SupabaseHealthStatus } from '../services/supabaseApi';
import { hapticLight } from '../utils/haptics';

interface SupabaseDiagnosticToastProps {
  onDismiss?: () => void;
}

export const SupabaseDiagnosticToast: React.FC<SupabaseDiagnosticToastProps> = ({ onDismiss }) => {
  const [health, setHealth] = useState<SupabaseHealthStatus>({
    status: 'checking',
    userEmail: null,
    userId: null,
    dbAccessible: false,
    latencyMs: 0,
    message: 'Verificando conexão com o Supabase...',
  });
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const runDiagnostic = async () => {
    setIsRefreshing(true);
    const result = await checkSupabaseHealth();
    setHealth(result);
    setIsRefreshing(false);
  };

  useEffect(() => {
    runDiagnostic();
  }, []);

  // Auto-dismiss após 6 segundos se a conexão for bem-sucedida
  useEffect(() => {
    if (health.status === 'connected') {
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onDismiss) onDismiss();
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [health.status, onDismiss]);

  if (!isVisible) return null;

  const isSuccess = health.status === 'connected';
  const isAuthOnly = health.status === 'auth_only';
  const isError = health.status === 'error';
  const isChecking = health.status === 'checking' || isRefreshing;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-3 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-3 pointer-events-auto transition-all duration-300 ease-out"
    >
      <div
        className={`rounded-2xl p-3 shadow-2xl backdrop-blur-xl border transition-colors ${
          isSuccess
            ? 'bg-slate-900/95 border-emerald-500/40 text-slate-100 shadow-emerald-950/40'
            : isAuthOnly
            ? 'bg-slate-900/95 border-amber-500/40 text-slate-100 shadow-amber-950/40'
            : isError
            ? 'bg-slate-900/95 border-rose-500/40 text-slate-100 shadow-rose-950/40'
            : 'bg-slate-900/95 border-slate-800 text-slate-200'
        }`}
      >
        <div className="flex items-start gap-2.5">
          {/* Status Icon */}
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
              isSuccess
                ? 'bg-emerald-500 text-white'
                : isAuthOnly
                ? 'bg-amber-500 text-white'
                : isError
                ? 'bg-rose-500 text-white'
                : 'bg-slate-800 text-slate-300'
            }`}
          >
            {isChecking ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : isSuccess ? (
              <CheckCircle2 className="w-4.5 h-4.5" />
            ) : isAuthOnly ? (
              <UserCheck className="w-4.5 h-4.5" />
            ) : (
              <AlertTriangle className="w-4.5 h-4.5" />
            )}
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0 pr-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold tracking-tight text-white flex items-center gap-1">
                <Database className="w-3.5 h-3.5 text-emerald-400" />
                Supabase
              </span>
              <span
                className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                  isSuccess
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : isAuthOnly
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : isError
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {isChecking
                  ? 'Checando...'
                  : isSuccess
                  ? `Online • ${health.latencyMs}ms`
                  : isAuthOnly
                  ? 'Auth OK'
                  : 'Falha'}
              </span>

              {health.userEmail && (
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-emerald-600 text-white flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Logado
                </span>
              )}
            </div>

            <p className="text-[11px] text-slate-300 mt-1 leading-tight line-clamp-2">
              {health.message}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={() => {
                hapticLight();
                runDiagnostic();
              }}
              title="Testar Conexão Novamente"
              disabled={isChecking}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => {
                hapticLight();
                setIsVisible(false);
                if (onDismiss) onDismiss();
              }}
              title="Fechar Aviso"
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Success auto-dismiss indicator bar */}
        {isSuccess && (
          <div className="w-full bg-slate-800 h-0.5 rounded-full mt-2.5 overflow-hidden">
            <div className="bg-emerald-500 h-full w-full animate-[shrink_6s_linear_forwards] origin-left" />
          </div>
        )}
      </div>
    </div>
  );
};
