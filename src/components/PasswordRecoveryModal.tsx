import React, { useState } from 'react';
import { X, Mail, MessageCircle, ArrowRight, CheckCircle2, ShieldCheck, Loader2 } from 'lucide-react';
import { requestPasswordResetInSupabase } from '../services/supabaseApi';
import { hapticLight, hapticSuccess } from '../utils/haptics';
import { useTheme } from '../context/ThemeContext';

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
  const { isDark } = useTheme();
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
      <div className={`w-full max-w-sm rounded-2xl border shadow-2xl overflow-hidden flex flex-col my-auto ${
        isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        {/* Header Compacto */}
        <div className={`px-4 py-3 border-b flex items-center justify-between ${
          isDark ? 'border-slate-800 bg-slate-950/60' : 'border-slate-100 bg-slate-50'
        }`}>
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg border flex items-center justify-center ${
              isDark ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
            }`}>
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className={`text-xs font-bold font-['Poppins'] ${isDark ? 'text-white' : 'text-slate-900'}`}>Recuperação de Senha</h3>
              <p className={`text-[9.5px] truncate max-w-[200px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{salonName}</p>
            </div>
          </div>
          <button
            onClick={() => {
              hapticLight();
              onClose();
            }}
            className={`p-1.5 rounded-lg transition cursor-pointer ${
              isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 space-y-3">
          {isSuccess ? (
            <div className={`p-3.5 rounded-xl border space-y-2 text-center animate-fade-in ${
              isDark ? 'bg-emerald-950/40 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200'
            }`}>
              <div className="w-10 h-10 rounded-xl bg-[#20C933] text-white flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-6 h-6 text-white stroke-[2.5]" />
              </div>
              <h4 className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Instruções Enviadas!</h4>
              <p className={`text-[10px] leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                Enviamos um e-mail de redefinição para <strong className="text-emerald-500">{email}</strong>.
                Verifique sua caixa de entrada e spam.
              </p>
              <button
                type="button"
                onClick={onClose}
                className={`w-full mt-2 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  isDark ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                }`}
              >
                Entendi, Voltar ao Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleResetSubmit} className="space-y-3">
              <p className={`text-[10.5px] leading-snug ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                Informe o e-mail cadastrado do estabelecimento para receber as instruções de redefinição via Supabase Auth:
              </p>

              <div>
                <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}>
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
                    className={`w-full pl-8 pr-2.5 py-2 rounded-xl border text-xs focus:outline-none focus:border-[#20C933] transition ${
                      isDark
                        ? 'bg-slate-950 border-slate-800 text-white placeholder:text-slate-500'
                        : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 shadow-2xs'
                    }`}
                  />
                </div>
              </div>

              {errorMessage && (
                <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-[10px] text-rose-400">
                  {errorMessage}
                </div>
              )}

              {/* Botão de Envio de E-mail com Fundo Verde e Texto 100% Branco */}
              <button
                type="submit"
                disabled={isLoading || !email.trim()}
                className="w-full py-2.5 rounded-xl bg-[#20C933] hover:bg-[#1bb82d] disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-emerald-900/20"
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
                <div className={`flex-grow border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`}></div>
                <span className={`flex-shrink mx-2 text-[9px] uppercase font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>ou suporte direto</span>
                <div className={`flex-grow border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`}></div>
              </div>

              {/* Atendimento Direto via WhatsApp */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => hapticLight()}
                className={`w-full py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                  isDark
                    ? 'bg-emerald-950/50 hover:bg-emerald-900/60 border-emerald-500/40 text-emerald-300 hover:text-white'
                    : 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-800'
                }`}
              >
                <MessageCircle className="w-4 h-4 text-[#20C933]" />
                <span>Atendimento Direto via WhatsApp</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#20C933]" />
              </a>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
