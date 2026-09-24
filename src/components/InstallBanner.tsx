import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X, Sparkles } from 'lucide-react';

interface InstallBannerProps {
  onOpenInstallModal: () => void;
  isStandalone: boolean;
}

export const InstallBanner: React.FC<InstallBannerProps> = ({
  onOpenInstallModal,
  isStandalone,
}) => {
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
    <div className="mx-4 my-2 p-3 bg-gradient-to-r from-[#151A1E] to-slate-900 text-white rounded shadow-md flex items-center justify-between gap-3 border border-slate-800">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-8 h-8 rounded bg-[#20C933] flex items-center justify-center shrink-0 shadow-sm text-white font-black text-sm">
          V
        </div>
        <div className="min-w-0">
          <h4 className="text-xs font-black text-white truncate">
            Instalar App Vagou
          </h4>
          <p className="text-[10px] text-slate-300 truncate">
            Use em tela cheia direto no seu celular
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={onOpenInstallModal}
          className="px-3 py-1.5 bg-[#20C933] hover:bg-[#087A2A] active:scale-95 text-white font-bold text-[11px] rounded shadow transition flex items-center gap-1"
        >
          <Download className="w-3 h-3" />
          <span>Instalar</span>
        </button>
        <button
          onClick={handleDismiss}
          className="p-1 text-slate-400 hover:text-slate-200 rounded transition"
          aria-label="Fechar"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
