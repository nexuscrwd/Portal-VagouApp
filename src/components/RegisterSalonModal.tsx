import React, { useState, useEffect } from 'react';
import { Building2, X, Loader2, ExternalLink } from 'lucide-react';
import { supabase } from '../services/supabase';
import { hapticLight, hapticSuccess } from '../utils/haptics';
import { useTheme } from '../context/ThemeContext';

interface RegisterSalonModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSlug?: string;
  currentUser?: any;
  onOpenAuthModal?: () => void;
}

export const RegisterSalonModal: React.FC<RegisterSalonModalProps> = ({
  isOpen,
  onClose,
  initialSlug = '',
}) => {
  const { isDark } = useTheme();
  const [iframeLoading, setIframeLoading] = useState(true);

  // Escuta do evento soberano postMessage emitido pelo admvapp
  useEffect(() => {
    if (!isOpen) return;

    const handleMessage = async (event: MessageEvent) => {
      const data = event.data;
      if (!data || typeof data !== 'object') return;

      if (data.type === 'VAGOU_REGISTRATION_SUCCESS' || data.type === 'VAGOU_AUTH_SUCCESS') {
        hapticSuccess();

        // 1. Sincroniza a sessão Supabase local se o payload contiver session
        if (data.session && supabase?.auth?.setSession) {
          try {
            await supabase.auth.setSession(data.session);
          } catch (err) {
            console.warn('[Register Salon Embed] Erro ao sincronizar session:', err);
          }
        }

        // 2. Se o salão cadastrado tiver slug, podemos redirecionar para o PWA do parceiro
        const salonSlug = data.salon?.slug || data.salon?.subdomain || initialSlug;
        if (salonSlug) {
          setTimeout(() => {
            window.location.href = `https://${salonSlug}.vagouapp.com`;
          }, 1200);
        } else {
          onClose();
        }
      } else if (data.type === 'VAGOU_CLOSE_MODAL') {
        hapticLight();
        onClose();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [isOpen, initialSlug, onClose]);

  if (!isOpen) return null;

  const cleanSlug = initialSlug ? encodeURIComponent(initialSlug.trim()) : '';
  const embedUrl = `https://admin.vagouapp.com/cadastro?embed=true&type=professional${cleanSlug ? `&slug=${cleanSlug}` : ''}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div
        className={`w-full max-w-lg h-[92vh] sm:h-[88vh] rounded-2xl border shadow-2xl flex flex-col overflow-hidden relative transition-colors duration-200 ${
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
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Building2 className="w-4 h-4 stroke-[2]" />
            </div>
            <div>
              <h2 className="text-xs font-bold leading-none font-['Poppins']">
                Cadastrar meu Negócio
              </h2>
              <span className="text-[10px] text-slate-400 font-mono">
                Motor Soberano Vagou
              </span>
            </div>
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

        {/* Área Central: Iframe Embed do Motor Soberano */}
        <div className="relative flex-1 w-full h-full bg-slate-950 overflow-hidden">
          {iframeLoading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-slate-950 text-slate-400">
              <Loader2 className="w-7 h-7 text-emerald-400 animate-spin" />
              <p className="text-xs font-medium">Carregando formulário central de credenciamento...</p>
            </div>
          )}

          <iframe
            src={embedUrl}
            title="Credenciamento de Estabelecimento Vagou"
            onLoad={() => setIframeLoading(false)}
            className="w-full h-full border-0"
            allow="camera; microphone; geolocation"
          />
        </div>
      </div>
    </div>
  );
};
