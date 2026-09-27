import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X, Sparkles } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface InstallBannerProps {
  onOpenInstallModal: () => void;
  isStandalone: boolean;
}

export const InstallBanner: React.FC<InstallBannerProps> = ({
  onOpenInstallModal,
  isStandalone,
}) => {
  const { isDark } = useTheme();
  const [dismissed, setDismissed] = useState<boolean>(false);

  useEffect(() => {
    const isDismissed = sessionStorage.getItem('vagou_install_banner_dismissed');
    if (isDismissed) setDismissed(true);
  }, []);

  if (isStandalone || dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('vagou_install_banner_dismissed', 'true');
  };

  return (
    <div className={`mx-4 my-2 p-3 rounded-2xl shadow-md flex items-center justify-between gap-3 border transition-colors ${
      isDark
        ? 'bg-gradient-to-r from-[#151A1E] to-slate-900 text-white border-slate-800'
        : 'bg-white text-slate-900 border-slate-200 shadow-xs'
    }`}>
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-8 h-8 rounded-xl bg-[#20C933] flex items-center justify-center shrink-0 shadow-sm text-white font-black text-sm">
          V
        </div>
        <div className="min-w-0">
          <h4 className={`text-xs font-black truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Instalar App Vagou
          </h4>
          <p className={`text-[10px] truncate ${isDark ? 'text-slate-300' : 'text-slate-500'}`}>
            Use em tela cheia direto no seu celular
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={onOpenInstallModal}
          className="px-3 py-1.5 bg-[#20C933] hover:bg-[#1bb82d] active:scale-95 text-white font-bold text-[11px] rounded-xl shadow transition flex items-center gap-1 cursor-pointer"
        >
          <Download className="w-3 h-3" />
          <span>Instalar</span>
        </button>
        <button
          onClick={handleDismiss}
          className={`p-1 rounded-lg transition cursor-pointer ${
            isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-400 hover:text-slate-600'
          }`}
          aria-label="Fechar"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
