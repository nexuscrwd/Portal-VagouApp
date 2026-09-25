import React, { useState } from 'react';
import { X, Mail, MessageCircle, ArrowRight, CheckCircle2, ShieldCheck, Loader2 } from 'lucide-react';
import { requestPasswordResetInSupabase } from '../services/supabaseApi';
import { hapticLight, hapticSuccess } from '../utils/haptics';

interface PasswordRecoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  salonName?: string;
  defaultEmail?: string;
}

export const PasswordRecoveryModal: React.FC<PasswordRecoveryModalProps> = ({
  isOpen,
  onClose,
  salonName = 'Salão / Estabelecimento',
  defaultEmail = '',
}) => {
  const [email, setEmail] = useState(defaultEmail);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Informe um e-mail válido para a recuperação.');
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);

    const res = await requestPasswordResetInSupabase(email);
    setIsLoading(false);

    if (res.success) {
      hapticSuccess();
      setIsSuccess(true);
    } else {
      setErrorMessage(res.error || 'Não foi possível enviar o e-mail no momento. Tente via WhatsApp.');
    }
  };

  const whatsappMessage = encodeURIComponent(
    `Olá Suporte VagouApp! Sou gestor do estabelecimento "${salonName}" (E-mail: ${email || 'não informado'}) e preciso de suporte para recuperar/redefinir minha senha de acesso.`
  );
  const whatsappUrl = `https://wa.me/5511999999999?text=${whatsappMessage}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-fade-in overflow-hidden">
      <div className="w-full max-w-sm rounded-[4px] bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col my-auto">
        {/* Header Compacto (px-3.5 py-2.5) */}
        <div className="px-3.5 py-2.5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-[4px] bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white font-['Poppins']">Recuperação de Senha</h3>
              <p className="text-[9.5px] text-slate-400 truncate max-w-[200px]">{salonName}</p>
            </div>
          </div>
          <button
            onClick={() => {
              hapticLight();
              onClose();
            }}
            className="p-1 rounded-[4px] text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-3.5 space-y-3">
          {isSuccess ? (
            <div className="p-3 rounded-[4px] bg-emerald-950/40 border border-emerald-500/30 space-y-2 text-center animate-fade-in">
              <div className="w-9 h-9 rounded-[4px] bg-[#00a033] text-white flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-5 h-5 text-white stroke-[2.5]" />
              </div>
              <h4 className="text-xs font-bold text-white">Instruções Enviadas!</h4>
              <p className="text-[10px] text-slate-300 leading-relaxed">
                Enviamos um e-mail de redefinição para <strong className="text-emerald-400">{email}</strong>.
                Verifique sua caixa de entrada e spam.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="w-full mt-2 py-2 rounded-[4px] bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition cursor-pointer"
              >
                Entendi, Voltar ao Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleResetSubmit} className="space-y-2.5">
              <p className="text-[10.5px] text-slate-300 leading-snug">
                Informe o e-mail cadastrado do estabelecimento para receber as instruções de redefinição via Supabase Auth:
              </p>

              <div>
                <label className="block text-[10px] font-semibold text-slate-300 mb-1">
                  E-mail do Gestor
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="gestor@salao.com.br"
                    className="w-full pl-8 pr-2.5 py-1.5 rounded-[4px] bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
              </div>

              {errorMessage && (
                <div className="p-2 rounded-[4px] bg-rose-950/50 border border-rose-500/40 text-[10px] text-rose-300">
                  {errorMessage}
                </div>
              )}

              {/* Botão de Envio de E-mail com Fundo Verde e Texto 100% Branco */}
              <button
                type="submit"
                disabled={isLoading || !email.trim()}
                className="w-full py-2.5 rounded-[4px] bg-[#00a033] hover:bg-[#008f2d] disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950/60"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
                    <span className="text-white">Enviando Instruções...</span>
                  </>
                ) : (
                  <>
                    <Mail className="w-3.5 h-3.5 text-white stroke-[2.5]" />
                    <span className="text-white">Enviar E-mail de Recuperação</span>
                  </>
                )}
              </button>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-800"></div>
                <span className="flex-shrink mx-2 text-[9px] text-slate-500 uppercase font-bold">ou suporte direto</span>
                <div className="flex-grow border-t border-slate-800"></div>
              </div>

              {/* Atendimento Direto via WhatsApp */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => hapticLight()}
                className="w-full py-2 px-3 rounded-[4px] bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 hover:text-white text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>Atendimento Direto via WhatsApp</span>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
              </a>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
