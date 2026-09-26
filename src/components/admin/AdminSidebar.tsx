import React from 'react';
import {
  LayoutDashboard,
  Building2,
  CalendarCheck,
  ShieldAlert,
  Settings,
  ArrowLeft,
  Store,
  ExternalLink,
  ShieldCheck,
  Radio,
  X,
} from 'lucide-react';
import { AdminScreenId } from '../../types/admin';

interface AdminSidebarProps {
  currentScreen: AdminScreenId;
  onSelectScreen: (screen: AdminScreenId) => void;
  onSwitchToClient: () => void;
  onSwitchToPartner: () => void;
  onCloseMobile?: () => void;
  pendingCount?: number;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  currentScreen,
  onSelectScreen,
  onSwitchToClient,
  onSwitchToPartner,
  onCloseMobile,
  pendingCount = 0,
}) => {
  const menuItems: { id: AdminScreenId; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'salons', label: 'Estabelecimentos', icon: Building2 },
    { id: 'appointments', label: 'Agendamentos & Radar', icon: CalendarCheck },
    { id: 'moderation', label: 'Moderação de Salões', icon: ShieldAlert, badge: pendingCount > 0 ? pendingCount : undefined },
    { id: 'settings', label: 'Configurações & DNS', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between h-full select-none shrink-0 z-30">
      {/* Top Brand & Nav */}
      <div className="p-4 space-y-6">
        {/* Brand Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-950/40">
              <span className="text-white font-black text-xl tracking-tighter">V</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm tracking-tight text-white font-['Poppins']">VagouApp</span>
                <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Master
                </span>
              </div>
              <span className="text-[10px] text-slate-400 block font-medium">Torre de Controle</span>
            </div>
          </div>

          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 block mb-2">
            Gestão & Ecossistema
          </span>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectScreen(item.id);
                  onCloseMobile?.();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                  isActive
                    ? 'bg-emerald-500 text-white font-bold shadow-md shadow-emerald-950/50'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                      isActive
                        ? 'bg-white text-emerald-800'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Shortcuts & Admin Profile */}
      <div className="p-4 border-t border-slate-800/80 space-y-3">
        {/* System Health Status Indicator */}
        <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-slate-300 font-medium">Supabase DB</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 font-bold">Online</span>
        </div>

        {/* Quick App Switchers */}
        <div className="space-y-1">
          <button
            onClick={onSwitchToClient}
            className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-[11px] font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <ArrowLeft className="w-3.5 h-3.5 text-emerald-400" />
              <span>Ver App do Cliente</span>
            </div>
            <ExternalLink className="w-3 h-3 text-slate-500" />
          </button>

          <button
            onClick={onSwitchToPartner}
            className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-[11px] font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Store className="w-3.5 h-3.5 text-amber-400" />
              <span>Ver Modo Salão Parceiro</span>
            </div>
            <ExternalLink className="w-3 h-3 text-slate-500" />
          </button>
        </div>

        {/* Admin User Pill */}
        <div className="pt-2 border-t border-slate-800 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-xs font-bold text-white block truncate">Super Administrador</span>
            <span className="text-[10px] text-slate-400 font-mono block truncate">nexuscrwd@gmail.com</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
