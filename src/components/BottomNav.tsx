import React from 'react';
import { Home, MapPin, Calendar, Search, Zap, Sparkles, Store } from 'lucide-react';
import { ScreenId } from '../types';
import { useTheme } from '../context/ThemeContext';
import { hapticLight } from '../utils/haptics';

export interface SalonNavContext {
  activeTab: 'home' | 'servicos' | 'vagas' | 'espaco';
  onSelectTab: (tab: 'home' | 'servicos' | 'vagas' | 'espaco') => void;
  spaceTabLabel?: string;
  SpaceIcon?: React.ComponentType<{ className?: string }>;
  ServicesIcon?: React.ComponentType<{ className?: string }>;
}

interface BottomNavProps {
  currentScreen: ScreenId;
  onSelectScreen: (screen: ScreenId) => void;
  onOpenSearchModal?: () => void;
  onSelectFlashCategory?: () => void;
  isFlashActive?: boolean;
  salonContext?: SalonNavContext | null;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentScreen,
  onSelectScreen,
  onOpenSearchModal,
  onSelectFlashCategory,
  isFlashActive = false,
  salonContext,
}) => {
  const { isDark } = useTheme();

  // Se estiver navegando dentro de um estabelecimento, exibe o menu do estabelecimento (4 abas: Início, Serviços, Agenda, Espaço)
  if (salonContext) {
    const establishmentTabs = [
      { id: 'home', label: 'Início', icon: Home },
      { id: 'servicos', label: 'Serviços', icon: salonContext.ServicesIcon || Sparkles },
      { id: 'vagas', label: 'Agendar', icon: Calendar },
      { id: 'espaco', label: salonContext.spaceTabLabel || 'Espaço', icon: salonContext.SpaceIcon || Store },
    ];

    return (
      <nav className={`flex-shrink-0 w-full h-[70px] ${
        isDark
          ? 'bg-[#151A1E]/95 border-slate-800/90 shadow-[0_-4px_16px_rgba(0,0,0,0.5)]'
          : 'bg-white/95 border-slate-200/90 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]'
      } backdrop-blur-md border-t px-3 py-1 my-0 mx-0 flex items-center justify-around z-30 transition-colors`}>
        {establishmentTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = salonContext.activeTab === tab.id;

          return (
            <button
              key={tab.id}
              id={`nav-salon-${tab.id}`}
              onClick={() => {
                hapticLight();
                salonContext.onSelectTab(tab.id as any);
              }}
              className="flex flex-col items-center justify-center gap-1 py-1 px-3 transition active:scale-95 cursor-pointer group"
            >
              <div className={`w-[34px] h-[34px] rounded flex items-center justify-center transition-all ${
                isActive
                  ? isDark
                    ? 'bg-emerald-950/80 border border-[#20C933]/60 text-[#20C933] scale-105 shadow-[0_0_12px_rgba(32,201,51,0.25)]'
                    : 'bg-emerald-50 border border-[#20C933]/60 text-[#087A2A] scale-105 shadow-[0_0_12px_rgba(32,201,51,0.18)]'
                  : isDark
                    ? 'text-slate-400 hover:text-slate-200'
                    : 'text-slate-500 hover:text-slate-900'
              }`}>
                <Icon className="w-5 h-5 stroke-[2.2]" />
              </div>
              <span className={`text-[10px] tracking-wide font-['Poppins'] font-bold ${
                isActive
                  ? isDark ? 'text-[#20C933]' : 'text-[#087A2A]'
                  : isDark ? 'text-slate-400' : 'text-slate-500'
              }`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>
    );
  }

  const tabs = [
    { id: 'home' as ScreenId, label: 'Home', icon: Home },
    { id: 'busca' as ScreenId, label: 'Busca', icon: Search, isAction: true },
    { id: 'flash' as any, label: 'Relâmpago', icon: Zap, isFlash: true },
    { id: 'mapa' as ScreenId, label: 'Mapa', icon: MapPin },
  ];

  const handleTabClick = (tabId: string, isAction?: boolean, isFlash?: boolean) => {
    hapticLight();
    if (isFlash) {
      if (onSelectFlashCategory) {
        onSelectFlashCategory();
      }
      return;
    }
    if (isAction && tabId === 'busca') {
      if (onOpenSearchModal) {
        onOpenSearchModal();
      }
      return;
    }
    onSelectScreen(tabId as ScreenId);
  };

  return (
    <nav className={`flex-shrink-0 w-full h-[70px] ${
      isDark
        ? 'bg-[#151A1E]/95 border-slate-800/90 shadow-[0_-4px_16px_rgba(0,0,0,0.5)]'
        : 'bg-white/95 border-slate-200/90 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]'
    } backdrop-blur-md border-t px-3 py-1 my-0 mx-0 flex items-center justify-around z-30 transition-colors`}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isFlash = tab.isFlash;
        const isActive =
          (!isFlash && !tab.isAction && (
            (currentScreen === tab.id && !(tab.id === 'home' && isFlashActive)) ||
            (tab.id === 'home' && currentScreen === 'lista-ofertas' && !isFlashActive) ||
            (tab.id === 'home' && currentScreen === 'detalhe-oferta' && !isFlashActive)
          )) ||
          (isFlash && isFlashActive);

        return (
          <button
            key={tab.id}
            id={isFlash ? "nav-flash-btn" : `nav-${tab.id}`}
            onClick={() => handleTabClick(tab.id, tab.isAction, tab.isFlash)}
            className="flex flex-col items-center justify-center gap-1 py-1 px-2.5 transition active:scale-95 cursor-pointer group"
          >
            <div className={`w-[34px] h-[34px] rounded flex items-center justify-center transition-all ${
              isActive
                ? isDark
                  ? 'bg-emerald-950/80 border border-[#20C933]/60 text-[#20C933] scale-105 shadow-[0_0_12px_rgba(32,201,51,0.25)]'
                  : 'bg-emerald-50 border border-[#20C933]/60 text-[#087A2A] scale-105 shadow-[0_0_12px_rgba(32,201,51,0.18)]'
                : isDark
                  ? 'text-slate-400 hover:text-slate-200'
                  : 'text-slate-500 hover:text-slate-900'
            }`}>
              {isFlash ? (
                <span className="text-lg">⚡</span>
              ) : (
                <Icon className="w-5 h-5 stroke-[2.2]" />
              )}
            </div>
            <span className={`text-[10px] tracking-wide font-['Poppins'] font-bold ${
              isActive
                ? isDark ? 'text-[#20C933]' : 'text-[#087A2A]'
                : isDark ? 'text-slate-400' : 'text-slate-500'
            }`}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
