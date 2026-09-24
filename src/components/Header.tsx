import React from 'react';
import { User } from 'firebase/auth';
import { HardDrive, LogOut, RefreshCw, Sparkles, FolderSync, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  user: User | null;
  isLoading: boolean;
  onLogin: () => void;
  onLogout: () => void;
  onRefresh: () => void;
  onOpenFigmaSync: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  isLoading,
  onLogin,
  onLogout,
  onRefresh,
  onOpenFigmaSync,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-gradient-to-tr from-indigo-500 to-emerald-400 p-0.5 shadow-lg">
            <div className="w-full h-full bg-slate-900 rounded flex items-center justify-center">
              <HardDrive className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white tracking-tight">Drive Design Hub</h1>
              <span className="bg-emerald-500/10 text-emerald-400 text-xs font-semibold px-2 py-0.5 rounded border border-emerald-500/20">
                Drive + IA
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Inspeção de Telas Figma, Vídeos de Estruturação e Arquitetura UI
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {user && (
            <>
              <button
                id="btn-sync-figma"
                onClick={onOpenFigmaSync}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
                title="Atalhos de busca de Figma e Telas"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Atalhos de Design</span>
              </button>

              <button
                id="btn-refresh-drive"
                onClick={onRefresh}
                disabled={isLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition disabled:opacity-50"
                title="Atualizar arquivos do Drive"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-slate-300 ${isLoading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Atualizar</span>
              </button>
            </>
          )}

          {/* User Auth Section */}
          {user ? (
            <div className="flex items-center gap-3 pl-2 border-l border-slate-800">
              <div className="flex items-center gap-2">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'Usuário'}
                    className="w-8 h-8 rounded border border-slate-700 object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-8 h-8 rounded bg-indigo-600 text-white font-semibold flex items-center justify-center text-xs">
                    {user.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
                <div className="hidden lg:block text-left">
                  <div className="text-xs font-medium text-slate-200 truncate max-w-[140px]">
                    {user.displayName || user.email}
                  </div>
                  <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Drive Conectado
                  </div>
                </div>
              </div>

              <button
                id="btn-logout"
                onClick={onLogout}
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition"
                title="Desconectar do Google"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              id="btn-google-login-header"
              onClick={onLogin}
              disabled={isLoading}
              className="flex items-center gap-2 px-3.5 py-1.5 bg-white hover:bg-slate-100 text-slate-800 rounded text-xs font-semibold shadow-sm transition border border-slate-300 disabled:opacity-60"
            >
              <svg className="w-4 h-4" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
              </svg>
              <span>Conectar Google Drive</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
