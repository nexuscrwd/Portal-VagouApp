import React from 'react';
import { Menu, Search, RefreshCw, Bell, ArrowLeft, Shield } from 'lucide-react';
import { AdminScreenId } from '../../types/admin';

interface AdminHeaderProps {
  currentScreen: AdminScreenId;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  onOpenMobileSidebar: () => void;
  onSwitchToClient: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  currentScreen,
  searchQuery,
  onSearchChange,
  onRefresh,
  isRefreshing,
  onOpenMobileSidebar,
  onSwitchToClient,
}) => {
  const getScreenTitle = (screen: AdminScreenId) => {
    switch (screen) {
      case 'dashboard':
        return 'Visão Geral do Ecossistema';
      case 'salons':
        return 'Gestão de Estabelecimentos';
      case 'appointments':
        return 'Monitor de Agendamentos & Radar';
      case 'moderation':
        return 'Moderação & Validação Cadastral';
      case 'settings':
        return 'Configurações de DNS & Domínios';
      default:
        return 'Painel de Controle';
    }
  };

  return (
    <header className="h-16 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 lg:px-6 flex items-center justify-between gap-4 sticky top-0 z-20">
      {/* Left: Mobile trigger & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
            <span>Admin</span>
            <span>/</span>
            <span className="text-emerald-400 capitalize">{currentScreen}</span>
          </div>
          <h1 className="text-sm lg:text-base font-bold text-white tracking-tight">
            {getScreenTitle(currentScreen)}
          </h1>
        </div>
      </div>

      {/* Center/Right: Search bar & Quick actions */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 w-60 lg:w-80 focus-within:border-emerald-500 transition">
          <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Pesquisar salão, slug, responsável..."
            className="w-full bg-transparent text-xs text-white placeholder-slate-500 outline-none"
          />
        </div>

        {/* Refresh Supabase Data */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          title="Recarregar dados do banco de dados"
          className="p-2 rounded-lg bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white hover:bg-slate-700 transition cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
        </button>

        {/* Back to Client App button */}
        <button
          onClick={onSwitchToClient}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 hover:text-white transition cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-emerald-400" />
          <span>Voltar ao App</span>
        </button>

        {/* Admin Badge */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
          <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-xs shadow-md">
            AD
          </div>
          <div className="hidden xl:block text-left">
            <span className="text-xs font-bold text-white block leading-tight">Master Admin</span>
            <span className="text-[10px] text-emerald-400 block font-medium">Acesso Total</span>
          </div>
        </div>
      </div>
    </header>
  );
};
