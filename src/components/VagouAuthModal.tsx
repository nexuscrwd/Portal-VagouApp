import React, { useState, useEffect } from 'react';
import { X, Sparkles, Loader2, ExternalLink } from 'lucide-react';
import { VagouLogo } from './VagouLogo';
import { supabase } from '../services/supabase';
import { hapticLight, hapticSuccess } from '../utils/haptics';
import { useTheme } from '../context/ThemeContext';

interface VagouAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: any) => void;
  targetOfferTitle?: string;
}

export const VagouAuthModal: React.FC<VagouAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  targetOfferTitle,
}) => {
  const { isDark } = useTheme();
  const [iframeLoading, setIframeLoading] = useState(true);

  // Escuta oficial do evento postMessage emitido pelo admvapp
  useEffect(() => {
    if (!isOpen) return;

    const handleMessage = async (event: MessageEvent) => {
      const data = event.data;
      if (!data || typeof data !== 'object') return;

      // Suporte aos eventos de sucesso da Tríade
      if (data.type === 'VAGOU_REGISTRATION_SUCCESS' || data.type === 'VAGOU_AUTH_SUCCESS') {
        hapticSuccess();

        // 1. Sincroniza a sessão Supabase local se o payload contiver session
        if (data.session && supabase?.auth?.setSession) {
          try {
            await supabase.auth.setSession(data.session);
          } catch (err) {
            console.warn('[Vagou Auth Embed] Erro ao sincronizar session:', err);
          }
        }

        // 2. Extrai usuário autenticado
        const resolvedUser = data.user || data.session?.user || data;
        onSuccess(resolvedUser);
        onClose();
      } else if (data.type === 'VAGOU_CLOSE_MODAL') {
        hapticLight();
        onClose();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [isOpen, onSuccess, onClose]);

  if (!isOpen) return null;

  const embedUrl = 'https://admin.vagouapp.com/cadastro?embed=true&type=client';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div
        className={`w-full max-w-lg h-[92vh] sm:h-[85vh] rounded-2xl border shadow-2xl flex flex-col overflow-hidden relative transition-colors duration-200 ${
          isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}
        role="dialog"
        aria-modal="true"
      >
        {/* Barra Superior do Modal */}
        <div
          className={`px-4 py-3 flex items-center justify-between border-b shrink-0 ${
            isDark ? 'border-slate-800 bg-slate-950/80' : 'border-slate-100 bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <VagouLogo className="h-5 w-auto" theme={isDark ? 'dark' : 'light'} />
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono">
              Identidade Soberana
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Abrir em janela externa caso o usuário prefira */}
            <a
              href={embedUrl.replace('&embed=true', '')}
              target="_blank"
              rel="noopener noreferrer"
              className={`p-1.5 rounded-lg border transition ${
                isDark
                  ? 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
                  : 'bg-white border-slate-200 text-slate-500 hover:text-slate-900 shadow-2xs'
              }`}
              title="Abrir em nova aba"
            >
              <ExternalLink className="w-4 h-4" />
            </a>

            {/* Fechar */}
            <button
              onClick={() => {
                hapticLight();
                onClose();
              }}
              className={`p-1.5 rounded-lg border transition cursor-pointer ${
                isDark
                  ? 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
                  : 'bg-white border-slate-200 text-slate-500 hover:text-slate-900 shadow-2xs'
              }`}
              title="Fechar"
              aria-label="Fechar modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Subtítulo Dinâmico se houver oferta pendente */}
        {targetOfferTitle && (
          <div className={`px-4 py-2 text-xs border-b flex items-center gap-1.5 shrink-0 ${
            isDark ? 'bg-emerald-950/30 border-emerald-500/20 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}>
            <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate">
              Faça login ou crie sua conta para garantir <strong>{targetOfferTitle}</strong>
            </span>
          </div>
        )}

        {/* Área Central: Iframe Embed do Motor Soberano */}
        <div className="relative flex-1 w-full h-full bg-slate-950 overflow-hidden">
          {iframeLoading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-slate-950 text-slate-400">
              <Loader2 className="w-7 h-7 text-emerald-400 animate-spin" />
              <p className="text-xs font-medium">Carregando autenticação segura...</p>
            </div>
          )}

          <iframe
            src={embedUrl}
            title="Autenticação Central Vagou"
            onLoad={() => setIframeLoading(false)}
            className="w-full h-full border-0"
            allow="camera; microphone; geolocation"
          />
        </div>
      </div>
    </div>
  );
};
